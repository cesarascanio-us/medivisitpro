import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOrganizationId } from './useOrganization';
import { useToast } from './use-toast';

export type PaymentProvider = 'stripe' | 'paypal' | 'binance' | 'pago_movil' | 'bank_transfer' | 'binance_manual' | 'paypal_manual' | 'bolivares';

export interface Plan {
    id: string;
    name: string;
    tier: string;
    description: string;
    features: string[];
}

export interface Price {
    id: string;
    plan_id: string;
    amount: number;
    currency: string;
    interval: 'month' | 'year';
}

export interface Transaction {
    id: string;
    amount: number;
    currency: string;
    status: string;
    provider: string;
    created_at: string;
    provider_transaction_id: string;
}

export function useBilling() {
    const organizationId = useOrganizationId();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [plans, setPlans] = useState<Plan[]>([]);
    const [prices, setPrices] = useState<Price[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [subscription, setSubscription] = useState<any>(null);

    useEffect(() => {
        if (organizationId) {
            loadBillingData();
        }
    }, [organizationId]);

    const loadBillingData = async () => {
        try {
            setLoading(true);

            // Load plans from subscription_plans (Unified System)
            const { data: plansData, error: plansError } = await (supabase as any)
                .from('subscription_plans')
                .select('*')
                .eq('active', true);

            if (plansError) throw plansError;

            // Synthesize prices from the same table (subscription_plans has price)
            const synthesizedPrices: Price[] = (plansData || []).map(p => ({
                id: `price_${p.id}`,
                plan_id: p.id,
                amount: p.price,
                currency: p.currency || 'USD',
                interval: p.interval as 'month' | 'year' || 'month'
            }));

            // Map data to expected Plan interface
            const formattedPlans: Plan[] = (plansData as any[] || []).map(p => {
                let tier = p.name.toLowerCase();
                if (tier.includes('starter') || tier.includes('free')) tier = 'starter';
                if (tier.includes('pro')) tier = 'professional';
                if (tier.includes('team') || tier.includes('enterprise')) tier = 'enterprise';

                return {
                    id: p.id,
                    name: p.name,
                    tier: tier,
                    description: p.description || 'Plan de suscripción personalizado',
                    features: (p.features as unknown as string[]) || []
                };
            });

            // Load current subscription
            const { data: subData } = await (supabase as any)
                .from('subscriptions')
                .select('*, subscription_plans(*)')
                .eq('organization_id', organizationId)
                .maybeSingle();

            // Load transaction history
            const { data: transData } = await (supabase as any)
                .from('billing_transactions')
                .select('*')
                .eq('organization_id', organizationId)
                .order('created_at', { ascending: false });

            // Load pending manual reports
            const { data: manualReports } = await (supabase as any)
                .from('payment_reports')
                .select('*')
                .eq('organization_id', organizationId)
                .order('created_at', { ascending: false });

            const formattedManual = (manualReports as any[] || []).map(report => ({
                id: report.id,
                amount: report.amount_paid,
                currency: 'USD',
                status: report.status,
                provider: report.payment_method,
                created_at: report.created_at,
                provider_transaction_id: report.reference_number
            }));

            setPlans(formattedPlans);
            setPrices(synthesizedPrices);
            setTransactions([...formattedManual, ...((transData as any) || [])]);
            setSubscription(subData);

        } catch (error) {
            console.error('Error loading billing data:', error);
        } finally {
            setLoading(false);
        }
    };

    const createCheckoutSession = async (priceId: string, provider: PaymentProvider) => {
        setLoading(true);
        try {
            if (provider === 'stripe') {
                const { data, error } = await supabase.functions.invoke('create-stripe-checkout', {
                    body: { priceId, organizationId }
                });
                if (error) throw error;
                if (data?.url) window.location.href = data.url;
            }

            else if (provider === 'paypal') {
                toast({ title: 'Redirigiendo a PayPal...', description: 'Espera un momento.' });
                // En el futuro, llamar a una Edge Function para PayPal
            }

            else if (provider === 'binance') {
                const { data, error } = await supabase.functions.invoke('create-binance-order', {
                    body: { priceId, organizationId }
                });
                if (error) throw error;
                return data;
            }

        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Error al iniciar el pago',
                description: error.message
            });
        } finally {
            setLoading(false);
        }
    };

    const createPortalSession = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase.functions.invoke('create-stripe-portal', {
                body: { organizationId }
            });
            if (error) throw error;
            if (data?.url) window.location.href = data.url;
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Error al abrir el portal',
                description: error.message
            });
        } finally {
            setLoading(false);
        }
    };

    const reportManualPayment = async (reportData: {
        planId: string;
        method: string;
        reference: string;
        amount: number;
        proofUrl?: string;
    }) => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Usuario no autenticado');

            const { error } = await (supabase as any).from('payment_reports').insert({
                user_id: user.id,
                organization_id: organizationId,
                plan_id: reportData.planId,
                payment_method: reportData.method,
                reference_number: reportData.reference,
                amount_paid: reportData.amount,
                proof_image_url: reportData.proofUrl,
                status: 'pending'
            });

            if (error) throw error;

            toast({
                title: "Reporte Enviado",
                description: "Tu pago está siendo verificado por nuestro equipo administrativo. Recibirás un correo cuando se active tu plan.",
            });

            return true;
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Error al reportar pago',
                description: error.message
            });
            return false;
        } finally {
            setLoading(false);
        }
    };

    return {
        plans,
        prices,
        transactions,
        subscription,
        loading,
        createCheckoutSession,
        createPortalSession,
        reportManualPayment,
        refresh: loadBillingData
    };
}

