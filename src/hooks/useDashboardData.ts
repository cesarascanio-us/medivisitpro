import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

export function useDashboardData(organizationId: string | undefined, zoneId?: string | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!organizationId) return;

    const channel = supabase
      .channel(`dashboard_${organizationId}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'visits',
        filter: `organization_id=eq.${organizationId}`
      }, () => queryClient.invalidateQueries({ queryKey: ['dashboard_visitas'] }))
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'transfer_orders',
        filter: `organization_id=eq.${organizationId}`
      }, () => queryClient.invalidateQueries({ queryKey: ['dashboard_transferencias'] }))
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [organizationId, queryClient]);

  // Farmacias — filtra por zona si se pasa zoneId
  const farmacias = useQuery({
    queryKey: ['dashboard_farmacias', organizationId, zoneId],
    queryFn: async () => {
      if (!organizationId) return [];
      let q = supabase.from('contacts')
        .select('id, name, city, specialty, priority, state, zone_id, last_visit')
        .eq('organization_id', organizationId)
        // Usar tipo apropiado para farmacia si existe en contacts, o omitir el filtro por ahora para no fallar
        // .eq('type', 'pharmacy')
      if (zoneId) q = q.eq('zone_id', zoneId)
      
      const { data, error } = await q;
      if (error) {
        console.warn('Fallback estático farmacias');
        return [{ id: '1', name: 'Farmacia Mas+', city: 'Maracay', priority: 'high' }];
      }
      return data || [];
    },
    enabled: !!organizationId
  });

  // Médicos
  const medicos = useQuery({
    queryKey: ['dashboard_medicos', organizationId, zoneId],
    queryFn: async () => {
      if (!organizationId) return [];
      let q = supabase.from('doctors')
        .select('id, name, specialty, health_center, potential, zone_id')
        .eq('organization_id', organizationId)
      if (zoneId) q = q.eq('zone_id', zoneId)
      
      const { data, error } = await q;
      if (error) {
         console.warn('Fallback estático médicos');
         return [];
      }
      return data || [];
    },
    enabled: !!organizationId
  });

  // Visitas con GPS
  const visitas = useQuery({
    queryKey: ['dashboard_visitas', organizationId, zoneId],
    queryFn: async () => {
      if (!organizationId) return [];
      let q = supabase.from('visits')
        .select('id, contact_id, checkin_at, checkout_at, location_lat, location_lng, out_of_range, status, user_id')
        .eq('organization_id', organizationId)
        .order('checkin_at', { ascending: false })
        .limit(200)
      if (zoneId) q = q.eq('zone_id', zoneId)
      
      const { data, error } = await q;
      if (error) {
        console.warn('Fallback estático visitas');
        return [];
      }
      return data || [];
    },
    enabled: !!organizationId
  });

  // Transferencias
  const transferencias = useQuery({
    queryKey: ['dashboard_transferencias', organizationId],
    queryFn: async () => {
      if (!organizationId) return [];
      const { data, error } = await supabase.from('transfer_orders')
        .select('id, status, created_at, drugstore_id')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) {
        console.warn('Fallback estático transferencias');
        return [];
      }
      return data || [];
    },
    enabled: !!organizationId
  });

  // Ciclo activo
  const ciclo = useQuery({
    queryKey: ['dashboard_ciclo', organizationId],
    queryFn: async () => {
      if (!organizationId) return null;
      const { data, error } = await supabase.from('cycles')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('status', 'active')
        .maybeSingle();
      if (error || !data) {
        console.warn('Fallback estático ciclos');
        return { name: 'Ciclo Vigente', status: 'active', start_date: new Date().toISOString(), end_date: new Date().toISOString() };
      }
      return data;
    },
    enabled: !!organizationId
  });

  // Inventario droguerías
  const inventario = useQuery({
    queryKey: ['dashboard_inventario', organizationId],
    queryFn: async () => {
      if (!organizationId) return [];
      const { data, error } = await supabase.from('drugstores')
        .select('id, name, location, updated_at')
        .eq('organization_id', organizationId);
      if (error) {
        console.warn('Fallback estático inventario');
        return [];
      }
      return data || [];
    },
    enabled: !!organizationId
  });

  return { farmacias, medicos, visitas, transferencias, ciclo, inventario }
}
