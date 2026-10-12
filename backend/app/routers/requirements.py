"""
Router de Requisitos.
Endpoints para listar requisitos con estado calculado.
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List

from app.db import get_db
from app.models.requirement import Requirement
from app.schemas.requirement import RequirementWithStatus
from app.services.due_dates import calculate_requirement_status

router = APIRouter()


@router.get("/requirements", response_model=List[RequirementWithStatus])
def list_requirements(
    policy_code: Optional[str] = Query(None, description="Filtrar por política"),
    status: Optional[str] = Query(None, description="Filtrar por estado"),
    db: Session = Depends(get_db),
):
    """
    Lista todos los requisitos con su estado calculado.
    
    Query Params:
        policy_code: Filtrar por código de política
        status: Filtrar por estado (Pendiente, Vigente, Por vencer, Vencida)
    
    Returns:
        List[RequirementWithStatus]: Requisitos con estado
    """
    query = db.query(Requirement)
    
    if policy_code:
        query = query.filter(Requirement.policy_code == policy_code)
    
    requirements = query.order_by(Requirement.code).all()
    
    # Calcular estado de cada requisito
    result = []
    for req in requirements:
        status_data = calculate_requirement_status(req.id, db)
        req_with_status = RequirementWithStatus(
            **req.__dict__,
            last_evidence_date=status_data["last_evidence_date"],
            next_due_date=status_data["next_due_date"],
            alert_status=status_data["alert_status"],
        )
        
        # Filtrar por estado si se especificó
        if status and req_with_status.alert_status != status:
            continue
        
        result.append(req_with_status)
    
    return result


@router.get("/requirements/{id}", response_model=RequirementWithStatus)
def get_requirement(id: int, db: Session = Depends(get_db)):
    """
    Obtiene un requisito por ID con su estado calculado.
    
    Args:
        id: ID del requisito
    
    Raises:
        HTTPException: 404 si el requisito no existe
    """
    requirement = db.query(Requirement).filter(Requirement.id == id).first()
    if not requirement:
        raise HTTPException(status_code=404, detail=f"Requisito {id} no encontrado")
    
    status_data = calculate_requirement_status(requirement.id, db)
    
    return RequirementWithStatus(
        **requirement.__dict__,
        last_evidence_date=status_data["last_evidence_date"],
        next_due_date=status_data["next_due_date"],
        alert_status=status_data["alert_status"],
    )
