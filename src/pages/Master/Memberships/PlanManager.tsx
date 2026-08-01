import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Check, X, RefreshCw, Rocket, Plus, Edit2, Trash2, Shield, TrendingUp, Zap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface PlanModule {
    id?: string;
    module_key: string;
    module_name: string;
    limit_value: number | null;
}

interface PlanType {
    id: string;
    name: string;
    tier: string;
    description: string;
    is_active: boolean;
    features: string[];
    priceAmount: number;
    interval: string;
    modules: PlanModule[];
}

export default function PlanManager() {
    const [plans, setPlans] = useState<PlanType[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState<PlanType | null>(null);

    // Form State
    const [newPlanName, setNewPlanName] = useState('');
    const [newPlanPrice, setNewPlanPrice] = useState('0');
    const [newPlanFeatures, setNewPlanFeatures] = useState<string[]>([]);
    const [featureInput, setFeatureInput] = useState('');
    
    // Limits State
    const [limits, setLimits] = useState({
        max_users: 10,
        max_doctors: 100,
        max_pharmacies: 50,
        max_storage_mb: 500
    });

    const fetchPlans = async () => {
        setLoading(true);
        try {
            // Fetch billing_plans with their prices
            const { data, error } = await supabase
                .from('billing_plans')
                .select('*, billing_prices(amount, interval)');

            if (error) throw error;

            const formattedPlans = (data || []).map((p: any) => ({
                id: p.id,
                name: p.name,
                tier: p.tier,
                description: p.description,
                is_active: p.is_active,
                features: p.features || [],
                priceAmount: p.billing_prices?.[0]?.amount || 0,
                interval: p.billing_prices?.[0]?.interval || 'month',
                modules: []
            })).sort((a, b) => a.priceAmount - b.priceAmount);

            setPlans(formattedPlans);
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlans();
    }, []);

    const togglePlan = async (id: string, currentStatus: boolean) => {
        const { error } = await supabase
            .from('billing_plans')
            .update({ is_active: !currentStatus })
            .eq('id', id);

        if (error) {
            toast({ title: 'Error', description: 'No se pudo actualizar.', variant: 'destructive' });
        } else {
            setPlans(plans.map(p => p.id === id ? { ...p, is_active: !currentStatus } : p));
            toast({ title: 'Actualizado', description: `Plan estado cambiado.` });
        }
    };

    const handleSavePlan = async () => {
        if (!newPlanName || !newPlanPrice) return;
        const tierSlug = newPlanName.toLowerCase().replace(/\s+/g, '-');

        try {
            let currentPlanId = editingPlan?.id;

            if (editingPlan) {
                // Update Plan
                await supabase.from('billing_plans').update({
                    name: newPlanName,
                    tier: tierSlug,
                    features: newPlanFeatures
                }).eq('id', currentPlanId);

                // Update Price (simplification: updating the first price)
                await supabase.from('billing_prices').update({
                    amount: parseFloat(newPlanPrice)
                }).eq('plan_id', currentPlanId);
            } else {
                // Insert New Plan
                const { data: newPlan, error: planError } = await supabase.from('billing_plans').insert({
                    name: newPlanName,
                    tier: tierSlug,
                    features: newPlanFeatures,
                    is_active: true
                }).select().single();

                if (planError) throw planError;
                currentPlanId = newPlan.id;

                // Insert Price
                await supabase.from('billing_prices').insert({
                    plan_id: currentPlanId,
                    amount: parseFloat(newPlanPrice),
                    interval: 'month'
                });
            }

            // Sync Modules (Delete old and insert new to be safe)
            await supabase.from('plan_modules').delete().eq('plan_id', currentPlanId);
            
            const modulesToInsert = [
                { plan_id: currentPlanId, module_key: 'users', module_name: 'Usuarios', limit_value: limits.max_users },
                { plan_id: currentPlanId, module_key: 'doctors', module_name: 'Médicos', limit_value: limits.max_doctors },
                { plan_id: currentPlanId, module_key: 'pharmacies', module_name: 'Farmacias', limit_value: limits.max_pharmacies },
                { plan_id: currentPlanId, module_key: 'storage', module_name: 'Almacenamiento (MB)', limit_value: limits.max_storage_mb }
            ];

            await supabase.from('plan_modules').insert(modulesToInsert);

            toast({ title: 'Éxito', description: 'Plan guardado correctamente.' });
            setIsDialogOpen(false);
            resetForm();
            fetchPlans();
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        }
    };

    const resetForm = () => {
        setEditingPlan(null);
        setNewPlanName('');
        setNewPlanPrice('0');
        setNewPlanFeatures([]);
        setFeatureInput('');
        setLimits({ max_users: 10, max_doctors: 100, max_pharmacies: 50, max_storage_mb: 500 });
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
        if (!confirm('¿Estás seguro de eliminar este plan? Afectará a las organizaciones vinculadas.')) return;

        const { error } = await supabase.from('billing_plans').delete().eq('id', id);

        if (error) {
            toast({ title: 'Error', description: 'No se pudo eliminar el plan.', variant: 'destructive' });
        } else {
            setPlans(plans.filter(p => p.id !== id));
            toast({ title: 'Eliminado', description: 'Plan eliminado.' });
        }
    };

    const editPlan = (plan: PlanType) => {
        setEditingPlan(plan);
        setNewPlanName(plan.name);
        setNewPlanPrice(plan.priceAmount.toString());
        setNewPlanFeatures(plan.features || []);
        
        const newLimits = { ...limits };
        plan.modules.forEach(m => {
            if (m.module_key === 'users') newLimits.max_users = m.limit_value || 0;
            if (m.module_key === 'doctors') newLimits.max_doctors = m.limit_value || 0;
            if (m.module_key === 'pharmacies') newLimits.max_pharmacies = m.limit_value || 0;
            if (m.module_key === 'storage') newLimits.max_storage_mb = m.limit_value || 0;
        });
        setLimits(newLimits);
        setIsDialogOpen(true);
    };

    return (
        <div className="flex flex-col min-h-full space-y-8 p-1 text-foreground">
            <header className="bg-card px-8 py-8 rounded-lg shadow-premium-md border border-border/40 relative overflow-hidden -mt-2 mx-1">
                <div className="absolute -top-32 -right-32 w-80 h-80 bg-primary/5 rounded-full blur-3xl opacity-60"></div>
                <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl opacity-60"></div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center shadow-premium-lg transform transition-transform hover:scale-105">
                            <Rocket className="text-primary-foreground h-8 w-8" />
                        </div>
                        <div>
                            <p className="text-primary text-xs font-bold uppercase tracking-wider mb-1.5">SaaS & Monetización</p>
                            <h1 className="text-2xl font-bold tracking-tight">Gestión de Planes y Límites</h1>
                            <p className="text-muted-foreground text-xs mt-1 max-w-lg font-medium">Configura precios y límites estructurales (billing_plans + plan_modules)</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
                            <DialogTrigger asChild>
                                <Button className="btn-elite-primary"><Plus className="mr-2 h-4 w-4" />Crear Plan</Button>
                            </DialogTrigger>
                            <DialogContent className="bg-card rounded-2xl border border-border shadow-premium-2xl max-w-2xl p-0 overflow-hidden font-display max-h-[90vh] overflow-y-auto">
                                <div className="bg-muted/30 p-6 border-b border-border/80">
                                    <DialogTitle className="text-lg font-bold">{editingPlan ? 'Editar Plan y Límites' : 'Nuevo Plan'}</DialogTitle>
                                </div>
                                <div className="p-8 space-y-6 bg-card">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold ml-1">Nombre del Plan</label>
                                            <Input className="input-elite" placeholder="Ej: Pro" value={newPlanName} onChange={(e) => setNewPlanName(e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold ml-1">Precio Mensual ($)</label>
                                            <Input type="number" className="input-elite" placeholder="99.99" value={newPlanPrice} onChange={(e) => setNewPlanPrice(e.target.value)} />
                                        </div>
                                    </div>

                                    {/* SECCIÓN DE LÍMITES */}
                                    <div className="p-4 bg-muted/20 border border-border/50 rounded-xl space-y-4">
                                        <h4 className="text-sm font-bold flex items-center gap-2"><Shield className="w-4 h-4 text-primary" /> Límites Estructurados</h4>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div>
                                                <label className="text-xs text-muted-foreground">Max Usuarios</label>
                                                <Input type="number" className="input-elite mt-1" value={limits.max_users} onChange={(e) => setLimits({...limits, max_users: parseInt(e.target.value)})} />
                                            </div>
                                            <div>
                                                <label className="text-xs text-muted-foreground">Max Médicos</label>
                                                <Input type="number" className="input-elite mt-1" value={limits.max_doctors} onChange={(e) => setLimits({...limits, max_doctors: parseInt(e.target.value)})} />
                                            </div>
                                            <div>
                                                <label className="text-xs text-muted-foreground">Max Farmacias</label>
                                                <Input type="number" className="input-elite mt-1" value={limits.max_pharmacies} onChange={(e) => setLimits({...limits, max_pharmacies: parseInt(e.target.value)})} />
                                            </div>
                                            <div>
                                                <label className="text-xs text-muted-foreground">Storage (MB)</label>
                                                <Input type="number" className="input-elite mt-1" value={limits.max_storage_mb} onChange={(e) => setLimits({...limits, max_storage_mb: parseInt(e.target.value)})} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold ml-1">Características (Checklist)</label>
                                        <div className="flex gap-2">
                                            <Input className="input-elite" placeholder="Nueva característica..." value={featureInput} onChange={(e) => setFeatureInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addFeature()} />
                                            <Button size="icon" onClick={addFeature} className="btn-elite-primary shrink-0 w-10 h-10"><Plus className="w-4 h-4" /></Button>
                                        </div>
                                        <div className="max-h-40 overflow-y-auto space-y-2 mt-2">
                                            {newPlanFeatures.map((feat, idx) => (
                                                <div key={idx} className="flex justify-between p-2 rounded-lg border bg-muted/40 text-xs font-semibold">
                                                    {feat}
                                                    <Button variant="ghost" size="sm" onClick={() => removeFeature(idx)} className="h-5 w-5 p-0 text-destructive"><X className="h-3 w-3" /></Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <Button onClick={handleSavePlan} className="btn-elite-primary w-full">{editingPlan ? 'Guardar Cambios' : 'Crear Plan'}</Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                        <Button onClick={fetchPlans} disabled={loading} className="btn-elite-secondary">
                            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin text-primary' : ''}`} /> Recargar
                        </Button>
                    </div>
                </div>
            </header>

            {loading && plans.length === 0 ? (
                <div className="flex justify-center py-32"><Loader2 className="w-16 h-16 animate-spin text-primary" /></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4 pb-20">
                    {plans.map((plan) => (
                        <Card key={plan.id} className={`relative flex flex-col h-full rounded-lg border border-border/40 shadow-premium-md bg-card overflow-hidden group transition-all hover:-translate-y-1 ${!plan.is_active ? 'opacity-60' : ''}`}>
                            <CardHeader className="pt-8 pb-6 px-8">
                                <div className="flex justify-between items-start mb-6">
                                    <Badge className={`${plan.is_active ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'}`}>{plan.is_active ? 'Activo' : 'Inactivo'}</Badge>
                                    <Switch checked={plan.is_active} onCheckedChange={() => togglePlan(plan.id, plan.is_active)} className="data-[state=checked]:bg-primary" />
                                </div>
                                <CardTitle className="text-2xl font-bold uppercase">{plan.name}</CardTitle>
                                <div className="flex items-baseline gap-2 mt-2">
                                    <span className="text-4xl font-bold">${plan.priceAmount}</span>
                                    <span className="text-xs text-muted-foreground uppercase">/ {plan.interval}</span>
                                </div>
                                
                                <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-medium text-muted-foreground bg-muted/20 p-3 rounded-md border border-border/40">
                                    {plan.modules.map(m => (
                                        <div key={m.module_key} className="flex justify-between">
                                            <span className="capitalize">{m.module_key}:</span>
                                            <span className="font-bold text-foreground">{m.limit_value || '∞'}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardHeader>

                            <CardContent className="flex-grow px-8 pb-8">
                                <ul className="space-y-3 mb-8 border-t pt-4">
                                    {plan.features?.map((feature, i) => (
                                        <li key={i} className="flex text-xs font-bold text-muted-foreground">
                                            <Check className="h-4 w-4 mr-2 text-emerald-500" /> {feature}
                                        </li>
                                    ))}
                                </ul>
                                <div className="grid grid-cols-2 gap-3 mt-auto">
                                    <Button variant="outline" size="sm" onClick={() => editPlan(plan)}><Edit2 className="w-4 h-4 mr-2" /> Editar</Button>
                                    <Button variant="outline" size="sm" className="text-destructive" onClick={() => handleDeletePlan(plan.id)}><Trash2 className="w-4 h-4 mr-2" /> Eliminar</Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
