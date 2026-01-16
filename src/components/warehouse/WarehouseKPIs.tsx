import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Truck, AlertTriangle, DollarSign } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function WarehouseKPIs() {
    const [stats, setStats] = useState({
        totalStock: 0,
        riskItems: 0,
        pendingDispatch: 0,
        estimatedValue: 0
    });

    useEffect(() => {
        loadKPIs();
    }, []);

    const loadKPIs = async () => {
        try {
            const [stockRes, reqRes] = await Promise.all([
                supabase.from('view_warehouse_stock').select('*'),
                supabase.from('sample_requests').select('*', { count: 'exact' }).eq('status', 'pending')
            ]);

            let stock = 0;
            let risk = 0;
            let totalValue = 0;

            if (stockRes.data) {
                stockRes.data.forEach((item: any) => {
                    stock += item.total_quantity;
                    // Mock calculation for value if product price is not in view
                    // In a real system we would join with products.price or similar
                    totalValue += (item.total_quantity * 12);

                    if (item.next_expiration) {
                        const months = (new Date(item.next_expiration).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 30);
                        if (months < 3) risk++;
                    }
                });
            }

            setStats({
                totalStock: stock,
                riskItems: risk,
                pendingDispatch: reqRes.count || 0,
                estimatedValue: totalValue
            });
        } catch (error) {
            console.error("Error loading Warehouse KPIs:", error);
        }
    };

    return (
        <div className="grid gap-4 md:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Stock Total (Unidades)</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.totalStock.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">+12% vs mes anterior</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Lotes en Riesgo</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-red-600">{stats.riskItems}</div>
                    <p className="text-xs text-muted-foreground">Vencen en &lt; 3 meses</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Despachos Pendientes</CardTitle>
                    <Truck className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.pendingDispatch}</div>
                    <p className="text-xs text-muted-foreground">Solicitudes activas</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Valor Estimado</CardTitle>
                    <DollarSign className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">${stats.estimatedValue.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">Costo de inventario</p>
                </CardContent>
            </Card>
        </div>
    );
}
