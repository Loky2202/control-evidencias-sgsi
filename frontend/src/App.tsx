/**
 * Aplicación principal del frontend
 * Navegación entre páginas con autenticación MSAL
 */
import { useState, useEffect } from 'react';
import { MsalProvider } from '@azure/msal-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { msalInstance } from './auth/msalConfig';
import {
  LayoutDashboard,
  FileText,
  ListChecks,
  Calendar,
  Shield,
  Menu,
  X,
  LogIn,
  LogOut,
} from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Policies from './pages/Policies';
import Requirements from './pages/Requirements';
import CalendarPage from './pages/Calendar';
import Auditor from './pages/Auditor';
import SoA from './pages/SoA';
import NewSubmission from './pages/NewSubmission';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      retry: 1,
    },
  },
});

type Page = 'dashboard' | 'policies' | 'requirements' | 'calendar' | 'auditor' | 'soa' | 'new-submission';

const navItems = [
  { id: 'dashboard' as Page, label: 'Tablero', icon: LayoutDashboard },
  { id: 'policies' as Page, label: 'Políticas', icon: FileText },
  { id: 'requirements' as Page, label: 'Requisitos', icon: ListChecks },
  { id: 'calendar' as Page, label: 'Calendario', icon: Calendar },
  { id: 'soa' as Page, label: 'SoA', icon: Shield },
  { id: 'new-submission' as Page, label: 'Nueva Entrega', icon: FileText },
  { id: 'auditor' as Page, label: 'Auditor', icon: Shield },
];

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Inicializar MSAL
    msalInstance.initialize().then(() => {
      const accounts = msalInstance.getAllAccounts();
      if (accounts.length > 0) {
        setUser(accounts[0]);
      }
    });
  }, []);

  const handleLogin = async () => {
    try {
      const response = await msalInstance.loginPopup({
        scopes: ['User.Read'],
      });
      setUser(response.account);
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handleLogout = () => {
    msalInstance.logoutPopup();
    setUser(null);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'policies':
        return <Policies />;
      case 'requirements':
        return <Requirements />;
      case 'calendar':
        return <CalendarPage />;
      case 'auditor':
        return <Auditor />;
      case 'soa':
        return <SoA />;
      case 'new-submission':
        return <NewSubmission />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <MsalProvider instance={msalInstance}>
      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen bg-slate-50">
          {/* Mobile menu button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="fixed top-4 left-4 z-50 lg:hidden bg-white shadow-lg rounded-lg p-2 border border-slate-200"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Sidebar */}
          <aside
            className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-slate-200 z-40 transform transition-transform duration-300 ${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            } lg:translate-x-0`}
          >
            <div className="p-6">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                  <Shield size={20} className="text-white" />
                </div>
                <div>
                  <h1 className="font-bold text-slate-800 text-sm">Evidencias ISO</h1>
                  <p className="text-xs text-slate-400">27001</p>
                </div>
              </div>

              <nav className="space-y-1">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentPage(item.id);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                      currentPage === item.id
                        ? 'bg-emerald-50 text-emerald-700 font-medium'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <item.icon size={18} />
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* User section */}
            <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-slate-100">
              {user ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-emerald-700 text-xs font-bold">
                        {user.name?.[0] || 'U'}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-700 truncate">{user.name}</p>
                      <p className="text-xs text-slate-400 truncate">{user.username}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <LogOut size={16} className="text-slate-400" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleLogin}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors"
                >
                  <LogIn size={16} />
                  Iniciar sesión
                </button>
              )}
            </div>
          </aside>

          {/* Main content */}
          <main className="lg:ml-64 p-4 sm:p-6 lg:p-8">{renderPage()}</main>
        </div>
      </QueryClientProvider>
    </MsalProvider>
  );
}
