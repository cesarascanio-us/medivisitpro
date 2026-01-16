import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Calendar, Users, FileCheck, TrendingUp, Clock, MapPin, Package } from "lucide-react";
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

export default function Dashboard() {
  const { user, role, isManager, isCoordinator, isAdmin, isMaster } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  const [stats, setStats] = useState({
    visitsToday: 0,
    visitsTodayConfirmed: 0,
    doctorsContactedWeek: 0,
    reportsCompletedMonth: 0,
    monthlyGoal: 78 // Keeping this static or arbitrary for now as we lack a goals table
  });

  const [upcomingVisits, setUpcomingVisits] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  // Demo mode hook
  const demoData = useDemoData();

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // DEMO MODE: Use mock data ONLY for demo users
      if (demoData && user?.email?.includes('demo')) {
        console.log("Dashboard: Using mock demo data");
        setProfile({ first_name: 'Usuario', last_name: 'Demo' });
        setStats(demoData.dashboardStats);
        setUpcomingVisits(demoData.visits.slice(0, 3));
        setRecentActivity(demoData.visits.filter((v: any) => v.status === 'completed').slice(0, 5));
        setLoading(false);
        return;
      }

      if (user?.id) {
        await refreshObjectivesProgress(user.id);
      }

      // 1. Get Profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();
      setProfile(profileData);

      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).toISOString();

      // Check if user should see global data (managers, admins, masters)
      const showGlobalData = isManager || isAdmin || isMaster;

      // 2. Visits Today
      let visitsTodayQuery = supabase
        .from('visits')
        .select('*, contacts(*)')
        .gte('scheduled_date', todayStart)
        .lte('scheduled_date', todayEnd);

      // Filter by user if not showing global data
      if (!showGlobalData && user?.id) {
        visitsTodayQuery = visitsTodayQuery.eq('user_id', user.id);
      }

      const { data: visitsTodayData } = await visitsTodayQuery.order('scheduled_date', { ascending: true });

      const visitsTodayCount = visitsTodayData?.length || 0;
      const visitsConfirmedCount = visitsTodayData?.filter(v => (v.status as string) === 'confirmed').length || 0;

      // 3. Doctors Contacted This Week (Completed visits this week)
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
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

      // 4. Reports Completed This Month (Completed visits this month)
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

      // 5. Monthly Goals (Average progress of active objectives)
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
        : 78; // Fallback to 78 if no active objectives

      setStats({
        visitsToday: visitsTodayCount,
        visitsTodayConfirmed: visitsConfirmedCount,
        doctorsContactedWeek: doctorsContactedCount || 0,
        reportsCompletedMonth: reportsCount || 0,
        monthlyGoal: Math.round(avgProgress)
      });

      // 6. Upcoming Visits List - Already loaded with contacts
      setUpcomingVisits(visitsTodayData?.slice(0, 3) || []);

      // 7. Recent Activity (Completed visits)
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
    // First, try to get name from profile
    if (profile?.first_name || profile?.last_name) {
      return `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
    }

    // If no profile name, use email username (part before @)
    if (user?.email) {
      const emailName = user.email.split('@')[0];
      // Capitalize first letter and replace dots/underscores with spaces
      return emailName
        .split(/[._]/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }

    return 'Usuario';
  };

  const getRoleLabel = (r: string) => {
    switch (r) {
      case 'master': return 'Master Admin';
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
      {/* Welcome Section */}
      <div className="gradient-medical p-6 rounded-lg text-primary-foreground">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
          <div>
            <h1 className="text-2xl font-bold">¡Bienvenido de vuelta, {getUserName()}!</h1>
            <div className="flex items-center mt-1">
              <Badge variant="secondary" className="bg-background text-foreground hover:bg-background/90 border-0">
                {getRoleLabel(role)}
              </Badge>
            </div>
          </div>
        </div>

        <p className="text-primary-foreground/80 mt-2">
          {(isManager || isAdmin || isMaster) ? (
            `Hay ${stats.visitsToday} visitas programadas hoy en toda la organización.`
          ) : (
            `Tienes ${stats.visitsToday} visitas programadas para hoy.${stats.visitsToday > 0 ? " ¡A por ello!" : " Tómalo con calma o planifica nuevas visitas."}`
          )}
        </p>
      </div>

      {/* Process Alerts - Ciclos expirados y visitas zombie */}
      <ProcessAlerts />

      {/* AI Smart Assistant - Next Best Actions */}
      <SmartAssistant />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Visitas de Hoy"
          value={stats.visitsToday}
          subtitle={`${stats.visitsTodayConfirmed} confirmadas`}
          icon={Calendar}
          variant="primary"
        // trending logic could be comparison with yesterday, omitting for now or keeping static
        />
        <StatsCard
          title="Médicos Contactados"
          value={stats.doctorsContactedWeek}
          subtitle="Esta semana"
          icon={Users}
          variant="success"
        />
        <StatsCard
          title="Reportes Completados"
          value={stats.reportsCompletedMonth}
          subtitle="Este mes"
          icon={FileCheck}
          variant="default"
        />
        <StatsCard
          title="Objetivo Mensual"
          value={`${stats.monthlyGoal}%`}
          subtitle="Calculado"
          icon={TrendingUp}
          variant="warning"
        />
      </div>

      {/* Row 1: Upcoming Visits & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Upcoming Visits */}
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
                          variant={visit.status === 'confirmed' ? 'default' : 'secondary'}
                          className={visit.status === 'confirmed' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}
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
                  <Button variant="link" asChild className="mt-2">
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

        {/* Recent Activities */}
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
                  <div key={activity.id} className="flex items-start space-x-3 p-3 bg-muted/50 rounded-lg">
                    <div className="w-2 h-2 bg-success rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">
                        Visita completada - {activity.contacts?.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
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
            <Button variant="outline" className="w-full mt-4" asChild>
              <Link to="/reportes">Ver Reportes</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Alerts (Full Width) */}
      <InventoryAlerts compact />

      {/* Row 2: Suggestions & Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <NextVisitSuggestions className="h-full" />

        <Card className="medical-card h-full flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5 text-green-600" />
              Rendimiento del Mes
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 flex-1 flex flex-col items-center justify-between">
            <div className="flex flex-col items-center justify-center flex-1">
              <p className="text-3xl font-bold text-primary">{stats.monthlyGoal}%</p>
              <p className="text-muted-foreground mt-2 text-center">del objetivo mensual alcanzado</p>
            </div>
            <Button variant="outline" className="mt-4 w-full sm:w-auto" asChild>
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