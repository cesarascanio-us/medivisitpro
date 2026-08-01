/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */


import { supabase } from "@/integrations/supabase/client";
import { Cycle, WeeklyPlan, DailyPlanDetail, DirectoryItem } from "@/types/planning";

export const planningService = {
    // --- CYCLES ---
    async getActiveCycles() {
        const { data, error } = await supabase
            .from('cycles' as any) // Type casting until schema is updated in types.ts
            .select('*')
            .eq('status', 'open')
            .order('start_date', { ascending: false });

        if (error) throw error;
        return data as unknown as Cycle[];
    },

    // --- DIRECTORY ---
    async searchDirectory(query: string) {
        if (!query) return [];
        const { data, error } = await supabase
            .from('directory_items' as any)
            .select('*')
            .ilike('name', `%${query}%`)
            .limit(20);

        if (error) throw error;
        return data as unknown as DirectoryItem[];
    },

    // --- WEEKLY PLANS ---
    async getWeeklyPlans(userId: string, cycleId?: string) {
        let query = supabase
            .from('weekly_plans' as any)
            .select('*')
            .eq('user_id', userId);

        if (cycleId) {
            query = query.eq('cycle_id', cycleId);
        }

        const { data, error } = await query.order('week_number');
        if (error) throw error;
        return data as unknown as WeeklyPlan[];
    },

    async createWeeklyPlan(plan: Omit<WeeklyPlan, 'id' | 'created_at' | 'updated_at'>) {
        const { data, error } = await supabase
            .from('weekly_plans' as any)
            .insert(plan)
            .select()
            .single();

        if (error) throw error;
        return data as unknown as WeeklyPlan;
    },

    // --- DAILY DETAILS ---
    async getPlanDetails(weeklyPlanId: string) {
        const { data, error } = await supabase
            .from('daily_plan_details' as any)
            .select(`
                *,
                directory_item:directory_items(*)
            `)
            .eq('weekly_plan_id', weeklyPlanId)
            .order('date')
            .order('visit_order');

        if (error) throw error;
        return data as unknown as DailyPlanDetail[];
    },

    async savePlanDetails(details: Partial<DailyPlanDetail>[]) {
        const { data, error } = await supabase
            .from('daily_plan_details' as any)
            .upsert(details)
            .select();

        if (error) throw error;
        return data;
    },

    async deletePlanDetail(id: string) {
        const { error } = await supabase
            .from('daily_plan_details' as any)
            .delete()
            .eq('id', id);
        if (error) throw error;
    },

    // --- SYNC WITH SCHEDULE ---
    async getScheduledVisits(userId: string, startDate: string, endDate: string) {
        const { data, error } = await supabase
            .from('visits')
            .select(`
                *,
                contacts(*)
            `)
            .eq('user_id', userId)
            .gte('scheduled_date', startDate)
            .lte('scheduled_date', endDate)
            .order('scheduled_date');

        if (error) throw error;
        return data;
    },

    async syncPlanWithScheduledVisits(weeklyPlanId: string, visits: any[]) {
        if (visits.length === 0) return;

        // 1. Get all directory items to map contacts to directory_item_id
        const { data: directoryItems } = await supabase
            .from('directory_items' as any)
            .select('id, entity_id, entity_type') as { data: any[] | null, error: any };

        if (!directoryItems) return;

        const details = visits.map((visit, index) => {
            const directoryItem = directoryItems.find(
                item => item.entity_id === visit.contact_id
            );

            if (!directoryItem) return null;

            // Determine turn based on hour (very rough logic: before 13:00 is AM)
            const hour = new Date(visit.scheduled_date).getHours();
            const turn = hour < 14 ? 'AM' : 'PM';

            // Extract day name in english lowercase to match DAYS key
            const dayName = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date(visit.scheduled_date)).toLowerCase();

            return {
                weekly_plan_id: weeklyPlanId,
                day_of_week: dayName,
                date: visit.scheduled_date.split('T')[0],
                directory_item_id: directoryItem.id,
                turn: turn,
                visit_order: index + 1,
                status: 'planned'
            };
        }).filter(Boolean);

        if (details.length > 0) {
            const { error } = await supabase
                .from('daily_plan_details' as any)
                .upsert(details);
            if (error) throw error;
        }
    }
};
