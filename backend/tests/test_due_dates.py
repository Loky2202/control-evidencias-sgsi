"""
Tests para el servicio de cálculo de vencimientos.
Usa dateutil.relativedelta para pruebas de cálculo de fechas.
"""
import pytest
from datetime import date, timedelta
from unittest.mock import MagicMock
from dateutil.relativedelta import relativedelta

from app.services.due_dates import calculate_requirement_status, FREQUENCY_MONTHS


class TestDateCalculations:
    """Tests para cálculos de fechas con relativedelta"""
    
    def test_add_one_month(self):
        """Agregar 1 mes a una fecha"""
        result = date(2024, 1, 15) + relativedelta(months=1)
        assert result == date(2024, 2, 15)
    
    def test_add_three_months(self):
        """Agregar 3 meses a una fecha"""
        result = date(2024, 1, 15) + relativedelta(months=3)
        assert result == date(2024, 4, 15)
    
    def test_add_months_crossing_year(self):
        """Agregar meses cruzando año"""
        result = date(2024, 11, 15) + relativedelta(months=3)
        assert result == date(2025, 2, 15)
    
    def test_add_months_end_of_month(self):
        """Agregar 1 mes al 31 de enero (año bisiesto 2024)"""
        result = date(2024, 1, 31) + relativedelta(months=1)
        assert result == date(2024, 2, 29)  # 2024 es bisiesto
    
    def test_add_months_end_of_month_non_leap(self):
        """Agregar 1 mes al 31 de enero (año no bisiesto 2023)"""
        result = date(2023, 1, 31) + relativedelta(months=1)
        assert result == date(2023, 2, 28)  # 2023 no es bisiesto
    
    def test_add_twelve_months(self):
        """Agregar 12 meses (1 año)"""
        result = date(2024, 3, 15) + relativedelta(months=12)
        assert result == date(2025, 3, 15)
    
    def test_frequency_months_mapping(self):
        """Verificar mapeo de frecuencias a meses"""
        assert FREQUENCY_MONTHS["Mensual"] == 1
        assert FREQUENCY_MONTHS["Trimestral"] == 3
        assert FREQUENCY_MONTHS["Semestral"] == 6
        assert FREQUENCY_MONTHS["Anual"] == 12
        assert FREQUENCY_MONTHS["Continua"] == 1


