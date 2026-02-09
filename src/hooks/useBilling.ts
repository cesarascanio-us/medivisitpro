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

            // Load plans
            const { data: plansData } = await supabase
                .from('billing_plans')
                .select('*')
                .eq('is_active', true);

            // Load prices
            const { data: pricesData } = await supabase
                .from('billing_prices')
                .select('*')
                .eq('is_active', true);

            // Load current subscription
            const { data: subData } = await supabase
                .from('subscriptions')
                .select('*, billing_plans(*)')
                .eq('organization_id', organizationId)
                .maybeSingle();

            // Load transaction history (from billing_transactions)
            const { data: transData } = await supabase
                .from('billing_transactions')
                .select('*')
                .eq('organization_id', organizationId)
                .order('created_at', { ascending: false });

            // Load pending manual reports to show in history
            const { data: manualReports } = await supabase
                .from('payment_reports')
                .select('*')
                .eq('organization_id', organizationId)
                .order('created_at', { ascending: false });

            const formattedManual = (manualReports || []).map(report => ({
                id: report.id,
                amount: report.amount_paid,
                currency: 'USD',
                status: report.status,
                provider: report.payment_method,
                created_at: report.created_at,
                provider_transaction_id: report.reference_number
            }));

            setPlans((plansData as any) || [] as Plan[]);
            setPrices((pricesData as any) || [] as Price[]);
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

            const { error } = await supabase.from('payment_reports').insert({
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

