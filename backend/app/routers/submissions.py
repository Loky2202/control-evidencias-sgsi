"""
Router de Entregas.
Endpoints para crear y consultar entregas de evidencia.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from app.db import get_db
from app.models.submission import Submission
from app.models.requirement import Requirement
from app.schemas.submission import SubmissionCreate, SubmissionResponse
from app.services.audit import log_action
from app.auth.dependencies import get_current_user

router = APIRouter()


@router.post("/submissions", response_model=SubmissionResponse, status_code=201)
def create_submission(
    submission: SubmissionCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    Crea una nueva entrega de evidencia.
    
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
            status_code=404,
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
def get_submission(id: int, db: Session = Depends(get_db)):
    """
    Obtiene una entrega por ID con sus adjuntos.
    
    Args:
        id: ID de la entrega
    
    Raises:
        HTTPException: 404 si la entrega no existe
    """
    submission = db.query(Submission).filter(Submission.id == id).first()
    if not submission:
        raise HTTPException(status_code=404, detail=f"Entrega {id} no encontrada")
    return submission


@router.get("/submissions", response_model=List[SubmissionResponse])
def list_submissions(
    requirement_id: Optional[int] = None,
    db: Session = Depends(get_db),
):
    """
    Lista entregas, opcionalmente filtradas por requisito.
    
    Query Params:
        requirement_id: Filtrar por ID de requisito
    """
    query = db.query(Submission)
    if requirement_id:
        query = query.filter(Submission.requirement_id == requirement_id)
    
    return query.order_by(Submission.evidence_date.desc()).all()
