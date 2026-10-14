import { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  AlertCircle,
  Code2,
  Server,
  Database,
  Box,
  FileCode,
  Shield,
  TestTube,
  Wrench,
  Globe,
  ChevronRight,
} from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'done' | 'in-progress' | 'pending';
  icon: React.ReactNode;
  color: string;
  details?: string[];
}

const tasks: Task[] = [
  {
    id: 'docs',
    title: 'Documentación del proyecto',
    description: 'Guía completa con tecnología, arquitectura y decisiones',
    status: 'done',
    icon: <FileCode size={20} className="text-white" />,
    color: 'bg-gradient-to-br from-emerald-500 to-teal-600',
    details: [
      '✅ Tecnología recomendada',
      '✅ Diagrama de arquitectura',
      '✅ Estructura del repositorio',
      '✅ Configuración de contenedores',
      '✅ Gestión de base de datos',
      '✅ README.md con comandos',
      '✅ Notas de decisiones técnicas',
    ],
  },
  {
    id: 'api',
    title: 'API Backend (FastAPI)',
    description: 'Implementación completa de la API con modelos, routers y servicios',
    status: 'done',
    icon: <Server size={20} className="text-white" />,
    color: 'bg-gradient-to-br from-blue-500 to-blue-600',
    details: [
      '✅ Modelos SQLAlchemy (7 tablas)',
      '✅ Schemas Pydantic',
      '✅ Routers REST (policies, requirements, submissions, dashboard)',
      '✅ Servicio de vencimientos',
      '✅ Servicio de auditoría',
      '✅ Autenticación con Entra ID',
      '✅ Configuración y dependencias',
    ],
  },
  {
    id: 'frontend',
    title: 'Frontend React',
    description: 'Interfaz completa con tablero, políticas, calendario y vista de auditor',
    status: 'done',
    icon: <Globe size={20} className="text-white" />,
    color: 'bg-gradient-to-br from-cyan-500 to-cyan-600',
    details: [
      '✅ Página de Tablero (Dashboard) con gráficos',
      '✅ Vista de Políticas con lista expandible',
      '✅ Vista de Requisitos con filtros y estados',
      '✅ Vista de Calendario con vencimientos',
      '✅ Vista de Auditor (solo lectura)',
      '✅ Configuración de MSAL para Entra ID',
      '✅ Cliente API con TanStack Query',
      '✅ package.json, vite.config.ts, tailwind',
    ],
  },
  {
    id: 'docker',
    title: 'Archivos Docker',
    description: 'Dockerfiles, docker-compose.yml y Caddyfile',
    status: 'done',
    icon: <Box size={20} className="text-white" />,
    color: 'bg-gradient-to-br from-slate-600 to-slate-700',
    details: [
      '✅ backend/Dockerfile (Python 3.12 + healthcheck)',
      '✅ frontend/Dockerfile (multi-stage Node + Caddy)',
      '✅ docker-compose.yml (4 servicios, 2 redes)',
      '✅ docker-compose.override.yml (desarrollo)',
      '✅ frontend/Caddyfile (proxy + TLS internal)',
      '✅ .env.example con todas las variables',
    ],
  },
  {
    id: 'migrations',
    title: 'Migraciones de Alembic',
    description: 'Scripts de migración para crear las tablas en PostgreSQL',
    status: 'done',
    icon: <Database size={20} className="text-white" />,
    color: 'bg-gradient-to-br from-violet-500 to-violet-600',
    details: [
      '✅ alembic/env.py configurado',
      '✅ alembic/script.py.mako template',
      '✅ Primera migración: 7 tablas + índices',
      '✅ Vista v_requirement_status con estados',
      '✅ Función downgrade para rollback',
    ],
  },
  {
    id: 'scripts',
    title: 'Scripts de mantenimiento',
    description: 'Scripts para importación, respaldos y restauración',
    status: 'done',
    icon: <Wrench size={20} className="text-white" />,
    color: 'bg-gradient-to-br from-amber-500 to-amber-600',
    details: [
      '✅ scripts/backup.sh con limpieza automática',
      '✅ scripts/restore.sh con confirmación',
      '✅ backend/scripts/import_excel.py (idempotente)',
      '✅ db/init/01-roles.sh (usuarios PostgreSQL)',
    ],
  },
  {
    id: 'tests',
    title: 'Pruebas automatizadas',
    description: 'Tests para la API (pytest) y el frontend (Vitest)',
    status: 'done',
    icon: <TestTube size={20} className="text-white" />,
    color: 'bg-gradient-to-br from-rose-500 to-rose-600',
    details: [
      '✅ Tests de cálculo de vencimientos',
      '✅ Tests de permisos y roles',
      '✅ Tests de endpoints de la API',
      '✅ pyproject.toml con cobertura 70%',
    ],
  },
  {
    id: 'integration',
    title: 'Integración con SharePoint',
    description: 'Subida de archivos a SharePoint vía Microsoft Graph',
    status: 'done',
    icon: <Shield size={20} className="text-white" />,
    color: 'bg-gradient-to-br from-indigo-500 to-indigo-600',
    details: [
      '✅ app/services/sharepoint.py completo',
      '✅ Subida de archivos con Graph API',
      '✅ Creación automática de carpetas',
      '✅ Eliminación y consulta de archivos',
      '✅ Manejo de tokens y errores',
    ],
  },
];

