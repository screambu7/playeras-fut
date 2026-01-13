# 🔄 Instrucciones de Sincronización

## 📋 Situación Actual

- ✅ Repositorio en GitHub: https://github.com/screambu7/playeras-fut.git
- ✅ 1 commit inicial en `main`
- ⚠️ Muchos cambios locales sin commitear
- ❌ No existe branch `develop` aún

## 🎯 Objetivo

Sincronizar todo el trabajo local con el remoto, creando la estructura de branches correcta.

## 🚀 Opción Rápida (Recomendada para empezar)

### Usar el script automático:

```bash
./scripts/sync-repo.sh
```

El script te guiará paso a paso.

### O manualmente:

```bash
# 1. Asegurarse de estar actualizado
git checkout main
git pull origin main

# 2. Crear branch develop
git checkout -b develop

# 3. Agregar todos los cambios
git add .

# 4. Commit organizado
git commit -m "feat: setup completo - backend Medusa + frontend + Git workflow

- Configurar backend Medusa.js con PostgreSQL
- Migrar frontend para usar API de Medusa  
- Implementar carrito con Medusa Cart API
- Agregar documentación de Git workflow
- Configurar scripts y templates de GitHub"

# 5. Push develop
git push -u origin develop
```

## 📦 Opción Organizada (Si prefieren dividir en commits)

Si quieren organizar mejor el historial:

```bash
# 1. Crear develop
git checkout main
git pull origin main
git checkout -b develop

# 2. Backend setup
git add backend/ lib/medusa.ts lib/products.ts lib/cart-medusa.ts types/medusa.ts
git commit -m "feat: configurar backend Medusa.js y cliente frontend"

# 3. Frontend migration
git add app/ components/ProductCard.tsx components/ProductGrid.tsx
git commit -m "feat: migrar frontend para usar API de Medusa"

# 4. Documentation
git add .github/ GIT_WORKFLOW.md QUICK_START_GIT.md CONTRIBUTING.md SETUP.md scripts/
git commit -m "docs: agregar documentación de Git workflow y setup"

# 5. Push
git push -u origin develop
```

## ✅ Verificación

Después de hacer push, verificar:

```bash
# Ver branches remotos
git branch -a

# Deberías ver:
# * develop
#   main
#   remotes/origin/develop
#   remotes/origin/main
```

## 🔐 Configurar Protección de Branches en GitHub

1. Ir a: https://github.com/screambu7/playeras-fut/settings/branches
2. Agregar regla para `main`:
   - ✅ Require pull request
   - ✅ Require approvals: 1
   - ✅ Require branches to be up to date
3. Agregar regla para `develop`:
   - ✅ Require pull request
   - ✅ Require approvals: 1

## 👥 Para el Segundo Dev

Una vez que `develop` esté en el remoto:

```bash
# Clonar
git clone https://github.com/screambu7/playeras-fut.git
cd playeras-fut

# Ver branches
git branch -a

# Trabajar desde develop
git checkout develop
git pull origin develop

# Crear su primera feature
git checkout -b feature/su-feature
```

## 🚨 Si hay conflictos

Si al hacer pull hay conflictos:

```bash
# Ver qué archivos tienen conflicto
git status

# Resolver manualmente o usar merge tool
git mergetool

# Después de resolver
git add .
git commit
```

## 📝 Checklist Final

- [ ] `develop` creado y pusheado
- [ ] Todos los cambios commitados
- [ ] Protección de branches configurada en GitHub
- [ ] Segundo dev puede clonar y trabajar
- [ ] Ambos devs están en la misma página

---

**¿Listo?** Ejecuta `./scripts/sync-repo.sh` o sigue los pasos manuales arriba! 🚀
