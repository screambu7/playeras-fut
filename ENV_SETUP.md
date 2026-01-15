# Configuración de Variables de Entorno

## Frontend (.env.local)

Crea un archivo `.env.local` en la raíz del proyecto con:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://lvisfrivnxrwflqxgmtj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2aXNmcml2bnhyd2ZscXhnbXRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzMzQwNzEsImV4cCI6MjA4MzkxMDA3MX0.7oTHEBKS5a5s-9LMp8CQZUwc2TgS_6K3pMyubSrFe_A

# URL del backend Medusa (si se usa)
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://192.168.10.198:9000

# Publishable API Key de Medusa v2 (requerida para Store API)
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_REEMPLAZAR
```

### Notas importantes

- **NEXT_PUBLIC_SUPABASE_URL**: URL de tu proyecto Supabase. Se obtiene desde el dashboard de Supabase (Settings > API).
- **NEXT_PUBLIC_SUPABASE_ANON_KEY**: API Key pública (anon) de Supabase. Es segura para usar en el frontend. Se obtiene desde el dashboard de Supabase (Settings > API).
- **NEXT_PUBLIC_MEDUSA_BACKEND_URL**: URL donde corre el backend Medusa. En desarrollo local suele ser `http://localhost:9000`, pero puede ser una IP de red local como `http://192.168.10.198:9000`.
- **NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY**: Publishable API Key creada en el Admin de Medusa. Es **requerida** para usar el Store API en Medusa v2. Obtén esta clave desde el panel de administración de Medusa.

## Backend (backend/.env)

Crea un archivo `.env` en el directorio `backend/` con:

```env
# Database
# Opción 1: Base de datos local
DATABASE_URL=postgres://postgres:postgres@localhost:5432/medusa-db

# Opción 2: Supabase (obtener connection string desde dashboard)
# Settings > Database > Connection string > Connection pooling
# DATABASE_URL=postgresql://postgres:[PASSWORD]@db.lvisfrivnxrwflqxgmtj.supabase.co:5432/postgres

# Supabase Service Role Key (para operaciones del backend)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2aXNmcml2bnhyd2ZscXhnbXRqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODMzNDA3MSwiZXhwIjoyMDgzOTEwMDcxfQ.0ENYvzAPi8cO2x0W2AG3S667lOh-sPir_YPzYEqKgos

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

- **DATABASE_URL**: 
  - Para desarrollo local: ajusta según tu configuración de PostgreSQL (usuario, contraseña, host, puerto, nombre de BD)
  - Para Supabase: obtén el connection string desde el dashboard (Settings > Database > Connection string). Usa "Connection pooling" para aplicaciones.
- **SUPABASE_SERVICE_ROLE_KEY**: Key con permisos completos. **NUNCA** exponer en el frontend. Solo usar en el backend.
- **JWT_SECRET y COOKIE_SECRET**: En producción, usa valores seguros y únicos
- **CORS**: Ajusta las URLs según tus dominios de desarrollo/producción

## Obtener Variables de Supabase

Para obtener las variables actualizadas de Supabase:

1. **URL y API Keys**: Dashboard > Settings > API
2. **Database Connection String**: Dashboard > Settings > Database > Connection string
3. **Service Role Key**: Dashboard > Settings > API > service_role key (⚠️ mantener secreto)

O usando Supabase CLI:
```bash
supabase projects api-keys --project-ref lvisfrivnxrwflqxgmtj
```
