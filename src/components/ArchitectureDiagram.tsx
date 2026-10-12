export default function ArchitectureDiagram() {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 overflow-x-auto">
      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-6">Diagrama de arquitectura</h3>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-0 min-w-[500px]">
        {/* Browser */}
        <div className="flex flex-col items-center">
          <div className="w-28 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl border border-slate-300 flex flex-col items-center justify-center shadow-sm">
            <span className="text-2xl">🌐</span>
            <span className="text-xs font-medium text-slate-600 mt-1">Navegador</span>
          </div>
        </div>

        {/* Arrow 1 */}
        <div className="flex flex-col items-center px-2">
          <div className="hidden sm:block w-16 h-0.5 bg-gradient-to-r from-slate-300 to-emerald-300" />
          <div className="sm:hidden h-8 w-0.5 bg-gradient-to-b from-slate-300 to-emerald-300" />
          <span className="text-[10px] text-slate-400 mt-1">HTTPS 443</span>
        </div>

        {/* Web/Caddy */}
        <div className="flex flex-col items-center">
          <div className="w-32 h-20 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-300 flex flex-col items-center justify-center shadow-sm">
            <span className="text-2xl">🔒</span>
            <span className="text-xs font-medium text-emerald-700 mt-1">web: Caddy</span>
            <span className="text-[10px] text-emerald-500">+ frontend</span>
          </div>
        </div>

        {/* Arrow 2 */}
        <div className="flex flex-col items-center px-2">
          <div className="hidden sm:block w-16 h-0.5 bg-gradient-to-r from-emerald-300 to-blue-300" />
          <div className="sm:hidden h-8 w-0.5 bg-gradient-to-b from-emerald-300 to-blue-300" />
          <span className="text-[10px] text-slate-400 mt-1">/api/* proxy</span>
        </div>

        {/* API */}
        <div className="flex flex-col items-center">
          <div className="w-32 h-20 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-300 flex flex-col items-center justify-center shadow-sm">
            <span className="text-2xl">⚡</span>
            <span className="text-xs font-medium text-blue-700 mt-1">api: FastAPI</span>
          </div>
        </div>

        {/* Arrow 3 */}
        <div className="flex flex-col items-center px-2">
          <div className="hidden sm:block w-16 h-0.5 bg-gradient-to-r from-blue-300 to-violet-300" />
          <div className="sm:hidden h-8 w-0.5 bg-gradient-to-b from-blue-300 to-violet-300" />
          <span className="text-[10px] text-slate-400 mt-1">red interna</span>
        </div>

        {/* Database */}
        <div className="flex flex-col items-center">
          <div className="w-28 h-20 bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl border border-violet-300 flex flex-col items-center justify-center shadow-sm">
            <span className="text-2xl">🗄️</span>
            <span className="text-xs font-medium text-violet-700 mt-1">db: PostgreSQL</span>
          </div>
        </div>
      </div>

      {/* Secondary connections */}
      <div className="mt-8 flex flex-wrap justify-center gap-6">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <div className="w-3 h-3 rounded-full bg-amber-200 border border-amber-400" />
          <span>Browser → Entra ID (login)</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <div className="w-3 h-3 rounded-full bg-orange-200 border border-orange-400" />
          <span>API → Microsoft Graph → SharePoint</span>
        </div>
      </div>
    </div>
  );
}
