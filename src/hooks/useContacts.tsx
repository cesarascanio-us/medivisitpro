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
import { useOrganization } from "./useOrganization";
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
    const { user, canViewAllData, isSupervisor, isCoordinator, zoneId, userRegion } = useAuth();
    const { organization } = useOrganization();
    const organizationId = organization?.id;
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

                let triangulatedUserIds: string[] | null = null;
                const hasRegionalFilter = (adminFilters.region && adminFilters.region !== 'all') || 
                                          (adminFilters.state && adminFilters.state !== 'all') || 
                                          (adminFilters.zoneId && adminFilters.zoneId !== 'all');

                if (canViewAllData && hasRegionalFilter) {
                    let userQuery = supabase.from('user_roles').select('user_id');
                    if (adminFilters.region && adminFilters.region !== 'all') userQuery = userQuery.eq('region', adminFilters.region);
                    if (adminFilters.state && adminFilters.state !== 'all') userQuery = userQuery.eq('state', adminFilters.state);
                    if (adminFilters.zoneId && adminFilters.zoneId !== 'all') userQuery = userQuery.eq('zone_id', adminFilters.zoneId);
                    if (organizationId) userQuery = userQuery.eq('organization_id', organizationId);
                    
                    const { data: usersData } = await userQuery;
                    triangulatedUserIds = usersData?.map((u: any) => u.user_id) || [];
                }

                // Apply role-based filtering
                if (isCoordinator && !canViewAllData && userRegion) {
                    if (adminFilters.userId && adminFilters.userId !== 'all') {
                        query = query.eq('user_id', adminFilters.userId);
                    } else {
                        const { data: regionUsers } = await supabase.from('user_roles').select('user_id').eq('region', userRegion);
                        const userIds = regionUsers?.map(u => u.user_id) || [];
                        if (userIds.length > 0) {
                            query = query.or(`user_id.in.(${userIds.join(',')}),contact_type.in.(health_center,hospital,clinic)`);
                        } else {
                            query = query.in('contact_type', ['health_center', 'hospital', 'clinic']);
                        }
                    }
                } else if (isSupervisor && !canViewAllData && zoneId) {
                    if (adminFilters.userId && adminFilters.userId !== 'all') {
                        query = query.eq('user_id', adminFilters.userId);
                    } else {
                        const { data: zoneUsers } = await supabase.from('user_roles').select('user_id').eq('zone_id', zoneId);
                        const userIds = zoneUsers?.map(u => u.user_id) || [];
                        if (userIds.length > 0) {
                            query = query.or(`user_id.in.(${userIds.join(',')}),contact_type.in.(health_center,hospital,clinic)`);
                        } else {
                            query = query.in('contact_type', ['health_center', 'hospital', 'clinic']);
                        }
                    }
                } else if (!canViewAllData) {
                    query = query.or(`user_id.eq.${user.id},contact_type.in.(health_center,hospital,clinic)`);
                } else {
                    if (adminFilters.userId && adminFilters.userId !== 'all') {
                        query = query.eq('user_id', adminFilters.userId);
                    } else if (triangulatedUserIds !== null) {
                        if (triangulatedUserIds.length > 0) {
                            query = query.or(`user_id.in.(${triangulatedUserIds.join(',')}),contact_type.in.(health_center,hospital,clinic)`);
                        } else {
                            query = query.in('contact_type', ['health_center', 'hospital', 'clinic']);
                        }
                    }
                }

                // Also fetch health centers directly to ensure they are not missing if the unified_contacts view excludes them
                let hcQuery = supabase.from('health_centers').select('*').eq('organization_id', organizationId);

                const [{ data, error }, { data: hcData, error: hcError }] = await Promise.all([
                    query,
                    hcQuery
                ]);

                if (error) throw error;
                
                const seenIds = new Set<string>();
                const hcMap = new Map();
                (hcData || []).forEach((h: any) => hcMap.set(h.id, h));

                // Map the unified data to the Contact interface
                (data || []).forEach((d: any) => {
                    seenIds.add(d.id);
                    
                    let rawType = (d.contact_type || '').toString().toLowerCase().trim();
                    let cType = d.contact_type;
                    
                    // Normalize known DB variations that might break the frontend
                    if (rawType === 'centro de salud' || rawType === 'centros de salud' || rawType === 'health_centers' || rawType === 'health center') {
                        cType = 'health_center';
                    } else if (rawType === 'clínica' || rawType === 'clinica') {
                        cType = 'clinic';
                    } else if (rawType === 'médico' || rawType === 'medico' || rawType === 'doctors' || rawType === '') {
                        cType = 'doctor';
                    } else if (rawType === 'farmacia' || rawType === 'pharmacies') {
                        cType = 'pharmacy';
                    } else if (rawType === 'droguería' || rawType === 'drogueria') {
                        cType = 'drugstore';
                    } else if (rawType === 'tienda naturista' || rawType === 'naturista') {
                        cType = 'natural_store';
                    } else if (rawType === 'comercio' || rawType === 'retail') {
                        cType = 'commerce';
                    }

                    let isHealthCenter = false;
                    let fType = d.facility_type;

                    if (hcMap.has(d.id)) {
                        isHealthCenter = true;
                        fType = fType || hcMap.get(d.id).facility_type;
                    } else if (d.facility_type || d.source === 'health_centers' || d.source === 'health_center' || d.source === 'Centro de Salud') {
                        isHealthCenter = true;
                    }

                    if (isHealthCenter) {
                        cType = fType === 'Hospital' ? 'hospital' : 
                                fType === 'Clínica' ? 'clinic' : 'health_center';
                    }

                    // Strict enforcement: if the type is still unrecognized, it's highly likely a health center
                    // acting as a ghost marker. We force it to health_center to ensure map filters work.
                    const validTypes = ['doctor', 'pharmacy', 'health_center', 'hospital', 'clinic', 'drugstore', 'natural_store', 'commerce'];
                    if (!validTypes.includes(cType)) {
                        cType = 'health_center';
                    }

                    unified.push({
                        ...d,
                        source: isHealthCenter ? 'health_centers' : (d.source || cType + 's'),
                        displayType: isHealthCenter ? (fType === 'Hospital' ? 'Hospital' : fType === 'Clínica' ? 'Clínica' : 'Centro de Salud') :
                                     cType === 'doctor' ? 'Médico' : 
                                     cType === 'pharmacy' ? 'Farmacia' : 
                                     cType === 'drugstore' ? 'Droguería' :
                                     cType === 'natural_store' ? 'Tienda Naturista' : 'Comercio/Retail',
                        contact_type: cType,
                        lastVisit: d.last_visit || d.created_at,
                        visitCount: d.visit_count || 0,
                        rating: d.rating || 0
                    } as Contact);
                });

                // Merge health centers manually
                (hcData || []).forEach((d: any) => {
                    if (!seenIds.has(d.id)) {
                        const cType = d.facility_type === 'Hospital' ? 'hospital' : 
                                      d.facility_type === 'Clínica' ? 'clinic' : 'health_center';
                        unified.push({
                            ...d,
                            source: 'health_centers',
                            displayType: d.facility_type === 'Hospital' ? 'Hospital' : 
                                         d.facility_type === 'Clínica' ? 'Clínica' : 'Centro de Salud',
                            contact_type: cType,
                            lastVisit: d.last_visit || d.created_at,
                            visitCount: d.visit_count || 0,
                            rating: d.rating || 0
                        } as Contact);
                    }
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
    }, [user, organizationId, canViewAllData, isSupervisor, isCoordinator, zoneId, userRegion, adminFiltersString, toast, demoData]);

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
