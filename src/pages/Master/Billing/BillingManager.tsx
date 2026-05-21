/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditCard, DollarSign, Download, Clock, Plus, Building2, RefreshCw, Bell, Globe, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface InvoiceType {
    id: string;
    organization_id: string;
    amount: number;
    status: 'paid' | 'open' | 'past_due' | 'void';
    due_date: string;
    invoice_number: string;
    created_at: string;
}

interface OrgType {
    id: string;
    name: string;
}

export default function BillingManager() {
    const [invoices, setInvoices] = useState<InvoiceType[]>([]);
    const [organizations, setOrganizations] = useState<OrgType[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    // Form state
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedOrg, setSelectedOrg] = useState('');
    const [amount, setAmount] = useState('');
    const [invoiceNumber, setInvoiceNumber] = useState('');

    const fetchData = async () => {
        setLoading(true);
        const [invRes, orgRes] = await Promise.all([
            supabase.from('invoices').select('*').order('created_at', { ascending: false }),
            supabase.from('organizations').select('id, name')
        ]);

        if (invRes.error) console.error('Error fetching invoices:', invRes.error);
        else setInvoices(invRes.data as InvoiceType[]);

        if (orgRes.error) console.error('Error fetching orgs:', orgRes.error);
        else setOrganizations(orgRes.data || []);

        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreateInvoice = async () => {
        if (!selectedOrg || !amount || !invoiceNumber) {
            toast({ title: 'Error', description: 'Completa todos los campos.', variant: 'destructive' });
            return;
        }

        const { data, error } = await supabase
            .from('invoices')
            .insert({
                organization_id: selectedOrg,
                amount: parseFloat(amount),
                invoice_number: invoiceNumber,
                status: 'open',
                due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // +30 days
            })
            .select()
            .single();

        if (error) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        } else {
            setInvoices([data as InvoiceType, ...invoices]);
            setIsDialogOpen(false);
            setAmount('');
            setInvoiceNumber('');
            toast({ title: 'Factura Creada', description: `Factura #${invoiceNumber} generada.` });
        }
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            'paid': 'bg-emerald-50 text-emerald-700',
            'open': 'bg-amber-50 text-amber-700',
            'past_due': 'bg-rose-50 text-rose-700',
            'void': 'bg-slate-50 text-slate-700'
        };
        const labels: Record<string, string> = {
            'paid': 'Pagado',
            'open': 'Pendiente',
            'past_due': 'Vencido',
            'void': 'Anulado'
        };
        return (
            <Badge className={`${styles[status] || styles.void} border-none font-black uppercase text-[9px] tracking-widest px-2.5 py-1.5 rounded-full`}>
                {labels[status] || 'Borrador'}
            </Badge>
        );
    };

    return (
        <div className="flex flex-col min-h-full space-y-8 p-1">
            {/* Premium White Header Container */}
            <header className="bg-card px-10 md:px-12 py-10 rounded-elite-lg shadow-xl shadow-slate-200/50 dark:shadow-none border border-border relative overflow-hidden -mt-2 mx-1">
                {/* Decorative backgrounds */}
                <div className="absolute -top-32 -right-32 w-80 h-80 bg-indigo-50 dark:bg-indigo-900/10 rounded-full blur-3xl opacity-60"></div>
                <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-slate-50 dark:bg-emerald-900/10 rounded-full blur-3xl opacity-60 text-slate-900"></div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-gradient-to-br from-slate-800 to-black dark:from-indigo-500 dark:to-indigo-700 rounded-3xl flex items-center justify-center shadow-lg shadow-slate-200 dark:shadow-none transform transition-transform hover:scale-105">
                            <CreditCard className="text-white h-10 w-10" />
                        </div>
                        <div>
                            <p className="text-indigo-500 text-[11px] font-black uppercase tracking-[0.25em] mb-1.5">Finanzas & Facturación</p>
                            <h1 className="text-4xl font-black text-foreground tracking-tight">
                                Facturación y Pagos
                            </h1>
                            <p className="text-muted-foreground text-sm mt-1 max-w-lg font-medium">Control centralizado de ingresos, comprobantes y suscripciones SaaS</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="h-14 px-8 rounded-2xl bg-slate-900 hover:bg-black text-white shadow-lg shadow-slate-200 dark:shadow-none transition-all hover:-translate-y-0.5 active:translate-y-0 font-bold uppercase text-[10px] tracking-widest">
                                    <Plus className="w-4 h-4 mr-3" />
                                    Generar Factura
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-card border-none shadow-2xl rounded-[2.5rem] max-w-md p-0 overflow-hidden">
                                <div className="bg-slate-900 p-8 text-white">
                                    <DialogTitle className="text-2xl font-black uppercase tracking-tight">Nueva Factura Manual</DialogTitle>
                                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Sincronización con Pasarela de Pagos</p>
                                </div>
                                <div className="p-8 space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-400">Cliente / Organización</label>
                                        <Select value={selectedOrg} onValueChange={setSelectedOrg}>
                                            <SelectTrigger className="h-12 rounded-xl border-slate-100 bg-slate-50 font-bold focus:ring-slate-200 text-slate-900">
                                                <SelectValue placeholder="Seleccionar organización..." />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                                                {organizations.map(org => (
                                                    <SelectItem key={org.id} value={org.id} className="font-medium">{org.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase tracking-widest text-slate-400">N° Factura</label>
                                            <Input
                                                value={invoiceNumber}
                                                onChange={e => setInvoiceNumber(e.target.value)}
                                                className="h-12 rounded-xl border-slate-100 bg-slate-50 font-bold focus:ring-indigo-500 text-slate-900"
                                                placeholder="INV-001"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase tracking-widest text-slate-400">Monto ($)</label>
                                            <Input
                                                type="number"
                                                value={amount}
                                                onChange={e => setAmount(e.target.value)}
                                                className="h-12 rounded-xl border-slate-100 bg-slate-50 font-bold focus:ring-indigo-500 text-slate-900"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>
                                    <Button onClick={handleCreateInvoice} className="w-full h-14 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-indigo-100 mt-4 transition-all">
                                        Emitir Comprobante
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </header>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-2">
                {[
                    { label: 'Ingresos Mensuales', val: '$0.00', sub: 'MRR Proyectado', icon: DollarSign, color: 'indigo' },
                    { label: 'Facturas Vencidas', val: '0', sub: 'Requieren atención', icon: Clock, color: 'rose' },
                    { label: 'Planes Activos', val: '1', sub: 'Suscripciones vigentes', icon: CreditCard, color: 'slate' }
                ].map((kpi, i) => (
                    <Card key={i} className="bg-card border-none rounded-[2.5rem] shadow-xl shadow-slate-200/50 dark:shadow-none p-8 group hover:translate-y-[-5px] transition-all duration-300">
                        <div className="flex items-center justify-between mb-6">
                            <div className={`w-14 h-14 rounded-2xl bg-${kpi.color}-50 dark:bg-${kpi.color}-900/20 flex items-center justify-center group-hover:bg-${kpi.color}-600 transition-colors duration-500`}>
                                <kpi.icon className={`h-7 w-7 text-${kpi.color}-600 dark:text-${kpi.color}-400 group-hover:text-white transition-colors`} />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{kpi.label}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className={`text-4xl font-black tracking-tighter text-${kpi.color === 'rose' ? 'rose-600' : 'slate-900'} dark:text-white mb-1`}>{kpi.val}</span>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{kpi.sub}</span>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Invoices Table */}
            <Card className="border-none shadow-2xl shadow-slate-200/50 dark:shadow-none bg-card rounded-[3rem] overflow-hidden mx-1">
                <CardHeader className="border-b border-border pb-6 pt-10 px-10">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl font-black text-foreground tracking-tight uppercase">Historial de Cobros</CardTitle>
                            <p className="text-muted-foreground font-bold text-[10px] uppercase tracking-widest mt-1">Listado maestro de transacciones SaaS</p>
                        </div>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={fetchData}
                            className="w-12 h-12 rounded-[1.2rem] border-slate-200 hover:bg-slate-50 transition-all shadow-sm"
                        >
                            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin text-indigo-500' : 'text-slate-400'}`} />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {loading && invoices.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-32 gap-4">
                            <Loader2 className="w-12 h-12 animate-spin text-indigo-500" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Consultando registros...</p>
                        </div>
                    ) : invoices.length === 0 ? (
                        <div className="text-center py-32">
                            <div className="bg-muted w-24 h-24 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6">
                                <CreditCard className="w-12 h-12 text-slate-300" />
                            </div>
                            <h3 className="text-xl font-black text-foreground uppercase tracking-tight">Sin facturación</h3>
                            <p className="text-slate-400 text-sm mt-2 max-w-xs mx-auto font-medium">Aún no se han generado comprobantes en el sistema.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-muted/50">
                                    <TableRow className="hover:bg-transparent border-none">
                                        <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 py-7 pl-10">N° Comprobante</TableHead>
                                        <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 py-7">Cliente / Org</TableHead>
                                        <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 py-7">Monto Total</TableHead>
                                        <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 py-7">Estado de Pago</TableHead>
                                        <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 py-7">Vencimiento</TableHead>
                                        <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 py-7 text-right pr-10">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {invoices.map((inv) => (
                                        <TableRow key={inv.id} className="border-b border-border hover:bg-indigo-500/10 transition-all group">
                                            <TableCell className="pl-10 py-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center font-black text-indigo-600 text-xs">#</div>
                                                    <span className="font-black text-foreground tracking-tight">{inv.invoice_number}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-6">
                                                <div className="flex items-center gap-2">
                                                    <Building2 className="w-4 h-4 text-slate-400" />
                                                    <span className="font-bold text-muted-foreground">{organizations.find(o => o.id === inv.organization_id)?.name || 'Organización'}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-6">
                                                <span className="text-lg font-black text-foreground tracking-tighter">${inv.amount.toFixed(2)}</span>
                                            </TableCell>
                                            <TableCell className="py-6">
                                                {getStatusBadge(inv.status)}
                                            </TableCell>
                                            <TableCell className="py-6 text-slate-400 font-bold tabular-nums text-sm">
                                                {new Date(inv.due_date).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-right pr-10 py-6">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-10 w-10 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                                                >
                                                    <Download className="h-5 w-5" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
