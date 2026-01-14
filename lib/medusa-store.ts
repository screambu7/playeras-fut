/**
 * Cliente profesional para Medusa Store API v2
 * 
 * Usa fetch nativo con Publishable API Key
 * Separado de la lógica de negocio para mantener SoC
 */

import { createApiError, ApiError } from "./error-handler";

const BASE_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  console.warn(
    "⚠️ NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY no está configurada. " +
    "Las peticiones al Store API pueden fallar."
  );
}

/**
 * Opciones para peticiones fetch
 */
interface FetchOptions extends RequestInit {
  revalidate?: number | false;
}

/**
 * Realiza una petición al Store API de Medusa
 */
async function medusaFetch<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { revalidate, ...fetchOptions } = options;

  const url = `${BASE_URL}/store${endpoint}`;
  
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(PUBLISHABLE_KEY && { "x-publishable-api-key": PUBLISHABLE_KEY }),
    ...fetchOptions.headers,
  };

  const config: RequestInit = {
    ...fetchOptions,
    headers,
    next: revalidate !== undefined ? { revalidate } : undefined,
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error: any = new Error(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`
      );
      error.status = response.status;
      error.response = response;
      throw error;
    }

    return await response.json();
  } catch (error: any) {
    // Si es un error de red, lanzar con información estructurada
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      const networkError: any = new Error(
        "No se pudo conectar con el servidor de Medusa"
      );
      networkError.isNetworkError = true;
      throw networkError;
    }

    throw error;
  }
}

/**
 * Tipos de respuesta de Medusa Store API
 */
export interface MedusaStoreProduct {
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

export interface MedusaStoreCollection {
  id: string;
  title: string;
  handle: string;
  metadata?: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export interface MedusaStoreProductsResponse {
  products: MedusaStoreProduct[];
  count: number;
  offset: number;
  limit: number;
}

export interface MedusaStoreProductResponse {
  product: MedusaStoreProduct;
}

export interface MedusaStoreCollectionsResponse {
  collections: MedusaStoreCollection[];
  count: number;
  offset: number;
  limit: number;
}

export interface MedusaStoreCollectionResponse {
  collection: MedusaStoreCollection & {
    products?: MedusaStoreProduct[];
  };
}

/**
 * Lista todos los productos publicados
 */
export async function listProducts(options?: {
  limit?: number;
  offset?: number;
  collection_id?: string;
  revalidate?: number | false;
}): Promise<MedusaStoreProduct[]> {
  try {
    const { limit = 100, offset = 0, collection_id, revalidate } = options || {};
    
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
      ...(collection_id && { collection_id }),
    });

    const response = await medusaFetch<MedusaStoreProductsResponse>(
      `/products?${params.toString()}`,
      { revalidate }
    );

    return response.products || [];
  } catch (error) {
    console.error("[Medusa Store API] Error listing products:", error);
    throw createApiError(error);
  }
}

/**
 * Obtiene un producto por su handle
 */
export async function getProductByHandle(
  handle: string,
  options?: { revalidate?: number | false }
): Promise<MedusaStoreProduct | null> {
  try {
    const response = await medusaFetch<MedusaStoreProductResponse>(
      `/products/${handle}`,
      { revalidate: options?.revalidate }
    );

    return response.product || null;
  } catch (error: any) {
    // Si el producto no existe, retornar null en lugar de lanzar error
    if (error.status === 404) {
      return null;
    }

    console.error(`[Medusa Store API] Error fetching product ${handle}:`, error);
    throw createApiError(error);
  }
}

/**
 * Lista todas las colecciones
 */
export async function listCollections(options?: {
  limit?: number;
  offset?: number;
  revalidate?: number | false;
}): Promise<MedusaStoreCollection[]> {
  try {
    const { limit = 100, offset = 0, revalidate } = options || {};
    
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });

    const response = await medusaFetch<MedusaStoreCollectionsResponse>(
      `/collections?${params.toString()}`,
      { revalidate }
    );

    return response.collections || [];
  } catch (error) {
    console.error("[Medusa Store API] Error listing collections:", error);
    throw createApiError(error);
  }
}

/**
 * Obtiene una colección por su handle
 */
export async function getCollectionByHandle(
  handle: string,
  options?: { revalidate?: number | false }
): Promise<MedusaStoreCollection | null> {
  try {
    const response = await medusaFetch<MedusaStoreCollectionResponse>(
      `/collections/${handle}`,
      { revalidate: options?.revalidate }
    );

    return response.collection || null;
  } catch (error: any) {
    // Si la colección no existe, retornar null
    if (error.status === 404) {
      return null;
    }

    console.error(
      `[Medusa Store API] Error fetching collection ${handle}:`,
      error
    );
    throw createApiError(error);
  }
}

/**
 * Lista productos de una colección específica
 */
export async function listProductsByCollection(
  collectionId: string,
  options?: {
    limit?: number;
    offset?: number;
    revalidate?: number | false;
  }
): Promise<MedusaStoreProduct[]> {
  try {
    return await listProducts({
      ...options,
      collection_id: collectionId,
    });
  } catch (error) {
    console.error(
      `[Medusa Store API] Error listing products for collection ${collectionId}:`,
      error
    );
    throw createApiError(error);
  }
}
