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
import { Loader2, CreditCard, DollarSign, Download, Clock } from "lucide-react"; // Removed unused imports
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
        switch (status) {
            case 'paid': return <Badge className="bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30">Pagado</Badge>;
            case 'open': return <Badge className="bg-blue-500/20 text-blue-500 hover:bg-blue-500/30">Pendiente</Badge>;
            case 'past_due': return <Badge className="bg-red-500/20 text-red-500 hover:bg-red-500/30">Vencido</Badge>;
            default: return <Badge variant="outline" className="text-slate-500">Borrador</Badge>;
        }
    };

    return (
        <div className="p-6 space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
                        <CreditCard className="w-8 h-8 text-emerald-500" />
                        Facturación y Pagos
                    </h1>
                    <p className="text-slate-400 mt-1">Control de ingresos y suscripciones SaaS.</p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shaow-emerald-500/20">
                            <DollarSign className="w-4 h-4 mr-2" />
                            Generar Factura
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-slate-900 border-slate-700 text-white">
                        <DialogHeader>
                            <DialogTitle>Nueva Factura Manual</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Organización</label>
                                <Select value={selectedOrg} onValueChange={setSelectedOrg}>
                                    <SelectTrigger className="bg-slate-800 border-slate-700">
                                        <SelectValue placeholder="Seleccionar cliente..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {organizations.map(org => (
                                            <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">N° Factura</label>
                                    <Input
                                        placeholder="INV-2025-001"
                                        value={invoiceNumber}
                                        onChange={e => setInvoiceNumber(e.target.value)}
                                        className="bg-slate-800 border-slate-700"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Monto ($)</label>
                                    <Input
                                        type="number"
                                        placeholder="0.00"
                                        value={amount}
                                        onChange={e => setAmount(e.target.value)}
                                        className="bg-slate-800 border-slate-700"
                                    />
                                </div>
                            </div>
                            <Button onClick={handleCreateInvoice} className="w-full bg-emerald-600 hover:bg-emerald-500 font-bold mt-4">
                                Emitir Factura
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-slate-900/50 border-slate-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Ingresos Mensuales (MRR)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">$0.00</div>
                        <p className="text-xs text-emerald-500 flex items-center mt-1">
                            <Clock className="w-3 h-3 mr-1" />
                            Actualizado hace 1m
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900/50 border-slate-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Facturas Vencidas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">0</div>
                        <p className="text-xs text-slate-500 mt-1">Todo al día</p>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900/50 border-slate-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Suscripciones Activas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-400">1</div>
                        <p className="text-xs text-slate-500 mt-1">Organizaciones en plan Pro</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="text-xl text-white">Historial de Facturas</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                        </div>
                    ) : invoices.length === 0 ? (
                        <div className="text-center py-12">
                            <CreditCard className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-slate-300">No hay facturas registradas</h3>
                            <p className="text-slate-500 mt-1">Las facturas generadas aparecerán aquí.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="border-slate-800 hover:bg-transparent">
                                    <TableHead className="text-slate-400">Factura #</TableHead>
                                    <TableHead className="text-slate-400">Monto</TableHead>
                                    <TableHead className="text-slate-400">Estado</TableHead>
                                    <TableHead className="text-slate-400">Vencimiento</TableHead>
                                    <TableHead className="text-slate-400 text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {invoices.map((inv) => (
                                    <TableRow key={inv.id} className="border-slate-800 hover:bg-slate-800/50">
                                        <TableCell className="font-medium text-white">{inv.invoice_number}</TableCell>
                                        <TableCell className="text-slate-300">${inv.amount.toFixed(2)}</TableCell>
                                        <TableCell>{getStatusBadge(inv.status)}</TableCell>
                                        <TableCell className="text-slate-400 font-mono text-xs">{new Date(inv.due_date).toLocaleDateString()}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-white">
                                                <Download className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
