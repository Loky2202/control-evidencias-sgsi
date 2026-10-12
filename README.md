# Evidencias ISO 27001

Sistema de gestión de evidencias para controles ISO 27001, construido con FastAPI, React, PostgreSQL y Docker.

## 🚀 Inicio Rápido

### Prerrequisitos
- Docker Engine 24+ o Docker Desktop
- Docker Compose v2+
- Git 2.30+

### Instalación

1. **Clonar el repositorio:**
```bash
git clone https://github.com/tu-organizacion/evidencias-iso.git
cd evidencias-iso
```

2. **Configurar variables de entorno:**
```bash
cp .env.example .env
# Editar .env con tus valores (contraseñas, dominios, etc.)
```

3. **Levantar los servicios:**
```bash
docker compose up --build -d
```

4. **Verificar que todo está corriendo:**
```bash
docker compose ps
```

5. **Cargar datos iniciales (opcional):**
```bash
docker compose exec api python scripts/import_excel.py
```

6. **Acceder a la aplicación:**
- Frontend: `https://evidencias.lan`
- API Docs: `https://evidencias.lan/api/docs`

## 📁 Estructura del Proyecto

```
evidencias-iso/
├── backend/                    # API FastAPI
│   ├── app/
│   │   ├── models/            # Modelos SQLAlchemy
│   │   ├── schemas/           # Schemas Pydantic
│   │   ├── routers/           # Endpoints REST
│   │   ├── services/          # Lógica de negocio
│   │   ├── auth/              # Autenticación JWT
│   │   ├── main.py            # Punto de entrada
│   │   ├── config.py          # Configuración
│   │   └── db.py              # Conexión BD
│   ├── alembic/               # Migraciones
│   ├── tests/                 # Pruebas pytest
│   ├── scripts/               # Scripts de mantenimiento
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/                   # React + Vite
│   ├── src/
│   │   ├── pages/             # Páginas (Dashboard, Policies, etc.)
│   │   ├── api/               # Cliente API
│   │   ├── auth/              # Configuración MSAL
│   │   └── App.tsx
│   ├── Dockerfile
│   ├── Caddyfile
│   └── package.json
├── db/
│   └── init/                  # Scripts de inicialización BD
├── scripts/                    # Scripts de mantenimiento
│   ├── backup.sh
│   └── restore.sh
├── docker-compose.yml          # Orquestación principal
├── docker-compose.override.yml # Configuración desarrollo
└── .env.example                # Plantilla variables de entorno
```

## 🔧 Desarrollo Local

### Levantar en modo desarrollo (con recarga automática):
```bash
docker compose -f docker-compose.yml -f docker-compose.override.yml up --build
```

### Frontend con Vite (recarga en caliente):
```bash
cd frontend
npm install
npm run dev
```

### Ver logs en vivo:
```bash
docker compose logs -f api
```

## 🧪 Pruebas

### Ejecutar pruebas de la API (pytest):
```bash
docker compose exec api pytest
```

### Pruebas con cobertura:
```bash
docker compose exec api pytest --cov=app --cov-report=term-missing
```

## 🗄️ Base de Datos

### Conectar a la base de datos:
```bash
docker compose exec db psql -U evidencias_owner -d evidencias
```

### Crear una nueva migración:
```bash
docker compose exec api alembic revision --autogenerate -m "descripción del cambio"
```

### Aplicar migraciones pendientes:
```bash
docker compose exec api alembic upgrade head
```

## 💾 Respaldos y Restauración

### Crear un respaldo manual:
```bash
./scripts/backup.sh
```

### Programar respaldos diarios (cron):
```bash
crontab -e
# Agregar esta línea para respaldar a las 2:00 AM:
0 2 * * * cd /ruta/al/proyecto && ./scripts/backup.sh
```

### Restaurar desde un respaldo:
```bash
./scripts/restore.sh backups/evidencias_2024-01-15.dump
```

## 📊 Endpoints de la API

- `GET /api/policies` - Listar políticas
- `GET /api/policies/{code}` - Obtener política
- `GET /api/requirements` - Listar requisitos con estado
- `GET /api/requirements/{id}` - Obtener requisito
- `POST /api/submissions` - Crear entrega
- `GET /api/submissions/{id}` - Obtener entrega
- `GET /api/dashboard` - Tablero de cumplimiento
- `GET /api/docs` - Documentación Swagger

## 🔐 Configuración de Seguridad

### Microsoft Entra ID (opcional)
1. Registrar aplicación en Azure AD
2. Configurar URI de redirección: `https://evidencias.lan/`
3. Copiar Tenant ID y Client ID al `.env`

### SharePoint (opcional)
1. Registrar aplicación con permisos `Sites.Selected`
2. Obtener Site ID y Drive ID
3. Generar Client Secret
4. Configurar en `.env`

## 🛠️ Comandos Útiles

| Comando | Descripción |
|---------|-------------|
| `docker compose up -d` | Levantar servicios |
| `docker compose down` | Detener servicios |
| `docker compose restart api` | Reiniciar solo la API |
| `docker compose logs -f api` | Ver logs en vivo |
| `docker compose exec api bash` | Entrar al contenedor |
| `docker compose ps` | Ver estado de contenedores |
| `docker compose up --build` | Reconstruir y levantar |
| `docker volume ls` | Ver volúmenes de datos |

## 📝 Notas de Decisiones Técnicas

Ver `docs/decisiones/` para detalles sobre:
- Por qué PostgreSQL
- Por qué FastAPI
- Por qué React + Vite
- Por qué Docker Compose
- Por qué Caddy
- Por qué Entra ID
- Por qué Sites.Selected
- Y más...

## 📄 Licencia

Proyecto interno para gestión de evidencias ISO 27001.

---

**Documentación técnica completa disponible en la aplicación web.**
