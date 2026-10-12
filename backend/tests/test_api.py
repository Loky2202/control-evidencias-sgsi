"""
Tests para los endpoints de la API.
"""
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from datetime import date

from app.main import app


@pytest.fixture
def client():
    """Cliente de prueba de FastAPI"""
    return TestClient(app)


@pytest.fixture
def mock_db():
    """Mock de la sesión de base de datos"""
    with patch("app.db.get_db") as mock:
        db = MagicMock()
        mock.return_value = db
        yield db


class TestHealthEndpoint:
    """Tests para el endpoint de health check"""
    
    def test_health_check(self, client):
        response = client.get("/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "version" in data


class TestPoliciesEndpoint:
    """Tests para los endpoints de políticas"""
    
    def test_list_policies(self, client, mock_db):
        mock_policy = MagicMock()
        mock_policy.id = 1
        mock_policy.code = "POL-SI-001"
        mock_policy.title = "Política de Seguridad"
        mock_policy.description = "Descripción"
        mock_policy.version = "1.0"
        mock_policy.status = "Vigente"
        mock_policy.created_at = "2024-01-01T00:00:00"
        mock_policy.updated_at = None
        
        mock_db.query.return_value.order_by.return_value.all.return_value = [mock_policy]
        
        response = client.get("/api/policies")
        assert response.status_code == 200
        data = response.json()
        assert "policies" in data
        assert "total" in data
    
    def test_get_policy_not_found(self, client, mock_db):
        mock_db.query.return_value.filter.return_value.first.return_value = None
        
        response = client.get("/api/policies/POL-NOT-FOUND")
        assert response.status_code == 404


class TestRequirementsEndpoint:
    """Tests para los endpoints de requisitos"""
    
    def test_list_requirements(self, client, mock_db):
        mock_requirement = MagicMock()
        mock_requirement.id = 1
        mock_requirement.code = "EV-001"
        mock_requirement.title = "Requisito de prueba"
        mock_requirement.description = "Descripción"
        mock_requirement.frequency = "Mensual"
        mock_requirement.policy_code = "POL-SI-001"
        mock_requirement.control_id = 1
        mock_requirement.created_at = "2024-01-01T00:00:00"
        mock_requirement.updated_at = None
        mock_requirement.__dict__ = {
            "id": 1,
            "code": "EV-001",
            "title": "Requisito de prueba",
            "description": "Descripción",
            "frequency": "Mensual",
            "policy_code": "POL-SI-001",
            "control_id": 1,
            "created_at": "2024-01-01T00:00:00",
            "updated_at": None,
        }
        
        mock_db.query.return_value.order_by.return_value.all.return_value = [mock_requirement]
        
        with patch("app.routers.requirements.calculate_requirement_status") as mock_calc:
            mock_calc.return_value = {
                "last_evidence_date": None,
                "next_due_date": None,
                "alert_status": "Pendiente",
            }
            
            response = client.get("/api/requirements")
            assert response.status_code == 200
            data = response.json()
            assert isinstance(data, list)


class TestSubmissionsEndpoint:
    """Tests para los endpoints de entregas"""
    
    def test_create_submission(self, client, mock_db):
        mock_requirement = MagicMock()
        mock_requirement.id = 1
        mock_requirement.code = "EV-001"
        
        mock_db.query.return_value.filter.return_value.first.return_value = mock_requirement
        
        submission_data = {
            "requirement_id": 1,
            "evidence_date": "2024-01-15",
            "notes": "Evidencia de prueba",
        }
        
        with patch("app.routers.submissions.get_current_user") as mock_user:
            mock_user.return_value = {
                "email": "test@example.com",
                "name": "Test User",
                "role": "user",
            }
            
            with patch("app.routers.submissions.log_action"):
                response = client.post("/api/submissions", json=submission_data)
                assert response.status_code == 201
    
    def test_create_submission_invalid_requirement(self, client, mock_db):
        mock_db.query.return_value.filter.return_value.first.return_value = None
        
        submission_data = {
            "requirement_id": 999,
            "evidence_date": "2024-01-15",
        }
        
        with patch("app.routers.submissions.get_current_user") as mock_user:
            mock_user.return_value = {
                "email": "test@example.com",
                "name": "Test User",
                "role": "user",
            }
            
            response = client.post("/api/submissions", json=submission_data)
            assert response.status_code == 404


class TestDashboardEndpoint:
    """Tests para el endpoint de dashboard"""
    
    def test_get_dashboard(self, client, mock_db):
        mock_requirement = MagicMock()
        mock_requirement.id = 1
        mock_requirement.policy_code = "POL-SI-001"
        
        mock_policy = MagicMock()
        mock_policy.code = "POL-SI-001"
        mock_policy.title = "Política de Seguridad"
        
        mock_db.query.return_value.all.side_effect = [
            [mock_requirement],  # requirements
            [mock_policy],       # policies
        ]
        
        with patch("app.routers.dashboard.calculate_requirement_status") as mock_calc:
            mock_calc.return_value = {
                "last_evidence_date": None,
                "next_due_date": None,
                "alert_status": "Pendiente",
            }
            
            response = client.get("/api/dashboard")
            assert response.status_code == 200
            data = response.json()
            assert "total_requirements" in data
            assert "status_counts" in data
            assert "policy_summaries" in data
            assert "overall_compliance_rate" in data
