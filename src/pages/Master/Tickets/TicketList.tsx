import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Ticket, CheckCircle2, AlertCircle, Clock, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TicketType {
    id: string;
    subject: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    status: 'open' | 'in_progress' | 'resolved' | 'closed';
    created_at: string;
    user_id: string; // Ideally join with profiles to get name
    organization_id: string; // Join with orgs
    resolution?: string; // New field
    category?: string; // New field
    attachment_url?: string; // New field
}

export default function TicketList() {
    const [tickets, setTickets] = useState<TicketType[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const fetchTickets = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('support_tickets')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching tickets:', error);
        } else {
            setTickets(data as TicketType[]);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    const resolveTicket = async (id: string) => {
        const { error } = await supabase
            .from('support_tickets')
            .update({ status: 'resolved' })
            .eq('id', id);

        if (error) {
            toast({ title: 'Error', description: 'No se pudo resolver el ticket.', variant: 'destructive' });
        } else {
            setTickets(tickets.map(t => t.id === id ? { ...t, status: 'resolved' } : t));
            toast({ title: 'Resuelto', description: 'Ticket marcado como resuelto.' });
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'critical': return 'bg-red-500/20 text-red-500 border-red-500/30';
            case 'high': return 'bg-orange-500/20 text-orange-500 border-orange-500/30';
            case 'medium': return 'bg-blue-500/20 text-blue-500 border-blue-500/30';
            default: return 'bg-slate-500/20 text-slate-500 border-slate-500/30';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'resolved': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
            case 'closed': return <CheckCircle2 className="w-4 h-4 text-slate-500" />;
            case 'in_progress': return <Clock className="w-4 h-4 text-blue-500" />;
            default: return <AlertCircle className="w-4 h-4 text-amber-500" />;
        }
    };

    const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null);
    const [resolutionText, setResolutionText] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const openTicketDialog = (ticket: TicketType) => {
        setSelectedTicket(ticket);
        setResolutionText(ticket.resolution || "");
        setIsDialogOpen(true);
    };

    const handleResolve = async () => {
        if (!selectedTicket) return;

        const { error } = await supabase
            .from('support_tickets')
            .update({
                status: 'resolved',
                resolution: resolutionText
            })
            .eq('id', selectedTicket.id);

        if (error) {
            toast({ title: 'Error', description: 'No se pudo resolver el ticket.', variant: 'destructive' });
        } else {
            setTickets(tickets.map(t => t.id === selectedTicket.id ? { ...t, status: 'resolved', resolution: resolutionText } : t));
            toast({ title: 'Resuelto', description: 'Ticket respondido y cerrado correctamente.' });
            setIsDialogOpen(false);
        }
    };

    return (
        <div className="p-6 space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
                        <Ticket className="w-8 h-8 text-emerald-500" />
                        Soporte & Tickets
                    </h1>
                    <p className="text-slate-400 mt-1">Gestiona las incidencias de los clientes.</p>
                </div>
                <Button onClick={fetchTickets} variant="outline" className="border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800">
                    Actualizar
                </Button>
            </div>

            <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="text-xl text-white">Tickets Recientes</CardTitle>
                    <CardDescription className="text-slate-400">Listado de solicitudes de soporte</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                        </div>
                    ) : tickets.length === 0 ? (
                        <div className="text-center py-12">
                            <Ticket className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-slate-300">No hay tickets pendientes</h3>
                            <p className="text-slate-500 mt-1">Todo parece funcionar correctamente.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="border-slate-800 hover:bg-transparent">
                                    <TableHead className="text-slate-400">Asunto</TableHead>
                                    <TableHead className="text-slate-400">Prioridad</TableHead>
                                    <TableHead className="text-slate-400">Estado</TableHead>
                                    <TableHead className="text-slate-400">Fecha</TableHead>
                                    <TableHead className="text-slate-400 text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {tickets.map((ticket) => (
                                    <TableRow key={ticket.id} className="border-slate-800 hover:bg-slate-800/50 cursor-pointer" onClick={() => openTicketDialog(ticket)}>
                                        <TableCell className="font-medium text-white">
                                            {ticket.subject}
                                            <div className="text-xs text-slate-500 truncate max-w-[300px]">{ticket.description}</div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={`${getPriorityColor(ticket.priority)} capitalize`}>
                                                {ticket.priority}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 capitalize text-sm text-slate-300">
                                                {getStatusIcon(ticket.status)}
                                                {ticket.status.replace('_', ' ')}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-slate-400 text-sm">
                                            {new Date(ticket.created_at).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                                <span className="sr-only">Ver</span>
                                                <Ticket className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Ticket Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[500px] bg-slate-900 border-slate-700 text-white">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            <Ticket className="w-5 h-5 text-emerald-500" />
                            {selectedTicket?.subject}
                        </DialogTitle>
                        <div className="flex gap-2 mt-2">
                            <Badge variant="outline" className={`${selectedTicket ? getPriorityColor(selectedTicket.priority) : ''} capitalize`}>{selectedTicket?.priority}</Badge>
                            <Badge variant="secondary">{selectedTicket?.category}</Badge>
                        </div>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-1">
                            <h4 className="text-sm font-medium text-slate-400">Descripción</h4>
                            <p className="text-sm text-slate-200 bg-slate-800/50 p-3 rounded-md border border-slate-700/50">
                                {selectedTicket?.description}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-slate-200">Estado</Label>
                                <Select
                                    value={selectedTicket?.status}
                                    onValueChange={async (value: any) => {
                                        if (!selectedTicket) return;
                                        // Update local state immediately for responsiveness
                                        const updatedTicket = { ...selectedTicket, status: value };
                                        setSelectedTicket(updatedTicket);
                                        setTickets(tickets.map(t => t.id === selectedTicket.id ? updatedTicket : t));

                                        // Persist to DB
                                        const { error } = await supabase.from('support_tickets').update({ status: value }).eq('id', selectedTicket.id);
                                        if (error) {
                                            toast({ title: 'Error', description: 'No se pudo actualizar el estado', variant: 'destructive' });
                                            // Revert on error (could be improved)
                                        } else {
                                            toast({ title: 'Actualizado', description: `Estado cambiado a ${value}` });
                                        }
                                    }}
                                >
                                    <SelectTrigger className="bg-slate-950 border-slate-700 text-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="open">Abierto</SelectItem>
                                        <SelectItem value="in_progress">En Proceso</SelectItem>
                                        <SelectItem value="resolved">Resuelto</SelectItem>
                                        <SelectItem value="closed">Cerrado</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {selectedTicket?.attachment_url && (
                            <div className="space-y-2">
                                <Label className="text-slate-200">Adjunto</Label>
                                <div className="rounded-lg border border-slate-700 overflow-hidden bg-slate-950/50">
                                    <a href={selectedTicket.attachment_url} target="_blank" rel="noopener noreferrer">
                                        <img
                                            src={selectedTicket.attachment_url}
                                            alt="Captura del problema"
                                            className="w-full h-auto max-h-[300px] object-contain hover:opacity-90 transition-opacity cursor-pointer"
                                        />
                                    </a>
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="resolution" className="text-slate-200">Respuesta / Resolución</Label>
                            <Textarea
                                id="resolution"
                                placeholder="Escribe la solución o respuesta al usuario..."
                                className="bg-slate-950 border-slate-700 text-white min-h-[100px]"
                                value={resolutionText}
                                onChange={(e) => setResolutionText(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="hover:bg-slate-800 text-slate-400 hover:text-white">Cancelar</Button>
                        <Button
                            onClick={handleResolve}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                            disabled={selectedTicket?.status === 'resolved'}
                        >
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            {selectedTicket?.status === 'resolved' ? 'Resuelto' : 'Responder y Resolver'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
