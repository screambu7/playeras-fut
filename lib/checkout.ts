/**
 * Funciones para el proceso de checkout con Medusa
 */

import { medusa } from "./medusa";
import { getCart } from "./cart-medusa";
import { listRegions, initializePaymentSessions } from "./medusa-store";
import { ShippingAddress, ShippingOption, PaymentSession, Order } from "@/types/checkout";
import { createApiError, ApiError } from "./error-handler";

/**
 * Actualizar dirección de envío en el carrito
 */
export async function setShippingAddress(
  cartId: string,
  address: ShippingAddress,
  email?: string
): Promise<{ success: boolean; error?: ApiError }> {
  try {
    const updateData: any = {
      shipping_address: address,
    };
    
    if (email) {
      updateData.email = email;
    }
    
    await medusa.carts.update(cartId, updateData);
    return { success: true };
  } catch (error) {
    return { success: false, error: createApiError(error) };
  }
}

/**
 * Obtener opciones de envío disponibles para el carrito
 */
export async function getShippingOptions(
  cartId: string
): Promise<{ options: ShippingOption[]; error?: ApiError }> {
  try {
    const { shipping_options } = await medusa.shippingOptions.listCartOptions(cartId);
    
    const options = shipping_options.map((option: any) => ({
      id: option.id,
      name: option.name,
      amount: option.amount || 0,
      currency_code: option.currency_code || "eur",
      data: option.data,
    }));
    
    return { options };
  } catch (error) {
    return { options: [], error: createApiError(error) };
  }
}

/**
 * Establecer opción de envío en el carrito
 * En Medusa v2, si ya hay un shipping method, se reemplaza automáticamente
 */
export async function setShippingOption(
  cartId: string,
  optionId: string
): Promise<{ success: boolean; error?: ApiError }> {
  try {
    const { cart } = await medusa.carts.addShippingMethod(cartId, {
      option_id: optionId,
    });
    
    // Verificar que el shipping method se agregó correctamente
    if (!cart) {
      return { 
        success: false, 
        error: { message: "No se pudo actualizar el método de envío", isNetworkError: false, isTimeout: false } 
      };
    }
    
    return { success: true };
  } catch (error: any) {
    // Si el error indica que ya existe un shipping method, intentar actualizar
    if (error.message?.includes("already") || error.status === 400) {
      try {
        // Obtener el cart para ver si tiene shipping methods
        const { cart } = await medusa.carts.retrieve(cartId);
        if (cart?.shipping_methods && cart.shipping_methods.length > 0) {
          // Eliminar el shipping method existente y agregar el nuevo
          // En Medusa v2, addShippingMethod debería reemplazar automáticamente
          // Pero si falla, intentamos de nuevo
          const retryResult = await medusa.carts.addShippingMethod(cartId, {
            option_id: optionId,
          });
          if (retryResult.cart) {
            return { success: true };
          }
        }
      } catch (retryError) {
        // Si el retry falla, retornar el error original
      }
    }
    
    return { success: false, error: createApiError(error) };
  }
}

/**
 * Obtener payment sessions del carrito
 */
export async function getCartPaymentSessions(
  cartId: string
): Promise<{ payment_sessions: PaymentSession[]; error?: ApiError }> {
  try {
    const { cart } = await medusa.carts.retrieve(cartId);
    
    const payment_sessions: PaymentSession[] = (cart.payment_sessions || []).map((ps: any) => ({
      id: ps.id,
      provider_id: ps.provider_id,
      status: ps.status,
      data: ps.data,
    }));

    return { payment_sessions };
  } catch (error) {
    return { payment_sessions: [], error: createApiError(error) };
  }
}

/**
 * Obtener regiones disponibles y seleccionar la primera (o por defecto)
 */
export async function getDefaultRegion(): Promise<{ regionId: string | null; error?: ApiError }> {
  try {
    const regions = await listRegions();
    
    if (regions.length === 0) {
      return { regionId: null, error: { message: "No hay regiones disponibles", isNetworkError: false, isTimeout: false } };
    }

    // Buscar región EUR (Europa) o usar la primera disponible
    const eurRegion = regions.find(r => r.currency_code.toLowerCase() === "eur");
    const regionId = eurRegion?.id || regions[0].id;

    return { regionId };
  } catch (error) {
    return { regionId: null, error: createApiError(error) };
  }
}

/**
 * Asociar una región al carrito
 */
