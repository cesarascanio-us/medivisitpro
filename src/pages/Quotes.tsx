/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
 ======================================================================== */

import { useState, useEffect, useCallback } from "react";
import {
    FileText, Plus, Search, Eye, Trash2, X, Save, RefreshCw,
    Package, DollarSign, CheckCircle2, Clock, XCircle, FlaskConical,
    Store, ShoppingCart, ArrowRight, Award, ChevronDown, ChevronUp,
    Truck, FileCheck2, AlertTriangle, Info
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
    EliteHeader, EliteKPICard, EliteEmptyState, EliteLoadingSkeleton
} from "@/components/layout/DesignSystem";

// ============================================================
// Types
// ============================================================
type QuoteStatus = "draft" | "sent" | "approved" | "converted_to_order" | "cancelled";

interface QuoteItem {
    product_id: string;
    quantity: number;
    unit_price: number;
    discount: number;
    product?: { id: string; name: string; category?: string };
    // Best baremo data
    best_drugstore?: { id: string; name: string };
    best_price?: number;
}

interface Quote {
    id: string;
    organization_id: string;
    user_id: string;
    contact_id?: string;
    pharmacy_name: string;
    drugstore_id?: string;
    total_amount: number;
    status: QuoteStatus;
    notes?: string;
    valid_until?: string;
    created_at: string;
    updated_at: string;
    approved_at?: string;
    // Joined
    contact?: { id: string; name: string; city?: string };
    drugstore?: { id: string; name: string };
    items?: QuoteItem[];
}

