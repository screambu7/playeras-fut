/**
 * Configuración de Medusa.js
 * Este archivo debe estar en formato CommonJS para compatibilidad
 */

module.exports = {
  projectConfig: {
    database_url: process.env.DATABASE_URL || "postgres://localhost/medusa_store",
    database_type: "postgres",
    store_cors: process.env.STORE_CORS || "http://localhost:3000",
    admin_cors: process.env.ADMIN_CORS || "http://localhost:7001",
    redis_url: process.env.REDIS_URL,
    jwt_secret: process.env.JWT_SECRET || "supersecret",
    cookie_secret: process.env.COOKIE_SECRET || "supersecret",
  },
  plugins: [],
};
