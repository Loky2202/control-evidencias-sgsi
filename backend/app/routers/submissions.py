"""
Router de Entregas.
Endpoints para crear y consultar entregas de evidencia.

Seguridad:
- GET: cualquier usuario autenticado (user, auditor, admin)
- POST: user, admin (NO auditor - el auditor solo lee)
- PUT/PATCH: user, admin (dueño de la entrega o admin)
- DELETE: solo admin
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.db import get_db
from app.models.submission import Submission
from app.models.requirement import Requirement
from app.schemas.submission import SubmissionCreate, SubmissionResponse
from app.services.audit import log_action
from app.auth.dependencies import get_current_user, require_role

router = APIRouter()


@router.post("/submissions", response_model=SubmissionResponse, status_code=status.HTTP_201_CREATED)
def create_submission(
    submission: SubmissionCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_role("user", "admin")),  # NO auditor
):
    """
    Crea una nueva entrega de evidencia.
    
    Requiere: Rol 'user' o 'admin' (NO 'auditor')
    
    Args:
        submission: Datos de la entrega
    
    Returns:
        SubmissionResponse: Entrega creada
    
    Raises:
        HTTPException: 404 si el requisito no existe
    """
    # Verificar que el requisito existe
    requirement = db.query(Requirement).filter(Requirement.id == submission.requirement_id).first()
    if not requirement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Requisito {submission.requirement_id} no encontrado",
        )
    
    # Crear la entrega
    new_submission = Submission(
        requirement_id=submission.requirement_id,
        evidence_date=submission.evidence_date,
        notes=submission.notes,
        status="Pendiente",
        created_by=current_user["email"],
    )
    
    db.add(new_submission)
    db.commit()
    db.refresh(new_submission)
    
    # Registrar en auditoría
    log_action(
        db=db,
        action="create",
        resource_type="submission",
        resource_id=new_submission.id,
        description=f"Entrega creada para requisito {requirement.code}",
        user_email=current_user["email"],
        user_role=current_user.get("role", "user"),
    )
    
    return new_submission


@router.get("/submissions/{id}", response_model=SubmissionResponse)
def get_submission(
    id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),  # Requiere autenticación
):
    """
    Obtiene una entrega por ID con sus adjuntos.
    
    Requiere: Cualquier usuario autenticado
    
    Args:
        id: ID de la entrega
    
    Raises:
        HTTPException: 404 si la entrega no existe
    """
    submission = db.query(Submission).filter(Submission.id == id).first()
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Entrega {id} no encontrada"
        )
    return submission


@router.get("/submissions", response_model=List[SubmissionResponse])
def list_submissions(
    requirement_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),  # Requiere autenticación
):
    """
    Lista entregas, opcionalmente filtradas por requisito.
    
    Requiere: Cualquier usuario autenticado
    
    Query Params:
        requirement_id: Filtrar por ID de requisito
    """
    query = db.query(Submission)
    if requirement_id:
        query = query.filter(Submission.requirement_id == requirement_id)
    
    return query.order_by(Submission.evidence_date.desc()).all()


@router.delete("/submissions/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_submission(
    id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_role("admin")),  # Solo admin
):
    """
    Elimina una entrega.
    
    Requiere: Rol admin
    
    Args:
        id: ID de la entrega
    
    Raises:
        HTTPException: 404 si la entrega no existe
    """
    submission = db.query(Submission).filter(Submission.id == id).first()
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Entrega {id} no encontrada"
        )
    
    # Registrar en auditoría antes de eliminar
    log_action(
        db=db,
        action="delete",
        resource_type="submission",
        resource_id=submission.id,
        description=f"Entrega eliminada (requisito {submission.requirement_id})",
        user_email=current_user["email"],
        user_role=current_user.get("role", "admin"),
    )
    
    db.delete(submission)
    db.commit()
