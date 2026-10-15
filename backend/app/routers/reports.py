"""
Router de Reportes.
Endpoints para exportar reportes de auditoría en Excel y PDF.

Seguridad:
- Todos los endpoints requieren rol 'auditor' o 'admin'
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime, date
import io

from app.db import get_db
from app.models.audit import AuditLog
from app.models.submission import Submission
from app.models.requirement import Requirement
from app.auth.dependencies import require_auditor, require_admin
from app.services.audit import log_action, get_request_context
from app.services.retention import (
    get_retention_policy,
    get_retention_summary,
    cleanup_expired_submissions,
)

router = APIRouter()


@router.get("/reports/audit-log/excel")
async def export_audit_log_excel(
    start_date: Optional[date] = Query(None, description="Fecha inicio"),
    end_date: Optional[date] = Query(None, description="Fecha fin"),
    action: Optional[str] = Query(None, description="Filtrar por acción"),
    user_email: Optional[str] = Query(None, description="Filtrar por usuario"),
    request: Request = None,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_auditor),
):
    """
    Exporta el log de auditoría en formato Excel.
    
    Requiere: Rol 'auditor' o 'admin'
    """
    from openpyxl import Workbook
    from openpyxl.styles import Font, PatternFill
    
    # Construir query
    query = db.query(AuditLog)
    
    if start_date:
        query = query.filter(AuditLog.created_at >= datetime.combine(start_date, datetime.min.time()))
    if end_date:
        query = query.filter(AuditLog.created_at <= datetime.combine(end_date, datetime.max.time()))
    if action:
        query = query.filter(AuditLog.action == action)
    if user_email:
        query = query.filter(AuditLog.user_email == user_email)
    
    logs = query.order_by(AuditLog.created_at.desc()).all()
    
    # Crear workbook
    wb = Workbook()
    ws = wb.active
    ws.title = "Audit Log"
    
    # Header
    headers = ["ID", "Fecha/Hora", "Acción", "Tipo Recurso", "ID Recurso", 
               "Descripción", "Usuario", "Rol", "IP", "User Agent"]
    ws.append(headers)
    
    # Estilo del header
    header_fill = PatternFill(start_color="366092", end_color="366092", fill_type="solid")
    header_font = Font(bold=True, color="FFFFFF")
    for cell in ws[1]:
        cell.fill = header_fill
        cell.font = header_font
    
    # Datos
    for log in logs:
        ws.append([
            log.id,
            log.created_at.strftime("%Y-%m-%d %H:%M:%S") if log.created_at else "",
            log.action,
            log.resource_type or "",
            log.resource_id or "",
            log.description or "",
            log.user_email or "",
            log.user_role or "",
            log.ip_address or "",
            log.user_agent or "",
        ])
    
    # Ajustar ancho de columnas
    for column in ws.columns:
        max_length = 0
        column_letter = column[0].column_letter
        for cell in column:
            try:
                if len(str(cell.value)) > max_length:
                    max_length = len(str(cell.value))
            except:
                pass
        adjusted_width = min(max_length + 2, 50)
        ws.column_dimensions[column_letter].width = adjusted_width
    
    # Guardar en memoria
    output = io.BytesIO()
    wb.save(output)
    output.seek(0)
    
    # Registrar en auditoría
    if request:
        context = get_request_context(request)
        log_action(
            db=db,
            action="export",
            resource_type="audit_log",
            description="Exportación de audit log a Excel",
            user_email=current_user["email"],
            user_role=current_user.get("role", "auditor"),
            ip_address=context["ip_address"],
            user_agent=context["user_agent"],
        )
        db.commit()
    
    filename = f"audit_log_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
    
    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@router.get("/reports/submissions/excel")
async def export_submissions_excel(
    policy_code: Optional[str] = Query(None, description="Filtrar por política"),
    status: Optional[str] = Query(None, description="Filtrar por estado"),
    request: Request = None,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_auditor),
):
    """
    Exporta las entregas de evidencia en formato Excel.
    
    Requiere: Rol 'auditor' o 'admin'
    """
    from openpyxl import Workbook
    from openpyxl.styles import Font, PatternFill
    
    # Construir query
    query = db.query(Submission).join(Requirement)
    
    if policy_code:
        query = query.filter(Requirement.policy_code == policy_code)
    if status:
        query = query.filter(Submission.status == status)
    
    submissions = query.order_by(Submission.evidence_date.desc()).all()
    
    # Crear workbook
    wb = Workbook()
    ws = wb.active
    ws.title = "Entregas"
    
    # Header
    headers = ["ID", "Requisito", "Política", "Fecha Evidencia", "Estado", 
               "Notas", "Creado Por", "Fecha Creación"]
    ws.append(headers)
    
    # Estilo del header
    header_fill = PatternFill(start_color="366092", end_color="366092", fill_type="solid")
    header_font = Font(bold=True, color="FFFFFF")
    for cell in ws[1]:
        cell.fill = header_fill
        cell.font = header_font
    
    # Datos
    for sub in submissions:
        req = db.query(Requirement).filter(Requirement.id == sub.requirement_id).first()
        ws.append([
            sub.id,
            req.code if req else "",
            req.policy_code if req else "",
            sub.evidence_date.strftime("%Y-%m-%d") if sub.evidence_date else "",
            sub.status,
            sub.notes or "",
            sub.created_by or "",
            sub.created_at.strftime("%Y-%m-%d %H:%M:%S") if sub.created_at else "",
        ])
    
    # Ajustar ancho de columnas
    for column in ws.columns:
        max_length = 0
        column_letter = column[0].column_letter
        for cell in column:
            try:
                if len(str(cell.value)) > max_length:
                    max_length = len(str(cell.value))
            except:
                pass
        adjusted_width = min(max_length + 2, 50)
        ws.column_dimensions[column_letter].width = adjusted_width
    
    # Guardar en memoria
    output = io.BytesIO()
    wb.save(output)
    output.seek(0)
    
    # Registrar en auditoría
    if request:
        context = get_request_context(request)
        log_action(
            db=db,
            action="export",
            resource_type="submissions",
            description="Exportación de entregas a Excel",
            user_email=current_user["email"],
            user_role=current_user.get("role", "auditor"),
            ip_address=context["ip_address"],
            user_agent=context["user_agent"],
        )
        db.commit()
    
    filename = f"entregas_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
    
    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@router.get("/reports/audit-log/pdf")
async def export_audit_log_pdf(
    start_date: Optional[date] = Query(None, description="Fecha inicio"),
    end_date: Optional[date] = Query(None, description="Fecha fin"),
    action: Optional[str] = Query(None, description="Filtrar por acción"),
    request: Request = None,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_auditor),
):
    """
    Exporta el log de auditoría en formato PDF.
    
    Requiere: Rol 'auditor' o 'admin'
    """
    from reportlab.lib.pagesizes import letter
    from reportlab.lib import colors
    from reportlab.lib.styles import getSampleStyleSheet
    from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
    from reportlab.lib.units import inch
    
    # Construir query
    query = db.query(AuditLog)
    
    if start_date:
        query = query.filter(AuditLog.created_at >= datetime.combine(start_date, datetime.min.time()))
    if end_date:
        query = query.filter(AuditLog.created_at <= datetime.combine(end_date, datetime.max.time()))
    if action:
        query = query.filter(AuditLog.action == action)
    
    logs = query.order_by(AuditLog.created_at.desc()).limit(100).all()  # Limitar a 100 para PDF
    
    # Crear PDF en memoria
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    styles = getSampleStyleSheet()
    elements = []
    
    # Título
    title = Paragraph("Log de Auditoría - Evidencias ISO 27001", styles['Title'])
    elements.append(title)
    elements.append(Spacer(1, 0.2 * inch))
    
    # Fecha del reporte
    date_text = Paragraph(f"Generado: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", styles['Normal'])
    elements.append(date_text)
    elements.append(Spacer(1, 0.2 * inch))
    
    # Tabla de datos
    data = [["Fecha/Hora", "Acción", "Usuario", "Descripción"]]
    
    for log in logs:
        data.append([
            log.created_at.strftime("%Y-%m-%d %H:%M") if log.created_at else "",
            log.action,
            log.user_email or "",
            (log.description or "")[:50],  # Truncar descripción
        ])
    
    table = Table(data, colWidths=[1.5*inch, 1*inch, 2*inch, 3*inch])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#366092')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('FONTSIZE', (0, 1), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
    ]))
    
    elements.append(table)
    
    # Construir PDF
    doc.build(elements)
    
    # Registrar en auditoría
    if request:
        context = get_request_context(request)
        log_action(
            db=db,
            action="export",
            resource_type="audit_log",
            description="Exportación de audit log a PDF",
            user_email=current_user["email"],
            user_role=current_user.get("role", "auditor"),
            ip_address=context["ip_address"],
            user_agent=context["user_agent"],
        )
        db.commit()
    
    buffer.seek(0)
    filename = f"audit_log_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
    
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


# ============================================
# ENDPOINTS DE POLÍTICA DE RETENCIÓN
# ============================================

@router.get("/reports/retention/policy")
async def get_retention_policy_endpoint(
    current_user: dict = Depends(require_auditor),
):
    """
    Obtiene la política de retención de evidencias actual.
    
    Requiere: Rol 'auditor' o 'admin'
    
    Returns:
        Dict con períodos de retención por tipo de evidencia
    """
    return {
        "policy": get_retention_policy(),
        "description": {
            "completa": "Evidencias aprobadas/completas - 7 años (regulaciones ISO)",
            "rechazada": "Evidencias rechazadas - 2 años",
            "pendiente": "Evidencias pendientes sin actividad - 1 año",
            "audit_log": "Logs de auditoría - 10 años (regulación, no se eliminan automáticamente)",
        }
    }


@router.get("/reports/retention/summary")
async def get_retention_summary_endpoint(
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_auditor),
):
    """
    Obtiene un resumen del estado de retención de evidencias.
    
    Requiere: Rol 'auditor' o 'admin'
    
    Returns:
        Dict con conteo de evidencias por estado y próximas a expirar
    """
    return get_retention_summary(db)


@router.post("/reports/retention/cleanup")
async def cleanup_expired_submissions_endpoint(
    dry_run: bool = Query(True, description="Si True, solo simula la eliminación"),
    request: Request = None,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_admin),  # Solo admin puede ejecutar limpieza
):
    """
    Elimina las entregas que han excedido su período de retención.
    
    Requiere: Rol 'admin'
    
    Args:
        dry_run: Si True, solo simula la eliminación sin borrar realmente
    
    Returns:
        Dict con estadísticas de la limpieza
    """
    stats = cleanup_expired_submissions(db, dry_run=dry_run)
    
    # Registrar en auditoría
    if request:
        context = get_request_context(request)
        action_desc = "Simulación" if dry_run else "Ejecución"
        log_action(
            db=db,
            action="cleanup",
            resource_type="submissions",
            description=f"{action_desc} de limpieza de evidencias expiradas",
            details=f"Stats: {stats}",
            user_email=current_user["email"],
            user_role=current_user.get("role", "admin"),
            ip_address=context["ip_address"],
            user_agent=context["user_agent"],
        )
        db.commit()
    
    return {
        "success": True,
        "dry_run": dry_run,
        "stats": stats,
        "message": "Simulación exitosa" if dry_run else "Limpieza ejecutada exitosamente"
    }
