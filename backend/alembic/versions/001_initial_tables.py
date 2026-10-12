"""Creación inicial de tablas

Revision ID: 001_initial
Revises: 
Create Date: 2024-01-01 00:00:00.000000
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '001_initial'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Tabla: policies
    op.create_table(
        'policies',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('code', sa.String(20), nullable=False, unique=True),
        sa.Column('title', sa.String(200), nullable=False),
        sa.Column('description', sa.Text()),
        sa.Column('version', sa.String(10), server_default='1.0'),
        sa.Column('status', sa.String(20), server_default='Vigente'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True)),
    )
    op.create_index('ix_policies_code', 'policies', ['code'])

    # Tabla: controls
    op.create_table(
        'controls',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('code', sa.String(20), nullable=False, unique=True),
        sa.Column('title', sa.String(200), nullable=False),
        sa.Column('description', sa.Text()),
        sa.Column('category', sa.String(50)),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True)),
    )
    op.create_index('ix_controls_code', 'controls', ['code'])

    # Tabla: requirements
    op.create_table(
        'requirements',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('code', sa.String(20), nullable=False, unique=True),
        sa.Column('title', sa.String(200), nullable=False),
        sa.Column('description', sa.Text()),
        sa.Column('frequency', sa.String(20), nullable=False),
        sa.Column('policy_code', sa.String(20), sa.ForeignKey('policies.code'), nullable=False),
        sa.Column('control_id', sa.Integer(), sa.ForeignKey('controls.id'), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True)),
    )
    op.create_index('ix_requirements_code', 'requirements', ['code'])
    op.create_index('ix_requirements_policy', 'requirements', ['policy_code'])
    op.create_index('ix_requirements_control', 'requirements', ['control_id'])

    # Tabla: submissions
    op.create_table(
        'submissions',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('requirement_id', sa.Integer(), sa.ForeignKey('requirements.id'), nullable=False),
        sa.Column('evidence_date', sa.Date(), nullable=False),
        sa.Column('status', sa.String(20), nullable=False, server_default='Pendiente'),
        sa.Column('notes', sa.Text()),
        sa.Column('created_by', sa.String(100)),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True)),
    )
    op.create_index('ix_submissions_requirement', 'submissions', ['requirement_id'])
    op.create_index('ix_submissions_date', 'submissions', ['evidence_date'])
    op.create_index('ix_submissions_status', 'submissions', ['status'])

    # Tabla: attachments
    op.create_table(
        'attachments',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('submission_id', sa.Integer(), sa.ForeignKey('submissions.id'), nullable=False),
        sa.Column('filename', sa.String(255), nullable=False),
        sa.Column('file_size', sa.Integer()),
        sa.Column('content_type', sa.String(100)),
        sa.Column('sharepoint_url', sa.String(500)),
        sa.Column('sharepoint_item_id', sa.String(100)),
        sa.Column('uploaded_by', sa.String(100)),
        sa.Column('uploaded_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index('ix_attachments_submission', 'attachments', ['submission_id'])

    # Tabla: users
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('email', sa.String(200), nullable=False, unique=True),
        sa.Column('name', sa.String(200)),
        sa.Column('role', sa.String(20), nullable=False, server_default='user'),
        sa.Column('is_active', sa.Boolean(), server_default=sa.true()),
        sa.Column('entra_id', sa.String(100), unique=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('last_login', sa.DateTime(timezone=True)),
    )
    op.create_index('ix_users_email', 'users', ['email'])

    # Tabla: audit_log
    op.create_table(
        'audit_log',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('action', sa.String(50), nullable=False),
        sa.Column('resource_type', sa.String(50)),
        sa.Column('resource_id', sa.Integer()),
        sa.Column('description', sa.Text()),
        sa.Column('details', sa.Text()),
        sa.Column('user_email', sa.String(200)),
        sa.Column('user_role', sa.String(20)),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('ip_address', sa.String(50)),
        sa.Column('user_agent', sa.String(500)),
    )
    op.create_index('ix_audit_log_created', 'audit_log', ['created_at'])
    op.create_index('ix_audit_log_action', 'audit_log', ['action'])

    # Vista: v_requirement_status
    op.execute("""
        CREATE OR REPLACE VIEW v_requirement_status AS
        SELECT 
            r.id,
            r.code,
            r.title,
            r.frequency,
            r.policy_code,
            r.control_id,
            s.evidence_date AS last_evidence_date,
            CASE 
                WHEN s.id IS NULL THEN NULL
                WHEN r.frequency = 'Mensual' THEN (s.evidence_date + INTERVAL '1 month')::DATE
                WHEN r.frequency = 'Trimestral' THEN (s.evidence_date + INTERVAL '3 months')::DATE
                WHEN r.frequency = 'Semestral' THEN (s.evidence_date + INTERVAL '6 months')::DATE
                WHEN r.frequency = 'Anual' THEN (s.evidence_date + INTERVAL '12 months')::DATE
                WHEN r.frequency = 'Continua' THEN (s.evidence_date + INTERVAL '1 month')::DATE
                ELSE NULL
            END AS next_due_date,
            CASE
                WHEN s.id IS NULL THEN 'Pendiente'
                WHEN r.frequency IS NULL THEN 'Vigente'
                WHEN (
                    CASE 
                        WHEN r.frequency = 'Mensual' THEN (s.evidence_date + INTERVAL '1 month')::DATE
                        WHEN r.frequency = 'Trimestral' THEN (s.evidence_date + INTERVAL '3 months')::DATE
                        WHEN r.frequency = 'Semestral' THEN (s.evidence_date + INTERVAL '6 months')::DATE
                        WHEN r.frequency = 'Anual' THEN (s.evidence_date + INTERVAL '12 months')::DATE
                        WHEN r.frequency = 'Continua' THEN (s.evidence_date + INTERVAL '1 month')::DATE
                    END
                ) < CURRENT_DATE THEN 'Vencida'
                WHEN (
                    CASE 
                        WHEN r.frequency = 'Mensual' THEN (s.evidence_date + INTERVAL '1 month')::DATE
                        WHEN r.frequency = 'Trimestral' THEN (s.evidence_date + INTERVAL '3 months')::DATE
                        WHEN r.frequency = 'Semestral' THEN (s.evidence_date + INTERVAL '6 months')::DATE
                        WHEN r.frequency = 'Anual' THEN (s.evidence_date + INTERVAL '12 months')::DATE
                        WHEN r.frequency = 'Continua' THEN (s.evidence_date + INTERVAL '1 month')::DATE
                    END
                ) <= CURRENT_DATE + INTERVAL '30 days' THEN 'Por vencer'
                ELSE 'Vigente'
            END AS alert_status
        FROM requirements r
        LEFT JOIN LATERAL (
            SELECT id, evidence_date
            FROM submissions
            WHERE requirement_id = r.id AND status = 'Completa'
            ORDER BY evidence_date DESC
            LIMIT 1
        ) s ON true;
    """)


def downgrade() -> None:
    # Eliminar vista
    op.execute("DROP VIEW IF EXISTS v_requirement_status;")
    
    # Eliminar tablas en orden inverso
    op.drop_table('audit_log')
    op.drop_table('users')
    op.drop_table('attachments')
    op.drop_table('submissions')
    op.drop_table('requirements')
    op.drop_table('controls')
    op.drop_table('policies')
