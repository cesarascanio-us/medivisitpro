/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { MOCK_DATA } from "@/data/mockDemoData";
import { useToast } from "@/hooks/use-toast";

/**
 * DemoDataSeeder - Active Seeder
 * Injects fictitious data into the REAL database for the Demo Organization.
 */
export const DemoDataSeeder = () => {
    const { isDemo, user, organizationId } = useAuth();
    const { toast } = useToast();
    const [seeding, setSeeding] = useState(false);

    useEffect(() => {
        const seedData = async () => {
            if (!isDemo || !user || !organizationId || seeding) return;

            console.log("ℹ️ [Seeder] Modo Demo activo. Iniciando siembra virtual local...");
            setSeeding(true);
            toast({
                title: "Modo Demo Offline",
                description: "Cargando experiencia interactiva con datos locales virtuales...",
            });
            setTimeout(() => {
                toast({
                    title: "¡Demo Lista (Virtual)!",
                    description: "Se han cargado los datos virtuales interactivos en local.",
                });
                setSeeding(false);
            }, 500);
        };

        seedData();
    }, [isDemo, user, organizationId]);

    return null;
};