class TestCalculateRequirementStatus:
    """Tests para calculate_requirement_status"""
    
    def setup_method(self):
        """Configurar mocks para cada test"""
        self.db = MagicMock()
    
    def test_no_submissions_returns_pendiente(self):
        """Sin entregas, el estado debe ser Pendiente"""
        # Mock: no hay submissions
        self.db.query.return_value.filter.return_value.group_by.return_value.subquery.return_value = MagicMock()
        self.db.query.return_value.all.return_value = []
        
        result = calculate_requirement_status(1, self.db)
        
        assert result["alert_status"] == "Pendiente"
        assert result["last_evidence_date"] is None
        assert result["next_due_date"] is None
    
    def test_recent_evidence_returns_vigente(self):
        """Evidencia reciente debe ser Vigente"""
        evidence_date = date.today() - timedelta(days=5)
        
        # Mock requirement
        mock_requirement = MagicMock()
        mock_requirement.id = 1
        mock_requirement.frequency = "Mensual"
        
        # Mock submission con evidence_date
        mock_submission_row = MagicMock()
        mock_submission_row.requirement_id = 1
        mock_submission_row.last_evidence_date = evidence_date
        
        self.db.query.return_value.filter.return_value.all.return_value = [mock_requirement]
        self.db.query.return_value.filter.return_value.group_by.return_value.subquery.return_value = MagicMock()
        self.db.query.return_value.all.return_value = [(1, evidence_date)]
        
        result = calculate_requirement_status(1, self.db)
        
        assert result["alert_status"] == "Vigente"
        assert result["last_evidence_date"] == evidence_date
    
    def test_evidence_due_within_30_days_returns_por_vencer(self):
        """Evidencia que vence en 30 días debe ser Por vencer"""
        # Para frecuencia mensual, evidencia de hace 25 días vence en 5 días
        evidence_date = date.today() - timedelta(days=25)
        
        mock_requirement = MagicMock()
        mock_requirement.id = 1
        mock_requirement.frequency = "Mensual"
        
        self.db.query.return_value.filter.return_value.all.return_value = [mock_requirement]
        self.db.query.return_value.filter.return_value.group_by.return_value.subquery.return_value = MagicMock()
        self.db.query.return_value.all.return_value = [(1, evidence_date)]
        
        result = calculate_requirement_status(1, self.db)
        
        assert result["alert_status"] == "Por vencer"
    
    def test_overdue_evidence_returns_vencida(self):
        """Evidencia vencida debe ser Vencida"""
        # Para frecuencia mensual, evidencia de hace 45 días está vencida
        evidence_date = date.today() - timedelta(days=45)
        
        mock_requirement = MagicMock()
        mock_requirement.id = 1
        mock_requirement.frequency = "Mensual"
        
        self.db.query.return_value.filter.return_value.all.return_value = [mock_requirement]
        self.db.query.return_value.filter.return_value.group_by.return_value.subquery.return_value = MagicMock()
        self.db.query.return_value.all.return_value = [(1, evidence_date)]
        
        result = calculate_requirement_status(1, self.db)
        
        assert result["alert_status"] == "Vencida"
    
    def test_trimestral_frequency(self):
        """Frecuencia trimestral calcula correctamente"""
        # Evidencia de hace 60 días con frecuencia trimestral (90 días)
        evidence_date = date.today() - timedelta(days=60)
        
        mock_requirement = MagicMock()
        mock_requirement.id = 1
        mock_requirement.frequency = "Trimestral"
        
        self.db.query.return_value.filter.return_value.all.return_value = [mock_requirement]
        self.db.query.return_value.filter.return_value.group_by.return_value.subquery.return_value = MagicMock()
        self.db.query.return_value.all.return_value = [(1, evidence_date)]
        
        result = calculate_requirement_status(1, self.db)
        
        assert result["alert_status"] == "Vigente"
        expected_next = evidence_date + relativedelta(months=3)
        assert result["next_due_date"] == expected_next
    
    def test_anual_frequency(self):
        """Frecuencia anual calcula correctamente"""
        # Evidencia de hace 300 días con frecuencia anual (365 días)
        evidence_date = date.today() - timedelta(days=300)
        
        mock_requirement = MagicMock()
        mock_requirement.id = 1
        mock_requirement.frequency = "Anual"
        
        self.db.query.return_value.filter.return_value.all.return_value = [mock_requirement]
        self.db.query.return_value.filter.return_value.group_by.return_value.subquery.return_value = MagicMock()
        self.db.query.return_value.all.return_value = [(1, evidence_date)]
        
        result = calculate_requirement_status(1, self.db)
        
        assert result["alert_status"] == "Vigente"
        expected_next = evidence_date + relativedelta(months=12)
        assert result["next_due_date"] == expected_next
    
    def test_end_of_month_calculation(self):
        """Cálculo correcto para fin de mes (31 de enero + 1 mes)"""
        # 31 de enero + 1 mes = 29 de febrero (año bisiesto)
        evidence_date = date(2024, 1, 31)
        
        mock_requirement = MagicMock()
        mock_requirement.id = 1
        mock_requirement.frequency = "Mensual"
        
        self.db.query.return_value.filter.return_value.all.return_value = [mock_requirement]
        self.db.query.return_value.filter.return_value.group_by.return_value.subquery.return_value = MagicMock()
        self.db.query.return_value.all.return_value = [(1, evidence_date)]
        
        result = calculate_requirement_status(1, self.db)
        
        expected_next = date(2024, 2, 29)  # 2024 es bisiesto
        assert result["next_due_date"] == expected_next
