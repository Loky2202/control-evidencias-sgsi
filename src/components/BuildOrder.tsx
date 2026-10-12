const steps = [
  {
    step: 1,
    title: 'Repositorio y base de datos',
    description: 'docker-compose.yml con db y migrate, y la primera migración con las tablas.',
    icon: '🏗️',
  },
  {
    step: 2,
    title: 'Carga inicial',
    description: 'import_excel.py y verificación de los 59 requisitos en la base.',
    icon: '📥',
  },
  {
    step: 3,
    title: 'API de lectura',
    description: 'Políticas, requisitos por política y tablero.',
    icon: '📖',
  },
  {
    step: 4,
    title: 'Frontend básico',
    description: 'Tablero y vista por política, con AUTH_DISABLED=true.',
    icon: '🖥️',
  },
  {
    step: 5,
    title: 'API y pantallas de escritura',
    description: 'Crear entregas, cambiar estados, notas.',
    icon: '✏️',
  },
  {
    step: 6,
    title: 'Autenticación',
    description: 'Inicio de sesión con Entra ID, roles y registro de auditoría.',
    icon: '🔐',
  },
  {
    step: 7,
    title: 'Archivos',
    description: 'Subida de archivos a SharePoint.',
    icon: '📎',
  },
  {
    step: 8,
    title: 'Operación',
    description: 'Respaldos programados, prueba de restauración y revisión de seguridad.',
    icon: '🛡️',
  },
];

export default function BuildOrder() {
  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-emerald-200 via-blue-200 to-violet-200" />

      <div className="space-y-6">
        {steps.map((step) => (
          <div key={step.step} className="relative flex gap-5">
            {/* Timeline dot */}
            <div className="relative z-10 flex-shrink-0 w-12 h-12 bg-white border-2 border-slate-200 rounded-xl flex items-center justify-center shadow-sm hover:border-emerald-300 hover:shadow-md transition-all duration-200">
              <span className="text-xl">{step.icon}</span>
            </div>

            {/* Content */}
            <div className="flex-1 bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  Paso {step.step}
                </span>
              </div>
              <h4 className="font-semibold text-slate-800">{step.title}</h4>
              <p className="text-sm text-slate-500 mt-1">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
