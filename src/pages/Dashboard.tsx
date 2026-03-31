/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
 ======================================================================== */

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Calendar, Users, FileCheck, TrendingUp, Clock, MapPin, Package, RefreshCcw } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { NextVisitSuggestions } from "@/components/dashboard/NextVisitSuggestions";
import { InventoryAlerts } from "@/components/dashboard/InventoryAlerts";
import { ProcessAlerts } from "@/components/dashboard/ProcessAlerts";
import { SmartAssistant } from "@/components/dashboard/SmartAssistant";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AutoAssignmentPanel } from "@/components/dashboard/AutoAssignmentPanel";
import { refreshObjectivesProgress } from "@/services/objectiveService";
import { useDemoData } from "@/contexts/MockDataProvider";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { OnlineStatusIndicator } from "@/components/common/OnlineStatusIndicator";

export default function Dashboard() {
  const { user, role, isManager, isCoordinator, isAdmin, isMaster, isSystemAdmin, organizationName } = useAuth();
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

    const syncTimer = setInterval(() => {
      setLastSync(localStorage.getItem('lastSyncTime'));
    }, 5000);

    return () => {
      clearInterval(timer);
      clearInterval(syncTimer);
    };
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
      const showGlobalData = isManager || isAdmin || isMaster;

      let visitsTodayQuery = supabase
        .from('visits')
        .select('*, contacts(*)')
        .gte('scheduled_date', todayStart)
        .lte('scheduled_date', todayEnd);

      if (!showGlobalData && user?.id) {
        visitsTodayQuery = visitsTodayQuery.eq('user_id', user.id);
      }

      const { data: visitsTodayData } = await visitsTodayQuery.order('scheduled_date', { ascending: true });
      const visitsTodayCount = visitsTodayData?.length || 0;
      const visitsConfirmedCount = visitsTodayData?.filter(v => (v.status as string) === 'confirmed').length || 0;

      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      let doctorsQuery = supabase
        .from('visits')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed')
        .gte('actual_start_time', startOfWeek.toISOString());

      if (!showGlobalData && user?.id) {
        doctorsQuery = doctorsQuery.eq('user_id', user.id);
      }

      const { count: doctorsContactedCount } = await doctorsQuery;
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      let reportsQuery = supabase
        .from('visits')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed')
        .gte('actual_start_time', startOfMonth);

      if (!showGlobalData && user?.id) {
        reportsQuery = reportsQuery.eq('user_id', user.id);
      }

      const { count: reportsCount } = await reportsQuery;

      let objectivesQuery = supabase
        .from('objectives')
        .select('*')
        .eq('status', 'active');

      if (!showGlobalData && user?.id) {
        objectivesQuery = objectivesQuery.eq('user_id', user.id);
      }

      const { data: objectiveData } = await objectivesQuery;
      const avgProgress = objectiveData && objectiveData.length > 0
        ? objectiveData.reduce((acc, o) => acc + Math.min((o.current_value / o.target_value) * 100, 100), 0) / objectiveData.length
        : 78;

      setStats({
        visitsToday: visitsTodayCount,
        visitsTodayConfirmed: visitsConfirmedCount,
        doctorsContactedWeek: doctorsContactedCount || 0,
        reportsCompletedMonth: reportsCount || 0,
        monthlyGoal: Math.round(avgProgress)
      });

      setUpcomingVisits(visitsTodayData?.slice(0, 3) || []);

      let recentQuery = supabase
        .from('visits')
        .select('*, contacts(*)')
        .eq('status', 'completed');

      if (!showGlobalData && user?.id) {
        recentQuery = recentQuery.eq('user_id', user.id);
      }

      const { data: recentVisits } = await recentQuery
        .order('actual_start_time', { ascending: false })
        .limit(5);

      setRecentActivity(recentVisits || []);

    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const getUserName = () => {
    if (profile?.first_name || profile?.last_name) {
      return `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
    }
    if (user?.email) {
      const emailName = user.email.split('@')[0];
      return emailName
        .split(/[._]/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
    return 'Usuario';
  };

  const getRoleLabel = (r: string) => {
    switch (r) {
      case 'master': return 'System Admin';
      case 'admin': return 'Administrador';
      case 'manager': return 'Gerente';
      case 'coordinator': return 'Coordinador';
      case 'supervisor': return 'Supervisor';
      case 'representative': return 'Representante';
      case 'telemarketing': return 'Telemarketing';
      case 'doctor': return 'Médico';
      default: return 'Usuario';
    }
  };

  return (
    <div className="space-y-6">
      {/* Alpha BMT Style Header - Redesigned with Mesh Gradient & Premium Glassmorphism */}
      <header className="px-6 pt-10 pb-12 relative overflow-hidden -mx-4 -mt-10 mb-10 mesh-gradient-primary rounded-b-[3rem] shadow-2xl">
        {/* Decorative Mesh Circles */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-secondary/20 rounded-full -mr-48 -mt-48 blur-[120px] animate-pulse pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-white/10 rounded-full -ml-32 -mb-32 blur-[100px] animate-pulse delay-700 pointer-events-none"></div>

        {/* Top Row: Greeting + Status + Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-10 relative z-10">
          <div className="flex items-center gap-6">
            <div className="relative group">
              <div className="absolute -inset-1.5 bg-gradient-to-br from-white/60 to-secondary/60 rounded-[2rem] blur-xl opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative w-24 h-24 bg-white/10 backdrop-blur-xl rounded-[2rem] flex items-center justify-center border border-white/30 shadow-2xl overflow-hidden group-hover:scale-105 transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent"></div>
                <span className="text-4xl font-black text-white drop-shadow-md">
                  {(user?.email || "?")[0].toUpperCase()}
                </span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="h-2 w-2 rounded-full bg-emerald-400 animate-ping shadow-[0_0_12px_rgba(52,211,153,0.8)]"></div>
                <p className="text-secondary-foreground/80 text-[10px] font-black uppercase tracking-[0.25em] drop-shadow-sm">SISTEMA INTELIGENTE ACTIVO</p>
              </div>
              <h1 className="text-4xl font-extrabold text-white tracking-tight drop-shadow-lg mb-1">
                Hola, {getUserName()}
              </h1>
              <div className="flex items-center gap-2.5 mt-2 flex-wrap">
                <Badge variant="secondary" className="bg-white/15 text-white hover:bg-white/25 border border-white/20 text-[10px] px-3 py-1 font-black backdrop-blur-md rounded-full">
                  {getRoleLabel(role)}
                </Badge>
                {isSystemAdmin && (
                  <Badge variant="outline" className="bg-white/10 text-white border-white/20 text-[10px] px-3 py-1 uppercase font-black tracking-widest rounded-full">
                    GOD MODE
                  </Badge>
                )}
                {organizationName && !isSystemAdmin && (
                  <Badge variant="outline" className="text-white border-white/20 bg-white/5 text-[10px] px-3 py-1 capitalize font-bold rounded-full">
                    {organizationName}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 px-6 py-4 rounded-3xl bg-black/5 backdrop-blur-md border border-white/10 shadow-inner group transition-all hover:bg-black/10">
            <div className="text-5xl font-mono font-black tracking-tighter text-white tabular-nums drop-shadow-2xl">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              <span className="text-2xl opacity-50 ml-1 animate-pulse">
                {currentTime.toLocaleTimeString([], { second: '2-digit' })}
              </span>
            </div>
            <div className="text-[11px] text-white/50 uppercase tracking-[0.2em] font-black text-right w-full">
              {currentTime.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
            </div>
          </div>
        </div>

        {/* Sync Info Bar */}
        <div className="flex flex-wrap items-center gap-6 py-4 px-6 bg-white/5 rounded-[2rem] border border-white/10 backdrop-blur-xl shadow-lg relative z-10 transition-all hover:bg-white/10">
          <div className="flex items-center gap-3 text-xs">
            <div className="p-2 rounded-xl bg-white/10">
              <RefreshCcw className={`h-4 w-4 text-secondary ${isSyncing ? 'animate-spin' : ''}`} />
            </div>
            <div className="flex flex-col">
              <span className="text-white/40 text-[9px] font-black uppercase tracking-widest">Última Sinc</span>
              <span className="text-white font-black">
                {lastSync ? new Date(lastSync).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Sincronizando...'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3 border-l border-white/10 pl-6 h-8">
            <OnlineStatusIndicator />
          </div>
          <div className="ml-auto flex items-center gap-4">
            <div className="h-10 w-px bg-white/10 hidden sm:block"></div>
            <div className="text-right">
              <p className="text-white font-black text-sm">
                {stats.visitsToday} <span className="text-white/40 font-bold ml-1">VISITAS HOY</span>
              </p>
              <p className="text-[10px] text-secondary font-black uppercase tracking-tighter">
                {stats.visitsTodayConfirmed} CONFIRMADAS
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Process Alerts */}
      <ProcessAlerts />

      {/* AI Smart Assistant */}
      <SmartAssistant />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Visitas de Hoy"
          value={stats.visitsToday}
          subtitle={`${stats.visitsTodayConfirmed} confirmadas`}
          icon={Calendar}
          variant="primary"
          trending={12}
        />
        <StatsCard
          title="Médicos Contactados"
          value={stats.doctorsContactedWeek}
          subtitle="Esta semana"
          icon={Users}
          variant="success"
          trending={8}
        />
        <StatsCard
          title="Reportes Completados"
          value={stats.reportsCompletedMonth}
          subtitle="Este mes"
          icon={FileCheck}
          variant="default"
          trending={15}
        />
        <StatsCard
          title="Objetivo Mensual"
          value={`${stats.monthlyGoal}%`}
          subtitle="Calculado"
          icon={TrendingUp}
          variant="warning"
          trending={5}
        />
      </div>

      {/* Row 1: Upcoming Visits & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <Card className="medical-card h-full">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="mr-2 h-5 w-5 icon-medical" />
              Próximas Visitas (Hoy)
            </CardTitle>
            <CardDescription>
              Tus visitas programadas para el día de hoy
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingVisits.length > 0 ? (
                upcomingVisits.map((visit) => (
                  <div key={visit.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-foreground">{visit.contacts?.name || "Sin contacto"}</p>
                        <Badge
                          variant={visit.status === 'completed' ? 'success' : visit.status === 'confirmed' ? 'secondary' : 'outline'}
                          className="text-[10px] font-bold"
                        >
                          {visit.status === 'confirmed' ? 'Confirmada' :
                            visit.status === 'completed' ? 'Completada' : 'Pendiente'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{visit.contacts?.specialty || "General"}</p>
                      <div className="flex items-center text-xs text-muted-foreground mt-1">
                        <MapPin className="h-3 w-3 mr-1" />
                        {visit.contacts?.address || "Consultorio Privado"}
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-lg font-bold text-primary">
                        {new Date(visit.scheduled_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <p>No tienes visitas programadas para hoy.</p>
                  <Button variant="link" asChild className="mt-2 text-primary font-bold">
                    <Link to="/agenda">Ir a la Agenda</Link>
                  </Button>
                </div>
              )}
            </div>
            {upcomingVisits.length > 0 && (
              <Button className="w-full mt-4 btn-medical" asChild>
                <Link to="/visitas">Ver Todas las Visitas</Link>
              </Button>
            )}
          </CardContent>
        </Card>

        <Card className="medical-card h-full">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="mr-2 h-5 w-5 icon-success" />
              Actividad Reciente
            </CardTitle>
            <CardDescription>
              Últimas visitas completadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 bg-muted/50 rounded-lg transition-all hover:bg-muted">
                    <div className="w-2 h-2 bg-success rounded-full mt-2 ring-2 ring-success/20"></div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-800">
                        Visita completada - {activity.contacts?.name}
                      </p>
                      <p className="text-[11px] text-slate-500 font-medium">
                        {new Date(activity.actual_start_time || activity.scheduled_date).toLocaleDateString()} - {new Date(activity.actual_start_time || activity.scheduled_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  No hay actividad reciente registrada.
                </div>
              )}
            </div>
            <Button variant="outline" className="w-full mt-4 border-slate-200 text-slate-600 font-bold rounded-xl" asChild>
              <Link to="/reportes">Ver Reportes</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <InventoryAlerts compact />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <NextVisitSuggestions className="h-full" />
        <Card className="medical-card h-full flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5 text-emerald-600" />
              Rendimiento del Mes
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 flex-1 flex flex-col items-center justify-between">
            <div className="flex flex-col items-center justify-center flex-1 py-4">
              <div className="relative w-32 h-32 flex items-center justify-center mb-4">
                 <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                    <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100" />
                    <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={364.4} strokeDashoffset={364.4 - (364.4 * stats.monthlyGoal) / 100} className="text-primary transition-all duration-1000 ease-out" strokeLinecap="round" />
                 </svg>
                 <span className="text-3xl font-black text-slate-900">{stats.monthlyGoal}%</span>
              </div>
              <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Objetivo Mensual</p>
            </div>
            <Button variant="outline" className="mt-4 w-full sm:w-auto border-slate-200 text-slate-600 font-bold rounded-xl" asChild>
              <Link to="/objectives">Ver Objetivos</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {(isManager || isCoordinator) && (
        <div className="mt-8">
          <AutoAssignmentPanel />
        </div>
      )}
    </div>
  );
}