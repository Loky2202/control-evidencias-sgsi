import { useState } from 'react';
import { Shield, Menu, X } from 'lucide-react';

function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                <Shield size={20} className="text-white" />
              </div>
              <div>
                <h1 className="font-bold text-slate-800">Evidencias ISO 27001</h1>
                <p className="text-xs text-slate-400">Guía del Proyecto</p>
              </div>
            </div>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            Sistema de Gestión de Evidencias ISO 27001
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Aplicación web completa para gestionar el cumplimiento de controles ISO 27001 
            con FastAPI, React, PostgreSQL y Docker.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {[
            {
              title: 'Gestión de Políticas',
              description: 'CRUD completo de políticas de seguridad con versionado',
              icon: '📋',
            },
            {
              title: 'Seguimiento de Requisitos',
              description: 'Cálculo automático de vencimientos y estados',
              icon: '✅',
            },
            {
              title: 'Flujo de Aprobación',
              description: 'Sistema de aprobación con roles (usuario/auditor/admin)',
              icon: '🔄',
            },
            {
              title: 'Declaración de Aplicabilidad',
              description: 'SoA con mapeo de controles ISO 27001',
              icon: '📊',
            },
            {
              title: 'Auditoría Completa',
              description: 'Logs inmutables con IP, user-agent y contexto',
              icon: '🔒',
            },
            {
              title: 'Política de Retención',
              description: 'Gestión del ciclo de vida de evidencias',
              icon: '🗂️',
            },
          ].map((feature, i) => (
            <div key={i} className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-3">{feature.icon}</div>
              <h3 className="font-semibold text-slate-800 mb-2">{feature.title}</h3>
              <p className="text-sm text-slate-600">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Tech Stack */}
        <div className="bg-white rounded-xl p-8 border border-slate-200 mb-16">
          <h3 className="text-2xl font-bold text-slate-800 mb-6 text-center">
            Stack Tecnológico
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'Backend', tech: 'FastAPI + Python 3.12', color: 'blue' },
              { name: 'Frontend', tech: 'React + Vite + TypeScript', color: 'cyan' },
              { name: 'Base de Datos', tech: 'PostgreSQL 17', color: 'violet' },
              { name: 'Infraestructura', tech: 'Docker + Docker Compose', color: 'slate' },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className={`inline-block px-4 py-2 rounded-lg bg-${item.color}-100 text-${item.color}-700 font-semibold mb-2`}>
                  {item.name}
                </div>
                <p className="text-sm text-slate-600">{item.tech}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Documentation Links */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-8 border border-emerald-200">
          <h3 className="text-2xl font-bold text-slate-800 mb-6 text-center">
            Documentación
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-slate-800 mb-3">📝 Notas de Decisiones</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><a href="/docs/decisiones/01-postgresql.md" className="hover:text-emerald-600">Por qué PostgreSQL</a></li>
                <li><a href="/docs/decisiones/02-fastapi.md" className="hover:text-emerald-600">Por qué FastAPI</a></li>
                <li><a href="/docs/decisiones/03-react-vite-typescript.md" className="hover:text-emerald-600">Por qué React + Vite + TypeScript</a></li>
                <li><a href="/docs/decisiones/04-docker-compose.md" className="hover:text-emerald-600">Por qué Docker Compose</a></li>
                <li><a href="/docs/decisiones/05-entra-id-sites-selected.md" className="hover:text-emerald-600">Por qué Entra ID y Sites.Selected</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-800 mb-3">🔄 Flujos de Trabajo</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><a href="/docs/workflows/approval-flow.md" className="hover:text-emerald-600">Flujo de Aprobación de Evidencias</a></li>
                <li><a href="/docs/workflows/roles.md" className="hover:text-emerald-600">Roles y Permisos</a></li>
              </ul>
              <h4 className="font-semibold text-slate-800 mb-3 mt-6">📚 Políticas</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><a href="/docs/policies/retention-policy.md" className="hover:text-emerald-600">Política de Retención</a></li>
                <li><a href="/docs/security/entra-id-setup.md" className="hover:text-emerald-600">Configuración de Seguridad</a></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Quick Start */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold text-slate-800 mb-4">
            ¿Listo para comenzar?
          </h3>
          <p className="text-slate-600 mb-6">
            Consulta el README principal para instrucciones de instalación y despliegue.
          </p>
          <a
            href="/README.md"
            className="inline-block px-6 py-3 bg-emerald-500 text-white rounded-lg font-semibold hover:bg-emerald-600 transition-colors"
          >
            Ver README
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-slate-500">
            <p>Evidencias ISO 27001 - Sistema de Gestión de Cumplimiento</p>
            <p className="mt-2">Desarrollado con ❤️ para el cumplimiento ISO 27001</p>
            <p className="mt-2">Licencia MIT © 2024</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
