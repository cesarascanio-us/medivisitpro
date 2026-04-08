/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
 
 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
 ======================================================================== */

import { useState, useEffect } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { 
    Pill, LayoutDashboard, Building2, 
    Calendar, Activity, Inbox, Package,
    ShieldAlert, Search, Users
} from "lucide-react";
import { InventoryDashboard } from "@/components/samples/InventoryDashboard";
import { BankManager } from "@/components/samples/BankManager";
import { EventTreatmentForm } from "@/components/samples/EventTreatmentForm";
import { RepInventoryView } from "@/components/samples/RepInventoryView";
import { BankSupervisorDashboard } from "@/components/samples/BankSupervisorDashboard";
import { WarehouseReception } from "@/components/samples/WarehouseReception";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StockAssignmentManager } from "@/components/samples/StockAssignmentManager";
import { RepSupervisorDashboard } from "@/components/samples/RepSupervisorDashboard";
import { AssignmentHistory } from "@/components/samples/AssignmentHistory";
import { PendingAssignments } from "@/components/samples/PendingAssignments";
import { useAuth } from "@/hooks/useAuth";
import { EliteHeader, EliteKPICard, EliteTabsList, EliteTabsTrigger } from "@/components/layout/DesignSystem";
import { useOrganization } from "@/hooks/useOrganization";
import { useDemoData } from "@/contexts/MockDataProvider";
import { Badge } from "@/components/ui/badge";
import { InstructionCard } from "@/components/ui/InstructionCard";
import { supabase } from "@/integrations/supabase/client";

interface Event {
    id: string;
    title: string;
    location: string;
    date: string;
}

