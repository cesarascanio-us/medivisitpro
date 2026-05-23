/* ========================================================================
 MASTER DESIGN SYSTEM - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 ======================================================================== */

import React from 'react';
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LucideIcon, TrendingUp, TrendingDown, Search, AlertCircle, RefreshCw, Plus } from "lucide-react";

/**
 * ELITE DESIGN SYSTEM — COMPONENT LIBRARY (Light-First Corporate)
 * Standardized components for MediVisitPro
 */

// ─── EliteHeader ─────────────────────────────────────────────────────────────

interface EliteHeaderProps {
    title: string;
    subtitle: string;
    icon: LucideIcon;
    badgeText?: string;
    statusText?: string;
    statusColor?: string;
    rightContent?: React.ReactNode;
}

export function EliteHeader({
    title,
    subtitle,
    icon: Icon,
    badgeText,
    statusText,
    statusColor = "bg-green-500",
    rightContent
}: EliteHeaderProps) {
    return (
        <div className="mb-6">
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                    {Icon && (
                        <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
                            <Icon className="w-[18px] h-[18px] text-primary" strokeWidth={1.5} />
                        </div>
                    )}
                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <h1 className="text-lg font-semibold text-foreground leading-tight">{title}</h1>
                            {badgeText && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-accent text-primary font-medium">
                                    {badgeText}
                                </span>
                            )}
                            {statusText && (
                                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-muted border border-border text-xs">
                                    <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", statusColor)} />
                                    <span className="text-muted-foreground font-medium">{statusText}</span>
                                </div>
                            )}
                        </div>
                        {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
                    </div>
                </div>
                {rightContent && (
                    <div className="flex items-center gap-2 flex-shrink-0">{rightContent}</div>
                )}
            </div>
        </div>
    );
}

// ─── EliteKPICard ─────────────────────────────────────────────────────────────

interface EliteKPICardProps {
    title: string;
    value: React.ReactNode;
    subtitle?: string;
    icon: LucideIcon;
    trend?: number;
    color?: 'primary' | 'secondary' | 'accent' | 'emerald' | 'rose' | 'amber' | 'blue' | 'indigo' | 'neutral';
    variant?: 'glass' | 'solid';
    delay?: number;
    onClick?: () => void;
    isActive?: boolean;
    className?: string;
}

