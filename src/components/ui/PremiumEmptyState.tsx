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
import { cn } from '@/lib/utils';

interface PremiumEmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
    className?: string;
}

export const PremiumEmptyState = ({
    icon: Icon,
    title,
    description,
    actionLabel,
    onAction,
    className
}: PremiumEmptyStateProps) => {
    return (
        <div className={cn("flex flex-col items-center justify-center p-16 text-center animate-in fade-in zoom-in duration-700 font-outfit", className)}>
            <div className="relative mb-8">
                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 animate-pulse"></div>
                <div className="relative w-28 h-28 rounded-[2rem] bg-muted border border-border flex items-center justify-center shadow-3xl shadow-primary/10 transition-transform group-hover:rotate-6">
                    <Icon className="h-12 w-12 text-primary" />
                </div>
            </div>

            <h3 className="text-3xl font-black text-foreground mb-3 tracking-tighter uppercase leading-none">
                {title}
            </h3>
            <p className="text-muted-foreground max-w-sm mb-10 leading-relaxed font-bold uppercase tracking-widest text-[10px]">
                {description}
            </p>

            {actionLabel && onAction && (
                <Button
                    onClick={onAction}
                    className="bg-primary text-primary-foreground px-12 py-8 text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20"
                >
                    {actionLabel}
                </Button>
            )}
        </div>
    );
};
