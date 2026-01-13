# 🔄 Sincronización con Repositorio Remoto

## 📊 Estado Actual

- **Repositorio remoto**: https://github.com/screambu7/playeras-fut.git
- **Rama actual**: `main`
- **Commits remotos**: 1 commit inicial
- **Cambios locales**: Muchos archivos nuevos y modificados

## 🎯 Plan de Sincronización

### Opción 1: Organizar en Branches (Recomendado)

Esta opción organiza el trabajo en branches siguiendo el flujo establecido.

#### Paso 1: Crear branch develop desde main

```bash
# Asegurarse de estar en main y actualizado
git checkout main
git pull origin main

# Crear develop desde main
git checkout -b develop
git push -u origin develop
```

#### Paso 2: Organizar cambios en branches

```bash
# 1. Setup inicial (backend + frontend base)
git checkout -b feature/setup-medusa-backend
git add backend/ lib/medusa.ts lib/products.ts lib/cart-medusa.ts types/medusa.ts
git commit -m "feat: configurar backend Medusa.js y cliente frontend"
git push origin feature/setup-medusa-backend

# 2. Migración frontend a Medusa API
git checkout develop
git checkout -b feature/migrate-frontend-to-medusa
git add app/ components/ lib/ types/
git commit -m "feat: migrar frontend para usar API de Medusa"
git push origin feature/migrate-frontend-to-medusa

# 3. Documentación y workflow
git checkout develop
git checkout -b feature/git-workflow-setup
git add .github/ GIT_WORKFLOW.md QUICK_START_GIT.md CONTRIBUTING.md SETUP.md scripts/
git commit -m "docs: agregar documentación de Git workflow y setup"
git push origin feature/git-workflow-setup
```

#### Paso 3: Merge a develop

```bash
# Merge cada feature a develop
git checkout develop
git merge feature/setup-medusa-backend
git merge feature/migrate-frontend-to-medusa
git merge feature/git-workflow-setup

# Push develop
git push origin develop
```

### Opción 2: Commit Directo a develop (Más Rápido)

Si prefieren ir más rápido y organizar después:

```bash
# Crear develop
git checkout main
git checkout -b develop

# Agregar todos los cambios
git add .
git commit -m "feat: setup completo - backend Medusa + frontend + workflow"

# Push
git push -u origin develop
```

## ✅ Checklist de Sincronización

- [ ] Verificar que main está actualizado con remoto
- [ ] Crear branch develop
- [ ] Organizar cambios en commits lógicos
- [ ] Push de develop al remoto
- [ ] Configurar protección de branches en GitHub
- [ ] Ambos devs clonan y configuran

## 🚀 Después de Sincronizar

### Para el Dev Actual

```bash
# Ya está listo, solo necesita push
git checkout develop
git push origin develop
```

### Para el Segundo Dev

```bash
# Clonar repositorio
git clone https://github.com/screambu7/playeras-fut.git
cd playeras-fut

# Ver branches disponibles
git branch -a

# Trabajar desde develop
git checkout develop
git pull origin develop

# Crear su primera feature
git checkout -b feature/su-feature
```

## 📝 Notas Importantes

1. **No hacer force push** a main o develop
2. **Comunicarse** antes de trabajar en los mismos archivos
3. **Pull frecuente** antes de empezar a trabajar
4. **Commits pequeños** y descriptivos
