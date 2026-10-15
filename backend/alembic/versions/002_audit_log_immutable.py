"""Hacer audit_log inmutable para el usuario de la aplicación

Revision ID: 002
Revises: 001_initial
Create Date: 2024-01-15 00:00:00.000000

Esta migración revoca los permisos UPDATE, DELETE y TRUNCATE sobre la tabla
audit_log para el usuario de la aplicación, garantizando que los logs de
auditoría sean inmutables (solo se pueden INSERTAR registros nuevos).
"""
import os
from alembic import op

revision = '002'
down_revision = '001_initial'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Revocar UPDATE, DELETE, TRUNCATE sobre audit_log"""
    app_user = os.getenv("DB_APP_USER", "evidencias_app")
    op.execute(f'REVOKE UPDATE, DELETE, TRUNCATE ON audit_log FROM "{app_user}"')


def downgrade() -> None:
    """Restaurar permisos UPDATE, DELETE sobre audit_log"""
    app_user = os.getenv("DB_APP_USER", "evidencias_app")
    op.execute(f'GRANT UPDATE, DELETE ON audit_log TO "{app_user}"')
