"""
Router de Entregas.
Endpoints para crear y consultar entregas de evidencia.

Seguridad:
- GET: cualquier usuario autenticado (user, auditor, admin)
- POST: user, admin (NO auditor - el auditor solo lee)
- PUT/PATCH: user, admin (dueño de la entrega o admin)
- DELETE: solo admin
"""
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, Request
from sqlalchemy.orm import Session
from typing import List, Optional

from app.db import get_db
from app.models.submission import Submission
from app.models.requirement import Requirement
from app.schemas.submission import SubmissionCreate, SubmissionResponse
from app.services.audit import log_action, get_request_context
from app.auth.dependencies import get_current_user, require_role

router = APIRouter()


@router.post("/submissions", response_model=SubmissionResponse, status_code=status.HTTP_201_CREATED)
def create_submission(
    submission: SubmissionCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_role("user", "admin")),  # NO auditor
):
    """
    Crea una nueva entrega de evidencia.
    
    Requiere: Rol 'user' o 'admin' (NO 'auditor')
    
    Args:
        submission: Datos de la entrega
    
    Returns:
        SubmissionResponse: Entrega creada
    
    Raises:
        HTTPException: 404 si el requisito no existe
    """
    # Verificar que el requisito existe
    requirement = db.query(Requirement).filter(Requirement.id == submission.requirement_id).first()
    if not requirement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Requisito {submission.requirement_id} no encontrado",
        )
    
    # Crear la entrega
    new_submission = Submission(
        requirement_id=submission.requirement_id,
        evidence_date=submission.evidence_date,
        notes=submission.notes,
        status="Pendiente",
        created_by=current_user["email"],
    )
    
    db.add(new_submission)
    
    # Obtener contexto de request para auditoría
    context = get_request_context(request)
    
    # Registrar en auditoría (atómico - mismo commit)
    log_action(
        db=db,
        action="create",
        resource_type="submission",
        resource_id=new_submission.id,
        description=f"Entrega creada para requisito {requirement.code}",
        user_email=current_user["email"],
        user_role=current_user.get("role", "user"),
        ip_address=context["ip_address"],
        user_agent=context["user_agent"],
    )
    
    # Commit atómico: submission + audit_log
    db.commit()
    db.refresh(new_submission)
    
    return new_submission


@router.get("/submissions/{id}", response_model=SubmissionResponse)
def get_submission(
    id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),  # Requiere autenticación
):
    """
    Obtiene una entrega por ID con sus adjuntos.
    
    Requiere: Cualquier usuario autenticado
    
    Args:
        id: ID de la entrega
    
    Raises:
        HTTPException: 404 si la entrega no existe
    """
    submission = db.query(Submission).filter(Submission.id == id).first()
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Entrega {id} no encontrada"
        )
    return submission


@router.get("/submissions", response_model=List[SubmissionResponse])
def list_submissions(
    requirement_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),  # Requiere autenticación
):
    """
    Lista entregas, opcionalmente filtradas por requisito.
    
    Requiere: Cualquier usuario autenticado
    
    Query Params:
        requirement_id: Filtrar por ID de requisito
    """
    query = db.query(Submission)
    if requirement_id:
        query = query.filter(Submission.requirement_id == requirement_id)
    
    return query.order_by(Submission.evidence_date.desc()).all()


@router.patch("/submissions/{id}", response_model=SubmissionResponse)
def update_submission_status(
    id: int,
    status_update: dict,  # {"status": "Completa" | "Rechazada", "notes": "..."}
    request: Request,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_role("auditor", "admin")),  # Solo auditor/admin
):
    """
    Aprueba o rechaza una entrega de evidencia.
    
    Requiere: Rol 'auditor' o 'admin'
    
    Args:
        id: ID de la entrega
        status_update: Dict con 'status' y opcionalmente 'notes'
    
    Returns:
        SubmissionResponse: Entrega actualizada
    
    Raises:
        HTTPException: 404 si no existe, 400 si status inválido
    """
    submission = db.query(Submission).filter(Submission.id == id).first()
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Entrega {id} no encontrada"
        )
    
    new_status = status_update.get("status")
    if new_status not in ["Completa", "Rechazada"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El estado debe ser 'Completa' o 'Rechazada'"
        )
    
    old_status = submission.status
    submission.status = new_status
    
    if "notes" in status_update:
        submission.notes = status_update["notes"]
    
    # Obtener contexto de request para auditoría
    context = get_request_context(request)
    
    # Registrar en auditoría (atómico - mismo commit)
    log_action(
        db=db,
        action="update",
        resource_type="submission",
        resource_id=submission.id,
        description=f"Entrega {old_status} → {new_status}",
        user_email=current_user["email"],
        user_role=current_user.get("role", "auditor"),
        ip_address=context["ip_address"],
        user_agent=context["user_agent"],
    )
    
    # Commit atómico: submission + audit_log
    db.commit()
    db.refresh(submission)
    
    return submission


