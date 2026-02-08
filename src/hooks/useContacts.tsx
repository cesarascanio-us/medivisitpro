import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export interface Contact {
    id: string;
    name: string;
    source: 'contacts' | 'doctors' | 'pharmacies';
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
    [key: string]: any;
}

interface UseContactsOptions {
    searchTerm?: string;
    typeFilter?: string;
    adminFilters?: {
        region?: string;
        state?: string;
        zoneId?: string;
        repId?: string;
    };
}

export function useContacts(options: UseContactsOptions = {}) {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(true);
    const { user, organizationId, canViewAllData, isSupervisor, zoneId } = useAuth();
    const { toast } = useToast();
    const { searchTerm = "", typeFilter = "all", adminFilters = {} } = options;

    const loadContacts = useCallback(async () => {
        if (!user || !organizationId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);

            const baseFilter = (query: any, tableName: string) => {
                // [STRICT] Always filter by organization
                query = query.eq('organization_id', organizationId);

                // Apply role-based filtering
                if (isSupervisor && zoneId) {
                    if (adminFilters.repId && adminFilters.repId !== 'all') {
                        query = query.eq(tableName === 'contacts' ? 'user_id' : 'representative_id', adminFilters.repId);
                    } else {
                        query = query.eq('zone_id', zoneId);
                    }
                } else if (!canViewAllData) {
                    // Regular representative: strictly their own data
                    // For doctors/pharmacies we use representative_id as it's the definitive assignment
                    const repColumn = tableName === 'contacts' ? 'user_id' : 'representative_id';
                    query = query.eq(repColumn, user.id);
                    // console.warn("DEBUG: User filter disabled to check data existence");
                } else {
                    // Master/Admin with optional filters
                    if (adminFilters.repId && adminFilters.repId !== 'all') {
                        const repColumn = tableName === 'contacts' ? 'user_id' : 'representative_id';
                        query = query.eq(repColumn, adminFilters.repId);
                    }
                    if (adminFilters.zoneId && adminFilters.zoneId !== 'all') {
                        query = query.eq('zone_id', adminFilters.zoneId);
                    }
                }

                // State filter (consistent with Contacts.tsx)
                if (adminFilters.state && adminFilters.state !== 'all') {
                    if (tableName === 'pharmacies' || tableName === 'doctors') {
                        query = query.ilike('state', `%${adminFilters.state}%`);
                    } else {
                        query = query.ilike('city', `%${adminFilters.state}%`);
                    }
                }

                return query;
            };

            console.log("DEBUG: loadContacts params:", {
                userId: user?.id,
                orgId: organizationId,
                isSupervisor,
                zoneId,
                canViewAll: canViewAllData,
                filters: adminFilters
            });

            // 1. Fetch Generic Contacts
            let contactsQuery = supabase.from('contacts').select(`*, contact_health_centers(health_center_id, health_centers(id, name))`);
            contactsQuery = baseFilter(contactsQuery, 'contacts');

            // 2. Fetch Doctors
            let doctorsQuery = supabase.from('doctors').select('*');
            doctorsQuery = baseFilter(doctorsQuery, 'doctors');

            // 3. Fetch Pharmacies
            let pharmaciesQuery = supabase.from('pharmacies').select('*');
            pharmaciesQuery = baseFilter(pharmaciesQuery, 'pharmacies');

            const [contactsRes, doctorsRes, pharmaciesRes] = await Promise.all([
                contactsQuery,
                doctorsQuery,
                pharmaciesQuery
            ]);

            if (contactsRes.error) throw contactsRes.error;
            if (doctorsRes.error) throw doctorsRes.error;
            if (pharmaciesRes.error) throw pharmaciesRes.error;

            console.log("DEBUG: loadContacts RESULTS:", {
                contacts: contactsRes.data?.length,
                doctors: doctorsRes.data?.length,
                pharmacies: pharmaciesRes.data?.length,
                contactsError: contactsRes.error,
                doctorsError: doctorsRes.error
            });

            const unified: Contact[] = [];

            // Process and Normalize (Safety First)
            if (contactsRes.data) {
                contactsRes.data.forEach((c: any) => {
                    unified.push({
                        ...c,
                        source: 'contacts',
                        displayType: c.contact_type === 'natural_store' ? 'Tienda Naturista' :
                            c.contact_type === 'drugstore' ? 'Droguería' : (c.contact_type || 'Contacto'),
                        priority: c.priority || 'medium',
                        lastVisit: c.created_at,
                        visitCount: 0,
                        rating: 0
                    } as Contact);
                });
            }

            if (doctorsRes.data) {
                doctorsRes.data.forEach((d: any) => {
                    unified.push({
                        id: d.id,
                        name: d.name,
                        specialty: d.specialty,
                        phone: d.phone,
                        email: d.email,
                        address: d.address || d.office_address,
                        city: d.city,
                        source: 'doctors',
                        displayType: 'Médico',
                        contact_type: 'doctor',
                        priority: d.potential || d.priority || 'medium',
                        lastVisit: d.last_visit || d.created_at,
                        visitCount: d.visit_count || 0,
                        rating: d.rating || 0,
                        hospital: d.work_center || d.health_center,
                        user_id: d.user_id || d.representative_id,
                        organization_id: d.organization_id
                    } as Contact);
                });
            }

            if (pharmaciesRes.data) {
                pharmaciesRes.data.forEach((p: any) => {
                    unified.push({
                        id: p.id,
                        name: p.name,
                        phone: p.phone,
                        email: p.email,
                        address: p.address,
                        city: p.city,
                        source: 'pharmacies',
                        displayType: 'Farmacia',
                        contact_type: 'pharmacy',
                        priority: p.potential || p.priority || 'medium',
                        lastVisit: p.last_visit || p.created_at,
                        visitCount: 0,
                        rating: 0,
                        status: p.status,
                        user_id: p.user_id || p.representative_id,
                        organization_id: p.organization_id
                    } as Contact);
                });
            }

            unified.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
            setContacts(unified);
        } catch (error: any) {
            console.error("useContacts Error Detail:", {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
            });
            toast({
                title: "Error de Datos",
                description: "No se pudieron cargar los contactos aislados correspondientes.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    }, [user, organizationId, canViewAllData, isSupervisor, zoneId, adminFilters, toast]);

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
