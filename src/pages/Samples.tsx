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
    ShieldAlert, Search
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
            const activeEvents = (demoData.events || []).filter(e => e.status === 'in_progress');
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
            // @ts-ignore
            setEvents(data);
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
                icon={<Pill className="h-8 w-8 text-indigo-500" />}
            />

            {/* Elite Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <EliteKPICard 
                    title="Eventos Activos" 
                    value={events.length.toString()} 
                    icon={<Calendar className="h-5 w-5" />}
                    trend="+1"
                    description="Jornadas en curso"
                />
                <EliteKPICard 
                    title="Estado Maletín" 
                    value="Óptimo" 
                    icon={<Package className="h-5 w-5" />}
                    trend="100%"
                    description="Capacidad de carga"
                />
                <EliteKPICard 
                    title="Alertas Stock" 
                    value="2" 
                    icon={<ShieldAlert className="h-5 w-5" />}
                    description="Proximidad a vencer"
                    trend="-20%"
                    trendPositive={false}
                />
                <EliteKPICard 
                    title="Bancos Asignados" 
                    value="5" 
                    icon={<Building2 className="h-5 w-5" />}
                    description="Stock descentralizado"
                />
            </div>

            <Tabs defaultValue="dashboard" className="w-full">
                <EliteTabsList className="mb-6">
                    <EliteTabsTrigger value="dashboard">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Mi Maletín
                    </EliteTabsTrigger>
                    <EliteTabsTrigger value="banks">
                        <Building2 className="mr-2 h-4 w-4" />
                        Bancos
                    </EliteTabsTrigger>
                    <EliteTabsTrigger value="events">
                        <Calendar className="mr-2 h-4 w-4" />
                        Jornadas
                    </EliteTabsTrigger>
                    {canAccessSupervisor && (
                        <EliteTabsTrigger value="supervisor">
                            <Activity className="mr-2 h-4 w-4" />
                            Supervisión
                        </EliteTabsTrigger>
                    )}
                </EliteTabsList>

                <TabsContent value="dashboard" className="space-y-6 mt-6">
                    <Tabs defaultValue="stock" className="w-full">
                        <EliteTabsList className="mb-4">
                            <EliteTabsTrigger value="stock">
                                <LayoutDashboard className="mr-2 h-4 w-4" />
                                Mi Stock
                            </EliteTabsTrigger>
                            <EliteTabsTrigger value="pending">
                                <Inbox className="mr-2 h-4 w-4" />
                                Solicitudes
                            </EliteTabsTrigger>
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
                            <div className="medical-card p-6 border border-white/5 bg-slate-900/50 backdrop-blur-xl rounded-2xl">
                                <h3 className="text-lg font-bold text-white mb-2">Modo Jornada Médica</h3>
                                <p className="text-sm text-slate-400 mb-6">
                                    Selecciona un evento <strong className="text-emerald-400">En Progreso</strong> para habilitar registros rápidos.
                                </p>

                                {loadingEvents ? (
                                    <p className="text-sm text-muted-foreground animate-pulse">Sincronizando jornadas...</p>
                                ) : events.length === 0 ? (
                                    <div className="text-sm text-amber-500 bg-amber-500/10 p-3 rounded-lg border border-amber-500/20">
                                        No hay eventos "En Progreso". Activa uno en el calendario principal.
                                    </div>
                                ) : (
                                    <Select value={activeEventId} onValueChange={setActiveEventId}>
                                        <SelectTrigger className="w-full bg-slate-950/50 border-white/10">
                                            <SelectValue placeholder="Seleccionar Jornada Activa..." />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-900 border-white/10">
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
                                    <p className="text-sm text-white font-medium ml-4">{activeEventTitle}</p>
                                </div>
                            )}

                            <InstructionCard
                                title="Protocolo de Entrega"
                                items={[
                                    "Solo entregas físicas verificadas en el punto de atención.",
                                    "Validación automática contra inventario de maletín.",
                                    "Los registros erróneos pueden revertirse para reintegrar stock."
                                ]}
                                className="mb-0 border-white/5 bg-slate-900/40"
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
                                <div className="flex flex-col items-center justify-center h-[240px] border border-dashed border-white/10 rounded-2xl text-slate-500 bg-white/5 backdrop-blur-sm">
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
                                <EliteTabsTrigger value="banks">Bancos</EliteTabsTrigger>
                                <EliteTabsTrigger value="reps">Visita Médica</EliteTabsTrigger>
                                <EliteTabsTrigger value="assignment">Distribución</EliteTabsTrigger>
                                <EliteTabsTrigger value="history">Auditoría</EliteTabsTrigger>
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
