/**
 * Script de migración directa: Supabase → Medusa (vía API)
 * 
 * Lee productos directamente de Supabase usando el cliente
 * y los crea en Medusa usando la Admin API REST.
 * 
 * Este script NO requiere conexión directa a la base de datos de Medusa,
 * solo necesita que el backend de Medusa esté corriendo.
 * 
 * USO:
 *   npm run migrate:supabase:direct
 * 
 * REQUISITOS:
 *   - Backend de Medusa corriendo en http://localhost:9000
 *   - Variables de entorno en backend/.env:
 *     * SUPABASE_URL
 *     * SUPABASE_SERVICE_ROLE_KEY
 *     * MEDUSA_ADMIN_API_TOKEN (opcional, si requiere auth)
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

// Cargar variables de entorno desde .env
function loadEnvFile() {
  const envPath = path.join(__dirname, "../../.env");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8");
    envContent.split("\n").forEach((line) => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith("#") && trimmedLine.includes("=")) {
        const [key, ...valueParts] = trimmedLine.split("=");
        const value = valueParts.join("=").trim();
        if (key && value) {
          process.env[key] = value;
        }
      }
    });
  }
}

// Cargar .env al inicio
loadEnvFile();

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
const BATCH_SIZE = 20; // Productos por lote para evitar sobrecarga
const MEDUSA_BACKEND_URL = process.env.MEDUSA_BACKEND_URL || "http://localhost:9000";
const MEDUSA_ADMIN_API_TOKEN = process.env.MEDUSA_ADMIN_API_TOKEN || "";

/**
 * Extrae el género del producto
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
 * Extrae la versión del producto
 */
function extractVersion(product: SupabaseProduct): string {
  const text = `${product.name} ${product.description || ""}`.toLowerCase();
  if (text.includes("player") || text.includes("player version") || text.includes("player kit")) {
    return "Player";
  }
  return "Fan";
}

/**
 * Genera un handle único
 */
function generateHandle(product: SupabaseProduct): string {
  const baseHandle = product.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return `${baseHandle}-${product.id.slice(0, 8)}`;
}

/**
 * Obtiene las imágenes del producto
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
 * Transforma un producto de Supabase al formato de Medusa Admin API
 */
function transformToMedusaFormat(supabaseProduct: SupabaseProduct) {
  const handle = generateHandle(supabaseProduct);
  const price = supabaseProduct.price || 0;
  const priceInCents = Math.round(price * 100);
  const originalPriceInCents = supabaseProduct.original_price
    ? Math.round(supabaseProduct.original_price * 100)
    : undefined;

  const images = getProductImages(supabaseProduct);
  const genero = extractGenero(supabaseProduct);
  const version = extractVersion(supabaseProduct);

  const sizes = Array.from(
    new Set((supabaseProduct.sizes || []).filter((s) => s && s.trim().length > 0))
  );
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
      {
        amount: Math.round(priceInCents * 1.1),
        currency_code: "usd",
      },
    ],
  }));

  const metadata: Record<string, string> = {
    team: supabaseProduct.team || "",
    league: supabaseProduct.league || "",
    season: supabaseProduct.season || "",
    genero,
    version,
    featured: "false",
    bestSeller: "false",
    originalPrice: originalPriceInCents?.toString() || "",
    ...(supabaseProduct.metadata
      ? Object.fromEntries(
          Object.entries(supabaseProduct.metadata).map(([k, v]) => [k, String(v)])
        )
      : {}),
  };

  return {
    title: supabaseProduct.name,
    description: supabaseProduct.description || "",
    handle,
    weight: 200,
    status: "published",
    images: images.map((url) => ({ url })),
    options: [
      {
        title: "Size",
        values: finalSizes,
      },
    ],
    variants,
    metadata,
  };
}

/**
 * Crea un producto en Medusa usando Admin API
 */
