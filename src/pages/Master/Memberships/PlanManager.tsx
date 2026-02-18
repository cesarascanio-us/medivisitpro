import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Crown, Check, X, CreditCard, RefreshCw } from "lucide-react";
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

        if (editingPlan) {
            // Update existing plan
            const { error } = await supabase
                .from('subscription_plans')
                .update({
                    name: newPlanName,
                    price: parseFloat(newPlanPrice)
                })
                .eq('id', editingPlan.id);

            if (error) {
                toast({ title: 'Error', description: error.message, variant: 'destructive' });
            } else {
                setPlans(plans.map(p => p.id === editingPlan.id ? { ...p, name: newPlanName, price: parseFloat(newPlanPrice) } : p));
                setIsDialogOpen(false);
                setEditingPlan(null);
                setNewPlanName('');
                setNewPlanPrice('');
                toast({ title: 'Actualizado', description: 'Plan actualizado exitosamente.' });
            }
        } else {
            // Create new plan
            const { data, error } = await supabase
                .from('subscription_plans')
                .insert({
                    name: newPlanName,
                    price: parseFloat(newPlanPrice),
                    interval: 'month',
                    features: ['Módulo Estándar', 'Soporte Básico'],
                    active: true
                })
                .select()
                .single();

            if (error) {
                toast({ title: 'Error', description: error.message, variant: 'destructive' });
            } else {
                setPlans([...plans, data as PlanType]);
                setIsDialogOpen(false);
                setNewPlanName('');
                setNewPlanPrice('');
                toast({ title: 'Creado', description: 'Nuevo plan guardado exitosamente.' });
            }
        }
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
        <div className="p-6 space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
                        <Crown className="w-8 h-8 text-emerald-500" />
                        Planes de Membresía
                    </h1>
                    <p className="text-slate-400 mt-1">Configura los niveles de servicio del SaaS.</p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={(open) => {
                    setIsDialogOpen(open);
                    if (!open) {
                        setEditingPlan(null);
                        setNewPlanName('');
                        setNewPlanPrice('');
                    }
                }}>
                    <DialogTrigger asChild>
                        <Button className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20">
                            Crear Nuevo Plan
                        </Button>
                    </DialogTrigger>
                    <Button variant="outline" onClick={resetToOfficialPlans} className="border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10 ml-2">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Sincronizar con Landing
                    </Button>
                    <DialogContent className="bg-slate-900 border-slate-700 text-white">
                        <DialogHeader>
                            <DialogTitle>{editingPlan ? 'Editar Plan' : 'Nuevo Plan de Suscripción'}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Nombre del Plan</label>
                                <input
                                    className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                                    placeholder="Ej: Enterprise"
                                    value={newPlanName}
                                    onChange={(e) => setNewPlanName(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Precio Mensual ($)</label>
                                <input
                                    type="number"
                                    className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                                    placeholder="99.99"
                                    value={newPlanPrice}
                                    onChange={(e) => setNewPlanPrice(e.target.value)}
                                />
                            </div>
                            <Button onClick={handleSavePlan} className="w-full bg-emerald-600 hover:bg-emerald-500 font-bold mt-4">
                                {editingPlan ? 'Actualizar Plan' : 'Guardar Plan'}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {plans.map((plan) => (
                        <Card key={plan.id} className={`bg-slate-900/50 border-slate-700 relative overflow-hidden transition-all hover:border-emerald-500/50 ${!plan.active ? 'opacity-60' : ''}`}>
                            {plan.name === 'Pro' && (
                                <div className="absolute top-0 right-0 p-2">
                                    <Badge className="bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold">POPULAR</Badge>
                                </div>
                            )}
                            <CardHeader>
                                <CardTitle className="text-2xl font-bold text-white flex justify-between items-center">
                                    {plan.name}
                                    <Switch checked={plan.active} onCheckedChange={() => togglePlan(plan.id, plan.active)} />
                                </CardTitle>
                                <div className="mt-4">
                                    <span className="text-4xl font-extrabold text-white">${plan.price}</span>
                                    <span className="text-slate-500 ml-1">/ {plan.interval === 'month' ? 'mes' : 'año'}</span>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-3 mb-6">
                                    {plan.features?.map((feature, i) => (
                                        <li key={i} className="flex items-start">
                                            <Check className="h-5 w-5 text-emerald-500 mr-2 shrink-0" />
                                            <span className="text-slate-300 text-sm">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        className="flex-1 border-slate-600 text-white hover:bg-slate-800"
                                        onClick={() => {
                                            setEditingPlan(plan);
                                            setNewPlanName(plan.name);
                                            setNewPlanPrice(plan.price.toString());
                                            setIsDialogOpen(true);
                                        }}
                                    >
                                        Editar
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                                        onClick={() => handleDeletePlan(plan.id)}
                                    >
                                        <X className="w-4 h-4" />
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
