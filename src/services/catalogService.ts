/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import { supabase } from "@/integrations/supabase/client";

export const catalogService = {
    async getProduct(id: string) {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    },

    async getAssets(productId: string) {
        const { data, error } = await supabase
            .from('product_assets')
            .select('*')
            .eq('product_id', productId)
            .eq('is_active', true)
            .order('display_order');

        if (error) throw error;
        return data || [];
    },

    async getOffers(productId: string) {
        const { data, error } = await supabase
            .from('commercial_offers')
            .select('*')
            .eq('product_id', productId)
            .eq('active', true);

        if (error) throw error;
        return data || [];
    },

    getShareLink(productId: string) {
        // Generate a shareable link (simulated or real)
        return `https://medivisitpro.app/catalog/share/${productId}`;
    }
};
