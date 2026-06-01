/* ========================================================================
 * MASTER FRAMEWORK - EMPRESA CA
 * Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
 * ======================================================================== */

import { useState, useEffect } from "react";
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
import { EliteHeader, EliteCard, EliteTabsList, EliteTabsTrigger } from "@/components/layout/DesignSystem";

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
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            <EliteHeader 
                title="Configuración de Compensación"
                subtitle="Control Maestro de Biofarco C.A."
                icon={Settings}
                badgeText="RECURSOS HUMANOS"
                statusText="SISTEMA ACTIVO"
                statusColor="bg-primary"
                rightContent={
                    <Button 
                        onClick={handleSave} 
                        disabled={saving}
                        className="btn-elite-primary min-w-[140px]"
                    >
                        {saving ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                        {saving ? "Guardando..." : "Guardar Cambios"}
                    </Button>
                }
            />

            <Tabs defaultValue="fixed" className="w-full space-y-6">
                <EliteTabsList>
                    <EliteTabsTrigger value="fixed" label="Remuneración Fija" icon={DollarSign} />
                    <EliteTabsTrigger value="variable" label="Comisiones" icon={Target} />
                    <EliteTabsTrigger value="logistics" label="Logística" icon={Truck} />
                </EliteTabsList>

                {/* --- SECCIÓN FIJA --- */}
                <TabsContent value="fixed" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <EliteCard className="p-6">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Salario Base</h3>
                            <p className="text-[10px] text-muted-foreground mb-4">Sueldo mensual garantizado por contrato.</p>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">$</span>
                                <Input 
                                    type="number" 
                                    className="input-elite pl-8 w-full text-base font-semibold"
                                    value={policy.base_salary}
                                    onChange={(e) => setPolicy({...policy, base_salary: Number(e.target.value)})}
                                />
                            </div>
                        </EliteCard>

                        <EliteCard className="p-6 border-l-4 border-l-secondary">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Cesta Ticket</h3>
                            <p className="text-[10px] text-muted-foreground mb-4">Complemento alimentario obligatorio.</p>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">$</span>
                                <Input 
                                    type="number" 
                                    className="input-elite pl-8 w-full text-base font-semibold"
                                    value={policy.food_stamps}
                                    onChange={(e) => setPolicy({...policy, food_stamps: Number(e.target.value)})}
                                />
                            </div>
                        </EliteCard>

                        <EliteCard className="p-6 bg-primary/5 border-primary/20 border-l-4 border-l-primary">
                            <div className="flex items-center justify-between mb-1">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-primary">Apoyo de Vehículo</h3>
                                <ShieldCheck className="h-4 w-4 text-primary" />
                            </div>
                            <p className="text-[10px] text-primary/70 mb-4">Garantía de movilidad mensual.</p>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary font-bold">$</span>
                                <Input 
                                    type="number" 
                                    className="input-elite pl-8 w-full text-base font-semibold bg-white border-primary/20 text-primary"
                                    value={policy.vehicle_support}
                                    onChange={(e) => setPolicy({...policy, vehicle_support: Number(e.target.value)})}
                                />
                            </div>
                        </EliteCard>
                    </div>
                </TabsContent>

                {/* --- SECCIÓN VARIABLE --- */}
                <TabsContent value="variable" className="mt-6">
                    <EliteCard className="border-l-4 border-l-warning overflow-hidden">
                        <div className="bg-warning/10 p-6 border-b border-warning/20">
                            <h3 className="flex items-center gap-2 font-bold text-warning text-lg">
                                <Calculator className="h-5 w-5" />
                                Parametrización del Motor de Comisiones
                            </h3>
                            <p className="text-xs text-warning/80 mt-1">Defina el comportamiento del activador de ventas netas.</p>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1">
                                        Umbral Activación
                                        <Info className="h-3 w-3 cursor-help opacity-50" title="Las comisiones se pagan a partir de esta unidad + 1" />
                                    </label>
                                    <Input 
                                        type="number" 
                                        value={policy.sales_threshold}
                                        className="input-elite w-full font-semibold"
                                        onChange={(e) => setPolicy({...policy, sales_threshold: Number(e.target.value)})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-muted-foreground uppercase">Tasa de Comisión (%)</label>
                                    <div className="relative">
                                        <Input 
                                            type="number" 
                                            step="0.001"
                                            value={policy.commission_rate ? policy.commission_rate * 100 : 0}
                                            className="input-elite w-full font-semibold pr-8"
                                            onChange={(e) => setPolicy({...policy, commission_rate: Number(e.target.value) / 100})}
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-muted-foreground uppercase">Factor Papeleta (6:1)</label>
                                    <Input 
                                        type="number" 
                                        value={policy.papeleta_conversion_factor}
                                        className="input-elite w-full font-semibold"
                                        onChange={(e) => setPolicy({...policy, papeleta_conversion_factor: Number(e.target.value)})}
                                    />
                                </div>
                                <div className="flex items-center gap-3 pt-6">
                                    <div className="icon-box-success w-10 h-10 !rounded-full shrink-0">
                                        <CheckCircle2 className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-foreground">Motor Activo</p>
                                        <p className="text-[10px] text-muted-foreground">Venta Neta (Pre-Impuestos)</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </EliteCard>
                </TabsContent>

                {/* --- SECCIÓN LOGÍSTICA --- */}
                <TabsContent value="logistics" className="mt-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <EliteCard className="p-6">
                            <h3 className="text-lg font-bold mb-1">Viáticos de Alimentación</h3>
                            <p className="text-xs text-muted-foreground mb-6">Montos fijos según desplazamiento.</p>
                            
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border">
                                    <div>
                                        <p className="text-sm font-bold text-foreground">Monto Diario (Sin Pernocta)</p>
                                        <p className="text-xs text-muted-foreground">Almuerzos en campo regional.</p>
                                    </div>
                                    <div className="relative w-32">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">$</span>
                                        <Input 
                                            type="number" 
                                            className="input-elite pl-8 text-right font-bold"
                                            value={policy.daily_no_stay_amount}
                                            onChange={(e) => setPolicy({...policy, daily_no_stay_amount: Number(e.target.value)})}
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-primary/5 rounded-xl border border-primary/20 font-bold border-l-4 border-l-primary">
                                    <div>
                                        <p className="text-sm font-bold text-foreground">Monto Diario (CON Pernocta)</p>
                                        <p className="text-xs text-muted-foreground">Cenas y Hotelería en zonas foráneas.</p>
                                    </div>
                                    <div className="relative w-32">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary font-bold">$</span>
                                        <Input 
                                            type="number" 
                                            className="input-elite pl-8 text-right font-black text-primary border-primary/20 bg-white"
                                            value={policy.daily_with_stay_amount}
                                            onChange={(e) => setPolicy({...policy, daily_with_stay_amount: Number(e.target.value)})}
                                        />
                                    </div>
                                </div>
                            </div>
                        </EliteCard>

                        <EliteCard className="p-6">
                            <div className="flex items-center gap-2 mb-1">
                                <Truck className="h-5 w-5 text-muted-foreground" />
                                <h3 className="text-lg font-bold">Cálculo de Combustible</h3>
                            </div>
                            <p className="text-xs text-muted-foreground mb-6">Autonomía configurada por vehículo.</p>
                            
                            <div className="space-y-6">
                                <div>
                                    <label className="text-xs font-bold text-muted-foreground uppercase">Km por Litro</label>
                                    <div className="flex items-center gap-4 mt-2">
                                        <Input 
                                            type="number" 
                                            value={policy.fuel_autonomy_factor}
                                            className="input-elite w-32 font-bold"
                                            onChange={(e) => setPolicy({...policy, fuel_autonomy_factor: Number(e.target.value)})}
                                        />
                                        <div className="bg-muted/30 p-3 rounded-xl flex-1 border border-border">
                                            <p className="text-[10px] uppercase font-bold text-muted-foreground">Ejemplo de Cálculo</p>
                                            <p className="text-xs text-foreground font-semibold mt-1">600km / {policy.fuel_autonomy_factor} = {Math.round(600 / (policy.fuel_autonomy_factor || 1))} Litros</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4 bg-warning/10 border border-warning/20 rounded-xl flex gap-3">
                                    <AlertCircle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                                    <p className="text-xs text-warning/90 leading-normal font-medium">
                                        <strong>Recuerde:</strong> Solo se procesan reportes que adjunten evidencia fotográfica del kilometraje inicial y final.
                                    </p>
                                </div>
                            </div>
                        </EliteCard>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
