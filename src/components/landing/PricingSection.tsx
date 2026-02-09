import { Check, X, CreditCard, Globe, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { trackEvent } from '@/lib/analytics';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ManualPaymentDialog } from '@/components/billing/ManualPaymentDialog';
import { useState } from 'react';

const plans = [
    {
        name: 'Starter',
        price: 'Gratis',
        description: 'Para estudiantes y nuevos visitadores.',
        features: [
            { name: 'Gestión de hasta 50 médicos', included: true },
            { name: 'Rutas optimizadas básicas', included: true },
            { name: 'Agenda digital', included: true },
            { name: 'Control de inventario', included: false },
            { name: 'Reportes avanzados', included: false },
            { name: 'Soporte prioritario', included: false },
        ],
        cta: 'Empezar Gratis',
        popular: false,
    },
    {
        name: 'Pro',
        price: '$9.99',
        period: '/mes',
        description: 'Para visitadores de alto rendimiento.',
        features: [
            { name: 'Médicos ilimitados', included: true },
            { name: 'Rutas inteligentes ilimitadas', included: true },
            { name: 'Control de stock de muestras', included: true },
            { name: 'Analytics de desempeño', included: true },
            { name: 'Exportación a PDF/Excel', included: true },
            { name: 'Soporte prioritario', included: true },
        ],
        cta: 'Reportar Pago Pro',
        popular: true,
    },
    {
        name: 'Team',
        price: 'Consultar',
        description: 'Para laboratorios y gerentes de distrito.',
        features: [
            { name: 'Todo lo del plan Pro', included: true },
            { name: 'Dashboard de gerencia', included: true },
            { name: 'Asignación de zonas', included: true },
            { name: 'Reportes consolidados', included: true },
            { name: 'Soporte dedicado 24/7', included: true },
            { name: 'Facturación corporativa', included: true },
        ],
        cta: 'Contactar Ventas',
        popular: false,
    },
];

export const PricingSection = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
    const [selectedPlanDetails, setSelectedPlanDetails] = useState({ name: '', price: '' });

    const handlePlanClick = (planName: string, planPrice: string) => {
        trackEvent('click_pricing_plan', { plan: planName });

        if (planName === 'Team') {
            window.open("https://api.whatsapp.com/send?phone=584123411879&text=Hola,%20me%20interesa%20el%20plan%20Team%20para%20mi%20laboratorio", "_blank");
        } else if (planName === 'Pro') {
            if (!user) {
                navigate('/auth?redirect=pricing');
                return;
            }

            setSelectedPlanDetails({ name: planName, price: planPrice });
            setIsPaymentDialogOpen(true);
        } else {
            navigate('/auth');
        }
    };


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
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {plans.map((plan) => (
                        <div
                            key={plan.name}
                            className={`relative bg-slate-800/50 rounded-2xl p-8 border ${plan.popular
                                ? 'border-emerald-500 shadow-2xl shadow-emerald-500/20 scale-105 z-10'
                                : 'border-slate-700 hover:border-slate-600'
                                } transition-all duration-300 flex flex-col`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold px-4 py-1.5 rounded-full tracking-wide uppercase shadow-lg">
                                    Más Popular
                                </div>
                            )}

                            <div className="mb-8">
                                <h3 className="text-xl font-semibold text-white mb-2">{plan.name}</h3>
                                <div className="flex items-baseline gap-1 mb-4">
                                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                                    {plan.period && <span className="text-slate-400 text-sm">{plan.period}</span>}
                                </div>
                                <p className="text-slate-400 text-sm">{plan.description}</p>
                            </div>

                            <ul className="space-y-4 mb-8 flex-1">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm">
                                        {feature.included ? (
                                            <Check className="h-5 w-5 text-emerald-400 shrink-0" />
                                        ) : (
                                            <X className="h-5 w-5 text-slate-600 shrink-0" />
                                        )}
                                        <span className={feature.included ? 'text-slate-200' : 'text-slate-600'}>
                                            {feature.name}
                                        </span>
                                    </li>
                                ))}
                            </ul>

                            <Button
                                onClick={() => handlePlanClick(plan.name, plan.price)}
                                className={`w-full h-12 text-base font-semibold transition-all ${plan.popular
                                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/25'
                                    : 'bg-slate-700 hover:bg-slate-600 text-white'
                                    }`}
                                variant={plan.popular ? 'default' : 'outline'}
                            >
                                {plan.cta}
                            </Button>

                            {/* Payment Icons for Pro Plan */}
                            {plan.name === 'Pro' && (
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
                    ))}
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

