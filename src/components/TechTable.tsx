const techData = [
  {
    piece: 'API',
    recommendation: 'Python 3.12 + FastAPI',
    reason: 'Poco código, validación automática, documentación interactiva en /api/docs y facilita pruebas',
    color: 'emerald',
  },
  {
    piece: 'ORM y migraciones',
    recommendation: 'SQLAlchemy 2 + Alembic',
    reason: 'Los cambios de la base de datos quedan versionados en Git',
    color: 'blue',
  },
  {
    piece: 'Validación',
    recommendation: 'Pydantic (viene con FastAPI)',
    reason: 'Los datos se validan antes de tocar la base de datos',
    color: 'violet',
  },
  {
    piece: 'Base de datos',
    recommendation: 'PostgreSQL (versión estable)',
    reason: 'Relacional, fiable, buenas vistas y respaldos',
    color: 'sky',
  },
  {
    piece: 'Frontend',
    recommendation: 'React + Vite + TypeScript',
    reason: 'Encaja con una interfaz de filas expandibles, adjuntos y tablero',
    color: 'cyan',
  },
  {
    piece: 'Datos en el frontend',
    recommendation: 'TanStack Query',
    reason: 'Maneja carga, caché y recarga sin código manual',
    color: 'orange',
  },
  {
    piece: 'Estilos',
    recommendation: 'Tailwind CSS',
    reason: 'Rápido para pantallas con tablas y tarjetas',
    color: 'teal',
  },
  {
    piece: 'Login',
    recommendation: 'MSAL (@azure/msal-react)',
    reason: 'Sin contraseñas propias; la API valida el token de Entra ID',
    color: 'rose',
  },
  {
    piece: 'Archivos',
    recommendation: 'Microsoft Graph',
    reason: 'Los archivos van a SharePoint desde la API',
    color: 'indigo',
  },
  {
    piece: 'Proxy y HTTPS',
    recommendation: 'Caddy',
    reason: 'Certificados y redirección con configuración mínima',
    color: 'amber',
  },
  {
    piece: 'Pruebas',
    recommendation: 'pytest + Vitest',
    reason: 'Cubren la lógica que más importa: vencimientos y permisos',
    color: 'pink',
  },
];

const colorMap: Record<string, string> = {
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  blue: 'bg-blue-50 text-blue-700 border-blue-200',
  violet: 'bg-violet-50 text-violet-700 border-violet-200',
  sky: 'bg-sky-50 text-sky-700 border-sky-200',
  cyan: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  orange: 'bg-orange-50 text-orange-700 border-orange-200',
  teal: 'bg-teal-50 text-teal-700 border-teal-200',
  rose: 'bg-rose-50 text-rose-700 border-rose-200',
  indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  amber: 'bg-amber-50 text-amber-700 border-amber-200',
  pink: 'bg-pink-50 text-pink-700 border-pink-200',
};

export default function TechTable() {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="text-left px-5 py-3 font-semibold text-slate-600">Pieza</th>
            <th className="text-left px-5 py-3 font-semibold text-slate-600">Recomendación</th>
            <th className="text-left px-5 py-3 font-semibold text-slate-600 hidden sm:table-cell">Por qué</th>
          </tr>
        </thead>
        <tbody>
          {techData.map((row, i) => (
            <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
              <td className="px-5 py-3.5 font-medium text-slate-800 whitespace-nowrap">{row.piece}</td>
              <td className="px-5 py-3.5">
                <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-medium border ${colorMap[row.color]}`}>
                  {row.recommendation}
                </span>
              </td>
              <td className="px-5 py-3.5 text-slate-500 hidden sm:table-cell">{row.reason}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
