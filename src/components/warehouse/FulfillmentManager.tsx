import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, Clock, AlertTriangle, Truck, Search, Eye, ArrowRight, History, PackageCheck, Plus, ShoppingCart, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function FulfillmentManager() {
    const { toast } = useToast();
    const [requests, setRequests] = useState<any[]>([]);
    const [completedRequests, setCompletedRequests] = useState<any[]>([]);
    const [selectedRequest, setSelectedRequest] = useState<any>(null);
    const [pickingPlan, setPickingPlan] = useState<any[]>([]);
    const [warehouses, setWarehouses] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [selectedWarehouse, setSelectedWarehouse] = useState<string>('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [directDispatchOpen, setDirectDispatchOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // State for Direct Dispatch
    const [ddType, setDdType] = useState('sale');
    const [ddTarget, setDdTarget] = useState('');
    const [ddItems, setDdItems] = useState<any[]>([{ product_id: '', quantity: 1, batches: [] }]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            // Fetch Sample Requests
            const { data: sampleReqs } = await (supabase.from('sample_requests') as any).select(`
                *,
                requester:profiles(user_id, first_name, last_name, email),
                details:sample_request_items(
                    *,
                    product:products(name, sku, category)
                )
            `).order('created_at', { ascending: false });

            // Fetch Sales Orders (Direct Sale)
            const { data: salesOrders } = await (supabase.from('transfer_orders' as any).select(`
                *,
                requester:profiles!transfer_orders_user_id_fkey(user_id, first_name, last_name, email)
            `)
                .eq('order_type', 'direct_sale')
                .order('created_at', { ascending: false })) as any;

            const normalizedRequests: any[] = [];

            // Normalize Samples
            (sampleReqs || []).forEach((r: any) => {
                normalizedRequests.push({
                    ...r,
                    request_type: 'sample',
                    display_id: `MUE-${r.id.slice(0, 8)}`,
                    requester_name: `${r.requester?.first_name || ''} ${r.requester?.last_name || ''}`,
                    description: `Muestras Médicas`,
                    target_name: r.requester?.first_name || 'Personal',
                    details: (r.details || []).map((d: any) => ({
                        product_id: d.product_id,
                        quantity_requested: d.quantity_requested,
                        product: d.product
                    }))
                });
            });

            // Normalize Sales
            (salesOrders || []).forEach((r: any) => {
                normalizedRequests.push({
                    ...r,
                    request_type: 'sale',
                    display_id: `VTA-${r.order_number || r.id.slice(0, 8)}`,
                    requester_name: `${r.requester?.first_name || ''} ${r.requester?.last_name || ''}`,
                    description: `Venta Directa: ${r.pharmacy_name}`,
                    target_name: r.pharmacy_name,
                    details: (r.products || []).map((p: any) => ({
                        product_id: p.id || p.product_id,
                        quantity_requested: p.quantity,
                        product: { name: p.name || p.product_name, sku: p.sku || 'N/A' }
                    }))
                });
            });

            setRequests(normalizedRequests.filter((r: any) =>
                (r.request_type === 'sample' && (r.status === 'pending' || r.status === 'approved')) ||
                (r.request_type === 'sale' && (r.status === 'confirmed'))
            ));

            setCompletedRequests(normalizedRequests.filter((r: any) =>
                (r.request_type === 'sample' && (r.status === 'in_transit' || r.status === 'delivered')) ||
                (r.request_type === 'sale' && (r.status === 'sent' || r.status === 'completed'))
            ));

            const whQuery: any = (supabase.from('warehouses') as any).select('*').eq('is_active', true);
            const prQuery: any = (supabase.from('products') as any).select('*').order('name');
            const [whRes, prRes] = await Promise.all([whQuery, prQuery]);

            if (whRes.data) {
                setWarehouses(whRes.data);
                if (whRes.data.length > 0 && !selectedWarehouse) setSelectedWarehouse(whRes.data[0].id);
            }

            if (prRes.data) setProducts(prRes.data);
        } catch (e) {
            console.error("Load error", e);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectRequest = async (request: any) => {
        setLoading(true);
        setSelectedRequest(request);

        // If already dispatched, show actual history from movements
        const isHistory = ['sent', 'in_transit', 'delivered', 'completed'].includes(request.status);

        if (isHistory) {
            const { data: movements } = await (supabase.from('warehouse_movements' as any) as any)
                .select('*, batch:warehouse_batches(batch_number, expiration_date)')
                .eq('related_request_id', request.id);

            const plan = request.details.map((item: any) => ({
                product_id: item.product_id,
                product_name: item.product?.name || 'Producto Desconocido',
                sku: item.product?.sku,
                requested: item.quantity_requested,
                allocated: (movements || [])
                    .filter((m: any) => m.product_id === item.product_id)
                    .map((m: any) => ({
                        batch_number: m.batch?.batch_number || 'N/A',
                        expiration_date: m.batch?.expiration_date,
                        take: Math.abs(m.quantity)
                    })),
                missing: false,
                missing_qty: 0
            }));

            setPickingPlan(plan);
            setLoading(false);
            setDialogOpen(true);
            return;
        }

        const plan = [];
        for (const item of request.details) {
            // FEFO: First Expired, First Out
            const { data: batches } = await (supabase
                .from('warehouse_batches') as any)
                .select('*')
                .eq('product_id', item.product_id)
                .eq('warehouse_id', selectedWarehouse)
                .gt('quantity', 0)
                .order('expiration_date', { ascending: true });

            let pendingQty = item.quantity_requested;
            const allocated = [];

            if (batches) {
                for (const batch of batches) {
                    if (pendingQty <= 0) break;
                    const take = Math.min(pendingQty, batch.quantity);
                    allocated.push({ ...batch, take });
                    pendingQty -= take;
                }
            }

            plan.push({
                product_id: item.product_id,
                product_name: item.product?.name || 'Producto Desconocido',
                sku: item.product?.sku,
                requested: item.quantity_requested,
                allocated,
                missing: pendingQty > 0,
                missing_qty: pendingQty
            });
        }
        setPickingPlan(plan);
        setLoading(false);
        setDialogOpen(true);
    };

    const confirmDispatch = async () => {
        if (!selectedRequest) return;
        setLoading(true);
        try {
            const itemsToDispatch = pickingPlan.flatMap(p =>
                p.allocated.map((b: any) => ({
                    batch_id: b.id,
                    quantity: b.take
                }))
            );

            if (itemsToDispatch.length === 0) {
                throw new Error("No hay stock asignado para despachar.");
            }

            const { error } = await (supabase.rpc('warehouse_dispatch', {
                p_warehouse_id: selectedWarehouse,
                p_request_id: selectedRequest.id,
                p_items: itemsToDispatch
            }) as any);

            if (error) throw error;

            toast({
                title: "Despacho Confirmado exitosamente",
                description: `El pedido ${selectedRequest.display_id} para ${selectedRequest.target_name} ha sido procesado.`,
            });
            setDialogOpen(false);
            loadData();
        } catch (error: any) {
            console.error('Dispatch error:', error);
            toast({
                title: "Error de Despacho",
                description: error.message || "Fallo al procesar despacho.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDirectDispatch = async () => {
        setLoading(true);
        try {
            // For simplicity in direct dispatch, we'll auto-select batches via FEFO per item
            const finalItems = [];
            for (const item of ddItems) {
                if (!item.product_id || !item.quantity) continue;

                const { data: batches } = await (supabase.from('warehouse_batches') as any)
                    .select('*')
                    .eq('product_id', item.product_id)
                    .eq('warehouse_id', selectedWarehouse)
                    .gt('quantity', 0)
                    .order('expiration_date', { ascending: true });

                let pending = parseInt(item.quantity);
                if (batches) {
                    for (const b of batches) {
                        if (pending <= 0) break;
                        const take = Math.min(pending, b.quantity);
                        finalItems.push({ batch_id: b.id, quantity: take });
                        pending -= take;
                    }
                }
                if (pending > 0) throw new Error(`Stock insuficiente para el producto seleccionado.`);
            }

            const { error } = await ((supabase as any).rpc('warehouse_direct_dispatch', {
                p_warehouse_id: selectedWarehouse,
                p_movement_type: ddType,
                p_items: finalItems,
                p_notes: `Despacho Directo a: ${ddTarget}`
            }));

            if (error) throw error;

            toast({ title: "Salida Registrada", description: "El movimiento de inventario se completó con éxito." });
            setDirectDispatchOpen(false);
            setDdItems([{ product_id: '', quantity: 1 }]);
            setDdTarget('');
            loadData();
        } catch (error: any) {
            toast({ title: "Fallo en Salida", description: error.message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const filteredRequests = requests.filter(r =>
        (r.requester_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.target_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.display_id || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Truck className="h-7 w-7 text-purple-600" />
                        Centro de Despacho Logístico
                    </h2>
                    <p className="text-slate-500">Gestión de salida de muestras y suministros médicos.</p>
                </div>
                <div className="flex items-center gap-2 w-full md:w-fit">
                    <Button
                        onClick={() => setDirectDispatchOpen(true)}
                        className="bg-purple-600 hover:bg-purple-700 h-10 shadow-md"
                    >
                        <ShoppingCart className="mr-2 h-4 w-4" /> Venta/Salida Directa
                    </Button>
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Buscar pedido o visitador..."
                            className="pl-9 h-10 border-slate-200"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" size="icon" onClick={loadData} className="h-10 w-10">
                        <History className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="pending" className="w-full">
                <TabsList className="bg-slate-100 p-1 mb-4">
                    <TabsTrigger value="pending" className="data-[state=active]:bg-white">
                        <Clock className="mr-2 h-4 w-4 text-amber-500" />
                        Pendientes de Picking ({filteredRequests.length})
                    </TabsTrigger>
                    <TabsTrigger value="completed" className="data-[state=active]:bg-white">
                        <PackageCheck className="mr-2 h-4 w-4 text-green-600" />
                        Historial de Despachos ({completedRequests.length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="pending">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredRequests.map(req => (
                            <Card key={req.id} className="group hover:border-purple-300 transition-all shadow-sm border-slate-200">
                                <CardHeader className="pb-3 border-b border-dashed">
                                    <div className="flex justify-between items-center mb-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">{req.display_id}</span>
                                            <Badge variant="outline" className={req.request_type === 'sale' ? 'border-blue-200 text-blue-700 bg-blue-50' : 'border-purple-200 text-purple-700 bg-purple-50'}>
                                                {req.request_type === 'sale' ? 'VENTA' : 'MUESTRA'}
                                            </Badge>
                                        </div>
                                        <Badge className={req.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-green-50 text-green-700 border-green-200'}>
                                            {req.status === 'pending' ? 'Por Procesar' : req.status === 'approved' ? 'Aprobado' : 'Confirmado'}
                                        </Badge>
                                    </div>
                                    <CardTitle className="text-lg text-slate-800">
                                        {req.target_name}
                                    </CardTitle>
                                    <CardDescription className="flex items-center justify-between text-xs">
                                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(req.created_at).toLocaleDateString()}</span>
                                        <span className="font-medium text-slate-500">{req.requester_name}</span>
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="pt-4 space-y-4">
                                    <div className="grid grid-cols-2 gap-2 text-center">
                                        <div className="bg-slate-50 p-2 rounded-lg">
                                            <p className="text-[10px] uppercase font-bold text-slate-400">Items</p>
                                            <p className="text-xl font-black text-slate-700">{req.details?.length || 0}</p>
                                        </div>
                                        <div className="bg-purple-50 p-2 rounded-lg">
                                            <p className="text-[10px] uppercase font-bold text-purple-400">Total Qty</p>
                                            <p className="text-xl font-black text-purple-700">
                                                {req.details?.reduce((acc: number, d: any) => acc + (d.quantity_requested || 0), 0)}
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        onClick={() => handleSelectRequest(req)}
                                        className="w-full bg-slate-900 border hover:bg-purple-700 group-hover:scale-[1.02] transition-transform"
                                    >
                                        Pasar a Picking <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                    {filteredRequests.length === 0 && (
                        <div className="text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                            <PackageCheck className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                            <h4 className="text-lg font-bold text-slate-600">No hay despachos pendientes</h4>
                            <p className="text-slate-400 text-sm">Todos los pedidos han sido procesados o no hay solicitudes nuevas.</p>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="completed">
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                        <Table>
                            <TableHeader className="bg-slate-50">
                                <TableRow>
                                    <TableHead>Referencia</TableHead>
                                    <TableHead>Destinatario</TableHead>
                                    <TableHead>Estado Logístico</TableHead>
                                    <TableHead>Fecha Despacho</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {completedRequests.map(req => (
                                    <TableRow key={req.id}>
                                        <TableCell className="font-mono text-xs font-bold text-purple-700">{req.display_id}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-slate-800">{req.target_name}</span>
                                                <span className="text-[10px] text-slate-400">{req.description}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={`${req.status === 'delivered' || req.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-blue-700 border-blue-200'} flex items-center gap-1 w-fit`}>
                                                <Truck className="h-3 w-3" /> {req.status === 'sent' || req.status === 'in_transit' ? 'En Tránsito' : 'Entregado'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-slate-500 text-sm">
                                            {new Date(req.updated_at).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 text-slate-400 hover:text-purple-600"
                                                onClick={() => handleSelectRequest(req)} // Re-using picking view but as "Ready"
                                            >
                                                <Eye className="h-4 w-4 mr-2" /> Detalles
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>
            </Tabs>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-4xl p-0 overflow-hidden border-none shadow-2xl">
                    <div className="bg-purple-700 p-6 text-white flex items-center justify-between">
                        <div>
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                                    <PackageCheck className="h-8 w-8 text-purple-200" />
                                    {['sent', 'completed', 'delivered'].includes(selectedRequest?.status) ? 'Detalles del Despacho' : 'Generar Plan de Picking (FEFO)'}
                                </DialogTitle>
                            </DialogHeader>
                            <p className="text-purple-100 text-sm mt-1">
                                Requisición <b>{selectedRequest?.display_id}</b> - {selectedRequest?.target_name}
                            </p>
                        </div>
                        <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center">
                            <Truck className="h-6 w-6 text-white" />
                        </div>
                    </div>

                    <div className="p-6 space-y-4 bg-slate-50">
                        {['pending', 'approved', 'confirmed'].includes(selectedRequest?.status) && (
                            <div className="bg-amber-100 border-l-4 border-amber-500 p-4 rounded text-amber-900 flex items-start gap-3 shadow-sm">
                                <AlertTriangle className="h-5 w-5 mt-0.5" />
                                <div className="text-sm">
                                    <p className="font-bold">Política de Rotación Exigida:</p>
                                    <p>El sistema ha bloqueado automáticamente lotes con vencimiento próximo para salida obligatoria.</p>
                                </div>
                            </div>
                        )}

                        <div className="bg-white rounded-xl border border-slate-200 shadow-inner max-h-[50vh] overflow-y-auto">
                            <Table>
                                <TableHeader className="bg-slate-50/50 sticky top-0 z-10">
                                    <TableRow>
                                        <TableHead className="w-[30%]">Producto / SKU</TableHead>
                                        <TableHead className="text-center">Pedido</TableHead>
                                        <TableHead>Lote Asignado</TableHead>
                                        <TableHead>Vencimiento</TableHead>
                                        <TableHead className="text-right">A Picking</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {pickingPlan.map((item, idx) => (
                                        item.allocated.length > 0 ? (
                                            item.allocated.map((batch: any, bIdx: number) => (
                                                <TableRow key={`${idx}-${bIdx}`} className={bIdx === 0 ? "border-t" : "border-t-0 opacity-70 bg-slate-50/30"}>
                                                    <TableCell>
                                                        {bIdx === 0 && (
                                                            <div className="flex flex-col">
                                                                <span className="font-bold text-slate-800">{item.product_name}</span>
                                                                <span className="text-[10px] text-slate-400 font-mono italic">{item.sku}</span>
                                                            </div>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-center font-bold text-slate-500">{bIdx === 0 ? item.requested : '-'}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className="font-mono text-purple-700 bg-purple-50 border-purple-200">
                                                            {batch.batch_number}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-xs">
                                                        {new Date(batch.expiration_date).toLocaleDateString()}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <span className="font-black text-purple-600 text-lg">+{batch.take}</span>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow key={idx} className="bg-red-50 border-l-4 border-red-500">
                                                <TableCell className="font-bold text-red-600 italic">{item.product_name}</TableCell>
                                                <TableCell className="text-center font-black text-red-600">{item.requested}</TableCell>
                                                <TableCell colSpan={3} className="text-red-600 font-black text-center text-xs">
                                                    ERROR: STOCK INSUFICIENTE EN ALMACÉN CENTRAL
                                                </TableCell>
                                            </TableRow>
                                        )
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                            <div className="text-xs text-slate-400">
                                <b>Almacén Origen:</b> {warehouses.find(w => w.id === selectedWarehouse)?.name || 'Central'}
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={() => setDialogOpen(false)} className="h-11">
                                    {['sent', 'completed', 'delivered'].includes(selectedRequest?.status) ? 'Cerrar' : 'Cancelar Proceso'}
                                </Button>
                                {['pending', 'approved', 'confirmed'].includes(selectedRequest?.status) && (
                                    <Button
                                        onClick={confirmDispatch}
                                        disabled={loading || pickingPlan.some(p => p.allocated.length === 0)}
                                        className="bg-purple-600 hover:bg-purple-700 h-11 px-8 font-bold shadow-lg transition-all hover:scale-[1.02]"
                                    >
                                        {loading ? 'Confirmando...' : 'Confirmar y Generar Guía'}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
            <Dialog open={directDispatchOpen} onOpenChange={setDirectDispatchOpen}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <ShoppingCart className="h-6 w-6 text-purple-600" />
                            Nuevo Despacho Directo (Venta / Detal)
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Tipo de Salida</Label>
                                <Select value={ddType} onValueChange={setDdType}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="sale">Venta Directa</SelectItem>
                                        <SelectItem value="outbound_dispatch">Muestra / Promoción</SelectItem>
                                        <SelectItem value="adjustment">Ajuste de Salida</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Destinatario (Médico / Farmacia / Obs)</Label>
                                <Input
                                    placeholder="Nombre del cliente o destino..."
                                    value={ddTarget}
                                    onChange={e => setDdTarget(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="border rounded-lg overflow-hidden">
                            <Table>
                                <TableHeader className="bg-slate-50">
                                    <TableRow>
                                        <TableHead>Producto</TableHead>
                                        <TableHead className="w-24">Cant.</TableHead>
                                        <TableHead className="w-10"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {ddItems.map((item, idx) => (
                                        <TableRow key={idx}>
                                            <TableCell>
                                                <Select
                                                    value={item.product_id}
                                                    onValueChange={val => {
                                                        const fresh = [...ddItems];
                                                        fresh[idx].product_id = val;
                                                        setDdItems(fresh);
                                                    }}
                                                >
                                                    <SelectTrigger className="border-none shadow-none focus:ring-0">
                                                        <SelectValue placeholder="Seleccionar producto..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    value={item.quantity}
                                                    onChange={e => {
                                                        const fresh = [...ddItems];
                                                        fresh[idx].quantity = e.target.value;
                                                        setDdItems(fresh);
                                                    }}
                                                    className="border-none shadow-none focus:ring-0 font-bold"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-slate-300 hover:text-red-500"
                                                    onClick={() => setDdItems(ddItems.filter((_, i) => i !== idx))}
                                                >
                                                    <Plus className="h-4 w-4 rotate-45" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <Button
                                variant="ghost"
                                className="w-full h-10 text-xs text-slate-500 border-t rounded-none hover:bg-slate-50"
                                onClick={() => setDdItems([...ddItems, { product_id: '', quantity: 1 }])}
                            >
                                <Plus className="h-3 w-3 mr-1" /> Añadir otro producto
                            </Button>
                        </div>

                        <div className="bg-blue-50 p-3 rounded-lg flex items-center gap-3 text-blue-700 text-xs">
                            <Info className="h-4 w-4 shrink-0" />
                            El sistema seleccionará automáticamente los lotes más próximos a vencer para esta salida.
                        </div>

                        <Button
                            className="w-full h-12 bg-purple-600 hover:bg-purple-700 font-bold"
                            onClick={handleDirectDispatch}
                            disabled={loading || !ddTarget || ddItems.some(i => !i.product_id)}
                        >
                            {loading ? "Procesando..." : "Confirmar y Despachar Stock"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
