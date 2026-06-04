/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
    Loader2, MapPin, Search, Lock, Calendar, UserRound, Building2,
    Store, Leaf as LeafIcon, ShoppingCart, Truck, Users, User, Eye,
    CheckCircle, XCircle
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { EliteHeader, EliteButton } from "@/components/layout/DesignSystem";
import { PremiumEmptyState } from "@/components/ui/PremiumEmptyState";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from "@/components/ui/alert-dialog";

const DAYS_OF_WEEK = [
    { id: "Lunes",     label: "Lun" },
    { id: "Martes",    label: "Mar" },
    { id: "Miércoles", label: "Mié" },
    { id: "Jueves",    label: "Jue" },
    { id: "Viernes",   label: "Vie" },
];

const CONTACT_TYPES = [
    { id: 'doctor',       icon: UserRound,   label: 'Médico' },
    { id: 'hospital',     icon: Building2,   label: 'Centro' },
    { id: 'pharmacy',     icon: Store,        label: 'Farmacia' },
    { id: 'natural_store',icon: LeafIcon,     label: 'Naturista' },
    { id: 'commerce',     icon: ShoppingCart, label: 'Comercio' },
    { id: 'drugstore',    icon: Truck,        label: 'Droguería' },
];

interface TeamMember {
    user_id: string;
    name: string;
    role: string;
}

