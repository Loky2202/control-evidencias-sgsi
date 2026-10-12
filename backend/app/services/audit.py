"""
Servicio de registro de auditoría.
Registra todas las acciones importantes del sistema.
"""
from sqlalchemy.orm import Session
from app.models.audit import AuditLog


def log_action(
    db: Session,
    action: str,
    resource_type: str = None,
    resource_id: int = None,
    description: str = None,
    details: str = None,
    user_email: str = None,
    user_role: str = None,
    ip_address: str = None,
    user_agent: str = None,
):
    """
    Registra una acción en el log de auditoría.
    
    Args:
        db: Sesión de base de datos
        action: Tipo de acción (create, update, delete, login)
        resource_type: Tipo de recurso (submission, attachment, policy, etc.)
        resource_id: ID del recurso
        description: Descripción de la acción
        details: Detalles adicionales (JSON)
        user_email: Email del usuario
        user_role: Rol del usuario
        ip_address: IP del cliente
        user_agent: User agent del cliente
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
    db.commit()
