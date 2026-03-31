/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import { Trophy, TrendingUp, TrendingDown, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface DoctorScoreCardProps {
    score: number;
    category: 'low' | 'medium' | 'high' | 'vip';
    visitGapStatus: 'on_track' | 'overdue' | 'critical';
    daysSinceLastVisit: number;
    totalVisits: number;
    compact?: boolean;
    onScheduleVisit?: () => void;
}

const CATEGORY_CONFIG = {
    low: { label: 'Bajo', color: 'bg-gray-100 text-gray-800', icon: TrendingDown },
    medium: { label: 'Medio', color: 'bg-yellow-100 text-yellow-800', icon: TrendingUp },
    high: { label: 'Alto', color: 'bg-green-100 text-green-800', icon: TrendingUp },
    vip: { label: 'VIP', color: 'bg-purple-100 text-purple-800', icon: Trophy }
};

const GAP_CONFIG = {
    on_track: { label: 'Al día', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    overdue: { label: 'Vencido', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    critical: { label: 'Crítico', color: 'bg-red-100 text-red-800', icon: AlertTriangle }
};

export function DoctorScoreCard({
    score,
    category,
    visitGapStatus,
    daysSinceLastVisit,
    totalVisits,
    compact = false,
    onScheduleVisit
}: DoctorScoreCardProps) {
    const categoryConfig = CATEGORY_CONFIG[category];
    const gapConfig = GAP_CONFIG[visitGapStatus];
    const CategoryIcon = categoryConfig.icon;
    const GapIcon = gapConfig.icon;

    if (compact) {
        return (
            <div className="flex items-center gap-2">
                <div className="relative w-10 h-10">
                    <svg className="w-10 h-10 transform -rotate-90">
                        <circle
                            cx="20"
                            cy="20"
                            r="16"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            className="text-muted"
                        />
                        <circle
                            cx="20"
                            cy="20"
                            r="16"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeDasharray={`${(score / 100) * 100.53} 100.53`}
                            className={category === 'vip' ? 'text-purple-500' : category === 'high' ? 'text-green-500' : category === 'medium' ? 'text-yellow-500' : 'text-gray-400'}
                        />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">
                        {Math.round(score)}
                    </span>
                </div>
                <Badge className={categoryConfig.color}>
                    <CategoryIcon className="h-3 w-3 mr-1" />
                    {categoryConfig.label}
                </Badge>
            </div>
        );
    }

    return (
        <Card className="medical-card">
            <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        {/* Score Circle */}
                        <div className="relative w-16 h-16">
                            <svg className="w-16 h-16 transform -rotate-90">
                                <circle
                                    cx="32"
                                    cy="32"
                                    r="28"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                    className="text-muted"
                                />
                                <circle
                                    cx="32"
                                    cy="32"
                                    r="28"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                    strokeDasharray={`${(score / 100) * 175.93} 175.93`}
                                    className={category === 'vip' ? 'text-purple-500' : category === 'high' ? 'text-green-500' : category === 'medium' ? 'text-yellow-500' : 'text-gray-400'}
                                />
                            </svg>
                            <span className="absolute inset-0 flex items-center justify-center text-lg font-bold">
                                {Math.round(score)}
                            </span>
                        </div>

                        <div>
                            <Badge className={categoryConfig.color}>
                                <CategoryIcon className="h-3 w-3 mr-1" />
                                {categoryConfig.label}
                            </Badge>
                            <p className="text-xs text-muted-foreground mt-1">
                                {totalVisits} visitas totales
                            </p>
                        </div>
                    </div>

                    <div className="text-right">
                        <Badge className={gapConfig.color}>
                            <GapIcon className="h-3 w-3 mr-1" />
                            {gapConfig.label}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                            {daysSinceLastVisit > 0 ? `Hace ${daysSinceLastVisit} días` : 'Sin visitas'}
                        </p>
                    </div>
                </div>

                <Progress value={score} className="h-2 mb-3" />

                {visitGapStatus !== 'on_track' && onScheduleVisit && (
                    <Button
                        onClick={onScheduleVisit}
                        size="sm"
                        variant={visitGapStatus === 'critical' ? 'destructive' : 'outline'}
                        className="w-full"
                    >
                        Programar Visita
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}

// Simple badge version for table display
export function ScoreBadge({ score, category }: { score: number; category: 'low' | 'medium' | 'high' | 'vip' }) {
    const config = CATEGORY_CONFIG[category];
    const Icon = config.icon;

    return (
        <div className="flex items-center gap-2">
            <span className="font-bold text-sm">{Math.round(score)}</span>
            <Badge className={config.color} variant="secondary">
                <Icon className="h-3 w-3 mr-1" />
                {config.label}
            </Badge>
        </div>
    );
}

// Gap status badge
export function GapStatusBadge({ status }: { status: 'on_track' | 'overdue' | 'critical' }) {
    const config = GAP_CONFIG[status];
    const Icon = config.icon;

    return (
        <Badge className={config.color} variant="secondary">
            <Icon className="h-3 w-3 mr-1" />
            {config.label}
        </Badge>
    );
}
