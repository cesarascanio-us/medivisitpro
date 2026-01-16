import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { History, Search, ChevronDown, ChevronUp, Package } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Assignment {
    id: string;
    created_at: string;
    status: string;
    representative_id: string;
    created_by: string;
    representative_name?: string;
    creator_name?: string;
    items?: { product_name: string; quantity: number }[];
}

const STATUS_LABELS: Record<string, string> = {
    pending: "Pendiente",
    accepted: "Aceptado",
    rejected: "Rechazado",
    completed: "Completado"
};

const STATUS_COLORS: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    accepted: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    completed: "bg-blue-100 text-blue-800"
};

export function AssignmentHistory() {
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [expandedId, setExpandedId] = useState<string | null>(null);

    useEffect(() => {
        loadAssignments();
    }, []);

    const loadAssignments = async () => {
        setLoading(true);
        try {
            // Get assignments
            const { data: assignmentsData, error } = await supabase
                .from('sample_assignments')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (assignmentsData && assignmentsData.length > 0) {
                // Get all unique user_ids for names
                const userIds = [...new Set([
                    ...assignmentsData.map(a => a.representative_id),
                    ...assignmentsData.map(a => a.created_by)
                ].filter(Boolean))];

                const { data: profiles } = await supabase
                    .from('profiles')
                    .select('user_id, first_name, last_name, email')
                    .in('user_id', userIds);

                const profileMap: Record<string, string> = {};
                (profiles || []).forEach((p: any) => {
                    profileMap[p.user_id] = p.first_name && p.last_name
                        ? `${p.first_name} ${p.last_name}`
                        : p.email;
                });

                // Get assignment items
                const assignmentIds = assignmentsData.map(a => a.id);
                const { data: itemsData } = await supabase
                    .from('assignment_items')
                    .select('assignment_id, product_id, quantity')
                    .in('assignment_id', assignmentIds);

                // Get product names
                const productIds = [...new Set((itemsData || []).map(i => i.product_id))];
                const { data: products } = await supabase
                    .from('products')
                    .select('id, name')
                    .in('id', productIds);

                const productMap: Record<string, string> = {};
                (products || []).forEach((p: any) => {
                    productMap[p.id] = p.name;
                });

                // Combine everything
                const enriched = assignmentsData.map(a => ({
                    ...a,
                    representative_name: profileMap[a.representative_id] || 'Desconocido',
                    creator_name: profileMap[a.created_by] || 'Desconocido',
                    items: (itemsData || [])
                        .filter(i => i.assignment_id === a.id)
                        .map(i => ({
                            product_name: productMap[i.product_id] || 'Producto',
                            quantity: i.quantity
                        }))
                }));

                setAssignments(enriched);
            }
        } catch (error) {
            console.error('Error loading assignments:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredAssignments = assignments.filter(a => {
        const matchesSearch = searchTerm === "" ||
            a.representative_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.creator_name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "all" || a.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const toggleExpand = (id: string) => {
        setExpandedId(expandedId === id ? null : id);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5 text-primary" />
                    Historial de Asignaciones
                </CardTitle>
                <CardDescription>
                    Consulta todas las asignaciones de muestras realizadas.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {/* Filters */}
                <div className="flex gap-2 mb-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por nombre..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder="Estado" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            <SelectItem value="pending">Pendiente</SelectItem>
                            <SelectItem value="accepted">Aceptado</SelectItem>
                            <SelectItem value="rejected">Rechazado</SelectItem>
                            <SelectItem value="completed">Completado</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Table */}
                {loading ? (
                    <div className="text-center py-8 text-muted-foreground">Cargando historial...</div>
                ) : filteredAssignments.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">No hay asignaciones registradas.</div>
                ) : (
                    <div className="border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Destinatario</TableHead>
                                    <TableHead>Asignado por</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead className="text-center">Items</TableHead>
                                    <TableHead></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredAssignments.map(a => (
                                    <>
                                        <TableRow key={a.id} className="cursor-pointer hover:bg-muted/50" onClick={() => toggleExpand(a.id)}>
                                            <TableCell className="text-sm">
                                                {format(new Date(a.created_at), "dd MMM yyyy, HH:mm", { locale: es })}
                                            </TableCell>
                                            <TableCell className="font-medium">{a.representative_name}</TableCell>
                                            <TableCell className="text-muted-foreground">{a.creator_name}</TableCell>
                                            <TableCell>
                                                <Badge className={STATUS_COLORS[a.status] || 'bg-gray-100'}>
                                                    {STATUS_LABELS[a.status] || a.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant="outline">{a.items?.length || 0}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                {expandedId === a.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                            </TableCell>
                                        </TableRow>
                                        {expandedId === a.id && (
                                            <TableRow key={`${a.id}-details`}>
                                                <TableCell colSpan={6} className="bg-muted/30 p-4">
                                                    <div className="text-sm font-medium mb-2 flex items-center gap-1">
                                                        <Package className="h-4 w-4" /> Productos asignados:
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {a.items?.map((item, idx) => (
                                                            <Badge key={idx} variant="secondary">
                                                                {item.product_name} × {item.quantity}
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
