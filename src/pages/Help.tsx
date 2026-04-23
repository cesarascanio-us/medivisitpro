/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import { useState, useEffect } from "react";
import {
    HelpCircle, Search, BookOpen, Video, MessageCircle, Ticket,
    Download, ChevronDown, ChevronUp, Clock, CheckCircle, AlertCircle,
    Phone, Mail, MessageSquare, Send, FileText, Plus, Upload
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

interface FAQ {
    id: string;
    question: string;
    answer: string;
    category: string;
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
    basico: 'bg-green-100 text-green-800',
    intermedio: 'bg-yellow-100 text-yellow-800',
    avanzado: 'bg-red-100 text-red-800'
};

const STATUS_CONFIG = {
    open: { label: 'Abierto', color: 'bg-blue-100 text-blue-800', icon: Clock },
    in_progress: { label: 'En Proceso', color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
    resolved: { label: 'Resuelto', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    closed: { label: 'Cerrado', color: 'bg-muted text-gray-800', icon: CheckCircle },
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
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                    <HelpCircle className="h-6 w-6 text-primary" />
                    Centro de Ayuda
                </h1>
                <p className="text-muted-foreground">Encuentra respuestas, tutoriales y soporte</p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid grid-cols-5 w-full max-w-3xl">
                    <TabsTrigger value="faq" className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        FAQ
                    </TabsTrigger>
                    <TabsTrigger value="tutorials" className="flex items-center gap-2">
                        <Video className="h-4 w-4" />
                        Tutoriales
                    </TabsTrigger>
                    <TabsTrigger value="contact" className="flex items-center gap-2">
                        <MessageCircle className="h-4 w-4" />
                        Contacto
                    </TabsTrigger>
                    <TabsTrigger value="tickets" className="flex items-center gap-2">
                        <Ticket className="h-4 w-4" />
                        Tickets
                    </TabsTrigger>
                    <TabsTrigger value="downloads" className="flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Descargas
                    </TabsTrigger>
                </TabsList>

                {/* FAQ Tab */}
                <TabsContent value="faq">
                    <Card>
                        <CardHeader>
                            <CardTitle>Preguntas Frecuentes</CardTitle>
                            <CardDescription>Respuestas a las consultas más comunes</CardDescription>
                            <div className="flex gap-4 mt-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Buscar en FAQ..."
                                        className="pl-10"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <Select value={faqCategory} onValueChange={setFaqCategory}>
                                    <SelectTrigger className="w-40">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todas</SelectItem>
                                        <SelectItem value="general">General</SelectItem>
                                        <SelectItem value="visitas">Visitas</SelectItem>
                                        <SelectItem value="muestras">Muestras</SelectItem>
                                        <SelectItem value="reportes">Reportes</SelectItem>
                                        <SelectItem value="gastos">Gastos</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {filteredFaqs.length === 0 ? (
                                <p className="text-center text-muted-foreground py-8">No se encontraron resultados</p>
                            ) : (
                                filteredFaqs.map(faq => (
                                    <Collapsible key={faq.id} open={openFaqs.includes(faq.id)}>
                                        <CollapsibleTrigger
                                            className="flex items-center justify-between w-full p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                                            onClick={() => toggleFaq(faq.id)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <Badge variant="outline" className="text-xs">{faq.category}</Badge>
                                                <span className="font-medium text-left">{faq.question}</span>
                                            </div>
                                            {openFaqs.includes(faq.id) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                        </CollapsibleTrigger>
                                        <CollapsibleContent className="px-4 py-3 text-muted-foreground">
                                            {faq.answer}
                                        </CollapsibleContent>
                                    </Collapsible>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Tutorials Tab */}
                <TabsContent value="tutorials">
                    <Card>
                        <CardHeader>
                            <CardTitle>Video Tutoriales</CardTitle>
                            <CardDescription>Aprende a sacar el máximo provecho de la aplicación</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid md:grid-cols-2 gap-4">
                                {tutorials.map(tutorial => (
                                    <div key={tutorial.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                        <div className="flex items-start justify-between mb-2">
                                            <h3 className="font-semibold">{tutorial.title}</h3>
                                            <Badge className={LEVEL_COLORS[tutorial.level]}>
                                                {tutorial.level.charAt(0).toUpperCase() + tutorial.level.slice(1)}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground mb-3">{tutorial.description}</p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {tutorial.duration}
                                            </span>
                                            <Button size="sm" variant="outline">
                                                <Video className="h-4 w-4 mr-2" />
                                                Ver Tutorial
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Contact Tab */}
                <TabsContent value="contact">
                    <Card>
                        <CardHeader>
                            <CardTitle>Información de Contacto</CardTitle>
                            <CardDescription>Nuestros canales de comunicación</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid md:grid-cols-3 gap-6">
                                <div className="text-center p-6 border rounded-lg">
                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Phone className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <h3 className="font-semibold mb-2">Teléfono</h3>
                                    <p className="text-muted-foreground text-sm mb-4">Lun - Vie, 9:00 - 18:00</p>
                                    <Button variant="outline" className="w-full">
                                        <Phone className="h-4 w-4 mr-2" />
                                        +1 800 123 4567
                                    </Button>
                                </div>

                                <div className="text-center p-6 border rounded-lg">
                                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Mail className="h-6 w-6 text-green-600" />
                                    </div>
                                    <h3 className="font-semibold mb-2">Email</h3>
                                    <p className="text-muted-foreground text-sm mb-4">Respuesta en 24h</p>
                                    <Button variant="outline" className="w-full">
                                        <Mail className="h-4 w-4 mr-2" />
                                        soporte@medvisit.com
                                    </Button>
                                </div>

                                <div className="text-center p-6 border rounded-lg">
                                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <MessageSquare className="h-6 w-6 text-purple-600" />
                                    </div>
                                    <h3 className="font-semibold mb-2">Chat en Vivo</h3>
                                    <p className="text-muted-foreground text-sm mb-4">Soporte inmediato</p>
                                    <Button className="w-full">
                                        <MessageSquare className="h-4 w-4 mr-2" />
                                        Iniciar Chat
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Tickets Tab */}
                <TabsContent value="tickets">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Tickets de Soporte</CardTitle>
                                <CardDescription>Gestiona tus solicitudes de ayuda</CardDescription>
                            </div>
                            <Dialog open={ticketDialogOpen} onOpenChange={setTicketDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button><Plus className="h-4 w-4 mr-2" />Nuevo Ticket</Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-md">
                                    <DialogHeader>
                                        <DialogTitle>Crear Ticket de Soporte</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <Label>Asunto</Label>
                                            <Input
                                                value={newTicket.subject}
                                                onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                                                placeholder="Resumen del problema"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Categoría</Label>
                                                <Select value={newTicket.category} onValueChange={(v) => setNewTicket({ ...newTicket, category: v })}>
                                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="general">General</SelectItem>
                                                        <SelectItem value="bug">Error/Bug</SelectItem>
                                                        <SelectItem value="feature">Nueva Función</SelectItem>
                                                        <SelectItem value="account">Cuenta</SelectItem>
                                                        <SelectItem value="billing">Facturación</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Prioridad</Label>
                                                <Select value={newTicket.priority} onValueChange={(v) => setNewTicket({ ...newTicket, priority: v })}>
                                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="low">Baja</SelectItem>
                                                        <SelectItem value="medium">Normal</SelectItem>
                                                        <SelectItem value="high">Alta</SelectItem>
                                                        <SelectItem value="critical">Urgente</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Descripción</Label>
                                            <Textarea
                                                value={newTicket.description}
                                                onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                                                placeholder="Describe tu problema en detalle..."
                                                rows={4}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Captura de pantalla (Opcional)</Label>
                                            <Input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => setTicketFile(e.target.files ? e.target.files[0] : null)}
                                                className="cursor-pointer"
                                            />
                                        </div>
                                        <Button className="w-full" onClick={handleCreateTicket}>
                                            <Send className="h-4 w-4 mr-2" />
                                            Enviar Ticket
                                        </Button>
                                    </div>
                                    {ticketFile && (
                                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                            <Upload className="h-3 w-3" />
                                            Adjunto: {ticketFile.name} ({(ticketFile.size / 1024 / 1024).toFixed(2)} MB)
                                        </p>
                                    )}
                                </DialogContent>
                            </Dialog>
                        </CardHeader>
                        <CardContent>
                            {tickets.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Ticket className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                    <p>No tienes tickets de soporte</p>
                                    <p className="text-sm">Crea uno si necesitas ayuda</p>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Asunto</TableHead>
                                            <TableHead>Categoría</TableHead>
                                            <TableHead>Estado</TableHead>
                                            <TableHead>Fecha</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {tickets.map(ticket => {
                                            const status = STATUS_CONFIG[ticket.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.open;
                                            return (
                                                <TableRow key={ticket.id}>
                                                    <TableCell className="font-medium">{ticket.subject}</TableCell>
                                                    <TableCell><Badge variant="outline">{ticket.category}</Badge></TableCell>
                                                    <TableCell><Badge className={status.color}>{status.label}</Badge></TableCell>
                                                    <TableCell>{new Date(ticket.created_at).toLocaleDateString('es-ES')}</TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Downloads Tab */}
                <TabsContent value="downloads">
                    <Card>
                        <CardHeader>
                            <CardTitle>Documentación y Descargas</CardTitle>
                            <CardDescription>Manuales y recursos para consulta</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {downloads.map((doc, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                                <FileText className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <h3 className="font-medium">{doc.name}</h3>
                                                <p className="text-sm text-muted-foreground">{doc.description}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-xs text-muted-foreground">{doc.format} • {doc.size}</span>
                                            <Button variant="outline" size="sm">
                                                <Download className="h-4 w-4 mr-2" />
                                                Descargar
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
