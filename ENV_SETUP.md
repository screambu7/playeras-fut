# Configuración de Variables de Entorno

## Frontend (.env.local)

Crea un archivo `.env.local` en la raíz del proyecto con:

```env
# URL del backend Medusa
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://192.168.10.198:9000

# Publishable API Key de Medusa v2 (requerida para Store API)
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_REEMPLAZAR
```

### Notas importantes

- **NEXT_PUBLIC_MEDUSA_BACKEND_URL**: URL donde corre el backend Medusa. En desarrollo local suele ser `http://localhost:9000`, pero puede ser una IP de red local como `http://192.168.10.198:9000`.
- **NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY**: Publishable API Key creada en el Admin de Medusa. Es **requerida** para usar el Store API en Medusa v2. Obtén esta clave desde el panel de administración de Medusa.

## Backend (backend/.env)

Crea un archivo `.env` en el directorio `backend/` con:

```env
# Database
DATABASE_URL=postgres://postgres:postgres@localhost:5432/medusa-db

# JWT Secret (cambiar en producción)
JWT_SECRET=supersecret
COOKIE_SECRET=supersecret

# CORS Configuration
STORE_CORS=http://localhost:3000
ADMIN_CORS=http://localhost:7001
AUTH_CORS=http://localhost:3000

# Medusa Admin
MEDUSA_ADMIN_ONBOARDING_TYPE=default
MEDUSA_ADMIN_ONBOARDING_NEXTJS_DIRECTORY=../admin
```

### Notas

- **DATABASE_URL**: Ajusta según tu configuración de PostgreSQL (usuario, contraseña, host, puerto, nombre de BD)
- **JWT_SECRET y COOKIE_SECRET**: En producción, usa valores seguros y únicos
- **CORS**: Ajusta las URLs según tus dominios de desarrollo/producción
