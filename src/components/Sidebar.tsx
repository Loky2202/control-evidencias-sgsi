import { Shield, X } from 'lucide-react';

interface SidebarProps {
  activeSection: string;
  onNavigate: (id: string) => void;
  mobileOpen: boolean;
  onClose: () => void;
}

const sections = [
  { id: 'tecnologia', label: 'Tecnología', number: '1' },
  { id: 'conexiones', label: 'Conexiones', number: '2' },
  { id: 'estructura', label: 'Estructura', number: '3' },
  { id: 'contenedores', label: 'Contenedores', number: '4' },
  { id: 'base-datos', label: 'Base de datos', number: '5' },
  { id: 'gestion', label: 'Gestión', number: '6' },
  { id: 'orden', label: 'Orden de construcción', number: '7' },
  { id: 'atencion', label: 'Puntos de atención', number: '8' },
  { id: 'despliegue', label: 'Despliegue', number: '9' },
];

export default function Sidebar({ activeSection, onNavigate, mobileOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Overlay for mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-white border-r border-slate-200 z-40 transform transition-transform duration-300 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200">
              <Shield size={20} className="text-white" />
            </div>
            <div>
              <h1 className="font-bold text-slate-800 text-sm">Evidencias ISO</h1>
              <p className="text-xs text-slate-400">Guía técnica</p>
            </div>
            <button onClick={onClose} className="ml-auto lg:hidden">
              <X size={18} className="text-slate-400" />
            </button>
          </div>

          <nav className="space-y-1">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => onNavigate(section.id)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all duration-200 flex items-center gap-3 ${
                  activeSection === section.id
                    ? 'bg-emerald-50 text-emerald-700 font-medium border-l-3 border-emerald-500'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <span
                  className={`flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold ${
                    activeSection === section.id
                      ? 'bg-emerald-100 text-emerald-600'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {section.number}
                </span>
                {section.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-slate-100">
          <div className="text-xs text-slate-400 space-y-1">
            <p>Python 3.12 · FastAPI</p>
            <p>React · Vite · TypeScript</p>
            <p>PostgreSQL · Docker</p>
          </div>
        </div>
      </aside>
    </>
  );
}
