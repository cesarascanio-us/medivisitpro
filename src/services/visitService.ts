import { supabase } from "@/integrations/supabase/client";
import { VisitExecution } from "@/types/visits";

export const visitService = {
    async getVisitById(id: string) {
        const { data, error } = await supabase
            .from('visits')
            .select(`
                *,
                contacts(name, address, specialty),
                directory_items(name, entity_type)
            `)
            .eq('id', id)
            .single();

        if (error) throw error;
        return data as unknown as VisitExecution;
    },

    async checkIn(id: string, lat: number, lng: number, outOfRange: boolean) {
        const { error } = await supabase
            .from('visits')
            .update({
                checkin_at: new Date().toISOString(),
                status: 'in_progress',
                location_lat: lat,
                location_lng: lng,
                out_of_range: outOfRange
            } as any) // Type casting needed until types are fully regenerated
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
        const { error } = await supabase
            .from('visits')
            .update({
                checkout_at: new Date().toISOString(),
                status: 'completed',
                ...data
            } as any)
            .eq('id', id);

        if (error) throw error;
        return true;
    }
};
