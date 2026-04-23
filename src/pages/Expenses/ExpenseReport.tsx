/* ========================================================================
 * MASTER FRAMEWORK - EMPRESA CA
 * Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
 * ======================================================================== */

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
    Plus, 
    FileText, 
    Upload, 
    Calendar as CalendarIcon, 
    Loader2, 
    DollarSign, 
    Truck, 
    Camera, 
    Download,
    Trophy,
    Target,
    Info,
    CheckCircle2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Expense, EXPENSE_CATEGORIES } from "@/types/resources";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function ExpenseReport() {
    const { toast } = useToast();
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    // Form State
    const [isAdding, setIsAdding] = useState(false);
    const [newExpense, setNewExpense] = useState({
        description: "",
        amount: "",
        category: "trans",
        custom_category: "",
        date: new Date().toISOString().split('T')[0],
        start_km: "",
        end_km: "",
        has_pernocta: false
    });

    const [receiptFile, setReceiptFile] = useState<File | null>(null);
    const [kmStartFile, setKmStartFile] = useState<File | null>(null);
    const [kmEndFile, setKmEndFile] = useState<File | null>(null);

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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'receipt' | 'km_start' | 'km_end') => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (type === 'receipt') setReceiptFile(file);
            if (type === 'km_start') setKmStartFile(file);
            if (type === 'km_end') setKmEndFile(file);
        }
    };

    const handleSave = async () => {
        // Basic Validations
        // Biofarco Validation for Transport
        if (newExpense.category === 'trans') {
            if (!newExpense.start_km || !newExpense.end_km || !kmStartFile || !kmEndFile) {
                toast({ 
                    title: "Evidencia Obligatoria", 
                    description: "Debe registrar kilometraje y fotos (cluster) para reportes de transporte.",
                    variant: "destructive" 
                });
                return;
            }
        }

        // Custom Category Validation
        if (newExpense.category === 'custom' && !newExpense.custom_category) {
            toast({ title: "Nombre requerido", description: "Por favor define el nombre de la nueva categoría.", variant: "destructive" });
            return;
        }

        setUploading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("No autenticado");

            const uploadToBucket = async (file: File) => {
                const fileExt = file.name.split('.').pop();
                const fileName = `${user.id}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
                const { error: uploadError } = await supabase.storage.from('receipts').upload(fileName, file);
                if (uploadError) throw uploadError;
                const { data: { publicUrl } } = supabase.storage.from('receipts').getPublicUrl(fileName);
                return publicUrl;
            };

            let receiptUrl = null;
            let kmStartUrl = null;
            let kmEndUrl = null;

            if (receiptFile) receiptUrl = await uploadToBucket(receiptFile);
            if (kmStartFile) kmStartUrl = await uploadToBucket(kmStartFile);
            if (kmEndFile) kmEndUrl = await uploadToBucket(kmEndFile);

            // 1. Save unified expense with Biofarco fields
            const { error: dbError } = await supabase
                .from('expenses')
                .insert({
                    user_id: user.id,
                    organization_id: (user as any).user_metadata?.organization_id || null, // Best effort or leave for RLS trigger
                    description: newExpense.description || (newExpense.category === 'trans' ? `Logística de KM: ${newExpense.start_km} a ${newExpense.end_km}` : ''),
                    amount: parseFloat(newExpense.amount) || (newExpense.category === 'trans' ? 0 : 0),
                    category: newExpense.category === 'custom' ? newExpense.custom_category : newExpense.category,
                    expense_date: newExpense.date,
                    receipt_url: receiptUrl,
                    start_km: newExpense.category === 'trans' ? parseFloat(newExpense.start_km) : null,
                    end_km: newExpense.category === 'trans' ? parseFloat(newExpense.end_km) : null,
                    km_start_url: kmStartUrl,
                    km_end_url: kmEndUrl,
                    status: 'pending',
                    zone_id: (user as any).user_metadata?.zone_id || null
                });

            if (dbError) throw dbError;

            toast({ title: "¡Éxito!", description: "Reporte estratégico enviado correctamente." });
            setIsAdding(false);
            setNewExpense({ 
                description: "", amount: "", category: "alim", custom_category: "",
                date: new Date().toISOString().split('T')[0],
                start_km: "", end_km: "", has_pernocta: false 
            });
            setReceiptFile(null);
            setKmStartFile(null);
            setKmEndFile(null);
            loadExpenses();

        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setUploading(false);
        }
    };

    const getTotal = () => expenses.reduce((acc, curr) => acc + curr.amount, 0);

    if (loading) return <div className="p-8"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /></div>;

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter text-slate-900">Reporte Logístico</h1>
                    <p className="text-slate-500 font-medium">Gestión de gastos e indemnización de combustible</p>
                </div>
                <Button 
                    onClick={() => setIsAdding(!isAdding)} 
                    className={`min-w-[160px] h-12 font-bold shadow-lg transition-all ${isAdding ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' : 'shadow-primary/20'}`}
                >
                    {isAdding ? 'Cerrar Formulario' : <><Plus className="mr-2 h-5 w-5" /> Registrar Gasto</>}
                </Button>
            </div>

            {/* Formulario Estilo Elite */}
            {isAdding && (
                <Card className="border-none shadow-xl overflow-hidden animate-in slide-in-from-top-4">
                    <CardHeader className="bg-slate-50 border-b border-slate-100">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <FileText className="h-5 w-5 text-primary" />
                            Nuevo Registro Operativo Biofarco
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase text-slate-500">Categoría del Gasto</Label>
                                <Select
                                    value={newExpense.category}
                                    onValueChange={v => setNewExpense({ ...newExpense, category: v as any })}
                                >
                                    <SelectTrigger className="h-11 border-slate-200">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="alim">🍽️ Alimentación</SelectItem>
                                        <SelectItem value="hosp">🏨 Hospedaje</SelectItem>
                                        <SelectItem value="trans">🚗 Transporte / KM Semanal</SelectItem>
                                        <SelectItem value="custom">➕ Nueva Categoría...</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase text-slate-500">Fecha del Hecho</Label>
                                <Input
                                    type="date"
                                    className="h-11 border-slate-200"
                                    value={newExpense.date}
                                    onChange={e => setNewExpense({ ...newExpense, date: e.target.value })}
                                />
                            </div>
                            
                            {newExpense.category === 'custom' && (
                                <div className="space-y-2 animate-in zoom-in-95 duration-200">
                                    <Label className="text-xs font-bold uppercase text-primary">Nombre de Categoría</Label>
                                    <Input
                                        placeholder="Ej: Peaje, Lavado, Insumos..."
                                        className="h-11 border-primary/20 bg-primary/5 font-bold"
                                        value={newExpense.custom_category}
                                        onChange={e => setNewExpense({ ...newExpense, custom_category: e.target.value })}
                                    />
                                </div>
                            )}

                            {newExpense.category !== 'trans' && (
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase text-slate-500">Monto ($)</Label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                        <Input
                                            type="number"
                                            className="pl-9 h-11 border-slate-200 font-bold"
                                            placeholder="0.00"
                                            value={newExpense.amount}
                                            onChange={e => setNewExpense({ ...newExpense, amount: e.target.value })}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* SECCIÓN ESPECÍFICA DE TRANSPORTE (BIOFARCO KM) */}
                        {newExpense.category === 'trans' && (
                            <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10 space-y-6">
                                <div className="flex items-center gap-3 text-primary">
                                    <Truck className="h-6 w-6 font-bold" />
                                    <h3 className="font-black uppercase tracking-wider text-sm">Control de Kilometraje y Combustible</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold">KM Inicial (Semana)</Label>
                                            <Input 
                                                type="number" 
                                                className="h-11 bg-card" 
                                                value={newExpense.start_km}
                                                onChange={e => setNewExpense({...newExpense, start_km: e.target.value})}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold flex items-center gap-2">
                                                <Camera className="h-4 w-4" /> Foto Cluster Inicial
                                            </Label>
                                            <Input type="file" accept="image/*" className="bg-card" onChange={e => handleFileChange(e, 'km_start')} />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold">KM Final (Semana)</Label>
                                            <Input 
                                                type="number" 
                                                className="h-11 bg-card" 
                                                value={newExpense.end_km}
                                                onChange={e => setNewExpense({...newExpense, end_km: e.target.value})}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold flex items-center gap-2">
                                                <Camera className="h-4 w-4" /> Foto Cluster Final
                                            </Label>
                                            <Input type="file" accept="image/*" className="bg-card" onChange={e => handleFileChange(e, 'km_end')} />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2 pt-2">
                                    <Checkbox 
                                        id="pernocta" 
                                        checked={newExpense.has_pernocta}
                                        onCheckedChange={(checked) => setNewExpense({...newExpense, has_pernocta: !!checked})}
                                    />
                                    <label htmlFor="pernocta" className="text-sm font-bold text-slate-700 cursor-pointer">
                                        ¿Hubo Pernocta? (Aplica viático de hospedaje)
                                    </label>
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase text-slate-500">Descripción / Detalles</Label>
                            <Input
                                placeholder="Notas adicionales sobre el gasto..."
                                value={newExpense.description}
                                onChange={e => setNewExpense({ ...newExpense, description: e.target.value })}
                                className="h-11 border-slate-200"
                            />
                        </div>

                        {newExpense.category !== 'trans' && (
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase text-slate-500">Comprobante de Pago</Label>
                                <div className="flex items-center gap-4">
                                    <Input
                                        type="file"
                                        accept="image/*,application/pdf"
                                        onChange={e => handleFileChange(e, 'receipt')}
                                        className="h-11 border-slate-200 bg-slate-50"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="pt-6 border-t border-slate-100 flex justify-end">
                            <Button 
                                onClick={handleSave} 
                                disabled={uploading}
                                className="h-12 px-8 font-black uppercase tracking-widest text-xs btn-medical"
                            >
                                {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                                {uploading ? 'Procesando...' : 'Finalizar Reporte'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Resumen de KPI */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-none shadow-sm bg-slate-50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-black uppercase text-slate-400 tracking-wider">Acumulado Mes ($)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-slate-800">${getTotal().toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-black uppercase text-slate-400 tracking-wider">Reportes en Auditoría</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-amber-600">
                            {expenses.filter(e => e.status === 'pending').length}
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm bg-primary/5">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-black uppercase text-primary tracking-wider">Status Biofarco</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="font-bold text-slate-800 uppercase text-xs">Operativo</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Historial con Diseño Industrial */}
            <div className="space-y-4">
                <h3 className="font-black uppercase tracking-[0.2em] text-slate-400 text-[10px]">Historial de Gestión de Gastos</h3>
                {expenses.length === 0 ? (
                    <div className="text-center py-20 bg-slate-50/50 rounded-[2rem] border-2 border-dashed border-slate-200 text-slate-400">
                        <Info className="h-10 w-10 mx-auto mb-4 opacity-20" />
                        <p className="font-bold">No hay registros para este ciclo.</p>
                    </div>
                ) : (
                    expenses.map(expense => (
                        <Card key={expense.id} className="border-none shadow-sm hover:shadow-md transition-all group overflow-hidden">
                            <div className="flex flex-col md:flex-row items-center p-5 gap-6">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${expense.status === 'approved' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                                    {expense.category === 'trans' ? <Truck className="h-6 w-6" /> : <DollarSign className="h-6 w-6" />}
                                </div>
                                <div className="flex-1 text-center md:text-left">
                                    <h4 className="font-bold text-slate-800 text-lg leading-tight">{expense.description}</h4>
                                    <p className="text-xs font-bold text-slate-400 uppercase mt-1">
                                        {format(new Date(expense.expense_date), "PPP", { locale: es })}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <div className="font-black text-2xl text-slate-900">${expense.amount.toFixed(2)}</div>
                                    <Badge variant={(expense.status === 'approved' ? 'success' : 'warning') as any} className="mt-1 font-black uppercase text-[10px] tracking-tighter">
                                        {expense.status}
                                    </Badge>
                                </div>
                                {expense.receipt_url && (
                                    <a href={expense.receipt_url} target="_blank" rel="noopener noreferrer">
                                        <Button variant="outline" size="icon" className="rounded-full h-10 w-10 border-slate-200">
                                            <FileText className="h-5 w-5 text-slate-600" />
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
