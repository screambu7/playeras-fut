/**
 * Funciones para manejar el carrito usando Medusa Cart API
 */

import medusaClient, { medusa } from "./medusa";
import { MedusaCart, MedusaCartItem } from "@/types/medusa";

let cartId: string | null = null;

/**
 * Obtener o crear un carrito
 */
export async function getOrCreateCart(): Promise<MedusaCart | null> {
  try {
    // Si ya tenemos un cartId, intentar recuperarlo
    if (cartId) {
      try {
        const { cart } = await medusa.store.cart.retrieve(cartId);
        return cart;
      } catch (error) {
        // Si el carrito no existe, crear uno nuevo
        cartId = null;
      }
    }
    
    // Crear un nuevo carrito
    const { cart } = await medusa.store.cart.create({});
    cartId = cart.id;
    
    // Guardar cartId en localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("medusa_cart_id", cart.id);
    }
    
    return cart;
  } catch (error) {
    console.error("Error getting or creating cart:", error);
    return null;
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
    return await getOrCreateCart();
  }
  
  try {
    const { cart } = await medusa.store.cart.retrieve(cartId);
    return cart;
  } catch (error) {
    console.error("Error retrieving cart:", error);
    // Si falla, crear uno nuevo
    return await getOrCreateCart();
  }
}

/**
 * Agregar un producto al carrito
 */
export async function addToCart(
  variantId: string,
  quantity: number = 1
): Promise<MedusaCart | null> {
  const cart = await getOrCreateCart();
  
  if (!cart) {
    return null;
  }
  
  try {
    const { cart: updatedCart } = await medusa.store.cart.lineItems.create(cart.id, {
      variant_id: variantId,
      quantity,
    });
    
    return updatedCart;
  } catch (error) {
    console.error("Error adding to cart:", error);
    return null;
  }
}

/**
 * Actualizar cantidad de un item en el carrito
 */
export async function updateCartItem(
  lineItemId: string,
  quantity: number
): Promise<MedusaCart | null> {
  const cart = await getCart();
  
  if (!cart) {
    return null;
  }
  
  try {
    const { cart: updatedCart } = await medusa.store.cart.lineItems.update(cart.id, lineItemId, {
      quantity,
    });
    
    return updatedCart;
  } catch (error) {
    console.error("Error updating cart item:", error);
    return null;
  }
}

/**
 * Eliminar un item del carrito
 */
export async function removeFromCart(lineItemId: string): Promise<MedusaCart | null> {
  const cart = await getCart();
  
  if (!cart) {
    return null;
  }
  
  try {
    const { cart: updatedCart } = await medusa.store.cart.lineItems.delete(cart.id, lineItemId);
    return updatedCart;
  } catch (error) {
    console.error("Error removing from cart:", error);
    return null;
  }
}

/**
 * Calcular el total del carrito
 */
export function calculateCartTotal(cart: MedusaCart): number {
  return cart.total || 0;
}

/**
 * Obtener el número de items en el carrito
 */
export function getCartItemCount(cart: MedusaCart): number {
  return cart.items?.reduce((count, item) => count + item.quantity, 0) || 0;
}
