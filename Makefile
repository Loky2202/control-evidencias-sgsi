.PHONY: help setup dev build test clean logs backup restore

# Variables
DOCKER_COMPOSE = docker compose
BACKEND_DIR = backend
FRONTEND_DIR = frontend

# Colores para output
GREEN = \033[0;32m
YELLOW = \033[1;33m
NC = \033[0m # No Color

help: ## Mostrar ayuda
	@echo "📋 Comandos disponibles:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "$(GREEN)%-15s$(NC) %s\n", $$1, $$2}'

setup: ## Setup inicial del proyecto (ejecutar una vez)
	@echo "$(YELLOW)🚀 Iniciando setup del proyecto...$(NC)"
	@chmod +x scripts/setup.sh
	@./scripts/setup.sh

dev: ## Levantar en modo desarrollo
	@echo "$(YELLOW)🔧 Levantando en modo desarrollo...$(NC)"
	$(DOCKER_COMPOSE) -f docker-compose.yml -f docker-compose.override.yml up --build

dev-detach: ## Levantar en modo desarrollo (background)
	@echo "$(YELLOW)🔧 Levantando en modo desarrollo (background)...$(NC)"
	$(DOCKER_COMPOSE) -f docker-compose.yml -f docker-compose.override.yml up --build -d

build: ## Construir imágenes Docker
	@echo "$(YELLOW)🏗️  Construyendo imágenes Docker...$(NC)"
	$(DOCKER_COMPOSE) build

up: ## Levantar servicios
	@echo "$(YELLOW)🚀 Levantando servicios...$(NC)"
	$(DOCKER_COMPOSE) up -d

down: ## Detener servicios
	@echo "$(YELLOW)🛑 Deteniendo servicios...$(NC)"
	$(DOCKER_COMPOSE) down

restart: ## Reiniciar servicios
	@echo "$(YELLOW)🔄 Reiniciando servicios...$(NC)"
	$(DOCKER_COMPOSE) restart

logs: ## Ver logs de todos los servicios
	$(DOCKER_COMPOSE) logs -f

logs-api: ## Ver logs de la API
	$(DOCKER_COMPOSE) logs -f api

logs-web: ## Ver logs del frontend
	$(DOCKER_COMPOSE) logs -f web

ps: ## Ver estado de contenedores
	$(DOCKER_COMPOSE) ps

# Backend
test: ## Ejecutar tests del backend
	@echo "$(YELLOW)🧪 Ejecutando tests...$(NC)"
	$(DOCKER_COMPOSE) exec api pytest -v

test-cov: ## Ejecutar tests con cobertura
	@echo "$(YELLOW)🧪 Ejecutar tests con cobertura...$(NC)"
	$(DOCKER_COMPOSE) exec api pytest --cov=app --cov-report=term-missing

shell-api: ## Entrar al contenedor de la API
	$(DOCKER_COMPOSE) exec api bash

shell-db: ## Entrar al contenedor de la base de datos
	$(DOCKER_COMPOSE) exec db psql -U evidencias_owner -d evidencias

migrate: ## Aplicar migraciones pendientes
	@echo "$(YELLOW)🗄️  Aplicando migraciones...$(NC)"
	$(DOCKER_COMPOSE) exec api alembic upgrade head

migrate-new: ## Crear nueva migración (usar: make migrate-new MSG="descripcion")
	$(DOCKER_COMPOSE) exec api alembic revision --autogenerate -m "$(MSG)"

seed: ## Cargar datos de prueba
	@echo "$(YELLOW)📥 Cargando datos de prueba...$(NC)"
	$(DOCKER_COMPOSE) exec api python scripts/seed_data.py

import: ## Importar datos desde Excel (usar: make import FILE=archivo.xlsx)
	@echo "$(YELLOW)📥 Importando datos desde $(FILE)...$(NC)"
	$(DOCKER_COMPOSE) exec api python scripts/import_excel.py $(FILE)

# Frontend
frontend-install: ## Instalar dependencias del frontend
	@echo "$(YELLOW)📦 Instalando dependencias del frontend...$(NC)"
	cd $(FRONTEND_DIR) && npm install

frontend-dev: ## Levantar frontend en modo desarrollo (sin Docker)
	@echo "$(YELLOW)🔧 Levantando frontend en modo desarrollo...$(NC)"
	cd $(FRONTEND_DIR) && npm run dev

# Backups
backup: ## Crear respaldo de la base de datos
	@echo "$(YELLOW)💾 Creando respaldo...$(NC)"
	@chmod +x scripts/backup.sh
	@./scripts/backup.sh

restore: ## Restaurar base de datos (usar: make restore FILE=backups/archivo.dump)
	@echo "$(YELLOW)🔄 Restaurando desde $(FILE)...$(NC)"
	@chmod +x scripts/restore.sh
	@./scripts/restore.sh $(FILE)

# Limpieza
clean: ## Limpiar contenedores y volúmenes
	@echo "$(YELLOW)🧹 Limpiando contenedores y volúmenes...$(NC)"
	$(DOCKER_COMPOSE) down -v
	@echo "$(GREEN)✅ Limpieza completada$(NC)"

clean-all: ## Limpiar todo (contenedores, volúmenes e imágenes)
	@echo "$(YELLOW)🧹 Limpiando todo...$(NC)"
	$(DOCKER_COMPOSE) down -v --rmi all
	@echo "$(GREEN)✅ Limpieza completada$(NC)"

# Documentación
docs: ## Abrir documentación de la API
	@echo "$(GREEN)📖 Abriendo documentación en: http://localhost/api/docs$(NC)"
	@open http://localhost/api/docs 2>/dev/null || xdg-open http://localhost/api/docs 2>/dev/null || echo "Abre manualmente: http://localhost/api/docs"

# Estado
status: ## Ver estado completo del proyecto
	@echo "$(GREEN)📊 Estado del proyecto:$(NC)"
	@echo ""
	@echo "Contenedores:"
	@$(DOCKER_COMPOSE) ps
	@echo ""
	@echo "Volúmenes:"
	@docker volume ls | grep evidencias
	@echo ""
	@echo "Últimos logs de la API:"
	@$(DOCKER_COMPOSE) logs --tail=10 api
