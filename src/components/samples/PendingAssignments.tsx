import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { PackageCheck, PackageX, Clock, User, Package, Loader2, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useDemoData } from "@/contexts/MockDataProvider";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";

interface AssignmentWithItems {
    id: string;
    status: string;
    created_at: string;
    notes: string | null;
    created_by: string;
    creator_name?: string;
    items: {
        product_id: string;
        product_name: string;
        quantity: number;
    }[];
}

export function PendingAssignments() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [assignments, setAssignments] = useState<AssignmentWithItems[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState<string | null>(null);
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState<string | null>(null);
    const [rejectReason, setRejectReason] = useState("");
    const demoData = useDemoData();

    useEffect(() => {
        if (user || demoData) {
            loadPendingAssignments();
        }
    }, [user, demoData]);

    const loadPendingAssignments = async () => {
        if (!user && !demoData) return;
        setLoading(true);

        if (demoData) {
            console.log("PendingAssignments: Loading demo data");
            const demoPending = [
                {
                    id: 'pend-001',
                    status: 'pending',
                    created_at: new Date().toISOString(),
                    notes: 'Carga inicial para la semana',
                    created_by: 'demo-master',
                    creator_name: 'Gerencia Demo',
                    items: [
                        { product_id: 'p1', product_name: 'Atorvastatina 20mg', quantity: 50 },
                        { product_id: 'p2', product_name: 'Losartán 50mg', quantity: 30 }
                    ]
                }
            ];
            setAssignments(demoPending);
            setLoading(false);
            return;
        }

        try {
            // Cargar asignaciones pendientes para el usuario actual
            const { data: assignmentsData, error: assignmentsError } = await supabase
                .from('sample_assignments')
                .select(`
                    id,
                    status,
                    created_at,
                    notes,
                    created_by
                `)
                .eq('representative_id', user.id)
                .eq('status', 'pending')
                .order('created_at', { ascending: false });

            if (assignmentsError) throw assignmentsError;

            if (!assignmentsData || assignmentsData.length === 0) {
                setAssignments([]);
                setLoading(false);
                return;
            }

            // Cargar items de cada asignación
            const assignmentIds = assignmentsData.map(a => a.id);
            const { data: itemsData, error: itemsError } = await supabase
                .from('assignment_items')
                .select(`
                    assignment_id,
                    product_id,
                    quantity,
                    products:product_id (name)
                `)
                .in('assignment_id', assignmentIds);

            if (itemsError) throw itemsError;

            // Cargar nombres de creadores
            const creatorIds = [...new Set(assignmentsData.map(a => a.created_by))];
            const { data: profilesData } = await supabase
                .from('profiles')
                .select('user_id, first_name, last_name')
                .in('user_id', creatorIds);

            // Combinar datos
            const combined: AssignmentWithItems[] = assignmentsData.map(assignment => {
                const items = (itemsData || [])
                    .filter(item => item.assignment_id === assignment.id)
                    .map(item => ({
                        product_id: item.product_id,
                        product_name: (item.products as any)?.name || 'Producto desconocido',
                        quantity: item.quantity
                    }));

                const creator = profilesData?.find(p => p.user_id === assignment.created_by);
                const creatorName = creator
                    ? `${creator.first_name || ''} ${creator.last_name || ''}`.trim() || 'Usuario'
                    : 'Usuario';

                return {
                    ...assignment,
                    creator_name: creatorName,
                    items
                };
            });

            setAssignments(combined);
        } catch (error) {
            console.error('Error loading pending assignments:', error);
            toast({
                title: "Error",
                description: "No se pudieron cargar las asignaciones pendientes",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (assignmentId: string) => {
        setProcessing(assignmentId);

        if (demoData) {
            setTimeout(() => {
                toast({
                    title: "¡Stock Aceptado! (Demo)",
                    description: "En modo demo la aceptación es simulada.",
                    className: "bg-green-50 border-green-200"
                });
                setAssignments(prev => prev.filter(a => a.id !== assignmentId));
                setProcessing(null);
            }, 1000);
            return;
        }

        try {
            // Llamar función RPC para transacción atómica
            const { data, error } = await supabase.rpc('accept_assignment', {
                p_assignment_id: assignmentId
            });

            if (error) throw error;

            const result = data as { success: boolean; message?: string; error?: string };

            if (!result.success) {
                throw new Error(result.error || 'Error desconocido');
            }

            toast({
                title: "¡Stock Aceptado!",
                description: result.message || "El stock ha sido agregado a tu inventario.",
                className: "bg-green-50 border-green-200"
            });

            // Recargar lista
            loadPendingAssignments();

        } catch (error: any) {
            console.error('Error accepting assignment:', error);
            toast({
                title: "Error al aceptar",
                description: error.message || "No se pudo procesar la aceptación",
                variant: "destructive"
            });
        } finally {
            setProcessing(null);
        }
    };

    const openRejectDialog = (assignmentId: string) => {
        setSelectedAssignment(assignmentId);
        setRejectReason("");
        setRejectDialogOpen(true);
    };

    const handleReject = async () => {
        if (!selectedAssignment) return;
        setProcessing(selectedAssignment);
        setRejectDialogOpen(false);

        if (demoData) {
            setTimeout(() => {
                toast({
                    title: "Asignación Rechazada (Demo)",
                    description: "Modo demo: rechazo simulado.",
                });
                setAssignments(prev => prev.filter(a => a.id !== selectedAssignment));
                setProcessing(null);
                setSelectedAssignment(null);
            }, 1000);
            return;
        }

        try {
            const { data, error } = await supabase.rpc('reject_assignment', {
                p_assignment_id: selectedAssignment,
                p_reason: rejectReason || null
            });

            if (error) throw error;

            const result = data as { success: boolean; message?: string; error?: string };

            if (!result.success) {
                throw new Error(result.error || 'Error desconocido');
            }

            toast({
                title: "Asignación Rechazada",
                description: "El supervisor ha sido notificado.",
            });

            loadPendingAssignments();

        } catch (error: any) {
            console.error('Error rejecting assignment:', error);
            toast({
                title: "Error al rechazar",
                description: error.message || "No se pudo procesar el rechazo",
                variant: "destructive"
            });
        } finally {
            setProcessing(null);
            setSelectedAssignment(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (assignments.length === 0) {
        return (
            <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                    <PackageCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                        No hay asignaciones pendientes
                    </h3>
                    <p className="text-muted-foreground">
                        Cuando tu supervisor te asigne stock, aparecerá aquí para que lo aceptes.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            <div className="space-y-4">
                {assignments.map((assignment) => (
                    <Card key={assignment.id} className="border-l-4 border-l-amber-500">
                        <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <Clock className="h-5 w-5 text-amber-500" />
                                        Asignación Pendiente
                                    </CardTitle>
                                    <CardDescription className="flex items-center gap-2 mt-1">
                                        <User className="h-3 w-3" />
                                        De: {assignment.creator_name}
                                        <span className="text-muted-foreground">•</span>
                                        {format(new Date(assignment.created_at), "PPP 'a las' p", { locale: es })}
                                    </CardDescription>
                                </div>
                                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                                    Pendiente de Aceptación
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-muted/30 rounded-md p-3">
                                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                                    <Package className="h-4 w-4" />
                                    Productos Asignados
                                </h4>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Producto</TableHead>
                                            <TableHead className="text-right">Cantidad</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {assignment.items.map((item, idx) => (
                                            <TableRow key={idx}>
                                                <TableCell className="font-medium">{item.product_name}</TableCell>
                                                <TableCell className="text-right">
                                                    <Badge variant="secondary">{item.quantity} uds</Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                            {assignment.notes && (
                                <div className="mt-3 p-3 bg-blue-50 rounded-md">
                                    <p className="text-sm text-blue-800">
                                        <AlertCircle className="h-4 w-4 inline mr-1" />
                                        Nota: {assignment.notes}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="flex justify-end gap-2 pt-3 border-t">
                            <Button
                                variant="outline"
                                onClick={() => openRejectDialog(assignment.id)}
                                disabled={processing === assignment.id}
                                className="text-destructive border-destructive/30 hover:bg-destructive/10"
                            >
                                <XCircle className="h-4 w-4 mr-2" />
                                Rechazar
                            </Button>
                            <Button
                                onClick={() => handleAccept(assignment.id)}
                                disabled={processing === assignment.id}
                                className="btn-medical"
                            >
                                {processing === assignment.id ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                )}
                                Aceptar Stock
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Rechazar esta asignación?</AlertDialogTitle>
                        <AlertDialogDescription>
                            El supervisor será notificado del rechazo. Puedes indicar un motivo (opcional).
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="py-4">
                        <Textarea
                            placeholder="Motivo del rechazo (opcional)..."
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            rows={3}
                        />
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleReject}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Confirmar Rechazo
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
