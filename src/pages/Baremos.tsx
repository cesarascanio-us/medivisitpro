/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
 ======================================================================== */

import { useState, useEffect, useCallback } from "react";
import {
    ListTree, Plus, Search, Edit2, Trash2, Save, X, FlaskConical,
    Package, TrendingDown, TrendingUp, DollarSign, RefreshCw, Filter,
    ChevronDown, AlertTriangle, CheckCircle2, Award, BarChart2
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
    EliteHeader, EliteKPICard, EliteTable, EliteEmptyState, EliteLoadingSkeleton
} from "@/components/layout/DesignSystem";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from "@/components/ui/alert-dialog";

// ============================================================
// Types
// ============================================================
interface Baremo {
    id: string;
    organization_id: string;
    drugstore_id: string;
    product_id: string;
    price: number;
    discount_percentage: number;
    min_quantity: number;
    notes: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    drugstore?: { id: string; name: string; city?: string };
    product?: { id: string; name: string; category?: string; price?: number };
}

interface Drugstore {
    id: string;
    name: string;
    city?: string;
}

interface Product {
    id: string;
    name: string;
    category?: string;
    price?: number;
}

interface BaremoFormData {
    drugstore_id: string;
    product_id: string;
    price: string;
    discount_percentage: string;
    min_quantity: string;
    notes: string;
}

const EMPTY_FORM: BaremoFormData = {
    drugstore_id: "",
    product_id: "",
    price: "0",
    discount_percentage: "0",
    min_quantity: "1",
    notes: ""
};

// ============================================================
// Helper: net price after discount
// ============================================================
function netPrice(price: number, discount: number) {
    return price * (1 - discount / 100);
}

// ============================================================
// Best-price analysis helper
// ============================================================
function getBestDrugstorePerProduct(baremos: Baremo[]) {
    const byProduct: Record<string, Baremo[]> = {};
    for (const b of baremos) {
        if (!byProduct[b.product_id]) byProduct[b.product_id] = [];
        byProduct[b.product_id].push(b);
    }
    const bestIds = new Set<string>();
    for (const list of Object.values(byProduct)) {
        const best = list.reduce((a, b) =>
            netPrice(a.price, a.discount_percentage) <= netPrice(b.price, b.discount_percentage) ? a : b
        );
        bestIds.add(best.id);
    }
    return bestIds;
}

