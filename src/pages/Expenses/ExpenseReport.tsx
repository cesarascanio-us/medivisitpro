/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, FileText, Upload, Calendar as CalendarIcon, Loader2, DollarSign } from "lucide-react";
import { Expense, EXPENSE_CATEGORIES } from "@/types/resources";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function ExpenseReport() {
    const { toast } = useToast();
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    // New Expense Form
    const [isAdding, setIsAdding] = useState(false);
    const [newExpense, setNewExpense] = useState({
        description: "",
        amount: "",
        category: "alim",
        date: new Date().toISOString().split('T')[0]
    });
    const [receiptFile, setReceiptFile] = useState<File | null>(null);

    useEffect(() => {
        loadExpenses();
    }, []);

    const loadExpenses = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('expenses')
                .select('*')
                .eq('user_id', user.id)
                .order('expense_date', { ascending: false });

            if (error) throw error;
            setExpenses(data as Expense[]);
        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "No se pudieron cargar los gastos", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setReceiptFile(e.target.files[0]);
        }
    };

    const handleSave = async () => {
        if (!newExpense.description || !newExpense.amount) {
            toast({ title: "Campos incompletos", description: "Descripción y monto son obligatorios.", variant: "destructive" });
            return;
        }

        setUploading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("No user");

            let receiptUrl = null;

            // Upload Receipt if exists
            if (receiptFile) {
                const fileExt = receiptFile.name.split('.').pop();
                const fileName = `${user.id}/${Date.now()}.${fileExt}`;

                // Try to upload to 'receipts' bucket
                const { error: uploadError } = await supabase.storage
                    .from('receipts')
                    .upload(fileName, receiptFile);

                if (uploadError) {
                    // Check if bucket missing error (approximate check)
                    console.error("Upload error:", uploadError);
                    if (uploadError.message.includes("bucket")) {
                        toast({ title: "Error de Almacenamiento", description: "El bucket 'receipts' no existe en Supabase.", variant: "destructive" });
                    }
                    throw uploadError;
                }

                // Get Public URL
                const { data: { publicUrl } } = supabase.storage
                    .from('receipts')
                    .getPublicUrl(fileName);

                receiptUrl = publicUrl;
            }

            // Save Expense Record
            const { error: dbError } = await supabase
                .from('expenses')
                .insert({
                    user_id: user.id,
                    description: newExpense.description,
                    amount: parseFloat(newExpense.amount),
                    category: newExpense.category,
                    expense_date: newExpense.date,
                    receipt_url: receiptUrl
                });

            if (dbError) throw dbError;

            toast({ title: "Gasto Registrado", description: "Se ha enviado para aprobación." });
            setIsAdding(false);
            setNewExpense({ description: "", amount: "", category: "alim", date: new Date().toISOString().split('T')[0] });
            setReceiptFile(null);
            loadExpenses();

        } catch (error: any) {
            toast({ title: "Error", description: error.message || "No se pudo guardar", variant: "destructive" });
        } finally {
            setUploading(false);
        }
    };

    const getTotal = () => expenses.reduce((acc, curr) => acc + curr.amount, 0);

    if (loading) return <div className="p-8"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /></div>;

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Reporte de Gastos</h1>
                    <p className="text-muted-foreground">Gestiona tus reembolsos y comprobantes</p>
                </div>
                <Button onClick={() => setIsAdding(!isAdding)} className={`${isAdding ? 'bg-destructive/10 text-destructive hover:bg-destructive/20' : 'bg-primary text-primary-foreground hover:bg-primary/90'}`}>
                    {isAdding ? 'Cancelar' : <><Plus className="mr-2 h-4 w-4" /> Nuevo Gasto</>}
                </Button>
            </div>

            {/* Add Form */}
            {isAdding && (
                <Card className="border-primary/20 bg-primary/5">
                    <CardHeader>
                        <CardTitle className="text-lg">Registrar Nuevo Gasto</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Descripción</label>
                                <Input
                                    placeholder="Ej: Almuerzo con Dr. Perez"
                                    value={newExpense.description}
                                    onChange={e => setNewExpense({ ...newExpense, description: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Monto</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="number"
                                        className="pl-9"
                                        placeholder="0.00"
                                        value={newExpense.amount}
                                        onChange={e => setNewExpense({ ...newExpense, amount: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Categoría</label>
                                <Select
                                    value={newExpense.category}
                                    onValueChange={v => setNewExpense({ ...newExpense, category: v as any })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(EXPENSE_CATEGORIES).map(([key, label]) => (
                                            <SelectItem key={key} value={key}>{label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Fecha</label>
                                <Input
                                    type="date"
                                    value={newExpense.date}
                                    onChange={e => setNewExpense({ ...newExpense, date: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Comprobante (Foto/PDF)</label>
                            <div className="flex items-center gap-4">
                                <Input
                                    type="file"
                                    accept="image/*,application/pdf"
                                    onChange={handleFileChange}
                                    className="cursor-pointer"
                                />
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end">
                            <Button onClick={handleSave} disabled={uploading}>
                                {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
                                {uploading ? 'Guardando...' : 'Guardar Gasto'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Mensual</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${getTotal().toFixed(2)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Pendiente Aprobación</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-600">
                            ${expenses.filter(e => e.status === 'pending').reduce((acc, curr) => acc + curr.amount, 0).toFixed(2)}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Rechazados</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                            {expenses.filter(e => e.status === 'rejected').length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* List */}
            <div className="space-y-4">
                <h3 className="font-semibold text-lg">Historial</h3>
                {expenses.length === 0 ? (
                    <div className="text-center py-12 bg-muted/50 rounded-xl border border-dashed text-muted-foreground">
                        No hay gastos registrados este mes.
                    </div>
                ) : (
                    expenses.map(expense => (
                        <Card key={expense.id} className="overflow-hidden">
                            <div className="flex flex-col md:flex-row items-center p-4 gap-4">
                                <div className={`p-3 rounded-full ${expense.status === 'approved' ? 'bg-emerald-100 text-emerald-600' : expense.status === 'rejected' ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground'}`}>
                                    <DollarSign className="h-5 w-5" />
                                </div>
                                <div className="flex-1 text-center md:text-left">
                                    <h4 className="font-medium text-foreground">{expense.description}</h4>
                                    <p className="text-sm text-muted-foreground">
                                        {format(new Date(expense.expense_date), "PPP", { locale: es })} • {EXPENSE_CATEGORIES[expense.category]}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-lg text-foreground">${expense.amount.toFixed(2)}</div>
                                    <div className={`text-xs uppercase font-bold ${expense.status === 'approved' ? 'text-emerald-600' : expense.status === 'rejected' ? 'text-destructive' : 'text-amber-600'}`}>
                                        {expense.status === 'pending' ? 'Pendiente' : expense.status === 'approved' ? 'Aprobado' : 'Rechazado'}
                                    </div>
                                </div>
                                {expense.receipt_url && (
                                    <a href={expense.receipt_url} target="_blank" rel="noopener noreferrer">
                                        <Button variant="ghost" size="sm">
                                            <FileText className="h-4 w-4" />
                                        </Button>
                                    </a>
                                )}
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
