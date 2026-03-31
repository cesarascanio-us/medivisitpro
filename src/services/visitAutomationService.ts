/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

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
    title?: string;
    description?: string;
    steps?: string[];
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
    const isDoctor = entityType === 'doctor';
    const isCommerce = entityType === 'pharmacy' || entityType === 'store' || entityType === 'drugstore' || entityType === 'natural_store';
    const isNaturalStore = entityType === 'natural_store';

    if (visitCount === 0) {
        return {
            type: 'conquest',
            label: isNaturalStore ? 'Alta Comercial (V1)' : 'Conquista (Visita 1)',
            title: isDoctor ? 'Captación y Perfilamiento' : 'Alta Comercial y Mapeo',
            description: isDoctor
                ? 'Primer contacto: Identificar potencial receptivo y perfil médico (Ley de Pareto).'
                : 'Validación de local, inventario inicial y perfilamiento de compra.',
            steps: isDoctor
                ? ['Profiling Médico', 'Presentación Institucional', 'Acuerdo de Prueba']
                : ['Mapeo de Exhibición', 'Perfilamiento Comercial', 'Validación de Datos'],
            suggestedObjective: isNaturalStore
                ? 'Alta Comercial y Primer Pedido (Venta Directa)'
                : isCommerce
                    ? 'Recolección de Documentos y Primer Pedido'
                    : 'Levantamiento de Perfil y Presentación',
            showMasterDataCard: true,
            showCloseFields: false,
        };
    } else if (visitCount === 1) {
        return {
            type: 'development',
            label: 'Desarrollo (Visita 2)',
            title: 'Evidencia y Desarrollo',
            description: 'Validar experiencia con muestras anteriores y profundizar en el pitch neuro-ventas.',
            steps: ['Validación de Muestra', 'Presentación de Ayuda Visual', 'Manejo de Objecciones'],
            suggestedObjective: 'Validar uso de muestras y Experiencia del paciente',
            showMasterDataCard: false,
            showCloseFields: false,
        };
    } else {
        return {
            type: 'maturity',
            label: 'Fidelización (Visita 3+)',
            title: 'Mantenimiento y Cierre',
            description: 'Fidelización, reposición de inventario y cierre de compromisos recurrentes.',
            steps: ['Inventario / Falla', 'Registro de Pedido', 'Refuerzo de Marca'],
            suggestedObjective: entityType === 'natural_store'
                ? 'Reposición de Inventario y Venta'
                : 'Lograr cierre / Reposición de Inventario',
            showMasterDataCard: false,
            showCloseFields: true,
        };
    }
}


export const calculateCycleCondition = (visitCount: number, salesDropPercent: number = 0) => {
    // If sales drop is critical (>20%), the contact is automatically "At Risk"
    if (salesDropPercent > 20) {
        return "at_risk";
    }
    
    if (visitCount === 0) return "new";
    if (visitCount <= 2) return "developing";
    return "stable";
};

export const calculateSuggestedNextVisit = (priority: string = 'medium', lastDate?: string) => {
    // Frequency based on Potential (Priority)
    // High/Urgent -> 15 days
    // Medium -> 30 days
    // Low -> 45 days
    
    let daysToAdd = 30;
    const p = priority?.toLowerCase();
    
    if (p === 'high' || p === 'urgent') daysToAdd = 15;
    else if (p === 'low') daysToAdd = 45;
    
    const date = lastDate ? new Date(lastDate) : new Date();
    date.setDate(date.getDate() + daysToAdd);
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
 * Calculate smart next visit date (frequency based on priority/potential)
 */
export function calculateNextVisitDate(fromDate: Date = new Date(), priority: string = 'medium'): string {
    const nextDate = new Date(fromDate);
    
    let monthsToAdd = 1;
    let daysToAdd = 0;
    
    const p = priority?.toLowerCase();
    if (p === 'high' || p === 'urgent') {
        daysToAdd = 15; // High potential visits every 15 days
    } else if (p === 'low') {
        monthsToAdd = 1;
        daysToAdd = 15; // Low potential visits every 45 days (approx)
    } else {
        monthsToAdd = 1; // Medium potential visits every month
    }

    if (monthsToAdd > 0) nextDate.setMonth(nextDate.getMonth() + monthsToAdd);
    if (daysToAdd > 0) nextDate.setDate(nextDate.getDate() + daysToAdd);

    // Ensure same day of week for regularity
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
    lastCommitment: string | null,
    salesDropPercent: number = 0
): string {
    // If sales drop is significant, prioritize recovery
    if (salesDropPercent > 20) {
        return `RECUPERACIÓN: Analizar causa de caída del ${salesDropPercent.toFixed(0)}% en ventas y reactivar prescripción.`;
    }

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
