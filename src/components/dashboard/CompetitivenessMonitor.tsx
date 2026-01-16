
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, AlertTriangle } from "lucide-react";

export function CompetitivenessMonitor() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [warnings, setWarnings] = useState<string[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);

            // 1. Get Drugstore Prices (Avg per product)
            const drugstoreQuery = await supabase
                .from('inventario_droguerias' as any)
                .select('producto_id, precio_venta_farmacia, products(name)');

            if (drugstoreQuery.error) throw drugstoreQuery.error;

            // 2. Get Pharmacy PVPs (Avg per product)
            const pvpQuery = await supabase
                .from('registro_pvp_farmacia' as any)
                .select('producto_id, pvp');

            if (pvpQuery.error) throw pvpQuery.error;

            // Process Data
            const productsMap = new Map();

            // Aggregate Drugstore Cost
            (drugstoreQuery.data || []).forEach((item: any) => {
                if (!item.products?.name) return;
                const pid = item.producto_id;
                if (!productsMap.has(pid)) {
                    productsMap.set(pid, {
                        name: item.products.name,
                        totalCost: 0,
                        countCost: 0,
                        totalPvp: 0,
                        countPvp: 0
                    });
                }
                const p = productsMap.get(pid);
                p.totalCost += Number(item.precio_venta_farmacia);
                p.countCost += 1;
            });

            // Aggregate Pharmacy PVP
            (pvpQuery.data || []).forEach((item: any) => {
                const pid = item.producto_id;
                if (productsMap.has(pid)) {
                    const p = productsMap.get(pid);
                    p.totalPvp += Number(item.pvp);
                    p.countPvp += 1;
                }
            });

            const chartData: any[] = [];
            const newWarnings: string[] = [];

            productsMap.forEach((value, key) => {
                if (value.countCost > 0 && value.countPvp > 0) {
                    const avgCost = value.totalCost / value.countCost;
                    const avgPvp = value.totalPvp / value.countPvp;
                    const margin = ((avgPvp - avgCost) / avgPvp) * 100;

                    chartData.push({
                        name: value.name.substring(0, 15) + (value.name.length > 15 ? '...' : ''),
                        fullName: value.name,
                        CostoPromedio: parseFloat(avgCost.toFixed(2)),
                        PVPPromedio: parseFloat(avgPvp.toFixed(2)),
                        margin: margin
                    });

                    if (margin < 15) {
                        newWarnings.push(`${value.name}: Margen bajo (${margin.toFixed(1)}%)`);
                    }
                }
            });

            // Sort by margin ascending (most critical first) and take top 5
            setData(chartData.sort((a, b) => a.margin - b.margin).slice(0, 5));
            setWarnings(newWarnings.slice(0, 3));

        } catch (error) {
            console.error("Error loading competitiveness data:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="h-[300px] flex items-center justify-center text-muted-foreground">Cargando datos de mercado...</div>;
    }

    if (data.length === 0) {
        return (
            <Card className="col-span-1">
                <CardHeader>
                    <CardTitle className="text-sm font-medium">Monitor de Competitividad</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
                    Requieres datos de Inventario de Droguería y Auditorías en Farmacia para visualizar el monitor.
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="col-span-1 border-l-4 border-l-blue-500 shadow-md">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-blue-600" /> Monitor de Competitividad
                        </CardTitle>
                        <CardDescription>Costo Promedio (Droguería) vs PVP Promedio (Farmacia)</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={data}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" fontSize={12} />
                            <YAxis fontSize={12} tickFormatter={(value) => `$${value}`} />
                            <Tooltip
                                formatter={(value: number) => [`$${value}`, '']}
                                labelFormatter={(label) => `Producto: ${label}`}
                            />
                            <Legend />
                            <Bar dataKey="CostoPromedio" name="Costo Droguería" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="PVPPromedio" name="PVP Farmacia" fill="#22c55e" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {warnings.length > 0 && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                        <h4 className="flex items-center gap-2 text-sm font-semibold text-yellow-800 mb-2">
                            <AlertTriangle className="h-4 w-4" /> Alertas de Margen
                        </h4>
                        <ul className="text-xs space-y-1 text-yellow-700">
                            {warnings.map((w, i) => (
                                <li key={i}>• {w}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
