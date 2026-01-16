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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export function AnalyticsCharts({ zoneData }: AnalyticsChartsProps) {
    if (!zoneData || zoneData.length === 0) {
        return (
            <Card className="col-span-1 lg:col-span-2">
                <CardHeader>
                    <CardTitle>Análisis de Rendimiento</CardTitle>
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

    // Mock Trend Data (Since we don't have historical API handy in this view context yet)
    // In a real scenario, this would come from a 'monthly_stats' table
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
            <Card className="lg:col-span-2 xl:col-span-1">
                <CardHeader>
                    <CardTitle>Ventas por Zona (Top 8)</CardTitle>
                    <CardDescription>Rendimiento comercial por región geográfica</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={salesByZone} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                <XAxis type="number" hide />
                                <YAxis dataKey="estate" type="category" width={80} tick={{ fontSize: 12 }} />
                                <Tooltip
                                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Ventas']}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="sales_total" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Effectiveness (Pie Chart) */}
            <Card>
                <CardHeader>
                    <CardTitle>Efectividad de Visitas</CardTitle>
                    <CardDescription>Conversión de visitas a pedidos confirmados</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] w-full flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={conversionData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {conversionData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index === 1 ? '#10b981' : '#e2e8f0'} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="text-center mt-[-40px] mb-4">
                        <p className="text-3xl font-bold text-slate-800">
                            {totalVisits > 0 ? ((totalOrders / totalVisits) * 100).toFixed(0) : 0}%
                        </p>
                        <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Tasa de Conversión</p>
                    </div>
                </CardContent>
            </Card>

            {/* Monthly Trend (Line Chart) */}
            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle>Tendencia de Ventas (Semestral)</CardTitle>
                    <CardDescription>Proyección histórica de ingresos (Simulado)</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                                <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                                <Tooltip
                                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Ventas']}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Line type="monotone" dataKey="sales" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