interface Pharmacy {
    id: string;
    name: string;
    city?: string;
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

interface Baremo {
    drugstore_id: string;
    product_id: string;
    price: number;
    discount_percentage: number;
    drugstore?: { id: string; name: string };
}

// ============================================================
// Status helpers
// ============================================================
const STATUS_CONFIG: Record<QuoteStatus, { label: string; class: string; icon: React.ElementType }> = {
    draft:              { label: "Borrador",     class: "bg-muted/20 text-muted-foreground border-border/40",               icon: FileText },
    sent:               { label: "Enviada",      class: "bg-blue-500/10 text-blue-400 border-blue-500/20",                  icon: ArrowRight },
    approved:           { label: "Aprobada",     class: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",         icon: CheckCircle2 },
    converted_to_order: { label: "Transferida",  class: "bg-violet-500/10 text-violet-400 border-violet-500/20",            icon: Truck },
    cancelled:          { label: "Cancelada",    class: "bg-rose-500/10 text-rose-400 border-rose-500/20",                  icon: XCircle },
};

function StatusBadge({ status }: { status: QuoteStatus }) {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
    const Icon = cfg.icon;
    return (
        <Badge variant="outline" className={cn("font-bold text-[10px] px-3 py-0.5 rounded-full flex items-center gap-1.5", cfg.class)}>
            <Icon className="h-3 w-3" /> {cfg.label}
        </Badge>
    );
}

// ============================================================
// Main Component
// ============================================================
export default function Quotes() {
    const { user, organizationId, isMaster, role } = useAuth();
    const { toast } = useToast();

    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
    const [drugstores, setDrugstores] = useState<Drugstore[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [baremos, setBaremos] = useState<Baremo[]>([]);
    const [loading, setLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");

    const [formOpen, setFormOpen] = useState(false);
    const [detailOpen, setDetailOpen] = useState(false);
    const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
    const [saving, setSaving] = useState(false);

    // Form state
    const [fPharmacy, setFPharmacy] = useState("");
    const [fPharmacyName, setFPharmacyName] = useState("");
    const [fDrugstore, setFDrugstore] = useState("");
    const [fValidUntil, setFValidUntil] = useState("");
    const [fNotes, setFNotes] = useState("");
    const [fItems, setFItems] = useState<QuoteItem[]>([]);

    const canEdit = isMaster || ["admin", "manager", "representative"].includes(role || "");
    const canApprove = isMaster || ["admin", "manager"].includes(role || "");

    // -------------------------------------------------------
    // Load data
    // -------------------------------------------------------
    const loadQuotes = useCallback(async () => {
        if (!organizationId) return;
        setLoading(true);
        try {
            const { data, error } = await (supabase as any)
                .from("quotes")
                .select(`
                    *,
                    contact:contacts(id, name, city),
                    drugstore:drugstores(id, name)
                `)
                .eq("organization_id", organizationId)
                .order("created_at", { ascending: false });

            if (error) throw error;
            setQuotes(data || []);
        } catch (err: any) {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    }, [organizationId]);

    const loadDropdowns = useCallback(async () => {
        if (!organizationId) return;
        const [{ data: ph }, { data: ds }, { data: ps }, { data: bm }] = await Promise.all([
            (supabase as any).from("contacts").select("id, name, city").eq("organization_id", organizationId).eq("contact_type", "pharmacy").order("name"),
            (supabase as any).from("drugstores").select("id, name, city").eq("organization_id", organizationId).order("name"),
            (supabase as any).from("products").select("id, name, category, price").eq("organization_id", organizationId).order("name"),
            (supabase as any).from("baremos").select("drugstore_id, product_id, price, discount_percentage, drugstore:drugstores(id, name)").eq("organization_id", organizationId).eq("is_active", true),
        ]);
        setPharmacies(ph || []);
        setDrugstores(ds || []);
        setProducts(ps || []);
        setBaremos(bm || []);
    }, [organizationId]);

    useEffect(() => {
        loadQuotes();
        loadDropdowns();
    }, [loadQuotes, loadDropdowns]);

    // -------------------------------------------------------
    // Baremo intelligence: find best drugstore per product
    // -------------------------------------------------------
    const getBestForProduct = (productId: string): { drugstore: Drugstore | null; price: number } => {
        const matching = baremos.filter(b => b.product_id === productId);
        if (!matching.length) return { drugstore: null, price: 0 };
        const best = matching.reduce((a, b) => {
            const na = a.price * (1 - a.discount_percentage / 100);
            const nb = b.price * (1 - b.discount_percentage / 100);
            return na <= nb ? a : b;
        });
        return {
            drugstore: best.drugstore as any || null,
            price: best.price * (1 - best.discount_percentage / 100)
        };
    };

    // -------------------------------------------------------
    // Filter
    // -------------------------------------------------------
    const filtered = quotes.filter(q => {
        const matchStatus = statusFilter === "all" || q.status === statusFilter;
        const term = searchTerm.toLowerCase();
        const matchSearch =
            !term ||
            q.pharmacy_name?.toLowerCase().includes(term) ||
            q.drugstore?.name?.toLowerCase().includes(term) ||
            q.contact?.name?.toLowerCase().includes(term);
        return matchStatus && matchSearch;
    });

    // -------------------------------------------------------
    // KPIs
    // -------------------------------------------------------
    const kpiTotal = quotes.length;
    const kpiDraft = quotes.filter(q => q.status === "draft").length;
    const kpiApproved = quotes.filter(q => q.status === "approved").length;
    const kpiRevenue = quotes
        .filter(q => q.status !== "cancelled")
        .reduce((s, q) => s + (q.total_amount || 0), 0);

    // -------------------------------------------------------
    // Form helpers
    // -------------------------------------------------------
    const addItem = () => {
        setFItems(prev => [...prev, {
            product_id: "",
            quantity: 1,
            unit_price: 0,
            discount: 0
        }]);
    };

    const updateItem = (idx: number, patch: Partial<QuoteItem>) => {
        setFItems(prev => {
            const next = [...prev];
            next[idx] = { ...next[idx], ...patch };
            // Auto-fill price from baremo
            if (patch.product_id) {
                const { price } = getBestForProduct(patch.product_id);
                const prod = products.find(p => p.id === patch.product_id);
                next[idx].unit_price = price || prod?.price || 0;
            }
            return next;
        });
    };

    const removeItem = (idx: number) => {
        setFItems(prev => prev.filter((_, i) => i !== idx));
    };

    const formTotal = fItems.reduce((s, i) => {
        const net = (i.unit_price || 0) * (1 - (i.discount || 0) / 100) * (i.quantity || 0);
        return s + net;
    }, 0);

    const resetForm = () => {
        setFPharmacy("");
        setFPharmacyName("");
        setFDrugstore("");
        setFValidUntil("");
        setFNotes("");
        setFItems([]);
    };

    // -------------------------------------------------------
    // Save quote
    // -------------------------------------------------------
    const handleSave = async (asDraft: boolean) => {
        if (!fPharmacy && !fPharmacyName) {
            toast({ title: "Requerido", description: "Selecciona una farmacia.", variant: "destructive" });
            return;
        }
        if (fItems.length === 0) {
            toast({ title: "Requerido", description: "Agrega al menos un producto.", variant: "destructive" });
            return;
        }
        setSaving(true);
        try {
            const pharmacy = pharmacies.find(p => p.id === fPharmacy);
            const quotePayload: any = {
                organization_id: organizationId,
                user_id: user?.id,
                contact_id: fPharmacy || null,
                pharmacy_name: pharmacy?.name || fPharmacyName,
                drugstore_id: fDrugstore || null,
                total_amount: formTotal,
                status: asDraft ? "draft" : "sent",
                notes: fNotes || null,
                valid_until: fValidUntil || null,
            };

            const { data: quote, error: qErr } = await (supabase as any)
                .from("quotes")
                .insert(quotePayload)
                .select()
                .single();

            if (qErr) throw qErr;

            // Insert items
            if (fItems.length > 0) {
                const itemsPayload = fItems
                    .filter(i => i.product_id)
                    .map(i => ({
                        quote_id: quote.id,
                        product_id: i.product_id,
                        quantity: i.quantity,
                        unit_price: i.unit_price,
                        discount: i.discount || 0,
                    }));
                const { error: iErr } = await (supabase as any).from("quote_items").insert(itemsPayload);
                if (iErr) throw iErr;
            }

            toast({
                title: asDraft ? "Borrador guardado" : "Cotización enviada",
                description: `Cotización para ${quotePayload.pharmacy_name} registrada.`
            });
            setFormOpen(false);
            resetForm();
            loadQuotes();
        } catch (err: any) {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    // -------------------------------------------------------
    // Approve / Cancel
    // -------------------------------------------------------
    const handleStatusChange = async (id: string, status: QuoteStatus) => {
        try {
            const patch: any = { status, updated_at: new Date().toISOString() };
            if (status === "approved") {
                patch.approved_at = new Date().toISOString();
                patch.approved_by = user?.id;
            }
            const { error } = await (supabase as any).from("quotes").update(patch).eq("id", id);
            if (error) throw error;
            toast({ title: "Estado actualizado", description: `Cotización marcada como ${STATUS_CONFIG[status]?.label}.` });
            loadQuotes();
            setDetailOpen(false);
        } catch (err: any) {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await (supabase as any).from("quote_items").delete().eq("quote_id", id);
            const { error } = await (supabase as any).from("quotes").delete().eq("id", id);
            if (error) throw error;
            toast({ title: "Cotización eliminada" });
            loadQuotes();
        } catch (err: any) {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        }
    };

    // -------------------------------------------------------
    // View detail
    // -------------------------------------------------------
    const openDetail = (q: Quote) => {
        setSelectedQuote(q);
        setDetailOpen(true);
    };

    // -------------------------------------------------------
    // Render
    // -------------------------------------------------------
    return (
        <div className="space-y-8 pb-10 animate-in fade-in duration-700">
            <EliteHeader
                title="Cotizaciones Directas"
                subtitle="Venta Directa Biofarco · Facturación al Cliente (Droguería o Compra Especial)"
                icon={FileText}
                badgeText="Venta Directa"
                statusText={`${quotes.length} Cotizaciones`}
                statusColor="bg-blue-500"
                rightContent={
                    canEdit && (
                        <Button
                            onClick={() => { resetForm(); setFormOpen(true); }}
                            className="h-12 px-8 bg-primary hover:bg-primary/90 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-premium-md flex items-center gap-2 active:scale-95 transition-all"
                        >
                            <Plus className="h-4 w-4" /> Nueva Cotización
                        </Button>
                    )
                }
            />

            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <EliteKPICard title="Total Cotizaciones" value={kpiTotal} icon={FileText} color="blue" subtitle="Biofarco → Cliente" />
                <EliteKPICard title="En Borrador" value={kpiDraft} icon={Clock} color="amber" subtitle="Pendientes de envío" />
                <EliteKPICard title="Aprobadas" value={kpiApproved} icon={CheckCircle2} color="emerald" subtitle="Listas para facturar" />
                <EliteKPICard
                    title="Pipeline"
                    value={`$${kpiRevenue.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    icon={DollarSign}
                    color="indigo"
                    subtitle="Venta directa"
                />
            </div>

            {/* Filters */}
            <Card className="border-border/40 bg-card rounded-2xl shadow-sm">
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                            <Input
                                placeholder="Buscar por farmacia o droguería..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="h-11 pl-10 bg-muted/20 border-none rounded-xl font-semibold text-xs shadow-inner text-foreground"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="h-11 w-full md:w-56 bg-muted/20 border-none rounded-xl font-bold text-xs text-muted-foreground shadow-inner">
                                <SelectValue placeholder="Estado" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-border/40 bg-card font-bold text-xs">
                                <SelectItem value="all">Todos los estados</SelectItem>
                                {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                                    <SelectItem key={k} value={k}>{v.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button
                            variant="outline"
                            onClick={loadQuotes}
                            className="h-11 px-5 border-border/40 bg-card rounded-xl font-bold text-xs text-muted-foreground flex items-center gap-2 hover:bg-muted/10 transition-all shadow-sm"
                        >
                            <RefreshCw className="h-4 w-4 text-primary" /> Actualizar
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Table */}
            <Card className="border-border/40 shadow-sm bg-card rounded-[2rem] overflow-hidden">
                <ScrollArea className="w-full">
                    {loading ? (
                        <div className="p-8"><EliteLoadingSkeleton rows={5} /></div>
                    ) : filtered.length === 0 ? (
                        <div className="p-10">
                            <EliteEmptyState
                                icon={FileText}
                                title="Sin cotizaciones directas"
                                subtitle={canEdit ? "Crea una cotización para venta directa de Biofarco a un cliente (droguería o compra especial)." : "No hay cotizaciones disponibles."}
                                actionLabel={canEdit ? "Nueva Cotización Directa" : undefined}
                                onAction={canEdit ? () => { resetForm(); setFormOpen(true); } : undefined}
                            />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader className="bg-muted/5">
                                <TableRow className="hover:bg-transparent border-border/40 h-16">
                                    <TableHead className="pl-8 text-[11px] font-black uppercase tracking-wider text-muted-foreground">Farmacia</TableHead>
                                    <TableHead className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">Droguería</TableHead>
                                    <TableHead className="text-[11px] font-black uppercase tracking-wider text-muted-foreground text-right">Total</TableHead>
                                    <TableHead className="text-[11px] font-black uppercase tracking-wider text-muted-foreground text-center">Estado</TableHead>
                                    <TableHead className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">Fecha</TableHead>
                                    <TableHead className="text-right pr-8 text-[11px] font-black uppercase tracking-wider text-muted-foreground">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map(q => (
                                    <TableRow
                                        key={q.id}
                                        className="hover:bg-muted/5 transition-all border-border/40 group h-20 cursor-pointer"
                                        onClick={() => openDetail(q)}
                                    >
                                        {/* Pharmacy */}
                                        <TableCell className="pl-8">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 flex-shrink-0">
                                                    <Store className="h-4 w-4 text-primary" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-black text-xs text-foreground uppercase leading-none">{q.pharmacy_name}</span>
                                                    {q.contact?.city && <span className="text-[9px] font-bold text-muted-foreground/60 uppercase">{q.contact.city}</span>}
                                                </div>
                                            </div>
                                        </TableCell>

                                        {/* Drugstore */}
                                        <TableCell>
                                            {q.drugstore ? (
                                                <div className="flex items-center gap-2">
                                                    <FlaskConical className="h-3.5 w-3.5 text-primary/50 flex-shrink-0" />
                                                    <span className="font-bold text-xs text-muted-foreground uppercase">{q.drugstore.name}</span>
                                                </div>
                                            ) : (
                                                <span className="text-[10px] font-bold text-muted-foreground/30 uppercase">No asignada</span>
                                            )}
                                        </TableCell>

                                        {/* Total */}
                                        <TableCell className="text-right">
                                            <span className="font-black text-sm text-foreground tabular-nums">
                                                ${(q.total_amount || 0).toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </span>
                                        </TableCell>

                                        {/* Status */}
                                        <TableCell className="text-center">
                                            <StatusBadge status={q.status} />
                                        </TableCell>

                                        {/* Date */}
                                        <TableCell>
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase">
                                                {new Date(q.created_at).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" })}
                                            </span>
                                        </TableCell>

                                        {/* Actions */}
                                        <TableCell className="text-right pr-8" onClick={e => e.stopPropagation()}>
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button
                                                    variant="ghost" size="icon"
                                                    onClick={() => openDetail(q)}
                                                    className="h-9 w-9 rounded-xl hover:bg-primary/10 hover:text-primary transition-all"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                {canEdit && q.status === "draft" && (
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-rose-500/10 hover:text-rose-500 transition-all">
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent className="rounded-[2rem] border-border/40 shadow-premium-2xl bg-card font-display p-8">
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle className="text-2xl font-black text-foreground uppercase tracking-tighter">¿Eliminar cotización?</AlertDialogTitle>
                                                                <AlertDialogDescription className="text-xs font-bold text-muted-foreground uppercase tracking-wider opacity-70">
                                                                    Esta acción no se puede deshacer. La cotización y sus ítems serán eliminados.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter className="mt-6 gap-3">
                                                                <AlertDialogCancel className="h-12 px-6 rounded-xl font-black uppercase text-[10px] tracking-widest border-border/40">Cancelar</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => handleDelete(q.id)} className="h-12 px-8 rounded-xl font-black uppercase text-[10px] tracking-widest bg-rose-500 hover:bg-rose-600">Eliminar</AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </ScrollArea>
            </Card>

            {/* ============================================================
                DETAIL DIALOG
                ============================================================ */}
            <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border/40 rounded-[2rem] shadow-premium-2xl font-display p-0 overflow-hidden">
                    {selectedQuote && (
                        <>
                            <DialogHeader className="p-8 border-b border-border/40 bg-muted/5">
                                <DialogTitle className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                                        <FileText className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-foreground uppercase tracking-tighter leading-none">{selectedQuote.pharmacy_name}</h2>
                                        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.4em] opacity-70 mt-1">
                                            {new Date(selectedQuote.created_at).toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" })}
                                        </p>
                                    </div>
                                    <div className="ml-auto">
                                        <StatusBadge status={selectedQuote.status} />
                                    </div>
                                </DialogTitle>
                            </DialogHeader>

                            <div className="p-8 space-y-6 overflow-y-auto max-h-[60vh]">
                                {/* Info row */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-muted/10 rounded-2xl p-5 border border-border/40">
                                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Droguería Asignada</p>
                                        <p className="font-black text-sm text-foreground uppercase flex items-center gap-2">
                                            <FlaskConical className="h-4 w-4 text-primary opacity-60" />
                                            {selectedQuote.drugstore?.name || "—"}
                                        </p>
                                    </div>
                                    <div className="bg-muted/10 rounded-2xl p-5 border border-border/40">
                                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Total Cotización</p>
                                        <p className="font-black text-2xl text-primary tabular-nums">
                                            ${(selectedQuote.total_amount || 0).toLocaleString("es-VE", { minimumFractionDigits: 2 })}
                                        </p>
                                    </div>
                                </div>

                                {selectedQuote.notes && (
                                    <div className="bg-muted/10 rounded-2xl p-5 border border-border/40">
                                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-2">Observaciones</p>
                                        <p className="text-xs font-bold text-muted-foreground">{selectedQuote.notes}</p>
                                    </div>
                                )}

                                {/* Action buttons */}
                                {canApprove && (
                                    <div className="flex flex-wrap gap-3">
                                        {selectedQuote.status === "draft" && (
                                            <Button
                                                onClick={() => handleStatusChange(selectedQuote.id, "sent")}
                                                variant="outline"
                                                className="h-11 px-6 rounded-xl font-black uppercase text-[10px] tracking-widest border-blue-500/30 text-blue-400 hover:bg-blue-500/10 flex items-center gap-2"
                                            >
                                                <ArrowRight className="h-4 w-4" /> Marcar como Enviada
                                            </Button>
                                        )}
                                        {selectedQuote.status === "sent" && (
                                            <Button
                                                onClick={() => handleStatusChange(selectedQuote.id, "approved")}
                                                className="h-11 px-6 rounded-xl font-black uppercase text-[10px] tracking-widest bg-emerald-500 hover:bg-emerald-600 text-white shadow-md flex items-center gap-2"
                                            >
                                                <CheckCircle2 className="h-4 w-4" /> Aprobar Cotización
                                            </Button>
                                        )}
                                        {selectedQuote.status === "approved" && (
                                            <Button
                                                onClick={() => handleStatusChange(selectedQuote.id, "converted_to_order")}
                                                className="h-11 px-6 rounded-xl font-black uppercase text-[10px] tracking-widest bg-violet-500 hover:bg-violet-600 text-white shadow-md flex items-center gap-2"
                                            >
                                                <Truck className="h-4 w-4" /> Generar Transferencia
                                            </Button>
                                        )}
                                        {!["cancelled", "converted_to_order"].includes(selectedQuote.status) && (
                                            <Button
                                                onClick={() => handleStatusChange(selectedQuote.id, "cancelled")}
                                                variant="outline"
                                                className="h-11 px-6 rounded-xl font-black uppercase text-[10px] tracking-widest border-rose-500/30 text-rose-400 hover:bg-rose-500/10 flex items-center gap-2"
                                            >
                                                <XCircle className="h-4 w-4" /> Cancelar
                                            </Button>
                                        )}
                                    </div>
                                )}

                                {selectedQuote.status === "converted_to_order" && (
                                    <div className="bg-violet-500/10 border border-violet-500/20 rounded-2xl p-5 flex items-center gap-3">
                                        <Truck className="h-5 w-5 text-violet-400 flex-shrink-0" />
                                        <p className="text-xs font-bold text-violet-300">Esta cotización ha sido convertida en una orden de transferencia hacia la droguería.</p>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* ============================================================
                CREATE DIALOG
                ============================================================ */}
            <Dialog open={formOpen} onOpenChange={v => !saving && setFormOpen(v)}>
                <DialogContent className="max-w-2xl bg-card border-border/40 rounded-[2rem] shadow-premium-2xl font-display p-0 overflow-hidden max-h-[90vh]">
                    <DialogHeader className="p-8 border-b border-border/40 bg-muted/5 flex-shrink-0">
                        <DialogTitle className="text-2xl font-black text-foreground uppercase tracking-tighter flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                                <ShoppingCart className="h-5 w-5 text-primary" />
                            </div>
                            Nueva Cotización Directa
                        </DialogTitle>
                        <p className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest mt-1 ml-14">
                            Venta Biofarco → Cliente · Precio base del laboratorio, un solo receptor
                        </p>
                    </DialogHeader>

                    <ScrollArea className="overflow-y-auto max-h-[65vh]">
                        <div className="p-8 space-y-6">
                            {/* Client (Pharmacy or Drugstore for direct sale) */}
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                    <Store className="h-3.5 w-3.5 inline mr-1.5 text-primary/60" />
                                    Cliente Receptor (Droguería o Compra Especial) *
                                </Label>
                                <Select value={fPharmacy} onValueChange={v => {
                                    setFPharmacy(v);
                                    const p = pharmacies.find(x => x.id === v);
                                    setFPharmacyName(p?.name || "");
                                }}>
                                    <SelectTrigger className="h-12 bg-muted/20 border-none rounded-xl font-bold text-xs text-foreground">
                                        <SelectValue placeholder="Seleccionar farmacia..." />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-border/40 bg-card font-bold text-xs max-h-52">
                                        {pharmacies.map(p => (
                                            <SelectItem key={p.id} value={p.id}>{p.name} {p.city ? `· ${p.city}` : ""}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {pharmacies.length === 0 && (
                                    <p className="text-[9px] text-amber-400 font-bold uppercase flex items-center gap-1">
                                        <AlertTriangle className="h-3 w-3" /> No hay farmacias registradas. Puedes registrar manualmente.
                                    </p>
                                )}
                                {!fPharmacy && (
                                    <Input
                                        placeholder="O escribe el nombre de la farmacia..."
                                        value={fPharmacyName}
                                        onChange={e => setFPharmacyName(e.target.value)}
                                        className="h-11 bg-muted/20 border-none rounded-xl font-bold text-xs text-foreground shadow-inner"
                                    />
                                )}
                            </div>

                            {/* Drugstore (preferred) */}
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                    <FlaskConical className="h-3.5 w-3.5 inline mr-1.5 text-primary/60" />
                                    Droguería preferida (opcional)
                                </Label>
                                <Select value={fDrugstore} onValueChange={setFDrugstore}>
                                    <SelectTrigger className="h-12 bg-muted/20 border-none rounded-xl font-bold text-xs text-foreground">
                                        <SelectValue placeholder="El sistema sugerirá la mejor por producto..." />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-border/40 bg-card font-bold text-xs">
                                        <SelectItem value="">Sin preferencia (auto-mejor)</SelectItem>
                                        {drugstores.map(d => (
                                            <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Validity */}
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Válida hasta</Label>
                                <Input
                                    type="date"
                                    value={fValidUntil}
                                    onChange={e => setFValidUntil(e.target.value)}
                                    className="h-12 bg-muted/20 border-none rounded-xl font-bold text-xs text-foreground shadow-inner"
                                />
                            </div>

                            <Separator className="border-border/40" />

                            {/* Items */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                        <Package className="h-3.5 w-3.5 inline mr-1.5 text-primary/60" />
                                        Productos ({fItems.length})
                                    </Label>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={addItem}
                                        className="h-8 px-4 border-primary/30 text-primary rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-primary/10 flex items-center gap-1.5"
                                    >
                                        <Plus className="h-3.5 w-3.5" /> Añadir Producto
                                    </Button>
                                </div>

                                {fItems.length === 0 && (
                                    <div className="text-center py-8 border border-dashed border-border/40 rounded-2xl">
                                        <Package className="h-8 w-8 mx-auto text-muted-foreground/20 mb-2" />
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Añade productos a la cotización</p>
                                    </div>
                                )}

                                {fItems.map((item, idx) => {
                                    const { drugstore: bestDs, price: bestPrice } = getBestForProduct(item.product_id);
                                    const lineTotal = (item.unit_price || 0) * (1 - (item.discount || 0) / 100) * (item.quantity || 0);
                                    return (
                                        <div key={idx} className="bg-muted/10 rounded-2xl p-4 border border-border/40 space-y-3">
                                            {/* Product select */}
                                            <div className="flex items-start gap-3">
                                                <div className="flex-1">
                                                    <Select value={item.product_id} onValueChange={v => updateItem(idx, { product_id: v })}>
                                                        <SelectTrigger className="h-10 bg-muted/20 border-none rounded-xl font-bold text-xs text-foreground">
                                                            <SelectValue placeholder="Seleccionar producto..." />
                                                        </SelectTrigger>
                                                        <SelectContent className="rounded-xl border-border/40 bg-card font-bold text-xs max-h-48">
                                                            {products.map(p => (
                                                                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    {/* Best drugstore suggestion */}
                                                    {item.product_id && bestDs && (
                                                        <div className="mt-1.5 flex items-center gap-1.5 text-emerald-400">
                                                            <Award className="h-3 w-3 flex-shrink-0" />
                                                            <span className="text-[9px] font-black uppercase tracking-wider">
                                                                Mejor precio en {bestDs.name}: ${bestPrice.toFixed(2)}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => removeItem(idx)}
                                                    className="h-10 w-10 rounded-xl hover:bg-rose-500/10 hover:text-rose-500 flex-shrink-0"
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>

                                            {/* Qty / Price / Discount */}
                                            <div className="grid grid-cols-3 gap-3">
                                                <div>
                                                    <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Cantidad</label>
                                                    <Input
                                                        type="number" min="1"
                                                        value={item.quantity}
                                                        onChange={e => updateItem(idx, { quantity: parseInt(e.target.value) || 1 })}
                                                        className="h-10 mt-1 bg-muted/20 border-none rounded-xl font-bold text-xs text-foreground shadow-inner"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Precio Unit.</label>
                                                    <Input
                                                        type="number" min="0" step="0.01"
                                                        value={item.unit_price}
                                                        onChange={e => updateItem(idx, { unit_price: parseFloat(e.target.value) || 0 })}
                                                        className="h-10 mt-1 bg-muted/20 border-none rounded-xl font-bold text-xs text-foreground shadow-inner"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Dto %</label>
                                                    <Input
                                                        type="number" min="0" max="100" step="0.5"
                                                        value={item.discount}
                                                        onChange={e => updateItem(idx, { discount: parseFloat(e.target.value) || 0 })}
                                                        className="h-10 mt-1 bg-muted/20 border-none rounded-xl font-bold text-xs text-foreground shadow-inner"
                                                    />
                                                </div>
                                            </div>

                                            {/* Line total */}
                                            <div className="flex justify-end">
                                                <span className="text-[10px] font-black text-muted-foreground uppercase">Subtotal: </span>
                                                <span className="text-[10px] font-black text-foreground ml-2 tabular-nums">${lineTotal.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    );
                                })}

                                {/* Grand total */}
                                {fItems.length > 0 && (
                                    <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex items-center justify-between">
                                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Total Cotización</span>
                                        <span className="font-black text-xl text-primary tabular-nums">${formTotal.toFixed(2)}</span>
                                    </div>
                                )}
                            </div>

                            <Separator className="border-border/40" />

                            {/* Notes */}
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Observaciones</Label>
                                <Textarea
                                    value={fNotes}
                                    onChange={e => setFNotes(e.target.value)}
                                    placeholder="Condiciones especiales, acuerdos, notas del representante..."
                                    className="bg-muted/20 border-none rounded-xl font-bold text-xs text-foreground shadow-inner resize-none min-h-[80px]"
                                />
                            </div>
                        </div>
                    </ScrollArea>

                    {/* Footer */}
                    <div className="p-6 border-t border-border/40 bg-muted/5 flex gap-3 flex-shrink-0">
                        <Button
                            variant="outline"
                            onClick={() => setFormOpen(false)}
                            disabled={saving}
                            className="h-12 px-6 rounded-xl font-black uppercase text-[10px] tracking-widest border-border/40 flex-1"
                        >
                            <X className="h-4 w-4 mr-2" /> Cancelar
                        </Button>
                        <Button
                            onClick={() => handleSave(true)}
                            disabled={saving}
                            variant="outline"
                            className="h-12 px-6 rounded-xl font-black uppercase text-[10px] tracking-widest border-amber-500/30 text-amber-400 hover:bg-amber-500/10 flex items-center gap-2"
                        >
                            {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            Borrador
                        </Button>
                        <Button
                            onClick={() => handleSave(false)}
                            disabled={saving}
                            className="h-12 px-8 rounded-xl font-black uppercase text-[10px] tracking-widest bg-primary hover:bg-primary/90 text-white shadow-premium-md flex items-center gap-2 active:scale-95 transition-all"
                        >
                            {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <FileCheck2 className="h-4 w-4" />}
                            Enviar Cotización
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
