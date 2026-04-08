/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
 ======================================================================== */

import { useAuth } from "@/hooks/useAuth";
import Dashboard from "./Dashboard";
import MasterPanel from "./MasterPanel";

/**
 * Smart Dashboard Router - NATURISTA ELITE
 * Renders the appropriate tactical console based on user role.
 * 
 * Hierarchy:
 * 1. Master: Full System Console (/master-panel)
 * 2. Everyone Else: Unified Tactical Dashboard personalized by role (Dashboard.tsx)
 */
export default function DashboardRouter() {
    const { isMaster } = useAuth();

    // Master (System Admin) sees the Master Panel elite console
    if (isMaster) {
        return <MasterPanel />;
    }

    // All other operational roles (Manager, Coordinator, Supervisor, TM, Representative)
    // use the unified tactical Dashboard which handles personalization dynamically
    // under the Naturista Elite standard (Sovereign Digital Architecture)
    return <Dashboard />;
}
