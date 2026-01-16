import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Truck, CheckCircle, PackagePlus, AlertCircle, Loader2 } from "lucide-react";

interface IncomingItem {
    id: string;
    product_id: string;
    product_name: string;
    quantity: number;
    batch_number?: string;
}

interface IncomingStock {
    id: string;
    type: 'assignment' | 'request';
    created_at: string;
    notes: string;
    items: IncomingItem[];
}

export function WarehouseReception({ onReceive }: { onReceive: () => void }) {
    const { user } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [incoming, setIncoming] = useState<IncomingStock[]>([]);

    useEffect(() => {
        if (user) loadIncoming();
    }, [user]);

    const loadIncoming = async () => {
        if (!user) return;

        try {
            // 1. Fetch Traditional Assignments
            const { data: assignments } = await supabase
                .from('sample_assignments')
                .select(`
                    id, created_at, notes,
                    assignment_items (
                        id, product_id, quantity,
                        products ( name )
                    )
                `)
                .eq('representative_id', user.id)
                .eq('status', 'pending');

            // 2. Fetch Warehouse Requests (In Transit)
            const { data: requests } = await supabase
                .from('sample_requests')
                .select(`
                    id, created_at:requested_date, notes
                `)
                .eq('requester_id', user.id)
                .eq('status', 'in_transit');

            const normalized: IncomingStock[] = [];

            if (assignments) {
                assignments.forEach(a => {
                    normalized.push({
                        id: a.id,
                        type: 'assignment',
                        created_at: a.created_at,
                        notes: a.notes || 'Asignación Directa',
                        items: (a.assignment_items as any[]).map(i => ({
                            id: i.id,
                            product_id: i.product_id,
                            product_name: i.products?.name || 'Producto',
                            quantity: i.quantity
                        }))
                    });
                });
            }

            if (requests) {
                for (const r of requests) {
                    // Fetch dispatched batches from warehouse_movements
                    const { data: movements } = await (supabase
                        .from('warehouse_movements') as any)
                        .select(`
                            product_id,
                            quantity,
                            batch:warehouse_batches(batch_number, products(name))
                        `)
                        .eq('related_request_id', r.id)
                        .eq('movement_type', 'outbound_dispatch');

                    if (movements) {
                        normalized.push({
                            id: r.id,
                            type: 'request',
                            created_at: r.created_at,
                            notes: r.notes || `Solicitud #${r.id.slice(0, 8)}`,
                            items: movements.map((m: any, idx) => ({
                                id: `${r.id}-${idx}`,
                                product_id: m.product_id,
                                product_name: m.batch?.products?.name || 'Producto',
                                quantity: Math.abs(m.quantity),
                                batch_number: m.batch?.batch_number
                            }))
                        });
                    }
                }
            }

            setIncoming(normalized);
        } catch (error) {
            console.error("Error loading incoming stock:", error);
        }
    };

    const handleAccept = async (stock: IncomingStock) => {
        setLoading(true);
        try {
            if (stock.type === 'assignment') {
                await supabase.from('sample_assignments').update({ status: 'accepted' }).eq('id', stock.id);
            } else {
                await supabase.from('sample_requests').update({ status: 'delivered' }).eq('id', stock.id);
            }

            // Create 'warehouse_in' movements for each item
            const movements = stock.items.map(item => ({
                user_id: user?.id,
                product_id: item.product_id,
                quantity: item.quantity,
                movement_type: 'warehouse_in',
                batch_number: item.batch_number,
                notes: `Recepción ${stock.type === 'assignment' ? 'Asignación' : 'Solicitud'} #${stock.id.slice(0, 8)}`
            }));

            const { error: moveError } = await (supabase.from('sample_movements') as any).insert(movements as any);
            if (moveError) throw moveError;

            toast({
                title: "Stock Incorporado",
                description: "El inventario ha sido cargado a tu maletín con éxito.",
                className: "bg-green-50 border-green-200"
            });

            loadIncoming();
            if (onReceive) onReceive();

        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "Fallo al procesar la recepción", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    if (incoming.length === 0) return null;

    return (
        <div className="space-y-4">
            {incoming.map(stock => (
                <Card key={stock.id} className={`border-l-4 ${stock.type === 'request' ? 'border-l-purple-500 bg-purple-50/10' : 'border-l-blue-500 bg-blue-50/10'}`}>
                    <CardHeader className="pb-2">
                        <CardTitle className={`flex items-center gap-2 text-lg ${stock.type === 'request' ? 'text-purple-700' : 'text-blue-700'}`}>
                            <Truck className="h-5 w-5" />
                            {stock.type === 'request' ? 'Envío de Almacén Central' : 'Asignación de Supervisor'}
                            <Badge variant="outline" className="ml-auto">En Tránsito</Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                            <div>
                                <h3 className="font-semibold">{stock.notes}</h3>
                                <p className="text-sm text-muted-foreground">Fecha: {new Date(stock.created_at).toLocaleDateString()}</p>
                            </div>
                            <Button
                                onClick={() => handleAccept(stock)}
                                disabled={loading}
                                className={stock.type === 'request' ? "bg-purple-600 hover:bg-purple-700" : "bg-blue-600 hover:bg-blue-700"}
                            >
                                {loading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <PackagePlus className="mr-2 h-4 w-4" />}
                                Aceptar Stock
                            </Button>
                        </div>

                        <div className="rounded-md border bg-background">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Producto</TableHead>
                                        <TableHead>Lote</TableHead>
                                        <TableHead className="text-right">Cantidad</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {stock.items.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium">{item.product_name}</TableCell>
                                            <TableCell>
                                                {item.batch_number ? (
                                                    <Badge variant="secondary" className="font-mono">{item.batch_number}</Badge>
                                                ) : (
                                                    <span className="text-muted-foreground text-xs italic">N/A</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right font-bold text-primary">+{item.quantity}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
