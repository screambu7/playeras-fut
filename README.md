# Playeras Fut - Tienda Online de Playeras de Fútbol

Tienda online especializada en playeras de fútbol oficiales. Proyecto desarrollado con arquitectura HEADLESS usando **Next.js 14** (App Router) como frontend y **Medusa.js** como backend e-commerce.

## 🚀 Fase 1A - Setup Base (HEADLESS)

Esta fase incluye:
- ✅ Backend Medusa.js configurado con PostgreSQL
- ✅ Frontend Next.js conectado a API de Medusa
- ✅ Productos de ejemplo (playeras de fútbol) con variantes por talla
- ✅ Catálogo de productos funcional
- ✅ Páginas de producto individuales
- ✅ Carrito de compras básico
- ✅ Diseño responsive mobile-first
- ✅ Arquitectura escalable preparada para integración de pagos

## 📋 Stack Tecnológico

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS
- **Estado**: Zustand (carrito local)
- **API Client**: @medusajs/js-sdk
- **Tipografía**: Inter (Google Fonts)

### Backend
- **E-commerce**: Medusa.js 2.12.5
- **Base de Datos**: PostgreSQL
- **Admin**: Medusa Admin (http://localhost:7001)

## 🏗️ Estructura del Proyecto

```
/
├── app/                    # Páginas Next.js (App Router)
│   ├── page.tsx           # Home
│   ├── catalogo/          # Catálogo de productos
│   ├── producto/[slug]/   # Página de producto individual
│   └── carrito/           # Carrito de compras
├── components/             # Componentes reutilizables
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── ProductCard.tsx
│   └── ProductGrid.tsx
├── lib/                    # Lógica de negocio
│   ├── medusa.ts          # Cliente Medusa y funciones API
│   ├── cart.ts            # Funciones del carrito
│   └── store.ts           # Store de Zustand
├── types/                  # Tipos TypeScript
│   ├── index.ts           # Tipos del frontend
│   └── medusa.ts          # Adaptadores de tipos Medusa
├── backend/                # Backend Medusa.js
│   ├── src/
│   │   ├── scripts/
│   │   │   ├── seed.ts                    # Seed base de Medusa
│   │   │   └── seed-football-jerseys.ts  # Seed de playeras
│   │   └── ...
│   ├── medusa-config.ts
│   └── package.json
└── admin/                  # Medusa Admin (se inicializa automáticamente)
```

## 🛠️ Instalación y Setup

### Prerrequisitos

- Node.js 20+
- PostgreSQL 14+
- npm o yarn

### 1. Configurar Base de Datos

Crea una base de datos PostgreSQL:

```bash
createdb medusa-db
```

O usando psql:

```sql
CREATE DATABASE medusa-db;
```

### 2. Configurar Backend (Medusa)

```bash
cd backend

# Instalar dependencias
npm install

# Crear archivo .env
cp .env.example .env
# Editar .env con tus credenciales de PostgreSQL:
# DATABASE_URL=postgres://postgres:postgres@localhost:5432/medusa-db
# STORE_CORS=http://localhost:3000
# ADMIN_CORS=http://localhost:7001
# AUTH_CORS=http://localhost:3000

# Ejecutar migraciones
npx medusa migrations run

# Seed de datos base (regiones, sales channels, etc.)
npm run seed

# Seed de playeras de fútbol
npx medusa exec ./src/scripts/seed-football-jerseys.ts

# Iniciar servidor de desarrollo
npm run dev
```

El backend estará disponible en:
- **API Store**: http://localhost:9000
- **Admin**: http://localhost:7001

### 3. Configurar Frontend (Next.js)

```bash
# Desde la raíz del proyecto

# Instalar dependencias
npm install

# Crear archivo .env.local
echo "NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000" > .env.local

# Iniciar servidor de desarrollo
npm run dev
```

El frontend estará disponible en: http://localhost:3000

## 📦 Scripts Disponibles

### Frontend
- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run start` - Inicia el servidor de producción
- `npm run lint` - Ejecuta el linter

### Backend
- `npm run dev` - Inicia Medusa en modo desarrollo
- `npm run build` - Construye Medusa para producción
- `npm run start` - Inicia Medusa en producción
- `npm run seed` - Ejecuta el seed base
- `npx medusa exec ./src/scripts/seed-football-jerseys.ts` - Seed de playeras

## 🎯 Funcionalidades Implementadas

### Home
- Hero section con call-to-action
- Sección de productos más vendidos (desde Medusa)
- Sección de características/beneficios

### Catálogo
- Listado de todos los productos desde Medusa API
- Filtros por:
  - Liga
  - Equipo
  - Rango de precio
- Ordenamiento:
  - Más populares
  - Precio (ascendente/descendente)
  - Nombre (A-Z / Z-A)
- Diseño responsive con grid adaptativo

### Página de Producto
- Información detallada del producto desde Medusa
- Selección de talla (variantes de Medusa)
- Selector de cantidad
- Botón para agregar al carrito (integración con Medusa Cart)
- Breadcrumbs de navegación

### Carrito
- Visualización de productos agregados
- Modificar cantidad
- Eliminar productos
- Cálculo de subtotal
- Persistencia en localStorage (ID del carrito de Medusa)
- Resumen del pedido

## 🔄 Próximas Fases

### Fase 2 (Pendiente)
- Integración completa del carrito con Medusa
- Proceso de checkout completo
- Integración de pasarela de pagos
- Gestión de órdenes

### Fase 3 (Pendiente)
- Autenticación de usuarios
- Panel de administración avanzado
- Gestión de inventario
- Sistema de reviews

## 🏛️ Arquitectura

El proyecto sigue principios de arquitectura limpia y HEADLESS:

- **Separación Frontend/Backend**: Frontend Next.js consume API REST de Medusa
- **Separación de Responsabilidades**: Cada módulo tiene una responsabilidad clara
- **Componentes Reutilizables**: Componentes UI independientes y reutilizables
- **Lógica de Negocio Separada**: Funciones de negocio en `/lib`
- **Tipado Fuerte**: TypeScript en todo el proyecto
- **Escalabilidad**: Estructura preparada para crecer

## 📝 Notas Importantes

- **Variables de Entorno**: 
  - Backend: `backend/.env` (no versionado)
  - Frontend: `.env.local` (no versionado)
- **CORS**: Configurado para permitir conexión entre frontend (3000) y backend (9000)
- **Carrito**: Actualmente usa store local de Zustand, preparado para migración completa a Medusa Cart
- **Productos**: Se crean mediante scripts de seed con metadata (equipo, liga, temporada)
- **Imágenes**: Actualmente usando placeholders. En producción se usarán URLs reales o almacenamiento S3

## 🔒 Seguridad

- Nunca versionar archivos `.env` o `.env.local`
- JWT_SECRET y COOKIE_SECRET deben ser únicos en producción
- CORS configurado solo para dominios permitidos

## 📄 Licencia

Este proyecto es privado y de uso interno.
