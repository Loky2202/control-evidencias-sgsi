"""
Servicio de política de retención de evidencias.
Gestiona el ciclo de vida de las evidencias según políticas de retención.

Política de retención (configurable):
- Evidencias completas: 7 años (regulaciones ISO)
- Evidencias rechazadas: 2 años
- Evidencias pendientes: 1 año
- Logs de auditoría: 10 años (no se eliminan automáticamente)
"""
from datetime import datetime, timedelta
from typing import Dict, List
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.models.submission import Submission
from app.models.attachment import Attachment
from app.models.audit import AuditLog
from app.config import settings


# Períodos de retención en años
RETENTION_PERIODS = {
    "completa": 7,      # Evidencias aprobadas/completas
    "rechazada": 2,     # Evidencias rechazadas
    "pendiente": 1,     # Evidencias pendientes sin actividad
    "audit_log": 10,    # Logs de auditoría (regulación)
}


def get_retention_policy() -> Dict[str, int]:
    """
    Obtiene la política de retención actual.
    
    Returns:
        Dict con tipo de evidencia y años de retención
    """
    return RETENTION_PERIODS.copy()


def get_expiring_submissions(db: Session, days_ahead: int = 30) -> List[Submission]:
    """
    Obtiene las entregas que están próximas a expirar según la política de retención.
    
    Args:
        db: Sesión de base de datos
        days_ahead: Días de anticipación para alertar
    
    Returns:
        Lista de entregas próximas a expirar
    """
    today = datetime.utcnow()
    
    # Calcular fechas de expiración según el estado
    submissions = []
    
    # Evidencias completas (7 años)
    cutoff_completa = today - timedelta(days=RETENTION_PERIODS["completa"] * 365)
    alerta_completa = cutoff_completa + timedelta(days=days_ahead)
    
    completa_query = db.query(Submission).filter(
        and_(
            Submission.status == "Completa",
            Submission.created_at <= alerta_completa,
            Submission.created_at > cutoff_completa
        )
    ).all()
    submissions.extend(completa_query)
    
    # Evidencias rechazadas (2 años)
    cutoff_rechazada = today - timedelta(days=RETENTION_PERIODS["rechazada"] * 365)
    alerta_rechazada = cutoff_rechazada + timedelta(days=days_ahead)
    
    rechazada_query = db.query(Submission).filter(
        and_(
            Submission.status == "Rechazada",
            Submission.created_at <= alerta_rechazada,
            Submission.created_at > cutoff_rechazada
        )
    ).all()
    submissions.extend(rechazada_query)
    
    # Evidencias pendientes (1 año)
    cutoff_pendiente = today - timedelta(days=RETENTION_PERIODS["pendiente"] * 365)
    alerta_pendiente = cutoff_pendiente + timedelta(days=days_ahead)
    
    pendiente_query = db.query(Submission).filter(
        and_(
            Submission.status == "Pendiente",
            Submission.created_at <= alerta_pendiente,
            Submission.created_at > cutoff_pendiente
        )
    ).all()
    submissions.extend(pendiente_query)
    
    return submissions


