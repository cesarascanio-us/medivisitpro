import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useDashboardData } from '@/hooks/useDashboardData';
import { 
  EliteHeader, 
  EliteKPICard, 
  EliteCard, 
  EliteTable, 
  EliteBadge,
  EliteButton
} from '@/components/layout/DesignSystem';
import { cn } from '@/lib/utils';
import {
  MapPin, Clock, Calendar, CheckCircle, Store, Stethoscope,
  Map, Target, Package, AlertTriangle, Plus, Navigation,
  Play, CheckCircle2, TrendingUp, Bell, ChevronRight
} from 'lucide-react';

export default function DashboardRepresentative({
  organizationId,
  zoneId
}: {
  organizationId: string;
  zoneId: string | undefined;
}) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { farmacias, medicos, visitas, transferencias, ciclo } = useDashboardData(organizationId, zoneId);

  const [time, setTime] = useState(new Date());
  const [activeVisit] = useState<{ name: string; minutes: number } | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const firstName = user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'Representante';

  const getGreeting = () => {
    const h = time.getHours();
    if (h < 12) return 'Buenos días';
    if (h < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const formatDate = (d: Date) => {
    const formatted = d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  };

  // — Mock data para demostración visual —
  const agendaHoy = [
    { id: 1, name: 'Farmacia Mas+', address: 'Av. Las Delicias, Local 2', type: 'Farmacia', time: '09:00', done: true },
    { id: 2, name: 'Dr. Roberto Mendoza', address: 'Clínica Lugo, Cons. 4', type: 'Médico', time: '10:30', done: true },
    { id: 3, name: 'Farmatodo Base Aragua', address: 'C.C. Base Aragua, PB', type: 'Farmacia', time: '14:00', done: false },
    { id: 4, name: 'Farmacia La Candelaria', address: 'Calle Páez, Centro', type: 'Farmacia', time: '16:00', done: false },
  ];

  const visitasDone = agendaHoy.filter(v => v.done).length;
  const visitasTotal = agendaHoy.length;

  const proxima = agendaHoy.find(v => !v.done);

  return (
    <div className="flex flex-col w-full space-y-6 max-w-[1200px] mx-auto pb-20">

      {/* 1. Header con saludo personalizado */}
      <EliteHeader
        title={`${getGreeting()}, ${firstName}.`}
        subtitle={`${formatDate(time)} — Tienes ${visitasTotal - visitasDone} visitas programadas hoy`}
        icon={Stethoscope}
        statusText="GPS Activo"
        statusColor="bg-green-500"
      />

      {/* 2. Tareas Críticas (Flujo Guiado) */}
      {activeVisit ? (
        <div className="bg-card border-2 border-green-400 dark:border-green-600 rounded-lg p-4 relative overflow-hidden flex items-center justify-between">
          <div className="absolute top-0 left-0 w-1 h-full bg-green-500 animate-pulse" />
          <div className="flex items-center gap-3 ml-2">
            <div className="w-9 h-9 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
              <Clock className="w-4.5 h-4.5 text-green-600 dark:text-green-400" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Visita en curso</p>
              <p className="text-sm font-semibold text-foreground">{activeVisit.name}</p>
            </div>
          </div>
          <EliteButton variant="primary" className="bg-green-600 hover:bg-green-700 text-white" icon={CheckCircle2}>
            Finalizar Visita
          </EliteButton>
        </div>
      ) : (
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex items-center justify-between shadow-premium-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
              <AlertTriangle className="w-4.5 h-4.5 text-primary" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">Atención Requerida</p>
              <p className="text-sm font-semibold text-primary-foreground">Check-in pendiente en {proxima?.name || 'Farmacia'}</p>
            </div>
          </div>
          <EliteButton variant="primary" icon={MapPin} onClick={() => navigate('/visits')}>
            Hacer Check-in
          </EliteButton>
        </div>
      )}

      {/* 3. Grid de KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <EliteKPICard
          title="Visitas Hoy"
          value={`${visitasDone} / ${visitasTotal}`}
          subtitle={`${Math.round((visitasDone/visitasTotal)*100)}% completado`}
          trend={12}
          icon={Calendar}
          color="primary"
        />
        <EliteKPICard
          title="Efectividad"
          value="85%"
          subtitle="Superior a la media"
          trend={5}
          icon={Target}
          color="success"
        />
        <EliteKPICard
          title="Muestras Entregadas"
          value="24"
          subtitle="Cajas distribuidas"
          icon={Package}
          color="warning"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 4. Próxima Visita */}
        <EliteCard
          title="Próxima Visita"
          action={<EliteBadge status="active" customLabel={proxima?.time} />}
        >
          {proxima ? (
            <div className="flex flex-col gap-4">
              <div>
                <h4 className="text-base font-semibold text-foreground">{proxima.name}</h4>
                <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" strokeWidth={1.5} />
                  {proxima.address}
                </p>
                <EliteBadge status="review" customLabel={proxima.type} className="mt-2" />
              </div>
              <EliteButton variant="primary" icon={Play} className="w-full justify-center shadow-premium-md">
                Iniciar Visita
              </EliteButton>
            </div>
          ) : (
            <div className="py-6 text-center text-muted-foreground text-sm">
              No tienes más visitas programadas hoy.
            </div>
          )}
        </EliteCard>

        {/* 5. Historial Reciente (Agenda del Día) */}
        <EliteCard title="Agenda del Día" action={
          <EliteButton variant="ghost" size="sm" onClick={() => navigate('/agenda')}>Ver Todo</EliteButton>
        }>
          <div className="space-y-3">
            {agendaHoy.map(item => (
              <div key={item.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center border",
                    item.done ? "bg-green-50 border-green-200 text-green-600" : "bg-muted border-border text-muted-foreground"
                  )}>
                    {item.done ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className={cn("text-sm font-medium", item.done && "text-muted-foreground line-through")}>{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.address}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-foreground">{item.time}</p>
                  <EliteBadge status={item.done ? 'completed' : 'pending'} customLabel={item.type} />
                </div>
              </div>
            ))}
          </div>
        </EliteCard>
      </div>

    </div>
  );
}
