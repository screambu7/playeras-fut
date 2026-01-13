import { create } from "zustand";
import { CartItem, Product, Talla } from "@/types";
import {
  addToCart as addToCartUtil,
  removeFromCart as removeFromCartUtil,
  updateCartItemQuantity as updateCartItemQuantityUtil,
  calculateTotal,
  getCartItemCount,
  getCartFromStorage,
  saveCartToStorage,
} from "./cart";

interface CartStore {
  items: CartItem[];
  initialized: boolean;
  init: () => void;
  addItem: (product: Product, size: Talla, quantity?: number) => void;
  removeItem: (productId: string, size: Talla) => void;
  updateQuantity: (productId: string, size: Talla, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  initialized: false,
  init: () => {
    if (get().initialized) return;
    const storedItems = getCartFromStorage();
    set({ items: storedItems, initialized: true });
  },
  addItem: (product, size, quantity = 1) => {
    const newItems = addToCartUtil(get().items, product, size, quantity);
    set({ items: newItems });
    saveCartToStorage(newItems);
  },
  removeItem: (productId, size) => {
    const newItems = removeFromCartUtil(get().items, productId, size);
    set({ items: newItems });
    saveCartToStorage(newItems);
  },
  updateQuantity: (productId, size, quantity) => {
    const newItems = updateCartItemQuantityUtil(get().items, productId, size, quantity);
    set({ items: newItems });
    saveCartToStorage(newItems);
  },
  clearCart: () => {
    set({ items: [] });
    saveCartToStorage([]);
  },
  getTotal: () => {
    return calculateTotal(get().items);
  },
  getItemCount: () => {
    return getCartItemCount(get().items);
  },
}));
