"""
Schemas para Entregas de Evidencia.
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, date


class AttachmentResponse(BaseModel):
    """Schema de respuesta de un adjunto"""
    id: int
    filename: str
    file_size: Optional[int] = None
    content_type: Optional[str] = None
    sharepoint_url: Optional[str] = None
    uploaded_by: Optional[str] = None
    uploaded_at: datetime
    
    class Config:
        from_attributes = True


class SubmissionBase(BaseModel):
    requirement_id: int
    evidence_date: date
    notes: Optional[str] = None


class SubmissionCreate(SubmissionBase):
    """Schema para crear una entrega"""
    pass


class SubmissionResponse(SubmissionBase):
    """Schema de respuesta de una entrega"""
    id: int
    status: str
    created_by: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    attachments: List[AttachmentResponse] = []
    
    class Config:
        from_attributes = True
