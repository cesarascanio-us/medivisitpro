import { Check, X, CreditCard, Globe, Smartphone, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { trackEvent } from '@/lib/analytics';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ManualPaymentDialog } from '@/components/billing/ManualPaymentDialog';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PricingPlan {
    id: string;
    name: string;
    price: number;
    interval: string;
    description?: string; // Optional to fix TS error
    features: string[];
    active: boolean;
}

export const PricingSection = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [plans, setPlans] = useState<PricingPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
    const [selectedPlanDetails, setSelectedPlanDetails] = useState({ name: '', price: '' });

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const { data, error } = await supabase
                    .from('subscription_plans')
                    .select('*')
                    .eq('active', true)
                    .order('price', { ascending: true });

                if (error) throw error;
                if (data) setPlans(data);
            } catch (error) {
                console.error('Error loading plans:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPlans();
    }, []);

    const handlePlanClick = (planName: string, planPrice: number) => {
        trackEvent('click_pricing_plan', { plan: planName });

        const isTeam = planName.toLowerCase().includes('team') || planName.toLowerCase().includes('enterprise');

        if (isTeam || planPrice === 0) {
            window.open("https://api.whatsapp.com/send?phone=584123411879&text=Hola,%20me%20interesa%20el%20plan%20Corporativo", "_blank");
        } else {
            if (!user) {
                navigate('/auth?redirect=pricing');
                return;
            }

            setSelectedPlanDetails({ name: planName, price: `$${planPrice}` });
            setIsPaymentDialogOpen(true);
        }
    };

    if (loading) {
        return (
            <section className="py-24 bg-slate-900 flex justify-center">
                <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
            </section>
        );
    }

    return (
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-900 relative overflow-hidden" id="pricing">
            {/* Background decoration */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                        Inversión que se paga sola en un día
                    </h2>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                        Pagos locales en Venezuela: PayPal, Binance, Pago Móvil y Transferencia.
                        <br />
                        <span className="text-emerald-400 font-medium">¿Quieres probar antes? La demo es totalmente gratis.</span>
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {plans.map((plan) => {
                        const isPopular = plan.name.toLowerCase().includes('pro') || plan.name.toLowerCase().includes('professional');
                        const isTeam = plan.name.toLowerCase().includes('team') || plan.name.toLowerCase().includes('enterprise');
                        const priceDisplay = plan.price === 0 ? 'Consultar' : `$${plan.price}`;
                        const ctaText = isTeam || plan.price === 0 ? 'Contactar Ventas' : `Elegir ${plan.name}`;

                        return (
                            <div
                                key={plan.id}
                                className={`relative bg-slate-800/50 rounded-2xl p-8 border ${isPopular
                                    ? 'border-emerald-500 shadow-2xl shadow-emerald-500/20 scale-105 z-10'
                                    : 'border-slate-700 hover:border-slate-600'
                                    } transition-all duration-300 flex flex-col`}
                            >
                                {isPopular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold px-4 py-1.5 rounded-full tracking-wide uppercase shadow-lg">
                                        Más Popular
                                    </div>
                                )}

                                <div className="mb-8">
                                    <h3 className="text-xl font-semibold text-white mb-2">{plan.name}</h3>
                                    <div className="flex items-baseline gap-1 mb-4">
                                        <span className="text-4xl font-bold text-white">{priceDisplay}</span>
                                        {plan.price > 0 && <span className="text-slate-400 text-sm">/mes</span>}
                                    </div>
                                    <p className="text-slate-400 text-sm">{plan.description || 'Acceso completo a la plataforma.'}</p>
                                </div>

                                <ul className="space-y-4 mb-8 flex-1">
                                    {plan.features?.map((feature, i) => (
                                        <li key={i} className="flex items-start gap-3 text-sm">
                                            <Check className="h-5 w-5 text-emerald-400 shrink-0" />
                                            <span className="text-slate-200">
                                                {feature}
                                            </span>
                                        </li>
                                    ))}
                                </ul>

                                <Button
                                    onClick={() => handlePlanClick(plan.name, plan.price)}
                                    className={`w-full h-12 text-base font-semibold transition-all ${isPopular
                                        ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/25'
                                        : 'bg-slate-700 hover:bg-slate-600 text-white'
                                        }`}
                                    variant={isPopular ? 'default' : 'outline'}
                                >
                                    {ctaText}
                                </Button>

                                {/* Payment Icons for Pro Plan */}
                                {isPopular && (
                                    <div className="mt-4 flex items-center justify-center gap-3 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
                                        <div className="flex flex-col items-center gap-1 text-center w-full">
                                            <div className="flex gap-4 mb-1">
                                                <Globe className="w-4 h-4 text-slate-400" />
                                                <CreditCard className="w-4 h-4 text-slate-400" />
                                                <Smartphone className="w-4 h-4 text-slate-400" />
                                            </div>
                                            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">PayPal · Binance · Pago Móvil</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            <ManualPaymentDialog
                open={isPaymentDialogOpen}
                onOpenChange={setIsPaymentDialogOpen}
                planName={selectedPlanDetails.name}
                amount={selectedPlanDetails.price}
            />
        </section>
    );
};

