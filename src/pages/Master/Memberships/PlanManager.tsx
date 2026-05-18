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
        <div className="flex flex-col h-full bg-background space-y-8 p-1 text-foreground">
            {/* Premium Header Container */}
            <header className="bg-card px-8 py-8 rounded-lg shadow-premium-md border border-border/40 relative overflow-hidden -mt-2 mx-1">
                {/* Decorative backgrounds */}
                <div className="absolute -top-32 -right-32 w-80 h-80 bg-primary/5 rounded-full blur-3xl opacity-60"></div>
                <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl opacity-60"></div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center shadow-premium-lg transform transition-transform hover:scale-105">
                            <Rocket className="text-primary-foreground h-8 w-8" />
                        </div>
                        <div>
                            <p className="text-primary text-xs font-bold uppercase tracking-wider mb-1.5">Monetización & SaaS</p>
                            <h1 className="text-2xl font-bold tracking-tight">
                                Gestión de Planes
                            </h1>
                            <p className="text-muted-foreground text-xs mt-1 max-w-lg font-medium">Configura la oferta comercial, límites de uso e infraestructura de precios</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <Dialog open={isDialogOpen} onOpenChange={(open) => {
                            setIsDialogOpen(open);
                            if (!open) resetForm();
                        }}>
                            <DialogTrigger asChild>
                                <Button variant="default" size="default" className="shadow-premium-md font-bold">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Crear Nuevo Plan
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-card border border-border/40 shadow-premium-2xl rounded-lg max-w-md p-6">
                                <DialogHeader>
                                    <DialogTitle className="text-xl font-bold tracking-tight">
                                        {editingPlan ? 'Editar Plan' : 'Nuevo Plan de Suscripción'}
                                    </DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Nombre del Plan</label>
                                        <Input
                                            className="font-semibold bg-muted border-input"
                                            placeholder="Ej: Enterprise"
                                            value={newPlanName}
                                            onChange={(e) => setNewPlanName(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Precio Mensual ($)</label>
                                        <Input
                                            type="number"
                                            className="font-semibold bg-muted border-input"
                                            placeholder="99.99"
                                            value={newPlanPrice}
                                            onChange={(e) => setNewPlanPrice(e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Características</label>
                                        <div className="flex gap-2">
                                            <Input
                                                className="font-medium bg-muted border-input"
                                                placeholder="Nueva característica..."
                                                value={featureInput}
                                                onChange={(e) => setFeatureInput(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && addFeature()}
                                            />
                                            <Button size="icon" variant="default" onClick={addFeature} className="w-10 h-10 shrink-0">
                                                <Plus className="w-4 h-4" />
                                            </Button>
                                        </div>
                                        <div className="max-h-40 overflow-y-auto space-y-2 mt-4 p-1">
                                            {newPlanFeatures.map((feat, idx) => (
                                                <div key={idx} className="flex items-center justify-between bg-muted p-2 rounded-lg border border-border/40">
                                                    <span className="text-xs font-bold text-muted-foreground truncate mr-2">{feat}</span>
                                                    <Button variant="ghost" size="sm" onClick={() => removeFeature(idx)} className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-lg">
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <Button variant="default" onClick={handleSavePlan} className="w-full font-bold shadow-premium-md">
                                        {editingPlan ? 'Actualizar Plan' : 'Guardar Plan'}
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>

                        <Button
                            variant="outline"
                            size="default"
                            onClick={resetToOfficialPlans}
                            disabled={loading}
                            className="shadow-sm font-bold"
                        >
                            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin text-primary' : ''}`} />
                            Sincronizar Cloud
                        </Button>
                    </div>
                </div>
            </header>

            {loading && plans.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 gap-6">
                    <Loader2 className="w-16 h-16 animate-spin text-primary" />
                    <p className="text-slate-400 font-bold uppercase text-xs tracking-wider">Cargando ecosistema de cargos...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4 pb-20">
                    {plans.map((plan) => (
                        <Card
                            key={plan.id}
                            className={`relative flex flex-col h-full rounded-lg border border-border/40 shadow-premium-md bg-card overflow-hidden group transition-all duration-500 hover:translate-y-[-4px] ${!plan.active ? 'opacity-60 grayscale' : 'hover:shadow-primary/20'}`}
                        >
                            {/* Decorative accent */}
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-primary/80 to-primary"></div>

                            <CardHeader className="pt-8 pb-6 px-8">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center group-hover:bg-primary transition-colors duration-500">
                                        <Shield className="w-6 h-6 text-primary group-hover:text-primary-foreground transition-colors" />
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Badge className={`${plan.active ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'} border-none font-bold text-xs uppercase tracking-wider px-2 py-0.5 rounded-full`}>
                                            {plan.active ? 'Activo' : 'Inactivo'}
                                        </Badge>
                                        <Switch
                                            checked={plan.active}
                                            onCheckedChange={() => togglePlan(plan.id, plan.active)}
                                            className="data-[state=checked]:bg-primary"
                                        />
                                    </div>
                                </div>

                                <CardTitle className="text-2xl font-bold text-foreground tracking-tight mb-2 uppercase flex items-center gap-2">
                                    {plan.name}
                                    {plan.name === 'Pro' && <Badge className="bg-amber-400 text-amber-950 font-bold border-none text-xs px-2 py-0.5 rounded-md">POPULAR</Badge>}
                                </CardTitle>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-bold text-foreground tracking-tighter">${plan.price}</span>
                                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">/ {plan.interval === 'month' ? 'mes' : 'año'}</span>
                                </div>
                                <CardDescription className="text-muted-foreground mt-4 font-medium leading-relaxed text-xs">
                                    {plan.description || "Solución avanzada para la industria farmacéutica."}
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="flex-grow px-8 pb-8">
                                <div className="pt-6 border-t border-border/40">
                                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Capacidades del Plan</p>
                                    <ul className="space-y-3">
                                        {plan.features?.map((feature, i) => (
                                            <li key={i} className="flex items-start group/li">
                                                <div className="w-5 h-5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center mr-3 mt-0.5 shrink-0 group-hover/li:bg-emerald-500 group-hover/li:text-white transition-all text-slate-900">
                                                    <Check className="h-3 w-3 text-emerald-500 group-hover/li:text-white transition-all" />
                                                </div>
                                                <span className="text-muted-foreground text-xs font-bold leading-tight group-hover/li:text-foreground transition-colors">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="mt-8 grid grid-cols-2 gap-3">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="rounded-lg border-border bg-muted/50 hover:bg-primary/10 hover:text-primary font-bold uppercase text-xs tracking-wider transition-all"
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
                                        size="sm"
                                        className="rounded-lg border-destructive/20 text-destructive hover:bg-destructive/10 font-bold uppercase text-xs tracking-wider transition-all"
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
