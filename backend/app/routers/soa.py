"""
Router de Declaración de Aplicabilidad (SoA - Statement of Applicability).
Genera el documento SoA mapeando controles ↔ requisitos.

Seguridad:
- GET: cualquier usuario autenticado (auditor/admin especialmente)
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel

from app.db import get_db
from app.models.control import Control
from app.models.requirement import Requirement
from app.services.due_dates import calculate_requirement_status
from app.auth.dependencies import get_current_user, require_auditor

router = APIRouter()


class SoAItem(BaseModel):
    """Item individual de la Declaración de Aplicabilidad"""
    control_id: int
    control_code: str
    control_title: str
    control_category: str
    is_applicable: bool
    justification: str
    implementation_status: str  # "Implementado", "Parcial", "No implementado", "N/A"
    requirements_count: int
    compliant_requirements: int
    compliance_rate: float


class SoAResponse(BaseModel):
    """Respuesta completa de la Declaración de Aplicabilidad"""
    total_controls: int
    applicable_controls: int
    items: List[SoAItem]
    overall_compliance_rate: float


@router.get("/soa", response_model=SoAResponse)
def get_statement_of_applicability(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),  # Cualquier usuario autenticado
):
    """
    Genera la Declaración de Aplicabilidad (SoA).
    
    Mapea cada control ISO 27001 con sus requisitos asociados y calcula:
    - Si el control es aplicable (tiene requisitos asociados)
    - Estado de implementación
    - Tasa de cumplimiento
    
    Requiere: Cualquier usuario autenticado
    """
    controls = db.query(Control).order_by(Control.code).all()
    
    items = []
    total_applicable = 0
    total_compliant = 0
    total_requirements = 0
    
    for control in controls:
        # Obtener requisitos asociados a este control
        requirements = db.query(Requirement).filter(
            Requirement.control_id == control.id
        ).all()
        
        req_count = len(requirements)
        is_applicable = req_count > 0
        
        if is_applicable:
            total_applicable += 1
            total_requirements += req_count
            
            # Calcular cumplimiento
            compliant = 0
            for req in requirements:
                status_data = calculate_requirement_status(req.id, db)
                if status_data["alert_status"] in ["Vigente", "Por vencer"]:
                    compliant += 1
            
            total_compliant += compliant
            compliance_rate = (compliant / req_count * 100) if req_count > 0 else 0
            
            # Determinar estado de implementación
            if compliance_rate == 100:
                impl_status = "Implementado"
            elif compliance_rate > 0:
                impl_status = "Parcial"
            else:
                impl_status = "No implementado"
            
            justification = f"{req_count} requisito(s) asociado(s)"
        else:
            compliance_rate = 0
            impl_status = "N/A"
            justification = "Sin requisitos asociados"
        
        items.append(SoAItem(
            control_id=control.id,
            control_code=control.code,
            control_title=control.title,
            control_category=control.category or "Sin categoría",
            is_applicable=is_applicable,
            justification=justification,
            implementation_status=impl_status,
            requirements_count=req_count,
            compliant_requirements=compliant if is_applicable else 0,
            compliance_rate=round(compliance_rate, 2),
        ))
    
    # Calcular tasa general
    overall_rate = (
        (total_compliant / total_requirements * 100)
        if total_requirements > 0 else 0
    )
    
    return SoAResponse(
        total_controls=len(controls),
        applicable_controls=total_applicable,
        items=items,
        overall_compliance_rate=round(overall_rate, 2),
    )


@router.get("/soa/export")
def export_soa_csv(
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_auditor),  # Solo auditor/admin
):
    """
    Exporta la SoA en formato CSV.
    
    Requiere: Rol 'auditor' o 'admin'
    """
    from fastapi.responses import StreamingResponse
    import csv
    import io
    
    controls = db.query(Control).order_by(Control.code).all()
    
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Header
    writer.writerow([
        "Código Control",
        "Título",
        "Categoría",
        "Aplicable",
        "Justificación",
        "Estado Implementación",
        "Requisitos",
        "Cumplidos",
        "Tasa Cumplimiento (%)",
    ])
    
    for control in controls:
        requirements = db.query(Requirement).filter(
            Requirement.control_id == control.id
        ).all()
        
        req_count = len(requirements)
        is_applicable = req_count > 0
        
        if is_applicable:
            compliant = sum(
                1 for req in requirements
                if calculate_requirement_status(req.id, db)["alert_status"] in ["Vigente", "Por vencer"]
            )
            compliance_rate = round((compliant / req_count * 100), 2) if req_count > 0 else 0
            
            if compliance_rate == 100:
                impl_status = "Implementado"
            elif compliance_rate > 0:
                impl_status = "Parcial"
            else:
                impl_status = "No implementado"
            
            justification = f"{req_count} requisito(s) asociado(s)"
        else:
            compliant = 0
            compliance_rate = 0
            impl_status = "N/A"
            justification = "Sin requisitos asociados"
        
        writer.writerow([
            control.code,
            control.title,
            control.category or "",
            "Sí" if is_applicable else "No",
            justification,
            impl_status,
            req_count,
            compliant,
            compliance_rate,
        ])
    
    output.seek(0)
    
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=soa_export.csv"},
    )
