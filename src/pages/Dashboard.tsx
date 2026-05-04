import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Calendar, Users, FileCheck, TrendingUp, 
  Clock, MapPin, RefreshCcw,
  Zap, ChevronRight, Activity
} from "lucide-react";
import { InventoryAlerts } from "@/components/dashboard/InventoryAlerts";
import { ProcessAlerts } from "@/components/dashboard/ProcessAlerts";
import { SmartAssistant } from "@/components/dashboard/SmartAssistant";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AutoAssignmentPanel } from "@/components/dashboard/AutoAssignmentPanel";
import { refreshObjectivesProgress } from "@/services/objectiveService";
import { useDemoData } from "@/contexts/MockDataProvider";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { EliteHeader, EliteKPICard } from "@/components/layout/DesignSystem";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const { user, isManager, isAdmin, isMaster, isCoordinator, isSupervisor, isTelemarketing, companyId, organizationName } = useAuth();
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
  
  const { isOnline } = useOfflineSync();
  const demoData = useDemoData();

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
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

      let upcomingQ = supabase.from('visits').select('*').gte('scheduled_date', todayStart).lte('scheduled_date', todayEnd);
      if (!isMaster && companyId) upcomingQ = upcomingQ.eq('company_id', companyId);
      if (!showGlobalData && user?.id) upcomingQ = upcomingQ.eq('user_id', user.id);
      const { data: upcomingData } = await upcomingQ.order('scheduled_date', { ascending: true }).limit(3);
      
      const vIds = Array.from(new Set(upcomingData?.map(v => v.contact_id) || []));

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
    <div className="space-y-10 pb-10 font-display animate-in fade-in duration-700 p-1">
      
      <EliteHeader 
        title={getDashboardTitle()}
        subtitle={`${organizationName || 'MediVisitPro'}`}
        icon={Activity}
        badgeText={getDashboardBadge()}
        statusText={isOnline ? "Conectado" : "Modo Offline"}
        statusColor={isOnline ? "bg-emerald-500" : "bg-amber-500"}
        rightContent={
          <div className="flex items-center gap-6">
            <div className="hidden lg:flex flex-col items-end">
              <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest leading-none">Reloj de Sistema</span>
              <span className="text-xs font-black text-foreground tracking-tight mt-1">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div className="hidden sm:block h-8 w-[1px] bg-border mx-2" />
            <div className="flex items-center gap-3 bg-muted/20 pr-4 pl-1.5 py-1.5 rounded-2xl border border-border transition-all shadow-inner">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-sm">
                <span className="text-base font-black text-primary uppercase">
                  {getWelcomeName().charAt(0)}
                </span>
              </div>
              <div className="hidden xs:flex flex-col">
                <span className="text-[8px] font-black text-muted-foreground uppercase tracking-wider leading-none">Operador Alpha</span>
                <span className="text-xs font-black text-foreground tracking-tight mt-1">{getWelcomeName()}</span>
              </div>
            </div>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
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
          color="blue"
        />
        <EliteKPICard
          title="Cumplimiento"
          value={`${Math.round((stats.reportsCompletedMonth / (stats.monthlyGoal || 1)) * 100)}%`}
          subtitle={`Meta: ${stats.monthlyGoal}`}
          icon={TrendingUp}
          trend={5}
          color="emerald"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          <section className="animate-in slide-in-from-bottom-5 duration-700">
            <div className="flex items-center justify-between mb-6 px-2">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-inner">
                    <Clock className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-foreground tracking-tighter uppercase font-display">Misiones Próximas</h2>
                    <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">Planificación de operaciones tácticas</p>
                  </div>
               </div>
               <Button variant="ghost" onClick={() => navigate('/visits')} className="text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/10 rounded-xl px-5 h-12 flex items-center gap-2 group transition-all">
                 Desplegar Todo <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
               </Button>
            </div>
            
            <div className="grid gap-4">
              {loading ? (
                [1, 2, 3].map(i => <div key={i} className="h-28 w-full bg-card rounded-[2.5rem] border border-border animate-pulse shadow-sm"></div>)
              ) : upcomingVisits.length > 0 ? (
                upcomingVisits.map((visit) => (
                  <Card key={visit.id} className="border border-border bg-card shadow-premium-sm hover:shadow-premium-md hover:border-primary/30 transition-all duration-500 rounded-[2.5rem] overflow-hidden group cursor-pointer" onClick={() => navigate(`/visits?id=${visit.id}`)}>
                    <CardContent className="p-6 md:p-8">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                          <div className="h-14 w-14 rounded-2xl bg-muted/20 flex items-center justify-center border border-border group-hover:bg-primary group-hover:text-white transition-all duration-500 text-muted-foreground shadow-inner">
                            <MapPin className="h-7 w-7" />
                          </div>
                          <div className="space-y-1">
                            <h4 className="text-lg font-black text-foreground tracking-tight group-hover:text-primary transition-colors uppercase font-display">
                              {visit.contacts?.full_name || 'Protocolo Desconocido'}
                            </h4>
                            <div className="flex items-center gap-3">
                               <Badge className="bg-muted/30 text-muted-foreground border-none font-black text-[9px] px-3 py-1 uppercase tracking-widest">
                                 {new Date(visit.scheduled_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                               </Badge>
                               <Badge className="bg-primary/10 text-primary border-none font-black text-[9px] px-3 py-1 uppercase tracking-widest">
                                 {visit.contacts?.category || 'General'}
                               </Badge>
                            </div>
                          </div>
                        </div>
                        <Badge className={cn(
                          "w-fit px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border",
                          visit.status === 'confirmed' ? "status-active" : "status-pending"
                        )}>
                          {visit.status === 'confirmed' ? 'Confirmada' : 'En Espera'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="bg-muted/10 border border-dashed border-border rounded-[3rem] p-24 text-center">
                   <div className="w-20 h-20 bg-card rounded-[2rem] shadow-soft border border-border flex items-center justify-center mx-auto mb-6 text-muted-foreground/20">
                      <Calendar className="h-10 w-10" />
                   </div>
                   <h3 className="text-xl font-black text-foreground tracking-tighter uppercase font-display mb-2">Sin misiones activas</h3>
                   <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">No hay despliegues programados para este periodo</p>
                </div>
              )}
            </div>
          </section>

          <section className="animate-in slide-in-from-bottom-10 duration-1000">
            <div className="flex items-center gap-4 mb-6 px-2">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20 shadow-inner">
                  <Activity className="h-6 w-6" />
                </div>
                <div>
                    <h2 className="text-2xl font-black text-foreground tracking-tighter uppercase font-display">Registro de Operaciones</h2>
                    <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">Historial de despliegues completados</p>
                </div>
            </div>
            <Card className="border border-border bg-card shadow-premium-lg rounded-[3rem] p-10 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full -mr-40 -mt-40 blur-[100px]" />
               {recentActivity.length > 0 ? (
                 <div className="space-y-10 relative z-10">
                   {recentActivity.map((activity, idx) => (
                     <div key={activity.id} className="flex gap-8 relative group">
                        {idx !== recentActivity.length - 1 && (
                          <div className="absolute left-[19px] top-10 bottom-[-2.5rem] w-[1px] bg-border/40" />
                        )}
                        <div className="h-10 w-10 rounded-full bg-card border-2 border-emerald-500 flex items-center justify-center relative z-10 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                           <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        </div>
                        <div className="flex-1 space-y-1">
                           <p className="text-base text-foreground font-black tracking-tight uppercase">
                             Misión Ejecutada: <span className="text-emerald-500 font-black">{activity.contacts?.full_name}</span>
                           </p>
                           <div className="flex items-center gap-3">
                             <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">
                               {new Date(activity.actual_start_time || activity.created_at).toLocaleString()} 
                             </p>
                             <span className="w-1 h-1 bg-border rounded-full" />
                             <Badge className="status-active text-[8px] font-black px-2 py-0.5 uppercase tracking-widest border-none">Sincronizado</Badge>
                           </div>
                        </div>
                     </div>
                   ))}
                 </div>
               ) : (
                 <div className="text-center py-16 opacity-30">
                    <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">Sin registros de actividad en la matriz</p>
                 </div>
               )}
            </Card>
          </section>
        </div>

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
