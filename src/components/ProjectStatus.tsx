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
    status: 'in-progress',
    icon: <Globe size={20} className="text-white" />,
    color: 'bg-gradient-to-br from-cyan-500 to-cyan-600',
    details: [
      '⏳ Página de Tablero (Dashboard)',
      '⏳ Vista de Políticas',
      '⏳ Vista de Requisitos con estado',
      '⏳ Formulario de entregas',
      '⏳ Subida de archivos',
      '⏳ Vista de Calendario',
      '⏳ Vista de Auditor',
      '⏳ Configuración de MSAL',
    ],
  },
  {
    id: 'docker',
    title: 'Archivos Docker',
    description: 'Dockerfiles, docker-compose.yml y Caddyfile',
    status: 'pending',
    icon: <Box size={20} className="text-white" />,
    color: 'bg-gradient-to-br from-slate-600 to-slate-700',
    details: [
      '○ backend/Dockerfile',
      '○ frontend/Dockerfile',
      '○ docker-compose.yml',
      '○ docker-compose.override.yml',
      '○ frontend/Caddyfile',
      '○ .env.example',
    ],
  },
  {
    id: 'migrations',
    title: 'Migraciones de Alembic',
    description: 'Scripts de migración para crear las tablas en PostgreSQL',
    status: 'pending',
    icon: <Database size={20} className="text-white" />,
    color: 'bg-gradient-to-br from-violet-500 to-violet-600',
    details: [
      '○ alembic/env.py',
      '○ Primera migración: crear tablas',
      '○ Vista v_requirement_status',
      '○ Índices recomendados',
    ],
  },
  {
    id: 'scripts',
    title: 'Scripts de mantenimiento',
    description: 'Scripts para importación, respaldos y restauración',
    status: 'pending',
    icon: <Wrench size={20} className="text-white" />,
    color: 'bg-gradient-to-br from-amber-500 to-amber-600',
    details: [
      '○ scripts/backup.sh',
      '○ scripts/restore.sh',
      '○ backend/scripts/import_excel.py',
      '○ db/init/01-roles.sh',
    ],
  },
  {
    id: 'tests',
    title: 'Pruebas automatizadas',
    description: 'Tests para la API (pytest) y el frontend (Vitest)',
    status: 'pending',
    icon: <TestTube size={20} className="text-white" />,
    color: 'bg-gradient-to-br from-rose-500 to-rose-600',
    details: [
      '○ Tests de cálculo de vencimientos',
      '○ Tests de permisos y roles',
      '○ Tests de endpoints de la API',
      '○ Tests de componentes React',
    ],
  },
  {
    id: 'integration',
    title: 'Integración con SharePoint',
    description: 'Subida de archivos a SharePoint vía Microsoft Graph',
    status: 'pending',
    icon: <Shield size={20} className="text-white" />,
    color: 'bg-gradient-to-br from-indigo-500 to-indigo-600',
    details: [
      '○ app/services/sharepoint.py',
      '○ Configuración de permisos Sites.Selected',
      '○ Subida de archivos desde el frontend',
      '○ Manejo de errores y reintentos',
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
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 text-white">
        <h3 className="font-semibold text-lg mb-4">📊 Resumen de lo que falta</h3>
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div className="bg-slate-700/50 rounded-lg p-4">
            <h4 className="font-semibold text-emerald-400 mb-2">✅ Ya tenemos</h4>
            <ul className="space-y-1 text-slate-300">
              <li>• Documentación completa</li>
              <li>• API Backend (FastAPI)</li>
              <li>• Modelos de base de datos</li>
              <li>• Endpoints REST</li>
              <li>• Servicios de negocio</li>
            </ul>
          </div>
          <div className="bg-slate-700/50 rounded-lg p-4">
            <h4 className="font-semibold text-amber-400 mb-2">⏳ Falta implementar</h4>
            <ul className="space-y-1 text-slate-300">
              <li>• Frontend React completo</li>
              <li>• Archivos Docker reales</li>
              <li>• Migraciones de Alembic</li>
              <li>• Scripts de mantenimiento</li>
              <li>• Pruebas automatizadas</li>
              <li>• Integración con SharePoint</li>
            </ul>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-slate-700">
          <p className="text-sm text-slate-400">
            <strong className="text-slate-200">Próximo paso recomendado:</strong> Implementar el
            Frontend React con las páginas de Tablero, Políticas y Requisitos.
          </p>
        </div>
      </div>
    </div>
  );
}
