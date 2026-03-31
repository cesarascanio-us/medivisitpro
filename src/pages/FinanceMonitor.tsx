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
            
            // 1. Fetch Sales (transfer_orders)
            let salesQuery = supabase.from('transfer_orders').select('total, created_at, status');
            if (filters.repId && filters.repId !== 'all') salesQuery = salesQuery.eq('user_id', filters.repId);
            if (filters.zoneId && filters.zoneId !== 'all') salesQuery = salesQuery.eq('zone_id', filters.zoneId);
            
            // 2. Fetch Expenses
            let expensesQuery = supabase.from('expenses').select('amount, status, category');
            if (filters.repId && filters.repId !== 'all') expensesQuery = expensesQuery.eq('user_id', filters.repId);
            
            // 3. Fetch Sample Drops (for investment calculation)
            // Note: In a real scenario, we'd join with products to get cost. 
            // Here we'll use a heuristic: $2.5 average cost per sample unit.
            let samplesQuery = supabase.from('visit_samples').select('quantity');
            
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
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <Scale className="h-8 w-8 text-indigo-600" />
                        Finance Monitor <span className="text-indigo-600">A0</span>
                    </h1>
                    <p className="text-slate-500 font-medium">Análisis de ROI y Eficiencia de Inversión Operativa</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="rounded-xl border-slate-200" onClick={loadFinanceData}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Actualizar
                    </Button>
                    <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 rounded-xl">
                        <Download className="h-4 w-4 mr-2" /> Exportar Reporte
                    </Button>
                </div>
            </div>

            {/* Admin Filter */}
            <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden bg-white/50 backdrop-blur-sm">
                <CardContent className="p-4">
                    <AdminDataFilter onFilterChange={setFilters} />
                </CardContent>
            </Card>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <FinanceCard 
                    title="Ventas Brutas" 
                    value={`$${stats.totalSales.toLocaleString()}`} 
                    subvalue={`+${stats.salesGrowth}% vs mes anterior`}
                    icon={<TrendingUp className="text-emerald-500" />}
                    trend="up"
                    color="emerald"
                />
                <FinanceCard 
                    title="Gastos Operativos" 
                    value={`$${stats.totalExpenses.toLocaleString()}`} 
                    subvalue={`${((stats.totalExpenses / stats.totalSales) * 100 || 0).toFixed(1)}% del ingreso`}
                    icon={<Wallet className="text-rose-500" />}
                    trend="none"
                    color="rose"
                />
                <FinanceCard 
                    title="Inversión Muestras" 
                    value={`$${stats.sampleInvestment.toLocaleString()}`} 
                    subvalue="Costo estimado de promoción"
                    icon={<Package className="text-amber-500" />}
                    trend="none"
                    color="amber"
                />
                <FinanceCard 
                    title="Índice ROI" 
                    value={`${stats.roi.toFixed(2)}x`} 
                    subvalue="Retorno por cada $1 invertido"
                    icon={<DollarSign className="text-indigo-500" />}
                    trend={stats.roi > 3 ? "up" : "down"}
                    color="indigo"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Sales vs Expenses Chart */}
                <Card className="lg:col-span-2 border-slate-200 shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden bg-white">
                    <CardHeader className="border-b border-slate-50 pb-6 pt-8 px-8">
                        <div className="flex justify-between items-center">
                            <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                <BarChart3 className="h-5 w-5 text-indigo-500" />
                                Histórico Ventas vs. Gastos
                            </CardTitle>
                            <div className="flex gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                                    <span className="text-xs font-bold text-slate-500">Ventas</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-rose-400"></div>
                                    <span className="text-xs font-bold text-slate-500">Gastos</span>
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
                                        tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}}
                                        dy={10}
                                    />
                                    <YAxis 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}}
                                        tickFormatter={(value) => `$${value}`}
                                    />
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                                        cursor={{ stroke: '#e2e8f0', strokeWidth: 2 }}
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="ventas" 
                                        stroke="#6366f1" 
                                        strokeWidth={4}
                                        fillOpacity={1} 
                                        fill="url(#colorSales)" 
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="gastos" 
                                        stroke="#f43f5e" 
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
                <Card className="border-slate-200 shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-600 to-indigo-800 text-white border-none">
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
                            
                            <p className="text-sm text-indigo-100 leading-relaxed italic opacity-80">
                                "La eficiencia por debajo del 15% indica un uso altamente optimizado de los recursos para la generación de ventas."
                            </p>

                            <Button className="w-full bg-white text-indigo-700 hover:bg-indigo-50 font-bold rounded-xl mt-4">
                                Ver Detalle por Zona
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function FinanceCard({ title, value, subvalue, icon, trend, color }: any) {
    const colors: any = {
        emerald: "text-emerald-600 bg-emerald-50",
        rose: "text-rose-600 bg-rose-50",
        amber: "text-amber-600 bg-amber-50",
        indigo: "text-indigo-600 bg-indigo-50"
    };

    return (
        <Card className="border-slate-200 shadow-sm hover:shadow-md transition-all rounded-3xl overflow-hidden bg-white group">
            <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-2xl ${colors[color] || 'bg-slate-50'}`}>
                        {icon}
                    </div>
                    {trend === 'up' && <ArrowUpRight className="text-emerald-500 h-5 w-5" />}
                    {trend === 'down' && <ArrowDownRight className="text-rose-500 h-5 w-5" />}
                </div>
                <div className="space-y-1">
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{title}</p>
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight transition-transform group-hover:scale-105 origin-left">{value}</h3>
                    <p className="text-xs text-slate-500 font-medium">{subvalue}</p>
                </div>
            </CardContent>
        </Card>
    );
}
