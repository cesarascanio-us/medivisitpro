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
    <div className="min-h-screen bg-[#020617] text-white p-4 sm:p-6 lg:p-8">
      {/* 1. Header (Greeting and Summary Title) */}
      <div className="mb-8 space-y-1">
        <p className="text-slate-400 text-sm font-medium">Hola,</p>
        <h1 className="text-3xl font-bold text-white tracking-tight">
          {userName}
        </h1>
        <div className="pt-6">
          <h2 className="text-2xl font-bold text-white">Tu Resumen Hoy</h2>
        </div>
      </div>

      {/* 2. Progress Indicators (Ruta Diaria and Cuota Ventas) */}
      <div className="space-y-6 mb-10">
        {/* Ruta Diaria */}
        <div className="space-y-2">
          <div className="flex justify-between items-end text-sm">
            <span className="text-slate-400 font-medium">Ruta Diaria</span>
            <span className="text-white font-mono">{metrics.visitedToday} / {metrics.totalPlanned}</span>
          </div>
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-sky-500 transition-all duration-1000 ease-out"
              style={{ width: `${metrics.totalPlanned > 0 ? (metrics.visitedToday / metrics.totalPlanned) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Cuota Ventas */}
        <div className="space-y-2">
          <div className="flex justify-between items-end text-sm">
            <span className="text-slate-400 font-medium">Cuota Ventas</span>
            <span className="text-white font-mono">${metrics.salesAmount.toLocaleString()} / ${metrics.salesQuota.toLocaleString()}</span>
          </div>
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-1000 ease-out"
              style={{ width: `${metrics.salesQuota > 0 ? (metrics.salesAmount / metrics.salesQuota) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Tu Ruta Timeline */}
        <div className="lg:col-span-2">
          <Card className="bg-white border-none shadow-2xl rounded-[2rem] overflow-hidden text-slate-900">
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-100 px-8 py-6">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-sky-500" />
                <CardTitle className="text-slate-800 text-lg font-bold">Tu Ruta</CardTitle>
              </div>
              <Badge variant="secondary" className="bg-sky-50 text-sky-600 border-none px-3 py-1 font-bold">
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
                        className="flex items-start gap-6 px-8 py-6 hover:bg-slate-50/50 transition-colors group relative cursor-pointer"
                        onClick={() => !isCompleted && handleStartVisit(visit.id)}
                      >
                        {/* Timeline Connector */}
                        <div className="flex flex-col items-center pt-1.5 w-10">
                          <span className="text-[10px] font-bold text-slate-400 mb-1">{visit.scheduledTime}</span>
                          <div className={`w-2.5 h-2.5 rounded-full border-2 z-10 ${isCompleted ? "bg-emerald-500 border-emerald-500" : "bg-white border-sky-400"
                            }`} />
                          {index < visits.length - 1 && (
                            <div className={`w-0.5 h-16 -mb-4 mt-1 ${isCompleted ? "bg-emerald-500" : "bg-slate-200"
                              }`} />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <h4 className={`font-bold text-base truncate ${isCompleted ? "text-slate-400 line-through" : "text-slate-800"
                            }`}>
                            {visit.contactName}
                          </h4>
                          <p className="text-slate-500 text-xs truncate mt-0.5">
                            {visit.address}
                          </p>
                        </div>

                        {/* Status Icon */}
                        <div className="flex-shrink-0 pt-1">
                          {isCompleted ? (
                            <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center">
                              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            </div>
                          ) : (
                            <Navigation className="h-5 w-5 text-sky-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-12 text-center text-slate-400">
                  <RefreshCcw className="h-10 w-10 mx-auto mb-4 opacity-20 animate-spin" />
                  <p className="font-medium">No hay visitas agendadas para hoy</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Key Metrics and Actions */}
        <div className="space-y-6">
          {/* Real-time KPIs mini grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4">
              <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mb-1">Cobertura</p>
              <p className="text-xl font-bold text-white">{kpisLoading ? "..." : `${kpis?.coverage || 0}%`}</p>
            </div>
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4">
              <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mb-1">Frecuencia</p>
              <p className="text-xl font-bold text-white">{kpisLoading ? "..." : kpis?.frequency || 0}%</p>
            </div>
          </div>

          <Card className="bg-slate-900/40 border-slate-800 text-white rounded-3xl overflow-hidden shadow-xl shadow-black/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-400 uppercase tracking-widest">Accesos Rápidos</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3 p-4">
              <Button
                variant="outline"
                className="flex flex-col h-auto py-4 bg-slate-800/20 border-slate-700 hover:bg-slate-800 text-white gap-2 transition-all active:scale-95"
                onClick={() => navigate('/products')}
              >
                <Package className="h-5 w-5 text-sky-400" />
                <span className="text-xs">Inventario</span>
              </Button>
              <Button
                variant="outline"
                className="flex flex-col h-auto py-4 bg-slate-800/20 border-slate-700 hover:bg-slate-800 text-white gap-2 transition-all active:scale-95"
                onClick={() => navigate('/expenses')}
              >
                <TrendingUp className="h-5 w-5 text-emerald-400" />
                <span className="text-xs">Gastos</span>
              </Button>
            </CardContent>
          </Card>

          {/* Sync Status Card */}
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <div>
                <p className="text-xs font-bold text-emerald-400">Sincronizado</p>
                <p className="text-[10px] text-emerald-500/60">Hace unos momentos</p>
              </div>
            </div>
            <RefreshCcw className="h-4 w-4 text-emerald-500/40" />
          </div>
        </div>
      </div>

      {/* Floating Action Button (Matches Demo Screenshot) */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button className="w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-600 shadow-xl shadow-emerald-500/40 p-0 flex items-center justify-center transition-transform hover:scale-110 active:scale-90">
          <Plus className="h-6 w-6 text-white" />
        </Button>
      </div>
    </div>
  );
}
