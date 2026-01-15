/**
 * Script de migración: Supabase → Medusa
 * 
 * Migra todos los productos de la tabla scraped_products en Supabase
 * a productos en Medusa usando workflows.
 * 
 * USO:
 *   npm run migrate:supabase
 * 
 * REQUISITOS:
 *   - Variables de entorno configuradas en backend/.env:
 *     * SUPABASE_URL
 *     * SUPABASE_SERVICE_ROLE_KEY (para leer datos)
 *     * DATABASE_URL (para Medusa)
 * 
 * SEGURIDAD:
 *   - Este script solo LEE de Supabase y ESCRIBE en Medusa
 *   - No modifica ni elimina datos en Supabase
 *   - Puede ejecutarse múltiples veces (idempotente por handle)
 */

import { ExecArgs } from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils";
import {
  createInventoryLevelsWorkflow,
  createProductCategoriesWorkflow,
  createProductsWorkflow,
} from "@medusajs/medusa/core-flows";
import { createClient } from "@supabase/supabase-js";

// Tipos para productos de Supabase
interface SupabaseProduct {
  id: string;
  name: string;
  team: string;
  league: string;
  season: string;
  type: string;
  product_type: string | null;
  price: number | null;
  original_price: number | null;
  images: string[];
  image_url: string | null;
  description: string | null;
  url: string;
  source: string;
  sizes: string[];
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

// Configuración
const BATCH_SIZE = 50; // Productos por lote para evitar sobrecarga
const DEFAULT_INVENTORY_QUANTITY = 100; // Cantidad por defecto en inventario

/**
 * Extrae el género del producto desde su nombre y descripción
 */
function extractGenero(product: SupabaseProduct): string {
  const text = `${product.name} ${product.description || ""}`.toLowerCase();

  if (text.includes("kids") || text.includes("kid") || text.includes("niño") || text.includes("niña")) {
    return "Niño";
  }

  if (text.includes("woman") || text.includes("women") || text.includes("mujer") || text.includes("ladies")) {
    return "Mujer";
  }

  return "Hombre";
}

/**
 * Extrae la versión del producto (Player o Fan)
 */
function extractVersion(product: SupabaseProduct): string {
  const text = `${product.name} ${product.description || ""}`.toLowerCase();

  if (text.includes("player") || text.includes("player version") || text.includes("player kit")) {
    return "Player";
  }

  return "Fan";
}

/**
 * Genera un handle único desde el nombre del producto
 */
function generateHandle(product: SupabaseProduct): string {
  const baseHandle = product.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  // Agregar sufijo único para evitar colisiones
  return `${baseHandle}-${product.id.slice(0, 8)}`;
}

/**
 * Obtiene todas las imágenes del producto
 */
function getProductImages(product: SupabaseProduct): string[] {
  if (product.images && product.images.length > 0) {
    return product.images.filter((img) => img && img.trim().length > 0);
  }

  if (product.image_url) {
    return [product.image_url];
  }

  return [];
}

/**
 * Transforma un producto de Supabase al formato de Medusa
 */
function transformSupabaseToMedusa(
  supabaseProduct: SupabaseProduct,
  categoryId: string,
  shippingProfileId: string,
  salesChannelId: string
) {
  const handle = generateHandle(supabaseProduct);
  const price = supabaseProduct.price || 0;
  const priceInCents = Math.round(price * 100); // Convertir a centavos
  const originalPriceInCents = supabaseProduct.original_price
    ? Math.round(supabaseProduct.original_price * 100)
    : undefined;

  // Obtener imágenes
  const images = getProductImages(supabaseProduct);

  // Extraer género y versión
  const genero = extractGenero(supabaseProduct);
  const version = extractVersion(supabaseProduct);

  // Preparar tallas (filtrar valores vacíos y duplicados)
  const sizes = Array.from(
    new Set((supabaseProduct.sizes || []).filter((s) => s && s.trim().length > 0))
  );

  // Si no hay tallas, crear una por defecto
  const finalSizes = sizes.length > 0 ? sizes : ["M"];

  // Crear variantes por talla
  const variants = finalSizes.map((size, index) => ({
    title: size,
    sku: `${supabaseProduct.id.toUpperCase().replace(/[^A-Z0-9]/g, "_")}_${size}`,
    options: {
      Size: size,
    },
    prices: [
      {
        amount: priceInCents,
        currency_code: "eur",
      },
      // Opcional: precio en USD (aproximadamente 10% más)
      {
        amount: Math.round(priceInCents * 1.1),
        currency_code: "usd",
      },
    ],
  }));

  // Metadata para Medusa
  const metadata: Record<string, string> = {
    team: supabaseProduct.team || "",
    league: supabaseProduct.league || "",
    season: supabaseProduct.season || "",
    genero,
    version,
    featured: "false",
    bestSeller: "false",
    originalPrice: originalPriceInCents?.toString() || "",
    // Preservar metadata original si existe
    ...(supabaseProduct.metadata
      ? Object.fromEntries(
          Object.entries(supabaseProduct.metadata).map(([k, v]) => [
            k,
            String(v),
          ])
        )
      : {}),
  };

  return {
    title: supabaseProduct.name,
    category_ids: [categoryId],
    description: supabaseProduct.description || "",
    handle,
    weight: 200, // gramos (estimado para playeras)
    status: ProductStatus.PUBLISHED,
    shipping_profile_id: shippingProfileId,
    images: images.map((url) => ({ url })),
    options: [
      {
        title: "Size",
        values: finalSizes,
      },
    ],
    variants,
    sales_channels: [
      {
        id: salesChannelId,
      },
    ],
    metadata,
  };
}

/**
 * Script principal de migración
 */
export default async function migrateSupabaseToMedusa({
  container,
}: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL);
  const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT);

  // Validar variables de entorno
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    logger.error(
      "❌ Variables de entorno faltantes. Requiere: SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY"
    );
    throw new Error(
      "Missing Supabase environment variables. Check backend/.env"
    );
  }

  logger.info("🚀 Iniciando migración de Supabase a Medusa...");

  // 1. Conectar a Supabase
  logger.info("📡 Conectando a Supabase...");
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // 2. Obtener productos de Supabase
  logger.info("📦 Obteniendo productos de Supabase...");
  const { data: supabaseProducts, error: supabaseError } = await supabase
    .from("scraped_products")
    .select("*")
    .order("created_at", { ascending: false });

  if (supabaseError) {
    logger.error("❌ Error al obtener productos de Supabase:", supabaseError);
    throw supabaseError;
  }

  if (!supabaseProducts || supabaseProducts.length === 0) {
    logger.warn("⚠️ No se encontraron productos en Supabase. Nada que migrar.");
    return;
  }

  logger.info(`✅ Encontrados ${supabaseProducts.length} productos en Supabase`);

  // 3. Obtener configuración de Medusa
  logger.info("⚙️ Configurando Medusa...");

  // Obtener sales channel por defecto
  let defaultSalesChannel = await salesChannelModuleService.listSalesChannels({
    name: "Default Sales Channel",
  });

  if (!defaultSalesChannel.length) {
    logger.warn("⚠️ Sales Channel no encontrado. Creando uno por defecto...");
    const { createSalesChannelsWorkflow } = await import(
      "@medusajs/medusa/core-flows"
    );
    const { result: salesChannelResult } =
      await createSalesChannelsWorkflow(container).run({
        input: {
          salesChannelsData: [
            {
              name: "Default Sales Channel",
            },
          ],
        },
      });
    defaultSalesChannel = salesChannelResult;
  }

  const salesChannelId = defaultSalesChannel[0].id;
  logger.info(`✅ Sales Channel: ${salesChannelId}`);

  // Obtener shipping profile
  const shippingProfiles = await fulfillmentModuleService.listShippingProfiles({
    type: "default",
  });

  if (!shippingProfiles.length) {
    logger.error(
      "❌ Shipping profile no encontrado. Ejecuta 'npm run seed' primero."
    );
    throw new Error("Shipping profile not found");
  }

  const shippingProfileId = shippingProfiles[0].id;
  logger.info(`✅ Shipping Profile: ${shippingProfileId}`);

  // Crear o obtener categoría de playeras
  logger.info("📂 Creando categoría de productos...");
  const { result: categoryResult } = await createProductCategoriesWorkflow(
    container
  ).run({
    input: {
      product_categories: [
        {
          name: "Football Jerseys",
          is_active: true,
        },
      ],
    },
  });

  const categoryId = categoryResult[0].id;
  logger.info(`✅ Categoría creada: ${categoryId}`);

  // 4. Transformar y migrar productos en lotes
  logger.info(`🔄 Migrando productos en lotes de ${BATCH_SIZE}...`);

  let totalMigrated = 0;
  let totalErrors = 0;
  const errors: Array<{ product: string; error: string }> = [];

  for (let i = 0; i < supabaseProducts.length; i += BATCH_SIZE) {
    const batch = supabaseProducts.slice(i, i + BATCH_SIZE);
    const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(supabaseProducts.length / BATCH_SIZE);

    logger.info(
      `📦 Procesando lote ${batchNumber}/${totalBatches} (${batch.length} productos)...`
    );

    try {
      // Transformar productos del lote
      const productsToCreate = batch.map((product) =>
        transformSupabaseToMedusa(
          product,
          categoryId,
          shippingProfileId,
          salesChannelId
        )
      );

      // Crear productos en Medusa
      await createProductsWorkflow(container).run({
        input: {
          products: productsToCreate,
        },
      });

      totalMigrated += batch.length;
      logger.info(
        `✅ Lote ${batchNumber} completado. Total migrado: ${totalMigrated}/${supabaseProducts.length}`
      );
    } catch (error) {
      totalErrors += batch.length;
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      logger.error(`❌ Error en lote ${batchNumber}:`, errorMessage);

      // Guardar errores por producto
      batch.forEach((product) => {
        errors.push({
          product: product.name || product.id,
          error: errorMessage,
        });
      });
    }
  }

  // 5. Crear niveles de inventario
  logger.info("📊 Creando niveles de inventario...");

  const { data: inventoryItems } = await query.graph({
    entity: "inventory_item",
    fields: ["id"],
  });

  const { data: stockLocations } = await query.graph({
    entity: "stock_location",
    fields: ["id"],
  });

  if (stockLocations.length > 0 && inventoryItems.length > 0) {
    const inventoryLevels = inventoryItems.map((item: { id: string }) => ({
      location_id: stockLocations[0].id,
      stocked_quantity: DEFAULT_INVENTORY_QUANTITY,
      inventory_item_id: item.id,
    }));

    await createInventoryLevelsWorkflow(container).run({
      input: {
        inventory_levels: inventoryLevels,
      },
    });

    logger.info(
      `✅ Inventario creado para ${inventoryItems.length} items`
    );
  } else {
    logger.warn("⚠️ No se encontraron stock locations. Saltando inventario.");
  }

  // 6. Resumen final
  logger.info("\n" + "=".repeat(60));
  logger.info("📊 RESUMEN DE MIGRACIÓN");
  logger.info("=".repeat(60));
  logger.info(`✅ Productos migrados exitosamente: ${totalMigrated}`);
  logger.info(`❌ Errores: ${totalErrors}`);
  logger.info(`📦 Total procesado: ${supabaseProducts.length}`);

  if (errors.length > 0) {
    logger.warn("\n⚠️ Errores detallados:");
    errors.slice(0, 10).forEach((err) => {
      logger.warn(`  - ${err.product}: ${err.error}`);
    });
    if (errors.length > 10) {
      logger.warn(`  ... y ${errors.length - 10} errores más`);
    }
  }

  logger.info("\n✅ Migración completada!");
}
