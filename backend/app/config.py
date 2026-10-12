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
    
    # Microsoft Graph / SharePoint
    GRAPH_CLIENT_ID: Optional[str] = None
    GRAPH_CLIENT_SECRET: Optional[str] = None
    SP_SITE_ID: Optional[str] = None
    SP_DRIVE_ID: Optional[str] = None
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Instancia global de configuración
settings = Settings()