export function EliteKPICard({
    title,
    value,
    subtitle,
    icon: Icon,
    trend,
    color = 'primary',
    variant = 'glass',
    delay = 0,
    onClick,
    isActive,
    className
}: EliteKPICardProps) {

    const colorMap: Record<string, { bg: string; icon: string; bar: string }> = {
        primary:  { bg: 'bg-accent',       icon: 'text-primary',            bar: 'bg-primary'          },
        secondary:{ bg: 'bg-green-50 dark:bg-green-900/20', icon: 'text-secondary',  bar: 'bg-secondary'        },
        accent:   { bg: 'bg-accent',       icon: 'text-accent-foreground',  bar: 'bg-primary'          },
        emerald:  { bg: 'bg-green-50 dark:bg-green-900/20', icon: 'text-green-700 dark:text-green-400',  bar: 'bg-green-600' },
        rose:     { bg: 'bg-red-50 dark:bg-red-900/20',    icon: 'text-red-700 dark:text-red-400',      bar: 'bg-red-600'   },
        amber:    { bg: 'bg-amber-50 dark:bg-amber-900/20',icon: 'text-amber-700 dark:text-amber-400',  bar: 'bg-amber-500' },
        blue:     { bg: 'bg-blue-50 dark:bg-blue-900/20',  icon: 'text-blue-700 dark:text-blue-400',   bar: 'bg-blue-600'  },
        indigo:   { bg: 'bg-indigo-50 dark:bg-indigo-900/20', icon: 'text-indigo-700 dark:text-indigo-400', bar: 'bg-indigo-600' },
        neutral:  { bg: 'bg-muted',        icon: 'text-muted-foreground',   bar: 'bg-muted-foreground' },
    };

    const c = colorMap[color] || colorMap.primary;

    return (
        <div className={className} style={{ animationDelay: `${delay}ms` }}>
            <Card
                onClick={onClick}
                className={cn(
                    "card-elite group h-full transition-all duration-200",
                    onClick && "cursor-pointer hover:border-primary/20 hover:shadow-premium-md",
                    isActive && "border-primary/30 ring-1 ring-primary/20",
                )}
            >
                <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide leading-none">{title}</p>
                        {Icon && (
                            <div className={cn("w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 border-0", c.bg)}>
                                <Icon className={cn("w-3.5 h-3.5", c.icon)} strokeWidth={1.5} />
                            </div>
                        )}
                    </div>

                    <p className="text-2xl font-semibold text-foreground tracking-tight tabular-nums leading-none">{value}</p>

                    {subtitle && (
                        <p className={cn(
                            "text-xs mt-1.5 flex items-center gap-1",
                            typeof trend === 'number' && trend > 0 ? "text-green-600 dark:text-green-400" :
                            typeof trend === 'number' && trend < 0 ? "text-red-600 dark:text-red-400" :
                            "text-muted-foreground"
                        )}>
                            {typeof trend === 'number' && trend > 0 && <TrendingUp className="w-3 h-3 flex-shrink-0" />}
                            {typeof trend === 'number' && trend < 0 && <TrendingDown className="w-3 h-3 flex-shrink-0" />}
                            {subtitle}
                        </p>
                    )}

                    {typeof trend === 'number' && (
                        <div className="mt-3 h-1 bg-muted rounded-full overflow-hidden">
                            <div
                                className={cn("h-1 rounded-full transition-all duration-700", c.bar)}
                                style={{ width: `${Math.min(Math.abs(trend), 100)}%` }}
                            />
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

// ─── EliteCard ────────────────────────────────────────────────────────────────

export const EliteCard = React.forwardRef<
    HTMLDivElement,
    {
        children: React.ReactNode;
        className?: string;
        onClick?: () => void;
        delay?: number;
        title?: string;
        description?: string;
        action?: React.ReactNode;
    }
>(({ children, className, onClick, delay = 0, title, description, action }, ref) => {
    return (
        <div
            ref={ref}
            className={cn(
                "bg-card border border-border rounded-lg overflow-hidden transition-all duration-200",
                onClick && "cursor-pointer hover:border-primary/20 hover:shadow-premium-md",
                className
            )}
            onClick={onClick}
            style={{ animationDelay: `${delay}ms` }}
        >
            {(title || action) && (
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                    <div>
                        {title && <h3 className="text-sm font-semibold text-foreground">{title}</h3>}
                        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
                    </div>
                    {action && <div className="flex items-center gap-2">{action}</div>}
                </div>
            )}
            {children}
        </div>
    );
});
EliteCard.displayName = "EliteCard";

// ─── EliteButton ──────────────────────────────────────────────────────────────

export const EliteButton = React.forwardRef<
    HTMLButtonElement,
    React.ComponentProps<typeof Button> & {
        variant?: 'primary' | 'secondary' | 'ghost';
        icon?: LucideIcon;
    }
>(({
    children,
    variant = 'primary',
    icon: Icon,
    className,
    size,
    ...props
}, ref) => {
    const variantMap: Record<string, string> = {
        primary:   'btn-elite-primary',
        secondary: 'btn-elite-secondary',
        ghost:     'btn-elite-ghost',
    };

    return (
        <Button
            ref={ref}
            className={cn(variantMap[variant], className)}
            size={size}
            {...props}
        >
            {Icon && <Icon className="w-3.5 h-3.5" strokeWidth={1.5} />}
            {children}
        </Button>
    );
});
EliteButton.displayName = "EliteButton";

// ─── EliteInput ───────────────────────────────────────────────────────────────

export const EliteInput = React.forwardRef<
    HTMLInputElement,
    React.ComponentProps<typeof Input> & { icon?: LucideIcon }
>(({ icon: Icon, className, ...props }, ref) => {
    return (
        <div className="relative w-full">
            {Icon && (
                <Icon
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none"
                    strokeWidth={1.5}
                />
            )}
            <Input
                ref={ref}
                className={cn(
                    "input-elite",
                    Icon ? "pl-8" : "pl-3",
                    className
                )}
                {...props}
            />
        </div>
    );
});
EliteInput.displayName = "EliteInput";

// ─── EliteTable ───────────────────────────────────────────────────────────────

interface EliteTableProps {
    title?: string;
    description?: string;
    children: React.ReactNode;
    onSearch?: (term: string) => void;
    searchPlaceholder?: string;
}

export function EliteTable({
    title,
    description,
    children,
    onSearch,
    searchPlaceholder = "Buscar..."
}: EliteTableProps) {
    return (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
            {(title || onSearch) && (
                <div className="flex items-center justify-between px-4 py-3 border-b border-border gap-3">
                    <div>
                        {title && <h3 className="text-sm font-semibold text-foreground">{title}</h3>}
                        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
                    </div>
                    {onSearch && (
                        <EliteInput
                            icon={Search}
                            placeholder={searchPlaceholder}
                            onChange={(e) => onSearch(e.target.value)}
                            className="w-52"
                        />
                    )}
                </div>
            )}
            <div className="overflow-x-auto">
                {children}
            </div>
        </div>
    );
}

// ─── EliteTabsList ────────────────────────────────────────────────────────────

export function EliteTabsList({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={cn("flex justify-start overflow-x-auto", className)}>
            <TabsList className="bg-muted border border-border p-1 rounded-lg h-auto flex flex-nowrap gap-1">
                {children}
            </TabsList>
        </div>
    );
}

// ─── EliteTabsTrigger ─────────────────────────────────────────────────────────

interface EliteTabsTriggerProps {
    value: string;
    label: string;
    icon: LucideIcon;
}

export function EliteTabsTrigger({ value, label, icon: Icon }: EliteTabsTriggerProps) {
    return (
        <TabsTrigger
            value={value}
            className="flex items-center gap-2 px-3 py-2 rounded-md transition-all text-xs font-medium whitespace-nowrap data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-premium-sm"
        >
            <Icon size={13} strokeWidth={1.5} />
            {label}
        </TabsTrigger>
    );
}

// ─── EliteBadge ───────────────────────────────────────────────────────────────

type BadgeStatus =
    | 'active' | 'inactive' | 'pending' | 'completed' | 'overdue' | 'review'
    | string;

interface EliteBadgeProps {
    status: BadgeStatus;
    customLabel?: string;
    className?: string;
}

export function EliteBadge({ status, customLabel, className }: EliteBadgeProps) {
    const map: Record<string, { label: string; className: string }> = {
        active:    { label: 'Activo',      className: 'bg-green-50 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'   },
        inactive:  { label: 'Inactivo',    className: 'bg-muted text-muted-foreground border-border'   },
        pending:   { label: 'Pendiente',   className: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800'  },
        completed: { label: 'Completada',  className: 'bg-green-50 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'  },
        overdue:   { label: 'Atrasada',    className: 'bg-red-50 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'              },
        review:    { label: 'En revisión', className: 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800'        },
    };

    const s = map[status] || {
        label: customLabel || status,
        className: 'bg-muted text-muted-foreground border-border'
    };

    return (
        <span className={cn(
            "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border",
            s.className,
            className
        )}>
            {customLabel || s.label}
        </span>
    );
}

// ─── EliteEmptyState ─────────────────────────────────────────────────────────

interface EliteEmptyStateProps {
    icon: LucideIcon;
    title: string;
    subtitle?: string;
    actionLabel?: string;
    onAction?: () => void;
}

export function EliteEmptyState({ icon: Icon, title, subtitle, actionLabel, onAction }: EliteEmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mb-4">
                <Icon className="w-6 h-6 text-primary" strokeWidth={1.5} />
            </div>
            <h3 className="text-sm font-semibold text-foreground mb-1">{title}</h3>
            {subtitle && <p className="text-sm text-muted-foreground max-w-xs mb-4">{subtitle}</p>}
            {actionLabel && onAction && (
                <Button size="sm" onClick={onAction} className="gap-1.5">
                    <Plus className="w-3.5 h-3.5" strokeWidth={2} />
                    {actionLabel}
                </Button>
            )}
        </div>
    );
}

// ─── EliteErrorState ─────────────────────────────────────────────────────────

interface EliteErrorStateProps {
    title?: string;
    subtitle?: string;
    onRetry?: () => void;
}

export function EliteErrorState({
    title = "No se pudo cargar la información",
    subtitle = "Verifica tu conexión e intenta de nuevo.",
    onRetry
}: EliteErrorStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center px-4">
            <AlertCircle className="w-10 h-10 text-muted-foreground mb-3" strokeWidth={1.5} />
            <h3 className="text-sm font-semibold text-foreground mb-1">{title}</h3>
            <p className="text-sm text-muted-foreground mb-4">{subtitle}</p>
            {onRetry && (
                <Button size="sm" variant="outline" onClick={onRetry} className="gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5" strokeWidth={1.5} />
                    Reintentar
                </Button>
            )}
        </div>
    );
}

// ─── EliteLoadingSkeleton ─────────────────────────────────────────────────────

export function EliteLoadingSkeleton({ rows = 3 }: { rows?: number }) {
    return (
        <div className="space-y-3 p-4">
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="h-10 bg-muted rounded-md animate-pulse" />
            ))}
        </div>
    );
}
