/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
    HelpCircle, Search, BookOpen, Video, MessageCircle, Ticket,
    Download, ChevronDown, ChevronUp, Clock, CheckCircle, AlertCircle,
    Phone, Mail, MessageSquare, Send, FileText, Plus, Upload
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useTexts } from "@/hooks/useTexts";
import { EliteHeader, EliteKPICard, EliteCard, EliteButton, EliteInput, EliteTabsList, EliteTabsTrigger } from "@/components/layout/DesignSystem";

interface FAQ {
    id: string;
    category: string;
    question: string;
    answer: string;
}

interface Tutorial {
    id: string;
    title: string;
    description: string;
    duration: string;
    level: 'basico' | 'intermedio' | 'avanzado';
    videoUrl?: string;
}

interface SupportTicket {
    id: string;
    subject: string;
    description: string;
    category: string;
    priority: string;
    status: string;
    created_at: string;
    resolution?: string;
    attachment_url?: string;
}

const faqs: FAQ[] = [
    { id: '1', category: 'general', question: '¿Cómo empiezo a usar MedVisit Pro?', answer: 'Después de registrarte, completa tu perfil en Configuración, luego comienza añadiendo tus contactos médicos. Desde ahí puedes programar visitas y gestionar tu agenda.' },
    { id: '2', category: 'general', question: '¿Puedo usar la aplicación sin internet?', answer: 'Sí, MedVisit Pro tiene modo offline. Los datos se sincronizarán automáticamente cuando recuperes la conexión. Activa esta opción en Configuración > Sistema.' },
    { id: '3', category: 'visitas', question: '¿Cómo registro una nueva visita?', answer: 'Ve a Visitas > Nueva Visita, selecciona el contacto, fecha y hora. Puedes agregar productos a presentar, notas previas y objetivos específicos.' },
    { id: '4', category: 'visitas', question: '¿Cómo cancelo o reprogramo una visita?', answer: 'En la agenda, haz clic en la visita y selecciona "Editar" o "Cancelar". Si cancelas, puedes añadir un motivo para tu registro.' },
    { id: '5', category: 'muestras', question: '¿Cómo controlo mi inventario de muestras?', answer: 'En el módulo de Muestras puedes ver tu stock actual, registrar entregas y recibir alertas cuando algún producto esté por vencer o con stock bajo.' },
    { id: '6', category: 'muestras', question: '¿Cómo registro la entrega de muestras?', answer: 'Durante o después de una visita, ve a Muestras > Registrar Entrega, selecciona el producto, cantidad y el médico que las recibió.' },
    { id: '7', category: 'reportes', question: '¿Qué tipo de reportes puedo generar?', answer: 'Puedes generar reportes de visitas realizadas, objetivos cumplidos, muestras distribuidas, gastos y productividad. Todos exportables a PDF o Excel.' },
    { id: '8', category: 'reportes', question: '¿Cómo exporto mis datos?', answer: 'En cada módulo hay un botón de exportar. También puedes ir a Reportes para generar exportaciones consolidadas de varios períodos.' },
    { id: '9', category: 'gastos', question: '¿Cómo registro un gasto?', answer: 'Ve a Gastos > Nuevo Gasto, selecciona la categoría (transporte, comidas, etc.), monto y puedes adjuntar una foto del recibo.' },
    { id: '10', category: 'gastos', question: '¿Cuándo se aprueban mis gastos?', answer: 'Los gastos son revisados por tu supervisor. Recibirás una notificación cuando sean aprobados o si necesitan corrección.' },
];

const tutorials: Tutorial[] = [
    { id: '1', title: 'Primeros pasos en MedVisit Pro', description: 'Aprende a configurar tu cuenta y navegar por la aplicación', duration: '5 min', level: 'basico' },
    { id: '2', title: 'Gestión efectiva de contactos', description: 'Cómo organizar y segmentar tu cartera de médicos', duration: '8 min', level: 'basico' },
    { id: '3', title: 'Programación optimizada de visitas', description: 'Estrategias para maximizar tus rutas diarias', duration: '10 min', level: 'intermedio' },
    { id: '4', title: 'Control de muestras médicas', description: 'Gestión de inventario y distribución de muestras', duration: '7 min', level: 'intermedio' },
    { id: '5', title: 'Análisis de rendimiento', description: 'Interpreta tus métricas y mejora tus resultados', duration: '12 min', level: 'avanzado' },
    { id: '6', title: 'Reportes y exportaciones', description: 'Genera reportes profesionales para tu empresa', duration: '6 min', level: 'avanzado' },
];

