import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOrganizationId } from './useOrganization';
import { useToast } from './use-toast';

export type PaymentProvider = 'stripe' | 'paypal' | 'binance';

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

            // Load transaction history
            const { data: transData } = await supabase
                .from('billing_transactions')
                .select('*')
                .eq('organization_id', organizationId)
                .order('created_at', { ascending: false });

            setPlans((plansData as any) || [] as Plan[]);
            setPrices((pricesData as any) || [] as Price[]);
            setTransactions((transData as any) || [] as Transaction[]);
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

    return {
        plans,
        prices,
        transactions,
        subscription,
        loading,
        createCheckoutSession,
        createPortalSession,
        refresh: loadBillingData
    };
}