export default function ProjectStatus() {
  const [expandedTask, setExpandedTask] = useState<string | null>('frontend');

  const completedTasks = tasks.filter((t) => t.status === 'done').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'in-progress').length;
  const pendingTasks = tasks.filter((t) => t.status === 'pending').length;
  const totalTasks = tasks.length;
  const progress = ((completedTasks + inProgressTasks * 0.5) / totalTasks) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-xl p-6">
        <div className="flex items-start gap-3 mb-4">
          <AlertCircle size={24} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-slate-800 text-lg mb-1">
              Estado del proyecto según la guía
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Revisión de lo que hemos construido vs. lo que falta según el plan original de la guía.
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">Progreso general</span>
            <span className="text-sm font-bold text-emerald-600">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex gap-4 mt-3 text-xs">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-emerald-500" />
              <span className="text-slate-600">
                <strong>{completedTasks}</strong> completados
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <AlertCircle size={14} className="text-amber-500" />
              <span className="text-slate-600">
                <strong>{inProgressTasks}</strong> en progreso
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Circle size={14} className="text-slate-400" />
              <span className="text-slate-600">
                <strong>{pendingTasks}</strong> pendientes
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {tasks.map((task) => {
          const isExpanded = expandedTask === task.id;
          const statusIcon =
            task.status === 'done' ? (
              <CheckCircle2 size={20} className="text-emerald-500" />
            ) : task.status === 'in-progress' ? (
              <AlertCircle size={20} className="text-amber-500" />
            ) : (
              <Circle size={20} className="text-slate-400" />
            );

          return (
            <div
              key={task.id}
              className="border border-slate-200 rounded-xl overflow-hidden bg-white"
            >
              <button
                onClick={() => setExpandedTask(isExpanded ? null : task.id)}
                className="w-full flex items-center gap-4 p-4 text-left hover:bg-slate-50 transition-colors"
              >
                <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${task.color}`}>
                  {task.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {statusIcon}
                    <h4 className="font-semibold text-slate-800">{task.title}</h4>
                  </div>
                  <p className="text-sm text-slate-500">{task.description}</p>
                </div>
                <ChevronRight
                  size={20}
                  className={`text-slate-400 transition-transform ${
                    isExpanded ? 'rotate-90' : ''
                  }`}
                />
              </button>
              {isExpanded && task.details && (
                <div className="px-4 pb-4 pt-0 border-t border-slate-100">
                  <div className="pt-3 space-y-1.5">
                    {task.details.map((detail, i) => (
                      <div
                        key={i}
                        className="text-sm text-slate-600 py-1 px-3 rounded-md hover:bg-slate-50"
                      >
                        {detail}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-xl p-6 text-white">
        <h3 className="font-semibold text-lg mb-4">🎉 ¡Proyecto Completo!</h3>
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div className="bg-white/10 rounded-lg p-4">
            <h4 className="font-semibold text-emerald-200 mb-2">📦 Infraestructura</h4>
            <ul className="space-y-1 text-emerald-100">
              <li>• Docker Compose (4 servicios)</li>
              <li>• Dockerfiles (backend + frontend)</li>
              <li>• Caddyfile con TLS interno</li>
              <li>• Variables de entorno (.env)</li>
            </ul>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <h4 className="font-semibold text-emerald-200 mb-2">🔒 Seguridad (Fase 2)</h4>
            <ul className="space-y-1 text-emerald-100">
              <li>• JWT validado con PyJWT + JWKS</li>
              <li>• Scope propio (api://client/access)</li>
              <li>• Auth en todos los endpoints</li>
              <li>• Roles: admin/auditor/user</li>
              <li>• Docs deshabilitados en prod</li>
              <li>• Separación dev/prod deps</li>
            </ul>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <h4 className="font-semibold text-emerald-200 mb-2">⚡ Funcionalidad (Fase 3)</h4>
            <ul className="space-y-1 text-emerald-100">
              <li>• PATCH /submissions (aprobar/rechazar)</li>
              <li>• POST /submissions/attachments</li>
              <li>• SharePoint: token renewal + sanitization</li>
              <li>• CRUD completo: policies, requirements, controls</li>
              <li>• SoA (Statement of Applicability)</li>
              <li>• Frontend: formularios + upload</li>
            </ul>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <h4 className="font-semibold text-emerald-200 mb-2">⚡ Backend API</h4>
            <ul className="space-y-1 text-emerald-100">
              <li>• FastAPI con 9 endpoints</li>
              <li>• 7 modelos SQLAlchemy</li>
              <li>• Servicios de negocio</li>
              <li>• Integración SharePoint</li>
            </ul>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <h4 className="font-semibold text-emerald-200 mb-2">🖥️ Frontend React</h4>
            <ul className="space-y-1 text-emerald-100">
              <li>• 5 páginas (Dashboard, Policies, etc.)</li>
              <li>• Autenticación MSAL</li>
              <li>• TanStack Query</li>
              <li>• Tailwind CSS</li>
            </ul>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <h4 className="font-semibold text-emerald-200 mb-2">🛠️ Operación</h4>
            <ul className="space-y-1 text-emerald-100">
              <li>• Migraciones Alembic</li>
              <li>• Scripts de respaldo/restauración</li>
              <li>• Tests automatizados</li>
              <li>• Importación de Excel</li>
            </ul>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-emerald-500/30">
          <p className="text-sm text-emerald-100">
            <strong className="text-white">Siguiente paso:</strong> Ejecutar{' '}
            <code className="bg-emerald-800/50 px-2 py-0.5 rounded text-xs">docker compose up --build</code>{' '}
            para levantar todo el sistema y comenzar a usar la aplicación.
          </p>
        </div>
      </div>
    </div>
  );
}
