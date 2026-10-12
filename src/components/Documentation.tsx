import { useState } from 'react';
import {
  FileText,
  BookOpen,
  Lightbulb,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  Terminal,
  AlertCircle,
  Database,
  Server,
  Shield,
  Code2,
  Box,
  Globe,
  Key,
  Lock,
  Users,
  Network,
} from 'lucide-react';

/* ------------------------- Code Block ------------------------- */
function Code({ children }: { children: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative group">
      <div className="bg-slate-900 rounded-lg p-4 pr-12 font-mono text-sm text-slate-200 overflow-x-auto whitespace-pre">
        {children}
      </div>
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 transition-colors"
      >
        {copied ? (
          <Check size={14} className="text-emerald-400" />
        ) : (
          <Copy size={14} className="text-slate-400" />
        )}
      </button>
    </div>
  );
}

/* ------------------------- Decision Card ------------------------- */
interface DecisionProps {
  icon: React.ReactNode;
  title: string;
  filename: string;
  color: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function DecisionCard({ icon, title, filename, color, children, defaultOpen = false }: DecisionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-4 p-4 text-left hover:bg-slate-50 transition-colors"
      >
        <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-slate-800 text-sm">{title}</h4>
          <code className="text-xs text-slate-400 font-mono">{filename}</code>
        </div>
        {open ? (
          <ChevronDown size={18} className="text-slate-400" />
        ) : (
          <ChevronRight size={18} className="text-slate-400" />
        )}
      </button>
      {open && (
        <div className="px-4 pb-4 pt-0 border-t border-slate-100">
          <div className="pt-3 text-sm text-slate-600 leading-relaxed">{children}</div>
        </div>
      )}
    </div>
  );
}

