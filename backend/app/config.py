"""
Configuración de la aplicación.
Lee variables de entorno y las valida con Pydantic.
"""
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Configuración de la aplicación cargada desde variables de entorno"""
    
    # Base de datos
    DATABASE_URL: str
    DB_NAME: str = "evidencias"
    DB_OWNER: str = "evidencias_owner"
    DB_APP_USER: str = "evidencias_app"
    
    # Aplicación
    APP_HOST: str = "localhost"
    ENVIRONMENT: str = "development"  # development | production
    AUTH_DISABLED: bool = False
    
    # Microsoft Entra ID (Azure AD)
    ENTRA_TENANT_ID: Optional[str] = None
    ENTRA_CLIENT_ID: Optional[str] = None
    
    # Scope personalizado para la API
    # Formato: api://<client-id>/access
    # Se registra en Azure AD como un "Expose an API" scope
    API_SCOPE: Optional[str] = None
    
    # Microsoft Graph / SharePoint
    GRAPH_CLIENT_ID: Optional[str] = None
    GRAPH_CLIENT_SECRET: Optional[str] = None
    SP_SITE_ID: Optional[str] = None
    SP_DRIVE_ID: Optional[str] = None
    
    # CORS - orígenes permitidos (separados por coma)
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000"
    
    @property
    def is_production(self) -> bool:
        """Verifica si estamos en producción"""
        return self.ENVIRONMENT.lower() == "production"
    
    @property
    def cors_origins_list(self) -> list[str]:
        """Convierte CORS_ORIGINS a lista"""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]
    
    @property
    def jwks_url(self) -> str:
        """URL de JWKS para validación de tokens"""
        if not self.ENTRA_TENANT_ID:
            raise ValueError("ENTRA_TENANT_ID no configurado")
        return f"https://login.microsoftonline.com/{self.ENTRA_TENANT_ID}/discovery/v2.0/keys"
    
    @property
    def issuer(self) -> str:
        """Issuer esperado en los tokens JWT"""
        if not self.ENTRA_TENANT_ID:
            raise ValueError("ENTRA_TENANT_ID no configurado")
        return f"https://login.microsoftonline.com/{self.ENTRA_TENANT_ID}/v2.0"
    
    @property
    def audience(self) -> str:
        """Audience esperado en los tokens JWT"""
        if not self.ENTRA_CLIENT_ID:
            raise ValueError("ENTRA_CLIENT_ID no configurado")
        return f"api://{self.ENTRA_CLIENT_ID}"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Instancia global de configuración
settings = Settings()
