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
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

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
        <header className="bg-card px-4 py-4 md:px-6 md:py-5 rounded-[1.2rem] md:rounded-2xl border border-border shadow-soft relative overflow-hidden mx-1">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                <div className="flex items-start md:items-center gap-4 md:gap-6">
                    <div className="w-12 h-12 md:w-16 md:h-16 shrink-0 bg-primary/10 rounded-xl md:rounded-2xl flex items-center justify-center shadow-inner border border-primary/20 transition-transform duration-500">
                        <Icon className="text-primary h-6 w-6 md:h-8 md:w-8 premium-icon" />
                    </div>
                    <div>
                        <p className="text-primary text-[8px] md:text-[9px] font-bold uppercase tracking-[0.2em] mb-1">{subtitle}</p>
                        <h1 className="text-xl md:text-2xl font-bold text-foreground tracking-tight leading-tight">{title}</h1>
                        <div className="flex flex-wrap items-center gap-2 mt-2 md:mt-3">
                            {badgeText && <Badge className="bg-primary/5 text-primary border-none font-bold text-[8px] md:text-[9px] px-2.5 py-0.5 uppercase tracking-wider rounded-full">{badgeText}</Badge>}
                            {statusText && (
                                <div className="flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-slate-50 border border-slate-100 dark:bg-slate-900 dark:border-slate-800">
                                    <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", statusColor)}></div>
                                    <span className="text-[8px] md:text-[9px] font-bold text-slate-500 uppercase tracking-wider">{statusText}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto">
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
    
    const colorConfigs = {
        primary: "text-primary bg-primary/5 border-primary/10",
        secondary: "text-blue-600 bg-blue-600/5 border-blue-600/10",
        accent: "text-indigo-600 bg-indigo-600/5 border-indigo-600/10",
        emerald: "text-emerald-600 bg-emerald-600/5 border-emerald-600/10",
        rose: "text-rose-600 bg-rose-600/5 border-rose-600/10",
        amber: "text-amber-600 bg-amber-600/5 border-amber-600/10",
        blue: "text-blue-500 bg-blue-500/5 border-blue-500/10",
        indigo: "text-indigo-700 bg-indigo-700/5 border-indigo-700/10"
    };

    const activeColor = colorConfigs[color as keyof typeof colorConfigs] || colorConfigs.primary;

    return (
        <Card 
            onClick={onClick}
            className={cn(
                "border shadow-soft rounded-3xl overflow-hidden group transition-all duration-500",
                onClick ? "cursor-pointer hover:shadow-card hover:-translate-y-1" : "",
                isActive ? "border-primary ring-2 ring-primary/20 shadow-premium-md scale-[1.02]" : "border-border/50",
                "animate-in fade-in slide-in-from-bottom duration-700",
                variant === 'glass' ? "bg-card/80 backdrop-blur-xl" : "bg-card"
            )}
            style={{ animationDelay: `${delay}ms` }}
        >
            <CardContent className="p-3 md:p-5">
                <div className="flex items-start justify-between mb-3 md:mb-4">
                    <div className={cn("w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center transition-transform group-hover:rotate-6 duration-500", activeColor.split(' ')[1])}>
                        <Icon className={cn("h-5 w-5 md:h-6 md:w-6 premium-icon", activeColor.split(' ')[0])} />
                    </div>
                    {trend !== undefined && (
                        <Badge className={cn(
                            "border-none font-bold text-[8px] md:text-[9px] px-2 py-0.5 rounded-full uppercase flex items-center gap-1",
                            trend >= 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                        )}>
                            {trend >= 0 ? <TrendingUp size={8} /> : <TrendingDown size={8} />}
                            {Math.abs(trend)}%
                        </Badge>
                    )}
                </div>
                
                <div className="space-y-1">
                    <p className="text-[8px] md:text-[9px] font-bold text-slate-500 uppercase tracking-widest">{title}</p>
                    <div className="flex items-baseline gap-2">
                        <p className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tabular-nums tracking-tight leading-none">{value}</p>
                    </div>
                    {subtitle && (
                        <p className="text-[7px] md:text-[8px] font-semibold text-slate-400 uppercase tracking-wider mt-1.5 md:mt-2 flex items-center gap-1.5">
                            <span className={cn("w-1 h-1 rounded-full", activeColor.split(' ')[0].replace('text', 'bg'))} />
                            {subtitle}
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

export function EliteTabsList({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <div className={cn("flex justify-start px-1 overflow-x-auto no-scrollbar", className)}>
            <TabsList className="bg-slate-100/50 dark:bg-slate-800/30 border border-slate-200/50 dark:border-slate-700/50 p-1 rounded-xl h-auto flex flex-nowrap gap-1 backdrop-blur-md shadow-inner">
                {children}
            </TabsList>
        </div>
    );
}

interface EliteTabsTriggerProps {
    value: string;
    label: string;
    icon: LucideIcon;
    activeColor?: string;
}

export function EliteTabsTrigger({ value, label, icon: Icon, activeColor = "data-[state=active]:bg-primary" }: EliteTabsTriggerProps) {
    return (
        <TabsTrigger 
            value={value} 
            className={cn(
                "flex items-center gap-2 px-3 py-2 md:px-6 md:py-3 data-[state=active]:text-primary-foreground rounded-lg md:rounded-xl transition-all font-bold text-[9px] md:text-[10px] uppercase tracking-wider border-none group whitespace-nowrap",
                activeColor
            )}
        >
            <Icon size={12} strokeWidth={2.5} className="text-slate-400 group-data-[state=active]:text-inherit" /> {label}
        </TabsTrigger>
    );
}
