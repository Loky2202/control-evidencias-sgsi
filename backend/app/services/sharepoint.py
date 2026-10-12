"""
Servicio de integración con SharePoint vía Microsoft Graph.
Maneja la subida y gestión de archivos adjuntos.
"""
import httpx
from typing import Optional, Dict, Any
from fastapi import HTTPException

from app.config import settings


class SharePointService:
    """Servicio para interactuar con SharePoint a través de Microsoft Graph"""
    
    GRAPH_BASE_URL = "https://graph.microsoft.com/v1.0"
    
    def __init__(self):
        self.site_id = settings.SP_SITE_ID
        self.drive_id = settings.SP_DRIVE_ID
        self.client_id = settings.GRAPH_CLIENT_ID
        self.client_secret = settings.GRAPH_CLIENT_SECRET
        self._access_token: Optional[str] = None
    
    async def _get_access_token(self) -> str:
        """Obtiene un token de acceso para Microsoft Graph"""
        if self._access_token:
            return self._access_token
        
        token_url = f"https://login.microsoftonline.com/{settings.ENTRA_TENANT_ID}/oauth2/v2.0/token"
        
        async with httpx.AsyncClient() as client:
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
                raise HTTPException(
                    status_code=500,
                    detail=f"Error al obtener token de Graph: {response.text}",
                )
            
            self._access_token = response.json()["access_token"]
            return self._access_token
    
    async def _get_headers(self) -> Dict[str, str]:
        """Obtiene los headers para las llamadas a Graph"""
        token = await self._get_access_token()
        return {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        }
    
    async def upload_file(
        self,
        file_content: bytes,
        filename: str,
        folder_path: str = "evidencias",
    ) -> Dict[str, Any]:
        """
        Sube un archivo a SharePoint.
        
        Args:
            file_content: Contenido del archivo en bytes
            filename: Nombre del archivo
            folder_path: Ruta de la carpeta en SharePoint
        
        Returns:
            Dict con webUrl, id y otros metadatos del archivo
        """
        headers = await self._get_headers()
        
        # Asegurar que la carpeta existe
        await self._ensure_folder(folder_path, headers)
        
        # Subir el archivo
        upload_url = (
            f"{self.GRAPH_BASE_URL}/drives/{self.drive_id}"
            f"/root:/{folder_path}/{filename}:/content"
        )
        
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.put(
                upload_url,
                headers={
                    "Authorization": f"Bearer {headers['Authorization'].split(' ')[1]}",
                    "Content-Type": "application/octet-stream",
                },
                content=file_content,
            )
            
            if response.status_code not in (200, 201):
                raise HTTPException(
                    status_code=500,
                    detail=f"Error al subir archivo a SharePoint: {response.text}",
                )
            
            data = response.json()
            return {
                "sharepoint_url": data.get("webUrl", ""),
                "sharepoint_item_id": data.get("id", ""),
                "file_size": data.get("size", 0),
                "content_type": data.get("file", {}).get("mimeType", ""),
            }
    
    async def _ensure_folder(self, folder_path: str, headers: Dict[str, str]):
        """Asegura que una carpeta existe en SharePoint, la crea si no existe"""
        check_url = (
            f"{self.GRAPH_BASE_URL}/drives/{self.drive_id}"
            f"/root:/{folder_path}"
        )
        
        async with httpx.AsyncClient() as client:
            response = await client.get(check_url, headers=headers)
            
            if response.status_code == 404:
                # Crear la carpeta
                create_url = (
                    f"{self.GRAPH_BASE_URL}/drives/{self.drive_id}"
                    f"/root/children"
                )
                await client.post(
                    create_url,
                    headers=headers,
                    json={
                        "name": folder_path,
                        "folder": {},
                        "@microsoft.graph.conflictBehavior": "fail",
                    },
                )
    
    async def delete_file(self, item_id: str) -> bool:
        """
        Elimina un archivo de SharePoint.
        
        Args:
            item_id: ID del item en SharePoint
        
        Returns:
            True si se eliminó correctamente
        """
        headers = await self._get_headers()
        delete_url = f"{self.GRAPH_BASE_URL}/drives/{self.drive_id}/items/{item_id}"
        
        async with httpx.AsyncClient() as client:
            response = await client.delete(delete_url, headers=headers)
            return response.status_code in (200, 204)
    
    async def get_file_info(self, item_id: str) -> Dict[str, Any]:
        """
        Obtiene información de un archivo en SharePoint.
        
        Args:
            item_id: ID del item en SharePoint
        
        Returns:
            Dict con información del archivo
        """
        headers = await self._get_headers()
        info_url = f"{self.GRAPH_BASE_URL}/drives/{self.drive_id}/items/{item_id}"
        
        async with httpx.AsyncClient() as client:
            response = await client.get(info_url, headers=headers)
            
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
