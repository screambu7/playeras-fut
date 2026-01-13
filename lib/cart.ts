import { CartItem, Product, Talla } from "@/types";

const CART_STORAGE_KEY = "playeras-fut-cart";

export function getCartFromStorage(): CartItem[] {
  if (typeof window === "undefined") return [];
  
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (!stored) return [];
    
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Error reading cart from storage:", error);
    return [];
  }
}

export function saveCartToStorage(items: CartItem[]): void {
  if (typeof window === "undefined") return;
  
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error("Error saving cart to storage:", error);
  }
}

export function calculateTotal(items: CartItem[]): number {
  return items.reduce((total, item) => {
    return total + item.product.price * item.quantity;
  }, 0);
}

export function addToCart(
  currentItems: CartItem[],
  product: Product,
  size: Talla,
  quantity: number = 1
): CartItem[] {
  const existingItemIndex = currentItems.findIndex(
    (item) => item.product.id === product.id && item.size === size
  );

  if (existingItemIndex >= 0) {
    const updatedItems = [...currentItems];
    updatedItems[existingItemIndex].quantity += quantity;
    return updatedItems;
  }

  return [...currentItems, { product, size, quantity }];
}

export function removeFromCart(
  currentItems: CartItem[],
  productId: string,
  size: Talla
): CartItem[] {
  return currentItems.filter(
    (item) => !(item.product.id === productId && item.size === size)
  );
}

export function updateCartItemQuantity(
  currentItems: CartItem[],
  productId: string,
  size: Talla,
  quantity: number
): CartItem[] {
  if (quantity <= 0) {
    return removeFromCart(currentItems, productId, size);
  }

  return currentItems.map((item) => {
    if (item.product.id === productId && item.size === size) {
      return { ...item, quantity };
    }
    return item;
  });
}

export function getCartItemCount(items: CartItem[]): number {
  return items.reduce((count, item) => count + item.quantity, 0);
}