export default function RoutePlanner() {
    const { user, organizationId, isSupervisor, isCoordinator, isManager, isMaster, isRepresentative } = useAuth();
    const [loading, setLoading] = useState(true);
    const [contacts, setContacts] = useState<any[]>([]);
    const [search, setSearch] = useState("");
    const [selectedDay, setSelectedDay] = useState("Lunes");
    const isSupervisorPlanningOwnRoute = !isRepresentative && !isViewingOtherRep;
    const [selectedType, setSelectedType] = useState(isSupervisorPlanningOwnRoute ? "team" : "doctor");
    const [hasActiveCycle, setHasActiveCycle] = useState<boolean | null>(null);
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [selectedRepId, setSelectedRepId] = useState<string>('');

    const canViewTeam = isSupervisor || isCoordinator || isManager || isMaster;
    const isViewingOtherRep = !!selectedRepId && selectedRepId !== user?.id;
    const viewingMember = teamMembers.find(m => m.user_id === selectedRepId);

    useEffect(() => {
        if (user && organizationId) {
            checkActiveCycle();
            if (canViewTeam) loadTeamMembers();
        }
    }, [user, organizationId]);

    useEffect(() => {
        if (hasActiveCycle) loadContacts();
    }, [selectedRepId]);

    // ─── Helpers ────────────────────────────────────────────────────────────────

    /** Count contacts assigned to a specific day across all types */
    const countForDay = (day: string) =>
        contacts.filter(c => c.routing_days?.split(",").map((d: string) => d.trim()).includes(day)).length;

    const hasDay = (contact: any) => {
        if (!contact.routing_days) return false;
        return contact.routing_days.split(",").map((d: string) => d.trim()).includes(selectedDay);
    };

    const getFilteredContacts = () =>
        contacts.filter(c =>
            c.contact_type === selectedType &&
            c.name.toLowerCase().includes(search.toLowerCase())
        );

    const getContactsForDay = () =>
        contacts.filter(c =>
            c.routing_days?.split(",").map((d: string) => d.trim()).includes(selectedDay)
        );

    // ─── Data ────────────────────────────────────────────────────────────────────

    const loadTeamMembers = async () => {
        if (!organizationId) return;
        try {
            const { data, error } = await supabase
                .from('user_roles_plain')
                .select('user_id, role, zone_id')
                .eq('organization_id', organizationId)
                .in('role', ['representative', 'supervisor', 'chief']);

            if (error || !data?.length) return;

            const userIds = data.map((d: any) => d.user_id);
            const { data: profiles } = await supabase
                .from('profiles')
                .select('user_id, first_name, last_name')
                .in('user_id', userIds);

            const members: TeamMember[] = data
                .filter((d: any) => d.user_id !== user?.id)
                .map((d: any) => {
                    const p = profiles?.find((pr: any) => pr.user_id === d.user_id);
                    return {
                        user_id: d.user_id,
                        name: p ? `${p.first_name || ''} ${p.last_name || ''}`.trim() || 'Usuario' : 'Usuario',
                        role: d.role,
                    };
                });
            setTeamMembers(members);
        } catch (error) {
            console.error('Error loading team members:', error);
        }
    };

    const checkActiveCycle = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from("promotional_cycles")
                .select("id")
                .eq("status", "active")
                .limit(1);

            if (error) throw error;

            const cycleExists = data && data.length > 0;
            setHasActiveCycle(cycleExists);

            // Bypass cycle check for managers or when viewing another rep
            if (cycleExists || !isRepresentative || isViewingOtherRep) {
                await loadContacts();
            } else {
                setLoading(false);
            }
        } catch (error) {
            console.error("Error checking cycle:", error);
            setLoading(false);
        }
    };

    const loadContacts = async () => {
        try {
            setLoading(true);

            const isSupervisorPlanningOwnRoute = !isRepresentative && !isViewingOtherRep;

            if (isSupervisorPlanningOwnRoute) {
                // Fetch team members directly if not loaded, or use existing teamMembers
                let currentTeam = teamMembers;
                if (!currentTeam || currentTeam.length === 0) {
                    const { data: rolesData } = await supabase
                        .from('user_roles_plain')
                        .select('user_id, role')
                        .eq('organization_id', organizationId)
                        .in('role', ['representative', 'commercial_rep', 'visitador_medico']);
                    
                    if (rolesData && rolesData.length > 0) {
                        const userIds = rolesData.map((d: any) => d.user_id);
                        const { data: profiles } = await supabase
                            .from('profiles')
                            .select('user_id, first_name, last_name')
                            .in('user_id', userIds);
                        
                        currentTeam = rolesData.map((d: any) => {
                            const p = profiles?.find((pr: any) => pr.user_id === d.user_id);
                            return {
                                user_id: d.user_id,
                                name: p ? `${p.first_name || ''} ${p.last_name || ''}`.trim() || 'Representante' : 'Representante',
                                role: d.role
                            };
                        });
                        setTeamMembers(currentTeam);
                    }
                }

                if (currentTeam && currentTeam.length > 0) {
                    const { data: routeData } = await supabase
                        .from("supervisor_routes")
                        .select("representative_id, routing_days")
                        .eq("supervisor_id", user?.id);

                    const teamContacts = currentTeam.map((member: any) => {
                        const route = routeData?.find((r: any) => r.representative_id === member.user_id);
                        return {
                            id: member.user_id,
                            name: member.name,
                            specialty: 'Representante de Ventas',
                            address: 'Trabajo de Campo',
                            contact_type: 'team',
                            source: 'supervisor_routes',
                            routing_days: route ? route.routing_days : null
                        };
                    });
                    setContacts(teamContacts);
                } else {
                    setContacts([]);
                }
                setLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from("unified_contacts")
                .select("id, name, specialty, address, contact_type, source")
                .eq("organization_id", organizationId);

            if (error) throw error;
            if (!data) return;

            // Enrich with routing days from source tables
            const enriched = await Promise.all(
                data.map(async (contact) => {
                    try {
                        const source = contact.source as string;
                        let routingField = "routing_days";
                        if (source === "doctors") routingField = "days";
                        else if (source === "pharmacies") routingField = "schedule";

                        const { data: srcData } = await supabase
                            .from(source)
                            .select(`id, ${routingField}`)
                            .eq("id", contact.id)
                            .single();

                        const routingDays = srcData ? (srcData as any)[routingField] ?? null : null;
                        return { ...contact, routing_days: routingDays };
                    } catch {
                        return { ...contact, routing_days: null };
                    }
                })
            );

            setContacts(enriched);
        } catch (error) {
            console.error("Error loading contacts:", error);
            toast.error("Error al cargar los contactos");
        } finally {
            setLoading(false);
        }
    };

    const assignToDay = async (contact: any) => {
        if (isViewingOtherRep) {
            toast.error("No puedes modificar rutas de otros representantes.");
            return;
        }
        try {
            let daysArray = contact.routing_days
                ? contact.routing_days.split(",").map((d: string) => d.trim()).filter(Boolean)
                : [];

            if (daysArray.includes(selectedDay)) {
                daysArray = daysArray.filter((d: string) => d !== selectedDay);
            } else {
                daysArray.push(selectedDay);
            }

            const newDaysStr = daysArray.join(", ");

            if (contact.source === 'supervisor_routes') {
                const { error } = await supabase
                    .from('supervisor_routes')
                    .upsert({
                        supervisor_id: user?.id,
                        representative_id: contact.id,
                        routing_days: newDaysStr || null,
                        organization_id: organizationId
                    }, { onConflict: 'supervisor_id, representative_id' });
                
                if (error) throw error;
            } else {
                const columnToUpdate = contact.source === 'doctors' ? 'days'
                    : contact.source === 'pharmacies' ? 'schedule'
                    : 'routing_days';

                const { error } = await supabase
                    .from(contact.source)
                    .update({ [columnToUpdate]: newDaysStr || null })
                    .eq("id", contact.id);

                if (error) throw error;
            }

            setContacts(contacts.map(c =>
                c.id === contact.id ? { ...c, routing_days: newDaysStr || null } : c
            ));

            if (daysArray.includes(selectedDay)) {
                toast.success(`✅ ${contact.name} asignado al ${selectedDay}`);
            } else {
                toast.success(`✓ ${contact.name} removido del ${selectedDay}`);
            }
        } catch (error) {
            console.error("Error updating route:", error);
            toast.error("No se pudo actualizar la ruta");
        }
    };

    return (
        <div className="space-y-10 pb-20 font-display animate-in fade-in duration-700">
            {/* Header */}
            <div className="mb-4">
                <EliteHeader
                    title="Planificador de Rutas Semanales"
                    subtitle={isViewingOtherRep
                        ? `Viendo rutas de: ${viewingMember?.name || 'Representante'} (solo lectura)`
                        : 'Asigna contactos a los días de tu semana de trabajo'}
                    icon={MapPin}
                    badgeText={isViewingOtherRep ? "Modo Supervisor" : "Asignación de Rutas"}
                    statusText={`${contacts.filter(c => c.routing_days).length} contactos asignados`}
                    statusColor={contacts.filter(c => c.routing_days).length > 0 ? "bg-primary" : "bg-muted-foreground/30"}
                />
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="animate-spin h-8 w-8 text-primary" />
                </div>
            ) : hasActiveCycle === false && isRepresentative && !isViewingOtherRep ? (
                <div className="mt-12">
                    <PremiumEmptyState
                        icon={Lock}
                        title="Rutas Bloqueadas"
                        description="No puedes planificar tus rutas semanales porque no hay ningún Ciclo Promocional activo. El flujo de trabajo requiere que la gerencia aperture un ciclo antes de definir el ruteo de campo."
                        actionLabel="Ir a Ciclos Promocionales"
                        onAction={() => window.location.href = "/cycles"}
                    />
                </div>
            ) : (
                <>
                    {/* ── Team selector for supervisors+ ── */}
                    {canViewTeam && teamMembers.length > 0 && (
                        <div className="flex items-center gap-3 flex-wrap p-3 rounded-xl border border-border/40 bg-muted/20">
                            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                <Users className="h-3.5 w-3.5" />
                                Viendo rutas de:
                            </div>
                            <div className="flex gap-2 flex-wrap">
                                <button
                                    onClick={() => setSelectedRepId('')}
                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border ${!selectedRepId ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground border-border/50 hover:border-primary/30'}`}
                                >
                                    <User className="h-3 w-3 inline mr-1" />
                                    Mis rutas
                                </button>
                                {teamMembers.map(member => (
                                    <button
                                        key={member.user_id}
                                        onClick={() => setSelectedRepId(member.user_id)}
                                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border ${selectedRepId === member.user_id ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground border-border/50 hover:border-primary/30'}`}
                                    >
                                        {selectedRepId === member.user_id && <Eye className="h-3 w-3 inline mr-1" />}
                                        {member.name}
                                    </button>
                                ))}
                            </div>
                            {isViewingOtherRep && (
                                <Badge variant="outline" className="text-[9px] font-black uppercase text-amber-500 border-amber-500/30 ml-auto">
                                    Solo lectura
                                </Badge>
                            )}
                        </div>
                    )}

                    {/* ── Day tabs with counters ── */}
                    <div className="flex gap-2 p-2 bg-muted/30 rounded-2xl overflow-x-auto">
                        {DAYS_OF_WEEK.map((day) => {
                            const count = countForDay(day.id);
                            return (
                                <Button
                                    key={day.id}
                                    variant={selectedDay === day.id ? "default" : "ghost"}
                                    className={cn(
                                        "rounded-xl flex-1 min-w-[90px] flex flex-col gap-0.5 h-14",
                                        selectedDay === day.id ? "shadow-md" : ""
                                    )}
                                    onClick={() => setSelectedDay(day.id)}
                                >
                                    <span className="text-xs font-black uppercase tracking-widest">{day.label}</span>
                                    {count > 0 ? (
                                        <Badge className={cn(
                                            "text-[9px] px-1.5 py-0 h-4 font-black",
                                            selectedDay === day.id
                                                ? "bg-white/20 text-white border-none"
                                                : "bg-primary/10 text-primary border-primary/20"
                                        )}>
                                            {count}
                                        </Badge>
                                    ) : (
                                        <span className="text-[9px] text-muted-foreground/50">vacío</span>
                                    )}
                                </Button>
                            );
                        })}
                    </div>

                    {/* ── Currently assigned to this day (summary) ── */}
                    {getContactsForDay().length > 0 && (
                        <Card className="border-primary/20 bg-primary/5">
                            <CardHeader className="pb-2 pt-3 px-4 border-b border-primary/10">
                                <CardTitle className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                    <CheckCircle className="h-3.5 w-3.5" />
                                    Asignados al {selectedDay} — {getContactsForDay().length} contactos
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-2 pb-3 px-4">
                                <div className="flex flex-wrap gap-2">
                                    {getContactsForDay().map(c => (
                                        <div
                                            key={c.id}
                                            className="flex items-center gap-1.5 px-2.5 py-1 bg-card rounded-lg border border-primary/20 text-xs"
                                        >
                                            <span className="font-semibold">{c.name}</span>
                                            <span className="text-muted-foreground text-[9px] uppercase font-black">
                                                {CONTACT_TYPES.find(t => t.id === c.contact_type)?.label || c.contact_type}
                                            </span>
                                            {!isViewingOtherRep && (
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <button className="ml-1 text-muted-foreground hover:text-destructive transition-colors">
                                                            <XCircle className="h-3 w-3" />
                                                        </button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>¿Quitar del {selectedDay}?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Se quitará a <strong>{c.name}</strong> del día {selectedDay}. Puedes volver a asignarlo después.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => assignToDay(c)}>
                                                                Quitar
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* ── Contact type selector ── */}
                    {!isRepresentative && !isViewingOtherRep ? (
                        <div className="grid grid-cols-1 gap-3">
                            <EliteButton
                                variant="secondary"
                                className="h-24 flex-col gap-2 rounded-[1.5rem] border border-primary/40 bg-primary/10 text-primary shadow-inner scale-105 transition-all duration-300 relative"
                                onClick={() => setSelectedType('team')}
                            >
                                <Users className="h-5 w-5 text-primary" />
                                <span className="font-black text-[9px] uppercase tracking-widest">Equipo de Trabajo</span>
                                <span className="text-[8px] font-black text-primary">
                                    {contacts.length} asignables
                                </span>
                            </EliteButton>
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
                            {CONTACT_TYPES.map((type) => {
                                const countInType = contacts.filter(c =>
                                    c.contact_type === type.id &&
                                    c.routing_days?.split(",").map((d: string) => d.trim()).includes(selectedDay)
                                ).length;
                                const totalInType = contacts.filter(c => c.contact_type === type.id).length;

                                return (
                                    <EliteButton
                                        key={type.id}
                                        variant={selectedType === type.id ? "secondary" : "ghost"}
                                        className={cn(
                                            "h-24 flex-col gap-2 rounded-[1.5rem] border border-border/40 transition-all duration-300 relative",
                                            selectedType === type.id && "bg-primary/10 border-primary/40 text-primary shadow-inner scale-105"
                                        )}
                                        onClick={() => setSelectedType(type.id)}
                                    >
                                        <type.icon className={cn("h-5 w-5", selectedType === type.id ? "text-primary" : "text-muted-foreground opacity-60")} />
                                        <span className="font-black text-[9px] uppercase tracking-widest">{type.label}</span>
                                        {totalInType > 0 && (
                                            <span className={cn(
                                                "text-[8px] font-black",
                                                countInType > 0 ? "text-primary" : "text-muted-foreground/50"
                                            )}>
                                                {countInType}/{totalInType}
                                            </span>
                                        )}
                                    </EliteButton>
                                );
                            })}
                        </div>
                    )}

                    {/* ── Search ── */}
                    <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder={`Buscar ${selectedType === 'team' ? 'Representante' : CONTACT_TYPES.find(t => t.id === selectedType)?.label} para asignar al ${selectedDay}...`}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 h-12 rounded-xl bg-muted/5 border-border/40 font-black text-foreground uppercase text-sm shadow-inner focus:bg-card"
                        />
                    </div>

                    {/* ── Contacts list ── */}
                    <Card className="medical-card">
                        <CardHeader className="pb-3 border-b border-border/50">
                            <CardTitle className="text-base flex items-center justify-between">
                                <span>
                                    {CONTACT_TYPES.find(t => t.id === selectedType)?.label}s
                                    — <span className="text-primary">{selectedDay}</span>
                                </span>
                                <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest">
                                    {getFilteredContacts().filter(c => hasDay(c)).length} asignados
                                    {' / '}
                                    {getFilteredContacts().length} total
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-2">
                            {getFilteredContacts().length === 0 ? (
                                <p className="text-center text-muted-foreground py-8 text-sm font-black uppercase tracking-widest opacity-60">
                                    No hay {CONTACT_TYPES.find(t => t.id === selectedType)?.label}s disponibles
                                </p>
                            ) : (
                                getFilteredContacts().map(contact => (
                                    <div
                                        key={contact.id}
                                        className={cn(
                                            "flex items-center justify-between p-3 rounded-xl border transition-all",
                                            hasDay(contact)
                                                ? "border-primary/30 bg-primary/5"
                                                : "border-border/40 hover:bg-muted/30"
                                        )}
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className={cn(
                                                "w-2 h-2 rounded-full flex-shrink-0",
                                                hasDay(contact) ? "bg-primary" : "bg-muted-foreground/30"
                                            )} />
                                            <div className="min-w-0">
                                                <h4 className="font-semibold text-sm leading-tight truncate">{contact.name}</h4>
                                                {(contact.specialty || contact.address) && (
                                                    <p className="text-[10px] text-muted-foreground truncate">
                                                        {contact.specialty || contact.address}
                                                    </p>
                                                )}
                                                {contact.routing_days && (
                                                    <p className="text-[9px] mt-0.5 text-primary font-black uppercase tracking-widest">
                                                        📅 {contact.routing_days}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        {!isViewingOtherRep ? (
                                            hasDay(contact) ? (
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="rounded-lg text-[10px] font-black uppercase tracking-widest border-primary/30 text-primary hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-all flex-shrink-0"
                                                        >
                                                            <XCircle className="h-3 w-3 mr-1" /> Quitar
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>¿Quitar del {selectedDay}?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Se quitará <strong>{contact.name}</strong> del día {selectedDay}. Puedes volver a asignarlo en cualquier momento.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => assignToDay(contact)}>
                                                                Quitar
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            ) : (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all flex-shrink-0"
                                                    onClick={() => assignToDay(contact)}
                                                >
                                                    <CheckCircle className="h-3 w-3 mr-1" /> Asignar
                                                </Button>
                                            )
                                        ) : (
                                            hasDay(contact) ? (
                                                <Badge className="text-[9px] bg-primary/10 text-primary border-primary/20 font-black uppercase">
                                                    ✓ Asignado
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-[9px] text-muted-foreground font-black uppercase">
                                                    Sin asignar
                                                </Badge>
                                            )
                                        )}
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    );
}
