import { supabase } from '@/integrations/supabase/client';

/**
 * Visit Automation Service
 * Provides predictive automation for visit execution
 */

export interface VisitScenario {
    type: 'conquest' | 'development' | 'maturity';
    label: string;
    suggestedObjective: string;
    showMasterDataCard: boolean;
    showCloseFields: boolean;
}

export interface VisitHistory {
    visitCount: number;
    lastVisit: {
        date: string;
        commitment: string | null;
        notes: string | null;
        interview_data: any;
        samples_delivered: string | null;
    } | null;
}

export interface AutoCalculatedFields {
    cycleId: string | null;
    suggestedNextVisitDate: string;
    suggestedObjective: string;
}

/**
 * Determine the visit scenario based on visit count and entity type
 */
export function determineScenario(visitCount: number, entityType?: string): VisitScenario {
    if (visitCount === 0) {
        const isCommerce = entityType === 'pharmacy' || entityType === 'store' || entityType === 'drugstore' || entityType === 'natural_store';
        return {
            type: 'conquest',
            label: 'Conquista (Visita 1)',
            suggestedObjective: isCommerce
                ? 'Recolección de Documentos y Primer Pedido'
                : 'Levantamiento de Perfil y Presentación',
            showMasterDataCard: true,
            showCloseFields: false,
        };
    } else if (visitCount === 1) {
        return {
            type: 'development',
            label: 'Seguimiento (Visita 2)',
            suggestedObjective: 'Validar uso de muestras y Experiencia',
            showMasterDataCard: false,
            showCloseFields: false,
        };
    } else {
        return {
            type: 'maturity',
            label: 'Mantenimiento (Visita 3+)',
            suggestedObjective: 'Lograr cierre / Reposición de Inventario',
            showMasterDataCard: false,
            showCloseFields: true,
        };
    }
}

export const calculateCycleCondition = (visitCount: number) => {
    // Implementation placeholder based on visit count
    return visitCount === 0 ? "new" : "recurring";
};

export const calculateSuggestedNextVisit = (lastDate?: string) => {
    // Implementation placeholder
    const date = lastDate ? new Date(lastDate) : new Date();
    date.setDate(date.getDate() + 30);
    return date.toISOString();
};

export const autoSuggestObjective = (scenario: VisitScenario) => {
    return scenario.suggestedObjective;
};

/**
 * Get the current active promotional cycle
 */
export async function getCurrentCycle(): Promise<string | null> {
    try {
        const today = new Date().toISOString().split('T')[0];

        const { data, error } = await supabase
            .from('promotional_cycles')
            .select('id')
            .lte('start_date', today)
            .gte('end_date', today)
            .eq('status', 'active')
            .single();

        if (error || !data) {
            // Fallback: get most recent cycle
            const { data: fallback } = await supabase
                .from('promotional_cycles')
                .select('id')
                .order('start_date', { ascending: false })
                .limit(1)
                .single();

            return fallback?.id || null;
        }

        return data.id;
    } catch (err) {
        console.error('Error fetching current cycle:', err);
        return null;
    }
}

/**
 * Calculate smart next visit date (same day of week, 1 month later)
 */
export function calculateNextVisitDate(fromDate: Date = new Date()): string {
    const nextDate = new Date(fromDate);
    nextDate.setMonth(nextDate.getMonth() + 1);

    // Ensure same day of week
    const currentDayOfWeek = fromDate.getDay();
    const futureDayOfWeek = nextDate.getDay();

    if (currentDayOfWeek !== futureDayOfWeek) {
        const diff = currentDayOfWeek - futureDayOfWeek;
        nextDate.setDate(nextDate.getDate() + diff);
    }

    return nextDate.toISOString().split('T')[0];
}

/**
 * Get visit history for a directory item (contact)
 */
