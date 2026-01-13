#!/bin/bash

# Git Helper Scripts para Playeras Fut
# Uso: source scripts/git-helpers.sh

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función: Iniciar nueva feature
git-start-feature() {
    if [ -z "$1" ]; then
        echo -e "${YELLOW}Uso: git-start-feature nombre-feature${NC}"
        return 1
    fi
    
    echo -e "${BLUE}🚀 Iniciando feature: $1${NC}"
    git checkout develop
    git pull origin develop
    git checkout -b "feature/$1"
    echo -e "${GREEN}✅ Branch feature/$1 creado${NC}"
}

# Función: Iniciar nuevo fix
git-start-fix() {
    if [ -z "$1" ]; then
        echo -e "${YELLOW}Uso: git-start-fix nombre-fix${NC}"
        return 1
    fi
    
    echo -e "${BLUE}🔧 Iniciando fix: $1${NC}"
    git checkout develop
    git pull origin develop
    git checkout -b "fix/$1"
    echo -e "${GREEN}✅ Branch fix/$1 creado${NC}"
}

# Función: Actualizar branch con develop
git-update-branch() {
    CURRENT_BRANCH=$(git branch --show-current)
    
    if [ "$CURRENT_BRANCH" = "develop" ] || [ "$CURRENT_BRANCH" = "main" ]; then
        echo -e "${YELLOW}⚠️  Estás en $CURRENT_BRANCH. Actualizando directamente...${NC}"
        git pull origin "$CURRENT_BRANCH"
        return 0
    fi
    
    echo -e "${BLUE}🔄 Actualizando $CURRENT_BRANCH con develop...${NC}"
    git checkout develop
    git pull origin develop
    git checkout "$CURRENT_BRANCH"
    git merge develop
    echo -e "${GREEN}✅ Branch actualizado${NC}"
}

# Función: Preparar PR
git-prepare-pr() {
    CURRENT_BRANCH=$(git branch --show-current)
    
    if [[ ! "$CURRENT_BRANCH" =~ ^(feature|fix|refactor|hotfix)/ ]]; then
        echo -e "${YELLOW}⚠️  No estás en un branch de feature/fix${NC}"
        return 1
    fi
    
    echo -e "${BLUE}📋 Preparando PR para $CURRENT_BRANCH...${NC}"
    
    # Actualizar con develop
    git-update-branch
    
    # Verificar que no hay cambios sin commitear
    if [ -n "$(git status --porcelain)" ]; then
        echo -e "${YELLOW}⚠️  Hay cambios sin commitear. ¿Deseas continuar? (y/n)${NC}"
        read -r response
        if [ "$response" != "y" ]; then
            return 1
        fi
    fi
    
    # Push
    git push origin "$CURRENT_BRANCH"
    
    echo -e "${GREEN}✅ Listo para crear PR:${NC}"
    echo -e "${BLUE}   $CURRENT_BRANCH → develop${NC}"
    echo -e "${BLUE}   https://github.com/tu-usuario/playeras-fut/compare/develop...$CURRENT_BRANCH${NC}"
}

# Función: Limpiar branches merged
git-cleanup() {
    echo -e "${BLUE}🧹 Limpiando branches merged...${NC}"
    git checkout develop
    git pull origin develop
    
    # Eliminar branches locales merged
    git branch --merged develop | grep -v "develop\|main" | xargs -n 1 git branch -d
    
    echo -e "${GREEN}✅ Limpieza completada${NC}"
}

# Función: Ver estado del proyecto
git-status-project() {
    echo -e "${BLUE}📊 Estado del Proyecto${NC}"
    echo ""
    echo -e "${GREEN}Branches locales:${NC}"
    git branch
    echo ""
    echo -e "${GREEN}Últimos commits:${NC}"
    git log --oneline --graph --all -10
    echo ""
    echo -e "${GREEN}Estado actual:${NC}"
    git status
}

# Función: Help
git-help() {
    echo -e "${BLUE}📚 Git Helpers - Playeras Fut${NC}"
    echo ""
    echo "Comandos disponibles:"
    echo "  git-start-feature <nombre>  - Crear y cambiar a nueva feature branch"
    echo "  git-start-fix <nombre>      - Crear y cambiar a nuevo fix branch"
    echo "  git-update-branch           - Actualizar branch actual con develop"
    echo "  git-prepare-pr              - Preparar branch para Pull Request"
    echo "  git-cleanup                 - Limpiar branches merged"
    echo "  git-status-project          - Ver estado completo del proyecto"
    echo ""
    echo "Ejemplos:"
    echo "  git-start-feature checkout-payment"
    echo "  git-start-fix cart-empty-state"
    echo "  git-prepare-pr"
}

# Mostrar help al cargar
echo -e "${GREEN}✅ Git helpers cargados. Usa 'git-help' para ver comandos${NC}"
