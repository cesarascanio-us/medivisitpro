import { useState, useEffect } from "react";
import { Plus, Calendar, Users, MapPin, Clock, Search, Edit, Trash2, DollarSign, MoreVertical, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useDemoData } from "@/contexts/MockDataProvider";
import { useToast } from "@/hooks/use-toast";
import { EventCreationWizard } from "@/components/events/EventCreationWizard";
import { EventResultForm } from "@/components/events/EventResultForm";

interface Event {
    id: string;
    user_id: string;
    title: string;
    description: string | null;
    event_type: string;
    location: string | null;
    scheduled_date: string;
    end_date: string | null;
    status: string;
    attendees_count: number;
    notes: string | null;
    investment?: number;
    per_diem?: number;
    contact_id?: string;
    profiles?: {
        first_name: string;
        last_name: string;
    };
}

export default function Events() {
    const { user, isManager, isSupervisor, isMaster, organizationId, isRepresentative } = useAuth();
    const { toast } = useToast();
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const demoData = useDemoData();

    // Roles que pueden aprobar
    const canApprove = isManager || isSupervisor || isMaster;

    // Wizard State
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const [eventToEdit, setEventToEdit] = useState<Event | null>(null);

    // Result Form State
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [isResultFormOpen, setIsResultFormOpen] = useState(false);

    useEffect(() => {
        if (user || demoData) loadEvents();
    }, [user, demoData, organizationId]);

    const loadEvents = async () => {
        try {
            setLoading(true);

            if (demoData) {
                setEvents(demoData.events || []);
                return;
            }

            let query = supabase
                .from('events')
                .select('*, profiles(first_name, last_name)')
                .order('scheduled_date', { ascending: true });

            if (isRepresentative) {
                // Solo ve sus propios eventos
                query = query.eq('user_id', user?.id);
            } else if (canApprove && organizationId) {
                // Obtener todos los representantes de la organización
                const { data: teamRoles } = await supabase
                    .from('user_roles_plain')
                    .select('user_id')
                    .eq('organization_id', organizationId);
                
                if (teamRoles && teamRoles.length > 0) {
                    const userIds = teamRoles.map(r => r.user_id);
                    query = query.in('user_id', userIds);
                } else {
                    query = query.eq('user_id', user?.id);
                }
            } else {
                query = query.eq('user_id', user?.id);
            }

            const { data, error } = await query;

            if (error) throw error;
            setEvents(data || []);
        } catch (error) {
            console.error('Error loading events:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteEvent = async (id: string) => {
        if (!window.confirm("¿Estás seguro de que deseas eliminar este evento? Esta acción no se puede deshacer.")) return;
        try {
            const { error } = await supabase.from('events').delete().eq('id', id);
            if (error) throw error;
            toast({ title: "Evento eliminado exitosamente" });
            loadEvents();
        } catch (error) {
            toast({ variant: "destructive", title: "Error al eliminar el evento" });
        }
    };

    const handleUpdateStatus = async (id: string, newStatus: string) => {
        try {
            const { error } = await supabase.from('events').update({ status: newStatus }).eq('id', id);
            if (error) throw error;
            toast({ title: "Estado del evento actualizado" });
            loadEvents();
        } catch (error) {
            toast({ variant: "destructive", title: "Error al actualizar estado" });
        }
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            pending_approval: "bg-orange-100 text-orange-800 border-orange-200",
            scheduled: "bg-blue-100 text-blue-800 border-blue-200",
            in_progress: "bg-yellow-100 text-yellow-800 border-yellow-200",
            completed: "bg-green-100 text-green-800 border-green-200",
            rejected: "bg-red-100 text-red-800 border-red-200",
            cancelled: "bg-gray-100 text-gray-800 border-gray-200"
        };
        const labels: Record<string, string> = {
            pending_approval: "Pendiente Aprobación",
            scheduled: "Programado",
            in_progress: "En Progreso",
            completed: "Completado",
            rejected: "Rechazado",
            cancelled: "Cancelado"
        };
        return <Badge variant="outline" className={styles[status] || "bg-muted"}>{labels[status] || status}</Badge>;
    };

    const getEventTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            presentation: "Presentación",
            conference: "Conferencia",
            training: "Capacitación",
            jornada: "Jornada Médica",
            operative: "Operativo Médico",
            product_day: "Día Producto",
            anniversary: "Aniversario",
            inauguration: "Inauguración",
            other: "Otro"
        };
        return labels[type] || type;
    };

    const filteredEvents = events.filter(e =>
        e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.location?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const pendingEvents = filteredEvents.filter(e => e.status === 'pending_approval');
    const upcomingEvents = filteredEvents.filter(e => e.status === 'scheduled' || e.status === 'in_progress');
    const historyEvents = filteredEvents.filter(e => e.status === 'completed' || e.status === 'cancelled' || e.status === 'rejected');

    const renderEventCard = (event: Event) => (
        <Card key={event.id} className="medical-card hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                    <div className="pr-4">
                        <CardTitle className="text-lg">{event.title}</CardTitle>
                        <Badge variant="outline" className="mt-1">{getEventTypeLabel(event.event_type)}</Badge>
                        {canApprove && event.profiles && (
                            <div className="text-xs text-muted-foreground mt-1">
                                Rep: {event.profiles.first_name} {event.profiles.last_name}
                            </div>
                        )}
                    </div>
                    <div className="flex items-center space-x-2">
                        {getStatusBadge(event.status)}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => {
                                    setEventToEdit(event);
                                    setIsWizardOpen(true);
                                }}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Editar / Ver Detalles
                                </DropdownMenuItem>
                                {canApprove && event.status === 'pending_approval' && (
                                    <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem className="text-green-600" onClick={() => handleUpdateStatus(event.id, 'scheduled')}>
                                            <CheckCircle className="mr-2 h-4 w-4" />
                                            Aprobar Evento
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="text-red-600" onClick={() => handleUpdateStatus(event.id, 'rejected')}>
                                            <XCircle className="mr-2 h-4 w-4" />
                                            Rechazar Evento
                                        </DropdownMenuItem>
                                    </>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteEvent(event.id)}>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Eliminar
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="mr-2 h-4 w-4" />
                    {new Date(event.scheduled_date).toLocaleDateString('es-ES', {
                        weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                    })}
                    {event.end_date && ` - ${new Date(event.end_date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`}
                </div>
                {event.location && (
                    <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="mr-2 h-4 w-4" />
                        {event.location}
                    </div>
                )}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center">
                        <Users className="mr-2 h-4 w-4" />
                        {event.attendees_count} asistentes
                    </div>
                    <div className="flex items-center font-medium">
                        <DollarSign className="mr-1 h-4 w-4" />
                        Inv: ${event.investment || 0} / Viáticos: ${event.per_diem || 0}
                    </div>
                </div>
                {event.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
                )}

                {canApprove && event.status === 'pending_approval' && (
                    <div className="flex gap-2 mt-4">
                        <Button 
                            variant="default" 
                            className="w-full bg-green-600 hover:bg-green-700" 
                            onClick={() => handleUpdateStatus(event.id, 'scheduled')}
                        >
                            <CheckCircle className="mr-2 h-4 w-4" /> Aprobar
                        </Button>
                        <Button 
                            variant="destructive" 
                            className="w-full" 
                            onClick={() => handleUpdateStatus(event.id, 'rejected')}
                        >
                            <XCircle className="mr-2 h-4 w-4" /> Rechazar
                        </Button>
                    </div>
                )}

                {event.status === 'scheduled' && (
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-2"
                        onClick={() => {
                            setSelectedEvent(event);
                            setIsResultFormOpen(true);
                        }}
                    >
                        Registrar Resultados (ROI)
                    </Button>
                )}
            </CardContent>
        </Card>
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Eventos y Presentaciones</h1>
                    <p className="text-muted-foreground">Gestiona tus presentaciones médicas y eventos</p>
                </div>

                <Button className="btn-medical" onClick={() => {
                    setEventToEdit(null);
                    setIsWizardOpen(true);
                }}>
                    <Plus className="mr-2 h-4 w-4" /> Nuevo Evento
                </Button>

                <EventCreationWizard
                    open={isWizardOpen}
                    onOpenChange={setIsWizardOpen}
                    onSuccess={loadEvents}
                    eventToEdit={eventToEdit}
                />

                {selectedEvent && (
                    <EventResultForm
                        eventId={selectedEvent.id}
                        eventTitle={selectedEvent.title}
                        open={isResultFormOpen}
                        onOpenChange={setIsResultFormOpen}
                        onSuccess={loadEvents}
                    />
                )}
            </div>

            <div className="flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar eventos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {loading ? (
                <div className="text-center py-12 text-muted-foreground">Cargando eventos...</div>
            ) : (
                <Tabs defaultValue="pending" className="w-full">
                    <TabsList className="mb-4">
                        <TabsTrigger value="pending">
                            Pendientes ({pendingEvents.length})
                        </TabsTrigger>
                        <TabsTrigger value="upcoming">
                            Próximos Aprobados ({upcomingEvents.length})
                        </TabsTrigger>
                        <TabsTrigger value="history">
                            Historial ({historyEvents.length})
                        </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="pending">
                        {pendingEvents.length === 0 ? (
                            <Card className="medical-card">
                                <CardContent className="text-center py-12">
                                    <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-medium mb-2">No hay eventos pendientes</h3>
                                    <p className="text-muted-foreground mb-4">Todo está al día</p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {pendingEvents.map(renderEventCard)}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="upcoming">
                        {upcomingEvents.length === 0 ? (
                            <Card className="medical-card">
                                <CardContent className="text-center py-12">
                                    <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-medium mb-2">No hay eventos próximos</h3>
                                    <p className="text-muted-foreground mb-4">Crea tu primer evento o presentación médica</p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {upcomingEvents.map(renderEventCard)}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="history">
                        {historyEvents.length === 0 ? (
                            <Card className="medical-card">
                                <CardContent className="text-center py-12">
                                    <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-medium mb-2">No hay historial</h3>
                                    <p className="text-muted-foreground mb-4">Los eventos completados o cancelados aparecerán aquí</p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {historyEvents.map(renderEventCard)}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            )}
        </div>
    );
}
