/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  MapPin,
  Navigation,
  Package,
  DollarSign,
  RefreshCcw,
  LogOut,
  CheckCircle2,
  AlertTriangle,
  Bell,
  ChevronRight,
  X,
  Wifi,
  WifiOff,
  Target,
  Users,
  TrendingUp,
  Clock,
  Plus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { useKpiSummary } from "@/hooks/queries/useDashboardQueries";
import { StatsCard } from "./StatsCard";
import { QuickScheduleWizard } from "../visits/QuickScheduleWizard";


// =============================================================================
// MOCK DATA - Structured for easy Supabase integration later
// =============================================================================
interface VisitItem {
  id: string;
  scheduledTime: string;
  contactName: string;
  address: string;
  status: "pending" | "completed";
  latitude?: number;
  longitude?: number;
}

interface DailyMetrics {
  visitedToday: number;
  totalPlanned: number;
  salesAmount: number;
  salesQuota: number;
}

interface StockAlert {
  id: string;
  productName: string;
  currentStock: number;
  minStock: number;
  type: "stock" | "general";
}

const MOCK_VISITS: VisitItem[] = [
  {
    id: "1",
    scheduledTime: "08:30",
    contactName: "Dr. María González",
    address: "Centro Médico Plaza, Piso 3",
    status: "completed",
  },
  {
    id: "2",
    scheduledTime: "10:00",
    contactName: "Farmacia San Rafael",
    address: "Av. Urdaneta, Local 25",
    status: "pending",
  },
  {
    id: "3",
    scheduledTime: "11:30",
    contactName: "Dr. Carlos Mendoza",
    address: "Clínica Santa María, Consultorio 12",
    status: "pending",
  },
  {
    id: "4",
    scheduledTime: "14:00",
    contactName: "Farmacia Central",
    address: "Calle Real, Centro Comercial",
    status: "pending",
  },
];

const MOCK_METRICS: DailyMetrics = {
  visitedToday: 1,
  totalPlanned: 4,
  salesAmount: 2450,
  salesQuota: 5000,
};

const MOCK_ALERTS: StockAlert[] = [
  {
    id: "a1",
    productName: "CardioPlus 50mg",
    currentStock: 2,
    minStock: 10,
    type: "stock",
  },
  {
    id: "a2",
    productName: "VitaMax 100mg",
    currentStock: 5,
    minStock: 15,
    type: "stock",
  },
];

