/**
 * Funciones para el proceso de checkout con Medusa
 */

import { medusa } from "./medusa";
import { getCart } from "./cart-medusa";
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
 */
export async function setShippingOption(
  cartId: string,
  optionId: string
): Promise<{ success: boolean; error?: ApiError }> {
  try {
    await medusa.carts.addShippingMethod(cartId, {
      option_id: optionId,
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: createApiError(error) };
  }
}

/**
 * Establecer sesión de pago en el carrito
 * Esto también inicializa la sesión si no existe
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
 * Completar el checkout y crear la orden
 */
export async function completeCheckout(cartId: string): Promise<{ order: Order | null; error?: ApiError }> {
  try {
    const { type, data } = await medusa.carts.complete(cartId);
    
    if (type !== "order") {
      const errorMessage = (data as any)?.message || "Error al completar el checkout";
      const error = new Error(errorMessage);
      return { order: null, error: createApiError(error) };
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
