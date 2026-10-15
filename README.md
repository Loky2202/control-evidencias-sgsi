# Evidencias ISO 27001

Sistema de gestión de evidencias para controles ISO 27001, construido con FastAPI, React, PostgreSQL y Docker.

![Dashboard](docs/screenshots/dashboard.png)

## 📋 Descripción

Aplicación web para gestionar el cumplimiento de controles ISO 27001 mediante:

- **Gestión de políticas** de seguridad de la información
- **Seguimiento de requisitos** con cálculo automático de vencimientos
- **Aprobación de evidencias** con flujo de trabajo auditor-usuario
- **Declaración de Aplicabilidad (SoA)** con mapeo de controles
- **Auditoría completa** con logs inmutables
- **Política de retención** configurable según regulaciones

## 🚀 Inicio Rápido

### Prerrequisitos

- Docker Engine 24+ o Docker Desktop
- Docker Compose v2+
- Git 2.30+

### Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/your-organization/evidencias-iso.git
cd evidencias-iso

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus valores (contraseñas, dominios, credenciales Entra ID)

# 3. Levantar los servicios
docker compose up --build -d

# 4. Verificar que todo está corriendo
docker compose ps

# 5. Cargar datos iniciales (opcional)
docker compose exec api python scripts/import_excel.py
```

### Acceso a la Aplicación

- **Frontend**: https://localhost (o el dominio configurado en APP_HOST)
- **API Docs**: https://localhost/api/docs (solo en desarrollo)
- **Health Check**: https://localhost/api/health

## 📁 Estructura del Proyecto

```
evidencias-iso/
├── backend/                    # API FastAPI (Python 3.12)
│   ├── app/
│   │   ├── models/            # Modelos SQLAlchemy
│   │   ├── schemas/           # Schemas Pydantic
│   │   ├── routers/           # Endpoints REST
│   │   ├── services/          # Lógica de negocio
│   │   ├── auth/              # Autenticación JWT con JWKS
│   │   ├── middleware/        # Middleware de auditoría
│   │   ├── main.py            # Punto de entrada
│   │   ├── config.py          # Configuración
│   │   └── db.py              # Conexión BD
│   ├── alembic/               # Migraciones de BD
│   ├── tests/                 # Pruebas pytest
│   ├── scripts/               # Scripts de mantenimiento
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/                   # React + Vite + TypeScript
│   ├── src/
│   │   ├── pages/             # Páginas (Dashboard, Policies, etc.)
│   │   ├── api/               # Cliente API con TanStack Query
│   │   ├── auth/              # Configuración MSAL
│   │   └── App.tsx
│   ├── Dockerfile
│   ├── Caddyfile
│   └── package.json
├── docs-web/                   # App de documentación web
│   ├── src/                   # Componentes React
│   └── package.json
├── docs/                       # Documentación del proyecto
│   ├── decisiones/            # Notas de decisiones técnicas
│   ├── workflows/             # Flujos de trabajo y roles
│   ├── policies/              # Políticas de retención
│   ├── security/              # Configuración de seguridad
│   └── screenshots/           # Capturas de pantalla
├── db/
│   └── init/                  # Scripts de inicialización BD
├── scripts/                    # Scripts de mantenimiento
│   ├── backup.sh
│   ├── restore.sh
│   ├── cleanup_retention.sh
│   └── setup.sh
├── docker-compose.yml          # Orquestación principal
├── docker-compose.override.yml # Configuración desarrollo
├── Makefile                    # Comandos útiles
├── LICENSE                     # MIT License
└── .env.example                # Plantilla variables de entorno
```

## 🔧 Desarrollo Local

### Levantar en modo desarrollo (con recarga automática)

```bash
docker compose -f docker-compose.yml -f docker-compose.override.yml up --build
```

### Frontend con Vite (recarga en caliente)

```bash
cd frontend
npm install
npm run dev
```

### Ver logs en vivo

```bash
docker compose logs -f api
```

## 🧪 Pruebas

### Ejecutar pruebas de la API (pytest)

```bash
docker compose exec api pytest -v
```

### Pruebas con cobertura

```bash
docker compose exec api pytest --cov=app --cov-report=term-missing
```

### Pruebas del frontend (Vitest)

```bash
cd frontend
npm test
```

## 🗄️ Base de Datos

### Conectar a la base de datos

```bash
docker compose exec db psql -U evidencias_owner -d evidencias
```

### Crear una nueva migración

```bash
docker compose exec api alembic revision --autogenerate -m "descripción del cambio"
```

### Aplicar migraciones pendientes

```bash
docker compose exec api alembic upgrade head
```

## 💾 Respaldos y Restauración

### Crear un respaldo manual

```bash
./scripts/backup.sh
```

### Programar respaldos diarios (cron)

```bash
crontab -e
# Agregar esta línea para respaldar a las 2:00 AM:
0 2 * * * cd /ruta/al/proyecto && ./scripts/backup.sh
```

### Restaurar desde un respaldo

```bash
./scripts/restore.sh backups/evidencias_2024-01-15.dump
```

## 📊 Endpoints de la API

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/policies` | Listar políticas |
| GET | `/api/policies/{code}` | Obtener política |
| POST | `/api/policies` | Crear política (admin) |
| PUT | `/api/policies/{code}` | Actualizar política (admin) |
| DELETE | `/api/policies/{code}` | Eliminar política (admin) |
| GET | `/api/requirements` | Listar requisitos con estado |
| GET | `/api/requirements/{id}` | Obtener requisito |
| POST | `/api/requirements` | Crear requisito (admin) |
| PUT | `/api/requirements/{id}` | Actualizar requisito (admin) |
| DELETE | `/api/requirements/{id}` | Eliminar requisito (admin) |
| GET | `/api/controls` | Listar controles ISO 27001 |
| POST | `/api/controls` | Crear control (admin) |
| GET | `/api/submissions` | Listar entregas (paginado) |
| POST | `/api/submissions` | Crear entrega |
| PATCH | `/api/submissions/{id}` | Aprobar/rechazar (auditor/admin) |
| POST | `/api/submissions/{id}/attachments` | Subir archivo |
| DELETE | `/api/submissions/{id}` | Eliminar entrega (admin) |
| GET | `/api/dashboard` | Tablero de cumplimiento |
| GET | `/api/soa` | Declaración de Aplicabilidad |
| GET | `/api/soa/export` | Exportar SoA (CSV) |
| GET | `/api/reports/audit-log/excel` | Exportar audit log (Excel) |
| GET | `/api/reports/audit-log/pdf` | Exportar audit log (PDF) |
| GET | `/api/reports/submissions/excel` | Exportar entregas (Excel) |
| GET | `/api/reports/retention/policy` | Política de retención |
| GET | `/api/reports/retention/summary` | Resumen de retención |
| POST | `/api/reports/retention/cleanup` | Limpieza de evidencias (admin) |
| GET | `/api/docs` | Documentación Swagger (solo dev) |

