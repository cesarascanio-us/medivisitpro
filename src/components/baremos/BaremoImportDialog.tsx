import { useState, useRef } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Upload, FileSpreadsheet, AlertTriangle, CheckCircle2, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Papa from "papaparse";

interface BaremoImportDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    organizationId: string;
    onSuccess: () => void;
}

export function BaremoImportDialog({ open, onOpenChange, organizationId, onSuccess }: BaremoImportDialogProps) {
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [file, setFile] = useState<File | null>(null);
    const [parsedData, setParsedData] = useState<any[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [progress, setProgress] = useState(0);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        setFile(selectedFile);
        Papa.parse(selectedFile, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                setParsedData(results.data);
            },
            error: (error: any) => {
                toast({ title: "Error al leer el archivo", description: error.message, variant: "destructive" });
            }
        });
    };

    const handleImport = async () => {
        if (!parsedData.length || !organizationId) return;
        setIsUploading(true);
        setProgress(0);

        try {
            // First, fetch existing baremos to check for updates vs inserts
            const { data: existingBaremos } = await (supabase as any)
                .from("baremos")
                .select("id, drugstore_id, product_id")
                .eq("organization_id", organizationId);

            const existingMap = new Map();
            if (existingBaremos) {
                existingBaremos.forEach((b: any) => {
                    existingMap.set(`${b.drugstore_id}_${b.product_id}`, b.id);
                });
            }

            let successCount = 0;
            let errorCount = 0;

            for (let i = 0; i < parsedData.length; i++) {
                const row = parsedData[i];
                if (!row.drugstore_id || !row.product_id || !row.price) {
                    errorCount++;
                    continue;
                }

                const price = parseFloat(row.price);
                const discount = parseFloat(row.discount_percentage) || 0;
                const minQty = parseInt(row.min_quantity, 10) || 1;

                if (isNaN(price)) {
                    errorCount++;
                    continue;
                }

                const payload = {
                    organization_id: organizationId,
                    drugstore_id: row.drugstore_id,
                    product_id: row.product_id,
                    price: price,
                    discount_percentage: discount,
                    min_quantity: minQty,
                    notes: row.notes || null,
                    updated_at: new Date().toISOString()
                };

                const existingId = existingMap.get(`${row.drugstore_id}_${row.product_id}`);

                if (existingId) {
                    // Update
                    const { error } = await (supabase as any)
                        .from("baremos")
                        .update(payload)
                        .eq("id", existingId);
                    if (!error) successCount++;
                    else errorCount++;
                } else {
                    // Insert
                    const { error } = await (supabase as any)
                        .from("baremos")
                        .insert(payload);
                    if (!error) successCount++;
                    else errorCount++;
                }

                setProgress(Math.round(((i + 1) / parsedData.length) * 100));
            }

            toast({
                title: "Importación completada",
                description: `${successCount} registros procesados con éxito. ${errorCount > 0 ? `(${errorCount} errores)` : ''}`,
            });

            if (successCount > 0) {
                onSuccess();
                handleClose();
            }

        } catch (error: any) {
            toast({ title: "Fallo en la importación", description: error.message, variant: "destructive" });
        } finally {
            setIsUploading(false);
        }
    };

    const handleClose = () => {
        setFile(null);
        setParsedData([]);
        setProgress(0);
        setIsUploading(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={(v) => !isUploading && (v ? onOpenChange(true) : handleClose())}>
            <DialogContent className="max-w-2xl bg-card border-border/40 rounded-[2rem] shadow-premium-2xl p-0 overflow-hidden font-display">
                <DialogHeader className="p-8 border-b border-border/40 bg-muted/5">
                    <DialogTitle className="text-2xl font-black text-foreground uppercase tracking-tighter flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                            <Upload className="h-5 w-5 text-indigo-500" />
                        </div>
                        Importación Masiva de Precios
                    </DialogTitle>
                    <DialogDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground opacity-70 pt-2">
                        Sube un archivo CSV con las columnas <span className="text-primary">drugstore_id, product_id, price, discount_percentage, min_quantity</span>.
                    </DialogDescription>
                </DialogHeader>

                <div className="p-8 space-y-6">
                    {!file ? (
                        <div 
                            className="border-2 border-dashed border-border/40 rounded-[2rem] p-12 text-center hover:bg-muted/5 transition-colors cursor-pointer group"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input 
                                type="file" 
                                accept=".csv" 
                                className="hidden" 
                                ref={fileInputRef} 
                                onChange={handleFileChange}
                            />
                            <FileSpreadsheet className="h-16 w-16 mx-auto mb-6 text-muted-foreground opacity-30 group-hover:opacity-60 transition-opacity" />
                            <h3 className="text-xl font-black text-foreground uppercase tracking-tighter mb-2">Seleccionar Archivo CSV</h3>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                Haz clic aquí para buscar el archivo en tu ordenador.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between p-4 bg-muted/10 rounded-xl border border-border/40">
                                <div className="flex items-center gap-4">
                                    <FileSpreadsheet className="h-8 w-8 text-primary" />
                                    <div>
                                        <p className="font-black text-sm uppercase tracking-tight text-foreground">{file.name}</p>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{parsedData.length} Filas Detectadas</p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => { setFile(null); setParsedData([]); }} disabled={isUploading} className="text-rose-500 hover:text-rose-600 hover:bg-rose-500/10">
                                    Cambiar
                                </Button>
                            </div>

                            {parsedData.length > 0 && (
                                <div className="border border-border/40 rounded-xl overflow-hidden">
                                    <Table>
                                        <TableHeader className="bg-muted/5">
                                            <TableRow className="border-border/40">
                                                <TableHead className="text-[10px] font-black uppercase tracking-widest">Droguería ID</TableHead>
                                                <TableHead className="text-[10px] font-black uppercase tracking-widest">Producto ID</TableHead>
                                                <TableHead className="text-[10px] font-black uppercase tracking-widest">Precio</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {parsedData.slice(0, 5).map((row, idx) => (
                                                <TableRow key={idx} className="border-border/20">
                                                    <TableCell className="text-[10px] font-mono">{row.drugstore_id?.substring(0,8)}...</TableCell>
                                                    <TableCell className="text-[10px] font-mono">{row.product_id?.substring(0,8)}...</TableCell>
                                                    <TableCell className="text-[10px] font-bold">${row.price}</TableCell>
                                                </TableRow>
                                            ))}
                                            {parsedData.length > 5 && (
                                                <TableRow>
                                                    <TableCell colSpan={3} className="text-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest py-3 bg-muted/5">
                                                        ... Y {parsedData.length - 5} filas más
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}

                            {isUploading && (
                                <div className="space-y-2">
                                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                                        <span className="text-muted-foreground">Procesando...</span>
                                        <span className="text-primary">{progress}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-muted/20 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-primary transition-all duration-300 ease-out" 
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <DialogFooter className="p-8 pt-0 gap-3 border-t border-border/40 mt-4 bg-muted/5">
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        disabled={isUploading}
                        className="h-12 px-6 rounded-xl font-black uppercase text-[10px] tracking-widest border-border/40 bg-card"
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleImport}
                        disabled={!file || parsedData.length === 0 || isUploading}
                        className="h-12 px-8 rounded-xl font-black uppercase text-[10px] tracking-widest bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20"
                    >
                        {isUploading ? (
                            <><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Procesando</>
                        ) : (
                            <><CheckCircle2 className="h-4 w-4 mr-2" /> Iniciar Importación</>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
