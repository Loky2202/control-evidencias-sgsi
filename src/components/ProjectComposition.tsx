import { useState } from 'react';
import {
  Layers,
  Monitor,
  Server,
  Database,
  Cloud,
  Key,
  FolderTree,
  Network,
  FileCode,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  ArrowDown,
} from 'lucide-react';

/* ------------------------- Layer Card ------------------------- */
interface LayerCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  color: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function LayerCard({ icon, title, subtitle, color, children, defaultOpen = false }: LayerCardProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-4 p-5 text-left hover:bg-slate-50/50 transition-colors"
      >
        <div className={`flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center ${color}`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-slate-800 text-lg">{title}</h3>
          <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>
        </div>
        {open ? (
          <ChevronDown size={20} className="text-slate-400 flex-shrink-0" />
        ) : (
          <ChevronRight size={20} className="text-slate-400 flex-shrink-0" />
        )}
      </button>
      {open && <div className="px-5 pb-5 pt-0 border-t border-slate-100">{children}</div>}
    </div>
  );
}

/* ------------------------- Tech Pill ------------------------- */
function Pill({ children, color = 'slate' }: { children: React.ReactNode; color?: string }) {
  const colors: Record<string, string> = {
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    violet: 'bg-violet-50 text-violet-700 border-violet-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    rose: 'bg-rose-50 text-rose-700 border-rose-200',
    cyan: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  };
  return (
    <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-medium border ${colors[color]}`}>
      {children}
    </span>
  );
}

/* ------------------------- File Item ------------------------- */
function FileItem({ path, desc }: { path: string; desc?: string }) {
  return (
    <div className="flex items-start gap-3 py-2 px-3 rounded-lg hover:bg-slate-50 transition-colors">
      <FileCode size={16} className="text-slate-400 mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <code className="text-sm text-slate-700 font-mono break-all">{path}</code>
        {desc && <p className="text-xs text-slate-500 mt-0.5">{desc}</p>}
      </div>
    </div>
  );
}

/* ------------------------- Main Component ------------------------- */
export default function ProjectComposition() {
  return (
    <div className="space-y-8">
      {/* Intro */}
      <div className="bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <Layers size={24} className="text-indigo-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-indigo-900 text-lg mb-1">
              Arquitectura en 5 capas
            </h3>
            <p className="text-indigo-800 text-sm leading-relaxed">
              El proyecto se compone de cinco capas principales que trabajan juntas dentro de contenedores
              Docker. Cada capa tiene una responsabilidad clara y se comunica con las demás a través de
              interfaces bien definidas.
            </p>
          </div>
        </div>
      </div>

      {/* Visual Stack */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <h3 className="font-semibold text-slate-800 mb-5 flex items-center gap-2">
          <FolderTree size={18} className="text-emerald-500" />
          Vista en capas del sistema
        </h3>
        <div className="space-y-2">
          {[
            {
              label: 'Usuario',
              sub: 'Navegador web',
              color: 'from-slate-400 to-slate-500',
              emoji: '👤',
            },
            {
              label: 'Frontend',
              sub: 'React + Vite servido por Caddy',
              color: 'from-cyan-500 to-cyan-600',
              emoji: '🖥️',
            },
            {
              label: 'API',
              sub: 'FastAPI + Autenticación + Servicios',
              color: 'from-blue-500 to-blue-600',
              emoji: '⚡',
            },
            {
              label: 'Base de datos',
              sub: 'PostgreSQL 17',
              color: 'from-violet-500 to-violet-600',
              emoji: '🗄️',
            },
            {
              label: 'Servicios externos',
              sub: 'Entra ID · Microsoft Graph · SharePoint',
              color: 'from-emerald-500 to-emerald-600',
              emoji: '☁️',
            },
          ].map((layer, i, arr) => (
            <div key={layer.label}>
              <div
                className={`bg-gradient-to-r ${layer.color} text-white rounded-xl p-4 flex items-center gap-4 shadow-sm`}
              >
                <span className="text-2xl">{layer.emoji}</span>
                <div>
                  <p className="font-semibold">{layer.label}</p>
                  <p className="text-xs text-white/80">{layer.sub}</p>
                </div>
              </div>
              {i < arr.length - 1 && (
                <div className="flex justify-center py-1">
                  <ArrowDown size={16} className="text-slate-300" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Layers */}
      <div className="space-y-4">
        {/* Layer 1: Frontend */}
        <LayerCard
          icon={<Monitor size={24} className="text-white" />}
          title="Capa 1 · Frontend"
          subtitle="Interfaz de usuario construida con React y servida por Caddy"
          color="bg-gradient-to-br from-cyan-500 to-cyan-600"
          defaultOpen={true}
        >
          <div className="space-y-5 pt-4">
            <div>
              <h4 className="text-sm font-semibold text-slate-700 mb-2">Tecnologías</h4>
              <div className="flex flex-wrap gap-2">
                <Pill color="cyan">React 18</Pill>
                <Pill color="cyan">Vite</Pill>
                <Pill color="cyan">TypeScript</Pill>
                <Pill color="cyan">Tailwind CSS</Pill>
                <Pill color="cyan">TanStack Query</Pill>
                <Pill color="cyan">MSAL</Pill>
                <Pill color="cyan">Caddy</Pill>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-slate-700 mb-2">¿Qué hace?</h4>
              <ul className="space-y-1.5 text-sm text-slate-600">
                <li className="flex gap-2">
                  <ArrowRight size={14} className="text-cyan-500 mt-1 flex-shrink-0" />
                  <span>Muestra el tablero, políticas, calendario y vista de auditor.</span>
                </li>
                <li className="flex gap-2">
                  <ArrowRight size={14} className="text-cyan-500 mt-1 flex-shrink-0" />
                  <span>Obtiene el token de Entra ID con MSAL y lo envía en cada petición.</span>
                </li>
                <li className="flex gap-2">
                  <ArrowRight size={14} className="text-cyan-500 mt-1 flex-shrink-0" />
                  <span>Consume la API en <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">/api/*</code> (mismo origen, sin CORS).</span>
                </li>
                <li className="flex gap-2">
                  <ArrowRight size={14} className="text-cyan-500 mt-1 flex-shrink-0" />
                  <span>Caddy sirve los archivos estáticos y hace de proxy inverso hacia la API.</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-slate-700 mb-2">Archivos clave</h4>
              <div className="bg-slate-50 rounded-lg divide-y divide-slate-100">
                <FileItem path="frontend/src/pages/" desc="Tablero, Política, Calendario, Auditor" />
                <FileItem path="frontend/src/api/" desc="Cliente HTTP y tipos generados desde OpenAPI" />
                <FileItem path="frontend/src/auth/" desc="Configuración de MSAL para Entra ID" />
                <FileItem path="frontend/Caddyfile" desc="Configuración del proxy inverso y TLS" />
                <FileItem path="frontend/Dockerfile" desc="Build multi-etapa: Node → Caddy" />
              </div>
            </div>
          </div>
        </LayerCard>

        {/* Layer 2: API */}
        <LayerCard
          icon={<Server size={24} className="text-white" />}
          title="Capa 2 · API (Backend)"
          subtitle="Lógica de negocio, validación y orquestación con FastAPI"
          color="bg-gradient-to-br from-blue-500 to-blue-600"
        >
          <div className="space-y-5 pt-4">
            <div>
              <h4 className="text-sm font-semibold text-slate-700 mb-2">Tecnologías</h4>
              <div className="flex flex-wrap gap-2">
                <Pill color="blue">Python 3.12</Pill>
                <Pill color="blue">FastAPI</Pill>
                <Pill color="blue">SQLAlchemy 2</Pill>
                <Pill color="blue">Alembic</Pill>
                <Pill color="blue">Pydantic</Pill>
                <Pill color="blue">Uvicorn</Pill>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-slate-700 mb-2">¿Qué hace?</h4>
              <ul className="space-y-1.5 text-sm text-slate-600">
                <li className="flex gap-2">
                  <ArrowRight size={14} className="text-blue-500 mt-1 flex-shrink-0" />
                  <span>Valida cada petición: firma del token, emisor, audiencia y rol del usuario.</span>
                </li>
                <li className="flex gap-2">
                  <ArrowRight size={14} className="text-blue-500 mt-1 flex-shrink-0" />
                  <span>Expone endpoints REST para políticas, requisitos, entregas y adjuntos.</span>
                </li>
                <li className="flex gap-2">
                  <ArrowRight size={14} className="text-blue-500 mt-1 flex-shrink-0" />
                  <span>Calcula vencimientos y estados (Pendiente, Vigente, Por vencer, Vencida).</span>
                </li>
                <li className="flex gap-2">
                  <ArrowRight size={14} className="text-blue-500 mt-1 flex-shrink-0" />
                  <span>Sube archivos a SharePoint vía Microsoft Graph.</span>
                </li>
                <li className="flex gap-2">
                  <ArrowRight size={14} className="text-blue-500 mt-1 flex-shrink-0" />
                  <span>Registra acciones en audit_log para trazabilidad.</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-slate-700 mb-2">Estructura interna</h4>
              <div className="bg-slate-50 rounded-lg divide-y divide-slate-100">
                <FileItem path="app/main.py" desc="Crea la app FastAPI y registra routers" />
                <FileItem path="app/config.py" desc="Lee variables de entorno" />
                <FileItem path="app/db.py" desc="Conexión y sesiones SQLAlchemy" />
                <FileItem path="app/models/" desc="Tablas (ORM)" />
                <FileItem path="app/schemas/" desc="Formatos Pydantic de entrada/salida" />
                <FileItem path="app/routers/" desc="Endpoints: policies, requirements, submissions, attachments, dashboard" />
                <FileItem path="app/services/sharepoint.py" desc="Integración con Microsoft Graph" />
                <FileItem path="app/services/due_dates.py" desc="Reglas de frecuencia y vencimiento" />
                <FileItem path="app/services/audit.py" desc="Registro de auditoría" />
                <FileItem path="app/auth/" desc="Validación de tokens JWT y roles" />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
              <strong>Endpoints principales:</strong>
              <div className="mt-2 grid sm:grid-cols-2 gap-2 font-mono text-xs">
                <div className="bg-white/60 rounded px-2 py-1.5">GET /api/policies</div>
                <div className="bg-white/60 rounded px-2 py-1.5">GET /api/requirements</div>
                <div className="bg-white/60 rounded px-2 py-1.5">POST /api/submissions</div>
                <div className="bg-white/60 rounded px-2 py-1.5">POST /api/attachments</div>
                <div className="bg-white/60 rounded px-2 py-1.5">GET /api/dashboard</div>
                <div className="bg-white/60 rounded px-2 py-1.5">GET /api/docs</div>
              </div>
            </div>
          </div>
        </LayerCard>

        {/* Layer 3: Database */}
        <LayerCard
          icon={<Database size={24} className="text-white" />}
          title="Capa 3 · Base de datos"
          subtitle="PostgreSQL 17 con vistas, índices y migraciones versionadas"
          color="bg-gradient-to-br from-violet-500 to-violet-600"
        >
          <div className="space-y-5 pt-4">
            <div>
              <h4 className="text-sm font-semibold text-slate-700 mb-2">Tecnologías</h4>
              <div className="flex flex-wrap gap-2">
                <Pill color="violet">PostgreSQL 17</Pill>
                <Pill color="violet">Alembic</Pill>
                <Pill color="violet">SQLAlchemy</Pill>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-slate-700 mb-2">Tablas principales</h4>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { name: 'policies', desc: 'POL-SI-001, POL-SI-005, etc.' },
                  { name: 'controls', desc: 'Controles ISO 27001 (A.5, A.8...)' },
                  { name: 'requirements', desc: '59 requisitos con frecuencia' },
                  { name: 'submissions', desc: 'Entregas de evidencia' },
                  { name: 'attachments', desc: 'Archivos adjuntos (enlaces a SharePoint)' },
                  { name: 'users', desc: 'Usuarios y sus roles' },
                  { name: 'audit_log', desc: 'Registro de todas las acciones' },
                ].map((t) => (
                  <div
                    key={t.name}
                    className="bg-slate-50 rounded-lg p-3 border border-slate-100"
                  >
                    <code className="text-sm font-mono text-violet-700 font-semibold">{t.name}</code>
                    <p className="text-xs text-slate-500 mt-1">{t.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-slate-700 mb-2">Vista de vencimientos</h4>
              <p className="text-sm text-slate-600 mb-2">
                La vista <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">v_requirement_status</code> calcula automáticamente el estado de cada requisito:
              </p>
              <div className="flex flex-wrap gap-2">
                <Pill color="emerald">✓ Vigente</Pill>
                <Pill color="amber">⏳ Por vencer (≤ 30 días)</Pill>
                <Pill color="rose">✗ Vencida</Pill>
                <Pill color="slate">○ Pendiente</Pill>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-slate-700 mb-2">Seguridad</h4>
              <ul className="space-y-1.5 text-sm text-slate-600">
                <li className="flex gap-2">
                  <ArrowRight size={14} className="text-violet-500 mt-1 flex-shrink-0" />
                  <span>Dos usuarios: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">evidencias_owner</code> (DDL) y <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">evidencias_app</code> (solo DML).</span>
                </li>
                <li className="flex gap-2">
                  <ArrowRight size={14} className="text-violet-500 mt-1 flex-shrink-0" />
                  <span>Red interna de Docker: sin acceso a internet ni puertos publicados.</span>
                </li>
                <li className="flex gap-2">
                  <ArrowRight size={14} className="text-violet-500 mt-1 flex-shrink-0" />
                  <span>Fechas en <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">timestamptz</code> UTC.</span>
                </li>
              </ul>
            </div>
          </div>
        </LayerCard>

        {/* Layer 4: External Services */}
        <LayerCard
          icon={<Cloud size={24} className="text-white" />}
          title="Capa 4 · Servicios externos"
          subtitle="Integraciones con Microsoft 365 (Entra ID, Graph, SharePoint)"
          color="bg-gradient-to-br from-emerald-500 to-emerald-600"
        >
          <div className="space-y-5 pt-4">
            <div className="grid sm:grid-cols-3 gap-3">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
                <Key size={20} className="text-blue-600 mb-2" />
                <h4 className="font-semibold text-slate-800 text-sm">Entra ID</h4>
                <p className="text-xs text-slate-600 mt-1">
                  Autenticación SSO con cuentas Microsoft. Emite tokens JWT.
                </p>
              </div>
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-4">
                <Network size={20} className="text-emerald-600 mb-2" />
                <h4 className="font-semibold text-slate-800 text-sm">Microsoft Graph</h4>
                <p className="text-xs text-slate-600 mt-1">
                  API unificada para acceder a SharePoint y otros servicios.
                </p>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-4">
                <Cloud size={20} className="text-orange-600 mb-2" />
                <h4 className="font-semibold text-slate-800 text-sm">SharePoint</h4>
                <p className="text-xs text-slate-600 mt-1">
                  Almacena los archivos adjuntos de las evidencias.
                </p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-slate-700 mb-2">Flujo de autenticación</h4>
              <div className="flex flex-col sm:flex-row items-stretch gap-2 text-xs">
                {[
                  'Usuario abre la app',
                  'MSAL redirige a Entra ID',
                  'Entra ID devuelve token',
                  'Frontend envía Bearer token',
                  'API valida y responde',
                ].map((step, i, arr) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 text-emerald-800 font-medium whitespace-nowrap">
                      {step}
                    </div>
                    {i < arr.length - 1 && (
                      <ArrowRight size={14} className="text-emerald-400 hidden sm:block flex-shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </LayerCard>

        {/* Layer 5: Infrastructure */}
        <LayerCard
          icon={<Layers size={24} className="text-white" />}
          title="Capa 5 · Infraestructura"
          subtitle="Docker Compose, redes, volúmenes y scripts de mantenimiento"
          color="bg-gradient-to-br from-slate-600 to-slate-700"
        >
          <div className="space-y-5 pt-4">
            <div>
              <h4 className="text-sm font-semibold text-slate-700 mb-2">Contenedores</h4>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { name: 'db', desc: 'PostgreSQL 17-alpine', color: 'violet' },
                  { name: 'migrate', desc: 'Aplica migraciones (one-shot)', color: 'indigo' },
                  { name: 'api', desc: 'FastAPI con Uvicorn', color: 'blue' },
                  { name: 'web', desc: 'Caddy + frontend estático', color: 'cyan' },
                ].map((c) => (
                  <div key={c.name} className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                    <div className="flex items-center gap-2">
                      <Pill color={c.color}>{c.name}</Pill>
                    </div>
                    <p className="text-xs text-slate-500 mt-1.5">{c.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-slate-700 mb-2">Redes</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-3 bg-violet-50 border border-violet-200 rounded-lg">
                  <div className="w-3 h-3 rounded-full bg-violet-500" />
                  <div className="flex-1">
                    <code className="text-sm font-mono text-violet-700 font-semibold">data</code>
                    <span className="text-xs text-slate-500 ml-2">(interna)</span>
                  </div>
                  <span className="text-xs text-slate-600">db, migrate, api</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-cyan-50 border border-cyan-200 rounded-lg">
                  <div className="w-3 h-3 rounded-full bg-cyan-500" />
                  <div className="flex-1">
                    <code className="text-sm font-mono text-cyan-700 font-semibold">edge</code>
                    <span className="text-xs text-slate-500 ml-2">(externa)</span>
                  </div>
                  <span className="text-xs text-slate-600">api, web</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-slate-700 mb-2">Volúmenes</h4>
              <div className="grid sm:grid-cols-2 gap-2 text-sm">
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                  <code className="text-xs font-mono text-slate-700">pgdata</code>
                  <p className="text-xs text-slate-500 mt-1">Datos persistentes de PostgreSQL</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                  <code className="text-xs font-mono text-slate-700">caddy_data</code>
                  <p className="text-xs text-slate-500 mt-1">Certificados TLS de Caddy</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-slate-700 mb-2">Scripts de mantenimiento</h4>
              <div className="bg-slate-50 rounded-lg divide-y divide-slate-100">
                <FileItem path="scripts/backup.sh" desc="Volcado diario de la base de datos" />
                <FileItem path="scripts/restore.sh" desc="Restauración desde un respaldo" />
                <FileItem path="backend/scripts/import_excel.py" desc="Carga inicial desde Excel" />
                <FileItem path="db/init/01-roles.sh" desc="Creación del usuario limitado" />
              </div>
            </div>
          </div>
        </LayerCard>
      </div>

      {/* Data Flow Summary */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 text-white">
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <Network size={20} className="text-emerald-400" />
          Flujo de datos típico
        </h3>
        <p className="text-slate-300 text-sm mb-5">
          Así viaja una petición desde que el usuario hace clic hasta que se guarda la evidencia:
        </p>
        <div className="space-y-3">
          {[
            {
              step: '1',
              from: 'Usuario',
              to: 'Frontend',
              action: 'Hace clic en "Subir evidencia"',
              color: 'bg-slate-700',
            },
            {
              step: '2',
              from: 'Frontend',
              to: 'API',
              action: 'POST /api/submissions con Bearer token',
              color: 'bg-cyan-700',
            },
            {
              step: '3',
              from: 'API',
              to: 'Entra ID',
              action: 'Valida firma, emisor y audiencia del token',
              color: 'bg-blue-700',
            },
            {
              step: '4',
              from: 'API',
              to: 'Base de datos',
              action: 'Inserta la submission y actualiza estado',
              color: 'bg-violet-700',
            },
            {
              step: '5',
              from: 'API',
              to: 'SharePoint',
              action: 'Sube el archivo adjunto vía Microsoft Graph',
              color: 'bg-emerald-700',
            },
            {
              step: '6',
              from: 'API',
              to: 'audit_log',
              action: 'Registra la acción con usuario, fecha y detalle',
              color: 'bg-indigo-700',
            },
          ].map((item) => (
            <div key={item.step} className="flex items-center gap-3">
              <div className={`flex-shrink-0 w-8 h-8 ${item.color} rounded-lg flex items-center justify-center text-sm font-bold`}>
                {item.step}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-slate-400">{item.from}</span>
                  <ArrowRight size={12} className="text-slate-500" />
                  <span className="text-xs text-emerald-400 font-medium">{item.to}</span>
                </div>
                <p className="text-sm text-slate-200 mt-0.5">{item.action}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Key Principles */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          {
            title: 'Separación de responsabilidades',
            desc: 'Cada capa hace una sola cosa bien. El frontend no toca la base de datos; la API no sirve HTML.',
            color: 'emerald',
          },
          {
            title: 'Seguridad por capas',
            desc: 'Token JWT, usuario limitado de BD, red interna de Docker. Si una capa falla, las otras protegen.',
            color: 'blue',
          },
          {
            title: 'Reproducibilidad',
            desc: 'Todo está versionado en Git: código, migraciones, configuración. Cualquiera levanta el sistema desde cero.',
            color: 'violet',
          },
        ].map((p) => (
          <div
            key={p.title}
            className={`bg-${p.color}-50 border border-${p.color}-200 rounded-xl p-5`}
            style={{
              backgroundColor:
                p.color === 'emerald'
                  ? '#ecfdf5'
                  : p.color === 'blue'
                  ? '#eff6ff'
                  : '#f5f3ff',
              borderColor:
                p.color === 'emerald'
                  ? '#a7f3d0'
                  : p.color === 'blue'
                  ? '#bfdbfe'
                  : '#ddd6fe',
            }}
          >
            <h4
              className="font-semibold mb-2"
              style={{
                color:
                  p.color === 'emerald'
                    ? '#065f46'
                    : p.color === 'blue'
                    ? '#1e3a8a'
                    : '#5b21b6',
              }}
            >
              {p.title}
            </h4>
            <p
              className="text-sm"
              style={{
                color:
                  p.color === 'emerald'
                    ? '#047857'
                    : p.color === 'blue'
                    ? '#1e40af'
                    : '#6d28d9',
              }}
            >
              {p.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
