import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { MOCK_VISITS } from "@/data/mockDemoData";
import { CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Navigation,
  Package,
  RefreshCcw,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  Clock,
  Plus,
  Calendar,
  Zap,
  Activity
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { useKpiSummary } from "@/hooks/queries/useDashboardQueries";
import { QuickScheduleWizard } from "../visits/QuickScheduleWizard";
import { EliteHeader, EliteKPICard, EliteCard, EliteButton } from "@/components/layout/DesignSystem";
import { cn } from "@/lib/utils";

interface VisitItem {
  id: string;
  scheduledTime: string;
  contactName: string;
  address: string;
  status: "pending" | "completed";
  latitude?: number;
  longitude?: number;
  category?: string;
}

interface DailyMetrics {
  visitedToday: number;
  totalPlanned: number;
  salesAmount: number;
  salesQuota: number;
}

interface DashboardRepProps {
  mode?: 'comercial' | 'medico' | 'integral';
}

export default function DashboardRep({ mode = 'comercial' }: DashboardRepProps) {
  const { user, profile, organizationName, isDemo } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [visits, setVisits] = useState<VisitItem[]>([]);
  const [metrics, setMetrics] = useState<DailyMetrics>({ visitedToday: 0, totalPlanned: 0, salesAmount: 0, salesQuota: 0 });
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const { isOnline } = useOfflineSync();
  const { data: kpis } = useKpiSummary(user?.id || '');

  const userName = profile?.first_name || user?.user_metadata?.first_name || user?.email?.split("@")[0] || "Representante";
  const pendingCount = visits.filter((v) => v.status === "pending").length;

  const loadDashboardData = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    if (isDemo) {
      console.log("[DashboardRep] Offline Demo Mode active. Loading local virtual route...");
      const mappedVisits: VisitItem[] = (MOCK_VISITS || []).map((v: any) => {
        const rawType = v.contacts?.contact_type || v.visit_type;
        const displayCategory = rawType === 'doctor' ? 'Médico' : 
                                rawType === 'pharmacy' ? 'Farmacia' : 
                                rawType === 'health_center' ? 'Centro de Salud' : 
                                rawType === 'drugstore' ? 'Droguería' :
                                rawType === 'natural_store' ? 'Tienda Naturista' : 
                                rawType === 'commerce' ? 'Comercio/Retail' : rawType;

        return {
          id: v.id,
          scheduledTime: new Date(v.scheduled_date || Date.now()).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          contactName: v.contacts?.name || v.contact_name || "Sin nombre",
          address: v.contacts?.address || v.address || "Sin dirección",
          status: v.status === "completed" ? "completed" : "pending",
          latitude: v.contacts?.latitude || v.latitude,
          longitude: v.contacts?.longitude || v.longitude,
          category: displayCategory
        };
      });
      setVisits(mappedVisits);

      const completedCount = mappedVisits.filter((v) => v.status === "completed").length;
      setMetrics((prev) => ({
        ...prev,
        visitedToday: completedCount,
        totalPlanned: mappedVisits.length,
      }));
      setLoading(false);
      return;
    }

    try {
      const today = new Date().toISOString().split("T")[0];
      const { data: visitsData, error } = await supabase
        .from("visits")
        .select(`
          id,
          scheduled_date,
          status,
          contacts (name, address, latitude, longitude, contact_type)
        `)
        .eq("user_id", user.id)
        .gte("scheduled_date", `${today}T00:00:00`)
        .lt("scheduled_date", `${today}T23:59:59`)
        .order("scheduled_date", { ascending: true });

      if (!error) {
        const mappedVisits: VisitItem[] = (visitsData || []).map((v: any) => {
          const rawType = v.contacts?.contact_type;
          const displayCategory = rawType === 'doctor' ? 'Médico' : 
                                  rawType === 'pharmacy' ? 'Farmacia' : 
                                  rawType === 'health_center' ? 'Centro de Salud' : 
                                  rawType === 'drugstore' ? 'Droguería' :
                                  rawType === 'natural_store' ? 'Tienda Naturista' : 
                                  rawType === 'commerce' ? 'Comercio/Retail' : rawType;

          return {
            id: v.id,
            scheduledTime: new Date(v.scheduled_date).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            contactName: v.contacts?.name || "Sin nombre",
            address: v.contacts?.address || "Sin dirección",
            status: v.status === "completed" ? "completed" : "pending",
            latitude: v.contacts?.latitude,
            longitude: v.contacts?.longitude,
            category: displayCategory
          };
        });
        setVisits(mappedVisits);

        const completedCount = mappedVisits.filter((v) => v.status === "completed").length;
        setMetrics((prev) => ({
          ...prev,
          visitedToday: completedCount,
          totalPlanned: mappedVisits.length,
        }));
      }
    } catch (err) {
      console.error("Error loading dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) loadDashboardData();
  }, [user, loadDashboardData]);

  useEffect(() => {
    if (kpis) {
      setMetrics(prev => ({
        ...prev,
        salesAmount: kpis.salesActual || 0,
        salesQuota: kpis.salesQuota || 100,
      }));
    }
  }, [kpis]);

  return (
    <div className="space-y-10 pb-10">
      <EliteHeader 
        title={`Bienvenido, ${userName}`}
        subtitle={organizationName || "MediVisitPro Representante"}
        icon={Zap}
        badgeText="Panel Representative"
        statusText={isOnline ? "Conectado" : "Modo Offline"}
        statusColor={isOnline ? "bg-emerald-500" : "bg-amber-500"}
        rightContent={
          <EliteButton onClick={() => setIsWizardOpen(true)} icon={Plus}>
            Nueva Visita
          </EliteButton>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <EliteKPICard
          title="Ruta Diaria"
          value={`${metrics.visitedToday} / ${metrics.totalPlanned}`}
          subtitle="Visitas completadas hoy"
          icon={MapPin}
          trend={metrics.totalPlanned > 0 ? Math.round((metrics.visitedToday / metrics.totalPlanned) * 100) : 0}
          color="blue"
        />
        <EliteKPICard
          title="Ventas del Mes"
          value={`$${metrics.salesAmount.toLocaleString()}`}
          subtitle={`Meta: $${metrics.salesQuota.toLocaleString()}`}
          icon={TrendingUp}
          trend={metrics.salesQuota > 0 ? Math.round((metrics.salesAmount / metrics.salesQuota) * 100) : 0}
          color="emerald"
        />
        <EliteKPICard
          title="Cobertura"
          value={`${kpis?.coverage || 0}%`}
          subtitle="Cumplimiento de zona"
          icon={Activity}
          color="indigo"
        />
        <EliteKPICard
          title="Frecuencia"
          value={`${kpis?.frequency || 0}%`}
          subtitle="Impacto recurrente"
          icon={RefreshCcw}
          color="blue"
        />
      </div>

      {/* Accesos Rápidos y Sincronización en la parte superior */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-5 px-2">
            <div className="icon-box-primary">
              <Zap className="h-7 w-7" />
            </div>
            <h3 className="text-elite-title text-foreground font-display">Accesos Rápidos</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <EliteCard onClick={() => navigate('/products')} className="p-6">
              <div className="flex items-center gap-6">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 text-primary">
                  <Package className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-lg font-black uppercase tracking-tight font-display">Inventario</p>
                  <p className="text-elite-xs text-muted-foreground">Banco de muestras y material</p>
                </div>
                <ChevronRight className="ml-auto h-5 w-5 text-muted-foreground/40" />
              </div>
            </EliteCard>
            <EliteCard onClick={() => navigate('/sales-pipeline')} className="p-6">
              <div className="flex items-center gap-6">
                <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-500">
                  <Clock className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-lg font-black uppercase tracking-tight font-display">Pipeline</p>
                  <p className="text-elite-xs text-muted-foreground">Seguimiento de cierres</p>
                </div>
                <ChevronRight className="ml-auto h-5 w-5 text-muted-foreground/40" />
              </div>
            </EliteCard>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-5 px-2">
            <div className="icon-box-primary">
              <RefreshCcw className="h-7 w-7" />
            </div>
            <h3 className="text-elite-title text-foreground font-display">Sincronización</h3>
          </div>
          <EliteCard className="p-6 bg-primary/5 border-primary/20 h-[106px] flex flex-col justify-center">
             <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-elite-sm text-muted-foreground">Base de Datos</span>
                  <Badge className="badge-elite-success">Online</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-elite-sm text-muted-foreground">Última Carga</span>
                  <span className="text-elite-xs font-black">Hace instantes</span>
                </div>
             </div>
          </EliteCard>
        </div>
      </div>

      {/* Tu Ruta de Hoy */}
      <section className="space-y-6">
        <div className="flex items-center justify-between mb-8 px-2">
          <div className="flex items-center gap-5">
            <div className="icon-box-primary">
              <Calendar className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-elite-title text-foreground font-display">Tu Ruta de Hoy</h2>
              <p className="text-elite-sm text-muted-foreground">{pendingCount} visitas pendientes de ejecución</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          {loading ? (
            [1, 2, 3].map(i => <div key={i} className="h-28 w-full bg-card rounded-elite-lg border border-border animate-pulse shadow-sm"></div>)
          ) : visits.length > 0 ? (
            visits.map((visit, index) => {
              const isCompleted = visit.status === 'completed';
              return (
                <EliteCard 
                  key={visit.id} 
                  onClick={() => !isCompleted && navigate(`/visits?start=${visit.id}`)} 
                  delay={index * 100}
                  className={cn(isCompleted && "opacity-60 grayscale-[0.5]")}
                >
                  <CardContent className="p-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                      <div className="flex items-center gap-6">
                        <div className={cn(
                          "h-16 w-16 rounded-2xl flex items-center justify-center border border-border shadow-inner transition-all duration-500",
                          isCompleted ? "bg-emerald-500/10 text-emerald-500" : "bg-muted/20 text-muted-foreground group-hover:bg-primary group-hover:text-white"
                        )}>
                          {isCompleted ? <CheckCircle2 className="h-8 w-8" /> : <Navigation className="h-8 w-8" />}
                        </div>
                        <div className="space-y-1">
                          <h4 className={cn(
                            "text-xl font-black tracking-tight transition-colors uppercase font-display",
                            isCompleted ? "text-muted-foreground line-through" : "text-foreground group-hover:text-primary"
                          )}>
                            {visit.contactName}
                          </h4>
                          <div className="flex items-center gap-3">
                            <Badge className="badge-elite-info bg-muted/30 border-none">
                              {visit.scheduledTime}
                            </Badge>
                            <Badge className="badge-elite-info">
                              {visit.category || 'General'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="hidden md:block text-elite-xs text-muted-foreground max-w-xl truncate">{visit.address}</p>
                        <Badge className={cn(
                          "badge-elite px-6 py-2 rounded-full",
                          isCompleted ? "badge-elite-success" : "badge-elite-warning"
                        )}>
                          {isCompleted ? 'Completada' : 'Pendiente'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </EliteCard>
              );
            })
          ) : (
            <EliteCard className="border-dashed border-border/60 bg-muted/5">
              <div className="p-24 text-center">
                <div className="w-24 h-24 bg-card rounded-elite-lg shadow-premium-sm border border-border flex items-center justify-center mx-auto mb-8 text-muted-foreground/20">
                  <Calendar className="h-12 w-12" />
                </div>
                <h3 className="text-elite-title text-foreground font-display mb-3">Sin visitas agendadas</h3>
                <p className="text-elite-sm text-muted-foreground">Tu agenda está despejada por el momento</p>
              </div>
            </EliteCard>
          )}
        </div>
      </section>

      <QuickScheduleWizard
        open={isWizardOpen}
        onOpenChange={setIsWizardOpen}
        onSuccess={loadDashboardData}
      />
    </div>
  );
}
