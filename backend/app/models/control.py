"""
Modelo de Control ISO 27001.
Ejemplo: A.5.1, A.8.9, etc.
"""
from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.db import Base


class Control(Base):
    __tablename__ = "controls"
    
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(20), unique=True, nullable=False, index=True)  # A.5.1
    title = Column(String(200), nullable=False)
    description = Column(Text)
    category = Column(String(50))  # A.5 (Políticas), A.8 (Controles técnicos), etc.
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relaciones
    requirements = relationship("Requirement", back_populates="control")
