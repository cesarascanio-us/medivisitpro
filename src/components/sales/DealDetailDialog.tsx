/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    X, Phone, Mail, MessageCircle, FileText, CalendarCheck, StickerIcon,
    TrendingUp, Clock, Edit3, Trash2, Check, Target, AlertCircle, Trophy,
    XCircle, ArrowRight, Plus
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { QuickActivityForm } from "./QuickActivityForm";
import { cn } from "@/lib/utils";

const STAGES = [
    { value: "prospecting", label: "Prospección", icon: Target, color: "bg-sky-500", probability: 10 },
    { value: "contacted", label: "Contactado", icon: Phone, color: "bg-amber-500", probability: 25 },
    { value: "proposal", label: "Propuesta", icon: FileText, color: "bg-indigo-500", probability: 50 },
    { value: "negotiation", label: "Negociación", icon: TrendingUp, color: "bg-purple-500", probability: 75 },
    { value: "won", label: "Ganado", icon: Trophy, color: "bg-emerald-500", probability: 100 },
    { value: "lost", label: "Perdido", icon: XCircle, color: "bg-red-500", probability: 0 },
];

const ACTIVITY_ICONS: Record<string, any> = {
    call: Phone,
    email: Mail,
    whatsapp: MessageCircle,
    meeting: CalendarCheck,
    note: StickerIcon,
    task: FileText,
    visit: Target,
    stage_change: ArrowRight,
};

const ACTIVITY_COLORS: Record<string, string> = {
    call: "text-blue-500 bg-blue-50",
    email: "text-indigo-500 bg-indigo-50",
    whatsapp: "text-emerald-500 bg-emerald-50",
    meeting: "text-amber-500 bg-amber-50",
    note: "text-slate-500 bg-slate-50",
    task: "text-purple-500 bg-purple-50",
    visit: "text-primary bg-primary/10",
    stage_change: "text-sky-500 bg-sky-50",
};

interface DealDetailDialogProps {
    deal: any;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onDealUpdated: () => void;
}

