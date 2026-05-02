/* ========================================================================
 * MASTER FRAMEWORK - EMPRESA CA
 * Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
 * ======================================================================== */

import { useState, useEffect } from "react";
import { m } from "framer-motion";
import {
    Settings,
    DollarSign,
    Target,
    Truck,
    Save,
    RefreshCw,
    ShieldCheck,
    Calculator,
    AlertCircle,
    Info,
    CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useOrganization } from "@/hooks/useOrganization";
import { supabase } from "@/integrations/supabase/client";
import { CompensationPolicy } from "@/hooks/useStrategicCompensation";

export default function CompensationConfig() {
    const { organization } = useOrganization();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [policy, setPolicy] = useState<Partial<CompensationPolicy>>({
        base_salary: 100,
        food_stamps: 100,
        vehicle_support: 200,
        sales_threshold: 2000,
        commission_rate: 0.015,
        papeleta_conversion_factor: 6,
        daily_no_stay_amount: 30,
        daily_with_stay_amount: 65,
        fuel_autonomy_factor: 6
    });

    useEffect(() => {
        if (organization?.id) {
            loadPolicy();
        }
    }, [organization?.id]);

    const loadPolicy = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('compensation_policies' as any)
                .select('*')
                .eq('organization_id', organization?.id)
                .eq('is_active', true)
                .maybeSingle();

            if (data) {
                setPolicy(data);
            }
        } catch (err) {
            console.error("Error loading policy:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!organization?.id) return;
        setSaving(true);
        try {
            const { error } = await supabase
                .from('compensation_policies' as any)
                .upsert({
                    ...policy,
                    organization_id: organization.id,
                    is_active: true,
                    updated_at: new Date().toISOString()
                } as any);

            if (error) throw error;

            toast({
                title: "Configuración Guardada",
                description: "Las nuevas reglas de compensación han sido aplicadas exitosamente.",
            });
        } catch (err: any) {
            toast({
                title: "Error al guardar",
                description: err.message,
                variant: "destructive"
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4 space-y-8 animate-in fade-in duration-500">
            {/* Header Industrial Elite */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-800 flex items-center gap-3">
                        <Settings className="h-8 w-8 text-primary font-bold" />
                        Configuración de Compensación
                    </h1>
                    <p className="text-slate-500 mt-2">
                        Control Maestro de <span className="font-bold text-primary  underline">Biofarco C.A.</span>
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button 
                        onClick={handleSave} 
                        disabled={saving}
                        className="gap-2 shadow-lg shadow-primary/20 min-w-[140px]"
                    >
                        {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        {saving ? "Guardando..." : "Guardar Cambios"}
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="fixed" className="w-full">
                <TabsList className="bg-slate-100/50 p-1 border border-slate-200">
                    <TabsTrigger value="fixed" className="gap-2 px-6">
                        <DollarSign className="h-4 w-4" /> Remuneración Fija
                    </TabsTrigger>
                    <TabsTrigger value="variable" className="gap-2 px-6">
                        <Target className="h-4 w-4" /> Comisiones (Variable)
                    </TabsTrigger>
                    <TabsTrigger value="logistics" className="gap-2 px-6">
                        <Truck className="h-4 w-4" /> Logística y Viáticos
                    </TabsTrigger>
                </TabsList>

                {/* --- SECCIÓN FIJA --- */}
                <TabsContent value="fixed" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
                            <CardHeader>
                                <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-500">Salario Base</CardTitle>
                                <CardDescription>Sueldo mensual garantizado por contrato.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                                    <Input 
                                        type="number" 
                                        className="pl-8 border-slate-200 focus:ring-primary/20 h-12 text-lg font-bold"
                                        value={policy.base_salary}
                                        onChange={(e) => setPolicy({...policy, base_salary: Number(e.target.value)})}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
                            <CardHeader>
                                <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-500">Cesta Ticket</CardTitle>
                                <CardDescription>Complemento alimentario obligatorio.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                                    <Input 
                                        type="number" 
                                        className="pl-8 border-slate-200 focus:ring-primary/20 h-12 text-lg font-bold"
                                        value={policy.food_stamps}
                                        onChange={(e) => setPolicy({...policy, food_stamps: Number(e.target.value)})}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-sm hover:shadow-md transition-shadow bg-blue-50/30">
                            <CardHeader>
                                <CardTitle className="text-sm font-bold uppercase tracking-widest text-blue-600 flex items-center justify-between">
                                    Apoyo de Vehículo
                                    <ShieldCheck className="h-4 w-4" />
                                </CardTitle>
                                <CardDescription>Garantía de movilidad mensual.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 font-bold">$</span>
                                    <Input 
                                        type="number" 
                                        className="pl-8 border-blue-200 focus:ring-blue-300 h-12 text-lg font-bold text-blue-700"
                                        value={policy.vehicle_support}
                                        onChange={(e) => setPolicy({...policy, vehicle_support: Number(e.target.value)})}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* --- SECCIÓN VARIABLE --- */}
                <TabsContent value="variable" className="mt-6">
                    <Card className="border-none shadow-sm overflow-hidden border-l-4 border-l-amber-500">
                        <CardHeader className="bg-amber-50/50">
                            <CardTitle className="flex items-center gap-2">
                                <Calculator className="h-5 w-5 text-amber-600" />
                                Parametrización del Motor de Comisiones
                            </CardTitle>
                            <CardDescription>Defina el comportamiento del activador de ventas netas.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                                        Umbral de Activación (Unidades)
                                        <Info className="h-3 w-3 cursor-help text-slate-300" title="Las comisiones se pagan a partir de esta unidad + 1" />
                                    </label>
                                    <Input 
                                        type="number" 
                                        value={policy.sales_threshold}
                                        className="h-12 border-slate-200 font-bold"
                                        onChange={(e) => setPolicy({...policy, sales_threshold: Number(e.target.value)})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Tasa de Comisión (%)</label>
                                    <div className="relative">
                                        <Input 
                                            type="number" 
                                            step="0.001"
                                            value={policy.commission_rate ? policy.commission_rate * 100 : 0}
                                            className="h-12 border-slate-200 font-bold pr-8"
                                            onChange={(e) => setPolicy({...policy, commission_rate: Number(e.target.value) / 100})}
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">%</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Factor Papeleta (regla 6:1)</label>
                                    <Input 
                                        type="number" 
                                        value={policy.papeleta_conversion_factor}
                                        className="h-12 border-slate-200 font-bold"
                                        onChange={(e) => setPolicy({...policy, papeleta_conversion_factor: Number(e.target.value)})}
                                    />
                                </div>
                                <div className="flex items-center gap-3 pt-6">
                                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                                        <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-800">Motor Activo</p>
                                        <p className="text-[10px] text-slate-500 ">Venta Neta (Pre-Impuestos)</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* --- SECCIÓN LOGÍSTICA --- */}
                <TabsContent value="logistics" className="mt-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="border-none shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg">Viáticos de Alimentación y Alojamiento</CardTitle>
                                <CardDescription>Montos fijos según desplazamiento.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100 text-slate-900">
                                    <div>
                                        <p className="text-sm font-bold text-slate-700">Monto Diario (Sin Pernocta)</p>
                                        <p className="text-xs text-slate-500">Almuerzos en campo regional.</p>
                                    </div>
                                    <div className="relative w-32">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                                        <Input 
                                            type="number" 
                                            className="pl-8 text-right font-bold"
                                            value={policy.daily_no_stay_amount}
                                            onChange={(e) => setPolicy({...policy, daily_no_stay_amount: Number(e.target.value)})}
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100 font-bold border-l-4 border-l-primary text-slate-900">
                                    <div>
                                        <p className="text-sm font-bold text-slate-700">Monto Diario (CON Pernocta)</p>
                                        <p className="text-xs text-slate-500">Cenas y Hotelería en zonas foráneas.</p>
                                    </div>
                                    <div className="relative w-32">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary font-bold">$</span>
                                        <Input 
                                            type="number" 
                                            className="pl-8 text-right font-black text-primary border-primary/20"
                                            value={policy.daily_with_stay_amount}
                                            onChange={(e) => setPolicy({...policy, daily_with_stay_amount: Number(e.target.value)})}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Truck className="h-5 w-5 text-slate-400" />
                                    Cálculo de Combustible (Gasolina)
                                </CardTitle>
                                <CardDescription>Autonomía configurada por flota/vehículo.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="pt-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Factor de Autonomía (Km por Litro)</label>
                                    <div className="flex items-center gap-4 mt-2">
                                        <Input 
                                            type="number" 
                                            value={policy.fuel_autonomy_factor}
                                            className="h-12 border-slate-200 font-bold"
                                            onChange={(e) => setPolicy({...policy, fuel_autonomy_factor: Number(e.target.value)})}
                                        />
                                        <div className="bg-slate-100 p-3 rounded-lg flex-1 border border-slate-200 text-slate-900">
                                            <p className="text-[10px] uppercase font-bold text-slate-400">Ejemplo de Cálculo</p>
                                            <p className="text-xs text-slate-600 mt-1 ">600km / {policy.fuel_autonomy_factor} = {Math.round(600 / (policy.fuel_autonomy_factor || 1))} Litros</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg flex gap-3 text-slate-900">
                                    <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
                                    <p className="text-[10px] text-amber-800 leading-normal">
                                        <strong>Recuerde:</strong> Solo se procesan reportes que adjunten evidencia fotográfica del kilometraje inicial y final.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
