"""
Modelo de Requisito de Evidencia.
Cada requisito tiene una frecuencia y se vincula a una política y control.
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.db import Base


class Requirement(Base):
    __tablename__ = "requirements"
    
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(20), unique=True, nullable=False, index=True)  # EV-001
    title = Column(String(200), nullable=False)
    description = Column(Text)
    
    # Frecuencia de evidencia requerida
    frequency = Column(String(20), nullable=False)  # Mensual, Trimestral, Semestral, Anual, Continua
    
    # Relaciones con política y control
    policy_code = Column(String(20), ForeignKey("policies.code"), nullable=False, index=True)
    control_id = Column(Integer, ForeignKey("controls.id"), nullable=True, index=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relaciones
    policy = relationship("Policy", back_populates="requirements")
    control = relationship("Control", back_populates="requirements")
    submissions = relationship("Submission", back_populates="requirement")
