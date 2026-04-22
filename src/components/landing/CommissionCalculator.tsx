/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { TrendingUp, Check, Calculator, Info } from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

export const CommissionCalculator = () => {
    const [visitsPerDay, setVisitsPerDay] = useState(12);
    const [conversionRate, setConversionRate] = useState(10); // Percentage
    const [commissionPerSale, setCommissionPerSale] = useState(50); // USD

    // Logic: 
    // Current Monthly Sales = Visits * 20 days * (Conversion / 100)
    // Potential: Optimization adds 20% more visits (Sentinel Efficiency)
    
    const WORK_DAYS = 20;
    const currentSales = (visitsPerDay * WORK_DAYS * (conversionRate / 100));
    const currentIncome = Math.round(currentSales * commissionPerSale);
    
    const extraVisits = Math.round(visitsPerDay * 0.25); // 25% efficiency gain
    const potentialSales = ((visitsPerDay + extraVisits) * WORK_DAYS * (conversionRate / 100));
    const potentialIncome = Math.round(potentialSales * commissionPerSale);
    const extraEarnings = potentialIncome - currentIncome;

    return (
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-card border-y border-slate-100">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-primary text-xs font-black uppercase tracking-[0.2em] mb-6">
                        <Calculator className="h-3.5 w-3.5" />
                        Simulador de Rentabilidad Maestro
                    </div>
                    <h2 className="text-4xl sm:text-6xl font-black text-slate-900 mb-6 tracking-tight">
                        Tu tiempo es <span className="text-primary ">Capital.</span>
                    </h2>
                    <p className="text-slate-500 text-lg max-w-2xl mx-auto font-medium">
                        Calcula el impacto financiero REAL de optimizar tu ruta y seguimiento con el estándar Sentinel.
                    </p>
                </div>

                <div className="grid lg:grid-cols-12 gap-8 items-start">
                    {/* Control Panel */}
                    <div className="lg:col-span-7 space-y-6">
                        <div className="bg-slate-50 p-8 sm:p-10 rounded-[3rem] border border-slate-200 shadow-sm space-y-10">
                            
                            {/* Input 1: Activities */}
                            <div className="space-y-6">
                                <div className="flex justify-between items-end">
                                    <div className="space-y-1">
                                        <Label className="text-slate-900 font-black text-xs uppercase tracking-widest">Actividad Diaria</Label>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase ">Promedio de visitas médicas efectivas</p>
                                    </div>
                                    <span className="text-4xl font-black text-primary">{visitsPerDay} <span className="text-xs text-slate-400">Visitas</span></span>
                                </div>
                                <Slider
                                    value={[visitsPerDay]}
                                    onValueChange={(v) => setVisitsPerDay(v[0])}
                                    min={5}
                                    max={30}
                                    step={1}
                                    className="py-2"
                                />
                            </div>

                            {/* Input 2: Conversion */}
                            <div className="space-y-6">
                                <div className="flex justify-between items-end">
                                    <div className="space-y-1">
                                        <Label className="text-slate-900 font-black text-xs uppercase tracking-widest">Tasa de Conversión</Label>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase ">% de visitas que se traducen en venta/receta</p>
                                    </div>
                                    <span className="text-4xl font-black text-primary">{conversionRate}%</span>
                                </div>
                                <Slider
                                    value={[conversionRate]}
                                    onValueChange={(v) => setConversionRate(v[0])}
                                    min={1}
                                    max={50}
                                    step={1}
                                    className="py-2"
                                />
                            </div>

                            {/* Input 3: Commission */}
                            <div className="space-y-6">
                                <div className="flex justify-between items-end">
                                    <div className="space-y-1">
                                        <Label className="text-slate-900 font-black text-xs uppercase tracking-widest">Comisión por Venta</Label>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase ">Incentivo promedio por unidad/vial colocado</p>
                                    </div>
                                    <span className="text-4xl font-black text-primary">${commissionPerSale} <span className="text-xs text-slate-400">USD</span></span>
                                </div>
                                <Slider
                                    value={[commissionPerSale]}
                                    onValueChange={(v) => setCommissionPerSale(v[0])}
                                    min={5}
                                    max={500}
                                    step={5}
                                    className="py-2"
                                />
                            </div>

                            {/* Formula Box */}
                            <div className="pt-8 border-t border-slate-200">
                                <div className="bg-card p-5 rounded-3xl border border-slate-100 flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 text-slate-400 shrink-0">
                                        <Info className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Fórmula de Proyección CA</p>
                                        <p className="text-xs text-slate-600 leading-relaxed font-mono">
                                            ({visitsPerDay} Visitas × {WORK_DAYS} Días) × ({conversionRate}% Conv.) × ${commissionPerSale} Comisión = <span className="text-primary font-bold">${currentIncome}</span> Ingreso Base
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Result Panel */}
                    <div className="lg:col-span-5 h-full">
                        <div className="bg-slate-900 rounded-[3.5rem] p-10 sm:p-12 text-white h-full shadow-2xl relative overflow-hidden flex flex-col justify-between border border-slate-800">
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-12">
                                    <h3 className="text-primary text-xs font-black uppercase tracking-[0.3em]">Sentinel Impact</h3>
                                    <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-widest">
                                        Eficiencia +25%
                                    </div>
                                </div>

                                <div className="mb-10">
                                    <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-2">Potencial Extra Mensual</p>
                                    <div className="text-7xl sm:text-8xl font-black text-white tracking-tighter leading-none mb-4">
                                        +${extraEarnings}
                                    </div>
                                    <p className="text-primary font-black text-sm uppercase tracking-widest ">Capital recuperado por ciclo</p>
                                </div>

                                <div className="space-y-5 mb-12">
                                    <div className="p-5 rounded-[2rem] bg-background/5 border border-white/10 flex items-center gap-5">
                                        <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center shrink-0">
                                            <TrendingUp className="w-6 h-6 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-white uppercase tracking-widest">Alcance Maestro</p>
                                            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">+{extraVisits} visitas efectivas / día</p>
                                        </div>
                                    </div>
                                    <div className="p-5 rounded-[2rem] bg-background/5 border border-white/10 flex items-center gap-5">
                                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center shrink-0">
                                            <Check className="w-6 h-6 text-emerald-500" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-white uppercase tracking-widest">Capacidad Instalada</p>
                                            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">Optimizado para {WORK_DAYS} días laborales</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Button className="relative z-10 w-full h-16 bg-primary text-white hover:bg-primary-dark transition-all font-black text-xl rounded-2xl border-none shadow-2xl shadow-primary/30 uppercase tracking-tight">
                                Activar Protocolo de Ventas
                            </Button>

                            {/* Background decoration */}
                            <div className="absolute bottom-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-[120px] -mb-40 -mr-40 pointer-events-none"></div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
