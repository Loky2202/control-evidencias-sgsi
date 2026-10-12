"""
Tests para permisos y roles de usuario.
"""
import pytest
from unittest.mock import patch, MagicMock

from app.auth.dependencies import get_current_user, require_role
from app.config import settings


class TestGetCurrentUser:
    """Tests para la dependencia get_current_user"""
    
    @pytest.mark.asyncio
    async def test_auth_disabled_returns_dev_user(self):
        """Con AUTH_DISABLED=True, devuelve usuario de desarrollo"""
        with patch.object(settings, 'AUTH_DISABLED', True):
            credentials = MagicMock()
            credentials.credentials = "fake-token"
            
            user = await get_current_user(credentials)
            
            assert user["email"] == "dev@example.com"
            assert user["role"] == "admin"
    
    @pytest.mark.asyncio
    async def test_auth_enabled_validates_token(self):
        """Con AUTH_ENABLED, valida el token"""
        with patch.object(settings, 'AUTH_DISABLED', False):
            credentials = MagicMock()
            credentials.credentials = "valid-token"
            
            user = await get_current_user(credentials)
            
            assert "email" in user
            assert "role" in user


class TestRequireRole:
    """Tests para la dependencia require_role"""
    
    @pytest.mark.asyncio
    async def test_admin_role_granted(self):
        """Usuario admin tiene acceso a endpoints admin"""
        admin_user = {"email": "admin@example.com", "role": "admin"}
        
        checker = require_role("admin")
        result = await checker(admin_user)
        
        assert result["email"] == "admin@example.com"
    
    @pytest.mark.asyncio
    async def test_user_role_denied_for_admin(self):
        """Usuario normal no tiene acceso a endpoints admin"""
        from fastapi import HTTPException
        
        normal_user = {"email": "user@example.com", "role": "user"}
        
        checker = require_role("admin")
        
        with pytest.raises(HTTPException) as exc_info:
            await checker(normal_user)
        
        assert exc_info.value.status_code == 403
    
    @pytest.mark.asyncio
    async def test_auditor_role(self):
        """Usuario auditor tiene acceso a endpoints de auditor"""
        auditor_user = {"email": "auditor@example.com", "role": "auditor"}
        
        checker = require_role("auditor")
        result = await checker(auditor_user)
        
        assert result["role"] == "auditor"
