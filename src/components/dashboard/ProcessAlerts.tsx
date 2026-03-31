/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import {
    AlertTriangle,
    Clock,
    Calendar,
    XCircle,
    ChevronRight,
    Loader2
} from "lucide-react";

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
    const { user, isMaster, isAdmin, isManager, isSupervisor } = useAuth();
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
            // 1. Buscar ciclos promocionales expirados (fecha fin pasada pero status 'active')
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
                            description: `El ciclo "${cycle.name}" terminó el ${new Date(cycle.end_date).toLocaleDateString()} pero sigue activo.`,
                            severity: 'critical',
                            actionUrl: '/promotional-cycles',
                            actionLabel: 'Cerrar Ciclo'
                        });
                    });
                }
            }

            // 2. Buscar visitas "zombie" (in_progress por más de 24 horas)
            const yesterday = new Date();
            yesterday.setHours(yesterday.getHours() - 24);
            const yesterdayISO = yesterday.toISOString();

            let zombieQuery = supabase
                .from('visits')
                .select('id, scheduled_date, actual_start_time, contact_id')
                .eq('status', 'in_progress')
                .lt('actual_start_time', yesterdayISO);

            // Si no es admin/manager, filtrar solo las propias
            if (!canViewAllAlerts) {
                zombieQuery = zombieQuery.eq('user_id', user.id);
            }

            const { data: zombieVisits, error: visitsError } = await zombieQuery;

            if (!visitsError && zombieVisits && zombieVisits.length > 0) {
                zombieVisits.forEach(visit => {
                    const contactName = (visit.contacts as any)?.name || 'Contacto desconocido';
                    const startTime = visit.actual_start_time || visit.scheduled_date;
                    const hoursAgo = Math.round((new Date().getTime() - new Date(startTime).getTime()) / (1000 * 60 * 60));

                    newAlerts.push({
                        id: `visit-${visit.id}`,
                        type: 'zombie_visit',
                        title: 'Visita Sin Cerrar',
                        description: `Visita a "${contactName}" lleva ${hoursAgo} horas en progreso. ¿Olvidaste hacer check-out?`,
                        severity: 'warning',
                        actionUrl: `/visits/execute/${visit.id}`,
                        actionLabel: 'Cerrar Visita'
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
            <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (alerts.length === 0) {
        return null; // No mostrar nada si no hay alertas
    }

    return (
        <Card className="border-l-4 border-l-amber-500 bg-amber-50/30">
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                    Alertas de Proceso
                    <Badge variant="outline" className="ml-2 bg-amber-100 text-amber-800 border-amber-200">
                        {alerts.length}
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {alerts.map((alert) => (
                    <div
                        key={alert.id}
                        className={`flex items-start justify-between p-3 rounded-lg ${alert.severity === 'critical'
                            ? 'bg-red-50 border border-red-200'
                            : 'bg-amber-50 border border-amber-200'
                            }`}
                    >
                        <div className="flex items-start gap-3">
                            {alert.type === 'cycle_expired' ? (
                                <Calendar className={`h-5 w-5 mt-0.5 ${alert.severity === 'critical' ? 'text-red-600' : 'text-amber-600'
                                    }`} />
                            ) : (
                                <Clock className={`h-5 w-5 mt-0.5 ${alert.severity === 'critical' ? 'text-red-600' : 'text-amber-600'
                                    }`} />
                            )}
                            <div>
                                <p className={`font-medium text-sm ${alert.severity === 'critical' ? 'text-red-800' : 'text-amber-800'
                                    }`}>
                                    {alert.title}
                                </p>
                                <p className={`text-xs mt-0.5 ${alert.severity === 'critical' ? 'text-red-600' : 'text-amber-600'
                                    }`}>
                                    {alert.description}
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className={`shrink-0 ${alert.severity === 'critical'
                                ? 'text-red-700 hover:bg-red-100'
                                : 'text-amber-700 hover:bg-amber-100'
                                }`}
                        >
                            <Link to={alert.actionUrl}>
                                {alert.actionLabel}
                                <ChevronRight className="h-4 w-4 ml-1" />
                            </Link>
                        </Button>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
