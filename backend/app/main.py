"""
Punto de entrada de la API FastAPI.
Crea la aplicación y registra todos los routers.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import policies, requirements, submissions, dashboard

# Crear la aplicación FastAPI
app = FastAPI(
    title="Evidencias ISO 27001 API",
    description="API para gestión de evidencias de controles ISO 27001",
    version="1.0.0",
    docs_url="/api/docs",
    openapi_url="/api/openapi.json",
)

# Configurar CORS (solo necesario en desarrollo)
if settings.ENVIRONMENT == "development":
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:5173", "http://localhost:3000"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Registrar routers con prefijo /api
app.include_router(policies.router, prefix="/api", tags=["policies"])
app.include_router(requirements.router, prefix="/api", tags=["requirements"])
app.include_router(submissions.router, prefix="/api", tags=["submissions"])
app.include_router(dashboard.router, prefix="/api", tags=["dashboard"])


@app.get("/api/health")
def health_check():
    """Endpoint de verificación de salud"""
    return {"status": "healthy", "version": "1.0.0"}


@app.get("/")
def root():
    """Redirige a la documentación"""
    return {"message": "API de Evidencias ISO 27001", "docs": "/api/docs"}