// ============================================================
// Main Component
// ============================================================
export default function Baremos() {
    const { user, organizationId, isMaster, role } = useAuth();
    const { toast } = useToast();

    const [baremos, setBaremos] = useState<Baremo[]>([]);
    const [drugstores, setDrugstores] = useState<Drugstore[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState("");
    const [drugstoreFilter, setDrugstoreFilter] = useState("all");

    const [formOpen, setFormOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<Baremo | null>(null);
    const [form, setForm] = useState<BaremoFormData>(EMPTY_FORM);
    const [saving, setSaving] = useState(false);

    const canEdit = isMaster || ["admin", "manager"].includes(role || "");

    // -------------------------------------------------------
    // Load data
    // -------------------------------------------------------
    const loadBaremos = useCallback(async () => {
        if (!organizationId) return;
        setLoading(true);
        try {
            const { data, error } = await (supabase as any)
                .from("baremos")
                .select(`
                    *,
                    drugstore:drugstores(id, name, city),
                    product:products(id, name, category, price)
                `)
                .eq("organization_id", organizationId)
                .order("created_at", { ascending: false });

            if (error) throw error;
            setBaremos(data || []);
        } catch (err: any) {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    }, [organizationId]);

    const loadDropdowns = useCallback(async () => {
        if (!organizationId) return;
        const [{ data: ds }, { data: ps }] = await Promise.all([
            (supabase as any).from("drugstores").select("id, name, city").eq("organization_id", organizationId).order("name"),
            (supabase as any).from("products").select("id, name, category, price").eq("organization_id", organizationId).order("name"),
        ]);
        setDrugstores(ds || []);
        setProducts(ps || []);
    }, [organizationId]);

    useEffect(() => {
        loadBaremos();
        loadDropdowns();
    }, [loadBaremos, loadDropdowns]);

    // -------------------------------------------------------
    // Filter & search
    // -------------------------------------------------------
    const filtered = baremos.filter(b => {
        const matchDrug = drugstoreFilter === "all" || b.drugstore_id === drugstoreFilter;
        const term = searchTerm.toLowerCase();
        const matchSearch =
            !term ||
            b.product?.name?.toLowerCase().includes(term) ||
            b.drugstore?.name?.toLowerCase().includes(term) ||
            b.product?.category?.toLowerCase().includes(term);
        return matchDrug && matchSearch;
    });

    const bestIds = getBestDrugstorePerProduct(baremos.filter(b => b.is_active));

    // -------------------------------------------------------
    // KPIs
    // -------------------------------------------------------
    const avgDiscount = baremos.length
        ? baremos.reduce((s, b) => s + b.discount_percentage, 0) / baremos.length
        : 0;

    const totalProducts = new Set(baremos.map(b => b.product_id)).size;
    const totalDrugstores = new Set(baremos.map(b => b.drugstore_id)).size;
    const bestCount = bestIds.size;

    // -------------------------------------------------------
    // Form handlers
    // -------------------------------------------------------
    const openCreate = () => {
        setEditTarget(null);
        setForm(EMPTY_FORM);
        setFormOpen(true);
    };

    const openEdit = (b: Baremo) => {
        setEditTarget(b);
        setForm({
            drugstore_id: b.drugstore_id,
            product_id: b.product_id,
            price: String(b.price),
            discount_percentage: String(b.discount_percentage),
            min_quantity: String(b.min_quantity),
            notes: b.notes || ""
        });
        setFormOpen(true);
    };

    const handleSave = async () => {
        if (!form.drugstore_id || !form.product_id || !form.price) {
            toast({ title: "Campos requeridos", description: "Droguería, Producto y Precio son obligatorios.", variant: "destructive" });
            return;
        }
        setSaving(true);
        try {
            const payload = {
                organization_id: organizationId,
                drugstore_id: form.drugstore_id,
                product_id: form.product_id,
                price: parseFloat(form.price),
                discount_percentage: parseFloat(form.discount_percentage) || 0,
                min_quantity: parseInt(form.min_quantity) || 1,
                notes: form.notes || null,
            };

            if (editTarget) {
                const { error } = await (supabase as any)
                    .from("baremos")
                    .update({ ...payload, updated_at: new Date().toISOString() })
                    .eq("id", editTarget.id);
                if (error) throw error;
                toast({ title: "Baremo actualizado", description: "Los precios han sido sincronizados." });
            } else {
                const { error } = await (supabase as any).from("baremos").insert(payload);
                if (error) throw error;
                toast({ title: "Baremo registrado", description: "El nuevo precio ha sido añadido al sistema." });
            }
            setFormOpen(false);
            loadBaremos();
        } catch (err: any) {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const { error } = await (supabase as any).from("baremos").delete().eq("id", id);
            if (error) throw error;
            toast({ title: "Baremo eliminado" });
            loadBaremos();
        } catch (err: any) {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        }
    };

    // -------------------------------------------------------
    // Render
    // -------------------------------------------------------
    return (
        <div className="space-y-8 pb-10 animate-in fade-in duration-700">
            <EliteHeader
                title="Inventario de Droguerías"
                subtitle="Baremo Comparativo · Precio de cada Droguería por Producto de Biofarco"
                icon={ListTree}
                badgeText="Baremo de Precios"
                statusText={`${baremos.length} Registros`}
                statusColor="bg-violet-500"
                rightContent={
                    canEdit && (
                        <Button
                            onClick={openCreate}
                            className="h-12 px-8 bg-primary hover:bg-primary/90 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-premium-md flex items-center gap-2 active:scale-95 transition-all"
                        >
                            <Plus className="h-4 w-4" /> Nuevo Baremo
                        </Button>
                    )
                }
            />

            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <EliteKPICard title="Registros Totales" value={baremos.length} icon={BarChart2} color="indigo" subtitle="Precios cargados" />
                <EliteKPICard title="Productos Activos" value={totalProducts} icon={Package} color="blue" subtitle="En red de baremos" />
                <EliteKPICard title="Droguerías" value={totalDrugstores} icon={FlaskConical} color="violet" subtitle="Canales configurados" />
                <EliteKPICard
                    title="Descuento Promedio"
                    value={`${avgDiscount.toFixed(1)}%`}
                    icon={TrendingDown}
                    color="emerald"
                    subtitle="Media de canal"
                />
            </div>

            {/* Filters */}
            <Card className="border-border/40 bg-card rounded-2xl shadow-sm">
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                            <Input
                                placeholder="Buscar por producto, droguería o categoría..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="h-11 pl-10 bg-muted/20 border-none rounded-xl font-semibold text-xs shadow-inner text-foreground"
                            />
                        </div>
                        <Select value={drugstoreFilter} onValueChange={setDrugstoreFilter}>
                            <SelectTrigger className="h-11 w-full md:w-64 bg-muted/20 border-none rounded-xl font-bold text-xs text-muted-foreground shadow-inner">
                                <FlaskConical className="h-4 w-4 mr-2 text-primary opacity-70" />
                                <SelectValue placeholder="Filtrar droguería" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-border/40 bg-card font-bold text-xs">
                                <SelectItem value="all">Todas las Droguerías</SelectItem>
                                {drugstores.map(d => (
                                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button
                            variant="outline"
                            onClick={loadBaremos}
                            className="h-11 px-5 border-border/40 bg-card rounded-xl font-bold text-xs text-muted-foreground flex items-center gap-2 hover:bg-muted/10 transition-all shadow-sm"
                        >
                            <RefreshCw className="h-4 w-4 text-primary" /> Sincronizar
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Legend */}
            <div className="flex items-center gap-6 px-2">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Mejor precio para ese producto</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Precio alternativo</span>
                </div>
            </div>

            {/* Main Table */}
            <Card className="border-border/40 shadow-sm bg-card rounded-[2rem] overflow-hidden">
                <ScrollArea className="w-full">
                    {loading ? (
                        <div className="p-8"><EliteLoadingSkeleton rows={6} /></div>
                    ) : filtered.length === 0 ? (
                        <div className="p-10">
                            <EliteEmptyState
                                icon={ListTree}
                                title="Sin registros en el Baremo"
                                subtitle={canEdit ? "Registra el precio que cada droguería cobra por cada producto de Biofarco." : "No hay precios de droguería registrados en este momento."}
                                actionLabel={canEdit ? "Registrar Precio de Droguería" : undefined}
                                onAction={canEdit ? openCreate : undefined}
                            />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader className="bg-muted/5">
                                <TableRow className="hover:bg-transparent border-border/40 h-16">
                                    <TableHead className="pl-8 text-[11px] font-black uppercase tracking-wider text-muted-foreground">Producto</TableHead>
                                    <TableHead className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">Droguería</TableHead>
                                    <TableHead className="text-[11px] font-black uppercase tracking-wider text-muted-foreground text-right">Precio Base</TableHead>
                                    <TableHead className="text-[11px] font-black uppercase tracking-wider text-muted-foreground text-center">Dto %</TableHead>
                                    <TableHead className="text-[11px] font-black uppercase tracking-wider text-muted-foreground text-right">Precio Neto</TableHead>
                                    <TableHead className="text-[11px] font-black uppercase tracking-wider text-muted-foreground text-center">Canal</TableHead>
                                    {canEdit && (
                                        <TableHead className="text-right pr-8 text-[11px] font-black uppercase tracking-wider text-muted-foreground">Acciones</TableHead>
                                    )}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map(b => {
                                    const isBest = bestIds.has(b.id);
                                    const net = netPrice(b.price, b.discount_percentage);
                                    return (
                                        <TableRow
                                            key={b.id}
                                            className={cn(
                                                "hover:bg-muted/5 transition-all border-border/40 group h-20",
                                                isBest && "bg-emerald-500/5 hover:bg-emerald-500/8"
                                            )}
                                        >
                                            {/* Product */}
                                            <TableCell className="pl-8">
                                                <div className="flex items-center gap-3">
                                                    <div className={cn(
                                                        "w-2 h-2 rounded-full flex-shrink-0",
                                                        isBest ? "bg-emerald-500" : "bg-amber-500/60"
                                                    )} />
                                                    <div className="flex flex-col">
                                                        <span className="font-black text-xs text-foreground uppercase leading-none">
                                                            {b.product?.name || "—"}
                                                        </span>
                                                        <span className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-wider mt-0.5">
                                                            {b.product?.category || "General"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </TableCell>

                                            {/* Drugstore */}
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <FlaskConical className="h-3.5 w-3.5 text-primary/50 flex-shrink-0" />
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-xs text-muted-foreground uppercase">
                                                            {b.drugstore?.name || "—"}
                                                        </span>
                                                        {b.drugstore?.city && (
                                                            <span className="text-[9px] text-muted-foreground/50 font-bold uppercase">{b.drugstore.city}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>

                                            {/* Base price */}
                                            <TableCell className="text-right">
                                                <span className="font-bold text-sm text-muted-foreground tabular-nums">
                                                    ${b.price.toFixed(2)}
                                                </span>
                                            </TableCell>

                                            {/* Discount */}
                                            <TableCell className="text-center">
                                                {b.discount_percentage > 0 ? (
                                                    <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 font-bold text-[10px] px-2 py-0.5 rounded-full">
                                                        -{b.discount_percentage}%
                                                    </Badge>
                                                ) : (
                                                    <span className="text-[10px] text-muted-foreground/40 font-bold">—</span>
                                                )}
                                            </TableCell>

                                            {/* Net price */}
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <span className={cn(
                                                        "font-black text-sm tabular-nums",
                                                        isBest ? "text-emerald-400" : "text-foreground"
                                                    )}>
                                                        ${net.toFixed(2)}
                                                    </span>
                                                    {isBest && <Award className="h-3.5 w-3.5 text-emerald-400" />}
                                                </div>
                                            </TableCell>

                                            {/* Best badge */}
                                            <TableCell className="text-center">
                                                {isBest ? (
                                                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-bold text-[9px] px-3 py-0.5 rounded-full">
                                                        MEJOR PRECIO
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="bg-muted/20 text-muted-foreground border-border/40 font-bold text-[9px] px-3 py-0.5 rounded-full">
                                                        Alternativo
                                                    </Badge>
                                                )}
                                            </TableCell>

                                            {/* Actions */}
                                            {canEdit && (
                                                <TableCell className="text-right pr-8">
                                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => openEdit(b)}
                                                            className="h-9 w-9 rounded-xl hover:bg-primary/10 hover:text-primary transition-all"
                                                        >
                                                            <Edit2 className="h-4 w-4" />
                                                        </Button>
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-9 w-9 rounded-xl hover:bg-rose-500/10 hover:text-rose-500 transition-all"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent className="rounded-[2rem] border-border/40 shadow-premium-2xl bg-card font-display p-8">
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle className="text-2xl font-black text-foreground uppercase tracking-tighter">¿Eliminar baremo?</AlertDialogTitle>
                                                                    <AlertDialogDescription className="text-muted-foreground text-xs font-bold uppercase tracking-wider opacity-70">
                                                                        Esta acción eliminará el precio de <strong className="text-primary">{b.product?.name}</strong> en <strong className="text-primary">{b.drugstore?.name}</strong>.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter className="mt-6 gap-3">
                                                                    <AlertDialogCancel className="h-12 px-6 rounded-xl font-black uppercase text-[10px] tracking-widest border-border/40">Cancelar</AlertDialogCancel>
                                                                    <AlertDialogAction
                                                                        onClick={() => handleDelete(b.id)}
                                                                        className="h-12 px-8 rounded-xl font-black uppercase text-[10px] tracking-widest bg-rose-500 hover:bg-rose-600 shadow-lg shadow-rose-500/20"
                                                                    >
                                                                        Eliminar
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </div>
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    )}
                </ScrollArea>
            </Card>

            {/* Footer info */}
            <div className="flex items-center justify-between px-4 text-muted-foreground/40">
                <span className="text-[10px] font-bold uppercase tracking-widest">
                    {filtered.length} de {baremos.length} registros visibles
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary/60">
                    {bestCount} mejores precios identificados
                </span>
            </div>

            {/* Create / Edit Dialog */}
            <Dialog open={formOpen} onOpenChange={v => !saving && setFormOpen(v)}>
                <DialogContent className="max-w-lg bg-card border-border/40 rounded-[2rem] shadow-premium-2xl font-display p-0 overflow-hidden">
                    <DialogHeader className="p-8 border-b border-border/40 bg-muted/5">
                        <DialogTitle className="text-2xl font-black text-foreground uppercase tracking-tighter flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                                <ListTree className="h-5 w-5 text-primary" />
                            </div>
                            {editTarget ? "Editar Precio de Droguería" : "Registrar Precio de Droguería"}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="p-8 space-y-6">
                        <p className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest leading-relaxed">
                            Registra el precio al que <strong className="text-primary">esta droguería</strong> vende el producto al canal farmacia.
                        </p>
                        {/* Drugstore */}
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Droguería *</Label>
                            <Select
                                value={form.drugstore_id}
                                onValueChange={v => setForm(f => ({ ...f, drugstore_id: v }))}
                                disabled={!!editTarget}
                            >
                                <SelectTrigger className="h-12 bg-muted/20 border-none rounded-xl font-bold text-xs text-foreground">
                                    <SelectValue placeholder="Seleccionar droguería..." />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-border/40 bg-card font-bold text-xs">
                                    {drugstores.map(d => (
                                        <SelectItem key={d.id} value={d.id}>{d.name} {d.city ? `· ${d.city}` : ""}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Product */}
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Producto *</Label>
                            <Select
                                value={form.product_id}
                                onValueChange={v => {
                                    const p = products.find(x => x.id === v);
                                    setForm(f => ({
                                        ...f,
                                        product_id: v,
                                        price: p?.price ? String(p.price) : f.price
                                    }));
                                }}
                                disabled={!!editTarget}
                            >
                                <SelectTrigger className="h-12 bg-muted/20 border-none rounded-xl font-bold text-xs text-foreground">
                                    <SelectValue placeholder="Seleccionar producto..." />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-border/40 bg-card font-bold text-xs max-h-64">
                                    {products.map(p => (
                                        <SelectItem key={p.id} value={p.id}>{p.name} {p.category ? `· ${p.category}` : ""}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Price / Discount row */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Precio Base ($) *</Label>
                                <Input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={form.price}
                                    onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                                    className="h-12 bg-muted/20 border-none rounded-xl font-bold text-sm text-foreground shadow-inner"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Descuento (%)</Label>
                                <Input
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.5"
                                    value={form.discount_percentage}
                                    onChange={e => setForm(f => ({ ...f, discount_percentage: e.target.value }))}
                                    className="h-12 bg-muted/20 border-none rounded-xl font-bold text-sm text-foreground shadow-inner"
                                />
                            </div>
                        </div>

                        {/* Net price preview */}
                        {form.price && (
                            <div className="bg-primary/5 border border-primary/15 rounded-xl p-4 flex items-center justify-between">
                                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Precio Neto Final</span>
                                <span className="font-black text-lg text-primary tabular-nums">
                                    ${netPrice(parseFloat(form.price) || 0, parseFloat(form.discount_percentage) || 0).toFixed(2)}
                                </span>
                            </div>
                        )}

                        {/* Min quantity */}
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Cantidad mínima</Label>
                            <Input
                                type="number"
                                min="1"
                                value={form.min_quantity}
                                onChange={e => setForm(f => ({ ...f, min_quantity: e.target.value }))}
                                className="h-12 bg-muted/20 border-none rounded-xl font-bold text-sm text-foreground shadow-inner"
                            />
                        </div>

                        {/* Notes */}
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Observaciones</Label>
                            <Textarea
                                value={form.notes}
                                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                                placeholder="Condiciones especiales, temporadas, notas..."
                                className="bg-muted/20 border-none rounded-xl font-bold text-xs text-foreground shadow-inner resize-none min-h-[80px]"
                            />
                        </div>
                    </div>

                    <DialogFooter className="p-8 pt-0 gap-3">
                        <Button
                            variant="outline"
                            onClick={() => setFormOpen(false)}
                            disabled={saving}
                            className="h-12 px-6 rounded-xl font-black uppercase text-[10px] tracking-widest border-border/40"
                        >
                            <X className="h-4 w-4 mr-2" /> Cancelar
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={saving}
                            className="h-12 px-8 rounded-xl font-black uppercase text-[10px] tracking-widest bg-primary hover:bg-primary/90 text-white shadow-premium-md flex items-center gap-2 active:scale-95 transition-all"
                        >
                            {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            {editTarget ? "Actualizar" : "Registrar"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
