import { useState, useEffect } from "react";
import { Plus, Calendar, Users, MapPin, Clock, MoreVertical, Search, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useDemoData } from "@/contexts/MockDataProvider";
import { useToast } from "@/hooks/use-toast";
import { EventCreationWizard } from "@/components/events/EventCreationWizard";
import { EventResultForm } from "@/components/events/EventResultForm";

interface Event {
    id: string;
    title: string;
    description: string | null;
    event_type: string;
    location: string | null;
    scheduled_date: string;
    end_date: string | null;
    status: string;
    attendees_count: number;
    notes: string | null;
}

export default function Events() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const demoData = useDemoData();

    // Wizard State
    const [isWizardOpen, setIsWizardOpen] = useState(false);

    // Result Form State
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [isResultFormOpen, setIsResultFormOpen] = useState(false);

    useEffect(() => {
        if (user || demoData) loadEvents();
    }, [user, demoData]);

    const loadEvents = async () => {
        try {
            setLoading(true);

            if (demoData) {
                console.log("Events: Loading demo events");
                setEvents(demoData.events || []);
                return;
            }

            const { data, error } = await supabase
                .from('events')
                .select('*')
                .order('scheduled_date', { ascending: true });

            if (error) throw error;
            setEvents(data || []);
        } catch (error) {
            console.error('Error loading events:', error);
        } finally {
            setLoading(false);
        }
    };

    // Old handleSubmit removed. Wizard handles creation.

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            scheduled: "bg-blue-100 text-blue-800",
            in_progress: "bg-yellow-100 text-yellow-800",
            completed: "bg-green-100 text-green-800",
            cancelled: "bg-red-100 text-red-800"
        };
        const labels: Record<string, string> = {
            scheduled: "Programado",
            in_progress: "En Progreso",
            completed: "Completado",
            cancelled: "Cancelado"
        };
        return <Badge className={styles[status] || "bg-gray-100"}>{labels[status] || status}</Badge>;
    };

    const getEventTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            presentation: "Presentación",
            conference: "Conferencia",
            training: "Capacitación",
            jornada: "Jornada Médica",
            operative: "Operativo Médico",
            other: "Otro"
        };
        return labels[type] || type;
    };

    const filteredEvents = events.filter(e =>
        e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.location?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Eventos y Presentaciones</h1>
                    <p className="text-muted-foreground">Gestiona tus presentaciones médicas y eventos</p>
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Eventos y Presentaciones</h1>
                    <p className="text-muted-foreground">Gestiona tus presentaciones médicas y eventos</p>
                </div>

                <Button className="btn-medical" onClick={() => setIsWizardOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Nuevo Evento
                </Button>

                <EventCreationWizard
                    open={isWizardOpen}
                    onOpenChange={setIsWizardOpen}
                    onSuccess={loadEvents}
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
            ) : filteredEvents.length === 0 ? (
                <Card className="medical-card">
                    <CardContent className="text-center py-12">
                        <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">No hay eventos</h3>
                        <p className="text-muted-foreground mb-4">Crea tu primer evento o presentación médica</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredEvents.map((event) => (
                        <Card key={event.id} className="medical-card hover:shadow-lg transition-shadow">
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-lg">{event.title}</CardTitle>
                                        <Badge variant="outline" className="mt-1">{getEventTypeLabel(event.event_type)}</Badge>
                                    </div>
                                    {getStatusBadge(event.status)}
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <Clock className="mr-2 h-4 w-4" />
                                    {new Date(event.scheduled_date).toLocaleDateString('es-ES', {
                                        weekday: 'short',
                                        day: 'numeric',
                                        month: 'short',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </div>
                                {event.location && (
                                    <div className="flex items-center text-sm text-muted-foreground">
                                        <MapPin className="mr-2 h-4 w-4" />
                                        {event.location}
                                    </div>
                                )}
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <Users className="mr-2 h-4 w-4" />
                                    {event.attendees_count} asistentes esperados
                                </div>
                                {event.description && (
                                    <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
                                )}

                                {event.status !== 'completed' && (
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
                    ))}
                </div>
            )}
        </div>
    );
}
