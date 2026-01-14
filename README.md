# Playeras Fut - E-commerce Headless

E-commerce profesional de playeras de fútbol usando arquitectura HEADLESS con Next.js + Medusa.js.

## 🏗️ Arquitectura

```
playeras-fut/
├── backend/          # Medusa.js Backend
│   ├── src/
│   ├── medusa-config.ts
│   └── package.json
├── app/              # Next.js Frontend (App Router)
│   ├── page.tsx
│   ├── catalogo/
│   ├── producto/
│   └── carrito/
├── components/       # Componentes React
├── lib/              # Utilidades y clientes API
└── types/            # Tipos TypeScript
```

## 🚀 Setup Inicial

> 📖 **Para una guía detallada paso a paso, consulta [SETUP.md](./SETUP.md)**

### Prerrequisitos

- Node.js 18+
- PostgreSQL 14+
- npm o yarn

### Quick Start

1. **Configurar Base de Datos PostgreSQL** (ver SETUP.md)
2. **Configurar Backend**: `cd backend && npm install && npm run migrate`
3. **Configurar Frontend**: `npm install`
4. **Iniciar Backend**: `cd backend && npm run dev`
5. **Iniciar Frontend**: `npm run dev`

### 1. Configurar Backend (Medusa.js)

```bash
cd backend
npm install
```

#### Configurar Base de Datos

1. Crear base de datos PostgreSQL:
```sql
CREATE DATABASE medusa_store;
CREATE USER medusa_user WITH PASSWORD 'tu_password';
GRANT ALL PRIVILEGES ON DATABASE medusa_store TO medusa_user;
```

2. Crear archivo `.env` en `backend/`:
```env
DATABASE_URL=postgres://medusa_user:tu_password@localhost:5432/medusa_store
STORE_CORS=http://localhost:3000
ADMIN_CORS=http://localhost:7001
JWT_SECRET=tu_jwt_secret
COOKIE_SECRET=tu_cookie_secret
PORT=9000
NODE_ENV=development
```

3. Ejecutar migraciones:
```bash
npm run migrate
```

4. Seed de productos (opcional):
```bash
npm run seed
```

5. Iniciar servidor:
```bash
npm run dev
```

El backend estará disponible en `http://localhost:9000`

### 2. Configurar Frontend (Next.js)

```bash
# En la raíz del proyecto
npm install
```

#### Configurar Variables de Entorno

Crear archivo `.env.local`:
```env
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000
```

#### Iniciar Servidor de Desarrollo

```bash
npm run dev
```

El frontend estará disponible en `http://localhost:3000`

## 📦 Estructura del Proyecto

### Backend (Medusa.js)

- **`src/index.ts`**: Punto de entrada del servidor
- **`medusa-config.ts`**: Configuración de Medusa
- **`src/scripts/seed.ts`**: Script para crear productos de ejemplo

### Frontend (Next.js)

- **`app/page.tsx`**: Página principal (Home)
- **`app/catalogo/page.tsx`**: Catálogo de productos
- **`app/producto/[handle]/page.tsx`**: Página de detalle de producto
- **`app/carrito/page.tsx`**: Carrito de compras
- **`lib/medusa.ts`**: Cliente Medusa
- **`lib/products.ts`**: Funciones helper para productos
- **`lib/cart-medusa.ts`**: Funciones para manejo del carrito

## 🎯 Funcionalidades Implementadas (Fase 1A)

✅ Estructura base del proyecto
✅ Backend Medusa.js configurado
✅ Frontend Next.js con App Router
✅ Conexión frontend ↔ backend
✅ Catálogo de productos
✅ Página de detalle de producto
✅ Carrito básico (sin checkout)
✅ Filtros y ordenamiento
✅ Responsive design

## 🔄 Próximas Fases

### Fase 2: Checkout y Pagos
- Proceso de checkout completo
- Integración de pasarelas de pago
- Gestión de órdenes

### Fase 3: Inventario Avanzado
- Gestión de stock
- Variantes de productos
- Categorías y tags

### Fase 4: Admin Avanzado
- Panel de administración personalizado
- Reportes y analytics
- Gestión de usuarios

## 🛠️ Scripts Disponibles

### Backend
- `npm run dev`: Inicia servidor en modo desarrollo
- `npm run build`: Compila el proyecto
- `npm run start`: Inicia servidor en producción
- `npm run migrate`: Ejecuta migraciones de base de datos
- `npm run seed`: Crea productos de ejemplo

### Frontend
- `npm run dev`: Inicia servidor de desarrollo
- `npm run build`: Compila para producción
- `npm run start`: Inicia servidor de producción
- `npm run lint`: Ejecuta el linter

## 📝 Notas de Desarrollo

- El carrito usa la API de Medusa Cart
- Los productos se obtienen desde la API de Medusa
- El frontend está completamente tipado con TypeScript
- Se usa Tailwind CSS para estilos
- Mobile-first approach

## 🔀 Git Workflow

Este proyecto usa **GitHub Flow** para desarrollo colaborativo.

- 📖 **Guía completa**: [GIT_WORKFLOW.md](./GIT_WORKFLOW.md)
- ⚡ **Quick Start**: [QUICK_START_GIT.md](./QUICK_START_GIT.md)
- 🤝 **Contribuir**: [CONTRIBUTING.md](./CONTRIBUTING.md)

### Branches Principales

- `main`: Producción (solo merge desde `develop` o `hotfix/*`)
- `develop`: Desarrollo activo (integración de features)

### Flujo Rápido

```bash
# 1. Actualizar develop
git checkout develop && git pull origin develop

# 2. Crear feature branch
git checkout -b feature/mi-feature

# 3. Trabajar y commitear
git add . && git commit -m "feat: mi cambio"

# 4. Push y crear PR
git push origin feature/mi-feature
# Crear PR en GitHub: feature/mi-feature → develop
```

## 🔒 Seguridad

- Nunca versionar archivos `.env`
- Usar variables de entorno para secrets
- Validar datos en backend
- CORS configurado correctamente

## 📚 Documentación

- [Medusa.js Docs](https://docs.medusajs.com)
- [Next.js Docs](https://nextjs.org/docs)
- [TypeScript Docs](https://www.typescriptlang.org/docs)
