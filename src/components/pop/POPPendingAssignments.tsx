import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Inbox, Check, X, Package, ChevronDown, ChevronUp } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Assignment {
    id: string;
    created_at: string;
    status: string;
    created_by: string;
    creator_name?: string;
    items?: { material_name: string; quantity: number }[];
}

export function POPPendingAssignments() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [processing, setProcessing] = useState<string | null>(null);

    useEffect(() => {
        if (user?.id) {
            loadPendingAssignments();
        }
    }, [user?.id]);

    const loadPendingAssignments = async () => {
        setLoading(true);
        try {
            // Get assignments where I'm the recipient and status is pending
            const { data: assignmentsData, error } = await (supabase as any)
                .from('pop_assignments')
                .select('*')
                .eq('representative_id', user?.id)
                .eq('status', 'pending')
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (assignmentsData && assignmentsData.length > 0) {
                // Get creator names
                const creatorIds = [...new Set(assignmentsData.map((a: any) => a.created_by).filter(Boolean))] as string[];
                const { data: profiles } = await supabase
                    .from('profiles')
                    .select('user_id, first_name, last_name, email')
                    .in('user_id', creatorIds);

                const profileMap: Record<string, string> = {};
                (profiles || []).forEach((p: any) => {
                    profileMap[p.user_id] = p.first_name && p.last_name
                        ? `${p.first_name} ${p.last_name}`
                        : p.email;
                });

                // Get assignment items
                const assignmentIds = assignmentsData.map((a: any) => a.id);
                const { data: itemsData } = await (supabase as any)
                    .from('pop_assignment_items')
                    .select('assignment_id, material_id, quantity')
                    .in('assignment_id', assignmentIds);

                // Get material names
                const materialIds = [...new Set((itemsData || []).map((i: any) => i.material_id))];
                const { data: materials } = await (supabase as any)
                    .from('pop_materials')
                    .select('id, name')
                    .in('id', materialIds);

                const materialMap: Record<string, string> = {};
                (materials || []).forEach((m: any) => {
                    materialMap[m.id] = m.name;
                });

                const enriched = assignmentsData.map((a: any) => ({
                    ...a,
                    creator_name: profileMap[a.created_by] || 'Desconocido',
                    items: (itemsData || [])
                        .filter((i: any) => i.assignment_id === a.id)
                        .map((i: any) => ({
                            material_name: materialMap[i.material_id] || 'Material',
                            quantity: i.quantity
                        }))
                }));

                setAssignments(enriched);
            } else {
                setAssignments([]);
            }
        } catch (error) {
            console.error('Error loading pending assignments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (assignmentId: string) => {
        setProcessing(assignmentId);
        try {
            const { error } = await (supabase as any)
                .from('pop_assignments')
                .update({ status: 'accepted' })
                .eq('id', assignmentId);

            if (error) throw error;

            toast({
                title: "Material Aceptado",
                description: "Has aceptado el material POP asignado.",
                className: "bg-green-50 border-green-200"
            });

            loadPendingAssignments();
        } catch (error) {
            console.error('Error accepting assignment:', error);
            toast({ title: "Error", description: "No se pudo aceptar.", variant: "destructive" });
        } finally {
            setProcessing(null);
        }
    };

    const handleReject = async (assignmentId: string) => {
        if (!confirm("¿Rechazar esta asignación? El material será devuelto al remitente.")) return;

        setProcessing(assignmentId);
        try {
            const { error } = await (supabase as any)
                .from('pop_assignments')
                .update({ status: 'rejected' })
                .eq('id', assignmentId);

            if (error) throw error;

            toast({
                title: "Asignación Rechazada",
                description: "La asignación ha sido rechazada.",
            });

            loadPendingAssignments();
        } catch (error) {
            console.error('Error rejecting assignment:', error);
            toast({ title: "Error", description: "No se pudo rechazar.", variant: "destructive" });
        } finally {
            setProcessing(null);
        }
    };

    const toggleExpand = (id: string) => {
        setExpandedId(expandedId === id ? null : id);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Inbox className="h-5 w-5 text-primary" />
                    Asignaciones Pendientes
                    {assignments.length > 0 && (
                        <Badge className="bg-red-500 text-white ml-2">{assignments.length}</Badge>
                    )}
                </CardTitle>
                <CardDescription>
                    Material POP asignado a ti que requiere tu confirmación.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="text-center py-8 text-muted-foreground">Cargando...</div>
                ) : assignments.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        No tienes asignaciones pendientes.
                    </div>
                ) : (
                    <div className="border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Enviado por</TableHead>
                                    <TableHead className="text-center">Items</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {assignments.map(a => (
                                    <>
                                        <TableRow key={a.id} className="cursor-pointer hover:bg-muted/50" onClick={() => toggleExpand(a.id)}>
                                            <TableCell className="text-sm">
                                                {format(new Date(a.created_at), "dd MMM yyyy, HH:mm", { locale: es })}
                                            </TableCell>
                                            <TableCell className="font-medium">{a.creator_name}</TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant="outline">{a.items?.length || 0} items</Badge>
                                                {expandedId === a.id ? <ChevronUp className="h-4 w-4 inline ml-2" /> : <ChevronDown className="h-4 w-4 inline ml-2" />}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                                    <Button
                                                        size="sm"
                                                        variant="default"
                                                        className="bg-green-600 hover:bg-green-700"
                                                        onClick={() => handleAccept(a.id)}
                                                        disabled={processing === a.id}
                                                    >
                                                        <Check className="h-4 w-4 mr-1" /> Aceptar
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="text-red-600 border-red-300 hover:bg-red-50"
                                                        onClick={() => handleReject(a.id)}
                                                        disabled={processing === a.id}
                                                    >
                                                        <X className="h-4 w-4 mr-1" /> Rechazar
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                        {expandedId === a.id && (
                                            <TableRow key={`${a.id}-details`}>
                                                <TableCell colSpan={4} className="bg-muted/30 p-4">
                                                    <div className="text-sm font-medium mb-2 flex items-center gap-1">
                                                        <Package className="h-4 w-4" /> Materiales incluidos:
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {a.items?.map((item, idx) => (
                                                            <Badge key={idx} variant="secondary">
                                                                {item.material_name} × {item.quantity}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
