import { lazy, Suspense } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

// Lazy load role-specific dashboards for better performance and separation of concerns
const DashboardExecutive = lazy(() => import("@/components/dashboard/DashboardExecutive"));
const DashboardRep = lazy(() => import("@/components/dashboard/DashboardRep"));
const DashboardTelemarketing = lazy(() => import("@/components/dashboard/DashboardTelemarketing"));

export default function Dashboard() {
  const { isManager, isAdmin, isMaster, isCoordinator, isSupervisor, isTelemarketing } = useAuth();

  // Unified Loading State
  const LoadingFallback = (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Loader2 className="h-10 w-10 text-primary animate-spin" />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground animate-pulse">Sincronizando Inteligencia...</p>
    </div>
  );

  // Role-Based Dispatching
  const renderDashboard = () => {
    // 1. Executive Level (Global Visibility)
    if (isMaster || isAdmin || isManager) {
      return <DashboardExecutive />;
    }

    // 2. Tactical Level (Team & Routes Visibility)
    if (isCoordinator || isSupervisor) {
      // For now, supervisors use the executive view but with filtered team data (handled inside the component or via another component)
      // If we need a more specific view, we can create DashboardSupervisor
      return <DashboardExecutive />;
    }

    // 3. Operational Level (Leads & Orders)
    if (isTelemarketing) {
      return <DashboardTelemarketing />;
    }

    // 4. Field Level (Agenda & Territory)
    return <DashboardRep />;
  };

  return (
    <Suspense fallback={LoadingFallback}>
      <div className="animate-in fade-in duration-1000">
        {renderDashboard()}
      </div>
    </Suspense>
  );
}
