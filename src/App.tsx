import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Hero from './components/Hero';
import TechTable from './components/TechTable';
import ArchitectureDiagram from './components/ArchitectureDiagram';
import CodeBlock from './components/CodeBlock';
import Section from './components/Section';
import ProjectStructure from './components/ProjectStructure';
import BuildOrder from './components/BuildOrder';
import AttentionPoints from './components/AttentionPoints';
import DeployGuide from './components/DeployGuide';
import ProjectComposition from './components/ProjectComposition';
import ApiImplementation from './components/ApiImplementation';
import Documentation from './components/Documentation';
import ProjectStatus from './components/ProjectStatus';
import { Menu, X } from 'lucide-react';

function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('intro');

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('[data-section]');
      let current = 'intro';
      sections.forEach((section) => {
        const el = section as HTMLElement;
        const rect = el.getBoundingClientRect();
        if (rect.top <= 120) {
          current = el.dataset.section || 'intro';
        }
      });
      setActiveSection(current);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-white shadow-lg rounded-lg p-2 border border-slate-200"
      >
        {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <Sidebar
        activeSection={activeSection}
        onNavigate={scrollToSection}
        mobileOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main content */}
      <main className="lg:ml-72 px-4 sm:px-8 lg:px-12 pb-20">
        <Hero />

        {/* Section 0: Estado del proyecto */}
        <Section id="estado" number="0" title="Estado del proyecto">
          <ProjectStatus />
        </Section>

        {/* Section 1: Tecnología */}
        <Section id="tecnologia" number="1" title="Tecnología recomendada">
          <p className="text-slate-600 mb-6">
            La siguiente tabla resume la pila tecnológica elegida para el proyecto, con la justificación de cada decisión.
          </p>
          <TechTable />
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800">
              <strong>Alternativa más simple:</strong> si React te parece mucho al principio, puedes usar FastAPI con plantillas Jinja2 y HTMX. 
              Evita el paso de compilar el frontend, a costa de una interfaz menos fluida. La API y la base de datos serían iguales en ambos casos.
            </p>
          </div>
        </Section>

        {/* Section 2: Conexiones */}
        <Section id="conexiones" number="2" title="Cómo se conectan las piezas">
          <ArchitectureDiagram />
          <div className="mt-8 space-y-4">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-sm font-bold">1</span>
              </div>
              <div>
                <h4 className="font-semibold text-slate-800">Un solo origen</h4>
                <p className="text-slate-600 text-sm mt-1">
                  El contenedor <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">web</code> sirve el frontend y reenvía todo lo que empiece por <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">/api/</code> a la API. Para el navegador todo vive en la misma dirección, así que no se configura CORS.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-sm font-bold">2</span>
              </div>
              <div>
                <h4 className="font-semibold text-slate-800">La API valida cada petición</h4>
                <p className="text-slate-600 text-sm mt-1">
                  El frontend obtiene un token de Entra ID con MSAL y lo envía en la cabecera <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">Authorization: Bearer ...</code>. La API comprueba firma, emisor y audiencia, busca al usuario y su rol, y recién entonces responde.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-sm font-bold">3</span>
              </div>
              <div>
                <h4 className="font-semibold text-slate-800">Tipos compartidos</h4>
                <p className="text-slate-600 text-sm mt-1">
                  FastAPI publica su contrato en <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">/api/openapi.json</code>. Con <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">openapi-typescript</code> generas los tipos de TypeScript del frontend a partir de él, y un cambio en la API que rompa la pantalla se detecta al compilar.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-sm font-bold">4</span>
              </div>
              <div>
                <h4 className="font-semibold text-slate-800">La base de datos no se expone</h4>
                <p className="text-slate-600 text-sm mt-1">
                  Solo la API llega a ella, por una red interna de Docker sin salida a internet.
                </p>
              </div>
            </div>
          </div>
        </Section>

        {/* Section 3: Estructura */}
        <Section id="estructura" number="3" title="Estructura del repositorio">
          <ProjectStructure />
        </Section>

        {/* Section 4: Contenedores */}
        <Section id="contenedores" number="4" title="Contenedores">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">docker-compose.yml</h3>
          <CodeBlock language="yaml" code={`name: evidencias-iso

services:
  db:
    image: postgres:17-alpine
    restart: unless-stopped
    environment:
      POSTGRES_DB: \${DB_NAME}
      POSTGRES_USER: \${DB_OWNER}
      POSTGRES_PASSWORD: \${DB_OWNER_PASSWORD}
      DB_APP_USER: \${DB_APP_USER}
      DB_APP_PASSWORD: \${DB_APP_PASSWORD}
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./db/init:/docker-entrypoint-initdb.d:ro
    networks: [data]
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U \${DB_OWNER} -d \${DB_NAME}"]
      interval: 10s
      timeout: 5s
      retries: 5

  migrate:
    build: ./backend
    command: alembic upgrade head
    environment:
      DATABASE_URL: postgresql+psycopg://\${DB_OWNER}:\${DB_OWNER_PASSWORD}@db:5432/\${DB_NAME}
    depends_on:
      db:
        condition: service_healthy
    networks: [data]

  api:
    build: ./backend
    restart: unless-stopped
    env_file: .env
    environment:
      DATABASE_URL: postgresql+psycopg://\${DB_APP_USER}:\${DB_APP_PASSWORD}@db:5432/\${DB_NAME}
    depends_on:
      migrate:
        condition: service_completed_successfully
    networks: [data, edge]

  web:
    build: ./frontend
    restart: unless-stopped
    environment:
      APP_HOST: \${APP_HOST}
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - caddy_data:/data
    depends_on: [api]
    networks: [edge]

networks:
  data:
    internal: true
  edge:

volumes:
  pgdata:
  caddy_data:`} />

          <div className="mt-8 space-y-3">
            <h4 className="font-semibold text-slate-800">Puntos importantes:</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex gap-2">
                <span className="text-emerald-500 mt-0.5">•</span>
                <span>La base de datos está solo en la red <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">data</code>, que es interna: nada fuera de Docker la alcanza.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-emerald-500 mt-0.5">•</span>
                <span><code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">migrate</code> usa el usuario dueño de la base para crear tablas. La API usa un usuario limitado que solo puede leer y escribir datos, no alterar la estructura.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-emerald-500 mt-0.5">•</span>
                <span>Solo <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">web</code> publica puertos al exterior.</span>
              </li>
            </ul>
          </div>

          <div className="mt-10">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">db/init/01-roles.sh</h3>
            <CodeBlock language="bash" code={`#!/bin/sh
set -e
psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB" <<SQL
CREATE ROLE \${DB_APP_USER} LOGIN PASSWORD '\${DB_APP_PASSWORD}';
GRANT CONNECT ON DATABASE \${POSTGRES_DB} TO \${DB_APP_USER};
GRANT USAGE ON SCHEMA public TO \${DB_APP_USER};
ALTER DEFAULT PRIVILEGES FOR ROLE \${POSTGRES_USER} IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO \${DB_APP_USER};
ALTER DEFAULT PRIVILEGES FOR ROLE \${POSTGRES_USER} IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO \${DB_APP_USER};
SQL`} />
            <p className="mt-3 text-sm text-slate-500 italic">
              Este script solo se ejecuta la primera vez que se crea el volumen de datos.
            </p>
          </div>

          <div className="mt-10">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">backend/Dockerfile</h3>
            <CodeBlock language="dockerfile" code={`FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
RUN useradd -m app && chown -R app /app
USER app
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]`} />
          </div>

          <div className="mt-10">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">frontend/Dockerfile</h3>
            <CodeBlock language="dockerfile" code={`FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM caddy:2-alpine
COPY --from=build /app/dist /srv
COPY Caddyfile /etc/caddy/Caddyfile`} />
          </div>

          <div className="mt-10">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">frontend/Caddyfile</h3>
            <CodeBlock language="text" code={`{$APP_HOST} {
  tls internal
  encode gzip
  handle /api/* {
    reverse_proxy api:8000
  }
  handle {
    root * /srv
    try_files {path} /index.html
    file_server
  }
}`} />
            <p className="mt-3 text-sm text-slate-500 italic">
              Dentro de FastAPI, los routers deben llevar el prefijo <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">/api</code>.
            </p>
          </div>

          <div className="mt-10">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">.env.example</h3>
            <CodeBlock language="bash" code={`APP_HOST=evidencias.lan
DB_NAME=evidencias
DB_OWNER=evidencias_owner
DB_OWNER_PASSWORD=cambiar-esto
DB_APP_USER=evidencias_app
DB_APP_PASSWORD=cambiar-esto
ENTRA_TENANT_ID=
ENTRA_CLIENT_ID=
GRAPH_CLIENT_ID=
GRAPH_CLIENT_SECRET=
SP_SITE_ID=
SP_DRIVE_ID=
AUTH_DISABLED=false`} />
          </div>

          <div className="mt-10">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">docker-compose.override.yml (solo para desarrollo)</h3>
            <CodeBlock language="yaml" code={`services:
  api:
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
    volumes:
      - ./backend:/app
    environment:
      AUTH_DISABLED: "true"
    ports:
      - "8000:8000"
  db:
    networks: [data, edge]
    ports:
      - "127.0.0.1:5432:5432"`} />
            <p className="mt-3 text-sm text-slate-500 italic">
              En desarrollo ejecuta el frontend con <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">npm run dev</code> (Vite) y un proxy de <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">/api</code> hacia <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">localhost:8000</code>.
            </p>
          </div>
        </Section>

        {/* Section 5: Base de datos */}
        <Section id="base-datos" number="5" title="Gestión de la base de datos">
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-3">Migraciones</h3>
              <p className="text-slate-600 text-sm">
                Toda modificación de tablas se hace con Alembic (<code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">alembic revision --autogenerate -m "descripción"</code>) y se sube a Git. 
                Nunca se altera la base a mano: así cualquiera reconstruye la base desde cero y el historial es evidencia de control de cambios.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-3">Carga inicial</h3>
              <p className="text-slate-600 text-sm">
                <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">scripts/import_excel.py</code> lee <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">Seguimiento_Evidencias_ISO27001.xlsx</code> y carga políticas, controles y requisitos. 
                Debe poder ejecutarse varias veces sin duplicar datos: busca cada registro por su código (<code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">POL-SI-005</code>, <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">EV-021</code>) y lo actualiza si ya existe.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-3">Vista de vencimientos</h3>
              <p className="text-slate-600 text-sm mb-3">
                El cálculo de próxima fecha y alerta vive en la base como una vista, para que el tablero, la exportación y el calendario coincidan:
              </p>
              <CodeBlock language="sql" code={`CREATE VIEW v_requirement_status AS
SELECT r.id, r.code, r.policy_code, r.control_id, r.title, r.frequency,
       s.evidence_date AS last_date,
       (s.evidence_date + make_interval(months => m.months))::date AS next_due,
       CASE
         WHEN s.id IS NULL THEN 'Pendiente'
         WHEN m.months IS NULL THEN 'Vigente'
         WHEN s.evidence_date + make_interval(months => m.months) < CURRENT_DATE
              THEN 'Vencida'
         WHEN s.evidence_date + make_interval(months => m.months)
              <= CURRENT_DATE + 30 THEN 'Por vencer'
         ELSE 'Vigente'
       END AS alert
FROM requirements r
LEFT JOIN LATERAL (
  SELECT id, evidence_date FROM submissions
  WHERE requirement_id = r.id AND status = 'Completa'
  ORDER BY evidence_date DESC LIMIT 1
) s ON true
LEFT JOIN (VALUES
  ('Mensual',1),('Trimestral',3),('Semestral',6),('Anual',12),('Continua',1)
) AS m(freq, months) ON m.freq = r.frequency;`} />
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-3">Índices recomendados</h3>
              <CodeBlock language="sql" code={`CREATE INDEX idx_submissions_req_date 
  ON submissions(requirement_id, evidence_date DESC);
CREATE INDEX idx_attachments_submission 
  ON attachments(submission_id);
CREATE INDEX idx_audit_log_at 
  ON audit_log(at);
CREATE INDEX idx_requirements_policy 
  ON requirements(policy_code);`} />
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-3">Reglas de datos</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex gap-2">
                  <span className="text-emerald-500 mt-0.5">•</span>
                  <span>Guardar fechas con zona horaria (<code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">timestamptz</code>) en UTC y mostrarlas en la hora local en la interfaz.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-emerald-500 mt-0.5">•</span>
                  <span>No borrar entregas. Cambiarles el estado y dejar el rastro en <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">audit_log</code>.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-emerald-500 mt-0.5">•</span>
                  <span>Separar los datos de desarrollo y producción: otro volumen y otro <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">.env</code>.</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-3">Respaldos</h3>
              <CodeBlock language="bash" code={`#!/bin/sh
set -e
mkdir -p backups
docker compose exec -T db pg_dump -U "$DB_OWNER" -Fc "$DB_NAME" \\
  > "backups/evidencias_$(date +%F).dump"
find backups -name 'evidencias_*.dump' -mtime +14 -delete`} />
              <p className="mt-3 text-sm text-slate-600">
                Programa este script con <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">cron</code> a diario. Restaurar:
              </p>
              <CodeBlock language="bash" code={`docker compose exec -T db pg_restore -U "$DB_OWNER" -d "$DB_NAME" \\
  --clean --if-exists < backups/evidencias_AAAA-MM-DD.dump`} />
              <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Dos recomendaciones:</strong> copia los volcados a otro disco o equipo (un respaldo en la misma máquina no protege de una falla del equipo) y prueba la restauración una vez al mes en una base vacía, guardando el acta. Esa prueba sirve también como evidencia del control 8.13.
                </p>
              </div>
            </div>
          </div>
        </Section>

        {/* Section 6: Gestión del proyecto */}
        <Section id="gestion" number="6" title="Cómo gestionar el proyecto">
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-3">Repositorio</h3>
              <p className="text-slate-600 text-sm">
                Un solo repositorio Git (<code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">backend</code> y <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">frontend</code> juntos) en GitHub, GitLab o un Gitea en tu servidor. 
                Rama <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">main</code> siempre funcional, una rama por tarea y cambios pequeños. Etiqueta las versiones (<code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">v0.1</code>, <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">v0.2</code>).
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-3">Tablero</h3>
              <p className="text-slate-600 text-sm">
                Usa tu propio Kanban o GitHub Projects. Un hito por fase del plan (1 a 4) y una tarjeta por funcionalidad pequeña, por ejemplo "listar requisitos de una política" o "subir adjunto".
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-3">Definición de terminado</h3>
              <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-3">
                {[
                  'Funciona con docker compose up --build desde cero.',
                  'Si cambia la base de datos, incluye su migración.',
                  'Tiene al menos una prueba cuando hay lógica (fechas, permisos).',
                  'El README o los documentos están al día.',
                ].map((item, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <div className="flex-shrink-0 w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center">
                      <span className="text-emerald-600 text-xs font-bold">{i + 1}</span>
                    </div>
                    <span className="text-sm text-slate-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-3">Documentación</h3>
              <p className="text-slate-600 text-sm">
                <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">README.md</code> con los comandos para levantar, probar y respaldar. En <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">docs/decisiones/</code> una nota corta por decisión importante (por ejemplo "por qué PostgreSQL" o "por qué Sites.Selected"). Es útil para auditoría y para ti dentro de seis meses.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-3">Pruebas que más valen la pena</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex gap-2">
                  <span className="text-violet-500 mt-0.5">▸</span>
                  <span>Cálculo de vencimientos por frecuencia.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-violet-500 mt-0.5">▸</span>
                  <span>Que cada rol solo pueda hacer lo que debe (el auditor no puede escribir).</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-violet-500 mt-0.5">▸</span>
                  <span>Que una subida a SharePoint fallida no deje un adjunto "fantasma" en la base de datos.</span>
                </li>
              </ul>
            </div>
          </div>
        </Section>

        {/* Section 7: Orden de construcción */}
        <Section id="orden" number="7" title="Orden de construcción">
          <BuildOrder />
        </Section>

        {/* Section 8: Puntos de atención */}
        <Section id="atencion" number="8" title="Puntos de atención">
          <AttentionPoints />
        </Section>

        {/* Section 9: Composición del proyecto */}
        <Section id="composicion" number="9" title="Cómo se compone el proyecto">
          <ProjectComposition />
        </Section>

        {/* Section 10: Implementación de la API */}
        <Section id="api" number="10" title="Implementación de la API">
          <ApiImplementation />
        </Section>

        {/* Section 11: Despliegue */}
        <Section id="despliegue" number="11" title="Cómo desplegar el proyecto">
          <DeployGuide />
        </Section>

        {/* Section 12: Documentación */}
        <Section id="documentacion" number="12" title="README.md y notas de decisiones">
          <Documentation />
        </Section>

        {/* Footer */}
        <footer className="mt-20 pt-8 border-t border-slate-200 text-center text-sm text-slate-400">
          <p>Guía del Proyecto Web de Evidencias ISO 27001</p>
          <p className="mt-1">Documentación técnica para implementación con Docker</p>
        </footer>
      </main>
    </div>
  );
}

export default App;
