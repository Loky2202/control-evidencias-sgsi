#!/usr/bin/env bash
set -e

# Script de restauración de la base de datos
# Uso: ./scripts/restore.sh <archivo_backup>

# Verificar que se proporcionó un archivo
if [ -z "$1" ]; then
    echo "❌ Error: Debes especificar un archivo de respaldo"
    echo "Uso: ./scripts/restore.sh <archivo_backup>"
    echo ""
    echo "Respaldos disponibles:"
    ls -lh backups/*.dump 2>/dev/null || echo "  No hay respaldos disponibles"
    exit 1
fi

BACKUP_FILE="$1"

# Verificar que el archivo existe
if [ ! -f "${BACKUP_FILE}" ]; then
    echo "❌ Error: El archivo ${BACKUP_FILE} no existe"
    exit 1
fi

# Cargar variables de entorno
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

echo "⚠️  ADVERTENCIA: Esto restaurará la base de datos desde:"
echo "   ${BACKUP_FILE}"
echo ""
echo "   Base de datos: ${DB_NAME}"
echo ""
read -p "¿Estás seguro de que deseas continuar? (s/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    echo "❌ Operación cancelada"
    exit 1
fi

echo ""
echo "🔄 Restaurando base de datos..."

# Detener la API para evitar conexiones activas
echo "🛑 Deteniendo API..."
docker compose stop api

# Restaurar el respaldo
docker compose exec -T db pg_restore \
    -U "${DB_OWNER}" \
    -d "${DB_NAME}" \
    --clean \
    --if-exists \
    --verbose \
    < "${BACKUP_FILE}" 2>&1 | grep -E "(pg_restore|ERROR)" || true

# Reiniciar la API
echo "🚀 Reiniciando API..."
docker compose start api

echo ""
echo "✅ Restauración completada"
echo "   Archivo: ${BACKUP_FILE}"
echo "   Base de datos: ${DB_NAME}"
