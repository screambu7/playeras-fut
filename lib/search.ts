/**
 * Lógica de búsqueda de productos
 * Preparado para migración futura a backend search
 */

import { MedusaProductAdapted } from "@/types";

export interface SearchResult {
  product: MedusaProductAdapted;
  relevanceScore: number;
}

/**
 * Busca productos por término de búsqueda
 * Busca en: title, description, team, league
 */
export async function searchProducts(
  query: string,
  limit: number = 8
): Promise<SearchResult[]> {
  if (!query || query.trim().length < 2) {
    return [];
  }

  // Importar dinámicamente para evitar problemas de SSR
  const { getAllProducts } = await import("./products");
  const products = await getAllProducts();

  const normalizedQuery = query.trim().toLowerCase();
  const queryWords = normalizedQuery.split(/\s+/).filter((w) => w.length > 0);

  const results: SearchResult[] = [];

  for (const product of products) {
    let relevanceScore = 0;
    const searchableText = [
      product.title,
      product.description,
      product.metadata.team,
      product.metadata.league,
      product.metadata.season,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    // Buscar coincidencias exactas primero
    if (searchableText.includes(normalizedQuery)) {
      relevanceScore += 100;
    }

    // Buscar por palabras individuales
    for (const word of queryWords) {
      if (product.title.toLowerCase().includes(word)) {
        relevanceScore += 50;
      }
      if (product.metadata.team?.toLowerCase().includes(word)) {
        relevanceScore += 30;
      }
      if (product.metadata.league?.toLowerCase().includes(word)) {
        relevanceScore += 20;
      }
      if (product.description.toLowerCase().includes(word)) {
        relevanceScore += 10;
      }
    }

    // Si hay coincidencias, agregar al resultado
    if (relevanceScore > 0) {
      results.push({
        product,
        relevanceScore,
      });
    }
  }

  // Ordenar por relevancia (mayor a menor)
  results.sort((a, b) => b.relevanceScore - a.relevanceScore);

  // Limitar resultados
  return results.slice(0, limit);
}

/**
 * Obtiene sugerencias de búsqueda basadas en productos populares
 */
export async function getSearchSuggestions(limit: number = 5): Promise<string[]> {
  const { getBestSellerProducts } = await import("./products");
  const products = await getBestSellerProducts();

  return products
    .slice(0, limit)
    .map((p) => p.title)
    .filter(Boolean);
}
