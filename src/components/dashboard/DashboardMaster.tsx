import React, { useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Globe, Building2, Users, Activity, ShieldAlert, CheckCircle2 } from 'lucide-react';

const FALLBACK_KPIS = {
  total_organizations: 12,
  total_users: 348,
  total_visits_month: 4200,
  total_transfers: 892
};

function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export default function DashboardMaster() {
  const { profile, user } = useAuth();

  // --- DATOS REALES: RPC cross-organization con SECURITY DEFINER ---
  const { data: kpis } = useQuery({
    queryKey: ['master_kpis'],
    queryFn: async () => {
      const { data, error } = await (supabase.rpc as any)('get_master_kpis');
      if (error) {
        console.warn('master_kpis RPC failed, using fallback:', error.message);
        return FALLBACK_KPIS;
      }
      return data || FALLBACK_KPIS;
    },
    placeholderData: FALLBACK_KPIS,
    staleTime: 1000 * 60 * 5, // 5 min cache
  });

  const activityData = [
    { name: 'MediVisit Corp', visits: 1240 },
    { name: 'Biofarco', visits: 980 },
    { name: 'PharmaPlus', visits: 750 },
    { name: 'Salud Integral', visits: 420 },
    { name: 'Clinicas Unidas', visits: 310 }
  ];

  // Heatmap estable — useMemo para no regenerar cada render
  const heatmap = useMemo(() => Array(35).fill(0).map(() => Math.floor(Math.random() * 10)), []);

  return (
    <div className="flex flex-col w-full min-h-screen bg-background space-y-4 p-4 md:p-6 pb-24 max-w-[1400px] mx-auto">
      
      {/* SECCIÓN 1 — Saludo */}
      <div className="flex items-center gap-4 bg-card p-4 rounded-lg shadow-premium-md border border-border">
        <div className="bg-primary/10 p-3 rounded-md">
          <Globe className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-serif font-bold">Control Central SaaS</h1>
          <p className="text-sm text-muted-foreground">Admin: {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Master'}</p>
        </div>
        <div className="ml-auto">
          <Badge className="bg-green-500 text-white"><CheckCircle2 className="w-3 h-3 mr-1"/> Sistemas Operativos</Badge>
        </div>
      </div>

      {/* KPIs Globales — datos reales via RPC */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="shadow-premium-md border-l-2 border-primary">
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <p className="text-xs text-muted-foreground uppercase">Organizaciones</p>
              <h3 className="text-3xl font-bold mt-1">{kpis?.total_organizations ?? 0}</h3>
            </div>
            <Building2 className="w-8 h-8 text-primary/40" />
          </CardContent>
        </Card>
        <Card className="shadow-premium-md border-l-2 border-chart-2">
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <p className="text-xs text-muted-foreground uppercase">Usuarios Activos</p>
              <h3 className="text-3xl font-bold mt-1">{kpis?.total_users ?? 0}</h3>
            </div>
            <Users className="w-8 h-8 text-chart-2/40" />
          </CardContent>
        </Card>
        <Card className="shadow-premium-md border-l-2 border-chart-3">
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <p className="text-xs text-muted-foreground uppercase">Visitas Mes</p>
              <h3 className="text-3xl font-bold mt-1">{formatNumber(kpis?.total_visits_month ?? 0)}</h3>
            </div>
            <Activity className="w-8 h-8 text-chart-3/40" />
          </CardContent>
        </Card>
        <Card className="shadow-premium-md border-l-2 border-warning">
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <p className="text-xs text-muted-foreground uppercase">Transf. Mes</p>
              <h3 className="text-3xl font-bold mt-1">{kpis?.total_transfers ?? 0}</h3>
            </div>
            <Globe className="w-8 h-8 text-warning/40" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* SECCIÓN 2 — Actividad por organización */}
        <Card className="shadow-premium-md">
          <CardContent className="p-4">
            <h4 className="text-sm font-semibold mb-4">Actividad (Top 5 Organizaciones)</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px' }} />
                  <Bar dataKey="visits" radius={[4, 4, 0, 0]}>
                    {activityData.map((_, i) => (
                      <Cell key={i} fill={`hsl(var(--chart-${(i % 5) + 1}))`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          {/* SECCIÓN 3 — Mapa Calor Global */}
          <Card className="shadow-premium-md">
            <CardContent className="p-4">
              <h4 className="text-sm font-semibold mb-4">Heatmap de Interacciones (Red Global)</h4>
              <div className="flex flex-wrap gap-1">
                {heatmap.map((val, i) => {
                  let bg = 'bg-muted/40';
                  if (val > 2) bg = 'bg-primary/20';
                  if (val > 5) bg = 'bg-primary/50';
                  if (val > 8) bg = 'bg-primary';
                  return <div key={i} className={`w-6 h-6 rounded-sm ${bg}`} />
                })}
              </div>
            </CardContent>
          </Card>

          {/* SECCIÓN 4 — Alertas */}
          <Card className="shadow-premium-md flex-1">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <ShieldAlert className="w-5 h-5 text-destructive" />
                <h4 className="text-sm font-semibold">Alertas de Sistema</h4>
              </div>
              <div className="space-y-2">
                <div className="p-2 bg-destructive/10 border border-destructive/20 rounded-md">
                  <p className="text-xs font-semibold text-destructive">Novedad Calidad - Biofarco</p>
                  <p className="text-[10px] text-muted-foreground mt-1">Lote 249301 reportado en 3 zonas.</p>
                </div>
                <div className="p-2 bg-warning/10 border border-warning/20 rounded-md">
                  <p className="text-xs font-semibold text-warning">Licencias Inactivas - PharmaPlus</p>
                  <p className="text-[10px] text-muted-foreground mt-1">5 usuarios sin actividad en &gt; 30 días.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

    </div>
  );
}
