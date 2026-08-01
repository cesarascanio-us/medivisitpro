/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import { useState, useEffect } from "react";
import {
    Calendar, CheckCircle2, Clock, MapPin, MoreVertical, Plus, Check,
    AlertCircle, Users, User, Eye, Target, Map, Lock, ChevronLeft, ChevronRight,
    CheckCircle, Trash2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useDemoData } from "@/contexts/MockDataProvider";
import { EliteHeader, EliteButton } from "@/components/layout/DesignSystem";
import { Link } from "react-router-dom";
import { VisitDetailDialog } from "@/components/visits/VisitDetailDialog";

interface PlanItem {
    id: string;
    title: string;
    description: string | null;
    scheduled_time: string | null;
    duration_minutes: number;
    priority: number;
    status: string;
    contact_id: string | null;
    contacts?: { name: string; specialty: string };
}

interface DailyPlan {
    id: string;
    plan_date: string;
    title: string | null;
    notes: string | null;
    status: string;
}

interface RoutedContact {
    id: string;
    name: string;
    address: string | null;
    contact_type: string;
    type_label: string;
    routing_days: string | null;
    source: string;
}

interface TeamMember {
    user_id: string;
    name: string;
    role: string;
    zone_id: string | null;
}

export default function Planner() {
    const { user, organizationId, isRepresentative, isSupervisor, isCoordinator, isManager, isMaster, zoneId, canViewAllData } = useAuth();
    const { toast } = useToast();
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [plan, setPlan] = useState<DailyPlan | null>(null);
    const [items, setItems] = useState<PlanItem[]>([]);
    const [contacts, setContacts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [hasRoutes, setHasRoutes] = useState<boolean | null>(null);
    const [routedContacts, setRoutedContacts] = useState<RoutedContact[]>([]);
    const [addingAll, setAddingAll] = useState(false);
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [selectedRepId, setSelectedRepId] = useState<string>('');
    const [zones, setZones] = useState<{id: string, name: string}[]>([]);
    const [selectedZoneId, setSelectedZoneId] = useState<string>("all");
    const isViewingOtherRep = !isRepresentative || (!!selectedRepId && selectedRepId !== user?.id);

    const demoData = useDemoData();
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        scheduled_time: "09:00",
        duration_minutes: 30,
        contact_id: ""
    });

    // ─── Helpers ────────────────────────────────────────────────────────────────

    const getDayOfWeek = (dateStr: string): string => {
        const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const date = new Date(dateStr + 'T12:00:00');
        return days[date.getDay()];
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr + 'T12:00:00');
        return date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
    };

    const navigateDate = (direction: number) => {
        const date = new Date(selectedDate + 'T12:00:00');
        date.setDate(date.getDate() + direction);
        setSelectedDate(date.toISOString().split('T')[0]);
    };

    // Determines whose plan to load (self or selected rep)
    const getTargetUserId = () => selectedRepId || user?.id;

    // Can supervisor+ see other reps?
    const canViewTeam = isSupervisor || isCoordinator || isManager || isMaster;

    // ─── Effects ────────────────────────────────────────────────────────────────

    useEffect(() => {
        if (user) {
            if (demoData) {
                setHasRoutes(true);
                loadPlan();
                loadContacts();
            } else {
                if (isRepresentative && !isViewingOtherRep) {
                    checkActiveRoutes();
                } else {
                    // For managers/supervisors or when viewing someone else, we bypass the block screen
                    setHasRoutes(true);
                    loadPlan();
                    loadContacts();
                }
            }
            if (organizationId) {
                if (isRepresentative && !isViewingOtherRep) {
                    const day = getDayOfWeek(selectedDate);
                    loadRoutedContactsForDay(day);
                }
            }
            if (canViewTeam && organizationId) {
                loadTeamMembers();
                if (canViewAllData) {
                    loadZones();
                }
            }
        }
    }, [user, selectedDate, organizationId, selectedRepId, selectedZoneId]);

    const loadZones = async () => {
        const { data } = await supabase.from('zones').select('id, name').order('name');
        setZones(data || []);
    };

    // ─── Data Loading ────────────────────────────────────────────────────────────

    const checkActiveRoutes = async () => {
        try {
            setLoading(true);
            const targetId = getTargetUserId();

            const { data: doctorData } = await supabase
                .from("doctors")
                .select("id")
                .eq("organization_id", organizationId)
                .not('days', 'is', null)
                .neq('days', '')
                .limit(1);

            if (doctorData && doctorData.length > 0) {
                setHasRoutes(true);
                loadPlan();
                loadContacts();
                return;
            }

            const { data: pharmData } = await supabase
                .from("pharmacies")
                .select("id")
                .eq("organization_id", organizationId)
                .not('schedule', 'is', null)
                .neq('schedule', '')
                .limit(1);

            if (pharmData && pharmData.length > 0) {
                setHasRoutes(true);
                loadPlan();
                loadContacts();
                return;
            }

            setHasRoutes(false);
            setLoading(false);
        } catch (error) {
            console.error("Error checking routes:", error);
            setHasRoutes(false);
            setLoading(false);
        }
    };

    const loadTeamMembers = async () => {
        if (!organizationId) return;
        try {
            // Load representatives (and supervisors for coordinators+) visible to current user
            // RLS function get_visible_user_ids() handles zone filtering on the server side
            let query = supabase
                .from('user_roles_plain')
                .select('user_id, role, zone_id')
                .eq('organization_id', organizationId)
                .in('role', isSupervisor && !isCoordinator ? 
                    ['representative', 'commercial_rep', 'visitador_medico', 'rep_comercial', 'rep_integral'] : 
                    ['representative', 'commercial_rep', 'visitador_medico', 'rep_comercial', 'rep_integral', 'supervisor', 'chief']);

            if (selectedZoneId !== 'all') {
                query = query.eq('zone_id', selectedZoneId);
            }

            const { data, error } = await query;

            if (error) {
                console.warn('Could not load team members:', error.message);
                return;
            }

            if (!data || data.length === 0) {
                setTeamMembers([]);
                return;
            }

            // Fetch names from profiles
            const userIds = data.map((d: any) => d.user_id);
            const { data: profiles } = await supabase
                .from('profiles')
                .select('id, first_name, last_name')
                .in('id', userIds);

            const members: TeamMember[] = data.map((d: any) => {
                const profile = profiles?.find((p: any) => p.id === d.user_id);
                const name = profile
                    ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
                    : d.user_id.slice(0, 8);
                return { user_id: d.user_id, name: name || 'Usuario', role: d.role, zone_id: d.zone_id };
            });

            // Exclude self
            setTeamMembers(members.filter(m => m.user_id !== user?.id));
        } catch (error) {
            console.error('Error loading team members:', error);
        }
    };

    const loadPlan = async () => {
        try {
            setLoading(true);

            if (demoData) {
                const mockItems: PlanItem[] = demoData.visits
                    .filter((v: any) => v.scheduled_date.startsWith(selectedDate))
                    .map((v: any, idx: number) => ({
                        id: `plan-item-${idx}`,
                        title: `Visita a ${v.contacts?.name || 'Contacto'}`,
                        description: v.objective || v.notes,
                        scheduled_time: new Date(v.scheduled_date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
                        duration_minutes: 30,
                        priority: idx,
                        status: v.status === 'completed' ? 'completed' : 'pending',
                        contact_id: v.contact_id,
                        contacts: { name: v.contacts?.name || '', specialty: v.contacts?.specialty || '' }
                    }));
                setPlan({ id: 'demo-plan', plan_date: selectedDate, title: 'Plan Demo', notes: null, status: 'active' });
                setItems(mockItems);
                setLoading(false);
                return;
            }

            const isAggregateView = !isRepresentative && !selectedRepId;

            if (isAggregateView) {
                let planIds: string[] = [];
                if (selectedZoneId !== 'all') {
                    const repIds = teamMembers.filter(m => m.zone_id === selectedZoneId).map(m => m.user_id);
                    if (repIds.length > 0) {
                        const { data: plans } = await supabase.from('daily_plans').select('id').in('user_id', repIds).eq('plan_date', selectedDate);
                        planIds = plans?.map(p => p.id) || [];
                    }
                } else {
                    const { data: plans } = await supabase.from('daily_plans').select('id').eq('organization_id', organizationId).eq('plan_date', selectedDate);
                    planIds = plans?.map(p => p.id) || [];
                }

                setPlan({ id: 'dashboard', plan_date: selectedDate, title: 'Consolidado del Territorio', notes: null, status: 'active' });

                if (planIds.length > 0) {
                    const { data: itemsData } = await supabase
                        .from('daily_plan_items')
                        .select('*, contacts(name, specialty)')
                        .in('plan_id', planIds)
                        .order('scheduled_time', { ascending: true });
                    setItems(itemsData || []);
                } else {
                    setItems([]);
                }
            } else {
                const targetUserId = getTargetUserId();

            let { data: planData } = await supabase
                .from('daily_plans')
                .select('*')
                .eq('user_id', targetUserId)
                .eq('plan_date', selectedDate)
                .maybeSingle();

            // Only create a new plan if we're viewing our own plan (not another rep's)
            if (!planData && !isViewingOtherRep) {
                let { data: newPlan, error: insertError } = await supabase
                    .from('daily_plans')
                    .insert({ user_id: user?.id, plan_date: selectedDate, organization_id: organizationId })
                    .select()
                    .maybeSingle();

                if (insertError) {
                    console.warn('Plan insert failed:', insertError.message);
                    if (insertError.code === '23503') {
                        const { data: fallback } = await supabase
                            .from('daily_plans')
                            .insert({ user_id: user?.id, plan_date: selectedDate, organization_id: null })
                            .select().maybeSingle();
                        if (fallback) planData = fallback;
                    }
                    if (!planData) {
                        const { data: retry } = await supabase
                            .from('daily_plans')
                            .select('*')
                            .eq('user_id', user?.id)
                            .eq('plan_date', selectedDate)
                            .maybeSingle();
                        planData = retry;
                    }
                } else {
                    planData = newPlan;
                }
            }

            setPlan(planData);

                setPlan(planData);
                if (planData) {
                    const { data: itemsData } = await supabase
                        .from('daily_plan_items')
                        .select('*, contacts(name, specialty)')
                        .eq('plan_id', planData.id)
                        .order('scheduled_time', { ascending: true });
                    setItems(itemsData || []);
                } else {
                    setItems([]);
                }
            }
        } catch (error) {
            console.error('Error loading plan:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadContacts = async () => {
        if (demoData) { setContacts(demoData.contacts as any[]); return; }
        let query = supabase.from('contacts').select('id, name, specialty');
        if (organizationId) query = query.eq('organization_id', organizationId);
        if (isRepresentative && user?.id) query = query.eq('user_id', user.id);
        const { data } = await query;
        setContacts(data || []);
    };

    const loadRoutedContactsForDay = async (day: string) => {
        if (!organizationId || day === 'Domingo' || day === 'Sábado') {
            setRoutedContacts([]);
            return;
        }
        try {
            const isSupervisorPlanningOwnRoute = canViewTeam && !isViewingOtherRep;

            if (isSupervisorPlanningOwnRoute) {
                const { data: routes } = await supabase
                    .from('supervisor_routes')
                    .select('representative_id, routing_days')
                    .eq('organization_id', organizationId)
                    .eq('supervisor_id', user?.id)
                    .ilike('routing_days', `%${day}%`);
                
                if (routes && routes.length > 0) {
                    const repIds = routes.map((r: any) => r.representative_id);
                    const { data: profiles } = await supabase
                        .from('profiles')
                        .select('id, first_name, last_name')
                        .in('id', repIds);
                    
                    const teamContacts: RoutedContact[] = routes.map((route: any) => {
                        const p = profiles?.find((pr: any) => pr.id === route.representative_id);
                        return {
                            id: route.representative_id,
                            name: p ? `${p.first_name || ''} ${p.last_name || ''}`.trim() : 'Representante',
                            address: 'En Campo',
                            contact_type: 'team',
                            type_label: 'Equipo de Trabajo',
                            routing_days: route.routing_days,
                            source: 'supervisor_routes'
                        };
                    });
                    setRoutedContacts(teamContacts);
                } else {
                    setRoutedContacts([]);
                }
                return;
            }

            const sources = [
                { table: 'doctors',        field: 'days',         type: 'doctor',        label: 'Médico' },
                { table: 'pharmacies',     field: 'schedule',     type: 'pharmacy',      label: 'Farmacia' },
                { table: 'health_centers', field: 'routing_days', type: 'hospital',      label: 'Centro de Salud' },
                { table: 'drugstores',     field: 'routing_days', type: 'drugstore',     label: 'Droguería' },
                { table: 'commerces',      field: 'routing_days', type: 'commerce',      label: 'Comercio' },
                { table: 'natural_stores', field: 'routing_days', type: 'natural_store', label: 'Tienda Naturista' },
            ] as const;

            const results = await Promise.all(
                sources.map(async ({ table, field, type, label }) => {
                    const { data } = await supabase
                        .from(table)
                        .select(`id, name, address, ${field}`)
                        .eq('organization_id', organizationId)
                        .ilike(field as string, `%${day}%`);

                    return (data || []).map((c: any): RoutedContact => ({
                        id: c.id, name: c.name, address: c.address || null,
                        contact_type: type, type_label: label,
                        routing_days: c[field] ?? null, source: table,
                    }));
                })
            );
            setRoutedContacts(results.flat());
        } catch (error) {
            console.error('Error loading routed contacts:', error);
        }
    };

    // ─── Actions ────────────────────────────────────────────────────────────────

    /** Auto-registers a visit in the visits table when a plan item is completed */
    const autoCreateVisit = async (item: PlanItem) => {
        if (!user || !plan) return;
        try {
            const typeMap: Record<string, string> = {
                'Médico': 'doctor', 'Farmacia': 'pharmacy', 'Centro de Salud': 'hospital',
                'Droguería': 'drugstore', 'Comercio': 'commerce', 'Tienda Naturista': 'natural_store',
            };
            const visitType = typeMap[item.description || ''] || 'field_visit';

            const { error } = await supabase.from('visits').insert({
                user_id: user.id,
                organization_id: organizationId,
                contact_id: item.contact_id || null,
                scheduled_date: new Date(plan.plan_date + 'T09:00:00').toISOString(),
                status: 'completed',
                visit_type: visitType,
                notes: item.title,
                objective: item.description || null,
            });

            if (!error) {
                toast({
                    title: '✅ Visita registrada en Agenda',
                    description: `"${item.title}" aparecerá en tu Agenda de Visitas.`,
                });
            } else {
                console.warn('Could not auto-create visit:', error.message);
            }
        } catch (err) {
            console.error('Error auto-creating visit:', err);
        }
    };

    const toggleItemStatus = async (item: PlanItem) => {
        if (isViewingOtherRep) return; // read-only for supervisors viewing other reps
        const newStatus = item.status === 'completed' ? 'pending' : 'completed';
        try {
            await supabase.from('daily_plan_items').update({ status: newStatus }).eq('id', item.id);
            // We removed autoCreateVisit(item) here because VisitDetailDialog handles it
            setItems(items.map(i => i.id === item.id ? { ...i, status: newStatus } : i));
        } catch (error) {
            console.error('Error updating item:', error);
        }
    };

    const deleteItem = async (itemId: string) => {
        if (isViewingOtherRep) return;
        try {
            const { error } = await supabase.from('daily_plan_items').delete().eq('id', itemId);
            if (error) throw error;
            setItems(items.filter(i => i.id !== itemId));
            toast({ title: 'Ítem eliminado', description: 'El ítem ha sido removido del plan.' });
        } catch (error) {
            console.error('Error deleting item:', error);
            toast({ title: 'Error', description: 'No se pudo eliminar el ítem.', variant: 'destructive' });
        }
    };

    const addItem = async () => {
        if (!user || !plan || !formData.title) return;
        const baseItem = {
            user_id: user.id, plan_id: plan.id, title: formData.title,
            description: formData.description || null, scheduled_time: formData.scheduled_time,
            duration_minutes: formData.duration_minutes, status: 'pending', priority: items.length
        };
        try {
            let { error } = await supabase.from('daily_plan_items').insert({
                ...baseItem, contact_id: formData.contact_id || null, organization_id: organizationId
            });
            if (error?.code === '23503') {
                const { error: err2 } = await supabase.from('daily_plan_items').insert({
                    ...baseItem, contact_id: null, organization_id: organizationId
                });
                if (err2) throw err2;
            } else if (error) throw error;

            toast({ title: "Tarea agregada", description: "La tarea fue añadida al plan." });
            setDialogOpen(false);
            setFormData({ title: "", description: "", scheduled_time: "09:00", duration_minutes: 30, contact_id: "" });
            loadPlan();
        } catch (error: any) {
            toast({ title: "Error", description: "No se pudo agregar la tarea.", variant: "destructive" });
        }
    };

    const addRoutedContactToPlan = async (contact: RoutedContact) => {
        if (!user || !plan || isViewingOtherRep) return;
        try {
            let { error } = await supabase.from('daily_plan_items').insert({
                user_id: user.id, plan_id: plan.id,
                title: `Visita: ${contact.name}`, description: contact.type_label,
                scheduled_time: null, duration_minutes: 30, status: 'pending',
                priority: items.length, organization_id: organizationId,
                contact_id: contact.id,
            });
            if (error?.code === '23503') {
                const { error: err2 } = await supabase.from('daily_plan_items').insert({
                    user_id: user.id, plan_id: plan.id,
                    title: `Visita: ${contact.name}`, description: contact.type_label,
                    scheduled_time: null, duration_minutes: 30, status: 'pending',
                    priority: items.length, organization_id: organizationId,
                    contact_id: null,
                });
                error = err2;
            }
            if (error) throw error;
            toast({ title: "✅ Visita agregada", description: `${contact.name} añadido al plan.` });
            loadPlan();
        } catch (error) {
            toast({ title: "Error", description: "No se pudo agregar la visita.", variant: "destructive" });
        }
    };

    const addAllRoutedContactsToPlan = async () => {
        if (!user || !plan || routedContacts.length === 0 || isViewingOtherRep) return;
        setAddingAll(true);
        try {
            const uniqueRoutedContactsMap: Record<string, any> = {};
            for (const c of routedContacts) {
                if (!uniqueRoutedContactsMap[c.id]) {
                    uniqueRoutedContactsMap[c.id] = c;
                }
            }
            const uniqueRoutedContacts = Object.values(uniqueRoutedContactsMap);

            const alreadyInPlanTitles = new Set(items.map(i => i.title));
            const alreadyInPlanContactIds = new Set(items.filter(i => i.contact_id).map(i => i.contact_id));

            const toAdd = uniqueRoutedContacts.filter(c => 
                !alreadyInPlanTitles.has(`Visita: ${c.name}`) && 
                !alreadyInPlanContactIds.has(c.id)
            );

            if (toAdd.length === 0) {
                toast({ title: "Sin cambios", description: "Todos los contactos ya están en el plan." });
                return;
            }

            let successCount = 0;
            let errorCount = 0;

            for (const contact of toAdd) {
                const insertItem = {
                    user_id: user!.id, plan_id: plan!.id,
                    title: `Visita: ${contact.name}`, description: contact.type_label,
                    scheduled_time: null, duration_minutes: 30, status: 'pending',
                    priority: items.length + successCount, organization_id: organizationId,
                    contact_id: contact.id,
                };
                let { error } = await supabase.from('daily_plan_items').insert(insertItem);
                if (error?.code === '23503') {
                    const retryItem = { ...insertItem, contact_id: null };
                    const { error: err2 } = await supabase.from('daily_plan_items').insert(retryItem);
                    error = err2;
                }
                if (error) {
                    console.warn("Conflict or error adding item:", contact.name, error);
                    errorCount++;
                } else {
                    successCount++;
                }
            }

            if (successCount > 0) {
                toast({ title: `✅ ${successCount} visitas agregadas`, description: "Ruta del día cargada al plan." });
                loadPlan();
            } else if (errorCount > 0) {
                toast({ title: "Aviso", description: "No se agregaron nuevas visitas (posiblemente ya existían)." });
            }
        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "No se pudo cargar la ruta.", variant: "destructive" });
        } finally {
            setAddingAll(false);
        }
    };

    // ─── Computed ────────────────────────────────────────────────────────────────

    const completedCount = items.filter(i => i.status === 'completed').length;
    const progress = items.length > 0 ? (completedCount / items.length) * 100 : 0;
    const currentDay = getDayOfWeek(selectedDate);
    const viewingMember = teamMembers.find(m => m.user_id === selectedRepId);

    // ─── Render ──────────────────────────────────────────────────────────────────

    return (
        <div className="space-y-10 pb-20 font-display animate-in fade-in duration-700">
            {/* Header */}
            <div className="mb-4">
                <EliteHeader
                    title="Plan Diario de Trabajo"
                    subtitle={isViewingOtherRep
                        ? `Viendo plan de: ${viewingMember?.name || 'Representante'} (solo lectura)`
                        : 'Gestiona tus visitas y tareas para el día seleccionado'}
                    icon={Calendar}
                    badgeText={isViewingOtherRep ? "Modo Supervisor" : "Día Operativo"}
                    statusText={`${items.length} tareas programadas`}
                    statusColor={items.length > 0 ? "bg-primary" : "bg-muted-foreground/30"}
                    rightContent={
                        hasRoutes && !isViewingOtherRep && (
                            <EliteButton onClick={() => setDialogOpen(true)} icon={Plus}>
                                Nuevo Evento
                            </EliteButton>
                        )
                    }
                />
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : hasRoutes === false ? (
                <Card className="border-border shadow-premium-md overflow-hidden animate-in fade-in zoom-in duration-500 max-w-2xl mx-auto mt-12">
                    <CardContent className="p-12 flex flex-col items-center justify-center text-center">
                        <div className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center mb-6">
                            <Lock className="h-10 w-10 text-amber-500" />
                        </div>
                        <h2 className="text-2xl font-black text-foreground mb-3 font-display uppercase tracking-tight">Planificación Bloqueada</h2>
                        <p className="text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">
                            No puedes generar un Plan Diario porque <strong>no tienes rutas semanales configuradas</strong>.
                        </p>
                        <Link to="/route-planner">
                            <Button size="lg" className="h-14 px-8 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 hover:scale-105 transition-all">
                                <MapPin className="mr-2 h-4 w-4" />
                                Ir a Rutas Semanales
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-6">
                    {/* Add Task Dialog */}
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle>Agregar Tarea</DialogTitle>
                                <DialogDescription className="sr-only">Formulario para agregar una nueva tarea al planificador.</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label>Título *</Label>
                                    <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Nombre de la tarea" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Hora</Label>
                                        <Input type="time" value={formData.scheduled_time} onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Duración (min)</Label>
                                        <Select value={formData.duration_minutes.toString()} onValueChange={(v) => setFormData({ ...formData, duration_minutes: parseInt(v) })}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="15">15 min</SelectItem>
                                                <SelectItem value="30">30 min</SelectItem>
                                                <SelectItem value="45">45 min</SelectItem>
                                                <SelectItem value="60">1 hora</SelectItem>
                                                <SelectItem value="90">1.5 horas</SelectItem>
                                                <SelectItem value="120">2 horas</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Contacto (opcional)</Label>
                                    <Select value={formData.contact_id} onValueChange={(v) => setFormData({ ...formData, contact_id: v })}>
                                        <SelectTrigger><SelectValue placeholder="Seleccionar contacto" /></SelectTrigger>
                                        <SelectContent>
                                            {contacts.map(c => (
                                                <SelectItem key={c.id} value={c.id}>{c.name}{c.specialty ? ` - ${c.specialty}` : ''}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Notas</Label>
                                    <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Detalles adicionales..." />
                                </div>
                                <Button onClick={addItem} className="w-full btn-medical">Agregar Tarea</Button>
                            </div>
                        </DialogContent>
                    </Dialog>

                    {/* Team Selector / Dashboard Filter ── */}
                    {canViewTeam && (
                        <Card className="border-border/50 bg-muted/30">
                            <CardContent className="py-4 px-4 flex items-center gap-4 flex-wrap">
                                <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                    <Users className="h-3.5 w-3.5" />
                                    Territorio:
                                </div>
                                <div className="flex gap-4 flex-wrap flex-1">
                                    {canViewAllData && (
                                        <div className="w-64">
                                            <Select value={selectedZoneId} onValueChange={(val) => { setSelectedZoneId(val); setSelectedRepId(''); }}>
                                                <SelectTrigger className="h-10 bg-card border-border/50 text-xs font-semibold">
                                                    <SelectValue placeholder="Todas las Zonas" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">Todas las Zonas</SelectItem>
                                                    {zones.map(z => (
                                                        <SelectItem key={z.id} value={z.id}>{z.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                    <div className="w-64">
                                        <Select value={selectedRepId || "all"} onValueChange={(val) => setSelectedRepId(val === "all" ? '' : val)}>
                                            <SelectTrigger className="h-10 bg-card border-border/50 text-xs font-semibold">
                                                <SelectValue placeholder="Todo el Equipo" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Todo el Equipo (Consolidado)</SelectItem>
                                                {teamMembers.map(member => (
                                                    <SelectItem key={member.user_id} value={member.user_id}>
                                                        {member.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest text-amber-500 border-amber-500/30 ml-auto">
                                    Solo lectura (Dashboard)
                                </Badge>
                            </CardContent>
                        </Card>
                    )}

                    {/* Date Navigation */}
                    <Card className="medical-card">
                        <CardContent className="py-4">
                            <div className="flex items-center justify-between">
                                <Button variant="ghost" onClick={() => navigateDate(-1)}>
                                    <ChevronLeft className="h-5 w-5" />
                                </Button>
                                <div className="text-center">
                                    <h2 className="text-xl font-semibold capitalize">{formatDate(selectedDate)}</h2>
                                    <div className="flex items-center justify-center gap-4 mt-2">
                                        <Badge variant="outline">{completedCount} / {items.length} tareas</Badge>
                                        <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                                            <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
                                        </div>
                                        <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
                                    </div>
                                </div>
                                <Button variant="ghost" onClick={() => navigateDate(1)}>
                                    <ChevronRight className="h-5 w-5" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* ── Routed Contacts for the Day — only for self view ── */}
                    {!isViewingOtherRep && currentDay !== 'Domingo' && currentDay !== 'Sábado' && (
                        <Card className="border-primary/20 bg-primary/5 shadow-premium-sm">
                            <CardHeader className="pb-3 border-b border-primary/10">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-primary" />
                                        <span className="font-black uppercase tracking-widest text-xs text-primary">
                                            Ruta del {currentDay}
                                            {routedContacts.length > 0 && (
                                                <span className="ml-2 text-muted-foreground normal-case font-normal">
                                                    — {routedContacts.length} contacto{routedContacts.length !== 1 ? 's' : ''}
                                                </span>
                                            )}
                                        </span>
                                    </CardTitle>
                                    {routedContacts.length > 0 && (
                                        <Button
                                            size="sm"
                                            onClick={addAllRoutedContactsToPlan}
                                            disabled={addingAll || !plan}
                                            className="h-8 px-3 rounded-lg bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest shadow-sm hover:scale-105 transition-transform"
                                        >
                                            {addingAll ? '⏳ Cargando...' : '+ Agregar todos'}
                                        </Button>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="pt-3">
                                {routedContacts.length === 0 ? (
                                    <div className="text-center py-6">
                                        <p className="text-sm text-muted-foreground">No hay contactos asignados a este día.</p>
                                        <Link to="/route-planner">
                                            <Button variant="link" size="sm" className="mt-1 text-primary text-xs font-black uppercase tracking-widest">
                                                Configurar Rutas →
                                            </Button>
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {routedContacts.map((contact) => {
                                            const isInPlan = items.some(i => i.title === `Visita: ${contact.name}`);
                                            return (
                                                <div
                                                    key={`${contact.source}-${contact.id}`}
                                                    className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${isInPlan ? 'border-primary/20 bg-primary/10 opacity-70' : 'border-border/40 bg-card hover:border-primary/30 hover:bg-primary/5'}`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isInPlan ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
                                                        <div>
                                                            <p className="text-sm font-semibold leading-tight">{contact.name}</p>
                                                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-black">{contact.type_label}</p>
                                                        </div>
                                                    </div>
                                                    {isInPlan ? (
                                                        <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest text-primary border-primary/30">
                                                            <CheckCircle className="h-3 w-3 mr-1" /> En el plan
                                                        </Badge>
                                                    ) : (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => addRoutedContactToPlan(contact)}
                                                            disabled={!plan}
                                                            className="h-7 px-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
                                                        >
                                                            + Agregar
                                                        </Button>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* ── Tasks List ── */}
                    {items.length === 0 ? (
                        <Card className="medical-card">
                            <CardContent className="text-center py-12">
                                <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-medium mb-2">
                                    {isViewingOtherRep ? 'Sin tareas registradas' : 'Sin tareas programadas'}
                                </h3>
                                <p className="text-muted-foreground mb-4">
                                    {isViewingOtherRep
                                        ? 'Este representante no tiene tareas para este día.'
                                        : routedContacts.length > 0
                                            ? 'Agrega los contactos de tu ruta o crea tareas adicionales'
                                            : 'Agrega tareas para organizar tu día'}
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-3">
                            {items.map((item) => (
                                <Card
                                    key={item.id}
                                    className={`medical-card transition-all ${item.status === 'completed' ? 'opacity-60' : ''}`}
                                >
                                    <CardContent className="py-4">
                                        <div className="flex items-start gap-4">
                                            {item.status === 'completed' ? (
                                                <Checkbox
                                                    checked={true}
                                                    onCheckedChange={() => toggleItemStatus(item)}
                                                    className="mt-1"
                                                    disabled={isViewingOtherRep}
                                                />
                                            ) : (
                                                <VisitDetailDialog
                                                    visitData={{
                                                        contact_id: item.contact_id,
                                                        scheduled_date: (plan?.plan_date || new Date().toISOString().split('T')[0]) + 'T' + (item.scheduled_time || '09:00'),
                                                        visit_objective: item.title,
                                                        visit_type: (() => {
                                                            const typeMap: Record<string, string> = {
                                                                'Médico': 'doctor', 'Farmacia': 'pharmacy', 'Centro de Salud': 'hospital',
                                                                'Droguería': 'drugstore', 'Comercio': 'commerce', 'Tienda Naturista': 'natural_store',
                                                            };
                                                            return typeMap[item.description || ''] || 'doctor';
                                                        })(),
                                                        status: 'completed'
                                                    }}
                                                    onVisitSaved={async () => {
                                                        try {
                                                            await supabase.from('daily_plan_items').update({ status: 'completed' }).eq('id', item.id);
                                                            setItems(items.map(i => i.id === item.id ? { ...i, status: 'completed' } : i));
                                                        } catch (error) {
                                                            console.error(error);
                                                        }
                                                    }}
                                                    trigger={
                                                        <div className="mt-1 cursor-pointer">
                                                            <Checkbox
                                                                checked={false}
                                                                disabled={isViewingOtherRep}
                                                            />
                                                        </div>
                                                    }
                                                />
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <h3 className={`font-medium truncate ${item.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                                                        {item.title}
                                                    </h3>
                                                    <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                                                        {item.scheduled_time && (
                                                            <Badge variant="outline" className="flex items-center gap-1">
                                                                <Clock className="h-3 w-3" />
                                                                {item.scheduled_time.slice(0, 5)}
                                                            </Badge>
                                                        )}
                                                        {!isViewingOtherRep && (
                                                            <AlertDialog>
                                                                <AlertDialogTrigger asChild>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="ghost"
                                                                        className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                                    >
                                                                        <Trash2 className="h-3.5 w-3.5" />
                                                                    </Button>
                                                                </AlertDialogTrigger>
                                                                <AlertDialogContent>
                                                                    <AlertDialogHeader>
                                                                        <AlertDialogTitle>¿Eliminar ítem?</AlertDialogTitle>
                                                                        <AlertDialogDescription>
                                                                            Se eliminará "{item.title}" del plan de hoy. Esta acción no se puede deshacer.
                                                                        </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                                        <AlertDialogAction
                                                                            onClick={() => deleteItem(item.id)}
                                                                            className="bg-destructive hover:bg-destructive/90"
                                                                        >
                                                                            Eliminar
                                                                        </AlertDialogAction>
                                                                    </AlertDialogFooter>
                                                                </AlertDialogContent>
                                                            </AlertDialog>
                                                        )}
                                                    </div>
                                                </div>
                                                {(() => {
                                                    const contactInfo = item.contacts
                                                        ? (Array.isArray(item.contacts) ? item.contacts[0] : item.contacts)
                                                        : null;
                                                    return contactInfo ? (
                                                        <p className="text-sm text-muted-foreground">
                                                            👨‍⚕️ {contactInfo.name}{contactInfo.specialty ? ` - ${contactInfo.specialty}` : ''}
                                                        </p>
                                                    ) : null;
                                                })()}
                                                {item.description && (
                                                    <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                                                )}
                                                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3" /> {item.duration_minutes} min
                                                    </span>
                                                    {item.status === 'completed' && item.description !== 'Equipo de Trabajo' && (
                                                        <Badge className="text-[9px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-black uppercase tracking-widest">
                                                            <CheckCircle className="h-2.5 w-2.5 mr-1" /> Completado · Registrado en Agenda
                                                        </Badge>
                                                    )}
                                                </div>
                                                {item.description === 'Equipo de Trabajo' && item.status !== 'completed' && !isViewingOtherRep && (
                                                    <div className="mt-3">
                                                        <Link to={`/coaching?rep=${item.contact_id}`}>
                                                            <Button size="sm" className="bg-primary text-primary-foreground font-black uppercase tracking-widest text-[10px]">
                                                                <Target className="w-3 h-3 mr-2" />
                                                                Realizar Coaching
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                )}
                                                {item.description === 'Equipo de Trabajo' && item.status === 'completed' && (
                                                    <Badge className="text-[9px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-black uppercase tracking-widest mt-2">
                                                        <CheckCircle className="h-2.5 w-2.5 mr-1" /> Coaching Realizado
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
