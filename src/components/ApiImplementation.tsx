import { useState } from 'react';
import {
  FileCode,
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  Copy,
  Check,
  Server,
  Database,
  Shield,
  FileText,
  Box,
  GitBranch,
} from 'lucide-react';

/* ------------------------- Code Viewer ------------------------- */
function CodeViewer({ code, language = 'python' }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700 rounded-t-lg">
        <span className="text-xs text-slate-400 font-mono">{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
        >
          {copied ? (
            <>
              <Check size={14} className="text-emerald-400" />
              <span className="text-emerald-400">Copiado</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span>Copiar</span>
            </>
          )}
        </button>
      </div>
      <pre className="bg-slate-900 p-4 overflow-x-auto text-sm leading-relaxed rounded-b-lg">
        <code className="text-slate-300 font-mono text-xs whitespace-pre">{code}</code>
      </pre>
    </div>
  );
}

/* ------------------------- File Tree ------------------------- */
interface FileNode {
  name: string;
  type: 'file' | 'folder';
  path: string;
  children?: FileNode[];
}

const apiStructure: FileNode[] = [
  {
    name: 'app',
    type: 'folder',
    path: 'app',
    children: [
      { name: 'main.py', type: 'file', path: 'app/main.py' },
      { name: 'config.py', type: 'file', path: 'app/config.py' },
      { name: 'db.py', type: 'file', path: 'app/db.py' },
      {
        name: 'models',
        type: 'folder',
        path: 'app/models',
        children: [
          { name: '__init__.py', type: 'file', path: 'app/models/__init__.py' },
          { name: 'policy.py', type: 'file', path: 'app/models/policy.py' },
          { name: 'control.py', type: 'file', path: 'app/models/control.py' },
          { name: 'requirement.py', type: 'file', path: 'app/models/requirement.py' },
          { name: 'submission.py', type: 'file', path: 'app/models/submission.py' },
          { name: 'attachment.py', type: 'file', path: 'app/models/attachment.py' },
          { name: 'user.py', type: 'file', path: 'app/models/user.py' },
          { name: 'audit.py', type: 'file', path: 'app/models/audit.py' },
        ],
      },
      {
        name: 'schemas',
        type: 'folder',
        path: 'app/schemas',
        children: [
          { name: '__init__.py', type: 'file', path: 'app/schemas/__init__.py' },
          { name: 'policy.py', type: 'file', path: 'app/schemas/policy.py' },
          { name: 'requirement.py', type: 'file', path: 'app/schemas/requirement.py' },
          { name: 'submission.py', type: 'file', path: 'app/schemas/submission.py' },
          { name: 'dashboard.py', type: 'file', path: 'app/schemas/dashboard.py' },
        ],
      },
      {
        name: 'routers',
        type: 'folder',
        path: 'app/routers',
        children: [
          { name: '__init__.py', type: 'file', path: 'app/routers/__init__.py' },
          { name: 'policies.py', type: 'file', path: 'app/routers/policies.py' },
          { name: 'requirements.py', type: 'file', path: 'app/routers/requirements.py' },
          { name: 'submissions.py', type: 'file', path: 'app/routers/submissions.py' },
          { name: 'dashboard.py', type: 'file', path: 'app/routers/dashboard.py' },
        ],
      },
      {
        name: 'services',
        type: 'folder',
        path: 'app/services',
        children: [
          { name: 'due_dates.py', type: 'file', path: 'app/services/due_dates.py' },
          { name: 'audit.py', type: 'file', path: 'app/services/audit.py' },
        ],
      },
      {
        name: 'auth',
        type: 'folder',
        path: 'app/auth',
        children: [
          { name: '__init__.py', type: 'file', path: 'app/auth/__init__.py' },
          { name: 'dependencies.py', type: 'file', path: 'app/auth/dependencies.py' },
        ],
      },
    ],
  },
  { name: 'requirements.txt', type: 'file', path: 'requirements.txt' },
  { name: 'alembic.ini', type: 'file', path: 'alembic.ini' },
];

interface FileTreeProps {
  nodes: FileNode[];
  selectedPath: string;
  onSelect: (path: string) => void;
  depth?: number;
}

function FileTree({ nodes, selectedPath, onSelect, depth = 0 }: FileTreeProps) {
  return (
    <div>
      {nodes.map((node) => (
        <FileTreeNode
          key={node.path}
          node={node}
          selectedPath={selectedPath}
          onSelect={onSelect}
          depth={depth}
        />
      ))}
    </div>
  );
}

