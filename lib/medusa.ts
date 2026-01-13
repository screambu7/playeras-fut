import Medusa from "@medusajs/js-sdk";

// Cliente Medusa para el frontend
const medusa = new Medusa({
  baseUrl: process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000",
  debug: process.env.NODE_ENV === "development",
});

// Exportar como default para compatibilidad con imports existentes
export default medusa;

// También exportar como named export
export { medusa };

// Tipos para productos de Medusa
export interface MedusaProduct {
  id: string;
  title: string;
  handle: string;
  description: string | null;
  status: string;
  images: Array<{ id: string; url: string }>;
  options: Array<{
    id: string;
    title: string;
    values: Array<{ id: string; value: string }>;
  }>;
  variants: Array<{
    id: string;
    title: string;
    sku: string | null;
    prices: Array<{
      id: string;
      amount: number;
      currency_code: string;
    }>;
    options: Record<string, string>;
    inventory_quantity?: number;
  }>;
  metadata?: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export interface MedusaCart {
  id: string;
  items: Array<{
    id: string;
    title: string;
    quantity: number;
    unit_price: number;
    variant: {
      id: string;
      title: string;
      product: MedusaProduct;
    };
  }>;
  subtotal: number;
  total: number;
  currency_code: string;
}

/**
 * Obtiene todos los productos publicados
 */
export async function getProducts(): Promise<MedusaProduct[]> {
  try {
    const { products } = await medusa.store.product.list({
      limit: 100,
      offset: 0,
    });

    return products || [];
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

/**
 * Obtiene un producto por su handle
 */
export async function getProductByHandle(
  handle: string
): Promise<MedusaProduct | null> {
  try {
    const { product } = await medusa.store.product.retrieve(handle);
    return product || null;
  } catch (error) {
    console.error(`Error fetching product with handle ${handle}:`, error);
    return null;
  }
}

/**
 * Obtiene productos destacados (usando metadata)
 */
export async function getFeaturedProducts(): Promise<MedusaProduct[]> {
  try {
    const products = await getProducts();
    return products.filter(
      (product) => product.metadata?.featured === "true"
    );
  } catch (error) {
    console.error("Error fetching featured products:", error);
    return [];
  }
}

/**
 * Obtiene productos más vendidos (usando metadata)
 */
export async function getBestSellerProducts(): Promise<MedusaProduct[]> {
  try {
    const products = await getProducts();
    return products.filter(
      (product) => product.metadata?.bestSeller === "true"
    );
  } catch (error) {
    console.error("Error fetching best seller products:", error);
    return [];
  }
}

/**
 * Crea o obtiene un carrito
 */
export async function getOrCreateCart(): Promise<MedusaCart | null> {
  try {
    // Intentar obtener el carrito del localStorage
    const cartId = typeof window !== "undefined" 
      ? localStorage.getItem("medusa_cart_id") 
      : null;

    if (cartId) {
      try {
        const { cart } = await medusa.store.cart.retrieve(cartId);
        return cart || null;
      } catch (error) {
        // Si el carrito no existe, crear uno nuevo
        console.warn("Cart not found, creating new one");
      }
    }

    // Crear un nuevo carrito
    const { cart } = await medusa.store.cart.create({
      region_id: undefined, // Se asignará automáticamente
    });

    if (cart && typeof window !== "undefined") {
      localStorage.setItem("medusa_cart_id", cart.id);
    }

    return cart || null;
  } catch (error) {
    console.error("Error creating/retrieving cart:", error);
    return null;
  }
}

/**
 * Agrega un item al carrito
 */
export async function addToCart(
  variantId: string,
  quantity: number = 1
): Promise<MedusaCart | null> {
  try {
    const cart = await getOrCreateCart();
    if (!cart) {
      throw new Error("Could not create or retrieve cart");
    }

    const { cart: updatedCart } = await medusa.store.cart.lineItems.create(
      cart.id,
      {
        variant_id: variantId,
        quantity,
      }
    );

    return updatedCart || null;
  } catch (error) {
    console.error("Error adding item to cart:", error);
    return null;
  }
}

/**
 * Actualiza la cantidad de un item en el carrito
 */
export async function updateCartItem(
  cartId: string,
  lineItemId: string,
  quantity: number
): Promise<MedusaCart | null> {
  try {
    const { cart } = await medusa.store.cart.lineItems.update(cartId, lineItemId, {
      quantity,
    });

    return cart || null;
  } catch (error) {
    console.error("Error updating cart item:", error);
    return null;
  }
}

/**
 * Elimina un item del carrito
 */
export async function removeCartItem(
  cartId: string,
  lineItemId: string
): Promise<MedusaCart | null> {
  try {
    const { cart } = await medusa.store.cart.lineItems.delete(cartId, lineItemId);

    return cart || null;
  } catch (error) {
    console.error("Error removing cart item:", error);
    return null;
  }
}

/**
 * Obtiene el carrito actual
 */
export async function getCart(cartId: string): Promise<MedusaCart | null> {
  try {
    const { cart } = await medusa.store.cart.retrieve(cartId);
    return cart || null;
  } catch (error) {
    console.error("Error retrieving cart:", error);
    return null;
  }
}
