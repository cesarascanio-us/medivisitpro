/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import { useState, useEffect } from "react";
import { Plus, Target, TrendingUp, CheckCircle, AlertCircle, Edit, Trash2, MoreVertical } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useOrganization } from "@/hooks/useOrganization";
import { useToast } from "@/hooks/use-toast";
import { refreshObjectivesProgress } from "@/services/objectiveService";
import { useTexts } from "@/hooks/useTexts";
import { EliteHeader, EliteKPICard, EliteCard, EliteButton, EliteInput } from "@/components/layout/DesignSystem";
import { motion } from "framer-motion";

interface Objective {
    id: string;
    title: string;
    description: string | null;
    objective_type: string;
    category: string;
    target_value: number;
    current_value: number;
    unit: string;
    start_date: string;
    end_date: string;
    status: string;
    priority: string;
}

export default function Objectives() {
    const rawTexts = useTexts();
    const t = {
        ...rawTexts,
        create: rawTexts.btn_create,
        export: rawTexts.btn_export,
        import: rawTexts.btn_import,
    };
    const { user, canViewAllData, isSupervisor, isManager, isCoordinator, zoneId, canAssignObjectives: canAssign } = useAuth();
    const { organization } = useOrganization();
    const organizationId = organization?.id;
    const { toast } = useToast();
    const [objectives, setObjectives] = useState<Objective[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("general");
    const [editingId, setEditingId] = useState<string | null>(null);

    const [zones, setZones] = useState<{ id: string, name: string }[]>([]);
    const [assignmentType, setAssignmentType] = useState<"global" | "zone">("global");
    const [targetZoneIds, setTargetZoneIds] = useState<string[]>([]);

    const initialFormState = {
        title: "",
        description: "",
        objective_type: "monthly",
        category: "visits",
        target_value: 10,
        unit: "count",
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        priority: "normal"
    };

    const [formData, setFormData] = useState(initialFormState);

    const isLeader = isManager || isSupervisor || isCoordinator;

    useEffect(() => {
        if (user) {
            loadObjectives();
            if (isLeader) {
                loadZones();
            }
        }
    }, [user, isLeader]);

    const loadZones = async () => {
        try {
            const { data, error } = await supabase
                .from('zones')
                .select('id, name')
                .eq('organization_id', organizationId)
                .order('name');

            if (error) throw error;
            setZones(data || []);
        } catch (error) {
            console.error("Error loading zones:", error);
        }
    };

    const loadObjectives = async () => {
        try {
            setLoading(true);
            if (user?.id) {
                await refreshObjectivesProgress(user.id);
            }
            let query: any = supabase
                .from('objectives')
                .select('*');

            if (!canViewAllData) {
                if (isLeader) {
                    // Managers/Supervisors see all objectives in their org/zone (handled by RLS)
                    // If we need to be specific for Supervisors, we could add zone_id filters here
                    // but for now, we assume leaders see what RLS allows them to see.
                } else {
                    // Representatives see their own, global ones, and their zone's ones
                    const orConditions = [`user_id.eq.${user?.id}`, `is_global.eq.true`];
                    if (zoneId) {
                        orConditions.push(`zone_id.eq.${zoneId}`);
                    }
                    query = query.or(orConditions.join(','));
                }
            }

            const { data, error } = await query.order('created_at', { ascending: false });

            if (error) throw error;
            setObjectives(data || []);
        } catch (error) {
            console.error('Error loading objectives:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!user || !formData.title) return;

        try {
            const insertPayload: any = {
                title: formData.title,
                description: formData.description || null,
                objective_type: formData.objective_type,
                category: formData.category,
                target_value: formData.target_value,
                current_value: 0,
                unit: formData.unit,
                start_date: formData.start_date,
                end_date: formData.end_date,
                priority: formData.priority,
                status: 'active',
                organization_id: organizationId,
                user_id: user.id
            };

            if (editingId) {
                // UPDATE EXISTING OBJECTIVE
                // We keep assignment type the same for simplicity unless changed
                if (canAssign) {
                    insertPayload.is_global = assignmentType === 'global';
                    insertPayload.zone_id = assignmentType === 'zone' ? targetZoneIds[0] : null; // If editing, we just take the first zone if multiple were selected, or we shouldn't allow multi-zone editing easily. For now, take [0].
                }
                const { error } = await supabase.from('objectives').update(insertPayload).eq('id', editingId);
                if (error) throw error;
            } else {
                // INSERT NEW OBJECTIVE(S)
                if (canAssign) {
                if (assignmentType === 'zone') {
                    if (targetZoneIds.length === 0) {
                        toast({ title: "Atención", description: "Debes seleccionar al menos una zona.", variant: "destructive" });
                        return;
                    }
                    // Insert multiple objectives (one per zone)
                    const insertPromises = targetZoneIds.map(zoneId => {
                        const payload = { ...insertPayload, is_global: false, zone_id: zoneId };
                        return supabase.from('objectives').insert(payload);
                    });
                    
                    const results = await Promise.all(insertPromises);
                    const errors = results.filter(r => r.error);
                    if (errors.length > 0) throw errors[0].error;
                } else {
                    // Global objective
                    insertPayload.is_global = true;
                    insertPayload.zone_id = null;
                    const { error } = await supabase.from('objectives').insert(insertPayload);
                    if (error) throw error;
                }
            } else {
                const { error } = await supabase.from('objectives').insert(insertPayload);
                if (error) throw error;
            }

            toast({
                title: editingId ? "Objetivo actualizado" : "Objetivo(s) creado(s)",
                description: editingId ? "Se ha actualizado el objetivo correctamente." : "Se guardaron los objetivos exitosamente."
            });
            setDialogOpen(false);
            setAssignmentType("global"); // Reset
            setTargetZoneIds([]);
            setEditingId(null);
            setFormData(initialFormState);
            loadObjectives();
        } catch (error: any) {
            console.error("Supabase Error:", error);
            const errMsg = error?.message || error?.details || JSON.stringify(error) || "No se pudo crear el objetivo.";
            toast({ title: "Error 400", description: errMsg, variant: "destructive" });
        }
    };

    const handleEdit = (obj: Objective) => {
        setFormData({
            title: obj.title,
            description: obj.description || "",
            objective_type: obj.objective_type,
            category: obj.category,
            target_value: obj.target_value,
            unit: obj.unit,
            start_date: obj.start_date,
            end_date: obj.end_date,
            priority: obj.priority
        });
        if ((obj as any).is_global) {
            setAssignmentType("global");
            setTargetZoneIds([]);
        } else if ((obj as any).zone_id) {
            setAssignmentType("zone");
            setTargetZoneIds([(obj as any).zone_id]);
        }
        setEditingId(obj.id);
        setActiveTab("general");
        setDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("¿Estás seguro de que deseas eliminar este objetivo?")) return;
        try {
            const { error } = await supabase.from('objectives').delete().eq('id', id);
            if (error) throw error;
            toast({ title: "Objetivo eliminado", description: "El objetivo ha sido borrado exitosamente." });
            loadObjectives();
        } catch (error) {
            console.error("Error deleting objective:", error);
            toast({ title: "Error", description: "No se pudo eliminar el objetivo.", variant: "destructive" });
        }
    };

    const getProgress = (current: number, target: number) => {
        if (target === 0) return 0;
        return Math.min((current / target) * 100, 100);
    };

    const getStatusIcon = (status: string) => {
        if (status === 'completed') return <CheckCircle className="h-5 w-5 text-green-500" />;
        if (status === 'failed') return <AlertCircle className="h-5 w-5 text-red-500" />;
        return <Target className="h-5 w-5 text-blue-500" />;
    };

    const getCategoryLabel = (cat: string) => {
        const labels: Record<string, string> = {
            visits: "Visitas",
            sales: "Ventas",
            contacts: "Contactos",
            events: "Eventos"
        };
        return labels[cat] || cat;
    };

    const getTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            daily: "Diario",
            weekly: "Semanal",
            monthly: "Mensual",
            quarterly: "Trimestral",
            yearly: "Anual"
        };
        return labels[type] || type;
    };

    const activeObjectives = objectives.filter(o => o.status === 'active');
    const completedObjectives = objectives.filter(o => o.status === 'completed');
    const overallProgress = objectives.length > 0
        ? objectives.reduce((acc, o) => acc + getProgress(o.current_value, o.target_value), 0) / objectives.length
        : 0;

    return (
        <div className="min-h-screen flex flex-col bg-background p-8 font-sans transition-colors duration-500 overflow-y-auto">
            
            {/* HEADER INDUSTRIAL ELITE */}
            <EliteHeader
                title={t.objectives_title}
                subtitle={t.objectives_subtitle}
                icon={Target}
                badgeText="Objetivos & Metas"
                statusText="Enlace de Progreso Activo"
                statusColor="bg-primary"
                rightContent={
                    <EliteButton
                        onClick={() => {
                            setEditingId(null);
                            setFormData(initialFormState);
                            setDialogOpen(true);
                        }}
                        className="bg-primary hover:bg-primary/90 text-white shadow-premium-md font-black uppercase tracking-widest text-[10px] h-14 px-8 rounded-2xl transition-all hover:scale-105 active:scale-95 whitespace-nowrap animate-pulse-subtle"
                        icon={Plus}
                    >
                        {t.create}
                    </EliteButton>
                }
            />

            {/* KPI GRID */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 mt-8">
                <EliteKPICard
                    title="Objetivos Activos"
                    value={activeObjectives.length}
                    icon={Target}
                    color="primary"
                />
                <EliteKPICard
                    title="Completados"
                    value={completedObjectives.length}
                    icon={CheckCircle}
                    color="emerald"
                />
                <EliteKPICard
                    title="Progreso General"
                    value={`${Math.round(overallProgress)}%`}
                    icon={TrendingUp}
                    color="blue"
                />
            </div>

            {/* Objectives List */}
            {loading ? (
                <div className="text-center py-12 text-muted-foreground font-black text-xs uppercase tracking-widest">Cargando objetivos...</div>
            ) : objectives.length === 0 ? (
                <EliteCard className="text-center py-16">
                    <Target className="mx-auto h-16 w-16 text-muted-foreground/30 mb-6" />
                    <h3 className="text-lg font-black uppercase tracking-tight font-display mb-2">No hay objetivos</h3>
                    <p className="text-muted-foreground font-bold text-xs uppercase tracking-wider mb-4">Crea tu primer objetivo para comenzar a monitorear tu progreso</p>
                </EliteCard>
            ) : (
                <div className="space-y-4">
                    {objectives.map((obj) => {
                        const progress = getProgress(obj.current_value, obj.target_value);
                        return (
                            <EliteCard key={obj.id} className="bg-card border border-border/40 shadow-premium-md rounded-elite-xl">
                                <div className="p-6">
                                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
                                        <div className="flex items-center gap-4 flex-1">
                                            <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center border border-border/30 shrink-0">
                                                {getStatusIcon(obj.status)}
                                            </div>
                                            <div>
                                                <h3 className="font-black text-foreground text-base tracking-tight uppercase font-display leading-tight">{obj.title}</h3>
                                                <div className="flex flex-wrap items-center gap-2 mt-2">
                                                    <Badge className="bg-primary/10 text-primary border-none font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-full">{getCategoryLabel(obj.category)}</Badge>
                                                    <Badge className="bg-muted/30 text-muted-foreground border-none font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-full">{getTypeLabel(obj.objective_type)}</Badge>
                                                    {(canAssign || canViewAllData) && (obj as any).profiles && (
                                                        <Badge className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-full">
                                                            {(obj as any).profiles?.first_name} {(obj as any).profiles?.last_name}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-left md:text-right shrink-0 flex items-center gap-4">
                                            <div>
                                                <p className="text-xl font-black text-foreground tracking-tighter tabular-nums leading-none">
                                                    {obj.category === 'sales' ? `$${obj.current_value.toLocaleString()}` : obj.current_value} / {obj.category === 'sales' ? `$${obj.target_value.toLocaleString()}` : obj.target_value}
                                                </p>
                                                <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest mt-1.5">{Math.round(progress)}% completado</p>
                                            </div>
                                            {canAssign && (
                                                <div className="flex flex-col gap-2">
                                                    <button onClick={() => handleEdit(obj)} className="text-muted-foreground hover:text-primary transition-colors p-1">
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => handleDelete(obj.id)} className="text-muted-foreground hover:text-red-500 transition-colors p-1">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <Progress value={progress} className="h-2.5 bg-primary/5 rounded-full overflow-hidden" />
                                    <div className="flex justify-between text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest mt-3">
                                        <span>Inicio: {new Date(obj.start_date).toLocaleDateString()}</span>
                                        <span>Fin: {new Date(obj.end_date).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </EliteCard>
                        );
                    })}
                </div>
            )}

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent aria-describedby={undefined} className="max-w-3xl p-0 overflow-hidden border-none shadow-2xl rounded-3xl max-h-[90vh] flex flex-col">
                    <div className="bg-gradient-to-br from-emerald-600 to-teal-800 px-8 py-10 text-white relative overflow-hidden shrink-0">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <Target className="w-32 h-32" />
                        </div>
                        <div className="relative z-10 flex items-center gap-6">
                            <div className="w-16 h-16 rounded-2xl bg-background/10 backdrop-blur-xl border border-border/20 flex items-center justify-center shadow-inner">
                                <Target className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <DialogTitle className="text-3xl font-black tracking-tight text-white mb-1">
                                    {editingId ? "Editar Objetivo" : "Nuevo Objetivo"}
                                </DialogTitle>
                                <p className="text-emerald-100/70 font-bold text-sm uppercase tracking-widest">
                                    Gestión de Metas y Desempeño 🎯
                                </p>
                            </div>
                        </div>
                    </div>

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col w-full min-h-0">
                        <div className="px-8 pt-4 pb-2 border-b border-border/40 shrink-0 bg-background">
                            <TabsList className="w-full grid grid-cols-2 bg-muted/50 p-1 rounded-xl">
                                <TabsTrigger value="general" className="rounded-lg font-bold text-[11px] uppercase tracking-wider flex items-center gap-2">
                                    <Target className="w-3.5 h-3.5" /> Detalles Generales
                                </TabsTrigger>
                                <TabsTrigger value="config" className="rounded-lg font-bold text-[11px] uppercase tracking-wider flex items-center gap-2">
                                    <TrendingUp className="w-3.5 h-3.5" /> Configuración y Plazos
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <div className="px-8 py-6 overflow-y-auto custom-scrollbar flex-1 bg-card">
                            {/* Tab 1: Detalles Generales */}
                            <TabsContent value="general" className="m-0 space-y-8 mt-0 animate-in fade-in slide-in-from-right-2">
                                <section className="space-y-6">
                                    {canAssign && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label className="text-primary font-black text-[10px] uppercase tracking-[0.2em] ml-1">Tipo de Asignación</Label>
                                                <Select value={assignmentType} onValueChange={(v: any) => setAssignmentType(v)}>
                                                    <SelectTrigger className="h-14 border-transparent rounded-2xl bg-muted font-bold shadow-sm">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-2xl border-none shadow-2xl">
                                                        <SelectItem value="global" className="font-bold py-3">Global (Toda la Organización)</SelectItem>
                                                        <SelectItem value="zone" className="font-bold py-3">Por Zona Territorial</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            
                                            {assignmentType === "zone" ? (
                                                <div className="space-y-2">
                                                    <Label className="text-primary font-black text-[10px] uppercase tracking-[0.2em] ml-1">Seleccionar Zona(s)</Label>
                                                    <div className="h-[120px] overflow-y-auto border-transparent rounded-2xl p-2 bg-muted shadow-sm space-y-1 custom-scrollbar">
                                                        {zones.map((zone) => (
                                                            <div 
                                                                key={zone.id} 
                                                                className="flex items-center space-x-3 p-3 hover:bg-background/80 rounded-xl cursor-pointer transition-colors"
                                                                onClick={() => {
                                                                    if (targetZoneIds.includes(zone.id)) {
                                                                        setTargetZoneIds(targetZoneIds.filter(id => id !== zone.id));
                                                                    } else {
                                                                        setTargetZoneIds([...targetZoneIds, zone.id]);
                                                                    }
                                                                }}
                                                            >
                                                                <Checkbox 
                                                                    checked={targetZoneIds.includes(zone.id)} 
                                                                    onCheckedChange={(checked) => {
                                                                        if (checked) {
                                                                            setTargetZoneIds([...targetZoneIds, zone.id]);
                                                                        } else {
                                                                            setTargetZoneIds(targetZoneIds.filter(id => id !== zone.id));
                                                                        }
                                                                    }}
                                                                />
                                                                <Label className="cursor-pointer font-bold text-sm text-foreground">{zone.name}</Label>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    {editingId && (
                                                        <p className="text-[10px] text-muted-foreground font-bold mt-2">
                                                            Nota: Al editar, solo se permite asignar a una sola zona.
                                                        </p>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="flex flex-col justify-center">
                                                    <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-wide leading-relaxed pt-6">
                                                        Se aplicará a toda la organización.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Título *</Label>
                                        <EliteInput
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            placeholder="Ej: Visitar 20 médicos este mes"
                                            className="h-14 rounded-2xl border-transparent bg-muted font-bold text-foreground focus:ring-primary/20 shadow-sm"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Descripción</Label>
                                        <Textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            placeholder="Detalles del objetivo..."
                                            className="rounded-2xl border-transparent bg-muted font-bold text-foreground focus:ring-primary/20 shadow-sm min-h-[120px]"
                                        />
                                    </div>
                                </section>
                            </TabsContent>

                            {/* Tab 2: Configuración */}
                            <TabsContent value="config" className="m-0 space-y-8 mt-0 animate-in fade-in slide-in-from-right-2">
                                <section className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Categoría</Label>
                                            <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                                                <SelectTrigger className="h-14 border-transparent rounded-2xl bg-muted font-bold shadow-sm"><SelectValue /></SelectTrigger>
                                                <SelectContent className="rounded-2xl border-none shadow-2xl">
                                                    <SelectItem value="visits" className="font-bold py-3">Visitas</SelectItem>
                                                    <SelectItem value="sales" className="font-bold py-3">Ventas</SelectItem>
                                                    <SelectItem value="contacts" className="font-bold py-3">Contactos</SelectItem>
                                                    <SelectItem value="events" className="font-bold py-3">Eventos</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Período</Label>
                                            <Select value={formData.objective_type} onValueChange={(v) => setFormData({ ...formData, objective_type: v })}>
                                                <SelectTrigger className="h-14 border-transparent rounded-2xl bg-muted font-bold shadow-sm"><SelectValue /></SelectTrigger>
                                                <SelectContent className="rounded-2xl border-none shadow-2xl">
                                                    <SelectItem value="daily" className="font-bold py-3">Diario</SelectItem>
                                                    <SelectItem value="weekly" className="font-bold py-3">Semanal</SelectItem>
                                                    <SelectItem value="monthly" className="font-bold py-3">Mensual</SelectItem>
                                                    <SelectItem value="quarterly" className="font-bold py-3">Trimestral</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Meta *</Label>
                                            <EliteInput
                                                type="number"
                                                value={formData.target_value}
                                                onChange={(e) => setFormData({ ...formData, target_value: parseInt(e.target.value) || 0 })}
                                                className="h-14 rounded-2xl border-transparent bg-muted font-bold text-foreground focus:ring-primary/20 shadow-sm"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Prioridad</Label>
                                            <Select value={formData.priority} onValueChange={(v) => setFormData({ ...formData, priority: v })}>
                                                <SelectTrigger className="h-14 border-transparent rounded-2xl bg-muted font-bold shadow-sm"><SelectValue /></SelectTrigger>
                                                <SelectContent className="rounded-2xl border-none shadow-2xl">
                                                    <SelectItem value="low" className="font-bold py-3">Baja</SelectItem>
                                                    <SelectItem value="normal" className="font-bold py-3">Normal</SelectItem>
                                                    <SelectItem value="high" className="font-bold py-3">Alta</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Fecha Inicio</Label>
                                            <EliteInput
                                                type="date"
                                                value={formData.start_date}
                                                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                                className="h-14 rounded-2xl border-transparent bg-muted font-bold text-foreground focus:ring-primary/20 shadow-sm"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Fecha Fin</Label>
                                            <EliteInput
                                                type="date"
                                                value={formData.end_date}
                                                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                                className="h-14 rounded-2xl border-transparent bg-muted font-bold text-foreground focus:ring-primary/20 shadow-sm"
                                            />
                                        </div>
                                    </div>
                                </section>
                            </TabsContent>
                        </div>
                    </Tabs>

                    <div className="bg-muted border-t border-border px-8 py-6 flex items-center justify-end gap-4 shrink-0">
                        <EliteButton
                            variant="outline"
                            onClick={() => setDialogOpen(false)}
                            className="h-12 px-6 font-bold text-muted-foreground hover:text-foreground hover:bg-card border-none bg-transparent"
                        >
                            Descartar
                        </EliteButton>
                        <EliteButton
                            onClick={handleSubmit}
                            className="h-12 px-8 bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-[11px] shadow-premium-md rounded-2xl"
                        >
                            {editingId ? "Guardar Cambios" : "Crear Objetivo"}
                        </EliteButton>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
