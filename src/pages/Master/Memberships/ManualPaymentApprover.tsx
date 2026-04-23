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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
    CheckCircle2,
    XCircle,
    Clock,
    Eye,
    Check,
    X,
    Loader2,
    CreditCard,
    Smartphone,
    Globe,
    Wallet,
    ExternalLink
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PaymentReport {
    id: string;
    user_id: string;
    organization_id: string;
    plan_id: string;
    payment_method: string;
    reference_number: string;
    amount_paid: number;
    proof_image_url: string | null;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    organizations: {
        name: string;
    };
    profiles: {
        email: string;
    };
}

export default function ManualPaymentApprover() {
    const [reports, setReports] = useState<PaymentReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const { data, error } = await (supabase as any)
                .from('payment_reports')
                .select(`
                    *,
                    organizations(name),
                    profiles(email)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setReports((data as any) || []);
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (report: PaymentReport) => {
        setProcessingId(report.id);
        try {
            // 1. Fetch current subscription to see if we should extend it
            const { data: currentSub } = await supabase
                .from('subscriptions')
                .select('current_period_end, status')
                .eq('organization_id', report.organization_id)
                .maybeSingle();

            let baseDate = new Date();
            if (currentSub?.status === 'active' && currentSub?.current_period_end) {
                const existingEnd = new Date(currentSub.current_period_end);
                if (existingEnd > baseDate) {
                    baseDate = existingEnd;
                }
            }

            // Calculate new end date (30 days from baseDate)
            const endDate = new Date(baseDate);
            endDate.setDate(endDate.getDate() + 30);

            // 2. Update Report Status
            const { error: reportError } = await (supabase as any)
                .from('payment_reports')
                .update({ status: 'approved' })
                .eq('id', report.id);

            if (reportError) throw reportError;

            // 3. Upsert Subscription
            const { error: subError } = await (supabase as any)
                .from('subscriptions')
                .upsert({
                    organization_id: report.organization_id,
                    plan_id: report.plan_id,
                    status: 'active',
                    provider: report.payment_method,
                    provider_subscription_id: report.reference_number,
                    current_period_start: new Date().toISOString(),
                    current_period_end: endDate.toISOString(),
                    updated_at: new Date().toISOString()
                });

            if (subError) throw subError;

            // 4. Record Transaction
            await (supabase as any).from('billing_transactions').insert({
                organization_id: report.organization_id,
                amount: report.amount_paid,
                currency: 'USD',
                status: 'completed',
                provider: report.payment_method,
                provider_transaction_id: report.reference_number
            });

            toast({ title: "¡Aprobado!", description: "La suscripción ha sido activada." });
            fetchReports();
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (id: string) => {
        if (!confirm('¿Estás seguro de rechazar este pago?')) return;

        setProcessingId(id);
        try {
            const { error } = await (supabase as any)
                .from('payment_reports')
                .update({ status: 'rejected' })
                .eq('id', id);

            if (error) throw error;
            toast({ title: "Rechazado", description: "El reporte ha sido marcado como rechazado." });
            fetchReports();
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setProcessingId(null);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved': return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Aprobado</Badge>;
            case 'rejected': return <Badge className="bg-rose-500/10 text-rose-500 border-rose-500/20">Rechazado</Badge>;
            default: return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">Pendiente</Badge>;
        }
    };

    const getMethodIcon = (method: string) => {
        const m = method.toLowerCase();
        if (m.includes('pago movil')) return <Smartphone className="w-3 h-3 text-emerald-400" />;
        if (m.includes('binance')) return <Wallet className="w-3 h-3 text-yellow-400" />;
        if (m.includes('paypal')) return <Globe className="w-3 h-3 text-blue-400" />;
        return <CreditCard className="w-3 h-3 text-slate-400" />;
    };

    return (
        <Card className="bg-slate-900 border-slate-800 shadow-xl overflow-hidden">
            <CardHeader className="border-b border-slate-800 bg-slate-800/20">
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="text-white flex items-center gap-2">
                            Aprobación de Pagos Manuales
                        </CardTitle>
                        <CardDescription>Valida los reportes de Pago Móvil, Binance y PayPal.</CardDescription>
                    </div>
                    <Button variant="ghost" size="sm" onClick={fetchReports} disabled={loading}>
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader className="bg-slate-800/30">
                        <TableRow className="border-slate-800 hover:bg-transparent">
                            <TableHead className="text-slate-500 font-bold uppercase text-[10px]">Cliente / Org</TableHead>
                            <TableHead className="text-slate-500 font-bold uppercase text-[10px]">Plan</TableHead>
                            <TableHead className="text-slate-500 font-bold uppercase text-[10px]">Método</TableHead>
                            <TableHead className="text-slate-500 font-bold uppercase text-[10px]">Referencia</TableHead>
                            <TableHead className="text-slate-500 font-bold uppercase text-[10px]">Monto</TableHead>
                            <TableHead className="text-slate-500 font-bold uppercase text-[10px]">Fecha</TableHead>
                            <TableHead className="text-slate-500 font-bold uppercase text-[10px]">Comprobante</TableHead>
                            <TableHead className="text-slate-500 font-bold uppercase text-[10px]">Estado</TableHead>
                            <TableHead className="text-slate-500 font-bold uppercase text-[10px] text-right">Acción</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={9} className="text-center py-20">
                                    <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mx-auto" />
                                </TableCell>
                            </TableRow>
                        ) : reports.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} className="text-center py-20 text-slate-500 ">
                                    No hay reportes de pago registrados.
                                </TableCell>
                            </TableRow>
                        ) : (
                            reports.map((report) => (
                                <TableRow key={report.id} className="border-slate-800/50 hover:bg-background/5 transition-colors group">
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="text-white font-medium text-sm">{report.organizations?.name}</span>
                                            <span className="text-slate-500 text-xs">{report.profiles?.email}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="border-slate-700 text-slate-300">
                                            {report.plan_id}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {getMethodIcon(report.payment_method)}
                                            <span className="text-xs text-slate-300">{report.payment_method}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-mono text-xs text-slate-400">
                                        {report.reference_number}
                                    </TableCell>
                                    <TableCell className="text-white font-bold">
                                        ${report.amount_paid}
                                    </TableCell>
                                    <TableCell className="text-slate-500 text-xs">
                                        {new Date(report.created_at).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        {report.proof_image_url ? (
                                            <a
                                                href={report.proof_image_url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1 text-xs group-hover:translate-x-1 transition-transform"
                                            >
                                                Ver Captura <ExternalLink className="w-3 h-3" />
                                            </a>
                                        ) : (
                                            <span className="text-slate-600 text-[10px]">Sin imagen</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {getStatusBadge(report.status)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {report.status === 'pending' && (
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8 text-rose-500 hover:bg-rose-500/10"
                                                    disabled={processingId === report.id}
                                                    onClick={() => handleReject(report.id)}
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    className="h-8 w-8 bg-emerald-600 hover:bg-emerald-500 text-white"
                                                    disabled={processingId === report.id}
                                                    onClick={() => handleApprove(report)}
                                                >
                                                    {processingId === report.id ? (
                                                        <Loader2 className="w-3 h-3 animate-spin" />
                                                    ) : (
                                                        <Check className="w-4 h-4" />
                                                    )}
                                                </Button>
                                            </div>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

function RefreshCw({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
            <path d="M3 21v-5h5" />
        </svg>
    )
}
