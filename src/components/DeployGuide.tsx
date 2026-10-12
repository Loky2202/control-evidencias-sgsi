import { useState } from 'react';
import {
  Terminal,
  Download,
  Settings,
  Play,
  CheckCircle2,
  Key,
  Cloud,
  MonitorCheck,
  Wrench,
  ChevronDown,
  ChevronRight,
  Copy,
  Check,
  AlertCircle,
  Info,
} from 'lucide-react';

interface StepProps {
  number: number;
  title: string;
  icon: React.ReactNode;
  color: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function Step({ number, title, icon, color, children, defaultOpen = false }: StepProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-4 p-5 text-left hover:bg-slate-50 transition-colors"
      >
        <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400">PASO {number}</span>
          </div>
          <h3 className="font-semibold text-slate-800 text-lg">{title}</h3>
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

function Cmd({ children }: { children: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative group">
      <div className="bg-slate-900 rounded-lg p-4 pr-12 font-mono text-sm text-slate-200 overflow-x-auto">
        <span className="text-emerald-400">$</span> {children}
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

function Tip({ type = 'info', children }: { type?: 'info' | 'warning'; children: React.ReactNode }) {
  const styles =
    type === 'warning'
      ? 'bg-amber-50 border-amber-200 text-amber-800'
      : 'bg-blue-50 border-blue-200 text-blue-800';
  const Icon = type === 'warning' ? AlertCircle : Info;
  return (
    <div className={`flex gap-3 p-4 rounded-lg border text-sm ${styles}`}>
      <Icon size={18} className="flex-shrink-0 mt-0.5" />
      <div>{children}</div>
    </div>
  );
}

export default function DeployGuide() {
  return (
    <div className="space-y-8">
      {/* Intro */}
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-6">
        <h3 className="font-semibold text-emerald-900 text-lg mb-2">
          🚀 Despliegue completo en Docker
        </h3>
        <p className="text-emerald-800 text-sm leading-relaxed">
          Esta guía te lleva desde cero hasta tener la aplicación funcionando en tu equipo local o servidor.
          Todo corre en contenedores Docker, así que solo necesitas instalar Docker y seguir los pasos.
        </p>
      </div>

      {/* Prerrequisitos */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <MonitorCheck size={20} className="text-emerald-500" />
          Prerrequisitos
        </h3>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { name: 'Docker Engine', version: '24+', note: 'o Docker Desktop' },
            { name: 'Docker Compose', version: 'v2+', note: 'incluido en Docker Desktop' },
            { name: 'Git', version: '2.30+', note: 'para clonar el repositorio' },
            { name: 'Navegador moderno', version: '', note: 'Chrome, Firefox, Edge' },
          ].map((req) => (
            <div
              key={req.name}
              className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100"
            >
              <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0" />
              <div>
                <p className="font-medium text-slate-800 text-sm">
                  {req.name} {req.version && <span className="text-emerald-600">({req.version})</span>}
                </p>
                <p className="text-xs text-slate-500">{req.note}</p>
              </div>
            </div>
          ))}
        </div>
        <Tip type="info">
          <div>
            <strong>Verifica tu instalación:</strong> ejecuta{' '}
            <code className="bg-blue-100 px-1.5 py-0.5 rounded text-xs">docker --version</code> y{' '}
            <code className="bg-blue-100 px-1.5 py-0.5 rounded text-xs">docker compose version</code> en
            tu terminal.
          </div>
        </Tip>
      </div>

      {/* Steps */}
      <div className="space-y-4">
        <Step
          number={1}
          title="Clonar el repositorio"
          icon={<Download size={22} className="text-white" />}
          color="bg-gradient-to-br from-blue-500 to-blue-600"
          defaultOpen={true}
        >
          <div className="space-y-4 pt-4">
            <p className="text-sm text-slate-600">
              Clona el proyecto desde tu repositorio Git (GitHub, GitLab o Gitea):
            </p>
            <Cmd>git clone https://github.com/tu-organizacion/evidencias-iso.git</Cmd>
            <Cmd>cd evidencias-iso</Cmd>
            <p className="text-sm text-slate-600">
              Si aún no tienes el repositorio remoto, puedes inicializar uno localmente:
            </p>
            <Cmd>git init evidencias-iso && cd evidencias-iso</Cmd>
          </div>
        </Step>

        <Step
          number={2}
          title="Configurar variables de entorno"
          icon={<Settings size={22} className="text-white" />}
          color="bg-gradient-to-br from-violet-500 to-violet-600"
        >
          <div className="space-y-4 pt-4">
            <p className="text-sm text-slate-600">
              Copia la plantilla de ejemplo y edítala con tus valores reales:
            </p>
            <Cmd>cp .env.example .env</Cmd>
            <p className="text-sm text-slate-600">
              Abre el archivo <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">.env</code> y
              completa al menos estos campos:
            </p>
            <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm text-slate-200 overflow-x-auto">
              <div>
                <span className="text-slate-500"># Host de la aplicación (nombre de dominio o IP)</span>
              </div>
              <div>
                <span className="text-emerald-400">APP_HOST</span>=evidencias.lan
              </div>
              <div className="mt-2">
                <span className="text-slate-500"># Nombre de la base de datos</span>
              </div>
              <div>
                <span className="text-emerald-400">DB_NAME</span>=evidencias
              </div>
              <div className="mt-2">
                <span className="text-slate-500"># Usuario administrador de la BD</span>
              </div>
              <div>
                <span className="text-emerald-400">DB_OWNER</span>=evidencias_owner
              </div>
              <div>
                <span className="text-emerald-400">DB_OWNER_PASSWORD</span>=
                <span className="text-amber-300">[genera-una-contraseña-segura]</span>
              </div>
              <div className="mt-2">
                <span className="text-slate-500"># Usuario limitado para la API</span>
              </div>
              <div>
                <span className="text-emerald-400">DB_APP_USER</span>=evidencias_app
              </div>
              <div>
                <span className="text-emerald-400">DB_APP_PASSWORD</span>=
                <span className="text-amber-300">[genera-otra-contraseña]</span>
              </div>
            </div>
            <Tip type="warning">
              <div>
                <strong>Genera contraseñas seguras.</strong> Puedes usar:{' '}
                <code className="bg-amber-100 px-1.5 py-0.5 rounded text-xs">
                  openssl rand -base64 24
                </code>
                . El archivo <code className="bg-amber-100 px-1.5 py-0.5 rounded text-xs">.env</code> NO
                debe subirse a Git (ya está en .gitignore).
              </div>
            </Tip>
          </div>
        </Step>

        <Step
          number={3}
          title="Construir y levantar los contenedores"
          icon={<Play size={22} className="text-white" />}
          color="bg-gradient-to-br from-emerald-500 to-teal-600"
        >
          <div className="space-y-4 pt-4">
            <p className="text-sm text-slate-600">
              Este comando construye las imágenes de Docker y levanta todos los servicios (base de datos,
              migraciones, API y frontend):
            </p>
            <Cmd>docker compose up --build -d</Cmd>
            <p className="text-sm text-slate-600">
              Verifica que todos los contenedores estén corriendo:
            </p>
            <Cmd>docker compose ps</Cmd>
            <p className="text-sm text-slate-600">Deberías ver algo como:</p>
            <div className="bg-slate-900 rounded-lg p-4 font-mono text-xs text-slate-200 overflow-x-auto">
              <div>NAME               STATUS</div>
              <div>
                evidencias-iso-db-1        <span className="text-emerald-400">Up (healthy)</span>
              </div>
              <div>
                evidencias-iso-migrate-1   <span className="text-emerald-400">Exited (0)</span>
              </div>
              <div>
                evidencias-iso-api-1       <span className="text-emerald-400">Up</span>
              </div>
              <div>
                evidencias-iso-web-1       <span className="text-emerald-400">Up</span>
              </div>
            </div>
            <Tip type="info">
              <div>
                El contenedor <code className="bg-blue-100 px-1.5 py-0.5 rounded text-xs">migrate</code>{' '}
                termina automáticamente después de aplicar las migraciones. Es normal que aparezca como
                "Exited (0)".
              </div>
            </Tip>
          </div>
        </Step>

        <Step
          number={4}
          title="Verificar que la aplicación funciona"
          icon={<CheckCircle2 size={22} className="text-white" />}
          color="bg-gradient-to-br from-cyan-500 to-cyan-600"
        >
          <div className="space-y-4 pt-4">
            <p className="text-sm text-slate-600">Abre tu navegador y verifica estos puntos:</p>
            <div className="space-y-3">
              {[
                {
                  url: 'https://evidencias.lan',
                  desc: 'Frontend (la aplicación)',
                  status: 'Debe cargar la pantalla principal',
                },
                {
                  url: 'https://evidencias.lan/api/docs',
                  desc: 'Documentación de la API (Swagger)',
                  status: 'Debe mostrar la interfaz interactiva de FastAPI',
                },
                {
                  url: 'https://evidencias.lan/api/openapi.json',
                  desc: 'Contrato OpenAPI',
                  status: 'Debe devolver un JSON con todos los endpoints',
                },
              ].map((check) => (
                <div
                  key={check.url}
                  className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-100"
                >
                  <code className="text-xs text-emerald-600 font-mono flex-shrink-0">{check.url}</code>
                  <span className="text-xs text-slate-400 hidden sm:inline">—</span>
                  <span className="text-sm text-slate-600">{check.desc}</span>
                </div>
              ))}
            </div>
            <Tip type="warning">
              <div>
                <strong>Importante:</strong> la primera vez verás una advertencia de certificado. Esto es
                normal porque Caddy genera un certificado interno (<code className="bg-amber-100 px-1.5 py-0.5 rounded text-xs">tls internal</code>). 
                Debes confiar en el certificado raíz de Caddy en cada equipo que use la aplicación, o usar un dominio público con Let's Encrypt.
              </div>
            </Tip>
            <p className="text-sm text-slate-600">Si algo falla, revisa los logs:</p>
            <Cmd>docker compose logs api</Cmd>
            <Cmd>docker compose logs web</Cmd>
          </div>
        </Step>

        <Step
          number={5}
          title="Cargar datos iniciales"
          icon={<Download size={22} className="text-white" />}
          color="bg-gradient-to-br from-orange-500 to-orange-600"
        >
          <div className="space-y-4 pt-4">
            <p className="text-sm text-slate-600">
              Coloca tu archivo Excel de seguimiento en la carpeta <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">backend/scripts/</code> y ejecuta el script de importación:
            </p>
            <Cmd>docker compose exec api python scripts/import_excel.py</Cmd>
            <p className="text-sm text-slate-600">
              Verifica que los 59 requisitos se cargaron correctamente:
            </p>
            <Cmd>docker compose exec db psql -U evidencias_owner -d evidencias -c "SELECT count(*) FROM requirements;"</Cmd>
            <Tip type="info">
              <div>
                El script es idempotente: puedes ejecutarlo varias veces sin duplicar datos. Busca cada
                registro por su código y lo actualiza si ya existe.
              </div>
            </Tip>
          </div>
        </Step>

        <Step
          number={6}
          title="Configurar Entra ID (opcional, para login)"
          icon={<Key size={22} className="text-white" />}
          color="bg-gradient-to-br from-rose-500 to-rose-600"
        >
          <div className="space-y-4 pt-4">
            <p className="text-sm text-slate-600">
              Si quieres que los usuarios inicien sesión con sus cuentas de Microsoft:
            </p>
            <ol className="space-y-3 text-sm text-slate-600">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-rose-100 rounded-full flex items-center justify-center text-xs font-bold text-rose-600">1</span>
                <span>Ve al <strong>portal de Azure</strong> → Azure Active Directory → App registrations → New registration.</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-rose-100 rounded-full flex items-center justify-center text-xs font-bold text-rose-600">2</span>
                <span>Registra una aplicación de tipo <strong>Single-page application (SPA)</strong>.</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-rose-100 rounded-full flex items-center justify-center text-xs font-bold text-rose-600">3</span>
                <span>Agrega la URI de redirección: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">https://evidencias.lan/</code></span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-rose-100 rounded-full flex items-center justify-center text-xs font-bold text-rose-600">4</span>
                <span>Copia el <strong>Tenant ID</strong> y el <strong>Client ID</strong> al archivo <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">.env</code>.</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-rose-100 rounded-full flex items-center justify-center text-xs font-bold text-rose-600">5</span>
                <span>Reinicia los contenedores: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">docker compose restart api web</code></span>
              </li>
            </ol>
            <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm text-slate-200 overflow-x-auto">
              <div>
                <span className="text-emerald-400">ENTRA_TENANT_ID</span>=tu-tenant-id
              </div>
              <div>
                <span className="text-emerald-400">ENTRA_CLIENT_ID</span>=tu-client-id
              </div>
            </div>
            <Tip type="info">
              <div>
                <strong>Para desarrollo</strong> puedes dejar <code className="bg-blue-100 px-1.5 py-0.5 rounded text-xs">AUTH_DISABLED=true</code> en el override y usar un usuario falso. Nunca lo actives en producción.
              </div>
            </Tip>
          </div>
        </Step>

        <Step
          number={7}
          title="Configurar SharePoint (opcional, para archivos)"
          icon={<Cloud size={22} className="text-white" />}
          color="bg-gradient-to-br from-indigo-500 to-indigo-600"
        >
          <div className="space-y-4 pt-4">
            <p className="text-sm text-slate-600">
              Para que los adjuntos se guarden en SharePoint:
            </p>
            <ol className="space-y-3 text-sm text-slate-600">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center text-xs font-bold text-indigo-600">1</span>
                <span>En Azure AD, registra otra aplicación (o usa la misma) con los permisos <strong>Sites.Selected</strong> de Microsoft Graph.</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center text-xs font-bold text-indigo-600">2</span>
                <span>Obtén el <strong>Site ID</strong> y <strong>Drive ID</strong> del sitio de SharePoint.</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center text-xs font-bold text-indigo-600">3</span>
                <span>Genera un <strong>Client Secret</strong> y agrégalo al <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">.env</code>.</span>
              </li>
            </ol>
            <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm text-slate-200 overflow-x-auto">
              <div>
                <span className="text-emerald-400">GRAPH_CLIENT_ID</span>=tu-graph-client-id
              </div>
              <div>
                <span className="text-emerald-400">GRAPH_CLIENT_SECRET</span>=tu-secret
              </div>
              <div>
                <span className="text-emerald-400">SP_SITE_ID</span>=tu-site-id
              </div>
              <div>
                <span className="text-emerald-400">SP_DRIVE_ID</span>=tu-drive-id
              </div>
            </div>
          </div>
        </Step>

        <Step
          number={8}
          title="Programar respaldos automáticos"
          icon={<Wrench size={22} className="text-white" />}
          color="bg-gradient-to-br from-slate-600 to-slate-700"
        >
          <div className="space-y-4 pt-4">
            <p className="text-sm text-slate-600">
              Programa el script de respaldo con <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">cron</code> para que se ejecute diariamente:
            </p>
            <Cmd>crontab -e</Cmd>
            <p className="text-sm text-slate-600">Agrega esta línea para respaldar a las 2:00 AM cada día:</p>
            <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm text-slate-200 overflow-x-auto">
              <div>
                <span className="text-slate-500"># Respaldo diario a las 2:00 AM</span>
              </div>
              <div>
                <span className="text-amber-300">0 2 * * *</span> cd /ruta/al/proyecto && ./scripts/backup.sh
              </div>
            </div>
            <p className="text-sm text-slate-600">
              Para restaurar un respaldo:
            </p>
            <Cmd>docker compose exec -T db pg_restore -U "$DB_OWNER" -d "$DB_NAME" --clean --if-exists &lt; backups/evidencias_2024-01-15.dump</Cmd>
            <Tip type="warning">
              <div>
                <strong>Copia los respaldos a otro disco o equipo.</strong> Un respaldo en la misma máquina no protege de una falla del hardware. Prueba la restauración una vez al mes.
              </div>
            </Tip>
          </div>
        </Step>
      </div>

      {/* Comandos rápidos */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Terminal size={20} className="text-emerald-500" />
          Comandos rápidos de referencia
        </h3>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { cmd: 'docker compose up -d', desc: 'Levantar servicios' },
            { cmd: 'docker compose down', desc: 'Detener servicios' },
            { cmd: 'docker compose restart api', desc: 'Reiniciar solo la API' },
            { cmd: 'docker compose logs -f api', desc: 'Ver logs en vivo' },
            { cmd: 'docker compose exec api bash', desc: 'Entrar al contenedor' },
            { cmd: 'docker compose ps', desc: 'Ver estado de contenedores' },
            { cmd: 'docker compose up --build', desc: 'Reconstruir y levantar' },
            { cmd: 'docker volume ls', desc: 'Ver volúmenes de datos' },
          ].map((item) => (
            <div
              key={item.cmd}
              className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 hover:border-emerald-200 transition-colors"
            >
              <code className="text-xs text-slate-700 font-mono truncate mr-2">{item.cmd}</code>
              <span className="text-xs text-slate-400 flex-shrink-0">{item.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Troubleshooting */}
      <div className="bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-200 rounded-xl p-6">
        <h3 className="font-semibold text-rose-900 text-lg mb-4 flex items-center gap-2">
          <AlertCircle size={20} className="text-rose-500" />
          Solución de problemas comunes
        </h3>
        <div className="space-y-4">
          {[
            {
              problem: 'El contenedor de la base de datos no inicia',
              solution: 'Verifica que el volumen no esté corrupto: docker compose down -v (¡borra los datos!) y vuelve a levantar.',
            },
            {
              problem: 'Error de certificado en el navegador',
              solution: 'Es normal con tls internal. Importa el certificado raíz de Caddy o usa un dominio público con Let\'s Encrypt.',
            },
            {
              problem: 'La API no conecta con la base de datos',
              solution: 'Verifica que el contenedor migrate haya terminado exitosamente: docker compose logs migrate',
            },
            {
              problem: 'El frontend no carga',
              solution: 'Revisa que el Caddyfile tenga el APP_HOST correcto y que el DNS resuelva a tu servidor.',
            },
          ].map((item, i) => (
            <div key={i} className="bg-white/70 rounded-lg p-4 border border-rose-100">
              <p className="font-medium text-rose-800 text-sm">❓ {item.problem}</p>
              <p className="text-sm text-slate-600 mt-1">💡 {item.solution}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Resumen final */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 text-white">
        <h3 className="font-semibold text-lg mb-3">✅ Resumen del despliegue</h3>
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <p className="text-slate-300">
              <span className="text-emerald-400 font-mono">1.</span> Clonar repositorio
            </p>
            <p className="text-slate-300">
              <span className="text-emerald-400 font-mono">2.</span> Configurar .env
            </p>
            <p className="text-slate-300">
              <span className="text-emerald-400 font-mono">3.</span> docker compose up --build -d
            </p>
            <p className="text-slate-300">
              <span className="text-emerald-400 font-mono">4.</span> Verificar en el navegador
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-slate-300">
              <span className="text-emerald-400 font-mono">5.</span> Cargar datos iniciales
            </p>
            <p className="text-slate-300">
              <span className="text-emerald-400 font-mono">6.</span> Configurar Entra ID (opcional)
            </p>
            <p className="text-slate-300">
              <span className="text-emerald-400 font-mono">7.</span> Configurar SharePoint (opcional)
            </p>
            <p className="text-slate-300">
              <span className="text-emerald-400 font-mono">8.</span> Programar respaldos
            </p>
          </div>
        </div>
        <div className="mt-5 pt-4 border-t border-slate-700">
          <p className="text-slate-400 text-xs">
            Con estos 8 pasos tendrás la aplicación completamente funcional. Los pasos 6 y 7 son opcionales si solo necesitas la gestión interna de evidencias.
          </p>
        </div>
      </div>
    </div>
  );
}