@router.post("/submissions/{id}/attachments", status_code=status.HTTP_201_CREATED)
async def upload_attachment(
    id: int,
    file: UploadFile,
    request: Request,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_role("user", "admin")),
):
    """
    Sube un archivo adjunto a una entrega (a SharePoint).
    
    Requiere: Rol 'user' o 'admin'
    
    Args:
        id: ID de la entrega
        file: Archivo a subir
    
    Returns:
        Dict con metadata del archivo subido
    
    Raises:
        HTTPException: 404 si la entrega no existe, 400 si archivo inválido
    """
    from fastapi import UploadFile
    from app.services.sharepoint import sharepoint_service
    from app.models.attachment import Attachment
    
    # Validar que la entrega existe
    submission = db.query(Submission).filter(Submission.id == id).first()
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Entrega {id} no encontrada"
        )
    
    # Validar tipo de archivo
    allowed_types = ["application/pdf", "image/png", "image/jpeg", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Tipo de archivo no permitido: {file.content_type}. Permitidos: PDF, PNG, JPG, XLSX, DOCX"
        )
    
    # Validar tamaño (máximo 10MB)
    content = await file.read()
    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El archivo no puede superar los 10MB"
        )
    
    # Subir a SharePoint
    try:
        result = await sharepoint_service.upload_file(
            file_content=content,
            filename=file.filename,
            folder_path=f"evidencias/submission-{id}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al subir archivo a SharePoint: {str(e)}"
        )
    
    # Guardar metadata en BD
    attachment = Attachment(
        submission_id=id,
        filename=file.filename,
        file_size=len(content),
        content_type=file.content_type,
        sharepoint_url=result["sharepoint_url"],
        sharepoint_item_id=result["sharepoint_item_id"],
        uploaded_by=current_user["email"],
    )
    
    db.add(attachment)
    
    # Obtener contexto de request para auditoría
    context = get_request_context(request)
    
    # Registrar en auditoría (atómico - mismo commit)
    log_action(
        db=db,
        action="create",
        resource_type="attachment",
        resource_id=attachment.id,
        description=f"Archivo subido: {file.filename}",
        user_email=current_user["email"],
        user_role=current_user.get("role", "user"),
        ip_address=context["ip_address"],
        user_agent=context["user_agent"],
    )
    
    # Commit atómico: attachment + audit_log
    db.commit()
    db.refresh(attachment)
    
    return {
        "id": attachment.id,
        "filename": attachment.filename,
        "file_size": attachment.file_size,
        "sharepoint_url": attachment.sharepoint_url,
        "uploaded_at": attachment.uploaded_at.isoformat(),
    }


@router.delete("/submissions/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_submission(
    id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_role("admin")),  # Solo admin
):
    """
    Elimina una entrega.
    
    Requiere: Rol admin
    
    Args:
        id: ID de la entrega
    
    Raises:
        HTTPException: 404 si la entrega no existe
    """
    submission = db.query(Submission).filter(Submission.id == id).first()
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Entrega {id} no encontrada"
        )
    
    # Obtener contexto de request para auditoría
    context = get_request_context(request)
    
    # Registrar en auditoría antes de eliminar (atómico - mismo commit)
    log_action(
        db=db,
        action="delete",
        resource_type="submission",
        resource_id=submission.id,
        description=f"Entrega eliminada (requisito {submission.requirement_id})",
        user_email=current_user["email"],
        user_role=current_user.get("role", "admin"),
        ip_address=context["ip_address"],
        user_agent=context["user_agent"],
    )
    
    db.delete(submission)
    
    # Commit atómico: delete + audit_log
    db.commit()
