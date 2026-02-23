/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import { supabase } from '@/integrations/supabase/client';

/**
 * Recalculates the progress of all active objectives for a user
 */
export async function refreshObjectivesProgress(userId: string) {
    try {
        // 1. Get active objectives
        const { data: objectives, error: objectivesError } = await supabase
            .from('objectives')
            .select('*')
            .eq('user_id', userId)
            .eq('status', 'active');

        if (objectivesError) throw objectivesError;
        if (!objectives || objectives.length === 0) return;

        for (const objective of objectives) {
            let newValue = 0;
            const startDate = objective.start_date;
            const endDate = objective.end_date;

            switch (objective.category) {
                case 'visits':
                    // Count completed visits in period
                    const { count: visitCount } = await supabase
                        .from('visits')
                        .select('*', { count: 'exact', head: true })
                        .eq('user_id', userId)
                        .eq('status', 'completed')
                        .gte('actual_start_time', startDate)
                        .lte('actual_start_time', endDate);
                    newValue = visitCount || 0;
                    break;

                case 'contacts':
                    // Count new contacts in period
                    const { count: contactCount } = await supabase
                        .from('contacts')
                        .select('*', { count: 'exact', head: true })
                        .eq('user_id', userId)
                        .gte('created_at', startDate)
                        .lte('created_at', endDate);
                    newValue = contactCount || 0;
                    break;

                case 'samples':
                    // Count samples distributed in period (using 'promotion' movement type)
                    const { data: sampleData } = await supabase
                        .from('sample_movements')
                        .select('quantity')
                        .eq('user_id', userId)
                        .eq('movement_type', 'promotion')
                        .gte('created_at', startDate)
                        .lte('created_at', endDate);

                    newValue = (sampleData as { quantity: number }[] || []).reduce((sum, s) => sum + (s.quantity || 0), 0);
                    break;

                case 'events':
                    // Count completed events in period
                    const { count: eventCount } = await supabase
                        .from('events')
                        .select('*', { count: 'exact', head: true })
                        .eq('user_id', userId)
                        .eq('status', 'completed')
                        .gte('scheduled_date', startDate)
                        .lte('scheduled_date', endDate);
                    newValue = eventCount || 0;
                    break;

                case 'sales':
                    // Sum total of direct sales in period
                    const { data: salesData } = await (supabase as any)
                        .from('transfer_orders')
                        .select('total')
                        .eq('user_id', userId)
                        .eq('order_type', 'direct_sale')
                        .in('status', ['sent', 'delivered', 'confirmed'])
                        .gte('created_at', startDate)
                        .lte('created_at', endDate);

                    newValue = (salesData as { total: number }[] || []).reduce((sum, s) => sum + (Number(s.total) || 0), 0);
                    break;
            }

            // Update objective if value changed
            if (newValue !== objective.current_value) {
                const status = newValue >= objective.target_value ? 'completed' : 'active';
                await supabase
                    .from('objectives')
                    .update({
                        current_value: newValue,
                        status: status,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', objective.id);
            }
        }
    } catch (error) {
        console.error('Error refreshing objectives:', error);
    }
}
