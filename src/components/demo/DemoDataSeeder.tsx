/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

/**
 * DemoDataSeeder - DISABLED
 * 
 * Now using isolated mock data from MockDataProvider instead of Supabase.
 * This component is kept for backwards compatibility but does nothing.
 * 
 * Mock data is provided by: src/data/mockDemoData.ts
 * Provider: src/contexts/MockDataProvider.tsx
 */
export const DemoDataSeeder = () => {
    const { isDemo } = useAuth();

    useEffect(() => {
        if (isDemo) {
            console.log("DemoDataSeeder: Demo mode active - using local mock data (no Supabase)");
        }
    }, [isDemo]);

    return null;
};
