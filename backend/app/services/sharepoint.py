"""
Servicio de integración con SharePoint vía Microsoft Graph.
Maneja la subida y gestión de archivos adjuntos.

Características de seguridad:
- Renovación automática de tokens al expirar
- Sanitización de nombres de archivo
- Validación de tipos MIME y tamaño
- Reintentos con backoff exponencial
"""
import re
import time
import logging
from typing import Optional, Dict, Any
from datetime import datetime, timedelta

import httpx
from fastapi import HTTPException

from app.config import settings

logger = logging.getLogger(__name__)


# Tipos MIME permitidos
ALLOWED_MIME_TYPES = {
    "application/pdf",
    "image/png",
    "image/jpeg",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",  # XLSX
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",  # DOCX
    "text/plain",
    "text/csv",
}

# Tamaño máximo: 10 MB
MAX_FILE_SIZE = 10 * 1024 * 1024

# Extensiones peligrosas que deben bloquearse
BLOCKED_EXTENSIONS = {
    ".exe", ".bat", ".cmd", ".com", ".cpl", ".dll", ".hta",
    ".inf", ".jar", ".js", ".jse", ".lnk", ".msc", ".msi",
    ".ps1", ".psc1", ".reg", ".scr", ".sct", ".shb", ".shs",
    ".vb", ".vbe", ".vbs", ".wsc", ".wsf", ".wsf", ".wsh",
}


def sanitize_filename(filename: str) -> str:
    """
    Sanitiza un nombre de archivo para evitar ataques de path traversal
    y caracteres inválidos.
    
    Args:
        filename: Nombre original del archivo
    
    Returns:
        str: Nombre sanitizado
    
    Raises:
        ValueError: Si el nombre es inválido después de sanitizar
    """
    if not filename:
        raise ValueError("El nombre del archivo no puede estar vacío")
    
    # Remover path traversal
    filename = filename.replace("..", "").replace("/", "").replace("\\", "")
    
    # Remover caracteres de control y especiales
    filename = re.sub(r'[<>:"/\\|?*\x00-\x1f]', '', filename)
    
    # Remover espacios al inicio y final
    filename = filename.strip()
    
    # Limitar longitud
    if len(filename) > 200:
        name, ext = filename.rsplit('.', 1) if '.' in filename else (filename, '')
        filename = name[:200 - len(ext) - 1] + ('.' + ext if ext else '')
    
    if not filename:
        raise ValueError("El nombre del archivo es inválido después de sanitizar")
    
    # Verificar extensión bloqueada
    ext = filename.rsplit('.', 1)[-1].lower() if '.' in filename else ''
    if f".{ext}" in BLOCKED_EXTENSIONS:
        raise ValueError(f"Tipo de archivo bloqueado por seguridad: .{ext}")
    
    return filename


def validate_file(file_content: bytes, filename: str, content_type: Optional[str] = None):
    """
    Valida el contenido y tipo de un archivo.
    
    Args:
        file_content: Contenido del archivo en bytes
        filename: Nombre del archivo
        content_type: Tipo MIME declarado
    
    Raises:
        ValueError: Si el archivo no pasa las validaciones
    """
    # Validar tamaño
    if len(file_content) > MAX_FILE_SIZE:
        raise ValueError(
            f"El archivo supera el tamaño máximo de {MAX_FILE_SIZE // (1024*1024)}MB"
        )
    
    if len(file_content) == 0:
        raise ValueError("El archivo está vacío")
    
    # Validar nombre
    sanitize_filename(filename)
    
    # Validar tipo MIME
    if content_type and content_type not in ALLOWED_MIME_TYPES:
        raise ValueError(
            f"Tipo de archivo no permitido: {content_type}. "
            f"Permitidos: {', '.join(sorted(ALLOWED_MIME_TYPES))}"
        )


