"""
Router de Controles ISO 27001.
CRUD completo para controles.

Seguridad:
- GET: cualquier usuario autenticado
- POST/PUT/DELETE: solo admin
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db import get_db
from app.models.control import Control
from app.schemas.control import ControlCreate, ControlUpdate, ControlResponse
from app.auth.dependencies import get_current_user, require_admin

router = APIRouter()


@router.get("/controls", response_model=List[ControlResponse])
def list_controls(
    category: str = None,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Lista todos los controles, opcionalmente filtrados por categoría."""
    query = db.query(Control)
    if category:
        query = query.filter(Control.category == category)
    return query.order_by(Control.code).all()


@router.get("/controls/{id}", response_model=ControlResponse)
def get_control(
    id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Obtiene un control por ID."""
    control = db.query(Control).filter(Control.id == id).first()
    if not control:
        raise HTTPException(status_code=404, detail=f"Control {id} no encontrado")
    return control


@router.post("/controls", response_model=ControlResponse, status_code=201)
def create_control(
    control: ControlCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_admin),
):
    """Crea un nuevo control. Solo admin."""
    existing = db.query(Control).filter(Control.code == control.code).first()
    if existing:
        raise HTTPException(status_code=409, detail=f"El control {control.code} ya existe")
    
    new_control = Control(**control.model_dump())
    db.add(new_control)
    db.commit()
    db.refresh(new_control)
    return new_control


@router.put("/controls/{id}", response_model=ControlResponse)
def update_control(
    id: int,
    control_update: ControlUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_admin),
):
    """Actualiza un control. Solo admin."""
    control = db.query(Control).filter(Control.id == id).first()
    if not control:
        raise HTTPException(status_code=404, detail=f"Control {id} no encontrado")
    
    update_data = control_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(control, field, value)
    
    db.commit()
    db.refresh(control)
    return control


@router.delete("/controls/{id}", status_code=204)
def delete_control(
    id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_admin),
):
    """Elimina un control. Solo admin."""
    control = db.query(Control).filter(Control.id == id).first()
    if not control:
        raise HTTPException(status_code=404, detail=f"Control {id} no encontrado")
    
    db.delete(control)
    db.commit()
