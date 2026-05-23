import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useDashboardData } from '@/hooks/useDashboardData';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  MapPin, Clock, Calendar, CheckCircle, Store, Stethoscope,
  Map, Target, Package, AlertTriangle, Plus, Navigation,
  Play, CheckCircle2, TrendingUp, Bell, ChevronRight
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function DashboardRepresentative({
  organizationId,
  zoneId
}: {
  organizationId: string;
  zoneId: string | undefined;
}) {
  const navigate = useNavigate();
  const { profile, organizationName, user } = useAuth();
  const { farmacias, medicos, visitas, transferencias, ciclo } = useDashboardData(organizationId, zoneId);

  const [time, setTime] = useState(new Date());
  const [activeVisit] = useState<{ name: string; minutes: number } | null>(null); // null = sin visita activa

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

  const formatDate = (d: Date) =>
    d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });

  // — Mock data para demostración visual —
  const agendaHoy = [
    { id: 1, name: 'Farmacia Mas+', address: 'Av. Las Delicias, Local 2', type: 'Farmacia', time: '09:00', done: true },
    { id: 2, name: 'Dr. Roberto Mendoza', address: 'Clínica Lugo, Cons. 4', type: 'Médico', time: '10:30', done: true },
    { id: 3, name: 'Farmatodo Base Aragua', address: 'C.C. Base Aragua, PB', type: 'Farmacia', time: '14:00', done: false },
    { id: 4, name: 'Farmacia La Candelaria', address: 'Calle Páez, Centro', type: 'Farmacia', time: '16:00', done: false },
  ];

  const visitasDone = agendaHoy.filter(v => v.done).length;
  const visitasTotal = agendaHoy.length;
  const progressPct = Math.round((visitasDone / visitasTotal) * 100);

  const kpis = [
    { label: 'Visitas hoy', value: `${visitasDone}/${visitasTotal}`, color: 'text-primary', bg: 'bg-accent' },
    { label: 'Esta semana', value: '14', color: 'text-secondary', bg: 'bg-green-50 dark:bg-green-900/20' },
    { label: 'Meta ciclo', value: '64%', color: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' },
  ];

  const alertas = [
    { icon: Store, msg: 'Locatel Las Delicias — sin visita hace 16 días', type: 'danger' },
    { icon: Package, msg: '3 transferencias pendientes de seguimiento', type: 'warning' },
  ];

  const misFarmacias = [
    { name: 'Farmacia La Candelaria', lastVisit: 2, potential: 'Alto' },
    { name: 'Farmahorro Centro', lastVisit: 5, potential: 'Medio' },
    { name: 'Locatel Las Delicias', lastVisit: 16, potential: 'Alto' },
  ];

  const transferData = [
    { name: 'Procesado', value: 12 },
    { name: 'Pendiente', value: 4 },
    { name: 'Revisión', value: 1 },
  ];

  const proxima = agendaHoy.find(v => !v.done);

  return (
    <div className="flex flex-col w-full space-y-4 max-w-[1200px] mx-auto pb-20">

      {/* ── SECCIÓN 1 — Saludo + estado del día ── */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
          <div>
            <h1 className="text-sm font-semibold text-foreground">
              {getGreeting()}, {firstName}.
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5 capitalize">{formatDate(time)}</p>
            {organizationName && (
              <p className="text-xs text-primary font-medium mt-0.5">{organizationName}</p>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5 text-xs gap-1">
              <MapPin className="w-3 h-3" strokeWidth={1.5} /> Zona Asignada
            </Badge>
            <Badge variant="outline" className="border-green-300 text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 text-xs gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              GPS Activo
            </Badge>
          </div>
        </div>

        {/* Barra de progreso del día */}
        <div className="mt-3 space-y-1">
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground">Progreso del día</span>
            <span className="font-medium text-foreground">{visitasDone} de {visitasTotal} visitas</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-700"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── SECCIÓN 2 — Visita activa (condicional) ── */}
      {activeVisit && (
        <div className="bg-card border-2 border-green-400 dark:border-green-600 rounded-lg p-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-green-500 animate-pulse" />
          <div className="flex items-center justify-between ml-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <div>
                <p className="text-xs text-muted-foreground font-medium">Visita en curso</p>
                <p className="text-sm font-semibold text-foreground">{activeVisit.name}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <Clock className="w-3 h-3" strokeWidth={1.5} />
                  {activeVisit.minutes} min activa
                </p>
              </div>
            </div>
            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white gap-1.5 h-9">
              <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2} />
              Finalizar visita
            </Button>
          </div>
        </div>
      )}

      {/* ── SECCIÓN 3 — KPIs rápidos ── */}
      <div className="grid grid-cols-3 gap-3">
        {kpis.map((k, i) => (
          <div key={i} className={cn("bg-card border border-border rounded-lg p-3", k.bg.replace('bg-', ''))}>
            <p className={cn("text-xl font-semibold leading-none", k.color)}>{k.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{k.label}</p>
          </div>
        ))}
      </div>

      {/* ── SECCIÓN 4 — Próxima visita + Acción principal ── */}
      {proxima && (
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Navigation className="w-4 h-4 text-primary" strokeWidth={1.5} />
            <h4 className="text-sm font-semibold text-foreground">Próxima visita</h4>
            <Badge variant="outline" className="ml-auto text-xs font-medium border-border">
              <Clock className="w-3 h-3 mr-1" strokeWidth={1.5} />
              {proxima.time}
            </Badge>
          </div>

          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-foreground">{proxima.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                <MapPin className="w-3 h-3" strokeWidth={1.5} />
                {proxima.address}
              </p>
              <Badge variant="secondary" className="mt-1.5 text-xs">{proxima.type}</Badge>
            </div>
            {/* BOTÓN PRINCIPAL — El más prominente */}
            <Button
              size="default"
              className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 h-10 px-5 font-medium shadow-premium-sm flex-shrink-0"
              onClick={() => navigate('/visits')}
            >
              <Play className="w-3.5 h-3.5" strokeWidth={2} fill="currentColor" />
              Iniciar visita
            </Button>
          </div>
        </div>
      )}

      {/* ── SECCIÓN 5 — Agenda completa del día ── */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" strokeWidth={1.5} />
            <h4 className="text-sm font-semibold text-foreground">Agenda de hoy</h4>
          </div>
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-muted-foreground" onClick={() => navigate('/agenda')}>
            Ver todo <ChevronRight className="w-3 h-3" strokeWidth={1.5} />
          </Button>
        </div>
        <div className="divide-y divide-border">
          {agendaHoy.map((item) => (
            <div
              key={item.id}
              className={cn(
                "flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors",
                item.done && "opacity-60"
              )}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0",
                  item.done ? "bg-green-100 dark:bg-green-900/30" : "bg-muted"
                )}>
                  {item.done
                    ? <CheckCircle className="w-3.5 h-3.5 text-green-600 dark:text-green-400" strokeWidth={2} />
                    : <Clock className="w-3 h-3 text-muted-foreground" strokeWidth={1.5} />
                  }
                </div>
                <div className="min-w-0">
                  <p className={cn("text-xs font-medium truncate", item.done ? "line-through text-muted-foreground" : "text-foreground")}>
                    {item.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{item.address}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                <span className="text-xs text-muted-foreground">{item.time}</span>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px]",
                    item.type === 'Médico'
                      ? "border-indigo-200 text-indigo-700 bg-indigo-50 dark:bg-indigo-900/20 dark:text-indigo-400"
                      : "border-primary/20 text-primary bg-accent"
                  )}
                >
                  {item.type}
                </Badge>
                {!item.done && (
                  <Button
                    size="sm"
                    className="h-7 text-xs px-2.5 bg-primary hover:bg-primary/90 text-white"
                    onClick={() => navigate('/visits')}
                  >
                    Iniciar
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── SECCIÓN 6 — Alertas pendientes ── */}
      {alertas.length > 0 && (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-600 dark:text-amber-400" strokeWidth={1.5} />
            <h4 className="text-sm font-semibold text-foreground">Alertas pendientes</h4>
            <Badge className="ml-auto bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0 text-xs">
              {alertas.length}
            </Badge>
          </div>
          <div className="divide-y divide-border">
            {alertas.map((a, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors">
                <div className={cn(
                  "w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0",
                  a.type === 'danger' ? "bg-red-50 dark:bg-red-900/20" : "bg-amber-50 dark:bg-amber-900/20"
                )}>
                  <a.icon
                    className={cn(
                      "w-3.5 h-3.5",
                      a.type === 'danger' ? "text-red-600 dark:text-red-400" : "text-amber-600 dark:text-amber-400"
                    )}
                    strokeWidth={1.5}
                  />
                </div>
                <p className="text-xs text-foreground flex-1">{a.msg}</p>
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" strokeWidth={1.5} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── SECCIÓN 7 — Mis farmacias + Transferencias (grid 2 col) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Farmacias prioritarias */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Store className="w-4 h-4 text-primary" strokeWidth={1.5} />
              <h4 className="text-sm font-semibold text-foreground">Mis Farmacias</h4>
            </div>
            <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground" onClick={() => navigate('/pharmacies')}>
              Ver todo
            </Button>
          </div>
          <div className="divide-y divide-border">
            {misFarmacias.map((f, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors">
                <div>
                  <p className="text-xs font-medium text-foreground">{f.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Potencial: {f.potential}</p>
                </div>
                {f.lastVisit > 15
                  ? <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-0 text-xs">+{f.lastVisit}d</Badge>
                  : <span className="text-xs text-muted-foreground">Hace {f.lastVisit}d</span>
                }
              </div>
            ))}
          </div>
        </div>

        {/* Estado de transferencias */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center gap-2">
            <Package className="w-4 h-4 text-primary" strokeWidth={1.5} />
            <h4 className="text-sm font-semibold text-foreground">Mis Transferencias</h4>
          </div>
          <div className="p-4">
            <div className="h-28">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={transferData} margin={{ left: 0, right: 20 }}>
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={72}
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: 'hsl(var(--muted))' }}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 'var(--radius)',
                      color: 'hsl(var(--foreground))',
                      fontSize: '11px'
                    }}
                  />
                  <Bar dataKey="value" barSize={14} radius={[0, 4, 4, 0]}>
                    {transferData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.name === 'Procesado'
                            ? 'hsl(var(--primary))'
                            : entry.name === 'Pendiente'
                            ? 'hsl(var(--warning))'
                            : 'hsl(var(--destructive))'
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-2 h-7 text-xs border-border"
              onClick={() => navigate('/transfer-orders')}
            >
              Ver transferencias
            </Button>
          </div>
        </div>
      </div>

      {/* ── BOTÓN FLOTANTE — Solo en móvil ── */}
      <div className="fixed bottom-6 right-5 lg:hidden z-50">
        <Button
          size="lg"
          className="h-13 px-5 bg-primary hover:bg-primary/90 text-primary-foreground shadow-premium-lg rounded-full gap-2 font-medium"
          style={{ height: '52px' }}
          onClick={() => navigate('/visits')}
        >
          <Plus className="w-5 h-5" strokeWidth={2} />
          Nueva visita
        </Button>
      </div>

    </div>
  );
}
