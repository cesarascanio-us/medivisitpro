/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Crown, Check, X, CreditCard, RefreshCw, Rocket, Plus, Edit2, Trash2, Shield, TrendingUp, Zap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface PlanType {
    id: string;
    name: string;
    price: number;
    interval: 'month' | 'year';
    features: string[];
    active: boolean;
    description?: string; // Added description
}

const OFFICIAL_PLANS = [
    {
        name: 'Starter',
        price: 9.99,
        interval: 'month',
        description: 'Para estudiantes y nuevos visitadores.',
        features: [
            'Gestión de hasta 120 médicos',
            'Gestión de hasta 100 farmacias',
            'Centros de Salud ilimitados',
            'Rutas optimizadas básicas',
            'Agenda digital'
        ],
        active: true
    },
    {
        name: 'Pro',
        price: 19.99,
        interval: 'month',
        description: 'Para visitadores de alto rendimiento.',
        features: [
            'Médicos ilimitados',
            'Farmacias ilimitadas',
            'Rutas inteligentes ilimitadas',
            'Control de stock de muestras',
            'Analytics de desempeño'
        ],
        active: true
    },
    {
        name: 'Team',
        price: 0, // Contact Sales
        interval: 'month',
        description: 'Para laboratorios y gerentes.',
        features: [
            'Dashboard de gerencia',
            'Asignación de zonas',
            'Reportes consolidados',
            'Soporte dedicado 24/7',
            'Facturación corporativa'
        ],
        active: true
    }
];

