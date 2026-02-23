/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { RefreshCw, TrendingUp } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';

export const CommissionCalculator = () => {
    const [visitsPerDay, setVisitsPerDay] = useState(12);
    const [avgCommission, setAvgCommission] = useState(500);
    const [conversionRate, setConversionRate] = useState(15);
    const [showResult, setShowResult] = useState(false);

    // Assumptions:
    // - Optimization saves 15% time -> 15% more visits
    // - Better tracking improves conversion by 10% (relative)

    const currentMonthlyIncome = visitsPerDay * 20 * (conversionRate / 100) * (avgCommission / 10);

    const calculatePotential = () => {
        trackEvent('calculate_commissions', { visits: visitsPerDay, commission: avgCommission });
        setShowResult(true);
    };

    const extraVisits = Math.round(visitsPerDay * 0.2); // 20% more visits
    const extraEarnings = Math.round((avgCommission * 0.25)); // 25% increase hardcoded logic for demo impact

    return (
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white border-y border-gray-100">
            <div className="max-w-4xl mx-auto">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-6">
                            <TrendingUp className="h-3 w-3" />
                            Calculadora de Potencial
                        </div>
                        <h2 className="text-3xl font-bold text-text-main mb-4">
                            ¿Cuánto dinero estás dejando en la mesa?
                        </h2>
                        <p className="text-text-muted mb-6">
                            Descubre cuánto podrías aumentar tus comisiones mensuales simplemente optimizando tu ruta y mejorando el seguimiento.
                        </p>

                        <div className="bg-surface p-6 rounded-2xl border border-gray-200 space-y-6 corporate-card">
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <Label className="text-text-main">Visitas diarias actuales</Label>
                                    <span className="text-primary font-mono font-bold">{visitsPerDay}</span>
                                </div>
                                <Slider
                                    value={[visitsPerDay]}
                                    onValueChange={(v) => { setVisitsPerDay(v[0]); setShowResult(false); }}
                                    min={5}
                                    max={25}
                                    step={1}
                                    className="py-2"
                                />
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <Label className="text-text-main">Comisión Mensual Promedio ($)</Label>
                                    <span className="text-primary font-mono font-bold">${avgCommission}</span>
                                </div>
                                <Slider
                                    value={[avgCommission]}
                                    onValueChange={(v) => { setAvgCommission(v[0]); setShowResult(false); }}
                                    min={200}
                                    max={5000}
                                    step={50}
                                    className="py-2"
                                />
                            </div>

                            <Button
                                onClick={calculatePotential}
                                className="w-full btn-primary h-12"
                            >
                                Calcular Potencial
                            </Button>
                        </div>
                    </div>

                    <div className="relative">
                        {showResult ? (
                            <div className="bg-gradient-to-br from-primary to-accent border border-primary/20 rounded-3xl p-8 text-center animate-in fade-in zoom-in duration-500 text-white shadow-card">
                                <h3 className="text-white/80 text-sm font-medium uppercase tracking-wider mb-2">Podrías ganar extra</h3>
                                <div className="text-5xl font-extrabold text-white mb-2">
                                    +${extraEarnings}
                                    <span className="text-lg text-white/80 ml-1">/mes</span>
                                </div>
                                <p className="text-white/90 text-sm mb-8">
                                    Al recuperar tiempo para <strong>{extraVisits} visitas más al día</strong>.
                                </p>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-sm text-white/90 bg-white/10 p-3 rounded-lg">
                                        <Check className="h-4 w-4 text-white" />
                                        <span>Sin trabajar horas extra</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-white/90 bg-white/10 p-3 rounded-lg">
                                        <Check className="h-4 w-4 text-white" />
                                        <span>Optimizando tu ruta actual</span>
                                    </div>
                                </div>
                                <Button className="w-full mt-8 bg-white text-primary hover:bg-gray-50 font-bold border-none">
                                    Quiero esos ${extraEarnings} extra
                                </Button>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center text-center h-full min-h-[300px] border-2 border-dashed border-gray-300 rounded-3xl p-8 opacity-50">
                                <RefreshCw className="h-12 w-12 text-gray-400 mb-4" />
                                <p className="text-gray-500 font-medium">
                                    Ajusta los valores y pulsa calcular para ver tu proyección.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

// Icon helper
function Check(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <polyline points="20 6 9 17 4 12" />
        </svg>
    );
}