// =============================================================================
// COMPONENT
// =============================================================================
export default function DashboardRep() {
  const { user, signOut, role, organizationName } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [visits, setVisits] = useState<VisitItem[]>([]);
  const [metrics, setMetrics] = useState<DailyMetrics>({ visitedToday: 0, totalPlanned: 0, salesAmount: 0, salesQuota: 0 });
  const [stockAlerts, setStockAlerts] = useState<StockAlert[]>([]);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  const [currentTime, setCurrentTime] = useState(new Date());
  const [lastSync, setLastSync] = useState<string | null>(localStorage.getItem('lastSyncTime'));

  const { isOnline, pendingCount: syncPendingCount, isSyncing, forceSync } = useOfflineSync();

  // Get user's first name from metadata or fallback
  const userName =
    user?.user_metadata?.first_name ||
    user?.email?.split("@")[0] ||
    "Representante";

  // Calculate pending visits count
  const pendingCount = visits.filter((v) => v.status === "pending").length;

  // Calculate progress percentages
  const routeProgress =
    metrics.totalPlanned > 0
      ? Math.round((metrics.visitedToday / metrics.totalPlanned) * 100)
      : 0;
  const salesProgress =
    metrics.salesQuota > 0
      ? Math.round((metrics.salesAmount / metrics.salesQuota) * 100)
      : 0;

  // Alerts count for badge
  const alertsCount = stockAlerts.length;

  const { data: kpis, isLoading: kpisLoading } = useKpiSummary(user?.id || '');


  // ---------------------------------------------------------------------------
  // Data Loading (Structured for Supabase)
  // ---------------------------------------------------------------------------
  const loadDashboardData = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      const today = new Date().toISOString().split("T")[0];

      // Fetch today's visits from Supabase
      const { data: visitsData, error } = await supabase
        .from("visits")
        .select(
          `
          id,
          scheduled_date,
          status,
          contacts (name, address, latitude, longitude)
        `
        )
        .eq("user_id", user.id)
        .gte("scheduled_date", `${today}T00:00:00`)
        .lt("scheduled_date", `${today}T23:59:59`)
        .order("scheduled_date", { ascending: true });

      if (!error) {
        const mappedVisits: VisitItem[] = (visitsData || []).map((v: any) => ({
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
        }));
        setVisits(mappedVisits);

        // Update metrics based on real data
        const completedCount = mappedVisits.filter(
          (v) => v.status === "completed"
        ).length;
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
  }, [user, loadDashboardData]);

  // Sync metrics with KPI data
  useEffect(() => {
    if (kpis) {
      setMetrics(prev => ({
        ...prev,
        salesAmount: kpis.salesActual || 0,
        salesQuota: kpis.salesQuota || 100,
      }));
    }
  }, [kpis]);

  // ---------------------------------------------------------------------------
  // Event Handlers
  // ---------------------------------------------------------------------------
  const handleStartVisit = (visitId: string) => {
    navigate(`/visits?start=${visitId}`);
  };

  const handleOpenNavigation = (visit: VisitItem) => {
    if (visit.latitude && visit.longitude) {
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${visit.latitude},${visit.longitude}`,
        "_blank"
      );
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
  };

  const handleDismissAlert = (alertId: string) => {
    setStockAlerts((prev) => prev.filter((a) => a.id !== alertId));
  };

  // ---------------------------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#f8f9fa] text-text-main p-4 sm:p-6 lg:p-8 font-sans">
      {/* 1. Header (Greeting and Summary Title) */}
      <div className="mb-8 space-y-1">
        <p className="text-text-muted text-sm font-bold uppercase tracking-widest opacity-70">Panel Representative</p>
        <h1 className="text-4xl font-extrabold text-text-main tracking-tight">
          Hola, {userName}
        </h1>
        <div className="pt-6">
          <h2 className="text-2xl font-bold text-text-main/90">Tu Resumen Hoy</h2>
        </div>
      </div>

      {/* 2. Progress Indicators (Ruta Diaria and Cuota Ventas) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {/* Ruta Diaria */}
        <div className="bg-card p-5 rounded-2xl shadow-soft border border-border flex flex-col justify-center">
          <div className="flex justify-between items-end text-sm mb-3">
            <span className="text-text-muted font-bold uppercase tracking-wider text-xs">Ruta Diaria</span>
            <span className="text-primary font-bold">{metrics.visitedToday} / {metrics.totalPlanned}</span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-1000 ease-out shadow-[0_0_12px_rgba(0,86,179,0.3)] text-white"
              style={{ width: `${metrics.totalPlanned > 0 ? (metrics.visitedToday / metrics.totalPlanned) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Cuota Ventas */}
        <div className="bg-card p-5 rounded-2xl shadow-soft border border-border flex flex-col justify-center">
          <div className="flex justify-between items-end text-sm mb-3">
            <span className="text-text-muted font-bold uppercase tracking-wider text-xs">Cuota Ventas</span>
            <span className="text-secondary font-bold">${metrics.salesAmount.toLocaleString()} / ${metrics.salesQuota.toLocaleString()}</span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-secondary transition-all duration-1000 ease-out shadow-[0_0_12px_rgba(0,160,233,0.3)]"
              style={{ width: `${metrics.salesQuota > 0 ? (metrics.salesAmount / metrics.salesQuota) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Tu Ruta Timeline */}
        <div className="lg:col-span-2">
          <Card className="bg-card border-none shadow-xl rounded-[2rem] overflow-hidden text-foreground border-t-4 border-t-primary">
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-50 px-8 py-6">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                <CardTitle className="text-text-main text-lg font-bold">Tu Ruta</CardTitle>
              </div>
              <Badge variant="secondary" className="bg-primary/10 text-primary border-none px-4 py-1.5 font-bold rounded-full">
                {pendingCount} Pendientes
              </Badge>
            </CardHeader>
            <CardContent className="p-0">
              {visits.length > 0 ? (
                <div className="divide-y divide-slate-50">
                  {visits.map((visit, index) => {
                    const isCompleted = visit.status === 'completed';
                    return (
                      <div
                        key={visit.id}
                        className="flex items-start gap-6 px-8 py-7 hover:bg-muted/80 transition-all group relative cursor-pointer"
                        onClick={() => !isCompleted && handleStartVisit(visit.id)}
                      >
                        {/* Timeline Connector */}
                        <div className="flex flex-col items-center pt-1.5 w-12 flex-shrink-0">
                          <span className="text-[10px] font-bold text-text-muted mb-1.5">{visit.scheduledTime}</span>
                          <div className={`w-3.5 h-3.5 rounded-full border-2 z-10 transition-all ${isCompleted ? "bg-secondary border-secondary scale-110" : "bg-card border-primary group-hover:scale-110"
                            }`} />
                          {index < visits.length - 1 && (
                            <div className={`w-0.5 h-20 -mb-6 mt-1.5 ${isCompleted ? "bg-secondary/40" : "bg-muted"
                              }`} />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <h4 className={`font-bold text-lg truncate transition-colors ${isCompleted ? "text-text-muted/60 line-through" : "text-text-main group-hover:text-primary"
                            }`}>
                            {visit.contactName}
                          </h4>
                          <p className="text-text-muted text-sm truncate mt-1">
                            {visit.address}
                          </p>
                        </div>

                        {/* Status Icon */}
                        <div className="flex-shrink-0 pt-1">
                          {isCompleted ? (
                            <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center">
                              <CheckCircle2 className="h-5 w-5 text-secondary" />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-primary hover:text-white transform translate-x-4 group-hover:translate-x-0">
                              <Navigation className="h-5 w-5" />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-16 text-center text-text-muted">
                  <RefreshCcw className="h-12 w-12 mx-auto mb-5 opacity-20 animate-spin text-primary" />
                  <p className="font-bold text-lg">No hay visitas agendadas para hoy</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Key Metrics and Actions */}
        <div className="space-y-6">
          {/* Real-time KPIs mini grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-card border border-border rounded-2xl p-5 shadow-soft border-l-4 border-l-primary">
              <p className="text-text-muted text-[10px] uppercase font-bold tracking-widest mb-2 opacity-60">Cobertura</p>
              <p className="text-2xl font-black text-text-main">{kpisLoading ? "..." : `${kpis?.coverage || 0}%`}</p>
            </div>
            <div className="bg-card border border-border rounded-2xl p-5 shadow-soft border-l-4 border-l-secondary">
              <p className="text-text-muted text-[10px] uppercase font-bold tracking-widest mb-2 opacity-60">Frecuencia</p>
              <p className="text-2xl font-black text-text-main">{kpisLoading ? "..." : kpis?.frequency || 0}%</p>
            </div>
          </div>

          <Card className="bg-card border-border text-text-main rounded-3xl overflow-hidden shadow-xl border-t-4 border-t-secondary">
            <CardHeader className="pb-3 px-6 pt-6 bg-muted/50 border-b border-border">
              <CardTitle className="text-xs font-bold text-text-muted uppercase tracking-widest">Accesos Rápidos</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 p-6">
              <Button
                variant="outline"
                className="flex flex-col h-auto py-5 bg-card border-border hover:border-primary hover:text-primary text-text-main gap-2 transition-all active:scale-95 shadow-sm rounded-2xl"
                onClick={() => navigate('/products')}
              >
                <div className="p-3 bg-primary/10 rounded-xl">
                  <Package className="h-6 w-6 text-primary" />
                </div>
                <span className="text-xs font-bold">Inventario</span>
              </Button>
              <Button
                variant="outline"
                className="flex flex-col h-auto py-5 bg-card border-border hover:border-secondary hover:text-secondary text-text-main gap-2 transition-all active:scale-95 shadow-sm rounded-2xl"
                onClick={() => navigate('/expenses')}
              >
                <div className="p-3 bg-secondary/10 rounded-xl">
                  <TrendingUp className="h-6 w-6 text-secondary" />
                </div>
                <span className="text-xs font-bold">Gastos</span>
              </Button>
              <Button
                variant="outline"
                className="flex flex-col h-auto py-5 bg-card border-border hover:border-indigo-600 hover:text-indigo-600 text-text-main gap-2 transition-all active:scale-95 shadow-sm rounded-2xl col-span-2"
                onClick={() => setIsWizardOpen(true)}
              >
                <div className="p-3 bg-indigo-50 rounded-xl">
                  <Plus className="h-6 w-6 text-indigo-600" />
                </div>
                <span className="text-xs font-bold">Agendar Visita</span>
              </Button>
            </CardContent>
          </Card>

          {/* Sync Status Card */}
          <div className="bg-card border border-border rounded-[1.5rem] p-5 flex items-center justify-between shadow-soft">
            <div className="flex items-center gap-4">
              <div className="w-3 h-3 rounded-full bg-secondary animate-pulse shadow-[0_0_8px_rgba(0,160,233,0.5)]" />
              <div>
                <p className="text-sm font-bold text-text-main">Sincronizado</p>
                <p className="text-xs text-text-muted font-medium">Hace unos momentos</p>
              </div>
            </div>
            <RefreshCcw className="h-5 w-5 text-secondary/30" />
          </div>
        </div>
      </div>

      {/* Floating Action Button (Matches Demo Screenshot) */}
      <div className="fixed bottom-8 right-8 z-50">
        <Button
          className="w-16 h-16 rounded-full bg-primary hover:bg-primary-dark shadow-2xl shadow-primary/30 p-0 flex items-center justify-center transition-all hover:scale-110 active:scale-90 border-4 border-white text-white"
          onClick={() => setIsWizardOpen(true)}
        >
          <Plus className="h-8 w-8 text-white" />
        </Button>
      </div>

      <QuickScheduleWizard
        open={isWizardOpen}
        onOpenChange={setIsWizardOpen}
        onSuccess={loadDashboardData}
      />
    </div>
  );
}
