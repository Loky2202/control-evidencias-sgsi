#!/bin/sh
set -e

# Script de respaldo de la base de datos
# Uso: ./scripts/backup.sh

# Cargar variables de entorno
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

# Crear directorio de backups si no existe
mkdir -p backups

# Fecha para el nombre del archivo
DATE=$(date +%Y-%m-%d_%H-%M-%S)
BACKUP_FILE="backups/evidencias_${DATE}.dump"

echo "📦 Creando respaldo de la base de datos..."
echo "   Base de datos: ${DB_NAME}"
echo "   Archivo: ${BACKUP_FILE}"

# Crear el respaldo
docker compose exec -T db pg_dump \
    -U "${DB_OWNER}" \
    -d "${DB_NAME}" \
    -Fc \
    --compress=9 \
    > "${BACKUP_FILE}"

# Verificar que el archivo se creó
if [ -f "${BACKUP_FILE}" ]; then
    SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
    echo "✅ Respaldo creado exitosamente"
    echo "   Tamaño: ${SIZE}"
else
    echo "❌ Error al crear el respaldo"
    exit 1
fi

# Limpiar respaldos antiguos (mantener últimos 14 días)
echo "🧹 Limpiando respaldos antiguos..."
find backups -name 'evidencias_*.dump' -mtime +14 -delete
REMAINING=$(ls -1 backups/evidencias_*.dump 2>/dev/null | wc -l)
echo "   Respaldos restantes: ${REMAINING}"

echo "✅ Proceso completado"
