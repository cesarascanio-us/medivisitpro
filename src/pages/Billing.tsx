/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useOrganization, useSubscriptionStatus } from "@/hooks/useOrganization";
import { useBilling, PaymentProvider } from "@/hooks/useBilling";
import { BinancePayGateway } from "@/components/billing/BinancePayGateway";
import { BillingPortal } from "@/components/billing/BillingPortal";
import { ManualPaymentDialog } from "@/components/billing/ManualPaymentDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
    CreditCard,
    Building2,
    Users,
    Package,
    Calendar,
    CheckCircle2,
    AlertCircle,
    ExternalLink,
    Zap,
    Wallet,
    ShieldCheck,
    MessageCircle,
    Shield,
    Globe,
    Smartphone
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function Billing() {
    const navigate = useNavigate();
    const { organization, isLoading, isOrgAdmin } = useOrganization();
    const { status, planTier, trialEndsAt } = useSubscriptionStatus();
    const { plans, prices, transactions, subscription, loading: billingLoading, createCheckoutSession, createPortalSession } = useBilling();

    const [selectedPriceId, setSelectedPriceId] = useState<string | null>(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showManualPaymentDialog, setShowManualPaymentDialog] = useState(false);
    const [binanceOrderData, setBinanceOrderData] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<string>("plans");

    // Redirect non-admins
    useEffect(() => {
        if (!isLoading && !isOrgAdmin) {
            navigate("/dashboard");
        }
    }, [isLoading, isOrgAdmin, navigate]);

    if (isLoading || billingLoading) {
        return (
            <div className="space-y-8 p-6 max-w-7xl mx-auto">
                <Skeleton className="h-[200px] w-full rounded-[2rem] bg-slate-900/50" />
                <div className="flex justify-center">
                    <Skeleton className="h-10 w-[300px] rounded-full bg-slate-900/50" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <Skeleton className="h-[500px] rounded-3xl bg-slate-900/50" />
                    <Skeleton className="h-[500px] rounded-3xl bg-slate-900/50" />
                    <Skeleton className="h-[500px] rounded-3xl bg-slate-900/50" />
                </div>
            </div>
        );
    }

    if (!organization) {
        return (
            <div className="p-6">
                <Card className="border-destructive">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-destructive">
                            <AlertCircle className="h-5 w-5" />
                            No se encontró la organización
                        </CardTitle>
                        <CardDescription>
                            Tu cuenta no está asociada a ninguna organización.
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    const handleSubscribe = (priceId: string) => {
        setSelectedPriceId(priceId);
        setShowPaymentModal(true);
    };

    const handleProviderSelect = async (provider: PaymentProvider) => {
        if (!selectedPriceId) return;

        const result = await createCheckoutSession(selectedPriceId, provider);

        if (provider === 'binance' && result) {
            setBinanceOrderData(result);
        } else if (provider !== 'binance') {
            setShowPaymentModal(false);
        }
    };

    return (
        <div className="space-y-8 p-6 max-w-7xl mx-auto mb-20">
            {/* Header / Active Subscription */}
            <div className="relative overflow-hidden p-8 rounded-[2rem] bg-slate-900 border border-slate-800 shadow-2xl">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Shield className="w-32 h-32 text-emerald-500" />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                            <Building2 className="w-10 h-10 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-1">{organization.name}</h1>
                            <div className="flex items-center gap-3">
                                <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/5">
                                    Plan {planTier?.toUpperCase()}
                                </Badge>
                                <span className="text-slate-500 text-sm">•</span>
                                <span className={`text-sm ${status === 'active' ? 'text-emerald-500' : 'text-amber-500'}`}>
                                    Suscripción {status === 'active' ? 'Activa' : 'Trial'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm">
                        <div className="text-right">
                            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Próximo Pago</p>
                            <p className="font-bold text-white">
                                {subscription?.current_period_end
                                    ? new Date(subscription.current_period_end).toLocaleDateString()
                                    : trialEndsAt ? new Date(trialEndsAt).toLocaleDateString() : 'N/A'
                                }
                            </p>
                        </div>
                        <Separator orientation="vertical" className="h-10 bg-slate-700" />
                        <Button variant="ghost" className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10">
                            Gestionar <ExternalLink className="ml-2 w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex justify-center mb-4">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="p-1 bg-slate-900 border border-slate-800 rounded-full shadow-lg">
                    <TabsList className="bg-transparent border-0 h-10">
                        <TabsTrigger
                            value="plans"
                            className="rounded-full px-8 data-[state=active]:bg-emerald-500 data-[state=active]:text-white transition-all font-bold"
                        >
                            Planes y Precios
                        </TabsTrigger>
                        <TabsTrigger
                            value="portal"
                            className="rounded-full px-8 data-[state=active]:bg-emerald-500 data-[state=active]:text-white transition-all font-bold"
                        >
                            Mi Facturación
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            <Tabs value={activeTab} className="w-full">
                <TabsContent value="plans" className="mt-0 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Pricing Section Title */}
                    <div className="text-center space-y-4 py-6">
                        <h2 className="text-4xl font-bold text-white">Planes Flexibles para tu Equipo</h2>
                        <p className="text-slate-400 max-w-2xl mx-auto">
                            Escoge el plan que mejor se adapte a tu escala. Todos los planes incluyen 14 días de prueba gratuita.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {plans.map((plan) => {
                            const price = prices.find(p => p.plan_id === plan.id && p.interval === 'month');
                            const isCurrent = planTier === plan.tier;

                            return (
                                <Card key={plan.id} className={`relative flex flex-col border-slate-800 bg-slate-900/50 hover:bg-slate-900 transition-all duration-300 ${isCurrent ? 'ring-2 ring-emerald-500/50 shadow-2xl shadow-emerald-500/10' : ''}`}>
                                    {plan.tier === 'professional' && (
                                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full overflow-hidden">
                                            <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white border-0 py-1.5 px-4 rounded-full shadow-lg">
                                                MÁS POPULAR
                                            </Badge>
                                        </div>
                                    )}

                                    <CardHeader>
                                        <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                                        <CardDescription className="text-slate-400">{plan.description}</CardDescription>
                                        <div className="mt-4 flex items-baseline gap-1">
                                            <span className="text-4xl font-bold text-white">${price?.amount || 0}</span>
                                            <span className="text-slate-500">/mes</span>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="flex-1">
                                        <Separator className="mb-6 bg-slate-800" />
                                        <ul className="space-y-4">
                                            {plan.features.map((feature, i) => (
                                                <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                                                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>

                                    <CardFooter>
                                        <Button
                                            className={`w-full h-12 text-base font-bold transition-all ${isCurrent ? 'bg-slate-800 text-emerald-400 hover:bg-slate-700' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}
                                            onClick={() => handleSubscribe(price?.id || '')}
                                            disabled={isCurrent}
                                        >
                                            {isCurrent ? 'Plan Actual' : 'Elegir Plan'}
                                        </Button>
                                    </CardFooter>
                                </Card>
                            );
                        })}
                    </div>
                </TabsContent>

                <TabsContent value="portal" className="mt-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <BillingPortal
                        subscription={subscription}
                        transactions={transactions}
                        onManageSubscription={createPortalSession}
                    />
                </TabsContent>
            </Tabs>

            {/* Payment Modal */}
            <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
                <DialogContent className="sm:max-w-[500px] bg-slate-900 border-slate-800">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-white">Selecciona tu Método de Pago</DialogTitle>
                        <DialogDescription className="text-slate-400">
                            Ofrecemos múltiples opciones seguras para tu comodidad.
                        </DialogDescription>
                    </DialogHeader>

                    {binanceOrderData ? (
                        <BinancePayGateway
                            orderData={binanceOrderData}
                            onSuccess={() => {
                                setShowPaymentModal(false);
                                navigate(0); // Refresh
                            }}
                            onCancel={() => setBinanceOrderData(null)}
                        />
                    ) : (
                        <div className="grid gap-4 py-4">
                            <Button
                                variant="outline"
                                className="h-16 justify-start gap-4 border-slate-700 hover:border-emerald-500 hover:bg-emerald-500/5 transition-all text-slate-300 group"
                                onClick={() => handleProviderSelect('stripe')}
                            >
                                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20">
                                    <CreditCard className="w-6 h-6 text-blue-500" />
                                </div>
                                <div className="text-left">
                                    <p className="font-bold text-white">Tarjeta / Google Pay</p>
                                    <p className="text-xs text-slate-500">Procesado de forma segura por Stripe</p>
                                </div>
                            </Button>

                            <Button
                                variant="outline"
                                className="h-16 justify-start gap-4 border-slate-700 hover:border-indigo-500 hover:bg-indigo-500/5 transition-all text-slate-300 group"
                                onClick={() => handleProviderSelect('paypal')}
                            >
                                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center group-hover:bg-indigo-500/20">
                                    <Globe className="w-6 h-6 text-indigo-500" />
                                </div>
                                <div className="text-left">
                                    <p className="font-bold text-white">PayPal</p>
                                    <p className="text-xs text-slate-500">Usa tu balance de PayPal o cuenta bancaria</p>
                                </div>
                            </Button>

                            <Button
                                variant="outline"
                                className="h-16 justify-start gap-4 border-slate-700 hover:border-yellow-500 hover:bg-yellow-500/5 transition-all text-slate-300 group"
                                onClick={() => handleProviderSelect('binance')}
                            >
                                <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center group-hover:bg-yellow-500/20">
                                    <Wallet className="w-6 h-6 text-yellow-500" />
                                </div>
                                <div className="text-left">
                                    <p className="font-bold text-white">Binance Pay (Crypto)</p>
                                    <p className="text-xs text-slate-500">Paga con USDT, BTC y más sin comisiones</p>
                                </div>
                            </Button>

                            <Separator className="bg-slate-800 my-2" />

                            <Button
                                variant="outline"
                                className="h-16 justify-start gap-4 border-slate-700 hover:border-emerald-500 hover:bg-emerald-500/5 transition-all text-slate-300 group"
                                onClick={() => {
                                    setShowPaymentModal(false);
                                    setShowManualPaymentDialog(true);
                                }}
                            >
                                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20">
                                    <Smartphone className="w-6 h-6 text-emerald-500" />
                                </div>
                                <div className="text-left">
                                    <p className="font-bold text-white">Pago Móvil / Transferencia</p>
                                    <p className="text-xs text-slate-500">Reporta tu pago local en Bolívares</p>
                                </div>
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Manual Payment Dialog */}
            {selectedPriceId && (
                <ManualPaymentDialog
                    open={showManualPaymentDialog}
                    onOpenChange={setShowManualPaymentDialog}
                    planName={plans.find(p => prices.find(pr => pr.id === selectedPriceId)?.plan_id === p.id)?.name || ""}
                    amount={prices.find(p => p.id === selectedPriceId)?.amount || 0}
                />
            )}

            {/* Premium Trust Badges */}
            <div className="pt-20 pb-10 border-t border-slate-800/50">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 opacity-40 hover:opacity-100 transition-opacity">
                    <div className="flex flex-col items-center gap-3">
                        <ShieldCheck className="w-8 h-8 text-emerald-500" />
                        <div className="text-center">
                            <p className="text-white font-bold text-xs uppercase tracking-tight">PAGO SEGURO</p>
                            <p className="text-[10px] text-slate-500">256-bit SSL Encryption</p>
                        </div>
                    </div>
                    <div className="flex flex-col items-center gap-3">
                        <Zap className="w-8 h-8 text-amber-500" />
                        <div className="text-center">
                            <p className="text-white font-bold text-xs uppercase tracking-tight">ENTREGA INSTANTÁNEA</p>
                            <p className="text-[10px] text-slate-500">Activación automática</p>
                        </div>
                    </div>
                    <div className="flex flex-col items-center gap-3">
                        <Globe className="w-8 h-8 text-blue-500" />
                        <div className="text-center">
                            <p className="text-white font-bold text-xs uppercase tracking-tight">MULTI-MONEDA</p>
                            <p className="text-[10px] text-slate-500">USD, EUR, USDT & más</p>
                        </div>
                    </div>
                    <div className="flex flex-col items-center gap-3">
                        <MessageCircle className="w-8 h-8 text-teal-500" />
                        <div className="text-center">
                            <p className="text-white font-bold text-xs uppercase tracking-tight">SOPORTE 24/7</p>
                            <p className="text-[10px] text-slate-500">Asistencia prioritaria</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
