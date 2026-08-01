/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import { supabase } from "@/integrations/supabase/client";
import { VisitExecution } from "@/types/visits";
import { enqueuePendingOperation } from "@/lib/offlineSync";

export const visitService = {
    async getVisitById(id: string) {
        const { data: visitData, error: visitError } = await supabase
            .from('visits')
            .select('*')
            .eq('id', id)
            .single();

        if (visitError) throw visitError;

        let unified_contacts = null;
        if (visitData && (visitData.contact_id || visitData.pharmacy_id)) {
            const { data: contactData } = await supabase
                .from('unified_contacts')
                .select('*')
                .eq('id', visitData.contact_id || visitData.pharmacy_id)
                .single();
            unified_contacts = contactData;
        }

        const data = { ...visitData, unified_contacts };
        return data as unknown as VisitExecution;
    },

    async checkIn(id: string, lat: number, lng: number, outOfRange: boolean) {
        const updateData = {
            id,
            checkin_at: new Date().toISOString(),
            status: 'in_progress',
            location_lat: lat,
            location_lng: lng,
            out_of_range: outOfRange
        };

        if (!navigator.onLine) {
            await enqueuePendingOperation('visit', 'update', 'visits', updateData);
            return true;
        }

        const { error } = await supabase
            .from('visits')
            .update(updateData as any)
            .eq('id', id);

        if (error) throw error;
        return true;
    },

    async checkOut(id: string, data: {
        emotional_state: string;
        purchase_driver: string;
        next_commitment: string;
        notes: string;
        interview_data: any;
    }) {
        const updateData = {
            id,
            checkout_at: new Date().toISOString(),
            status: 'completed',
            ...data
        };

        if (!navigator.onLine) {
            await enqueuePendingOperation('visit', 'update', 'visits', updateData);
            return true;
        }

        const { error } = await supabase
            .from('visits')
            .update(updateData as any)
            .eq('id', id);

        if (error) throw error;
        return true;
    }
};
