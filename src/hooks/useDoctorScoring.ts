import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DoctorScore {
    id: string;
    contact_id: string;
    total_visits: number;
    visits_last_30_days: number;
    visits_last_90_days: number;
    samples_received: number;
    products_presented: number;
    score_value: number;
    score_category: 'low' | 'medium' | 'high' | 'vip';
    ideal_visit_frequency_days: number;
    days_since_last_visit: number;
    visit_gap_status: 'on_track' | 'overdue' | 'critical';
    last_visit_date: string | null;
    last_calculated_at: string;
}

interface CalculatedMetrics {
    visits_30: number;
    visits_90: number;
    total_visits: number;
    samples: number;
    last_visit: string | null;
}

export function useDoctorScoring() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    /**
     * Calculate score value based on metrics
     */
    const calculateScoreValue = (metrics: CalculatedMetrics, idealFrequency: number = 30): number => {
        // Pesos: visitas_30d (40%) + visitas_90d (30%) + samples (20%) + consistency (10%)
        const visits30Weight = 4;
        const visits90Weight = 1;
        const samplesWeight = 2;

        let score = 0;

        // Visitas recientes tienen más peso
        score += Math.min(metrics.visits_30 * visits30Weight, 40); // Max 40 puntos
        score += Math.min(metrics.visits_90 * visits90Weight, 30); // Max 30 puntos
        score += Math.min(metrics.samples * samplesWeight, 20); // Max 20 puntos

        // Bonus por consistencia
        if (metrics.last_visit) {
            const daysSince = Math.floor((Date.now() - new Date(metrics.last_visit).getTime()) / (1000 * 60 * 60 * 24));
            if (daysSince <= idealFrequency) {
                score += 10; // On track bonus
            }
        }

        return Math.min(score, 100);
    };

    /**
     * Determine score category
     */
    const getScoreCategory = (score: number): 'low' | 'medium' | 'high' | 'vip' => {
        if (score >= 80) return 'vip';
        if (score >= 60) return 'high';
        if (score >= 30) return 'medium';
        return 'low';
    };

    /**
     * Determine visit gap status
     */
    const getVisitGapStatus = (daysSince: number, idealFrequency: number): 'on_track' | 'overdue' | 'critical' => {
        if (daysSince <= idealFrequency) return 'on_track';
        if (daysSince <= idealFrequency * 2) return 'overdue';
        return 'critical';
    };

    /**
     * Calculate and update score for a single doctor
     */
    const calculateScore = useCallback(async (contactId: string): Promise<DoctorScore | null> => {
        try {
            const now = new Date();
            const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
            const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();

            // Get visits last 30 days
            const { count: visits30 } = await supabase
                .from('visits')
                .select('*', { count: 'exact', head: true })
                .eq('contact_id', contactId)
                .eq('status', 'completed')
                .gte('actual_start_time', thirtyDaysAgo);

            // Get visits last 90 days
            const { count: visits90 } = await supabase
                .from('visits')
                .select('*', { count: 'exact', head: true })
                .eq('contact_id', contactId)
                .eq('status', 'completed')
                .gte('actual_start_time', ninetyDaysAgo);

            // Get total visits
            const { count: totalVisits } = await supabase
                .from('visits')
                .select('*', { count: 'exact', head: true })
                .eq('contact_id', contactId)
                .eq('status', 'completed');

            // Get samples distributed
            const { count: samples } = await (supabase as any)
                .from('sample_distributions')
                .select('*', { count: 'exact', head: true })
                .eq('contact_id', contactId);

            // Get last visit date
            const { data: lastVisit } = await supabase
                .from('visits')
                .select('actual_start_time')
                .eq('contact_id', contactId)
                .eq('status', 'completed')
                .order('actual_start_time', { ascending: false })
                .limit(1)
                .single();

            const metrics: CalculatedMetrics = {
                visits_30: visits30 || 0,
                visits_90: visits90 || 0,
                total_visits: totalVisits || 0,
                samples: samples || 0,
                last_visit: lastVisit?.actual_start_time || null
            };

            const idealFrequency = 30;
            const scoreValue = calculateScoreValue(metrics, idealFrequency);
            const scoreCategory = getScoreCategory(scoreValue);

            let daysSinceLastVisit = 0;
            if (metrics.last_visit) {
                daysSinceLastVisit = Math.floor((Date.now() - new Date(metrics.last_visit).getTime()) / (1000 * 60 * 60 * 24));
            } else {
                daysSinceLastVisit = 999;
            }

            const visitGapStatus = getVisitGapStatus(daysSinceLastVisit, idealFrequency);

            // Upsert score
            const scoreData = {
                contact_id: contactId,
                total_visits: metrics.total_visits,
                visits_last_30_days: metrics.visits_30,
                visits_last_90_days: metrics.visits_90,
                samples_received: metrics.samples,
                score_value: scoreValue,
                score_category: scoreCategory,
                ideal_visit_frequency_days: idealFrequency,
                days_since_last_visit: daysSinceLastVisit,
                visit_gap_status: visitGapStatus,
                last_visit_date: metrics.last_visit,
                last_calculated_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            const { data, error } = await (supabase as any)
                .from('doctor_scores')
                .upsert(scoreData, { onConflict: 'contact_id' })
                .select()
                .single();

            if (error) throw error;
            return data as DoctorScore;
        } catch (error) {
            console.error('Error calculating score:', error);
            return null;
        }
    }, []);

    /**
     * Get top doctors by score
     */
    const getTopDoctors = useCallback(async (limit: number = 10): Promise<DoctorScore[]> => {
        try {
            const { data, error } = await (supabase as any)
                .from('doctor_scores')
                .select('*')
                .order('score_value', { ascending: false })
                .limit(limit);

            if (error) throw error;
            return (data || []) as DoctorScore[];
        } catch (error) {
            console.error('Error getting top doctors:', error);
            return [];
        }
    }, []);

    /**
     * Get doctors that are overdue for a visit
     */
    const getOverdueDoctors = useCallback(async (): Promise<DoctorScore[]> => {
        try {
            const { data, error } = await (supabase as any)
                .from('doctor_scores')
                .select('*')
                .in('visit_gap_status', ['overdue', 'critical'])
                .order('days_since_last_visit', { ascending: false });

            if (error) throw error;
            return (data || []) as DoctorScore[];
        } catch (error) {
            console.error('Error getting overdue doctors:', error);
            return [];
        }
    }, []);

    /**
     * Recalculate scores for all doctors
     */
    const recalculateAllScores = useCallback(async (): Promise<void> => {
        setLoading(true);
        try {
            // Get all doctor contacts
            const { data: doctors, error } = await supabase
                .from('contacts')
                .select('id')
                .eq('contact_type', 'doctor');

            if (error) throw error;

            let calculated = 0;
            for (const doctor of (doctors || [])) {
                await calculateScore(doctor.id);
                calculated++;
            }

            toast({
                title: 'Scores actualizados',
                description: `Se calcularon ${calculated} scores de médicos.`
            });
        } catch (error) {
            console.error('Error recalculating scores:', error);
            toast({
                title: 'Error',
                description: 'No se pudieron actualizar los scores.',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    }, [calculateScore, toast]);

    /**
     * Get score for a specific doctor
     */
    const getDoctorScore = useCallback(async (contactId: string): Promise<DoctorScore | null> => {
        try {
            const { data, error } = await (supabase as any)
                .from('doctor_scores')
                .select('*')
                .eq('contact_id', contactId)
                .single();

            if (error && error.code !== 'PGRST116') throw error;
            return data as DoctorScore | null;
        } catch (error) {
            console.error('Error getting doctor score:', error);
            return null;
        }
    }, []);

    return {
        loading,
        calculateScore,
        getTopDoctors,
        getOverdueDoctors,
        recalculateAllScores,
        getDoctorScore,
        getScoreCategory,
        getVisitGapStatus
    };
}
