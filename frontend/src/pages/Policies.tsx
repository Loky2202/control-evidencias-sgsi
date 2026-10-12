/**
 * Página de Políticas
 * Lista todas las políticas con sus requisitos
 */
import { useState } from 'react';
import { usePolicies, useRequirements } from '../api/client';
import { ChevronRight, ChevronDown, FileText, CheckCircle2, AlertCircle, XCircle, Clock } from 'lucide-react';

export default function Policies() {
  const { data: policiesData, isLoading, error } = usePolicies();
  const [expandedPolicy, setExpandedPolicy] = useState<string | null>(null);

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
        <p className="text-red-700">Error al cargar las políticas</p>
      </div>
    );
  }

  const policies = policiesData?.policies || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Políticas de Seguridad</h1>
        <p className="text-slate-500 mt-1">
          {policies.length} políticas · Haz clic para ver requisitos
        </p>
      </div>

      {/* Policies List */}
      <div className="space-y-3">
        {policies.map((policy) => (
          <PolicyCard
            key={policy.id}
            policy={policy}
            isExpanded={expandedPolicy === policy.code}
            onToggle={() =>
              setExpandedPolicy(expandedPolicy === policy.code ? null : policy.code)
            }
          />
        ))}
      </div>
    </div>
  );
}

function PolicyCard({
  policy,
  isExpanded,
  onToggle,
}: {
  policy: any;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const { data: requirements, isLoading } = useRequirements(
    isExpanded ? policy.code : undefined
  );

  const statusColors = {
    Vigente: 'bg-emerald-100 text-emerald-700',
    'Por vencer': 'bg-amber-100 text-amber-700',
    Vencida: 'bg-red-100 text-red-700',
    Pendiente: 'bg-slate-100 text-slate-700',
  };

  const statusIcons = {
    Vigente: <CheckCircle2 className="w-4 h-4" />,
    'Por vencer': <Clock className="w-4 h-4" />,
    Vencida: <XCircle className="w-4 h-4" />,
    Pendiente: <AlertCircle className="w-4 h-4" />,
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-4 p-5 text-left hover:bg-slate-50 transition-colors"
      >
        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
          <FileText className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-slate-400">{policy.code}</span>
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-xs font-medium">
              {policy.status}
            </span>
          </div>
          <h3 className="font-semibold text-slate-800">{policy.title}</h3>
          {policy.description && (
            <p className="text-sm text-slate-500 mt-1 line-clamp-1">{policy.description}</p>
          )}
        </div>
        {isExpanded ? (
          <ChevronDown className="w-5 h-5 text-slate-400" />
        ) : (
          <ChevronRight className="w-5 h-5 text-slate-400" />
        )}
      </button>

      {isExpanded && (
        <div className="border-t border-slate-100 bg-slate-50">
          {isLoading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto"></div>
            </div>
          ) : requirements && requirements.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {requirements.map((req) => (
                <div key={req.id} className="p-4 hover:bg-white transition-colors">
                  <div className="flex items-start gap-3">
                    <span
                      className={`flex-shrink-0 ${
                        statusColors[req.alert_status as keyof typeof statusColors]?.split(' ')[1] ||
                        'text-slate-500'
                      }`}
                    >
                      {statusIcons[req.alert_status as keyof typeof statusIcons]}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-slate-400">{req.code}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${
                            statusColors[req.alert_status as keyof typeof statusColors] ||
                            'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {req.alert_status}
                        </span>
                      </div>
                      <h4 className="font-medium text-slate-800 text-sm">{req.title}</h4>
                      <div className="flex gap-3 mt-2 text-xs text-slate-500">
                        <span>Frecuencia: {req.frequency}</span>
                        {req.next_due_date && (
                          <span>Próximo: {new Date(req.next_due_date).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-slate-500 text-sm">
              No hay requisitos para esta política
            </div>
          )}
        </div>
      )}
    </div>
  );
}
