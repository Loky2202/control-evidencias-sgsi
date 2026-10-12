"""
Dependencias de autenticación para FastAPI.
Valida tokens JWT de Entra ID.
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.config import settings

security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    """
    Dependency que valida el token JWT y devuelve el usuario actual.
    
    En producción, valida el token con Entra ID.
    En desarrollo con AUTH_DISABLED=True, devuelve un usuario falso.
    
    Returns:
        dict: Datos del usuario (email, name, role)
    
    Raises:
        HTTPException: 401 si el token es inválido
    """
    # Modo desarrollo: usuario falso
    if settings.AUTH_DISABLED:
        return {
            "email": "dev@example.com",
            "name": "Desarrollador",
            "role": "admin",
        }
    
    # En producción: validar token con Entra ID
    token = credentials.credentials
    
    # TODO: Implementar validación real con msal y jose
    # Por ahora, simulamos la validación
    try:
        # Aquí iría la validación real del token
        # decoded = jwt.decode(token, ...)
        
        # Simulamos un usuario válido
        return {
            "email": "user@example.com",
            "name": "Usuario Ejemplo",
            "role": "user",
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token inválido: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )


def require_role(required_role: str):
    """
    Dependency factory que requiere un rol específico.
    
    Usage:
        @router.get("/admin-only")
        def admin_endpoint(user: dict = Depends(require_role("admin"))):
            ...
    """
    async def role_checker(current_user: dict = Depends(get_current_user)):
        if current_user.get("role") != required_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Se requiere rol: {required_role}",
            )
        return current_user
    
    return role_checker