export async function setCartRegion(
  cartId: string,
  regionId: string
): Promise<{ success: boolean; error?: ApiError }> {
  try {
    await medusa.carts.update(cartId, {
      region_id: regionId,
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: createApiError(error) };
  }
}

/**
 * Inicializar payment sessions para el carrito
 * Debe llamarse antes de setPaymentSession
 */
export async function initPaymentSessions(
  cartId: string
): Promise<{ payment_sessions: PaymentSession[]; error?: ApiError }> {
  try {
    const result = await initializePaymentSessions(cartId);
    
    if (result.error) {
      return { payment_sessions: [], error: result.error };
    }

    const payment_sessions: PaymentSession[] = result.payment_sessions.map((ps) => ({
      id: ps.id,
      provider_id: ps.provider_id,
      status: ps.status,
      data: ps.data,
    }));

    return { payment_sessions };
  } catch (error) {
    return { payment_sessions: [], error: createApiError(error) };
  }
}

/**
 * Establecer sesión de pago en el carrito
 * IMPORTANTE: Debe llamarse después de initPaymentSessions
 */
export async function setPaymentSession(
  cartId: string,
  providerId: string = "manual"
): Promise<{ success: boolean; error?: ApiError }> {
  try {
    const { cart } = await medusa.carts.setPaymentSession(cartId, {
      provider_id: providerId,
    });
    return { success: !!cart };
  } catch (error) {
    return { success: false, error: createApiError(error) };
  }
}

/**
 * Resultado de completar checkout
 */
export interface CompleteCheckoutResult {
  order: Order | null;
  redirectUrl?: string;
  requiresPayment?: boolean;
  error?: ApiError;
}

/**
 * Completar el checkout y crear la orden
 * Maneja tanto órdenes directas como redirects de payment providers (Stripe)
 */
export async function completeCheckout(cartId: string): Promise<CompleteCheckoutResult> {
  try {
    const { type, data } = await medusa.carts.complete(cartId);
    
    // Si requiere autorización de pago (como Stripe redirect)
    if (type === "payment_authorization_required") {
      const paymentData = data as any;
      const redirectUrl = paymentData?.redirect_url || paymentData?.url;
      
      if (redirectUrl) {
        return {
          order: null,
          redirectUrl,
          requiresPayment: true,
        };
      }
      
      // Si no hay redirect URL, es un error
      return {
        order: null,
        requiresPayment: true,
        error: {
          message: "Se requiere autorización de pago pero no se proporcionó URL de redirección",
          isNetworkError: false,
          isTimeout: false,
        },
      };
    }
    
    // Si el tipo no es "order", es un error
    if (type !== "order") {
      const errorMessage = (data as any)?.message || "Error al completar el checkout";
      const error = new Error(errorMessage);
      return { 
        order: null, 
        error: createApiError(error) 
      };
    }

    // Cuando type === "order", data es directamente la Order
    const order = data as any;
    
    const mappedOrder: Order = {
      id: order.id,
      display_id: order.display_id,
      email: order.email,
      items: order.items.map((item: any) => ({
        id: item.id,
        title: item.title,
        quantity: item.quantity,
        unit_price: item.unit_price,
        variant: {
          id: item.variant.id,
          title: item.variant.title,
          product: {
            id: item.variant.product.id,
            title: item.variant.product.title,
            handle: item.variant.product.handle,
            images: item.variant.product.images || [],
          },
        },
      })),
      shipping_address: order.shipping_address as ShippingAddress | null,
      shipping_methods: (order.shipping_methods || []).map((method: any) => ({
        id: method.id,
        name: method.name || method.shipping_option?.name || "Envío",
        amount: method.amount || 0,
      })),
      payment_status: order.payment_status,
      fulfillment_status: order.fulfillment_status,
      total: order.total,
      subtotal: order.subtotal,
      shipping_total: order.shipping_total || 0,
      tax_total: order.tax_total || 0,
      currency_code: order.currency_code,
      created_at: order.created_at instanceof Date 
        ? order.created_at.toISOString() 
        : (order.created_at as string),
    };
    
    return { order: mappedOrder };
  } catch (error) {
    return { order: null, error: createApiError(error) };
  }
}

/**
 * Obtener una orden por ID
 */
export async function getOrder(orderId: string): Promise<{ order: Order | null; error?: ApiError }> {
  try {
    const { order } = await medusa.orders.retrieve(orderId);
    
    const mappedOrder: Order = {
      id: order.id,
      display_id: order.display_id,
      email: order.email,
      items: order.items.map((item: any) => ({
        id: item.id,
        title: item.title,
        quantity: item.quantity,
        unit_price: item.unit_price,
        variant: {
          id: item.variant.id,
          title: item.variant.title,
          product: {
            id: item.variant.product.id,
            title: item.variant.product.title,
            handle: item.variant.product.handle,
            images: item.variant.product.images || [],
          },
        },
      })),
      shipping_address: order.shipping_address as ShippingAddress | null,
      shipping_methods: (order.shipping_methods || []).map((method: any) => ({
        id: method.id,
        name: method.name || method.shipping_option?.name || "Envío",
        amount: method.amount || 0,
      })),
      payment_status: order.payment_status,
      fulfillment_status: order.fulfillment_status,
      total: order.total,
      subtotal: order.subtotal,
      shipping_total: order.shipping_total || 0,
      tax_total: order.tax_total || 0,
      currency_code: order.currency_code,
      created_at: order.created_at instanceof Date 
        ? order.created_at.toISOString() 
        : (order.created_at as string),
    };
    
    return { order: mappedOrder };
  } catch (error) {
    return { order: null, error: createApiError(error) };
  }
}
