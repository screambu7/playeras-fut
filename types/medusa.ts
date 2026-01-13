import { MedusaProduct } from "@/lib/medusa";
import { Liga, Talla } from "./index";

/**
 * Producto adaptado desde Medusa para uso en el frontend
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
 * Convierte un producto de Medusa al formato del frontend
 */
export function adaptMedusaProduct(medusaProduct: MedusaProduct): Product {
  // Obtener metadata
  const team = medusaProduct.metadata?.team || "";
  const league = (medusaProduct.metadata?.league || "") as Liga;
  const season = medusaProduct.metadata?.season || "";
  const featured = medusaProduct.metadata?.featured === "true";
  const bestSeller = medusaProduct.metadata?.bestSeller === "true";
  const originalPriceStr = medusaProduct.metadata?.originalPrice;

  // Obtener opciones de talla
  const sizeOption = medusaProduct.options.find((opt) => opt.title === "Size");
  const sizes: Talla[] = sizeOption
    ? (sizeOption.values.map((v) => v.value) as Talla[])
    : [];

  // Obtener imágenes
  const images = medusaProduct.images.map((img) => img.url);

  // Obtener precio base (EUR) - Medusa almacena precios en centavos
  const eurPriceInCents = medusaProduct.variants[0]?.prices.find(
    (p) => p.currency_code === "eur"
  )?.amount || 0;
  const eurPrice = eurPriceInCents / 100; // Convertir centavos a euros

  const originalPrice = originalPriceStr
    ? parseInt(originalPriceStr, 10) / 100 // Convertir centavos a euros
    : undefined;

  // Adaptar variantes
  const variants = medusaProduct.variants.map((variant) => {
    const size = variant.options.Size as Talla;
    const priceInCents = variant.prices.find((p) => p.currency_code === "eur")?.amount || 0;
    const price = priceInCents / 100; // Convertir centavos a euros

    return {
      id: variant.id,
      size,
      price,
      sku: variant.sku,
      inventory_quantity: variant.inventory_quantity,
    };
  });

  return {
    id: medusaProduct.id,
    slug: medusaProduct.handle,
    name: medusaProduct.title,
    team,
    league,
    season,
    price: eurPrice,
    originalPrice,
    images,
    sizes,
    description: medusaProduct.description || "",
    featured,
    bestSeller,
    variants,
  };
}
