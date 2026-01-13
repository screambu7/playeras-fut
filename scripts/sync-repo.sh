#!/bin/bash

# Script para sincronizar repositorio local con remoto
# Uso: ./scripts/sync-repo.sh

set -e  # Salir si hay error

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔄 Sincronización con Repositorio Remoto${NC}"
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: No estás en el directorio raíz del proyecto${NC}"
    exit 1
fi

# Verificar estado de Git
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${RED}❌ Error: No es un repositorio Git${NC}"
    exit 1
fi

echo -e "${BLUE}📊 Estado actual:${NC}"
git status --short | head -10
echo ""

# Verificar si hay cambios sin commitear
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}⚠️  Hay cambios sin commitear${NC}"
    echo ""
    echo "Opciones:"
    echo "1) Crear branch develop y commitear todo junto (rápido)"
    echo "2) Organizar en múltiples branches (recomendado)"
    echo "3) Cancelar"
    echo ""
    read -p "Selecciona opción (1/2/3): " option
    
    case $option in
        1)
            echo -e "${BLUE}🚀 Opción 1: Commit rápido a develop${NC}"
            
            # Asegurarse de estar en main y actualizado
            git checkout main
            git pull origin main
            
            # Crear develop si no existe
            if git show-ref --verify --quiet refs/heads/develop; then
                echo -e "${YELLOW}Branch develop ya existe localmente${NC}"
                git checkout develop
                git pull origin develop 2>/dev/null || true
            else
                echo -e "${GREEN}Creando branch develop...${NC}"
                git checkout -b develop
            fi
            
            # Agregar todos los cambios
            echo -e "${GREEN}Agregando cambios...${NC}"
            git add .
            
            # Commit
            echo -e "${GREEN}Creando commit...${NC}"
            git commit -m "feat: setup completo - backend Medusa + frontend + Git workflow

- Configurar backend Medusa.js con PostgreSQL
- Migrar frontend para usar API de Medusa
- Implementar carrito con Medusa Cart API
- Agregar documentación de Git workflow
- Configurar scripts y templates de GitHub"
            
            # Push
            echo -e "${GREEN}Haciendo push a origin/develop...${NC}"
            git push -u origin develop
            
            echo -e "${GREEN}✅ Sincronización completada!${NC}"
            echo -e "${BLUE}Branch develop creado y pusheado${NC}"
            ;;
        2)
            echo -e "${BLUE}🚀 Opción 2: Organizar en múltiples branches${NC}"
            echo -e "${YELLOW}Esta opción requiere intervención manual${NC}"
            echo ""
            echo "Pasos sugeridos:"
            echo "1. git checkout main && git pull origin main"
            echo "2. git checkout -b develop && git push -u origin develop"
            echo "3. Crear branches separados para cada feature"
            echo ""
            echo "Ver SYNC_WITH_REMOTE.md para más detalles"
            ;;
        3)
            echo -e "${YELLOW}Operación cancelada${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}Opción inválida${NC}"
            exit 1
            ;;
    esac
else
    echo -e "${GREEN}✅ No hay cambios sin commitear${NC}"
    
    # Verificar si develop existe
    if git show-ref --verify --quiet refs/heads/develop; then
        echo -e "${GREEN}Branch develop existe${NC}"
        git checkout develop
        git pull origin develop
    else
        echo -e "${BLUE}Creando branch develop...${NC}"
        git checkout main
        git pull origin main
        git checkout -b develop
        git push -u origin develop
        echo -e "${GREEN}✅ Branch develop creado${NC}"
    fi
fi

echo ""
echo -e "${GREEN}✅ Sincronización completada!${NC}"
echo ""
echo -e "${BLUE}Próximos pasos:${NC}"
echo "1. Verificar en GitHub que develop existe"
echo "2. Configurar protección de branches"
echo "3. El segundo dev puede clonar y trabajar"
