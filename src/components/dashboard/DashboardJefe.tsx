/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
 ======================================================================== */

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Star,
  Users,
  Target,
  MapPin,
  TrendingUp,
  Package,
  Activity,
  CheckCircle2,
  Clock,
  ChevronRight
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from "recharts";

interface DashboardJefeProps {
  organizationId?: string | null;
}

export default function DashboardJefe({ organizationId }: DashboardJefeProps) {
  const { profile, user, isDemo, userRegion } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  const { data: regionalData, isLoading } = useQuery({
    queryKey: ['jefe_regional_data', organizationId, profile?.id],
    queryFn: async () => {
      if (isDemo || !organizationId) {
        return {
          quotaCompliance: 82,
          weeklyVisits: 145,
          pharmaciesCovered: 88,
          processedOrders: 32,
          team: [
            { id: '1', name: 'Laura Sánchez', role: 'Coordinador', zone: 'Norte', visitsToday: 12, compliance: 85, lastActive: 'Hace 10 min' },
            { id: '2', name: 'Miguel Ángel', role: 'Supervisor', zone: 'Sur', visitsToday: 8, compliance: 70, lastActive: 'Hace 2 horas' },
            { id: '3', name: 'Elena Torres', role: 'Coordinador', zone: 'Este', visitsToday: 15, compliance: 92, lastActive: 'En línea' },
          ],
          pendingTransfers: [
            { id: '101', pharmacy: 'Farmacia Plus', amount: 8500, date: new Date().toISOString() },
            { id: '102', pharmacy: 'Red de Salud', amount: 12400, date: new Date(Date.now() - 86400000).toISOString() },
          ],
          objectivesData: [
            { week: 'Semana 1', meta: 100, logrado: 95 },
            { week: 'Semana 2', meta: 100, logrado: 110 },
            { week: 'Semana 3', meta: 100, logrado: 85 },
            { week: 'Semana 4', meta: 100, logrado: 40 }, // current week
          ]
        };
      }
      
      // En una implementación real, aquí haríamos las consultas a Supabase
      // filtrando por la región o los usuarios asignados a este jefe
      return {
        quotaCompliance: 0,
        weeklyVisits: 0,
        pharmaciesCovered: 0,
        processedOrders: 0,
        team: [],
        pendingTransfers: [],
        objectivesData: []
      };
    },
    enabled: !!profile?.id
  });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-in fade-in">
        <Skeleton className="h-40 rounded-[2rem]" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-[1.5rem]" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="lg:col-span-2 h-80 rounded-[1.5rem]" />
          <Skeleton className="h-80 rounded-[1.5rem]" />
        </div>
      </div>
    );
  }

  const firstName = profile?.first_name || user?.email?.split("@")[0] || "Jefe";

  return (
    <div className="flex flex-col min-h-full space-y-6 pb-8">
      {/* HEADER ESTRATÉGICO */}
      <header className="bg-card px-8 md:px-12 py-8 rounded-[2rem] shadow-xl shadow-purple-500/5 border border-border relative overflow-hidden mx-1">
        <div className="absolute -top-20 -right-20 w-56 h-56 bg-purple-500/10 rounded-full blur-3xl" />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-[1.25rem] flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Star className="text-white h-8 w-8" />
            </div>
            <div>
              <p className="text-purple-600 text-[10px] font-black uppercase tracking-[0.2em] mb-1">
                Jefatura Regional
              </p>
              <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
                ¡Hola, {firstName}!
              </h1>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <Badge className="bg-purple-600/10 text-purple-600 border-none font-black text-[10px] px-2.5 py-0.5 uppercase tracking-wider">
                  Visión Estratégica
                </Badge>
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-muted border border-border">
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
                    {userRegion || 'Región Central'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-right hidden sm:block">
            <div className="text-2xl font-black text-foreground tabular-nums tracking-tighter">
              {currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </div>
            <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
              {currentTime.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}
            </div>
          </div>
        </div>
      </header>

      {/* KPIS REGIONALES */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-3 duration-500">
        <KPICard 
          title="Cuota Regional" 
          value={`${regionalData?.quotaCompliance}%`} 
          subtitle="Cumplimiento del ciclo"
          icon={<Target />} 
          color="purple" 
        />
        <KPICard 
          title="Visitas Semana" 
          value={regionalData?.weeklyVisits?.toString() || '0'} 
          subtitle="Total de la región"
          icon={<Activity />} 
          color="emerald" 
        />
        <KPICard 
          title="Cobertura" 
          value={`${regionalData?.pharmaciesCovered}%`} 
          subtitle="Farmacias visitadas"
          icon={<MapPin />} 
          color="blue" 
        />
        <KPICard 
          title="Pedidos" 
          value={regionalData?.processedOrders?.toString() || '0'} 
          subtitle="Procesados esta semana"
          icon={<Package />} 
          color="amber" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-5 duration-700">
        {/* MI EQUIPO DIRECTO */}
        <Card className="lg:col-span-2 border-none shadow-xl shadow-primary/5 bg-card rounded-[2rem] overflow-hidden">
          <CardHeader className="px-8 pt-8 pb-4">
            <CardTitle className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-600" />
              Estructura a Cargo
            </CardTitle>
            <CardDescription className="text-xs font-semibold">Coordinadores y Supervisores</CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <div className="space-y-4">
              {regionalData?.team.map((member: any) => (
                <div key={member.id} className="flex items-center justify-between p-4 rounded-xl border border-border/50 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-purple-600/10 rounded-xl flex items-center justify-center">
                      <span className="text-purple-600 font-black text-xs">{member.name.substring(0, 2).toUpperCase()}</span>
                    </div>
                    <div>
                      <p className="font-bold text-sm">{member.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4">{member.role}</Badge>
                        <span className="text-[10px] text-muted-foreground">• Zona {member.zone}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="hidden sm:flex flex-col items-end gap-1">
                    <span className="text-xs font-bold text-foreground">{member.visitsToday} visitas hoy</span>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {member.lastActive}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 w-24">
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-[9px] font-bold text-muted-foreground">Meta</span>
                        <span className="text-[9px] font-bold text-emerald-600">{member.compliance}%</span>
                      </div>
                      <Progress value={member.compliance} className="h-1.5" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* TRANSFERENCIAS EXCEPCIONALES */}
        <Card className="border-none shadow-xl shadow-primary/5 bg-card rounded-[2rem] overflow-hidden flex flex-col">
          <CardHeader className="px-8 pt-8 pb-4">
            <CardTitle className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-amber-500" />
              Aprobaciones
            </CardTitle>
            <CardDescription className="text-xs font-semibold">Pedidos de alto volumen</CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-8 flex-1">
            <div className="space-y-4">
              {regionalData?.pendingTransfers.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto mb-2" />
                  <p className="text-sm font-bold text-muted-foreground">Sin aprobaciones pendientes</p>
                </div>
              ) : (
                regionalData?.pendingTransfers.map((t: any) => (
                  <div key={t.id} className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 group cursor-pointer hover:border-amber-500/40 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-bold text-sm line-clamp-1">{t.pharmacy}</p>
                      <ChevronRight className="h-4 w-4 text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="flex justify-between items-end">
                      <span className="text-xs font-bold text-muted-foreground">
                        {new Date(t.date).toLocaleDateString()}
                      </span>
                      <span className="text-base font-black text-amber-600 tabular-nums">
                        ${t.amount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* OBJETIVOS VS REALIDAD */}
      <Card className="border-none shadow-xl shadow-primary/5 bg-card rounded-[2rem] overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-700 delay-100">
        <CardHeader className="px-8 pt-8 pb-4">
          <CardTitle className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            Objetivos vs Realidad (Ciclo Actual)
          </CardTitle>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={regionalData?.objectivesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="week" tickLine={false} axisLine={false} tick={{ fontSize: 11, fontWeight: 600, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fontWeight: 600, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', fontWeight: 'bold' }} 
                  cursor={{ fill: 'hsl(var(--muted)/0.5)' }}
                />
                <Bar dataKey="meta" name="Meta" fill="hsl(var(--muted-foreground)/0.2)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="logrado" name="Logrado" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function KPICard({ title, value, subtitle, icon, color }: any) {
  const COLOR_MAP: Record<string, string> = {
    purple: "text-purple-600 bg-purple-500/10",
    emerald: "text-emerald-600 bg-emerald-500/10",
    blue: "text-blue-600 bg-blue-500/10",
    amber: "text-amber-600 bg-amber-500/10",
  };

  return (
    <Card className="border-none shadow-xl shadow-primary/5 bg-card rounded-[1.5rem] overflow-hidden group">
      <CardContent className="p-5">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground">{title}</p>
            <p className="text-2xl font-black tabular-nums tracking-tight text-foreground">{value}</p>
            <p className="text-[10px] font-bold text-muted-foreground">{subtitle}</p>
          </div>
          <div className={cn("p-3 rounded-xl", COLOR_MAP[color])}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
