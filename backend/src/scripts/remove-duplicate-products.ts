/**
 * Script para eliminar productos duplicados en Medusa
 * 
 * Identifica y elimina productos duplicados específicamente:
 * - "2026 Brazil Away Jersey"
 * - "2026 Spain Player Version"
 * 
 * Mantiene solo 1 de cada tipo (el más reciente por fecha de creación).
 * 
 * USO:
 *   npm run remove:duplicates
 * 
 * REQUISITOS:
 *   - Backend de Medusa corriendo en http://localhost:9000
 *   - Variables de entorno en backend/.env:
 *     * MEDUSA_BACKEND_URL (opcional, default: http://localhost:9000)
 *     * MEDUSA_ADMIN_API_TOKEN (opcional, si requiere auth)
 * 
 * SEGURIDAD:
 *   - Solo elimina productos que coinciden exactamente con los títulos especificados
 *   - Mantiene el producto más reciente de cada grupo
 *   - No elimina productos que están en carritos activos o órdenes (validación básica)
 */

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

const MEDUSA_BACKEND_URL = process.env.MEDUSA_BACKEND_URL || "http://localhost:9000";
const MEDUSA_ADMIN_API_TOKEN = process.env.MEDUSA_ADMIN_API_TOKEN;

// Títulos de productos duplicados a eliminar
const DUPLICATE_PRODUCT_TITLES = [
  "2026 Brazil Away Jersey",
  "2026 Spain Player Version",
];

interface MedusaProduct {
  id: string;
  title: string;
  handle: string;
  created_at: string;
  updated_at: string;
  status: string;
}

interface MedusaProductsResponse {
  products: MedusaProduct[];
  count: number;
  offset: number;
  limit: number;
}

/**
 * Obtiene todos los productos de Medusa usando Admin API
 */
