/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface SampleDistributionItem {
    sampleInventoryId: string;
    quantity: number;
}

interface SampleDistribution {
    id: string;
    visit_id: string;
    sample_inventory_id: string;
    contact_id: string;
    quantity: number;
    distributed_at: string;
    distributed_by: string;
    notes: string | null;
}

export function useSampleDistribution() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    /**
     * Distribute samples and update inventory
     */
    const distributeSamples = useCallback(async (
        visitId: string,
        contactId: string,
        items: SampleDistributionItem[],
        notes?: string
    ): Promise<boolean> => {
        if (!user) return false;

        setLoading(true);
        try {
            // Validate inventory availability first
            for (const item of items) {
                const { data: inventory, error } = await supabase
                    .from('sample_inventory')
                    .select('quantity_available')
                    .eq('id', item.sampleInventoryId)
                    .single();

                if (error) throw error;
                if (!inventory || inventory.quantity_available < item.quantity) {
                    toast({
                        title: 'Error',
                        description: 'No hay suficientes muestras disponibles.',
                        variant: 'destructive'
                    });
                    return false;
                }
            }

            // Create distribution records
            const distributions = items.map(item => ({
                visit_id: visitId,
                sample_inventory_id: item.sampleInventoryId,
                contact_id: contactId,
                quantity: item.quantity,
                distributed_by: user.id,
                notes: notes || null
            }));

            const { error: insertError } = await (supabase as any)
                .from('sample_distributions')
                .insert(distributions);

            if (insertError) throw insertError;

            // Update inventory for each item (manual update)
            for (const item of items) {
                const { data: current } = await supabase
                    .from('sample_inventory')
                    .select('quantity_available, quantity_distributed')
                    .eq('id', item.sampleInventoryId)
                    .single();

                if (current) {
                    await supabase
                        .from('sample_inventory')
                        .update({
                            quantity_available: (current.quantity_available || 0) - item.quantity,
                            quantity_distributed: (current.quantity_distributed || 0) + item.quantity
                        })
                        .eq('id', item.sampleInventoryId);
                }
            }

            toast({
                title: 'Muestras distribuidas',
                description: `Se distribuyeron ${items.reduce((sum, i) => sum + i.quantity, 0)} muestras.`
            });

            return true;
        } catch (error) {
            console.error('Error distributing samples:', error);
            toast({
                title: 'Error',
                description: 'No se pudieron distribuir las muestras.',
                variant: 'destructive'
            });
            return false;
        } finally {
            setLoading(false);
        }
    }, [user, toast]);

    /**
     * Get distribution history for a contact
     */
    const getDistributionHistory = useCallback(async (contactId: string): Promise<SampleDistribution[]> => {
        try {
            const { data, error } = await (supabase as any)
                .from('sample_distributions')
                .select('*, sample_inventory(products(name))')
                .eq('contact_id', contactId)
                .order('distributed_at', { ascending: false });

            if (error) throw error;
            return (data || []) as SampleDistribution[];
        } catch (error) {
            console.error('Error getting distribution history:', error);
            return [];
        }
    }, []);

    /**
     * Undo a distribution (add samples back to inventory)
     */
    const undoDistribution = useCallback(async (distributionId: string): Promise<boolean> => {
        try {
            // Get distribution details
            const { data: distribution, error: fetchError } = await (supabase as any)
                .from('sample_distributions')
                .select('*')
                .eq('id', distributionId)
                .single();

            if (fetchError) throw fetchError;
            if (!distribution) return false;

            // Update inventory (add back)
            const { data: current } = await supabase
                .from('sample_inventory')
                .select('quantity_available, quantity_distributed')
                .eq('id', distribution.sample_inventory_id)
                .single();

            if (current) {
                await supabase
                    .from('sample_inventory')
                    .update({
                        quantity_available: (current.quantity_available || 0) + distribution.quantity,
                        quantity_distributed: Math.max(0, (current.quantity_distributed || 0) - distribution.quantity)
                    })
                    .eq('id', distribution.sample_inventory_id);
            }

            // Delete distribution record
            const { error: deleteError } = await (supabase as any)
                .from('sample_distributions')
                .delete()
                .eq('id', distributionId);

            if (deleteError) throw deleteError;

            toast({
                title: 'Distribución revertida',
                description: 'Las muestras han sido devueltas al inventario.'
            });

            return true;
        } catch (error) {
            console.error('Error undoing distribution:', error);
            toast({
                title: 'Error',
                description: 'No se pudo revertir la distribución.',
                variant: 'destructive'
            });
            return false;
        }
    }, [toast]);

    return {
        loading,
        distributeSamples,
        getDistributionHistory,
        undoDistribution
    };
}
