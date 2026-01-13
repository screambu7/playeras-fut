# 🔀 Git Workflow - Playeras Fut

Guía de flujo de trabajo con Git para desarrollo colaborativo.

## 📋 Estrategia: GitHub Flow

Usamos **GitHub Flow** (simplificado) - ideal para equipos pequeños y desarrollo ágil.

### Estructura de Branches

```
main (producción)
  ├── develop (desarrollo activo)
  │   ├── feature/nombre-feature
  │   ├── fix/nombre-fix
  │   └── refactor/nombre-refactor
```

## 🌿 Branches Principales

### `main`
- **Propósito**: Código en producción
- **Protección**: Solo merge desde `develop` o `hotfix/*`
- **Estado**: Siempre estable y deployable

### `develop`
- **Propósito**: Integración de features
- **Protección**: Merge desde feature branches
- **Estado**: Código en desarrollo activo

## 🔨 Tipos de Branches

### Feature Branches (`feature/*`)
**Para nuevas funcionalidades**

```bash
# Crear branch
git checkout develop
git pull origin develop
git checkout -b feature/checkout-payment

# Trabajar y hacer commits
git add .
git commit -m "feat: implementar checkout básico"

# Push y crear PR
git push origin feature/checkout-payment
```

**Convención de nombres:**
- `feature/checkout-payment`
- `feature/user-authentication`
- `feature/product-filters`

### Fix Branches (`fix/*`)
**Para corrección de bugs**

```bash
git checkout develop
git pull origin develop
git checkout -b fix/cart-empty-state

# Trabajar
git commit -m "fix: corregir estado vacío del carrito"

git push origin fix/cart-empty-state
```

### Hotfix Branches (`hotfix/*`)
**Para correcciones urgentes en producción**

```bash
# Desde main
git checkout main
git pull origin main
git checkout -b hotfix/critical-security-fix

# Hacer fix
git commit -m "hotfix: corregir vulnerabilidad de seguridad"

# Merge a main Y develop
git checkout main
git merge hotfix/critical-security-fix
git push origin main

git checkout develop
git merge hotfix/critical-security-fix
git push origin develop
```

### Refactor Branches (`refactor/*`)
**Para refactorizaciones sin cambios funcionales**

```bash
git checkout develop
git checkout -b refactor/cart-state-management

git commit -m "refactor: migrar carrito a Zustand"
```

## 📝 Convenciones de Commits

Usamos **Conventional Commits** para claridad:

### Formato
```
<tipo>(<ámbito>): <descripción>

[descripción opcional más detallada]

[footer opcional]
```

### Tipos
- `feat`: Nueva funcionalidad
- `fix`: Corrección de bug
- `docs`: Cambios en documentación
- `style`: Formato, punto y coma faltante, etc. (no afecta código)
- `refactor`: Refactorización de código
- `test`: Agregar o modificar tests
- `chore`: Tareas de mantenimiento (build, dependencias)
- `perf`: Mejoras de rendimiento

### Ejemplos

```bash
# Feature
git commit -m "feat(cart): agregar persistencia en localStorage"

# Fix
git commit -m "fix(products): corregir filtro por liga"

# Refactor
git commit -m "refactor(api): simplificar cliente Medusa"

# Docs
git commit -m "docs: actualizar guía de setup"

# Con descripción extendida
git commit -m "feat(checkout): implementar proceso de pago

- Agregar formulario de datos de envío
- Integrar pasarela de pago Stripe
- Validar datos del cliente"
```

## 🔄 Flujo de Trabajo Diario

### 1. Inicio del Día

```bash
# Actualizar develop
git checkout develop
git pull origin develop

# Crear tu branch de trabajo
git checkout -b feature/mi-feature
```

### 2. Durante el Desarrollo

```bash
# Hacer commits frecuentes y pequeños
git add .
git commit -m "feat: agregar selector de talla"

# Push regularmente (cada 2-3 commits)
git push origin feature/mi-feature
```

### 3. Antes de Crear PR

```bash
# Actualizar tu branch con develop
git checkout develop
git pull origin develop
git checkout feature/mi-feature
git merge develop
# O mejor: git rebase develop (más limpio)

# Resolver conflictos si los hay
# Probar que todo funciona

# Push actualizado
git push origin feature/mi-feature
```

### 4. Crear Pull Request

1. Ir a GitHub/GitLab
2. Crear PR desde `feature/mi-feature` → `develop`
3. **Título**: Usar formato de commit
4. **Descripción**: Explicar qué, por qué, cómo
5. Asignar reviewer (tu compañero)
6. Esperar aprobación

### 5. Después del Merge

```bash
# Limpiar branch local
git checkout develop
git pull origin develop
git branch -d feature/mi-feature

# Limpiar branch remoto (opcional)
git push origin --delete feature/mi-feature
```

