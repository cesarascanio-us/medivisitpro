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
    Lightbulb, ArrowUpRight, Loader2, RefreshCw, ShieldCheck, Activity, Star
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { AdminDataFilter } from "@/components/admin/AdminDataFilter";
import { DealDetailDialog } from "@/components/sales/DealDetailDialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { EliteHeader, EliteKPICard } from "@/components/layout/DesignSystem";
import { cloneElement } from "react";

// ── Pipeline Configuration ──────────────────────────────────────
const PIPELINE_STAGES = [
    { value: "prospecting", label: "Prospección", icon: Target, color: "bg-indigo-600", textColor: "text-indigo-500", probability: 10 },
    { value: "contacted", label: "Contactado", icon: Phone, color: "bg-amber-500", textColor: "text-amber-500", probability: 25 },
    { value: "proposal", label: "Propuesta", icon: FileText, color: "bg-blue-600", textColor: "text-blue-500", probability: 50 },
    { value: "negotiation", label: "Negociación", icon: TrendingUp, color: "bg-purple-600", textColor: "text-purple-500", probability: 75 },
    { value: "won", label: "Ganado", icon: Trophy, color: "bg-emerald-600", textColor: "text-emerald-500", probability: 100 },
    { value: "lost", label: "Perdido", icon: XCircle, color: "bg-rose-600", textColor: "text-rose-500", probability: 0 },
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

export default function SalesPipeline() {
    const { user, canViewAllData, isSupervisor, zoneId, organizationId } = useAuth();
    const { toast } = useToast();

    const [deals, setDeals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [stageFilter, setStageFilter] = useState("all");
    const [adminFilters, setAdminFilters] = useState<AdminFilterState>({});
    
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
                } else if (adminFilters.state && adminFilters.state !== "all") {
                    // Triangulación por Estado
                    const { data: zoneData } = await supabase.from('zones').select('id').eq('state', adminFilters.state);
                    const zoneIds = zoneData?.map(z => z.id) || [];
                    if (zoneIds.length > 0) query = query.in('zone_id', zoneIds);
                    else query = query.eq('id', '00000000-0000-0000-0000-000000000000');
                } else if (adminFilters.region && adminFilters.region !== "all") {
                    // Triangulación por Región
                    const { data: zoneData } = await supabase.from('zones').select('id').eq('region', adminFilters.region);
                    const zoneIds = zoneData?.map(z => z.id) || [];
                    if (zoneIds.length > 0) query = query.in('zone_id', zoneIds);
                    else query = query.eq('id', '00000000-0000-0000-0000-000000000000');
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

    return (
        <div className="space-y-8 pb-10 px-4">
            {/* HEADER INDUSTRIAL ELITE - SALES ENGINE */}
            <EliteHeader 
                title="Pipeline de Ventas"
                subtitle="Motor de Conversión Pro & Gestión de Leads"
                icon={TrendingUp}
                badgeText="V6.0 ELITE"
                statusText="Engine V6-CA Active"
                statusColor="bg-emerald-500"
                rightContent={
                    <div className="flex items-center gap-4">
                        <Button variant="outline" onClick={loadDeals} className="h-14 px-8 rounded-2xl bg-card border-border/40 text-foreground font-black text-[10px] uppercase tracking-widest shadow-premium-sm hover:shadow-premium-md transition-all">
                            <BarChart3 className="h-5 w-5 mr-3 text-primary" /> Resumen
                        </Button>
                        <Button
                            onClick={() => setCreateDialogOpen(true)}
                            className="bg-primary hover:bg-primary/90 text-white shadow-premium-md font-black uppercase tracking-[0.2em] text-[10px] h-16 px-10 rounded-2xl transition-all hover:scale-105 active:scale-95 flex items-center gap-3"
                        >
                            <Plus className="h-6 w-6" /> Nueva Oportunidad
                        </Button>
                    </div>
                }
            />

            {/* KPI GRID - INDUSTRIAL STYLE */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                <EliteKPICard title="Abiertos" value={kpis.totalOpen} icon={Target} color="blue" subtitle="Leads en gestión" />
                <EliteKPICard title="Valor Pipeline" value={`$${kpis.pipelineValue.toLocaleString()}`} icon={DollarSign} color="emerald" subtitle="Inversión Proyectada" />
                <EliteKPICard title="Conversión" value={`${kpis.conversionRate.toFixed(0)}%`} icon={Zap} color="amber" subtitle="Eficiencia de Cierre" />
                <EliteKPICard title="Ticket Promedio" value={`$${kpis.avgDealValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} icon={Activity} color="indigo" subtitle="Venta Media" />
                <EliteKPICard title="Ciclo Promedio" value={`${kpis.avgCycle}d`} icon={Clock} color="rose" subtitle="Días para el Cierre" />
            </div>

            {/* SEARCH & SYSTEM FILTERS */}
            <div className="flex flex-col gap-8">
                <Card className="bg-card border border-border/40 rounded-3xl shadow-premium-sm p-6 shrink-0 flex flex-col md:flex-row gap-6">
                    <div className="flex-1 relative">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            placeholder="Busca por título o contexto comercial..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-16 h-16 bg-muted/20 border-none focus-visible:ring-primary/20 font-bold rounded-2xl text-foreground transition-all shadow-inner"
                        />
                    </div>
                    <div className="flex items-center gap-4">
                         <Select value={stageFilter} onValueChange={setStageFilter}>
                            <SelectTrigger className="h-16 w-full md:w-64 rounded-2xl border-border/40 bg-muted/20 font-black uppercase text-[10px] tracking-widest text-muted-foreground shadow-inner px-8">
                                <SelectValue placeholder="ETAPA DEL EMBUDO" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-border/40 bg-card">
                                <SelectItem value="all" className="font-black text-[10px] uppercase tracking-widest">TODAS LAS ETAPAS</SelectItem>
                                {PIPELINE_STAGES.map((s) => (
                                    <SelectItem key={s.value} value={s.value} className="font-black text-[10px] uppercase tracking-widest">
                                        {s.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={loadDeals}
                            className="w-16 h-16 rounded-2xl bg-muted/20 shadow-inner hover:bg-card hover:shadow-premium-sm transition-all"
                        >
                            <RefreshCw className={cn("w-6 h-6", loading ? "animate-spin text-primary" : "text-muted-foreground")} />
                        </Button>
                    </div>
                </Card>
                {(canViewAllData || isSupervisor) && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <AdminDataFilter onFilterChange={setAdminFilters} />
                    </div>
                )}
            </div>

            {/* KANBAN AREA */}
            <div className="flex-1 min-h-0 overflow-x-auto pb-10 -mx-8 px-8 relative">
                {loading && deals.length === 0 && (
                    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/60 backdrop-blur-[1px] rounded-[3rem]">
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                        <p className="text-[10px] font-black mt-6 tracking-[0.4em] text-primary uppercase animate-pulse">Sincronizando Leads...</p>
                    </div>
                )}
                <div className="flex gap-8 min-w-[1400px] h-full">
                    {PIPELINE_STAGES.map((stage) => {
                        const stageDeals = groupedByStage[stage.value] || [];
                        const stageValue = stageDeals.reduce((s, d) => s + (Number(d.value) || 0), 0);
                        const nextStageIdx = PIPELINE_STAGES.findIndex((s) => s.value === stage.value) + 1;
                        const nextStage = nextStageIdx < PIPELINE_STAGES.length ? PIPELINE_STAGES[nextStageIdx] : null;

                        return (
                            <div key={stage.value} className="flex-1 min-w-[320px] flex flex-col gap-6">
                                {/* Column Header */}
                                <div className="bg-muted/20 p-6 rounded-[2rem] border border-border/40 flex items-center justify-between group shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shadow-premium-sm transition-transform group-hover:scale-105", stage.color, "text-white")}>
                                            <stage.icon className="h-6 w-6" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground font-display">
                                                {stage.label}
                                            </span>
                                            <span className="text-xs font-black text-primary font-display tracking-tight">
                                                ${stageValue.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="h-8 min-w-8 p-0 flex items-center justify-center rounded-xl border-border/40 bg-card shadow-inner text-[10px] font-black text-muted-foreground">
                                        {stageDeals.length}
                                    </Badge>
                                </div>

                                {/* Deals List */}
                                <ScrollArea className="flex-1 pr-1 font-outfit">
                                    <div className="flex flex-col gap-4 pb-4 font-outfit">
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
                                                    className="bg-card rounded-3xl p-6 border border-border/40 shadow-premium-sm hover:shadow-premium-md hover:translate-y-[-6px] transition-all duration-300 cursor-pointer group relative overflow-hidden"
                                                >
                                                    <div className="relative z-10">
                                                        <div className="flex items-start justify-between mb-4 gap-4">
                                                            <h4 className="text-sm font-black text-foreground group-hover:text-primary transition-colors tracking-tight uppercase font-display leading-[1.3]">
                                                                {deal.title}
                                                            </h4>
                                                            {nextStage && !["won", "lost"].includes(stage.value) && (
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleQuickMove(deal.id, nextStage.value);
                                                                    }}
                                                                    className="w-10 h-10 rounded-2xl bg-muted/30 hover:bg-primary text-muted-foreground hover:text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all flex-shrink-0 shadow-inner"
                                                                >
                                                                    <ArrowUpRight className="h-5 w-5" />
                                                                </button>
                                                            )}
                                                        </div>

                                                        <div className="flex items-center justify-between mb-6">
                                                            <div className="text-2xl font-black text-foreground tracking-tighter font-display">
                                                                ${Number(deal.value || 0).toLocaleString()}
                                                            </div>
                                                            <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/20 rounded-xl border border-border/40">
                                                                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                                                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest tabular-nums">
                                                                    {daysSince}D
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <div className="flex flex-col gap-3 pt-5 border-t border-border/20">
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest font-display">Probabilidad de Cierre</span>
                                                                <span className="text-[10px] font-black text-primary font-display">{deal.probability}%</span>
                                                            </div>
                                                            <div className="w-full h-1.5 bg-muted/30 rounded-full overflow-hidden shadow-inner">
                                                                <div
                                                                    className={cn("h-full rounded-full transition-all duration-1000 ease-out", stage.color)}
                                                                    style={{ width: `${deal.probability}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="absolute top-0 right-0 p-6 opacity-[0.02] group-hover:opacity-[0.08] transition-opacity">
                                                        <Activity className="h-20 w-20" />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {stageDeals.length === 0 && (
                                            <div className="text-center py-24 opacity-20 border-2 border-dashed border-border/40 rounded-3xl">
                                                <Target className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Sin Oportunidades</p>
                                            </div>
                                        )}
                                    </div>
                                </ScrollArea>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* CREATE DIALOG - INDUSTRIAL STYLE */}
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogContent aria-describedby={undefined} className="rounded-[3.5rem] border border-border/40 shadow-premium-2xl bg-card p-0 overflow-hidden max-w-lg">
                    <div className="bg-primary p-12 text-white relative">
                         <div className="absolute top-0 right-0 p-12 opacity-10">
                            <Zap className="w-40 h-40" />
                        </div>
                        <DialogTitle className="text-3xl font-black uppercase tracking-tighter relative z-10 leading-none font-display">
                            Nueva Oportunidad
                        </DialogTitle>
                        <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.3em] mt-4 relative z-10 font-display">Inyección al Pipeline Elite</p>
                    </div>
                    <div className="p-8 space-y-6 bg-muted/5">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">
                                Título Estratégico *
                            </Label>
                            <Input
                                value={newDeal.title}
                                onChange={(e) => setNewDeal((p) => ({ ...p, title: e.target.value }))}
                                placeholder="EJ: PROPUESTA FARMACIA SAN RAFAEL"
                                className="h-12 rounded-xl border-border/40 bg-background font-bold text-foreground focus:ring-primary/20"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">
                                    Valor Estimado ($)
                                </Label>
                                <Input
                                    type="number"
                                    value={newDeal.value}
                                    onChange={(e) => setNewDeal((p) => ({ ...p, value: e.target.value }))}
                                    placeholder="0.00"
                                    className="h-12 rounded-xl border-border/40 bg-background font-black text-lg text-foreground"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">
                                    Origen
                                </Label>
                                <Select
                                    value={newDeal.source}
                                    onValueChange={(v) => setNewDeal((p) => ({ ...p, source: v }))}
                                >
                                    <SelectTrigger className="h-12 rounded-xl border-border/40 bg-background font-bold text-xs uppercase">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-border bg-card">
                                        {SOURCE_OPTIONS.map((s) => (
                                            <SelectItem key={s.value} value={s.value} className="font-black text-[10px] uppercase tracking-widest">
                                                {s.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <Button
                            onClick={handleCreateDeal}
                            disabled={!newDeal.title.trim()}
                            className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-black text-[10px] uppercase tracking-widest rounded-xl shadow-lg transition-all"
                        >
                            Crear Oportunidad Elite
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

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

            {/* Footer Industrial Elite */}
            <div className="mt-10 flex items-center justify-between text-muted-foreground px-2 shrink-0">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 font-display">
                   <ShieldCheck className="h-4 w-4 text-primary" /> Directiva de Inteligencia Comercial César Ascanio CA
                </p>
                <div className="flex gap-6">
                    <span className="text-[9px] font-black tracking-widest">V 6.0.0</span>
                    <span className="text-[9px] font-black tracking-widest text-emerald-500">CORE SYNC OK</span>
                </div>
            </div>
        </div>
    );
}
