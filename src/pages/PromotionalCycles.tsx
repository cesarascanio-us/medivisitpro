/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import { useState, useEffect } from "react";
import {
    Plus, Calendar, Target, Package, Search, Edit, Trash2,
    Play, Pause, CheckCircle, Clock, AlertCircle, BarChart3,
    Eye, Filter
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { EliteHeader, EliteKPICard } from "@/components/layout/DesignSystem";

interface PromotionalCycle {
    id: string;
    name: string;
    description: string | null;
    start_date: string;
    end_date: string;
    status: 'draft' | 'active' | 'completed' | 'cancelled';
    objectives: string | null;
    target_visits: number;
    target_presentations: number;
    target_samples: number;
    target_sales: number;
    current_visits: number;
    current_presentations: number;
    current_samples: number;
    current_sales: number;
    created_at: string;
    products?: { id: string; name: string }[];
}

interface Product {
    id: string;
    name: string;
    category: string | null;
    therapeutic_area: string | null;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof Clock }> = {
    draft: { label: 'Borrador', color: 'bg-slate-50 text-slate-500 border-slate-100', icon: Clock },
    active: { label: 'Activo', color: 'bg-emerald-50 text-emerald-600 border-emerald-100', icon: Play },
    completed: { label: 'Completado', color: 'bg-blue-50 text-blue-600 border-blue-100', icon: CheckCircle },
    cancelled: { label: 'Cancelado', color: 'bg-rose-50 text-rose-600 border-rose-100', icon: AlertCircle },
};

export default function PromotionalCycles() {
    const { user, isManager, canViewAllData } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [cycles, setCycles] = useState<PromotionalCycle[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCycle, setEditingCycle] = useState<PromotionalCycle | null>(null);
    const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
    const [viewingCycle, setViewingCycle] = useState<PromotionalCycle | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        start_date: '',
        end_date: '',
        objectives: '',
        target_visits: 100,
        target_presentations: 200,
        target_samples: 500,
        target_sales: 1000,
    });

    useEffect(() => {
        if (user) {
            loadData();
        }
    }, [user]);

    const loadData = async () => {
        setLoading(true);
        try {
            // Load cycles from Supabase
            const { data: cyclesData, error: cyclesError } = await supabase
                .from('promotional_cycles' as any)
                .select(`
                    *,
                    promotional_cycle_products (
                        product_id,
                        products (
                            id,
                            name
                        )
                    )
                `)
                .order('created_at', { ascending: false });

            if (cyclesError) throw cyclesError;

            const normalizedCycles = (cyclesData || []).map((c: any) => ({
                ...c,
                products: c.promotional_cycle_products?.map((pc: any) => pc.products) || []
            }));

            setCycles(normalizedCycles);

            // Load products from Supabase
            const { data: productsData } = await supabase
                .from('products')
                .select('id, name, category, therapeutic_area')
                .order('name');
            setProducts(productsData || []);

        } catch (error) {
            console.error("Error loading data:", error);
            toast({
                title: "Error",
                description: "No se pudieron cargar los ciclos promocionales.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const saveCycles = (newCycles: PromotionalCycle[]) => {
        setCycles(newCycles);
        localStorage.setItem('promotional_cycles', JSON.stringify(newCycles));
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            start_date: '',
            end_date: '',
            objectives: '',
            target_visits: 100,
            target_presentations: 200,
            target_samples: 500,
            target_sales: 1000,
        });
        setSelectedProducts([]);
        setEditingCycle(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const cyclePayload: any = {
            name: formData.name,
            description: formData.description || null,
            start_date: formData.start_date,
            end_date: formData.end_date,
            objectives: formData.objectives || null,
            target_visits: formData.target_visits,
            target_presentations: formData.target_presentations,
            target_samples: formData.target_samples,
            target_sales: formData.target_sales,
            status: editingCycle?.status || 'draft',
        };

        const executeHandleSubmit = async () => {
            setLoading(true);
            try {
                let currentCycleId = editingCycle?.id;

                if (editingCycle) {
                    const { error } = await supabase
                        .from('promotional_cycles' as any)
                        .update(cyclePayload)
                        .eq('id', editingCycle.id);
                    if (error) throw error;
                } else {
                    const { data, error } = await supabase
                        .from('promotional_cycles' as any)
                        .insert([cyclePayload])
                        .select()
                        .single() as any;
                    if (error) throw error;
                    currentCycleId = data.id;
                }

                // Update products association
                // First delete existing
                if (editingCycle) {
                    await supabase
                        .from('promotional_cycle_products' as any)
                        .delete()
                        .eq('promotional_cycle_id', editingCycle.id);
                }

                // Insert new ones
                if (selectedProducts.length > 0) {
                    const productLinks = selectedProducts.map(pid => ({
                        promotional_cycle_id: currentCycleId,
                        product_id: pid
                    }));
                    await supabase.from('promotional_cycle_products' as any).insert(productLinks);
                }

                toast({ title: "Éxito", description: editingCycle ? "Ciclo actualizado." : "Ciclo creado." });
                setIsDialogOpen(false);
                resetForm();
                loadData();
            } catch (e: any) {
                toast({ title: "Error", description: e.message, variant: "destructive" });
            } finally {
                setLoading(false);
            }
        };

        await executeHandleSubmit();
    };

    const handleEdit = (cycle: PromotionalCycle) => {
        setEditingCycle(cycle);
        setFormData({
            name: cycle.name,
            description: cycle.description || '',
            start_date: cycle.start_date,
            end_date: cycle.end_date,
            objectives: cycle.objectives || '',
            target_visits: cycle.target_visits,
            target_presentations: cycle.target_presentations,
            target_samples: cycle.target_samples,
            target_sales: cycle.target_sales || 0,
        });
        setSelectedProducts(cycle.products?.map(p => p.id) || []);
        setIsDialogOpen(true);
    };

    const handleDelete = async (cycleId: string) => {
        const { error } = await supabase.from('promotional_cycles' as any).delete().eq('id', cycleId);
        if (error) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } else {
            toast({ title: "Éxito", description: "Ciclo promocional eliminado." });
            loadData();
        }
    };

    const handleStatusChange = async (cycleId: string, newStatus: PromotionalCycle['status']) => {
        const { error } = await supabase
            .from('promotional_cycles' as any)
            .update({ status: newStatus })
            .eq('id', cycleId);

        if (error) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } else {
            toast({ title: "Éxito", description: `Estado actualizado a: ${STATUS_CONFIG[newStatus].label}` });
            loadData();
        }
    };

    const filteredCycles = cycles.filter(cycle => {
        if (statusFilter !== 'all' && cycle.status !== statusFilter) return false;
        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            return (
                cycle.name.toLowerCase().includes(search) ||
                cycle.description?.toLowerCase().includes(search)
            );
        }
        return true;
    });

    const getProgress = (current: number, target: number) => {
        return target > 0 ? Math.min((current / target) * 100, 100) : 0;
    };

    const getDaysRemaining = (endDate: string) => {
        const end = new Date(endDate);
        const now = new Date();
        const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return diff;
    };

    const activeCycles = cycles.filter(c => c.status === 'active').length;
    const totalTargetVisits = cycles.filter(c => c.status === 'active').reduce((sum, c) => sum + c.target_visits, 0);
    const totalCurrentVisits = cycles.filter(c => c.status === 'active').reduce((sum, c) => sum + c.current_visits, 0);

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <EliteHeader
                title="Campañas y Ciclos"
                subtitle="Planificación de objetivos, metas de visita y seguimiento de resultados"
                icon={Target}
                badgeText="Campañas"
                statusText={loading ? "Sincronizando..." : "Planificación activa"}
                statusColor={loading ? "bg-amber-500" : "bg-emerald-500"}
                rightContent={
                    isManager && (
                        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
                            <DialogTrigger asChild>
                                <Button className="h-12 px-8 bg-primary hover:bg-primary/90 text-white rounded-xl shadow-md font-bold text-xs transition-all active:scale-95 flex items-center gap-2">
                                    <Plus className="h-5 w-5" />
                                    Nueva Campaña
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border-none shadow-2xl">
                                <DialogHeader>
                                    <DialogTitle className="text-xl font-bold tracking-tight">{editingCycle ? 'Editar campaña' : 'Nueva campaña'}</DialogTitle>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="name" className="text-xs font-bold text-slate-500 uppercase">Nombre de la campaña</Label>
                                        <Input
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="Ej: Campaña Q1 2025 - Cardiovascular"
                                            className="h-11 rounded-xl bg-slate-50 border-none shadow-inner"
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="description" className="text-xs font-bold text-slate-500 uppercase">Descripción</Label>
                                        <Textarea
                                            id="description"
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            placeholder="Detalles de la campaña"
                                            rows={2}
                                            className="rounded-xl bg-slate-50 border-none shadow-inner"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="start_date" className="text-xs font-bold text-slate-500 uppercase">Fecha inicio</Label>
                                            <Input
                                                id="start_date"
                                                type="date"
                                                value={formData.start_date}
                                                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                                className="h-11 rounded-xl bg-slate-50 border-none shadow-inner"
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="end_date" className="text-xs font-bold text-slate-500 uppercase">Fecha fin</Label>
                                            <Input
                                                id="end_date"
                                                type="date"
                                                value={formData.end_date}
                                                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                                className="h-11 rounded-xl bg-slate-50 border-none shadow-inner"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="objectives" className="text-xs font-bold text-slate-500 uppercase">Objetivos estratégicos</Label>
                                        <Textarea
                                            id="objectives"
                                            value={formData.objectives}
                                            onChange={(e) => setFormData({ ...formData, objectives: e.target.value })}
                                            placeholder="¿Qué buscamos lograr?"
                                            rows={2}
                                            className="rounded-xl bg-slate-50 border-none shadow-inner"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="target_visits" className="text-xs font-bold text-slate-500 uppercase">Meta visitas</Label>
                                            <Input
                                                id="target_visits"
                                                type="number"
                                                value={formData.target_visits}
                                                onChange={(e) => setFormData({ ...formData, target_visits: parseInt(e.target.value) || 0 })}
                                                className="h-11 rounded-xl bg-slate-50 border-none shadow-inner"
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="target_presentations" className="text-xs font-bold text-slate-500 uppercase">Meta presentaciones</Label>
                                            <Input
                                                id="target_presentations"
                                                type="number"
                                                value={formData.target_presentations}
                                                onChange={(e) => setFormData({ ...formData, target_presentations: parseInt(e.target.value) || 0 })}
                                                className="h-11 rounded-xl bg-slate-50 border-none shadow-inner"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="target_samples" className="text-xs font-bold text-slate-500 uppercase">Meta muestras</Label>
                                            <Input
                                                id="target_samples"
                                                type="number"
                                                value={formData.target_samples}
                                                onChange={(e) => setFormData({ ...formData, target_samples: parseInt(e.target.value) || 0 })}
                                                className="h-11 rounded-xl bg-slate-50 border-none shadow-inner"
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="target_sales" className="text-xs font-bold text-slate-500 uppercase">Meta ventas ($)</Label>
                                            <Input
                                                id="target_sales"
                                                type="number"
                                                value={formData.target_sales}
                                                onChange={(e) => setFormData({ ...formData, target_sales: parseInt(e.target.value) || 0 })}
                                                className="h-11 rounded-xl bg-slate-50 border-none shadow-inner"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label className="text-xs font-bold text-slate-500 uppercase">Productos asociados</Label>
                                        <Select onValueChange={(value) => {
                                            if (!selectedProducts.includes(value)) {
                                                setSelectedProducts([...selectedProducts, value]);
                                            }
                                        }}>
                                            <SelectTrigger className="h-11 rounded-xl bg-slate-50 border-none shadow-inner font-semibold">
                                                <SelectValue placeholder="Seleccionar producto..." />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl">
                                                {products.filter(p => !selectedProducts.includes(p.id)).map(product => (
                                                    <SelectItem key={product.id} value={product.id}>
                                                        {product.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {selectedProducts.map(productId => {
                                                const product = products.find(p => p.id === productId);
                                                return product ? (
                                                    <Badge key={productId} variant="secondary" className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg px-3 py-1 border-none font-bold" onClick={() => {
                                                        setSelectedProducts(selectedProducts.filter(id => id !== productId));
                                                    }}>
                                                        {product.name} ×
                                                    </Badge>
                                                ) : null;
                                            })}
                                        </div>
                                    </div>
                                </div>
                                <DialogFooter className="gap-2 sm:gap-0">
                                    <Button variant="ghost" onClick={() => { setIsDialogOpen(false); resetForm(); }} className="rounded-xl font-bold">
                                        Cancelar
                                    </Button>
                                    <Button className="h-12 px-8 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold shadow-md transition-all active:scale-95" onClick={handleSubmit}>
                                        {editingCycle ? 'Guardar cambios' : 'Crear campaña'}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    )
                }
            />

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <EliteKPICard
                    title="Ciclos activos"
                    value={activeCycles}
                    icon={Play}
                    color="emerald"
                />
                <EliteKPICard
                    title="Total campañas"
                    value={cycles.length}
                    icon={Calendar}
                    color="blue"
                />
                <EliteKPICard
                    title="Visitas objetivo"
                    value={totalTargetVisits}
                    icon={Target}
                    color="purple"
                />
                <EliteKPICard
                    title="Progreso general"
                    value={`${totalTargetVisits > 0 ? Math.round((totalCurrentVisits / totalTargetVisits) * 100) : 0}%`}
                    icon={BarChart3}
                    color="amber"
                />
            </div>

            {/* Filters */}
            <Card className="border-slate-100 shadow-sm bg-card rounded-2xl overflow-hidden">
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                            <Input
                                placeholder="Buscar campañas..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="h-11 pl-10 bg-slate-50 border-none rounded-xl font-semibold text-xs shadow-inner"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="h-11 w-48 bg-slate-50 border-none rounded-xl font-bold text-xs shadow-inner">
                                <SelectValue placeholder="Estado" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-100">
                                <SelectItem value="all">Todos los estados</SelectItem>
                                <SelectItem value="draft">Borrador</SelectItem>
                                <SelectItem value="active">Activo</SelectItem>
                                <SelectItem value="completed">Completado</SelectItem>
                                <SelectItem value="cancelled">Cancelado</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Cycles Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredCycles.map(cycle => {
                    const daysRemaining = getDaysRemaining(cycle.end_date);
                    const StatusIcon = STATUS_CONFIG[cycle.status].icon;

                    return (
                        <Card key={cycle.id} className="border-slate-100 shadow-sm bg-card rounded-2xl overflow-hidden hover:shadow-md transition-all duration-300 group">
                            <CardHeader className="pb-4 border-b border-slate-50">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <CardTitle className="text-base font-bold tracking-tight group-hover:text-primary transition-colors">{cycle.name}</CardTitle>
                                        {cycle.description && (
                                            <p className="text-xs text-slate-400 mt-1 line-clamp-1">{cycle.description}</p>
                                        )}
                                    </div>
                                    <Badge variant="outline" className={cn("text-[10px] font-bold px-3 py-0.5 rounded-full border shadow-none", STATUS_CONFIG[cycle.status].color)}>
                                        <StatusIcon className="h-3 w-3 mr-1" />
                                        {STATUS_CONFIG[cycle.status].label}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Dates */}
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">
                                        {new Date(cycle.start_date).toLocaleDateString()} - {new Date(cycle.end_date).toLocaleDateString()}
                                    </span>
                                    {cycle.status === 'active' && (
                                        <Badge variant={daysRemaining < 7 ? "destructive" : daysRemaining < 30 ? "default" : "secondary"}>
                                            {daysRemaining > 0 ? `${daysRemaining} días restantes` : 'Vencido'}
                                        </Badge>
                                    )}
                                </div>

                                {/* Progress Bars */}
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between text-[11px] mb-1.5">
                                            <span className="text-slate-400 font-bold uppercase tracking-wider">Visitas</span>
                                            <span className="font-bold text-slate-700">{cycle.current_visits} / {cycle.target_visits}</span>
                                        </div>
                                        <Progress value={getProgress(cycle.current_visits, cycle.target_visits)} className="h-1.5 bg-slate-100" />
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-[11px] mb-1.5">
                                            <span className="text-slate-400 font-bold uppercase tracking-wider">Presentaciones</span>
                                            <span className="font-bold text-slate-700">{cycle.current_presentations} / {cycle.target_presentations}</span>
                                        </div>
                                        <Progress value={getProgress(cycle.current_presentations, cycle.target_presentations)} className="h-1.5 bg-slate-100" />
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-[11px] mb-1.5">
                                            <span className="text-slate-400 font-bold uppercase tracking-wider">Muestras</span>
                                            <span className="font-bold text-slate-700">{cycle.current_samples} / {cycle.target_samples}</span>
                                        </div>
                                        <Progress value={getProgress(cycle.current_samples, cycle.target_samples)} className="h-1.5 bg-slate-100" />
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-[11px] mb-1.5">
                                            <span className="text-slate-400 font-bold uppercase tracking-wider">Ventas</span>
                                            <span className="font-bold text-slate-700">${cycle.current_sales?.toLocaleString() || 0} / ${cycle.target_sales?.toLocaleString()}</span>
                                        </div>
                                        <Progress value={getProgress(cycle.current_sales || 0, cycle.target_sales)} className="h-1.5 bg-slate-100" />
                                    </div>
                                </div>

                                {/* Products */}
                                {cycle.products && cycle.products.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                        {cycle.products.slice(0, 3).map(product => (
                                            <Badge key={product.id} variant="outline" className="text-xs">
                                                {product.name}
                                            </Badge>
                                        ))}
                                        {cycle.products.length > 3 && (
                                            <Badge variant="outline" className="text-xs">
                                                +{cycle.products.length - 3} más
                                            </Badge>
                                        )}
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex items-center justify-between pt-2 border-t">
                                    <div className="flex gap-2">
                                        {isManager && cycle.status === 'draft' && (
                                            <Button size="sm" variant="outline" onClick={() => handleStatusChange(cycle.id, 'active')}>
                                                <Play className="h-4 w-4 mr-1" /> Activar
                                            </Button>
                                        )}
                                        {isManager && cycle.status === 'active' && (
                                            <Button size="sm" variant="outline" onClick={() => handleStatusChange(cycle.id, 'completed')}>
                                                <CheckCircle className="h-4 w-4 mr-1" /> Completar
                                            </Button>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="ghost" onClick={() => setViewingCycle(cycle)}>
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        {isManager && (
                                            <>
                                                <Button size="sm" variant="ghost" onClick={() => handleEdit(cycle)}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button size="sm" variant="ghost" className="text-destructive">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>¿Eliminar ciclo promocional?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Esta acción no se puede deshacer. Se eliminará permanentemente el ciclo "{cycle.name}".
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDelete(cycle.id)}>
                                                                Eliminar
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {filteredCycles.length === 0 && (
                <Card className="medical-card">
                    <CardContent className="p-12 text-center">
                        <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No hay ciclos promocionales</h3>
                        <p className="text-muted-foreground mb-4">
                            {searchTerm || statusFilter !== 'all'
                                ? 'No se encontraron ciclos con los filtros aplicados.'
                                : 'Crea tu primer ciclo promocional para comenzar.'}
                        </p>
                        {isManager && (
                            <Button className="btn-medical" onClick={() => setIsDialogOpen(true)}>
                                <Plus className="mr-2 h-4 w-4" />
                                Crear Ciclo
                            </Button>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* View Detail Dialog */}
            <Dialog open={!!viewingCycle} onOpenChange={() => setViewingCycle(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{viewingCycle?.name}</DialogTitle>
                    </DialogHeader>
                    {viewingCycle && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Badge className={STATUS_CONFIG[viewingCycle.status].color}>
                                    {STATUS_CONFIG[viewingCycle.status].label}
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                    {new Date(viewingCycle.start_date).toLocaleDateString()} - {new Date(viewingCycle.end_date).toLocaleDateString()}
                                </span>
                            </div>

                            {viewingCycle.description && (
                                <div>
                                    <h4 className="font-medium mb-1">Descripción</h4>
                                    <p className="text-sm text-muted-foreground">{viewingCycle.description}</p>
                                </div>
                            )}

                            {viewingCycle.objectives && (
                                <div>
                                    <h4 className="font-medium mb-1">Objetivos</h4>
                                    <p className="text-sm text-muted-foreground">{viewingCycle.objectives}</p>
                                </div>
                            )}

                            <div>
                                <h4 className="font-medium mb-2">Progreso</h4>
                                <div className="space-y-3">
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span>Visitas</span>
                                            <span>{viewingCycle.current_visits} / {viewingCycle.target_visits} ({getProgress(viewingCycle.current_visits, viewingCycle.target_visits).toFixed(1)}%)</span>
                                        </div>
                                        <Progress value={getProgress(viewingCycle.current_visits, viewingCycle.target_visits)} />
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span>Presentaciones</span>
                                            <span>{viewingCycle.current_presentations} / {viewingCycle.target_presentations} ({getProgress(viewingCycle.current_presentations, viewingCycle.target_presentations).toFixed(1)}%)</span>
                                        </div>
                                        <Progress value={getProgress(viewingCycle.current_presentations, viewingCycle.target_presentations)} />
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span>Muestras</span>
                                            <span>{viewingCycle.current_samples} / {viewingCycle.target_samples} ({getProgress(viewingCycle.current_samples, viewingCycle.target_samples).toFixed(1)}%)</span>
                                        </div>
                                        <Progress value={getProgress(viewingCycle.current_samples, viewingCycle.target_samples)} />
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span>Ventas</span>
                                            <span>${viewingCycle.current_sales?.toLocaleString() || 0} / ${viewingCycle.target_sales?.toLocaleString()} ({getProgress(viewingCycle.current_sales || 0, viewingCycle.target_sales).toFixed(1)}%)</span>
                                        </div>
                                        <Progress value={getProgress(viewingCycle.current_sales || 0, viewingCycle.target_sales)} />
                                    </div>
                                </div>
                            </div>

                            {viewingCycle.products && viewingCycle.products.length > 0 && (
                                <div>
                                    <h4 className="font-medium mb-2">Productos Asociados</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {viewingCycle.products.map(product => (
                                            <Badge key={product.id} variant="secondary">
                                                <Package className="h-3 w-3 mr-1" />
                                                {product.name}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
