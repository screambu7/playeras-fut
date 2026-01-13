/**
 * Tipos compatibles con Medusa.js API
 */

import { Product as MedusaProduct, ProductVariant, StoreCartsRes } from "@medusajs/medusa-js";
import { Liga, Talla } from "./index";

/**
 * Producto de Medusa adaptado a nuestro dominio
 */
export interface MedusaProductAdapted {
  id: string;
  handle: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  variants: MedusaProductVariant[];
  metadata: {
    team?: string;
    league?: Liga;
    season?: string;
    featured?: boolean;
    bestSeller?: boolean;
  };
}

export interface MedusaProductVariant {
  id: string;
  title: string;
  prices: Array<{
    amount: number;
    currency_code: string;
  }>;
  inventory_quantity?: number;
  manage_inventory?: boolean;
}

/**
 * Helper para convertir Product de Medusa a nuestro formato
 */
export function adaptMedusaProduct(product: MedusaProduct): MedusaProductAdapted {
  const images = product.images?.map((img) => img.url) || [];
  const metadata = (product.metadata || {}) as MedusaProductAdapted["metadata"];
  
  // Obtener precio base (primera variante o primer precio)
  const basePrice = product.variants?.[0]?.prices?.[0]?.amount || 0;
  
  return {
    id: product.id,
    handle: product.handle,
    title: product.title,
    description: product.description || "",
    price: basePrice / 100, // Convertir de centavos a euros
    images,
    variants: product.variants || [],
    metadata,
  };
}

/**
 * Tipos para el carrito de Medusa
 */
export type MedusaCart = StoreCartsRes["cart"];

export interface MedusaCartItem {
  id: string;
  variant_id: string;
  quantity: number;
  variant: {
    id: string;
    title: string;
    product: MedusaProduct;
    prices: Array<{
      amount: number;
      currency_code: string;
    }>;
  };
}
