
import { useState, useEffect } from "react";
import { ClipboardList, Download, Search, AlertCircle, History, Loader2, Trash2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import * as XLSX from 'xlsx';

interface PharmacyInventoryDialogProps {
    pharmacyId: string;
    pharmacyName: string;
    trigger?: React.ReactNode;
}

interface PharmacyStockItem {
    pharmacy_id: string;
    producto_id: string;
    product_name: string;
    tiene_stock: boolean;
    pvp: number;
    last_audit_date: string | null;
    audit_id?: string;
}

export function PharmacyInventoryDialog({ pharmacyId, pharmacyName, trigger }: PharmacyInventoryDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [stock, setStock] = useState<PharmacyStockItem[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isAdding, setIsAdding] = useState(false);
    const [products, setProducts] = useState<{ id: string, name: string }[]>([]);
    const [selectedProductId, setSelectedProductId] = useState("");
    const [newQuantity, setNewQuantity] = useState("0");
    const [newPvp, setNewPvp] = useState("0");
    const [saving, setSaving] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (open && pharmacyId) {
            loadStock();
            loadProducts();
        }
    }, [open, pharmacyId]);

    const loadStock = async () => {
        try {
            setLoading(true);

            // 1. Fetch all active products
            const { data: allProducts, error: prodError } = await (supabase as any)
                .from('products')
                .select('id, name')
                .order('name');

            if (prodError) throw prodError;

            // 2. Fetch current stock/audit records
            const { data: stockData, error: stockError } = await (supabase as any)
                .from('view_farmacia_stock_actual')
                .select('*')
                .eq('pharmacy_id', pharmacyId);

            if (stockError) throw stockError;

            // 3. Map all products and merge with stock info
            const formatted: PharmacyStockItem[] = (allProducts || []).map((p: any) => {
                const stockInfo = (stockData as any || []).find((s: any) => s.producto_id === p.id);

                return {
                    pharmacy_id: pharmacyId,
                    producto_id: p.id,
                    product_name: p.name,
                    tiene_stock: stockInfo?.tiene_stock ?? false,
                    pvp: stockInfo?.pvp ?? 0,
                    last_audit_date: stockInfo?.last_audit_date ?? null,
                    audit_id: stockInfo?.audit_id,
                };
            }).sort((a, b) => a.product_name.localeCompare(b.product_name));

            setStock(formatted);
            if (allProducts) setProducts(allProducts);
        } catch (error: any) {
            console.error("Error loading stock:", error);
            if (error.code === '42P01') {
                toast({
                    title: "Vista no encontrada",
                    description: "Por favor ejecute el script SQL de actualización.",
                    variant: "destructive"
                });
            } else {
                toast({
                    title: "Error",
                    description: "No se pudo cargar el stock de anaquel.",
                    variant: "destructive"
                });
            }
        } finally {
            setLoading(false);
        }
    };

    const loadProducts = async () => {
        try {
            const { data, error } = await (supabase as any)
                .from('products')
                .select('id, name')
                .order('name');
            if (error) throw error;
            setProducts(data || []);
        } catch (error) {
            console.error("Error loading products:", error);
        }
    };

    const handleAddStock = async () => {
        if (!selectedProductId) {
            toast({
                title: "Error",
                description: "Por favor seleccione un producto.",
                variant: "destructive"
            });
            return;
        }

        try {
            setSaving(true);

            // Get last pharmacy data to get previous quantity
            const { data: lastRecord } = await (supabase as any)
                .from('registro_pvp_farmacia')
                .select('cantidad_actual')
                .eq('producto_id', selectedProductId)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            const cantAnterior = (lastRecord as any)?.cantidad_actual || 0;
            const cantActual = parseInt(newQuantity);

            const { error } = await (supabase as any)
                .from('registro_pvp_farmacia')
                .insert({
                    producto_id: selectedProductId,
                    pharmacy_id: pharmacyId, // We might need to add this column if it doesn't exist, but typically it's linked via visit or pharmacy context
                    tiene_stock: cantActual > 0,
                    pvp: parseFloat(newPvp),
                    cantidad_actual: cantActual,
                    cantidad_anterior: cantAnterior,
                    ventas_estimadas: 0,
                    // Note: visit_id is null here as it's a manual entry
                });

            if (error) throw error;

            toast({
                title: "Éxito",
                description: "Stock actualizado correctamente.",
            });

            setIsAdding(false);
            loadStock();
            // Reset form
            setSelectedProductId("");
            setNewQuantity("0");
            setNewPvp("0");
        } catch (error: any) {
            console.error("Error adding stock:", error);
            toast({
                title: "Error",
                description: "No se pudo actualizar el stock: " + error.message,
                variant: "destructive"
            });
        } finally {
            setSaving(false);
        }
    };

    const handleExport = () => {
        const exportData = stock.map(item => ({
            'Producto': item.product_name,
            'Tiene Stock': item.tiene_stock ? 'Sí' : 'No',
            'PVP Registrado': item.pvp || 0,
            'Fecha Auditoría': item.last_audit_date ? new Date(item.last_audit_date).toLocaleDateString() : 'N/A'
        }));

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(exportData);
        XLSX.utils.book_append_sheet(wb, ws, "Stock Anaquel");
        XLSX.writeFile(wb, `Stock_${pharmacyName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const handleDeleteStock = async (auditId: string) => {
        if (!confirm("¿Está seguro de eliminar este registro de stock?")) return;

        try {
            setLoading(true);
            const { error } = await (supabase as any)
                .from('registro_pvp_farmacia')
                .delete()
                .eq('id', auditId);

            if (error) throw error;

            toast({ title: "Registro eliminado", description: "El stock ha sido actualizado." });
            loadStock();
        } catch (error: any) {
            console.error("Error deleting stock:", error);
            toast({
                title: "Error",
                description: "No se pudo eliminar el registro.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const filteredStock = stock.filter(item =>
        item.product_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" size="sm" onClick={(e) => {
                        e.stopPropagation();
                    }}>
                        <ClipboardList className="h-4 w-4 mr-2" />
                        Stock Anaquel
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent
                className="max-w-4xl max-h-[85vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
            >
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ClipboardList className="h-5 w-5 text-primary" />
                        Stock en Anaquel - {pharmacyName}
                    </DialogTitle>
                    <DialogDescription>
                        Información basada en las auditorías realizadas durante las visitas o ingresos manuales.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-4 py-4">
                    <div className="flex justify-between items-center gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar producto en stock..."
                                className="pl-8"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant={isAdding ? "ghost" : "default"}
                                onClick={() => setIsAdding(!isAdding)}
                            >
                                {isAdding ? "Cancelar" : "Nuevo Registro"}
                            </Button>
                            <Button variant="outline" onClick={handleExport} disabled={stock.length === 0}>
                                <Download className="h-4 w-4 mr-2" />
                                Exportar
                            </Button>
                        </div>
                    </div>

                    {isAdding && (
                        <div className="bg-muted/30 p-4 rounded-lg border border-primary/10 grid grid-cols-1 md:grid-cols-4 gap-4 items-end animate-in fade-in slide-in-from-top-2">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold">Producto</label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={selectedProductId}
                                    onChange={(e) => setSelectedProductId(e.target.value)}
                                >
                                    <option value="">Seleccionar...</option>
                                    {products.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold">Cantidad Actual</label>
                                <Input
                                    type="number"
                                    value={newQuantity}
                                    onChange={(e) => setNewQuantity(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold">Precio (PVP)</label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={newPvp}
                                    onChange={(e) => setNewPvp(e.target.value)}
                                />
                            </div>
                            <Button onClick={handleAddStock} disabled={saving}>
                                {saving ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Guardando...
                                    </>
                                ) : "Guardar"}
                            </Button>
                        </div>
                    )}
                </div>

                <div className="flex-1 overflow-auto border rounded-md">
                    <Table>
                        <TableHeader className="sticky top-0 bg-background z-10">
                            <TableRow>
                                <TableHead>Producto</TableHead>
                                <TableHead className="text-center">Estado</TableHead>
                                <TableHead className="text-right">PVP Última Visita</TableHead>
                                <TableHead className="text-right">Fecha Auditoría</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24">
                                        <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                                    </TableCell>
                                </TableRow>
                            ) : filteredStock.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-32">
                                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                                            <History className="h-8 w-8 mb-2 opacity-20" />
                                            <p>No hay registros de auditoría recientes.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredStock.map((item) => (
                                    <TableRow key={item.producto_id}>
                                        <TableCell className="font-medium">{item.product_name}</TableCell>
                                        <TableCell className="text-center">
                                            {item.last_audit_date === null ? (
                                                <Badge variant="outline" className="text-gray-400 bg-gray-50 border-gray-200">
                                                    Sin Auditoría
                                                </Badge>
                                            ) : item.tiene_stock ? (
                                                <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200">
                                                    En Stock
                                                </Badge>
                                            ) : (
                                                <Badge variant="destructive">
                                                    Agotado
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right font-mono">
                                            {item.pvp ? `$${item.pvp.toFixed(2)}` : '-'}
                                        </TableCell>
                                        <TableCell className="text-right text-muted-foreground text-sm">
                                            {item.last_audit_date ? new Date(item.last_audit_date).toLocaleDateString() : 'N/A'}
                                        </TableCell>
                                        <TableCell>
                                            {item.audit_id && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 text-destructive hover:text-destructive/90 hover:bg-destructive/10 p-0"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteStock(item.audit_id!);
                                                    }}
                                                    title="Eliminar registro"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </DialogContent>
        </Dialog>
    );
}
