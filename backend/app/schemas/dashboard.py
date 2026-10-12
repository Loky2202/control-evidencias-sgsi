"""
Schemas para el Tablero (Dashboard).
"""
from pydantic import BaseModel
from typing import List


class StatusCount(BaseModel):
    """Conteo por estado"""
    status: str
    count: int


class PolicySummary(BaseModel):
    """Resumen por política"""
    policy_code: str
    policy_title: str
    total_requirements: int
    compliant: int
    non_compliant: int
    compliance_rate: float


class DashboardResponse(BaseModel):
    """Respuesta del tablero"""
    total_requirements: int
    status_counts: List[StatusCount]
    policy_summaries: List[PolicySummary]
    overall_compliance_rate: float