export async function getVisitHistory(directoryItemId: string): Promise<VisitHistory> {
    try {
        // Get total visit count
        const { count } = await supabase
            .from('visits')
            .select('*', { count: 'exact', head: true })
            .eq('directory_item_id', directoryItemId)
            .eq('status', 'completed');

        // Get last completed visit
        const { data: lastVisitData } = await supabase
            .from('visits')
            .select('scheduled_date, next_commitment, notes, interview_data, samples_delivered')
            .eq('directory_item_id', directoryItemId)
            .eq('status', 'completed')
            .order('scheduled_date', { ascending: false })
            .limit(1)
            .single();

        return {
            visitCount: count || 0,
            lastVisit: lastVisitData ? {
                date: lastVisitData.scheduled_date,
                commitment: lastVisitData.next_commitment,
                notes: lastVisitData.notes,
                interview_data: lastVisitData.interview_data,
                samples_delivered: lastVisitData.samples_delivered,
            } : null,
        };
    } catch (err) {
        console.error('Error fetching visit history:', err);
        return { visitCount: 0, lastVisit: null };
    }
}

/**
 * Generate AI heuristic objective based on last visit commitment
 */
export function generateSmartObjective(
    scenario: VisitScenario,
    lastCommitment: string | null
): string {
    // If there's a previous commitment, create follow-up objective
    if (lastCommitment) {
        const lowerCommitment = lastCommitment.toLowerCase();

        if (lowerCommitment.includes('paciente') || lowerCommitment.includes('tratamiento')) {
            return `Verificar resultados: "${lastCommitment}"`;
        }
        if (lowerCommitment.includes('probar') || lowerCommitment.includes('muestra')) {
            return `Seguimiento de prueba: "${lastCommitment}"`;
        }
        if (lowerCommitment.includes('pedido') || lowerCommitment.includes('orden')) {
            return `Confirmar pedido: "${lastCommitment}"`;
        }

        // Generic follow-up
        return `Seguimiento: "${lastCommitment}"`;
    }

    // Default to scenario suggestion
    return scenario.suggestedObjective;
}

/**
 * Create a scheduled future visit automatically
 */
export async function createFutureVisit(
    userId: string,
    directoryItemId: string,
    scheduledDate: string,
    objective: string,
    cycleId: string | null
): Promise<{ success: boolean; visitId?: string; error?: string }> {
    if (directoryItemId?.startsWith('detail-')) {
        console.log("Demo Mode: Simulating future visit creation");
        return { success: true, visitId: 'future-demo-visit' };
    }
    try {
        const { data, error } = await supabase
            .from('visits')
            .insert({
                user_id: userId,
                directory_item_id: directoryItemId,
                scheduled_date: `${scheduledDate}T10:00:00`,
                status: 'scheduled',
                objective: objective,
                cycle_id: cycleId,
            })
            .select('id')
            .single();

        if (error) {
            console.error('Error creating future visit:', error);
            return { success: false, error: error.message };
        }

        return { success: true, visitId: data.id };
    } catch (err) {
        console.error('Error in createFutureVisit:', err);
        return { success: false, error: 'Unknown error' };
    }
}

/**
 * Update directory item master data (email, phone)
 * Note: Uses type assertion as these fields may be in entity-specific tables
 */
export async function updateDirectoryMasterData(
    directoryItemId: string,
    data: { email?: string; phone?: string }
): Promise<boolean> {
    if (directoryItemId?.startsWith('detail-')) {
        console.log("Demo Mode: Simulating master data update", data);
        return true;
    }
    try {
        // Update the contacts table if the directory item references a contact
        // First try to find linked contact
        const { data: dirItem } = await supabase
            .from('directory_items')
            .select('entity_id, entity_type')
            .eq('id', directoryItemId)
            .single();

        if (dirItem?.entity_type === 'doctor' && dirItem.entity_id) {
            // Update doctor's contact info
            const { error } = await supabase
                .from('contacts')
                .update({ email: data.email, phone: data.phone } as any)
                .eq('id', dirItem.entity_id);
            return !error;
        }

        // For pharmacies or other entities, store in notes or metadata
        console.log('Master data update for non-doctor entity:', data);
        return true;
    } catch (err) {
        console.error('Error updating master data:', err);
        return false;
    }
}
