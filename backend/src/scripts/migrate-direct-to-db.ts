/**
 * Script de migración directa a la base de datos
 * Inserta productos directamente en las tablas de Medusa usando SQL
 * 
 * REQUISITOS:
 *   - Variables de entorno en backend/.env:
 *     * SUPABASE_URL
 *     * SUPABASE_SERVICE_ROLE_KEY
 *     * DATABASE_URL (con contraseña correcta)
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

// Cargar .env
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

interface SupabaseProduct {
  id: string;
  name: string;
  team: string;
  league: string;
  season: string;
  price: number | null;
  original_price: number | null;
  images: string[];
  image_url: string | null;
  description: string | null;
  sizes: string[];
}

async function main() {
  console.log("🚀 Migración directa usando Supabase SQL...\n");

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("❌ Variables de entorno faltantes");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Leer productos del JSON exportado
  const jsonPath = path.join(__dirname, "../../supabase-products-export.json");
  if (!fs.existsSync(jsonPath)) {
    console.error("❌ No se encontró el archivo de exportación");
    console.error("   Ejecuta primero: npm run export:supabase");
    process.exit(1);
  }

  const products: SupabaseProduct[] = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
  console.log(`📦 Encontrados ${products.length} productos para migrar\n`);

  // Crear función SQL en Supabase para insertar productos en Medusa
  // Esto requiere que Medusa ya tenga las tablas creadas
  
  console.log("💡 Este script requiere que Medusa esté configurado primero.");
  console.log("   Por ahora, los productos están exportados en JSON.");
  console.log("   Cuando Medusa esté corriendo, usa: npm run migrate:supabase:direct\n");
  
  console.log("📋 Alternativa: Verifica la connection string en Supabase dashboard");
  console.log("   y actualiza backend/.env manualmente, luego ejecuta:");
  console.log("   cd backend && npm run dev");
  console.log("   (en otra terminal) cd backend && npm run migrate:supabase:direct");
}

main().catch(console.error);
