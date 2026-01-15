import { MedusaProduct } from "@/lib/medusa";
import { Liga, Talla } from "./index";

/**
 * Variante de producto adaptada desde Medusa
 */
export interface MedusaProductVariant {
  id: string;
  title: string;
  prices: Array<{
    id: string;
    amount: number;
    currency_code: string;
  }>;
  sku: string | null;
  inventory_quantity?: number;
  options: Record<string, string>;
}

/**
 * Producto adaptado desde Medusa para uso en el frontend
 * Alias para compatibilidad con código existente
 */
export interface MedusaProductAdapted {
  id: string;
  handle: string;
  title: string;
  description: string;
  price: number; // precio en EUR
  originalPrice?: number; // precio original si hay descuento (en EUR)
  images: string[];
  metadata: {
    team?: string;
    league?: Liga;
    season?: string;
    genero?: import("./index").Genero;
    version?: import("./index").Version;
    featured?: boolean;
    bestSeller?: boolean;
  };
  variants: MedusaProductVariant[];
}

/**
 * Producto adaptado desde Medusa para uso en el frontend
 * @deprecated Usar MedusaProductAdapted en su lugar
 */
export interface Product {
  id: string;
  slug: string; // handle de Medusa
  name: string; // title de Medusa
  team: string; // desde metadata
  league: Liga; // desde metadata
  season: string; // desde metadata
  price: number; // precio en EUR
  originalPrice?: number; // precio original si hay descuento (en EUR)
  images: string[];
  sizes: Talla[];
  description: string;
  featured?: boolean;
  bestSeller?: boolean;
  variants: Array<{
    id: string;
    size: Talla;
    price: number;
    sku: string | null;
    inventory_quantity?: number;
  }>;
}

/**
 * Convierte un producto de Medusa al formato adaptado del frontend
 */
export function adaptMedusaProduct(medusaProduct: MedusaProduct): MedusaProductAdapted {
  // Obtener metadata
  const metadata = {
    team: medusaProduct.metadata?.team,
    league: medusaProduct.metadata?.league as Liga | undefined,
    season: medusaProduct.metadata?.season,
    genero: medusaProduct.metadata?.genero as import("./index").Genero | undefined,
    version: medusaProduct.metadata?.version as import("./index").Version | undefined,
    featured: medusaProduct.metadata?.featured === "true",
    bestSeller: medusaProduct.metadata?.bestSeller === "true",
  };

  // Obtener imágenes
  const images = medusaProduct.images.map((img) => img.url);

  // Obtener precio base (EUR) - Medusa almacena precios en centavos
  const eurPriceInCents = medusaProduct.variants[0]?.prices.find(
    (p) => p.currency_code === "eur"
  )?.amount || 0;
  const eurPrice = eurPriceInCents / 100; // Convertir centavos a euros

  const originalPriceStr = medusaProduct.metadata?.originalPrice;
  const originalPrice = originalPriceStr
    ? parseInt(originalPriceStr, 10) / 100 // Convertir centavos a euros
    : undefined;

  // Adaptar variantes
  const variants: MedusaProductVariant[] = medusaProduct.variants.map((variant) => ({
    id: variant.id,
    title: variant.title,
    prices: variant.prices,
    sku: variant.sku,
    inventory_quantity: variant.inventory_quantity,
    options: variant.options,
  }));

  return {
    id: medusaProduct.id,
    handle: medusaProduct.handle,
    title: medusaProduct.title,
    description: medusaProduct.description || "",
    price: eurPrice,
    originalPrice,
    images,
    metadata,
    variants,
  };
}

/**
 * Convierte un producto de Medusa al formato legacy del frontend
 * @deprecated Usar adaptMedusaProduct que retorna MedusaProductAdapted
 */
export function adaptMedusaProductLegacy(medusaProduct: MedusaProduct): Product {
  const adapted = adaptMedusaProduct(medusaProduct);
  
  // Obtener opciones de talla
  const sizeOption = medusaProduct.options.find((opt) => opt.title === "Size");
  const sizes: Talla[] = sizeOption
    ? (sizeOption.values.map((v) => v.value) as Talla[])
    : [];

  // Adaptar variantes al formato legacy
  const legacyVariants = adapted.variants.map((variant) => {
    const size = variant.options.Size as Talla;
    const priceInCents = variant.prices.find((p) => p.currency_code === "eur")?.amount || 0;
    const price = priceInCents / 100;

    return {
      id: variant.id,
      size,
      price,
      sku: variant.sku,
      inventory_quantity: variant.inventory_quantity,
    };
  });

  return {
    id: adapted.id,
    slug: adapted.handle,
    name: adapted.title,
    team: adapted.metadata.team || "",
    league: adapted.metadata.league || ("" as Liga),
    season: adapted.metadata.season || "",
    price: adapted.price,
    originalPrice: adapted.originalPrice,
    images: adapted.images,
    sizes,
    description: adapted.description,
    featured: adapted.metadata.featured,
    bestSeller: adapted.metadata.bestSeller,
    variants: legacyVariants,
  };
}

/**
 * Item del carrito de Medusa
 */
export interface MedusaCartItem {
  id: string;
  title: string;
  quantity: number;
  unit_price: number;
  variant: {
    id: string;
    title: string;
    product: MedusaProduct;
    prices?: Array<{
      id: string;
      amount: number;
      currency_code: string;
    }>;
  };
}

/**
 * Carrito de Medusa adaptado
 */
export interface MedusaCart {
  id: string;
  items: MedusaCartItem[];
  subtotal: number;
  total: number;
  shipping_total?: number;
  tax_total?: number;
  currency_code?: string;
  region?: {
    id: string;
    name: string;
    currency_code: string;
  };
  email?: string;
  shipping_address?: {
    first_name: string | null;
    last_name: string | null;
    address_1: string | null;
    address_2?: string | null;
    city: string | null;
    country_code: string | null;
    postal_code: string | null;
    province?: string | null;
    phone?: string | null;
  } | null;
  payment_sessions?: Array<{
    id: string;
    provider_id: string;
    status: string;
    data?: Record<string, unknown>;
  }>;
  payment_session?: {
    id: string;
    provider_id: string;
    status: string;
    data?: Record<string, unknown>;
  } | null;
}
