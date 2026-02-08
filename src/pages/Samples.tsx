import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Pill, LayoutDashboard, Building2, Calendar, Activity, Inbox } from "lucide-react";
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
    const { user, isMaster, isAdmin, isManager, isSupervisor } = useAuth();

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

        // Fetch events that are 'in_progress' (and maybe 'scheduled' if today?)
        // For strict "Jornada Medica" mode, usually only In Progress.
        const { data } = await supabase
            .from('events')
            .select('id, title, location, scheduled_date')
            .eq('status', 'in_progress')
            .order('scheduled_date', { ascending: false });

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
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Gestión de Muestras</h1>
                    <p className="text-muted-foreground">Logística Integral: Maletín, Bancos y Eventos</p>
                </div>
            </div>

            <Tabs defaultValue="dashboard" className="w-full">
                <TabsList className={`grid w-full ${canAccessSupervisor ? 'grid-cols-4' : 'grid-cols-3'} lg:w-[600px]`}>
                    <TabsTrigger value="dashboard" className="gap-2"><LayoutDashboard className="h-4 w-4" /> Mi Maletín</TabsTrigger>
                    <TabsTrigger value="banks" className="gap-2"><Building2 className="h-4 w-4" /> Bancos</TabsTrigger>
                    <TabsTrigger value="events" className="gap-2"><Calendar className="h-4 w-4" /> Eventos</TabsTrigger>
                    {canAccessSupervisor && (
                        <TabsTrigger value="supervisor" className="gap-2"><Activity className="h-4 w-4" /> Supervisor</TabsTrigger>
                    )}
                </TabsList>

                <TabsContent value="dashboard" className="space-y-6 mt-6">
                    <Tabs defaultValue="stock" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                            <TabsTrigger value="stock" className="gap-2">
                                <LayoutDashboard className="h-4 w-4" />
                                Mi Stock
                            </TabsTrigger>
                            <TabsTrigger value="pending" className="gap-2">
                                <Inbox className="h-4 w-4" />
                                Solicitudes Pendientes
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="stock" className="space-y-6 mt-4">
                            <WarehouseReception onReceive={() => window.location.reload()} />
                            <InventoryDashboard />
                            <div className="mt-8">
                                <h3 className="text-lg font-medium mb-4">Detalle de Inventario</h3>
                                <RepInventoryView />
                            </div>
                        </TabsContent>

                        <TabsContent value="pending" className="mt-4">
                            <div className="mb-4">
                                <h3 className="text-lg font-medium">Asignaciones por Aceptar</h3>
                                <p className="text-sm text-muted-foreground">
                                    Revisa y acepta el stock asignado por tu supervisor antes de que aparezca en tu inventario.
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
                            <div className="bg-muted/50 p-4 rounded-lg">
                                <h3 className="font-semibold mb-2">Modo Jornada Médica</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Selecciona un evento <strong>En Progreso</strong> para habilitar la entrega rápida.
                                </p>

                                {loadingEvents ? (
                                    <p className="text-sm text-muted-foreground">Buscando eventos activos...</p>
                                ) : events.length === 0 ? (
                                    <div className="text-sm text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
                                        No tienes eventos marcados como "En Progreso" en este momento. Ve al módulo de <strong>Eventos</strong> y cambia el estado de tu jornada.
                                    </div>
                                ) : (
                                    <Select value={activeEventId} onValueChange={setActiveEventId}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Seleccionar Evento Activo..." />
                                        </SelectTrigger>
                                        <SelectContent>
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
                                <div className="border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                        <p className="text-green-800 dark:text-green-300 font-medium">Jornada Activa</p>
                                    </div>
                                    <p className="text-sm text-green-700 dark:text-green-400 ml-4">{activeEventTitle}</p>
                                </div>
                            )}

                            <InstructionCard
                                title="Instrucciones"
                                items={[
                                    "Solo puedes registrar entregas en eventos activos.",
                                    "Usa el formulario de la derecha para registros rápidos.",
                                    "Si te equivocas, puedes borrar el registro en la tabla inferior y el stock volverá a tu maletín."
                                ]}
                                className="mb-0"
                            />
                        </div>

                        <div>
                            <h3 className="font-semibold mb-4">Entrega Rápida</h3>
                            {activeEventId ? (
                                <EventTreatmentForm eventId={activeEventId} />
                            ) : (
                                <div className="flex items-center justify-center h-[200px] border border-dashed rounded-lg text-muted-foreground bg-muted/20">
                                    Selecciona un evento para comenzar
                                </div>
                            )}
                        </div>
                    </div>
                </TabsContent>

                {canAccessSupervisor && (
                    <TabsContent value="supervisor" className="mt-6 space-y-6">
                        <Tabs defaultValue="banks" className="w-full">
                            <TabsList>
                                <TabsTrigger value="banks">Bancos</TabsTrigger>
                                <TabsTrigger value="reps">Representantes</TabsTrigger>
                                <TabsTrigger value="assignment">Asignar Stock</TabsTrigger>
                                <TabsTrigger value="history">Historial</TabsTrigger>
                            </TabsList>
                            <TabsContent value="banks" className="mt-4">
                                <BankSupervisorDashboard />
                            </TabsContent>
                            <TabsContent value="reps" className="mt-4">
                                <RepSupervisorDashboard />
                            </TabsContent>
                            <TabsContent value="assignment" className="mt-4">
                                <StockAssignmentManager />
                            </TabsContent>
                            <TabsContent value="history" className="mt-4">
                                <AssignmentHistory />
                            </TabsContent>
                        </Tabs>
                    </TabsContent>
                )}
            </Tabs>
        </div>
    );
}
