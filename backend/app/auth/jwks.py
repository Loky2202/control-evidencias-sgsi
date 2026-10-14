"""
Servicio JWKS (JSON Web Key Set) para validación de tokens JWT.
Obtiene las claves públicas de Microsoft Entra ID y las cachea.
"""
import time
import logging
from typing import Optional, Dict, Any
from threading import Lock

import httpx
import jwt
from jwt import PyJWKClient, PyJWK

from app.config import settings

logger = logging.getLogger(__name__)


class JWKSManager:
    """
    Gestor de JWKS con caché.
    
    Características:
    - Obtiene claves públicas desde el endpoint JWKS de Microsoft
    - Cachea las claves en memoria para evitar requests repetidos
    - Refresca automáticamente cuando una clave no se encuentra
    - Thread-safe para uso concurrente
    """
    
    def __init__(self, jwks_url: str, cache_ttl: int = 3600):
        """
        Args:
            jwks_url: URL del endpoint JWKS
            cache_ttl: Tiempo de vida de la caché en segundos (default: 1 hora)
        """
        self.jwks_url = jwks_url
        self.cache_ttl = cache_ttl
        self._jwks_client: Optional[PyJWKClient] = None
        self._cache_time: float = 0
        self._lock = Lock()
    
    def _get_jwks_client(self) -> PyJWKClient:
        """Obtiene o crea el cliente JWKS"""
        with self._lock:
            current_time = time.time()
            
            # Crear cliente si no existe o si la caché expiró
            if self._jwks_client is None or (current_time - self._cache_time) > self.cache_ttl:
                logger.info(f"Actualizando caché JWKS desde {self.jwks_url}")
                self._jwks_client = PyJWKClient(
                    self.jwks_url,
                    cache_keys=True,
                    timeout=10,
                )
                self._cache_time = current_time
            
            return self._jwks_client
    
    def get_signing_key(self, kid: str) -> PyJWK:
        """
        Obtiene la clave de firma para un key ID específico.
        
        Args:
            kid: Key ID del token JWT
        
        Returns:
            PyJWK: Clave pública para verificar la firma
        
        Raises:
            jwt.PyJWKClientError: Si la clave no se encuentra
        """
        client = self._get_jwks_client()
        
        try:
            return client.get_signing_key(kid)
        except jwt.PyJWKClientError:
            # Si no encontramos la clave, refrescar la caché
            logger.warning(f"Clave {kid} no encontrada, refrescando caché JWKS")
            with self._lock:
                self._jwks_client = None
                self._cache_time = 0
            
            # Intentar una vez más
            client = self._get_jwks_client()
            return client.get_signing_key(kid)
    
    def decode_token(
        self,
        token: str,
        audience: str,
        issuer: str,
        algorithms: list[str] = None,
    ) -> Dict[str, Any]:
        """
        Decodifica y valida un token JWT.
        
        Args:
            token: Token JWT a validar
            audience: Audience esperado
            issuer: Issuer esperado
            algorithms: Algoritmos permitidos (default: ["RS256"])
        
        Returns:
            Dict con los claims del token
        
        Raises:
            jwt.ExpiredSignatureError: Token expirado
            jwt.InvalidAudienceError: Audience incorrecto
            jwt.InvalidIssuerError: Issuer incorrecto
            jwt.InvalidTokenError: Token inválido
        """
        if algorithms is None:
            algorithms = ["RS256"]
        
        # Obtener el header para extraer el kid
        unverified_header = jwt.get_unverified_header(token)
        kid = unverified_header.get("kid")
        
        if not kid:
            raise jwt.InvalidTokenError("Token no tiene 'kid' en el header")
        
        # Obtener la clave de firma
        signing_key = self.get_signing_key(kid)
        
        # Decodificar y validar el token
        return jwt.decode(
            token,
            signing_key.key,
            algorithms=algorithms,
            audience=audience,
            issuer=issuer,
            options={
                "verify_aud": True,
                "verify_exp": True,
                "verify_nbf": True,
                "verify_iat": True,
                "verify_iss": True,
            },
        )


# Instancia global del gestor JWKS
_jwks_manager: Optional[JWKSManager] = None


def get_jwks_manager() -> JWKSManager:
    """Obtiene la instancia global del gestor JWKS"""
    global _jwks_manager
    
    if _jwks_manager is None:
        _jwks_manager = JWKSManager(
            jwks_url=settings.jwks_url,
            cache_ttl=3600,  # 1 hora
        )
    
    return _jwks_manager


def reset_jwks_manager():
    """Resetea el gestor JWKS (útil para testing)"""
    global _jwks_manager
    _jwks_manager = None
