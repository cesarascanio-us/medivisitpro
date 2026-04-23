/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
 
 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
 ======================================================================== */

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Calendar, Users, FileCheck, TrendingUp, 
  Clock, MapPin, Package, RefreshCcw,
  Zap, ChevronRight, Activity, Bell
} from "lucide-react";
import { NextVisitSuggestions } from "@/components/dashboard/NextVisitSuggestions";
import { InventoryAlerts } from "@/components/dashboard/InventoryAlerts";
import { ProcessAlerts } from "@/components/dashboard/ProcessAlerts";
import { SmartAssistant } from "@/components/dashboard/SmartAssistant";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AutoAssignmentPanel } from "@/components/dashboard/AutoAssignmentPanel";
import { refreshObjectivesProgress } from "@/services/objectiveService";
import { useDemoData } from "@/contexts/MockDataProvider";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { OnlineStatusIndicator } from "@/components/common/OnlineStatusIndicator";
import { EliteHeader, EliteKPICard } from "@/components/layout/DesignSystem";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const { user, role, isManager, isAdmin, isMaster, isCoordinator, isSupervisor, isTelemarketing, companyId, organizationName, organizationId } = useAuth();
  const navigate = useNavigate();
  const showGlobalData = isManager || isAdmin || isMaster;
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  const getDashboardTitle = () => {
    if (isMaster || isAdmin) return "Consola de Mando Global";
    if (isManager) return "Centro de Mando Gerencial";
    if (isCoordinator || isSupervisor) return "Panel de Mando Estratégico";
    if (isTelemarketing) return "Central de Operaciones TM";
    return "Panel de Mando Táctico";
  };

  const getDashboardBadge = () => {
    if (isMaster) return "Sovereign Master";
    if (isAdmin) return "Admin Elite";
    if (isManager) return "Gerencial CA";
    if (isCoordinator) return "Coordinador";
    if (isSupervisor) return "Supervisor";
    if (isTelemarketing) return "Telemarketing";
    return "Representante";
  };

  const getWelcomeName = () => {
    return user?.email?.split('@')[0] || 'Representante';
  };

  const [stats, setStats] = useState({
    visitsToday: 0,
    visitsTodayConfirmed: 0,
    doctorsContactedWeek: 0,
    reportsCompletedMonth: 0,
    monthlyGoal: 78
  });

  const [upcomingVisits, setUpcomingVisits] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const { isOnline } = useOfflineSync();
  const demoData = useDemoData();

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      if (demoData) {
        setProfile({ first_name: 'Usuario', last_name: 'Demo' });
        setStats({
          visitsToday: Math.round(demoData.dashboardStats.total_visits / 10),
          visitsTodayConfirmed: Math.round(demoData.dashboardStats.total_visits / 12),
          doctorsContactedWeek: demoData.dashboardStats.active_doctors,
          reportsCompletedMonth: demoData.dashboardStats.total_visits,
          monthlyGoal: Math.round(demoData.dashboardStats.coverage)
        });
        setUpcomingVisits(demoData.visits.slice(0, 3));
        setRecentActivity(demoData.visits.filter((v: any) => v.status === 'completed').slice(0, 5));
        setLoading(false);
        return;
      }

      if (user?.id) {
        await refreshObjectivesProgress(user.id);
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();
      setProfile(profileData);

      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).toISOString();

      const [visitsRes, doctorsRes, reportsRes, objectivesRes] = await Promise.all([
        (() => {
          let q = supabase.from('visits').select('status');
          q = q.gte('scheduled_date', todayStart).lte('scheduled_date', todayEnd);
          if (!isMaster && companyId) q = q.eq('company_id', companyId);
          if (!showGlobalData && user?.id) q = q.eq('user_id', user.id);
          return q;
        })(),
        (() => {
          const startOfWeek = new Date(now);
          startOfWeek.setDate(now.getDate() - now.getDay());
          startOfWeek.setHours(0, 0, 0, 0);
          let q = supabase.from('visits').select('id', { count: 'exact', head: true });
          q = q.eq('status', 'completed').gte('actual_start_time', startOfWeek.toISOString());
          if (!isMaster && companyId) q = q.eq('company_id', companyId);
          if (!showGlobalData && user?.id) q = q.eq('user_id', user.id);
          return q;
        })(),
        (() => {
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
          let q = supabase.from('visits').select('id', { count: 'exact', head: true });
          q = q.eq('status', 'completed').gte('actual_start_time', startOfMonth);
          if (!isMaster && companyId) q = q.eq('company_id', companyId);
          if (!showGlobalData && user?.id) q = q.eq('user_id', user.id);
          return q;
        })(),
        (() => {
          let q = supabase.from('objectives').select('*').eq('status', 'active');
          if (!isMaster && companyId) q = q.eq('company_id', companyId);
          if (!showGlobalData && user?.id) q = q.eq('user_id', user.id);
          return q;
        })()
      ]);

      const visitsToday = visitsRes.data || [];
      const avgProgress = objectivesRes.data && objectivesRes.data.length > 0
        ? objectivesRes.data.reduce((acc, o) => acc + Math.min((o.current_value / o.target_value) * 100, 100), 0) / objectivesRes.data.length
        : 78;

      setStats({
        visitsToday: visitsToday.length,
        visitsTodayConfirmed: visitsToday.filter(v => v.status === 'confirmed').length,
        doctorsContactedWeek: doctorsRes.count || 0,
        reportsCompletedMonth: reportsRes.count || 0,
        monthlyGoal: Math.round(avgProgress)
      });

      // Resolve Upcoming Visits Omnichannel
      let upcomingQ = supabase.from('visits').select('*').gte('scheduled_date', todayStart).lte('scheduled_date', todayEnd);
      if (!isMaster && companyId) upcomingQ = upcomingQ.eq('company_id', companyId);
      if (!showGlobalData && user?.id) upcomingQ = upcomingQ.eq('user_id', user.id);
      const { data: upcomingData } = await upcomingQ.order('scheduled_date', { ascending: true }).limit(3);
      
      const vIds = Array.from(new Set(upcomingData?.map(v => v.contact_id) || []));

      // Resolve Recent activity Omnichannel
      let recentQ = supabase.from('visits').select('*').eq('status', 'completed');
      if (!isMaster && companyId) recentQ = recentQ.eq('company_id', companyId);
      if (!showGlobalData && user?.id) recentQ = recentQ.eq('user_id', user.id);
      const { data: recentVisits } = await recentQ.order('actual_start_time', { ascending: false }).limit(5);

      const rIds = Array.from(new Set(recentVisits?.map(v => v.contact_id) || []));
      const allContactIds = Array.from(new Set([...vIds, ...rIds]));

      if (allContactIds.length > 0) {
        const { data: contactsData } = await supabase.from('unified_contacts').select('*').in('id', allContactIds);
        
        setUpcomingVisits(upcomingData?.map(v => ({
          ...v,
          contacts: contactsData?.find(c => c.id === v.contact_id)
        })) || []);

        setRecentActivity(recentVisits?.map(v => ({
          ...v,
          contacts: contactsData?.find(c => c.id === v.contact_id)
        })) || []);
      } else {
        setUpcomingVisits(upcomingData || []);
        setRecentActivity(recentVisits || []);
      }

    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

    return (
    <div className="space-y-10 pb-10 font-display animate-in fade-in duration-700">
      
      {/* HEADER ELITE - CENTRO DE MANDO ESTRATÉGICO */}
      <EliteHeader 
        title={getDashboardTitle()}
        subtitle={`Operatividad: ${organizationName || 'MediVisitPro Global'}`}
        icon={Zap}
        badgeText={getDashboardBadge()}
        statusText={isOnline ? "Sincronización Cloud Activa" : "Modo Offline: Almacén Local"}
        statusColor={isOnline ? "bg-emerald-500" : "bg-amber-500"}
        rightContent={
          <div className="flex items-center gap-6">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Status Operativo</span>
              <span className="text-sm font-black text-slate-900 tracking-tight uppercase  mt-1">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div className="h-12 w-[1px] bg-slate-100 mx-2" />
            <div className="flex items-center gap-4 bg-card p-2 pr-6 rounded-2xl shadow-premium-sm border border-slate-100 group hover:shadow-premium-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 overflow-hidden group-hover:rotate-6 transition-transform">
                <span className="text-lg font-black text-primary uppercase">
                  {getWelcomeName().charAt(0)}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Comandante</span>
                <span className="text-xs font-black text-slate-900 tracking-tight uppercase mt-1">{getWelcomeName()}</span>
              </div>
            </div>
          </div>
        }
      />

      {/* KPI GRID ELITE INDUSTRIAL */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <EliteKPICard
          title={isTelemarketing ? "Citas de Hoy" : "Visitas Hoy"}
          value={stats.visitsToday}
          subtitle={`${stats.visitsTodayConfirmed} Confirmadas`}
          icon={isTelemarketing ? RefreshCcw : Calendar}
          trend={12}
          color="blue"
        />
        <EliteKPICard
          title={isManager || isCoordinator ? "Cobertura Equipo" : "Contactos Mes"}
          value={stats.doctorsContactedWeek}
          subtitle="Objetivo Trimestral"
          icon={Users}
          trend={8}
          color="indigo"
        />
        <EliteKPICard
          title={isTelemarketing ? "Conversión TM" : "Reportes OK"}
          value={stats.reportsCompletedMonth}
          subtitle="Sincronización Cloud"
          icon={isTelemarketing ? Zap : FileCheck}
          trend={-2}
          color="purple"
        />
        <EliteKPICard
          title="Meta Cumplimiento"
          value={`${Math.round((stats.reportsCompletedMonth / stats.monthlyGoal) * 100)}%`}
          subtitle={`Meta: ${stats.monthlyGoal}`}
          icon={TrendingUp}
          trend={5}
          color="emerald"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Columna Principal - Inteligencia de Campo */}
        <div className="lg:col-span-2 space-y-10">
          <section className="animate-in slide-in-from-bottom-5 duration-700">
            <div className="flex items-center justify-between mb-8 px-2">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-[1.2rem] bg-primary/5 flex items-center justify-center text-primary shadow-soft">
                    <Clock className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter font-display leading-tight">Misiones Programadas</h2>
                    <p className="text-slate-400 font-bold uppercase text-[9px] tracking-widest mt-1">Despliegue táctico para las próximas horas</p>
                  </div>
               </div>
               <Button variant="ghost" onClick={() => navigate('/visits')} className="text-[10px] font-black text-primary hover:bg-primary/5 rounded-xl px-4 py-6 uppercase flex items-center gap-2 group transition-all">
                 VER TODOS <ChevronRight className="h-4 w-4 group-hover:translate-x-1" />
               </Button>
            </div>
            
            <div className="grid gap-4">
              {loading ? (
                [1, 2, 3].map(i => <div key={i} className="h-28 w-full bg-card rounded-[2.5rem] border border-slate-100 animate-pulse shadow-soft"></div>)
              ) : upcomingVisits.length > 0 ? (
                upcomingVisits.map((visit) => (
                  <Card key={visit.id} className="border border-slate-100 bg-card shadow-premium-sm hover:shadow-premium-md hover:border-primary/20 transition-all duration-500 rounded-[2.5rem] overflow-hidden group cursor-pointer" onClick={() => navigate(`/visits?id=${visit.id}`)}>
                    <CardContent className="p-8">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                          <div className="h-16 w-16 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 shadow-inner group-hover:bg-primary group-hover:text-white transition-all duration-700">
                            <MapPin className="h-8 w-8 opacity-40 group-hover:opacity-100" />
                          </div>
                          <div className="space-y-1">
                            <h4 className="text-lg font-black text-slate-900 uppercase tracking-tighter font-display group-hover:text-primary transition-colors">
                              {visit.contacts?.full_name || 'OBJETIVO SIN IDENTIFICAR'}
                            </h4>
                            <div className="flex items-center gap-3">
                               <Badge className="bg-slate-50 text-slate-400 border-none font-black text-[9px] uppercase tracking-widest px-3 py-1">
                                 {new Date(visit.scheduled_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                               </Badge>
                               <Badge className="bg-primary/5 text-primary border-none font-black text-[9px] uppercase tracking-widest px-3 py-1">
                                 {visit.contacts?.category || 'TIER-1'}
                               </Badge>
                            </div>
                          </div>
                        </div>
                        <Badge className={cn(
                          "px-6 py-2 rounded-full text-[10px] font-black tracking-widest border border-transparent shadow-sm",
                          visit.status === 'confirmed' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"
                        )}>
                          {visit.status === 'confirmed' ? 'LOG_CONFIRMED' : 'LOG_SCHEDULED'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="bg-card border border-slate-100 rounded-[3rem] p-24 text-center shadow-premium-sm">
                   <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                      <Calendar className="h-10 w-10 text-slate-200" />
                   </div>
                   <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter mb-2 font-display">Zona Despejada</h3>
                   <p className="text-slate-400 font-bold uppercase text-[9px] tracking-widest">No existen misiones programadas para el ciclo actual</p>
                </div>
              )}
            </div>
          </section>

          <section className="animate-in slide-in-from-bottom-10 duration-1000">
            <div className="flex items-center gap-4 mb-8 px-2">
                <div className="w-12 h-12 rounded-[1.2rem] bg-emerald-500/5 flex items-center justify-center text-emerald-600 shadow-soft">
                  <Activity className="h-6 w-6" />
                </div>
                <div>
                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter font-display leading-tight">Monitor de Actividad</h2>
                    <p className="text-slate-400 font-bold uppercase text-[9px] tracking-widest mt-1">Telemetría de campo en tiempo real</p>
                </div>
            </div>
            <Card className="border border-slate-100 bg-card shadow-premium-lg rounded-[3rem] p-10 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full -mr-32 -mt-32 blur-3xl" />
               {recentActivity.length > 0 ? (
                 <div className="space-y-10 relative z-10">
                   {recentActivity.map((activity, idx) => (
                     <div key={activity.id} className="flex gap-8 relative group">
                        {idx !== recentActivity.length - 1 && (
                          <div className="absolute left-4 top-10 bottom-[-2.5rem] w-[2px] bg-slate-100" />
                        )}
                        <div className="h-8 w-8 rounded-full bg-card border-2 border-emerald-500 flex items-center justify-center relative z-10 transition-transform group-hover:scale-125 shadow-sm">
                           <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        </div>
                        <div className="flex-1 space-y-1">
                           <p className="text-sm text-slate-900 font-black uppercase tracking-tight font-display">
                             MISIÓN COMPLETADA: <span className="text-emerald-600">{activity.contacts?.full_name}</span>
                           </p>
                           <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black flex items-center gap-3">
                             {new Date(activity.actual_start_time || activity.created_at).toLocaleString()} 
                             <span className="w-1 h-1 bg-slate-200 rounded-full" />
                             <Badge variant="outline" className="text-[8px] border-emerald-200 text-emerald-500 bg-emerald-50 font-black px-2 py-0">TELEMETRÍA_OK</Badge>
                           </p>
                        </div>
                     </div>
                   ))}
                 </div>
               ) : (
                 <div className="text-center py-16 opacity-30">
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Sin telemetría reciente en el sector</p>
                 </div>
               )}
            </Card>
          </section>
        </div>

        {/* Sidebar Élite - Inteligencia Artificial & Alertas */}
        <div className="space-y-10">
          <div className="animate-in fade-in slide-in-from-right duration-1000 delay-200">
             <SmartAssistant />
          </div>
          <div className="animate-in fade-in slide-in-from-right duration-1000 delay-400">
             <InventoryAlerts />
          </div>
          <div className="animate-in fade-in slide-in-from-right duration-1000 delay-600">
             <ProcessAlerts />
          </div>
          {isManager && (
            <div className="animate-in fade-in slide-in-from-right duration-1000 delay-700">
               <AutoAssignmentPanel />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
