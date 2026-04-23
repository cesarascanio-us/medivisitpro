/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import { useState, useEffect } from "react";
import { InstructionCard } from "@/components/ui/InstructionCard";
import { Plus, DollarSign, TrendingUp, Calendar, Receipt, Download, Filter, CheckCircle2, XCircle } from "lucide-react";
import { Lightbulb, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    const { user, profile, isAdmin, isManager, isSaaSStaff, organizationId, isSupervisor, canViewAllData, zoneId } = useAuth();
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
                .select('*, profiles(first_name, last_name)');

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
                title: "Error",
                description: "Por favor complete los campos obligatorios.",
                variant: "destructive"
            });
            return;
        }

        if (formData.category === 'custom' && !formData.custom_category) {
            toast({
                title: "Campo requerido",
                description: "Indique el nombre de la nueva categoría.",
                variant: "destructive"
            });
            return;
        }

        try {
            const finalCategory = formData.category === 'custom' ? formData.custom_category : formData.category;

            // Biofarco Validation for Transport
            if (formData.category === 'trans') {
                if (!formData.start_km || !formData.end_km || !files.km_start || !files.km_end) {
                    toast({
                        title: "Evidencia Obligatoria",
                        description: "Debe registrar kilometraje y fotos (cluster) para reportes de transporte.",
                        variant: "destructive"
                    });
                    return;
                }
            }

            let receiptUrl = null;

            // Handle file uploads if any
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

            toast({ title: "Gasto registrado", description: "El gasto ha sido guardado para revisión." });
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
            toast({ title: "Error", description: "No se pudo registrar el gasto.", variant: "destructive" });
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
                title: status === 'approved' ? "Gasto aprobado" : "Gasto rechazado",
                description: `El estado del gasto ha sido actualizado a ${status === 'approved' ? 'aprobado' : 'rechazado'}.`
            });
            loadExpenses();
        } catch (error) {
            console.error('Error updating expense status:', error);
            toast({
                title: "Error",
                description: "No se pudo actualizar el estado del gasto.",
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
            pending: "bg-yellow-100 text-yellow-800",
            approved: "bg-green-100 text-green-800",
            rejected: "bg-red-100 text-red-800",
            reimbursed: "bg-blue-100 text-blue-800"
        };
        const labels: Record<string, string> = {
            pending: "Pendiente",
            approved: "Aprobado",
            rejected: "Rechazado",
            reimbursed: "Reembolsado"
        };
        return <Badge className={styles[status] || "bg-muted"}>{labels[status] || status}</Badge>;
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
        link.setAttribute("download", `gastos_${new Date().toISOString().split('T')[0]}.csv`);
        link.click();
    };

    const [showHelp, setShowHelp] = useState(false);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter text-slate-900">Gastos y Presupuestos</h1>
                    <p className="text-slate-500 font-medium ">Gestión inteligente de recursos operativos de Biofarco</p>
                </div>
            </div>

            {/* Admin Filters */}
            <AdminDataFilter onFilterChange={setAdminFilters} moduleType="contacts" />

            <div className="flex gap-2 justify-end">
                <Button variant="ghost" size="icon" onClick={() => setShowHelp(!showHelp)} title="Ver Ayuda">
                    <span className="sr-only">Ayuda</span>
                    <Lightbulb className="h-5 w-5 text-yellow-500" />
                </Button>
                <Button variant="outline" onClick={exportToCSV} className="border-slate-200">
                    <Download className="mr-2 h-4 w-4" /> Exportar
                </Button>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-200">
                            <Plus className="mr-2 h-4 w-4" /> Nuevo Gasto
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md border-none shadow-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-black tracking-tight text-slate-900 border-l-4 border-slate-900 pl-4">Registrar Gasto</DialogTitle>
                            <DialogDescription className="text-slate-500 pl-4 ">
                                Ingrese los detalles del comprobante para su validación administrativa.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label className="text-slate-700 font-bold">Categoría *</Label>
                                <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                                    <SelectTrigger className="border-slate-200 focus:ring-slate-900"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {EXPENSE_CATEGORIES.map(cat => (
                                            <SelectItem key={cat.value} value={cat.value}>
                                                <span className="mr-2">{cat.icon}</span> {cat.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {formData.category === 'custom' && (
                                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                    <Label className="text-slate-700 font-bold">Nombre de Categoría Personalizada *</Label>
                                    <Input
                                        value={formData.custom_category}
                                        onChange={(e) => setFormData({ ...formData, custom_category: e.target.value })}
                                        placeholder="Ej: Mantenimiento, Eventos, etc."
                                        className="border-slate-200 focus:ring-slate-900"
                                    />
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-slate-700 font-bold">Monto (USD) *</Label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={formData.amount}
                                            onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                                            placeholder="0.00"
                                            className="pl-9 border-slate-200 focus:ring-slate-900"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-700 font-bold">Fecha *</Label>
                                    <Input
                                        type="date"
                                        value={formData.expense_date}
                                        onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                                        className="border-slate-200 focus:ring-slate-900"
                                    />
                                </div>
                            </div>

                            {/* Biofarco Specialized Transport Fields */}
                            {formData.category === 'trans' && (
                                <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 space-y-4 animate-in zoom-in-95 duration-300">
                                    <div className="flex items-center gap-2 text-slate-900 mb-2">
                                        <TrendingUp className="h-4 w-4" />
                                        <h4 className="text-xs font-black uppercase tracking-widest">Control de Kilometraje</h4>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-bold uppercase text-slate-500">KM Inicial</Label>
                                            <Input
                                                type="number"
                                                value={formData.start_km}
                                                onChange={(e) => setFormData({ ...formData, start_km: e.target.value })}
                                                placeholder="0000"
                                                className="h-10 border-slate-200"
                                            />
                                            <Label className="text-[10px] font-bold uppercase text-slate-400 cursor-pointer hover:text-slate-600 flex items-center gap-1">
                                                <Receipt className="h-3 w-3" /> Foto Inicio
                                                <Input type="file" className="hidden" onChange={(e) => setFiles({ ...files, km_start: e.target.files?.[0] })} />
                                            </Label>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-bold uppercase text-slate-500">KM Final</Label>
                                            <Input
                                                type="number"
                                                value={formData.end_km}
                                                onChange={(e) => setFormData({ ...formData, end_km: e.target.value })}
                                                placeholder="0000"
                                                className="h-10 border-slate-200"
                                            />
                                            <Label className="text-[10px] font-bold uppercase text-slate-400 cursor-pointer hover:text-slate-600 flex items-center gap-1">
                                                <Receipt className="h-3 w-3" /> Foto Final
                                                <Input type="file" className="hidden" onChange={(e) => setFiles({ ...files, km_end: e.target.files?.[0] })} />
                                            </Label>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label className="text-slate-700 font-bold text-xs uppercase tracking-wider">Información Adicional</Label>
                                <Input
                                    value={formData.vendor}
                                    onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                                    placeholder={formData.category === 'trans' ? "Estación de Servicio / Ruta" : "Establecimiento / Proveedor"}
                                    className="border-slate-200 focus:ring-slate-900"
                                />
                                <Textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Propósito del gasto o detalles de la ruta..."
                                    className="border-slate-200 focus:ring-slate-900 min-h-[80px]"
                                />
                                <div className="pt-2">
                                    <Label className="text-[10px] font-bold uppercase text-slate-500 mb-1 block">Adjuntar Factura / Comprobante</Label>
                                    <Input
                                        type="file"
                                        className="h-10 text-xs border-slate-100 bg-slate-50"
                                        onChange={(e) => setFiles({ ...files, receipt: e.target.files?.[0] })}
                                    />
                                </div>
                            </div>

                            <div className="pt-2">
                                <Button onClick={handleSubmit} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold h-12 shadow-lg shadow-slate-200 transition-all active:scale-95">
                                    Continuar con Registro
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {showHelp && (
                <InstructionCard
                    title="Control de Gastos"
                    description="Registra y monitorea tus gastos operativos."
                    items={[
                        "Registra cada gasto indicando categoría y monto.",
                        "Seleccione 'Nueva Categoría' si la opción no está listada.",
                        "Monitorea el estado de aprobación en la tabla inferior.",
                        "Use los filtros de administrador para ver gastos de otros miembros del equipo u operativos."
                    ]}
                />
            )}

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-none shadow-sm bg-indigo-50/30">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Gastos Este Mes</p>
                                <p className="text-3xl font-black text-indigo-950">${thisMonthExpenses.toFixed(2)}</p>
                            </div>
                            <Calendar className="h-10 w-10 text-indigo-200" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm bg-amber-50/30">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-amber-600 uppercase tracking-widest">En Revisión</p>
                                <p className="text-3xl font-black text-amber-950">${pendingExpenses.toFixed(2)}</p>
                            </div>
                            <Receipt className="h-10 w-10 text-amber-200" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm bg-slate-50/30">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Histórico</p>
                                <p className="text-3xl font-black text-slate-900">${totalExpenses.toFixed(2)}</p>
                            </div>
                            <DollarSign className="h-10 w-10 text-slate-200" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filter & Table Area */}
            <Card className="border-none shadow-xl shadow-slate-100/50 overflow-hidden">
                <div className="p-4 border-b border-slate-50 bg-slate-50/50 flex flex-wrap gap-4 items-center justify-between">
                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                        <Receipt className="h-4 w-4" /> Detalle de Movimientos
                    </h3>
                    <Select value={filterCategory} onValueChange={setFilterCategory}>
                        <SelectTrigger className="w-56 border-slate-200 bg-card shadow-sm">
                            <Filter className="mr-2 h-4 w-4 text-slate-400" />
                            <SelectValue placeholder="Filtrar por categoría" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas las categorías</SelectItem>
                            {EXPENSE_CATEGORIES.map(cat => (
                                <SelectItem key={cat.value} value={cat.value}>
                                    {cat.icon} {cat.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="text-center py-20 text-slate-400 animate-pulse font-medium">Cargando registros del sistema...</div>
                    ) : filteredExpenses.length === 0 ? (
                        <div className="text-center py-20">
                            <Receipt className="mx-auto h-16 w-16 text-slate-100 mb-4" />
                            <h3 className="text-slate-900 font-black text-xl mb-1">Sin Registros</h3>
                            <p className="text-slate-400 mb-6 max-w-xs mx-auto">No se han encontrado gastos que coincidan con los criterios actuales.</p>
                            <Button variant="outline" onClick={() => setFilterCategory('all')} className="border-slate-200">Limpiar Filtros</Button>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader className="bg-slate-50/30">
                                <TableRow className="hover:bg-transparent border-none">
                                    <TableHead className="font-bold text-slate-600">Fecha</TableHead>
                                    <TableHead className="font-bold text-slate-600">Categoría</TableHead>
                                    <TableHead className="font-bold text-slate-600">Descripción / Motivo</TableHead>
                                    <TableHead className="font-bold text-slate-600">Proveedor</TableHead>
                                    <TableHead className="text-right font-bold text-slate-600">Monto</TableHead>
                                    <TableHead className="font-bold text-slate-600">Estado</TableHead>
                                    {isManager && <TableHead className="text-right font-bold text-slate-600 pr-6">Auditoría</TableHead>}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredExpenses.map((expense) => {
                                    const catInfo = getCategoryInfo(expense.category);
                                    return (
                                        <TableRow key={expense.id} className="hover:bg-slate-50/50 transition-colors border-slate-50">
                                            <TableCell className="font-medium text-slate-950">{new Date(expense.expense_date).toLocaleDateString()}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="bg-card border-slate-200 text-slate-700 font-medium px-3 py-1 rounded-full whitespace-nowrap">
                                                    <span className="mr-2">{catInfo.icon}</span>
                                                    {catInfo.label}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="max-w-xs">
                                                <div className="truncate text-slate-600">{expense.description || <span className="text-slate-300 ">Sin descripción</span>}</div>
                                            </TableCell>
                                            <TableCell className="text-slate-600 font-medium">{expense.vendor || '-'}</TableCell>
                                            <TableCell className="text-right font-black text-slate-950 text-lg tracking-tight">${Number(expense.amount).toFixed(2)}</TableCell>
                                            <TableCell>{getStatusBadge(expense.status)}</TableCell>
                                            {isManager && (
                                                <TableCell className="text-right pr-6">
                                                    {expense.status === 'pending' && (
                                                        <div className="flex justify-end gap-1">
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                className="h-9 w-9 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-full"
                                                                onClick={() => updateExpenseStatus(expense.id, 'approved')}
                                                                title="Aprobar Gasto"
                                                            >
                                                                <CheckCircle2 className="h-5 w-5" />
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                className="h-9 w-9 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-full"
                                                                onClick={() => updateExpenseStatus(expense.id, 'rejected')}
                                                                title="Rechazar Gasto"
                                                            >
                                                                <XCircle className="h-5 w-5" />
                                                            </Button>
                                                        </div>
                                                    )}
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    )}
                </div>
            </Card>
        </div >
    );
}
