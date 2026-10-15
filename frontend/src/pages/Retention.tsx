import { useState, useEffect } from 'react';
import { Calendar, AlertTriangle, Trash2, Download, RefreshCw } from 'lucide-react';
import { getAccessToken } from '../api/client';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

interface RetentionSummary {
  policy: {
    completa: number;
    rechazada: number;
    pendiente: number;
    audit_log: number;
  };
  counts: {
    Completa: number;
    Rechazada: number;
    Pendiente: number;
  };
  expiring_soon: {
    Completa: number;
    Rechazada: number;
    Pendiente: number;
  };
  audit_logs_total: number;
}

interface CleanupStats {
  success: boolean;
  dry_run: boolean;
  stats: {
    completa_deleted: number;
    rechazada_deleted: number;
    pendiente_deleted: number;
    attachments_deleted: number;
    dry_run: boolean;
  };
  message: string;
}

export default function Retention() {
  const [summary, setSummary] = useState<RetentionSummary | null>(null);
  const [cleanupResult, setCleanupResult] = useState<CleanupStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [cleaning, setCleaning] = useState(false);
  const [dryRun, setDryRun] = useState(true);

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {
    try {
      setLoading(true);
      const token = await getAccessToken();
      const response = await fetch(`${API_BASE_URL}/reports/retention/summary`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setSummary(data);
    } catch (error) {
      console.error('Error loading retention summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const executeCleanup = async () => {
    try {
      setCleaning(true);
      setCleanupResult(null);
      
      const token = await getAccessToken();
      const response = await fetch(
        `${API_BASE_URL}/reports/retention/cleanup?dry_run=${dryRun}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setCleanupResult(data);
      
      // Recargar resumen después de la limpieza
      await loadSummary();
    } catch (error) {
      console.error('Error executing cleanup:', error);
      alert('Error al ejecutar la limpieza. Verifica los permisos.');
    } finally {
      setCleaning(false);
    }
  };

  const exportAuditLog = async (format: 'excel' | 'pdf') => {
    try {
      const token = await getAccessToken();
      const endpoint = format === 'excel' ? 'excel' : 'pdf';
      const response = await fetch(`${API_BASE_URL}/reports/audit-log/${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `audit_log.${format === 'excel' ? 'xlsx' : 'pdf'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting audit log:', error);
      alert('Error al exportar el log de auditoría.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
        <p className="text-gray-600">No se pudo cargar el resumen de retención</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Política de Retención
        </h1>
        <p className="text-gray-600">
          Gestión del ciclo de vida de evidencias según ISO 27001
        </p>
      </div>

      {/* Policy Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Evidencias Completas</h3>
            <Calendar className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{summary.policy.completa} años</p>
          <p className="text-sm text-gray-500 mt-1">Regulación ISO 27001</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Evidencias Rechazadas</h3>
            <Calendar className="w-5 h-5 text-yellow-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{summary.policy.rechazada} años</p>
          <p className="text-sm text-gray-500 mt-1">Historial de no conformidades</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-gray-500">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Evidencias Pendientes</h3>
            <Calendar className="w-5 h-5 text-gray-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{summary.policy.pendiente} año</p>
          <p className="text-sm text-gray-500 mt-1">Sin actividad</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Logs de Auditoría</h3>
            <Calendar className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{summary.policy.audit_log} años</p>
          <p className="text-sm text-gray-500 mt-1">Regulación legal</p>
        </div>
      </div>

      {/* Current Status */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Estado Actual</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-3">Evidencias por Estado</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Completas:</span>
                  <span className="font-semibold text-green-600">{summary.counts.Completa}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Rechazadas:</span>
                  <span className="font-semibold text-red-600">{summary.counts.Rechazada}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Pendientes:</span>
                  <span className="font-semibold text-yellow-600">{summary.counts.Pendiente}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-3">Próximas a Expirar (90 días)</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Completas:</span>
                  <span className="font-semibold text-orange-600">
                    {summary.expiring_soon.Completa}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Rechazadas:</span>
                  <span className="font-semibold text-orange-600">
                    {summary.expiring_soon.Rechazada}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Pendientes:</span>
                  <span className="font-semibold text-orange-600">
                    {summary.expiring_soon.Pendiente}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-3">Logs de Auditoría</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Total:</span>
                  <span className="font-semibold text-gray-900">
                    {summary.audit_logs_total.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Protegidos:</span>
                  <span className="font-semibold text-green-600">Sí</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cleanup Section */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Limpieza de Evidencias Expiradas</h2>
        </div>
        <div className="p-6">
          <div className="mb-6">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={dryRun}
                onChange={(e) => setDryRun(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-gray-700">
                Modo simulación (dry-run) - No eliminará nada
              </span>
            </label>
            <p className="text-sm text-gray-500 mt-2 ml-7">
              {dryRun 
                ? 'Se mostrará qué evidencias serían eliminadas sin borrar realmente'
                : '⚠️ Las evidencias expiradas serán eliminadas permanentemente'}
            </p>
          </div>

          <button
            onClick={executeCleanup}
            disabled={cleaning}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              dryRun
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-red-600 hover:bg-red-700 text-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {cleaning ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Procesando...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-5 h-5" />
                <span>{dryRun ? 'Simular Limpieza' : 'Ejecutar Limpieza'}</span>
              </>
            )}
          </button>

          {cleanupResult && (
            <div className={`mt-6 p-4 rounded-lg ${
              cleanupResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              <h3 className={`font-semibold mb-2 ${
                cleanupResult.success ? 'text-green-900' : 'text-red-900'
              }`}>
                {cleanupResult.message}
              </h3>
              <div className="space-y-1 text-sm">
                <p className="text-gray-700">
                  <span className="font-medium">Completas eliminadas:</span> {cleanupResult.stats.completa_deleted}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Rechazadas eliminadas:</span> {cleanupResult.stats.rechazada_deleted}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Pendientes eliminadas:</span> {cleanupResult.stats.pendiente_deleted}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Adjuntos eliminados:</span> {cleanupResult.stats.attachments_deleted}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Export Section */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Exportar Reportes</h2>
        </div>
        <div className="p-6">
          <p className="text-gray-600 mb-4">
            Exporta el log de auditoría para revisiones y cumplimiento ISO 27001
          </p>
          <div className="flex space-x-4">
            <button
              onClick={() => exportAuditLog('excel')}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <Download className="w-5 h-5" />
              <span>Exportar Excel</span>
            </button>
            <button
              onClick={() => exportAuditLog('pdf')}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              <Download className="w-5 h-5" />
              <span>Exportar PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
