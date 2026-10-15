#!/bin/bash
set -e

# Script de limpieza de evidencias expiradas según política de retención
# Se puede ejecutar manualmente o programar con cron
#
# Uso:
#   ./scripts/cleanup_retention.sh              # Simulación (dry-run)
#   ./scripts/cleanup_retention.sh --execute    # Ejecución real
#
# Ejemplo de cron (ejecutar cada domingo a las 2 AM):
#   0 2 * * 0 /path/to/scripts/cleanup_retention.sh --execute >> /var/log/evidencias-cleanup.log 2>&1

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Directorio del proyecto
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

# Verificar argumentos
DRY_RUN="true"
if [[ "$1" == "--execute" ]]; then
    DRY_RUN="false"
    echo -e "${YELLOW}⚠️  MODO EJECUCIÓN REAL - Las evidencias expiradas serán eliminadas${NC}"
else
    echo -e "${GREEN}✓ MODO SIMULACIÓN (dry-run) - No se eliminará nada${NC}"
    echo -e "${YELLOW}  Para ejecutar realmente, usa: $0 --execute${NC}"
fi

echo ""
echo "=========================================="
echo "  Limpieza de Evidencias Expiradas"
echo "=========================================="
echo ""

# Verificar que Docker está corriendo
if ! docker compose ps > /dev/null 2>&1; then
    echo -e "${RED}❌ Error: Los contenedores Docker no están corriendo${NC}"
    echo "Ejecuta: docker compose up -d"
    exit 1
fi

# Obtener resumen antes de la limpieza
echo -e "${YELLOW}📊 Obteniendo resumen de retención...${NC}"
docker compose exec -T api python -c "
from app.db import SessionLocal
from app.services.retention import get_retention_summary
import json

db = SessionLocal()
try:
    summary = get_retention_summary(db)
    print(json.dumps(summary, indent=2))
finally:
    db.close()
"

echo ""
echo "------------------------------------------"
echo ""

# Ejecutar limpieza
if [[ "$DRY_RUN" == "true" ]]; then
    echo -e "${YELLOW}🔍 Simulando limpieza...${NC}"
    RESULT=$(docker compose exec -T api python -c "
from app.db import SessionLocal
from app.services.retention import cleanup_expired_submissions
import json

db = SessionLocal()
try:
    stats = cleanup_expired_submissions(db, dry_run=True)
    print(json.dumps(stats, indent=2))
finally:
    db.close()
")
else
    echo -e "${RED}🗑️  Ejecutando limpieza real...${NC}"
    RESULT=$(docker compose exec -T api python -c "
from app.db import SessionLocal
from app.services.retention import cleanup_expired_submissions
import json

db = SessionLocal()
try:
    stats = cleanup_expired_submissions(db, dry_run=False)
    print(json.dumps(stats, indent=2))
finally:
    db.close()
")
fi

echo ""
echo "📈 Resultado:"
echo "$RESULT"
echo ""

# Obtener resumen después de la limpieza
if [[ "$DRY_RUN" == "false" ]]; then
    echo "------------------------------------------"
    echo ""
    echo -e "${YELLOW}📊 Resumen después de la limpieza:${NC}"
    docker compose exec -T api python -c "
from app.db import SessionLocal
from app.services.retention import get_retention_summary
import json

db = SessionLocal()
try:
    summary = get_retention_summary(db)
    print(json.dumps(summary, indent=2))
finally:
    db.close()
"
fi

echo ""
echo "=========================================="
if [[ "$DRY_RUN" == "true" ]]; then
    echo -e "${GREEN}✓ Simulación completada${NC}"
    echo "  Ningún dato fue eliminado"
else
    echo -e "${GREEN}✓ Limpieza ejecutada exitosamente${NC}"
fi
echo "=========================================="