class SharePointService:
    """Servicio para interactuar con SharePoint a través de Microsoft Graph"""
    
    GRAPH_BASE_URL = "https://graph.microsoft.com/v1.0"
    TOKEN_EXPIRY_BUFFER = 300  # Renovar 5 minutos antes de expirar
    
    def __init__(self):
        self.site_id = settings.SP_SITE_ID
        self.drive_id = settings.SP_DRIVE_ID
        self.client_id = settings.GRAPH_CLIENT_ID
        self.client_secret = settings.GRAPH_CLIENT_SECRET
        self._access_token: Optional[str] = None
        self._token_expiry: Optional[datetime] = None
        self._max_retries = 3
    
    def _is_token_valid(self) -> bool:
        """Verifica si el token actual es válido"""
        if not self._access_token or not self._token_expiry:
            return False
        # Renovar si está por expirar (buffer de 5 minutos)
        return datetime.utcnow() < (self._token_expiry - timedelta(seconds=self.TOKEN_EXPIRY_BUFFER))
    
    async def _get_access_token(self) -> str:
        """
        Obtiene un token de acceso para Microsoft Graph.
        Renueva automáticamente si está expirado o por expirar.
        """
        if self._is_token_valid():
            return self._access_token
        
        logger.info("Obteniendo nuevo token de acceso para Microsoft Graph")
        
        token_url = f"https://login.microsoftonline.com/{settings.ENTRA_TENANT_ID}/oauth2/v2.0/token"
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                token_url,
                data={
                    "grant_type": "client_credentials",
                    "client_id": self.client_id,
                    "client_secret": self.client_secret,
                    "scope": "https://graph.microsoft.com/.default",
                },
            )
            
            if response.status_code != 200:
                logger.error(f"Error al obtener token: {response.status_code} - {response.text}")
                raise HTTPException(
                    status_code=500,
                    detail=f"Error al obtener token de Graph: {response.status_code}",
                )
            
            data = response.json()
            self._access_token = data["access_token"]
            # expires_in viene en segundos
            expires_in = data.get("expires_in", 3600)
            self._token_expiry = datetime.utcnow() + timedelta(seconds=expires_in)
            
            logger.info(f"Token obtenido, expira en {expires_in}s")
            return self._access_token
    
    async def _get_headers(self) -> Dict[str, str]:
        """Obtiene los headers para las llamadas a Graph"""
        token = await self._get_access_token()
        return {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        }
    
    async def _request_with_retry(
        self,
        method: str,
        url: str,
        max_retries: int = None,
        **kwargs
    ) -> httpx.Response:
        """
        Realiza una petición HTTP con reintentos y backoff exponencial.
        Maneja específicamente errores 401 (token expirado) y 429 (rate limit).
        """
        if max_retries is None:
            max_retries = self._max_retries
        
        for attempt in range(max_retries):
            try:
                # Asegurar token fresco
                token = await self._get_access_token()
                
                # Actualizar headers
                headers = kwargs.pop("headers", {})
                headers["Authorization"] = f"Bearer {token}"
                
                async with httpx.AsyncClient(timeout=60.0) as client:
                    response = await client.request(method, url, headers=headers, **kwargs)
                
                # Si es 401, el token expiró, renovarlo y reintentar
                if response.status_code == 401 and attempt < max_retries - 1:
                    logger.warning("Token expirado, renovando...")
                    self._access_token = None
                    self._token_expiry = None
                    continue
                
                # Si es 429 (rate limit), esperar y reintentar
                if response.status_code == 429 and attempt < max_retries - 1:
                    retry_after = int(response.headers.get("Retry-After", 2 ** attempt))
                    logger.warning(f"Rate limit, esperando {retry_after}s...")
                    time.sleep(retry_after)
                    continue
                
                return response
            
            except httpx.TimeoutException:
                if attempt == max_retries - 1:
                    raise
                logger.warning(f"Timeout en intento {attempt + 1}, reintentando...")
                time.sleep(2 ** attempt)
            
            except httpx.NetworkError:
                if attempt == max_retries - 1:
                    raise
                logger.warning(f"Error de red en intento {attempt + 1}, reintentando...")
                time.sleep(2 ** attempt)
        
        raise HTTPException(status_code=500, detail="Máximo de reintentos alcanzado")
    
    async def upload_file(
        self,
        file_content: bytes,
        filename: str,
        folder_path: str = "evidencias",
        content_type: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Sube un archivo a SharePoint con validaciones de seguridad.
        
        Args:
            file_content: Contenido del archivo en bytes
            filename: Nombre del archivo
            folder_path: Ruta de la carpeta en SharePoint
            content_type: Tipo MIME del archivo
        
        Returns:
            Dict con webUrl, id y otros metadatos del archivo
        
        Raises:
            ValueError: Si el archivo no pasa las validaciones
            HTTPException: Si hay error al subir
        """
        # Validar archivo
        validate_file(file_content, filename, content_type)
        
        # Sanitizar nombre
        safe_filename = sanitize_filename(filename)
        
        # Asegurar que la carpeta existe
        await self._ensure_folder(folder_path)
        
        # Subir el archivo
        upload_url = (
            f"{self.GRAPH_BASE_URL}/drives/{self.drive_id}"
            f"/root:/{folder_path}/{safe_filename}:/content"
        )
        
        response = await self._request_with_retry(
            "PUT",
            upload_url,
            content=file_content,
            headers={"Content-Type": "application/octet-stream"},
        )
        
        if response.status_code not in (200, 201):
            logger.error(f"Error al subir archivo: {response.status_code} - {response.text}")
            raise HTTPException(
                status_code=500,
                detail=f"Error al subir archivo a SharePoint: {response.status_code}",
            )
        
        data = response.json()
        return {
            "sharepoint_url": data.get("webUrl", ""),
            "sharepoint_item_id": data.get("id", ""),
            "file_size": data.get("size", len(file_content)),
            "content_type": data.get("file", {}).get("mimeType", content_type or ""),
        }
    
    async def _ensure_folder(self, folder_path: str):
        """Asegura que una carpeta existe en SharePoint, la crea si no existe"""
        check_url = (
            f"{self.GRAPH_BASE_URL}/drives/{self.drive_id}"
            f"/root:/{folder_path}"
        )
        
        response = await self._request_with_retry("GET", check_url)
        
        if response.status_code == 404:
            # Crear la carpeta
            create_url = (
                f"{self.GRAPH_BASE_URL}/drives/{self.drive_id}"
                f"/root/children"
            )
            
            folder_name = folder_path.split("/")[-1]
            response = await self._request_with_retry(
                "POST",
                create_url,
                json={
                    "name": folder_name,
                    "folder": {},
                    "@microsoft.graph.conflictBehavior": "fail",
                },
            )
            
            if response.status_code not in (200, 201):
                logger.warning(f"No se pudo crear la carpeta {folder_path}")
    
    async def delete_file(self, item_id: str) -> bool:
        """
        Elimina un archivo de SharePoint.
        
        Args:
            item_id: ID del item en SharePoint
        
        Returns:
            True si se eliminó correctamente
        """
        delete_url = f"{self.GRAPH_BASE_URL}/drives/{self.drive_id}/items/{item_id}"
        response = await self._request_with_retry("DELETE", delete_url)
        return response.status_code in (200, 204)
    
    async def get_file_info(self, item_id: str) -> Dict[str, Any]:
        """
        Obtiene información de un archivo en SharePoint.
        
        Args:
            item_id: ID del item en SharePoint
        
        Returns:
            Dict con información del archivo
        """
        info_url = f"{self.GRAPH_BASE_URL}/drives/{self.drive_id}/items/{item_id}"
        response = await self._request_with_retry("GET", info_url)
        
        if response.status_code != 200:
            raise HTTPException(
                status_code=404,
                detail=f"Archivo no encontrado en SharePoint: {item_id}",
            )
        
        data = response.json()
        return {
            "name": data.get("name", ""),
            "size": data.get("size", 0),
            "web_url": data.get("webUrl", ""),
            "created_date_time": data.get("createdDateTime", ""),
            "last_modified_date_time": data.get("lastModifiedDateTime", ""),
        }


# Instancia global del servicio
sharepoint_service = SharePointService()
