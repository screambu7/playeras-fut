/**
 * Script que espera a que Medusa esté disponible y luego ejecuta la migración
 */

import { execSync } from "child_process";

const MEDUSA_URL = process.env.MEDUSA_BACKEND_URL || "http://localhost:9000";
const MAX_WAIT_TIME = 120000; // 2 minutos
const CHECK_INTERVAL = 3000; // 3 segundos

async function waitForMedusa(): Promise<boolean> {
  console.log(`⏳ Esperando a que Medusa esté disponible en ${MEDUSA_URL}...\n`);
  
  const startTime = Date.now();
  
  while (Date.now() - startTime < MAX_WAIT_TIME) {
    try {
      const response = await fetch(`${MEDUSA_URL}/health`);
      if (response.ok) {
        console.log("✅ Medusa está disponible!\n");
        return true;
      }
    } catch (error) {
      // Medusa aún no está listo
    }
    
    process.stdout.write(".");
    await new Promise(resolve => setTimeout(resolve, CHECK_INTERVAL));
  }
  
  console.log("\n❌ Timeout: Medusa no está disponible después de 2 minutos");
  return false;
}

async function main() {
  const isReady = await waitForMedusa();
  
  if (!isReady) {
    console.log("\n💡 Asegúrate de que el backend esté corriendo:");
    console.log("   cd backend && npm run dev\n");
    process.exit(1);
  }
  
  console.log("🚀 Ejecutando migración...\n");
  
  try {
    execSync("npm run migrate:supabase:direct", {
      stdio: "inherit",
      cwd: process.cwd(),
      env: { ...process.env, MEDUSA_BACKEND_URL: MEDUSA_URL }
    });
  } catch (error) {
    console.error("\n❌ Error durante la migración");
    process.exit(1);
  }
}

main();
