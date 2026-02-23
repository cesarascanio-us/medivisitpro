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
import { Package, Plus, Minus, AlertCircle, ShoppingBag, Megaphone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

import { useDemoData } from "@/contexts/MockDataProvider";

export interface POPDeliveryItem {
    id: string; // This corresponds to the ID in materiales_promocionales
    product_name: string;
    quantity: number;
    max_quantity: number;
}

interface POPDeliveryManagerProps {
    onUpdate: (items: POPDeliveryItem[]) => void;
    initialItems?: POPDeliveryItem[];
}

export function POPDeliveryManager({ onUpdate, initialItems = [] }: POPDeliveryManagerProps) {
    const [inventory, setInventory] = useState<any[]>([]);
    const [selectedItems, setSelectedItems] = useState<POPDeliveryItem[]>(initialItems);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const demoData = useDemoData();

    useEffect(() => {
        loadInventory();
    }, []);

    const loadInventory = async () => {
        try {
            if (demoData) {
                console.log("POPDeliveryManager: Loading demo inventory");
                // Map mock data keys to expected component keys if necessary
                // In demoData.materialPop: { id, name, quantity, category }
                // Component expects: { id, nombre, cantidad_disponible, tipo }
                const mappedData = (demoData.materialPop || []).map(item => ({
                    id: item.id,
                    nombre: item.name,
                    cantidad_disponible: item.quantity,
                    tipo: item.category
                }));
                setInventory(mappedData);
                return;
            }

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: invData, error: invError } = await supabase
                .from('materiales_promocionales')
                .select(`
                    id,
                    nombre,
                    cantidad_disponible,
                    tipo
                `)
                .eq('user_id', user.id)
                .gt('cantidad_disponible', 0);

            if (invError) throw invError;
            setInventory(invData || []);
        } catch (error) {
            console.error("Error loading POP inventory:", error);
            toast({
                title: "Error de Inventario",
                description: "No se pudo cargar tu inventario de materiales promocionales.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleAddItem = (item: any) => {
        const existing = selectedItems.find(i => i.id === item.id);
        const currentQty = existing ? existing.quantity : 0;

        if (currentQty >= item.cantidad_disponible) {
            toast({
                title: "Stock Insuficiente",
                description: `Solo tienes ${item.cantidad_disponible} unidades disponibles.`,
                variant: "destructive"
            });
            return;
        }

        let newItems;
        if (existing) {
            newItems = selectedItems.map(i =>
                i.id === item.id
                    ? { ...i, quantity: i.quantity + 1 }
                    : i
            );
        } else {
            newItems = [...selectedItems, {
                id: item.id,
                product_name: item.nombre,
                quantity: 1,
                max_quantity: item.cantidad_disponible
            }];
        }

        setSelectedItems(newItems);
        onUpdate(newItems);
    };

    const handleRemoveItem = (itemId: string) => {
        const existing = selectedItems.find(i => i.id === itemId);
        if (!existing) return;

        let newItems;
        if (existing.quantity > 1) {
            newItems = selectedItems.map(i =>
                i.id === itemId
                    ? { ...i, quantity: i.quantity - 1 }
                    : i
            );
        } else {
            newItems = selectedItems.filter(i => i.id !== itemId);
        }

        setSelectedItems(newItems);
        onUpdate(newItems);
    };

    if (loading) return <div className="p-4 text-center text-sm text-slate-500">Cargando materiales...</div>;

    if (inventory.length === 0) {
        return (
            <Card className="border-dashed border-orange-500/20 bg-orange-500/5">
                <CardContent className="p-6 text-center text-slate-400">
                    <Megaphone className="h-8 w-8 mx-auto mb-2 opacity-50 text-orange-400" />
                    <p>No tienes materiales promocionales disponibles.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-orange-500/20 shadow-lg bg-slate-900/50 backdrop-blur-sm">
            <CardHeader className="pb-3 border-b border-orange-500/10 bg-orange-500/5">
                <CardTitle className="text-lg flex items-center gap-2 text-orange-400">
                    <Megaphone className="h-5 w-5" />
                    Entregar Material Promocional (POP)
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
                {/* Selected Summary */}
                {selectedItems.length > 0 && (
                    <div className="space-y-3 mb-4 p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                        <Label className="text-xs font-semibold text-orange-300 uppercase tracking-wider flex items-center gap-2">
                            <AlertCircle className="h-3 w-3" />
                            Materiales a Entregar
                        </Label>
                        {selectedItems.map(item => (
                            <div key={item.id} className="flex justify-between items-center bg-slate-800 p-2 rounded border border-slate-700 shadow-sm">
                                <span className="text-sm font-medium text-slate-200">{item.product_name}</span>
                                <div className="flex items-center gap-2">
                                    <Badge variant="secondary" className="bg-orange-500/20 text-orange-300 border border-orange-500/30">x{item.quantity}</Badge>
                                    <button
                                        onClick={() => handleRemoveItem(item.id)}
                                        className="hover:bg-red-500/20 p-1 rounded-full text-slate-400 hover:text-red-400 transition-colors"
                                    >
                                        <Minus className="h-3 w-3" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Inventory List */}
                <div className="space-y-1">
                    <Label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tu Stock de Materiales</Label>
                    <ScrollArea className="h-[200px] pr-4">
                        <div className="grid grid-cols-1 gap-2">
                            {inventory.map((item) => {
                                const selected = selectedItems.find(i => i.id === item.id);
                                const currentSelectedQty = selected?.quantity || 0;
                                const remaining = item.cantidad_disponible - currentSelectedQty;

                                return (
                                    <div
                                        key={item.id}
                                        className={`flex items-center justify-between p-3 rounded-lg border transition-all ${remaining === 0
                                            ? 'bg-slate-900/50 border-slate-800 opacity-40'
                                            : 'bg-slate-950 border-slate-800 hover:border-orange-500/50 hover:shadow-md hover:bg-slate-900'
                                            }`}
                                    >
                                        <div>
                                            <p className="font-medium text-sm text-slate-200">{item.nombre}</p>
                                            <p className="text-xs text-slate-500">
                                                {item.tipo} • Disponible: <span className={remaining < 5 ? "text-orange-400 font-bold" : "text-slate-400"}>{remaining}</span>
                                            </p>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant={remaining === 0 ? "ghost" : "outline"}
                                            className={`h-8 w-8 p-0 rounded-full ${remaining > 0 ? 'border-orange-500/30 text-orange-400 hover:bg-orange-500/10 hover:text-orange-300' : 'text-slate-600'}`}
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
