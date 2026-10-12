"""
Modelo de Política de Seguridad.
Ejemplo: POL-SI-001, POL-SI-005, etc.
"""
from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.db import Base


class Policy(Base):
    __tablename__ = "policies"
    
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(20), unique=True, nullable=False, index=True)  # POL-SI-001
    title = Column(String(200), nullable=False)
    description = Column(Text)
    version = Column(String(10), default="1.0")
    status = Column(String(20), default="Vigente")  # Vigente, Obsoleta, En revisión
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relaciones
    requirements = relationship("Requirement", back_populates="policy")
