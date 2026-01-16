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
import { Loader2, Bell, Plus, Trash2, Globe, Building2 } from "lucide-react";
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
        <div className="p-6 space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
                        <Bell className="w-8 h-8 text-emerald-500" />
                        Alertas del Sistema
                    </h1>
                    <p className="text-slate-400 mt-1">Gestiona notificaciones globales para los usuarios.</p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-emerald-600 hover:bg-emerald-500 text-white">
                            <Plus className="w-4 h-4 mr-2" />
                            Nueva Alerta
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-slate-900 border-slate-700 text-white">
                        <DialogHeader>
                            <DialogTitle>Crear Notificación</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Título</label>
                                <Input
                                    value={newTitle}
                                    onChange={e => setNewTitle(e.target.value)}
                                    className="bg-slate-800 border-slate-700"
                                    placeholder="Ej: Mantenimiento Programado"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Mensaje</label>
                                <Textarea
                                    value={newMessage}
                                    onChange={e => setNewMessage(e.target.value)}
                                    className="bg-slate-800 border-slate-700"
                                    placeholder="Detalles de la notificación..."
                                />
                            </div>
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="global-mode"
                                    checked={isGlobal}
                                    onCheckedChange={setIsGlobal}
                                />
                                <label htmlFor="global-mode" className="text-sm text-slate-300">
                                    Mensaje Global (Todos los usuarios)
                                </label>
                            </div>
                            <Button onClick={handleCreate} className="w-full bg-emerald-600 hover:bg-emerald-500 font-bold mt-4">
                                Publicar
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="text-xl text-white">Alertas Activas</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                        </div>
                    ) : alerts.length === 0 ? (
                        <div className="text-center py-12">
                            <Bell className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-slate-300">Sin alertas</h3>
                            <p className="text-slate-500 mt-1">El sistema no tiene notificaciones pendientes.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="border-slate-800 hover:bg-transparent">
                                    <TableHead className="text-slate-400">Alerta</TableHead>
                                    <TableHead className="text-slate-400">Alcance</TableHead>
                                    <TableHead className="text-slate-400">Estado</TableHead>
                                    <TableHead className="text-slate-400">Creado</TableHead>
                                    <TableHead className="text-slate-400 text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {alerts.map((alert) => (
                                    <TableRow key={alert.id} className="border-slate-800 hover:bg-slate-800/50">
                                        <TableCell className="text-white">
                                            <div className="font-bold">{alert.title}</div>
                                            <div className="text-sm text-slate-400">{alert.message}</div>
                                        </TableCell>
                                        <TableCell>
                                            {alert.is_global ? (
                                                <Badge variant="secondary" className="bg-purple-500/20 text-purple-400 hover:bg-purple-500/30">
                                                    <Globe className="w-3 h-3 mr-1" /> Global
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-slate-400 border-slate-600">
                                                    <Building2 className="w-3 h-3 mr-1" /> Organización
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Switch
                                                checked={alert.active}
                                                onCheckedChange={() => toggleActive(alert.id, alert.active)}
                                            />
                                        </TableCell>
                                        <TableCell className="text-slate-400 text-sm">
                                            {new Date(alert.created_at).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                                                onClick={() => deleteAlert(alert.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
