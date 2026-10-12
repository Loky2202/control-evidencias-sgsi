"""
Modelo de Archivo Adjunto.
Almacena metadatos del archivo subido a SharePoint.
"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.db import Base


class Attachment(Base):
    __tablename__ = "attachments"
    
    id = Column(Integer, primary_key=True, index=True)
    submission_id = Column(Integer, ForeignKey("submissions.id"), nullable=False, index=True)
    
    # Metadatos del archivo
    filename = Column(String(255), nullable=False)
    file_size = Column(Integer)  # en bytes
    content_type = Column(String(100))
    
    # Enlace a SharePoint (Microsoft Graph)
    sharepoint_url = Column(String(500))
    sharepoint_item_id = Column(String(100))
    
    uploaded_by = Column(String(100))  # Email del usuario
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relaciones
    submission = relationship("Submission", back_populates="attachments")
