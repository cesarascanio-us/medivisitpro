/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { AlertTriangle, PackageCheck, Filter } from "lucide-react";
import { useDemoData } from "@/contexts/MockDataProvider";

interface InventoryItem {
    id: string;
    product_id: string;
    quantity: number;
    products: {
        name: string;
    };
}

export function InventoryDashboard() {
    const { user } = useAuth();
    const [data, setData] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showLowStockOnly, setShowLowStockOnly] = useState(false);

    // Demo mode hook
    const demoData = useDemoData();

    useEffect(() => {
        if (user) loadData();
    }, [user]);

    const loadData = async () => {
        try {
            setLoading(true);

            // DEMO MODE: Use mock inventory data
            if (demoData) {
                console.log("InventoryDashboard: Using mock demo data");
                setData(demoData.inventory as unknown as InventoryItem[]);
                setLoading(false);
                return;
            }

            // Fetch inventory and products in parallel to avoid Join 400 errors
            const [inventoryResult, productsResult] = await Promise.all([
                supabase
                    .from('rep_inventory')
                    .select('id, product_id, quantity')
                    .order('quantity', { ascending: true }),
                supabase
                    .from('products')
                    .select('id, name')
            ]);

            if (inventoryResult.error) throw inventoryResult.error;
            if (productsResult.error) throw productsResult.error;

            const inventoryData = inventoryResult.data || [];
            const productsList = productsResult.data || [];
            console.log("DEBUG: Inventory IDs:", inventoryData.map(i => i.product_id));
            console.log("DEBUG: Available Product IDs:", productsList.map(p => p.id));

            const productsMap = new Map(productsList.map(p => [p.id, p]));

            // Join data manually
            const joinedData = inventoryData.map(item => ({
                ...item,
                products: productsMap.get(item.product_id) || { name: 'Producto Desconocido' }
            }));

            // @ts-expect-error - Array mapping
            setData(joinedData);
        } catch (error) {
            console.error('Error loading dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const lowStockItems = data.filter(i => i.quantity <= 10);
    const displayedData = showLowStockOnly ? lowStockItems : data;

    // Calculate dynamic width: min 100% or 60px per item
    // This allows the chart to grow horizontally and scroll
    // 76 items * 60px = 4560px -> Ensures readability
    const chartWidth = Math.max(100, displayedData.length * 60);

    const chartData = displayedData.map(i => {
        const productName = i.products?.name || "Producto Desconocido";
        return {
            name: productName.substring(0, 15) + (productName.length > 15 ? '...' : ''),
            full_name: productName,
            cantidad: i.quantity
        };
    });

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* KPI Cards */}
                <Card className="md:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <PackageCheck className="h-5 w-5 text-primary" />
                            Niveles de Stock
                            <Badge variant="secondary" className="ml-2">
                                {displayedData.length} Productos
                            </Badge>
                        </CardTitle>
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="low-stock-mode"
                                checked={showLowStockOnly}
                                onCheckedChange={setShowLowStockOnly}
                            />
                            <Label htmlFor="low-stock-mode" className="text-sm cursor-pointer">
                                {showLowStockOnly ? "Viendo Críticos" : "Ver Todo"}
                            </Label>
                        </div>
                    </CardHeader>
                    <CardContent className="h-[350px] overflow-hidden flex flex-col">
                        {loading ? (
                            <div className="h-full flex items-center justify-center text-muted-foreground">Cargando gráficos...</div>
                        ) : data.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-muted-foreground">Sin datos de inventario</div>
                        ) : (
                            <div className="flex-1 overflow-x-auto overflow-y-hidden pb-2 w-full custom-scrollbar">
                                {/* Dynamic Width Container */}
                                <div style={{ width: `${chartWidth}px`, minWidth: '100%', height: '100%' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis
                                                dataKey="name"
                                                angle={-45}
                                                textAnchor="end"
                                                interval={0}
                                                height={70}
                                                tick={{ fontSize: 11 }}
                                            />
                                            <YAxis />
                                            <Tooltip
                                                cursor={{ fill: 'transparent' }}
                                                content={({ active, payload }) => {
                                                    if (active && payload && payload.length) {
                                                        const data = payload[0].payload;
                                                        return (
                                                            <div className="bg-popover border text-popover-foreground p-2 rounded shadow-md text-sm">
                                                                <p className="font-semibold">{data.full_name}</p>
                                                                <p>Stock: {data.cantidad}</p>
                                                            </div>
                                                        );
                                                    }
                                                    return null;
                                                }}
                                            />
                                            <Bar dataKey="cantidad" radius={[4, 4, 0, 0]} barSize={40}>
                                                {chartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.cantidad <= 10 ? '#ef4444' : '#3b82f6'} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}
                        <p className="text-xs text-muted-foreground text-center mt-2">
                            {showLowStockOnly ? "Mostrando solo productos con stock bajo (≤10)." : "Desliza horizontalmente para ver todos los productos."}
                        </p>
                    </CardContent>
                </Card>

                {/* Alerts Panel */}
                <Card className="bg-destructive/5 border-destructive/20 h-full max-h-[400px] flex flex-col">
                    <CardHeader>
                        <CardTitle className="text-lg text-destructive flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5" />
                            Atención Requerida
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="overflow-y-auto flex-1 pr-2 custom-scrollbar">
                        {loading ? (
                            <p className="text-sm text-muted-foreground">Analizando...</p>
                        ) : lowStockItems.length === 0 ? (
                            <div className="text-center py-8 text-green-600">
                                <PackageCheck className="h-10 w-10 mx-auto mb-2 opacity-50" />
                                <p>Todo el inventario en niveles óptimos.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <p className="text-sm text-muted-foreground mb-4">
                                    {lowStockItems.length} productos requieren reposición:
                                </p>
                                {lowStockItems.map(item => (
                                    <div key={item.id} className="flex justify-between items-center bg-background p-2 rounded border border-destructive/10 hover:bg-destructive/5 transition-colors">
                                        <span className="text-sm font-medium truncate max-w-[150px]" title={item.products?.name}>
                                            {item.products?.name}
                                        </span>
                                        <Badge variant="destructive">{item.quantity} unds.</Badge>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
