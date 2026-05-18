/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

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
import { Loader2, Ticket, CheckCircle2, AlertCircle, Clock, Check, X, Search, Building2, RefreshCw, User, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TicketType {
    id: string;
    subject: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    status: 'open' | 'in_progress' | 'resolved' | 'closed';
    created_at: string;
    user_id: string;
    organization_id: string;
    resolution?: string;
    category?: string;
    attachment_url?: string;
    // Joined data
    organizations?: { name: string };
    profiles?: { email: string };
}

export default function TicketList() {
    const [tickets, setTickets] = useState<TicketType[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('support_tickets')
                .select(`
                    *,
                    organizations(name),
                    profiles:user_id(email)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setTickets(data as any[]);
        } catch (error) {
            console.error('Error fetching tickets:', error);
            toast({ title: "Error", description: "No se pudieron cargar los tickets", variant: "destructive" });
        } finally {
            setLoading(false);
        }
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
        <div className="flex flex-col h-full bg-background space-y-6 p-1">
            {/* Premium White Header Container */}
            <header className="bg-card px-10 md:px-12 py-8 rounded-elite-lg shadow-xl shadow-slate-200/50 dark:shadow-none border border-border relative overflow-hidden -mt-2 mx-1">
                {/* Decorative backgrounds */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-50 dark:bg-emerald-900/10 rounded-full blur-3xl opacity-60 text-slate-900"></div>
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-50 dark:bg-blue-900/10 rounded-full blur-3xl opacity-60 text-slate-900"></div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-none transform transition-transform hover:scale-105">
                            <Ticket className="text-white h-8 w-8" />
                        </div>
                        <div>
                            <p className="text-blue-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Centro de Ayuda</p>
                            <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
                                Soporte & Tickets
                            </h1>
                            <p className="text-muted-foreground text-sm mt-1">Gestión centralizada de incidencias y soporte técnico</p>
                        </div>
                    </div>

                    <Button
                        onClick={fetchTickets}
                        variant="outline"
                        className="h-12 px-6 rounded-2xl border-slate-200 bg-muted shadow-sm hover:shadow-md transition-all active:scale-95 text-slate-600 font-bold uppercase text-[10px] tracking-widest"
                    >
                        <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin text-blue-500' : ''}`} />
                        Sincronizar Tickets
                    </Button>
                </div>
            </header>

            <Card className="border-none shadow-2xl shadow-slate-200/50 dark:shadow-none bg-card rounded-[2rem] overflow-hidden mx-1">
                <CardHeader className="border-b border-border pb-6 pt-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-xl font-black text-foreground tracking-tight">Solicitudes Recientes</CardTitle>
                            <CardDescription className="text-muted-foreground font-medium">Bandeja de entrada de soporte consolidada</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {loading && tickets.length === 0 ? (
                        <div className="flex justify-center py-24">
                            <div className="flex flex-col items-center gap-4">
                                <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
                                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Cargando incidencias...</p>
                            </div>
                        </div>
                    ) : tickets.length === 0 ? (
                        <div className="text-center py-24 px-6">
                            <div className="bg-muted/50 w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                                <Ticket className="w-10 h-10 text-muted-foreground/30" />
                            </div>
                            <h3 className="text-lg font-black text-foreground">Sin tickets pendientes</h3>
                            <p className="text-muted-foreground mt-2 max-w-xs mx-auto">Todo parece funcionar correctamente en el sistema hoy.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-muted/50">
                                    <TableRow className="hover:bg-transparent border-none">
                                        <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 py-6 pl-8">Asunto / Incidencia</TableHead>
                                        <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 py-6">Solicitante (Org)</TableHead>
                                        <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 py-6">Prioridad</TableHead>
                                        <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 py-6">Estado</TableHead>
                                        <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 py-6">Fecha</TableHead>
                                        <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 py-6 text-right pr-8">Gestión</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {tickets.map((ticket) => (
                                        <TableRow
                                            key={ticket.id}
                                            className="border-b border-border hover:bg-muted/10 transition-all cursor-pointer group"
                                            onClick={() => openTicketDialog(ticket)}
                                        >
                                            <TableCell className="pl-8 py-5">
                                                <div className="flex flex-col gap-1">
                                                    <span className="font-bold text-foreground group-hover:text-blue-600 transition-colors">{ticket.subject}</span>
                                                    <span className="text-[10px] text-muted-foreground font-medium truncate max-w-[280px]">{ticket.description}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-5">
                                                <div className="flex flex-col gap-1">
                                                    <div className="text-xs font-black text-foreground uppercase tracking-tighter">{ticket.organizations?.name || 'Sistema'}</div>
                                                    <div className="text-[10px] font-bold text-muted-foreground">{ticket.profiles?.email}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-5">
                                                <Badge variant="outline" className={`text-[10px] font-bold border-none px-2.5 py-0.5 uppercase tracking-wider ${getPriorityColor(ticket.priority)}`}>
                                                    {ticket.priority}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="py-5">
                                                <div className="flex items-center gap-2 capitalize text-[11px] font-black text-muted-foreground tracking-tight">
                                                    {getStatusIcon(ticket.status)}
                                                    {ticket.status.replace('_', ' ')}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-sm font-black tabular-nums py-5 lowercase tracking-tighter">
                                                {new Date(ticket.created_at).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-right pr-8 py-5">
                                                <Button size="icon" variant="ghost" className="h-10 w-10 rounded-xl text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                                                    <Search className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
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
                            <h4 className="text-sm font-medium text-slate-400">Solicitante</h4>
                            <div className="text-sm text-slate-200 bg-slate-800/50 p-2 rounded-md border border-slate-700/50">
                                <span className="font-bold">{selectedTicket?.organizations?.name || 'Sin Org'}</span>
                                <span className="mx-2 text-slate-500">|</span>
                                <span className="text-slate-400">{selectedTicket?.profiles?.email}</span>
                            </div>
                        </div>

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
