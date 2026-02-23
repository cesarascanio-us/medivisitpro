/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import { supabase } from "@/integrations/supabase/client";
import { getRegion, getStatesInRegion } from "@/utils/regions";

export interface DashboardFilters {
    region?: string;
    state?: string;
    zoneId?: string;
    repId?: string;
}

export const dashboardService = {
    async getVisits(startDate: string, filters: DashboardFilters) {
        let query = supabase.from('visits').select('*, contacts(state)');

        // Aplicamos filtros en cascada
        if (filters.repId && filters.repId !== 'all') {
            query = query.eq('user_id', filters.repId);
        } else if (filters.zoneId && filters.zoneId !== 'all') {
            query = query.eq('zone_id', filters.zoneId);
        } else if (filters.state && filters.state !== 'all') {
            // Unfortunatelly joining for filtering needs !inner, but we want all visits 
            // if no contact is linked? Actually visits usually have contacts.
            query = supabase.from('visits').select('*, contacts!inner(state)').eq('contacts.state', filters.state);
        } else if (filters.region && filters.region !== 'all') {
            const statesInRegion = getStatesInRegion(filters.region);
            if (statesInRegion.length > 0) {
                query = supabase.from('visits').select('*, contacts!inner(state)').in('contacts.state', statesInRegion);
            }
        }

        const { data, error, count } = await query.gte('scheduled_date', startDate);
        if (error) throw error;
        return { data: data || [], count };
    },

    async getOrders(startDate: string, filters: DashboardFilters) {
        let query = supabase.from('transfer_orders').select('*, contacts(state)');

        if (filters.repId && filters.repId !== 'all') {
            query = query.eq('user_id', filters.repId);
        } else if (filters.zoneId && filters.zoneId !== 'all') {
            query = query.eq('zone_id', filters.zoneId);
        } else if (filters.state && filters.state !== 'all') {
            query = supabase.from('transfer_orders').select('*, contacts!inner(state)').eq('contacts.state', filters.state);
        } else if (filters.region && filters.region !== 'all') {
            const statesInRegion = getStatesInRegion(filters.region);
            if (statesInRegion.length > 0) {
                query = supabase.from('transfer_orders').select('*, contacts!inner(state)').in('contacts.state', statesInRegion);
            }
        }

        const { data, error } = await query.gte('created_at', startDate);
        if (error) throw error;
        return data || [];
    },

    async getProfilesAndRoles() {
        const [profilesRes, rolesRes] = await Promise.all([
            supabase.from('profiles').select('*'),
            supabase.from('user_roles').select('*')
        ]);


        if (profilesRes.error) throw profilesRes.error;
        if (rolesRes.error) throw rolesRes.error;

        return {
            profiles: profilesRes.data || [],
            roles: rolesRes.data || []
        };
    },

    async getZones() {
        const { data, error } = await (supabase as any).from('zones').select('id, name');
        if (error) throw error;
        return data || [];
    },

    async getKpiData() {
        // Safe casting as view might not be typed yet
        const { data, error } = await supabase.from('view_kpi_zonas' as any).select('*');
        if (error) throw error;
        return data || [];
    },

    async getPendingOrders(filters?: DashboardFilters) {
        // Fetch all pending orders first
        const { data: orders, error } = await supabase.from('transfer_orders')
            .select('*, contacts(name)')
            .eq('status', 'pending')
            .order('created_at', { ascending: false });

        if (error) throw error;

        if (!orders || orders.length === 0) return [];

        // Enrich with user profiles and roles
        const userIds = [...new Set(orders.map(o => o.user_id))];
        const [{ data: profiles }, { data: roles }, { data: userZones }] = await Promise.all([
            supabase.from('profiles')
                .select('user_id, first_name, last_name, email')
                .in('user_id', userIds),
            supabase.from('user_roles')
                .select('user_id, state, zone_id')
                .in('user_id', userIds),
            supabase.from('user_zones')
                .select('user_id, zone_id')
                .in('user_id', userIds)
        ]);

        // Create a map of user -> zone_ids[]
        const userZonesMap: Record<string, string[]> = {};
        if (userZones) {
            userZones.forEach((uz: any) => {
                if (!userZonesMap[uz.user_id]) userZonesMap[uz.user_id] = [];
                userZonesMap[uz.user_id].push(uz.zone_id);
            });
        }

        const profileMap = (profiles || []).reduce((acc: any, curr: any) => {
            const roleInfo = (roles || []).find(r => r.user_id === curr.user_id);
            acc[curr.user_id] = {
                ...curr,
                state: roleInfo?.state,
                zone_id: roleInfo?.zone_id, // Legacy single zone
                zone_ids: userZonesMap[curr.user_id] || (roleInfo?.zone_id ? [roleInfo.zone_id] : []) // Supported multi-zones
            };
            return acc;
        }, {});

        // Enrich orders with user data
        let enrichedOrders = orders.map(order => ({
            ...order,
            users: profileMap[order.user_id] || {
                first_name: 'Unknown',
                last_name: '',
                email: '',
                state: null,
                zone_id: null,
                zone_ids: []
            }
        }));

        // Apply filters client-side based on user's assignment
        if (filters) {
            if (filters.repId && filters.repId !== 'all') {
                enrichedOrders = enrichedOrders.filter(order => order.user_id === filters.repId);
            } else if (filters.zoneId && filters.zoneId !== 'all') {
                // Check if the USER associated with the order is assigned to the filtered zone
                // OR if the order itself has the zone_id (if available)
                enrichedOrders = enrichedOrders.filter(order => {
                    const orderZoneId = (order as any).zone_id;
                    const userZoneIds = order.users.zone_ids || [];

                    return orderZoneId === filters.zoneId || userZoneIds.includes(filters.zoneId);
                });
            } else if (filters.state && filters.state !== 'all') {
                enrichedOrders = enrichedOrders.filter(order =>
                    order.users?.state?.toLowerCase() === filters.state.toLowerCase()
                );
            } else if (filters.region && filters.region !== 'all') {
                const statesInRegion = getStatesInRegion(filters.region).map(s => s.toLowerCase());
                enrichedOrders = enrichedOrders.filter(order =>
                    statesInRegion.includes(order.users?.state?.toLowerCase() || '')
                );
            }
        }

        return enrichedOrders;
    },

    async getUserProfile(userId: string) {
        const { data, error } = await supabase.from('profiles')
            .select('first_name, last_name, email')
            .eq('user_id', userId)
            .single();

        // Don't throw if not found, just return null
        if (error && error.code !== 'PGRST116') throw error;
        return data;
    },

    async getDroguerias() {
        const { data, error } = await supabase
            .from('drugstores')
            .select('id, name')
            .eq('is_active', true)
            .order('name');

        if (error) throw error;
        return data || [];
    },

    async confirmOrderWithDistributor(orderId: string, drogueriaId: string, externalCode: string, notes?: string) {
        const { error } = await supabase
            .from('transfer_orders')
            .update({
                status: 'confirmed_by_distributor',
                drogueria_final_id: drogueriaId,
                codigo_pedido_externo: externalCode,
                notas_telemarketing: notes || null,
                confirmed_at: new Date().toISOString()
            })
            .eq('id', orderId);

        if (error) throw error;
        return true;
    }
};
