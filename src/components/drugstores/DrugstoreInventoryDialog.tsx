
import { useState, useEffect, useRef } from "react";
import { Package, Upload, Download, Search, AlertCircle, Save, X, Loader2 } from "lucide-react";
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
import { useDemoData } from "@/contexts/MockDataProvider";

interface DrugstoreInventoryDialogProps {
    drugstoreId: string;
    drugstoreName: string;
    trigger?: React.ReactNode;
}

interface InventoryItem {
    id: string; // inventario_droguerias.id
    product_id: string;
    product_name: string;
    quantity: number;
    price: number;
    updated_at: string;
}

export function DrugstoreInventoryDialog({ drugstoreId, drugstoreName, trigger }: DrugstoreInventoryDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [importing, setImporting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    // Demo mode hook
    const demoData = useDemoData();

    useEffect(() => {
        if (open && drugstoreId) {
            loadInventory();
        }
    }, [open, drugstoreId]);

    const loadInventory = async () => {
        try {
            setLoading(true);

            // DEMO MODE: Use mock data
            if (demoData) {
                console.log("DrugstoreInventoryDialog: Using mock demo data for", drugstoreId);
                const mockItems = demoData.drugstoreInventory
                    .filter((item: any) => item.drugstore_id === drugstoreId)
                    .map((item: any) => ({
                        id: item.id,
                        product_id: item.product_id,
                        product_name: item.product_name,
                        quantity: item.stock,
                        price: item.pharmacy_price,
                        updated_at: new Date().toISOString()
                    }));
                setInventory(mockItems);
                setLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from('inventario_droguerias' as any)
                .select(`
                    id,
                    product_id,
                    cantidad,
                    precio_venta_farmacia,
                    updated_at,
                    products (
                        name
                    )
                `)
                .eq('drogueria_id', drugstoreId);

            if (error) throw error;

            const formatted: InventoryItem[] = (data || []).map((item: any) => ({
                id: item.id,
                product_id: item.product_id,
                product_name: item.products?.name || 'Producto Desconocido',
                quantity: item.cantidad,
                price: item.precio_venta_farmacia,
                updated_at: item.updated_at
            })).sort((a, b) => a.product_name.localeCompare(b.product_name));

            setInventory(formatted);
        } catch (error) {
            console.error("Error loading inventory:", error);
            toast({
                title: "Error",
                description: "No se pudo cargar el inventario.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setImporting(true);
        const reader = new FileReader();

        reader.onload = async (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);

                if (jsonData.length === 0) {
                    throw new Error("El archivo está vacío");
                }

                // Get all products to map names to IDs
                const { data: productsData } = await supabase
                    .from('products')
                    .select('id, name');

                const productMap = new Map();
                productsData?.forEach(p => {
                    productMap.set(p.name.toLowerCase().trim(), p.id);
                });

                let processedCount = 0;
                let errorCount = 0;

                for (const row of jsonData) {
                    // Expected columns: Producto, Precio, Cantidad
                    // We try to be flexible with column names
                    const productName = row['Producto'] || row['producto'] || row['Nombre'] || row['nombre'];
                    const price = parseFloat(row['Precio'] || row['precio'] || row['PVP'] || '0');
                    const quantity = parseInt(row['Cantidad'] || row['cantidad'] || row['Stock'] || '0');

                    if (!productName) continue;

                    const normalizedName = productName.toString().toLowerCase().trim();
                    const productId = productMap.get(normalizedName);

                    if (productId) {
                        // Upsert inventory
                        const { error } = await supabase
                            .from('inventario_droguerias' as any)
                            .upsert({
                                drogueria_id: drugstoreId,
                                producto_id: productId,
                                cantidad: quantity,
                                precio_venta_farmacia: price,
                                updated_at: new Date().toISOString()
                            }, { onConflict: 'drogueria_id, producto_id' });

                        if (error) {
                            console.error("Error updating product:", productName, error);
                            errorCount++;
                        } else {
                            processedCount++;
                        }
                    } else {
                        console.warn("Product not found:", productName);
                        errorCount++;
                    }
                }

                toast({
                    title: "Importación completada",
                    description: `Se procesaron ${processedCount} productos correctamente. ${errorCount > 0 ? `${errorCount} errores.` : ''}`,
                    variant: errorCount > 0 ? "default" : "default" // could be warning based on errors
                });

                loadInventory();

            } catch (error) {
                console.error("Error processing file:", error);
                toast({
                    title: "Error de importación",
                    description: "No se pudo procesar el archivo. Verifique el formato.",
                    variant: "destructive"
                });
            } finally {
                setImporting(false);
                if (fileInputRef.current) fileInputRef.current.value = "";
            }
        };

        reader.readAsArrayBuffer(file);
    };

    const handleExport = () => {
        const exportData = inventory.map(item => ({
            'Producto': item.product_name,
            'Precio Farmacia': item.price,
            'Stock Disponible': item.quantity,
            'Última Actualización': new Date(item.updated_at).toLocaleDateString()
        }));

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(exportData);
        XLSX.utils.book_append_sheet(wb, ws, "Inventario");
        XLSX.writeFile(wb, `Inventario_${drugstoreName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const filteredInventory = inventory.filter(item =>
        item.product_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" size="sm">
                        <Package className="h-4 w-4 mr-2" />
                        Inventario
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5 text-primary" />
                        Inventario - {drugstoreName}
                    </DialogTitle>
                    <DialogDescription>
                        Administra precios y disponibilidad de productos para esta droguería.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex justify-between items-center py-4 gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar producto..."
                            className="pl-8"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <input
                            type="file"
                            accept=".xlsx, .xls, .csv"
                            ref={fileInputRef}
                            style={{ display: "none" }}
                            onChange={handleFileUpload}
                        />
                        <Button variant="outline" onClick={handleImportClick} disabled={importing}>
                            {importing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                            Importar Excel
                        </Button>
                        <Button variant="outline" onClick={handleExport} disabled={inventory.length === 0}>
                            <Download className="h-4 w-4 mr-2" />
                            Exportar
                        </Button>
                    </div>
                </div>

                <div className="flex-1 overflow-auto border rounded-md">
                    <Table>
                        <TableHeader className="sticky top-0 bg-background z-10">
                            <TableRow>
                                <TableHead>Producto</TableHead>
                                <TableHead className="text-right">Precio Farmacia</TableHead>
                                <TableHead className="text-center">Stock</TableHead>
                                <TableHead className="text-center">Estado</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center h-24">
                                        <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                                    </TableCell>
                                </TableRow>
                            ) : filteredInventory.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center h-32">
                                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                                            <Package className="h-8 w-8 mb-2 opacity-20" />
                                            <p>No hay productos en inventario.</p>
                                            <Button variant="link" onClick={handleImportClick}>Importar lista</Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredInventory.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">{item.product_name}</TableCell>
                                        <TableCell className="text-right font-mono">${item.price.toFixed(2)}</TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant={item.quantity > 0 ? "outline" : "destructive"}>
                                                {item.quantity} unids.
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {item.quantity === 0 ? (
                                                <Badge variant="destructive" className="text-[10px]">Agotado</Badge>
                                            ) : item.quantity < 20 ? (
                                                <Badge variant="secondary" className="text-orange-600 bg-orange-50 hover:bg-orange-100 border-orange-200 text-[10px]">Bajo Stock</Badge>
                                            ) : (
                                                <Badge variant="secondary" className="text-green-600 bg-green-50 hover:bg-green-100 border-green-200 text-[10px]">Disponible</Badge>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                <div className="text-xs text-muted-foreground mt-4 pt-2 border-t">
                    <p>Consejo: El archivo Excel debe tener las columnas "Producto", "Precio" y "Cantidad". El nombre del producto debe coincidir exactamente con el catálogo.</p>
                </div>
            </DialogContent>
        </Dialog>
    );
}
