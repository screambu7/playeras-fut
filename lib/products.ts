/**
 * Funciones helper para obtener productos desde Medusa Store API
 * 
 * Usa el cliente Store API con Publishable API Key
 * Separado de la lógica de negocio para mantener SoC
 */

import {
  listProducts,
  getProductByHandle as getProductByHandleStore,
  MedusaStoreProduct,
} from "./medusa-store";
import { adaptMedusaProduct, MedusaProductAdapted } from "@/types/medusa";
import { Liga, Talla } from "@/types";

/**
 * Obtener todos los productos
 */
export async function getAllProducts(): Promise<MedusaProductAdapted[]> {
  try {
    const products = await listProducts();
    return products.map((product) => adaptMedusaProduct(product as any));
  } catch (error) {
    console.error("[Products] Error fetching products:", error);
    return [];
  }
}

/**
 * Obtener un producto por handle
 */
export async function getProductByHandle(
  handle: string
): Promise<MedusaProductAdapted | null> {
  try {
    const product = await getProductByHandleStore(handle);
    if (!product) {
      return null;
    }
    return adaptMedusaProduct(product as any);
  } catch (error) {
    console.error(`[Products] Error fetching product ${handle}:`, error);
    return null;
  }
}

/**
 * Obtener productos destacados
 */
export async function getFeaturedProducts(): Promise<MedusaProductAdapted[]> {
  const products = await getAllProducts();
  return products.filter((p) => p.metadata.featured === true);
}

/**
 * Obtener productos más vendidos
 */
export async function getBestSellerProducts(): Promise<MedusaProductAdapted[]> {
  const products = await getAllProducts();
  return products.filter((p) => p.metadata.bestSeller === true);
}

/**
 * Obtener todas las ligas disponibles
 */
export async function getAllLeagues(): Promise<Liga[]> {
  const products = await getAllProducts();
  const leagues = new Set<Liga>();
  
  products.forEach((product) => {
    if (product.metadata.league) {
      leagues.add(product.metadata.league as Liga);
    }
  });
  
  return Array.from(leagues).sort();
}

/**
 * Obtener todos los equipos disponibles
 */
export async function getAllTeams(): Promise<string[]> {
  const products = await getAllProducts();
  const teams = new Set<string>();
  
  products.forEach((product) => {
    if (product.metadata.team) {
      teams.add(product.metadata.team);
    }
  });
  
  return Array.from(teams).sort();
}

/**
 * Obtener todas las tallas disponibles
 */
export async function getAllSizes(): Promise<Talla[]> {
  const products = await getAllProducts();
  const sizes = new Set<Talla>();
  
  products.forEach((product) => {
    product.variants.forEach((variant) => {
      // Las tallas están en variant.options.Size o variant.title
      const size = variant.options?.Size || variant.title;
      if (size) {
        sizes.add(size as Talla);
      }
    });
  });
  
  // Ordenar tallas en orden lógico
  const order: Talla[] = ["XS", "S", "M", "L", "XL", "XXL"];
  return Array.from(sizes).sort((a, b) => {
    const indexA = order.indexOf(a);
    const indexB = order.indexOf(b);
    if (indexA === -1 && indexB === -1) return a.localeCompare(b);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });
}

/**
 * Filtrar productos por criterios
 */
export async function filterProducts(filters: {
  league?: Liga;
  team?: string;
  minPrice?: number;
  maxPrice?: number;
}): Promise<MedusaProductAdapted[]> {
  let products = await getAllProducts();
  
  if (filters.league) {
    products = products.filter((p) => p.metadata.league === filters.league);
  }
  
  if (filters.team) {
    products = products.filter((p) => p.metadata.team === filters.team);
  }
  
  if (filters.minPrice !== undefined) {
    products = products.filter((p) => p.price >= filters.minPrice!);
  }
  
  if (filters.maxPrice !== undefined) {
    products = products.filter((p) => p.price <= filters.maxPrice!);
  }
  
  return products;
}
