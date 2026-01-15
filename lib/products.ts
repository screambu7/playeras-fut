/**
 * Funciones helper para obtener productos
 * 
 * Estrategia híbrida: Intenta usar Medusa primero, si no hay productos o falla,
 * usa Supabase como fallback para permitir migración gradual.
 * Separado de la lógica de negocio para mantener SoC
 */

import { medusa } from "./medusa";
import { adaptMedusaProduct, MedusaProductAdapted } from "@/types/medusa";
import { Liga, Talla, Genero, Version } from "@/types";
import {
  getAllSupabaseProducts,
  getSupabaseProductById,
  filterSupabaseProducts,
  getAllLeaguesFromSupabase,
  getAllTeamsFromSupabase,
  getAllSizesFromSupabase,
  getAllGenerosFromSupabase,
  getAllVersionsFromSupabase,
  adaptSupabaseProduct,
} from "./supabase-products";

/**
 * Títulos de productos que tienen duplicados y deben mostrarse solo una vez
 */
const DUPLICATE_PRODUCT_TITLES = [
  "2026 Brazil Away Jersey",
  "2026 Spain Player Version",
];

/**
 * Elimina productos duplicados del array
 * Mantiene solo 1 de cada tipo (el primero encontrado)
 * 
 * Estrategia: Para productos con títulos duplicados específicos,
 * mantiene solo el primero que encuentra en el array.
 */
function removeDuplicateProducts(
  products: MedusaProductAdapted[]
): MedusaProductAdapted[] {
  const seenTitles = new Set<string>();
  const duplicateTitlesSet = new Set(
    DUPLICATE_PRODUCT_TITLES.map((t) => t.trim().toLowerCase())
  );

  // Filtrar productos duplicados: mantener solo el primero de cada título duplicado
  const uniqueProducts: MedusaProductAdapted[] = [];

  for (const product of products) {
    const normalizedTitle = product.title.trim().toLowerCase();

    // Solo aplicar deduplicación a los títulos específicos
    if (duplicateTitlesSet.has(normalizedTitle)) {
      // Si ya vimos este título, saltarlo (es un duplicado)
      if (seenTitles.has(normalizedTitle)) {
        continue;
      }
      // Primera vez que vemos este título, marcarlo y agregarlo
      seenTitles.add(normalizedTitle);
    }

    // Agregar el producto (ya sea único o el primero de un duplicado)
    uniqueProducts.push(product);
  }

  return uniqueProducts;
}

/**
 * Obtener todos los productos
 * Intenta Medusa primero, fallback a Supabase si no hay productos
 * Elimina duplicados en el frontend antes de devolver
 */
export async function getAllProducts(): Promise<MedusaProductAdapted[]> {
  let allProducts: MedusaProductAdapted[] = [];

  try {
    // Intentar obtener de Medusa
    const { products } = await medusa.products.list({
      limit: 1000,
      offset: 0,
    });

    // Si hay productos en Medusa, usarlos
    if (products && products.length > 0) {
      allProducts = products.map(adaptMedusaProduct);
    } else {
      // Si no hay productos en Medusa, usar Supabase como fallback
      console.log("[Products] No products in Medusa, falling back to Supabase");
      const supabaseProducts = await getAllSupabaseProducts();
      allProducts = supabaseProducts.map(adaptSupabaseProduct);
    }
  } catch (error) {
    // Si Medusa falla, usar Supabase como fallback
    console.warn("[Products] Error fetching from Medusa, falling back to Supabase:", error);
    try {
      const supabaseProducts = await getAllSupabaseProducts();
      allProducts = supabaseProducts.map(adaptSupabaseProduct);
    } catch (supabaseError) {
      console.error("[Products] Error fetching products from both sources:", supabaseError);
      return [];
    }
  }

  // Eliminar duplicados antes de devolver
  return removeDuplicateProducts(allProducts);
}

/**
 * Obtener un producto por handle
 * Intenta Medusa primero, fallback a Supabase
 */
export async function getProductByHandle(
  handle: string
): Promise<MedusaProductAdapted | null> {
  try {
    // Intentar obtener de Medusa
    const { product } = await medusa.products.retrieve(handle);
    if (product) {
      return adaptMedusaProduct(product);
    }
  } catch (error) {
    // Si no existe en Medusa o falla, intentar Supabase
    console.log(`[Products] Product ${handle} not found in Medusa, trying Supabase`);
  }

  // Fallback a Supabase
  try {
    // Buscar en todos los productos de Supabase por handle generado
    const allProducts = await getAllSupabaseProducts();
    
    for (const supabaseProduct of allProducts) {
      const adaptedProduct = adaptSupabaseProduct(supabaseProduct);
      if (adaptedProduct.handle === handle) {
        return adaptedProduct;
      }
    }

    // Si no se encuentra por handle, intentar buscar por ID directo
    const productById = await getSupabaseProductById(handle);
    if (productById) {
      return adaptSupabaseProduct(productById);
    }

    return null;
  } catch (error) {
    console.error(`[Products] Error fetching product ${handle} from Supabase:`, error);
    return null;
  }
}

/**
 * Obtener productos destacados desde Medusa
 */
export async function getFeaturedProducts(): Promise<MedusaProductAdapted[]> {
  const products = await getAllProducts();
  return products.filter((p) => p.metadata.featured === true);
}

/**
 * Obtener productos más vendidos desde Medusa
 */
export async function getBestSellerProducts(): Promise<MedusaProductAdapted[]> {
  const products = await getAllProducts();
  return products.filter((p) => p.metadata.bestSeller === true);
}

/**
 * Obtener todas las ligas disponibles
 * Usa la fuente de datos actual (Medusa o Supabase)
 */
