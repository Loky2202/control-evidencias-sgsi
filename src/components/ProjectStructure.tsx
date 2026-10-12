import { useState } from 'react';
import { FolderOpen, File, ChevronRight, ChevronDown } from 'lucide-react';

interface TreeNode {
  name: string;
  type: 'file' | 'folder';
  description?: string;
  children?: TreeNode[];
}

const tree: TreeNode[] = [
  {
    name: 'evidencias-iso/',
    type: 'folder',
    children: [
      { name: 'docker-compose.yml', type: 'file', description: 'Orquestación principal' },
      { name: 'docker-compose.override.yml', type: 'file', description: 'Desarrollo (recarga automática)' },
      { name: '.env.example', type: 'file', description: 'Plantilla; el .env real NO se sube a Git' },
      { name: '.gitignore', type: 'file', description: '.env, backups/, node_modules/' },
      { name: 'README.md', type: 'file', description: 'Cómo levantar, probar y respaldar' },
      {
        name: 'docs/',
        type: 'folder',
        children: [
          { name: 'arquitectura.md', type: 'file' },
          {
            name: 'decisiones/',
            type: 'folder',
            description: 'Una nota corta por decisión importante',
            children: [],
          },
        ],
      },
      {
        name: 'db/',
        type: 'folder',
        children: [
          {
            name: 'init/',
            type: 'folder',
            children: [
              { name: '01-roles.sh', type: 'file', description: 'Crea el usuario limitado de la aplicación' },
            ],
          },
        ],
      },
      {
        name: 'backend/',
        type: 'folder',
        children: [
          { name: 'Dockerfile', type: 'file' },
          { name: 'requirements.txt', type: 'file' },
          { name: 'alembic.ini', type: 'file' },
          { name: 'alembic/versions/', type: 'folder', description: 'Migraciones (historial de la base de datos)' },
          {
            name: 'app/',
            type: 'folder',
            children: [
              { name: 'main.py', type: 'file', description: 'Crea la app y registra routers' },
              { name: 'config.py', type: 'file', description: 'Lee variables de entorno' },
              { name: 'db.py', type: 'file', description: 'Conexión y sesión' },
              { name: 'models/', type: 'folder', description: 'Tablas (SQLAlchemy)' },
              { name: 'schemas/', type: 'folder', description: 'Formatos de entrada y salida (Pydantic)' },
              { name: 'routers/', type: 'folder', description: 'policies, requirements, submissions, attachments, dashboard, export' },
              {
                name: 'services/',
                type: 'folder',
                children: [
                  { name: 'sharepoint.py', type: 'file', description: 'Subir y enlazar archivos con Graph' },
                  { name: 'due_dates.py', type: 'file', description: 'Reglas de frecuencia y vencimiento' },
                  { name: 'audit.py', type: 'file', description: 'Registro de auditoría' },
                ],
              },
              { name: 'auth/', type: 'folder', description: 'Validación del token y roles' },
            ],
          },
          {
            name: 'scripts/',
            type: 'folder',
            children: [
              { name: 'import_excel.py', type: 'file', description: 'Carga el Excel de seguimiento' },
            ],
          },
          { name: 'tests/', type: 'folder' },
        ],
      },
      {
        name: 'frontend/',
        type: 'folder',
        children: [
          { name: 'Dockerfile', type: 'file' },
          { name: 'Caddyfile', type: 'file' },
          { name: 'package.json', type: 'file' },
          { name: 'vite.config.ts', type: 'file' },
          {
            name: 'src/',
            type: 'folder',
            children: [
              { name: 'api/', type: 'folder', description: 'Cliente y tipos generados' },
              { name: 'auth/', type: 'folder', description: 'Configuración de MSAL' },
              { name: 'components/', type: 'folder', description: 'Fila de evidencia, adjuntos, badges' },
              { name: 'pages/', type: 'folder', description: 'Tablero, Política, Calendario, Auditor' },
            ],
          },
        ],
      },
      {
        name: 'scripts/',
        type: 'folder',
        children: [
          { name: 'backup.sh', type: 'file' },
          { name: 'restore.sh', type: 'file' },
        ],
      },
      { name: 'backups/', type: 'folder', description: 'Volcados de la base (ignorado por Git)' },
    ],
  },
];

function TreeItem({ node, depth = 0 }: { node: TreeNode; depth?: number }) {
  const [expanded, setExpanded] = useState(depth < 2);
  const isFolder = node.type === 'folder';
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div>
      <div
        className={`flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-slate-50 cursor-pointer transition-colors group ${
          depth === 0 ? 'font-semibold' : ''
        }`}
        style={{ paddingLeft: `${depth * 20 + 8}px` }}
        onClick={() => isFolder && setExpanded(!expanded)}
      >
        {isFolder && hasChildren ? (
          expanded ? (
            <ChevronDown size={14} className="text-slate-400 flex-shrink-0" />
          ) : (
            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
          )
        ) : (
          <span className="w-3.5 flex-shrink-0" />
        )}
        {isFolder ? (
          <FolderOpen size={16} className="text-amber-500 flex-shrink-0" />
        ) : (
          <File size={16} className="text-slate-400 flex-shrink-0" />
        )}
        <span className="text-sm text-slate-700 font-mono">{node.name}</span>
        {node.description && (
          <span className="text-xs text-slate-400 ml-2 hidden sm:inline">
            # {node.description}
          </span>
        )}
      </div>
      {isFolder && expanded && hasChildren && (
        <div>
          {node.children!.map((child, i) => (
            <TreeItem key={i} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProjectStructure() {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="px-5 py-3 bg-slate-50 border-b border-slate-200">
        <span className="text-sm font-medium text-slate-600">Estructura del repositorio</span>
      </div>
      <div className="p-4 max-h-[600px] overflow-y-auto">
        {tree.map((node, i) => (
          <TreeItem key={i} node={node} />
        ))}
      </div>
    </div>
  );
}
