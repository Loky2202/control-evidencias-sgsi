"""
Schemas para Requisitos.
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, date


class RequirementBase(BaseModel):
    code: str = Field(..., max_length=20, examples=["EV-001"])
    title: str = Field(..., max_length=200)
    description: Optional[str] = None
    frequency: str = Field(..., examples=["Mensual"])  # Mensual, Trimestral, Semestral, Anual, Continua
    policy_code: str
    control_id: Optional[int] = None


class RequirementResponse(RequirementBase):
    """Schema de respuesta de un requisito"""
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class RequirementWithStatus(RequirementResponse):
    """Requisito con estado calculado (última evidencia, próxima fecha, alerta)"""
    last_evidence_date: Optional[date] = None
    next_due_date: Optional[date] = None
    alert_status: str = "Pendiente"  # Pendiente, Vigente, Por vencer, Vencida
