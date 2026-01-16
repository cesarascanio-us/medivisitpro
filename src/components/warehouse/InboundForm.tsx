import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function InboundForm() {
    const { toast } = useToast();
    const [products, setProducts] = useState<any[]>([]);
    const [warehouses, setWarehouses] = useState<any[]>([]);
    const [selectedWarehouse, setSelectedWarehouse] = useState<string>('');
    const [selectedProduct, setSelectedProduct] = useState<string>('');
    const [batchNumber, setBatchNumber] = useState('');
    const [quantity, setQuantity] = useState('');
    const [expirationDate, setExpirationDate] = useState('');
    const [manufacturingDate, setManufacturingDate] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const prodQuery: any = (supabase.from('products') as any).select('*').order('name');
        const whQuery: any = (supabase.from('warehouses') as any).select('*').eq('is_active', true);

        const [prodRes, warehouseRes] = await Promise.all([prodQuery, whQuery]);

        if (prodRes.data) setProducts(prodRes.data);
        if (warehouseRes.data) {
            setWarehouses(warehouseRes.data);
            if (warehouseRes.data.length > 0) setSelectedWarehouse(warehouseRes.data[0].id);
        }
    };

    const selectedProductData = products.find(p => p.id === selectedProduct);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await (supabase.rpc('warehouse_inbound', {
                p_warehouse_id: selectedWarehouse,
                p_product_id: selectedProduct,
                p_batch_number: batchNumber,
                p_quantity: parseInt(quantity),
                p_expiration_date: expirationDate,
                p_manufacturing_date: manufacturingDate || null,
                p_notes: 'Manual Inbound via Dashboard'
            } as any) as any);

            if (error) throw error;

            toast({ title: "Recepción Exitosa", description: `Lote ${batchNumber} ingresado correctamente.` });
            setBatchNumber('');
            setQuantity('');
            setExpirationDate('');
            setManufacturingDate('');
        } catch (error) {
            console.error('Inbound Error:', error);
            toast({ title: "Error", description: "No se pudo registrar la entrada.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto p-6 border rounded-xl bg-white shadow-lg border-purple-100">
            <div className="flex items-center justify-between border-b pb-4 mb-2">
                <h2 className="text-2xl font-bold text-purple-900">Registrar Entrada de Mercancía</h2>
                {selectedProductData && (
                    <div className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm font-mono font-bold">
                        SKU: {selectedProductData.sku || 'N/A'}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Almacén Destino</label>
                    <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse}>
                        <SelectTrigger className="h-11 border-purple-100 focus:ring-purple-500"><SelectValue placeholder="Seleccionar Almacén" /></SelectTrigger>
                        <SelectContent>
                            {warehouses.map(w => (
                                <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Producto</label>
                    <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                        <SelectTrigger className="h-11 border-purple-100 focus:ring-purple-500"><SelectValue placeholder="Seleccionar Producto" /></SelectTrigger>
                        <SelectContent>
                            {products.map(p => (
                                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Número de Lote</label>
                    <Input
                        value={batchNumber}
                        onChange={e => setBatchNumber(e.target.value)}
                        placeholder="Ej: LOT-2024-001"
                        className="h-11 border-purple-100 focus:ring-purple-500 font-mono"
                        required
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Cantidad (Unidades)</label>
                    <Input
                        type="number"
                        value={quantity}
                        onChange={e => setQuantity(e.target.value)}
                        min="1"
                        className="h-11 border-purple-100 focus:ring-purple-500 font-bold"
                        required
                    />
                </div>
                <div className="space-y-2 px-4 py-2 bg-yellow-50/50 rounded-lg border border-yellow-100">
                    <p className="text-[10px] uppercase font-bold text-yellow-700 mb-1">Norma de Almacenamiento</p>
                    <p className="text-xs text-yellow-800 leading-tight">Verificar integridad del empaque y cadena de frío si aplica antes de ingresar.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        Fecha de Elaboración
                        <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">Opcional</span>
                    </label>
                    <Input
                        type="date"
                        value={manufacturingDate}
                        onChange={e => setManufacturingDate(e.target.value)}
                        className="h-11 border-purple-100 focus:ring-purple-500"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Fecha de Vencimiento</label>
                    <Input
                        type="date"
                        value={expirationDate}
                        onChange={e => setExpirationDate(e.target.value)}
                        className="h-11 border-purple-100 focus:ring-purple-500"
                        required
                    />
                </div>
            </div>

            <Button
                type="submit"
                className="w-full h-12 bg-green-600 hover:bg-green-700 text-lg font-bold shadow-md transition-all hover:scale-[1.01]"
                disabled={loading || !selectedProduct}
            >
                {loading ? 'Procesando Entrada...' : 'Confirmar Recepción de Mercancía'}
            </Button>
        </form>
    );
}
