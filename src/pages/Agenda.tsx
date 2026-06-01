/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import { useState, useEffect } from "react";
import {
    Calendar, ChevronLeft, ChevronRight, Plus, MapPin, Clock, Target,
    ChevronRight as ChevronRightIcon, Trash2, Users, User, Eye,
    CheckCircle2, AlertCircle
} from "lucide-react";
import { EliteHeader, EliteButton, EliteCard } from "@/components/layout/DesignSystem";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { VisitDetailDialog } from "@/components/visits/VisitDetailDialog";
import { QuickScheduleWizard } from "@/components/visits/QuickScheduleWizard";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useDemoData } from "@/contexts/MockDataProvider";
import { cn } from "@/lib/utils";
import { PremiumEmptyState } from "@/components/ui/PremiumEmptyState";
import { useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTexts } from "@/hooks/useTexts";

interface TeamMember {
    user_id: string;
    name: string;
    role: string;
    zone_id: string | null;
}

interface RoutedContact {
    id: string;
    name: string;
    type_label: string;
    source: string;
    contact_type: string;
}

export default function Agenda() {
    const t = useTexts();
    const [searchParams] = useSearchParams();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [visits, setVisits] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [wizardOpen, setWizardOpen] = useState(false);
    const [initialVisitData, setInitialVisitData] = useState<any>(null);
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [selectedRepId, setSelectedRepId] = useState<string>('');
    const [routedContactsWithoutVisit, setRoutedContactsWithoutVisit] = useState<RoutedContact[]>([]);
    const [zones, setZones] = useState<{id: string, name: string}[]>([]);
    const [selectedZoneId, setSelectedZoneId] = useState<string>("all");

    const { user, organizationId, isRepresentative, isSupervisor, isCoordinator, isManager, isMaster, canViewAllData } = useAuth();
    const { toast } = useToast();
    const demoData = useDemoData();

    const canViewTeam = isSupervisor || isCoordinator || isManager || isMaster;
    const isViewingOtherRep = !isRepresentative || (!!selectedRepId && selectedRepId !== user?.id);
    const viewingMember = teamMembers.find(m => m.user_id === selectedRepId);

    // ─── Effects ────────────────────────────────────────────────────────────────

    useEffect(() => {
        const doctorId = searchParams.get('doctorId');
        const pharmacyId = searchParams.get('pharmacyId');
        const commerceId = searchParams.get('commerceId');
        if (doctorId || pharmacyId || commerceId) {
            setInitialVisitData({
                contactId: doctorId || pharmacyId || commerceId,
                visitType: doctorId ? 'doctor' : (pharmacyId ? 'pharmacy' : 'commerce'),
            });
            setWizardOpen(true);
        }
    }, [searchParams]);

    useEffect(() => {
        if (user) {
            loadVisits();
            if (isRepresentative && !isViewingOtherRep) {
                loadRoutedContactsWithoutVisit();
            }
        }
    }, [user, currentDate, selectedRepId, selectedZoneId]);

    useEffect(() => {
        if (canViewTeam && organizationId && user) {
            loadTeamMembers();
            if (canViewAllData) {
                loadZones();
            }
        }
    }, [user, organizationId, canViewTeam, selectedZoneId]);

    const loadZones = async () => {
        const { data } = await supabase.from('zones').select('id, name').order('name');
        setZones(data || []);
    };

    // ─── Helpers ────────────────────────────────────────────────────────────────

    const changeDate = (days: number) => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + days);
        setCurrentDate(newDate);
    };

    const getDayOfWeek = (date: Date): string => {
        const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        return days[date.getDay()];
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            case 'scheduled': return 'bg-primary/10 text-primary border-primary/20';
            case 'cancelled': return 'bg-rose-500/5 text-rose-500 border-rose-500/20';
            default: return 'bg-muted/10 text-muted-foreground border-border/40';
        }
    };

    // ─── Data Loading ────────────────────────────────────────────────────────────

    const loadTeamMembers = async () => {
        if (!organizationId) return;
        try {
            let query = supabase
                .from('user_roles_plain')
                .select('user_id, role, zone_id')
                .eq('organization_id', organizationId)
                .in('role', isSupervisor && !isCoordinator ? ['representative'] : ['representative', 'supervisor', 'chief']);

            if (selectedZoneId && selectedZoneId !== 'all') {
                query = query.eq('zone_id', selectedZoneId);
            }

            const { data, error } = await query;
            if (error || !data?.length) {
                setTeamMembers([]);
                return;
            }

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
                        zone_id: d.zone_id,
                    };
                });

            setTeamMembers(members);
        } catch (error) {
            console.error('Error loading team members:', error);
        }
    };

    const loadVisits = async () => {
        if (!user) { setLoading(false); return; }
        try {
            setLoading(true);
            const startOfDay = new Date(currentDate);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(currentDate);
            endOfDay.setHours(23, 59, 59, 999);

            // Demo mode
            if (demoData?.visits) {
                setVisits(demoData.visits.filter((v: any) =>
                    v.scheduled_date && new Date(v.scheduled_date) >= startOfDay && new Date(v.scheduled_date) <= endOfDay
                ));
                setLoading(false);
                return;
            }

            // Build query based on role and selected rep
            let query = supabase
                .from('visits')
                .select('*')
                .gte('scheduled_date', startOfDay.toISOString())
                .lte('scheduled_date', endOfDay.toISOString())
                .order('scheduled_date', { ascending: true });

            if (isRepresentative) {
                // Representante: solo sus propias visitas
                query = query.eq('user_id', user.id);
            } else if (selectedRepId) {
                // Supervisor viendo un representante específico
                query = query.eq('user_id', selectedRepId);
            } else {
                // Dashboard de Territorio (todo el equipo de la zona)
                if (selectedZoneId !== 'all') {
                    const repIdsInZone = teamMembers.filter(m => m.zone_id === selectedZoneId).map(m => m.user_id);
                    if (repIdsInZone.length > 0) {
                        query = query.in('user_id', repIdsInZone);
                    } else {
                        // Forzar que no retorne nada si la zona no tiene representantes
                        query = query.eq('user_id', '00000000-0000-0000-0000-000000000000');
                    }
                } else if (organizationId) {
                    query = query.eq('organization_id', organizationId);
                }
            }

            const { data: visitsData, error } = await query;
            if (error) throw error;

            if (visitsData && visitsData.length > 0) {
                const contactIds = Array.from(new Set(visitsData.map((v: any) => v.contact_id).filter(Boolean)));
                const { data: contactsData } = contactIds.length > 0
                    ? await supabase.from('unified_contacts').select('*').in('id', contactIds)
                    : { data: [] };

                // Also fetch user names for supervisor view
                let userNames: Record<string, string> = {};
                if (canViewTeam && !selectedRepId) {
                    const visitUserIds = [...new Set(visitsData.map((v: any) => v.user_id))];
                    const { data: profData } = await supabase
                        .from('profiles')
                        .select('user_id, first_name, last_name')
                        .in('user_id', visitUserIds);
                    (profData || []).forEach((p: any) => {
                        userNames[p.user_id] = `${p.first_name || ''} ${p.last_name || ''}`.trim();
                    });
                }

                const merged = visitsData.map((v: any) => ({
                    ...v,
                    contacts: (contactsData as any[])?.find((c: any) => c.id === v.contact_id),
                    rep_name: userNames[v.user_id] || null,
                }));
                setVisits(merged);
            } else {
                setVisits([]);
            }
        } catch (error) {
            console.error('Error loading visits:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadRoutedContactsWithoutVisit = async () => {
        if (!organizationId || isViewingOtherRep) { setRoutedContactsWithoutVisit([]); return; }
        const day = getDayOfWeek(currentDate);
        if (day === 'Domingo' || day === 'Sábado') { setRoutedContactsWithoutVisit([]); return; }

        try {
            const sources = [
                { table: 'doctors',        field: 'days',         label: 'Médico',            type: 'doctor' },
                { table: 'pharmacies',     field: 'schedule',     label: 'Farmacia',          type: 'pharmacy' },
                { table: 'health_centers', field: 'routing_days', label: 'Centro de Salud',   type: 'hospital' },
                { table: 'drugstores',     field: 'routing_days', label: 'Droguería',         type: 'drugstore' },
                { table: 'commerces',      field: 'routing_days', label: 'Comercio',          type: 'commerce' },
                { table: 'natural_stores', field: 'routing_days', label: 'Tienda Naturista',  type: 'natural_store' },
            ] as const;

            const results = await Promise.all(
                sources.map(async ({ table, field, label, type }) => {
                    const { data } = await supabase
                        .from(table)
                        .select(`id, name, ${field}`)
                        .eq('organization_id', organizationId)
                        .ilike(field as string, `%${day}%`);
                    return (data || []).map((c: any): RoutedContact => ({
                        id: c.id, name: c.name, type_label: label, source: table, contact_type: type,
                    }));
                })
            );

            const allRoutedContacts = results.flat();

            // Filter out those already in visits today
            const todayVisitContactIds = new Set(visits.map(v => v.contact_id).filter(Boolean));
            const todayVisitTitles = new Set(visits.map(v => v.notes?.toLowerCase()));
            const pending = allRoutedContacts.filter(c =>
                !todayVisitContactIds.has(c.id) &&
                !todayVisitTitles.has(`visita: ${c.name.toLowerCase()}`)
            );

            setRoutedContactsWithoutVisit(pending);
        } catch (error) {
            console.error('Error loading routed contacts:', error);
        }
    };

    // ─── Actions ────────────────────────────────────────────────────────────────

    const deleteVisit = async (visitId: string) => {
        try {
            const { error } = await supabase.from('visits').delete().eq('id', visitId).eq('user_id', user!.id);
            if (error) throw error;
            setVisits(visits.filter(v => v.id !== visitId));
            toast({ title: 'Visita eliminada', description: 'La visita ha sido removida de la agenda.' });
        } catch (error) {
            toast({ title: 'Error', description: 'No se pudo eliminar la visita.', variant: 'destructive' });
        }
    };

    const quickRegisterVisit = async (contact: RoutedContact) => {
        if (!user) return;
        try {
            const { error } = await supabase.from('visits').insert({
                user_id: user.id,
                organization_id: organizationId,
                scheduled_date: currentDate.toISOString(),
                status: 'completed',
                visit_type: contact.contact_type,
                notes: `Visita: ${contact.name}`,
                objective: contact.type_label,
            });
            if (error) throw error;
            toast({ title: '✅ Visita registrada', description: `${contact.name} registrado en la agenda.` });
            loadVisits();
            loadRoutedContactsWithoutVisit();
        } catch (error) {
            toast({ title: 'Error', description: 'No se pudo registrar la visita.', variant: 'destructive' });
        }
    };

    // ─── Render ──────────────────────────────────────────────────────────────────

    const currentDay = getDayOfWeek(currentDate);
    const isWeekend = currentDay === 'Sábado' || currentDay === 'Domingo';

    return (
        <div className="space-y-10 pb-20 font-display animate-in fade-in duration-700">
            <EliteHeader
                title={t.agenda_title}
                subtitle={currentDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase()}
                icon={Calendar}
                badgeText="Operativo V7.0"
                statusText={`${visits.length} MISIONES PROGRAMADAS`}
                statusColor={visits.length > 0 ? "bg-primary" : "bg-muted-foreground/30"}
                rightContent={
                    <div className="flex items-center gap-4 bg-muted/5 backdrop-blur-md p-1.5 rounded-elite-md border border-border/40 shadow-inner group">
                        <div className="flex items-center gap-1">
                            <EliteButton variant="ghost" className="h-10 w-10 p-0" onClick={() => changeDate(-1)}>
                                <ChevronLeft className="h-5 w-5" />
                            </EliteButton>
                            <EliteButton variant="ghost" className="h-10 px-4 text-primary font-black text-[10px]" onClick={() => setCurrentDate(new Date())}>HOY</EliteButton>
                            <EliteButton variant="ghost" className="h-10 w-10 p-0" onClick={() => changeDate(1)}>
                                <ChevronRight className="h-5 w-5" />
                            </EliteButton>
                        </div>
                        {isRepresentative && (
                            <>
                                <div className="w-px h-8 bg-border/40 mx-2" />
                                <EliteButton onClick={() => setWizardOpen(true)} className="h-12 px-6" icon={Plus}>
                                    NUEVA MISIÓN
                                </EliteButton>
                            </>
                        )}
                    </div>
                }
            />

            {/* ── Team Selector / Dashboard Filter ── */}
            {canViewTeam && (
                <div className="flex items-center gap-4 flex-wrap p-4 rounded-xl border border-border/40 bg-muted/20">
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
                    <Badge variant="outline" className="text-[9px] font-black uppercase text-amber-500 border-amber-500/30 ml-auto">
                        Solo lectura (Dashboard)
                    </Badge>
                </div>
            )}

            {/* ── Ruta del día — pending contacts ── */}
            {!isViewingOtherRep && !isWeekend && routedContactsWithoutVisit.length > 0 && (
                <Card className="border-amber-500/20 bg-amber-500/5">
                    <CardHeader className="pb-2 border-b border-amber-500/10">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-amber-500" />
                            <span className="font-black uppercase tracking-widest text-xs text-amber-600">
                                Ruta pendiente — {routedContactsWithoutVisit.length} sin visitar hoy
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                            {routedContactsWithoutVisit.map(contact => (
                                <div
                                    key={`${contact.source}-${contact.id}`}
                                    className="flex items-center justify-between p-2.5 rounded-xl border border-amber-500/20 bg-card hover:border-amber-500/40 transition-all"
                                >
                                    <div>
                                        <p className="text-sm font-semibold leading-tight">{contact.name}</p>
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-black">{contact.type_label}</p>
                                    </div>
                                    <Button
                                        size="sm"
                                        onClick={() => quickRegisterVisit(contact)}
                                        className="h-7 px-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest bg-amber-500 hover:bg-amber-600 text-white border-none shadow-sm"
                                    >
                                        ✓ Registrar
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* ── Visits Grid ── */}
            <div className="grid gap-8">
                <AnimatePresence mode="popLayout">
                    {loading ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-40 gap-6">
                            <div className="w-16 h-16 border-4 border-primary/10 border-t-primary rounded-full animate-spin shadow-glow shadow-primary/10" />
                            <p className="text-[11px] font-black text-primary uppercase tracking-[0.4em] animate-pulse">Sincronizando Archivo Maestro...</p>
                        </motion.div>
                    ) : visits.length === 0 ? (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                            <EliteCard className="p-24 border-dashed border-border/40 bg-muted/5 text-center">
                                <PremiumEmptyState
                                    icon={Calendar}
                                    title={
                                        !isRepresentative && !selectedRepId 
                                            ? "SIN VISITAS — TERRITORIO" 
                                            : isViewingOtherRep 
                                                ? `SIN VISITAS — ${viewingMember?.name?.toUpperCase() || 'REP'}` 
                                                : "OBJETIVOS NO DETECTADOS"
                                    }
                                    description={
                                        !isRepresentative && !selectedRepId 
                                            ? "No hay visitas registradas para el territorio o zona seleccionada en este día."
                                            : isViewingOtherRep
                                                ? "Este representante no ha registrado visitas para este día."
                                                : "ZONA CRONOLÓGICA DESPEJADA. INICIE EL DESPLIEGUE AÑADIENDO UNA NUEVA MISIÓN ESTRATÉGICA."
                                    }
                                    actionLabel={isViewingOtherRep ? undefined : "ABRIR WIZARD"}
                                    onAction={isViewingOtherRep ? undefined : () => setWizardOpen(true)}
                                />
                            </EliteCard>
                        </motion.div>
                    ) : (
                        <div className="grid gap-6">
                            {visits.map((v, i) => (
                                <EliteCard key={v.id} className="group overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1.5 h-full bg-muted/20 group-hover:bg-primary transition-colors duration-500" />
                                    <CardContent className="p-0">
                                        <div className="flex flex-col lg:flex-row lg:items-center">
                                            {/* Time column */}
                                            <div className="lg:w-32 bg-muted/5 p-8 flex flex-col items-center justify-center border-r border-border/40 group-hover:bg-primary/5 transition-colors duration-500">
                                                <div className="w-14 h-14 rounded-2xl bg-card border border-border/40 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500">
                                                    <Clock className="h-6 w-6 text-primary" />
                                                </div>
                                                <Badge className="mt-4 bg-muted/10 text-foreground font-black text-[10px] border-none px-3 py-1 rounded-lg">
                                                    {new Date(v.scheduled_date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                                                </Badge>
                                            </div>

                                            {/* Content column */}
                                            <div className="flex-1 p-8 md:p-10">
                                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                                                    <div className="space-y-4">
                                                        <div>
                                                            <div className="flex items-center gap-4 flex-wrap mb-2">
                                                                <h3 className="text-xl font-black text-foreground group-hover:text-primary transition-colors uppercase tracking-tight font-display">
                                                                    {v.contacts?.name || v.contacts?.full_name || v.notes || "OBJETIVO_TIER_0"}
                                                                </h3>
                                                                <Badge className={cn("px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-inner", getStatusColor(v.status))}>
                                                                    {v.status?.toUpperCase()}
                                                                </Badge>
                                                                {/* Rep name badge — only for supervisors viewing team */}
                                                                {v.rep_name && (
                                                                    <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                                                                        <User className="h-2.5 w-2.5 mr-1" />
                                                                        {v.rep_name}
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <p className="text-elite-xs text-muted-foreground uppercase tracking-widest">
                                                                {v.visit_type?.toUpperCase() || 'LOGS'} • DESPLIEGUE TÁCTICO
                                                            </p>
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                                                            <div className="flex items-center text-elite-xs text-muted-foreground group/item">
                                                                <div className="w-8 h-8 rounded-xl bg-muted/10 flex items-center justify-center mr-3 border border-border/40 group-hover/item:bg-primary/10 group-hover/item:border-primary/20 transition-all">
                                                                    <Target className="h-4 w-4 text-primary opacity-60" />
                                                                </div>
                                                                {v.contacts?.specialty || v.contacts?.city || v.objective || "SECTOR_GENERAL"}
                                                            </div>
                                                            {v.contacts?.address && (
                                                                <div className="flex items-center text-elite-xs text-muted-foreground group/item">
                                                                    <div className="w-8 h-8 rounded-xl bg-muted/10 flex items-center justify-center mr-3 border border-border/40 group-hover/item:bg-emerald-500/10 group-hover/item:border-emerald-500/20 transition-all">
                                                                        <MapPin className="h-4 w-4 text-emerald-500 opacity-60" />
                                                                    </div>
                                                                    <span className="truncate max-w-[200px]">{v.contacts.address}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Actions */}
                                                    <div className="flex items-center gap-2">
                                                        <VisitDetailDialog
                                                            trigger={
                                                                <EliteButton className="h-14 px-8 group/btn" icon={ChevronRightIcon}>
                                                                    {isViewingOtherRep ? 'VER DETALLE' : 'GESTIONAR'}
                                                                </EliteButton>
                                                            }
                                                            visitData={v}
                                                            onVisitSaved={loadVisits}
                                                        />
                                                        {/* Delete — only for own visits */}
                                                        {v.user_id === user?.id && (
                                                            <AlertDialog>
                                                                <AlertDialogTrigger asChild>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="ghost"
                                                                        className="h-14 w-10 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl"
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                </AlertDialogTrigger>
                                                                <AlertDialogContent>
                                                                    <AlertDialogHeader>
                                                                        <AlertDialogTitle>¿Eliminar visita?</AlertDialogTitle>
                                                                        <AlertDialogDescription>
                                                                            Esta acción eliminará permanentemente la visita registrada. No se puede deshacer.
                                                                        </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                                        <AlertDialogAction
                                                                            onClick={() => deleteVisit(v.id)}
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
                                            </div>
                                        </div>
                                    </CardContent>
                                </EliteCard>
                            ))}
                        </div>
                    )}
                </AnimatePresence>
            </div>

            {/* Quick register section */}
            {!isViewingOtherRep && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-10 border-t border-border/40">
                    <VisitDetailDialog
                        trigger={
                            <EliteCard className="p-10 text-center relative group cursor-pointer border-dashed border-border/60 hover:border-primary/40">
                                <div className="w-20 h-20 bg-muted/10 rounded-elite-md flex items-center justify-center mx-auto mb-6 text-muted-foreground transition-all duration-500 transform group-hover:scale-110 group-hover:rotate-12 group-hover:bg-primary group-hover:text-white border border-border/40 shadow-inner">
                                    <Plus className="h-8 w-8" />
                                </div>
                                <h3 className="text-xl font-black text-foreground uppercase mb-2 tracking-tighter font-display">Visita Espontánea</h3>
                                <p className="text-elite-xs text-muted-foreground uppercase tracking-widest">LOG INMEDIATO FUERA DE PLAN</p>
                            </EliteCard>
                        }
                        visitData={{ scheduled_date: new Date().toISOString().split('T')[0], status: 'completed', visit_type: 'doctor' }}
                        onVisitSaved={loadVisits}
                    />
                    <Link to="/planner" className="contents">
                        <EliteCard className="p-10 text-center relative group cursor-pointer border-dashed border-border/60 hover:border-primary/40">
                            <div className="w-20 h-20 bg-muted/10 rounded-elite-md flex items-center justify-center mx-auto mb-6 text-muted-foreground transition-all duration-500 transform group-hover:scale-110 group-hover:rotate-12 group-hover:bg-primary group-hover:text-white border border-border/40 shadow-inner">
                                <CheckCircle2 className="h-8 w-8" />
                            </div>
                            <h3 className="text-xl font-black text-foreground uppercase mb-2 tracking-tighter font-display">Ir al Plan Diario</h3>
                            <p className="text-elite-xs text-muted-foreground uppercase tracking-widest">COMPLETAR TAREAS → AUTO-REGISTRA</p>
                        </EliteCard>
                    </Link>
                </div>
            )}

            <QuickScheduleWizard
                open={wizardOpen}
                onOpenChange={setWizardOpen}
                onSuccess={loadVisits}
                visitData={initialVisitData}
            />
        </div>
    );
}
