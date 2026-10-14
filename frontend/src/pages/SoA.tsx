/**
 * Página de Declaración de Aplicabilidad (SoA)
 * Muestra el mapeo de controles ISO 27001 ↔ requisitos
 */
import { useSoA } from '../api/client';
import { FileText, CheckCircle2, AlertCircle, XCircle, Download } from 'lucide-react';

export default function SoA() {
  const { data: soa, isLoading, error } = useSoA();

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
        <p className="text-red-700">Error al cargar la SoA</p>
      </div>
    );
  }

  if (!soa) return null;

  const statusColors = {
    'Implementado': 'bg-emerald-100 text-emerald-700',
    'Parcial': 'bg-amber-100 text-amber-700',
    'No implementado': 'bg-red-100 text-red-700',
    'N/A': 'bg-slate-100 text-slate-500',
  };

  const handleExport = () => {
    window.open('/api/soa/export', '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Declaración de Aplicabilidad</h1>
          <p className="text-slate-500 mt-1">
            Statement of Applicability (SoA) · ISO 27001
          </p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
        >
          <Download size={18} />
          Exportar CSV
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-5 h-5 text-blue-500" />
            <span className="text-sm text-slate-500">Total Controles</span>
          </div>
          <p className="text-3xl font-bold text-slate-800">{soa.total_controls}</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <span className="text-sm text-slate-500">Aplicables</span>
          </div>
          <p className="text-3xl font-bold text-emerald-600">{soa.applicable_controls}</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            <span className="text-sm text-slate-500">No Aplicables</span>
          </div>
          <p className="text-3xl font-bold text-slate-800">
            {soa.total_controls - soa.applicable_controls}
          </p>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-5 text-white">
          <p className="text-emerald-100 text-sm mb-1">Cumplimiento General</p>
          <p className="text-3xl font-bold">{soa.overall_compliance_rate}%</p>
        </div>
      </div>

      {/* SoA Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800">Controles ISO 27001</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Código</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Control</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Categoría</th>
                <th className="text-center px-4 py-3 font-semibold text-slate-600">Aplicable</th>
                <th className="text-center px-4 py-3 font-semibold text-slate-600">Requisitos</th>
                <th className="text-center px-4 py-3 font-semibold text-slate-600">Cumplidos</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Estado</th>
                <th className="text-center px-4 py-3 font-semibold text-slate-600">%</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {soa.items.map((item) => (
                <tr key={item.control_id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-slate-700">{item.control_code}</td>
                  <td className="px-4 py-3 text-slate-800">{item.control_title}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{item.control_category}</td>
                  <td className="px-4 py-3 text-center">
                    {item.is_applicable ? (
                      <span className="text-emerald-600">✓</span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center text-slate-700">{item.requirements_count}</td>
                  <td className="px-4 py-3 text-center text-slate-700">{item.compliant_requirements}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[item.implementation_status as keyof typeof statusColors]}`}>
                      {item.implementation_status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-100 rounded-full h-2 max-w-[60px]">
                        <div
                          className={`h-2 rounded-full ${
                            item.compliance_rate === 100
                              ? 'bg-emerald-500'
                              : item.compliance_rate > 0
                              ? 'bg-amber-500'
                              : 'bg-slate-300'
                          }`}
                          style={{ width: `${item.compliance_rate}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-600 w-10">{item.compliance_rate}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
