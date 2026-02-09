import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Transaction } from "@/hooks/useBilling";
import {
    CheckCircle2,
    XCircle,
    Clock,
    CreditCard,
    Wallet,
    Globe,
    Download,
    Receipt,
    History
} from "lucide-react";

interface BillingPortalProps {
    subscription: any;
    transactions: Transaction[];
    onManageSubscription: () => void;
}

export function BillingPortal({ subscription, transactions, onManageSubscription }: BillingPortalProps) {
    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed':
            case 'active':
                return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
            case 'failed':
            case 'canceled':
                return <XCircle className="w-4 h-4 text-rose-500" />;
            case 'pending':
                return <Clock className="w-4 h-4 text-amber-500" />;
            default:
                return <Clock className="w-4 h-4 text-slate-500" />;
        }
    };

    const getProviderIcon = (provider: string) => {
        const p = provider.toLowerCase();
        if (p === 'stripe') return <CreditCard className="w-4 h-4 text-blue-400" />;
        if (p === 'binance' || p === 'binance_manual') return <Wallet className="w-4 h-4 text-yellow-400" />;
        if (p === 'paypal' || p === 'paypal_manual') return <Globe className="w-4 h-4 text-indigo-400" />;
        if (p === 'pago_movil' || p === 'bolivares') return <Receipt className="w-4 h-4 text-emerald-400" />;
        if (p === 'bank_transfer') return <Receipt className="w-4 h-4 text-slate-400" />;
        return <Receipt className="w-4 h-4 text-slate-400" />;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Subscription Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-slate-900 border-slate-800 shadow-xl overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <History className="w-16 h-16" />
                    </div>
                    <CardHeader>
                        <CardDescription className="text-slate-500 uppercase tracking-widest text-xs font-bold">Estado Actual</CardDescription>
                        <CardTitle className="text-white flex items-center gap-2">
                            {subscription?.billing_plans?.name || 'Plan Free'}
                            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                                {subscription?.status || 'Active'}
                            </Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-slate-400 text-sm">
                            Tu suscripción está gestionada vía {subscription?.provider || 'Sistema Interno'}.
                        </p>
                    </CardContent>
                    <CardFooter className="bg-slate-800/20 border-t border-slate-800">
                        <Button
                            variant="ghost"
                            className="w-full text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/5 text-sm font-bold"
                            onClick={onManageSubscription}
                        >
                            Gestionar Suscripción
                        </Button>
                    </CardFooter>
                </Card>

                {/* Additional Stats can go here (Users, SMS, etc) */}
                <Card className="bg-slate-900 border-slate-800 shadow-xl md:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-white">Historial de Transacciones</CardTitle>
                            <CardDescription>Visualiza y descarga tus recibos pasados.</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader className="border-slate-800">
                                <TableRow className="hover:bg-transparent border-slate-800">
                                    <TableHead className="text-slate-500 uppercase tracking-tighter text-[10px] font-bold">Fecha</TableHead>
                                    <TableHead className="text-slate-500 uppercase tracking-tighter text-[10px] font-bold">Método</TableHead>
                                    <TableHead className="text-slate-500 uppercase tracking-tighter text-[10px] font-bold">Monto</TableHead>
                                    <TableHead className="text-slate-500 uppercase tracking-tighter text-[10px] font-bold text-center">Estado</TableHead>
                                    <TableHead className="text-slate-500 uppercase tracking-tighter text-[10px] font-bold text-right">Recibo</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transactions.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-slate-500 italic">
                                            No se encontraron transacciones registradas.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    transactions.map((tx) => (
                                        <TableRow key={tx.id} className="border-slate-800/50 hover:bg-white/5 transition-colors">
                                            <TableCell className="font-medium text-slate-300">
                                                {formatDate(tx.created_at)}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2 text-slate-400">
                                                    {getProviderIcon(tx.provider)}
                                                    <span className="capitalize text-xs">{tx.provider}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-white font-bold tracking-tight">
                                                ${tx.amount} <span className="text-[10px] opacity-50 font-normal">{tx.currency}</span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex justify-center">
                                                    {getStatusIcon(tx.status)}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-white">
                                                    <Download className="w-4 h-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
