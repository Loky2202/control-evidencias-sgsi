"""
Servicio de cálculo de fechas de vencimiento.
Determina el estado de cada requisito basado en la última evidencia.
"""
from datetime import date
from typing import Dict
from sqlalchemy.orm import Session

from app.models.submission import Submission


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
    from app.models.requirement import Requirement
    requirement = db.query(Requirement).filter(Requirement.id == requirement_id).first()
    
    if not requirement or requirement.frequency not in FREQUENCY_MONTHS:
        return {
            "last_evidence_date": last_submission.evidence_date,
            "next_due_date": None,
            "alert_status": "Vigente",
        }
    
    # Calcular próxima fecha de vencimiento
    months = FREQUENCY_MONTHS[requirement.frequency]
    last_date = last_submission.evidence_date
    
    # Sumar meses a la fecha
    next_due = add_months(last_date, months)
    
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


def add_months(source_date: date, months: int) -> date:
    """
    Suma meses a una fecha.
    
    Args:
        source_date: Fecha de origen
        months: Número de meses a sumar
    
    Returns:
        Nueva fecha
    """
    month = source_date.month - 1 + months
    year = source_date.year + month // 12
    month = month % 12 + 1
    day = min(source_date.day, [31, 29 if year % 4 == 0 and not (year % 100 == 0 and year % 400 != 0) else 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1])
    return date(year, month, day)