export default function PlanManager() {
    const [newPlanName, setNewPlanName] = useState('');
    const [newPlanPrice, setNewPlanPrice] = useState('');
    const [newPlanFeatures, setNewPlanFeatures] = useState<string[]>([]);
    const [featureInput, setFeatureInput] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [plans, setPlans] = useState<PlanType[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const [editingPlan, setEditingPlan] = useState<PlanType | null>(null);

    // Mock initial data if empty, or fetch
    const fetchPlans = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('subscription_plans')
            .select('*')
            .order('price', { ascending: true });

        if (error) {
            console.error('Error fetching plans:', error);
        } else {
            setPlans(data as PlanType[]);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchPlans();
    }, []);

    const togglePlan = async (id: string, currentStatus: boolean) => {
        const { error } = await supabase
            .from('subscription_plans')
            .update({ active: !currentStatus })
            .eq('id', id);

        if (error) {
            toast({ title: 'Error', description: 'No se pudo actualizar el estado.', variant: 'destructive' });
        } else {
            setPlans(plans.map(p => p.id === id ? { ...p, active: !currentStatus } : p));
            toast({ title: 'Actualizado', description: `Plan estado cambiado.` });
        }
    };

    const handleSavePlan = async () => {
        if (!newPlanName || !newPlanPrice) return;

        const payload = {
            name: newPlanName,
            price: parseFloat(newPlanPrice),
            features: newPlanFeatures
        };

        if (editingPlan) {
            // Update existing plan
            const { error } = await supabase
                .from('subscription_plans')
                .update(payload)
                .eq('id', editingPlan.id);

            if (error) {
                toast({ title: 'Error', description: error.message, variant: 'destructive' });
            } else {
                setPlans(plans.map(p => p.id === editingPlan.id ? { ...p, ...payload } : p));
                setIsDialogOpen(false);
                resetForm();
                toast({ title: 'Actualizado', description: 'Plan actualizado exitosamente.' });
            }
        } else {
            // Create new plan
            const { data, error } = await supabase
                .from('subscription_plans')
                .insert({
                    ...payload,
                    interval: 'month',
                    active: true
                })
                .select()
                .single();

            if (error) {
                toast({ title: 'Error', description: error.message, variant: 'destructive' });
            } else {
                setPlans([...plans, data as PlanType]);
                setIsDialogOpen(false);
                resetForm();
                toast({ title: 'Creado', description: 'Nuevo plan guardado exitosamente.' });
            }
        }
    };

    const resetForm = () => {
        setEditingPlan(null);
        setNewPlanName('');
        setNewPlanPrice('');
        setNewPlanFeatures([]);
        setFeatureInput('');
    }

    const addFeature = () => {
        if (!featureInput.trim()) return;
        setNewPlanFeatures([...newPlanFeatures, featureInput.trim()]);
        setFeatureInput('');
    };

    const removeFeature = (index: number) => {
        setNewPlanFeatures(newPlanFeatures.filter((_, i) => i !== index));
    };

    const handleDeletePlan = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar este plan?')) return;

        const { error } = await supabase
            .from('subscription_plans')
            .delete()
            .eq('id', id);

        if (error) {
            toast({ title: 'Error', description: 'No se pudo eliminar el plan.', variant: 'destructive' });
        } else {
            setPlans(plans.filter(p => p.id !== id));
            toast({ title: 'Eliminado', description: 'El plan ha sido eliminado.' });
        }
    };

    const resetToOfficialPlans = async () => {
        if (!confirm('¿Confirmar sincronización? Se actualizarán los planes "Free", "Professional" y "Enterprise" a la nueva estructura comercial.')) return;
        setLoading(true);

        try {
            console.log("Iniciando sincronización de planes...");

            // 1. Fetch current plans
            const { data: currentPlans, error: fetchError } = await supabase.from('subscription_plans').select('*');

            if (fetchError) {
                throw new Error(`Error al leer planes: ${fetchError.message}`);
            }

            const safePlans = currentPlans || [];
            console.log("Planes actuales encontrados:", safePlans.map(p => p.name));

            // Helper to find match
            const findMatch = (keywords: string[]) =>
                safePlans.find(p => keywords.some(k => p.name.toLowerCase().includes(k.toLowerCase())));

            // 2. Process OFFICIAL_PLANS SERIALLY to avoid conflicts
            for (const official of OFFICIAL_PLANS) {
                let existingPlan = null;

                // Explicit Mapping Logic
                if (official.name === 'Starter') {
                    existingPlan = findMatch(['Starter', 'Free', 'Básico', 'Basic', 'Gratis']);
                } else if (official.name === 'Pro') {
                    existingPlan = findMatch(['Pro', 'Professional', 'Premium', 'Avanzado', 'Estándar']);
                } else if (official.name === 'Team') {
                    existingPlan = findMatch(['Team', 'Enterprise', 'Corporativo', 'Master', 'Business']);
                }

                const planData = {
                    name: official.name,
                    price: official.price,
                    interval: official.interval,
                    features: official.features,
                    description: official.description,
                    active: true
                };

                if (existingPlan) {
                    console.log(`Actualizando plan existente: ${existingPlan.name} -> ${official.name}`);
                    const { error } = await supabase
                        .from('subscription_plans')
                        .update(planData)
                        .eq('id', existingPlan.id);

                    if (error) console.error(`Error actualizando ${official.name}:`, error);
                } else {
                    console.log(`Creando nuevo plan: ${official.name}`);
                    const { error } = await supabase
                        .from('subscription_plans')
                        .insert(planData);

                    if (error) console.error(`Error creando ${official.name}:`, error);
                }
            }

            // 3. Refresh UI
            await fetchPlans();

            toast({
                title: 'Sincronización Completada',
                description: 'Los planes se han actualizado a la versión oficial. Si no ves los cambios, recarga la página.'
            });

        } catch (e: any) {
            console.error("Error crítico en sincronización:", e);
            toast({ title: 'Error de Sincronización', description: e.message, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-background space-y-8 p-1">
            {/* Premium White Header Container */}
            <header className="bg-card px-8 py-10 rounded-[3rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-border relative overflow-hidden -mt-2 mx-1">
                {/* Decorative backgrounds */}
                <div className="absolute -top-32 -right-32 w-80 h-80 bg-indigo-50 dark:bg-indigo-900/10 rounded-full blur-3xl opacity-60"></div>
                <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-emerald-50 dark:bg-emerald-900/10 rounded-full blur-3xl opacity-60"></div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-3xl flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-none transform transition-transform hover:scale-105">
                            <Rocket className="text-white h-10 w-10" />
                        </div>
                        <div>
                            <p className="text-indigo-500 text-[11px] font-black uppercase tracking-[0.25em] mb-1.5">Monetización & SaaS</p>
                            <h1 className="text-4xl font-black text-foreground tracking-tight">
                                Gestión de Planes
                            </h1>
                            <p className="text-muted-foreground text-sm mt-1 max-w-lg font-medium">Configura la oferta comercial, límites de uso e infraestructura de precios</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <Dialog open={isDialogOpen} onOpenChange={(open) => {
                            setIsDialogOpen(open);
                            if (!open) resetForm();
                        }}>
                            <DialogTrigger asChild>
                                <Button className="h-14 px-8 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-200 dark:shadow-none transition-all hover:-translate-y-0.5 active:translate-y-0 font-bold uppercase text-[10px] tracking-widest">
                                    <Plus className="mr-3 h-4 w-4" />
                                    Crear Nuevo Plan
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-card border-none shadow-2xl rounded-[2rem] max-w-md">
                                <DialogHeader>
                                    <DialogTitle className="text-2xl font-black text-foreground tracking-tight">
                                        {editingPlan ? 'Editar Plan' : 'Nuevo Plan de Suscripción'}
                                    </DialogTitle>
                                </DialogHeader>
                                <div className="space-y-6 py-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-400">Nombre del Plan</label>
                                        <input
                                            className="flex h-12 w-full rounded-xl border border-slate-100 bg-slate-50 px-4 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold"
                                            placeholder="Ej: Enterprise"
                                            value={newPlanName}
                                            onChange={(e) => setNewPlanName(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-400">Precio Mensual ($)</label>
                                        <input
                                            type="number"
                                            className="flex h-12 w-full rounded-xl border border-slate-100 bg-slate-50 px-4 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold"
                                            placeholder="99.99"
                                            value={newPlanPrice}
                                            onChange={(e) => setNewPlanPrice(e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-400">Características</label>
                                        <div className="flex gap-2">
                                            <input
                                                className="flex h-12 flex-1 rounded-xl border border-slate-100 bg-slate-50 px-4 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
                                                placeholder="Nueva característica..."
                                                value={featureInput}
                                                onChange={(e) => setFeatureInput(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && addFeature()}
                                            />
                                            <Button size="icon" onClick={addFeature} className="bg-indigo-600 hover:bg-indigo-500 rounded-xl w-12 h-12">
                                                <Plus className="w-5 h-5" />
                                            </Button>
                                        </div>
                                        <div className="max-h-40 overflow-y-auto space-y-2 mt-4 p-1">
                                            {newPlanFeatures.map((feat, idx) => (
                                                <div key={idx} className="flex items-center justify-between bg-muted p-3 rounded-xl border border-border">
                                                    <span className="text-xs font-bold text-muted-foreground truncate mr-2">{feat}</span>
                                                    <Button variant="ghost" size="sm" onClick={() => removeFeature(idx)} className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg">
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <Button onClick={handleSavePlan} className="w-full h-14 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-indigo-100 mt-4 transition-all active:scale-[0.98]">
                                        {editingPlan ? 'Actualizar Plan' : 'Guardar Plan'}
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>

                        <Button
                            variant="outline"
                            onClick={resetToOfficialPlans}
                            disabled={loading}
                            className="h-14 px-8 rounded-2xl border-slate-200 bg-white shadow-sm hover:shadow-md transition-all active:scale-95 text-slate-600 font-bold uppercase text-[10px] tracking-widest"
                        >
                            <RefreshCw className={`mr-3 h-4 w-4 ${loading ? 'animate-spin text-indigo-500' : ''}`} />
                            Sincronizar Cloud
                        </Button>
                    </div>
                </div>
            </header>

            {loading && plans.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 gap-6">
                    <Loader2 className="w-16 h-16 animate-spin text-indigo-500" />
                    <p className="text-slate-400 font-black uppercase text-xs tracking-[0.3em]">Cargando ecosistema de cargos...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4 pb-20">
                    {plans.map((plan) => (
                        <Card
                            key={plan.id}
                            className={`relative flex flex-col h-full rounded-[3rem] border-none shadow-2xl shadow-slate-200/50 dark:shadow-none bg-card overflow-hidden group transition-all duration-500 hover:translate-y-[-10px] ${!plan.active ? 'opacity-60 grayscale' : 'hover:shadow-indigo-200/50'}`}
                        >
                            {/* Decorative accent */}
                            <div className="absolute top-0 left-0 w-full h-2.5 bg-gradient-to-r from-indigo-500 via-indigo-400 to-indigo-600"></div>

                            <CardHeader className="pt-12 pb-8 px-10">
                                <div className="flex justify-between items-start mb-8">
                                    <div className="w-16 h-16 bg-muted rounded-[1.5rem] flex items-center justify-center group-hover:bg-indigo-600 transition-colors duration-500">
                                        <Shield className="w-8 h-8 text-indigo-500 group-hover:text-white transition-colors" />
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Badge className={`${plan.active ? 'bg-indigo-50 text-indigo-700' : 'bg-red-50 text-red-700'} border-none font-black text-[10px] uppercase tracking-wider px-3.5 py-1.5 rounded-full`}>
                                            {plan.active ? 'Activo' : 'Inactivo'}
                                        </Badge>
                                        <Switch
                                            checked={plan.active}
                                            onCheckedChange={() => togglePlan(plan.id, plan.active)}
                                            className="data-[state=checked]:bg-indigo-600"
                                        />
                                    </div>
                                </div>

                                <CardTitle className="text-3xl font-black text-foreground tracking-tighter mb-3 uppercase flex items-center gap-2">
                                    {plan.name}
                                    {plan.name === 'Pro' && <Badge className="bg-amber-400 text-amber-950 font-black border-none text-[9px] px-2 py-0.5 rounded-md">POPULAR</Badge>}
                                </CardTitle>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-5xl font-black text-foreground tracking-tighter">${plan.price}</span>
                                    <span className="text-sm font-bold text-muted-foreground uppercase tracking-[0.2em]">/ {plan.interval === 'month' ? 'mes' : 'año'}</span>
                                </div>
                                <CardDescription className="text-muted-foreground mt-6 font-medium leading-relaxed  text-sm">
                                    {plan.description || "Solución avanzada para la industria farmacéutica."}
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="flex-grow px-10 pb-10">
                                <div className="pt-8 border-t border-border">
                                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 mb-6">Capacidades del Plan</p>
                                    <ul className="space-y-4">
                                        {plan.features?.map((feature, i) => (
                                            <li key={i} className="flex items-start group/li">
                                                <div className="w-5 h-5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center mr-3 mt-0.5 shrink-0 group-hover/li:bg-emerald-500 group-hover/li:text-white transition-all">
                                                    <Check className="h-3 w-3 text-emerald-500 group-hover/li:text-white transition-all" />
                                                </div>
                                                <span className="text-muted-foreground text-sm font-bold leading-tight group-hover/li:text-slate-900 dark:group-hover/li:text-white transition-colors">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="mt-12 grid grid-cols-2 gap-4">
                                    <Button
                                        variant="outline"
                                        className="rounded-2xl border-border bg-muted/50 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-900/20 font-black uppercase text-[10px] tracking-widest h-14 transition-all"
                                        onClick={() => {
                                            setEditingPlan(plan);
                                            setNewPlanName(plan.name);
                                            setNewPlanPrice(plan.price.toString());
                                            setNewPlanFeatures(plan.features || []);
                                            setIsDialogOpen(true);
                                        }}
                                    >
                                        <Edit2 className="w-4 h-4 mr-2" /> Editar
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="rounded-2xl border-red-50 text-red-500 hover:bg-red-50 font-black uppercase text-[10px] tracking-widest h-14 transition-all"
                                        onClick={() => handleDeletePlan(plan.id)}
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" /> Eliminar
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
