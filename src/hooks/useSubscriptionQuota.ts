/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const PLAN_LIMITS = {
    starter: {
        doctors: 120,
        pharmacies: 100,
        routes: 'basic',
        analytics: false
    },
    pro: {
        doctors: Infinity,
        pharmacies: Infinity,
        routes: 'smart',
        analytics: true
    },
    team: {
        doctors: Infinity,
        pharmacies: Infinity,
        routes: 'smart',
        analytics: true
    },
    free: { // Legacy or strictly locked
        doctors: 50,
        pharmacies: 20,
        routes: 'basic',
        analytics: false
    }
};

export type PlanTier = 'starter' | 'pro' | 'team' | 'free';

export function useSubscriptionQuota() {
    const { user, role, organizationId, isDemo } = useAuth();
    const [tier, setTier] = useState<PlanTier>('starter');
    const [usage, setUsage] = useState({ doctors: 0, pharmacies: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsage = async () => {
            if (isDemo) {
                setTier('team'); // Unlimited/Team plan for Demo
                setUsage({ doctors: 45, pharmacies: 18 });
                setLoading(false);
                return;
            }

            if (!user) {
                setLoading(false);
                return;
            }
            setLoading(true);

            // 1. Determine Tier (Mock Logic)
            // Managers/Admins are Team (Unlimited) for their Org
            // Reps are Starter by default.
            let currentTier: PlanTier = 'starter';

            if (role === 'master' || role === 'admin' || role === 'manager' || role === 'coordinator') {
                currentTier = 'team';
            } else {
                // Representative
                currentTier = 'starter';
                // Future Improvement: Check 'organizations' table for plan_id
            }
            setTier(currentTier);

            // 2. Fetch Counts (Only needed for limited plans)
            if (currentTier === 'starter') {
                try {
                    const { count: docsCount } = await supabase
                        .from('doctors')
                        .select('id', { count: 'exact', head: true })
                        .eq('user_id', user.id);

                    const { count: pharmsCount } = await supabase
                        .from('pharmacies')
                        .select('id', { count: 'exact', head: true })
                        .eq('user_id', user.id);

                    setUsage({
                        doctors: docsCount || 0,
                        pharmacies: pharmsCount || 0
                    });
                } catch (e) {
                    console.error("Error fetching quota usage", e);
                }
            } else {
                // Unlimited tiers
                setUsage({ doctors: 0, pharmacies: 0 });
            }
            setLoading(false);
        };

        fetchUsage();
    }, [user, role, organizationId, isDemo]);

    const limits = PLAN_LIMITS[tier] || PLAN_LIMITS.starter;

    const canAddDoctor = usage.doctors < limits.doctors;
    const canAddPharmacy = usage.pharmacies < limits.pharmacies;

    const doctorUsagePercent = limits.doctors !== Infinity
        ? Math.min(100, Math.round((usage.doctors / limits.doctors) * 100))
        : 0;

    const pharmacyUsagePercent = limits.pharmacies !== Infinity
        ? Math.min(100, Math.round((usage.pharmacies / limits.pharmacies) * 100))
        : 0;

    return {
        tier,
        limits,
        usage,
        canAddDoctor,
        canAddPharmacy,
        doctorUsagePercent,
        pharmacyUsagePercent,
        isPro: tier === 'pro' || tier === 'team',
        loading
    };
}
