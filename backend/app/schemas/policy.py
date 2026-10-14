"""
Schemas para Políticas.
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class PolicyBase(BaseModel):
    code: str = Field(..., max_length=20, examples=["POL-SI-001"])
    title: str = Field(..., max_length=200)
    description: Optional[str] = None
    version: str = Field(default="1.0", max_length=10)
    status: str = Field(default="Vigente")


class PolicyCreate(PolicyBase):
    """Schema para crear una política"""
    pass


class PolicyUpdate(BaseModel):
    """Schema para actualizar una política (todos los campos opcionales)"""
    code: Optional[str] = Field(None, max_length=20)
    title: Optional[str] = Field(None, max_length=200)
    description: Optional[str] = None
    version: Optional[str] = Field(None, max_length=10)
    status: Optional[str] = None


class PolicyResponse(PolicyBase):
    """Schema de respuesta de una política"""
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class PolicyList(BaseModel):
    """Lista de políticas"""
    policies: list[PolicyResponse]
    total: int
