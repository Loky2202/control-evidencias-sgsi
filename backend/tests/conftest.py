"""
Configuración de fixtures para pytest.
"""
import pytest
from unittest.mock import MagicMock
from fastapi.testclient import TestClient

from app.main import app
from app.db import get_db


@pytest.fixture
def client():
    """Cliente de prueba de FastAPI"""
    return TestClient(app)


@pytest.fixture
def mock_db():
    """Mock de la sesión de base de datos"""
    db = MagicMock()
    app.dependency_overrides[get_db] = lambda: db
    yield db
    app.dependency_overrides.clear()
