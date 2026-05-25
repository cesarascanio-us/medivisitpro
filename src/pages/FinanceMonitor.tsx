/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useTexts } from "@/hooks/useTexts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AdminDataFilter } from "@/components/admin/AdminDataFilter";
import { cn } from "@/lib/utils";
import { EliteHeader, EliteKPICard } from "@/components/layout/DesignSystem";
import { 
    TrendingUp, 
    TrendingDown, 
    DollarSign, 
    PieChart, 
    BarChart3, 
    ArrowUpRight, 
    ArrowDownRight,
    Wallet,
    Package,
    RefreshCw,
    Download,
    Scale
} from "lucide-react";
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer, 
    Cell,
    AreaChart,
    Area
} from "recharts";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface FinanceStats {
    totalSales: number;
    totalExpenses: number;
    sampleInvestment: number;
    roi: number;
    netEfficiency: number;
    salesGrowth: number;
}

export default function FinanceMonitor() {
    const t = useTexts();
    const { user, canViewAllData, isManager, isMaster } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState<any>({});
    const [stats, setStats] = useState<FinanceStats>({
        totalSales: 0,
        totalExpenses: 0,
        sampleInvestment: 0,
        roi: 0,
        netEfficiency: 0,
        salesGrowth: 0
    });
    const [chartData, setChartData] = useState<any[]>([]);

    useEffect(() => {
        if (user) loadFinanceData();
    }, [user, filters]);

    const loadFinanceData = async () => {
        try {
            setLoading(true);
            
            // 0. Preparar IDs territoriales para triangulación
            let zoneIds: string[] = [];
            let userIds: string[] = [];

            if (filters.state && filters.state !== 'all') {
                const { data: zoneData } = await supabase.from('zones').select('id').eq('state', filters.state);
                zoneIds = zoneData?.map(z => z.id) || [];
            } else if (filters.region && filters.region !== 'all') {
                const { data: zoneData } = await supabase.from('zones').select('id').eq('region', filters.region);
                zoneIds = zoneData?.map(z => z.id) || [];
            }

            if (zoneIds.length > 0) {
                // Query the plain table instead of profiles
                const { data: userData } = await supabase.from('user_roles_plain').select('user_id').in('zone_id', zoneIds);
                userIds = userData?.map((u: any) => u.user_id) || [];
            }

            // 1. Fetch Sales (transfer_orders)
            let salesQuery = supabase.from('transfer_orders').select('total, created_at, status');
            if (filters.userId && filters.userId !== 'all') {
                salesQuery = salesQuery.eq('user_id', filters.userId);
            } else if (filters.zoneId && filters.zoneId !== 'all') {
                salesQuery = salesQuery.eq('zone_id', filters.zoneId);
            } else if (zoneIds.length > 0) {
                salesQuery = salesQuery.in('zone_id', zoneIds);
            }
            
            // 2. Fetch Expenses
            let expensesQuery = supabase.from('expenses').select('amount, status, category');
            if (filters.userId && filters.userId !== 'all') {
                expensesQuery = expensesQuery.eq('user_id', filters.userId);
            } else if (filters.zoneId && filters.zoneId !== 'all') {
                expensesQuery = expensesQuery.eq('zone_id', filters.zoneId);
            } else if (zoneIds.length > 0) {
                expensesQuery = expensesQuery.in('zone_id', zoneIds);
            }
            
            // 3. Fetch Sample Drops (for investment calculation)
            let samplesQuery = supabase.from('sample_movements').select('quantity').eq('movement_type', 'treatment_start');
            if (filters.userId && filters.userId !== 'all') {
                samplesQuery = samplesQuery.eq('user_id', filters.userId);
            } else if (userIds.length > 0) {
                samplesQuery = samplesQuery.in('user_id', userIds);
            }
            
            const [salesRes, expensesRes, samplesRes] = await Promise.all([
                salesQuery,
                expensesQuery,
                samplesQuery
            ]);

            const sales = salesRes.data || [];
            const expenses = (expensesRes.data || []).filter(e => e.status === 'approved');
            const samples = samplesRes.data || [];

            const totalSalesValue = sales.reduce((acc, curr) => acc + (Number(curr.total) || 0), 0);
            const totalExpensesValue = expenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
            const totalSamplesValue = samples.reduce((acc, curr) => acc + (Number(curr.quantity) || 0) * 2.5, 0); // Heuristic
            
            const totalCost = totalExpensesValue + totalSamplesValue;
            const roiValue = totalCost > 0 ? (totalSalesValue / totalCost) : 0;
            const efficiency = totalSalesValue > 0 ? (totalExpensesValue / totalSalesValue) * 100 : 0;

            setStats({
                totalSales: totalSalesValue,
                totalExpenses: totalExpensesValue,
                sampleInvestment: totalSamplesValue,
                roi: roiValue,
                netEfficiency: efficiency,
                salesGrowth: 12.5 // Mock growth
            });

            // Prepare chart data (Last 6 months)
            const mockChartData = [
                { name: 'Ene', ventas: totalSalesValue * 0.7, gastos: totalExpensesValue * 0.8 },
                { name: 'Feb', ventas: totalSalesValue * 0.85, gastos: totalExpensesValue * 0.9 },
                { name: 'Mar', ventas: totalSalesValue, gastos: totalExpensesValue },
            ];
            setChartData(mockChartData);

        } catch (error) {
            console.error('Error loading finance data:', error);
            toast({ title: "Error", description: "No se pudieron cargar los datos financieros.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    if (!isManager && !isMaster) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
                <div className="p-6 bg-rose-50 rounded-full">
                    <TrendingDown className="h-16 w-16 text-rose-500" />
                </div>
                <div className="text-center space-y-2">
                    <h1 className="text-2xl font-bold text-slate-900">Acceso Restringido</h1>
                    <p className="text-slate-500 max-w-xs mx-auto">Esta sección requiere permisos de nivel gerencial o superior para visualizar datos financieros sensibles.</p>
                </div>
                <Button variant="outline" size="default" onClick={() => window.history.back()}>
                    Regresar
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <EliteHeader 
                title={t.finance_title}
                subtitle={t.finance_subtitle}
                icon={Scale}
                badgeText="Finanzas"
                statusText="Auditoría activa"
                statusColor="bg-emerald-500"
                rightContent={
                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="default" onClick={loadFinanceData}>
                            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Actualizar
                        </Button>
                        <Button variant="default" size="default">
                            <Download className="h-4 w-4 mr-2" /> Exportar reporte
                        </Button>
                    </div>
                }
            />

            {/* Admin Filter */}
            <AdminDataFilter onFilterChange={setFilters} moduleType="finance" />

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <EliteKPICard 
                    title="Ventas Brutas" 
                    value={`$${stats.totalSales.toLocaleString()}`} 
                    subtitle={`+${stats.salesGrowth}% vs mes anterior`}
                    icon={TrendingUp}
                    trend={stats.salesGrowth}
                    color="emerald"
                />
                <EliteKPICard 
                    title="Gastos Operativos" 
                    value={`$${stats.totalExpenses.toLocaleString()}`} 
                    subtitle={`${((stats.totalExpenses / stats.totalSales) * 100 || 0).toFixed(1)}% del ingreso`}
                    icon={Wallet}
                    color="rose"
                />
                <EliteKPICard 
                    title="Inversión Muestras" 
                    value={`$${stats.sampleInvestment.toLocaleString()}`} 
                    subtitle="Costo estimado de promoción"
                    icon={Package}
                    color="amber"
                />
                <EliteKPICard 
                    title="Índice ROI" 
                    value={`${stats.roi.toFixed(2)}x`} 
                    subtitle="Retorno por cada $1 invertido"
                    icon={DollarSign}
                    trend={stats.roi > 3 ? 15 : -5}
                    color="indigo"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Sales vs Expenses Chart */}
                <Card className="lg:col-span-2 border border-border/40 shadow-premium-md rounded-lg overflow-hidden bg-card">
                    <CardHeader className="border-b border-border/40 pb-6 pt-8 px-8">
                        <div className="flex justify-between items-center">
                            <CardTitle className="text-base font-bold text-foreground flex items-center gap-2 tracking-tight">
                                <BarChart3 className="h-5 w-5 text-primary" />
                                Histórico ventas vs. gastos
                            </CardTitle>
                            <div className="flex gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>
                                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Ventas</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
                                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Gastos</span>
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.1}/>
                                            <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0}/>
                                        </linearGradient>
                                        <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="hsl(var(--chart-4))" stopOpacity={0.1}/>
                                            <stop offset="95%" stopColor="hsl(var(--chart-4))" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted)/0.3)" />
                                    <XAxis 
                                        dataKey="name" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 11, fontWeight: 700}}
                                        dy={10}
                                    />
                                    <YAxis 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 11, fontWeight: 700}}
                                        tickFormatter={(value) => `$${value}`}
                                    />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)', color: 'hsl(var(--foreground))' }}
                                        itemStyle={{ fontWeight: 700, fontSize: '12px' }}
                                        cursor={{ stroke: 'hsl(var(--border))', strokeWidth: 2 }}
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="ventas" 
                                        stroke="hsl(var(--chart-1))" 
                                        strokeWidth={3}
                                        fillOpacity={1} 
                                        fill="url(#colorSales)" 
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="gastos" 
                                        stroke="hsl(var(--chart-4))" 
                                        strokeWidth={3}
                                        fillOpacity={1} 
                                        fill="url(#colorExpenses)" 
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Investment Efficiency Card */}
                <Card className="border border-border/40 shadow-premium-lg rounded-lg overflow-hidden bg-slate-900 text-white relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl rounded-full -mr-16 -mt-16"></div>
                    <CardHeader className="pb-2 pt-8 px-8 relative z-10">
                        <CardTitle className="text-base font-bold flex items-center gap-2 tracking-tight">
                            <PieChart className="h-5 w-5 text-primary" /> Eficiencia neta
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 space-y-8 relative z-10">
                        <div className="text-center py-4">
                            <h2 className="text-5xl font-bold mb-2 tracking-tighter">{stats.netEfficiency.toFixed(1)}%</h2>
                            <p className="text-slate-400 font-bold uppercase text-xs tracking-wider">Ratio de gastos</p>
                        </div>
                        
                        <div className="space-y-5">
                            <div className="bg-white/5 p-5 rounded-lg border border-white/5">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-bold text-slate-300">Salud financiera</span>
                                    <Badge className="bg-emerald-500 text-white border-none text-xs font-bold px-2 py-0">Excelente</Badge>
                                </div>
                                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-emerald-500 h-full rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" style={{ width: '85%' }}></div>
                                </div>
                            </div>
                            
                            <p className="text-xs text-slate-400 leading-relaxed font-medium">
                                Una eficiencia por debajo del 15% indica un uso optimizado de recursos para la generación de ventas.
                            </p>

                            <Button variant="secondary" size="default" className="w-full mt-2">
                                Ver detalle por zona
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}


