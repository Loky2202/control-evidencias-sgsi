"""
Modelo de Registro de Auditoría.
Registra todas las acciones importantes del sistema.
"""
from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func

from app.db import Base


class AuditLog(Base):
    __tablename__ = "audit_log"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Acción realizada
    action = Column(String(50), nullable=False)  # create, update, delete, login
    resource_type = Column(String(50))  # submission, attachment, policy, etc.
    resource_id = Column(Integer)
    
    # Detalles de la acción
    description = Column(Text)
    details = Column(Text)  # JSON con datos adicionales
    
    # Usuario que realizó la acción
    user_email = Column(String(200))
    user_role = Column(String(20))
    
    # Timestamp
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    
    # IP y user agent (opcional)
    ip_address = Column(String(50))
    user_agent = Column(String(500))
