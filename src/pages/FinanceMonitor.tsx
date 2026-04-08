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
                const { data: userData } = await supabase.from('profiles').select('id').in('zone_id', zoneIds);
                userIds = userData?.map(u => u.id) || [];
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
        return <div className="p-8 text-center text-red-500 font-bold">Acceso Denegado. Se requiere nivel Manager o Superior.</div>;
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <EliteHeader 
                title="Finance Monitor"
                subtitle="Análisis de ROI y Eficiencia Operativa"
                icon={Scale}
                badgeText="A0 V6.0"
                statusText="Auditoría Financiera Activa"
                statusColor="bg-primary"
                rightContent={
                    <div className="flex items-center gap-4">
                        <Button variant="outline" className="h-14 px-8 rounded-2xl bg-card border-border/40 text-foreground font-black text-[10px] uppercase tracking-widest shadow-premium-sm hover:shadow-premium-md transition-all" onClick={loadFinanceData}>
                            <RefreshCw className={`h-5 w-5 mr-3 text-primary ${loading ? 'animate-spin' : ''}`} /> Actualizar
                        </Button>
                        <Button className="h-16 px-10 bg-primary hover:bg-primary/90 text-white rounded-2xl shadow-premium-md font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 flex items-center gap-3">
                            <Download className="h-6 w-6" /> Exportar Reporte
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
                <Card className="lg:col-span-2 border-border shadow-card rounded-3xl overflow-hidden bg-card">
                    <CardHeader className="border-b border-border/50 pb-6 pt-8 px-8">
                        <div className="flex justify-between items-center">
                            <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
                                <BarChart3 className="h-5 w-5 text-primary" />
                                Histórico Ventas vs. Gastos
                            </CardTitle>
                            <div className="flex gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-primary"></div>
                                    <span className="text-xs font-bold text-muted-foreground">Ventas</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-destructive"></div>
                                    <span className="text-xs font-bold text-muted-foreground">Gastos</span>
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
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                        </linearGradient>
                                        <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1}/>
                                            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis 
                                        dataKey="name" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12, fontWeight: 600}}
                                        dy={10}
                                    />
                                    <YAxis 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12, fontWeight: 600}}
                                        tickFormatter={(value) => `$${value}`}
                                    />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '16px', border: '1px solid hsl(var(--border))', boxShadow: 'var(--shadow-card)' }}
                                        itemStyle={{ fontWeight: 700 }}
                                        cursor={{ stroke: 'hsl(var(--border))', strokeWidth: 2 }}
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="ventas" 
                                        stroke="hsl(var(--primary))" 
                                        strokeWidth={4}
                                        fillOpacity={1} 
                                        fill="url(#colorSales)" 
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="gastos" 
                                        stroke="hsl(var(--destructive))" 
                                        strokeWidth={4}
                                        fillOpacity={1} 
                                        fill="url(#colorExpenses)" 
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Investment Efficiency Card */}
                <Card className="border-border shadow-card rounded-3xl overflow-hidden bg-gradient-to-br from-primary to-primary-dark text-white border-none">
                    <CardHeader className="pb-2 pt-8 px-8">
                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                            <PieChart className="h-5 w-5" /> Eficiencia Neta
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 space-y-8">
                        <div className="text-center py-4">
                            <h2 className="text-6xl font-black mb-2">{stats.netEfficiency.toFixed(1)}%</h2>
                            <p className="text-indigo-100 font-medium tracking-wide uppercase text-xs">Expense Ratio</p>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm font-bold opacity-80">Salud Financiera</span>
                                    <Badge className="bg-emerald-400 text-white border-none">Excelente</Badge>
                                </div>
                                <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
                                    <div className="bg-emerald-400 h-full rounded-full" style={{ width: '85%' }}></div>
                                </div>
                            </div>
                            
                            <p className="text-sm text-indigo-100 leading-relaxed  opacity-80">
                                "La eficiencia por debajo del 15% indica un uso altamente optimizado de los recursos para la generación de ventas."
                            </p>

                            <Button className="w-full bg-background text-indigo-700 hover:bg-muted font-bold rounded-xl mt-4">
                                Ver Detalle por Zona
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}


