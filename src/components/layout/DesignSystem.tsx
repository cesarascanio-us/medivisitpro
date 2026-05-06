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
import { LucideIcon, TrendingUp, TrendingDown, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * ELITE DESIGN SYSTEM - COMPONENT LIBRARY
 * Standardized components for the Master Framework (CA)
 */

interface EliteHeaderProps {
    title: string;
    subtitle: string;
    icon: LucideIcon;
    badgeText?: string;
    statusText?: string;
    statusColor?: string;
    rightContent?: React.ReactNode;
}

export function EliteHeader({ title, subtitle, icon: Icon, badgeText, statusText, statusColor = "bg-emerald-500", rightContent }: EliteHeaderProps) {
    return (
        <header className="bg-card px-4 py-4 md:px-10 md:py-8 rounded-elite-lg border border-border/40 shadow-premium-lg relative overflow-hidden mx-1 animate-in fade-in slide-in-from-top-5 duration-700">
            {/* Glowing Accent Orbs */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/5 rounded-full -ml-24 -mb-24 blur-3xl opacity-30" />
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                <div className="flex items-center gap-6 md:gap-8">
                    <div className="icon-box-primary group relative overflow-hidden">
                        <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
                        <Icon className="h-8 w-8 premium-icon relative z-10" />
                    </div>
                    <div>
                        <p className="text-primary text-elite-xs mb-2">{subtitle}</p>
                        <h1 className="text-xl md:text-2xl font-black text-foreground tracking-tighter uppercase font-display">{title}</h1>
                        <div className="flex flex-wrap items-center gap-3 mt-3">
                            {badgeText && <Badge className="badge-elite-info">{badgeText}</Badge>}
                            {statusText && (
                                <div className="flex items-center gap-2.5 px-3 py-1 rounded-full bg-muted/10 border border-border/40 shadow-inner group">
                                    <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]", statusColor)}></div>
                                    <span className="text-elite-xs text-muted-foreground group-hover:text-foreground transition-colors">{statusText}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto">
                    {rightContent}
                </div>
            </div>
        </header>
    );
}

interface EliteKPICardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: LucideIcon;
    trend?: number;
    color?: 'primary' | 'secondary' | 'accent' | 'emerald' | 'rose' | 'amber' | 'blue' | 'indigo';
    variant?: 'glass' | 'solid';
    delay?: number;
    onClick?: () => void;
    isActive?: boolean;
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
    isActive
}: EliteKPICardProps) {
    
    const colors = {
        primary: "text-primary bg-primary/10 border-primary/20",
        secondary: "text-blue-500 bg-blue-500/10 border-blue-500/20",
        accent: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20",
        emerald: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
        rose: "text-rose-500 bg-rose-500/10 border-rose-500/20",
        amber: "text-amber-500 bg-amber-500/10 border-amber-500/20",
        blue: "text-blue-400 bg-blue-400/10 border-blue-400/20",
        indigo: "text-indigo-400 bg-indigo-400/10 border-indigo-400/20"
    };

    const colorStyle = colors[color] || colors.primary;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: delay / 1000 }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
        >
            <Card 
                onClick={onClick}
                className={cn(
                    "card-elite group h-full",
                    onClick ? "cursor-pointer" : "",
                    isActive ? "border-primary/40 ring-2 ring-primary/20 scale-[1.02]" : "",
                    variant === 'glass' ? "backdrop-blur-xl" : ""
                )}
            >
                <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-6">
                        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-inner border group-hover:scale-110", colorStyle)}>
                            <Icon className="h-7 w-7 premium-icon" />
                        </div>
                        {trend !== undefined && (
                            <Badge className={cn(
                                "badge-elite-success border-none",
                                trend >= 0 ? "badge-elite-success" : "badge-elite-error"
                            )}>
                                {trend >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                                {Math.abs(trend)}%
                            </Badge>
                        )}
                    </div>
                    
                    <div className="space-y-2">
                        <p className="text-elite-xs text-muted-foreground">{title}</p>
                        <p className="text-2xl font-black text-foreground tracking-tighter tabular-nums leading-none">{value}</p>
                        {subtitle && (
                            <div className="flex items-center gap-2 mt-3">
                                <div className={cn("w-1 h-1 rounded-full", colorStyle.split(' ')[0].replace('text', 'bg'))} />
                                <p className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest">{subtitle}</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

export function EliteCard({ children, className, onClick, delay = 0 }: { children: React.ReactNode, className?: string, onClick?: () => void, delay?: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: delay / 1000 }}
            whileHover={onClick ? { y: -4, transition: { duration: 0.2 } } : undefined}
            className="h-full"
        >
            <Card 
                onClick={onClick}
                className={cn(
                    "card-elite h-full",
                    onClick && "cursor-pointer hover:border-primary/20",
                    className
                )}
            >
                {children}
            </Card>
        </motion.div>
    );
}

export function EliteButton({ 
    children, 
    variant = 'primary', 
    icon: Icon, 
    className,
    ...props 
}: React.ComponentProps<typeof Button> & { variant?: 'primary' | 'secondary' | 'ghost', icon?: LucideIcon }) {
    const variants = {
        primary: "btn-elite-primary",
        secondary: "btn-elite-secondary",
        ghost: "btn-elite-ghost"
    };

    return (
        <Button className={cn(variants[variant], className)} {...props}>
            {Icon && <Icon className="h-5 w-5" />}
            {children}
        </Button>
    );
}

export function EliteInput({ icon: Icon, className, ...props }: React.ComponentProps<typeof Input> & { icon?: LucideIcon }) {
    return (
        <div className="relative group w-full">
            {Icon && <Icon className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />}
            <Input className={cn("input-elite", Icon ? "pl-16" : "px-6", className)} {...props} />
        </div>
    );
}

export function EliteTable({ title, description, children, onSearch, searchPlaceholder = "BUSCAR..." }: EliteTableProps) {
    return (
        <Card className="card-elite rounded-elite-xl animate-in fade-in slide-in-from-bottom-10 duration-1000">
            <div className="p-6 md:p-8 border-b border-border/40 bg-muted/5 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8">
                <div className="space-y-2">
                    <h2 className="text-elite-title text-foreground font-display">{title}</h2>
                    <p className="text-elite-sm text-muted-foreground">{description}</p>
                </div>
                {onSearch && (
                    <div className="w-full xl:w-96">
                        <EliteInput 
                            icon={Search}
                            placeholder={searchPlaceholder} 
                            onChange={(e) => onSearch(e.target.value)}
                        />
                    </div>
                )}
            </div>
            <div className="overflow-x-auto no-scrollbar">
                {children}
            </div>
        </Card>
    );
}

export function EliteTabsList({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <div className={cn("flex justify-start px-1 overflow-x-auto no-scrollbar", className)}>
            <TabsList className="bg-muted/10 border border-border/40 p-1.5 rounded-elite-md h-auto flex flex-nowrap gap-1.5 backdrop-blur-md shadow-inner">
                {children}
            </TabsList>
        </div>
    );
}

export function EliteTabsTrigger({ value, label, icon: Icon }: EliteTabsTriggerProps) {
    return (
        <TabsTrigger 
            value={value} 
            className="flex items-center gap-3 px-8 py-4 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-premium-md rounded-xl transition-all font-black text-[10px] uppercase tracking-widest border-none group whitespace-nowrap"
        >
            <Icon size={14} className="text-primary group-data-[state=active]:text-white transition-colors" /> {label}
        </TabsTrigger>
    );
}
