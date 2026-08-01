/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, AlertTriangle, CheckCircle, Boxes, Tag, Calendar, History as HistoryIcon, Boxes as BoxesIcon } from "lucide-react";
import { EliteKPICard, EliteTabsList, EliteTabsTrigger } from "@/components/layout/DesignSystem";

export default function InventoryKardex() {
    const [inventory, setInventory] = useState<any[]>([]);
    const [batches, setBatches] = useState<any[]>([]);
    const [movements, setMovements] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const [invRes, batchRes, moveRes] = await Promise.all([
            (supabase.from('view_warehouse_stock') as any).select('*'),
            (supabase.from('warehouse_batches') as any)
                .select(`
                    id,
                    batch_number,
                    quantity,
                    expiration_date,
                    manufacturing_date,
                    product_id,
                    warehouse_id,
                    quality_status,
                    products(name, sku)
                `)
                .gt('quantity', 0)
                .order('expiration_date', { ascending: true }),
            (supabase.from('warehouse_movements') as any)
                .select(`
                    *,
                    products(name, sku),
                    batch:warehouse_batches(batch_number)
                `)
                .order('created_at', { ascending: false })
                .limit(50)
        ]);

        if (invRes.data) setInventory(invRes.data);
        if (batchRes.data) setBatches(batchRes.data);
        if (moveRes.data) setMovements(moveRes.data);
        setLoading(false);
    };

    const filteredInventory = inventory.filter(item =>
        item.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredBatches = batches.filter(batch =>
        batch.batch_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        batch.products?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        batch.products?.sku?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredMovements = movements.filter(m =>
        m.products?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.batch?.batch_number?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-muted/30 p-4 rounded-xl border border-purple-100">
                <div className="flex items-center gap-3">
                    <Boxes className="h-6 w-6 text-primary" />
                    <h3 className="font-bold text-lg text-foreground">Control de Existencias y Trazabilidad</h3>
                </div>
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400 h-4 w-4" />
                    <Input
                        placeholder="Buscar por producto, SKU o lote..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 border-purple-200 focus-visible:ring-purple-500 bg-card"
                    />
                </div>
            </div>

            <Tabs defaultValue="consolidated" className="w-full">
                <EliteTabsList className="mb-6">
                    <EliteTabsTrigger value="consolidated" label="Stock Consolidado" icon={Boxes} />
                    <EliteTabsTrigger value="batches" label="Detalle por Lote" icon={Tag} />
                    <EliteTabsTrigger value="movements" label="Movimientos" icon={HistoryIcon} />
                </EliteTabsList>

                <TabsContent value="consolidated">
                    <div className="rounded-xl border shadow-sm bg-card overflow-hidden">
                        <Table>
                            <TableHeader className="bg-muted/50 text-foreground font-bold">
                                <TableRow>
                                    <TableHead>Producto</TableHead>
                                    <TableHead>Categoría</TableHead>
                                    <TableHead className="text-right">Stock Total</TableHead>
                                    <TableHead className="text-right"># Lotes</TableHead>
                                    <TableHead>Próx. Vencimiento</TableHead>
                                    <TableHead>Estado</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredInventory.map((item, idx) => {
                                    const monthsToExpiration = item.next_expiration ?
                                        (new Date(item.next_expiration).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 30) : 12;

                                    return (
                                        <TableRow key={idx} className="hover:bg-muted/50/50">
                                            <TableCell className="font-medium text-foreground">{item.product_name}</TableCell>
                                            <TableCell className="text-slate-500 text-xs">{item.category}</TableCell>
                                            <TableCell className="text-right font-bold text-lg text-slate-800">{item.total_quantity}</TableCell>
                                            <TableCell className="text-right">{item.batch_count}</TableCell>
                                            <TableCell className="font-mono text-xs">{item.next_expiration}</TableCell>
                                            <TableCell>
                                                {monthsToExpiration < 3 ? (
                                                    <Badge variant="destructive" className="flex items-center gap-1 w-fit">
                                                        <AlertTriangle className="h-3 w-3" /> Riesgo
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1 w-fit">
                                                        <CheckCircle className="h-3 w-3" /> Óptimo
                                                    </Badge>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>

                <TabsContent value="batches">
                    <div className="rounded-xl border shadow-sm bg-card overflow-hidden">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead>Producto / SKU</TableHead>
                                    <TableHead>Lote #</TableHead>
                                    <TableHead className="text-right">Cantidad</TableHead>
                                    <TableHead>Elaboración</TableHead>
                                    <TableHead>Vencimiento</TableHead>
                                    <TableHead>Calidad</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredBatches.map((batch) => (
                                    <TableRow key={batch.id} className="hover:bg-muted/50/50">
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{batch.products?.name}</span>
                                                <span className="text-[10px] text-slate-400 font-mono">SKU: {batch.products?.sku || 'N/A'}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-mono font-bold text-purple-700">{batch.batch_number}</TableCell>
                                        <TableCell className="text-right font-bold">{batch.quantity}</TableCell>
                                        <TableCell className="text-slate-500 text-xs text-center">
                                            {batch.manufacturing_date ? (
                                                <div className="flex items-center justify-center gap-1">
                                                    <Calendar className="h-3 w-3" /> {batch.manufacturing_date}
                                                </div>
                                            ) : '-'}
                                        </TableCell>
                                        <TableCell className="font-mono text-xs font-bold text-slate-700">{batch.expiration_date}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="text-[10px] uppercase font-bold text-green-600 border-green-200 bg-green-50/50">
                                                {batch.quality_status || 'Aprobado'}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>

                <TabsContent value="movements">
                    <div className="rounded-xl border shadow-sm bg-card overflow-hidden">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Tipo</TableHead>
                                    <TableHead>Lote</TableHead>
                                    <TableHead>Producto</TableHead>
                                    <TableHead className="text-right">Cantidad</TableHead>
                                    <TableHead>Referencias/Notas</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredMovements.map((m) => (
                                    <TableRow key={m.id} className="hover:bg-muted/50/50">
                                        <TableCell className="text-xs text-slate-500">
                                            {new Date(m.created_at).toLocaleString()}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={`text-[10px] font-bold uppercase ${m.movement_type === 'inbound_purchase' ? 'text-green-600 border-green-200 bg-green-50' :
                                                m.movement_type === 'outbound_dispatch' ? 'text-primary border-purple-200 bg-muted/30' :
                                                    m.movement_type === 'sale' ? 'text-blue-600 border-blue-200 bg-blue-50' :
                                                        m.movement_type === 'adjustment' ? 'text-amber-600 border-amber-200 bg-amber-50' :
                                                            'text-slate-500'
                                                }`}>
                                                {m.movement_type}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="font-mono text-xs font-bold">{m.batch?.batch_number || 'N/A'}</TableCell>
                                        <TableCell className="text-xs font-medium">{m.products?.name}</TableCell>
                                        <TableCell className={`text-right font-black ${m.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                                        </TableCell>
                                        <TableCell className="text-[10px] text-slate-400 max-w-[200px] truncate">
                                            {m.notes || m.related_request_id || '-'}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
