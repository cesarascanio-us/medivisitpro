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
    if (isMaster || isAdmin) return "Panel de Control Global";
    if (isManager) return "Resumen Gerencial";
    if (isCoordinator || isSupervisor) return "Vista Estratégica";
    if (isTelemarketing) return "Operaciones Telemarketing";
    return "Mi Actividad Diaria";
  };

  const getDashboardBadge = () => {
    if (isMaster) return "Master";
    if (isAdmin) return "Administrador";
    if (isManager) return "Gerente";
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
    <div className="space-y-6 pb-10 font-display animate-in fade-in duration-700">
      
      <EliteHeader 
        title={getDashboardTitle()}
        subtitle={`${organizationName || 'MediVisitPro'}`}
        icon={Activity}
        badgeText={getDashboardBadge()}
        statusText={isOnline ? "Conectado" : "Modo Offline"}
        statusColor={isOnline ? "bg-emerald-500" : "bg-amber-500"}
        rightContent={
          <div className="flex items-center gap-2 md:gap-6">
            <div className="hidden lg:flex flex-col items-end">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Sincronización</span>
              <span className="text-xs font-bold text-foreground tracking-tight mt-1">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div className="hidden sm:block h-8 w-[1px] bg-slate-200 dark:bg-slate-800 mx-1 md:mx-2" />
            <div className="flex items-center gap-2 md:gap-3 bg-slate-50 dark:bg-slate-900 p-1.5 md:pr-4 rounded-xl border border-slate-100 dark:border-slate-800 transition-all">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                <span className="text-sm md:text-base font-bold text-primary uppercase">
                  {getWelcomeName().charAt(0)}
                </span>
              </div>
              <div className="hidden xs:flex flex-col">
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider leading-none">Perfil</span>
                <span className="text-[11px] md:text-xs font-bold text-foreground tracking-tight mt-1 truncate max-w-[80px] md:max-w-none">{getWelcomeName()}</span>
              </div>
            </div>
          </div>
        }
      />

      {/* KPI GRID ELITE INDUSTRIAL */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <EliteKPICard
          title={isTelemarketing ? "Citas hoy" : "Visitas hoy"}
          value={stats.visitsToday}
          subtitle={`${stats.visitsTodayConfirmed} confirmadas`}
          icon={isTelemarketing ? RefreshCcw : Calendar}
          trend={12}
          color="blue"
        />
        <EliteKPICard
          title={isManager || isCoordinator ? "Equipo" : "Contactos"}
          value={stats.doctorsContactedWeek}
          subtitle="Objetivo trim."
          icon={Users}
          trend={8}
          color="indigo"
        />
        <EliteKPICard
          title={isTelemarketing ? "Conv." : "Reportes"}
          value={stats.reportsCompletedMonth}
          subtitle="Sincronizado"
          icon={isTelemarketing ? Zap : FileCheck}
          trend={-2}
          color="purple"
        />
        <EliteKPICard
          title="Cumplimiento"
          value={`${Math.round((stats.reportsCompletedMonth / stats.monthlyGoal) * 100)}%`}
          subtitle={`Meta: ${stats.monthlyGoal}`}
          icon={TrendingUp}
          trend={5}
          color="emerald"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna Principal - Inteligencia de Campo */}
        <div className="lg:col-span-2 space-y-8">
          <section className="animate-in slide-in-from-bottom-5 duration-700">
            <div className="flex items-center justify-between mb-6 px-2">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground tracking-tight">Próximas Visitas</h2>
                    <p className="text-slate-400 text-xs font-medium">Planificación para las próximas horas</p>
                  </div>
               </div>
               <Button variant="ghost" onClick={() => navigate('/visits')} className="text-xs font-bold text-primary hover:bg-primary/5 rounded-lg px-3 py-1 flex items-center gap-2 group transition-all">
                 Ver todas <ChevronRight className="h-4 w-4 group-hover:translate-x-1" />
               </Button>
            </div>
            
            <div className="grid gap-3">
              {loading ? (
                [1, 2, 3].map(i => <div key={i} className="h-24 w-full bg-card rounded-2xl border border-slate-100 animate-pulse"></div>)
              ) : upcomingVisits.length > 0 ? (
                upcomingVisits.map((visit) => (
                  <Card key={visit.id} className="border border-slate-100 dark:border-slate-800 bg-card shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300 rounded-2xl overflow-hidden group cursor-pointer" onClick={() => navigate(`/visits?id=${visit.id}`)}>
                    <CardContent className="p-4 md:p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center border border-slate-100 dark:border-slate-800 group-hover:bg-primary group-hover:text-white transition-all text-slate-400">
                            <MapPin className="h-5 w-5 md:h-6 md:w-6" />
                          </div>
                          <div className="space-y-0.5">
                            <h4 className="text-sm md:text-base font-bold text-foreground tracking-tight group-hover:text-primary transition-colors truncate max-w-[150px] md:max-w-none">
                              {visit.contacts?.full_name || 'Sin identificar'}
                            </h4>
                            <div className="flex items-center gap-2">
                               <Badge className="bg-slate-50 dark:bg-slate-900 text-slate-500 border-none font-bold text-[9px] md:text-[10px] px-2 py-0.5">
                                 {new Date(visit.scheduled_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                               </Badge>
                               <Badge className="bg-primary/5 text-primary border-none font-bold text-[9px] md:text-[10px] px-2 py-0.5">
                                 {visit.contacts?.category || 'General'}
                               </Badge>
                            </div>
                          </div>
                        </div>
                        <Badge className={cn(
                          "w-fit px-3 md:px-4 py-1 rounded-lg text-[9px] md:text-[10px] font-bold tracking-wide border border-transparent",
                          visit.status === 'confirmed' ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 border-emerald-100 dark:border-emerald-500/20" : "bg-amber-50 dark:bg-amber-500/10 text-amber-600 border-amber-100 dark:border-amber-500/20"
                        )}>
                          {visit.status === 'confirmed' ? 'Confirmada' : 'Programada'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="bg-card border border-slate-100 rounded-3xl p-16 text-center shadow-sm">
                   <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-200">
                      <Calendar className="h-8 w-8" />
                   </div>
                   <h3 className="text-lg font-bold text-foreground tracking-tight mb-1">Sin visitas pendientes</h3>
                   <p className="text-slate-400 text-xs font-medium">No hay misiones programadas para este periodo</p>
                </div>
              )}
            </div>
          </section>

          <section className="animate-in slide-in-from-bottom-10 duration-1000">
            <div className="flex items-center gap-4 mb-6 px-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/5 flex items-center justify-center text-emerald-600">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-foreground tracking-tight">Actividad Reciente</h2>
                    <p className="text-slate-400 text-xs font-medium">Historial de las últimas operaciones</p>
                </div>
            </div>
            <Card className="border border-slate-100 bg-card shadow-lg rounded-3xl p-8 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full -mr-32 -mt-32 blur-3xl" />
               {recentActivity.length > 0 ? (
                 <div className="space-y-8 relative z-10">
                   {recentActivity.map((activity, idx) => (
                     <div key={activity.id} className="flex gap-6 relative group">
                        {idx !== recentActivity.length - 1 && (
                          <div className="absolute left-[15px] top-8 bottom-[-2rem] w-[1px] bg-slate-100" />
                        )}
                        <div className="h-8 w-8 rounded-full bg-card border border-emerald-500 flex items-center justify-center relative z-10 shadow-sm">
                           <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        </div>
                        <div className="flex-1 space-y-0.5">
                           <p className="text-sm text-foreground font-bold tracking-tight">
                             Visita completada: <span className="text-emerald-600 font-extrabold">{activity.contacts?.full_name}</span>
                           </p>
                           <p className="text-[10px] text-slate-400 font-bold flex items-center gap-2">
                             {new Date(activity.actual_start_time || activity.created_at).toLocaleString()} 
                             <span className="w-1 h-1 bg-slate-200 rounded-full" />
                             <Badge variant="outline" className="text-[8px] border-emerald-100 text-emerald-500 bg-emerald-50 font-bold px-2 py-0">Sincronizado</Badge>
                           </p>
                        </div>
                     </div>
                   ))}
                 </div>
               ) : (
                 <div className="text-center py-12 opacity-30">
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Sin actividad reciente registrada</p>
                 </div>
               )}
            </Card>
          </section>
        </div>

        {/* Sidebar Élite - Inteligencia Artificial & Alertas */}
        <div className="space-y-8">
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
