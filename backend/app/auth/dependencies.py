"""
Dependencias de autenticación para FastAPI.
Valida tokens JWT de Entra ID usando PyJWT con JWKS.

Seguridad:
- Valida firma con claves públicas de Microsoft (JWKS)
- Valida claims: aud, iss, exp, nbf, iat
- Mapea roles desde el claim 'roles' o 'groups' del token
- Thread-safe con caché de claves
"""
import logging
from typing import Optional

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.config import settings
from app.auth.jwks import get_jwks_manager

logger = logging.getLogger(__name__)

security = HTTPBearer(auto_error=False)


# Roles válidos en el sistema
VALID_ROLES = {"admin", "auditor", "user"}

# Mapeo de grupos de Azure AD a roles de la aplicación
# Configurar en .env: AZURE_AD_GROUP_ADMIN, AZURE_AD_GROUP_AUDITOR, etc.
ROLE_GROUP_MAPPING = {
    "admin": "Evidencias-ISO-Admin",
    "auditor": "Evidencias-ISO-Auditor",
    "user": "Evidencias-ISO-User",
}


def _extract_roles_from_token(decoded: dict) -> str:
    """
    Extrae el rol del usuario desde el token JWT.
    
    Estrategias (en orden de prioridad):
    1. Claim 'roles' (roles de aplicación registrados en Azure AD)
    2. Claim 'groups' (grupos de Azure AD mapeados a roles)
    3. Default: 'user'
    
    Args:
        decoded: Claims del token decodificado
    
    Returns:
        str: Rol del usuario ('admin', 'auditor', 'user')
    """
    # Estrategia 1: Claim 'roles'
    roles = decoded.get("roles", [])
    if isinstance(roles, list):
        for role in roles:
            if role.lower() in VALID_ROLES:
                return role.lower()
    
    # Estrategia 2: Claim 'groups' (IDs de grupos de Azure AD)
    groups = decoded.get("groups", [])
    if isinstance(groups, list):
        # Aquí se pueden mapear Object IDs de grupos a roles
        # Por ahora, buscamos nombres de grupos si están en el token
        for group in groups:
            if isinstance(group, str):
                for role, group_name in ROLE_GROUP_MAPPING.items():
                    if group_name.lower() in group.lower():
                        return role
    
    # Default: usuario regular
    return "user"


def _extract_user_info(decoded: dict) -> dict:
    """
    Extrae información del usuario desde el token JWT.
    
    Args:
        decoded: Claims del token decodificado
    
    Returns:
        dict: Información del usuario (email, name, role, oid)
    """
    # Extraer email (prioridad: preferred_username > email > upn)
    email = (
        decoded.get("preferred_username")
        or decoded.get("email")
        or decoded.get("upn")
        or "unknown"
    )
    
    # Extraer nombre
    name = decoded.get("name") or email.split("@")[0]
    
    # Extraer Object ID (identificador único en Azure AD)
    oid = decoded.get("oid") or decoded.get("sub")
    
    # Extraer rol
    role = _extract_roles_from_token(decoded)
    
    return {
        "email": email,
        "name": name,
        "role": role,
        "oid": oid,
        "tenant_id": decoded.get("tid"),
    }


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
) -> dict:
    """
    Dependency que valida el token JWT y devuelve el usuario actual.
    
    Flujo de validación:
    1. Si AUTH_DISABLED=True (solo desarrollo), devuelve usuario falso
    2. Extrae el token Bearer del header
    3. Obtiene el 'kid' del header del token
    4. Busca la clave pública en JWKS de Microsoft
    5. Valida firma, audience, issuer, expiración
    6. Extrae información del usuario y rol
    7. Devuelve dict con email, name, role, oid
    
    Returns:
        dict: Datos del usuario (email, name, role, oid, tenant_id)
    
    Raises:
        HTTPException 401: Token ausente, inválido o expirado
        HTTPException 403: Usuario sin permisos
    """
    # Modo desarrollo: usuario falso
    if settings.AUTH_DISABLED:
        logger.debug("AUTH_ENABLED deshabilitado, usando usuario de desarrollo")
        return {
            "email": "dev@example.com",
            "name": "Desarrollador",
            "role": "admin",
            "oid": "dev-oid-0000",
            "tenant_id": "dev-tenant",
        }
    
    # Validar que tenemos credenciales
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de autenticación requerido",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = credentials.credentials
    
    try:
        # Validar token con JWKS de Microsoft
        jwks_manager = get_jwks_manager()
        decoded = jwks_manager.decode_token(
            token=token,
            audience=settings.audience,
            issuer=settings.issuer,
        )
        
        # Extraer información del usuario
        user_info = _extract_user_info(decoded)
        
        logger.info(f"Usuario autenticado: {user_info['email']} (rol: {user_info['role']})")
        return user_info
    
    except jwt.ExpiredSignatureError:
        logger.warning("Token expirado")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expirado, por favor inicia sesión nuevamente",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    except jwt.InvalidAudienceError:
        logger.warning(f"Audience inválido en token")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token no válido para esta API",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    except jwt.InvalidIssuerError:
        logger.warning("Issuer inválido en token")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Emisor del token no reconocido",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    except jwt.InvalidTokenError as e:
        logger.warning(f"Token inválido: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token inválido: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    except Exception as e:
        logger.error(f"Error inesperado al validar token: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Error al validar el token",
            headers={"WWW-Authenticate": "Bearer"},
        )


def require_role(*allowed_roles: str):
    """
    Dependency factory que requiere uno o más roles específicos.
    
    Usage:
        @router.get("/admin-only")
        def admin_endpoint(user: dict = Depends(require_role("admin"))):
            ...
        
        @router.get("/admin-or-auditor")
        def restricted_endpoint(user: dict = Depends(require_role("admin", "auditor"))):
            ...
    
    Args:
        *allowed_roles: Roles permitidos para acceder al endpoint
    
    Returns:
        Dependency function que valida el rol
    """
    async def role_checker(current_user: dict = Depends(get_current_user)):
        user_role = current_user.get("role", "user")
        
        if user_role not in allowed_roles:
            logger.warning(
                f"Acceso denegado: usuario {current_user.get('email')} "
                f"con rol '{user_role}' intentó acceder a endpoint "
                f"que requiere {allowed_roles}"
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Se requiere uno de los roles: {', '.join(allowed_roles)}",
            )
        
        return current_user
    
    return role_checker


# Aliases para roles comunes
require_admin = require_role("admin")
require_auditor = require_role("admin", "auditor")
require_authenticated = get_current_user  # Cualquier usuario autenticado
