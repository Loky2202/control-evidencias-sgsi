"""
Router de Requisitos.
Endpoints para listar requisitos con estado calculado.

Seguridad:
- Todos los endpoints requieren autenticación
- GET: cualquier usuario autenticado
- POST/PUT/DELETE: solo admin
"""
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import Optional, List

from app.db import get_db
from app.models.requirement import Requirement
from app.models.policy import Policy
from app.models.control import Control
from app.schemas.requirement import RequirementCreate, RequirementUpdate, RequirementWithStatus
from app.services.due_dates import calculate_requirement_status, calculate_requirements_status_batch
from app.auth.dependencies import get_current_user, require_admin

router = APIRouter()


@router.get("/requirements", response_model=List[RequirementWithStatus])
def list_requirements(
    policy_code: Optional[str] = Query(None, description="Filtrar por política"),
    status_filter: Optional[str] = Query(None, alias="status", description="Filtrar por estado"),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),  # Requiere autenticación
):
    """
    Lista todos los requisitos con su estado calculado.
    
    Requiere: Cualquier usuario autenticado
    
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
    
    # OPTIMIZACIÓN: Calcular estados en batch (evita N+1)
    requirement_ids = [req.id for req in requirements]
    status_map = calculate_requirements_status_batch(requirement_ids, db)
    
    result = []
    for req in requirements:
        status_data = status_map.get(req.id, {
            "last_evidence_date": None,
            "next_due_date": None,
            "alert_status": "Pendiente",
        })
        req_with_status = RequirementWithStatus(
            **req.__dict__,
            last_evidence_date=status_data["last_evidence_date"],
            next_due_date=status_data["next_due_date"],
            alert_status=status_data["alert_status"],
        )
        
        # Filtrar por estado si se especificó
        if status_filter and req_with_status.alert_status != status_filter:
            continue
        
        result.append(req_with_status)
    
    return result


@router.get("/requirements/{id}", response_model=RequirementWithStatus)
def get_requirement(
    id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),  # Requiere autenticación
):
    """
    Obtiene un requisito por ID con su estado calculado.
    
    Requiere: Cualquier usuario autenticado
    
    Args:
        id: ID del requisito
    
    Raises:
        HTTPException: 404 si el requisito no existe
    """
    requirement = db.query(Requirement).filter(Requirement.id == id).first()
    if not requirement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Requisito {id} no encontrado"
        )
    
    status_data = calculate_requirement_status(requirement.id, db)
    
    return RequirementWithStatus(
        **requirement.__dict__,
        last_evidence_date=status_data["last_evidence_date"],
        next_due_date=status_data["next_due_date"],
        alert_status=status_data["alert_status"],
    )


@router.post("/requirements", response_model=RequirementWithStatus, status_code=201)
def create_requirement(
    requirement_data: RequirementCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_admin),
):
    """Crea un nuevo requisito. Solo admin."""
    # Verificar que no exista
    existing = db.query(Requirement).filter(Requirement.code == requirement_data.code).first()
    if existing:
        raise HTTPException(status_code=409, detail=f"El requisito {requirement_data.code} ya existe")
    
    # Verificar que la política exista
    policy = db.query(Policy).filter(Policy.code == requirement_data.policy_code).first()
    if not policy:
        raise HTTPException(status_code=400, detail=f"La política {requirement_data.policy_code} no existe")
    
    # Verificar que el control exista si se especificó
    if requirement_data.control_id:
        control = db.query(Control).filter(Control.id == requirement_data.control_id).first()
        if not control:
            raise HTTPException(status_code=400, detail=f"El control {requirement_data.control_id} no existe")
    
    new_requirement = Requirement(**requirement_data.model_dump())
    db.add(new_requirement)
    db.commit()
    db.refresh(new_requirement)
    
    status_data = calculate_requirement_status(new_requirement.id, db)
    return RequirementWithStatus(
        **new_requirement.__dict__,
        last_evidence_date=status_data["last_evidence_date"],
        next_due_date=status_data["next_due_date"],
        alert_status=status_data["alert_status"],
    )


@router.put("/requirements/{id}", response_model=RequirementWithStatus)
def update_requirement(
    id: int,
    requirement_update: RequirementUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_admin),
):
    """Actualiza un requisito. Solo admin."""
    requirement = db.query(Requirement).filter(Requirement.id == id).first()
    if not requirement:
        raise HTTPException(status_code=404, detail=f"Requisito {id} no encontrado")
    
    update_data = requirement_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(requirement, field, value)
    
    db.commit()
    db.refresh(requirement)
    
    status_data = calculate_requirement_status(requirement.id, db)
    return RequirementWithStatus(
        **requirement.__dict__,
        last_evidence_date=status_data["last_evidence_date"],
        next_due_date=status_data["next_due_date"],
        alert_status=status_data["alert_status"],
    )


@router.delete("/requirements/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_requirement(
    id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_admin),  # Solo admin
):
    """
    Elimina un requisito.
    
    Requiere: Rol admin
    
    Args:
        id: ID del requisito
    
    Raises:
        HTTPException: 404 si el requisito no existe
    """
    requirement = db.query(Requirement).filter(Requirement.id == id).first()
    if not requirement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Requisito {id} no encontrado"
        )
    
    db.delete(requirement)
    db.commit()
