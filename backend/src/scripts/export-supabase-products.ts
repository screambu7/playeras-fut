/**
 * Script para exportar productos de Supabase a JSON
 * 
 * Este script exporta todos los productos de Supabase a un archivo JSON
 * que luego puede ser importado a Medusa cuando esté listo.
 * 
 * USO:
 *   npm run export:supabase
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

// Cargar variables de entorno
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

loadEnvFile();

async function main() {
  console.log("🚀 Exportando productos de Supabase a JSON...\n");

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("❌ Variables de entorno faltantes");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  console.log("📦 Obteniendo productos...");
  const { data: products, error } = await supabase
    .from("scraped_products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }

  if (!products || products.length === 0) {
    console.warn("⚠️ No se encontraron productos");
    process.exit(0);
  }

  const outputPath = path.join(__dirname, "../../supabase-products-export.json");
  fs.writeFileSync(outputPath, JSON.stringify(products, null, 2));

  console.log(`✅ Exportados ${products.length} productos a:`);
  console.log(`   ${outputPath}\n`);
  console.log("💡 Ahora puedes importarlos a Medusa cuando esté listo con:");
  console.log("   npm run import:supabase");
}

main().catch(console.error);
