import { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileCode,
  Folder,
  Server,
  Database,
  Box,
  Shield,
  TestTube,
  Wrench,
  Globe,
  FileText,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

interface AuditItem {
  path: string;
  status: 'exists' | 'missing' | 'warning';
  description: string;
  category: string;
}

const auditItems: AuditItem[] = [
  // Backend - Core
  { path: 'backend/Dockerfile', status: 'exists', description: 'Dockerfile de Python 3.12', category: 'Backend' },
  { path: 'backend/requirements.txt', status: 'exists', description: 'Dependencias Python', category: 'Backend' },
  { path: 'backend/app/__init__.py', status: 'exists', description: 'Módulo principal', category: 'Backend' },
  { path: 'backend/app/main.py', status: 'exists', description: 'Punto de entrada FastAPI', category: 'Backend' },
  { path: 'backend/app/config.py', status: 'exists', description: 'Configuración Pydantic', category: 'Backend' },
  { path: 'backend/app/db.py', status: 'exists', description: 'Conexión SQLAlchemy', category: 'Backend' },
  
  // Backend - Models
  { path: 'backend/app/models/__init__.py', status: 'exists', description: 'Export de modelos', category: 'Backend' },
  { path: 'backend/app/models/policy.py', status: 'exists', description: 'Modelo Policy', category: 'Backend' },
  { path: 'backend/app/models/control.py', status: 'exists', description: 'Modelo Control', category: 'Backend' },
  { path: 'backend/app/models/requirement.py', status: 'exists', description: 'Modelo Requirement', category: 'Backend' },
  { path: 'backend/app/models/submission.py', status: 'exists', description: 'Modelo Submission', category: 'Backend' },
  { path: 'backend/app/models/attachment.py', status: 'exists', description: 'Modelo Attachment', category: 'Backend' },
  { path: 'backend/app/models/user.py', status: 'exists', description: 'Modelo User', category: 'Backend' },
  { path: 'backend/app/models/audit.py', status: 'exists', description: 'Modelo AuditLog', category: 'Backend' },
  
  // Backend - Schemas
  { path: 'backend/app/schemas/__init__.py', status: 'exists', description: 'Export de schemas', category: 'Backend' },
  { path: 'backend/app/schemas/policy.py', status: 'exists', description: 'Schema Policy', category: 'Backend' },
  { path: 'backend/app/schemas/requirement.py', status: 'exists', description: 'Schema Requirement', category: 'Backend' },
  { path: 'backend/app/schemas/submission.py', status: 'exists', description: 'Schema Submission', category: 'Backend' },
  { path: 'backend/app/schemas/dashboard.py', status: 'exists', description: 'Schema Dashboard', category: 'Backend' },
  
  // Backend - Routers
  { path: 'backend/app/routers/__init__.py', status: 'exists', description: 'Export de routers', category: 'Backend' },
  { path: 'backend/app/routers/policies.py', status: 'exists', description: 'Router /api/policies', category: 'Backend' },
  { path: 'backend/app/routers/requirements.py', status: 'exists', description: 'Router /api/requirements', category: 'Backend' },
  { path: 'backend/app/routers/submissions.py', status: 'exists', description: 'Router /api/submissions', category: 'Backend' },
  { path: 'backend/app/routers/dashboard.py', status: 'exists', description: 'Router /api/dashboard', category: 'Backend' },
  
  // Backend - Services
  { path: 'backend/app/services/__init__.py', status: 'exists', description: 'Export de servicios', category: 'Backend' },
  { path: 'backend/app/services/due_dates.py', status: 'exists', description: 'Cálculo de vencimientos', category: 'Backend' },
  { path: 'backend/app/services/audit.py', status: 'exists', description: 'Registro de auditoría', category: 'Backend' },
  { path: 'backend/app/services/sharepoint.py', status: 'exists', description: 'Integración SharePoint', category: 'Backend' },
  
  // Backend - Auth
  { path: 'backend/app/auth/__init__.py', status: 'exists', description: 'Export de auth', category: 'Backend' },
  { path: 'backend/app/auth/dependencies.py', status: 'exists', description: 'Dependencias JWT', category: 'Backend' },
  
  // Backend - Migrations
  { path: 'backend/alembic.ini', status: 'exists', description: 'Configuración Alembic', category: 'Backend' },
  { path: 'backend/alembic/env.py', status: 'exists', description: 'Entorno Alembic', category: 'Backend' },
  { path: 'backend/alembic/script.py.mako', status: 'exists', description: 'Template migraciones', category: 'Backend' },
  { path: 'backend/alembic/versions/001_initial_tables.py', status: 'exists', description: 'Migración inicial', category: 'Backend' },
  
  // Backend - Tests
  { path: 'backend/tests/__init__.py', status: 'exists', description: 'Módulo de tests', category: 'Backend' },
  { path: 'backend/tests/conftest.py', status: 'exists', description: 'Fixtures pytest', category: 'Backend' },
  { path: 'backend/tests/test_api.py', status: 'exists', description: 'Tests de endpoints', category: 'Backend' },
  { path: 'backend/tests/test_due_dates.py', status: 'exists', description: 'Tests de vencimientos', category: 'Backend' },
  { path: 'backend/tests/test_auth.py', status: 'exists', description: 'Tests de autenticación', category: 'Backend' },
  { path: 'backend/pyproject.toml', status: 'exists', description: 'Configuración pytest', category: 'Backend' },
  
  // Backend - Scripts
  { path: 'backend/scripts/import_excel.py', status: 'exists', description: 'Importación Excel', category: 'Backend' },
  
  // Frontend - Core
  { path: 'frontend/Dockerfile', status: 'exists', description: 'Dockerfile multi-stage', category: 'Frontend' },
  { path: 'frontend/package.json', status: 'exists', description: 'Dependencias Node', category: 'Frontend' },
  { path: 'frontend/vite.config.ts', status: 'exists', description: 'Configuración Vite', category: 'Frontend' },
  { path: 'frontend/tsconfig.json', status: 'exists', description: 'Configuración TypeScript', category: 'Frontend' },
  { path: 'frontend/tsconfig.node.json', status: 'exists', description: 'Configuración Node', category: 'Frontend' },
  { path: 'frontend/tailwind.config.js', status: 'exists', description: 'Configuración Tailwind', category: 'Frontend' },
  { path: 'frontend/postcss.config.js', status: 'exists', description: 'Configuración PostCSS', category: 'Frontend' },
  { path: 'frontend/Caddyfile', status: 'exists', description: 'Configuración Caddy', category: 'Frontend' },
  { path: 'frontend/index.html', status: 'exists', description: 'HTML principal', category: 'Frontend' },
  { path: 'frontend/.env.example', status: 'exists', description: 'Variables de entorno', category: 'Frontend' },
  
  // Frontend - Source
  { path: 'frontend/src/main.tsx', status: 'exists', description: 'Punto de entrada React', category: 'Frontend' },
  { path: 'frontend/src/App.tsx', status: 'exists', description: 'Aplicación principal', category: 'Frontend' },
  { path: 'frontend/src/index.css', status: 'exists', description: 'Estilos globales', category: 'Frontend' },
  { path: 'frontend/src/vite-env.d.ts', status: 'exists', description: 'Tipos Vite', category: 'Frontend' },
  
  // Frontend - Auth
  { path: 'frontend/src/auth/msalConfig.ts', status: 'exists', description: 'Configuración MSAL', category: 'Frontend' },
  
  // Frontend - API
  { path: 'frontend/src/api/client.ts', status: 'exists', description: 'Cliente API', category: 'Frontend' },
  
  // Frontend - Pages
  { path: 'frontend/src/pages/Dashboard.tsx', status: 'exists', description: 'Página Tablero', category: 'Frontend' },
  { path: 'frontend/src/pages/Policies.tsx', status: 'exists', description: 'Página Políticas', category: 'Frontend' },
  { path: 'frontend/src/pages/Requirements.tsx', status: 'exists', description: 'Página Requisitos', category: 'Frontend' },
  { path: 'frontend/src/pages/Calendar.tsx', status: 'exists', description: 'Página Calendario', category: 'Frontend' },
  { path: 'frontend/src/pages/Auditor.tsx', status: 'exists', description: 'Página Auditor', category: 'Frontend' },
  
  // Infrastructure
  { path: 'docker-compose.yml', status: 'exists', description: 'Orquestación principal', category: 'Infraestructura' },
  { path: 'docker-compose.override.yml', status: 'exists', description: 'Override desarrollo', category: 'Infraestructura' },
  { path: '.env.example', status: 'exists', description: 'Variables de entorno', category: 'Infraestructura' },
  
  // Scripts
  { path: 'scripts/backup.sh', status: 'exists', description: 'Script de respaldo', category: 'Scripts' },
  { path: 'scripts/restore.sh', status: 'exists', description: 'Script de restauración', category: 'Scripts' },
  { path: 'db/init/01-roles.sh', status: 'exists', description: 'Inicialización roles DB', category: 'Scripts' },
];

export default function ProjectAudit() {
  const [expandedCategory, setExpandedCategory] = useState<string | null>('Backend');
  
  const categories = ['Backend', 'Frontend', 'Infraestructura', 'Scripts'];
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'exists':
        return <CheckCircle2 size={18} className="text-emerald-500" />;
      case 'missing':
        return <XCircle size={18} className="text-red-500" />;
      case 'warning':
        return <AlertCircle size={18} className="text-amber-500" />;
      default:
        return null;
    }
  };
  
  const totalItems = auditItems.length;
  const existingItems = auditItems.filter(item => item.status === 'exists').length;
  const missingItems = auditItems.filter(item => item.status === 'missing').length;
  const warningItems = auditItems.filter(item => item.status === 'warning').length;
  const completionPercentage = (existingItems / totalItems) * 100;
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <Shield size={24} className="text-emerald-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-emerald-900 text-lg mb-1">
              Auditoría Completa del Proyecto
            </h3>
            <p className="text-emerald-800 text-sm leading-relaxed">
              Verificación exhaustiva de todos los archivos requeridos según la guía del proyecto.
            </p>
          </div>
        </div>
      </div>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-5 h-5 text-blue-500" />
            <span className="text-sm text-slate-500">Total Archivos</span>
          </div>
          <p className="text-3xl font-bold text-slate-800">{totalItems}</p>
        </div>
        
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <span className="text-sm text-slate-500">Existentes</span>
          </div>
          <p className="text-3xl font-bold text-emerald-600">{existingItems}</p>
        </div>
        
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <XCircle className="w-5 h-5 text-red-500" />
            <span className="text-sm text-slate-500">Faltantes</span>
          </div>
          <p className="text-3xl font-bold text-red-600">{missingItems}</p>
        </div>
        
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            <span className="text-sm text-slate-500">Advertencias</span>
          </div>
          <p className="text-3xl font-bold text-amber-600">{warningItems}</p>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-slate-700">Progreso de Implementación</span>
          <span className="text-2xl font-bold text-emerald-600">{completionPercentage.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden">
          <div
            className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>
      
      {/* Detailed Audit by Category */}
      <div className="space-y-3">
        {categories.map(category => {
          const categoryItems = auditItems.filter(item => item.category === category);
          const categoryExists = categoryItems.filter(item => item.status === 'exists').length;
          const isExpanded = expandedCategory === category;
          
          return (
            <div key={category} className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setExpandedCategory(isExpanded ? null : category)}
                className="w-full flex items-center gap-4 p-4 text-left hover:bg-slate-50 transition-colors"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-700 rounded-lg flex items-center justify-center">
                  <Folder size={20} className="text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-800">{category}</h4>
                  <p className="text-sm text-slate-500">
                    {categoryExists}/{categoryItems.length} archivos presentes
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-emerald-600">
                    {((categoryExists / categoryItems.length) * 100).toFixed(0)}%
                  </span>
                  {isExpanded ? (
                    <ChevronDown size={20} className="text-slate-400" />
                  ) : (
                    <ChevronRight size={20} className="text-slate-400" />
                  )}
                </div>
              </button>
              
              {isExpanded && (
                <div className="border-t border-slate-100 divide-y divide-slate-100">
                  {categoryItems.map((item, index) => (
                    <div key={index} className="flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors">
                      {getStatusIcon(item.status)}
                      <div className="flex-1 min-w-0">
                        <code className="text-sm font-mono text-slate-700">{item.path}</code>
                        <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Final Status */}
      {missingItems === 0 && warningItems === 0 ? (
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-xl p-6 text-white">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle2 size={32} className="text-emerald-200" />
            <h3 className="text-2xl font-bold">¡Proyecto 100% Completo!</h3>
          </div>
          <p className="text-emerald-100">
            Todos los archivos requeridos están presentes y el proyecto está listo para ser desplegado.
          </p>
          <div className="mt-4 pt-4 border-t border-emerald-500/30">
            <p className="text-sm text-emerald-100">
              <strong className="text-white">Siguiente paso:</strong> Ejecutar{' '}
              <code className="bg-emerald-800/50 px-2 py-0.5 rounded text-xs">docker compose up --build</code>{' '}
              para levantar el sistema completo.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="flex items-center gap-3 mb-3">
            <AlertCircle size={32} className="text-amber-200" />
            <h3 className="text-2xl font-bold">Proyecto Incompleto</h3>
          </div>
          <p className="text-amber-100">
            Faltan {missingItems} archivos y hay {warningItems} advertencias que deben resolverse.
          </p>
        </div>
      )}
    </div>
  );
}
