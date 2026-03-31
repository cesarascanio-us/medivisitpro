/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ResourcePillSelectorProps {
    label: string;
    items: { id: string; name: string; specialty?: string }[];
    selected: string[];
    onChange: (selected: string[]) => void;
    maxVisible?: number;
    emptyMessage?: string;
}

/**
 * Tactile pill selector for mobile-friendly resource selection
 * Replaces complex multi-select dropdowns with simple tap-to-toggle pills
 */
export function ResourcePillSelector({
    label,
    items,
    selected,
    onChange,
    maxVisible = 8,
    emptyMessage = 'No hay items disponibles',
}: ResourcePillSelectorProps) {
    const [showAll, setShowAll] = React.useState(false);

    const toggleItem = (id: string) => {
        if (selected.includes(id)) {
            onChange(selected.filter((s) => s !== id));
        } else {
            onChange([...selected, id]);
        }
    };

    const visibleItems = showAll ? items : items.slice(0, maxVisible);
    const hasMore = items.length > maxVisible;

    if (items.length === 0) {
        return (
            <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">{label}</label>
                <p className="text-xs text-muted-foreground italic">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium">{label}</label>
                {selected.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                        {selected.length} seleccionado{selected.length !== 1 ? 's' : ''}
                    </Badge>
                )}
            </div>

            <div className="flex flex-wrap gap-2">
                {visibleItems.map((item) => {
                    const isSelected = selected.includes(item.id);
                    return (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => toggleItem(item.id)}
                            className={cn(
                                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all',
                                'border-2 active:scale-95',
                                isSelected
                                    ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                                    : 'bg-background text-foreground border-border hover:border-primary/50 hover:bg-accent'
                            )}
                        >
                            {isSelected && <Check className="h-3 w-3" />}
                            <span>{item.name}</span>
                        </button>
                    );
                })}

                {hasMore && !showAll && (
                    <button
                        type="button"
                        onClick={() => setShowAll(true)}
                        className="px-3 py-1.5 rounded-full text-sm font-medium text-primary hover:bg-primary/10 border-2 border-dashed border-primary/50"
                    >
                        + {items.length - maxVisible} más
                    </button>
                )}

                {showAll && hasMore && (
                    <button
                        type="button"
                        onClick={() => setShowAll(false)}
                        className="px-3 py-1.5 rounded-full text-sm font-medium text-muted-foreground hover:bg-muted border-2 border-dashed"
                    >
                        Mostrar menos
                    </button>
                )}
            </div>
        </div>
    );
}
