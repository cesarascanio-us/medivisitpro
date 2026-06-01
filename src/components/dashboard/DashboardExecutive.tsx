import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Calendar, Users, FileCheck, TrendingUp, 
  Clock, MapPin, RefreshCcw,
  Zap, ChevronRight, Activity, ShieldCheck
} from "lucide-react";
import { InventoryAlerts } from "@/components/dashboard/InventoryAlerts";
import { ProcessAlerts } from "@/components/dashboard/ProcessAlerts";
import { SmartAssistant } from "@/components/dashboard/SmartAssistant";
import { CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AutoAssignmentPanel } from "@/components/dashboard/AutoAssignmentPanel";
import { refreshObjectivesProgress } from "@/services/objectiveService";
import { useDemoData } from "@/contexts/MockDataProvider";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { EliteHeader, EliteKPICard, EliteCard, EliteButton } from "@/components/layout/DesignSystem";
import { cn } from "@/lib/utils";

export default function DashboardExecutive() {
  const { user, isManager, isAdmin, isMaster, companyId, organizationName } = useAuth();
  const navigate = useNavigate();
  const showGlobalData = isManager || isAdmin || isMaster;
  const [loading, setLoading] = useState(true);
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
    if (user) loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      if (demoData) {
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

      if (user?.id) await refreshObjectivesProgress(user.id);

      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).toISOString();

      const [visitsRes, doctorsRes, reportsRes, objectivesRes] = await Promise.all([
        (() => {
          let q = supabase.from('visits').select('status');
          q = q.gte('scheduled_date', todayStart).lte('scheduled_date', todayEnd);
          if (!isMaster && companyId) q = q.eq('company_id', companyId);
          return q;
        })(),
        (() => {
          const startOfWeek = new Date(now);
          startOfWeek.setDate(now.getDate() - now.getDay());
          let q = supabase.from('visits').select('id', { count: 'exact', head: true });
          q = q.eq('status', 'completed').gte('actual_start_time', startOfWeek.toISOString());
          if (!isMaster && companyId) q = q.eq('company_id', companyId);
          return q;
        })(),
        (() => {
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
          let q = supabase.from('visits').select('id', { count: 'exact', head: true });
          q = q.eq('status', 'completed').gte('actual_start_time', startOfMonth);
          if (!isMaster && companyId) q = q.eq('company_id', companyId);
          return q;
        })(),
        (() => {
          let q = supabase.from('objectives').select('*').eq('status', 'active');
          if (!isMaster && companyId) q = q.eq('company_id', companyId);
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
      const { data: upcomingData } = await upcomingQ.order('scheduled_date', { ascending: true }).limit(3);
      
      let recentQ = supabase.from('visits').select('*').eq('status', 'completed');
      if (!isMaster && companyId) recentQ = recentQ.eq('company_id', companyId);
      const { data: recentVisits } = await recentQ.order('actual_start_time', { ascending: false }).limit(5);

      const allContactIds = Array.from(new Set([
        ...(upcomingData?.map(v => v.contact_id) || []),
        ...(recentVisits?.map(v => v.contact_id) || [])
      ]));

      if (allContactIds.length > 0) {
        const { data: contactsData } = await supabase.from('unified_contacts').select('*').in('id', allContactIds);
        setUpcomingVisits(upcomingData?.map(v => ({ ...v, contacts: contactsData?.find(c => c.id === v.contact_id) })) || []);
        setRecentActivity(recentVisits?.map(v => ({ ...v, contacts: contactsData?.find(c => c.id === v.contact_id) })) || []);
      } else {
        setUpcomingVisits(upcomingData || []);
        setRecentActivity(recentVisits || []);
      }

    } catch (error) {
      console.error("Error loading executive dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDashboardTitle = () => {
    if (isMaster || isAdmin) return "Centro de Gestión Global";
    return "Resumen Ejecutivo";
  };

  return (
    <div className="space-y-10 pb-10">
      <EliteHeader 
        title={getDashboardTitle()}
        subtitle={organizationName || "MediVisitPro Executive"}
        icon={ShieldCheck}
        badgeText={isMaster ? "MASTER ACCESS" : "EXECUTIVE"}
        statusText={isOnline ? "Conectado" : "Modo Offline"}
        statusColor={isOnline ? "bg-emerald-500" : "bg-amber-500"}
        rightContent={
          <div className="flex items-center gap-6">
            <div className="hidden lg:flex flex-col items-end">
              <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest leading-none">Hora Local</span>
              <span className="text-xs font-black text-foreground tracking-tight mt-1">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div className="hidden sm:block h-8 w-[1px] bg-border/40 mx-2" />
            <EliteButton variant="secondary" onClick={() => navigate('/master-panel')} icon={Zap}>
              Consola
            </EliteButton>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <EliteKPICard
          title="Visitas Totales Hoy"
          value={stats.visitsToday}
          subtitle={`${stats.visitsTodayConfirmed} confirmadas`}
          icon={Calendar}
          trend={12}
          color="blue"
        />
        <EliteKPICard
          title="Impacto Semanal"
          value={stats.doctorsContactedWeek}
          subtitle="Objetivo trim."
          icon={Users}
          trend={8}
          color="indigo"
        />
        <EliteKPICard
          title="Reportes Generados"
          value={stats.reportsCompletedMonth}
          subtitle="Mes actual"
          icon={FileCheck}
          trend={-2}
          color="blue"
        />
        <EliteKPICard
          title="Cumplimiento Global"
          value={`${Math.round((stats.reportsCompletedMonth / (stats.monthlyGoal || 1)) * 100)}%`}
          subtitle={`Meta: ${stats.monthlyGoal}`}
          icon={TrendingUp}
          trend={5}
          color="emerald"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          <section>
            <div className="flex items-center justify-between mb-8 px-2">
               <div className="flex items-center gap-5">
                  <div className="icon-box-primary">
                    <Clock className="h-7 w-7" />
                  </div>
                  <div>
                    <h2 className="text-elite-title text-foreground font-display">Monitoreo de Campo</h2>
                    <p className="text-elite-sm text-muted-foreground">Próximas actividades a nivel global</p>
                  </div>
               </div>
               <EliteButton variant="ghost" onClick={() => navigate('/visits')} icon={ChevronRight} className="flex-row-reverse">
                 Explorar Mapa
               </EliteButton>
            </div>
            
            <div className="grid gap-6">
              {loading ? (
                [1, 2, 3].map(i => <div key={i} className="h-28 w-full bg-card rounded-elite-lg border border-border animate-pulse shadow-sm"></div>)
              ) : upcomingVisits.length > 0 ? (
                upcomingVisits.map((visit, index) => (
                  <EliteCard key={visit.id} onClick={() => navigate(`/visits?id=${visit.id}`)} delay={index * 100}>
                    <CardContent className="p-8">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                          <div className="h-16 w-16 rounded-2xl bg-muted/20 flex items-center justify-center border border-border group-hover:bg-primary group-hover:text-white transition-all duration-500 text-muted-foreground shadow-inner">
                            <MapPin className="h-8 w-8" />
                          </div>
                          <div className="space-y-1">
                            <h4 className="text-xl font-black text-foreground tracking-tight group-hover:text-primary transition-colors uppercase font-display">
                              {visit.contacts?.full_name || 'Contacto no Identificado'}
                            </h4>
                            <div className="flex items-center gap-3">
                                <Badge className="badge-elite-info bg-muted/30 border-none">
                                  {new Date(visit.scheduled_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </Badge>
                                <Badge className="badge-elite-info">
                                  {visit.contacts?.category || 'General'}
                                </Badge>
                            </div>
                          </div>
                        </div>
                        <Badge className={cn(
                          "badge-elite px-6 py-2 rounded-full",
                          visit.status === 'confirmed' ? "badge-elite-success" : "badge-elite-warning"
                        )}>
                          {visit.status === 'confirmed' ? 'Confirmada' : 'En Espera'}
                        </Badge>
                      </div>
                    </CardContent>
                  </EliteCard>
                ))
              ) : (
                <EliteCard className="border-dashed border-border/60 bg-muted/5">
                   <div className="p-24 text-center">
                    <div className="w-24 h-24 bg-card rounded-elite-lg shadow-premium-sm border border-border flex items-center justify-center mx-auto mb-8 text-muted-foreground/20">
                        <Calendar className="h-12 w-12" />
                    </div>
                    <h3 className="text-elite-title text-foreground font-display mb-3">Sin actividad reciente</h3>
                    <p className="text-elite-sm text-muted-foreground">No se detectan movimientos en tiempo real</p>
                   </div>
                </EliteCard>
              )}
            </div>
          </section>

          <section>
            <div className="flex items-center gap-5 mb-8 px-2">
                <div className="icon-box-success">
                  <Activity className="h-7 w-7" />
                </div>
                <div>
                    <h2 className="text-elite-title text-foreground font-display">Auditoría de Actividad</h2>
                    <p className="text-elite-sm text-muted-foreground">Registro histórico de cumplimiento</p>
                </div>
            </div>
            <EliteCard className="p-10 relative overflow-hidden">
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
                             Visita Realizada: <span className="text-emerald-500 font-black">{activity.contacts?.full_name}</span>
                           </p>
                           <div className="flex items-center gap-3">
                             <p className="text-elite-xs text-muted-foreground">
                               {new Date(activity.actual_start_time || activity.created_at).toLocaleString()} 
                             </p>
                             <span className="w-1 h-1 bg-border rounded-full" />
                             <Badge className="badge-elite-success border-none">Verificado</Badge>
                           </div>
                        </div>
                     </div>
                   ))}
                 </div>
               ) : (
                 <div className="text-center py-16 opacity-30">
                    <p className="text-elite-sm text-muted-foreground">Sin registros de actividad reciente</p>
                 </div>
               )}
            </EliteCard>
          </section>
        </div>

        <div className="space-y-10">
          <SmartAssistant />
          <InventoryAlerts />
          <ProcessAlerts />
          <AutoAssignmentPanel />
        </div>
      </div>
    </div>
  );
}
