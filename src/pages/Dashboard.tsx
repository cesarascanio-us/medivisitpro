/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
 
 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
 ======================================================================== */

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
  const { user, role, isManager, isAdmin, isMaster, companyId, organizationName } = useAuth();
  const showGlobalData = isManager || isAdmin || isMaster;
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

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
  const [lastSync, setLastSync] = useState<string | null>(localStorage.getItem('lastSyncTime'));

  const { isOnline, pendingCount, isSyncing, forceSync } = useOfflineSync();
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

      // INDUSTRIAL KPI CONSOLIDATION (Dual ID Protocol)
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).toISOString();

      // Optimize: Parallel fetching with company_id isolation
      const [visitsRes, doctorsRes, reportsRes, objectivesRes] = await Promise.all([
        // Visits Today
        (() => {
          let q = supabase.from('visits').select('status');
          q = q.gte('scheduled_date', todayStart).lte('scheduled_date', todayEnd);
          if (!isMaster && companyId) q = q.eq('company_id', companyId);
          if (!showGlobalData && user?.id) q = q.eq('user_id', user.id);
          return q;
        })(),
        // Doctors Week
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
        // Reports Month
        (() => {
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
          let q = supabase.from('visits').select('id', { count: 'exact', head: true });
          q = q.eq('status', 'completed').gte('actual_start_time', startOfMonth);
          if (!isMaster && companyId) q = q.eq('company_id', companyId);
          if (!showGlobalData && user?.id) q = q.eq('user_id', user.id);
          return q;
        })(),
        // Objectives
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

      // Lists
      let upcomingQ = supabase.from('visits').select('*, contacts(*)').gte('scheduled_date', todayStart).lte('scheduled_date', todayEnd);
      if (!isMaster && companyId) upcomingQ = upcomingQ.eq('company_id', companyId);
      if (!showGlobalData && user?.id) upcomingQ = upcomingQ.eq('user_id', user.id);
      const { data: upcomingData } = await upcomingQ.order('scheduled_date', { ascending: true }).limit(3);
      setUpcomingVisits(upcomingData || []);

      let recentQ = supabase.from('visits').select('*, contacts(*)').eq('status', 'completed');
      if (!isMaster && companyId) recentQ = recentQ.eq('company_id', companyId);
      if (!showGlobalData && user?.id) recentQ = recentQ.eq('user_id', user.id);
      const { data: recentVisits } = await recentQ.order('actual_start_time', { ascending: false }).limit(5);
      setRecentActivity(recentVisits || []);

    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const getUserName = () => {
    if (profile?.full_name) return profile.full_name;
    if (profile?.first_name) return `${profile.first_name} ${profile.last_name || ''}`;
    return user?.email?.split('@')[0] || 'Representante';
  };

  return (
    <div className="space-y-8 pb-10">
      {/* ELITE HEADER */}
      <EliteHeader 
        title={`Bienvenido, ${getUserName()}`}
        subtitle={`${organizationName || 'MediVisitPro Premier'} | ${currentTime.toLocaleDateString()} ${currentTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`}
        icon={<Zap className="h-8 w-8 text-amber-500 fill-amber-500/20" />}
        rightContent={
          <div className="flex items-center gap-3">
             <OnlineStatusIndicator />
             <Button variant="outline" size="icon" className="rounded-full border-white/10 hover:bg-white/5 relative">
                <Bell className="h-5 w-5 text-slate-400" />
                <span className="absolute top-0 right-0 h-2 w-2 bg-rose-500 rounded-full border-2 border-slate-950"></span>
             </Button>
          </div>
        }
      />

      {/* ELITE KPI STRIP */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <EliteKPICard 
          title="Visitas Hoy"
          value={stats.visitsToday.toString()}
          icon={<Calendar className="h-5 w-5" />}
          trend={`${stats.visitsTodayConfirmed} confirmadas`}
          description="Agenda diaria activa"
        />
        <EliteKPICard 
          title="Cobertura Semanal"
          value={stats.doctorsContactedWeek.toString()}
          icon={<Users className="h-5 w-5" />}
          trend="+12%"
          description="Médicos contactados"
        />
        <EliteKPICard 
          title="Reportes Mes"
          value={stats.reportsCompletedMonth.toString()}
          icon={<FileCheck className="h-5 w-5" />}
          trend="En tiempo"
          description="Carga operacional"
        />
        <EliteKPICard 
          title="Alcance Objetivo"
          value={`${stats.monthlyGoal}%`}
          icon={<TrendingUp className="h-5 w-5" />}
          trend={stats.monthlyGoal >= 70 ? "Sobre la media" : "Bajo la media"}
          trendPositive={stats.monthlyGoal >= 70}
          description="Progreso de cuota"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-8">
          <section>
            <div className="flex items-center justify-between mb-4">
               <h2 className="text-xl font-bold text-white flex items-center gap-2">
                 <Clock className="h-5 w-5 text-indigo-400" />
                 Próximas Visitas
               </h2>
               <Link to="/visits" className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1 group">
                 Ver agenda <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
               </Link>
            </div>
            
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => <div key={i} className="h-24 w-full bg-white/5 rounded-2xl animate-pulse"></div>)}
              </div>
            ) : upcomingVisits.length > 0 ? (
              <div className="space-y-4">
                {upcomingVisits.map((visit) => (
                  <Card key={visit.id} className="bg-slate-900/40 border-white/5 hover:border-white/10 transition-all group overflow-hidden">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                            <MapPin className="h-6 w-6 text-indigo-400" />
                          </div>
                          <div>
                            <h4 className="font-bold text-white group-hover:text-indigo-400 transition-colors uppercase tracking-tight">
                              {visit.contacts?.full_name || 'Médico no especificado'}
                            </h4>
                            <p className="text-sm text-slate-400 flex items-center gap-2">
                              {new Date(visit.scheduled_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {visit.contacts?.category || 'General'}
                            </p>
                          </div>
                        </div>
                        <Badge className={cn(
                          "px-3 py-1 rounded-full text-[10px] uppercase font-black tracking-widest",
                          visit.status === 'confirmed' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                        )}>
                          {visit.status === 'confirmed' ? 'Confirmado' : 'Pendiente'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="bg-slate-900/40 border border-dashed border-white/10 rounded-2xl p-10 text-center">
                 <Calendar className="h-10 w-10 text-slate-500 mx-auto mb-4 opacity-20" />
                 <p className="text-slate-400">No hay visitas programadas para hoy.</p>
              </div>
            )}
          </section>

          <section>
            <div className="flex items-center justify-between mb-4">
               <h2 className="text-xl font-bold text-white flex items-center gap-2">
                 <Activity className="h-5 w-5 text-emerald-400" />
                 Actividad Reciente
               </h2>
            </div>
            <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-6">
               {recentActivity.length > 0 ? (
                 <div className="space-y-6">
                   {recentActivity.map((activity, idx) => (
                     <div key={activity.id} className="flex gap-4 relative">
                        {idx !== recentActivity.length - 1 && (
                          <div className="absolute left-2.5 top-6 bottom-0 w-0.5 bg-white/5"></div>
                        )}
                        <div className="h-5 w-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center relative z-10 mt-1">
                           <div className="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>
                        </div>
                        <div>
                           <p className="text-sm text-white font-medium">
                             Reporte completado: <span className="text-emerald-400">{activity.contacts?.full_name}</span>
                           </p>
                           <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">
                             {new Date(activity.actual_start_time || activity.created_at).toLocaleString()}
                           </p>
                        </div>
                     </div>
                   ))}
                 </div>
               ) : (
                 <p className="text-slate-500 text-sm text-center py-4">Sin actividad reciente registrada.</p>
               )}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          <SmartAssistant />
          <InventoryAlerts />
          <ProcessAlerts />
          {isManager && <AutoAssignmentPanel />}
        </div>
      </div>
    </div>
  );
}