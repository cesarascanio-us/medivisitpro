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
        bgColor: 'bg-red-500/10 border-red-500/20',
        textColor: 'text-red-400',
        icon: AlertTriangle,
        label: 'Crítica'
    },
    urgent: {
        color: 'bg-amber-500',
        bgColor: 'bg-amber-500/10 border-amber-500/20',
        textColor: 'text-amber-400',
        icon: Clock,
        label: 'Urgente'
    },
    important: {
        color: 'bg-blue-500',
        bgColor: 'bg-blue-500/10 border-blue-500/20',
        textColor: 'text-blue-400',
        icon: Target,
        label: 'Importante'
    },
    routine: {
        color: 'bg-emerald-500',
        bgColor: 'bg-emerald-500/10 border-emerald-500/20',
        textColor: 'text-emerald-400',
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
            <Card className="medical-card border-emerald-500/20">
                <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-emerald-400 animate-pulse" />
                        <Skeleton className="h-6 w-48 bg-white/5" />
                    </div>
                </CardHeader>
                <CardContent className="space-y-3">
                    {[1, 2, 3].map(i => (
                        <Skeleton key={i} className="h-24 w-full bg-white/5" />
                    ))}
                </CardContent>
            </Card>
        );
    }

    if (missions.length === 0) {
        return (
            <Card className="medical-card border-emerald-500/20 shadow-xl">
                <CardContent className="pt-6 text-center">
                    <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Sparkles className="h-6 w-6 text-emerald-400" />
                    </div>
                    <h3 className="font-semibold text-white">¡Todo al día!</h3>
                    <p className="text-sm text-slate-400 mt-1">
                        No hay acciones prioritarias pendientes
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="medical-card border-emerald-500/20 shadow-xl overflow-hidden group">
            <CardHeader className="pb-3 bg-white/5 backdrop-blur-md border-b border-white/10">
                <CardTitle className="flex items-center gap-2 text-lg text-white">
                    <div className="p-2 bg-emerald-500/20 rounded-lg group-hover:scale-110 transition-transform">
                        <Sparkles className="h-5 w-5 text-emerald-400" />
                    </div>
                    Asistente Inteligente
                    <Badge variant="secondary" className="ml-auto bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                        IA Predictiva
                    </Badge>
                </CardTitle>
                <p className="text-sm text-slate-400">
                    Top 3 acciones recomendadas basadas en análisis de datos
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
                            className={`relative p-4 rounded-xl border-2 ${config.bgColor} transition-all hover:scale-[1.01] hover:bg-white/5 group/item`}
                        >
                            {/* Priority Badge */}
                            <div className="absolute -top-2 -left-2">
                                <div className={`w-8 h-8 ${config.color} rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg`}>
                                    {index + 1}
                                </div>
                            </div>

                            <div className="ml-4">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        {/* Header */}
                                        <div className="flex items-center gap-2 mb-1">
                                            <EntityIcon className={`h-4 w-4 ${config.textColor}`} />
                                            <span className="font-semibold text-white truncate">
                                                {mission.name}
                                            </span>
                                            <Badge variant="outline" className="text-[10px] bg-white/5 border-white/10 text-slate-300 h-5">
                                                {mission.entity_type === 'doctor' ? 'Médico' : 'Farmacia'}
                                            </Badge>
                                        </div>

                                        {/* Specialty/Address */}
                                        {(mission.specialty || mission.address) && (
                                            <p className="text-xs text-slate-400 mb-2 truncate">
                                                {mission.specialty || mission.address}
                                            </p>
                                        )}

                                        {/* Reason */}
                                        <div className={`flex items-center gap-2 ${config.textColor}`}>
                                            <MissionIcon className="h-4 w-4 flex-shrink-0" />
                                            <span className="text-sm font-medium truncate">
                                                {mission.reason}
                                            </span>
                                        </div>

                                        {/* Stats Row */}
                                        <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {mission.days_since_visit > 900 ? 'Nunca' : `${mission.days_since_visit}d`}
                                            </span>
                                            {mission.sales_drop_percent > 0 && (
                                                <span className="flex items-center gap-1 text-red-400 font-medium">
                                                    <TrendingDown className="h-3 w-3" />
                                                    -{mission.sales_drop_percent}% ventas
                                                </span>
                                            )}
                                            <div className="ml-auto flex items-center gap-2">
                                                <span className="text-[10px] uppercase font-bold tracking-tighter text-slate-600">
                                                    Score: {Math.round(mission.score * 100)}%
                                                </span>
                                                <div className="h-1 w-10 bg-white/5 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-emerald-500"
                                                        style={{ width: `${mission.score * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Button */}
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className={`ml-2 h-8 w-8 rounded-full ${config.textColor} hover:bg-white/10`}
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
