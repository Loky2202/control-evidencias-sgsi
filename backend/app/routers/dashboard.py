"""
Router del Tablero (Dashboard).
Endpoint para obtener resumen de estados y cumplimiento.

Seguridad:
- GET: cualquier usuario autenticado (user, auditor, admin)
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.requirement import Requirement
from app.models.policy import Policy
from app.schemas.dashboard import DashboardResponse, StatusCount, PolicySummary
from app.services.due_dates import calculate_requirement_status
from app.auth.dependencies import get_current_user

router = APIRouter()


@router.get("/dashboard", response_model=DashboardResponse)
def get_dashboard(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),  # Requiere autenticación
):
    """
    Obtiene el tablero con resumen de estados y cumplimiento.
    
    Requiere: Cualquier usuario autenticado
    
    Returns:
        DashboardResponse: Resumen del estado de cumplimiento
    """
    # Obtener todos los requisitos
    requirements = db.query(Requirement).all()
    total_requirements = len(requirements)
    
    # Contar por estado
    status_counts = {"Pendiente": 0, "Vigente": 0, "Por vencer": 0, "Vencida": 0}
    
    for req in requirements:
        status_data = calculate_requirement_status(req.id, db)
        alert_status = status_data["alert_status"]
        status_counts[alert_status] = status_counts.get(alert_status, 0) + 1
    
    # Convertir a lista de StatusCount
    status_list = [
        StatusCount(status=status, count=count)
        for status, count in status_counts.items()
    ]
    
    # Resumen por política
    policies = db.query(Policy).all()
    policy_summaries = []
    
    for policy in policies:
        policy_reqs = [r for r in requirements if r.policy_code == policy.code]
        total = len(policy_reqs)
        
        compliant = 0
        for req in policy_reqs:
            status_data = calculate_requirement_status(req.id, db)
            if status_data["alert_status"] in ["Vigente", "Por vencer"]:
                compliant += 1
        
        non_compliant = total - compliant
        compliance_rate = (compliant / total * 100) if total > 0 else 0
        
        policy_summaries.append(
            PolicySummary(
                policy_code=policy.code,
                policy_title=policy.title,
                total_requirements=total,
                compliant=compliant,
                non_compliant=non_compliant,
                compliance_rate=round(compliance_rate, 2),
            )
        )
    
    # Tasa de cumplimiento general
    total_compliant = sum(1 for r in requirements 
                         if calculate_requirement_status(r.id, db)["alert_status"] in ["Vigente", "Por vencer"])
    overall_rate = (total_compliant / total_requirements * 100) if total_requirements > 0 else 0
    
    return DashboardResponse(
        total_requirements=total_requirements,
        status_counts=status_list,
        policy_summaries=policy_summaries,
        overall_compliance_rate=round(overall_rate, 2),
    )