async function createProductInMedusa(productData: any): Promise<boolean> {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (MEDUSA_ADMIN_API_TOKEN) {
      headers.Authorization = `Bearer ${MEDUSA_ADMIN_API_TOKEN}`;
    }

    const response = await fetch(`${MEDUSA_BACKEND_URL}/admin/products`, {
      method: "POST",
      headers,
      body: JSON.stringify(productData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error creating product ${productData.handle}:`, errorText);
      return false;
    }

    return true;
  } catch (error) {
    console.error(`Error creating product ${productData.handle}:`, error);
    return false;
  }
}

/**
 * Script principal
 */
async function main() {
  console.log("🚀 Iniciando migración directa de Supabase a Medusa...\n");

  // Validar variables de entorno
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("❌ Variables de entorno faltantes:");
    console.error("   - SUPABASE_URL");
    console.error("   - SUPABASE_SERVICE_ROLE_KEY");
    console.error("\nConfigúralas en backend/.env");
    process.exit(1);
  }

  // Conectar a Supabase
  console.log("📡 Conectando a Supabase...");
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Obtener productos
  console.log("📦 Obteniendo productos de Supabase...");
  const { data: supabaseProducts, error: supabaseError } = await supabase
    .from("scraped_products")
    .select("*")
    .order("created_at", { ascending: false });

  if (supabaseError) {
    console.error("❌ Error al obtener productos:", supabaseError);
    process.exit(1);
  }

  if (!supabaseProducts || supabaseProducts.length === 0) {
    console.warn("⚠️ No se encontraron productos en Supabase.");
    process.exit(0);
  }

  console.log(`✅ Encontrados ${supabaseProducts.length} productos\n`);

  // Verificar que Medusa esté disponible
  console.log(`🔍 Verificando conexión con Medusa (${MEDUSA_BACKEND_URL})...`);
  try {
    const healthCheck = await fetch(`${MEDUSA_BACKEND_URL}/health`);
    if (!healthCheck.ok) {
      throw new Error(`Medusa no responde correctamente: ${healthCheck.status}`);
    }
    console.log("✅ Medusa está disponible\n");
  } catch (error) {
    console.error("❌ No se puede conectar a Medusa:");
    console.error(`   Asegúrate de que el backend esté corriendo en ${MEDUSA_BACKEND_URL}`);
    console.error(`   Ejecuta: cd backend && npm run dev`);
    process.exit(1);
  }

  // Migrar productos en lotes
  console.log(`🔄 Migrando productos en lotes de ${BATCH_SIZE}...\n`);

  let totalMigrated = 0;
  let totalErrors = 0;
  const errors: Array<{ product: string; error: string }> = [];

  for (let i = 0; i < supabaseProducts.length; i += BATCH_SIZE) {
    const batch = supabaseProducts.slice(i, i + BATCH_SIZE);
    const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(supabaseProducts.length / BATCH_SIZE);

    console.log(`📦 Lote ${batchNumber}/${totalBatches} (${batch.length} productos)...`);

    for (const product of batch) {
      try {
        const medusaProduct = transformToMedusaFormat(product);
        const success = await createProductInMedusa(medusaProduct);

        if (success) {
          totalMigrated++;
          process.stdout.write(".");
        } else {
          totalErrors++;
          errors.push({
            product: product.name || product.id,
            error: "Error al crear en Medusa",
          });
          process.stdout.write("x");
        }
      } catch (error) {
        totalErrors++;
        const errorMessage = error instanceof Error ? error.message : String(error);
        errors.push({
          product: product.name || product.id,
          error: errorMessage,
        });
        process.stdout.write("x");
      }

      // Pequeña pausa para no sobrecargar
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    console.log(` ✅ Lote ${batchNumber} completado`);
  }

  // Resumen
  console.log("\n" + "=".repeat(60));
  console.log("📊 RESUMEN DE MIGRACIÓN");
  console.log("=".repeat(60));
  console.log(`✅ Productos migrados: ${totalMigrated}`);
  console.log(`❌ Errores: ${totalErrors}`);
  console.log(`📦 Total procesado: ${supabaseProducts.length}`);

  if (errors.length > 0) {
    console.log("\n⚠️ Errores detallados (primeros 10):");
    errors.slice(0, 10).forEach((err) => {
      console.log(`   - ${err.product}: ${err.error}`);
    });
    if (errors.length > 10) {
      console.log(`   ... y ${errors.length - 10} errores más`);
    }
  }

  console.log("\n✅ Migración completada!");
  console.log("\n💡 Verifica los productos en:");
  console.log(`   - Admin: ${MEDUSA_BACKEND_URL}/admin/products`);
  console.log(`   - Store API: ${MEDUSA_BACKEND_URL}/store/products`);
}

// Ejecutar
main().catch((error) => {
  console.error("❌ Error fatal:", error);
  process.exit(1);
});
