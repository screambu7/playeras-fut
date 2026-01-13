/**
 * Punto de entrada del servidor Medusa
 * Usa CommonJS para compatibilidad con Medusa CLI
 */

const express = require("express");
const { load } = require("@medusajs/medusa");

const PORT = process.env.PORT || 9000;

async function bootstrap() {
  const app = express();

  try {
    const { app: medusaApp } = await load({
      directory: process.cwd(),
    });

    app.use("/", medusaApp);

    app.listen(PORT, () => {
      console.log(`🚀 Medusa server is running on http://localhost:${PORT}`);
      console.log(`📦 Store API: http://localhost:${PORT}/store`);
      console.log(`🔧 Admin API: http://localhost:${PORT}/admin`);
    });
  } catch (error) {
    console.error("Error starting Medusa server:", error);
    process.exit(1);
  }
}

bootstrap();
