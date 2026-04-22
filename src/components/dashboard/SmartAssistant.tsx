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
        color: 'bg-rose-500',
        bgColor: 'bg-rose-50/50 border-rose-100 dark:border-rose-500/20',
        textColor: 'text-rose-600',
        icon: AlertTriangle,
        label: 'Crítica'
    },
    urgent: {
        color: 'bg-amber-500',
        bgColor: 'bg-amber-50/50 border-amber-100 dark:border-amber-500/20',
        textColor: 'text-amber-600',
        icon: Clock,
        label: 'Urgente'
    },
    important: {
        color: 'bg-primary',
        bgColor: 'bg-primary/5 border-primary/10 dark:border-primary/20',
        textColor: 'text-primary',
        icon: Target,
        label: 'Importante'
    },
    routine: {
        color: 'bg-secondary',
        bgColor: 'bg-secondary/5 border-secondary/10',
        textColor: 'text-secondary',
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
            <div className="bg-card border-none rounded-[2rem] p-10 text-center animate-pulse shadow-soft">
                <Sparkles className="mx-auto h-10 w-10 text-primary/30 mb-4 animate-bounce" />
                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest ">Iniciando IA Predictiva...</p>
            </div>
        );
    }

    if (missions.length === 0) {
        return (
            <Card className="border-none bg-card shadow-soft rounded-[2.5rem] overflow-hidden group">
                <CardContent className="pt-10 text-center pb-10">
                    <div className="w-16 h-16 bg-primary/10 rounded-[1.8rem] flex items-center justify-center mx-auto mb-6 rotate-3">
                        <CheckCircle2 className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="font-black text-slate-800 dark:text-foreground text-lg uppercase tracking-tighter ">¡ZONA DESPEJADA!</h3>
                    <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">
                        No hay acciones críticas prioritarias
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-none bg-card shadow-soft rounded-[2.5rem] overflow-hidden font-outfit group">
            <CardHeader className="pb-6 px-8 pt-8">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-3 text-sm font-black text-slate-700 dark:text-foreground uppercase tracking-tighter ">
                            <Sparkles className="h-5 w-5 text-primary" />
                            Asistente Inteligente
                            <Badge className="bg-primary/10 text-primary border-none rounded-full px-3 py-0.5 font-black text-[9px] uppercase tracking-widest">
                                IA PREDICTIVA CA
                            </Badge>
                        </CardTitle>
                        <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">
                            Análisis de Red para Siguiente Mejor Acción
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="px-6 pb-8 space-y-4">
                {missions.map((mission, index) => {
                    const config = missionConfig[mission.mission_type as keyof typeof missionConfig] || missionConfig.routine;
                    const EntityIcon = mission.entity_type === 'doctor' ? UserRound : Building2;

                    return (
                        <div
                            key={mission.id}
                            className={cn(
                                "relative p-5 rounded-[1.8rem] border transition-all hover:scale-[1.02] group/item shadow-sm",
                                config.bgColor
                            )}
                        >
                            <div className="absolute -top-2 -left-2 z-10">
                                <div className={cn(
                                    "w-7 h-7 rounded-lg flex items-center justify-center text-white font-black text-xs shadow-md border-2 border-white dark:border-card",
                                    config.color
                                )}>
                                    {index + 1}
                                </div>
                            </div>

                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className={cn("p-1.5 rounded-lg bg-card shadow-soft", config.textColor)}>
                                            <EntityIcon className="h-4 w-4" />
                                        </div>
                                        <span className="font-black text-slate-700 dark:text-foreground truncate text-xs uppercase tracking-tight ">
                                            {mission.name}
                                        </span>
                                    </div>

                                    {(mission.specialty || mission.address) && (
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-3 truncate  opacity-80">
                                            {mission.specialty || mission.address}
                                        </p>
                                    )}

                                    <div className={cn("flex items-center gap-2 mb-4", config.textColor)}>
                                        <span className="text-[11px] font-black uppercase tracking-tighter ">
                                            {mission.reason}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                        <span className="flex items-center gap-1.5">
                                            <Clock className="h-3 w-3" />
                                            {mission.days_since_visit > 900 ? 'NUNCA VISITED' : `${mission.days_since_visit}D AGO`}
                                        </span>
                                        {mission.sales_drop_percent > 0 && (
                                            <span className="text-rose-500 flex items-center gap-1">
                                                -{mission.sales_drop_percent}%
                                            </span>
                                        )}
                                        <div className="flex items-center gap-2">
                                            <div className="h-1 w-12 bg-slate-100 dark:bg-muted/20 rounded-full overflow-hidden">
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
                                        "h-9 w-9 rounded-xl shadow-soft group-hover/item:scale-110 transition-all",
                                        config.textColor,
                                        "bg-card hover:bg-muted"
                                    )}
                                    onClick={() => handleAction(mission)}
                                >
                                    <ArrowRight className="h-5 w-5" />
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
