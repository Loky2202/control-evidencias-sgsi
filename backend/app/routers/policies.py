"""
Router de Políticas.
Endpoints para listar y obtener políticas.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.policy import Policy
from app.schemas.policy import PolicyResponse, PolicyList

router = APIRouter()


@router.get("/policies", response_model=PolicyList)
def list_policies(db: Session = Depends(get_db)):
    """
    Lista todas las políticas de seguridad.
    
    Returns:
        PolicyList: Lista de políticas con total
    """
    policies = db.query(Policy).order_by(Policy.code).all()
    return PolicyList(policies=policies, total=len(policies))


@router.get("/policies/{code}", response_model=PolicyResponse)
def get_policy(code: str, db: Session = Depends(get_db)):
    """
    Obtiene una política por su código.
    
    Args:
        code: Código de la política (ej: POL-SI-001)
    
    Raises:
        HTTPException: 404 si la política no existe
    """
    policy = db.query(Policy).filter(Policy.code == code).first()
    if not policy:
        raise HTTPException(status_code=404, detail=f"Política {code} no encontrada")
    return policy