def cleanup_expired_submissions(db: Session, dry_run: bool = True) -> Dict[str, int]:
    """
    Elimina las entregas que han excedido su período de retención.
    
    Args:
        db: Sesión de base de datos
        dry_run: Si True, solo simula la eliminación (no borra realmente)
    
    Returns:
        Dict con estadísticas de la limpieza
    """
    today = datetime.utcnow()
    stats = {
        "completa_deleted": 0,
        "rechazada_deleted": 0,
        "pendiente_deleted": 0,
        "attachments_deleted": 0,
        "dry_run": dry_run,
    }
    
    # Evidencias completas (7 años)
    cutoff_completa = today - timedelta(days=RETENTION_PERIODS["completa"] * 365)
    completa_expired = db.query(Submission).filter(
        and_(
            Submission.status == "Completa",
            Submission.created_at <= cutoff_completa
        )
    ).all()
    
    for submission in completa_expired:
        # Contar adjuntos
        attachments_count = db.query(Attachment).filter(
            Attachment.submission_id == submission.id
        ).count()
        stats["attachments_deleted"] += attachments_count
        
        if not dry_run:
            # Eliminar adjuntos primero
            db.query(Attachment).filter(
                Attachment.submission_id == submission.id
            ).delete()
            # Eliminar entrega
            db.delete(submission)
        
        stats["completa_deleted"] += 1
    
    # Evidencias rechazadas (2 años)
    cutoff_rechazada = today - timedelta(days=RETENTION_PERIODS["rechazada"] * 365)
    rechazada_expired = db.query(Submission).filter(
        and_(
            Submission.status == "Rechazada",
            Submission.created_at <= cutoff_rechazada
        )
    ).all()
    
    for submission in rechazada_expired:
        attachments_count = db.query(Attachment).filter(
            Attachment.submission_id == submission.id
        ).count()
        stats["attachments_deleted"] += attachments_count
        
        if not dry_run:
            db.query(Attachment).filter(
                Attachment.submission_id == submission.id
            ).delete()
            db.delete(submission)
        
        stats["rechazada_deleted"] += 1
    
    # Evidencias pendientes (1 año)
    cutoff_pendiente = today - timedelta(days=RETENTION_PERIODS["pendiente"] * 365)
    pendiente_expired = db.query(Submission).filter(
        and_(
            Submission.status == "Pendiente",
            Submission.created_at <= cutoff_pendiente
        )
    ).all()
    
    for submission in pendiente_expired:
        attachments_count = db.query(Attachment).filter(
            Attachment.submission_id == submission.id
        ).count()
        stats["attachments_deleted"] += attachments_count
        
        if not dry_run:
            db.query(Attachment).filter(
                Attachment.submission_id == submission.id
            ).delete()
            db.delete(submission)
        
        stats["pendiente_deleted"] += 1
    
    # Commit si no es dry_run
    if not dry_run and (stats["completa_deleted"] + stats["rechazada_deleted"] + stats["pendiente_deleted"]) > 0:
        db.commit()
    
    return stats


def get_retention_summary(db: Session) -> Dict:
    """
    Obtiene un resumen del estado de retención de evidencias.
    
    Args:
        db: Sesión de base de datos
    
    Returns:
        Dict con resumen de retención
    """
    today = datetime.utcnow()
    
    summary = {
        "policy": RETENTION_PERIODS,
        "counts": {},
        "expiring_soon": {},
    }
    
    # Contar por estado
    for status_type in ["Completa", "Rechazada", "Pendiente"]:
        count = db.query(Submission).filter(Submission.status == status_type).count()
        summary["counts"][status_type] = count
    
    # Contar próximas a expirar (en los próximos 90 días)
    days_ahead = 90
    
    # Completas
    cutoff = today - timedelta(days=RETENTION_PERIODS["completa"] * 365)
    alerta = cutoff + timedelta(days=days_ahead)
    expiring = db.query(Submission).filter(
        and_(
            Submission.status == "Completa",
            Submission.created_at <= alerta,
            Submission.created_at > cutoff
        )
    ).count()
    summary["expiring_soon"]["Completa"] = expiring
    
    # Rechazadas
    cutoff = today - timedelta(days=RETENTION_PERIODS["rechazada"] * 365)
    alerta = cutoff + timedelta(days=days_ahead)
    expiring = db.query(Submission).filter(
        and_(
            Submission.status == "Rechazada",
            Submission.created_at <= alerta,
            Submission.created_at > cutoff
        )
    ).count()
    summary["expiring_soon"]["Rechazada"] = expiring
    
    # Pendientes
    cutoff = today - timedelta(days=RETENTION_PERIODS["pendiente"] * 365)
    alerta = cutoff + timedelta(days=days_ahead)
    expiring = db.query(Submission).filter(
        and_(
            Submission.status == "Pendiente",
            Submission.created_at <= alerta,
            Submission.created_at > cutoff
        )
    ).count()
    summary["expiring_soon"]["Pendiente"] = expiring
    
    # Total de audit logs
    summary["audit_logs_total"] = db.query(AuditLog).count()
    
    return summary
