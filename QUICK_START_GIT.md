# ⚡ Quick Start - Git Workflow

Guía rápida para empezar a trabajar con Git en este proyecto.

## 🚀 Setup Inicial (Solo una vez)

```bash
# 1. Clonar repositorio
git clone https://github.com/tu-usuario/playeras-fut.git
cd playeras-fut

# 2. Crear branch develop si no existe
git checkout -b develop
git push -u origin develop

# 3. Configurar remotes (si trabajas con fork)
git remote add upstream https://github.com/original/playeras-fut.git
```

## 🔄 Flujo Diario

### Inicio del Día

```bash
# Actualizar develop
git checkout develop
git pull origin develop

# Crear tu branch de trabajo
git checkout -b feature/mi-feature
```

### Durante el Día

```bash
# Hacer cambios
# ...

# Commit frecuente
git add .
git commit -m "feat: agregar funcionalidad X"

# Push cada 2-3 commits
git push origin feature/mi-feature
```

### Antes de PR

```bash
# Actualizar con develop
git checkout develop
git pull origin develop
git checkout feature/mi-feature
git merge develop  # Resolver conflictos si hay

# Verificar que funciona
npm run lint
npm run build

# Push actualizado
git push origin feature/mi-feature
```

### Crear Pull Request

1. Ir a GitHub
2. Click en "New Pull Request"
3. Seleccionar: `feature/mi-feature` → `develop`
4. Llenar título y descripción
5. Asignar reviewer
6. Crear PR

### Después del Merge

```bash
# Limpiar
git checkout develop
git pull origin develop
git branch -d feature/mi-feature
```

## 📝 Convenciones de Commits

```bash
# Feature
git commit -m "feat(cart): agregar persistencia"

# Fix
git commit -m "fix(products): corregir filtro"

# Refactor
git commit -m "refactor(api): simplificar cliente"
```

## 🚨 Comandos de Emergencia

### Descartar cambios locales
```bash
git checkout -- archivo.ts
git reset --hard HEAD
```

### Ver qué cambió
```bash
git status
git diff
git log --oneline
```

### Guardar trabajo temporal
```bash
git stash
# hacer otros cambios
git stash pop
```

## 📞 ¿Problemas?

1. **Conflictos**: Comunicarse con el equipo
2. **Dudas**: Revisar `GIT_WORKFLOW.md`
3. **Errores**: No hacer force push, pedir ayuda

---

**Recuerda**: Pull antes de push, commits pequeños, PR claras 🚀
