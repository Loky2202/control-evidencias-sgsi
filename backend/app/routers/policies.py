"""
Router de Políticas.
Endpoints para listar y obtener políticas.

Seguridad:
- Todos los endpoints requieren autenticación
- GET: cualquier usuario autenticado (user, auditor, admin)
- POST/PUT/DELETE: solo admin
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db import get_db
from app.models.policy import Policy
from app.schemas.policy import PolicyCreate, PolicyResponse, PolicyList
from app.auth.dependencies import get_current_user, require_admin

router = APIRouter()


@router.get("/policies", response_model=PolicyList)
def list_policies(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),  # Requiere autenticación
):
    """
    Lista todas las políticas de seguridad.
    
    Requiere: Cualquier usuario autenticado
    
    Returns:
        PolicyList: Lista de políticas con total
    """
    policies = db.query(Policy).order_by(Policy.code).all()
    return PolicyList(policies=policies, total=len(policies))


@router.get("/policies/{code}", response_model=PolicyResponse)
def get_policy(
    code: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),  # Requiere autenticación
):
    """
    Obtiene una política por su código.
    
    Requiere: Cualquier usuario autenticado
    
    Args:
        code: Código de la política (ej: POL-SI-001)
    
    Raises:
        HTTPException: 404 si la política no existe
    """
    policy = db.query(Policy).filter(Policy.code == code).first()
    if not policy:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Política {code} no encontrada"
        )
    return policy


@router.post("/policies", response_model=PolicyResponse, status_code=status.HTTP_201_CREATED)
def create_policy(
    policy_data: PolicyCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_admin),  # Solo admin
):
    """
    Crea una nueva política.
    
    Requiere: Rol admin
    
    Args:
        policy_data: Datos de la política
    
    Returns:
        PolicyResponse: Política creada
    """
    # Verificar que no exista
    existing = db.query(Policy).filter(Policy.code == policy_data.code).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"La política {policy_data.code} ya existe"
        )
    
    new_policy = Policy(**policy_data.model_dump())
    db.add(new_policy)
    db.commit()
    db.refresh(new_policy)
    
    return new_policy


@router.delete("/policies/{code}", status_code=status.HTTP_204_NO_CONTENT)
def delete_policy(
    code: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_admin),  # Solo admin
):
    """
    Elimina una política.
    
    Requiere: Rol admin
    
    Args:
        code: Código de la política
    
    Raises:
        HTTPException: 404 si la política no existe
    """
    policy = db.query(Policy).filter(Policy.code == code).first()
    if not policy:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Política {code} no encontrada"
        )
    
    db.delete(policy)
    db.commit()
