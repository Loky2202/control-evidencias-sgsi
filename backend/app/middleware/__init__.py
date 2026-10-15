"""
Middleware de la aplicación.
"""
from app.middleware.audit import AuditMiddleware

__all__ = ["AuditMiddleware"]
