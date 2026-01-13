# 🚀 Guía de Setup - Playeras Fut

Guía paso a paso para configurar el proyecto completo.

## 📋 Prerrequisitos

- **Node.js** 18+ ([Descargar](https://nodejs.org/))
- **PostgreSQL** 14+ ([Descargar](https://www.postgresql.org/download/))
- **npm** o **yarn**

## 🔧 Paso 1: Configurar Base de Datos PostgreSQL

1. Inicia PostgreSQL en tu sistema.

2. Abre una terminal y conecta a PostgreSQL:
```bash
psql -U postgres
```

3. Ejecuta los siguientes comandos SQL:
```sql
CREATE DATABASE medusa_store;
CREATE USER medusa_user WITH PASSWORD 'medusa_password';
ALTER ROLE medusa_user SET client_encoding TO 'utf8';
ALTER ROLE medusa_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE medusa_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE medusa_store TO medusa_user;
\q
```

## 🔧 Paso 2: Configurar Backend (Medusa.js)

1. Navega al directorio backend:
```bash
cd backend
```

2. Instala las dependencias:
```bash
npm install
```

3. Crea el archivo `.env` en `backend/`:
```bash
cp .env.example .env
```

4. Edita `backend/.env` con tus credenciales:
```env
DATABASE_URL=postgres://medusa_user:medusa_password@localhost:5432/medusa_store
STORE_CORS=http://localhost:3000
ADMIN_CORS=http://localhost:7001
JWT_SECRET=tu_jwt_secret_super_seguro_aqui
COOKIE_SECRET=tu_cookie_secret_super_seguro_aqui
PORT=9000
NODE_ENV=development
```

5. Ejecuta las migraciones:
```bash
npm run migrate
```

6. (Opcional) Ejecuta el seed para crear productos de ejemplo:
```bash
npm run seed
```

7. Inicia el servidor de desarrollo:
```bash
npm run dev
```

El backend estará disponible en:
- **Store API**: http://localhost:9000/store
- **Admin API**: http://localhost:9000/admin
- **Admin UI**: http://localhost:7001 (si instalas Medusa Admin)

## 🔧 Paso 3: Configurar Frontend (Next.js)

1. En la raíz del proyecto, instala las dependencias:
```bash
npm install
```

2. Crea el archivo `.env.local` en la raíz:
```env
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000
```

3. Inicia el servidor de desarrollo:
```bash
npm run dev
```

El frontend estará disponible en: **http://localhost:3000**

## ✅ Verificación

1. **Backend funcionando**: Visita http://localhost:9000/store/products
   - Deberías ver una respuesta JSON (puede estar vacía si no hay productos)

2. **Frontend funcionando**: Visita http://localhost:3000
   - Deberías ver la página principal

3. **Catálogo**: Visita http://localhost:3000/catalogo
   - Deberías ver el catálogo (vacío si no hay productos)

## 📦 Crear Productos de Ejemplo

### Opción 1: Usando Medusa Admin (Recomendado)

1. Instala Medusa Admin:
```bash
cd admin
npx create-medusa-app@latest admin
```

2. Accede a http://localhost:7001
3. Crea productos manualmente desde la interfaz

### Opción 2: Usando el Script de Seed

Si tienes un script de seed configurado:
```bash
cd backend
npm run seed
```

### Opción 3: Usando la API directamente

Puedes usar herramientas como Postman o curl para crear productos:

```bash
curl -X POST http://localhost:9000/admin/products \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Real Madrid Home 2024/25",
    "handle": "real-madrid-2024-home",
    "description": "Camiseta oficial del Real Madrid",
    "metadata": {
      "team": "Real Madrid",
      "league": "La Liga",
      "season": "2024/25"
    }
  }'
```

## 🐛 Solución de Problemas

### Error: "Cannot connect to database"
- Verifica que PostgreSQL esté corriendo
- Revisa las credenciales en `backend/.env`
- Asegúrate de que la base de datos `medusa_store` existe

### Error: "CORS policy"
- Verifica que `STORE_CORS` en `backend/.env` apunte a `http://localhost:3000`
- Reinicia el servidor backend después de cambiar `.env`

### Error: "Module not found"
- Ejecuta `npm install` en ambos directorios (raíz y backend)
- Verifica que todas las dependencias estén instaladas

### Frontend no muestra productos
- Verifica que el backend esté corriendo en http://localhost:9000
- Revisa la consola del navegador para errores
- Verifica que `NEXT_PUBLIC_MEDUSA_BACKEND_URL` esté configurado correctamente

## 📚 Recursos Adicionales

- [Documentación de Medusa.js](https://docs.medusajs.com)
- [Documentación de Next.js](https://nextjs.org/docs)
- [Documentación de PostgreSQL](https://www.postgresql.org/docs/)

## 🎯 Próximos Pasos

Una vez que todo esté funcionando:

1. ✅ Verifica que puedes ver productos en el catálogo
2. ✅ Prueba agregar productos al carrito
3. ✅ Navega entre las diferentes páginas
4. 🔄 Continúa con la Fase 2: Checkout y Pagos
