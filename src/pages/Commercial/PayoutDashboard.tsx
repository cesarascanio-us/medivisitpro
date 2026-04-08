/* ========================================================================
 * MASTER FRAMEWORK - EMPRESA CA
 * Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
 * ======================================================================== */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    TrendingUp,
    DollarSign,
    Package,
    Truck,
    ChevronUp,
    ChevronDown,
    Calendar,
    ArrowRight,
    Search,
    Download,
    Trophy,
    Target,
    Info,
    Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useOrganization } from "@/hooks/useOrganization";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useStrategicCompensation, CompensationPolicy } from "@/hooks/useStrategicCompensation";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function PayoutDashboard() {
    const { organization } = useOrganization();
    const { user } = useAuth();
    const { normalizeUnits, calculateCommission, calculateFuelIndemnity, getActivePolicy } = useStrategicCompensation(organization?.id || "");
    
    const [loading, setLoading] = useState(true);
    const [policy, setPolicy] = useState<CompensationPolicy | null>(null);
    const [stats, setStats] = useState({
        totalUnits: 0,
        netSales: 0,
        monthlyFixed: 0,
        variableCommission: 0,
        totalKilometers: 0,
        fuelLiters: 0,
        viaticos: 0
    });

    useEffect(() => {
        if (organization?.id && user?.id) {
            fetchData();
        }
    }, [organization?.id, user?.id]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const activePolicy = await getActivePolicy();
            setPolicy(activePolicy);

            if (!activePolicy) return;

            // 1. Fetch Transfer Orders of the current month
            const startOfMonth = new Date();
            startOfMonth.setDate(1);
            startOfMonth.setHours(0, 0, 0, 0);

            const { data: orders } = await supabase
                .from('transfer_orders')
                .select('subtotal, products')
                .eq('user_id', user?.id)
                .gte('order_date', startOfMonth.toISOString());

            const { data: expenses }: { data: any[] | null } = await supabase
                .from('expense_reports' as any)
                .select('*')
                .eq('user_id', user?.id)
                .gte('created_at', startOfMonth.toISOString());

            // 3. Process Data
            let rawUnits = 0;
            let netSales = 0;

            orders?.forEach(order => {
                netSales += (order.subtotal || 0);
                const products = Array.isArray(order.products) ? order.products : [];
                rawUnits += normalizeUnits(products, activePolicy);
            });

            let kms = 0;
            let viaticosTotal = 0;
            expenses?.forEach(exp => {
                kms += (exp.end_km - exp.start_km);
                // Viáticos logic simplified for demo
                const daysWithStay = exp.has_pernocta ? 1 : 0;
                const daysNoStay = exp.has_pernocta ? 0 : 1;
                viaticosTotal += (daysWithStay * activePolicy.daily_with_stay_amount) + (daysNoStay * activePolicy.daily_no_stay_amount);
            });

            const comm = calculateCommission(rawUnits, netSales, activePolicy);
            const fuel = calculateFuelIndemnity(kms, activePolicy);

            setStats({
                totalUnits: rawUnits,
                netSales,
                monthlyFixed: activePolicy.base_salary + activePolicy.food_stamps + activePolicy.vehicle_support,
                variableCommission: comm,
                totalKilometers: kms,
                fuelLiters: fuel,
                viaticos: viaticosTotal
            });

        } catch (err) {
            console.error("Dashboard error:", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="p-20 text-center flex flex-col items-center gap-6">
            <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
            <div className="space-y-2">
                <p className="text-xl font-black text-slate-900 tracking-tighter">Sincronizando Métricas...</p>
                <p className="text-sm text-slate-500 max-w-xs mx-auto">Calculando bonificaciones estratégicas y normalización de unidades Biofarco.</p>
            </div>
        </div>
    );

    if (!policy && !loading) return (
        <div className="p-20 text-center flex flex-col items-center gap-6">
            <Info className="h-12 w-12 text-amber-500" />
            <div className="space-y-2">
                <p className="text-xl font-black text-slate-900 tracking-tighter">Sin Política Activa</p>
                <p className="text-sm text-slate-500 max-w-xs mx-auto">No se ha encontrado una política de compensación activa para tu organización. Contacta a un administrador.</p>
            </div>
            <Button variant="outline" onClick={() => window.location.reload()}>Reintentar</Button>
        </div>
    );

    const totalPayout = stats.monthlyFixed + stats.variableCommission;
    const progressPercent = Math.min((stats.totalUnits / (policy?.sales_threshold || 2000)) * 100, 100);

    return (
        <div className="container mx-auto py-8 px-4 space-y-8 animate-in slide-in-from-bottom-4 duration-700">
            {/* Header / Month Selector */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter text-slate-900 flex items-center gap-3">
                        <Trophy className="h-10 w-10 text-amber-500" />
                        Mi Compensación
                    </h1>
                    <p className="text-slate-500 font-medium">
                        Liquidación Estratégica: <span className="text-primary font-bold">{format(new Date(), 'MMMM yyyy', { locale: es })}</span>
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="gap-2 border-slate-200">
                        <Download className="h-4 w-4" /> Exportar Wallet
                    </Button>
                    <Badge variant="secondary" className="px-4 py-2 text-sm font-bold bg-emerald-50 text-emerald-700 border-emerald-100 uppercase">
                        Sincronizado Local-First
                    </Badge>
                </div>
            </div>

            {/* Principal KPI Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Total Payout Card */}
                <Card className="corporate-card bg-slate-900 text-white border-none shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                        <DollarSign className="h-32 w-32" />
                    </div>
                    <CardHeader>
                        <CardTitle className="text-slate-400 uppercase text-xs font-black tracking-[0.2em]">Estimado Mensual Acumulado</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-6xl font-black tracking-tighter tabular-nums">
                            ${totalPayout.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </p>
                        <div className="flex items-center gap-2 text-sm">
                            <Badge className="bg-emerald-500 hover:bg-emerald-600 border-none px-3 font-bold">
                                +${stats.variableCommission.toFixed(2)} Var
                            </Badge>
                            <span className="text-slate-400">vs Mes Anterior</span>
                            <ChevronUp className="h-4 w-4 text-emerald-400" />
                        </div>
                    </CardContent>
                </Card>

                {/* Progress toward Threshold */}
                <Card className="lg:col-span-2 border-none shadow-sm relative overflow-hidden border-t-4 border-t-primary">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div className="space-y-1">
                            <CardTitle className="text-2xl font-bold flex items-center gap-2">
                                <Target className="h-6 w-6 text-primary" />
                                Meta de Activación
                            </CardTitle>
                            <CardDescription>
                                Unidades normalizadas (Papeletas / {policy?.papeleta_conversion_factor})
                            </CardDescription>
                        </div>
                        <div className="text-right">
                            <p className="text-3xl font-black text-slate-800">{stats.totalUnits.toFixed(0)}</p>
                            <p className="text-xs font-bold text-slate-400 uppercase">/ {policy?.sales_threshold} UNID</p>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-4">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm font-bold px-1">
                                <span className={progressPercent >= 100 ? "text-emerald-600" : "text-slate-600"}>
                                    {progressPercent >= 100 ? "UMBRAL SUPERADO (PAGANDO COMISIÓN)" : "EN PROGRESO"}
                                </span>
                                <span>{progressPercent.toFixed(1)}%</span>
                            </div>
                            <Progress value={progressPercent} className="h-4 bg-slate-100" />
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-50">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase">Venta Neta</p>
                                <p className="text-sm font-bold text-slate-800">${stats.netSales.toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase">Factor Com.</p>
                                <p className="text-sm font-bold text-slate-800">{(policy?.commission_rate || 0) * 100}%</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase">Ratio Conversión</p>
                                <p className="text-sm font-bold text-slate-800">6:1</p>
                            </div>
                            <div className="px-3 py-1 bg-primary/5 rounded-lg border border-primary/10">
                                <p className="text-[10px] font-black text-primary uppercase">Variable</p>
                                <p className="text-sm font-bold text-primary">${stats.variableCommission.toFixed(2)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Secondary Sections: Fixed Breakdown & Logistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Fixed Breakdown */}
                <Card className="border-none shadow-sm h-full">
                    <CardHeader>
                        <CardTitle className="text-lg">Desglose Fijo Garantizado</CardTitle>
                        <CardDescription>Montos liquidados por Biofarco Mensualmente</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {[
                            { label: "Salario Base", amount: policy?.base_salary || 0, icon: DollarSign },
                            { label: "Cesta Ticket", amount: policy?.food_stamps || 0, icon: Package },
                            { label: "Apoyo Vehículo", amount: policy?.vehicle_support || 0, icon: Truck },
                        ].map((item) => (
                            <div key={item.label} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-slate-100 rounded-lg"><item.icon className="h-4 w-4 text-slate-600" /></div>
                                    <span className="text-sm font-semibold text-slate-700">{item.label}</span>
                                </div>
                                <span className="font-bold text-slate-800">${item.amount.toFixed(2)}</span>
                            </div>
                        ))}
                        <div className="pt-4 border-t border-slate-100 flex justify-between items-center px-3">
                            <span className="text-sm font-black uppercase text-slate-900 tracking-wider">Total Ingreso Fijo</span>
                            <span className="text-xl font-black text-primary">${stats.monthlyFixed.toFixed(2)}</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Logistics / Gas / Viáticos */}
                <Card className="border-none shadow-sm h-full">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Truck className="h-5 w-5 text-slate-400" />
                            Logística y Reembolsos (KM)
                        </CardTitle>
                        <CardDescription>Cálculos basados en reportes de kilometraje semanales.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-orange-50/50 rounded-2xl border border-orange-100">
                                <p className="text-[10px] font-black text-orange-600 uppercase">Recorrido Total</p>
                                <p className="text-2xl font-black text-orange-700">{stats.totalKilometers.toLocaleString()} KM</p>
                            </div>
                            <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                                <p className="text-[10px] font-black text-blue-600 uppercase">Gasolina Est.</p>
                                <p className="text-2xl font-black text-blue-700">{Math.round(stats.fuelLiters)} Lts</p>
                                <p className="text-[10px] font-bold text-blue-400 mt-1">Factor {policy?.fuel_autonomy_factor}km/L</p>
                            </div>
                        </div>
                        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-black text-emerald-600 uppercase">Viáticos (Alim/Hosp)</p>
                                <p className="text-2xl font-black text-emerald-700">${stats.viaticos.toFixed(2)}</p>
                            </div>
                            <Button size="sm" variant="outline" className="bg-white border-emerald-200 text-emerald-700 font-bold gap-2">
                                Nuevo Reporte <ArrowRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
