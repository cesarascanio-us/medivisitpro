/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
 ======================================================================== */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { visitService } from "@/services/visitService";
import { MOCK_PLAN_DETAILS, MOCK_VISITS } from "@/data/mockDemoData";

// Helper to manage demo visit status persistence during session
const getDemoStatus = (visitId: string) => {
    const saved = sessionStorage.getItem(`demo_visit_${visitId}`);
    return saved ? JSON.parse(saved) : null;
};

const setDemoStatus = (visitId: string, status: string, checkinAt?: string, checkoutAt?: string) => {
    sessionStorage.setItem(`demo_visit_${visitId}`, JSON.stringify({
        status,
        checkin_at: checkinAt || null,
        checkout_at: checkoutAt || null
    }));
};

// Consolidated helper to retrieve mock visit data by ID
const getMockVisitData = (id: string) => {
    // 1. Check if it's a standard visit ID (used in Visits page)
    const visitObj = MOCK_VISITS.find(v => v.id === id);
    if (visitObj) {
        const persistence = getDemoStatus(id);
        const status = persistence?.status || (visitObj as any).status;
        const checkinAt = persistence?.checkin_at || (status === 'completed' ? (visitObj as any).actual_start_time || new Date().toISOString() : null);
        const checkoutAt = persistence?.checkout_at || (status === 'completed' ? (visitObj as any).actual_end_time || new Date().toISOString() : null);

        return {
            ...visitObj,
            status,
            checkin_at: checkinAt,
            checkout_at: checkoutAt,
            out_of_range: false,
        };
    }

    // 2. Check if it's a plan detail ID (used in Weekly Scheduler)
    const detail = (MOCK_PLAN_DETAILS as any[]).find(d => d.id === id);
    if (detail) {
        const persistence = getDemoStatus(id);
        const detailStatus = detail.status;
        const status = persistence?.status || (detailStatus === 'completed' ? 'completed' : 'scheduled');
        const checkinAt = persistence?.checkin_at || (detailStatus === 'completed' ? new Date().toISOString() : null);
        const checkoutAt = persistence?.checkout_at || (detailStatus === 'completed' ? new Date().toISOString() : null);

        return {
            id: detail.id,
            user_id: 'demo-user-id',
            status: status,
            scheduled_date: detail.date || detail.scheduled_date,
            visit_type: detail.directory_item?.entity_type || 'doctor',
            objective: 'Visita Demo - Presentación de productos',
            notes: 'Esta es una visita de demostración de flujo completo',
            checkin_at: checkinAt,
            checkout_at: checkoutAt,
            out_of_range: false,
            contacts: {
                name: detail.directory_item?.name || 'Contacto Demo',
                address: detail.directory_item?.address || 'Dirección Demo',
                specialty: 'Especialista Industrial',
                email: 'demo@medivisitpro.com',
                phone: '+58 412 123 4567'
            },
            directory_items: {
                name: detail.directory_item?.name,
                address: detail.directory_item?.address,
                city: detail.directory_item?.city,
                entity_type: detail.directory_item?.entity_type,
                latitude: 10.4806,
                longitude: -66.8983
            }
        } as any;
    }

    return null;
};

export function useVisit(id: string) {
    // Recognize both ID patterns as demo
    const isDemo = id?.startsWith('detail-') || id?.startsWith('visit-') || id?.startsWith('pd-') || id?.startsWith('vis-');

    return useQuery({
        queryKey: ['visit', id],
        queryFn: async () => {
            if (isDemo) {
                console.log("useVisit: Loading demo visit data for", id);
                const mockVisit = getMockVisitData(id);
                if (!mockVisit) throw new Error('Demo visit not found');
                return mockVisit as any;
            }
            return visitService.getVisitById(id);
        },
        enabled: !!id,
    });
}

export function useStartVisit() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ visitId, location }: { visitId: string, location: { lat: number, lng: number, outOfRange: boolean } }) => {
            if (visitId?.startsWith('detail-') || visitId?.startsWith('visit-') || visitId?.startsWith('pd-') || visitId?.startsWith('vis-')) {
                console.log("Demo Mode: Persisting Check-in for", visitId);
                setDemoStatus(visitId, 'in_progress', new Date().toISOString());
                return Promise.resolve(true);
            }
            return visitService.checkIn(visitId, location.lat, location.lng, location.outOfRange);
        },
        onSuccess: (_, { visitId }) => {
            queryClient.invalidateQueries({ queryKey: ['visit', visitId] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        }
    });
}

export function useCompleteVisit() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ visitId, data }: { visitId: string, data: any }) => {
            if (visitId?.startsWith('detail-') || visitId?.startsWith('visit-') || visitId?.startsWith('pd-') || visitId?.startsWith('vis-')) {
                console.log("Demo Mode: Persisting Check-out for", visitId);
                const current = getDemoStatus(visitId);
                setDemoStatus(visitId, 'completed', current?.checkin_at, new Date().toISOString());
                return Promise.resolve(true);
            }
            return visitService.checkOut(visitId, data);
        },
        onSuccess: (_, { visitId }) => {
            queryClient.invalidateQueries({ queryKey: ['visit', visitId] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        }
    });
}
