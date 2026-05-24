/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
 ======================================================================== */

import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useDemoData } from "@/contexts/MockDataProvider";

export interface Contact {
    id: string;
    name: string;
    source: 'contacts' | 'doctors' | 'pharmacies' | 'health_centers';
    displayType: string;
    contact_type: string;
    specialty?: string;
    phone?: string;
    email?: string;
    address?: string;
    city?: string;
    priority: string;
    lastVisit: string;
    visitCount: number;
    rating: number;
    hospital?: string;
    user_id: string;
    organization_id: string | null;
    status?: string;
    facility_type?: string;
    [key: string]: any;
}

interface UseContactsOptions {
    searchTerm?: string;
    typeFilter?: string;
    adminFilters?: {
        region?: string;
        state?: string;
        zoneId?: string;
        userId?: string;
    };
}

export function useContacts(options: UseContactsOptions = {}) {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(true);
    const { user, organizationId, canViewAllData, isSupervisor, zoneId } = useAuth();
    const { toast } = useToast();
    const { searchTerm = "", typeFilter = "all", adminFilters = {} } = options;

    // Stabilization of filters to prevent infinite loops from object literals
    const demoData = useDemoData();
    const adminFiltersString = JSON.stringify(adminFilters);

    const loadContacts = useCallback(async () => {
        if (!user || (!organizationId && !demoData)) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);

            const unified: Contact[] = [];

            if (demoData) {
                console.log("[useContacts] Using mock demo data");
                const processedDemo = [
                    ...(demoData.contacts || []),
                    ...(demoData.doctors || []),
                    ...(demoData.pharmacies || []),
                    ...(demoData.healthCenters || [])
                ].map((d: any) => ({
                    ...d,
                    source: d.contact_type ? (d.contact_type + 's') : 'contacts',
                    displayType: d.contact_type === 'doctor' ? 'Médico' : 
                                 d.contact_type === 'pharmacy' ? 'Farmacia' : 
                                 d.contact_type === 'health_center' ? 'Centro de Salud' : 
                                 d.contact_type === 'drugstore' ? 'Droguería' :
                                 d.contact_type === 'natural_store' ? 'Tienda Naturista' : 'Comercio/Retail',
                    lastVisit: d.last_visit || d.created_at,
                    visitCount: d.visit_count || 0,
                    rating: d.rating || 0
                } as Contact));
                unified.push(...processedDemo);
            } else {
                // 1. Single Sovereign Query to Unified View
                let query = supabase.from('unified_contacts').select('*');

                // [STRICT] Always filter by organization
                query = query.eq('organization_id', organizationId);

                // Apply role-based filtering
                if (isSupervisor && zoneId) {
                    if (adminFilters.userId && adminFilters.userId !== 'all') {
                        query = query.eq('user_id', adminFilters.userId);
                    }
                    // Removed zone_id, state and region filters because unified_contacts view 
                    // doesn't have these columns. Security is handled by RLS.
                } else if (!canViewAllData) {
                    query = query.eq('user_id', user.id);
                } else {
                    if (adminFilters.userId && adminFilters.userId !== 'all') {
                        query = query.eq('user_id', adminFilters.userId);
                    }
                }

                const { data, error } = await query;
                if (error) throw error;
                
                // Map the unified data to the Contact interface
                (data || []).forEach((d: any) => {
                    unified.push({
                        ...d,
                        source: (d.source || d.contact_type + 's'), // e.g. doctors
                        displayType: d.contact_type === 'doctor' ? 'Médico' : 
                                     d.contact_type === 'pharmacy' ? 'Farmacia' : 
                                     d.contact_type === 'health_center' ? 'Centro de Salud' : 
                                     d.contact_type === 'drugstore' ? 'Droguería' :
                                     d.contact_type === 'natural_store' ? 'Tienda Naturista' : 'Comercio/Retail',
                        lastVisit: d.last_visit || d.created_at,
                        visitCount: d.visit_count || 0,
                        rating: d.rating || 0
                    } as Contact);
                });
            }


            unified.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
            setContacts(unified);
        } catch (error: any) {
            console.error("useContacts Critical Error:", error);
            // We only show toast if the entire process failed unexpectedly
            toast({
                title: "Error de Sincronización",
                description: "Se detectó una falla en la carga total de contactos comerciales.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    }, [user, organizationId, canViewAllData, isSupervisor, zoneId, adminFiltersString, toast, demoData]);

    useEffect(() => {
        loadContacts();
    }, [loadContacts]);

    const filteredContacts = contacts.filter(contact => {
        const matchesSearch = (contact.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (contact.specialty || "").toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = typeFilter === 'all' || contact.contact_type === typeFilter;
        return matchesSearch && matchesType;
    });

    return {
        contacts: filteredContacts,
        allContacts: contacts,
        loading,
        refresh: loadContacts
    };
}
