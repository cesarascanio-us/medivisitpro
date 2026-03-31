/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */


import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Package, AlertCircle, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

import { useDemoData } from "@/contexts/MockDataProvider";

interface InventoryItem {
    id: string;
    product_id: string;
    quantity: number;
    products: {
        name: string;
        presentation: string;
    };
}

export function RepInventoryView() {
    const { user } = useAuth();
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const demoData = useDemoData();

    useEffect(() => {
        if (user || demoData) loadInventory();
    }, [user, demoData]);

    const loadInventory = async () => {
        try {
            setLoading(true);

            if (demoData) {
                console.log("RepInventoryView: Loading demo inventory");
                setInventory(demoData.inventory || []);
                return;
            }

            const { data, error } = await supabase
                .from('rep_inventory')
                .select(`
                    id,
                    product_id,
                    quantity,
                    products (
                        name,
                        presentation
                    )
                `)
                .order('quantity', { ascending: false });

            if (error) throw error;
            // @ts-ignore - Supabase generic types might not have rep_inventory yet without regen
            setInventory(data || []);
        } catch (error) {
            console.error('Error loading inventory:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStockStatus = (qty: number) => {
        if (qty <= 5) return <Badge variant="destructive" className="flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Bajo</Badge>;
        if (qty <= 15) return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Medio</Badge>;
        return <Badge variant="secondary" className="bg-green-100 text-green-800 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Óptimo</Badge>;
    };

    return (
        <Card className="medical-card">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    Mi Maletín (Stock Actual)
                </CardTitle>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="text-center py-8 text-muted-foreground">Cargando inventario...</div>
                ) : inventory.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        No hay muestras registradas en tu maletín.
                        <br />
                        <span className="text-xs">Solicita muestras para comenzar.</span>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Producto</TableHead>
                                <TableHead className="text-center">Cant.</TableHead>
                                <TableHead className="text-right">Estado</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {inventory.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>
                                        <div className="font-medium">{item.products?.name || 'Desconocido'}</div>
                                        <div className="text-xs text-muted-foreground">{item.products?.presentation}</div>
                                    </TableCell>
                                    <TableCell className="text-center font-bold text-lg">
                                        {item.quantity}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end">
                                            {getStockStatus(item.quantity)}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
}
