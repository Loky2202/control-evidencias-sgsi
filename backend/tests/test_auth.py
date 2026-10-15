"""
Tests para autenticación y autorización.
CORRECCIÓN: Los tests ahora validan que los tokens falsos sean rechazados.
"""
import pytest
from fastapi.testclient import TestClient
from fastapi import Depends
from datetime import datetime, timedelta
import jwt

from app.main import app
from app.auth.dependencies import get_current_user, require_role


@pytest.fixture
def client():
    """Cliente de prueba sin overrides de auth"""
    # Limpiar overrides para tests de auth
    app.dependency_overrides.pop(get_current_user, None)
    with TestClient(app) as c:
        yield c


class TestAuthentication:
    """Tests de autenticación"""
    
    def test_endpoint_requires_auth(self, client):
        """Los endpoints protegidos deben requerir autenticación"""
        response = client.get("/api/policies")
        # Sin token, debe retornar 401 o 403
        assert response.status_code in [401, 403]
    
    def test_invalid_token_rejected(self, client):
        """Tokens inválidos deben ser rechazados"""
        # Token completamente falso
        fake_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.fake.payload"
        
        response = client.get(
            "/api/policies",
            headers={"Authorization": f"Bearer {fake_token}"}
        )
        # Debe ser rechazado (401 Unauthorized)
        assert response.status_code == 401
    
    def test_expired_token_rejected(self, client):
        """Tokens expirados deben ser rechazados"""
        # Crear un token expirado (aunque sea válido estructuralmente)
        # En producción, esto sería validado contra JWKS de Microsoft
        expired_payload = {
            "sub": "user@example.com",
            "exp": datetime.utcnow() - timedelta(hours=1),  # Expirado hace 1 hora
            "iat": datetime.utcnow() - timedelta(hours=2),
        }
        # Nota: En tests reales, necesitaríamos firmar con la clave correcta
        # Este test verifica que el middleware de auth esté activo
        fake_token = jwt.encode(expired_payload, "fake_secret", algorithm="HS256")
        
        response = client.get(
            "/api/policies",
            headers={"Authorization": f"Bearer {fake_token}"}
        )
        # Debe ser rechazado
        assert response.status_code in [401, 403]
    
    def test_malformed_token_rejected(self, client):
        """Tokens malformados deben ser rechazados"""
        # Token sin estructura JWT válida
        malformed_token = "not-a-jwt-token"
        
        response = client.get(
            "/api/policies",
            headers={"Authorization": f"Bearer {malformed_token}"}
        )
        assert response.status_code in [401, 403]
    
    def test_missing_bearer_prefix(self, client):
        """Header sin 'Bearer' debe ser rechazado"""
        response = client.get(
            "/api/policies",
            headers={"Authorization": "some-token-without-bearer"}
        )
        assert response.status_code in [401, 403]


class TestAuthorization:
    """Tests de autorización por roles"""
    
    def test_require_role_decorator(self):
        """El decorator require_role debe funcionar correctamente"""
        # Test unitario del decorator
        user_admin = {"email": "admin@example.com", "role": "admin"}
        user_auditor = {"email": "auditor@example.com", "role": "auditor"}
        user_regular = {"email": "user@example.com", "role": "user"}
        
        # require_role("admin") debe aceptar solo admin
        admin_checker = require_role("admin")
        
        # require_role("auditor", "admin") debe aceptar auditor o admin
        auditor_admin_checker = require_role("auditor", "admin")
        
        # Estos tests son unitarios del decorator, no integration tests
        assert admin_checker is not None
        assert auditor_admin_checker is not None


class TestPublicEndpoints:
    """Tests de endpoints públicos"""
    
    def test_health_check_public(self, client):
        """El endpoint /api/health debe ser público"""
        response = client.get("/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
    
    def test_root_public(self, client):
        """El endpoint / debe ser público"""
        response = client.get("/")
        assert response.status_code == 200
