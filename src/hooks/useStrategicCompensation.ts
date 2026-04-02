/* ========================================================================
 * MASTER FRAMEWORK - EMPRESA CA
 * Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
 * ======================================================================== */

import { useState, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface CompensationPolicy {
    id: string;
    base_salary: number;
    food_stamps: number;
    vehicle_support: number;
    sales_threshold: number;
    commission_rate: number;
    papeleta_conversion_factor: number;
    daily_no_stay_amount: number;
    daily_with_stay_amount: number;
    fuel_autonomy_factor: number;
}

export function useStrategicCompensation(organizationId: string) {
    const [loading, setLoading] = useState(false);

    /**
     * NORMALIZACIÓN: Aplica la regla 6 papeletas = 1 unidad
     */
    const normalizeUnits = useCallback((items: any[], policy: CompensationPolicy) => {
        return items.reduce((total, item) => {
            // Asumimos que el producto tiene una categoría o flag para papeletas
            const isPapeleta = item.category?.toLowerCase() === 'papeleta' || 
                              item.product_name?.toLowerCase().includes('papeleta');
            
            if (isPapeleta) {
                return total + (item.quantity / policy.papeleta_conversion_factor);
            }
            return total + item.quantity;
        }, 0);
    }, []);

    /**
     * CÁLCULO DE COMISIÓN: Aplica umbral (prioriza el umbral de la Zona si existe) y porcentaje
     */
    const calculateCommission = useCallback((totalUnits: number, netSales: number, policy: CompensationPolicy, zoneThreshold?: number) => {
        const thresholdToApply = zoneThreshold !== undefined && zoneThreshold > 0 ? zoneThreshold : policy.sales_threshold;
        if (totalUnits <= thresholdToApply) return 0;
        return netSales * policy.commission_rate;
    }, []);

    /**
     * CÁLCULO DE GASOLINA: km / factor autonomía
     */
    const calculateFuelIndemnity = useCallback((km: number, policy: CompensationPolicy) => {
        return km / policy.fuel_autonomy_factor;
    }, []);

    /**
     * CARGAR POLÍTICA ACTIVA
     */
    const getActivePolicy = useCallback(async () => {
        const { data, error } = await supabase
            .from('compensation_policies' as any)
            .select('*')
            .eq('organization_id', organizationId)
            .eq('is_active', true)
            .single();

        if (error) {
            console.error('[Compensation] Error loading policy:', error);
            return null;
        }
        return data as unknown as CompensationPolicy;
    }, [organizationId]);

    return {
        loading,
        normalizeUnits,
        calculateCommission,
        calculateFuelIndemnity,
        getActivePolicy
    };
}
