/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
 ======================================================================== */

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import {
    AlertTriangle,
    Clock,
    Calendar,
    ChevronRight,
    Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ProcessAlert {
    id: string;
    type: 'cycle_expired' | 'zombie_visit';
    title: string;
    description: string;
    severity: 'warning' | 'critical';
    actionUrl: string;
    actionLabel: string;
}

export function ProcessAlerts() {
    const { user, isMaster, isAdmin, isManager } = useAuth();
    const [alerts, setAlerts] = useState<ProcessAlert[]>([]);
    const [loading, setLoading] = useState(true);

    const canViewAllAlerts = isMaster || isAdmin || isManager;

    useEffect(() => {
        if (user) {
            loadProcessAlerts();
        }
    }, [user]);

    const loadProcessAlerts = async () => {
        if (!user) return;
        setLoading(true);

        const newAlerts: ProcessAlert[] = [];
        const now = new Date().toISOString();

        try {
            // 1. Buscar ciclos promocionales expirados
            if (canViewAllAlerts) {
                const { data: expiredCycles, error: cyclesError } = await supabase
                    .from('promotional_cycles')
                    .select('id, name, end_date')
                    .eq('status', 'active')
                    .lt('end_date', now);

                if (!cyclesError && expiredCycles && expiredCycles.length > 0) {
                    expiredCycles.forEach(cycle => {
                        newAlerts.push({
                            id: `cycle-${cycle.id}`,
                            type: 'cycle_expired',
                            title: 'Ciclo Promocional Vencido',
                            description: `El ciclo "${cycle.name}" terminó pero sigue activo.`,
                            severity: 'critical',
                            actionUrl: '/promotional-cycles',
                            actionLabel: 'Gestionar'
                        });
                    });
                }
            }

            // 2. Buscar visitas "zombie" (> 24h in_progress)
            const yesterday = new Date();
            yesterday.setHours(yesterday.getHours() - 24);
            const yesterdayISO = yesterday.toISOString();

            let zombieQuery = supabase
                .from('visits')
                .select('id, scheduled_date, actual_start_time, contacts(name)')
                .eq('status', 'in_progress')
                .lt('actual_start_time', yesterdayISO);

            if (!canViewAllAlerts) {
                zombieQuery = zombieQuery.eq('user_id', user.id);
            }

            const { data: zombieVisits, error: visitsError } = await zombieQuery;

            if (!visitsError && zombieVisits && zombieVisits.length > 0) {
                zombieVisits.forEach(visit => {
                    const contactName = (visit.contacts as any)?.name || 'Contacto';
                    const startTime = visit.actual_start_time || visit.scheduled_date;
                    const hoursAgo = Math.round((new Date().getTime() - new Date(startTime).getTime()) / (1000 * 60 * 60));

                    newAlerts.push({
                        id: `visit-${visit.id}`,
                        type: 'zombie_visit',
                        title: 'Visita Sin Cerrar',
                        description: `"${contactName}" lleva ${hoursAgo}h en progreso.`,
                        severity: 'warning',
                        actionUrl: `/visits/execute/${visit.id}`,
                        actionLabel: 'Cerrar'
                    });
                });
            }

        } catch (error) {
            console.error('Error loading process alerts:', error);
        } finally {
            setAlerts(newAlerts);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-card border-none rounded-[2rem] p-8 text-center animate-pulse shadow-soft">
                <Loader2 className="mx-auto h-8 w-8 text-primary/30 mb-4 animate-spin" />
                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest  tracking-widest">Analizando Filtros CA...</p>
            </div>
        );
    }

    if (alerts.length === 0) return null;

    return (
        <Card className="border-none bg-card shadow-soft rounded-[2.5rem] overflow-hidden font-outfit">
            <CardHeader className="pb-6 px-8 pt-8">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-3 text-sm font-black text-slate-700 dark:text-foreground uppercase tracking-tighter ">
                            <AlertTriangle className="h-5 w-5 text-amber-500" />
                            Control de Procesos
                            <Badge className="bg-amber-500/10 text-amber-500 border-none rounded-full h-5 w-5 flex items-center justify-center font-black text-[10px] p-0">
                                {alerts.length}
                            </Badge>
                        </CardTitle>
                        <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">
                            Auditoría de Protocolos Real-Time CA
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="px-6 pb-8 space-y-4">
                {alerts.map((alert) => {
                    const isCritical = alert.severity === 'critical';
                    const Icon = alert.type === 'cycle_expired' ? Calendar : Clock;

                    return (
                        <div
                            key={alert.id}
                            className={cn(
                                "flex items-center justify-between p-4 rounded-[1.5rem] border transition-all hover:scale-[1.02]",
                                isCritical 
                                    ? 'bg-rose-500/5 border-rose-500/10' 
                                    : 'bg-amber-500/5 border-amber-500/10'
                            )}
                        >
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "p-2.5 rounded-xl bg-card shadow-soft",
                                    isCritical ? 'text-rose-500' : 'text-amber-500'
                                )}>
                                    <Icon className="h-5 w-5" />
                                </div>
                                <div className="min-w-0">
                                    <p className={cn(
                                        "font-black uppercase tracking-tight  text-xs",
                                        isCritical ? 'text-rose-700 dark:text-rose-400' : 'text-amber-700 dark:text-amber-400'
                                    )}>
                                        {alert.title}
                                    </p>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 truncate max-w-[150px]">
                                        {alert.description}
                                    </p>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                asChild
                                className={cn(
                                    "rounded-xl h-8 px-4 font-black text-[9px] uppercase tracking-widest",
                                    isCritical 
                                        ? 'text-rose-600 hover:bg-rose-500/10' 
                                        : 'text-amber-600 hover:bg-amber-500/10'
                                )}
                            >
                                <Link to={alert.actionUrl}>
                                    {alert.actionLabel}
                                    <ChevronRight className="h-3 w-3 ml-1" />
                                </Link>
                            </Button>
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}

export default ProcessAlerts;
