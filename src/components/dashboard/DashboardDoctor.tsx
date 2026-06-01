import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Stethoscope, Pill, Calendar, Activity, Syringe, Clock } from 'lucide-react';
import { EliteHeader, EliteCard, EliteKPICard, EliteButton } from '@/components/layout/DesignSystem';

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
  const { organizationName, user } = useAuth();

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
    <div className="flex flex-col w-full min-h-screen bg-background space-y-6 p-4 md:p-6 pb-24 max-w-[1200px] mx-auto">
      
      {/* SECCIÓN 1 — Saludo */}
      <EliteHeader
        title={`Portal Médico — ${organizationName}`}
        subtitle={`${doctor?.name ? `Dr. ${doctor.name}` : `Dr. ${user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Médico'}`} ${doctor?.specialty ? `· ${doctor.specialty}` : ''}`}
        icon={Stethoscope}
        rightContent={
          <EliteButton variant="primary" icon={Syringe}>
            Solicitar Muestras
          </EliteButton>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <EliteKPICard
          title="Visitas Recibidas (Mes)"
          value={visitasEsteMes}
          icon={Calendar}
          color="primary"
        />
        <EliteKPICard
          title="Muestras en Banco"
          value={inventarioMuestras.reduce((s, m) => s + m.quantity, 0)}
          icon={Pill}
          color="secondary"
        />
        <EliteKPICard
          title="Próxima Visita"
          value="Por agendar"
          icon={Clock}
          color="warning"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* SECCIÓN 2 — Historial de visitas */}
        <EliteCard title="Historial de Atención" icon={Calendar} className="h-full">
          <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border/40 before:to-transparent mt-4">
            {visitasRecientes.map((v, i) => (
              <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-background bg-card shadow-premium-sm text-primary shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 border-border/40 z-10">
                  <Activity className="w-4 h-4" />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-lg border border-border shadow-sm bg-card hover:bg-muted/30 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-sm font-semibold text-foreground">{v.date}</div>
                    <Badge variant="outline" className="text-xs font-normal border-border bg-muted/40">{v.duration}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">Rep: {v.rep}</div>
                  <div className="text-xs mt-2 text-primary/80 truncate font-medium">Prod: {v.products}</div>
                </div>
              </div>
            ))}
          </div>
        </EliteCard>

        {/* SECCIÓN 3 y 4 — Inventario y Gráfico */}
        <div className="flex flex-col gap-6">
          <EliteCard title="Portal de Muestras" icon={Pill} action={<EliteButton variant="ghost" size="sm">Ver Todo</EliteButton>}>
            <ScrollArea className="h-[150px] mt-4 pr-3">
              <div className="space-y-2">
                {inventarioMuestras.map((m, i) => (
                  <div key={i} className="flex justify-between items-center p-3 rounded-lg bg-muted/20 border border-border hover:bg-muted/40 transition-colors">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{m.name}</p>
                      <p className={`text-xs mt-0.5 ${m.alert ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                        Vence: {m.expires}
                      </p>
                    </div>
                    <Badge variant={m.alert ? "destructive" : "secondary"} className="text-xs font-medium px-2 py-1">{m.quantity} u.</Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </EliteCard>

          <EliteCard title="Productos Frecuentes">
            <div className="h-48 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={donutData} innerRadius={50} outerRadius={75} paddingAngle={5} dataKey="value" stroke="none">
                    {donutData.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)', color: 'hsl(var(--foreground))', boxShadow: 'var(--shadow-premium-md)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </EliteCard>
        </div>
      </div>

    </div>
  );
}
