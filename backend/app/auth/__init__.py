"""
Módulo de autenticación.

Componentes:
- dependencies: Dependencias de FastAPI para validación JWT
- jwks: Gestor de JWKS con caché para validación de firmas
"""
from app.auth.dependencies import (
    get_current_user,
    require_role,
    require_admin,
    require_auditor,
    require_authenticated,
    VALID_ROLES,
)
from app.auth.jwks import JWKSManager, get_jwks_manager

__all__ = [
    "get_current_user",
    "require_role",
    "require_admin",
    "require_auditor",
    "require_authenticated",
    "VALID_ROLES",
    "JWKSManager",
    "get_jwks_manager",
]
