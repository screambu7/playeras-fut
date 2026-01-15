# 🔄 Guía de Migración: Supabase → Medusa

Esta guía documenta el proceso para migrar todos los productos de Supabase a Medusa.

## 📋 Prerrequisitos

1. **Backend de Medusa configurado y corriendo**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

2. **Base de datos de Medusa inicializada**
   ```bash
   cd backend
   npm run seed  # Si es la primera vez
   ```

3. **Variables de entorno configuradas en `backend/.env`**:
   ```env
   # Base de datos de Medusa
   DATABASE_URL=postgres://user:password@localhost:5432/medusa_store

   # Supabase (para leer datos)
   SUPABASE_URL=https://tu-proyecto.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
   ```

   > ⚠️ **IMPORTANTE**: Usa `SUPABASE_SERVICE_ROLE_KEY` (no la anon key) para tener acceso completo a los datos.

## 🚀 Proceso de Migración

### Paso 1: Instalar dependencias

El script requiere `@supabase/supabase-js` en el backend:

```bash
cd backend
npm install @supabase/supabase-js
```

### Paso 2: Ejecutar el script de migración

```bash
cd backend
npm run migrate:supabase
```

El script:
- ✅ Lee todos los productos de la tabla `scraped_products` en Supabase
- ✅ Los transforma al formato de Medusa
- ✅ Los crea en Medusa usando workflows oficiales
- ✅ Crea niveles de inventario automáticamente
- ✅ Procesa en lotes de 50 productos para evitar sobrecarga
- ✅ Muestra progreso y errores detallados

### Paso 3: Verificar la migración

1. **Verificar en el Admin de Medusa** (si está instalado):
   - Navega a `http://localhost:7001`
   - Ve a Products
   - Deberías ver todos los productos migrados

2. **Verificar desde la API**:
   ```bash
   curl http://localhost:9000/store/products
   ```

3. **Verificar en el frontend**:
   - Inicia el frontend: `npm run dev`
   - Navega a `/catalogo`
   - Los productos deberían aparecer

## 📊 Qué se migra

### Datos migrados:

- ✅ **Información básica**: nombre, descripción, precio
- ✅ **Imágenes**: todas las URLs de imágenes
- ✅ **Variantes**: una variante por cada talla disponible
- ✅ **Metadata**: team, league, season, genero, version, featured, bestSeller
- ✅ **Inventario**: cantidad por defecto (100 unidades)

### Transformaciones aplicadas:

1. **Handle**: Generado desde el nombre + ID único
2. **Precios**: Convertidos a centavos (EUR y USD)
3. **Tallas**: Si no hay tallas, se crea una variante "M" por defecto
4. **Género y Versión**: Extraídos automáticamente del nombre/descripción
5. **Categoría**: Todos los productos se asignan a "Football Jerseys"

## 🔧 Configuración del Frontend

Después de la migración, el frontend ya está configurado para usar Medusa:

- ✅ `lib/products.ts` ahora usa `medusa.products.list()` en lugar de Supabase
- ✅ `lib/cart-medusa.ts` maneja el carrito con Medusa
- ✅ Los tipos están actualizados (`MedusaProductAdapted`)

### Variables de entorno del frontend (`.env.local`):

```env
# Medusa (requerido)
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=tu_publishable_key

# Supabase (opcional, solo si aún necesitas otros datos)
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## ⚠️ Consideraciones Importantes

### 1. **Idempotencia**

El script puede ejecutarse múltiples veces, pero:
- Si un producto con el mismo handle ya existe, Medusa puede rechazarlo
- Revisa los logs para ver productos que no se pudieron crear

### 2. **Rendimiento**

- El script procesa en lotes de 50 productos
- Para muchos productos (>1000), puede tardar varios minutos
- Los errores se registran pero no detienen el proceso

### 3. **Inventario**

- Todos los productos reciben 100 unidades de inventario por defecto
- Ajusta `DEFAULT_INVENTORY_QUANTITY` en el script si necesitas otro valor

### 4. **Metadata**

- Los campos `genero` y `version` se extraen automáticamente del nombre/descripción
- Si necesitas ajustar la lógica, modifica las funciones `extractGenero()` y `extractVersion()`

## 🔄 Rollback (si es necesario)

Si necesitas revertir la migración:

1. **Eliminar productos de Medusa** (manual o script):
   ```sql
   -- ⚠️ CUIDADO: Esto elimina TODOS los productos
   DELETE FROM product_variant;
   DELETE FROM product;
   ```

2. **Los datos en Supabase NO se modifican** - están intactos

3. **El frontend puede volver a Supabase** temporalmente:
   - Restaura `lib/products.ts` desde git
   - O crea un flag de feature para alternar entre fuentes

## 📝 Logs y Debugging

El script muestra:
- ✅ Progreso por lotes
- ✅ Total de productos migrados
- ✅ Errores detallados (primeros 10)
- ✅ Resumen final

Para más detalles, revisa los logs del backend de Medusa.

## 🐛 Solución de Problemas

### Error: "Missing Supabase environment variables"
- Verifica que `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` estén en `backend/.env`

### Error: "Shipping profile not found"
- Ejecuta `npm run seed` primero para crear el shipping profile

### Error: "Sales Channel not found"
- El script intenta crear uno automáticamente, pero si falla, ejecuta `npm run seed`

### Productos no aparecen en el frontend
- Verifica que `NEXT_PUBLIC_MEDUSA_BACKEND_URL` esté correcto
- Verifica que el backend esté corriendo
- Revisa la consola del navegador para errores

### Algunos productos no se migraron
- Revisa los logs del script para ver errores específicos
- Algunos productos pueden tener datos inválidos (precios null, imágenes vacías, etc.)
- El script continúa aunque algunos productos fallen

## ✅ Checklist Post-Migración

- [ ] Todos los productos aparecen en `/catalogo`
- [ ] Los productos tienen imágenes correctas
- [ ] Los precios son correctos
- [ ] Las tallas están disponibles
- [ ] El carrito funciona correctamente
- [ ] Los filtros funcionan (liga, equipo, etc.)
- [ ] La búsqueda funciona
- [ ] Los productos destacados/más vendidos aparecen

## 📚 Referencias

- [Documentación de Medusa](https://docs.medusajs.com)
- [Medusa Store API](https://docs.medusajs.com/api/store)
- [Script de migración](./backend/src/scripts/migrate-supabase-to-medusa.ts)
