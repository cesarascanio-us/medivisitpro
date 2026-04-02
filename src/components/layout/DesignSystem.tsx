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
import { LucideIcon } from "lucide-react";

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
        <header className="bg-card px-10 py-12 rounded-[3.5rem] border border-border shadow-soft relative overflow-hidden mx-1">
            <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
                <div className="flex items-center gap-8">
                    <div className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center shadow-inner border border-primary/20">
                        <Icon className="text-primary h-12 w-12" />
                    </div>
                    <div>
                        <p className="text-primary text-[11px] font-black uppercase tracking-[0.4em] mb-2">{subtitle}</p>
                        <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tighter uppercase italic leading-none">{title}</h1>
                        <div className="flex items-center gap-4 mt-4">
                            {badgeText && <Badge className="bg-indigo-500/10 text-indigo-500 border-none font-black text-[10px] px-4 py-1.5 uppercase tracking-widest italic rounded-full">{badgeText}</Badge>}
                            {statusText && (
                                <div className="flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-muted/40 border border-border">
                                    <div className={cn("w-2 h-2 rounded-full animate-pulse", statusColor)}></div>
                                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest italic">{statusText}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    {rightContent}
                </div>
            </div>
        </header>
    );
}

interface EliteKPICardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: 'indigo' | 'rose' | 'emerald' | 'amber' | 'blue';
}

export function EliteKPICard({ title, value, icon, color }: EliteKPICardProps) {
    const colorMap = {
        indigo: "text-indigo-500",
        rose: "text-rose-500",
        emerald: "text-emerald-500",
        amber: "text-amber-500",
        blue: "text-blue-500"
    };

    return (
        <Card className="border-none bg-muted/30 dark:bg-slate-900/40 rounded-[2.5rem] shadow-sm hover:shadow-md transition-all group overflow-hidden">
            <CardContent className="p-10 flex items-center justify-between">
                <div className="space-y-2">
                    <p className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em]">{title}</p>
                    <p className="text-5xl font-black text-foreground tabular-nums tracking-tighter italic">{value}</p>
                </div>
                <div className={cn("transition-transform group-hover:scale-110 duration-500 opacity-90", colorMap[color])}>
                    {icon}
                </div>
            </CardContent>
        </Card>
    );
}

export function EliteTabsList({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex justify-start px-2">
            <TabsList className="bg-muted/50 dark:bg-slate-900/60 border border-border/50 p-2 rounded-full h-auto flex flex-nowrap gap-3 backdrop-blur-md shadow-inner">
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
                "flex items-center gap-3 px-10 py-4 data-[state=active]:text-primary-foreground rounded-full transition-all font-black text-[12px] uppercase tracking-widest border-none italic group",
                activeColor
            )}
        >
            <Icon size={18} strokeWidth={3} className="text-muted-foreground group-data-[state=active]:text-inherit" /> {label}
        </TabsTrigger>
    );
}
