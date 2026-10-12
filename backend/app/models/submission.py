"""
Modelo de Entrega de Evidencia.
Representa una instancia de cumplimiento de un requisito.
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, Date, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.db import Base


class Submission(Base):
    __tablename__ = "submissions"
    
    id = Column(Integer, primary_key=True, index=True)
    requirement_id = Column(Integer, ForeignKey("requirements.id"), nullable=False, index=True)
    
    # Fecha de la evidencia
    evidence_date = Column(Date, nullable=False, index=True)
    
    # Estado de la entrega
    status = Column(String(20), nullable=False, default="Pendiente")  # Pendiente, Completa, Rechazada
    notes = Column(Text)
    
    # Usuario que creó la entrega
    created_by = Column(String(100))  # Email del usuario de Entra ID
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relaciones
    requirement = relationship("Requirement", back_populates="submissions")
    attachments = relationship("Attachment", back_populates="submission", cascade="all, delete-orphan")