export async function getAllLeagues(): Promise<Liga[]> {
  try {
    // Intentar obtener de Supabase directamente (más eficiente)
    const leagues = await getAllLeaguesFromSupabase();
    const validLeagues: Liga[] = [
      "La Liga",
      "Premier League",
      "Serie A",
      "Bundesliga",
      "Ligue 1",
      "Champions League",
    ];
    return leagues.filter((league): league is Liga =>
      validLeagues.includes(league as Liga)
    );
  } catch (error) {
    // Fallback: obtener desde productos
    console.warn("[Products] Error fetching leagues from Supabase, using products:", error);
    const products = await getAllProducts();
    const leagues = new Set<string>();

    products.forEach((product) => {
      if (product.metadata.league) {
        leagues.add(product.metadata.league);
      }
    });

    const validLeagues: Liga[] = [
      "La Liga",
      "Premier League",
      "Serie A",
      "Bundesliga",
      "Ligue 1",
      "Champions League",
    ];

    return Array.from(leagues).filter((league): league is Liga =>
      validLeagues.includes(league as Liga)
    );
  }
}

/**
 * Obtener todos los equipos disponibles
 * Usa la fuente de datos actual (Medusa o Supabase)
 */
export async function getAllTeams(): Promise<string[]> {
  try {
    // Intentar obtener de Supabase directamente (más eficiente)
    return await getAllTeamsFromSupabase();
  } catch (error) {
    // Fallback: obtener desde productos
    console.warn("[Products] Error fetching teams from Supabase, using products:", error);
    const products = await getAllProducts();
    const teams = new Set<string>();

    products.forEach((product) => {
      if (product.metadata.team) {
        teams.add(product.metadata.team);
      }
    });

    return Array.from(teams).sort();
  }
}

/**
 * Obtener todas las tallas disponibles
 * Usa la fuente de datos actual (Medusa o Supabase)
 */
export async function getAllSizes(): Promise<Talla[]> {
  try {
    // Intentar obtener de Supabase directamente (más eficiente)
    const sizes = await getAllSizesFromSupabase();
    const validSizes: Talla[] = ["XS", "S", "M", "L", "XL", "XXL"];
    return sizes.filter((size): size is Talla =>
      validSizes.includes(size)
    );
  } catch (error) {
    // Fallback: obtener desde productos
    console.warn("[Products] Error fetching sizes from Supabase, using products:", error);
    const products = await getAllProducts();
    const sizes = new Set<Talla>();

    products.forEach((product) => {
      product.variants.forEach((variant) => {
        const size = variant.options.Size as Talla;
        if (size) {
          sizes.add(size);
        }
      });
    });

    const validSizes: Talla[] = ["XS", "S", "M", "L", "XL", "XXL"];
    return Array.from(sizes).filter((size): size is Talla =>
      validSizes.includes(size)
    );
  }
}

/**
 * Obtener todos los géneros disponibles
 * Usa la fuente de datos actual (Medusa o Supabase)
 */
export async function getAllGeneros(): Promise<Genero[]> {
  try {
    // Intentar obtener de Supabase directamente (más eficiente)
    return await getAllGenerosFromSupabase();
  } catch (error) {
    // Fallback: obtener desde productos
    console.warn("[Products] Error fetching generos from Supabase, using products:", error);
    const products = await getAllProducts();
    const generos = new Set<Genero>();

    products.forEach((product) => {
      if (product.metadata.genero) {
        generos.add(product.metadata.genero);
      }
    });

    return Array.from(generos).sort();
  }
}

/**
 * Obtener todas las versiones disponibles
 * Usa la fuente de datos actual (Medusa o Supabase)
 */
export async function getAllVersions(): Promise<Version[]> {
  try {
    // Intentar obtener de Supabase directamente (más eficiente)
    return await getAllVersionsFromSupabase();
  } catch (error) {
    // Fallback: obtener desde productos
    console.warn("[Products] Error fetching versions from Supabase, using products:", error);
    const products = await getAllProducts();
    const versions = new Set<Version>();

    products.forEach((product) => {
      if (product.metadata.version) {
        versions.add(product.metadata.version);
      }
    });

    return Array.from(versions).sort();
  }
}

/**
 * Filtrar productos por criterios
 * Usa la fuente de datos actual (Medusa o Supabase)
 */
export async function filterProducts(filters: {
  league?: Liga;
  team?: string;
  genero?: Genero;
  version?: Version;
  minPrice?: number;
  maxPrice?: number;
}): Promise<MedusaProductAdapted[]> {
  try {
    // Intentar usar filtros de Supabase (más eficiente)
    const supabaseProducts = await filterSupabaseProducts({
      league: filters.league,
      team: filters.team,
      genero: filters.genero,
      version: filters.version,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
    });

    return supabaseProducts.map(adaptSupabaseProduct);
  } catch (error) {
    // Fallback: filtrar en memoria desde todos los productos
    console.warn("[Products] Error filtering from Supabase, filtering in memory:", error);
    const allProducts = await getAllProducts();

    return allProducts.filter((product) => {
      if (filters.league && product.metadata.league !== filters.league) {
        return false;
      }

      if (filters.team && product.metadata.team !== filters.team) {
        return false;
      }

      if (filters.genero && product.metadata.genero !== filters.genero) {
        return false;
      }

      if (filters.version && product.metadata.version !== filters.version) {
        return false;
      }

      if (filters.minPrice !== undefined && product.price < filters.minPrice) {
        return false;
      }

      if (filters.maxPrice !== undefined && product.price > filters.maxPrice) {
        return false;
      }

      return true;
    });
  }
}
