"""
Router de Entregas.
Endpoints para crear y consultar entregas de evidencia.

Seguridad:
- GET: cualquier usuario autenticado (user, auditor, admin)
- POST: user, admin (NO auditor - el auditor solo lee)
- PUT/PATCH: user, admin (dueño de la entrega o admin)
- DELETE: solo admin
"""
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, Request, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.db import get_db
from app.models.submission import Submission
from app.models.requirement import Requirement
from app.schemas.submission import SubmissionCreate, SubmissionResponse, SubmissionReview
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


@router.get("/submissions")
def list_submissions(
    requirement_id: Optional[int] = None,
    skip: int = Query(0, ge=0, description="Número de registros a saltar"),
    limit: int = Query(100, ge=1, le=1000, description="Número máximo de registros a retornar"),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),  # Requiere autenticación
):
    """
    Lista entregas con paginación, opcionalmente filtradas por requisito.
    
    Requiere: Cualquier usuario autenticado
    
    Query Params:
        requirement_id: Filtrar por ID de requisito
        skip: Número de registros a saltar (default: 0)
        limit: Número máximo de registros (default: 100, max: 1000)
    
    Returns:
        Dict con 'items', 'total', 'skip', 'limit'
    """
    query = db.query(Submission)
    if requirement_id:
        query = query.filter(Submission.requirement_id == requirement_id)
    
    # Contar total antes de aplicar paginación
    total = query.count()
    
    # Aplicar paginación
    items = (
        query
        .order_by(Submission.evidence_date.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    
    return {
        "items": items,
        "total": total,
        "skip": skip,
        "limit": limit,
    }


@router.patch("/submissions/{id}", response_model=SubmissionResponse)
def update_submission_status(
    id: int,
    review: SubmissionReview,
    request: Request,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_role("auditor", "admin")),  # Solo auditor/admin
):
    """
    Aprueba o rechaza una entrega de evidencia.
    
    Requiere: Rol 'auditor' o 'admin'
    
    Reglas:
    - Solo se puede revisar si la entrega está en estado "Pendiente"
    - El creador de la entrega NO puede aprobarla (conflicto de interés)
    
    Args:
        id: ID de la entrega
        review: Schema con status ("Completa" o "Rechazada") y notas
    
    Returns:
        SubmissionResponse: Entrega actualizada
    
    Raises:
        HTTPException: 404 si no existe, 409 si no está pendiente, 403 si es el creador
    """
    submission = db.query(Submission).filter(Submission.id == id).first()
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Entrega {id} no encontrada"
        )
    
    # Solo se puede revisar si está pendiente
    if submission.status != "Pendiente":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"La entrega ya fue revisada (estado actual: {submission.status})"
        )
    
    # El creador no puede aprobar su propia entrega
    if submission.created_by == current_user["email"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No puedes aprobar tu propia entrega (conflicto de interés)"
        )
    
    old_status = submission.status
    submission.status = review.status
    
    if review.notes:
        submission.notes = review.notes
    
    # Obtener contexto de request para auditoría
    context = get_request_context(request)
    
    # Registrar en auditoría (atómico - mismo commit)
    log_action(
        db=db,
        action="update",
        resource_type="submission",
        resource_id=submission.id,
        description=f"Entrega {old_status} → {review.status}",
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
    
    # Constantes de validación
    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
    
    # Magic numbers para validar tipo de archivo por contenido
    MAGIC_NUMBERS = {
        b'%PDF-': 'application/pdf',
        b'\x89PNG': 'image/png',
        b'\xff\xd8\xff': 'image/jpeg',
        b'PK\x03\x04': 'application/zip',  # XLSX, DOCX son ZIP
    }
    
    # Leer con límite para evitar DoS
    content = await file.read(MAX_FILE_SIZE + 1)
    
    # Validar tamaño
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"El archivo no puede superar los {MAX_FILE_SIZE // (1024*1024)}MB"
        )
    
    # Validar tipo por magic numbers (más seguro que content_type)
    file_type = None
    for magic, mime in MAGIC_NUMBERS.items():
        if content.startswith(magic):
            file_type = mime
            break
    
    if not file_type:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tipo de archivo no reconocido. Permitidos: PDF, PNG, JPG, XLSX, DOCX"
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
