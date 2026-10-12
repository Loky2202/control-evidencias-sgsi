/**
 * Página de Calendario
 * Vista de calendario con vencimientos próximos
 */
import { useState } from 'react';
import { useRequirements } from '../api/client';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { data: requirements, isLoading } = useRequirements();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDay = firstDay.getDay();

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ];

  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const getRequirementsForDate = (day: number) => {
    if (!requirements) return [];
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return requirements.filter((req) => req.next_due_date === dateStr);
  };

  const statusColors = {
    Vigente: 'bg-emerald-500',
    'Por vencer': 'bg-amber-500',
    Vencida: 'bg-red-500',
    Pendiente: 'bg-slate-400',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Calendario de Vencimientos</h1>
        <p className="text-slate-500 mt-1">Próximas fechas de entrega de evidencias</p>
      </div>

      {/* Calendar */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {/* Month Navigation */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <button
            onClick={previousMonth}
            className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </button>
          <h2 className="text-xl font-semibold text-slate-800">
            {monthNames[month]} {year}
          </h2>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* Calendar Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
          </div>
        ) : (
          <div className="p-4">
            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
                <div
                  key={day}
                  className="text-center text-sm font-semibold text-slate-600 py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-2">
              {/* Empty cells for days before month starts */}
              {Array.from({ length: startingDay }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}

              {/* Days of the month */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dayRequirements = getRequirementsForDate(day);
                const isToday =
                  day === new Date().getDate() &&
                  month === new Date().getMonth() &&
                  year === new Date().getFullYear();

                return (
                  <div
                    key={day}
                    className={`aspect-square border rounded-lg p-2 relative ${
                      isToday
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span
                      className={`text-sm font-medium ${
                        isToday ? 'text-emerald-700' : 'text-slate-700'
                      }`}
                    >
                      {day}
                    </span>
                    {dayRequirements.length > 0 && (
                      <div className="absolute bottom-2 left-2 right-2 space-y-1">
                        {dayRequirements.slice(0, 3).map((req) => (
                          <div
                            key={req.id}
                            className={`h-1.5 rounded-full ${
                              statusColors[req.alert_status as keyof typeof statusColors]
                            }`}
                            title={`${req.code}: ${req.title}`}
                          />
                        ))}
                        {dayRequirements.length > 3 && (
                          <div className="text-xs text-slate-500 text-center">
                            +{dayRequirements.length - 3}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-slate-400" />
          Leyenda
        </h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-emerald-500" />
            <span className="text-sm text-slate-600">Vigente</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-amber-500" />
            <span className="text-sm text-slate-600">Por vencer</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-500" />
            <span className="text-sm text-slate-600">Vencida</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-slate-400" />
            <span className="text-sm text-slate-600">Pendiente</span>
          </div>
        </div>
      </div>
    </div>
  );
}
