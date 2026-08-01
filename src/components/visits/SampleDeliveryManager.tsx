/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Package, Plus, Minus, AlertCircle, ShoppingBag, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useDemoData } from "@/contexts/MockDataProvider";

export interface DeliveryItem {
    product_id: string;
    product_name: string;
    quantity: number;
    max_quantity: number;
    lotNumber?: string;
}

interface SampleDeliveryManagerProps {
    onUpdate: (items: DeliveryItem[]) => void;
    initialItems?: DeliveryItem[];
    specialty?: string;
    isMedicalVisit?: boolean;
}

export function SampleDeliveryManager({ onUpdate, initialItems = [], specialty, isMedicalVisit }: SampleDeliveryManagerProps) {
    const [inventory, setInventory] = useState<any[]>([]);
    const [selectedItems, setSelectedItems] = useState<DeliveryItem[]>(initialItems);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const demoData = useDemoData();

    useEffect(() => {
        loadInventory();
    }, [specialty, isMedicalVisit]);

    const loadInventory = async () => {
        try {
            if (demoData) {
                console.log("SampleDeliveryManager: Loading demo inventory");
                let items = demoData.inventory || [];
                if (isMedicalVisit && specialty) {
                    const spec = specialty.toLowerCase().trim();
                    items = items.filter((item: any) => {
                        const pSpec = (item.products?.medical_specialties || '').toLowerCase();
                        const pCat = (item.products?.category || '').toLowerCase();
                        const isLaunch = pCat.includes('launch') || pCat.includes('lanzamiento');
                        return isLaunch || pSpec.includes(spec);
                    });
                }
                setInventory(items);
                return;
            }

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: invData, error: invError } = await supabase
                .from('inventario_muestras' as any)
                .select(`
                    product_id,
                    quantity:cantidad_asignada,
                    lote,
                    products:products(name, presentation, medical_specialties, category)
                `)
                .eq('user_id', user.id)
                .gt('cantidad_asignada', 0);

            if (invError) throw invError;

            let filteredData = invData || [];
            if (isMedicalVisit && specialty) {
                const spec = specialty.toLowerCase().trim();
                filteredData = filteredData.filter((item: any) => {
                    const pSpec = (item.products?.medical_specialties || '').toLowerCase();
                    const pCat = (item.products?.category || '').toLowerCase();
                    const isLaunch = pCat.includes('launch') || pCat.includes('lanzamiento');
                    return isLaunch || pSpec.includes(spec);
                });
            }

            setInventory(filteredData);
        } catch (error) {
            console.error("Error loading inventory:", error);
            toast({
                title: "Error de Inventario",
                description: "No se pudo cargar tu inventario de muestras.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleAddItem = (item: any) => {
        const existing = selectedItems.find(i => i.product_id === item.product_id);
        const currentQty = existing ? existing.quantity : 0;

        if (currentQty >= item.quantity) {
            toast({
                title: "Stock Insuficiente",
                description: `Solo tienes ${item.quantity} unidades disponibles.`,
                variant: "destructive"
            });
            return;
        }

        let newItems;
        if (existing) {
            newItems = selectedItems.map(i =>
                i.product_id === item.product_id
                    ? { ...i, quantity: i.quantity + 1 }
                    : i
            );
        } else {
            newItems = [...selectedItems, {
                product_id: item.product_id,
                product_name: item.products?.name || "Producto desconocido",
                quantity: 1,
                max_quantity: item.quantity
            }];
        }

        setSelectedItems(newItems);
        onUpdate(newItems);
    };

    const handleRemoveItem = (productId: string) => {
        const existing = selectedItems.find(i => i.product_id === productId);
        if (!existing) return;

        let newItems;
        if (existing.quantity > 1) {
            newItems = selectedItems.map(i =>
                i.product_id === productId
                    ? { ...i, quantity: i.quantity - 1 }
                    : i
            );
        } else {
            newItems = selectedItems.filter(i => i.product_id !== productId);
        }

        setSelectedItems(newItems);
        onUpdate(newItems);
    };

    if (loading) return <div className="p-4 text-center text-sm text-muted-foreground">Cargando inventario...</div>;

    if (inventory.length === 0) {
        return (
            <Card className="border-dashed border-border bg-muted/10">
                <CardContent className="p-6 text-center text-muted-foreground">
                    <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No tienes muestras disponibles en tu inventario para entregar.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-primary/20 shadow-lg bg-muted/10 backdrop-blur-sm">
            <CardHeader className="pb-3 border-b border-blue-500/10 bg-primary/5">
                <CardTitle className="text-lg flex items-center gap-2 text-primary">
                    <ShoppingBag className="h-5 w-5" />
                    Entregar Muestras
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
                {selectedItems.length > 0 && (
                    <div className="space-y-3 mb-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
                        <Label className="text-xs font-semibold text-primary uppercase tracking-wider flex items-center gap-2">
                            <AlertCircle className="h-3 w-3" />
                            Muestras a Entregar (Requiere Lote)
                        </Label>
                        {selectedItems.map(item => (
                            <div key={item.product_id} className="flex flex-col gap-2 bg-card p-2 rounded border border-border shadow-sm">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-foreground">{item.product_name}</span>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="secondary" className="bg-blue-500/20 text-primary border border-blue-500/30">x{item.quantity}</Badge>
                                        <button
                                            onClick={() => handleRemoveItem(item.product_id)}
                                            className="hover:bg-red-500/20 p-1 rounded-full text-muted-foreground hover:text-red-400 transition-colors"
                                        >
                                            <Minus className="h-3 w-3" />
                                        </button>
                                    </div>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Lote (Obligatorio)"
                                    className="text-xs border border-slate-600 bg-muted/20 text-white rounded px-2 py-1 w-full focus:border-blue-500 focus:outline-none placeholder:text-slate-600"
                                    value={item.lotNumber || ''}
                                    onChange={(e) => {
                                        const newItems = selectedItems.map(i =>
                                            i.product_id === item.product_id ? { ...i, lotNumber: e.target.value } : i
                                        );
                                        setSelectedItems(newItems);
                                        onUpdate(newItems);
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                )}

                <div className="space-y-1">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tu Inventario Disponible</Label>
                    <ScrollArea className="h-[200px] pr-4">
                        <div className="grid grid-cols-1 gap-2">
                            {inventory.map((item) => {
                                const selected = selectedItems.find(i => i.product_id === item.product_id);
                                const currentSelectedQty = selected?.quantity || 0;
                                const remaining = item.quantity - currentSelectedQty;

                                return (
                                    <div
                                        key={item.product_id}
                                        className={`flex items-center justify-between p-3 rounded-lg border transition-all ${remaining === 0
                                            ? 'bg-muted/10 border-border opacity-40'
                                            : 'bg-muted/20 border-border hover:border-blue-500/50 hover:shadow-md hover:bg-slate-900'
                                            }`}
                                    >
                                        <div>
                                            <p className="font-medium text-sm text-foreground">{item.products?.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                Disponible: <span className={remaining < 5 ? "text-orange-400 font-bold" : "text-muted-foreground"}>{remaining}</span>
                                                <span className="mx-1 text-slate-600">/</span>
                                                Total: {item.quantity}
                                            </p>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant={remaining === 0 ? "ghost" : "outline"}
                                            className={`h-8 w-8 p-0 rounded-full ${remaining > 0 ? 'border-blue-500/30 text-primary hover:bg-primary/5 hover:text-primary' : 'text-slate-600'}`}
                                            onClick={() => remaining > 0 && handleAddItem(item)}
                                            disabled={remaining === 0}
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                );
                            })}
                        </div>
                    </ScrollArea>
                </div>
            </CardContent>
        </Card>
    );
}
