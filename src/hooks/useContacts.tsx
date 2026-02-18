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
        repId?: string;
    };
}

export function useContacts(options: UseContactsOptions = {}) {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(true);
    const { user, organizationId, canViewAllData, isSupervisor, zoneId } = useAuth();
    const { toast } = useToast();
    const { searchTerm = "", typeFilter = "all", adminFilters = {} } = options;

    // Demo mode hook
    const demoData = useDemoData();

    const loadContacts = useCallback(async () => {
        if (!user || (!organizationId && !demoData)) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);

            let contactsData, doctorsData, pharmaciesData, hcData;

            if (demoData) {
                console.log("[useContacts] Using mock demo data");
                contactsData = demoData.contacts;
                doctorsData = demoData.doctors;
                pharmaciesData = demoData.pharmacies;
                hcData = demoData.healthCenters;
            } else {
                const baseFilter = (query: any, tableName: string) => {
                    // [STRICT] Always filter by organization
                    query = query.eq('organization_id', organizationId);

                    // Apply role-based filtering
                    if (isSupervisor && zoneId) {
                        if (adminFilters.repId && adminFilters.repId !== 'all') {
                            const repColumn = tableName === 'contacts' ? 'user_id' : 'representative_id';
                            if (tableName === 'contacts') {
                                query = query.eq('user_id', adminFilters.repId);
                            } else {
                                query = query.or(`representative_id.eq.${adminFilters.repId},user_id.eq.${adminFilters.repId}`);
                            }
                        } else {
                            query = query.eq('zone_id', zoneId);
                        }
                    } else if (!canViewAllData) {
                        // Regular representative: strictly their own data
                        if (tableName === 'contacts') {
                            query = query.eq('user_id', user.id);
                        } else {
                            // For doctors/pharmacies, can see both assigned and created
                            query = query.or(`representative_id.eq.${user.id},user_id.eq.${user.id}`);
                        }
                    } else {
                        // Master/Admin with optional filters
                        if (adminFilters.repId && adminFilters.repId !== 'all') {
                            if (tableName === 'contacts') {
                                query = query.eq('user_id', adminFilters.repId);
                            } else {
                                query = query.or(`representative_id.eq.${adminFilters.repId},user_id.eq.${adminFilters.repId}`);
                            }
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

                // 4. Fetch Health Centers
                let hcQuery = supabase.from('health_centers').select('*');
                hcQuery = baseFilter(hcQuery, 'health_centers');

                const [contactsRes, doctorsRes, pharmaciesRes, hcRes] = await Promise.all([
                    contactsQuery,
                    doctorsQuery,
                    pharmaciesQuery,
                    hcQuery
                ]);

                if (contactsRes.error) throw contactsRes.error;
                if (doctorsRes.error) throw doctorsRes.error;
                if (pharmaciesRes.error) throw pharmaciesRes.error;

                contactsData = contactsRes.data;
                doctorsData = doctorsRes.data;
                pharmaciesData = pharmaciesRes.data;
                hcData = hcRes.data;
            }

            console.log("DEBUG: loadContacts RESULTS:", {
                contacts: contactsData?.length,
                doctors: doctorsData?.length,
                pharmacies: pharmaciesData?.length,
                healthCenters: hcData?.length
            });

            const unified: Contact[] = [];
            const seenKeys = new Set<string>();

            const getDedupeKey = (name: string, type: string) =>
                `${(name || '').toLowerCase().trim()}_${(type || '').toLowerCase().trim()}`;

            // 1. Process Specific Entities FIRST (Doctors, Pharmacies, Health Centers)
            if (doctorsData) {
                doctorsData.forEach((d: any) => {
                    const contact = {
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
                    } as Contact;

                    unified.push(contact);
                    seenKeys.add(getDedupeKey(contact.name, contact.contact_type));
                });
            }

            if (pharmaciesData) {
                pharmaciesData.forEach((p: any) => {
                    const contact = {
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
                        visitCount: p.visit_count || 0,
                        rating: 0,
                        status: p.status,
                        user_id: p.user_id || p.representative_id,
                        organization_id: p.organization_id
                    } as Contact;

                    unified.push(contact);
                    seenKeys.add(getDedupeKey(contact.name, contact.contact_type));
                });
            }

            if (hcData) {
                hcData.forEach((h: any) => {
                    const contact = {
                        id: h.id,
                        name: h.name,
                        phone: h.phone,
                        email: h.email,
                        address: h.address,
                        city: h.city,
                        source: 'health_centers',
                        displayType: 'Centro de Salud',
                        contact_type: 'health_center',
                        facility_type: h.facility_type,
                        priority: h.potential || h.priority || 'medium',
                        lastVisit: h.last_visit || h.created_at,
                        visitCount: h.visit_count || 0,
                        rating: 0,
                        user_id: h.user_id,
                        organization_id: h.organization_id
                    } as Contact;

                    unified.push(contact);
                    seenKeys.add(getDedupeKey(contact.name, contact.contact_type));
                });
            }

            // 2. Process Generic Contacts LAST and filter out duplicates
            if (contactsData) {
                contactsData.forEach((c: any) => {
                    const cType = c.contact_type || 'Contacto';
                    const key = getDedupeKey(c.name, cType);

                    // Skip if we already have a specific entity for this contact
                    if (seenKeys.has(key)) {
                        console.log(`[useContacts] Skipping duplicate generic contact: ${c.name} (${cType})`);
                        return;
                    }

                    unified.push({
                        ...c,
                        source: 'contacts',
                        displayType: c.contact_type === 'natural_store' ? 'Tienda Naturista' :
                            c.contact_type === 'drugstore' ? 'Droguería' : (c.contact_type || 'Contacto'),
                        priority: c.priority || 'medium',
                        lastVisit: c.last_visit || c.created_at,
                        visitCount: c.visit_count || 0,
                        rating: 0
                    } as Contact);

                    seenKeys.add(key);
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
    }, [user, organizationId, canViewAllData, isSupervisor, zoneId, adminFilters, toast, demoData]);

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
