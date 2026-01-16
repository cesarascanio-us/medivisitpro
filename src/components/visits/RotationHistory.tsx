
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";
import { Loader2, TrendingUp, History } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface RotationHistoryProps {
    pharmacyId: string;
    productId?: string;
}

export function RotationHistory({ pharmacyId, productId }: RotationHistoryProps) {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any[]>([]);

    useEffect(() => {
        loadHistory();
    }, [pharmacyId, productId]);

    const loadHistory = async () => {
        try {
            setLoading(true);

            // Fetch historical audits for this pharmacy
            let query = (supabase as any)
                .from("registro_pvp_farmacia")
                .select(`
                    id,
                    cantidad_actual,
                    ventas_estimadas,
                    visit_id,
                    producto_id,
                    created_at,
                    products(name),
                    visits(scheduled_date)
                `)
                .eq("pharmacy_id", pharmacyId)
                .order("created_at", { ascending: true });

            if (productId) {
                query = query.eq("producto_id", productId);
            }

            const { data: audits, error } = await query;

            if (error) throw error;

            if (audits) {
                // Group by date for chart
                const chartMap = new Map();
                audits.forEach((a: any) => {
                    const rawDate = a.visits?.scheduled_date || a.created_at;
                    const dateLabel = new Date(rawDate).toLocaleDateString("es-ES", { month: "short", day: "numeric" });

                    if (!chartMap.has(dateLabel)) {
                        chartMap.set(dateLabel, { date: dateLabel, rotation: 0, stock: 0 });
                    }
                    const entry = chartMap.get(dateLabel);
                    entry.rotation += a.ventas_estimadas || 0;
                    entry.stock += a.cantidad_actual || 0;
                });

                setData(Array.from(chartMap.values()));
            }
        } catch (error: any) {
            console.error("Error loading rotation history:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center p-4"><Loader2 className="h-4 w-4 animate-spin" /></div>;
    }

    if (data.length === 0) {
        return <div className="text-sm text-muted-foreground text-center p-4 italic">No hay historial de rotación disponible.</div>;
    }

    return (
        <Card className="border-none shadow-none bg-transparent">
            <CardHeader className="px-0 pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <History className="h-4 w-4 text-blue-500" />
                    Tendencia de Rotación y Stock
                </CardTitle>
            </CardHeader>
            <CardContent className="px-0">
                <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis dataKey="date" fontSize={10} tickLine={false} axisLine={false} />
                            <YAxis fontSize={10} tickLine={false} axisLine={false} />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
                            />
                            <Legend wrapperStyle={{ fontSize: '10px' }} />
                            <Bar name="Rotación (Ventas)" dataKey="rotation" fill="#10b981" radius={[4, 4, 0, 0]} />
                            <Bar name="Stock en Anaquel" dataKey="stock" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="mt-2 flex items-center justify-between">
                    <div className="flex gap-2">
                        <Badge variant="outline" className="text-[10px] bg-green-50 text-green-700 border-green-100">
                            <TrendingUp className="h-3 w-3 mr-1" /> Alta Rotación
                        </Badge>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
