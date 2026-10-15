/**
 * Página de Tablero (Dashboard)
 * Muestra resumen de cumplimiento con gráficos
 */
import { useDashboard } from '../api/client';
import {
  CheckCircle2,
  AlertCircle,
  XCircle,
  Clock,
  TrendingUp,
  FileText,
} from 'lucide-react';

export default function Dashboard() {
  const { data: dashboard, isLoading, error } = useDashboard();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <XCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <p className="text-red-700">Error al cargar el tablero</p>
      </div>
    );
  }

  if (!dashboard) return null;

  const statusColors = {
    Vigente: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'Por vencer': 'bg-amber-100 text-amber-700 border-amber-200',
    Vencida: 'bg-red-100 text-red-700 border-red-200',
    Pendiente: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const statusIcons = {
    Vigente: <CheckCircle2 className="w-5 h-5" />,
    'Por vencer': <Clock className="w-5 h-5" />,
    Vencida: <XCircle className="w-5 h-5" />,
    Pendiente: <AlertCircle className="w-5 h-5" />,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Tablero de Cumplimiento</h1>
        <p className="text-slate-500 mt-1">Resumen del estado de las evidencias ISO 27001</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm text-slate-500">Total Requisitos</span>
          </div>
          <p className="text-3xl font-bold text-slate-800">{dashboard.total_requirements}</p>
        </div>

        {dashboard.status_counts.map((item) => (
          <div key={item.status} className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  statusColors[item.status as keyof typeof statusColors]?.split(' ')[0] ||
                  'bg-slate-100'
                }`}
              >
                <span
                  className={
                    statusColors[item.status as keyof typeof statusColors]?.split(' ')[1] ||
                    'text-slate-600'
                  }
                >
                  {statusIcons[item.status as keyof typeof statusIcons]}
                </span>
              </div>
              <span className="text-sm text-slate-500">{item.status}</span>
            </div>
            <p className="text-3xl font-bold text-slate-800">{item.count}</p>
          </div>
        ))}
      </div>

      {/* Compliance Rate */}
      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-emerald-100 text-sm mb-1">Tasa de Cumplimiento General</p>
            <p className="text-5xl font-bold">{dashboard.overall_compliance_rate}%</p>
          </div>
          <TrendingUp className="w-16 h-16 text-emerald-200" />
        </div>
        <div className="mt-4">
          <div className="w-full bg-emerald-700/30 rounded-full h-3">
            <div
              className="bg-white rounded-full h-3 transition-all duration-500"
              style={{ width: `${dashboard.overall_compliance_rate}%` }}
            />
          </div>
        </div>
      </div>

      {/* Policy Summaries */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800">Cumplimiento por Política</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {dashboard.policy_summaries.map((policy) => (
            <div key={policy.policy_code} className="p-5 hover:bg-slate-50 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-slate-800">{policy.policy_title}</h3>
                  <p className="text-sm text-slate-500">{policy.policy_code}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-slate-800">{policy.compliance_rate}%</p>
                  <p className="text-xs text-slate-500">
                    {policy.compliant}/{policy.total_requirements}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-medium">
                  ✓ {policy.compliant} vigentes
                </span>
                <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">
                  ✗ {policy.non_compliant} pendientes
                </span>
              </div>
              <div className="mt-3">
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className="bg-emerald-500 rounded-full h-2 transition-all duration-500"
                    style={{ width: `${policy.compliance_rate}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
