/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, AlertTriangle, ArrowRight, Trophy, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getSuggestedVisits, getBestVisitTime } from '@/services/suggestionService';
import { useAuth } from '@/hooks/useAuth';

interface VisitSuggestion {
    doctor: {
        id: string;
        name: string;
        specialty: string | null;
    };
    score: number;
    reason: string;
    priority: 'high' | 'medium' | 'low';
    daysSinceLastVisit: number;
}

const PRIORITY_CONFIG = {
    high: { color: 'bg-red-100 text-red-800', icon: AlertTriangle },
    medium: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    low: { color: 'bg-green-100 text-green-800', icon: Trophy }
};

export function NextVisitSuggestions({ className }: { className?: string }) {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [suggestions, setSuggestions] = useState<VisitSuggestion[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) loadSuggestions();
    }, [user]);

    const loadSuggestions = async () => {
        setLoading(true);
        const data = await getSuggestedVisits(user?.id || '', 5);
        setSuggestions(data);
        setLoading(false);
    };

    const handleSchedule = (doctorId: string) => {
        navigate(`/visitas?doctor=${doctorId}`);
    };

    if (loading) {
        return (
            <Card className={`medical-card ${className || ''}`}>
                <CardContent className="p-6 text-center text-muted-foreground">
                    Cargando sugerencias...
                </CardContent>
            </Card>
        );
    }

    if (suggestions.length === 0) {
        return (
            <Card className={`medical-card ${className || ''}`}>
                <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                        <Calendar className="mr-2 h-5 w-5 text-primary" />
                        Próximas Visitas Sugeridas
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-center py-4 text-muted-foreground">
                    <Trophy className="mx-auto h-8 w-8 mb-2 opacity-50" />
                    <p>¡Excelente! Todos tus médicos están al día.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={`medical-card ${className || ''}`}>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-lg">
                    <Calendar className="mr-2 h-5 w-5 text-primary" />
                    Próximas Visitas Sugeridas
                </CardTitle>
                <CardDescription>Basado en scoring y frecuencia de visita</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                {suggestions.map((suggestion) => {
                    const priorityConfig = PRIORITY_CONFIG[suggestion.priority];
                    const PriorityIcon = priorityConfig.icon;

                    return (
                        <div
                            key={suggestion.doctor.id}
                            className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted/80 transition-colors"
                        >
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <p className="font-medium truncate">{suggestion.doctor.name}</p>
                                    <Badge className={priorityConfig.color} variant="secondary">
                                        <PriorityIcon className="h-3 w-3 mr-1" />
                                        {suggestion.priority === 'high' ? 'Urgente' : suggestion.priority === 'medium' ? 'Pendiente' : 'Sugerido'}
                                    </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground">{suggestion.doctor.specialty || 'General'}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <p className="text-xs text-muted-foreground">{suggestion.reason}</p>
                                    <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded flex items-center">
                                        <Clock className="h-2.5 w-2.5 mr-1" />
                                        Mejor hora: {getBestVisitTime('doctor', suggestion.doctor.name)}
                                    </span>
                                </div>
                            </div>
                            <Button
                                size="sm"
                                variant={suggestion.priority === 'high' ? 'destructive' : 'outline'}
                                onClick={() => handleSchedule(suggestion.doctor.id)}
                            >
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        </div>
                    );
                })}

                <Button
                    variant="ghost"
                    className="w-full mt-2"
                    onClick={() => navigate('/doctors')}
                >
                    Ver todos los médicos
                </Button>
            </CardContent>
        </Card>
    );
}
