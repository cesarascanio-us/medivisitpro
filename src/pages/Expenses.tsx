import { useState, useEffect } from "react";
import { InstructionCard } from "@/components/ui/InstructionCard";
import { Plus, DollarSign, TrendingUp, Calendar, Receipt, Download, Filter, CheckCircle2, XCircle, Lightbulb, MapPin, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { AdminDataFilter } from "@/components/admin/AdminDataFilter";
import { EliteHeader, EliteKPICard, EliteTable } from "@/components/layout/DesignSystem";
import { cn } from "@/lib/utils";

interface AdminFilterState {
    region?: string;
    state?: string;
    zoneId?: string;
    userId?: string;
}

interface Expense {
    id: string;
    category: string;
    subcategory: string | null;
    amount: number;
    currency: string;
    expense_date: string;
    description: string | null;
    vendor: string | null;
    status: string;
}

const EXPENSE_CATEGORIES = [
    { value: "trans", label: "Transporte / KM", icon: "🚗" },
    { value: "meals", label: "Alimentación", icon: "🍽️" },
    { value: "lodging", label: "Hospedaje", icon: "🏨" },
    { value: "custom", label: "Nueva Categoría...", icon: "➕" }
];

export default function Expenses() {
    const { user, isAdmin, isManager, organizationId, isSupervisor, canViewAllData, zoneId, organizationName } = useAuth();
    const { toast } = useToast();
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [filterCategory, setFilterCategory] = useState<string>("all");
    const [adminFilters, setAdminFilters] = useState<AdminFilterState>({});

    const [formData, setFormData] = useState({
        category: "trans",
        custom_category: "",
        amount: 0,
        expense_date: new Date().toISOString().split('T')[0],
        description: "",
        vendor: "",
        start_km: "",
        end_km: "",
        has_pernocta: false
    });

    const [files, setFiles] = useState<{
        receipt?: File;
        km_start?: File;
        km_end?: File;
    }>({});

    useEffect(() => {
        if (user) loadExpenses();
    }, [user, adminFilters]);

    const loadExpenses = async () => {
        try {
            setLoading(true);
            let query: any = supabase
                .from('expenses')
                .select('*');

            if (isSupervisor && zoneId) {
                query = query.eq('zone_id', zoneId);
                if (adminFilters.userId && adminFilters.userId !== 'all') {
                    query = query.eq('user_id', adminFilters.userId);
                }
            } else if (!canViewAllData) {
                query = query.eq('user_id', user?.id);
            } else if (canViewAllData) {
                if (adminFilters.region && adminFilters.region !== 'all') {
                    query = query.eq('region', adminFilters.region);
                }
                if (adminFilters.state && adminFilters.state !== 'all') {
                    query = query.eq('state', adminFilters.state);
                }
                if (adminFilters.zoneId && adminFilters.zoneId !== 'all') {
                    query = query.eq('zone_id', adminFilters.zoneId);
                }
                if (adminFilters.userId && adminFilters.userId !== 'all') {
                    query = query.eq('user_id', adminFilters.userId);
                }
            }

            const { data, error } = await query.order('expense_date', { ascending: false });

            if (error) throw error;
            setExpenses(data || []);
        } catch (error) {
            console.error('Error loading expenses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!user || formData.amount <= 0) {
            toast({
                title: "Inconsistencia de Datos",
                description: "Por favor verifique los campos obligatorios.",
                variant: "destructive"
            });
            return;
        }

        try {
            const finalCategory = formData.category === 'custom' ? formData.custom_category : formData.category;

            if (formData.category === 'trans') {
                if (!formData.start_km || !formData.end_km || !files.km_start || !files.km_end) {
                    toast({
                        title: "Protocolo de Evidencia",
                        description: "El reporte de transporte requiere registro de kilometraje y soporte visual.",
                        variant: "destructive"
                    });
                    return;
                }
            }

            let receiptUrl = null;

            const uploadFile = async (file: File, bucket: string) => {
                const fileExt = file.name.split('.').pop();
                const fileName = `${user.id}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
                const { error: uploadError } = await supabase.storage.from(bucket).upload(fileName, file);
                if (uploadError) throw uploadError;
                const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(fileName);
                return publicUrl;
            };

            if (files.receipt) receiptUrl = await uploadFile(files.receipt, 'receipts');

            let kmStartUrl = null;
            let kmEndUrl = null;

            if (formData.category === 'trans') {
                if (files.km_start) kmStartUrl = await uploadFile(files.km_start, 'receipts');
                if (files.km_end) kmEndUrl = await uploadFile(files.km_end, 'receipts');
            }

            const { error } = await supabase.from('expenses').insert({
                user_id: user.id,
                category: finalCategory,
                amount: formData.amount,
                expense_date: formData.expense_date,
                description: formData.description || (formData.category === 'trans' ? `Logística de KM: ${formData.start_km} a ${formData.end_km}` : null),
                vendor: formData.vendor || null,
                status: 'pending',
                currency: 'USD',
                organization_id: organizationId,
                receipt_url: receiptUrl,
                start_km: formData.category === 'trans' ? Number(formData.start_km) : null,
                end_km: formData.category === 'trans' ? Number(formData.end_km) : null,
                km_start_url: kmStartUrl,
                km_end_url: kmEndUrl,
                zone_id: (user as any).user_metadata?.zone_id || null
            } as any);

            if (error) throw error;

            toast({ title: "Gasto Transmitido", description: "El reporte ha sido enviado a la matriz para su validación." });
            setDialogOpen(false);
            setFormData({
                category: "trans",
                custom_category: "",
                amount: 0,
                expense_date: new Date().toISOString().split('T')[0],
                description: "",
                vendor: "",
                start_km: "",
                end_km: "",
                has_pernocta: false
            });
            setFiles({});
            loadExpenses();
        } catch (error) {
            toast({ title: "Fallo de Transmisión", description: "No se pudo consolidar el registro de gasto.", variant: "destructive" });
        }
    };

    const updateExpenseStatus = async (expenseId: string, status: string) => {
        try {
            const { error } = await supabase
                .from('expenses')
                .update({ status })
                .eq('id', expenseId);

            if (error) throw error;

            toast({
                title: status === 'approved' ? "Validación Positiva" : "Registro Rechazado",
                description: `El estatus del reporte ha sido actualizado en la base central.`
            });
            loadExpenses();
        } catch (error) {
            toast({
                title: "Error de Auditoría",
                description: "No se pudo alterar el estado del registro.",
                variant: "destructive"
            });
        }
    };

    const getCategoryInfo = (cat: string) => {
        const found = EXPENSE_CATEGORIES.find(c => c.value === cat);
        if (found) return found;
        return { value: cat, label: cat, icon: "📋" };
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            pending: "bg-amber-500/10 text-amber-500 border-amber-500/20",
            approved: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
            rejected: "bg-rose-500/10 text-rose-500 border-rose-500/20",
            reimbursed: "bg-blue-500/10 text-blue-500 border-blue-500/20"
        };
        const labels: Record<string, string> = {
            pending: "PENDIENTE",
            approved: "VALIDADO",
            rejected: "RECHAZADO",
            reimbursed: "REEMBOLSADO"
        };
        return <Badge className={cn("font-black text-[9px] uppercase tracking-widest px-3 py-1 border", styles[status] || "bg-muted")}>{labels[status] || status}</Badge>;
    };

    const filteredExpenses = filterCategory === "all"
        ? expenses
        : expenses.filter(e => e.category === filterCategory);

    const totalExpenses = expenses.reduce((acc, e) => acc + Number(e.amount), 0);
    const pendingExpenses = expenses.filter(e => e.status === 'pending').reduce((acc, e) => acc + Number(e.amount), 0);
    const thisMonthExpenses = expenses
        .filter(e => new Date(e.expense_date).getMonth() === new Date().getMonth())
        .reduce((acc, e) => acc + Number(e.amount), 0);

    const exportToCSV = () => {
        const headers = ["Fecha", "Categoría", "Monto", "Proveedor", "Descripción", "Estado"];
        const rows = expenses.map(e => [
            e.expense_date,
            getCategoryInfo(e.category).label,
            e.amount,
            e.vendor || "",
            e.description || "",
            e.status
        ]);

        const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `reporte_gastos_${new Date().toISOString().split('T')[0]}.csv`);
        link.click();
    };

    const [showHelp, setShowHelp] = useState(false);

    return (
        <div className="flex flex-col min-h-full space-y-10 font-display animate-in fade-in duration-700 text-foreground pb-20">
            
            <EliteHeader 
                title="Gastos Operativos"
                subtitle={organizationName || "Control de Recursos Biofarco"}
                icon={Receipt}
                badgeText="Logística Financiera"
                statusText="Auditoría Activa"
                statusColor="bg-primary"
                rightContent={
                    <div className="flex items-center gap-4">
                        <Button variant="outline" onClick={exportToCSV} className="bg-muted/10 border-border/40 rounded-2xl h-14 px-8 font-black uppercase tracking-widest text-[10px] shadow-inner hover:bg-muted/20 transition-all">
                            <Download className="mr-3 h-4 w-4" /> Exportar Inteligencia
                        </Button>
                        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-primary hover:bg-primary/90 text-white rounded-2xl h-14 px-10 font-black uppercase tracking-widest text-[10px] shadow-premium-md transition-all active:scale-95">
                                    <Plus className="mr-3 h-4 w-4" /> Registrar Movimiento
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[500px] rounded-[3rem] border-border/40 shadow-premium-2xl p-0 overflow-hidden bg-card max-h-[90vh] flex flex-col">
                                <DialogHeader className="bg-muted/20 p-10 pb-8 border-b border-border/40 relative shrink-0">
                                    <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                                    <DialogTitle className="text-3xl font-black text-foreground tracking-tighter uppercase mb-2 font-display">Declarar Gasto</DialogTitle>
                                    <DialogDescription className="text-muted-foreground font-black text-[10px] uppercase tracking-widest opacity-70">
                                        Transmisión de comprobantes para validación administrativa.
                                    </DialogDescription>
                                </DialogHeader>
                                
                                <Tabs defaultValue="basico" className="flex-1 flex flex-col w-full min-h-0">
                                    <div className="px-10 pt-4 pb-2 border-b border-border/40 shrink-0 bg-background">
                                        <TabsList className="w-full grid grid-cols-2 bg-muted/50 p-1 rounded-xl">
                                            <TabsTrigger value="basico" className="rounded-lg font-bold text-[11px] uppercase tracking-wider">
                                                Datos Básicos
                                            </TabsTrigger>
                                            <TabsTrigger value="detalles" className="rounded-lg font-bold text-[11px] uppercase tracking-wider">
                                                Detalles & Soporte
                                            </TabsTrigger>
                                        </TabsList>
                                    </div>
                                    <div className="px-10 py-6 overflow-y-auto custom-scrollbar flex-1 bg-card">
                                        <TabsContent value="basico" className="m-0 space-y-6 mt-0 animate-in fade-in slide-in-from-right-2">
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Clasificación de Recurso *</Label>
                                        <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                                            <SelectTrigger className="h-14 bg-muted/20 border-border/40 rounded-2xl font-black uppercase text-xs px-6 shadow-inner">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-2xl border-border/40 bg-card">
                                                {EXPENSE_CATEGORIES.map(cat => (
                                                    <SelectItem key={cat.value} value={cat.value} className="font-black uppercase text-[10px] tracking-widest py-3">
                                                        <span className="mr-2">{cat.icon}</span> {cat.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {formData.category === 'custom' && (
                                        <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Identificador de Categoría *</Label>
                                            <Input
                                                value={formData.custom_category}
                                                onChange={(e) => setFormData({ ...formData, custom_category: e.target.value })}
                                                placeholder="EJ: MANTENIMIENTO, EVENTOS, ETC."
                                                className="h-14 bg-muted/20 border-border/40 rounded-2xl font-black uppercase text-xs px-6 shadow-inner"
                                            />
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Monto (USD) *</Label>
                                            <div className="relative">
                                                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    value={formData.amount}
                                                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                                                    placeholder="0.00"
                                                    className="pl-12 h-14 bg-muted/20 border-border/40 rounded-2xl font-black text-base px-6 shadow-inner"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Fecha Operativa *</Label>
                                            <Input
                                                type="date"
                                                value={formData.expense_date}
                                                onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                                                className="h-14 bg-muted/20 border-border/40 rounded-2xl font-black uppercase text-xs px-6 shadow-inner"
                                            />
                                        </div>
                                    </div>

                                    {formData.category === 'trans' && (
                                        <div className="p-6 bg-primary/5 rounded-[2.5rem] border border-dashed border-primary/20 space-y-6 animate-in zoom-in-95 duration-300">
                                            <div className="flex items-center gap-3 text-primary mb-2">
                                                <TrendingUp className="h-4 w-4" />
                                                <h4 className="text-[10px] font-black uppercase tracking-widest">Protocolo de Kilometraje</h4>
                                            </div>
                                            <div className="grid grid-cols-2 gap-6">
                                                <div className="space-y-4">
                                                    <Label className="text-[9px] font-black uppercase text-muted-foreground ml-1">KM Inicial</Label>
                                                    <Input
                                                        type="number"
                                                        value={formData.start_km}
                                                        onChange={(e) => setFormData({ ...formData, start_km: e.target.value })}
                                                        placeholder="0000"
                                                        className="h-10 bg-card border-border/40 rounded-xl font-black text-xs shadow-sm"
                                                    />
                                                    <Label className="text-[9px] font-black uppercase text-primary/60 cursor-pointer hover:text-primary flex items-center gap-2 px-1">
                                                        <Receipt className="h-3 w-3" /> Soporte Inicio
                                                        <Input type="file" className="hidden" onChange={(e) => setFiles({ ...files, km_start: e.target.files?.[0] })} />
                                                    </Label>
                                                </div>
                                                <div className="space-y-4">
                                                    <Label className="text-[9px] font-black uppercase text-muted-foreground ml-1">KM Final</Label>
                                                    <Input
                                                        type="number"
                                                        value={formData.end_km}
                                                        onChange={(e) => setFormData({ ...formData, end_km: e.target.value })}
                                                        placeholder="0000"
                                                        className="h-10 bg-card border-border/40 rounded-xl font-black text-xs shadow-sm"
                                                    />
                                                    <Label className="text-[9px] font-black uppercase text-primary/60 cursor-pointer hover:text-primary flex items-center gap-2 px-1">
                                                        <Receipt className="h-3 w-3" /> Soporte Final
                                                        <Input type="file" className="hidden" onChange={(e) => setFiles({ ...files, km_end: e.target.files?.[0] })} />
                                                    </Label>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                        </TabsContent>
                                        <TabsContent value="detalles" className="m-0 space-y-6 mt-0 animate-in fade-in slide-in-from-right-2">
                                            <div className="space-y-4">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Detalles de Operación</Label>
                                        <Input
                                            value={formData.vendor}
                                            onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                                            placeholder={formData.category === 'trans' ? "ESTACIÓN DE SERVICIO / RUTA" : "ESTABLECIMIENTO / PROVEEDOR"}
                                            className="h-14 bg-muted/20 border-border/40 rounded-2xl font-black uppercase text-xs px-6 shadow-inner"
                                        />
                                        <Textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            placeholder="MOTIVO DEL DESPLIEGUE O DETALLES DE LA RUTA..."
                                            className="bg-muted/20 border-border/40 rounded-2xl font-black uppercase text-xs p-6 shadow-inner min-h-[100px]"
                                        />
                                        <div className="pt-2">
                                            <Label className="text-[10px] font-black uppercase text-muted-foreground mb-3 block ml-1">Soporte Documental (Factura)</Label>
                                            <div className="relative group">
                                                <Input
                                                    type="file"
                                                    className="h-14 text-[10px] font-black uppercase border-dashed border-border/40 bg-muted/10 text-foreground file:bg-primary file:text-white file:border-none file:rounded-xl file:px-4 file:h-8 file:mr-4 file:font-black file:uppercase file:text-[9px] cursor-pointer"
                                                    onChange={(e) => setFiles({ ...files, receipt: e.target.files?.[0] })}
                                                />
                                            </div>
                                        </div>
                                            </div>
                                        </TabsContent>
                                    </div>
                                </Tabs>
                                <div className="bg-muted/10 border-t border-border/40 px-10 py-6 flex gap-4 shrink-0">
                                    <Button variant="outline" onClick={() => setDialogOpen(false)} className="h-14 px-8 rounded-2xl font-black uppercase text-[10px] tracking-widest border-border/40">
                                        Abortar
                                    </Button>
                                    <Button onClick={handleSubmit} className="flex-1 bg-primary hover:bg-primary/90 text-white font-black h-14 rounded-2xl shadow-premium-md transition-all active:scale-95 uppercase text-[10px] tracking-widest">
                                        Finalizar Transmisión
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                }
            />

            <AdminDataFilter onFilterChange={setAdminFilters} moduleType="contacts" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <EliteKPICard
                    title="Despliegue Mensual"
                    value={`$${thisMonthExpenses.toFixed(2)}`}
                    subtitle="Recursos ejecutados (MTD)"
                    icon={Calendar}
                    trend={15}
                    color="blue"
                />
                <EliteKPICard
                    title="En Revisión"
                    value={`$${pendingExpenses.toFixed(2)}`}
                    subtitle="Pendientes de validación"
                    icon={Clock}
                    trend={-5}
                    color="indigo"
                />
                <EliteKPICard
                    title="Total Histórico"
                    value={`$${totalExpenses.toFixed(2)}`}
                    subtitle="Acumulado operacional"
                    icon={DollarSign}
                    trend={8}
                    color="emerald"
                />
            </div>

            <EliteTable 
                title="Detalle de Movimientos Financieros"
                description="Listado exhaustivo de gastos operativos reportados por la fuerza de ventas."
                searchPlaceholder="FILTRAR POR PROVEEDOR O CATEGORÍA..."
                onSearch={() => {}}
                rightContent={
                    <Select value={filterCategory} onValueChange={setFilterCategory}>
                        <SelectTrigger className="w-64 h-12 bg-muted/20 border-border/40 rounded-xl font-black uppercase text-[10px] px-5 shadow-inner">
                            <div className="flex items-center gap-3">
                                <Filter className="h-3.5 w-3.5 text-primary" />
                                <SelectValue placeholder="Filtrar Categoría" />
                            </div>
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-border/40 bg-card">
                            <SelectItem value="all" className="font-black uppercase text-[10px] tracking-widest py-3">Todas las categorías</SelectItem>
                            {EXPENSE_CATEGORIES.map(cat => (
                                <SelectItem key={cat.value} value={cat.value} className="font-black uppercase text-[10px] tracking-widest py-3">
                                    {cat.icon} {cat.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                }
            >
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent border-border/40">
                            <TableHead className="text-[10px] font-black uppercase tracking-widest py-6 pl-8">Fecha Operativa</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest py-6">Eje de Recurso</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest py-6">Propósito / Detalle</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest py-6">Proveedor</TableHead>
                            <TableHead className="text-right text-[10px] font-black uppercase tracking-widest py-6">Importe (USD)</TableHead>
                            <TableHead className="text-center text-[10px] font-black uppercase tracking-widest py-6">Auditoría</TableHead>
                            {isManager && <TableHead className="text-right text-[10px] font-black uppercase tracking-widest py-6 pr-8">Control</TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            [1,2,3,4,5].map(i => (
                                <TableRow key={i} className="animate-pulse border-border/40">
                                    <TableCell colSpan={7} className="h-16 py-8">
                                        <div className="h-4 bg-muted/20 rounded-full w-full"></div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : filteredExpenses.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-40 text-center text-muted-foreground font-black uppercase text-[10px] tracking-widest">
                                    No se han detectado movimientos financieros en este cuadrante.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredExpenses.map((expense) => {
                                const catInfo = getCategoryInfo(expense.category);
                                return (
                                    <TableRow key={expense.id} className="hover:bg-muted/5 transition-colors border-border/40 group">
                                        <TableCell className="pl-8 py-8 font-black text-foreground uppercase tracking-tight text-base">
                                            {new Date(expense.expense_date).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="bg-muted/10 border-border/40 text-foreground font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-lg shadow-inner">
                                                <span className="mr-2">{catInfo.icon}</span>
                                                {catInfo.label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="max-w-[200px]">
                                            <div className="truncate text-muted-foreground font-bold text-[11px] uppercase tracking-wide">
                                                {expense.description || <span className="opacity-20 italic">SIN ESPECIFICACIÓN</span>}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-foreground font-black text-[11px] uppercase tracking-widest">{expense.vendor || '-'}</TableCell>
                                        <TableCell className="text-right font-black text-foreground text-xl tracking-tighter">
                                            ${Number(expense.amount).toFixed(2)}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {getStatusBadge(expense.status)}
                                        </TableCell>
                                        {isManager && (
                                            <TableCell className="text-right pr-8 py-8">
                                                {expense.status === 'pending' && (
                                                    <div className="flex justify-end gap-3">
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="h-12 w-12 text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-2xl border border-transparent hover:border-emerald-500/20 shadow-inner"
                                                            onClick={() => updateExpenseStatus(expense.id, 'approved')}
                                                        >
                                                            <CheckCircle2 className="h-5 w-5" />
                                                        </Button>
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="h-12 w-12 text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-2xl border border-transparent hover:border-rose-500/20 shadow-inner"
                                                            onClick={() => updateExpenseStatus(expense.id, 'rejected')}
                                                        >
                                                            <XCircle className="h-5 w-5" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </TableCell>
                                        )}
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </EliteTable>
        </div>
    );
}
