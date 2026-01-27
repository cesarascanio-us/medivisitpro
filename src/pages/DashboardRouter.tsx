import { useAuth } from "@/hooks/useAuth";
import DashboardSupervisor from "./DashboardSupervisor";
import Dashboard from "./Dashboard";
import MasterPanel from "./MasterPanel";
import DashboardRep from "@/components/dashboard/DashboardRep";
import DashboardTelemarketing from "@/components/dashboard/DashboardTelemarketing";

/**
 * Smart Dashboard Router
 * Renders the appropriate dashboard based on user role
 * 
 * NOTE: Managers and Admins see the same standard Dashboard as reps,
 * but with global data. For advanced analytics, they use Centro de Mando (/dashboard-master)
 */
export default function DashboardRouter() {
    const { isMaster, isManager, isSupervisor, isTelemarketing, isAdmin, role } = useAuth();

    // Master (System Admin) sees the Master Panel
    if (isMaster) {
        return <MasterPanel />;
    }

    // IMPORTANT: Check manager BEFORE supervisor
    // Some managers might also have supervisor flag, check manager first
    if (isManager || isAdmin) {
        return <Dashboard />;
    }

    // Supervisors see team analytics dashboard
    if (isSupervisor) {
        return <DashboardSupervisor />;
    }

    // Telemarketing operators
    if (isTelemarketing) {
        return <DashboardTelemarketing />;
    }

    // Representatives (default)
    return <DashboardRep />;
}
