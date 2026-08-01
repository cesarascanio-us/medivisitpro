import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Package, Send, CheckCircle2, XCircle, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface ResourceRequest {
    id: string;
    resource_type: string;
    resource_id: string;
    quantity: number;
    status: string;
    justification: string;
    dispatch_tracking_id: string | null;
    created_at: string;
    user_id: string;
    user_name?: string;
}

export function POPResourceRequests() {
    const { user, isSupervisor, isCoordinator, isManager, role } = useAuth();
    const { toast } = useToast();
    const [requests, setRequests] = useState<ResourceRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);

    const [formData, setFormData] = useState({
        resource_type: "POP",
        resource_id: "",
        quantity: 1,
        justification: ""
    });

    useEffect(() => {
        if (user?.id) loadRequests();
    }, [user?.id]);

    const loadRequests = async () => {
        setLoading(true);
        try {
            let query = supabase.from('resource_requests').select('*').order('created_at', { ascending: false });

            // Depending on role, load what they can see/approve
            if (!isSupervisor && !isCoordinator && !isManager && role !== 'operations') {
                // Regular rep sees their own
                query = query.eq('user_id', user?.id);
            }
            // For managers/supervisors we'll fetch all for their zone (simplified to all for now)
            
            const { data, error } = await query;
            if (error) throw error;

            if (data && data.length > 0) {
                // Fetch user names
                const userIds = [...new Set(data.map((r: any) => r.user_id).filter(Boolean))] as string[];
                const { data: profiles } = await supabase.from('profiles').select('user_id, first_name, last_name, email').in('user_id', userIds);
                const profileMap: Record<string, string> = {};
                (profiles || []).forEach((p: any) => {
                    profileMap[p.user_id] = p.first_name ? `${p.first_name} ${p.last_name || ''}` : p.email;
                });

                const enriched = data.map((r: any) => ({
                    ...r,
                    user_name: profileMap[r.user_id] || 'Desconocido'
                }));
                setRequests(enriched);
            } else {
                setRequests([]);
            }
        } catch (error) {
            console.error('Error loading resource requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateRequest = async () => {
        if (!formData.resource_id || formData.quantity < 1) {
            toast({ title: "Error", description: "Datos incompletos.", variant: "destructive" });
            return;
        }

        try {
            const { error } = await supabase.from('resource_requests').insert({
                user_id: user?.id,
                resource_type: formData.resource_type,
                resource_id: formData.resource_id,
                quantity: formData.quantity,
                justification: formData.justification,
                status: 'pending_supervisor'
            } as any);

            if (error) throw error;

            toast({ title: "Solicitud Enviada", description: "Escalado a Supervisor." });
            setDialogOpen(false);
            setFormData({ resource_type: "POP", resource_id: "", quantity: 1, justification: "" });
            loadRequests();
        } catch (error) {
            toast({ title: "Error", description: "No se pudo crear.", variant: "destructive" });
        }
    };

    const updateStatus = async (id: string, action: 'approve' | 'reject') => {
        try {
            let nextStatus = 'rejected';
            if (action === 'approve') {
                if (isSupervisor) nextStatus = 'pending_coordinator';
                else if (isCoordinator) nextStatus = 'pending_manager';
                else if (isManager) nextStatus = 'approved_for_dispatch';
                else nextStatus = 'approved_for_dispatch';
            }

            const { error } = await supabase.from('resource_requests').update({ status: nextStatus }).eq('id', id);
            if (error) throw error;

            toast({ title: "Estado Actualizado", description: `El material ha avanzado a: ${nextStatus}` });
            loadRequests();
        } catch (error) {
            toast({ title: "Error", description: "No se pudo actualizar.", variant: "destructive" });
        }
    };

    const getBadge = (status: string) => {
        const styles: Record<string, string> = {
            pending_supervisor: "bg-amber-100 text-amber-800",
            pending_coordinator: "bg-blue-100 text-blue-800",
            pending_manager: "bg-indigo-100 text-indigo-800",
            approved_for_dispatch: "bg-cyan-100 text-cyan-800",
            dispatched: "bg-emerald-100 text-emerald-800",
            rejected: "bg-rose-100 text-rose-800"
        };
        const labels: Record<string, string> = {
            pending_supervisor: "REV. SUPERVISOR",
            pending_coordinator: "REV. COORDINADOR",
            pending_manager: "REV. GERENCIA",
            approved_for_dispatch: "POR EMPACAR (OP)",
            dispatched: "DESPACHADO",
            rejected: "RECHAZADO"
        };
        return <Badge className={styles[status] || "bg-gray-100"}>{labels[status] || status}</Badge>;
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="flex items-center gap-2">
                        <Send className="h-5 w-5 text-primary" />
                        Solicitudes de Suministro
                    </CardTitle>
                    <CardDescription>
                        Flujo ascendente de peticiones de material POP y Stands.
                    </CardDescription>
                </div>
                {!isSupervisor && !isCoordinator && !isManager && (
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-primary"><Plus className="w-4 h-4 mr-2"/> Pedir Material</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Solicitar Insumo Físico</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 pt-4">
                                <div>
                                    <Label>Nombre del Material</Label>
                                    <Input value={formData.resource_id} onChange={e => setFormData({...formData, resource_id: e.target.value})} placeholder="EJ. Cajas de Bolígrafos" />
                                </div>
                                <div>
                                    <Label>Cantidad</Label>
                                    <Input type="number" min="1" value={formData.quantity} onChange={e => setFormData({...formData, quantity: parseInt(e.target.value)})} />
                                </div>
                                <div>
                                    <Label>Justificación / Uso</Label>
                                    <Input value={formData.justification} onChange={e => setFormData({...formData, justification: e.target.value})} placeholder="Congreso Médico Q3..." />
                                </div>
                                <Button onClick={handleCreateRequest} className="w-full">Escalar a Supervisor</Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                )}
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Solicitante</TableHead>
                            <TableHead>Material</TableHead>
                            <TableHead>Cant.</TableHead>
                            <TableHead>Estatus</TableHead>
                            <TableHead className="text-right">Acción</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={6} className="text-center">Cargando...</TableCell></TableRow>
                        ) : requests.length === 0 ? (
                            <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">No hay solicitudes activas.</TableCell></TableRow>
                        ) : (
                            requests.map(r => (
                                <TableRow key={r.id}>
                                    <TableCell>{new Date(r.created_at).toLocaleDateString()}</TableCell>
                                    <TableCell className="font-bold">{r.user_name}</TableCell>
                                    <TableCell>{r.resource_id}</TableCell>
                                    <TableCell>{r.quantity}</TableCell>
                                    <TableCell>{getBadge(r.status)}</TableCell>
                                    <TableCell className="text-right">
                                        {((isSupervisor && r.status === 'pending_supervisor') || 
                                          (isCoordinator && r.status === 'pending_coordinator') || 
                                          (isManager && r.status === 'pending_manager')) && (
                                            <div className="flex justify-end gap-2">
                                                <Button size="icon" variant="ghost" className="text-emerald-500" onClick={() => updateStatus(r.id, 'approve')}>
                                                    <CheckCircle2 className="w-5 h-5"/>
                                                </Button>
                                                <Button size="icon" variant="ghost" className="text-rose-500" onClick={() => updateStatus(r.id, 'reject')}>
                                                    <XCircle className="w-5 h-5"/>
                                                </Button>
                                            </div>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
