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
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Bell, Plus, Trash2, Globe, Building2, RefreshCw, AlertTriangle, TrendingUp, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AlertType {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'error' | 'success';
    is_global: boolean;
    active: boolean;
    created_at: string;
}

export default function SystemAlerts() {
    const [alerts, setAlerts] = useState<AlertType[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Form state
    const [newTitle, setNewTitle] = useState('');
    const [newMessage, setNewMessage] = useState('');
    const [isGlobal, setIsGlobal] = useState(false);

    const fetchAlerts = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('system_alerts')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching alerts:', error);
        } else {
            setAlerts(data as AlertType[]);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchAlerts();
    }, []);

    const toggleActive = async (id: string, currentStatus: boolean) => {
        const { error } = await supabase
            .from('system_alerts')
            .update({ active: !currentStatus })
            .eq('id', id);

        if (error) {
            toast({ title: 'Error', description: 'No se pudo actualizar el estado.', variant: 'destructive' });
        } else {
            setAlerts(alerts.map(a => a.id === id ? { ...a, active: !currentStatus } : a));
            toast({ title: 'Actualizado', description: 'Estado de alerta cambiado.' });
        }
    };

    const deleteAlert = async (id: string) => {
        const { error } = await supabase
            .from('system_alerts')
            .delete()
            .eq('id', id);

        if (error) {
            toast({ title: 'Error', description: 'No se pudo eliminar.', variant: 'destructive' });
        } else {
            setAlerts(alerts.filter(a => a.id !== id));
            toast({ title: 'Eliminado', description: 'La alerta ha sido eliminada.' });
        }
    };

    const handleCreate = async () => {
        const { data, error } = await supabase
            .from('system_alerts')
            .insert({
                title: newTitle,
                message: newMessage,
                is_global: isGlobal,
                type: 'info'
            })
            .select()
            .single();

        if (error) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        } else {
            setAlerts([data as AlertType, ...alerts]);
            setIsDialogOpen(false);
            setNewTitle('');
            setNewMessage('');
            toast({ title: 'Creado', description: 'Nueva alerta publicada.' });
        }
    };

    return (
        <div className="flex flex-col h-full bg-background space-y-6 p-1">
            {/* Premium White Header Container */}
            <header className="bg-card px-10 md:px-12 py-8 rounded-elite-lg shadow-xl shadow-slate-200/50 dark:shadow-none border border-border relative overflow-hidden -mt-2 mx-1">
                {/* Decorative backgrounds */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-50 dark:bg-emerald-900/10 rounded-full blur-3xl opacity-60 text-slate-900"></div>
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-amber-50 dark:bg-amber-900/10 rounded-full blur-3xl opacity-60 text-slate-900"></div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200 dark:shadow-none transform transition-transform hover:scale-105">
                            <Bell className="text-white h-8 w-8" />
                        </div>
                        <div>
                            <p className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Comunicación Global</p>
                            <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
                                Alertas del Sistema
                            </h1>
                            <p className="text-muted-foreground text-sm mt-1">Gestiona notificaciones y avisos globales para todos los usuarios</p>
                        </div>
                    </div>

                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="h-12 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-200 dark:shadow-none transition-all hover:-translate-y-0.5 active:translate-y-0 font-bold uppercase text-[10px] tracking-widest">
                                <Plus className="w-4 h-4 mr-2" />
                                Nueva Alerta
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-card border-none shadow-2xl rounded-[2rem] max-w-md">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-black text-foreground tracking-tight">Crear Notificación</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-6 py-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Título de la Alerta</label>
                                    <Input
                                        value={newTitle}
                                        onChange={e => setNewTitle(e.target.value)}
                                        className="h-12 rounded-xl border-slate-100 bg-slate-50 text-sm font-bold focus:ring-emerald-500 text-slate-900"
                                        placeholder="Ej: Mantenimiento Programado"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Mensaje Detallado</label>
                                    <Textarea
                                        value={newMessage}
                                        onChange={e => setNewMessage(e.target.value)}
                                        className="rounded-xl border-slate-100 bg-slate-50 min-h-[100px] focus:ring-emerald-500 text-slate-900"
                                        placeholder="Escribe el contenido de la notificación..."
                                    />
                                </div>
                                <div className="flex items-center justify-between p-4 bg-muted rounded-xl border border-border">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-muted-foreground">Mensaje Global</span>
                                        <span className="text-[10px] text-slate-400 font-medium">Visible para todos los usuarios</span>
                                    </div>
                                    <Switch
                                        id="global-mode"
                                        checked={isGlobal}
                                        onCheckedChange={setIsGlobal}
                                        className="data-[state=checked]:bg-emerald-600"
                                    />
                                </div>
                                <Button onClick={handleCreate} className="w-full h-14 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-emerald-100 mt-4 transition-all">
                                    Publicar Notificación
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </header>

            <Card className="border-none shadow-2xl shadow-slate-200/50 dark:shadow-none bg-card rounded-[2rem] overflow-hidden mx-1">
                <CardHeader className="border-b border-border pb-6 pt-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-xl font-black text-foreground tracking-tight">Alertas Históricas</CardTitle>
                            <CardDescription className="text-muted-foreground font-medium tracking-tight">Registro completo de comunicaciones del sistema</CardDescription>
                        </div>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={fetchAlerts}
                            className="w-10 h-10 rounded-xl border-slate-200 hover:bg-emerald-50 transition-all"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-500' : ''}`} />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {loading && alerts.length === 0 ? (
                        <div className="flex justify-center py-24">
                            <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
                        </div>
                    ) : alerts.length === 0 ? (
                        <div className="text-center py-24 px-6">
                            <div className="bg-muted/50 w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                                <Bell className="w-10 h-10 text-muted-foreground/30" />
                            </div>
                            <h3 className="text-lg font-black text-foreground">Sin alertas activas</h3>
                            <p className="text-muted-foreground mt-2 max-w-xs mx-auto">No hay notificaciones pendientes por mostrar en este momento.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-muted/50">
                                    <TableRow className="hover:bg-transparent border-none">
                                        <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 py-6 pl-8">Alerta / Mensaje</TableHead>
                                        <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 py-6">Alcance</TableHead>
                                        <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 py-6">Estado</TableHead>
                                        <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 py-6">Creado</TableHead>
                                        <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 py-6 text-right pr-8">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {alerts.map((alert) => (
                                        <TableRow key={alert.id} className="border-b border-border hover:bg-slate-50/30 transition-all group">
                                            <TableCell className="pl-8 py-5">
                                                <div className="flex flex-col gap-1">
                                                    <span className="font-bold text-foreground">{alert.title}</span>
                                                    <span className="text-[11px] text-muted-foreground font-medium line-clamp-1">{alert.message}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-5">
                                                {alert.is_global ? (
                                                    <Badge className="bg-purple-50 text-purple-700 border-none font-black text-[9px] px-2.5 py-0.5 uppercase tracking-widest">
                                                        <Globe className="w-3 h-3 mr-1.5" /> Global
                                                    </Badge>
                                                ) : (
                                                    <Badge className="bg-blue-50 text-blue-700 border-none font-black text-[9px] px-2.5 py-0.5 uppercase tracking-widest">
                                                        <Building2 className="w-3 h-3 mr-1.5" /> Org
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="py-5">
                                                <Switch
                                                    checked={alert.active}
                                                    onCheckedChange={() => toggleActive(alert.id, alert.active)}
                                                    className="data-[state=checked]:bg-emerald-600 scale-90"
                                                />
                                            </TableCell>
                                            <TableCell className="text-slate-400 font-bold tabular-nums text-sm py-5 lowercase tracking-tighter">
                                                {new Date(alert.created_at).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-right pr-8 py-5">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-10 w-10 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                                    onClick={() => deleteAlert(alert.id)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
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
        </div>
    );
}
