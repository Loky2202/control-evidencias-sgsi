"""
Servicio de cálculo de fechas de vencimiento.
Determina el estado de cada requisito basado en la última evidencia.

OPTIMIZACIÓN: Usa consultas batch para evitar N+1 en dashboard y requisitos.
"""
from datetime import date
from typing import Dict, List
from sqlalchemy.orm import Session
from sqlalchemy import func, case
from dateutil.relativedelta import relativedelta

from app.models.submission import Submission
from app.models.requirement import Requirement


# Mapeo de frecuencia a meses
FREQUENCY_MONTHS = {
    "Mensual": 1,
    "Trimestral": 3,
    "Semestral": 6,
    "Anual": 12,
    "Continua": 1,
}


def calculate_requirement_status(requirement_id: int, db: Session) -> Dict:
    """
    Calcula el estado de un requisito basado en su última evidencia.
    
    OPTIMIZACIÓN: Para múltiples requisitos, usa calculate_requirements_status_batch().
    
    Args:
        requirement_id: ID del requisito
        db: Sesión de base de datos
    
    Returns:
        Dict con:
            - last_evidence_date: Fecha de la última evidencia (o None)
            - next_due_date: Próxima fecha de vencimiento (o None)
            - alert_status: Estado (Pendiente, Vigente, Por vencer, Vencida)
    """
    # Obtener la última evidencia completa
    last_submission = (
        db.query(Submission)
        .filter(
            Submission.requirement_id == requirement_id,
            Submission.status == "Completa",
        )
        .order_by(Submission.evidence_date.desc())
        .first()
    )
    
    # Si no hay evidencia, está pendiente
    if not last_submission:
        return {
            "last_evidence_date": None,
            "next_due_date": None,
            "alert_status": "Pendiente",
        }
    
    # Obtener el requisito para conocer su frecuencia
    requirement = db.query(Requirement).filter(Requirement.id == requirement_id).first()
    
    if not requirement or requirement.frequency not in FREQUENCY_MONTHS:
        return {
            "last_evidence_date": last_submission.evidence_date,
            "next_due_date": None,
            "alert_status": "Vigente",
        }
    
    # Calcular próxima fecha de vencimiento usando relativedelta
    months = FREQUENCY_MONTHS[requirement.frequency]
    last_date = last_submission.evidence_date
    next_due = last_date + relativedelta(months=months)
    
    # Determinar estado
    today = date.today()
    days_until_due = (next_due - today).days
    
    if days_until_due < 0:
        alert_status = "Vencida"
    elif days_until_due <= 30:
        alert_status = "Por vencer"
    else:
        alert_status = "Vigente"
    
    return {
        "last_evidence_date": last_date,
        "next_due_date": next_due,
        "alert_status": alert_status,
    }


def calculate_requirements_status_batch(requirement_ids: List[int], db: Session) -> Dict[int, Dict]:
    """
    Calcula el estado de múltiples requisitos en UNA SOLA CONSULTA (evita N+1).
    
    OPTIMIZACIÓN: Usa subquery con window function para obtener la última evidencia
    de cada requisito en una sola consulta, en lugar de N consultas separadas.
    
    Args:
        requirement_ids: Lista de IDs de requisitos
        db: Sesión de base de datos
    
    Returns:
        Dict[requirement_id, status_dict] con el estado de cada requisito
    """
    if not requirement_ids:
        return {}
    
    # Obtener requisitos con sus frecuencias
    requirements = (
        db.query(Requirement)
        .filter(Requirement.id.in_(requirement_ids))
        .all()
    )
    
    req_map = {req.id: req for req in requirements}
    
    # Subquery para obtener la última evidencia completa de cada requisito
    # Esto evita N+1: una sola consulta en lugar de N consultas
    latest_submissions_query = (
        db.query(
            Submission.requirement_id,
            func.max(Submission.evidence_date).label('last_evidence_date')
        )
        .filter(
            Submission.requirement_id.in_(requirement_ids),
            Submission.status == "Completa"
        )
        .group_by(Submission.requirement_id)
        .subquery()
    )
    
    # Obtener las últimas evidencias
    latest_submissions = (
        db.query(latest_submissions_query.c.requirement_id, latest_submissions_query.c.last_evidence_date)
        .all()
    )
    
    # Crear mapa de requirement_id -> last_evidence_date
    evidence_map = {row[0]: row[1] for row in latest_submissions}
    
    # Calcular estado para cada requisito
    results = {}
    today = date.today()
    
    for req_id in requirement_ids:
        req = req_map.get(req_id)
        last_evidence_date = evidence_map.get(req_id)
        
        # Si no hay evidencia, está pendiente
        if not last_evidence_date:
            results[req_id] = {
                "last_evidence_date": None,
                "next_due_date": None,
                "alert_status": "Pendiente",
            }
            continue
        
        # Si no hay requisito o frecuencia inválida
        if not req or req.frequency not in FREQUENCY_MONTHS:
            results[req_id] = {
                "last_evidence_date": last_evidence_date,
                "next_due_date": None,
                "alert_status": "Vigente",
            }
            continue
        
        # Calcular próxima fecha usando relativedelta
        months = FREQUENCY_MONTHS[req.frequency]
        next_due = last_evidence_date + relativedelta(months=months)
        
        # Determinar estado
        days_until_due = (next_due - today).days
        
        if days_until_due < 0:
            alert_status = "Vencida"
        elif days_until_due <= 30:
            alert_status = "Por vencer"
        else:
            alert_status = "Vigente"
        
        results[req_id] = {
            "last_evidence_date": last_evidence_date,
            "next_due_date": next_due,
            "alert_status": alert_status,
        }
    
    return results
