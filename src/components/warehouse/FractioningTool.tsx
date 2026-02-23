/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Boxes, ArrowRightLeft, AlertTriangle, Loader2, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function FractioningTool() {
    const { toast } = useToast();
    const [products, setProducts] = useState<any[]>([]);
    const [warehouses, setWarehouses] = useState<any[]>([]);
    const [sourceBatches, setSourceBatches] = useState<any[]>([]);

    const [selectedWarehouse, setSelectedWarehouse] = useState<string>('');
    const [sourceProduct, setSourceProduct] = useState<string>('');
    const [selectedSourceBatch, setSelectedSourceBatch] = useState<string>('');
    const [targetProduct, setTargetProduct] = useState<string>('');

    const [sourceQty, setSourceQty] = useState('1');
    const [targetQty, setTargetQty] = useState('');
    const [notes, setNotes] = useState('Fraccionamiento Manual');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadInitialData();
    }, []);

    useEffect(() => {
        if (selectedWarehouse && sourceProduct) {
            loadSourceBatches();
        }
    }, [selectedWarehouse, sourceProduct]);

    const loadInitialData = async () => {
        const prodQuery: any = (supabase.from('products') as any).select('*').order('name');
        const whQuery: any = (supabase.from('warehouses') as any).select('*').eq('is_active', true);

        const [prodRes, whRes] = await Promise.all([prodQuery, whQuery]);
        if (prodRes.data) setProducts(prodRes.data);
        if (whRes.data) {
            setWarehouses(whRes.data);
            if (whRes.data.length > 0) setSelectedWarehouse(whRes.data[0].id);
        }
    };

    const loadSourceBatches = async () => {
        const { data } = await (supabase.from('warehouse_batches') as any)
            .select('*')
            .eq('warehouse_id', selectedWarehouse)
            .eq('product_id', sourceProduct)
            .gt('quantity', 0)
            .order('expiration_date', { ascending: true });

        setSourceBatches(data || []);
        if (data && data.length > 0) setSelectedSourceBatch(data[0].id);
    };

    const handleFraction = async () => {
        if (!selectedSourceBatch || !targetProduct || !sourceQty || !targetQty) {
            toast({ title: "Datos incompletos", description: "Por favor complete todos los campos.", variant: "destructive" });
            return;
        }

        setLoading(true);
        try {
            const { error } = await ((supabase as any).rpc('warehouse_fraction_batch', {
                p_source_batch_id: selectedSourceBatch,
                p_source_quantity_to_reduce: parseInt(sourceQty),
                p_target_product_id: targetProduct,
                p_target_quantity_to_add: parseInt(targetQty),
                p_notes: notes
            }));

            if (error) throw error;

            toast({
                title: "Fraccionamiento Exitoso",
                description: "Se han generado los movimientos de conversión correctamente.",
                className: "bg-green-600 text-white"
            });

            // Reset
            setSourceQty('1');
            setTargetQty('');
            loadSourceBatches();
        } catch (error: any) {
            console.error(error);
            toast({
                title: "Error en proceso",
                description: error.message || "No se pudo realizar el fraccionamiento.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const currentBatch = sourceBatches.find(b => b.id === selectedSourceBatch);

    return (
        <Card className="border-purple-100 shadow-xl overflow-hidden">
            <CardHeader className="bg-purple-900 text-white">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/10 rounded-lg">
                        <Boxes className="h-6 w-6" />
                    </div>
                    <div>
                        <CardTitle className="text-xl font-bold">Herramienta de Fraccionamiento (Detailing)</CardTitle>
                        <CardDescription className="text-purple-100">Convierte unidades mayores en unidades detalladas para venta o muestra.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    {/* SOURCE SECTION */}
                    <div className="space-y-6">
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                            <h3 className="text-sm font-black text-slate-500 uppercase mb-4 flex items-center gap-2">
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-[10px]">1</span>
                                Origen (Unidad Mayor)
                            </h3>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-600">Almacén Origen</label>
                                    <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse}>
                                        <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {warehouses.map(w => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-600">Producto Base (Caja/Pack)</label>
                                    <Select value={sourceProduct} onValueChange={setSourceProduct}>
                                        <SelectTrigger className="bg-white"><SelectValue placeholder="Seleccionar producto" /></SelectTrigger>
                                        <SelectContent>
                                            {products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-600">Seleccionar Lote</label>
                                    <Select value={selectedSourceBatch} onValueChange={setSelectedSourceBatch}>
                                        <SelectTrigger className="bg-white"><SelectValue placeholder="Seleccionar lote" /></SelectTrigger>
                                        <SelectContent>
                                            {sourceBatches.map(b => (
                                                <SelectItem key={b.id} value={b.id}>
                                                    Lote: {b.batch_number} (Disp: {b.quantity}) - Vence: {new Date(b.expiration_date).toLocaleDateString()}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-600">Cantidad a Reducir</label>
                                    <Input
                                        type="number"
                                        value={sourceQty}
                                        onChange={e => setSourceQty(e.target.value)}
                                        className="h-10 bg-white"
                                        min="1"
                                        max={currentBatch?.quantity || 1}
                                    />
                                    {currentBatch && (
                                        <p className="text-[10px] text-amber-600 font-bold">
                                            Quedarán {currentBatch.quantity - parseInt(sourceQty || '0')} unidades en este lote.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* TARGET SECTION */}
                    <div className="space-y-6">
                        <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                            <h3 className="text-sm font-black text-purple-600 uppercase mb-4 flex items-center gap-2">
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-600 text-white text-[10px]">2</span>
                                Destino (Unidad Detallada)
                            </h3>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-purple-600">Producto Destino (Fracción)</label>
                                    <Select value={targetProduct} onValueChange={setTargetProduct}>
                                        <SelectTrigger className="bg-white"><SelectValue placeholder="Seleccionar producto detallado" /></SelectTrigger>
                                        <SelectContent>
                                            {products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <p className="text-[10px] text-purple-400 italic flex items-center gap-1">
                                        <Info className="h-3 w-3" /> Puede ser el mismo producto o una entrada de catálogo detallada.
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-purple-600">Cantidad a Generar</label>
                                    <Input
                                        type="number"
                                        value={targetQty}
                                        onChange={e => setTargetQty(e.target.value)}
                                        className="h-10 bg-white font-black text-purple-700 text-lg"
                                        placeholder="Ej: 30"
                                    />
                                    <p className="text-[10px] text-purple-500">Total de unidades obtenidas después del fraccionamiento.</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-600">Notas de Auditoría</label>
                                    <Input
                                        value={notes}
                                        onChange={e => setNotes(e.target.value)}
                                        className="h-10 bg-white text-xs"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-amber-50 rounded-lg p-4 border border-amber-200 flex items-start gap-3">
                            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
                            <div className="text-[11px] text-amber-800 leading-tight">
                                <b>Importante:</b> Esta operación es irreversible. Se creará un nuevo lote con el sufijo <span className="font-mono text-amber-900 font-bold">-DET</span> para facilitar su identificación en el Kardex.
                            </div>
                        </div>

                        <Button
                            onClick={handleFraction}
                            disabled={loading || !currentBatch}
                            className="w-full h-12 bg-purple-600 hover:bg-purple-700 font-bold shadow-lg"
                        >
                            {loading ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : <ArrowRightLeft className="mr-2 h-5 w-5" />}
                            Confirmar Fraccionamiento
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
