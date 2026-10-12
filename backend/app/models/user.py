"""
Modelo de Usuario.
Representa usuarios autenticados vía Entra ID.
"""
from sqlalchemy import Column, Integer, String, DateTime, Boolean
from sqlalchemy.sql import func

from app.db import Base


class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(200), unique=True, nullable=False, index=True)
    name = Column(String(200))
    
    # Rol del usuario
    role = Column(String(20), nullable=False, default="user")  # admin, auditor, user
    
    # Estado
    is_active = Column(Boolean, default=True)
    
    # Entra ID
    entra_id = Column(String(100), unique=True)  # Object ID de Azure AD
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_login = Column(DateTime(timezone=True))
