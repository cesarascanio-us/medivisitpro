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
        bgColor: 'bg-red-50 border-red-200',
        textColor: 'text-red-700',
        icon: AlertTriangle,
        label: 'Crítica'
    },
    urgent: {
        color: 'bg-amber-500',
        bgColor: 'bg-amber-50 border-amber-200',
        textColor: 'text-amber-700',
        icon: Clock,
        label: 'Urgente'
    },
    important: {
        color: 'bg-blue-500',
        bgColor: 'bg-blue-50 border-blue-200',
        textColor: 'text-blue-700',
        icon: Target,
        label: 'Importante'
    },
    routine: {
        color: 'bg-emerald-500',
        bgColor: 'bg-emerald-50 border-emerald-200',
        textColor: 'text-emerald-700',
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
                // Fallback: mostrar mensaje si la vista no existe aún
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
        // Navigate to planning with pre-selected entity
        if (mission.entity_type === 'doctor') {
            navigate(`/doctors?highlight=${mission.id}`);
        } else {
            navigate(`/pharmacies?highlight=${mission.id}`);
        }
    };

    if (loading) {
        return (
            <Card className="border-2 border-dashed border-primary/20">
                <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                        <Skeleton className="h-6 w-48" />
                    </div>
                </CardHeader>
                <CardContent className="space-y-3">
                    {[1, 2, 3].map(i => (
                        <Skeleton key={i} className="h-24 w-full" />
                    ))}
                </CardContent>
            </Card>
        );
    }

    if (missions.length === 0) {
        return (
            <Card className="border border-emerald-200 bg-white shadow-sm">
                <CardContent className="pt-6 text-center">
                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Sparkles className="h-6 w-6 text-emerald-600" />
                    </div>
                    <h3 className="font-semibold text-emerald-800">¡Todo al día!</h3>
                    <p className="text-sm text-emerald-600 mt-1">
                        No hay acciones prioritarias pendientes
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 shadow-lg">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Sparkles className="h-5 w-5 text-primary" />
                    </div>
                    Asistente Inteligente
                    <Badge variant="secondary" className="ml-auto bg-primary/10 text-primary">
                        IA Predictiva
                    </Badge>
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                    Top 3 acciones recomendadas basadas en análisis de datos
                </p>
            </CardHeader>
            <CardContent className="space-y-3">
                {missions.map((mission, index) => {
                    const config = missionConfig[mission.mission_type];
                    const MissionIcon = config.icon;
                    const EntityIcon = mission.entity_type === 'doctor' ? UserRound : Building2;

                    return (
                        <div
                            key={mission.id}
                            className={`relative p-4 rounded-xl border-2 ${config.bgColor} transition-all hover:scale-[1.02] hover:shadow-md`}
                        >
                            {/* Priority Badge */}
                            <div className="absolute -top-2 -left-2">
                                <div className={`w-8 h-8 ${config.color} rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg`}>
                                    {index + 1}
                                </div>
                            </div>

                            <div className="ml-4">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1">
                                        {/* Header */}
                                        <div className="flex items-center gap-2 mb-1">
                                            <EntityIcon className={`h-4 w-4 ${config.textColor}`} />
                                            <span className="font-semibold text-slate-800 line-clamp-1">
                                                {mission.name}
                                            </span>
                                            <Badge variant="outline" className="text-xs">
                                                {mission.entity_type === 'doctor' ? 'Médico' : 'Farmacia'}
                                            </Badge>
                                        </div>

                                        {/* Specialty/Address */}
                                        {(mission.specialty || mission.address) && (
                                            <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
                                                {mission.specialty || mission.address}
                                            </p>
                                        )}

                                        {/* Reason */}
                                        <div className={`flex items-center gap-2 ${config.textColor}`}>
                                            <MissionIcon className="h-4 w-4 flex-shrink-0" />
                                            <span className="text-sm font-medium line-clamp-1">
                                                {mission.reason}
                                            </span>
                                        </div>

                                        {/* Stats Row */}
                                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {mission.days_since_visit > 900 ? 'Nunca visitado' : `${mission.days_since_visit} días`}
                                            </span>
                                            {mission.sales_drop_percent > 0 && (
                                                <span className="flex items-center gap-1 text-red-600">
                                                    <TrendingDown className="h-3 w-3" />
                                                    -{mission.sales_drop_percent}% ventas
                                                </span>
                                            )}
                                            <Badge className={`${config.color} text-white text-xs`}>
                                                Score: {mission.score}
                                            </Badge>
                                        </div>
                                    </div>

                                    {/* Action Button */}
                                    <Button
                                        size="sm"
                                        className={`${config.color} hover:opacity-90 shadow-md`}
                                        onClick={() => handleAction(mission)}
                                    >
                                        <span className="hidden sm:inline mr-1">Visitar</span>
                                        <ArrowRight className="h-4 w-4" />
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
