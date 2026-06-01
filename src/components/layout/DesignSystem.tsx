/* ========================================================================
 MASTER DESIGN SYSTEM - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 ======================================================================== */

import React from 'react';
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LucideIcon, TrendingUp, TrendingDown, Search, AlertCircle, RefreshCw, Plus } from "lucide-react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";

// ─── EliteHeader ─────────────────────────────────────────────────────────────

interface EliteHeaderProps {
    title: string;
    subtitle?: string;
    icon?: LucideIcon;
    badgeText?: string;
    statusText?: string;
    statusColor?: string;
    rightContent?: React.ReactNode;
}

export function EliteHeader({ title, subtitle, icon: Icon, rightContent, badgeText, statusText, statusColor = "bg-green-500" }: EliteHeaderProps) {
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
            <div className="flex items-center gap-2">
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
        {rightContent && <div className="flex items-center gap-2 flex-shrink-0">{rightContent}</div>}
      </div>
    </div>
  )
}

// ─── EliteKPICard ─────────────────────────────────────────────────────────────

interface EliteKPICardProps {
    title: string;
    value: React.ReactNode;
    subtitle?: string;
    icon?: LucideIcon;
    trend?: number;
    color?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral' | string;
    onClick?: () => void;
    className?: string;
    isActive?: boolean;
}

export function EliteKPICard({ title, value, subtitle, icon: Icon, trend, color = 'primary', onClick, className, isActive }: EliteKPICardProps) {
  const colorMap: Record<string, { bg: string, icon: string, bar: string }> = {
    primary:  { bg: 'bg-accent',          icon: 'text-primary',     bar: 'bg-primary'     },
    success:  { bg: 'bg-green-50',        icon: 'text-green-700',   bar: 'bg-green-600'   },
    warning:  { bg: 'bg-amber-50',        icon: 'text-amber-700',   bar: 'bg-amber-500'   },
    danger:   { bg: 'bg-red-50',          icon: 'text-red-700',     bar: 'bg-red-600'     },
    neutral:  { bg: 'bg-muted',           icon: 'text-muted-foreground', bar: 'bg-muted-foreground' },
  }
  const c = colorMap[color] || colorMap.primary
  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-card border border-border rounded-lg p-4 transition-all duration-200",
        onClick && "cursor-pointer hover:border-primary/30 hover:shadow-sm",
        isActive && "border-primary/30 ring-1 ring-primary/20",
        className
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{title}</p>
        {Icon && (
          <div className={cn("w-7 h-7 rounded-md flex items-center justify-center", c.bg)}>
            <Icon className={cn("w-3.5 h-3.5", c.icon)} strokeWidth={1.5} />
          </div>
        )}
      </div>
      <p className="text-2xl font-semibold text-foreground tracking-tight">{value}</p>
      {subtitle && (
        <p className={cn("text-xs mt-1.5 flex items-center gap-1",
          trend !== undefined && trend > 0 ? "text-green-600" : trend !== undefined && trend < 0 ? "text-red-600" : "text-muted-foreground"
        )}>
          {trend !== undefined && trend > 0 && <TrendingUp className="w-3 h-3" />}
          {trend !== undefined && trend < 0 && <TrendingDown className="w-3 h-3" />}
          {subtitle}
        </p>
      )}
      {typeof trend === 'number' && (
        <div className="mt-3 h-1 bg-muted rounded-full overflow-hidden">
          <div className={cn("h-1 rounded-full transition-all", c.bar)}
               style={{ width: `${Math.min(Math.abs(trend), 100)}%` }} />
        </div>
      )}
    </div>
  )
}

// ─── EliteCard ────────────────────────────────────────────────────────────────

interface EliteCardProps {
    children: React.ReactNode;
    className?: string;
    title?: string;
    description?: string;
    action?: React.ReactNode;
    onClick?: () => void;
    delay?: number;
}

export const EliteCard = React.forwardRef<HTMLDivElement, EliteCardProps>(
  ({ children, className, title, description, action, onClick, delay }, ref) => {
    return (
      <div 
        ref={ref} 
        onClick={onClick}
        className={cn("bg-card border border-border rounded-lg overflow-hidden", onClick && "cursor-pointer hover:border-primary/30", className)}
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
        <div className="p-4">{children}</div>
      </div>
    )
  }
)
EliteCard.displayName = "EliteCard";

// ─── EliteInput ───────────────────────────────────────────────────────────────

export const EliteInput = React.forwardRef<
    HTMLInputElement,
    React.ComponentProps<typeof Input> & { icon?: LucideIcon }
>(({ icon: Icon, className, ...props }, ref) => {
  return (
    <div className="relative w-full">
      {Icon && (
        <Icon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" strokeWidth={1.5} />
      )}
      <Input
        ref={ref}
        className={cn(
          "h-8 text-sm border-border bg-background",
          "placeholder:text-muted-foreground",
          "focus:ring-1 focus:ring-primary focus:border-primary",
          Icon && "pl-8",
          className
        )}
        {...props}
      />
    </div>
  )
})
EliteInput.displayName = "EliteInput";

// ─── EliteTable ───────────────────────────────────────────────────────────────

interface EliteTableProps {
    title?: string;
    description?: string;
    children: React.ReactNode;
    onSearch?: (term: string) => void;
    searchPlaceholder?: string;
    filterElement?: React.ReactNode;
}