## 🚫 Reglas de Oro

### ✅ HACER

- ✅ **Pull antes de push**: Siempre `git pull` antes de trabajar
- ✅ **Commits pequeños**: Un commit = un cambio lógico
- ✅ **Mensajes claros**: Describe QUÉ y POR QUÉ
- ✅ **Branch por feature**: Una feature = un branch
- ✅ **PR pequeñas**: Máximo 400 líneas cambiadas
- ✅ **Revisar antes de merge**: Siempre code review
- ✅ **Actualizar develop**: Antes de crear PR

### ❌ NO HACER

- ❌ **Commit directo a `main` o `develop`**
- ❌ **Commits masivos**: "WIP", "fix", "update"
- ❌ **Merge sin revisar**: Siempre PR
- ❌ **Trabajar en el mismo archivo simultáneamente** (coordinarse)
- ❌ **Force push a branches compartidos**
- ❌ **Dejar branches huérfanas**: Limpiar después del merge

## 🔍 Resolución de Conflictos

### Cuando hay conflictos al mergear:

```bash
git checkout feature/mi-feature
git merge develop

# Si hay conflictos:
# 1. Git te mostrará los archivos en conflicto
# 2. Abre los archivos y busca marcadores:
#    <<<<<<< HEAD
#    tu código
#    =======
#    código de develop
#    >>>>>>> develop

# 3. Resuelve manualmente
# 4. Marca como resuelto:
git add archivo-resuelto.ts

# 5. Completa el merge:
git commit
```

### Estrategia para evitar conflictos:

1. **Comunicarse**: "Voy a trabajar en `lib/products.ts`"
2. **Dividir trabajo**: Uno frontend, otro backend
3. **Pull frecuente**: Actualizar con develop regularmente

## 📊 Ejemplo de Flujo Completo

### Dev 1: Implementar checkout

```bash
# Día 1
git checkout develop
git pull origin develop
git checkout -b feature/checkout-process

# Trabajar
git add app/checkout/page.tsx
git commit -m "feat(checkout): crear página de checkout"
git push origin feature/checkout-process

# Día 2
git pull origin develop  # Actualizar
git checkout feature/checkout-process
git merge develop  # O rebase
# Resolver conflictos si hay
git push origin feature/checkout-process

# Crear PR en GitHub
# Esperar review de Dev 2
```

### Dev 2: Revisar y aprobar

```bash
# Revisar PR en GitHub
# Comentar si hay cambios necesarios
# Aprobar cuando esté listo
# Merge a develop
```

### Dev 1: Limpiar

```bash
git checkout develop
git pull origin develop
git branch -d feature/checkout-process
```

## 🛠️ Comandos Útiles

### Ver estado
```bash
git status
git log --oneline --graph --all
```

### Ver diferencias
```bash
git diff                    # Cambios no staged
git diff --staged           # Cambios staged
git diff develop...HEAD     # Cambios en tu branch vs develop
```

### Deshacer cambios
```bash
git checkout -- archivo     # Descartar cambios en archivo
git reset HEAD archivo      # Unstage archivo
git reset --soft HEAD~1     # Deshacer último commit (mantiene cambios)
```

### Stash (guardar trabajo temporal)
```bash
git stash                    # Guardar cambios temporales
git stash pop               # Recuperar cambios
git stash list              # Ver stashes
```

## 📋 Checklist de PR

Antes de crear un Pull Request, verifica:

- [ ] Código compila sin errores
- [ ] Tests pasan (si hay)
- [ ] Linter pasa (`npm run lint`)
- [ ] Branch actualizada con `develop`
- [ ] Commits con mensajes claros
- [ ] No hay console.logs de debug
- [ ] No hay archivos temporales
- [ ] Documentación actualizada si es necesario
- [ ] Funcionalidad probada manualmente

## 🎯 Workflow Visual

```
Developer 1                Developer 2
     |                          |
     v                          v
  develop                    develop
     |                          |
     |                          |
feature/A                  feature/B
     |                          |
     |                          |
     v                          v
   PR A                      PR B
     |                          |
     |                          |
     v                          v
  develop                    develop
     |                          |
     +----------+---------------+
                |
                v
              main
```

## 🔐 Protección de Branches (GitHub)

Configurar en GitHub Settings → Branches:

- **`main`**: Require pull request, require review, require status checks
- **`develop`**: Require pull request, require review

## 📞 Comunicación

- **Antes de trabajar**: Avisar qué vas a hacer
- **Conflictos**: Comunicarse antes de resolver
- **PR listas**: Notificar al compañero
- **Bloqueos**: Pedir ayuda, no quedarse atascado

---

**¿Dudas?** Consulta este documento o pregunta al equipo.
