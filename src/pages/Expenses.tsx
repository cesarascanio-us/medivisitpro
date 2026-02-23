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
import { Lightbulb } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
    repId?: string;
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
    { value: "transport", label: "Transporte", icon: "🚗" },
    { value: "meals", label: "Comidas", icon: "🍽️" },
    { value: "lodging", label: "Hospedaje", icon: "🏨" },
    { value: "materials", label: "Materiales", icon: "📦" },
    { value: "other", label: "Otros", icon: "📋" }
];

export default function Expenses() {
    const { user, canViewAllData, isSupervisor, isManager, zoneId } = useAuth();
    const { toast } = useToast();
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [filterCategory, setFilterCategory] = useState<string>("all");
    const [adminFilters, setAdminFilters] = useState<AdminFilterState>({});
    const [formData, setFormData] = useState({
        category: "transport",
        amount: 0,
        expense_date: new Date().toISOString().split('T')[0],
        description: "",
        vendor: ""
    });

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
                if (adminFilters.repId && adminFilters.repId !== 'all') {
                    query = query.eq('user_id', adminFilters.repId);
                }
            } else if (!canViewAllData) {
                query = query.eq('user_id', user?.id);
            } else {
                // Master/Manager with optional filters
                if (adminFilters.repId && adminFilters.repId !== 'all') {
                    query = query.eq('user_id', adminFilters.repId);
                }
                if (adminFilters.zoneId && adminFilters.zoneId !== 'all') {
                    query = query.eq('zone_id', adminFilters.zoneId);
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
        if (!user || formData.amount <= 0) return;

        try {
            const { error } = await supabase.from('expenses').insert({
                user_id: user.id,
                category: formData.category,
                amount: formData.amount,
                expense_date: formData.expense_date,
                description: formData.description || null,
                vendor: formData.vendor || null,
                status: 'pending',
                currency: 'USD'
            });

            if (error) throw error;

            toast({ title: "Gasto registrado", description: "El gasto ha sido guardado." });
            setDialogOpen(false);
            setFormData({ category: "transport", amount: 0, expense_date: new Date().toISOString().split('T')[0], description: "", vendor: "" });
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
        return EXPENSE_CATEGORIES.find(c => c.value === cat) || { value: cat, label: cat, icon: "📋" };
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
        return <Badge className={styles[status] || "bg-gray-100"}>{labels[status] || status}</Badge>;
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
                    <h1 className="text-2xl font-bold text-foreground">Gastos y Presupuestos</h1>
                    <p className="text-muted-foreground">Registra y controla tus gastos de trabajo</p>
                </div>
            </div>

            {/* Admin Filters */}
            <AdminDataFilter onFilterChange={setAdminFilters} moduleType="contacts" />

            <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={() => setShowHelp(!showHelp)} title="Ver Ayuda">
                    <span className="sr-only">Ayuda</span>
                    <Lightbulb className="h-5 w-5 text-yellow-500" />
                </Button>
                <Button variant="outline" onClick={exportToCSV}>
                    <Download className="mr-2 h-4 w-4" /> Exportar
                </Button>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="btn-medical">
                            <Plus className="mr-2 h-4 w-4" /> Nuevo Gasto
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Registrar Gasto</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Categoría *</Label>
                                <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {EXPENSE_CATEGORIES.map(cat => (
                                            <SelectItem key={cat.value} value={cat.value}>
                                                {cat.icon} {cat.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Monto *</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                                        placeholder="0.00"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Fecha *</Label>
                                    <Input
                                        type="date"
                                        value={formData.expense_date}
                                        onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Proveedor / Lugar</Label>
                                <Input
                                    value={formData.vendor}
                                    onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                                    placeholder="Nombre del establecimiento"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Descripción</Label>
                                <Textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Detalles del gasto..."
                                />
                            </div>
                            <Button onClick={handleSubmit} className="w-full btn-medical">Registrar Gasto</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>


            {
                showHelp && (
                    <InstructionCard
                        title="Control de Gastos"
                        description="Registra y monitorea tus gastos operativos."
                        items={[
                            "Registra cada gasto con su categoría y comprobante.",
                            "Monitorea el estado de aprobación de tus reportes.",
                            "Exporta tus reportes para gestión administrativa."
                        ]}
                    />
                )
            }



            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="medical-card">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Gastos Este Mes</p>
                                <p className="text-3xl font-bold text-primary">${thisMonthExpenses.toFixed(2)}</p>
                            </div>
                            <Calendar className="h-8 w-8 text-primary opacity-20" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="medical-card">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Pendientes de Aprobar</p>
                                <p className="text-3xl font-bold text-yellow-600">${pendingExpenses.toFixed(2)}</p>
                            </div>
                            <Receipt className="h-8 w-8 text-yellow-600 opacity-20" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="medical-card">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Total Registrado</p>
                                <p className="text-3xl font-bold">${totalExpenses.toFixed(2)}</p>
                            </div>
                            <DollarSign className="h-8 w-8 text-muted-foreground opacity-20" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filter */}
            <div className="flex gap-4 items-center">
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-48">
                        <Filter className="mr-2 h-4 w-4" />
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

            {/* Table */}
            {
                loading ? (
                    <div className="text-center py-12 text-muted-foreground">Cargando gastos...</div>
                ) : filteredExpenses.length === 0 ? (
                    <Card className="medical-card">
                        <CardContent className="text-center py-12">
                            <Receipt className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium mb-2">No hay gastos registrados</h3>
                            <p className="text-muted-foreground mb-4">Registra tu primer gasto para comenzar</p>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="medical-card">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Categoría</TableHead>
                                    <TableHead>Descripción</TableHead>
                                    <TableHead>Proveedor</TableHead>
                                    <TableHead className="text-right">Monto</TableHead>
                                    <TableHead>Estado</TableHead>
                                    {isManager && <TableHead className="text-right">Acciones</TableHead>}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredExpenses.map((expense) => {
                                    const catInfo = getCategoryInfo(expense.category);
                                    return (
                                        <TableRow key={expense.id}>
                                            <TableCell>{new Date(expense.expense_date).toLocaleDateString()}</TableCell>
                                            <TableCell>
                                                <span className="mr-2">{catInfo.icon}</span>
                                                {catInfo.label}
                                            </TableCell>
                                            <TableCell className="max-w-xs truncate">{expense.description || '-'}</TableCell>
                                            <TableCell>{expense.vendor || '-'}</TableCell>
                                            <TableCell className="text-right font-medium">${Number(expense.amount).toFixed(2)}</TableCell>
                                            <TableCell>{getStatusBadge(expense.status)}</TableCell>
                                            {isManager && (
                                                <TableCell className="text-right">
                                                    {expense.status === 'pending' && (
                                                        <div className="flex justify-end gap-2">
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                className="h-8 w-8 p-0 text-emerald-500 hover:text-emerald-700 hover:bg-emerald-100"
                                                                onClick={() => updateExpenseStatus(expense.id, 'approved')}
                                                                title="Aprobar"
                                                            >
                                                                <CheckCircle2 className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-100"
                                                                onClick={() => updateExpenseStatus(expense.id, 'rejected')}
                                                                title="Rechazar"
                                                            >
                                                                <XCircle className="h-4 w-4" />
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
                    </Card>
                )
            }
        </div >
    );
}

