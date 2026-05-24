/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
 ======================================================================== */

import { useState, useEffect, useCallback } from "react";
import {
    Truck, Plus, Search, Eye, Trash2, X, Save, RefreshCw,
    Package, Clock, CheckCircle2, TrendingUp, Filter, Activity,
    FlaskConical, Store, ChevronDown, Award, DollarSign, FileText,
    ArrowRight, XCircle, Info, ShoppingCart
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import {
    Popover, PopoverContent, PopoverTrigger
} from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from "@/components/ui/alert-dialog";
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
type TransferStatus = "pendiente" | "procesado" | "en_ruta" | "entregado" | "cancelado";

interface BaremoOption {
    drugstore_id: string;
    drugstore_name: string;
    drugstore_city?: string;
    price: number;
    discount_percentage: number;
    net_price: number;
    is_best: boolean;
}

interface TransferLineItem {
    id: string; // local key
    product_id: string;
    product_name: string;
    quantity: number;
    drugstore_id: string;
    drugstore_name: string;
    precio_fijado: number;
    baremo_options: BaremoOption[];
    loading_baremo: boolean;
}

interface TransferOrder {
    id: string;
    organization_id?: string;
    pharmacy_id?: string;
    contact_id?: string;
    order_number?: string;
    order_date?: string;
    status: TransferStatus;
    total?: number;
    notes?: string;
    created_at: string;
    contact?: { id: string; name: string; city?: string };
    items?: any[];
}

interface Pharmacy {
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

// ============================================================
// Status config
// ============================================================
const STATUS_CFG: Record<TransferStatus, { label: string; cls: string; icon: React.ElementType }> = {
    pendiente:  { label: "Pendiente",   cls: "bg-amber-500/10 text-amber-400 border-amber-500/20",   icon: Clock },
    procesado:  { label: "Procesado",   cls: "bg-blue-500/10 text-blue-400 border-blue-500/20",      icon: CheckCircle2 },
    en_ruta:    { label: "En Ruta",     cls: "bg-violet-500/10 text-violet-400 border-violet-500/20", icon: Truck },
    entregado:  { label: "Entregado",   cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", icon: CheckCircle2 },
    cancelado:  { label: "Cancelado",   cls: "bg-rose-500/10 text-rose-400 border-rose-500/20",      icon: XCircle },
};

function StatusBadge({ status }: { status: TransferStatus }) {
    const cfg = STATUS_CFG[status] || STATUS_CFG.pendiente;
    const Icon = cfg.icon;
    return (
        <Badge variant="outline" className={cn("font-bold text-[10px] px-3 py-0.5 rounded-full flex items-center gap-1.5 w-fit", cfg.cls)}>
            <Icon className="h-3 w-3" /> {cfg.label}
        </Badge>
    );
}

// ============================================================
// DrugstoreSelector: inline popover showing baremo options
// ============================================================
function DrugstoreSelector({
    lineId,
    productId,
    baremoOptions,
    loadingBaremo,
    selectedDrugstoreId,
    onSelect,
}: {
    lineId: string;
    productId: string;
    baremoOptions: BaremoOption[];
    loadingBaremo: boolean;
    selectedDrugstoreId: string;
    onSelect: (drugstoreId: string, drugstoreName: string, price: number) => void;
}) {
    const [open, setOpen] = useState(false);
    const selected = baremoOptions.find(o => o.drugstore_id === selectedDrugstoreId);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    disabled={!productId || loadingBaremo}
                    className={cn(
                        "h-10 w-full justify-between rounded-xl border-border/40 font-bold text-xs shadow-inner transition-all",
                        selectedDrugstoreId
                            ? "text-foreground bg-muted/20 border-primary/30"
                            : "text-muted-foreground bg-muted/10"
                    )}
                >
                    {loadingBaremo ? (
                        <span className="flex items-center gap-2"><RefreshCw className="h-3.5 w-3.5 animate-spin" /> Consultando baremo...</span>
                    ) : selected ? (
                        <span className="flex items-center gap-2 truncate">
                            <FlaskConical className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                            <span className="truncate uppercase font-black">{selected.drugstore_name}</span>
                            {selected.is_best && <Award className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />}
                        </span>
                    ) : !productId ? (
                        <span className="text-muted-foreground/40 text-[10px] uppercase">Selecciona producto primero</span>
                    ) : baremoOptions.length === 0 ? (
                        <span className="text-amber-400/80 text-[10px] uppercase flex items-center gap-1">
                            <Info className="h-3.5 w-3.5" /> Sin baremo para este producto
                        </span>
                    ) : (
                        <span className="text-muted-foreground/60 text-[10px] uppercase">Seleccionar droguería...</span>
                    )}
                    <ChevronDown className="h-3.5 w-3.5 opacity-50 flex-shrink-0" />
                </Button>
            </PopoverTrigger>
            {baremoOptions.length > 0 && (
                <PopoverContent className="w-[340px] p-0 rounded-2xl border-border/40 bg-card shadow-premium-2xl font-display" align="start">
                    <div className="p-4 border-b border-border/40 bg-muted/5">
                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                            Precios disponibles en Baremo
                        </p>
                        <p className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-wider mt-0.5">
                            Ordenados por mejor precio neto
                        </p>
                    </div>
                    <div className="p-2 space-y-1 max-h-64 overflow-y-auto">
                        {baremoOptions.map((opt, i) => (
                            <button
                                key={opt.drugstore_id}
                                onClick={() => {
                                    onSelect(opt.drugstore_id, opt.drugstore_name, opt.net_price);
                                    setOpen(false);
                                }}
                                className={cn(
                                    "w-full flex items-center justify-between p-3 rounded-xl transition-all text-left group",
                                    opt.is_best
                                        ? "bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/20"
                                        : "hover:bg-muted/10 border border-transparent",
                                    selectedDrugstoreId === opt.drugstore_id && "ring-2 ring-primary/40"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0",
                                        opt.is_best ? "bg-emerald-500/20" : "bg-muted/20"
                                    )}>
                                        {opt.is_best
                                            ? <Award className="h-4 w-4 text-emerald-400" />
                                            : <FlaskConical className="h-4 w-4 text-muted-foreground/50" />
                                        }
                                    </div>
                                    <div className="flex flex-col">
                                        <span className={cn(
                                            "font-black text-xs uppercase leading-none",
                                            opt.is_best ? "text-emerald-400" : "text-foreground"
                                        )}>
                                            {opt.drugstore_name}
                                        </span>
                                        {opt.drugstore_city && (
                                            <span className="text-[9px] font-bold text-muted-foreground/50 uppercase">{opt.drugstore_city}</span>
                                        )}
                                        {opt.discount_percentage > 0 && (
                                            <span className="text-[9px] font-bold text-blue-400 uppercase">Dto: {opt.discount_percentage}%</span>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right">
                                    {opt.discount_percentage > 0 && (
                                        <p className="text-[9px] line-through text-muted-foreground/40 font-bold tabular-nums">${opt.price.toFixed(2)}</p>
                                    )}
                                    <p className={cn(
                                        "font-black text-sm tabular-nums",
                                        opt.is_best ? "text-emerald-400" : "text-foreground"
                                    )}>
                                        ${opt.net_price.toFixed(2)}
                                    </p>
                                </div>
                            </button>
                        ))}
                    </div>
                </PopoverContent>
            )}
        </Popover>
    );
}

// ============================================================
// Helpers
// ============================================================
function makeLineId() {
    return Math.random().toString(36).slice(2, 10);
}

function emptyLine(): TransferLineItem {
    return {
        id: makeLineId(),
        product_id: "",
        product_name: "",
        quantity: 1,
        drugstore_id: "",
        drugstore_name: "",
        precio_fijado: 0,
        baremo_options: [],
        loading_baremo: false,
    };
}

// ============================================================
// Main Component
// ============================================================
export default function TransferOrders() {
    const { user, organizationId, isMaster, role } = useAuth();
    const { toast } = useToast();

    const [orders, setOrders] = useState<TransferOrder[]>([]);
    const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");

    const [formOpen, setFormOpen] = useState(false);
    const [detailOpen, setDetailOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<TransferOrder | null>(null);
    const [saving, setSaving] = useState(false);

    // Form state
    const [fPharmacy, setFPharmacy] = useState("");
    const [fNotes, setFNotes] = useState("");
    const [fLines, setFLines] = useState<TransferLineItem[]>([emptyLine()]);

    const canEdit = isMaster || ["admin", "manager", "representative"].includes(role || "");

    // -------------------------------------------------------
    // Load data
    // -------------------------------------------------------
    const loadOrders = useCallback(async () => {
        if (!organizationId) return;
        setLoading(true);
        try {
            const { data, error } = await (supabase as any)
                .from("transfer_orders")
                .select(`
                    *,
                    contact:contacts(id, name, city)
                `)
                .eq("organization_id", organizationId)
                .order("created_at", { ascending: false });
            if (error) throw error;
            setOrders(data || []);
        } catch (err: any) {
            // Silent - might not have org column yet
            setOrders([]);
        } finally {
            setLoading(false);
        }
    }, [organizationId]);

    const loadDropdowns = useCallback(async () => {
        if (!organizationId) return;
        const [{ data: ph }, { data: ps }] = await Promise.all([
            (supabase as any).from("contacts").select("id, name, city").eq("organization_id", organizationId).eq("contact_type", "pharmacy").order("name"),
            (supabase as any).from("products").select("id, name, category, price").eq("organization_id", organizationId).order("name"),
        ]);
        setPharmacies(ph || []);
        setProducts(ps || []);
    }, [organizationId]);

    useEffect(() => {
        loadOrders();
        loadDropdowns();
    }, [loadOrders, loadDropdowns]);

    // -------------------------------------------------------
    // Baremo lookup per product
    // -------------------------------------------------------
    const loadBaremoForProduct = async (productId: string, lineId: string) => {
        setFLines(prev => prev.map(l => l.id === lineId ? { ...l, loading_baremo: true } : l));
        try {
            const { data } = await (supabase as any)
                .from("baremos")
                .select("drugstore_id, price, discount_percentage, drugstore:drugstores(id, name, city)")
                .eq("organization_id", organizationId)
                .eq("product_id", productId)
                .eq("is_active", true);

            const options: BaremoOption[] = (data || []).map((b: any) => ({
                drugstore_id: b.drugstore_id,
                drugstore_name: b.drugstore?.name || "—",
                drugstore_city: b.drugstore?.city,
                price: b.price,
                discount_percentage: b.discount_percentage,
                net_price: b.price * (1 - b.discount_percentage / 100),
                is_best: false,
            }));

            // Mark cheapest
            if (options.length > 0) {
                const bestIdx = options.reduce((bi, o, i) =>
                    o.net_price < options[bi].net_price ? i : bi, 0);
                options[bestIdx].is_best = true;
            }

            // Sort cheapest first
            options.sort((a, b) => a.net_price - b.net_price);

            setFLines(prev => prev.map(l => {
                if (l.id !== lineId) return l;
                // Auto-select cheapest if available
                const best = options.find(o => o.is_best);
                return {
                    ...l,
                    baremo_options: options,
                    loading_baremo: false,
                    drugstore_id: best ? best.drugstore_id : "",
                    drugstore_name: best ? best.drugstore_name : "",
                    precio_fijado: best ? best.net_price : 0,
                };
            }));
        } catch {
            setFLines(prev => prev.map(l => l.id === lineId ? { ...l, loading_baremo: false } : l));
        }
    };

    // -------------------------------------------------------
    // Line item handlers
    // -------------------------------------------------------
    const handleProductSelect = (lineId: string, productId: string) => {
        const prod = products.find(p => p.id === productId);
        setFLines(prev => prev.map(l => l.id === lineId
            ? { ...l, product_id: productId, product_name: prod?.name || "", baremo_options: [], drugstore_id: "", drugstore_name: "", precio_fijado: 0 }
            : l
        ));
        if (productId) loadBaremoForProduct(productId, lineId);
    };

    const handleDrugstoreSelect = (lineId: string, drugstoreId: string, drugstoreName: string, price: number) => {
        setFLines(prev => prev.map(l => l.id === lineId
            ? { ...l, drugstore_id: drugstoreId, drugstore_name: drugstoreName, precio_fijado: price }
            : l
        ));
    };

    const addLine = () => setFLines(prev => [...prev, emptyLine()]);
    const removeLine = (lineId: string) => setFLines(prev => prev.filter(l => l.id !== lineId));

    const formTotal = fLines.reduce((s, l) => s + (l.precio_fijado * l.quantity), 0);

    // -------------------------------------------------------
    // Save transfer order
    // -------------------------------------------------------
    const handleSave = async () => {
        if (!fPharmacy) {
            toast({ title: "Requerido", description: "Selecciona una farmacia.", variant: "destructive" });
            return;
        }
        const validLines = fLines.filter(l => l.product_id && l.drugstore_id);
        if (validLines.length === 0) {
            toast({ title: "Requerido", description: "Agrega al menos un producto con droguería seleccionada.", variant: "destructive" });
            return;
        }
        setSaving(true);
        try {
            const pharmacy = pharmacies.find(p => p.id === fPharmacy);
            const orderNum = `TRF-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

            const { data: order, error: oErr } = await (supabase as any)
                .from("transfer_orders")
                .insert({
                    organization_id: organizationId,
                    user_id: user?.id,
                    contact_id: fPharmacy,
                    pharmacy_id: fPharmacy,
                    order_number: orderNum,
                    order_date: new Date().toISOString(),
                    status: "pendiente",
                    total: formTotal,
                    notes: fNotes || null,
                })
                .select()
                .single();

            if (oErr) throw oErr;

            // Insert line items with per-line drugstore
            const items = validLines.map(l => ({
                transfer_order_id: order.id,
                product_id: l.product_id,
                quantity: l.quantity,
                unit_price: l.precio_fijado,
                drugstore_id: l.drugstore_id,
                precio_fijado: l.precio_fijado,
                subtotal: l.precio_fijado * l.quantity,
            }));

            const { error: iErr } = await (supabase as any).from("transfer_order_items").insert(items);
            if (iErr) throw iErr;

            toast({
                title: "Transferencia registrada",
                description: `Orden ${orderNum} para ${pharmacy?.name} creada con ${validLines.length} líneas de producto.`
            });
            setFormOpen(false);
            resetForm();
            loadOrders();
        } catch (err: any) {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    const resetForm = () => {
        setFPharmacy("");
        setFNotes("");
        setFLines([emptyLine()]);
    };

    // -------------------------------------------------------
    // Filters
    // -------------------------------------------------------
    const filtered = orders.filter(o => {
        const matchStatus = statusFilter === "all" || o.status === statusFilter;
        const term = searchTerm.toLowerCase();
        const matchSearch =
            !term ||
            o.contact?.name?.toLowerCase().includes(term) ||
            o.order_number?.toLowerCase().includes(term);
        return matchStatus && matchSearch;
    });

    // KPIs
    const kpiPendiente = orders.filter(o => o.status === "pendiente").length;
    const kpiEnRuta = orders.filter(o => o.status === "en_ruta").length;
    const kpiEntregado = orders.filter(o => o.status === "entregado").length;
    const kpiTotal = orders.reduce((s, o) => s + (o.total || 0), 0);

    // -------------------------------------------------------
    // Render
    // -------------------------------------------------------
    return (
        <div className="space-y-8 pb-10 animate-in fade-in duration-700">
            <EliteHeader
                title="Canal de Transferencia"
                subtitle="Pedidos de Farmacias · Despacho Multi-Droguería por Producto"
                icon={Truck}
                badgeText="Logística"
                statusText={`${orders.length} Órdenes`}
                statusColor="bg-emerald-500"
                rightContent={
                    canEdit && (
                        <Button
                            onClick={() => { resetForm(); setFormOpen(true); }}
                            className="h-12 px-8 bg-primary hover:bg-primary/90 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-premium-md flex items-center gap-2 active:scale-95 transition-all"
                        >
                            <Plus className="h-4 w-4" /> Nueva Transferencia
                        </Button>
                    )
                }
            />

            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <EliteKPICard title="Pendientes" value={kpiPendiente} icon={Clock} color="amber" subtitle="En espera" />
                <EliteKPICard title="En Ruta" value={kpiEnRuta} icon={Truck} color="violet" subtitle="En tránsito" />
                <EliteKPICard title="Entregadas" value={kpiEntregado} icon={CheckCircle2} color="emerald" subtitle="Completadas" />
                <EliteKPICard
                    title="Monto Total"
                    value={`$${kpiTotal.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    icon={TrendingUp}
                    color="indigo"
                    subtitle="Pipeline logístico"
                />
            </div>

            {/* Baremo notice */}
            <div className="bg-primary/5 border border-primary/15 rounded-2xl px-5 py-3 flex items-center gap-3">
                <Info className="h-4 w-4 text-primary flex-shrink-0" />
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                    Al crear una transferencia, el sistema consulta el <strong className="text-primary">Baremo de Droguerías</strong> por cada producto y selecciona automáticamente la droguería con el mejor precio. El precio queda <strong className="text-primary">congelado</strong> al momento del pedido.
                </p>
            </div>

            {/* Filters */}
            <Card className="border-border/40 bg-card rounded-2xl shadow-sm">
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                            <Input
                                placeholder="Buscar por farmacia o N° de orden..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="h-11 pl-10 bg-muted/20 border-none rounded-xl font-semibold text-xs shadow-inner text-foreground"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="h-11 w-full md:w-52 bg-muted/20 border-none rounded-xl font-bold text-xs text-muted-foreground shadow-inner">
                                <SelectValue placeholder="Estado" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-border/40 bg-card font-bold text-xs">
                                <SelectItem value="all">Todos los estados</SelectItem>
                                {Object.entries(STATUS_CFG).map(([k, v]) => (
                                    <SelectItem key={k} value={k}>{v.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button
                            variant="outline"
                            onClick={loadOrders}
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
                                icon={Truck}
                                title="Sin órdenes de transferencia"
                                subtitle={canEdit ? "Registra el primer pedido de farmacia con selección multi-droguería." : "No hay órdenes disponibles."}
                                actionLabel={canEdit ? "Nueva Transferencia" : undefined}
                                onAction={canEdit ? () => { resetForm(); setFormOpen(true); } : undefined}
                            />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader className="bg-muted/5">
                                <TableRow className="hover:bg-transparent border-border/40 h-16">
                                    <TableHead className="pl-8 text-[11px] font-black uppercase tracking-wider text-muted-foreground">N° Orden</TableHead>
                                    <TableHead className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">Farmacia Solicitante</TableHead>
                                    <TableHead className="text-[11px] font-black uppercase tracking-wider text-muted-foreground text-right">Total</TableHead>
                                    <TableHead className="text-[11px] font-black uppercase tracking-wider text-muted-foreground text-center">Estado</TableHead>
                                    <TableHead className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">Fecha</TableHead>
                                    <TableHead className="text-right pr-8 text-[11px] font-black uppercase tracking-wider text-muted-foreground">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map(o => (
                                    <TableRow
                                        key={o.id}
                                        className="hover:bg-muted/5 transition-all border-border/40 group h-20 cursor-pointer"
                                        onClick={() => { setSelectedOrder(o); setDetailOpen(true); }}
                                    >
                                        <TableCell className="pl-8">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                                                <span className="font-black text-xs text-foreground group-hover:text-primary transition-colors">
                                                    {o.order_number || o.id.slice(0, 8).toUpperCase()}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Store className="h-3.5 w-3.5 text-primary/50 flex-shrink-0" />
                                                <div className="flex flex-col">
                                                    <span className="font-black text-xs text-muted-foreground uppercase">{o.contact?.name || "—"}</span>
                                                    {o.contact?.city && <span className="text-[9px] font-bold text-muted-foreground/50 uppercase">{o.contact.city}</span>}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <span className="font-black text-sm text-foreground tabular-nums">
                                                ${(o.total || 0).toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <StatusBadge status={o.status} />
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase">
                                                {new Date(o.order_date || o.created_at).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" })}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right pr-8" onClick={e => e.stopPropagation()}>
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button
                                                    variant="ghost" size="icon"
                                                    onClick={() => { setSelectedOrder(o); setDetailOpen(true); }}
                                                    className="h-9 w-9 rounded-xl hover:bg-primary/10 hover:text-primary transition-all"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </ScrollArea>
            </Card>

            {/* Footer */}
            <div className="flex items-center justify-between px-4 text-muted-foreground/40">
                <div className="flex items-center gap-3">
                    <Activity className="h-3.5 w-3.5 text-primary" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">MediVisitPro Platform</span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Canal Multi-Droguería Activo</span>
            </div>

            {/* ============================================================
                CREATE TRANSFER ORDER DIALOG
                ============================================================ */}
            <Dialog open={formOpen} onOpenChange={v => !saving && setFormOpen(v)}>
                <DialogContent aria-describedby={undefined} className="max-w-3xl bg-card border-border/40 rounded-[2rem] shadow-premium-2xl font-display p-0 overflow-hidden max-h-[92vh] flex flex-col">
                    <DialogHeader className="p-8 border-b border-border/40 bg-muted/5 flex-shrink-0">
                        <DialogTitle className="text-2xl font-black text-foreground uppercase tracking-tighter flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                                <Truck className="h-5 w-5 text-primary" />
                            </div>
                            Nueva Transferencia
                        </DialogTitle>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1 ml-14">
                            Cada producto puede ser despachado por una droguería diferente según el baremo
                        </p>
                    </DialogHeader>

                    <ScrollArea className="flex-1 overflow-y-auto">
                        <div className="p-8 space-y-6">
                            {/* Pharmacy */}
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                    <Store className="h-3.5 w-3.5 inline mr-1.5 text-primary/60" />
                                    Farmacia Solicitante *
                                </Label>
                                <Select value={fPharmacy} onValueChange={setFPharmacy}>
                                    <SelectTrigger className="h-12 bg-muted/20 border-none rounded-xl font-bold text-xs text-foreground shadow-inner">
                                        <SelectValue placeholder="Seleccionar farmacia..." />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-border/40 bg-card font-bold text-xs max-h-52">
                                        {pharmacies.length === 0 ? (
                                            <SelectItem value="none" disabled>Sin farmacias registradas</SelectItem>
                                        ) : pharmacies.map(p => (
                                            <SelectItem key={p.id} value={p.id}>{p.name}{p.city ? ` · ${p.city}` : ""}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <Separator className="border-border/40" />

                            {/* Line Items - Multi-Drugstore */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                            <Package className="h-3.5 w-3.5 inline mr-1.5 text-primary/60" />
                                            Líneas de Producto ({fLines.length})
                                        </Label>
                                        <p className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-wider mt-0.5">
                                            El baremo auto-selecciona la droguería con mejor precio
                                        </p>
                                    </div>
                                    <Button
                                        variant="outline" size="sm"
                                        onClick={addLine}
                                        className="h-8 px-4 border-primary/30 text-primary rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-primary/10 flex items-center gap-1.5"
                                    >
                                        <Plus className="h-3.5 w-3.5" /> Añadir Línea
                                    </Button>
                                </div>

                                {/* Column headers */}
                                <div className="grid grid-cols-[2fr_1fr_2fr_1fr_auto] gap-2 px-1">
                                    {["Producto", "Cant.", "Droguería Despachadora", "Precio Fijado", ""].map(h => (
                                        <p key={h} className="text-[9px] font-black text-muted-foreground/50 uppercase tracking-widest">{h}</p>
                                    ))}
                                </div>

                                {/* Lines */}
                                {fLines.map((line, idx) => {
                                    const lineTotal = line.precio_fijado * line.quantity;
                                    return (
                                        <div
                                            key={line.id}
                                            className={cn(
                                                "grid grid-cols-[2fr_1fr_2fr_1fr_auto] gap-2 items-center p-3 rounded-2xl border transition-all",
                                                line.drugstore_id && line.baremo_options.find(o => o.drugstore_id === line.drugstore_id)?.is_best
                                                    ? "bg-emerald-500/5 border-emerald-500/20"
                                                    : "bg-muted/5 border-border/40"
                                            )}
                                        >
                                            {/* Product */}
                                            <Select value={line.product_id} onValueChange={v => handleProductSelect(line.id, v)}>
                                                <SelectTrigger className="h-10 bg-muted/20 border-none rounded-xl font-bold text-xs text-foreground shadow-inner">
                                                    <SelectValue placeholder="Producto..." />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl border-border/40 bg-card font-bold text-xs max-h-48">
                                                    {products.map(p => (
                                                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>

                                            {/* Quantity */}
                                            <Input
                                                type="number" min="1"
                                                value={line.quantity}
                                                onChange={e => setFLines(prev => prev.map(l => l.id === line.id ? { ...l, quantity: parseInt(e.target.value) || 1 } : l))}
                                                className="h-10 bg-muted/20 border-none rounded-xl font-bold text-sm text-foreground shadow-inner text-center"
                                            />

                                            {/* Drugstore selector (popover with baremo) */}
                                            <DrugstoreSelector
                                                lineId={line.id}
                                                productId={line.product_id}
                                                baremoOptions={line.baremo_options}
                                                loadingBaremo={line.loading_baremo}
                                                selectedDrugstoreId={line.drugstore_id}
                                                onSelect={(dId, dName, price) => handleDrugstoreSelect(line.id, dId, dName, price)}
                                            />

                                            {/* Frozen price */}
                                            <div className="text-right">
                                                <p className={cn(
                                                    "font-black text-sm tabular-nums",
                                                    line.drugstore_id ? "text-foreground" : "text-muted-foreground/30"
                                                )}>
                                                    ${lineTotal.toFixed(2)}
                                                </p>
                                                {line.precio_fijado > 0 && (
                                                    <p className="text-[9px] font-bold text-muted-foreground/50">${line.precio_fijado.toFixed(2)}/u</p>
                                                )}
                                            </div>

                                            {/* Remove */}
                                            <Button
                                                variant="ghost" size="icon"
                                                onClick={() => removeLine(line.id)}
                                                disabled={fLines.length === 1}
                                                className="h-9 w-9 rounded-xl hover:bg-rose-500/10 hover:text-rose-500 transition-all flex-shrink-0"
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    );
                                })}

                                {/* Grand total */}
                                <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex items-center justify-between mt-2">
                                    <div>
                                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Total Transferencia</span>
                                        <p className="text-[9px] font-bold text-muted-foreground/50 uppercase">{fLines.filter(l => l.drugstore_id).length} líneas · precios congelados del baremo</p>
                                    </div>
                                    <span className="font-black text-2xl text-primary tabular-nums">${formTotal.toFixed(2)}</span>
                                </div>
                            </div>

                            <Separator className="border-border/40" />

                            {/* Notes */}
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Observaciones</Label>
                                <Textarea
                                    value={fNotes}
                                    onChange={e => setFNotes(e.target.value)}
                                    placeholder="Notas del representante, instrucciones de despacho..."
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
                            className="h-12 px-6 rounded-xl font-black uppercase text-[10px] tracking-widest border-border/40"
                        >
                            <X className="h-4 w-4 mr-2" /> Cancelar
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex-1 h-12 px-8 rounded-xl font-black uppercase text-[10px] tracking-widest bg-primary hover:bg-primary/90 text-white shadow-premium-md flex items-center justify-center gap-2 active:scale-95 transition-all"
                        >
                            {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Truck className="h-4 w-4" />}
                            Registrar Orden de Transferencia
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Detail Dialog */}
            <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
                <DialogContent aria-describedby={undefined} className="max-w-lg bg-card border-border/40 rounded-[2rem] shadow-premium-2xl font-display p-0 overflow-hidden">
                    {selectedOrder && (
                        <>
                            <DialogHeader className="p-8 border-b border-border/40 bg-muted/5">
                                <DialogTitle className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                                        <Truck className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-foreground uppercase tracking-tighter leading-none">
                                            {selectedOrder.order_number || selectedOrder.id.slice(0, 8).toUpperCase()}
                                        </h2>
                                        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-70 mt-0.5">
                                            {selectedOrder.contact?.name}
                                        </p>
                                    </div>
                                    <div className="ml-auto"><StatusBadge status={selectedOrder.status} /></div>
                                </DialogTitle>
                            </DialogHeader>
                            <div className="p-8 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-muted/10 rounded-2xl p-5 border border-border/40">
                                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Fecha</p>
                                        <p className="font-black text-sm text-foreground">
                                            {new Date(selectedOrder.order_date || selectedOrder.created_at).toLocaleDateString("es-ES")}
                                        </p>
                                    </div>
                                    <div className="bg-muted/10 rounded-2xl p-5 border border-border/40">
                                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Total</p>
                                        <p className="font-black text-2xl text-primary tabular-nums">
                                            ${(selectedOrder.total || 0).toLocaleString("es-VE", { minimumFractionDigits: 2 })}
                                        </p>
                                    </div>
                                </div>
                                {selectedOrder.notes && (
                                    <div className="bg-muted/10 rounded-2xl p-5 border border-border/40">
                                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Observaciones</p>
                                        <p className="text-xs font-bold text-muted-foreground">{selectedOrder.notes}</p>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
