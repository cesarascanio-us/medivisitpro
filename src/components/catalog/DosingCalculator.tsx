/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calculator, Scale, Droplets } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface DosingCalculatorProps {
    productName: string;
    standardDoseMgPerKg: number; // Ej: 15mg/kg
    concentrationMgPerMl: number; // Ej: 100mg/5ml -> 20mg/ml
}

export function DosingCalculator({ productName, standardDoseMgPerKg = 10, concentrationMgPerMl = 20 }: DosingCalculatorProps) {
    const [weight, setWeight] = useState<number | "">("");

    // Cálculo
    // Dosis Total (mg) = Peso (kg) * Dosis (mg/kg)
    // Vol Total (ml) = Dosis Total (mg) / Concentración (mg/ml)

    const doseMg = typeof weight === 'number' ? weight * standardDoseMgPerKg : 0;
    const doseMl = doseMg > 0 ? (doseMg / concentrationMgPerMl).toFixed(1) : 0;

    return (
        <Card className="bg-transparent border-0 shadow-none text-slate-100">
            <CardHeader className="pb-4">
                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <Calculator className="h-4 w-4 text-emerald-400" /> Calculadora de Dosis
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-3">
                    <Label className="text-slate-300 font-medium">Peso del Paciente (kg)</Label>
                    <div className="relative group">
                        <Scale className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-hover:text-emerald-400 transition-colors" />
                        <Input
                            type="number"
                            placeholder="Ej: 25 kg"
                            className="pl-12 h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500/50 rounded-xl text-lg transition-all"
                            value={weight}
                            onChange={(e) => setWeight(e.target.value ? parseFloat(e.target.value) : "")}
                        />
                    </div>
                </div>

                <AnimatePresence>
                    {typeof weight === 'number' && weight > 0 && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-5 rounded-2xl text-center shadow-lg shadow-emerald-500/20 border border-emerald-400/30"
                        >
                            {/* Decorative background elements */}
                            <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
                            <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-black/10 rounded-full blur-xl pointer-events-none"></div>
                            
                            <div className="relative z-10 flex flex-col items-center">
                                <Droplets className="h-6 w-6 text-emerald-100 mb-2 opacity-80" />
                                <div className="text-xs font-medium text-emerald-100 tracking-wide uppercase mb-1">
                                    Dosis Recomendada ({standardDoseMgPerKg} mg/kg)
                                </div>
                                <div className="text-4xl font-black tracking-tight mb-1 drop-shadow-sm">
                                    {doseMl} <span className="text-2xl font-bold text-emerald-100">ml</span>
                                </div>
                                <div className="text-xs font-medium text-emerald-50/80 mt-1 bg-black/10 px-3 py-1 rounded-full">
                                    por toma / {productName}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </CardContent>
        </Card>
    );
}
