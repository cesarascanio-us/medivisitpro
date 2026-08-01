/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
 ======================================================================== */

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Sparkles,
    UserRound,
    Building2,
    AlertTriangle,
    Clock,
    TrendingDown,
    ArrowRight,
    Target,
    Zap,
    CheckCircle2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface NextBestAction {
    id: string;
    entity_type: 'doctor' | 'pharmacy';
    name: string;
    specialty: string | null;
    potential: string | null;
    address: string | null;
    last_visit: string | null;
    days_since_visit: number;
    sales_drop_percent: number;
    score: number;
    reason: string;
    mission_type: 'critical' | 'urgent' | 'important' | 'routine';
}

const missionConfig = {
    critical: {
        color: 'bg-destructive',
        bgColor: 'bg-destructive/10 border-destructive/20',
        textColor: 'text-destructive',
        icon: AlertTriangle,
        label: 'Crítica'
    },
    urgent: {
        color: 'bg-amber-500',
        bgColor: 'bg-amber-500/10 border-amber-500/20',
        textColor: 'text-amber-500',
        icon: Clock,
        label: 'Urgente'
    },
    important: {
        color: 'bg-primary',
        bgColor: 'bg-primary/10 border-primary/20',
        textColor: 'text-primary',
        icon: Target,
        label: 'Importante'
    },
    routine: {
        color: 'bg-muted-foreground',
        bgColor: 'bg-muted border border-border/40',
        textColor: 'text-muted-foreground',
        icon: Zap,
        label: 'Rutina'
    }
};

export function SmartAssistant() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [missions, setMissions] = useState<NextBestAction[]>([]);

    useEffect(() => {
        if (user) {
            loadMissions();
        }
    }, [user]);

    const loadMissions = async () => {
        try {
            const { data, error } = await supabase
                .from('view_next_best_action' as any)
                .select('*')
                .eq('user_id', user?.id)
                .order('score', { ascending: false })
                .limit(3);

            if (error) {
                console.error('Error loading missions:', error);
                setMissions([]);
            } else {
                setMissions((data || []) as unknown as NextBestAction[]);
            }
        } catch (err) {
            console.error('Error:', err);
            setMissions([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = (mission: NextBestAction) => {
        if (mission.entity_type === 'doctor') {
            navigate(`/doctors?highlight=${mission.id}`);
        } else {
            navigate(`/pharmacies?highlight=${mission.id}`);
        }
    };

    if (loading) {
        return (
            <div className="bg-card border border-border/40 rounded-lg p-8 text-center animate-pulse shadow-premium-md text-foreground">
                <Sparkles className="mx-auto h-8 w-8 text-primary/30 mb-4 animate-bounce" />
                <p className="text-muted-foreground font-bold text-xs uppercase tracking-wider">Iniciando IA Predictiva...</p>
            </div>
        );
    }

    if (missions.length === 0) {
        return (
            <Card className="bg-card border border-border/40 shadow-premium-md rounded-lg overflow-hidden group">
                <CardContent className="pt-8 text-center pb-8">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4 rotate-3 border border-primary/20">
                        <CheckCircle2 className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-bold text-foreground text-sm uppercase tracking-tight">¡ZONA DESPEJADA!</h3>
                    <p className="text-xs font-bold text-muted-foreground mt-2 uppercase tracking-wider">
                        No hay acciones críticas prioritarias
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="bg-card border border-border/40 shadow-premium-md rounded-lg overflow-hidden font-sans group">
            <CardHeader className="pb-4 px-6 pt-6">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-3 text-sm font-bold text-foreground uppercase tracking-tight">
                            <Sparkles className="h-4 w-4 text-primary" />
                            Asistente Inteligente
                            <Badge className="bg-primary/10 text-primary border-none rounded-full px-3 py-0.5 font-bold text-xs uppercase tracking-wider">
                                IA PREDICTIVA CA
                            </Badge>
                        </CardTitle>
                        <CardDescription className="text-xs font-bold uppercase tracking-wider text-muted-foreground mt-1">
                            Análisis de Red para Siguiente Mejor Acción
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="px-6 pb-6 space-y-4">
                {missions.map((mission, index) => {
                    const config = missionConfig[mission.mission_type as keyof typeof missionConfig] || missionConfig.routine;
                    const EntityIcon = mission.entity_type === 'doctor' ? UserRound : Building2;

                    return (
                        <div
                            key={mission.id}
                            className={cn(
                                "relative p-4 rounded-lg border transition-all hover:scale-[1.01] group/item shadow-sm",
                                config.bgColor
                            )}
                        >
                            <div className="absolute -top-2 -left-2 z-10">
                                <div className={cn(
                                    "w-6 h-6 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-md border border-border/40",
                                    config.color
                                )}>
                                    {index + 1}
                                </div>
                            </div>

                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className={cn("p-1.5 rounded-lg bg-card shadow-sm border border-border/40", config.textColor)}>
                                            <EntityIcon className="h-4 w-4" />
                                        </div>
                                        <span className="font-bold text-foreground truncate text-xs uppercase tracking-tight">
                                            {mission.name}
                                        </span>
                                    </div>

                                    {(mission.specialty || mission.address) && (
                                        <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-2 truncate opacity-85">
                                            {mission.specialty || mission.address}
                                        </p>
                                    )}

                                    <div className={cn("flex items-center gap-2 mb-3", config.textColor)}>
                                        <span className="text-xs font-bold uppercase tracking-tight">
                                            {mission.reason}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                        <span className="flex items-center gap-1.5">
                                            <Clock className="h-3.5 w-3.5" />
                                            {mission.days_since_visit > 900 ? 'NUNCA VISITED' : `${mission.days_since_visit}D AGO`}
                                        </span>
                                        {mission.sales_drop_percent > 0 && (
                                            <span className="text-destructive flex items-center gap-1">
                                                -{mission.sales_drop_percent}%
                                            </span>
                                        )}
                                        <div className="flex items-center gap-2">
                                            <div className="h-1 w-12 bg-muted rounded-full overflow-hidden text-foreground">
                                                <div
                                                    className={cn("h-full", config.color)}
                                                    style={{ width: `${mission.score * 100}%` }}
                                                />
                                            </div>
                                            <span>{Math.round(mission.score * 100)}%</span>
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className={cn(
                                        "h-8 w-8 rounded-lg shadow-sm group-hover/item:scale-105 transition-all",
                                        config.textColor,
                                        "bg-card hover:bg-muted"
                                    )}
                                    onClick={() => handleAction(mission)}
                                >
                                    <ArrowRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}

export default SmartAssistant;
