#!/usr/bin/env bash
set -e

# Script de setup inicial del proyecto
# Ejecutar una vez después de clonar el repositorio

echo "🚀 Iniciando setup del proyecto..."

# Verificar que Docker esté corriendo
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker no está corriendo"
    echo "   Por favor, inicia Docker e intenta de nuevo"
    exit 1
fi

# Verificar que docker compose esté disponible
if ! docker compose version > /dev/null 2>&1; then
    echo "❌ Error: docker compose no está disponible"
    exit 1
fi

# Paso 1: Configurar variables de entorno
echo ""
echo "📝 Paso 1: Configurando variables de entorno..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Archivo .env creado desde .env.example"
    echo "⚠️  IMPORTANTE: Edita .env y cambia las contraseñas por defecto"
else
    echo "✅ Archivo .env ya existe"
fi

# Paso 2: Generar package-lock.json del frontend
echo ""
echo "📦 Paso 2: Generando package-lock.json del frontend..."
if [ ! -f frontend/package-lock.json ]; then
    echo "   Ejecutando npm install en frontend/..."
    (cd frontend && npm install)
    echo "✅ package-lock.json generado"
else
    echo "✅ package-lock.json ya existe"
fi

# Paso 3: Dar permisos de ejecución a los scripts
echo ""
echo "🔧 Paso 3: Configurando permisos de scripts..."
chmod +x scripts/backup.sh
chmod +x scripts/restore.sh
chmod +x db/init/01-roles.sh
chmod +x scripts/setup.sh
echo "✅ Permisos configurados"

# Paso 4: Crear directorio de backups
echo ""
echo "📁 Paso 4: Creando directorio de backups..."
mkdir -p backups
echo "✅ Directorio backups/ creado"

# Paso 5: Levantar los servicios
echo ""
echo "🐳 Paso 5: Levantando servicios Docker..."
docker compose up --build -d

echo ""
echo "✅ Setup completado exitosamente!"
echo ""
echo "📊 Estado de los contenedores:"
docker compose ps
echo ""
echo "🌐 Accede a la aplicación:"
echo "   Frontend: https://localhost"
echo "   API Docs: https://localhost/api/docs"
echo ""
echo "📝 Próximos pasos:"
echo "   1. Edita .env con tus credenciales de Entra ID (opcional)"
echo "   2. Carga datos iniciales: docker compose exec api python scripts/import_excel.py"
echo "   3. Revisa los logs: docker compose logs -f api"