export function DealDetailDialog({ deal, open, onOpenChange, onDealUpdated }: DealDetailDialogProps) {
    const { user, organizationId } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();
    const [activities, setActivities] = useState<any[]>([]);
    const [loadingActivities, setLoadingActivities] = useState(false);
    const [showActivityForm, setShowActivityForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState<any>({});
    const [lostReason, setLostReason] = useState("");
    const [showLostDialog, setShowLostDialog] = useState(false);

    useEffect(() => {
        if (deal && open) {
            setEditData({
                title: deal.title,
                value: deal.value,
                stage: deal.stage,
                probability: deal.probability,
                expected_close_date: deal.expected_close_date || "",
                source: deal.source,
                notes: deal.notes || "",
            });
            loadActivities();
        }
    }, [deal, open]);

    const loadActivities = async () => {
        if (!deal) return;
        setLoadingActivities(true);
        try {
            const { data, error } = await (supabase as any)
                .from("activities")
                .select("*")
                .eq("deal_id", deal.id)
                .order("created_at", { ascending: false });
            if (error) throw error;
            setActivities(data || []);
        } catch (e) {
            console.error("Error loading activities:", e);
        } finally {
            setLoadingActivities(false);
        }
    };

    const handleSaveEdit = async () => {
        try {
            const { error } = await (supabase as any)
                .from("deals")
                .update({
                    title: editData.title,
                    value: parseFloat(editData.value) || 0,
                    stage: editData.stage,
                    probability: parseInt(editData.probability) || 0,
                    expected_close_date: editData.expected_close_date || null,
                    source: editData.source,
                    notes: editData.notes,
                })
                .eq("id", deal.id);
            if (error) throw error;

            toast({ title: "Oportunidad actualizada", description: "Los cambios han sido guardados." });
            setIsEditing(false);
            onDealUpdated();
        } catch (e) {
            console.error("Error updating deal:", e);
            toast({ title: "Error", description: "No se pudo actualizar.", variant: "destructive" });
        }
    };

    const handleStageChange = async (newStage: string) => {
        if (newStage === "lost") {
            setShowLostDialog(true);
            return;
        }

        try {
            const updateData: any = {
                stage: newStage,
                probability: STAGES.find((s) => s.value === newStage)?.probability || 0,
            };
            if (newStage === "won") {
                updateData.won_date = new Date().toISOString();
            }

            const { error } = await (supabase as any).from("deals").update(updateData).eq("id", deal.id);
            if (error) throw error;

            // Register stage change activity
            await (supabase as any).from("activities").insert({
                deal_id: deal.id,
                user_id: user?.id,
                organization_id: organizationId,
                type: "stage_change",
                title: `Etapa cambiada a: ${STAGES.find((s) => s.value === newStage)?.label}`,
            });

            toast({
                title: newStage === "won" ? "🏆 ¡Oportunidad Ganada!" : "Etapa actualizada",
                description: `Movido a: ${STAGES.find((s) => s.value === newStage)?.label}`,
            });
            setEditData((prev: any) => ({ ...prev, stage: newStage }));
            onDealUpdated();
            loadActivities();
        } catch (e) {
            console.error("Error changing stage:", e);
            toast({ title: "Error", description: "No se pudo cambiar la etapa.", variant: "destructive" });
        }
    };

    const handleMarkLost = async () => {
        try {
            await (supabase as any)
                .from("deals")
                .update({ stage: "lost", probability: 0, lost_reason: lostReason })
                .eq("id", deal.id);

            await (supabase as any).from("activities").insert({
                deal_id: deal.id,
                user_id: user?.id,
                organization_id: organizationId,
                type: "stage_change",
                title: `Oportunidad marcada como perdida`,
                description: lostReason ? `Razón: ${lostReason}` : undefined,
            });

            toast({ title: "Oportunidad cerrada", description: "Marcada como perdida." });
            setShowLostDialog(false);
            setLostReason("");
            onDealUpdated();
            loadActivities();
        } catch (e) {
            toast({ title: "Error", description: "No se pudo actualizar.", variant: "destructive" });
        }
    };

    const handleConvertToOrder = () => {
        onOpenChange(false); // Close dialog
        navigate('/transfer-orders', {
            state: {
                initialContact: {
                    id: deal.contact_id || null, 
                    name: deal.title.replace(/Propuesta /i, '').trim(), 
                    address: "" 
                },
                orderType: 'transfer'
            }
        });
    };

    const handleAddActivity = async (activity: any) => {
        try {
            const { error } = await (supabase as any).from("activities").insert({
                deal_id: deal.id,
                user_id: user?.id,
                organization_id: organizationId,
                type: activity.type,
                title: activity.title,
                description: activity.description,
                due_date: activity.due_date,
            });
            if (error) throw error;

            toast({ title: "Actividad registrada", description: activity.title });
            setShowActivityForm(false);
            loadActivities();
        } catch (e) {
            toast({ title: "Error", description: "No se pudo registrar.", variant: "destructive" });
        }
    };

    const handleToggleActivity = async (activityId: string, currentState: boolean) => {
        try {
            await (supabase as any)
                .from("activities")
                .update({
                    is_completed: !currentState,
                    completed_at: !currentState ? new Date().toISOString() : null,
                })
                .eq("id", activityId);
            loadActivities();
        } catch (e) {
            console.error("Error toggling activity:", e);
        }
    };

    if (!deal) return null;

    const currentStage = STAGES.find((s) => s.value === (editData.stage || deal.stage));
    const daysSinceCreation = Math.floor(
        (Date.now() - new Date(deal.created_at).getTime()) / (1000 * 60 * 60 * 24)
    );

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent aria-describedby={undefined} className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-[2rem] border-none shadow-2xl p-0">
                    <DialogHeader className="sr-only">
                        <DialogTitle>{deal.title}</DialogTitle>
                        <DialogDescription>Detalle de oportunidad de venta</DialogDescription>
                    </DialogHeader>

                    {/* Header Premium */}
                    <div className={cn("px-8 pt-8 pb-6 relative overflow-hidden", currentStage?.color || "bg-primary")}>
                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                        <div className="relative z-10">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.3em] mb-1">
                                        PIPELINE • {currentStage?.label?.toUpperCase()}
                                    </p>
                                    {isEditing ? (
                                        <Input
                                            value={editData.title}
                                            onChange={(e) => setEditData((p: any) => ({ ...p, title: e.target.value }))}
                                            className="bg-background/20 border-white/30 text-white text-2xl font-black h-12 rounded-xl"
                                        />
                                    ) : (
                                        <h2 className="text-2xl font-black text-white tracking-tight">{deal.title}</h2>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => (isEditing ? handleSaveEdit() : setIsEditing(true))}
                                        className="text-white/70 hover:text-white hover:bg-background/20 rounded-xl"
                                    >
                                        {isEditing ? <Check className="h-5 w-5" /> : <Edit3 className="h-5 w-5" />}
                                    </Button>
                                </div>
                            </div>

                            {/* Quick Stats */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-background/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                                    <p className="text-white/50 text-[9px] font-black uppercase tracking-widest">Valor</p>
                                    {isEditing ? (
                                        <Input
                                            type="number"
                                            value={editData.value}
                                            onChange={(e) => setEditData((p: any) => ({ ...p, value: e.target.value }))}
                                            className="bg-background/20 border-white/20 text-white font-black h-8 text-lg rounded-lg mt-1"
                                        />
                                    ) : (
                                        <p className="text-white text-xl font-black">
                                            ${Number(deal.value || 0).toLocaleString()}
                                        </p>
                                    )}
                                </div>
                                <div className="bg-background/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                                    <p className="text-white/50 text-[9px] font-black uppercase tracking-widest">Probabilidad</p>
                                    <p className="text-white text-xl font-black">{editData.probability || deal.probability}%</p>
                                </div>
                                <div className="bg-background/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                                    <p className="text-white/50 text-[9px] font-black uppercase tracking-widest">Días Activo</p>
                                    <p className="text-white text-xl font-black">{daysSinceCreation}d</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stage Progress Bar */}
                    <div className="px-8 py-4 border-b border-slate-100">
                        <div className="flex items-center gap-1">
                            {STAGES.filter((s) => s.value !== "lost").map((stage, i) => (
                                <button
                                    key={stage.value}
                                    onClick={() => handleStageChange(stage.value)}
                                    disabled={stage.value === "won" && deal.stage === "won"}
                                    className={cn(
                                        "flex-1 h-2 rounded-full transition-all duration-500 cursor-pointer hover:h-3",
                                        STAGES.findIndex((s) => s.value === (editData.stage || deal.stage)) >= i
                                            ? stage.color
                                            : "bg-slate-200"
                                    )}
                                    title={stage.label}
                                />
                            ))}
                        </div>
                        <div className="flex justify-between mt-2">
                            {STAGES.filter((s) => s.value !== "lost").map((stage) => (
                                <span
                                    key={stage.value}
                                    className={cn(
                                        "text-[8px] font-bold uppercase tracking-wider",
                                        (editData.stage || deal.stage) === stage.value ? "text-slate-800" : "text-slate-400"
                                    )}
                                >
                                    {stage.label}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Body */}
                    <div className="px-8 py-6 space-y-6">
                        {/* Action Buttons */}
                        {deal.stage !== "won" && deal.stage !== "lost" && (
                            <div className="flex flex-wrap gap-2">
                                <Button
                                    onClick={() => handleStageChange("won")}
                                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl h-10 gap-2 shadow-lg"
                                >
                                    <Trophy className="h-4 w-4" />
                                    Marcar Ganada
                                </Button>
                                <Button
                                    onClick={() => setShowLostDialog(true)}
                                    variant="outline"
                                    className="border-red-200 text-red-600 hover:bg-red-50 font-bold text-xs rounded-xl h-10 gap-2"
                                >
                                    <XCircle className="h-4 w-4" />
                                    Marcar Perdida
                                </Button>
                            </div>
                        )}

                        {/* Notes Section */}
                        {(deal.notes || isEditing) && (
                            <div>
                                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">
                                    Notas
                                </Label>
                                {isEditing ? (
                                    <Textarea
                                        value={editData.notes}
                                        onChange={(e) => setEditData((p: any) => ({ ...p, notes: e.target.value }))}
                                        className="rounded-xl border-slate-200 min-h-[60px]"
                                    />
                                ) : (
                                    <p className="text-sm text-slate-600 bg-slate-50 rounded-xl p-3 border border-slate-100">
                                        {deal.notes}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Activities Timeline */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-primary" />
                                    Historial de Actividades
                                </h3>
                                <Button
                                    onClick={() => setShowActivityForm(!showActivityForm)}
                                    size="sm"
                                    className="bg-primary/10 text-primary hover:bg-primary/20 font-bold text-xs rounded-xl h-8 gap-1"
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                    Actividad
                                </Button>
                            </div>

                            {showActivityForm && (
                                <div className="mb-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <QuickActivityForm
                                        dealId={deal.id}
                                        onSubmit={handleAddActivity}
                                        onCancel={() => setShowActivityForm(false)}
                                    />
                                </div>
                            )}

                            {/* Timeline */}
                            <div className="space-y-3">
                                {activities.length === 0 && !loadingActivities && (
                                    <p className="text-sm text-slate-400 text-center py-8 ">
                                        Sin actividades registradas. ¡Agrega la primera!
                                    </p>
                                )}
                                {activities.map((activity) => {
                                    const IconComponent = ACTIVITY_ICONS[activity.type] || FileText;
                                    const colorClass = ACTIVITY_COLORS[activity.type] || "text-slate-500 bg-slate-50";
                                    return (
                                        <div
                                            key={activity.id}
                                            className="flex items-start gap-3 group animate-in fade-in slide-in-from-left-2 duration-300"
                                        >
                                            <div
                                                className={cn(
                                                    "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5",
                                                    colorClass
                                                )}
                                            >
                                                <IconComponent className="h-4 w-4" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p
                                                        className={cn(
                                                            "text-sm font-bold text-slate-700",
                                                            activity.is_completed && "line-through text-slate-400"
                                                        )}
                                                    >
                                                        {activity.title}
                                                    </p>
                                                    {activity.type === "task" && (
                                                        <button
                                                            onClick={() =>
                                                                handleToggleActivity(activity.id, activity.is_completed)
                                                            }
                                                            className={cn(
                                                                "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all",
                                                                activity.is_completed
                                                                    ? "bg-emerald-500 border-emerald-500"
                                                                    : "border-slate-300 hover:border-primary"
                                                            )}
                                                        >
                                                            {activity.is_completed && (
                                                                <Check className="h-3 w-3 text-white" />
                                                            )}
                                                        </button>
                                                    )}
                                                </div>
                                                {activity.description && (
                                                    <p className="text-xs text-slate-500 mt-0.5">{activity.description}</p>
                                                )}
                                                <p className="text-[10px] text-slate-400 mt-1 font-semibold">
                                                    {new Date(activity.created_at).toLocaleDateString("es-ES", {
                                                        day: "numeric",
                                                        month: "short",
                                                        year: "numeric",
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })}
                                                    {activity.due_date && !activity.is_completed && (
                                                        <span className="text-amber-500 ml-2">
                                                            📅 Vence:{" "}
                                                            {new Date(activity.due_date).toLocaleDateString("es-ES")}
                                                        </span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Lost Reason Sub-Dialog */}
            <Dialog open={showLostDialog} onOpenChange={setShowLostDialog}>
                <DialogContent aria-describedby={undefined} className="rounded-[2rem] border-none shadow-2xl max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black text-slate-800">¿Por qué se perdió?</DialogTitle>
                        <DialogDescription>Registra la razón para mejorar tu estrategia futura.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 pt-2">
                        <Textarea
                            value={lostReason}
                            onChange={(e) => setLostReason(e.target.value)}
                            placeholder="Ej: Eligieron competencia por precio, sin presupuesto, no hubo respuesta..."
                            className="rounded-xl border-slate-200 min-h-[80px]"
                        />
                        <div className="flex gap-2">
                            <Button
                                onClick={handleMarkLost}
                                className="bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl flex-1"
                            >
                                Confirmar como Perdida
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={() => setShowLostDialog(false)}
                                className="rounded-xl"
                            >
                                Cancelar
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
