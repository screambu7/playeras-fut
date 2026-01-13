/**
 * Funciones helper para obtener productos desde Medusa API
 */

import { medusa } from "./medusa";
import { adaptMedusaProduct, MedusaProductAdapted } from "@/types/medusa";
import { Liga } from "@/types";

/**
 * Obtener todos los productos
 */
export async function getAllProducts(): Promise<MedusaProductAdapted[]> {
  try {
    const { products } = await medusa.store.product.list();
    return products.map(adaptMedusaProduct);
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

/**
 * Obtener un producto por handle
 */
export async function getProductByHandle(handle: string): Promise<MedusaProductAdapted | null> {
  try {
    const { product } = await medusa.store.product.retrieve(handle);
    return adaptMedusaProduct(product);
  } catch (error) {
    console.error(`Error fetching product ${handle}:`, error);
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