function FileTreeNode({
  node,
  selectedPath,
  onSelect,
  depth,
}: {
  node: FileNode;
  selectedPath: string;
  onSelect: (path: string) => void;
  depth: number;
}) {
  const [expanded, setExpanded] = useState(depth < 2);
  const isSelected = selectedPath === node.path;
  const isFolder = node.type === 'folder';

  return (
    <div>
      <button
        onClick={() => {
          if (isFolder) {
            setExpanded(!expanded);
          } else {
            onSelect(node.path);
          }
        }}
        className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left transition-colors ${
          isSelected
            ? 'bg-emerald-50 text-emerald-700 border-l-2 border-emerald-500'
            : 'hover:bg-slate-50 text-slate-700'
        }`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {isFolder ? (
          expanded ? (
            <ChevronDown size={14} className="text-slate-400 flex-shrink-0" />
          ) : (
            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
          )
        ) : (
          <span className="w-3.5 flex-shrink-0" />
        )}
        {isFolder ? (
          expanded ? (
            <FolderOpen size={16} className="text-amber-500 flex-shrink-0" />
          ) : (
            <Folder size={16} className="text-amber-500 flex-shrink-0" />
          )
        ) : (
          <FileCode size={16} className="text-blue-500 flex-shrink-0" />
        )}
        <span className="text-sm font-mono truncate">{node.name}</span>
      </button>
      {isFolder && expanded && node.children && (
        <FileTree
          nodes={node.children}
          selectedPath={selectedPath}
          onSelect={onSelect}
          depth={depth + 1}
        />
      )}
    </div>
  );
}

/* ------------------------- Main Component ------------------------- */
export default function ApiImplementation() {
  const [selectedFile, setSelectedFile] = useState('app/main.py');

  return (
    <div className="space-y-6">
      {/* Intro */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <Server size={24} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900 text-lg mb-1">
              Implementación de la API FastAPI
            </h3>
            <p className="text-blue-800 text-sm leading-relaxed">
              Código completo de la API backend organizado por módulos. Explora los archivos en el
              árbol de la izquierda y copia el código para tu proyecto real.
            </p>
          </div>
        </div>
      </div>

      {/* File Explorer + Code Viewer */}
      <div className="grid lg:grid-cols-4 gap-4">
        {/* File Tree */}
        <div className="lg:col-span-1 bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
            <h4 className="text-sm font-semibold text-slate-700">Explorador de archivos</h4>
          </div>
          <div className="p-2 max-h-[600px] overflow-y-auto">
            <FileTree
              nodes={apiStructure}
              selectedPath={selectedFile}
              onSelect={setSelectedFile}
            />
          </div>
        </div>

        {/* Code Viewer */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
            <FileCode size={16} className="text-blue-500" />
            <span className="text-sm font-mono text-slate-700">{selectedFile}</span>
          </div>
          <div className="p-4 max-h-[600px] overflow-y-auto">
            <FileContent path={selectedFile} />
          </div>
        </div>
      </div>

      {/* Endpoints Summary */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Box size={18} className="text-emerald-500" />
          Endpoints disponibles
        </h3>
        <div className="space-y-3">
          {[
            { method: 'GET', path: '/api/policies', desc: 'Listar todas las políticas' },
            { method: 'GET', path: '/api/policies/{code}', desc: 'Obtener política por código' },
            { method: 'GET', path: '/api/requirements', desc: 'Listar requisitos (filtrable por política)' },
            { method: 'GET', path: '/api/requirements/{id}', desc: 'Obtener requisito con estado' },
            { method: 'POST', path: '/api/submissions', desc: 'Crear nueva entrega de evidencia' },
            { method: 'GET', path: '/api/submissions/{id}', desc: 'Obtener entrega con adjuntos' },
            { method: 'POST', path: '/api/attachments', desc: 'Subir archivo adjunto a SharePoint' },
            { method: 'GET', path: '/api/dashboard', desc: 'Tablero con resumen de estados' },
            { method: 'GET', path: '/api/docs', desc: 'Documentación interactiva (Swagger UI)' },
          ].map((endpoint) => (
            <div
              key={endpoint.path}
              className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <span
                className={`flex-shrink-0 px-2 py-1 rounded text-xs font-bold ${
                  endpoint.method === 'GET'
                    ? 'bg-emerald-100 text-emerald-700'
                    : endpoint.method === 'POST'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {endpoint.method}
              </span>
              <code className="text-sm font-mono text-slate-700 flex-1">{endpoint.path}</code>
              <span className="text-xs text-slate-500 hidden sm:inline">{endpoint.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Start */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 text-white">
        <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
          <GitBranch size={20} className="text-emerald-400" />
          Inicio rápido
        </h3>
        <div className="space-y-3 text-sm">
          <p className="text-slate-300">1. Copia todos los archivos del explorador a tu proyecto</p>
          <p className="text-slate-300">2. Instala las dependencias:</p>
          <div className="bg-slate-950 rounded-lg p-3 font-mono text-xs text-slate-200">
            pip install -r requirements.txt
          </div>
          <p className="text-slate-300">3. Configura las variables de entorno en .env</p>
          <p className="text-slate-300">4. Inicializa la base de datos:</p>
          <div className="bg-slate-950 rounded-lg p-3 font-mono text-xs text-slate-200">
            alembic upgrade head
          </div>
          <p className="text-slate-300">5. Ejecuta la API:</p>
          <div className="bg-slate-950 rounded-lg p-3 font-mono text-xs text-slate-200">
            uvicorn app.main:app --reload
          </div>
          <p className="text-slate-300">6. Abre la documentación en:</p>
          <div className="bg-slate-950 rounded-lg p-3 font-mono text-xs text-emerald-400">
            http://localhost:8000/api/docs
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------- File Content ------------------------- */
function FileContent({ path }: { path: string }) {
  const files: Record<string, { code: string; language: string }> = {
    'app/main.py': {
      language: 'python',
      code: `"""
Punto de entrada de la API FastAPI.
Crea la aplicación y registra todos los routers.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import policies, requirements, submissions, dashboard

# Crear la aplicación FastAPI
app = FastAPI(
    title="Evidencias ISO 27001 API",
    description="API para gestión de evidencias de controles ISO 27001",
    version="1.0.0",
    docs_url="/api/docs",
    openapi_url="/api/openapi.json",
)

# Configurar CORS (solo necesario en desarrollo)
if settings.ENVIRONMENT == "development":
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:5173"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Registrar routers con prefijo /api
app.include_router(policies.router, prefix="/api", tags=["policies"])
app.include_router(requirements.router, prefix="/api", tags=["requirements"])
app.include_router(submissions.router, prefix="/api", tags=["submissions"])
app.include_router(dashboard.router, prefix="/api", tags=["dashboard"])


@app.get("/api/health")
def health_check():
    """Endpoint de verificación de salud"""
    return {"status": "healthy", "version": "1.0.0"}


@app.get("/")
def root():
    """Redirige a la documentación"""
    return {"message": "API de Evidencias ISO 27001", "docs": "/api/docs"}`,
    },
    'app/config.py': {
      language: 'python',
      code: `"""
Configuración de la aplicación.
Lee variables de entorno y las valida con Pydantic.
"""
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Configuración de la aplicación cargada desde variables de entorno"""
    
    # Base de datos
    DATABASE_URL: str
    DB_NAME: str = "evidencias"
    DB_OWNER: str = "evidencias_owner"
    DB_APP_USER: str = "evidencias_app"
    
    # Aplicación
    APP_HOST: str = "localhost"
    ENVIRONMENT: str = "development"  # development | production
    AUTH_DISABLED: bool = False
    
    # Microsoft Entra ID (Azure AD)
    ENTRA_TENANT_ID: Optional[str] = None
    ENTRA_CLIENT_ID: Optional[str] = None
    
    # Microsoft Graph / SharePoint
    GRAPH_CLIENT_ID: Optional[str] = None
    GRAPH_CLIENT_SECRET: Optional[str] = None
    SP_SITE_ID: Optional[str] = None
    SP_DRIVE_ID: Optional[str] = None
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Instancia global de configuración
settings = Settings()`,
    },
    'app/db.py': {
      language: 'python',
      code: `"""
Configuración de la base de datos y sesiones SQLAlchemy.
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from app.config import settings

# Crear el engine de SQLAlchemy
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,  # Verifica conexión antes de usar
    pool_size=10,
    max_overflow=20,
)

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base para modelos
Base = declarative_base()


def get_db():
    """
    Dependency de FastAPI para obtener una sesión de base de datos.
    Se usa como: db: Session = Depends(get_db)
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()`,
    },
    'app/models/__init__.py': {
      language: 'python',
      code: `"""
Modelos SQLAlchemy de la base de datos.
Importa todos los modelos para que Alembic los detecte.
"""
from app.models.policy import Policy
from app.models.control import Control
from app.models.requirement import Requirement
from app.models.submission import Submission
from app.models.attachment import Attachment
from app.models.user import User
from app.models.audit import AuditLog

__all__ = [
    "Policy",
    "Control",
    "Requirement",
    "Submission",
    "Attachment",
    "User",
    "AuditLog",
]`,
    },
    'app/models/policy.py': {
      language: 'python',
      code: `"""
Modelo de Política de Seguridad.
Ejemplo: POL-SI-001, POL-SI-005, etc.
"""
from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.db import Base


class Policy(Base):
    __tablename__ = "policies"
    
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(20), unique=True, nullable=False, index=True)  # POL-SI-001
    title = Column(String(200), nullable=False)
    description = Column(Text)
    version = Column(String(10), default="1.0")
    status = Column(String(20), default="Vigente")  # Vigente, Obsoleta, En revisión
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relaciones
    requirements = relationship("Requirement", back_populates="policy")`,
    },
    'app/models/control.py': {
      language: 'python',
      code: `"""
Modelo de Control ISO 27001.
Ejemplo: A.5.1, A.8.9, etc.
"""
from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.db import Base


class Control(Base):
    __tablename__ = "controls"
    
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(20), unique=True, nullable=False, index=True)  # A.5.1
    title = Column(String(200), nullable=False)
    description = Column(Text)
    category = Column(String(50))  # A.5 (Políticas), A.8 (Controles técnicos), etc.
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relaciones
    requirements = relationship("Requirement", back_populates="control")`,
    },
    'app/models/requirement.py': {
      language: 'python',
      code: `"""
Modelo de Requisito de Evidencia.
Cada requisito tiene una frecuencia y se vincula a una política y control.
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.db import Base


class Requirement(Base):
    __tablename__ = "requirements"
    
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(20), unique=True, nullable=False, index=True)  # EV-001
    title = Column(String(200), nullable=False)
    description = Column(Text)
    
    # Frecuencia de evidencia requerida
    frequency = Column(String(20), nullable=False)  # Mensual, Trimestral, Semestral, Anual, Continua
    
    # Relaciones con política y control
    policy_code = Column(String(20), ForeignKey("policies.code"), nullable=False, index=True)
    control_id = Column(Integer, ForeignKey("controls.id"), nullable=True, index=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relaciones
    policy = relationship("Policy", back_populates="requirements")
    control = relationship("Control", back_populates="requirements")
    submissions = relationship("Submission", back_populates="requirement")`,
    },
    'app/models/submission.py': {
      language: 'python',
      code: `"""
Modelo de Entrega de Evidencia.
Representa una instancia de cumplimiento de un requisito.
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, Date, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.db import Base


class Submission(Base):
    __tablename__ = "submissions"
    
    id = Column(Integer, primary_key=True, index=True)
    requirement_id = Column(Integer, ForeignKey("requirements.id"), nullable=False, index=True)
    
    # Fecha de la evidencia
    evidence_date = Column(Date, nullable=False, index=True)
    
    # Estado de la entrega
    status = Column(String(20), nullable=False, default="Pendiente")  # Pendiente, Completa, Rechazada
    notes = Column(Text)
    
    # Usuario que creó la entrega
    created_by = Column(String(100))  # Email del usuario de Entra ID
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relaciones
    requirement = relationship("Requirement", back_populates="submissions")
    attachments = relationship("Attachment", back_populates="submission", cascade="all, delete-orphan")`,
    },
    'app/models/attachment.py': {
      language: 'python',
      code: `"""
Modelo de Archivo Adjunto.
Almacena metadatos del archivo subido a SharePoint.
"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.db import Base


class Attachment(Base):
    __tablename__ = "attachments"
    
    id = Column(Integer, primary_key=True, index=True)
    submission_id = Column(Integer, ForeignKey("submissions.id"), nullable=False, index=True)
    
    # Metadatos del archivo
    filename = Column(String(255), nullable=False)
    file_size = Column(Integer)  # en bytes
    content_type = Column(String(100))
    
    # Enlace a SharePoint (Microsoft Graph)
    sharepoint_url = Column(String(500))
    sharepoint_item_id = Column(String(100))
    
    uploaded_by = Column(String(100))  # Email del usuario
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relaciones
    submission = relationship("Submission", back_populates="attachments")`,
    },
    'app/models/user.py': {
      language: 'python',
      code: `"""
Modelo de Usuario.
Representa usuarios autenticados vía Entra ID.
"""
from sqlalchemy import Column, Integer, String, DateTime, Boolean
from sqlalchemy.sql import func

from app.db import Base


class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(200), unique=True, nullable=False, index=True)
    name = Column(String(200))
    
    # Rol del usuario
    role = Column(String(20), nullable=False, default="user")  # admin, auditor, user
    
    # Estado
    is_active = Column(Boolean, default=True)
    
    # Entra ID
    entra_id = Column(String(100), unique=True)  # Object ID de Azure AD
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_login = Column(DateTime(timezone=True))`,
    },
    'app/models/audit.py': {
      language: 'python',
      code: `"""
Modelo de Registro de Auditoría.
Registra todas las acciones importantes del sistema.
"""
from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func

from app.db import Base


class AuditLog(Base):
    __tablename__ = "audit_log"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Acción realizada
    action = Column(String(50), nullable=False)  # create, update, delete, login
    resource_type = Column(String(50))  # submission, attachment, policy, etc.
    resource_id = Column(Integer)
    
    # Detalles de la acción
    description = Column(Text)
    details = Column(Text)  # JSON con datos adicionales
    
    # Usuario que realizó la acción
    user_email = Column(String(200))
    user_role = Column(String(20))
    
    # Timestamp
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    
    # IP y user agent (opcional)
    ip_address = Column(String(50))
    user_agent = Column(String(500))`,
    },
    'app/schemas/__init__.py': {
      language: 'python',
      code: `"""
Schemas Pydantic para validación de datos.
"""
from app.schemas.policy import PolicyCreate, PolicyResponse, PolicyList
from app.schemas.requirement import RequirementResponse, RequirementWithStatus
from app.schemas.submission import SubmissionCreate, SubmissionResponse
from app.schemas.dashboard import DashboardResponse

__all__ = [
    "PolicyCreate",
    "PolicyResponse",
    "PolicyList",
    "RequirementResponse",
    "RequirementWithStatus",
    "SubmissionCreate",
    "SubmissionResponse",
    "DashboardResponse",
]`,
    },
    'app/schemas/policy.py': {
      language: 'python',
      code: `"""
Schemas para Políticas.
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class PolicyBase(BaseModel):
    code: str = Field(..., max_length=20, example="POL-SI-001")
    title: str = Field(..., max_length=200)
    description: Optional[str] = None
    version: str = Field(default="1.0", max_length=10)
    status: str = Field(default="Vigente")


class PolicyCreate(PolicyBase):
    """Schema para crear una política"""
    pass


class PolicyResponse(PolicyBase):
    """Schema de respuesta de una política"""
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class PolicyList(BaseModel):
    """Lista de políticas"""
    policies: list[PolicyResponse]
    total: int`,
    },
    'app/schemas/requirement.py': {
      language: 'python',
      code: `"""
Schemas para Requisitos.
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, date


class RequirementBase(BaseModel):
    code: str = Field(..., max_length=20, example="EV-001")
    title: str = Field(..., max_length=200)
    description: Optional[str] = None
    frequency: str = Field(..., example="Mensual")  # Mensual, Trimestral, Semestral, Anual, Continua
    policy_code: str
    control_id: Optional[int] = None


class RequirementResponse(RequirementBase):
    """Schema de respuesta de un requisito"""
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class RequirementWithStatus(RequirementResponse):
    """Requisito con estado calculado (última evidencia, próxima fecha, alerta)"""
    last_evidence_date: Optional[date] = None
    next_due_date: Optional[date] = None
    alert_status: str = "Pendiente"  # Pendiente, Vigente, Por vencer, Vencida`,
    },
    'app/schemas/submission.py': {
      language: 'python',
      code: `"""
Schemas para Entregas de Evidencia.
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, date


class AttachmentResponse(BaseModel):
    """Schema de respuesta de un adjunto"""
    id: int
    filename: str
    file_size: Optional[int] = None
    content_type: Optional[str] = None
    sharepoint_url: Optional[str] = None
    uploaded_by: Optional[str] = None
    uploaded_at: datetime
    
    class Config:
        from_attributes = True


class SubmissionBase(BaseModel):
    requirement_id: int
    evidence_date: date
    notes: Optional[str] = None


class SubmissionCreate(SubmissionBase):
    """Schema para crear una entrega"""
    pass


class SubmissionResponse(SubmissionBase):
    """Schema de respuesta de una entrega"""
    id: int
    status: str
    created_by: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    attachments: List[AttachmentResponse] = []
    
    class Config:
        from_attributes = True`,
    },
    'app/schemas/dashboard.py': {
      language: 'python',
      code: `"""
Schemas para el Tablero (Dashboard).
"""
from pydantic import BaseModel
from typing import List


class StatusCount(BaseModel):
    """Conteo por estado"""
    status: str
    count: int


class PolicySummary(BaseModel):
    """Resumen por política"""
    policy_code: str
    policy_title: str
    total_requirements: int
    compliant: int
    non_compliant: int
    compliance_rate: float


class DashboardResponse(BaseModel):
    """Respuesta del tablero"""
    total_requirements: int
    status_counts: List[StatusCount]
    policy_summaries: List[PolicySummary]
    overall_compliance_rate: float`,
    },
    'app/routers/__init__.py': {
      language: 'python',
      code: `"""
Routers de la API.
"""
from app.routers import policies, requirements, submissions, dashboard

__all__ = ["policies", "requirements", "submissions", "dashboard"]`,
    },
    'app/routers/policies.py': {
      language: 'python',
      code: `"""
Router de Políticas.
Endpoints para listar y obtener políticas.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.db import get_db
from app.models.policy import Policy
from app.schemas.policy import PolicyResponse, PolicyList

router = APIRouter()


@router.get("/policies", response_model=PolicyList)
def list_policies(db: Session = Depends(get_db)):
    """
    Lista todas las políticas de seguridad.
    
    Returns:
        PolicyList: Lista de políticas con total
    """
    policies = db.query(Policy).order_by(Policy.code).all()
    return PolicyList(policies=policies, total=len(policies))


@router.get("/policies/{code}", response_model=PolicyResponse)
def get_policy(code: str, db: Session = Depends(get_db)):
    """
    Obtiene una política por su código.
    
    Args:
        code: Código de la política (ej: POL-SI-001)
    
    Raises:
        HTTPException: 404 si la política no existe
    """
    policy = db.query(Policy).filter(Policy.code == code).first()
    if not policy:
        raise HTTPException(status_code=404, detail=f"Política {code} no encontrada")
    return policy`,
    },
    'app/routers/requirements.py': {
      language: 'python',
      code: `"""
Router de Requisitos.
Endpoints para listar requisitos con estado calculado.
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List

from app.db import get_db
from app.models.requirement import Requirement
from app.models.submission import Submission
from app.schemas.requirement import RequirementResponse, RequirementWithStatus
from app.services.due_dates import calculate_requirement_status

router = APIRouter()


@router.get("/requirements", response_model=List[RequirementWithStatus])
def list_requirements(
    policy_code: Optional[str] = Query(None, description="Filtrar por política"),
    status: Optional[str] = Query(None, description="Filtrar por estado"),
    db: Session = Depends(get_db),
):
    """
    Lista todos los requisitos con su estado calculado.
    
    Query Params:
        policy_code: Filtrar por código de política
        status: Filtrar por estado (Pendiente, Vigente, Por vencer, Vencida)
    
    Returns:
        List[RequirementWithStatus]: Requisitos con estado
    """
    query = db.query(Requirement)
    
    if policy_code:
        query = query.filter(Requirement.policy_code == policy_code)
    
    requirements = query.order_by(Requirement.code).all()
    
    # Calcular estado de cada requisito
    result = []
    for req in requirements:
        status_data = calculate_requirement_status(req.id, db)
        req_with_status = RequirementWithStatus(
            **req.__dict__,
            last_evidence_date=status_data["last_evidence_date"],
            next_due_date=status_data["next_due_date"],
            alert_status=status_data["alert_status"],
        )
        
        # Filtrar por estado si se especificó
        if status and req_with_status.alert_status != status:
            continue
        
        result.append(req_with_status)
    
    return result


@router.get("/requirements/{id}", response_model=RequirementWithStatus)
def get_requirement(id: int, db: Session = Depends(get_db)):
    """
    Obtiene un requisito por ID con su estado calculado.
    
    Args:
        id: ID del requisito
    
    Raises:
        HTTPException: 404 si el requisito no existe
    """
    requirement = db.query(Requirement).filter(Requirement.id == id).first()
    if not requirement:
        raise HTTPException(status_code=404, detail=f"Requisito {id} no encontrado")
    
    status_data = calculate_requirement_status(requirement.id, db)
    
    return RequirementWithStatus(
        **requirement.__dict__,
        last_evidence_date=status_data["last_evidence_date"],
        next_due_date=status_data["next_due_date"],
        alert_status=status_data["alert_status"],
    )`,
    },
    'app/routers/submissions.py': {
      language: 'python',
      code: `"""
Router de Entregas.
Endpoints para crear y consultar entregas de evidencia.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.db import get_db
from app.models.submission import Submission
from app.models.requirement import Requirement
from app.schemas.submission import SubmissionCreate, SubmissionResponse
from app.services.audit import log_action
from app.auth.dependencies import get_current_user

router = APIRouter()


@router.post("/submissions", response_model=SubmissionResponse, status_code=201)
def create_submission(
    submission: SubmissionCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    Crea una nueva entrega de evidencia.
    
    Args:
        submission: Datos de la entrega
    
    Returns:
        SubmissionResponse: Entrega creada
    
    Raises:
        HTTPException: 404 si el requisito no existe
    """
    # Verificar que el requisito existe
    requirement = db.query(Requirement).filter(Requirement.id == submission.requirement_id).first()
    if not requirement:
        raise HTTPException(
            status_code=404,
            detail=f"Requisito {submission.requirement_id} no encontrado",
        )
    
    # Crear la entrega
    new_submission = Submission(
        requirement_id=submission.requirement_id,
        evidence_date=submission.evidence_date,
        notes=submission.notes,
        status="Pendiente",
        created_by=current_user["email"],
    )
    
    db.add(new_submission)
    db.commit()
    db.refresh(new_submission)
    
    # Registrar en auditoría
    log_action(
        db=db,
        action="create",
        resource_type="submission",
        resource_id=new_submission.id,
        description=f"Entrega creada para requisito {requirement.code}",
        user_email=current_user["email"],
        user_role=current_user.get("role", "user"),
    )
    
    return new_submission


@router.get("/submissions/{id}", response_model=SubmissionResponse)
def get_submission(id: int, db: Session = Depends(get_db)):
    """
    Obtiene una entrega por ID con sus adjuntos.
    
    Args:
        id: ID de la entrega
    
    Raises:
        HTTPException: 404 si la entrega no existe
    """
    submission = db.query(Submission).filter(Submission.id == id).first()
    if not submission:
        raise HTTPException(status_code=404, detail=f"Entrega {id} no encontrada")
    return submission


@router.get("/submissions", response_model=List[SubmissionResponse])
def list_submissions(
    requirement_id: int = None,
    db: Session = Depends(get_db),
):
    """
    Lista entregas, opcionalmente filtradas por requisito.
    
    Query Params:
        requirement_id: Filtrar por ID de requisito
    """
    query = db.query(Submission)
    if requirement_id:
        query = query.filter(Submission.requirement_id == requirement_id)
    
    return query.order_by(Submission.evidence_date.desc()).all()`,
    },
    'app/routers/dashboard.py': {
      language: 'python',
      code: `"""
Router del Tablero (Dashboard).
Endpoint para obtener resumen de estados y cumplimiento.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.db import get_db
from app.models.requirement import Requirement
from app.models.policy import Policy
from app.schemas.dashboard import DashboardResponse, StatusCount, PolicySummary
from app.services.due_dates import calculate_requirement_status

router = APIRouter()


@router.get("/dashboard", response_model=DashboardResponse)
def get_dashboard(db: Session = Depends(get_db)):
    """
    Obtiene el tablero con resumen de estados y cumplimiento.
    
    Returns:
        DashboardResponse: Resumen del estado de cumplimiento
    """
    # Obtener todos los requisitos
    requirements = db.query(Requirement).all()
    total_requirements = len(requirements)
    
    # Contar por estado
    status_counts = {"Pendiente": 0, "Vigente": 0, "Por vencer": 0, "Vencida": 0}
    
    for req in requirements:
        status_data = calculate_requirement_status(req.id, db)
        alert_status = status_data["alert_status"]
        status_counts[alert_status] = status_counts.get(alert_status, 0) + 1
    
    # Convertir a lista de StatusCount
    status_list = [
        StatusCount(status=status, count=count)
        for status, count in status_counts.items()
    ]
    
    # Resumen por política
    policies = db.query(Policy).all()
    policy_summaries = []
    
    for policy in policies:
        policy_reqs = [r for r in requirements if r.policy_code == policy.code]
        total = len(policy_reqs)
        
        compliant = 0
        for req in policy_reqs:
            status_data = calculate_requirement_status(req.id, db)
            if status_data["alert_status"] in ["Vigente", "Por vencer"]:
                compliant += 1
        
        non_compliant = total - compliant
        compliance_rate = (compliant / total * 100) if total > 0 else 0
        
        policy_summaries.append(
            PolicySummary(
                policy_code=policy.code,
                policy_title=policy.title,
                total_requirements=total,
                compliant=compliant,
                non_compliant=non_compliant,
                compliance_rate=round(compliance_rate, 2),
            )
        )
    
    # Tasa de cumplimiento general
    total_compliant = sum(1 for r in requirements 
                         if calculate_requirement_status(r.id, db)["alert_status"] in ["Vigente", "Por vencer"])
    overall_rate = (total_compliant / total_requirements * 100) if total_requirements > 0 else 0
    
    return DashboardResponse(
        total_requirements=total_requirements,
        status_counts=status_list,
        policy_summaries=policy_summaries,
        overall_compliance_rate=round(overall_rate, 2),
    )`,
    },
    'app/services/due_dates.py': {
      language: 'python',
      code: `"""
Servicio de cálculo de fechas de vencimiento.
Determina el estado de cada requisito basado en la última evidencia.
"""
from datetime import date, timedelta
from typing import Dict, Optional
from sqlalchemy.orm import Session

from app.models.submission import Submission


# Mapeo de frecuencia a meses
FREQUENCY_MONTHS = {
    "Mensual": 1,
    "Trimestral": 3,
    "Semestral": 6,
    "Anual": 12,
    "Continua": 1,
}


def calculate_requirement_status(requirement_id: int, db: Session) -> Dict:
    """
    Calcula el estado de un requisito basado en su última evidencia.
    
    Args:
        requirement_id: ID del requisito
        db: Sesión de base de datos
    
    Returns:
        Dict con:
            - last_evidence_date: Fecha de la última evidencia (o None)
            - next_due_date: Próxima fecha de vencimiento (o None)
            - alert_status: Estado (Pendiente, Vigente, Por vencer, Vencida)
    """
    # Obtener la última evidencia completa
    last_submission = (
        db.query(Submission)
        .filter(
            Submission.requirement_id == requirement_id,
            Submission.status == "Completa",
        )
        .order_by(Submission.evidence_date.desc())
        .first()
    )
    
    # Si no hay evidencia, está pendiente
    if not last_submission:
        return {
            "last_evidence_date": None,
            "next_due_date": None,
            "alert_status": "Pendiente",
        }
    
    # Obtener el requisito para conocer su frecuencia
    from app.models.requirement import Requirement
    requirement = db.query(Requirement).filter(Requirement.id == requirement_id).first()
    
    if not requirement or requirement.frequency not in FREQUENCY_MONTHS:
        return {
            "last_evidence_date": last_submission.evidence_date,
            "next_due_date": None,
            "alert_status": "Vigente",
        }
    
    # Calcular próxima fecha de vencimiento
    months = FREQUENCY_MONTHS[requirement.frequency]
    last_date = last_submission.evidence_date
    
    # Sumar meses a la fecha
    next_due = add_months(last_date, months)
    
    # Determinar estado
    today = date.today()
    days_until_due = (next_due - today).days
    
    if days_until_due < 0:
        alert_status = "Vencida"
    elif days_until_due <= 30:
        alert_status = "Por vencer"
    else:
        alert_status = "Vigente"
    
    return {
        "last_evidence_date": last_date,
        "next_due_date": next_due,
        "alert_status": alert_status,
    }


def add_months(source_date: date, months: int) -> date:
    """
    Suma meses a una fecha.
    
    Args:
        source_date: Fecha de origen
        months: Número de meses a sumar
    
    Returns:
        Nueva fecha
    """
    month = source_date.month - 1 + months
    year = source_date.year + month // 12
    month = month % 12 + 1
    day = min(source_date.day, [31, 29 if year % 4 == 0 and not (year % 100 == 0 and year % 400 != 0) else 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1])
    return date(year, month, day)`,
    },
    'app/services/audit.py': {
      language: 'python',
      code: `"""
Servicio de registro de auditoría.
Registra todas las acciones importantes del sistema.
"""
from sqlalchemy.orm import Session
from app.models.audit import AuditLog


def log_action(
    db: Session,
    action: str,
    resource_type: str = None,
    resource_id: int = None,
    description: str = None,
    details: str = None,
    user_email: str = None,
    user_role: str = None,
    ip_address: str = None,
    user_agent: str = None,
):
    """
    Registra una acción en el log de auditoría.
    
    Args:
        db: Sesión de base de datos
        action: Tipo de acción (create, update, delete, login)
        resource_type: Tipo de recurso (submission, attachment, policy, etc.)
        resource_id: ID del recurso
        description: Descripción de la acción
        details: Detalles adicionales (JSON)
        user_email: Email del usuario
        user_role: Rol del usuario
        ip_address: IP del cliente
        user_agent: User agent del cliente
    """
    audit_log = AuditLog(
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        description=description,
        details=details,
        user_email=user_email,
        user_role=user_role,
        ip_address=ip_address,
        user_agent=user_agent,
    )
    
    db.add(audit_log)
    db.commit()`,
    },
    'app/auth/__init__.py': {
      language: 'python',
      code: `"""
Módulo de autenticación.
"""
from app.auth.dependencies import get_current_user

__all__ = ["get_current_user"]`,
    },
    'app/auth/dependencies.py': {
      language: 'python',
      code: `"""
Dependencias de autenticación para FastAPI.
Valida tokens JWT de Entra ID.
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional

from app.config import settings

security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    """
    Dependency que valida el token JWT y devuelve el usuario actual.
    
    En producción, valida el token con Entra ID.
    En desarrollo con AUTH_DISABLED=True, devuelve un usuario falso.
    
    Returns:
        dict: Datos del usuario (email, name, role)
    
    Raises:
        HTTPException: 401 si el token es inválido
    """
    # Modo desarrollo: usuario falso
    if settings.AUTH_DISABLED:
        return {
            "email": "dev@example.com",
            "name": "Desarrollador",
            "role": "admin",
        }
    
    # En producción: validar token con Entra ID
    token = credentials.credentials
    
    # TODO: Implementar validación real con msal y jose
    # Por ahora, simulamos la validación
    try:
        # Aquí iría la validación real del token
        # decoded = jwt.decode(token, ...)
        
        # Simulamos un usuario válido
        return {
            "email": "user@example.com",
            "name": "Usuario Ejemplo",
            "role": "user",
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token inválido: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )


def require_role(required_role: str):
    """
    Dependency factory que requiere un rol específico.
    
    Usage:
        @router.get("/admin-only")
        def admin_endpoint(user: dict = Depends(require_role("admin"))):
            ...
    """
    async def role_checker(current_user: dict = Depends(get_current_user)):
        if current_user.get("role") != required_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Se requiere rol: {required_role}",
            )
        return current_user
    
    return role_checker`,
    },
    'requirements.txt': {
      language: 'text',
      code: `# API Framework
fastapi==0.109.0
uvicorn[standard]==0.27.0
python-multipart==0.0.6

# Database
sqlalchemy==2.0.25
psycopg[binary]==3.1.18
alembic==1.13.1

# Validation
pydantic==2.5.3
pydantic-settings==2.1.0

# Authentication
python-jose[cryptography]==3.3.0
msal==1.26.0
httpx==0.26.0

# Testing
pytest==7.4.4
pytest-asyncio==0.23.3
httpx==0.26.0

# Utilities
python-dotenv==1.0.0`,
    },
    'alembic.ini': {
      language: 'ini',
      code: `[alembic]
script_location = alembic
sqlalchemy.url = postgresql+psycopg://evidencias_owner:password@localhost:5432/evidencias

[loggers]
keys = root,sqlalchemy,alembic

[handlers]
keys = console

[formatters]
keys = generic

[logger_root]
level = WARN
handlers = console
qualname =

[logger_sqlalchemy]
level = WARN
handlers =
qualname = sqlalchemy.engine

[logger_alembic]
level = INFO
handlers =
qualname = alembic

[handler_console]
class = StreamHandler
args = (sys.stderr,)
level = NOTSET
formatter = generic

[formatter_generic]
format = %(levelname)-5.5s [%(name)s] %(message)s
datefmt = %H:%M:%S`,
    },
  };

  const file = files[path];

  if (!file) {
    return (
      <div className="text-center py-12 text-slate-400">
        <FileCode size={48} className="mx-auto mb-3 opacity-30" />
        <p className="text-sm">Contenido no disponible para este archivo</p>
      </div>
    );
  }

  return <CodeViewer code={file.code} language={file.language} />;
}
