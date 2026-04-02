/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import { useState, useEffect, useMemo, useCallback } from "react";
import {
    Target, Phone, FileText, TrendingUp, Trophy, XCircle,
    Plus, Search, Filter, DollarSign, Clock, Zap, BarChart3,
    Lightbulb, ArrowUpRight, Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { EliteHeader, EliteKPICard } from "@/components/layout/DesignSystem";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { InstructionCard } from "@/components/ui/InstructionCard";
import { AdminDataFilter } from "@/components/admin/AdminDataFilter";
import { DealDetailDialog } from "@/components/sales/DealDetailDialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

// ── Pipeline Configuration ──────────────────────────────────────
const PIPELINE_STAGES = [
    { value: "prospecting", label: "Prospección", icon: Target, color: "bg-primary", bgLight: "bg-primary/10", textColor: "text-primary", probability: 10 },
    { value: "contacted", label: "Contactado", icon: Phone, color: "bg-amber-500", bgLight: "bg-amber-500/10", textColor: "text-amber-600", probability: 25 },
    { value: "proposal", label: "Propuesta", icon: FileText, color: "bg-indigo-500", bgLight: "bg-indigo-500/10", textColor: "text-indigo-600", probability: 50 },
    { value: "negotiation", label: "Negociación", icon: TrendingUp, color: "bg-purple-500", bgLight: "bg-purple-500/10", textColor: "text-purple-600", probability: 75 },
    { value: "won", label: "Ganado", icon: Trophy, color: "bg-emerald-500", bgLight: "bg-emerald-500/10", textColor: "text-emerald-600", probability: 100 },
    { value: "lost", label: "Perdido", icon: XCircle, color: "bg-rose-500", bgLight: "bg-rose-500/10", textColor: "text-rose-600", probability: 0 },
];

const SOURCE_OPTIONS = [
    { value: "visit", label: "Visita" },
    { value: "cold_call", label: "Llamada en Frío" },
    { value: "referral", label: "Referido" },
    { value: "landing", label: "Landing Page" },
    { value: "whatsapp", label: "WhatsApp" },
    { value: "other", label: "Otro" },
];

interface AdminFilterState {
    region?: string;
    state?: string;
    zoneId?: string;
    userId?: string;
}

// ── Main Component ──────────────────────────────────────────────
export default function SalesPipeline() {
    const { user, canViewAllData, isSupervisor, zoneId, organizationId } = useAuth();
    const { toast } = useToast();

    const [deals, setDeals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [stageFilter, setStageFilter] = useState("all");
    const [adminFilters, setAdminFilters] = useState<AdminFilterState>({});
    const [showHelp, setShowHelp] = useState(false);

    // Modal states
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [selectedDeal, setSelectedDeal] = useState<any>(null);
    const [detailOpen, setDetailOpen] = useState(false);

    // New deal form
    const [newDeal, setNewDeal] = useState({
        title: "",
        value: "",
        source: "other",
        expected_close_date: "",
        notes: "",
        stage: "prospecting",
    });

    // ── Data Loading ──────────────────────────────────────────
    const loadDeals = useCallback(async () => {
        if (!user || !organizationId) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            let query: any = (supabase as any)
                .from("deals")
                .select("*")
                .eq("organization_id", organizationId);

            if (isSupervisor && zoneId) {
                if (adminFilters.userId && adminFilters.userId !== "all") {
                    query = query.eq("user_id", adminFilters.userId);
                } else if (adminFilters.zoneId && adminFilters.zoneId !== "all") {
                    query = query.eq("zone_id", adminFilters.zoneId);
                } else {
                    query = query.eq("zone_id", zoneId);
                }
            } else if (!canViewAllData) {
                query = query.eq("user_id", user.id);
            } else {
                if (adminFilters.userId && adminFilters.userId !== "all") {
                    query = query.eq("user_id", adminFilters.userId);
                } else if (adminFilters.zoneId && adminFilters.zoneId !== "all") {
                    query = query.eq("zone_id", adminFilters.zoneId);
                }
            }

            const { data, error } = await query.order("created_at", { ascending: false });
            if (error) throw error;
            setDeals(data || []);
        } catch (e: any) {
            console.error("Error loading deals:", e);
            setDeals([]);
        } finally {
            setLoading(false);
        }
    }, [user, organizationId, isSupervisor, zoneId, canViewAllData, adminFilters]);

    useEffect(() => {
        loadDeals();
    }, [loadDeals]);

    // ── Create Deal ──────────────────────────────────────────
    const handleCreateDeal = async () => {
        if (!newDeal.title.trim()) {
            toast({ title: "Error", description: "El título es obligatorio.", variant: "destructive" });
            return;
        }
        try {
            const { error } = await (supabase as any).from("deals").insert({
                user_id: user?.id,
                organization_id: organizationId,
                zone_id: zoneId || null,
                title: newDeal.title.trim(),
                value: parseFloat(newDeal.value) || 0,
                source: newDeal.source,
                stage: newDeal.stage,
                probability: PIPELINE_STAGES.find((s) => s.value === newDeal.stage)?.probability || 10,
                expected_close_date: newDeal.expected_close_date || null,
                notes: newDeal.notes || null,
            });
            if (error) throw error;

            toast({ title: "Oportunidad creada", description: `"${newDeal.title}" añadida al pipeline.` });
            setCreateDialogOpen(false);
            setNewDeal({ title: "", value: "", source: "other", expected_close_date: "", notes: "", stage: "prospecting" });
            loadDeals();
        } catch (e) {
            console.error("Error creating deal:", e);
            toast({ title: "Error", description: "No se pudo crear la oportunidad.", variant: "destructive" });
        }
    };

    // ── Quick Stage Move ──────────────────────────────────────
    const handleQuickMove = async (dealId: string, newStage: string) => {
        try {
            const stageConfig = PIPELINE_STAGES.find((s) => s.value === newStage);
            const updateData: any = {
                stage: newStage,
                probability: stageConfig?.probability || 0,
            };
            if (newStage === "won") updateData.won_date = new Date().toISOString();

            await (supabase as any).from("deals").update(updateData).eq("id", dealId);
            await (supabase as any).from("activities").insert({
                deal_id: dealId,
                user_id: user?.id,
                organization_id: organizationId,
                type: "stage_change",
                title: `Etapa cambiada a: ${stageConfig?.label}`,
            });

            loadDeals();
        } catch (e) {
            console.error("Error moving deal:", e);
        }
    };

    // ── Computed Data ──────────────────────────────────────────
    const filteredDeals = useMemo(() => {
        return deals.filter((d) => {
            const matchesSearch =
                !searchTerm ||
                d.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (d.notes || "").toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStage = stageFilter === "all" || d.stage === stageFilter;
            return matchesSearch && matchesStage;
        });
    }, [deals, searchTerm, stageFilter]);

    const kpis = useMemo(() => {
        const openDeals = deals.filter((d) => !["won", "lost"].includes(d.stage));
        const closedDeals = deals.filter((d) => ["won", "lost"].includes(d.stage));
        const wonDeals = deals.filter((d) => d.stage === "won");
        const pipelineValue = openDeals.reduce((sum, d) => sum + (Number(d.value) || 0), 0);
        const avgDealValue =
            wonDeals.length > 0
                ? wonDeals.reduce((sum, d) => sum + (Number(d.value) || 0), 0) / wonDeals.length
                : 0;
        const conversionRate = closedDeals.length > 0 ? (wonDeals.length / closedDeals.length) * 100 : 0;
        const avgCycle =
            wonDeals.length > 0
                ? wonDeals.reduce((sum, d) => {
                      const days = Math.floor(
                          (new Date(d.won_date || d.updated_at).getTime() - new Date(d.created_at).getTime()) /
                              (1000 * 60 * 60 * 24)
                      );
                      return sum + days;
                  }, 0) / wonDeals.length
                : 0;

        return {
            totalOpen: openDeals.length,
            pipelineValue,
            conversionRate,
            avgDealValue,
            avgCycle: Math.round(avgCycle),
        };
    }, [deals]);

    const groupedByStage = useMemo(() => {
        const groups: Record<string, any[]> = {};
        PIPELINE_STAGES.forEach((s) => (groups[s.value] = []));
        filteredDeals.forEach((d) => {
            if (groups[d.stage]) groups[d.stage].push(d);
        });
        return groups;
    }, [filteredDeals]);

    // ── Render ──────────────────────────────────────────────
    return (
        <div className="space-y-10">
            {/* ── Header ────────────────────────────────── */}
            <EliteHeader 
                title="Pipeline de Ventas"
                subtitle="Sales Engine"
                icon={TrendingUp}
                statusText="Motor de Ventas Activo"
                rightContent={
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setShowHelp(!showHelp)}
                            className="w-14 h-14 rounded-2xl hover:bg-muted"
                        >
                            <Lightbulb className="h-6 w-6 text-muted-foreground" />
                        </Button>
                        <Button
                            onClick={() => setCreateDialogOpen(true)}
                            className="bg-primary text-primary-foreground hover:bg-primary/90 h-14 px-8 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-lg gap-2"
                        >
                            <Plus className="h-5 w-5" />
                            Nueva Oportunidad
                        </Button>
                    </div>
                }
            />

            {/* ── KPIs ────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <EliteKPICard 
                    title="Leads Abiertos" 
                    value={kpis.totalOpen} 
                    icon={<Target className="h-8 w-8" />} 
                    color="indigo" 
                />
                <EliteKPICard 
                    title="Valor Pipeline" 
                    value={`$${kpis.pipelineValue.toLocaleString()}`} 
                    icon={<DollarSign className="h-8 w-8" />} 
                    color="emerald" 
                />
                <EliteKPICard 
                    title="Tasa de Cierre" 
                    value={`${kpis.conversionRate.toFixed(0)}%`} 
                    icon={<Zap className="h-8 w-8" />} 
                    color="amber" 
                />
                <EliteKPICard 
                    title="Ticket Promedio" 
                    value={`$${kpis.avgDealValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} 
                    icon={<BarChart3 className="h-8 w-8" />} 
                    color="blue" 
                />
                <EliteKPICard 
                    title="Ciclo Promedio" 
                    value={`${kpis.avgCycle}d`} 
                    icon={<Clock className="h-8 w-8" />} 
                    color="rose" 
                />
            </div>

            {/* ── Filters ────────────────────────────────── */}
            <Card className="rounded-[2rem] border-none shadow-soft bg-white/60 backdrop-blur-sm overflow-hidden p-6">
                <div className="flex flex-col md:flex-row items-center gap-4">
                    <div className="flex-1 relative w-full group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="Buscar oportunidades..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-12 h-12 bg-white/50 border-slate-100 rounded-xl text-sm font-semibold"
                        />
                    </div>
                    <Select value={stageFilter} onValueChange={setStageFilter}>
                        <SelectTrigger className="h-12 w-full md:w-52 rounded-xl border-slate-100 font-bold bg-white/50">
                            <div className="flex items-center gap-2">
                                <Filter className="h-4 w-4 text-primary" />
                                <SelectValue placeholder="Etapa" />
                            </div>
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                            <SelectItem value="all" className="font-bold">Todas las etapas</SelectItem>
                            {PIPELINE_STAGES.map((s) => (
                                <SelectItem key={s.value} value={s.value} className="font-bold">
                                    {s.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                {(canViewAllData || isSupervisor) && (
                    <div className="mt-4 pt-4 border-t border-slate-100">
                        <AdminDataFilter onFilterChange={setAdminFilters} />
                    </div>
                )}
            </Card>

            {/* ── Kanban Board ────────────────────────────── */}
            <div className="overflow-x-auto pb-4 -mx-4 px-4 relative">
                {loading && (
                    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm rounded-3xl min-h-[300px]">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                        <p className="text-slate-600 font-bold animate-pulse text-sm mt-4 tracking-widest uppercase">Sincronizando...</p>
                    </div>
                )}
                <div className="flex gap-6 min-w-[1200px]">
                    {PIPELINE_STAGES.map((stage) => {
                        const stageDeals = groupedByStage[stage.value] || [];
                        const stageValue = stageDeals.reduce((s, d) => s + (Number(d.value) || 0), 0);
                        const nextStageIdx = PIPELINE_STAGES.findIndex((s) => s.value === stage.value) + 1;
                        const nextStage = nextStageIdx < PIPELINE_STAGES.length ? PIPELINE_STAGES[nextStageIdx] : null;

                        return (
                            <div key={stage.value} className="flex-1 min-w-[280px]">
                                {/* Column Header */}
                                <div className="bg-muted/30 p-4 rounded-[2rem] mb-6 border border-border shadow-inner">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center shadow-sm", stage.bgLight, stage.textColor)}>
                                                <stage.icon className="h-4 w-4" />
                                            </div>
                                            <span className="text-xs font-black uppercase tracking-widest text-foreground">
                                                {stage.label}
                                            </span>
                                        </div>
                                        <Badge variant="outline" className="text-[10px] font-black border-border px-3 py-1 bg-background">
                                            {stageDeals.length}
                                        </Badge>
                                    </div>
                                    {stageValue > 0 && (
                                        <p className="text-[11px] font-black mt-3 text-primary tracking-tight">
                                            ${stageValue.toLocaleString()}
                                        </p>
                                    )}
                                </div>

                                {/* Cards */}
                                <div className="space-y-2.5 min-h-[100px]">
                                    {stageDeals.map((deal) => {
                                        const daysSince = Math.floor(
                                            (Date.now() - new Date(deal.created_at).getTime()) / (1000 * 60 * 60 * 24)
                                        );
                                        return (
                                            <div
                                                key={deal.id}
                                                onClick={() => {
                                                    setSelectedDeal(deal);
                                                    setDetailOpen(true);
                                                }}
                                                className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-lg hover:border-slate-200 transition-all duration-300 cursor-pointer group"
                                            >
                                                <div className="flex items-start justify-between mb-2">
                                                    <h4 className="text-sm font-bold text-slate-800 group-hover:text-primary transition-colors leading-snug pr-2">
                                                        {deal.title}
                                                    </h4>
                                                    {nextStage && !["won", "lost"].includes(stage.value) && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleQuickMove(deal.id, nextStage.value);
                                                            }}
                                                            className="w-6 h-6 rounded-lg bg-slate-50 hover:bg-primary/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                                                            title={`Mover a ${nextStage.label}`}
                                                        >
                                                            <ArrowUpRight className="h-3.5 w-3.5 text-slate-400 hover:text-primary" />
                                                        </button>
                                                    )}
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <span className="text-lg font-black text-slate-900">
                                                        ${Number(deal.value || 0).toLocaleString()}
                                                    </span>
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-[10px] font-bold text-slate-400">
                                                            {deal.probability}%
                                                        </span>
                                                        <div className="w-8 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                                                            <div
                                                                className={cn("h-full rounded-full bg-gradient-to-r", stage.color)}
                                                                style={{ width: `${deal.probability}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-slate-50">
                                                    <Badge variant="secondary" className="text-[9px] font-bold bg-slate-50 text-slate-500 border-none px-1.5 py-0.5">
                                                        {SOURCE_OPTIONS.find((s) => s.value === deal.source)?.label || deal.source}
                                                    </Badge>
                                                    <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {daysSince}d
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {stageDeals.length === 0 && (
                                        <div className="text-center py-8">
                                            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                                                Sin oportunidades
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ── Create Dialog ────────────────────────────── */}
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogContent className="rounded-[2rem] border-none shadow-2xl max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black text-slate-800 tracking-tight">
                            Nueva Oportunidad
                        </DialogTitle>
                        <DialogDescription>
                            Registra una nueva oportunidad de venta en tu pipeline.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 pt-2">
                        <div>
                            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">
                                Título *
                            </Label>
                            <Input
                                value={newDeal.title}
                                onChange={(e) => setNewDeal((p) => ({ ...p, title: e.target.value }))}
                                placeholder="Ej: Propuesta Farmacia San Rafael"
                                className="h-12 rounded-xl border-slate-200 font-semibold"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">
                                    Valor Estimado ($)
                                </Label>
                                <Input
                                    type="number"
                                    value={newDeal.value}
                                    onChange={(e) => setNewDeal((p) => ({ ...p, value: e.target.value }))}
                                    placeholder="0.00"
                                    className="h-12 rounded-xl border-slate-200 font-bold"
                                />
                            </div>
                            <div>
                                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">
                                    Origen
                                </Label>
                                <Select
                                    value={newDeal.source}
                                    onValueChange={(v) => setNewDeal((p) => ({ ...p, source: v }))}
                                >
                                    <SelectTrigger className="h-12 rounded-xl border-slate-200 font-bold">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        {SOURCE_OPTIONS.map((s) => (
                                            <SelectItem key={s.value} value={s.value} className="font-bold">
                                                {s.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">
                                    Etapa Inicial
                                </Label>
                                <Select
                                    value={newDeal.stage}
                                    onValueChange={(v) => setNewDeal((p) => ({ ...p, stage: v }))}
                                >
                                    <SelectTrigger className="h-12 rounded-xl border-slate-200 font-bold">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        {PIPELINE_STAGES.filter((s) => !["won", "lost"].includes(s.value)).map((s) => (
                                            <SelectItem key={s.value} value={s.value} className="font-bold">
                                                {s.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">
                                    Cierre Estimado
                                </Label>
                                <Input
                                    type="date"
                                    value={newDeal.expected_close_date}
                                    onChange={(e) => setNewDeal((p) => ({ ...p, expected_close_date: e.target.value }))}
                                    className="h-12 rounded-xl border-slate-200 font-bold"
                                />
                            </div>
                        </div>

                        <div>
                            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">
                                Notas (Opcional)
                            </Label>
                            <Textarea
                                value={newDeal.notes}
                                onChange={(e) => setNewDeal((p) => ({ ...p, notes: e.target.value }))}
                                placeholder="Contexto adicional..."
                                className="rounded-xl border-slate-200 min-h-[60px]"
                            />
                        </div>

                        <Button
                            onClick={handleCreateDeal}
                            disabled={!newDeal.title.trim()}
                            className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-black text-[11px] uppercase tracking-widest rounded-2xl shadow-2xl transition-all hover:scale-[1.02] active:scale-95 gap-2"
                        >
                            <Zap className="h-5 w-5" />
                            Crear Oportunidad
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* ── Deal Detail Dialog ────────────────────── */}
            <DealDetailDialog
                deal={selectedDeal}
                open={detailOpen}
                onOpenChange={setDetailOpen}
                onDealUpdated={() => {
                    loadDeals();
                    if (selectedDeal) {
                        (supabase as any)
                            .from("deals")
                            .select("*")
                            .eq("id", selectedDeal.id)
                            .single()
                            .then(({ data }: any) => {
                                if (data) setSelectedDeal(data);
                            });
                    }
                }}
            />
        </div>
    );
}
