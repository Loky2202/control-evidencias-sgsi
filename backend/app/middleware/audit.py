"""
Middleware de auditoría.
Captura automáticamente eventos de login, descargas y otras acciones.
"""
import time
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from sqlalchemy.orm import Session

from app.db import SessionLocal
from app.services.audit import log_action


class AuditMiddleware(BaseHTTPMiddleware):
    """
    Middleware que registra automáticamente:
    - Logins exitosos (POST /auth/login con status 200)
    - Descargas de archivos (GET con Content-Disposition: attachment)
    - Errores de autenticación (401/403)
    """
    
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        
        # Procesar la request
        response = await call_next(request)
        
        # Determinar si debemos auditar esta request
        should_audit = False
        action = None
        description = None
        
        path = request.url.path
        method = request.method
        status_code = response.status_code
        
        # 1. Login exitoso
        if path.endswith("/auth/login") and method == "POST" and status_code == 200:
            should_audit = True
            action = "login"
            description = "Inicio de sesión exitoso"
        
        # 2. Descarga de archivo
        elif method == "GET" and response.headers.get("Content-Disposition", "").startswith("attachment"):
            should_audit = True
            action = "download"
            description = f"Descarga de archivo: {path}"
        
        # 3. Error de autenticación
        elif status_code in (401, 403):
            should_audit = True
            action = "auth_failure"
            description = f"Fallo de autenticación ({status_code}) en {method} {path}"
        
        # 4. Exportación de reportes
        elif path.endswith("/export") and method == "GET" and status_code == 200:
            should_audit = True
            action = "export"
            description = f"Exportación de reporte: {path}"
        
        # Registrar en auditoría si es necesario
        if should_audit:
            # Extraer información del usuario si está autenticado
            user_email = None
            user_role = None
            
            # Intentar obtener el usuario del header de autorización
            auth_header = request.headers.get("Authorization", "")
            if auth_header.startswith("Bearer "):
                # En un sistema real, aquí decodificaríamos el token
                # Por ahora, usamos valores placeholder
                user_email = "authenticated_user"
                user_role = "user"
            
            # Extraer IP y user-agent
            ip_address = request.client.host if request.client else None
            forwarded_for = request.headers.get("X-Forwarded-For")
            if forwarded_for:
                ip_address = forwarded_for.split(",")[0].strip()
            
            user_agent = request.headers.get("User-Agent", "")[:500]
            
            # Crear sesión de BD para auditoría
            db: Session = SessionLocal()
            try:
                log_action(
                    db=db,
                    action=action,
                    resource_type="system",
                    description=description,
                    user_email=user_email,
                    user_role=user_role,
                    ip_address=ip_address,
                    user_agent=user_agent,
                    details=f"method={method}, path={path}, status={status_code}, duration={time.time() - start_time:.3f}s"
                )
                db.commit()
            except Exception as e:
                # No fallar la request si la auditoría falla
                db.rollback()
                print(f"Error al registrar auditoría: {e}")
            finally:
                db.close()
        
        return response
