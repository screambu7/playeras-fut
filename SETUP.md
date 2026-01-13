# 🚀 Guía de Setup Rápido

## Paso 1: Base de Datos PostgreSQL

```bash
# Crear base de datos
createdb medusa-db

# O usando psql:
psql -U postgres
CREATE DATABASE medusa-db;
\q
```

## Paso 2: Backend Medusa

```bash
cd backend

# Instalar dependencias
npm install

# Configurar variables de entorno
# Copia el contenido de ENV_SETUP.md a backend/.env
# Ajusta DATABASE_URL según tu configuración

# Ejecutar migraciones
npx medusa migrations run

# Seed de datos base (regiones, sales channels, etc.)
npm run seed

# Seed de playeras de fútbol
npm run seed:jerseys

# Iniciar servidor (en otra terminal)
npm run dev
```

El backend estará en:
- API: http://localhost:9000
- Admin: http://localhost:7001

## Paso 3: Frontend Next.js

```bash
# Desde la raíz del proyecto

# Instalar dependencias
npm install

# Configurar variables de entorno
# Crea .env.local con:
# NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000

# Iniciar servidor
npm run dev
```

El frontend estará en: http://localhost:3000

## ✅ Verificación

1. Backend corriendo → http://localhost:9000/health
2. Admin corriendo → http://localhost:7001
3. Frontend corriendo → http://localhost:3000
4. Productos visibles en catálogo
5. Puedes agregar productos al carrito

## 🔧 Troubleshooting

### Error de conexión a PostgreSQL
- Verifica que PostgreSQL esté corriendo
- Verifica las credenciales en `backend/.env`
- Verifica que la base de datos exista

### Error de CORS
- Verifica que `STORE_CORS` en `backend/.env` apunte a `http://localhost:3000`
- Verifica que `NEXT_PUBLIC_MEDUSA_BACKEND_URL` en `.env.local` apunte a `http://localhost:9000`

### No se ven productos
- Ejecuta `npm run seed:jerseys` en el directorio backend
- Verifica que los productos estén publicados en Medusa Admin
