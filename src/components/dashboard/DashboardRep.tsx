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
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useOfflineSync } from "@/hooks/useOfflineSync";

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
  const [visits, setVisits] = useState<VisitItem[]>(MOCK_VISITS);
  const [metrics, setMetrics] = useState<DailyMetrics>(MOCK_METRICS);
  const [stockAlerts, setStockAlerts] = useState<StockAlert[]>(MOCK_ALERTS);
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

      if (!error && visitsData && visitsData.length > 0) {
        const mappedVisits: VisitItem[] = visitsData.map((v: any) => ({
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
    <div className="min-h-screen bg-slate-100 pb-8">
      {/* Biofarco Style Header with Clock and Sync */}
      <header className="bg-slate-900 text-white px-6 pt-6 pb-20 rounded-b-[2.5rem] shadow-xl relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>

        {/* Top Row: Greeting + Status + Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 border border-white/10">
              <span className="text-2xl font-bold text-white">
                {(user?.user_metadata?.first_name || user?.email || "?")[0].toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-emerald-400/80 text-xs font-semibold uppercase tracking-widest mb-1">Panel de Control</p>
              <h1 className="text-2xl font-bold tracking-tight">¡Hola, {userName}!</h1>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <Badge variant="secondary" className="bg-white/10 text-white hover:bg-white/20 border-0 text-[10px] px-2">
                  Representante
                </Badge>
                {organizationName && (
                  <Badge variant="outline" className="text-emerald-400 border-emerald-400/30 bg-emerald-400/10 text-[10px] px-2 capitalize">
                    {organizationName}
                  </Badge>
                )}
                <Badge
                  variant="outline"
                  className={`flex items-center gap-1 border-0 text-[10px] px-2 ${isOnline ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}
                >
                  {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                  {isOnline ? 'En línea' : 'Desconectado'}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-3">
              {/* Notifications */}
              <Popover open={alertsOpen} onOpenChange={setAlertsOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/10 relative h-10 w-10 rounded-xl border border-white/5"
                  >
                    <Bell className="h-5 w-5" />
                    {alertsCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-md">
                        {alertsCount}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-80 p-0 overflow-hidden border-white/5 bg-slate-900 text-white shadow-2xl"
                  align="end"
                  sideOffset={8}
                >
                  <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-4 border-b border-white/5">
                    <h3 className="font-semibold text-sm flex items-center gap-2">
                      <Bell className="h-4 w-4 text-emerald-400" />
                      Notificaciones
                      {alertsCount > 0 && (
                        <Badge className="bg-red-500 text-white text-[10px] ml-auto border-0">
                          {alertsCount}
                        </Badge>
                      )}
                    </h3>
                  </div>
                  <div className="max-h-80 overflow-y-auto custom-scrollbar bg-slate-900/50">
                    {stockAlerts.length === 0 ? (
                      <div className="p-8 text-center text-xs text-slate-500 italic">
                        No hay alertas proyectadas para hoy
                      </div>
                    ) : (
                      stockAlerts.map((alert) => (
                        <div
                          key={alert.id}
                          className="flex items-start gap-4 p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer group"
                        >
                          <div className="p-2 rounded-xl bg-amber-500/10 flex-shrink-0 group-hover:scale-110 transition-transform">
                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-200 uppercase tracking-tight">
                              Stock Crítico
                            </p>
                            <p className="text-sm text-slate-400 mt-1 leading-tight">
                              <span className="text-white font-medium">
                                {alert.productName}
                              </span>
                              : Quedan {alert.currentStock} unidades
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-600 hover:text-white hover:bg-white/5 rounded-lg flex-shrink-0"
                            onClick={() => handleDismissAlert(alert.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                  {stockAlerts.length > 0 && (
                    <div className="p-3 border-t border-white/5 bg-slate-900/80 backdrop-blur-md">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-xs text-emerald-400 hover:text-emerald-300 hover:bg-emerald-400/10 rounded-lg h-9"
                        onClick={() => {
                          setAlertsOpen(false);
                          navigate("/muestras");
                        }}
                      >
                        Gestionar Inventario
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  )}
                </PopoverContent>
              </Popover>

              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10 h-10 w-10 rounded-xl border border-white/5"
                onClick={loadDashboardData}
                disabled={loading}
              >
                <RefreshCcw className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="text-red-400 hover:bg-red-400/10 h-10 w-10 rounded-xl border border-red-400/10"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>

            <div className="text-right">
              <div className="text-2xl font-mono font-bold tracking-tighter text-white">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </div>
              <div className="text-[10px] text-emerald-400/60 uppercase tracking-widest font-medium">
                {currentTime.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}
              </div>
            </div>
          </div>
        </div>

        {/* Sync Info Bar */}
        <div className="flex flex-wrap items-center gap-4 py-3 px-4 bg-white/5 rounded-2xl border border-white/5 mb-8 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-xs">
            <RefreshCcw className={`h-3 w-3 text-emerald-400 ${isSyncing ? 'animate-spin' : ''}`} />
            <span className="text-white/60">Última Sinc:</span>
            <span className="text-white font-medium">
              {lastSync ? new Date(lastSync).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Pendiente'}
            </span>
          </div>
          {syncPendingCount > 0 && (
            <Badge className="bg-amber-500 text-amber-950 text-[10px] h-5 px-2 font-bold">
              {syncPendingCount} Pendientes
            </Badge>
          )}
          {!isOnline && (
            <div className="text-[10px] text-amber-400 flex items-center gap-1.5 ml-auto italic">
              <AlertTriangle className="h-3 w-3" />
              Modo Offline activo
            </div>
          )}
        </div>

        {/* KPI Progress Bars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
          {/* Route Progress */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400">Ruta Diaria</span>
              <span className="text-white font-medium">
                {metrics.visitedToday} / {metrics.totalPlanned}
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${routeProgress}%` }}
              />
            </div>
          </div>

          {/* Sales Progress */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400">Cuota Ventas</span>
              <span className="text-white font-medium">
                ${metrics.salesAmount.toLocaleString()} / $
                {metrics.salesQuota.toLocaleString()}
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(salesProgress, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* ===================================================================
          MAIN CONTENT - Floating effect with negative margin
          =================================================================== */}
      <main className="px-4 -mt-6 pb-6 space-y-4">
        {/* -----------------------------------------------------------------
            WIDGET: Tu Ruta
            ----------------------------------------------------------------- */}
        <Card className="shadow-md border-0 bg-white">
          <CardHeader className="py-3 px-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center text-base font-semibold">
                <MapPin className="h-4 w-4 text-blue-600 mr-2" />
                Tu Ruta
              </CardTitle>
              {pendingCount > 0 && (
                <Badge
                  variant="secondary"
                  className="bg-blue-100 text-blue-700 hover:bg-blue-100 text-xs px-2 py-0.5"
                >
                  {pendingCount} Pendientes
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0">
            {visits.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <MapPin className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No tienes visitas agendadas.</p>
                <Button
                  variant="link"
                  className="mt-1 text-blue-600 text-sm p-0 h-auto"
                  onClick={() => navigate("/visits")}
                >
                  Ir al planificador
                </Button>
              </div>
            ) : (
              <div className="space-y-0">
                {visits.map((visit, index) => {
                  const isCompleted = visit.status === "completed";
                  const isLast = index === visits.length - 1;

                  return (
                    <div
                      key={visit.id}
                      className="flex gap-2 cursor-pointer"
                      onClick={() => !isCompleted && handleStartVisit(visit.id)}
                    >
                      {/* Timeline Column */}
                      <div className="flex flex-col items-center w-12 flex-shrink-0">
                        <span
                          className={`text-[10px] font-semibold mb-0.5 ${isCompleted ? "text-emerald-600" : "text-slate-500"
                            }`}
                        >
                          {visit.scheduledTime}
                        </span>
                        <div
                          className={`w-2.5 h-2.5 rounded-full border-2 ${isCompleted
                            ? "bg-emerald-500 border-emerald-500"
                            : "bg-white border-blue-500"
                            }`}
                        />
                        {!isLast && (
                          <div
                            className={`w-0.5 flex-1 min-h-[32px] ${isCompleted ? "bg-emerald-300" : "bg-slate-200"
                              }`}
                          />
                        )}
                      </div>

                      {/* Content Column */}
                      <div
                        className={`flex-1 pb-3 ${!isLast ? "border-b border-slate-100" : ""
                          }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h4
                              className={`font-medium text-sm truncate ${isCompleted
                                ? "text-slate-400 line-through"
                                : "text-slate-900"
                                }`}
                            >
                              {visit.contactName}
                            </h4>
                            <p className="text-[11px] text-slate-500 truncate">
                              {visit.address}
                            </p>
                          </div>

                          {/* Action Button */}
                          {isCompleted ? (
                            <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                          ) : (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 text-blue-600 hover:bg-blue-50 flex-shrink-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenNavigation(visit);
                              }}
                            >
                              <Navigation className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* -----------------------------------------------------------------
            WIDGET: Accesos Rápidos
            ----------------------------------------------------------------- */}
        <Card className="shadow-md border-0 bg-white">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-base font-semibold">
              Accesos Rápidos
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0">
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-20 flex-col gap-1.5 border hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-700 transition-all group"
                onClick={() => navigate("/muestras")}
              >
                <div className="p-2 rounded-full bg-slate-100 group-hover:bg-emerald-100 transition-colors">
                  <Package className="h-5 w-5 text-slate-600 group-hover:text-emerald-600" />
                </div>
                <span className="text-xs font-medium">Mi Inventario</span>
              </Button>

              <Button
                variant="outline"
                className="h-20 flex-col gap-1.5 border hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700 transition-all group"
                onClick={() => navigate("/expenses")}
              >
                <div className="p-2 rounded-full bg-slate-100 group-hover:bg-blue-100 transition-colors">
                  <DollarSign className="h-5 w-5 text-slate-600 group-hover:text-blue-600" />
                </div>
                <span className="text-xs font-medium">Reportar Gasto</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
