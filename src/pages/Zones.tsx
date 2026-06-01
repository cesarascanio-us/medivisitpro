/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
 ======================================================================== */

import { useState, useEffect } from "react";
import { Plus, MapPin, Search, Trash2, Edit, X, Users, Globe, Map, RefreshCw, LayoutTemplate, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useOrganization } from "@/hooks/useOrganization";
import { useToast } from "@/hooks/use-toast";
import { getAllRegions, getStatesInRegion } from "@/constants/regions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useTexts } from "@/hooks/useTexts";
import { EliteHeader, EliteKPICard, EliteCard, EliteButton, EliteInput } from "@/components/layout/DesignSystem";
import { motion } from "framer-motion";

interface Zone {
    id: string;
    name: string;
    description: string | null;
    state: string | null;
    region: string | null;
    created_at: string;
    user_count?: number;
    sales_threshold?: number;
}

export default function Zones() {
    const rawTexts = useTexts();
    const t = {
        ...rawTexts,
        create: rawTexts.btn_create,
        export: rawTexts.btn_export,
        import: rawTexts.btn_import,
    };
    const { canManageZones, isMaster, profile } = useAuth();
    const { organization } = useOrganization();
    const organizationId = organization?.id;
    const { toast } = useToast();
    const [zones, setZones] = useState<Zone[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingZone, setEditingZone] = useState<Zone | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        state: "",
        region: "",
        sales_threshold: 2000
    });

    useEffect(() => {
        if (canManageZones) loadZones();
    }, [canManageZones]);

    const loadZones = async () => {
        try {
            setLoading(true);
            let zonesQuery = supabase.from('zones').select('*');
            if (!isMaster && organizationId) {
                zonesQuery = zonesQuery.eq('organization_id', organizationId);
            }
            const { data: zonesData, error: zonesError } = await zonesQuery.order('name');
            if (zonesError) throw zonesError;

            let rolesQuery = supabase.from('user_roles').select('zone_id');
            if (!isMaster && organizationId) {
                rolesQuery = rolesQuery.eq('organization_id', organizationId);
            }
            const { data: userCounts, error: countError } = await rolesQuery;

            const countMap: Record<string, number> = {};
            (userCounts || []).forEach((ur: any) => {
                if (ur.zone_id) countMap[ur.zone_id] = (countMap[ur.zone_id] || 0) + 1;
            });

            const zonesWithCounts = (zonesData || []).map(zone => ({
                ...zone,
                user_count: countMap[zone.id] || 0
            }));
            setZones(zonesWithCounts);
        } catch (error) {
            toast({ title: "Error", description: "No se pudieron cargar las zonas.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!formData.name.trim()) {
            toast({ title: "Error", description: "El nombre de la zona es requerido.", variant: "destructive" });
            return;
        }
        try {
            if (editingZone) {
                const { error } = await supabase.from('zones').update({
                    name: formData.name,
                    description: formData.description || null,
                    sales_threshold: Number(formData.sales_threshold) || 0
                }).eq('id', editingZone.id);
                if (error) throw error;
                toast({ title: "Zona actualizada" });
            } else {
                const { error } = await supabase.from('zones').insert({
                    name: formData.name,
                    description: formData.description || null,
                    state: formData.state || null,
                    region: formData.region || null,
                    sales_threshold: Number(formData.sales_threshold) || 0,
                    organization_id: organizationId
                });
                if (error) throw error;
                toast({ title: "Zona creada" });
            }
            setDialogOpen(false);
            setEditingZone(null);
            setFormData({ name: "", description: "", state: "", region: "", sales_threshold: 2000 });
            loadZones();
        } catch (error) {
            toast({ title: "Error", variant: "destructive" });
        }
    };

    const handleDelete = async (zoneId: string) => {
        try {
            const { error } = await supabase.from('zones').delete().eq('id', zoneId);
            if (error) throw error;
            toast({ title: "Zona eliminada" });
            loadZones();
        } catch (error) {
            toast({ title: "Error", variant: "destructive" });
        }
    };

    const openEditDialog = (zone: Zone) => {
        setEditingZone(zone);
        setFormData({
            name: zone.name,
            description: zone.description || "",
            state: zone.state || "",
            region: zone.region || "",
            sales_threshold: zone.sales_threshold ?? 2000
        });
        setDialogOpen(true);
    };

    const openCreateDialog = () => {
        setEditingZone(null);
        setFormData({ name: "", description: "", state: "", region: "", sales_threshold: 2000 });
        setDialogOpen(true);
    };

    const filteredZones = zones.filter(z =>
        z.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        z.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!canManageZones) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
                <div className="w-24 h-24 bg-rose-500/10 rounded-[2.5rem] flex items-center justify-center mb-6">
                    <X className="w-12 h-12 text-rose-500" />
                </div>
                <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">Acceso Restringido</h2>
                <p className="text-muted-foreground font-medium text-center max-w-sm mt-2 font-outfit uppercase text-[10px] tracking-widest leading-relaxed">No dispones de los privilegios necesarios para gestionar la infraestructura de zonas de César Ascanio CA.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-background p-8 font-sans transition-colors duration-500 overflow-y-auto">
            
            {/* HEADER INDUSTRIAL ELITE - GESTIÓN DE ZONAS */}
            <EliteHeader
                title={t.zones_title}
                subtitle={t.zones_subtitle}
                icon={MapPin}
                badgeText="Base Operativa V6.0"
                statusText="Sincronización Regional OK"
                statusColor="bg-primary"
                rightContent={
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <EliteButton 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => loadZones()} 
                            className="w-14 h-14 rounded-2xl bg-card border border-border/40 hover:bg-muted/20 hover:shadow-premium-sm transition-all shadow-sm flex items-center justify-center"
                        >
                            <RefreshCw className={cn("h-6 w-6 text-muted-foreground/50", loading && "animate-spin text-primary")} />
                        </EliteButton>
                        <EliteButton
                            onClick={openCreateDialog}
                            className="bg-primary hover:bg-primary/90 text-white shadow-premium-md font-black uppercase tracking-widest text-[10px] h-14 px-8 rounded-2xl transition-all hover:scale-105 active:scale-95 whitespace-nowrap animate-pulse-subtle"
                            icon={Plus}
                        >
                            {t.create}
                        </EliteButton>
                    </div>
                }
            />

            {/* KPI GRID - INDUSTRIAL STYLE */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12 mt-8">
                <EliteKPICard
                    title="Zonas Activas"
                    value={zones.length}
                    icon={MapPin}
                    color="blue"
                    delay={0}
                />
                <EliteKPICard
                    title="Personal Campo"
                    value={zones.reduce((acc, z) => acc + (z.user_count || 0), 0)}
                    icon={Users}
                    color="indigo"
                    delay={100}
                />
                <EliteKPICard
                    title="Zonas Desiertas"
                    value={zones.filter(z => !z.user_count || z.user_count === 0).length}
                    icon={Globe}
                    color="amber"
                    delay={200}
                />
                <EliteKPICard
                    title="Eficiencia OK"
                    value="92%"
                    icon={ShieldCheck}
                    color="emerald"
                    delay={300}
                />
            </div>

            {/* MAIN AREA */}
            <div className="flex-1 min-h-0 flex flex-col gap-8">
                <EliteCard className="p-6 shrink-0 flex flex-col md:flex-row gap-6">
                    <div className="flex-1 relative">
                        <EliteInput
                            icon={Search}
                            placeholder="Busca por nombre o descripción de zona..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="h-16 bg-muted/20 border-none font-bold rounded-2xl text-foreground transition-all shadow-inner pl-14"
                        />
                    </div>
                    <EliteButton variant="secondary" className="h-16 px-8 rounded-2xl border-border/40 hover:bg-card hover:text-primary hover:shadow-premium-sm transition-all font-black text-[10px] uppercase tracking-widest bg-muted/30">
                        <Map className="mr-3 h-5 w-5" /> Regiones
                    </EliteButton>
                </EliteCard>

                <EliteCard className="flex-1 min-h-0 overflow-hidden flex flex-col p-0">
                    <ScrollArea className="flex-1">
                        <Table>
                            <TableHeader className="bg-muted/30 sticky top-0 z-10 backdrop-blur-md border-b border-border/40">
                                <TableRow className="hover:bg-transparent border-none">
                                    <TableHead className="pl-10 py-8 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground font-display">Identificación de Zona</TableHead>
                                    <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground font-display">Descripción Técnica</TableHead>
                                    <TableHead className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground font-display">Fuerza de Campo</TableHead>
                                    <TableHead className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground font-display">Umbral Comercial</TableHead>
                                    <TableHead className="text-right pr-10 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground font-display">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading && zones.length === 0 ? (
                                    Array(6).fill(0).map((_, i) => (
                                        <TableRow key={i} className="animate-pulse border-border/40">
                                            <TableCell colSpan={5} className="py-8 pl-10 border-none">
                                                <div className="h-6 bg-muted/20 rounded-lg w-48 mb-2 text-foreground" />
                                                <div className="h-4 bg-muted/10 rounded-lg w-32" />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : filteredZones.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-[400px] text-center border-none">
                                            <div className="flex flex-col items-center gap-6 opacity-20">
                                                <LayoutTemplate className="h-20 w-20 text-muted-foreground" />
                                                <p className="font-black text-muted-foreground uppercase tracking-widest text-xs">No se encontraron registros activos</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredZones.map(zone => (
                                        <TableRow key={zone.id} className="hover:bg-muted/30 transition-all border-border/40 group">
                                            <TableCell className="pl-10 py-8">
                                                <div className="flex flex-col">
                                                    <span className="font-black text-base text-foreground group-hover:text-primary transition-colors uppercase tracking-tight font-display leading-tight">{zone.name}</span>
                                                    <div className="flex items-center gap-2 mt-2">
                                                       <Globe className="h-3 w-3 text-primary/40" /> 
                                                       <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{zone.region} • {zone.state}</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <p className="text-xs font-bold text-muted-foreground max-w-sm line-clamp-1 leading-relaxed">{zone.description || "Sin descripción técnica vinculada."}</p>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge className="bg-primary/10 text-primary border-none font-black text-[9px] uppercase tracking-widest px-4 py-1.5 rounded-full">
                                                    {zone.user_count || 0} Usuarios
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="px-4 py-1.5 bg-muted/20 rounded-full text-[10px] font-mono font-black text-muted-foreground inline-block border border-border/40">
                                                    {zone.sales_threshold?.toLocaleString() || '2.000'} Units
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right pr-10">
                                                <div className="flex justify-end items-center gap-2">
                                                    <EliteButton variant="ghost" size="icon" onClick={() => openEditDialog(zone)} className="w-12 h-12 rounded-2xl hover:bg-primary/5 hover:text-primary transition-all">
                                                        <Edit className="h-5 w-5 text-muted-foreground/50" />
                                                    </EliteButton>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <EliteButton
                                                                variant="ghost"
                                                                size="icon"
                                                                disabled={(zone.user_count || 0) > 0}
                                                                className="w-12 h-12 rounded-2xl hover:bg-rose-500/10 hover:text-rose-600 transition-all flex items-center justify-center"
                                                            >
                                                                <Trash2 className="h-5 w-5 text-muted-foreground/50" />
                                                            </EliteButton>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent className="rounded-[3rem] border-none shadow-2xl bg-card p-0 overflow-hidden">
                                                            <div className="bg-rose-600 p-10 text-white relative">
                                                                <AlertDialogTitle className="text-3xl font-black uppercase tracking-tighter font-display leading-none">Protocolo de Purga</AlertDialogTitle>
                                                                <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.3em] mt-4">Advertencia Operativa de Nivel 1</p>
                                                            </div>
                                                            <div className="p-10">
                                                                <AlertDialogDescription className="text-muted-foreground font-bold text-base leading-relaxed font-sans">
                                                                    ¿Está seguro que desea purgar la zona <span className="text-rose-600 underline">"{zone.name}"</span>? Esta acción eliminará permanentemente la demarcación geográfica del sistema de César Ascanio CA.
                                                                </AlertDialogDescription>
                                                            </div>
                                                            <div className="p-10 pt-0 flex gap-4">
                                                                <AlertDialogCancel asChild>
                                                                    <EliteButton variant="secondary" className="flex-1 h-16 rounded-2xl border-border/40 bg-muted/20 font-black uppercase text-[10px] tracking-widest text-muted-foreground">Abortar</EliteButton>
                                                                </AlertDialogCancel>
                                                                <AlertDialogAction asChild>
                                                                    <EliteButton onClick={() => handleDelete(zone.id)} className="flex-1 h-16 rounded-2xl bg-rose-600 hover:bg-rose-700 font-black uppercase tracking-widest text-[10px] text-white shadow-premium-md shadow-rose-500/20 transition-all">Confirmar Purga</EliteButton>
                                                                </AlertDialogAction>
                                                            </div>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </EliteCard>
            </div>

            {/* FOOTER AUDITORÍA */}
            <div className="mt-12 flex items-center justify-between text-muted-foreground/50 px-6 shrink-0">
                <div className="flex items-center gap-4">
                    <ShieldCheck className="h-4 w-4 text-primary/40" />
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] font-display">
                        Directiva de Auditoría Médica César Ascanio CA • Infraestructura Crítica
                    </p>
                </div>
                <div className="flex gap-8">
                    <span className="text-[9px] font-black tracking-widest">V 6.0.0 (STABLE)</span>
                    <span className="text-[9px] font-black tracking-widest text-emerald-500">CANAL SEGURO</span>
                </div>
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="bg-card border-none shadow-2xl rounded-[3rem] max-w-xl p-0 overflow-hidden font-sans border border-border/40">
                    <div className="bg-primary p-12 text-white relative">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-card/10 rounded-full -mr-32 -mt-32 blur-3xl" />
                        <DialogTitle className="text-3xl font-black uppercase tracking-tighter font-display leading-none relative z-10">
                            {editingZone ? "Actualizar Zona" : "Nueva Demarcación"}
                        </DialogTitle>
                        <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.3em] mt-4 relative z-10">Estructura Geográfica de Élite</p>
                    </div>
                    <div className="p-12 space-y-8 bg-muted/30">
                        <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1 font-display">Designación de Zona</Label>
                            <EliteInput
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="h-16 rounded-2xl border-transparent bg-card font-bold text-foreground focus:ring-primary/20 shadow-sm"
                                placeholder="EJ: ZONA METROPOLITANA SUR"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 font-display">Jurisdicción (Región)</Label>
                                <Select value={formData.region} onValueChange={(v) => setFormData({ ...formData, region: v, state: "" })}>
                                    <SelectTrigger className="h-16 border-transparent rounded-2xl bg-card font-bold shadow-sm"><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                                    <SelectContent className="rounded-2xl border-border/40 bg-card shadow-premium-md">
                                        {getAllRegions().map(r => <SelectItem key={r} value={r} className="font-bold">{r}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 font-display">Entidad (Estado)</Label>
                                <Select value={formData.state} onValueChange={(v) => setFormData({ ...formData, state: v })} disabled={!formData.region}>
                                    <SelectTrigger className="h-16 border-transparent rounded-2xl bg-card font-bold shadow-sm"><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                                    <SelectContent className="rounded-2xl border-border/40 bg-card shadow-premium-md">
                                        {formData.region && getStatesInRegion(formData.region).map(s => <SelectItem key={s} value={s} className="font-bold">{s}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 font-display">Umbral de Ventas (Target)</Label>
                            <EliteInput
                                type="number"
                                value={formData.sales_threshold}
                                onChange={(e) => setFormData({ ...formData, sales_threshold: Number(e.target.value) })}
                                className="h-16 rounded-2xl border-transparent bg-card font-bold text-foreground focus:ring-primary/20 shadow-sm"
                                placeholder="2000"
                            />
                        </div>
                        <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1 font-display">Notas de Despliegue</Label>
                            <Textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="rounded-2xl border-transparent bg-card font-bold text-foreground focus:ring-primary/20 shadow-sm min-h-[100px]"
                                placeholder="Detalles de cobertura estratégica..."
                            />
                        </div>
                        <EliteButton onClick={handleSubmit} className="w-full h-16 bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-premium-md transition-all">
                            Validar Infraestructura
                        </EliteButton>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
