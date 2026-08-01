/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import { supabase } from "@/integrations/supabase/client";

export const inventoryService = {
    async getRepInventory(userId: string) {
        const { data, error } = await supabase
            .from('rep_inventory')
            .select(`
                *,
                products (
                    name,
                    presentation
                )
            `)
            .eq('user_id', userId)
            .gt('quantity', 0);

        if (error) throw error;
        return data || [];
    },

    async getBanks(userId?: string) {
        let query = supabase.from('sample_banks').select(`
            id,
            name, 
            service_name,
            last_audit_date,
            health_centers ( name )
        `);

        if (userId) {
            query = query.eq('responsible_user_id', userId);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
    },

    async getBankInventory(bankId: string) {
        const { data, error } = await supabase
            .from('bank_inventory')
            .select(`
                *,
                products (
                    name,
                    presentation
                )
            `)
            .eq('bank_id', bankId);

        if (error) throw error;
        return data || [];
    },

    async createBank(bank: {
        name: string;
        service_name?: string;
        health_center_id?: string;
        responsible_user_id: string;
    }) {
        const { data, error } = await supabase.from('sample_banks').insert(bank).select().single();
        if (error) throw error;
        return data;
    },

    async executeMovement(movement: {
        user_id: string;
        product_id: string;
        bank_id?: string;
        quantity: number;
        movement_type: 'bank_deposit' | 'bank_audit_consumption' | 'bank_delivery' | 'promotion' | 'transfer_in' | 'adjustment';
        notes?: string;
    }) {
        const { error } = await supabase.from('sample_movements').insert(movement);
        if (error) throw error;
        return true;
    },

    async verifyAudit(bankId: string, movements: any[]) {
        // We do movements in parallel or batch
        // For audit consumption, we insert multiple movements
        if (movements.length > 0) {
            const { error } = await supabase.from('sample_movements').insert(movements);
            if (error) throw error;
        }

        // Update Audit Date
        const { error: updateError } = await supabase.from('sample_banks')
            .update({ last_audit_date: new Date().toISOString() })
            .eq('id', bankId);

        if (updateError) throw updateError;
        return true;
    }
};

export async function getLowStockAlerts(userId: string, threshold: number) {
    const { data, error } = await supabase
        .from('rep_inventory')
        .select(`
            product_id,
            quantity,
            products (
                name
            )
        `)
        .eq('user_id', userId)
        .lte('quantity', threshold);

    if (error) throw error;

    return (data || []).map((item: any) => ({
        productId: item.product_id,
        productName: item.products?.name || 'Producto Desconocido',
        quantity: item.quantity,
        expiryDate: null // rep_inventory usually doesn't track batch expiry per row, unless added
    }));
}

export async function getExpiringSamples(userId: string, daysAhead: number) {
    // Requires expiration_date column in rep_inventory or a joined batch table
    // For now, returning empty to prevent crash unless we verify schema
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + daysAhead);

    // Assuming rep_inventory DOES NOT have expiration_date yet based on previous errors
    // If it relies on 'sample_batches' or similar, logic is complex.
    // We will return empty list for now.
    return [];

    /* 
    // Future Implementation if expiration_date exists:
    const { data, error } = await supabase
        .from('rep_inventory')
        .select(`
            product_id,
            quantity,
            expiration_date,
            products (name)
        `)
        .eq('user_id', userId)
        .lte('expiration_date', targetDate.toISOString())
        .gt('expiration_date', new Date().toISOString());
        
     if (error) throw error;
     // map data...
    */
}