/* ------------------------- Main Component ------------------------- */
export default function Documentation() {
  const [tab, setTab] = useState<'readme' | 'decisions'>('readme');

  return (
    <div className="space-y-6">
      {/* Intro */}
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <BookOpen size={24} className="text-slate-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-slate-800 text-lg mb-1">
              Documentación del proyecto
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Aquí tienes el README.md con todos los comandos esenciales y las notas de decisiones
              técnicas que explican el porqué de cada elección. Útil para auditoría y para ti dentro
              de seis meses.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setTab('readme')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
            tab === 'readme'
              ? 'border-emerald-500 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <FileText size={16} />
          README.md
        </button>
        <button
          onClick={() => setTab('decisions')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
            tab === 'decisions'
              ? 'border-violet-500 text-violet-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Lightbulb size={16} />
          Notas de decisiones
        </button>
      </div>

      {/* README Tab */}
      {tab === 'readme' && (
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                <Shield size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">Evidencias ISO 27001</h2>
                <p className="text-sm text-slate-500">
                  Sistema de gestión de evidencias para controles ISO 27001
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-md text-xs font-medium">
                Python 3.12
              </span>
              <span className="px-2.5 py-1 bg-cyan-50 text-cyan-700 border border-cyan-200 rounded-md text-xs font-medium">
                FastAPI
              </span>
              <span className="px-2.5 py-1 bg-violet-50 text-violet-700 border border-violet-200 rounded-md text-xs font-medium">
                React
              </span>
              <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-md text-xs font-medium">
                PostgreSQL 17
              </span>
              <span className="px-2.5 py-1 bg-slate-100 text-slate-700 border border-slate-200 rounded-md text-xs font-medium">
                Docker
              </span>
            </div>
          </div>

          {/* Prerrequisitos */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <AlertCircle size={18} className="text-amber-500" />
              Prerrequisitos
            </h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex gap-2">
                <span className="text-emerald-500">✓</span>
                <span>Docker Engine 24+ o Docker Desktop</span>
              </li>
              <li className="flex gap-2">
                <span className="text-emerald-500">✓</span>
                <span>Docker Compose v2+</span>
              </li>
              <li className="flex gap-2">
                <span className="text-emerald-500">✓</span>
                <span>Git 2.30+</span>
              </li>
            </ul>
          </div>

          {/* Instalación */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Terminal size={18} className="text-emerald-500" />
              Instalación y arranque
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-600 mb-2">1. Clonar el repositorio:</p>
                <Code>{`git clone https://github.com/tu-organizacion/evidencias-iso.git
cd evidencias-iso`}</Code>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-2">2. Configurar variables de entorno:</p>
                <Code>{`cp .env.example .env
# Edita .env con tus valores (contraseñas, dominios, etc.)`}</Code>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-2">3. Levantar los servicios:</p>
                <Code>docker compose up --build -d</Code>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-2">4. Verificar que todo está corriendo:</p>
                <Code>docker compose ps</Code>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-2">5. Cargar datos iniciales (opcional):</p>
                <Code>docker compose exec api python scripts/import_excel.py</Code>
              </div>
            </div>
          </div>

          {/* Desarrollo */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Code2 size={18} className="text-blue-500" />
              Desarrollo local
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-600 mb-2">Levantar en modo desarrollo (con recarga automática):</p>
                <Code>docker compose -f docker-compose.yml -f docker-compose.override.yml up --build</Code>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-2">Frontend con Vite (recarga en caliente):</p>
                <Code>{`cd frontend
npm install
npm run dev`}</Code>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-2">Ver logs en vivo:</p>
                <Code>docker compose logs -f api</Code>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-2">Entrar al contenedor de la API:</p>
                <Code>docker compose exec api bash</Code>
              </div>
            </div>
          </div>

          {/* Pruebas */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Check size={18} className="text-emerald-500" />
              Pruebas
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-600 mb-2">Ejecutar pruebas de la API (pytest):</p>
                <Code>docker compose exec api pytest</Code>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-2">Ejecutar pruebas del frontend (Vitest):</p>
                <Code>{`cd frontend
npm test`}</Code>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-2">Pruebas con cobertura:</p>
                <Code>docker compose exec api pytest --cov=app --cov-report=term-missing</Code>
              </div>
            </div>
          </div>

          {/* Base de datos */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Database size={18} className="text-violet-500" />
              Base de datos
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-600 mb-2">Conectar a la base de datos:</p>
                <Code>docker compose exec db psql -U evidencias_owner -d evidencias</Code>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-2">Ver tablas:</p>
                <Code>{`\\dt`}</Code>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-2">Crear una nueva migración:</p>
                <Code>docker compose exec api alembic revision --autogenerate -m "descripción del cambio"</Code>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-2">Aplicar migraciones pendientes:</p>
                <Code>docker compose exec api alembic upgrade head</Code>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-2">Revertir la última migración:</p>
                <Code>docker compose exec api alembic downgrade -1</Code>
              </div>
            </div>
          </div>

          {/* Respaldos */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Box size={18} className="text-amber-500" />
              Respaldos y restauración
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-600 mb-2">Crear un respaldo manual:</p>
                <Code>./scripts/backup.sh</Code>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-2">Programar respaldos diarios (cron):</p>
                <Code>{`crontab -e
# Agregar esta línea para respaldar a las 2:00 AM:
0 2 * * * cd /ruta/al/proyecto && ./scripts/backup.sh`}</Code>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-2">Listar respaldos disponibles:</p>
                <Code>ls -lh backups/</Code>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-2">Restaurar desde un respaldo:</p>
                <Code>{`docker compose exec -T db pg_restore -U "$DB_OWNER" -d "$DB_NAME" \\
  --clean --if-exists < backups/evidencias_2024-01-15.dump`}</Code>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
                <strong>⚠️ Importante:</strong> Copia los respaldos a otro disco o equipo. Un respaldo en la misma máquina no protege de una falla del hardware. Prueba la restauración una vez al mes.
              </div>
            </div>
          </div>

          {/* Comandos útiles */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Terminal size={18} className="text-slate-500" />
              Comandos útiles
            </h3>
            <div className="space-y-3">
              {[
                { cmd: 'docker compose down', desc: 'Detener todos los servicios' },
                { cmd: 'docker compose restart api', desc: 'Reiniciar solo la API' },
                { cmd: 'docker compose logs --tail=100 api', desc: 'Ver últimas 100 líneas de logs' },
                { cmd: 'docker compose exec api python -c "import app; print(app.__version__)"', desc: 'Ver versión de la app' },
                { cmd: 'docker volume ls', desc: 'Listar volúmenes de Docker' },
                { cmd: 'docker system prune -a', desc: 'Limpiar imágenes y contenedores no usados' },
              ].map((item) => (
                <div key={item.cmd} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                  <code className="text-xs text-slate-700 font-mono flex-1 break-all">{item.cmd}</code>
                  <span className="text-xs text-slate-400 flex-shrink-0">{item.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Estructura */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <BookOpen size={18} className="text-slate-500" />
              Estructura del proyecto
            </h3>
            <Code>{`evidencias-iso/
├── docker-compose.yml           # Orquestación principal
├── docker-compose.override.yml  # Configuración de desarrollo
├── .env.example                 # Plantilla de variables de entorno
├── README.md                    # Este archivo
├── docs/
│   ├── arquitectura.md
│   └── decisiones/              # Notas de decisiones técnicas
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── alembic.ini
│   ├── alembic/versions/        # Migraciones de la base de datos
│   ├── app/                     # Código de la API
│   ├── scripts/                 # Scripts de mantenimiento
│   └── tests/                   # Pruebas de la API
├── frontend/
│   ├── Dockerfile
│   ├── Caddyfile
│   ├── package.json
│   └── src/                     # Código del frontend
├── scripts/
│   ├── backup.sh
│   └── restore.sh
└── backups/                     # Respaldos de la base de datos`}</Code>
          </div>

          {/* Licencia */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center">
            <p className="text-sm text-slate-600">
              Proyecto interno para gestión de evidencias ISO 27001
            </p>
            <p className="text-xs text-slate-400 mt-2">
              Documentación técnica · Última actualización: 2024
            </p>
          </div>
        </div>
      )}

      {/* Decisions Tab */}
      {tab === 'decisions' && (
        <div className="space-y-6">
          {/* Intro */}
          <div className="bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-200 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <Lightbulb size={24} className="text-violet-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-violet-900 text-lg mb-1">
                  Notas de decisiones técnicas
                </h3>
                <p className="text-violet-800 text-sm leading-relaxed">
                  Cada nota explica el porqué de una decisión importante. Útil para auditoría, para
                  onboarding de nuevos desarrolladores y para ti dentro de seis meses cuando olvides
                  por qué elegiste X sobre Y.
                </p>
              </div>
            </div>
          </div>

          {/* Decision Cards */}
          <div className="space-y-3">
            <DecisionCard
              icon={<Database size={20} className="text-white" />}
              title="Por qué PostgreSQL"
              filename="docs/decisiones/01-postgresql.md"
              color="bg-gradient-to-br from-violet-500 to-violet-600"
              defaultOpen={true}
            >
              <div className="space-y-3">
                <p>
                  Elegimos PostgreSQL sobre MySQL y SQLite por varias razones:
                </p>
                <ul className="space-y-2 ml-4">
                  <li className="flex gap-2">
                    <span className="text-violet-500">•</span>
                    <span><strong>Vistas materializadas y funciones avanzadas:</strong> necesitamos calcular vencimientos con fechas y intervalos. PostgreSQL tiene <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">make_interval()</code> y <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">timestamptz</code> nativos.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-violet-500">•</span>
                    <span><strong>Confiabilidad y respaldos:</strong> <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">pg_dump</code> y <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">pg_restore</code> son robustos y permiten restauración parcial.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-violet-500">•</span>
                    <span><strong>JSONB:</strong> si necesitamos almacenar metadatos flexibles de archivos, PostgreSQL lo maneja mejor que MySQL.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-violet-500">•</span>
                    <span><strong>Comunidad y soporte:</strong> más documentación, mejores herramientas de administración y mayor adopción en entornos empresariales.</span>
                  </li>
                </ul>
                <div className="bg-violet-50 border border-violet-200 rounded-lg p-3 text-xs text-violet-800">
                  <strong>Alternativa considerada:</strong> MySQL 8.0. Descartada porque las funciones de fecha son menos intuitivas y los respaldos son más complejos.
                </div>
              </div>
            </DecisionCard>

            <DecisionCard
              icon={<Server size={20} className="text-white" />}
              title="Por qué FastAPI"
              filename="docs/decisiones/02-fastapi.md"
              color="bg-gradient-to-br from-blue-500 to-blue-600"
            >
              <div className="space-y-3">
                <p>
                  FastAPI sobre Flask, Django REST Framework y Express (Node.js):
                </p>
                <ul className="space-y-2 ml-4">
                  <li className="flex gap-2">
                    <span className="text-blue-500">•</span>
                    <span><strong>Validación automática con Pydantic:</strong> los datos se validan antes de tocar la base de datos. Menos código, menos errores.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-blue-500">•</span>
                    <span><strong>Documentación interactiva:</strong> Swagger UI en <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">/api/docs</code> sin configuración adicional. Útil para pruebas y para el frontend.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-blue-500">•</span>
                    <span><strong>Tipos de Python:</strong> con type hints, el IDE te ayuda y detectas errores antes de ejecutar.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-blue-500">•</span>
                    <span><strong>Async nativo:</strong> si necesitamos hacer llamadas concurrentes a Microsoft Graph, FastAPI lo soporta sin librerías adicionales.</span>
                  </li>
                </ul>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
                  <strong>Alternativa considerada:</strong> Django REST Framework. Descartado porque es más pesado para una API pequeña y no genera documentación automática tan limpia.
                </div>
              </div>
            </DecisionCard>

            <DecisionCard
              icon={<Code2 size={20} className="text-white" />}
              title="Por qué React + Vite"
              filename="docs/decisiones/03-react-vite.md"
              color="bg-gradient-to-br from-cyan-500 to-cyan-600"
            >
              <div className="space-y-3">
                <p>
                  React con Vite sobre Vue, Svelte y HTMX:
                </p>
                <ul className="space-y-2 ml-4">
                  <li className="flex gap-2">
                    <span className="text-cyan-500">•</span>
                    <span><strong>Ecosistema maduro:</strong> TanStack Query, MSAL, librerías de tablas y calendarios. Todo funciona bien con React.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-cyan-500">•</span>
                    <span><strong>Vite es rápido:</strong> compilación en milisegundos, HMR instantáneo. Mejor experiencia de desarrollo que Webpack.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-cyan-500">•</span>
                    <span><strong>TypeScript nativo:</strong> Vite lo soporta sin configuración. Los tipos generados desde OpenAPI previenen errores.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-cyan-500">•</span>
                    <span><strong>Comunidad grande:</strong> más desarrolladores React que Vue o Svelte. Más fácil contratar o encontrar ayuda.</span>
                  </li>
                </ul>
                <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-3 text-xs text-cyan-800">
                  <strong>Alternativa considerada:</strong> HTMX con Jinja2. Descartada porque la interfaz necesita filas expandibles, tableros interactivos y carga asíncrona compleja. HTMX sería más lento de desarrollar.
                </div>
              </div>
            </DecisionCard>

            <DecisionCard
              icon={<Box size={20} className="text-white" />}
              title="Por qué Docker Compose"
              filename="docs/decisiones/04-docker-compose.md"
              color="bg-gradient-to-br from-slate-600 to-slate-700"
            >
              <div className="space-y-3">
                <p>
                  Docker Compose sobre Kubernetes, VMs tradicionales y instalación manual:
                </p>
                <ul className="space-y-2 ml-4">
                  <li className="flex gap-2">
                    <span className="text-slate-500">•</span>
                    <span><strong>Reproducibilidad:</strong> <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">docker compose up --build</code> levanta todo desde cero. Sin "en mi máquina funciona".</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-slate-500">•</span>
                    <span><strong>Aislamiento:</strong> cada servicio en su contenedor. Si la API falla, la base de datos sigue corriendo.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-slate-500">•</span>
                    <span><strong>Redes internas:</strong> la base de datos no tiene acceso a internet. Solo la API puede hablar con ella.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-slate-500">•</span>
                    <span><strong>Escalabilidad futura:</strong> si crecemos, podemos migrar a Kubernetes sin cambiar el código.</span>
                  </li>
                </ul>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-700">
                  <strong>Alternativa considerada:</strong> Kubernetes. Descartado porque es excesivo para un servidor único con 2 GB de RAM. Docker Compose es suficiente y más simple de operar.
                </div>
              </div>
            </DecisionCard>

            <DecisionCard
              icon={<Globe size={20} className="text-white" />}
              title="Por qué Caddy"
              filename="docs/decisiones/05-caddy.md"
              color="bg-gradient-to-br from-teal-500 to-teal-600"
            >
              <div className="space-y-3">
                <p>
                  Caddy sobre Nginx, Traefik y Apache:
                </p>
                <ul className="space-y-2 ml-4">
                  <li className="flex gap-2">
                    <span className="text-teal-500">•</span>
                    <span><strong>TLS automático:</strong> con <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">tls internal</code> genera certificados para la red local sin configuración manual.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-teal-500">•</span>
                    <span><strong>Configuración simple:</strong> el Caddyfile es más legible que nginx.conf. Proxy inverso en 5 líneas.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-teal-500">•</span>
                    <span><strong>HTTP/2 y HTTP/3:</strong> soporte nativo sin configuración adicional.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-teal-500">•</span>
                    <span><strong>Compresión gzip:</strong> activada con una línea. Mejora el rendimiento del frontend.</span>
                  </li>
                </ul>
                <div className="bg-teal-50 border border-teal-200 rounded-lg p-3 text-xs text-teal-800">
                  <strong>Alternativa considerada:</strong> Nginx. Descartado porque requiere configuración manual de certificados y es más verboso. Caddy es más simple para este caso de uso.
                </div>
              </div>
            </DecisionCard>

            <DecisionCard
              icon={<Key size={20} className="text-white" />}
              title="Por qué Entra ID (Azure AD)"
              filename="docs/decisiones/06-entra-id.md"
              color="bg-gradient-to-br from-rose-500 to-rose-600"
            >
              <div className="space-y-3">
                <p>
                  Entra ID sobre Auth0, Okta y autenticación propia:
                </p>
                <ul className="space-y-2 ml-4">
                  <li className="flex gap-2">
                    <span className="text-rose-500">•</span>
                    <span><strong>SSO corporativo:</strong> los usuarios ya tienen cuentas Microsoft. No necesitan otra contraseña.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-rose-500">•</span>
                    <span><strong>MFA integrado:</strong> si la empresa exige autenticación de dos factores, Entra ID la maneja.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-rose-500">•</span>
                    <span><strong>Grupos y roles:</strong> podemos mapear grupos de Azure AD a roles en la aplicación (admin, auditor, usuario).</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-rose-500">•</span>
                    <span><strong>Auditoría:</strong> los inicios de sesión quedan registrados en Azure AD. Útil para cumplimiento ISO.</span>
                  </li>
                </ul>
                <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-xs text-rose-800">
                  <strong>Alternativa considerada:</strong> Auth0. Descartado porque es un servicio externo adicional y la empresa ya paga por Microsoft 365. Entra ID está incluido.
                </div>
              </div>
            </DecisionCard>

            <DecisionCard
              icon={<Lock size={20} className="text-white" />}
              title="Por qué Sites.Selected (SharePoint)"
              filename="docs/decisiones/07-sites-selected.md"
              color="bg-gradient-to-br from-indigo-500 to-indigo-600"
            >
              <div className="space-y-3">
                <p>
                  Usamos el permiso <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">Sites.Selected</code> en lugar de <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">Sites.ReadWrite.All</code>:
                </p>
                <ul className="space-y-2 ml-4">
                  <li className="flex gap-2">
                    <span className="text-indigo-500">•</span>
                    <span><strong>Principio de menor privilegio:</strong> la app solo puede acceder al sitio específico de evidencias, no a todo SharePoint.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-indigo-500">•</span>
                    <span><strong>Seguridad:</strong> si las credenciales se filtran, el atacante solo accede a un sitio, no a toda la organización.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-indigo-500">•</span>
                    <span><strong>Cumplimiento ISO:</strong> demuestra que aplicamos control de accesos granular (POL-SI-003).</span>
                  </li>
                </ul>
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 text-xs text-indigo-800">
                  <strong>Configuración adicional:</strong> después de registrar la app en Azure AD, un administrador debe conceder acceso al sitio específico con <code className="bg-indigo-100 px-1.5 py-0.5 rounded text-xs">Grant-SPOSiteAppPermission</code>.
                </div>
              </div>
            </DecisionCard>

            <DecisionCard
              icon={<Users size={20} className="text-white" />}
              title="Por qué separar usuarios de la base de datos"
              filename="docs/decisiones/08-db-users.md"
              color="bg-gradient-to-br from-amber-500 to-amber-600"
            >
              <div className="space-y-3">
                <p>
                  Tenemos dos usuarios de PostgreSQL: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">evidencias_owner</code> y <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">evidencias_app</code>:
                </p>
                <ul className="space-y-2 ml-4">
                  <li className="flex gap-2">
                    <span className="text-amber-500">•</span>
                    <span><strong>Separación de responsabilidades:</strong> el owner crea tablas (DDL), la app solo lee y escribe datos (DML).</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-amber-500">•</span>
                    <span><strong>Seguridad:</strong> si la API tiene una vulnerabilidad de inyección SQL, el atacante no puede alterar la estructura de la base.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-amber-500">•</span>
                    <span><strong>Auditoría:</strong> las migraciones las ejecuta el owner, no la app. Así sabemos quién cambió la estructura.</span>
                  </li>
                </ul>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
                  <strong>Implementación:</strong> el script <code className="bg-amber-100 px-1.5 py-0.5 rounded text-xs">db/init/01-roles.sh</code> crea el usuario limitado y le concede solo los permisos necesarios.
                </div>
              </div>
            </DecisionCard>

            <DecisionCard
              icon={<Network size={20} className="text-white" />}
              title="Por qué red interna de Docker"
              filename="docs/decisiones/09-internal-network.md"
              color="bg-gradient-to-br from-emerald-500 to-emerald-600"
            >
              <div className="space-y-3">
                <p>
                  La base de datos está en la red <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">data</code> que es interna (<code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">internal: true</code>):
                </p>
                <ul className="space-y-2 ml-4">
                  <li className="flex gap-2">
                    <span className="text-emerald-500">•</span>
                    <span><strong>Sin acceso a internet:</strong> la base de datos no puede hacer llamadas externas. Si hay una vulnerabilidad, el atacante no puede exfiltrar datos directamente.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-emerald-500">•</span>
                    <span><strong>Solo la API puede hablar con ella:</strong> el contenedor <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">web</code> (Caddy) no tiene acceso a la red <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">data</code>.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-emerald-500">•</span>
                    <span><strong>Puertos no publicados:</strong> en producción, el puerto 5432 no se expone al host. Solo se accede desde dentro de Docker.</span>
                  </li>
                </ul>
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-800">
                  <strong>Excepción:</strong> en desarrollo, el override publica el puerto 5432 en <code className="bg-emerald-100 px-1.5 py-0.5 rounded text-xs">127.0.0.1:5432</code> para conectar DBeaver o psql desde el equipo.
                </div>
              </div>
            </DecisionCard>

            <DecisionCard
              icon={<FileText size={20} className="text-white" />}
              title="Por qué Alembic para migraciones"
              filename="docs/decisiones/10-alembic.md"
              color="bg-gradient-to-br from-purple-500 to-purple-600"
            >
              <div className="space-y-3">
                <p>
                  Alembic sobre migraciones manuales y otros ORMs:
                </p>
                <ul className="space-y-2 ml-4">
                  <li className="flex gap-2">
                    <span className="text-purple-500">•</span>
                    <span><strong>Versionado en Git:</strong> cada cambio de la base de datos es un archivo en <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">alembic/versions/</code>. Cualquiera puede reconstruir la base desde cero.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-purple-500">•</span>
                    <span><strong>Autogenerate:</strong> <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">alembic revision --autogenerate</code> detecta cambios en los modelos de SQLAlchemy y genera la migración automáticamente.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-purple-500">•</span>
                    <span><strong>Rollback:</strong> podemos revertir migraciones con <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">alembic downgrade</code>. Útil si algo sale mal en producción.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-purple-500">•</span>
                    <span><strong>Integración con SQLAlchemy:</strong> funciona perfectamente con el ORM que ya usamos. Sin dependencias adicionales.</span>
                  </li>
                </ul>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-xs text-purple-800">
                  <strong>Flujo de trabajo:</strong> cambias los modelos → ejecutas <code className="bg-purple-100 px-1.5 py-0.5 rounded text-xs">alembic revision --autogenerate</code> → revisas la migración → la subes a Git → <code className="bg-purple-100 px-1.5 py-0.5 rounded text-xs">docker compose up</code> la aplica automáticamente.
                </div>
              </div>
            </DecisionCard>
          </div>

          {/* Resumen */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 text-white">
            <h3 className="font-semibold text-lg mb-3">📝 Resumen de decisiones</h3>
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              {[
                { tech: 'PostgreSQL', reason: 'Vistas, JSONB, respaldos robustos' },
                { tech: 'FastAPI', reason: 'Validación automática, documentación interactiva' },
                { tech: 'React + Vite', reason: 'Ecosistema maduro, TypeScript nativo' },
                { tech: 'Docker Compose', reason: 'Reproducibilidad, aislamiento, redes internas' },
                { tech: 'Caddy', reason: 'TLS automático, configuración simple' },
                { tech: 'Entra ID', reason: 'SSO corporativo, MFA, auditoría' },
                { tech: 'Sites.Selected', reason: 'Principio de menor privilegio' },
                { tech: 'Usuarios separados', reason: 'Seguridad, auditoría de cambios' },
                { tech: 'Red interna', reason: 'Sin acceso a internet, solo API habla con BD' },
                { tech: 'Alembic', reason: 'Versionado en Git, autogenerate, rollback' },
              ].map((item) => (
                <div key={item.tech} className="flex items-start gap-2">
                  <Check size={16} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium text-emerald-400">{item.tech}</span>
                    <span className="text-slate-300"> — {item.reason}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
