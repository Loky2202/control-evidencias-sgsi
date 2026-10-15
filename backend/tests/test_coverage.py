"""
Tests adicionales para mejorar cobertura.
Incluye tests para PATCH, adjuntos, soa, reports y retention.
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from datetime import date

from app.main import app
from app.db import get_db, Base
from app.models.policy import Policy
from app.models.control import Control
from app.models.requirement import Requirement
from app.models.submission import Submission
from app.auth.dependencies import get_current_user


# Configurar BD de prueba SQLite
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_coverage.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


def override_get_current_user():
    return {
        "email": "auditor@example.com",
        "name": "Auditor User",
        "role": "auditor",
        "oid": "auditor-oid-123",
        "tenant_id": "test-tenant",
    }


app.dependency_overrides[get_db] = override_get_db
app.dependency_overrides[get_current_user] = override_get_current_user


@pytest.fixture(scope="function")
def client():
    Base.metadata.create_all(bind=engine)
    with TestClient(app) as c:
        yield c
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def db_session():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


class TestSubmissionReview:
    """Tests para PATCH /submissions/{id}"""
    
    def test_approve_submission(self, client, db_session):
        """Aprobar una entrega pendiente"""
        policy = Policy(code="POL-TEST-010", title="Test", version="1.0", status="Vigente")
        db_session.add(policy)
        db_session.commit()
        
        requirement = Requirement(
            code="REQ-TEST-010",
            title="Req Test",
            frequency="Mensual",
            policy_code="POL-TEST-010"
        )
        db_session.add(requirement)
        db_session.commit()
        
        submission = Submission(
            requirement_id=requirement.id,
            evidence_date=date(2024, 1, 15),
            status="Pendiente",
            created_by="user@example.com"  # Diferente al auditor
        )
        db_session.add(submission)
        db_session.commit()
        
        response = client.patch(f"/api/submissions/{submission.id}", json={
            "status": "Completa",
            "notes": "Aprobado"
        })
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "Completa"
        assert data["notes"] == "Aprobado"
    
    def test_reject_submission(self, client, db_session):
        """Rechazar una entrega pendiente"""
        policy = Policy(code="POL-TEST-011", title="Test", version="1.0", status="Vigente")
        db_session.add(policy)
        db_session.commit()
        
        requirement = Requirement(
            code="REQ-TEST-011",
            title="Req Test",
            frequency="Mensual",
            policy_code="POL-TEST-011"
        )
        db_session.add(requirement)
        db_session.commit()
        
        submission = Submission(
            requirement_id=requirement.id,
            evidence_date=date(2024, 1, 15),
            status="Pendiente",
            created_by="user@example.com"
        )
        db_session.add(submission)
        db_session.commit()
        
        response = client.patch(f"/api/submissions/{submission.id}", json={
            "status": "Rechazada",
            "notes": "Falta información"
        })
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "Rechazada"
    
    def test_cannot_review_already_reviewed(self, client, db_session):
        """No se puede revisar una entrega ya revisada"""
        policy = Policy(code="POL-TEST-012", title="Test", version="1.0", status="Vigente")
        db_session.add(policy)
        db_session.commit()
        
        requirement = Requirement(
            code="REQ-TEST-012",
            title="Req Test",
            frequency="Mensual",
            policy_code="POL-TEST-012"
        )
        db_session.add(requirement)
        db_session.commit()
        
        submission = Submission(
            requirement_id=requirement.id,
            evidence_date=date(2024, 1, 15),
            status="Completa",  # Ya fue aprobada
            created_by="user@example.com"
        )
        db_session.add(submission)
        db_session.commit()
        
        response = client.patch(f"/api/submissions/{submission.id}", json={
            "status": "Rechazada"
        })
        
        assert response.status_code == 409
    
    def test_cannot_approve_own_submission(self, client, db_session):
        """No se puede aprobar la propia entrega"""
        policy = Policy(code="POL-TEST-013", title="Test", version="1.0", status="Vigente")
        db_session.add(policy)
        db_session.commit()
        
        requirement = Requirement(
            code="REQ-TEST-013",
            title="Req Test",
            frequency="Mensual",
            policy_code="POL-TEST-013"
        )
        db_session.add(requirement)
        db_session.commit()
        
        submission = Submission(
            requirement_id=requirement.id,
            evidence_date=date(2024, 1, 15),
            status="Pendiente",
            created_by="auditor@example.com"  # Mismo que el auditor
        )
        db_session.add(submission)
        db_session.commit()
        
        response = client.patch(f"/api/submissions/{submission.id}", json={
            "status": "Completa"
        })
        
        assert response.status_code == 403


class TestSoAEndpoint:
    """Tests para GET /api/soa"""
    
    def test_soa_empty(self, client):
        """SoA sin controles"""
        response = client.get("/api/soa")
        assert response.status_code == 200
        data = response.json()
        assert data["total_controls"] == 0
        assert data["items"] == []
    
    def test_soa_with_controls(self, client, db_session):
        """SoA con controles"""
        control = Control(
            code="A.5.1",
            title="Políticas de seguridad",
            category="A.5"
        )
        db_session.add(control)
        db_session.commit()
        
        response = client.get("/api/soa")
        assert response.status_code == 200
        data = response.json()
        assert data["total_controls"] == 1


class TestRetentionEndpoints:
    """Tests para endpoints de retención"""
    
    def test_get_retention_policy(self, client):
        """Obtener política de retención"""
        response = client.get("/api/reports/retention/policy")
        assert response.status_code == 200
        data = response.json()
        assert "policy" in data
        assert data["policy"]["completa"] == 7
    
    def test_get_retention_summary(self, client):
        """Obtener resumen de retención"""
        response = client.get("/api/reports/retention/summary")
        assert response.status_code == 200
        data = response.json()
        assert "counts" in data
        assert "expiring_soon" in data
