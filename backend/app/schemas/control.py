"""
Schemas para Controles ISO 27001.
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class ControlBase(BaseModel):
    code: str = Field(..., max_length=20, examples=["A.5.1"])
    title: str = Field(..., max_length=200)
    description: Optional[str] = None
    category: Optional[str] = Field(None, max_length=50)


class ControlCreate(ControlBase):
    """Schema para crear un control"""
    pass


class ControlUpdate(BaseModel):
    """Schema para actualizar un control (todos los campos opcionales)"""
    code: Optional[str] = Field(None, max_length=20)
    title: Optional[str] = Field(None, max_length=200)
    description: Optional[str] = None
    category: Optional[str] = Field(None, max_length=50)


class ControlResponse(ControlBase):
    """Schema de respuesta de un control"""
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True
