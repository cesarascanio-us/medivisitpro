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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Sparkles,
    UserRound,
    Building2,
    AlertTriangle,
    Clock,
    TrendingDown,
    ArrowRight,
    Target,
    Zap
} from "lucide-react";
import { useNavigate } from "react-router-dom";

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
        color: 'bg-red-500',
        bgColor: 'bg-red-50/50 border-red-100',
        textColor: 'text-red-600',
        icon: AlertTriangle,
        label: 'Crítica'
    },
    urgent: {
        color: 'bg-amber-500',
        bgColor: 'bg-amber-50/50 border-amber-100',
        textColor: 'text-amber-600',
        icon: Clock,
        label: 'Urgente'
    },
    important: {
        color: 'bg-primary',
        bgColor: 'bg-primary/5 border-primary/10',
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
            // @ts-ignore - View might not be in generated types yet
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
            <Card className="corporate-card border-primary/10">
                <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                        <Skeleton className="h-6 w-48 bg-gray-100" />
                    </div>
                </CardHeader>
                <CardContent className="space-y-3">
                    {[1, 2, 3].map(i => (
                        <Skeleton key={i} className="h-24 w-full bg-gray-50" />
                    ))}
                </CardContent>
            </Card>
        );
    }

    if (missions.length === 0) {
        return (
            <Card className="corporate-card border-primary/10 shadow-xl">
                <CardContent className="pt-6 text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Sparkles className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-bold text-text-main text-lg">¡Todo al día!</h3>
                    <p className="text-sm text-text-muted mt-1 font-medium">
                        No hay acciones prioritarias pendientes
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="corporate-card border-primary/10 shadow-xl overflow-hidden group">
            <CardHeader className="pb-3 bg-gray-50/50 border-b border-gray-100">
                <CardTitle className="flex items-center gap-2 text-lg text-text-main">
                    <div className="p-2 bg-primary/10 rounded-lg group-hover:scale-110 transition-transform">
                        <Sparkles className="h-5 w-5 text-primary" />
                    </div>
                    <span className="font-black tracking-tight">Asistente Inteligente</span>
                    <Badge variant="outline" className="ml-auto bg-primary/5 text-primary border-primary/20 text-[10px] font-bold">
                        IA IA PREDICTIVA
                    </Badge>
                </CardTitle>
                <p className="text-xs text-text-muted font-bold uppercase tracking-wider mt-1">
                    Acciones recomendadas por análisis de datos
                </p>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
                {missions.map((mission, index) => {
                    const config = missionConfig[mission.mission_type as keyof typeof missionConfig] || missionConfig.routine;
                    const MissionIcon = config.icon;
                    const EntityIcon = mission.entity_type === 'doctor' ? UserRound : Building2;

                    return (
                        <div
                            key={mission.id}
                            className={`relative p-4 rounded-xl border ${config.bgColor} transition-all hover:scale-[1.01] hover:bg-white group/item shadow-sm`}
                        >
                            {/* Priority Badge */}
                            <div className="absolute -top-2 -left-2 z-10">
                                <div className={`w-8 h-8 ${config.color} rounded-lg flex items-center justify-center text-white font-black text-sm shadow-md border-2 border-white`}>
                                    {index + 1}
                                </div>
                            </div>

                            <div className="ml-4">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        {/* Header */}
                                        <div className="flex items-center gap-2 mb-1">
                                            <EntityIcon className={`h-4 w-4 ${config.textColor}`} />
                                            <span className="font-bold text-text-main truncate">
                                                {mission.name}
                                            </span>
                                            <Badge variant="outline" className="text-[9px] bg-gray-50 border-gray-100 text-text-muted h-5 font-bold">
                                                {mission.entity_type === 'doctor' ? 'Médico' : 'Farmacia'}
                                            </Badge>
                                        </div>

                                        {/* Specialty/Address */}
                                        {(mission.specialty || mission.address) && (
                                            <p className="text-xs text-text-muted mb-2 truncate font-medium">
                                                {mission.specialty || mission.address}
                                            </p>
                                        )}

                                        {/* Reason */}
                                        <div className={`flex items-center gap-2 ${config.textColor}`}>
                                            <MissionIcon className="h-4 w-4 flex-shrink-0" />
                                            <span className="text-sm font-black truncate">
                                                {mission.reason}
                                            </span>
                                        </div>

                                        {/* Stats Row */}
                                        <div className="flex items-center gap-4 mt-3 text-xs text-text-muted">
                                            <span className="flex items-center gap-1 font-bold">
                                                <Clock className="h-3 w-3" />
                                                {mission.days_since_visit > 900 ? 'Nunca' : `${mission.days_since_visit}d`}
                                            </span>
                                            {mission.sales_drop_percent > 0 && (
                                                <span className="flex items-center gap-1 text-red-600 font-black">
                                                    <TrendingDown className="h-3 w-3" />
                                                    -{mission.sales_drop_percent}% ventas
                                                </span>
                                            )}
                                            <div className="ml-auto flex items-center gap-2">
                                                <span className="text-[10px] uppercase font-black tracking-tighter text-text-muted">
                                                    Prioridad: {Math.round(mission.score * 100)}%
                                                </span>
                                                <div className="h-1.5 w-12 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                                                    <div
                                                        className={`h-full ${config.color}`}
                                                        style={{ width: `${mission.score * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Button */}
                                    <Button
                                        size="icon"
                                        variant="outline"
                                        className={`ml-2 h-9 w-9 rounded-full ${config.textColor} border-current hover:bg-white shadow-sm transition-transform hover:scale-110`}
                                        onClick={() => handleAction(mission)}
                                    >
                                        <ArrowRight className="h-5 w-5" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}