const downloads = [
    { name: 'Manual de Usuario', description: 'Guía completa de todas las funcionalidades', format: 'PDF', size: '2.5 MB' },
    { name: 'Guía Rápida', description: 'Referencia rápida de acciones comunes', format: 'PDF', size: '500 KB' },
    { name: 'Plantilla de Importación', description: 'Excel para importar contactos masivamente', format: 'XLSX', size: '45 KB' },
    { name: 'FAQ Offline', description: 'Preguntas frecuentes para consulta sin internet', format: 'PDF', size: '300 KB' },
];

const LEVEL_COLORS = {
    basico: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-3 py-1 font-bold rounded-lg',
    intermedio: 'bg-amber-500/10 text-amber-500 border border-amber-500/20 px-3 py-1 font-bold rounded-lg',
    avanzado: 'bg-rose-500/10 text-rose-500 border border-rose-500/20 px-3 py-1 font-bold rounded-lg'
};

const STATUS_CONFIG = {
    open: { label: 'Abierto', color: 'bg-blue-500/10 text-blue-500 border border-blue-500/20 px-3 py-1 font-bold rounded-lg', icon: Clock },
    in_progress: { label: 'En Proceso', color: 'bg-amber-500/10 text-amber-500 border border-amber-500/20 px-3 py-1 font-bold rounded-lg', icon: AlertCircle },
    resolved: { label: 'Resuelto', color: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-3 py-1 font-bold rounded-lg', icon: CheckCircle },
    closed: { label: 'Cerrado', color: 'bg-muted/30 text-muted-foreground border border-border/40 px-3 py-1 font-bold rounded-lg', icon: CheckCircle },
};

export default function Help() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState("faq");
    const [searchQuery, setSearchQuery] = useState("");
    const [faqCategory, setFaqCategory] = useState("all");
    const [openFaqs, setOpenFaqs] = useState<string[]>([]);
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [ticketDialogOpen, setTicketDialogOpen] = useState(false);
    const [newTicket, setNewTicket] = useState({ subject: '', description: '', category: 'general', priority: 'medium' });
    const t = useTexts();

    useEffect(() => {
        if (user) {
            loadTickets();
        }
    }, [user]);

    const loadTickets = async () => {
        const { data } = await supabase
            .from('support_tickets')
            .select('*')
            .eq('user_id', user?.id)
            .order('created_at', { ascending: false });
        setTickets(data || []);
    };

    const toggleFaq = (id: string) => {
        setOpenFaqs(prev =>
            prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
        );
    };

    const filteredFaqs = faqs.filter(faq => {
        const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = faqCategory === 'all' || faq.category === faqCategory;
        return matchesSearch && matchesCategory;
    });

    const [ticketFile, setTicketFile] = useState<File | null>(null);

    const handleCreateTicket = async () => {
        if (!newTicket.subject.trim() || !newTicket.description.trim()) {
            toast({ title: "Error", description: "Completa todos los campos", variant: "destructive" });
            return;
        }

        try {
            let attachmentUrl = null;
            if (ticketFile) {
                const fileExt = ticketFile.name.split('.').pop();
                const fileName = `${Math.random()}.${fileExt}`;
                const filePath = `${user?.id}/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('ticket-attachments')
                    .upload(filePath, ticketFile, {
                        cacheControl: '3600',
                        upsert: false
                    });

                if (uploadError) {
                    console.error('Upload Error:', uploadError);
                    throw new Error("Error al subir la imagen");
                }

                const { data: { publicUrl } } = supabase.storage
                    .from('ticket-attachments')
                    .getPublicUrl(filePath);

                attachmentUrl = publicUrl;
            }

            const { error } = await supabase.from('support_tickets').insert({
                user_id: user?.id,
                subject: newTicket.subject,
                description: newTicket.description,
                category: newTicket.category,
                priority: newTicket.priority,
                status: 'open',
                attachment_url: attachmentUrl
            });

            if (error) throw error;
            toast({ title: "Ticket creado", description: "Recibirás una respuesta pronto." });
            setNewTicket({ subject: '', description: '', category: 'general', priority: 'medium' });
            setTicketFile(null); // Reset file
            setTicketDialogOpen(false);
            loadTickets();
        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "No se pudo crear el ticket. Verifica que la imagen sea válida.", variant: "destructive" });
        }
    };

    return (
        <div className="flex flex-col min-h-full space-y-10 font-sans transition-colors duration-500 text-foreground pb-20 animate-in fade-in duration-700">
            <EliteHeader
                title={t.help_title || "Centro de Ayuda"}
                subtitle={t.help_subtitle || "Encuentra respuestas, tutoriales y soporte corporativo"}
                icon={HelpCircle}
                badgeText="Ayuda & FAQ"
                statusText="Soporte Activo"
            />

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <EliteTabsList className="mb-6">
                    <EliteTabsTrigger value="faq" label="FAQ" icon={BookOpen} />
                    <EliteTabsTrigger value="tutorials" label="Tutoriales" icon={Video} />
                    <EliteTabsTrigger value="contact" label="Contacto" icon={MessageCircle} />
                    <EliteTabsTrigger value="tickets" label="Tickets" icon={Ticket} />
                    <EliteTabsTrigger value="downloads" label="Descargas" icon={Download} />
                </EliteTabsList>

                {/* FAQ Tab */}
                <TabsContent value="faq" className="animate-in fade-in slide-in-from-bottom-5 duration-700">
                    <EliteCard className="p-6">
                        <CardHeader className="px-0 pt-0">
                            <CardTitle className="text-xl font-black text-foreground">Preguntas Frecuentes</CardTitle>
                            <CardDescription className="text-sm text-muted-foreground">Respuestas a las consultas más comunes</CardDescription>
                            <div className="flex flex-col sm:flex-row gap-4 mt-6">
                                <div className="flex-1 relative w-full group">
                                    <EliteInput
                                        icon={Search}
                                        placeholder="Buscar en FAQ..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <Select value={faqCategory} onValueChange={setFaqCategory}>
                                    <SelectTrigger className="w-full sm:w-48 h-14 bg-background/50 border-border/40 rounded-2xl shadow-inner font-bold text-foreground">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl border-none shadow-2xl">
                                        <SelectItem value="all" className="font-bold">Todas</SelectItem>
                                        <SelectItem value="general" className="font-bold">General</SelectItem>
                                        <SelectItem value="visitas" className="font-bold">Visitas</SelectItem>
                                        <SelectItem value="muestras" className="font-bold">Muestras</SelectItem>
                                        <SelectItem value="reportes" className="font-bold">Reportes</SelectItem>
                                        <SelectItem value="gastos" className="font-bold">Gastos</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4 px-0 pb-0">
                            {filteredFaqs.length === 0 ? (
                                <p className="text-center text-muted-foreground py-8">No se encontraron resultados</p>
                            ) : (
                                filteredFaqs.map(faq => (
                                    <Collapsible key={faq.id} open={openFaqs.includes(faq.id)} className="border border-border/40 rounded-2xl overflow-hidden bg-muted/10">
                                        <CollapsibleTrigger
                                            className="flex items-center justify-between w-full p-6 hover:bg-muted/20 transition-colors"
                                            onClick={() => toggleFaq(faq.id)}
                                        >
                                            <div className="flex items-center gap-4">
                                                <Badge variant="secondary" className="bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest px-3 py-1 border-none">{faq.category}</Badge>
                                                <span className="font-bold text-left text-sm text-foreground">{faq.question}</span>
                                            </div>
                                            {openFaqs.includes(faq.id) ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                                        </CollapsibleTrigger>
                                        <CollapsibleContent className="px-6 py-4 text-muted-foreground text-sm font-semibold border-t border-border/40 bg-card/30">
                                            {faq.answer}
                                        </CollapsibleContent>
                                    </Collapsible>
                                ))
                            )}
                        </CardContent>
                    </EliteCard>
                </TabsContent>

                {/* Tutorials Tab */}
                <TabsContent value="tutorials" className="animate-in fade-in slide-in-from-bottom-5 duration-700">
                    <EliteCard className="p-6">
                        <CardHeader className="px-0 pt-0 mb-6">
                            <CardTitle className="text-xl font-black text-foreground">Video Tutoriales</CardTitle>
                            <CardDescription className="text-sm text-muted-foreground">Aprende a sacar el máximo provecho de la aplicación</CardDescription>
                        </CardHeader>
                        <CardContent className="px-0 pb-0">
                            <div className="grid md:grid-cols-2 gap-6">
                                {tutorials.map(tutorial => (
                                    <div key={tutorial.id} className="border border-border/40 rounded-2xl p-6 hover:shadow-premium-sm bg-muted/10 hover:bg-muted/20 transition-all group flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-start justify-between mb-4">
                                                <h3 className="font-black text-foreground text-base group-hover:text-primary transition-colors">{tutorial.title}</h3>
                                                <Badge className={cn("border-none text-[9px] uppercase tracking-widest", LEVEL_COLORS[tutorial.level])}>
                                                    {tutorial.level}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground mb-6 font-semibold">{tutorial.description}</p>
                                        </div>
                                        <div className="flex items-center justify-between mt-auto">
                                            <span className="text-xs text-muted-foreground flex items-center gap-1.5 font-bold">
                                                <Clock className="h-4 w-4 text-primary" />
                                                {tutorial.duration}
                                            </span>
                                            <EliteButton size="sm" variant="secondary" className="px-4">
                                                <Video className="h-4 w-4 mr-2" />
                                                Ver Tutorial
                                            </EliteButton>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </EliteCard>
                </TabsContent>

                {/* Contact Tab */}
                <TabsContent value="contact" className="animate-in fade-in slide-in-from-bottom-5 duration-700">
                    <EliteCard className="p-6">
                        <CardHeader className="px-0 pt-0 mb-6">
                            <CardTitle className="text-xl font-black text-foreground">Información de Contacto</CardTitle>
                            <CardDescription className="text-sm text-muted-foreground">Nuestros canales de comunicación</CardDescription>
                        </CardHeader>
                        <CardContent className="px-0 pb-0">
                            <div className="grid md:grid-cols-3 gap-6">
                                <div className="text-center p-6 border border-border/40 rounded-2xl bg-muted/5 hover:bg-muted/10 transition-all flex flex-col justify-between">
                                    <div>
                                        <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/20">
                                            <Phone className="h-6 w-6 text-blue-500" />
                                        </div>
                                        <h3 className="font-black text-foreground mb-2">Teléfono</h3>
                                        <p className="text-muted-foreground text-xs font-semibold mb-6">Lun - Vie, 9:00 - 18:00</p>
                                    </div>
                                    <EliteButton variant="secondary" className="w-full">
                                        <Phone className="h-4 w-4 mr-2" />
                                        +1 800 123 4567
                                    </EliteButton>
                                </div>

                                <div className="text-center p-6 border border-border/40 rounded-2xl bg-muted/5 hover:bg-muted/10 transition-all flex flex-col justify-between">
                                    <div>
                                        <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
                                            <Mail className="h-6 w-6 text-emerald-500" />
                                        </div>
                                        <h3 className="font-black text-foreground mb-2">Email</h3>
                                        <p className="text-muted-foreground text-xs font-semibold mb-6">Respuesta en 24h</p>
                                    </div>
                                    <EliteButton variant="secondary" className="w-full">
                                        <Mail className="h-4 w-4 mr-2" />
                                        soporte@medvisit.com
                                    </EliteButton>
                                </div>

                                <div className="text-center p-6 border border-border/40 rounded-2xl bg-muted/5 hover:bg-muted/10 transition-all flex flex-col justify-between">
                                    <div>
                                        <div className="w-12 h-12 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-indigo-500/20">
                                            <MessageSquare className="h-6 w-6 text-indigo-500" />
                                        </div>
                                        <h3 className="font-black text-foreground mb-2">Chat en Vivo</h3>
                                        <p className="text-muted-foreground text-xs font-semibold mb-6">Soporte inmediato</p>
                                    </div>
                                    <EliteButton className="w-full">
                                        <MessageSquare className="h-4 w-4 mr-2" />
                                        Iniciar Chat
                                    </EliteButton>
                                </div>
                            </div>
                        </CardContent>
                    </EliteCard>
                </TabsContent>

                {/* Tickets Tab */}
                <TabsContent value="tickets" className="animate-in fade-in slide-in-from-bottom-5 duration-700">
                    <EliteCard className="p-6">
                        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 px-0 pt-0 mb-6">
                            <div>
                                <CardTitle className="text-xl font-black text-foreground">Tickets de Soporte</CardTitle>
                                <CardDescription className="text-sm text-muted-foreground">Gestiona tus solicitudes de ayuda</CardDescription>
                            </div>
                            <Dialog open={ticketDialogOpen} onOpenChange={setTicketDialogOpen}>
                                <DialogTrigger asChild>
                                    <EliteButton variant="primary">
                                        <Plus className="h-4 w-4 mr-2" />Nuevo Ticket
                                    </EliteButton>
                                </DialogTrigger>
                                <DialogContent className="max-w-md rounded-[2.5rem] border-border/40 p-8 shadow-2xl bg-card">
                                    <DialogHeader>
                                        <DialogTitle className="text-2xl font-black text-foreground tracking-tight">Crear Ticket de Soporte</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-6 py-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-black text-muted-foreground uppercase tracking-widest">Asunto</Label>
                                            <EliteInput
                                                value={newTicket.subject}
                                                onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                                                placeholder="Resumen del problema"
                                                className="bg-background/50 border-border/40 rounded-2xl h-14 font-semibold shadow-inner focus-visible:ring-primary/20 text-foreground"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-xs font-black text-muted-foreground uppercase tracking-widest">Categoría</Label>
                                                <Select value={newTicket.category} onValueChange={(v) => setNewTicket({ ...newTicket, category: v })}>
                                                    <SelectTrigger className="h-14 bg-background/50 border-border/40 rounded-2xl shadow-inner font-bold text-foreground">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-2xl border-none shadow-2xl">
                                                        <SelectItem value="general" className="font-bold">General</SelectItem>
                                                        <SelectItem value="bug" className="font-bold">Error/Bug</SelectItem>
                                                        <SelectItem value="feature" className="font-bold">Nueva Función</SelectItem>
                                                        <SelectItem value="account" className="font-bold">Cuenta</SelectItem>
                                                        <SelectItem value="billing" className="font-bold">Facturación</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs font-black text-muted-foreground uppercase tracking-widest">Prioridad</Label>
                                                <Select value={newTicket.priority} onValueChange={(v) => setNewTicket({ ...newTicket, priority: v })}>
                                                    <SelectTrigger className="h-14 bg-background/50 border-border/40 rounded-2xl shadow-inner font-bold text-foreground">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-2xl border-none shadow-2xl">
                                                        <SelectItem value="low" className="font-bold">Baja</SelectItem>
                                                        <SelectItem value="medium" className="font-bold">Normal</SelectItem>
                                                        <SelectItem value="high" className="font-bold">Alta</SelectItem>
                                                        <SelectItem value="critical" className="font-bold">Urgente</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-black text-muted-foreground uppercase tracking-widest">Descripción</Label>
                                            <Textarea
                                                value={newTicket.description}
                                                onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                                                placeholder="Describe tu problema en detalle..."
                                                rows={4}
                                                className="bg-background/50 border-border/40 rounded-2xl font-semibold shadow-inner focus-visible:ring-primary/20 text-foreground"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-black text-muted-foreground uppercase tracking-widest">Captura de pantalla (Opcional)</Label>
                                            <EliteInput
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => setTicketFile(e.target.files ? e.target.files[0] : null)}
                                                className="cursor-pointer bg-background/50 border-border/40 rounded-2xl h-14 flex items-center pt-3 font-semibold shadow-inner focus-visible:ring-primary/20 text-foreground"
                                            />
                                        </div>
                                        <EliteButton className="w-full h-14 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl mt-4" onClick={handleCreateTicket}>
                                            <Send className="h-4 w-4 mr-2" />
                                            Enviar Ticket
                                        </EliteButton>
                                    </div>
                                    {ticketFile && (
                                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1 font-bold">
                                            <Upload className="h-3 w-3" />
                                            Adjunto: {ticketFile.name} ({(ticketFile.size / 1024 / 1024).toFixed(2)} MB)
                                        </p>
                                    )}
                                </DialogContent>
                            </Dialog>
                        </CardHeader>
                        <CardContent className="px-0 pb-0">
                            {tickets.length === 0 ? (
                                <div className="text-center py-16 text-muted-foreground">
                                    <Ticket className="h-16 w-16 mx-auto mb-4 opacity-20 text-primary" />
                                    <p className="font-bold text-foreground text-base">No tienes tickets de soporte</p>
                                    <p className="text-sm font-semibold mt-1">Crea uno si necesitas ayuda corporativa</p>
                                </div>
                            ) : (
                                <div className="border border-border/40 rounded-2xl overflow-hidden bg-muted/5 shadow-inner">
                                    <Table>
                                        <TableHeader className="bg-muted/10 border-b border-border/40">
                                            <TableRow>
                                                <TableHead className="font-black uppercase text-[10px] tracking-widest p-6">Asunto</TableHead>
                                                <TableHead className="font-black uppercase text-[10px] tracking-widest p-6">Categoría</TableHead>
                                                <TableHead className="font-black uppercase text-[10px] tracking-widest p-6">Estado</TableHead>
                                                <TableHead className="font-black uppercase text-[10px] tracking-widest p-6">Fecha</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {tickets.map(ticket => {
                                                const status = STATUS_CONFIG[ticket.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.open;
                                                return (
                                                    <TableRow key={ticket.id} className="border-b border-border/40 hover:bg-muted/10 transition-colors">
                                                        <TableCell className="font-bold text-foreground p-6">{ticket.subject}</TableCell>
                                                        <TableCell className="p-6"><Badge variant="secondary" className="bg-primary/5 text-primary border-none text-[9px] uppercase tracking-widest px-3 py-1 font-black">{ticket.category}</Badge></TableCell>
                                                        <TableCell className="p-6"><Badge className={cn("border-none text-[9px] uppercase tracking-widest px-3 py-1 font-black", status.color)}>{status.label}</Badge></TableCell>
                                                        <TableCell className="text-muted-foreground font-bold text-xs p-6">{new Date(ticket.created_at).toLocaleDateString('es-ES')}</TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </EliteCard>
                </TabsContent>

                {/* Downloads Tab */}
                <TabsContent value="downloads" className="animate-in fade-in slide-in-from-bottom-5 duration-700">
                    <EliteCard className="p-6">
                        <CardHeader className="px-0 pt-0 mb-6">
                            <CardTitle className="text-xl font-black text-foreground">Documentación y Descargas</CardTitle>
                            <CardDescription className="text-sm text-muted-foreground">Manuales y recursos para consulta corporativa</CardDescription>
                        </CardHeader>
                        <CardContent className="px-0 pb-0">
                            <div className="space-y-4">
                                {downloads.map((doc, i) => (
                                    <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-6 border border-border/40 rounded-2xl hover:bg-muted/10 bg-muted/5 transition-all gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center flex-shrink-0 border border-primary/20">
                                                <FileText className="h-6 w-6 text-primary" />
                                            </div>
                                            <div>
                                                <h3 className="font-black text-foreground text-sm leading-none mb-1.5">{doc.name}</h3>
                                                <p className="text-xs text-muted-foreground font-semibold">{doc.description}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between sm:justify-end gap-6 flex-shrink-0">
                                            <span className="text-xs text-muted-foreground font-bold">{doc.format} • {doc.size}</span>
                                            <EliteButton variant="secondary" size="sm" className="px-5">
                                                <Download className="h-4 w-4 mr-2" />
                                                Descargar
                                            </EliteButton>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </EliteCard>
                </TabsContent>
            </Tabs>
        </div>
    );
}
