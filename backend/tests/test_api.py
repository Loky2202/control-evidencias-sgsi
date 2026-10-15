"""
Tests para los endpoints de la API.
Usa dependency_overrides y SQLite en memoria para pruebas aisladas.
"""
import pytest
from fastapi.testclient import TestClient
from fastapi import Depends
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from datetime import date

from app.main import app
from app.db import get_db, Base
from app.models.policy import Policy
from app.models.requirement import Requirement
from app.models.submission import Submission
from app.auth.dependencies import get_current_user


# Configurar BD de prueba SQLite
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# Override de dependencias
def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


def override_get_current_user():
    # Usuario de prueba autenticado
    return {
        "email": "test@example.com",
        "name": "Test User",
        "role": "admin",
        "oid": "test-oid-123",
        "tenant_id": "test-tenant",
    }


app.dependency_overrides[get_db] = override_get_db
app.dependency_overrides[get_current_user] = override_get_current_user


@pytest.fixture(scope="function")
def client():
    """Cliente de prueba con BD limpia"""
    # Crear tablas
    Base.metadata.create_all(bind=engine)
    
    with TestClient(app) as c:
        yield c
    
    # Limpiar tablas después del test
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def db_session():
    """Sesión de BD para setup de datos"""
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


class TestHealthEndpoint:
    """Tests para el endpoint de health check"""
    
    def test_health_check(self, client):
        """El endpoint /api/health debe retornar status healthy"""
        response = client.get("/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "version" in data


class TestPoliciesEndpoint:
    """Tests para los endpoints de políticas"""
    
    def test_list_policies_empty(self, client):
        """Listar políticas cuando no hay ninguna"""
        response = client.get("/api/policies")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 0
        assert data["policies"] == []
    
    def test_list_policies_with_data(self, client, db_session):
        """Listar políticas con datos en la BD"""
        # Crear política de prueba
        policy = Policy(
            code="POL-TEST-001",
            title="Política de Prueba",
            description="Descripción de prueba",
            version="1.0",
            status="Vigente"
        )
        db_session.add(policy)
        db_session.commit()
        
        response = client.get("/api/policies")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 1
        assert data["policies"][0]["code"] == "POL-TEST-001"
    
    def test_get_policy_not_found(self, client):
        """Obtener política inexistente debe retornar 404"""
        response = client.get("/api/policies/POL-NOT-FOUND")
        assert response.status_code == 404
    
    def test_get_policy_found(self, client, db_session):
        """Obtener política existente"""
        policy = Policy(
            code="POL-TEST-002",
            title="Política de Prueba 2",
            description="Descripción",
            version="1.0",
            status="Vigente"
        )
        db_session.add(policy)
        db_session.commit()
        
        response = client.get("/api/policies/POL-TEST-002")
        assert response.status_code == 200
        data = response.json()
        assert data["code"] == "POL-TEST-002"
        assert data["title"] == "Política de Prueba 2"


class TestSubmissionsEndpoint:
    """Tests para los endpoints de entregas"""
    
    def test_list_submissions_empty(self, client):
        """Listar entregas cuando no hay ninguna"""
        response = client.get("/api/submissions")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 0
        assert data["items"] == []
    
    def test_list_submissions_with_pagination(self, client, db_session):
        """Listar entregas con paginación"""
        # Crear política y requisito
        policy = Policy(code="POL-TEST-003", title="Test", version="1.0", status="Vigente")
        db_session.add(policy)
        db_session.commit()
        
        requirement = Requirement(
            code="REQ-TEST-001",
            title="Requisito Test",
            frequency="Mensual",
            policy_code="POL-TEST-003"
        )
        db_session.add(requirement)
        db_session.commit()
        
        # Crear 5 entregas
        for i in range(5):
            submission = Submission(
                requirement_id=requirement.id,
                evidence_date=date(2024, 1, i+1),
                status="Pendiente",
                created_by="test@example.com"
            )
            db_session.add(submission)
        db_session.commit()
        
        # Test paginación: skip=2, limit=2
        response = client.get("/api/submissions?skip=2&limit=2")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 5
        assert len(data["items"]) == 2
        assert data["skip"] == 2
        assert data["limit"] == 2
    
    def test_create_submission(self, client, db_session):
        """Crear una nueva entrega"""
        # Crear política y requisito
        policy = Policy(code="POL-TEST-004", title="Test", version="1.0", status="Vigente")
        db_session.add(policy)
        db_session.commit()
        
        requirement = Requirement(
            code="REQ-TEST-002",
            title="Requisito Test",
            frequency="Mensual",
            policy_code="POL-TEST-004"
        )
        db_session.add(requirement)
        db_session.commit()
        
        # Crear entrega
        response = client.post("/api/submissions", json={
            "requirement_id": requirement.id,
            "evidence_date": "2024-01-15",
            "notes": "Evidencia de prueba"
        })
        assert response.status_code == 201
        data = response.json()
        assert data["status"] == "Pendiente"
        assert data["notes"] == "Evidencia de prueba"
        assert data["created_by"] == "test@example.com"
    
    def test_create_submission_invalid_requirement(self, client):
        """Crear entrega con requisito inexistente debe fallar"""
        response = client.post("/api/submissions", json={
            "requirement_id": 99999,
            "evidence_date": "2024-01-15"
        })
        assert response.status_code == 404


class TestDashboardEndpoint:
    """Tests para el endpoint de dashboard"""
    
    def test_dashboard_empty(self, client):
        """Dashboard sin datos"""
        response = client.get("/api/dashboard")
        assert response.status_code == 200
        data = response.json()
        assert data["total_requirements"] == 0
        assert data["overall_compliance_rate"] == 0
    
    def test_dashboard_with_data(self, client, db_session):
        """Dashboard con datos"""
        # Crear política
        policy = Policy(code="POL-TEST-005", title="Test Policy", version="1.0", status="Vigente")
        db_session.add(policy)
        db_session.commit()
        
        # Crear 2 requisitos
        req1 = Requirement(code="REQ-TEST-003", title="Req 1", frequency="Mensual", policy_code="POL-TEST-005")
        req2 = Requirement(code="REQ-TEST-004", title="Req 2", frequency="Trimestral", policy_code="POL-TEST-005")
        db_session.add_all([req1, req2])
        db_session.commit()
        
        response = client.get("/api/dashboard")
        assert response.status_code == 200
        data = response.json()
        assert data["total_requirements"] == 2
        assert len(data["policy_summaries"]) == 1