export function EliteTable({ title, description, children, onSearch, searchPlaceholder, filterElement }: EliteTableProps) {
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {(title || onSearch || filterElement) && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-border gap-3">
          <div>
            {title && <h3 className="text-sm font-semibold text-foreground">{title}</h3>}
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
          </div>
          <div className="flex items-center gap-3">
            {filterElement}
            {onSearch && (
              <EliteInput
                icon={Search}
                placeholder={searchPlaceholder || 'Buscar...'}
                onChange={e => onSearch(e.target.value)}
                className="w-52"
              />
            )}
          </div>
        </div>
      )}
      <div className="overflow-x-auto w-full text-sm">
        <style>{`
          thead tr { background: hsl(var(--muted)); }
          thead th { padding: 8px 14px; text-align: left; font-size: 11px; font-weight: 600;
                     color: hsl(var(--muted-foreground)); text-transform: uppercase; letter-spacing: .06em; }
          tbody td { padding: 10px 14px; border-bottom: 1px solid hsl(var(--border)); color: hsl(var(--foreground)); }
          tbody tr:last-child td { border-bottom: none; }
          tbody tr:hover td { background: hsl(var(--muted)); }
        `}</style>
        {children}
      </div>
    </div>
  )
}

// ─── EliteBadge ───────────────────────────────────────────────────────────────

export function EliteBadge({ status, className, customLabel }: { status: string, className?: string, customLabel?: string }) {
  const map: Record<string, { label: string, className: string }> = {
    active:    { label: 'Activo',      className: 'bg-green-50 text-green-800 border-green-200'    },
    inactive:  { label: 'Inactivo',    className: 'bg-muted text-muted-foreground border-border'    },
    pending:   { label: 'Pendiente',   className: 'bg-amber-50 text-amber-800 border-amber-200'     },
    completed: { label: 'Completada',  className: 'bg-green-50 text-green-800 border-green-200'     },
    overdue:   { label: 'Atrasada',    className: 'bg-red-50 text-red-800 border-red-200'           },
    review:    { label: 'En revisión', className: 'bg-blue-50 text-blue-800 border-blue-200'        },
  }
  const s = map[status] || { label: status, className: 'bg-muted text-muted-foreground border-border' }
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border", s.className, className)}>
      {customLabel || s.label}
    </span>
  )
}

// ─── EliteTabsList / Trigger ────────────────────────────────────────────────────────────

export function EliteTabsList({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={cn("flex justify-start overflow-x-auto", className)}>
            <TabsList className="bg-muted border border-border p-1 rounded-lg h-auto flex flex-nowrap gap-1">
                {children}
            </TabsList>
        </div>
    );
}

interface EliteTabsTriggerProps {
    value: string;
    label: string;
    icon: LucideIcon;
}

export function EliteTabsTrigger({ value, label, icon: Icon }: EliteTabsTriggerProps) {
    return (
        <TabsTrigger
            value={value}
            className="flex items-center gap-2 px-3 py-2 rounded-md transition-all text-xs font-medium whitespace-nowrap data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm"
        >
            <Icon size={13} strokeWidth={1.5} />
            {label}
        </TabsTrigger>
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
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mb-4">
            <Icon className="w-6 h-6 text-primary" strokeWidth={1.5} />
          </div>
          <h3 className="text-sm font-semibold text-foreground mb-1">{title}</h3>
          {subtitle && <p className="text-sm text-muted-foreground max-w-xs mb-4">{subtitle}</p>}
          {actionLabel && onAction && (
            <Button size="sm" variant="default" onClick={onAction}>
              <Plus className="w-3.5 h-3.5 mr-1.5" />
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
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="w-10 h-10 text-muted-foreground mb-3" strokeWidth={1.5} />
          <h3 className="text-sm font-semibold text-foreground mb-1">{title}</h3>
          <p className="text-sm text-muted-foreground mb-4">{subtitle}</p>
          {onRetry && (
            <Button size="sm" variant="outline" onClick={onRetry}>
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
              Reintentar
            </Button>
          )}
        </div>
    );
}

// ─── EliteLoadingSkeleton ─────────────────────────────────────────────────────

export function EliteLoadingSkeleton({ rows = 3 }: { rows?: number }) {
    return (
        <div className="space-y-3">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="h-12 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
    );
}

// ─── EliteButton Alias ─────────────────────────────────────────────────────────
// Just forwarding to standard shadcn button to avoid breaking imports
export const EliteButton = React.forwardRef<
    HTMLButtonElement,
    React.ComponentProps<typeof Button> & {
        variant?: 'primary' | 'secondary' | 'ghost' | 'default' | 'outline';
        icon?: LucideIcon;
    }
>(({ children, variant = 'default', icon: Icon, className, size, ...props }, ref) => {
    // Map old variants to new shadcn variants if needed
    const mappedVariant = (variant as any) === 'primary' ? 'default' : 
                          (variant as any) === 'secondary' ? 'outline' : 
                          variant;
                          
    return (
        <Button
            ref={ref}
            className={className}
            variant={mappedVariant as any}
            size={size}
            {...props}
        >
            {Icon && <Icon className="w-3.5 h-3.5 mr-1.5" strokeWidth={1.5} />}
            {children}
        </Button>
    );
});
EliteButton.displayName = "EliteButton";