export default function Samples() {
    const { user, isMaster, isAdmin, isManager, isSupervisor, companyId } = useAuth();
    const { organization } = useOrganization();

    // Check if user can access supervisor features
    const canAccessSupervisor = isMaster || isAdmin || isManager || isSupervisor;

    // State for Real Events
    const [events, setEvents] = useState<Event[]>([]);
    const [activeEventId, setActiveEventId] = useState<string | undefined>(undefined);
    const [loadingEvents, setLoadingEvents] = useState(false);
    const demoData = useDemoData();

    useEffect(() => {
        if (user || demoData) {
            fetchActiveEvents();
        }
    }, [user, demoData]);

    const fetchActiveEvents = async () => {
        setLoadingEvents(true);

        if (demoData) {
            console.log("Samples: Loading demo events");
            const activeEvents = (demoData.events || [])
                .filter(e => e.status === 'in_progress')
                .map((e: any): Event => ({
                    id: e.id,
                    title: e.title,
                    location: e.location,
                    date: e.scheduled_date
                }));
            setEvents(activeEvents);
            if (activeEvents.length === 1) {
                setActiveEventId(activeEvents[0].id);
            }
            setLoadingEvents(false);
            return;
        }

        // [INDUSTRIAL] Filter by company_id for business isolation
        let query = supabase
            .from('events')
            .select('id, title, location, scheduled_date')
            .eq('status', 'in_progress');
        
        if (!isMaster && companyId) {
            query = query.eq('company_id', companyId);
        }

        const { data } = await query.order('scheduled_date', { ascending: false });

        if (data) {
            const mappedEvents = data.map((e: any): Event => ({
                id: e.id,
                title: e.title,
                location: e.location,
                date: e.scheduled_date
            }));
            setEvents(mappedEvents);
            if (data.length === 1) {
                // Auto-select if only one active event
                setActiveEventId((data[0] as any).id);
            }
        }
        setLoadingEvents(false);
    };

    const activeEventTitle = events.find(e => e.id === activeEventId)?.title;

    return (
        <div className="space-y-6 pb-20">
            <EliteHeader 
                title="Gestión de Muestras" 
                subtitle="Logística Integral: Maletín, Bancos y Eventos"
                icon={Pill}
            />

            {/* Elite Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <EliteKPICard 
                    title="Eventos Activos" 
                    value={events.length} 
                    icon={Calendar}
                    trend={1}
                    subtitle="Jornadas en curso"
                />
                <EliteKPICard 
                    title="Estado Maletín" 
                    value="Óptimo" 
                    icon={Package}
                    trend={100}
                    subtitle="Capacidad de carga"
                />
                <EliteKPICard 
                    title="Alertas Stock" 
                    value={2} 
                    icon={ShieldAlert}
                    subtitle="Proximidad a vencer"
                    trend={-20}
                    color="rose"
                />
                <EliteKPICard 
                    title="Bancos Asignados" 
                    value={5} 
                    icon={Building2}
                    subtitle="Stock descentralizado"
                    color="indigo"
                />
            </div>

            <Tabs defaultValue="dashboard" className="w-full">
                <EliteTabsList className="mb-6">
                    <EliteTabsTrigger value="dashboard" label="Mi Maletín" icon={LayoutDashboard} />
                    <EliteTabsTrigger value="banks" label="Bancos" icon={Building2} />
                    <EliteTabsTrigger value="events" label="Jornadas" icon={Calendar} />
                    {canAccessSupervisor && (
                        <EliteTabsTrigger value="supervisor" label="Supervisión" icon={Activity} />
                    )}
                </EliteTabsList>

                <TabsContent value="dashboard" className="space-y-6 mt-6">
                    <Tabs defaultValue="stock" className="w-full">
                        <EliteTabsList className="mb-4">
                            <EliteTabsTrigger value="stock" label="Mi Stock" icon={LayoutDashboard} />
                            <EliteTabsTrigger value="pending" label="Solicitudes" icon={Inbox} />
                        </EliteTabsList>

                        <TabsContent value="stock" className="space-y-6 mt-4">
                            <WarehouseReception onReceive={() => window.location.reload()} />
                            <InventoryDashboard />
                            <div className="mt-8">
                                <h3 className="text-xl font-bold text-foreground mb-4">Detalle de Inventario</h3>
                                <RepInventoryView />
                            </div>
                        </TabsContent>

                        <TabsContent value="pending" className="mt-4">
                            <div className="mb-6">
                                <h3 className="text-xl font-bold text-foreground">Asignaciones por Aceptar</h3>
                                <p className="text-sm text-muted-foreground">
                                    Revisa y acepta el stock asignado por tu supervisor antes de cargarlo al inventario activo.
                                </p>
                            </div>
                            <PendingAssignments />
                        </TabsContent>
                    </Tabs>
                </TabsContent>

                <TabsContent value="banks" className="mt-6">
                    <BankManager />
                </TabsContent>

                <TabsContent value="events" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <div className="p-8 border border-border/40 shadow-sm rounded-xl bg-card">
                                <h3 className="text-lg font-bold text-foreground mb-2">Modo Jornada Médica</h3>
                                <p className="text-sm text-muted-foreground mb-6">
                                    Selecciona un evento <strong className="text-emerald-500">En Progreso</strong> para habilitar registros rápidos.
                                </p>

                                {loadingEvents ? (
                                    <p className="text-sm text-muted-foreground animate-pulse">Sincronizando jornadas...</p>
                                ) : events.length === 0 ? (
                                    <div className="text-sm text-amber-500 bg-amber-500/10 p-3 rounded-lg border border-amber-500/20">
                                        No hay eventos "En Progreso". Activa uno en el calendario principal.
                                    </div>
                                ) : (
                                    <Select value={activeEventId} onValueChange={setActiveEventId}>
                                        <SelectTrigger className="w-full bg-background border-border/60">
                                            <SelectValue placeholder="Seleccionar Jornada Activa..." />
                                        </SelectTrigger>
                                        <SelectContent className="bg-card border-border">
                                            {events.map(e => (
                                                <SelectItem key={e.id} value={e.id}>
                                                    {e.title} ({new Date(e.date).toLocaleDateString()})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>

                            {activeEventId && (
                                <div className="border border-emerald-500/20 bg-emerald-500/5 p-4 rounded-xl backdrop-blur-sm">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                                        <p className="text-emerald-400 font-bold uppercase text-[10px] tracking-widest">Conexión Activa</p>
                                    </div>
                                    <p className="text-sm text-foreground font-medium ml-4">{activeEventTitle}</p>
                                </div>
                            )}

                            <InstructionCard
                                title="Protocolo de Entrega"
                                items={[
                                    "Solo entregas físicas verificadas en el punto de atención.",
                                    "Validación automática contra inventario de maletín.",
                                    "Los registros erróneos pueden revertirse para reintegrar stock."
                                ]}
                                className="mb-0"
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-lg">Entrega Rápida</h3>
                                {activeEventId && <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Listo</Badge>}
                            </div>
                            {activeEventId ? (
                                <EventTreatmentForm eventId={activeEventId} />
                            ) : (
                                <div className="flex flex-col items-center justify-center h-[240px] border border-dashed border-border rounded-2xl text-muted-foreground bg-muted/20 backdrop-blur-sm">
                                    <Calendar className="h-8 w-8 mb-3 opacity-20" />
                                    <p className="text-sm">Selecciona una jornada para iniciar</p>
                                </div>
                            )}
                        </div>
                    </div>
                </TabsContent>

                {canAccessSupervisor && (
                    <TabsContent value="supervisor" className="mt-6 space-y-6">
                        <Tabs defaultValue="banks" className="w-full">
                            <EliteTabsList>
                                <EliteTabsTrigger value="banks" label="Bancos" icon={Building2} />
                                <EliteTabsTrigger value="reps" label="Visita Médica" icon={Users} />
                                <EliteTabsTrigger value="assignment" label="Distribución" icon={Package} />
                                <EliteTabsTrigger value="history" label="Auditoría" icon={Activity} />
                            </EliteTabsList>
                            <TabsContent value="banks" className="mt-6">
                                <BankSupervisorDashboard />
                            </TabsContent>
                            <TabsContent value="reps" className="mt-6">
                                <RepSupervisorDashboard />
                            </TabsContent>
                            <TabsContent value="assignment" className="mt-6">
                                <StockAssignmentManager />
                            </TabsContent>
                            <TabsContent value="history" className="mt-6">
                                <AssignmentHistory />
                            </TabsContent>
                        </Tabs>
                    </TabsContent>
                )}
            </Tabs>
        </div>
    );
}
