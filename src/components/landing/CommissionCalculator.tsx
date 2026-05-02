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
        <section className="py-20 lg:py-32 px-4 sm:px-6 lg:px-8 bg-slate-950 border-y border-white/5">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16 lg:mb-20">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[9px] font-black uppercase tracking-[0.4em] mb-8">
                        <Calculator className="h-4 w-4" />
                        Simulador de Rentabilidad Maestro
                    </div>
                    <h2 className="text-3xl sm:text-5xl lg:text-7xl font-black text-white mb-6 lg:mb-8 tracking-tighter uppercase">
                        TU TIEMPO ES <span className="text-blue-500">CAPITAL.</span>
                    </h2>
                    <p className="text-slate-400 text-base lg:text-lg max-w-2xl mx-auto font-medium leading-relaxed">
                        Calcula el impacto financiero real de optimizar tu ruta y seguimiento con el estándar de inteligencia operativa MediVisitPro.
                    </p>
                </div>

                <div className="grid lg:grid-cols-12 gap-12 items-stretch">
                    {/* Control Panel */}
                    <div className="lg:col-span-7">
                        <div className="bg-white/5 p-8 sm:p-12 rounded-[3.5rem] border border-white/10 shadow-2xl space-y-12 backdrop-blur-3xl h-full">
                            
                            {/* Input 1: Activities */}
                            <div className="space-y-6">
                                <div className="flex justify-between items-end">
                                    <div className="space-y-1">
                                        <Label className="text-white font-bold text-sm ml-1">Actividad Diaria</Label>
                                        <p className="text-xs text-slate-500 font-medium">Visitas médicas efectivas por jornada</p>
                                    </div>
                                    <span className="text-5xl font-black text-blue-500 tracking-tighter">{visitsPerDay} <span className="text-xs text-slate-600 uppercase font-black ml-1 tracking-widest">vst</span></span>
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
                                        <Label className="text-white font-bold text-sm ml-1">Tasa de Conversión</Label>
                                        <p className="text-xs text-slate-500 font-medium">% de visitas con cierre de venta o receta</p>
                                    </div>
                                    <span className="text-5xl font-black text-blue-500 tracking-tighter">{conversionRate}<span className="text-2xl ml-1">%</span></span>
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
                                        <Label className="text-white font-bold text-sm ml-1">Incentivo Promedio</Label>
                                        <p className="text-xs text-slate-500 font-medium">Comisión neta por unidad colocada</p>
                                    </div>
                                    <span className="text-5xl font-black text-blue-500 tracking-tighter"><span className="text-2xl mr-1">$</span>{commissionPerSale}</span>
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
                            <div className="pt-10 border-t border-white/5">
                                <div className="bg-black/40 p-6 rounded-3xl border border-white/5 flex items-start gap-5">
                                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 text-slate-500 shrink-0">
                                        <Info className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Algoritmo de Proyección Operativa</p>
                                        <p className="text-xs text-slate-400 leading-relaxed font-medium">
                                            ({visitsPerDay} Vst × {WORK_DAYS} Días) × ({conversionRate}% Conv.) × ${commissionPerSale} USD = <span className="text-blue-400 font-bold">${currentIncome}</span> Ingreso mensual base
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Result Panel */}
                    <div className="lg:col-span-5">
                        <div className="bg-slate-900 rounded-[3.5rem] p-10 lg:p-12 text-white h-full shadow-2xl relative overflow-hidden flex flex-col justify-between border border-white/10 group">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                            
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-12">
                                    <h3 className="text-blue-400 text-xs font-bold tracking-wider">Sentinel Impact</h3>
                                    <div className="px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold">
                                        Eficiencia +25%
                                    </div>
                                </div>

                                <div className="mb-10">
                                    <p className="text-slate-500 text-xs font-bold mb-3 tracking-wide">Retorno de Inversión Extra</p>
                                    <div className="text-6xl sm:text-7xl lg:text-8xl font-black text-white tracking-tighter leading-none mb-4">
                                        +${extraEarnings}
                                    </div>
                                    <p className="text-blue-500 font-bold text-sm">Capital recuperado por ciclo</p>
                                </div>

                                <div className="space-y-5 mb-10">
                                    <div className="p-5 rounded-3xl bg-white/5 border border-white/10 flex items-center gap-5">
                                        <div className="w-12 h-12 rounded-2xl bg-blue-600/20 flex items-center justify-center shrink-0">
                                            <TrendingUp className="w-6 h-6 text-blue-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white">Alcance Maestro</p>
                                            <p className="text-xs text-slate-500 font-medium mt-0.5">+{extraVisits} visitas efectivas por día</p>
                                        </div>
                                    </div>
                                    <div className="p-5 rounded-3xl bg-white/5 border border-white/10 flex items-center gap-5">
                                        <div className="w-12 h-12 rounded-2xl bg-blue-600/20 flex items-center justify-center shrink-0">
                                            <Check className="w-6 h-6 text-blue-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white">Capacidad Instalada</p>
                                            <p className="text-xs text-slate-500 font-medium mt-0.5">Optimizado para {WORK_DAYS} días laborales</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Button className="relative z-10 w-full h-16 bg-blue-600 hover:bg-blue-500 text-white transition-all font-bold text-sm rounded-2xl border-none shadow-2xl shadow-blue-600/20 active:scale-95">
                                Activar Protocolo de Ventas
                            </Button>

                            {/* Background decoration */}
                            <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-600/5 rounded-full blur-[120px] -mb-40 -mr-40 pointer-events-none"></div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
