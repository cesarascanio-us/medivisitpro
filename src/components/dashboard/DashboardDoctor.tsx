import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Stethoscope, Pill, Calendar, Activity } from 'lucide-react';

// Fallback data for when Supabase queries fail or return empty
const FALLBACK_VISITAS = [
  { rep: 'Representante', date: 'Sin registro', duration: '—', products: 'Sin datos' },
];
const FALLBACK_MUESTRAS = [
  { name: 'Sin muestras registradas', quantity: 0, expires: '—', alert: false },
];
const FALLBACK_DONUT = [
  { name: 'Sin datos', value: 1 },
];

export default function DashboardDoctor({ organizationId, doctorId }: { organizationId: string, doctorId: string | undefined }) {
  const { profile, organizationName, user } = useAuth();

  // Buscar el doctor que corresponde a este usuario autenticado
  const { data: doctor } = useQuery({
    queryKey: ['doctor_profile', doctorId],
    queryFn: async () => {
      if (!doctorId) return null;
      const { data, error } = await supabase
        .from('doctors')
        .select('id, name, specialty')
        .eq('user_id', doctorId)
        .maybeSingle();
      if (error) {
        console.warn('Doctor profile query failed:', error.message);
        return null;
      }
      return data;
    },
    enabled: !!doctorId,
  });

  // Visitas recibidas por este doctor
  const { data: visitasRaw } = useQuery({
    queryKey: ['doctor_visits', doctor?.id],
    queryFn: async () => {
      if (!doctor?.id) return [];
      const { data, error } = await supabase
        .from('visits')
        .select('id, checkin_at, checkout_at, notes, user_id, products_presented')
        .eq('contact_id', doctor.id)
        .order('checkin_at', { ascending: false })
        .limit(10);
      if (error) {
        console.warn('Doctor visits query failed:', error.message);
        return [];
      }
      return data || [];
    },
    enabled: !!doctor?.id,
  });

  // Muestras en banco del doctor
  const { data: muestrasRaw } = useQuery({
    queryKey: ['doctor_samples', doctor?.id, organizationId],
    queryFn: async () => {
      if (!organizationId) return [];
      const { data, error } = await supabase
        .from('bank_inventory')
        .select('id, quantity, updated_at, product:products(name, code)')
        .eq('bank_id', organizationId) // Adjust if banks are per-doctor
        .limit(20);
      if (error) {
        console.warn('Doctor samples query failed:', error.message);
        return [];
      }
      return data || [];
    },
    enabled: !!organizationId,
  });

  // Process visitas for display
  const visitasRecientes = (visitasRaw && visitasRaw.length > 0) ? visitasRaw.map((v: any) => {
    const checkin = v.checkin_at ? new Date(v.checkin_at) : null;
    const checkout = v.checkout_at ? new Date(v.checkout_at) : null;
    const duration = checkin && checkout
      ? `${Math.round((checkout.getTime() - checkin.getTime()) / 60000)} min`
      : '—';
    const dateStr = checkin
      ? checkin.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
      : 'Sin fecha';
    return {
      rep: 'Representante',
      date: dateStr,
      duration,
      products: Array.isArray(v.products_presented) ? v.products_presented.join(', ') : v.notes?.substring(0, 40) || 'Sin detalle',
    };
  }) : FALLBACK_VISITAS;

  // Process muestras for display
  const inventarioMuestras = (muestrasRaw && muestrasRaw.length > 0) ? muestrasRaw.map((m: any) => {
    const updatedDate = m.updated_at ? new Date(m.updated_at) : new Date();
    const daysUntil = Math.ceil((updatedDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return {
      name: m.product?.name || 'Producto',
      quantity: m.quantity || 0,
      expires: updatedDate.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }),
      alert: daysUntil < 30,
    };
  }) : FALLBACK_MUESTRAS;

  // Donut chart data
  const donutData = visitasRecientes.length > 1
    ? visitasRecientes.reduce((acc: any[], v) => {
        const products = v.products.split(',').map((p: string) => p.trim());
        products.forEach((p: string) => {
          const existing = acc.find(a => a.name === p);
          if (existing) existing.value++;
          else acc.push({ name: p, value: 1 });
        });
        return acc;
      }, []).slice(0, 5)
    : FALLBACK_DONUT;

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

  const visitasEsteMes = visitasRaw?.filter((v: any) => {
    if (!v.checkin_at) return false;
    const d = new Date(v.checkin_at);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length || 0;

  return (
    <div className="flex flex-col w-full min-h-screen bg-background space-y-4 p-4 md:p-6 pb-24 max-w-[1200px] mx-auto">
      
      {/* SECCIÓN 1 — Saludo */}
      <div className="flex items-center gap-4 bg-card p-4 rounded-lg shadow-premium-md border border-border">
        <div className="bg-primary/10 p-3 rounded-md">
          <Stethoscope className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-serif font-bold">Portal Médico — {organizationName}</h1>
          <p className="text-sm text-muted-foreground">
            {doctor?.name ? `Dr. ${doctor.name}` : `Dr. ${user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Médico'}`}
            {doctor?.specialty && <span className="text-primary ml-2">· {doctor.specialty}</span>}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-premium-md border-l-2 border-primary">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase">Visitas Recibidas (Mes)</p>
            <h3 className="text-2xl font-bold mt-1">{visitasEsteMes}</h3>
          </CardContent>
        </Card>
        <Card className="shadow-premium-md border-l-2 border-chart-2">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase">Muestras en Banco</p>
            <h3 className="text-2xl font-bold mt-1">{inventarioMuestras.reduce((s, m) => s + m.quantity, 0)}</h3>
          </CardContent>
        </Card>
        <Card className="shadow-premium-md border-l-2 border-warning">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase">Próxima Visita</p>
            <h3 className="text-lg font-bold mt-1 truncate">Por agendar</h3>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* SECCIÓN 2 — Historial de visitas */}
        <Card className="shadow-premium-md flex flex-col">
          <CardContent className="p-4 flex flex-col flex-1">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-primary" />
              <h4 className="text-sm font-semibold">Historial de Atención</h4>
            </div>
            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
              {visitasRecientes.map((v, i) => (
                <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-background bg-card shadow-premium-sm text-primary shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-lg border border-border shadow-sm bg-card">
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-xs font-semibold">{v.date}</div>
                      <Badge variant="outline" className="text-[10px]">{v.duration}</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">Rep: {v.rep}</div>
                    <div className="text-[10px] mt-2 text-primary/80 truncate">Prod: {v.products}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* SECCIÓN 3 y 4 — Inventario y Gráfico */}
        <div className="flex flex-col gap-4">
          <Card className="shadow-premium-md">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <Pill className="w-5 h-5 text-primary" />
                <h4 className="text-sm font-semibold">Mi Banco de Muestras</h4>
              </div>
              <ScrollArea className="h-[150px]">
                <div className="space-y-2">
                  {inventarioMuestras.map((m, i) => (
                    <div key={i} className="flex justify-between items-center p-2 rounded-md bg-muted/20 border border-border">
                      <div>
                        <p className="text-xs font-semibold">{m.name}</p>
                        <p className={`text-[10px] ${m.alert ? 'text-destructive font-bold' : 'text-muted-foreground'}`}>
                          Exp: {m.expires}
                        </p>
                      </div>
                      <Badge variant={m.alert ? "destructive" : "secondary"}>{m.quantity} u.</Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card className="shadow-premium-md">
            <CardContent className="p-4">
              <h4 className="text-sm font-semibold mb-2">Productos Frecuentes</h4>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={donutData} innerRadius={40} outerRadius={60} paddingAngle={5} dataKey="value" stroke="none">
                      {donutData.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

    </div>
  );
}
