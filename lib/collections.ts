/**
 * Funciones helper para obtener colecciones desde Medusa Store API
 * 
 * Las colecciones representan equipos en este contexto
 */

import {
  listCollections,
  getCollectionByHandle,
  listProductsByCollection,
  MedusaStoreCollection,
} from "./medusa-store";
import { adaptMedusaProduct, MedusaProductAdapted } from "@/types/medusa";

/**
 * Obtener todas las colecciones (equipos)
 */
export async function getAllCollections(): Promise<MedusaStoreCollection[]> {
  try {
    return await listCollections();
  } catch (error) {
    console.error("[Collections] Error fetching collections:", error);
    return [];
  }
}

/**
 * Obtener una colección por handle
 */
export async function getCollectionByHandleHelper(
  handle: string
): Promise<MedusaStoreCollection | null> {
  try {
    return await getCollectionByHandle(handle);
  } catch (error) {
    console.error(`[Collections] Error fetching collection ${handle}:`, error);
    return null;
  }
}

/**
 * Obtener productos de una colección específica
 */
export async function getProductsByCollection(
  collectionId: string
): Promise<MedusaProductAdapted[]> {
  try {
    const products = await listProductsByCollection(collectionId);
    return products.map((product) => adaptMedusaProduct(product as any));
  } catch (error) {
    console.error(
      `[Collections] Error fetching products for collection ${collectionId}:`,
      error
    );
    return [];
  }
}

/**
 * Obtener productos de una colección por handle
 */
export async function getProductsByCollectionHandle(
  collectionHandle: string
): Promise<MedusaProductAdapted[]> {
  try {
    const collection = await getCollectionByHandleHelper(collectionHandle);
    if (!collection) {
      return [];
    }

    return await getProductsByCollection(collection.id);
  } catch (error) {
    console.error(
      `[Collections] Error fetching products for collection handle ${collectionHandle}:`,
      error
    );
    return [];
  }
}
