/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Lightbulb, Info } from "lucide-react";

interface InstructionCardProps {
    title: string;
    description?: string;
    items?: string[];
    className?: string;
}

export function InstructionCard({ title, description, items, className }: InstructionCardProps) {
    return (
        <div className={`medical-card p-6 shadow-2xl shadow-emerald-500/5 ${className}`}>
            <div className="flex items-start gap-5">
                <div className="mt-1 p-2.5 bg-emerald-500/10 rounded-xl shrink-0 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                    <Lightbulb className="h-5 w-5 text-emerald-400" />
                </div>
                <div className="space-y-3">
                    <h3 className="text-lg font-bold text-slate-900 leading-tight tracking-tight">{title}</h3>
                    {description && (
                        <p className="text-sm text-slate-600 leading-relaxed font-medium">{description}</p>
                    )}
                    {items && items.length > 0 && (
                        <ul className="space-y-3 mt-4">
                            {items.map((item, idx) => (
                                <li key={idx} className="flex items-start gap-3 text-sm text-slate-700">
                                    <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500/50 shrink-0" />
                                    <span className="leading-relaxed">{item}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}
