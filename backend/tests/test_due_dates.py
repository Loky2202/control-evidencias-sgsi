"""
Tests para el servicio de cálculo de vencimientos.
"""
import pytest
from datetime import date, timedelta
from unittest.mock import MagicMock

from app.services.due_dates import calculate_requirement_status, add_months


class TestAddMonths:
    """Tests para la función add_months"""
    
    def test_add_one_month(self):
        result = add_months(date(2024, 1, 15), 1)
        assert result == date(2024, 2, 15)
    
    def test_add_three_months(self):
        result = add_months(date(2024, 1, 15), 3)
        assert result == date(2024, 4, 15)
    
    def test_add_months_crossing_year(self):
        result = add_months(date(2024, 11, 15), 3)
        assert result == date(2025, 2, 15)
    
    def test_add_months_end_of_month(self):
        result = add_months(date(2024, 1, 31), 1)
        assert result == date(2024, 2, 29)  # 2024 es bisiesto
    
    def test_add_twelve_months(self):
        result = add_months(date(2024, 3, 15), 12)
        assert result == date(2025, 3, 15)


class TestCalculateRequirementStatus:
    """Tests para calculate_requirement_status"""
    
    def setup_method(self):
        """Configurar mocks para cada test"""
        self.db = MagicMock()
    
    def test_no_submissions_returns_pendiente(self):
        """Sin entregas, el estado debe ser Pendiente"""
        self.db.query.return_value.filter.return_value.order_by.return_value.first.return_value = None
        
        result = calculate_requirement_status(1, self.db)
        
        assert result["alert_status"] == "Pendiente"
        assert result["last_evidence_date"] is None
        assert result["next_due_date"] is None
    
    def test_recent_evidence_returns_vigente(self):
        """Evidencia reciente debe ser Vigente"""
        mock_submission = MagicMock()
        mock_submission.evidence_date = date.today() - timedelta(days=5)
        
        mock_requirement = MagicMock()
        mock_requirement.frequency = "Mensual"
        
        self.db.query.return_value.filter.return_value.order_by.return_value.first.return_value = mock_submission
        self.db.query.return_value.filter.return_value.first.return_value = mock_requirement
        
        result = calculate_requirement_status(1, self.db)
        
        assert result["alert_status"] == "Vigente"
        assert result["last_evidence_date"] == mock_submission.evidence_date
    
    def test_evidence_due_within_30_days_returns_por_vencer(self):
        """Evidencia que vence en 30 días debe ser Por vencer"""
        mock_submission = MagicMock()
        mock_submission.evidence_date = date.today() - timedelta(days=25)
        
        mock_requirement = MagicMock()
        mock_requirement.frequency = "Mensual"
        
        self.db.query.return_value.filter.return_value.order_by.return_value.first.return_value = mock_submission
        self.db.query.return_value.filter.return_value.first.return_value = mock_requirement
        
        result = calculate_requirement_status(1, self.db)
        
        assert result["alert_status"] == "Por vencer"
    
    def test_overdue_evidence_returns_vencida(self):
        """Evidencia vencida debe ser Vencida"""
        mock_submission = MagicMock()
        mock_submission.evidence_date = date.today() - timedelta(days=45)
        
        mock_requirement = MagicMock()
        mock_requirement.frequency = "Mensual"
        
        self.db.query.return_value.filter.return_value.order_by.return_value.first.return_value = mock_submission
        self.db.query.return_value.filter.return_value.first.return_value = mock_requirement
        
        result = calculate_requirement_status(1, self.db)
        
        assert result["alert_status"] == "Vencida"
    
    def test_trimestral_frequency(self):
        """Frecuencia trimestral calcula correctamente"""
        mock_submission = MagicMock()
        mock_submission.evidence_date = date.today() - timedelta(days=60)
        
        mock_requirement = MagicMock()
        mock_requirement.frequency = "Trimestral"
        
        self.db.query.return_value.filter.return_value.order_by.return_value.first.return_value = mock_submission
        self.db.query.return_value.filter.return_value.first.return_value = mock_requirement
        
        result = calculate_requirement_status(1, self.db)
        
        assert result["alert_status"] == "Vigente"
        expected_next = add_months(mock_submission.evidence_date, 3)
        assert result["next_due_date"] == expected_next
    
    def test_anual_frequency(self):
        """Frecuencia anual calcula correctamente"""
        mock_submission = MagicMock()
        mock_submission.evidence_date = date.today() - timedelta(days=300)
        
        mock_requirement = MagicMock()
        mock_requirement.frequency = "Anual"
        
        self.db.query.return_value.filter.return_value.order_by.return_value.first.return_value = mock_submission
        self.db.query.return_value.filter.return_value.first.return_value = mock_requirement
        
        result = calculate_requirement_status(1, self.db)
        
        assert result["alert_status"] == "Vigente"
        expected_next = add_months(mock_submission.evidence_date, 12)
        assert result["next_due_date"] == expected_next
