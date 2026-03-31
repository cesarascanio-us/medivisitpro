/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Target, TrendingUp, ShieldAlert, Award, Clock, Users, AlertTriangle } from 'lucide-react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';

interface ScorecardMetrics {
    panelTotal: number;
    panelCovered: number;
    coverageRate: number;
    totalVisits: number;
    avgDailyVisits: number;
    pharmaciesUnderStock: number;
    pharmaciesTotalChecked: number;
    stockRiskRate: number;
    superScore: number | null; // For the new evaluation score
}

export const RepresentativeScorecard = () => {
    const { user } = useAuth();
    const [metrics, setMetrics] = useState<ScorecardMetrics>({
        panelTotal: 0,
        panelCovered: 0,
        coverageRate: 0,
        totalVisits: 0,
        avgDailyVisits: 0,
        pharmaciesUnderStock: 0,
        pharmaciesTotalChecked: 0,
        stockRiskRate: 0,
        superScore: null
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) loadMetrics();
    }, [user]);

    const loadMetrics = async () => {
        try {
            if (!user) return;
            const today = new Date();
            const start = startOfMonth(today).toISOString();
            const end = endOfMonth(today).toISOString();

            // 1. Productivity: Panel Coverage
            // Get total contacts assigned
            const { count: totalContacts } = await supabase
                .from('contacts')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id)
                .eq('contact_type', 'doctor'); // Assuming panel is doctors for coverage

            // Get unique visited contacts this month
            const { data: visits } = await supabase
                .from('visits')
                .select('contact_id, scheduled_date')
                .eq('user_id', user.id)
                .gte('scheduled_date', start)
                .lte('scheduled_date', end)
                .eq('status', 'completed');

            const uniqueContacts = new Set(visits?.map(v => v.contact_id));
            const coveredInfo = uniqueContacts.size;

            // Calc Avg Daily (Simplified: Visits / 20 working days or Visits / Business Days Passed)
            const dayOfMonth = Math.max(1, today.getDate());
            // Simple Workday calc approx:
            const workDays = Math.floor(dayOfMonth * 5 / 7) || 1;
            const avgDaily = visits ? Math.round((visits.length / workDays) * 10) / 10 : 0;

            // 2. Shielding: Stock Risk (Blindaje)
            // Use the RPC we secured - cast to any to bypass strict type check for now
            const { data: leakageData } = await (supabase as any).rpc('get_visit_impact_correlation', {
                p_doctor_id: 'all',
                p_radius_km: 5.0
            });

            let pharmRiskCount = 0;
            let pharmTotal = 0;

            if (leakageData && Array.isArray(leakageData)) {
                // Determine unique pharmacies checked in the risk report
                const uniquePharms = new Set(leakageData.map((d: any) => d.pharmacy_name));
                pharmTotal = uniquePharms.size;
                // Count risks
                const riskyPharms = new Set(leakageData.filter((d: any) => d.stock_risk).map((d: any) => d.pharmacy_name));
                pharmRiskCount = riskyPharms.size;
            }

            // 3. Quality: Recent Evaluation
            const { data: evalData } = await supabase
                .from('field_evaluations')
                .select('score_vademecum, score_objection_handling, score_closing_skills, score_pre_call_planning')
                .eq('representative_id', user.id)
                .gte('created_at', start)
                .lte('created_at', end);

            let calculatedScore = null;
            if (evalData && evalData.length > 0) {
                let totalSum = 0;
                let dataPoints = 0;
                evalData.forEach((ev: any) => {
                    totalSum += (ev.score_vademecum || 0) + (ev.score_objection_handling || 0) + (ev.score_closing_skills || 0) + (ev.score_pre_call_planning || 0);
                    dataPoints += 4;
                });
                if (dataPoints > 0) {
                    calculatedScore = Math.round((totalSum / dataPoints) * 10) / 10;
                }
            }

            setMetrics({
                panelTotal: totalContacts || 0,
                panelCovered: coveredInfo,
                coverageRate: totalContacts ? Math.round((coveredInfo / totalContacts) * 100) : 0,
                totalVisits: visits?.length || 0,
                avgDailyVisits: avgDaily,
                pharmaciesUnderStock: pharmRiskCount,
                pharmaciesTotalChecked: pharmTotal,
                stockRiskRate: pharmTotal ? Math.round((pharmRiskCount / pharmTotal) * 100) : 0,
                superScore: calculatedScore
            });

        } catch (error) {
            console.error("Error loading scorecard metrics:", error);
        } finally {
            setLoading(false);
        }
    };

    const getScoreColor = (score: number, target: number) => {
        if (score >= target) return "text-emerald-500";
        if (score >= target * 0.8) return "text-amber-500";
        return "text-rose-500";
    };

    // Removed indicatorClassName prop logic as it is not supported in standard Shadcn/UI Progress currently.
    // We will rely on default styling or global CSS overrides if needed.

    return (
        <Card className="col-span-full border-border/50 shadow-sm mb-6 bg-card/50 backdrop-blur-md">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-xl flex items-center gap-2">
                            <Target className="w-5 h-5 text-primary" />
                            Scorecard 360° - {format(new Date(), 'MMMM yyyy', { locale: es })}
                        </CardTitle>
                        <CardDescription>
                            Medición de Productividad, Gestión y Calidad en tiempo real.
                        </CardDescription>
                    </div>
                    <Badge variant="outline" className="px-3 py-1 border-primary/20 bg-primary/5 text-primary">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        En Curso
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">

                    {/* KPI 1: Cobertura de Panel (Productividad Field) */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-end">
                            <span className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                                <Users className="w-4 h-4" /> Cobertura Panel
                            </span>
                            <span className={`text-2xl font-bold ${getScoreColor(metrics.coverageRate, 95)}`}>
                                {metrics.coverageRate}%
                            </span>
                        </div>
                        <Progress value={metrics.coverageRate} className="h-2" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{metrics.panelCovered} / {metrics.panelTotal} Drs</span>
                            <span className="font-semibold text-foreground">Meta: 95%</span>
                        </div>
                    </div>

                    {/* KPI 2: Promedio Diario (Intensidad) */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-end">
                            <span className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                                <Clock className="w-4 h-4" /> Promedio Diario
                            </span>
                            <span className={`text-2xl font-bold ${getScoreColor(metrics.avgDailyVisits, 10)}`}>
                                {metrics.avgDailyVisits}
                            </span>
                        </div>
                        {/* Scale 0 to 15 */}
                        <Progress value={(metrics.avgDailyVisits / 15) * 100} className="h-2" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{metrics.totalVisits} Visitas Totales</span>
                            <span className="font-semibold text-foreground">Meta: 10-12</span>
                        </div>
                    </div>

                    {/* KPI 3: Blindaje (Out-of-Stock Risk) */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-end">
                            <span className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                                <ShieldAlert className="w-4 h-4" /> Riesgo Stock
                            </span>
                            {/* Lower is better here */}
                            <span className={`text-2xl font-bold ${metrics.stockRiskRate < 5 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                {metrics.stockRiskRate}%
                            </span>
                        </div>
                        <Progress value={metrics.stockRiskRate} className="h-2" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{metrics.pharmaciesUnderStock} Farmacias en Riesgo</span>
                            <span className="font-semibold text-foreground">Meta: &lt;5%</span>
                        </div>
                    </div>

                    {/* KPI 4: Calidad Técnica (Evaluación Supervisor) */}
                    <div className={`space-y-2 ${metrics.superScore === null ? 'opacity-70' : ''}`}>
                        <div className="flex justify-between items-end">
                            <span className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                                <Award className="w-4 h-4" /> Calidad Técnica
                            </span>
                            <span className={`text-2xl font-bold ${metrics.superScore ? getScoreColor(metrics.superScore, 4.5) : 'text-muted-foreground'}`}>
                                {metrics.superScore ? metrics.superScore : '--'}
                            </span>
                        </div>
                        <Progress value={metrics.superScore ? (metrics.superScore / 5) * 100 : 0} className="h-2" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                                {metrics.superScore ? (
                                    <span className="text-foreground font-medium">Promedio Mes Actual</span>
                                ) : (
                                    <>
                                        <AlertTriangle className="w-3 h-3 text-amber-500" /> Pendiente Evaluación
                                    </>
                                )}
                            </span>
                            <span className="font-semibold text-foreground">Meta: 4.5/5</span>
                        </div>
                    </div>

                </div>
            </CardContent>
        </Card>
    );
};
