/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PremiumEmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
}

export const PremiumEmptyState = ({
    icon: Icon,
    title,
    description,
    actionLabel,
    onAction
}: PremiumEmptyStateProps) => {
    return (
        <div className="flex flex-col items-center justify-center p-12 text-center animate-in fade-in zoom-in duration-500">
            <div className="relative mb-6">
                <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full scale-150 animate-pulse"></div>
                <div className="relative w-20 h-20 rounded-2xl bg-slate-900 border border-emerald-500/20 flex items-center justify-center shadow-2xl">
                    <Icon className="h-10 w-10 text-emerald-400" />
                </div>
            </div>

            <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">
                {title}
            </h3>
            <p className="text-slate-400 max-w-sm mb-8 leading-relaxed">
                {description}
            </p>

            {actionLabel && onAction && (
                <Button
                    onClick={onAction}
                    className="btn-medical px-8 py-6 text-lg font-bold rounded-xl"
                >
                    {actionLabel}
                </Button>
            )}
        </div>
    );
};
