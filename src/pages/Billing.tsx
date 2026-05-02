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
        <div className="space-y-8 p-6 max-w-7xl mx-auto mb-20 font-sans animate-in fade-in duration-700">
            {/* Header / Active Subscription */}
            <div className="relative overflow-hidden p-8 rounded-[2rem] bg-card border border-slate-100 shadow-premium-lg">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Shield className="w-32 h-32 text-primary" />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/20">
                            <Building2 className="w-10 h-10 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-foreground mb-1 font-display tracking-tighter uppercase">{organization.name}</h1>
                            <div className="flex items-center gap-3">
                                <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5 font-black text-[10px] tracking-widest uppercase ">
                                    Plan {planTier?.toUpperCase()}
                                </Badge>
                                <span className="text-slate-300 text-sm">•</span>
                                <span className={`text-xs font-black uppercase tracking-widest ${status === 'active' ? 'text-emerald-600' : 'text-amber-600'}`}>
                                    Suscripción {status === 'active' ? 'Activa' : 'Trial'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-100 shadow-inner text-slate-900">
                        <div className="text-right">
                            <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Próximo Pago</p>
                            <p className="font-black text-foreground tabular-nums ">
                                {subscription?.current_period_end
                                    ? new Date(subscription.current_period_end).toLocaleDateString()
                                    : trialEndsAt ? new Date(trialEndsAt).toLocaleDateString() : 'N/A'
                                }
                            </p>
                        </div>
                        <Separator orientation="vertical" className="h-10 bg-slate-200 text-slate-900" />
                        <Button variant="ghost" className="text-primary font-black uppercase text-[10px] tracking-widest hover:text-primary/70 hover:bg-primary/5">
                            Gestionar <ExternalLink className="ml-2 w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex justify-center mb-4">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="p-1 bg-slate-50 border border-slate-100 rounded-full shadow-soft text-slate-900">
                    <TabsList className="bg-transparent border-0 h-11">
                        <TabsTrigger
                            value="plans"
                            className="rounded-full px-8 data-[state=active]:bg-primary data-[state=active]:text-white transition-all font-black uppercase text-[10px] tracking-widest "
                        >
                            Planes y Precios
                        </TabsTrigger>
                        <TabsTrigger
                            value="portal"
                            className="rounded-full px-8 data-[state=active]:bg-primary data-[state=active]:text-white transition-all font-black uppercase text-[10px] tracking-widest "
                        >
                            Mi Facturación
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            <Tabs value={activeTab} className="w-full">
                <TabsContent value="plans" className="mt-0 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Pricing Section Title */}
                    <div className="text-center space-y-4 py-10">
                        <h2 className="text-4xl font-black text-foreground uppercase tracking-tighter font-display leading-tight">Planes Flexibles para tu Equipo</h2>
                        <p className="text-slate-400 max-w-2xl mx-auto font-medium text-sm ">
                            Escoge el plan que mejor se adapte a tu escala corporativa. Todos los planes incluyen 14 días de prueba gratuita "Full-Access".
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {plans.map((plan) => {
                            const price = prices.find(p => p.plan_id === plan.id && p.interval === 'month');
                            const isCurrent = planTier === plan.tier;

                            return (
                                <Card key={plan.id} className={`relative flex flex-col border-slate-100 bg-card hover:bg-slate-50 transition-all duration-500 shadow-premium-md hover:shadow-premium-lg rounded-[2.5rem] overflow-hidden group ${isCurrent ? 'ring-2 ring-primary/20 bg-slate-50/50' : ''}`}>
                                    {plan.tier === 'professional' && (
                                        <div className="absolute top-0 right-0 p-0 overflow-hidden">
                                            <div className="bg-primary text-white text-[8px] font-black uppercase tracking-widest py-1.5 px-10 rotate-45 translate-x-10 translate-y-2 shadow-lg">
                                                ELITE CHOICE
                                            </div>
                                        </div>
                                    )}

                                    <CardHeader className="p-10 pb-6">
                                        <CardTitle className="text-2xl font-black text-foreground uppercase tracking-tighter font-display group-hover:text-primary transition-colors">{plan.name}</CardTitle>
                                        <CardDescription className="text-slate-400 font-medium text-xs leading-relaxed">{plan.description}</CardDescription>
                                        <div className="mt-8 flex items-baseline gap-2">
                                            <span className="text-5xl font-black text-foreground tracking-tighter tabular-nums ">${price?.amount || 0}</span>
                                            <span className="text-slate-400 font-black text-[10px] uppercase tracking-widest">/mes</span>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="px-10 py-6 flex-1">
                                        <Separator className="mb-8 bg-slate-100 text-slate-900" />
                                        <ul className="space-y-4">
                                            {plan.features.map((feature, i) => (
                                                <li key={i} className="flex items-start gap-3 text-sm text-slate-600 font-medium">
                                                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>

                                    <CardFooter className="p-10 pt-6">
                                        <Button
                                            className={`w-full h-14 rounded-2xl font-black uppercase text-xs tracking-widest transition-all active:scale-95 shadow-lg ${isCurrent ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-primary text-white hover:bg-primary/90 hover:shadow-primary/20'}`}
                                            onClick={() => handleSubscribe(price?.id || '')}
                                            disabled={isCurrent}
                                        >
                                            {isCurrent ? 'Plan Activo' : 'Seleccionar Plan'}
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
                <DialogContent className="sm:max-w-[500px] bg-card border border-slate-100 rounded-[2.5rem] shadow-premium-2xl overflow-hidden p-0">
                    <div className="bg-slate-50 p-10 border-b border-slate-100 text-slate-900">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-black text-foreground uppercase tracking-tighter font-display leading-tight">Método de Pago Seguro</DialogTitle>
                            <DialogDescription className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-2">
                                Procesamiento Encriptado de Grado Bancario
                            </DialogDescription>
                        </DialogHeader>
                    </div>
                    <div className="p-10">

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
                        <div className="grid gap-4 py-2">
                            <Button
                                variant="outline"
                                className="h-20 justify-start gap-4 border-slate-100 bg-card hover:border-primary hover:bg-primary/5 transition-all text-slate-400 group rounded-[1.5rem] shadow-soft"
                                onClick={() => handleProviderSelect('stripe')}
                            >
                                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors text-slate-900">
                                    <CreditCard className="w-6 h-6 text-blue-600" />
                                </div>
                                <div className="text-left">
                                    <p className="font-black text-foreground uppercase tracking-tighter">Tarjeta / Google Pay</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Powered by Stripe Security</p>
                                </div>
                            </Button>

                            <Button
                                variant="outline"
                                className="h-20 justify-start gap-4 border-slate-100 bg-card hover:border-indigo-500 hover:bg-indigo-500/5 transition-all text-slate-400 group rounded-[1.5rem] shadow-soft"
                                onClick={() => handleProviderSelect('paypal')}
                            >
                                <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                                    <Globe className="w-6 h-6 text-indigo-600" />
                                </div>
                                <div className="text-left">
                                    <p className="font-black text-foreground uppercase tracking-tighter">PayPal Global</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Balance o Cuentas Externas</p>
                                </div>
                            </Button>

                            <Button
                                variant="outline"
                                className="h-20 justify-start gap-4 border-slate-100 bg-card hover:border-yellow-500 hover:bg-yellow-500/5 transition-all text-slate-400 group rounded-[1.5rem] shadow-soft"
                                onClick={() => handleProviderSelect('binance')}
                            >
                                <div className="w-12 h-12 rounded-xl bg-yellow-50 flex items-center justify-center group-hover:bg-yellow-100 transition-colors">
                                    <Wallet className="w-6 h-6 text-yellow-600" />
                                </div>
                                <div className="text-left">
                                    <p className="font-black text-foreground uppercase tracking-tighter">Binance Pay (Crypto)</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">USDT, BTC & Zero Fees</p>
                                </div>
                            </Button>

                            <Separator className="bg-slate-100 my-4 text-slate-900" />

                            <Button
                                variant="outline"
                                className="h-20 justify-start gap-4 border-slate-100 bg-card hover:border-emerald-500 hover:bg-emerald-500/5 transition-all text-slate-400 group rounded-[1.5rem] shadow-soft"
                                onClick={() => {
                                    setShowPaymentModal(false);
                                    setShowManualPaymentDialog(true);
                                }}
                            >
                                <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-100 transition-colors text-slate-900">
                                    <Smartphone className="w-6 h-6 text-emerald-600" />
                                </div>
                                <div className="text-left">
                                    <p className="font-black text-foreground uppercase tracking-tighter">Pago Móvil / Transferencia</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Gestión Local en Bolívares</p>
                                </div>
                            </Button>
                        </div>
                    )}
                    </div>
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
            <div className="pt-20 pb-10 border-t border-slate-100">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 opacity-60 hover:opacity-100 transition-opacity">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-slate-900">
                            <ShieldCheck className="w-8 h-8 text-emerald-600" />
                        </div>
                        <div className="text-center">
                            <p className="text-foreground font-black text-[10px] uppercase tracking-widest">PAGO SEGURO</p>
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">256-BIT SSL ENCRYPTION</p>
                        </div>
                    </div>
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center">
                            <Zap className="w-8 h-8 text-primary" />
                        </div>
                        <div className="text-center">
                            <p className="text-foreground font-black text-[10px] uppercase tracking-widest">ENTREGA INSTANTÁNEA</p>
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">ACTIVACIÓN AUTOMÁTICA</p>
                        </div>
                    </div>
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center">
                            <Globe className="w-8 h-8 text-indigo-600" />
                        </div>
                        <div className="text-center">
                            <p className="text-foreground font-black text-[10px] uppercase tracking-widest">MULTI-MONEDA</p>
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">USD, EUR, USDT & MÁS</p>
                        </div>
                    </div>
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-cyan-50 flex items-center justify-center">
                            <MessageCircle className="w-8 h-8 text-cyan-600" />
                        </div>
                        <div className="text-center">
                            <p className="text-foreground font-black text-[10px] uppercase tracking-widest">SOPORTE 24/7</p>
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">ASISTENCIA PRIORITARIA</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
