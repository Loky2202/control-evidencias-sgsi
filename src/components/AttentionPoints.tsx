import { AlertTriangle, Server, Shield, HardDrive, Lock } from 'lucide-react';

const points = [
  {
    icon: Shield,
    title: 'HTTPS y Entra ID',
    color: 'amber',
    content:
      'El inicio de sesión de Microsoft solo acepta direcciones de redirección con HTTPS (o http://localhost en desarrollo). Con tls internal, Caddy genera su propia autoridad de certificados y cada equipo que use la aplicación debe confiar en ese certificado raíz, o el navegador mostrará advertencias. Alternativas: un nombre de dominio real con certificado público, o Tailscale con certificados HTTPS. Decide esto temprano.',
  },
  {
    icon: Server,
    title: 'Equipo anfitrión',
    color: 'blue',
    content:
      'Un servidor Linux con Docker Engine es lo más estable. En Windows con Docker Desktop funciona, pero depende de que el equipo esté encendido y de WSL.',
  },
  {
    icon: HardDrive,
    title: 'Recursos',
    color: 'emerald',
    content:
      'Esta aplicación es liviana: con 2 GB de RAM libres y poco disco alcanza, más el espacio de los respaldos.',
  },
  {
    icon: Lock,
    title: 'Firewall',
    color: 'violet',
    content:
      'Abre solo los puertos 80 y 443 hacia la red interna. El 5432 de la base de datos no se publica nunca en producción.',
  },
  {
    icon: AlertTriangle,
    title: 'La aplicación entra en el alcance de ISO',
    color: 'rose',
    content:
      'Sus accesos, respaldos y registros deben cumplir las propias políticas (POL-SI-003, 007 y 008). Documentarlo te da evidencia gratis.',
  },
];

const colorStyles: Record<string, { bg: string; border: string; icon: string }> = {
  amber: { bg: 'bg-amber-50', border: 'border-amber-200', icon: 'text-amber-500' },
  blue: { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'text-blue-500' },
  emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', icon: 'text-emerald-500' },
  violet: { bg: 'bg-violet-50', border: 'border-violet-200', icon: 'text-violet-500' },
  rose: { bg: 'bg-rose-50', border: 'border-rose-200', icon: 'text-rose-500' },
};

export default function AttentionPoints() {
  return (
    <div className="space-y-4">
      {points.map((point, i) => {
        const styles = colorStyles[point.color];
        return (
          <div
            key={i}
            className={`${styles.bg} border ${styles.border} rounded-xl p-5 hover:shadow-md transition-shadow duration-200`}
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <point.icon size={22} className={styles.icon} />
              </div>
              <div>
                <h4 className="font-semibold text-slate-800 mb-2">{point.title}</h4>
                <p className="text-sm text-slate-600 leading-relaxed">{point.content}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
