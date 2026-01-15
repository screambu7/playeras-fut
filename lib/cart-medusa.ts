/**
 * Funciones para manejar el carrito usando Medusa Cart API
 */

import { medusa } from "./medusa";
import { MedusaCart, MedusaCartItem } from "@/types/medusa";
import { createApiError, ApiError } from "./error-handler";

let cartId: string | null = null;

/**
 * Obtener o crear un carrito
 */
export async function getOrCreateCart(): Promise<{ cart: MedusaCart | null; error?: ApiError }> {
  try {
    // Restaurar cartId del localStorage si no está en memoria
    if (!cartId) {
      restoreCartId();
    }

    // Si tenemos un cartId, intentar recuperarlo
    if (cartId) {
      try {
        const { cart } = await medusa.carts.retrieve(cartId);
        return { cart: cart as unknown as MedusaCart };
      } catch (error) {
        // Si el carrito no existe, limpiar y crear uno nuevo
        cartId = null;
        if (typeof window !== "undefined") {
          localStorage.removeItem("medusa_cart_id");
        }
      }
    }
    
    // Crear un nuevo carrito
    const { cart } = await medusa.carts.create({});
    cartId = cart.id;
    
    // Guardar cartId en localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("medusa_cart_id", cart.id);
    }
    
    return { cart: cart as unknown as MedusaCart };
  } catch (error) {
    return { cart: null, error: createApiError(error) };
  }
}

/**
 * Recuperar cartId del localStorage
 */
export function restoreCartId(): void {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("medusa_cart_id");
    if (stored) {
      cartId = stored;
    }
  }
}

/**
 * Obtener el carrito actual
 */
export async function getCart(): Promise<MedusaCart | null> {
  restoreCartId();
  
  if (!cartId) {
    const result = await getOrCreateCart();
    return result.cart;
  }
  
  try {
    const { cart } = await medusa.carts.retrieve(cartId);
    return cart as unknown as MedusaCart;
  } catch (error) {
    // Si falla, intentar crear uno nuevo
    const result = await getOrCreateCart();
    return result.cart;
  }
}

/**
 * Agregar un producto al carrito
 */
export async function addToCart(
  variantId: string,
  quantity: number = 1
): Promise<{ cart: MedusaCart | null; error?: ApiError }> {
  if (!variantId) {
    return { 
      cart: null, 
      error: { 
        message: "Variant ID es requerido", 
        isNetworkError: false, 
        isTimeout: false 
      } 
    };
  }

  const cartResult = await getOrCreateCart();
  
  if (!cartResult.cart) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error al obtener/crear carrito:", cartResult.error);
    }
    return { cart: null, error: cartResult.error };
  }
  
  try {
    const { cart: updatedCart } = await medusa.carts.lineItems.create(cartResult.cart.id, {
      variant_id: variantId,
      quantity,
    });
    
    // Actualizar cartId en memoria y localStorage si cambió
    if (updatedCart?.id && updatedCart.id !== cartId) {
      cartId = updatedCart.id;
      if (typeof window !== "undefined") {
        localStorage.setItem("medusa_cart_id", updatedCart.id);
      }
    }
    
    return { cart: updatedCart as unknown as MedusaCart };
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error al agregar item al carrito:", error);
    }
    return { cart: null, error: createApiError(error) };
  }
}

/**
 * Actualizar cantidad de un item en el carrito
 */
export async function updateCartItem(
  lineItemId: string,
  quantity: number
): Promise<{ cart: MedusaCart | null; error?: ApiError }> {
  const cart = await getCart();
  
  if (!cart) {
    return { cart: null, error: { message: "Carrito no encontrado", isNetworkError: false, isTimeout: false } };
  }
  
  try {
    const { cart: updatedCart } = await medusa.carts.lineItems.update(cart.id, lineItemId, {
      quantity,
    });
    
    return { cart: updatedCart as unknown as MedusaCart };
  } catch (error) {
    return { cart: null, error: createApiError(error) };
  }
}

/**
 * Eliminar un item del carrito
 */
export async function removeFromCart(lineItemId: string): Promise<{ cart: MedusaCart | null; error?: ApiError }> {
  const cart = await getCart();
  
  if (!cart) {
    return { cart: null, error: { message: "Carrito no encontrado", isNetworkError: false, isTimeout: false } };
  }
  
  try {
    const { cart: updatedCart } = await medusa.carts.lineItems.delete(cart.id, lineItemId);
    return { cart: updatedCart as unknown as MedusaCart };
  } catch (error) {
    return { cart: null, error: createApiError(error) };
  }
}

/**
 * Calcular el total del carrito
 */
export function calculateCartTotal(cart: MedusaCart): number {
  // Medusa devuelve total en centavos, convertir a euros
  return (cart.total || 0) / 100;
}

/**
 * Obtener el número de items en el carrito
 */
export function getCartItemCount(cart: MedusaCart): number {
  return cart.items?.reduce((count, item) => count + item.quantity, 0) || 0;
}
