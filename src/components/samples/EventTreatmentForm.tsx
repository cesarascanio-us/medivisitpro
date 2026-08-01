/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Zap, Activity, Trash2, History, AlertTriangle } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { SignaturePad, SignaturePadRef, dataUrlToBlob } from "@/components/common/SignaturePad";

interface Product {
    id: string;
    text: string; // name
    stock: number;
}

interface DeliveryHistory {
    id: string;
    product_id: string;
    quantity: number;
    created_at: string;
    notes: string;
    products: { name: string };
}

interface EventTreatmentFormProps {
    eventId?: string;
    onSuccess?: () => void;
}

import { useDemoData } from "@/contexts/MockDataProvider";

export function EventTreatmentForm({ eventId, onSuccess }: EventTreatmentFormProps) {
    const { user } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);
    const demoData = useDemoData();

    // History State
    const [history, setHistory] = useState<DeliveryHistory[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    // Form State
    const [selectedProduct, setSelectedProduct] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [pathology, setPathology] = useState("");

    // Signature State
    const signatureRef = useRef<SignaturePadRef>(null);
    const [signatureRequired, setSignatureRequired] = useState(false);

    useEffect(() => {
        if (user || demoData) {
            loadValues();
        }
    }, [user, demoData]);

    useEffect(() => {
        if (eventId) loadHistory();
    }, [eventId]);

    const loadValues = async () => {
        if (demoData) {
            console.log("EventTreatmentForm: Loading demo products");
            setProducts(demoData.inventory.map((i: any) => ({
                id: i.product_id,
                text: i.products.name,
                stock: i.quantity
            })));
            return;
        }

        const { data } = await supabase
            .from('rep_inventory')
            .select('product_id, quantity, products(name)')
            .gt('quantity', 0);

        if (data) {
            setProducts(data.map((i: any) => ({
                id: i.product_id,
                text: i.products.name,
                stock: i.quantity
            })));
        }
    };

    const loadHistory = async () => {
        if (!eventId) return;
        setLoadingHistory(true);

        if (demoData) {
            console.log("EventTreatmentForm: Loading demo history");
            setHistory(demoData.sampleMovements.filter(m => m.event_id === eventId));
            setLoadingHistory(false);
            return;
        }

        const { data } = await supabase
            .from('sample_movements')
            .select(`
                id, 
                product_id, 
                quantity, 
                created_at, 
                notes,
                products ( name )
            `)
            .eq('event_id', eventId)
            .eq('movement_type', 'treatment_start')
            .order('created_at', { ascending: false });

        // @ts-expect-error - Join typing for Supabase
        setHistory(data || []);
        setLoadingHistory(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!eventId) {
            toast({ title: "Error", description: "No hay un evento activo seleccionado.", variant: "destructive" });
            return;
        }
        if (!selectedProduct) return;

        // Validate signature if required
        if (signatureRequired && signatureRef.current?.isEmpty()) {
            toast({
                title: "Firma Requerida",
                description: "Debe obtener la firma del paciente antes de entregar muestras.",
                variant: "destructive"
            });
            return;
        }

        setLoading(true);
        try {
            if (demoData) {
                console.log("EventTreatmentForm: Handling demo submission");
                // Simulate success in demo mode
                toast({ title: "Registrado (Demo)", description: "Tratamiento entregado exitosamente en modo demo." });
                signatureRef.current?.clear();
                setSignatureRequired(false);
                setQuantity(1);
                setPathology("");
                if (onSuccess) onSuccess();
                setLoading(false);
                return;
            }

            // Validate event is still active before processing
            const { data: eventData, error: eventError } = await supabase
                .from('events')
                .select('status')
                .eq('id', eventId)
                .single();

            if (eventError || !eventData) {
                toast({
                    title: "Error",
                    description: "No se pudo verificar el estado del evento.",
                    variant: "destructive"
                });
                setLoading(false);
                return;
            }

            const validStatuses = ['active', 'in_progress', 'scheduled'];
            if (!validStatuses.includes(eventData.status)) {
                toast({
                    title: "Evento No Activo",
                    description: `Este evento está "${eventData.status}". Solo puede registrar entregas en eventos activos.`,
                    variant: "destructive"
                });
                setLoading(false);
                return;
            }

            // Validar que se reciba firma si es obligatoria
            if (signatureRequired && signatureRef.current?.isEmpty()) {
                toast({
                    title: "Firma Requerida",
                    description: "Debe obtener la firma del paciente antes de entregar muestras.",
                    variant: "destructive"
                });
                setLoading(false);
                return;
            }

            let signatureUrl: string | null = null;

            // Upload signature if provided
            if (!signatureRef.current?.isEmpty()) {
                const dataUrl = signatureRef.current?.getDataUrl();
                if (dataUrl) {
                    const blob = dataUrlToBlob(dataUrl);
                    const fileName = `signature_${Date.now()}_${user?.id}.png`;

                    const { data: uploadData, error: uploadError } = await supabase.storage
                        .from('signatures')
                        .upload(fileName, blob, { contentType: 'image/png' });

                    if (uploadError) {
                        console.error('Signature upload error:', uploadError);
                    } else {
                        const { data: publicUrl } = supabase.storage
                            .from('signatures')
                            .getPublicUrl(fileName);
                        signatureUrl = publicUrl.publicUrl;
                    }
                }
            }

            // Get FEFO batch
            const { data: batches } = await supabase
                .from('warehouse_batches')
                .select('batch_number')
                .eq('product_id', selectedProduct)
                .not('expiration_date', 'is', null)
                .order('expiration_date', { ascending: true })
                .limit(1);

            const batchNumber = batches && batches.length > 0 ? batches[0].batch_number : null;

            const { error } = await supabase.from('sample_movements').insert({
                user_id: user?.id,
                product_id: selectedProduct,
                quantity: quantity,
                movement_type: 'treatment_start',
                event_id: eventId,
                batch_number: batchNumber,
                notes: pathology ? `Patología: ${pathology} | Lote: ${batchNumber || 'N/A'}` : `Inicio de Tratamiento | Lote: ${batchNumber || 'N/A'}`,
                signature_url: signatureUrl
            });

            if (error) throw error;

            // Clear signature
            signatureRef.current?.clear();
            setSignatureRequired(false);

            toast({ title: "Registrado", description: "Tratamiento entregado exitosamente." });

            setQuantity(1);
            setPathology("");

            if (onSuccess) onSuccess();

            loadValues(); // Refresh stock
            loadHistory(); // Refresh history
        } catch (error) {
            toast({ title: "Error", description: "Fallo al registrar tratamiento", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (movementId: string) => {
        try {
            if (demoData) {
                toast({ title: "Eliminado (Demo)", description: "Registro eliminado y stock restaurado en modo demo." });
                return;
            }

            const { error } = await supabase
                .from('sample_movements')
                .delete()
                .eq('id', movementId);

            if (error) throw error;

            toast({ title: "Eliminado", description: "Registro eliminado y stock restaurado." });
            loadHistory();
            loadValues(); // Update stock in form
        } catch (error) {
            toast({ title: "Error", description: "No se pudo eliminar el registro.", variant: "destructive" });
        }
    };

    const currentStock = products.find(p => p.id === selectedProduct)?.stock || 0;

    return (
        <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4 border p-4 rounded-lg bg-card shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                    <Zap className="h-5 w-5 text-yellow-500" />
                    <h3 className="font-semibold">Registro Rápido: Inicio de Tratamiento</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Producto</Label>
                        <Select value={selectedProduct} onValueChange={(val) => { setSelectedProduct(val); setSignatureRequired(true); }}>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar producto..." />
                            </SelectTrigger>
                            <SelectContent>
                                {products.map(p => (
                                    <SelectItem key={p.id} value={p.id}>
                                        {p.text} (Stock: {p.stock})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Cantidad</Label>
                        <div className="flex items-center gap-2">
                            <Input
                                type="number"
                                min={1}
                                max={currentStock}
                                value={quantity}
                                onChange={(e) => setQuantity(parseInt(e.target.value))}
                            />
                            <span className="text-xs text-muted-foreground whitespace-nowrap">Máx: {currentStock}</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Patología / Notas (Opcional)</Label>
                    <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Ej: Hipertensión Severa"
                            value={pathology}
                            onChange={(e) => setPathology(e.target.value)}
                        />
                    </div>
                </div>

                {/* Signature Pad - Shown when products selected */}
                {selectedProduct && (
                    <div className="space-y-2">
                        <div className="flex items-center gap-3 text-amber-600 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-900/10 p-3 rounded-lg border border-amber-100 dark:border-amber-800 shadow-sm animate-in fade-in slide-in-from-top-1 duration-300">
                            <div className="flex-shrink-0 p-1.5 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                                <AlertTriangle className="h-4 w-4" />
                            </div>
                            <span className="text-sm font-semibold leading-tight">
                                Firma requerida para compliance farmacéutico
                            </span>
                        </div>
                        <SignaturePad
                            ref={signatureRef}
                            title="Firma del Receptor"
                            subtitle="El paciente debe firmar para confirmar la recepción de muestras"
                            required={true}
                            width={350}
                            height={150}
                        />
                    </div>
                )}

                <Button type="submit" className="w-full btn-medical" disabled={loading || !selectedProduct || currentStock < quantity}>
                    {loading ? "Registrando..." : "Registrar Entrega"}
                </Button>
            </form>

            {/* History Table */}
            {eventId && (
                <div className="border rounded-lg bg-background">
                    <div className="p-4 border-b bg-muted/40">
                        <h4 className="font-medium flex items-center gap-2">
                            <History className="h-4 w-4" />
                            Historial de Entregas (Evento Actual)
                        </h4>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Hora</TableHead>
                                    <TableHead>Producto</TableHead>
                                    <TableHead>Cant.</TableHead>
                                    <TableHead>Notas</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loadingHistory ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-4">Cargando...</TableCell>
                                    </TableRow>
                                ) : history.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                                            No hay entregas registradas hoy.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    history.map(item => (
                                        <TableRow key={item.id}>
                                            <TableCell className="text-xs">
                                                {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </TableCell>
                                            <TableCell className="font-medium">{item.products?.name}</TableCell>
                                            <TableCell>{item.quantity}</TableCell>
                                            <TableCell className="text-xs text-muted-foreground max-w-[150px] truncate" title={item.notes}>
                                                {item.notes}
                                            </TableCell>
                                            <TableCell>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>¿Eliminar registro?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Esta acción revertirá el stock a tu maletín ({item.quantity} unidades).
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDelete(item.id)} className="bg-destructive hover:bg-destructive/90">
                                                                Eliminar
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </TableCell>
                                            <TableCell>
                                                {/* Mostrar link a firma si existe, pero typescript no lo sabe asi que casteamos a any */}
                                                {(item as any).signature_url && (
                                                    <a href={(item as any).signature_url} target="_blank" rel="noreferrer" className="text-primary hover:underline text-xs font-bold">
                                                        Ver Firma
                                                    </a>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            )}
        </div>
    );
}
