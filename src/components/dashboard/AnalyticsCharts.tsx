/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line } from "recharts";

interface ZoneKPI {
    estate: string;
    sales_total: number;
    visit_count: number;
    orders_count: number;
}

interface AnalyticsChartsProps {
    zoneData: ZoneKPI[];
}

const COLORS = [
    'hsl(var(--primary))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))'
];

export function AnalyticsCharts({ zoneData }: AnalyticsChartsProps) {
    if (!zoneData || zoneData.length === 0) {
        return (
            <Card className="col-span-1 lg:col-span-2 bg-card border border-border/40 shadow-premium-md rounded-lg">
                <CardHeader>
                    <CardTitle className="text-sm font-bold text-foreground">Análisis de Rendimiento</CardTitle>
                    <CardDescription>No hay datos suficientes para generar gráficos.</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    // Sort for charts
    const salesByZone = [...zoneData].sort((a, b) => b.sales_total - a.sales_total).slice(0, 8);

    // Aggregate for Pie Chart (Visits vs Orders)
    const totalVisits = zoneData.reduce((acc, curr) => acc + curr.visit_count, 0);
    const totalOrders = zoneData.reduce((acc, curr) => acc + curr.orders_count, 0);
    const conversionData = [
        { name: 'Visitas sin Venta', value: totalVisits - totalOrders },
        { name: 'Pedidos Generados', value: totalOrders }
    ];

    // Mock Trend Data
    const trendData = [
        { month: 'Ene', sales: 4000 },
        { month: 'Feb', sales: 3000 },
        { month: 'Mar', sales: 2000 },
        { month: 'Abr', sales: 2780 },
        { month: 'May', sales: 1890 },
        { month: 'Jun', sales: 2390 },
        { month: 'Jul', sales: 3490 },
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-5 duration-700">
            {/* Sales by Zone (Bar Chart) */}
            <Card className="lg:col-span-2 xl:col-span-1 bg-card border border-border/40 shadow-premium-md rounded-lg">
                <CardHeader>
                    <CardTitle className="text-sm font-bold text-foreground">Ventas por Zona (Top 8)</CardTitle>
                    <CardDescription>Rendimiento comercial por región geográfica</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={salesByZone} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                <XAxis type="number" hide />
                                <YAxis dataKey="estate" type="category" width={80} tick={{ fontSize: 12, fontWeight: 'bold' }} />
                                <Tooltip
                                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Ventas']}
                                    contentStyle={{ 
                                        backgroundColor: 'hsl(var(--card))', 
                                        border: '1px solid hsl(var(--border))', 
                                        borderRadius: 'var(--radius)', 
                                        color: 'hsl(var(--foreground))' 
                                    }}
                                />
                                <Bar dataKey="sales_total" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Effectiveness (Pie Chart) */}
            <Card className="bg-card border border-border/40 shadow-premium-md rounded-lg">
                <CardHeader>
                    <CardTitle className="text-sm font-bold text-foreground">Efectividad de Visitas</CardTitle>
                    <CardDescription>Conversión de visitas a pedidos</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] w-full flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={conversionData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={90}
                                    fill="hsl(var(--primary))"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {conversionData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index === 1 ? 'hsl(var(--chart-2))' : 'hsl(var(--muted))'} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="text-center mt-[-150px] mb-8 relative z-10">
                        <p className="text-4xl font-black text-primary">
                            {totalVisits > 0 ? ((totalOrders / totalVisits) * 100).toFixed(0) : 0}%
                        </p>
                        <p className="text-xs text-muted-foreground uppercase tracking-[0.2em] font-bold">Tasa de Conversión</p>
                    </div>
                </CardContent>
            </Card>

            {/* Monthly Trend (Line Chart) */}
            <Card className="lg:col-span-2 bg-card border border-border/40 shadow-premium-md rounded-lg">
                <CardHeader>
                    <CardTitle className="text-sm font-bold text-foreground">Tendencia de Ventas (Semestral)</CardTitle>
                    <CardDescription>Proyección histórica de ingresos</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontWeight: 'bold' }} />
                                <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} tick={{ fontWeight: 'bold' }} />
                                <Tooltip
                                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Ventas']}
                                    contentStyle={{ 
                                        backgroundColor: 'hsl(var(--card))', 
                                        border: '1px solid hsl(var(--border))', 
                                        borderRadius: 'var(--radius)', 
                                        color: 'hsl(var(--foreground))' 
                                    }}
                                />
                                <Line type="monotone" dataKey="sales" stroke="hsl(var(--primary))" strokeWidth={4} dot={{ r: 6, fill: 'hsl(var(--primary))', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
