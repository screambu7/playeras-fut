export type Liga = "La Liga" | "Premier League" | "Serie A" | "Bundesliga" | "Ligue 1" | "Champions League";

export type Talla = "XS" | "S" | "M" | "L" | "XL" | "XXL";

// Re-exportar tipos de Medusa
export type { MedusaProductAdapted, MedusaProductVariant, MedusaCart, MedusaCartItem } from "./medusa";

export interface Product {
  id: string;
  slug: string;
  name: string;
  team: string;
  league: Liga;
  season: string;
  price: number; // precio en EUR
  originalPrice?: number; // precio original si hay descuento (en EUR)
  images: string[];
  sizes: Talla[];
  description: string;
  featured?: boolean;
  bestSeller?: boolean;
  variants?: Array<{
    id: string;
    size: Talla;
    price: number;
    sku: string | null;
    inventory_quantity?: number;
  }>;
}

export interface CartItem {
  product: Product;
  size: Talla;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
}

export type FilterOption = {
  league?: Liga;
  team?: string;
  minPrice?: number;
  maxPrice?: number;
};

export type SortOption = "price-asc" | "price-desc" | "name-asc" | "name-desc" | "popular";