## 🔐 Configuración de Seguridad

### Microsoft Entra ID (Azure AD)

1. Registrar aplicación en Azure AD
2. Configurar URI de redirección: `https://evidencias.lan/`
3. Exponer API con scope personalizado: `api://<client-id>/access`
4. Crear App Roles: admin, auditor, user
5. Copiar Tenant ID y Client ID al `.env`

Ver guía completa: [docs/security/entra-id-setup.md](docs/security/entra-id-setup.md)

### SharePoint (opcional)

1. Registrar aplicación con permisos `Sites.Selected`
2. Obtener Site ID y Drive ID
3. Generar Client Secret
4. Configurar en `.env`

## 📚 Documentación

### Notas de Decisiones Técnicas

- [Por qué PostgreSQL](docs/decisiones/01-postgresql.md)
- [Por qué FastAPI](docs/decisiones/02-fastapi.md)
- [Por qué React + Vite + TypeScript](docs/decisiones/03-react-vite-typescript.md)
- [Por qué Docker Compose](docs/decisiones/04-docker-compose.md)
- [Por qué Entra ID y Sites.Selected](docs/decisiones/05-entra-id-sites-selected.md)

### Flujos de Trabajo

- [Flujo de Aprobación de Evidencias](docs/workflows/approval-flow.md)
- [Roles y Permisos](docs/workflows/roles.md)

### Políticas

- [Política de Retención de Evidencias](docs/policies/retention-policy.md)

### Capturas de Pantalla

- [Dashboard](docs/screenshots/dashboard.png)
- [Políticas](docs/screenshots/policies.png)
- [SoA](docs/screenshots/soa.png)

## 🛠️ Comandos Útiles (Makefile)

```bash
make help              # Mostrar ayuda
make setup             # Setup inicial del proyecto
make dev               # Levantar en modo desarrollo
make build             # Construir imágenes Docker
make up                # Levantar servicios
make down              # Detener servicios
make restart           # Reiniciar servicios
make logs              # Ver logs de todos los servicios
make logs-api          # Ver logs de la API
make test              # Ejecutar tests del backend
make test-cov          # Ejecutar tests con cobertura
make migrate           # Aplicar migraciones pendientes
make backup            # Crear respaldo de la base de datos
make restore FILE=...  # Restaurar base de datos
make audit             # Ejecutar auditorías de seguridad
make clean             # Limpiar contenedores y volúmenes
```

## 📈 Características Implementadas

### ✅ Fase 1: Bloqueantes
- [x] .gitignore configurado
- [x] Scripts con shebang correcto
- [x] package-lock.json generado
- [x] AUTH_DISABLED=false en .env.example

### ✅ Fase 2: Seguridad
- [x] Validación JWT con PyJWT + JWKS
- [x] Scope propio (api://client/access)
- [x] Autenticación en todos los endpoints
- [x] Roles: admin/auditor/user
- [x] Docs deshabilitados en producción
- [x] Separación dev/prod deps

### ✅ Fase 3: Funcionalidad
- [x] PATCH /submissions (aprobar/rechazar)
- [x] POST /submissions/attachments
- [x] SharePoint: token renewal + sanitization
- [x] CRUD completo: policies, requirements, controls
- [x] SoA (Statement of Applicability)
- [x] Frontend: formularios + upload

### ✅ Fase 4: Auditoría ISO
- [x] Registro completo en audit_log con IP y user-agent
- [x] log_action atómico con la operación principal
- [x] REVOKE UPDATE/DELETE sobre audit_log
- [x] Exportar reportes (PDF y Excel)
- [x] Política de retención de evidencias

### ✅ Fase 5: Calidad y Rendimiento
- [x] Eliminar N+1 en dashboard y requisitos
- [x] Paginación en GET /submissions
- [x] Tests reescritos con dependency_overrides
- [x] Tests de tokens falsos corregidos
- [x] Reemplazar add_months por dateutil.relativedelta
- [x] GitHub Actions CI/CD
- [x] Tests del frontend con Vitest

### ✅ Fase 6: Orden y Documentación
- [x] Separar app de documentación en docs-web/
- [x] README corregido con URL real
- [x] docs/decisiones/ creado con notas
- [x] LICENSE MIT agregado
- [x] Capturas de pantalla generadas
- [x] Flujo de aprobación documentado
- [x] Roles y permisos documentados

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver [LICENSE](LICENSE) para más detalles.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📞 Contacto

Para preguntas o soporte:
- **Documentación**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/your-organization/evidencias-iso/issues)

---

**Desarrollado con ❤️ para el cumplimiento ISO 27001**
