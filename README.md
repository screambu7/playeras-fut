# Playeras Fut - Tienda Online de Playeras de Fútbol

Tienda online especializada en playeras de fútbol oficiales. Proyecto desarrollado con Next.js 14 (App Router), TypeScript y Tailwind CSS.

## 🚀 Fase 1 - Base del Proyecto

Esta fase incluye:
- ✅ Frontend completo con Next.js App Router
- ✅ Catálogo de productos con filtros y ordenamiento
- ✅ Páginas de producto individuales
- ✅ Carrito de compras funcional con persistencia en localStorage
- ✅ Diseño responsive mobile-first
- ✅ Arquitectura escalable preparada para integración de pagos

## 📋 Stack Tecnológico

- **Framework**: Next.js 14 (App Router)
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS
- **Estado**: Zustand
- **Tipografía**: Inter (Google Fonts)

## 🏗️ Estructura del Proyecto

```
/
├── app/                    # Páginas y rutas (App Router)
│   ├── page.tsx           # Home
│   ├── catalogo/          # Catálogo de productos
│   ├── producto/[slug]/   # Página de producto individual
│   └── carrito/           # Carrito de compras
├── components/             # Componentes reutilizables
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── ProductCard.tsx
│   └── ProductGrid.tsx
├── data/                  # Mock data
│   └── products.ts
├── lib/                   # Lógica de negocio
│   ├── cart.ts           # Funciones del carrito
│   └── store.ts          # Store de Zustand
├── types/                 # Tipos TypeScript
│   └── index.ts
└── styles/                # Estilos globales
    └── globals.css
```

## 🛠️ Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Ejecutar en modo desarrollo:
```bash
npm run dev
```

3. Abrir en el navegador:
```
http://localhost:3000
```

## 📦 Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run start` - Inicia el servidor de producción
- `npm run lint` - Ejecuta el linter

## 🎯 Funcionalidades Implementadas

### Home
- Hero section con call-to-action
- Sección de productos más vendidos
- Sección de características/beneficios

### Catálogo
- Listado de todos los productos
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
- Información detallada del producto
- Selección de talla
- Selector de cantidad
- Botón para agregar al carrito
- Breadcrumbs de navegación

### Carrito
- Visualización de productos agregados
- Modificar cantidad
- Eliminar productos
- Cálculo de subtotal
- Persistencia en localStorage
- Resumen del pedido

## 🔄 Próximas Fases

### Fase 2 (Pendiente)
- Integración de pasarela de pagos
- Proceso de checkout completo
- Gestión de órdenes

### Fase 3 (Pendiente)
- Backend API real
- Base de datos
- Panel de administración
- Autenticación de usuarios

## 🏛️ Arquitectura

El proyecto sigue principios de arquitectura limpia:

- **Separación de Responsabilidades**: Cada módulo tiene una responsabilidad clara
- **Componentes Reutilizables**: Componentes UI independientes y reutilizables
- **Lógica de Negocio Separada**: Funciones de negocio en `/lib`
- **Tipado Fuerte**: TypeScript en todo el proyecto
- **Escalabilidad**: Estructura preparada para crecer

## 📝 Notas

- Las imágenes de productos son placeholders (emojis). En producción se reemplazarán con imágenes reales.
- El carrito persiste en `localStorage` del navegador.
- Los datos de productos están en mock data (`/data/products.ts`).
- El botón "Continuar Compra" está deshabilitado hasta la Fase 2.

## 📄 Licencia

Este proyecto es privado y de uso interno.
