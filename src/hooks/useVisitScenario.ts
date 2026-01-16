import { useState, useEffect, useCallback } from 'react';
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
export function useVisitScenario(directoryItemId: string | null): UseVisitScenarioResult {
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
            const [visitHistory, cycleId] = await Promise.all([
                isDemo ? Promise.resolve({ visitCount: 0, lastVisit: null }) : getVisitHistory(directoryItemId),
                isDemo ? Promise.resolve('cycle-001') : getCurrentCycle(),
            ]);

            // Determine scenario based on visit count
            const visitScenario = determineScenario(visitHistory.visitCount);

            // Generate smart objective
            const smartObjective = generateSmartObjective(
                visitScenario,
                visitHistory.lastVisit?.commitment || null
            );

            // Calculate next visit date
            const nextVisitDate = calculateNextVisitDate();

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
    }, [directoryItemId]);

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
