import { Shield, Server, Database, Globe } from 'lucide-react';

export default function Hero() {
  return (
    <div className="pt-16 pb-12 lg:pt-20 lg:pb-16">
      <div className="max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full text-xs font-medium text-emerald-700 mb-6">
          <Shield size={14} />
          ISO 27001 · Documentación técnica
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight">
          Guía del proyecto web de{' '}
          <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            evidencias
          </span>
        </h1>
        <p className="mt-5 text-lg text-slate-600 leading-relaxed max-w-2xl">
          Complementa el borrador de diseño anterior. Responde cómo gestionar el proyecto, qué tecnología usar, 
          cómo conectar las piezas y cómo manejar la base de datos, todo en contenedores Docker en un mismo equipo.
        </p>

        <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: Server, label: 'FastAPI', desc: 'API Python' },
            { icon: Globe, label: 'React', desc: 'Frontend Vite' },
            { icon: Database, label: 'PostgreSQL', desc: 'Base de datos' },
            { icon: Shield, label: 'Docker', desc: 'Contenedores' },
          ].map(({ icon: Icon, label, desc }) => (
            <div
              key={label}
              className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow duration-200"
            >
              <Icon size={20} className="text-emerald-500 mb-2" />
              <p className="font-semibold text-slate-800 text-sm">{label}</p>
              <p className="text-xs text-slate-400">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