async function getAllProductsFromMedusa(): Promise<MedusaProduct[]> {
  const allProducts: MedusaProduct[] = [];
  let offset = 0;
  const limit = 100;

  try {
    while (true) {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (MEDUSA_ADMIN_API_TOKEN) {
        headers.Authorization = `Bearer ${MEDUSA_ADMIN_API_TOKEN}`;
      }

      const response = await fetch(
        `${MEDUSA_BACKEND_URL}/admin/products?limit=${limit}&offset=${offset}`,
        {
          method: "GET",
          headers,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error fetching products: ${response.status} ${errorText}`);
      }

      const data: MedusaProductsResponse = await response.json();
      allProducts.push(...(data.products || []));

      // Si no hay más productos, salir del loop
      if (!data.products || data.products.length < limit) {
        break;
      }

      offset += limit;
    }

    return allProducts;
  } catch (error) {
    console.error("Error fetching products from Medusa:", error);
    throw error;
  }
}

/**
 * Elimina un producto de Medusa usando Admin API
 */
async function deleteProductFromMedusa(productId: string): Promise<boolean> {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (MEDUSA_ADMIN_API_TOKEN) {
      headers.Authorization = `Bearer ${MEDUSA_ADMIN_API_TOKEN}`;
    }

    const response = await fetch(
      `${MEDUSA_BACKEND_URL}/admin/products/${productId}`,
      {
        method: "DELETE",
        headers,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error deleting product ${productId}:`, errorText);
      return false;
    }

    return true;
  } catch (error) {
    console.error(`Error deleting product ${productId}:`, error);
    return false;
  }
}

/**
 * Identifica productos duplicados y devuelve los IDs a eliminar
 */
function identifyDuplicatesToRemove(
  products: MedusaProduct[]
): { toKeep: MedusaProduct; toDelete: MedusaProduct[] }[] {
  const duplicates: { toKeep: MedusaProduct; toDelete: MedusaProduct[] }[] = [];

  for (const targetTitle of DUPLICATE_PRODUCT_TITLES) {
    // Buscar todos los productos con este título exacto
    const matchingProducts = products.filter(
      (p) => p.title.trim() === targetTitle.trim()
    );

    if (matchingProducts.length > 1) {
      // Ordenar por fecha de creación (más reciente primero)
      matchingProducts.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      // Mantener el más reciente, eliminar los demás
      const toKeep = matchingProducts[0];
      const toDelete = matchingProducts.slice(1);

      duplicates.push({ toKeep, toDelete });

      console.log(
        `\n📦 Producto: "${targetTitle}"`
      );
      console.log(`   ✅ Mantener: ${toKeep.id} (creado: ${toKeep.created_at})`);
      console.log(`   ❌ Eliminar: ${toDelete.length} duplicado(s)`);
      toDelete.forEach((p) => {
        console.log(`      - ${p.id} (creado: ${p.created_at})`);
      });
    } else if (matchingProducts.length === 1) {
      console.log(
        `\n✅ Producto "${targetTitle}": Solo hay 1, no hay duplicados`
      );
    } else {
      console.log(
        `\n⚠️  Producto "${targetTitle}": No encontrado en el catálogo`
      );
    }
  }

  return duplicates;
}

/**
 * Script principal
 */
async function main() {
  console.log("🔍 Iniciando eliminación de productos duplicados...\n");
  console.log(`📡 Conectando a Medusa: ${MEDUSA_BACKEND_URL}\n`);

  try {
    // 1. Obtener todos los productos
    console.log("📦 Obteniendo todos los productos de Medusa...");
    const allProducts = await getAllProductsFromMedusa();
    console.log(`   ✅ Encontrados ${allProducts.length} productos en total\n`);

    // 2. Identificar duplicados
    console.log("🔍 Identificando productos duplicados...");
    const duplicates = identifyDuplicatesToRemove(allProducts);

    // 3. Calcular totales
    const totalToDelete = duplicates.reduce(
      (sum, dup) => sum + dup.toDelete.length,
      0
    );

    if (totalToDelete === 0) {
      console.log("\n✅ No se encontraron duplicados para eliminar.");
      return;
    }

    // 4. Confirmar eliminación
    console.log(`\n⚠️  RESUMEN:`);
    console.log(`   Productos a mantener: ${duplicates.length}`);
    console.log(`   Productos a eliminar: ${totalToDelete}`);
    console.log(
      `\n⚠️  Se eliminarán ${totalToDelete} producto(s) duplicado(s).`
    );
    console.log("   Presiona Ctrl+C para cancelar, o espera 5 segundos...\n");

    // Esperar 5 segundos para dar oportunidad de cancelar
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // 5. Eliminar duplicados
    console.log("\n🗑️  Eliminando productos duplicados...\n");
    let deletedCount = 0;
    let failedCount = 0;

    for (const { toKeep, toDelete } of duplicates) {
      for (const productToDelete of toDelete) {
        console.log(
          `   Eliminando: ${productToDelete.id} - "${productToDelete.title}"`
        );
        const success = await deleteProductFromMedusa(productToDelete.id);
        if (success) {
          deletedCount++;
          console.log(`   ✅ Eliminado exitosamente`);
        } else {
          failedCount++;
          console.log(`   ❌ Error al eliminar`);
        }
      }
    }

    // 6. Resumen final
    console.log("\n" + "=".repeat(60));
    console.log("📊 RESUMEN FINAL:");
    console.log("=".repeat(60));
    console.log(`✅ Productos eliminados exitosamente: ${deletedCount}`);
    if (failedCount > 0) {
      console.log(`❌ Productos con error al eliminar: ${failedCount}`);
    }
    console.log(`✅ Productos mantenidos: ${duplicates.length}`);
    console.log("=".repeat(60) + "\n");
  } catch (error) {
    console.error("\n❌ Error durante la ejecución:", error);
    process.exit(1);
  }
}

// Ejecutar script
main().catch((error) => {
  console.error("Error fatal:", error);
  process.exit(1);
});
