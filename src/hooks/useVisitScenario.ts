/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
    VisitScenario,
    VisitHistory,
    AutoCalculatedFields,
    determineScenario,
    getVisitHistory,
    getCurrentCycle,
    calculateNextVisitDate,
    generateSmartObjective,
} from '@/services/visitAutomationService';

export interface UseVisitScenarioResult {
    loading: boolean;
    scenario: VisitScenario | null;
    history: VisitHistory;
    autoFields: AutoCalculatedFields;
    refresh: () => Promise<void>;
}

/**
 * Hook that provides lifecycle scenario detection and auto-calculated fields
 * for a visit based on the directory item's history
 */
export function useVisitScenario(
    directoryItemId: string | null,
    entityType?: string
): UseVisitScenarioResult {
    const [loading, setLoading] = useState(true);
    const [scenario, setScenario] = useState<VisitScenario | null>(null);
    const [history, setHistory] = useState<VisitHistory>({ visitCount: 0, lastVisit: null });
    const [autoFields, setAutoFields] = useState<AutoCalculatedFields>({
        cycleId: null,
        suggestedNextVisitDate: calculateNextVisitDate(),
        suggestedObjective: '',
    });

    const loadScenarioData = useCallback(async () => {
        if (!directoryItemId) {
            setLoading(false);
            return;
        }

        setLoading(true);

        try {
            // Check if this is a demo ID
            const isDemo = directoryItemId?.startsWith('detail-');

            // Fetch data in parallel
            const [visitHistory, cycleId, metadata] = await Promise.all([
                isDemo ? Promise.resolve({ visitCount: 0, lastVisit: null }) : getVisitHistory(directoryItemId),
                isDemo ? Promise.resolve('cycle-001') : getCurrentCycle(),
                isDemo ? Promise.resolve({ priority: 'medium', sales_drop_percent: 0 }) : 
                    // Fetch priority and potential sales drop from metadata/view
                    supabase
                        .from('view_next_best_action' as any)
                        .select('potential, sales_drop_percent')
                        .eq('id', directoryItemId)
                        .maybeSingle()
                        .then(({ data }: { data: any }) => ({
                            priority: data?.potential || 'medium',
                            sales_drop_percent: data?.sales_drop_percent || 0
                        }))
            ]);

            // Determine scenario based on visit count and entity type
            const visitScenario = determineScenario(visitHistory.visitCount, entityType);

            // Generate smart objective (Pass sales drop for recovery logic)
            const smartObjective = generateSmartObjective(
                visitScenario,
                visitHistory.lastVisit?.commitment || null,
                metadata.sales_drop_percent
            );

            // Calculate next visit date (Pass priority for frequency logic)
            const nextVisitDate = calculateNextVisitDate(new Date(), metadata.priority);

            setHistory(visitHistory);
            setScenario(visitScenario);
            setAutoFields({
                cycleId,
                suggestedNextVisitDate: nextVisitDate,
                suggestedObjective: smartObjective,
            });
        } catch (err) {
            console.error('Error loading visit scenario:', err);
        } finally {
            setLoading(false);
        }
    }, [directoryItemId, entityType]);

    useEffect(() => {
        loadScenarioData();
    }, [loadScenarioData]);

    return {
        loading,
        scenario,
        history,
        autoFields,
        refresh: loadScenarioData,
    };
}
