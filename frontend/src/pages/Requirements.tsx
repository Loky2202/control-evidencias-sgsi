/**
 * Página de Requisitos
 * Lista todos los requisitos con filtros y estados
 */
import { useState } from 'react';
import { useRequirements, usePolicies } from '../api/client';
import { CheckCircle2, AlertCircle, XCircle, Clock, Filter, Search } from 'lucide-react';

export default function Requirements() {
  const [selectedPolicy, setSelectedPolicy] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: policiesData } = usePolicies();
  const { data: requirements, isLoading, error } = useRequirements(selectedPolicy || undefined);

  const filteredRequirements = requirements?.filter((req) => {
    const matchesStatus = !selectedStatus || req.alert_status === selectedStatus;
    const matchesSearch =
      !searchTerm ||
      req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.code.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

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
        <h1 className="text-3xl font-bold text-slate-800">Requisitos de Evidencia</h1>
        <p className="text-slate-500 mt-1">
          {filteredRequirements?.length || 0} requisitos
          {selectedPolicy && ` · ${selectedPolicy}`}
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-5 h-5 text-slate-400" />
          <span className="text-sm font-medium text-slate-700">Filtros</span>
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por código o título..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Policy Filter */}
          <select
            value={selectedPolicy}
            onChange={(e) => setSelectedPolicy(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">Todas las políticas</option>
            {policiesData?.policies.map((p) => (
              <option key={p.code} value={p.code}>
                {p.code} - {p.title}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">Todos los estados</option>
            <option value="Vigente">Vigente</option>
            <option value="Por vencer">Por vencer</option>
            <option value="Vencida">Vencida</option>
            <option value="Pendiente">Pendiente</option>
          </select>
        </div>
      </div>

      {/* Requirements List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <p className="text-red-700">Error al cargar los requisitos</p>
        </div>
      ) : filteredRequirements && filteredRequirements.length > 0 ? (
        <div className="space-y-3">
          {filteredRequirements.map((req) => (
            <div
              key={req.id}
              className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${
                    statusColors[req.alert_status as keyof typeof statusColors]?.split(' ')[0] ||
                    'bg-slate-100'
                  }`}
                >
                  <span
                    className={
                      statusColors[req.alert_status as keyof typeof statusColors]?.split(' ')[1] ||
                      'text-slate-600'
                    }
                  >
                    {statusIcons[req.alert_status as keyof typeof statusIcons]}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-xs font-mono text-slate-400">{req.code}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium border ${
                        statusColors[req.alert_status as keyof typeof statusColors] ||
                        'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {req.alert_status}
                    </span>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                      {req.frequency}
                    </span>
                  </div>
                  <h3 className="font-semibold text-slate-800 mb-1">{req.title}</h3>
                  {req.description && (
                    <p className="text-sm text-slate-600 mb-3">{req.description}</p>
                  )}
                  <div className="flex gap-4 text-xs text-slate-500">
                    <span>Política: {req.policy_code}</span>
                    {req.last_evidence_date && (
                      <span>
                        Última: {new Date(req.last_evidence_date).toLocaleDateString()}
                      </span>
                    )}
                    {req.next_due_date && (
                      <span>
                        Próxima: {new Date(req.next_due_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-12 text-center">
          <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-600">No se encontraron requisitos con los filtros seleccionados</p>
        </div>
      )}
    </div>
  );
}
