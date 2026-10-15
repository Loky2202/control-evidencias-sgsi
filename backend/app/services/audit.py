"""
Servicio de registro de auditoría.
Registra todas las acciones importantes del sistema.

IMPORTANTE: log_action es atómico - no hace commit propio.
Debe ejecutarse dentro de la misma transacción que la operación principal.
"""
from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Session
from app.models.audit import AuditLog


def log_action(
    db: Session,
    action: str,
    resource_type: Optional[str] = None,
    resource_id: Optional[int] = None,
    description: Optional[str] = None,
    details: Optional[str] = None,
    user_email: Optional[str] = None,
    user_role: Optional[str] = None,
    ip_address: Optional[str] = None,
    user_agent: Optional[str] = None,
) -> AuditLog:
    """
    Registra una acción en el log de auditoría.
    
    ATÓMICO: No hace commit propio. Debe ejecutarse dentro de la misma
    transacción que la operación principal. El commit lo hace el caller.
    
    Args:
        db: Sesión de base de datos (misma transacción)
        action: Tipo de acción (create, update, delete, login, download)
        resource_type: Tipo de recurso (submission, attachment, policy, etc.)
        resource_id: ID del recurso
        description: Descripción de la acción
        details: Detalles adicionales (JSON string)
        user_email: Email del usuario
        user_role: Rol del usuario
        ip_address: IP del cliente
        user_agent: User agent del cliente
    
    Returns:
        AuditLog: Instancia creada (aún no commiteada)
    """
    audit_log = AuditLog(
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        description=description,
        details=details,
        user_email=user_email,
        user_role=user_role,
        ip_address=ip_address,
        user_agent=user_agent,
    )
    
    db.add(audit_log)
    # NO hacer commit aquí - es atómico con la operación principal
    return audit_log


def get_request_context(request) -> dict:
    """
    Extrae contexto de la request para auditoría.
    
    Args:
        request: FastAPI Request object
    
    Returns:
        dict con ip_address y user_agent
    """
    # Obtener IP real (considerando proxies)
    ip_address = request.client.host if request.client else None
    
    # Si hay proxy, usar X-Forwarded-For
    forwarded_for = request.headers.get("X-Forwarded-For")
    if forwarded_for:
        ip_address = forwarded_for.split(",")[0].strip()
    
    user_agent = request.headers.get("User-Agent", "")[:500]  # Limitar longitud
    
    return {
        "ip_address": ip_address,
        "user_agent": user_agent,
    }
