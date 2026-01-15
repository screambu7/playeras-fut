/**
 * Script para probar diferentes formatos de connection string
 */

import * as fs from "fs";
import * as path from "path";

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

const password = "Playerasfut718@";
const projectRef = "lvisfrivnxrwflqxgmtj";

const connectionStrings = [
  // Formato pooler con URL encoding
  `postgresql://postgres.${projectRef}:${encodeURIComponent(password)}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`,
  // Formato pooler sin encoding
  `postgresql://postgres.${projectRef}:${password}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`,
  // Formato directo con encoding
  `postgresql://postgres.${projectRef}:${encodeURIComponent(password)}@db.${projectRef}.supabase.co:5432/postgres`,
  // Formato directo sin encoding
  `postgresql://postgres.${projectRef}:${password}@db.${projectRef}.supabase.co:5432/postgres`,
];

async function testConnection(connectionString: string, index: number): Promise<boolean> {
  try {
    const { Client } = require("pg");
    const client = new Client({ connectionString });
    
    await Promise.race([
      client.connect(),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 5000))
    ]);
    
    await client.query("SELECT 1");
    await client.end();
    
    console.log(`✅ Formato ${index + 1} funciona!`);
    return true;
  } catch (error: any) {
    console.log(`❌ Formato ${index + 1} falló: ${error.message.substring(0, 50)}`);
    return false;
  }
}

async function main() {
  console.log("🔍 Probando diferentes formatos de connection string...\n");
  
  for (let i = 0; i < connectionStrings.length; i++) {
    const works = await testConnection(connectionStrings[i], i);
    if (works) {
      console.log(`\n✅ Formato que funciona:`);
      console.log(connectionStrings[i].replace(/:[^@]*@/, ":****@"));
      
      // Actualizar .env
      const envPath = path.join(__dirname, "../../.env");
      let envContent = fs.readFileSync(envPath, "utf-8");
      envContent = envContent.replace(
        /DATABASE_URL=.*/,
        `DATABASE_URL=${connectionStrings[i]}`
      );
      fs.writeFileSync(envPath, envContent);
      console.log("\n✅ .env actualizado!");
      return;
    }
  }
  
  console.log("\n❌ Ningún formato funcionó. Verifica la contraseña y la connection string en Supabase dashboard.");
}

main().catch(console.error);
