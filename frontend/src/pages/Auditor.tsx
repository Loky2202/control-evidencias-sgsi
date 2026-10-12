/**
 * Página de Auditor
 * Vista de solo lectura para auditores
 */
import { useDashboard, useRequirements, usePolicies } from '../api/client';
import { Shield, FileText, CheckCircle2, AlertCircle, XCircle, Clock } from 'lucide-react';

export default function Auditor() {
  const { data: dashboard } = useDashboard();
  const { data: requirements } = useRequirements();
  const { data: policiesData } = usePolicies();

  const pendingRequirements = requirements?.filter((r) => r.alert_status === 'Pendiente') || [];
  const overdueRequirements = requirements?.filter((r) => r.alert_status === 'Vencida') || [];
  const dueSoonRequirements = requirements?.filter((r) => r.alert_status === 'Por vencer') || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-8 h-8 text-slate-300" />
          <h1 className="text-3xl font-bold">Vista de Auditoría</h1>
        </div>
        <p className="text-slate-300">
          Resumen ejecutivo para revisión de cumplimiento ISO 27001
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-5 h-5 text-blue-500" />
            <span className="text-sm text-slate-500">Total Políticas</span>
          </div>
          <p className="text-3xl font-bold text-slate-800">{policiesData?.total || 0}</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle className="w-5 h-5 text-slate-500" />
            <span className="text-sm text-slate-500">Pendientes</span>
          </div>
          <p className="text-3xl font-bold text-slate-800">{pendingRequirements.length}</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-amber-500" />
            <span className="text-sm text-slate-500">Por Vencer</span>
          </div>
          <p className="text-3xl font-bold text-slate-800">{dueSoonRequirements.length}</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <XCircle className="w-5 h-5 text-red-500" />
            <span className="text-sm text-slate-500">Vencidas</span>
          </div>
          <p className="text-3xl font-bold text-slate-800">{overdueRequirements.length}</p>
        </div>
      </div>

      {/* Compliance Overview */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Resumen de Cumplimiento</h2>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">Tasa General</span>
              <span className="text-2xl font-bold text-slate-800">
                {dashboard?.overall_compliance_rate || 0}%
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3">
              <div
                className="bg-emerald-500 rounded-full h-3 transition-all duration-500"
                style={{ width: `${dashboard?.overall_compliance_rate || 0}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
            {dashboard?.status_counts.map((item) => (
              <div key={item.status} className="text-center">
                <p className="text-2xl font-bold text-slate-800">{item.count}</p>
                <p className="text-xs text-slate-500">{item.status}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Areas of Concern */}
      {overdueRequirements.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-red-800 mb-4 flex items-center gap-2">
            <XCircle className="w-5 h-5" />
            Áreas de Preocupación ({overdueRequirements.length})
          </h2>
          <div className="space-y-2">
            {overdueRequirements.slice(0, 5).map((req) => (
              <div key={req.id} className="bg-white rounded-lg p-3 border border-red-100">
                <div className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-slate-800 text-sm">{req.title}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {req.code} · {req.policy_code} · Venció:{' '}
                      {req.next_due_date && new Date(req.next_due_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {overdueRequirements.length > 5 && (
              <p className="text-sm text-red-700 text-center pt-2">
                Y {overdueRequirements.length - 5} más...
              </p>
            )}
          </div>
        </div>
      )}

      {/* Policy Compliance */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800">Cumplimiento por Política</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {dashboard?.policy_summaries.map((policy) => (
            <div key={policy.policy_code} className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-slate-800">{policy.policy_title}</h3>
                  <p className="text-sm text-slate-500">{policy.policy_code}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-slate-800">{policy.compliance_rate}%</p>
                </div>
              </div>
              <div className="flex gap-4 text-sm text-slate-600">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  {policy.compliant} vigentes
                </span>
                <span className="flex items-center gap-1">
                  <XCircle className="w-4 h-4 text-red-500" />
                  {policy.non_compliant} pendientes
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
