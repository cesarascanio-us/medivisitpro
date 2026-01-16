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
} from "lucide-react";
import { useNavigate } from "react-router-dom";

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
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [visits, setVisits] = useState<VisitItem[]>(MOCK_VISITS);
  const [metrics, setMetrics] = useState<DailyMetrics>(MOCK_METRICS);
  const [stockAlerts, setStockAlerts] = useState<StockAlert[]>(MOCK_ALERTS);
  const [alertsOpen, setAlertsOpen] = useState(false);

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
    <div className="min-h-screen bg-slate-100">
      {/* ===================================================================
          HEADER - Dark with rounded bottom
          =================================================================== */}
      <header className="bg-slate-900 text-white px-4 pt-4 pb-14 rounded-b-[2rem]">
        {/* Top Row: Greeting + Actions */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-slate-400 text-xs">Hola,</p>
            <h1 className="text-lg font-bold leading-tight">{userName}</h1>
          </div>
          <div className="flex items-center gap-1">
            {/* Bell with Notification Badge */}
            <Popover open={alertsOpen} onOpenChange={setAlertsOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/10 relative"
                >
                  <Bell className="h-5 w-5" />
                  {alertsCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                      {alertsCount}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-80 p-0"
                align="end"
                sideOffset={8}
              >
                <div className="bg-slate-900 text-white p-3 rounded-t-lg">
                  <h3 className="font-semibold text-sm flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    Notificaciones
                    {alertsCount > 0 && (
                      <Badge className="bg-red-500 text-white text-xs ml-auto">
                        {alertsCount}
                      </Badge>
                    )}
                  </h3>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {stockAlerts.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      No tienes alertas pendientes
                    </div>
                  ) : (
                    stockAlerts.map((alert) => (
                      <div
                        key={alert.id}
                        className="flex items-start gap-3 p-3 border-b last:border-b-0 hover:bg-slate-50 transition-colors"
                      >
                        <div className="p-1.5 rounded-full bg-amber-100 flex-shrink-0">
                          <AlertTriangle className="h-4 w-4 text-amber-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900">
                            Stock Bajo
                          </p>
                          <p className="text-xs text-slate-600 mt-0.5">
                            <span className="font-medium">
                              {alert.productName}
                            </span>
                            : Solo {alert.currentStock} unidades
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-slate-400 hover:text-slate-600 flex-shrink-0"
                          onClick={() => handleDismissAlert(alert.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
                {stockAlerts.length > 0 && (
                  <div className="p-2 border-t bg-slate-50">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      onClick={() => {
                        setAlertsOpen(false);
                        navigate("/rep-inventory");
                      }}
                    >
                      Ver Inventario
                      <ChevronRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>

            {/* Refresh */}
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10"
              onClick={loadDashboardData}
              disabled={loading}
            >
              <RefreshCcw
                className={`h-5 w-5 ${loading ? "animate-spin" : ""}`}
              />
            </Button>

            {/* Logout */}
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold mb-4">Tu Resumen Hoy</h2>

        {/* KPI Progress Bars */}
        <div className="space-y-3">
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
