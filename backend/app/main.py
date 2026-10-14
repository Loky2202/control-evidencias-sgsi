"""
Punto de entrada de la API FastAPI.
Crea la aplicación y registra todos los routers.

Seguridad:
- En producción, se deshabilita /api/docs y /api/openapi.json
- CORS solo se habilita en desarrollo
- Se registran todos los routers con autenticación obligatoria
"""
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.routers import policies, requirements, submissions, dashboard

# Configurar logging
logging.basicConfig(
    level=logging.INFO if settings.is_production else logging.DEBUG,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle de la aplicación"""
    logger.info(f"Iniciando API en entorno: {settings.ENVIRONMENT}")
    logger.info(f"AUTH_DISABLED: {settings.AUTH_DISABLED}")
    
    if settings.is_production:
        logger.info("🔒 Modo producción: docs deshabilitados")
    else:
        logger.info("🔧 Modo desarrollo: docs disponibles en /api/docs")
    
    yield
    
    logger.info("API apagándose...")


# Crear la aplicación FastAPI
# En producción: docs_url=None, openapi_url=None (deshabilitados)
# En desarrollo: docs disponibles
app = FastAPI(
    title="Evidencias ISO 27001 API",
    description="API para gestión de evidencias de controles ISO 27001",
    version="1.0.0",
    docs_url=None if settings.is_production else "/api/docs",
    openapi_url=None if settings.is_production else "/api/openapi.json",
    redoc_url=None if settings.is_production else "/api/redoc",
    lifespan=lifespan,
)

# Configurar CORS (solo en desarrollo)
if not settings.is_production:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    logger.info(f"CORS habilitado para: {settings.cors_origins_list}")

# Middleware de seguridad: agregar headers de seguridad
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    """Agrega headers de seguridad a todas las respuestas"""
    response = await call_next(request)
    
    # Headers de seguridad
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    
    # En producción, agregar headers adicionales
    if settings.is_production:
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Content-Security-Policy"] = "default-src 'self'"
    
    return response


# Manejo global de errores
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Manejador global de errores no capturados"""
    logger.error(f"Error no capturado: {str(exc)}", exc_info=True)
    
    # En producción, no exponer detalles del error
    if settings.is_production:
        return JSONResponse(
            status_code=500,
            content={"detail": "Error interno del servidor"},
        )
    
    # En desarrollo, mostrar detalles
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc), "type": type(exc).__name__},
    )


# Registrar routers con prefijo /api
# Todos los endpoints requieren autenticación
app.include_router(policies.router, prefix="/api", tags=["policies"])
app.include_router(requirements.router, prefix="/api", tags=["requirements"])
app.include_router(submissions.router, prefix="/api", tags=["submissions"])
app.include_router(dashboard.router, prefix="/api", tags=["dashboard"])


@app.get("/api/health")
def health_check():
    """
    Endpoint de verificación de salud.
    NO requiere autenticación (usado por healthchecks de Docker/Kubernetes).
    """
    return {
        "status": "healthy",
        "version": "1.0.0",
        "environment": settings.ENVIRONMENT,
    }


@app.get("/")
def root():
    """
    Endpoint raíz.
    En producción no devuelve información sensible.
    """
    if settings.is_production:
        return {"status": "ok"}
    
    return {
        "message": "API de Evidencias ISO 27001",
        "docs": "/api/docs",
        "health": "/api/health",
    }
