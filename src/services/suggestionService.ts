/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import { supabase } from '@/integrations/supabase/client';

interface Product {
    id: string;
    name: string;
    therapeutic_area: string | null;
    category: string | null;
}

interface Doctor {
    id: string;
    name: string;
    specialty: string | null;
}

interface VisitSuggestion {
    doctor: Doctor;
    score: number;
    reason: string;
    priority: 'high' | 'medium' | 'low';
    daysSinceLastVisit: number;
}

// Mapping of specialties to therapeutic areas
const SPECIALTY_THERAPEUTIC_MAP: Record<string, string[]> = {
    'Cardiología': ['cardiovascular', 'hipertensión', 'cardíaco'],
    'Pediatría': ['pediátrico', 'infantil', 'vaccines'],
    'Ginecología': ['ginecológico', 'hormonal', 'anticonceptivo'],
    'Neurología': ['neurológico', 'sistema nervioso', 'dolor'],
    'Gastroenterología': ['digestivo', 'gastrointestinal', 'hepático'],
    'Endocrinología': ['diabetes', 'hormonal', 'tiroides'],
    'Neumología': ['respiratorio', 'pulmonar', 'asma'],
    'Dermatología': ['dermatológico', 'piel', 'cutáneo'],
    'Psiquiatría': ['psiquiátrico', 'antidepresivo', 'ansiolítico'],
    'Reumatología': ['reumatológico', 'articular', 'antiinflamatorio'],
    'Urología': ['urológico', 'próstata', 'renal'],
    'Oftalmología': ['oftálmico', 'ocular', 'visión'],
    'Oncología': ['oncológico', 'antineoplásico', 'quimioterapia'],
    'Medicina General': ['general', 'multivitamínico', 'analgésico'],
    'Medicina Interna': ['general', 'cardiovascular', 'digestivo'],
};

/**
 * Get products that match a doctor's specialty
 */
export async function getProductsForSpecialty(specialty: string | null): Promise<Product[]> {
    if (!specialty) return [];

    try {
        // Get therapeutic areas for this specialty
        const therapeuticAreas = SPECIALTY_THERAPEUTIC_MAP[specialty] || [];

        if (therapeuticAreas.length === 0) {
            // If no specific mapping, return all products
            const { data, error } = await (supabase as any)
                .from('products')
                .select('id, name, therapeutic_area, category')
                .eq('is_active', true)
                .limit(10);

            if (error) throw error;
            return (data || []) as Product[];
        }

        // Get products matching therapeutic areas
        const { data, error } = await (supabase as any)
            .from('products')
            .select('id, name, therapeutic_area, category')
            .eq('is_active', true);

        if (error) throw error;

        // Filter products by therapeutic area match
        const matchedProducts = ((data || []) as Product[]).filter(product => {
            const area = (product.therapeutic_area || '').toLowerCase();
            return therapeuticAreas.some(ta => area.includes(ta.toLowerCase()));
        });

        // If no matches, return top products
        return matchedProducts.length > 0 ? matchedProducts : ((data || []) as Product[]).slice(0, 5);
    } catch (error) {
        console.error('Error getting products for specialty:', error);
        return [];
    }
}

/**
 * Get suggested next visits based on scoring and frequency
 */
export async function getSuggestedVisits(userId: string, limit: number = 5): Promise<VisitSuggestion[]> {
    try {
        // Get doctor scores with overdue or critical status
        const { data: scores, error: scoresError } = await (supabase as any)
            .from('doctor_scores')
            .select('*, contacts(id, name, specialty)')
            .in('visit_gap_status', ['overdue', 'critical'])
            .order('days_since_last_visit', { ascending: false })
            .limit(limit);

        if (scoresError) throw scoresError;

        // If not enough overdue, get high-score doctors
        if ((scores?.length || 0) < limit) {
            const remaining = limit - (scores?.length || 0);
            const { data: highScoreDoctors } = await (supabase as any)
                .from('doctor_scores')
                .select('*, contacts(id, name, specialty)')
                .eq('visit_gap_status', 'on_track')
                .order('score_value', { ascending: false })
                .limit(remaining);

            if (highScoreDoctors) {
                scores?.push(...highScoreDoctors);
            }
        }

        // Transform to suggestions
        const suggestions: VisitSuggestion[] = (scores || []).map((score: any) => {
            let reason = '';
            let priority: 'high' | 'medium' | 'low' = 'low';

            if (score.visit_gap_status === 'critical') {
                reason = `Sin visita hace ${score.days_since_last_visit} días (crítico)`;
                priority = 'high';
            } else if (score.visit_gap_status === 'overdue') {
                reason = `Visita pendiente (${score.days_since_last_visit} días)`;
                priority = 'medium';
            } else if (score.score_value >= 80) {
                reason = `Médico VIP - Score ${Math.round(score.score_value)}`;
                priority = 'medium';
            } else {
                reason = `Score ${Math.round(score.score_value)} - Mantener relación`;
                priority = 'low';
            }

            return {
                doctor: score.contacts,
                score: score.score_value,
                reason,
                priority,
                daysSinceLastVisit: score.days_since_last_visit
            };
        });

        // Sort by priority
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        suggestions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

        return suggestions;
    } catch (error) {
        console.error('Error getting suggested visits:', error);
        return [];
    }
}

/**
 * Get specialty match score between a doctor and product
 */
export function getSpecialtyMatchScore(doctorSpecialty: string | null, productTherapeuticArea: string | null): number {
    if (!doctorSpecialty || !productTherapeuticArea) return 0;

    const therapeuticAreas = SPECIALTY_THERAPEUTIC_MAP[doctorSpecialty] || [];
    const area = productTherapeuticArea.toLowerCase();

    for (const ta of therapeuticAreas) {
        if (area.includes(ta.toLowerCase())) {
            return 100;
        }
    }

    return 0;
}

/**
 * Suggest best visit time for a doctor
 */
export function getBestVisitTime(contactType: string, doctorName: string): string {
    // Deterministic simulation based on name and type
    const hash = doctorName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

    // Morning: 8:00 - 12:00, Afternoon: 14:00 - 18:00
    const hours = contactType === 'doctor'
        ? [8, 9, 10, 11, 14, 15, 16, 17]
        : [9, 10, 11, 15, 16, 17]; // Pharmacies prefer mid-morning/afternoon

    const hour = hours[hash % hours.length];
    const minutes = (hash % 4) * 15; // 0, 15, 30, 45

    return `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

/**
 * Automatically match representatives to doctors based on zone and specialty overlap
 */
export function autoAssignRepresentatives(
    doctors: any[],
    representatives: any[]
): { doctorId: string; representativeId: string; matchScore: number }[] {
    const assignments: { doctorId: string; representativeId: string; matchScore: number }[] = [];

    doctors.forEach(doctor => {
        let bestMatch = { id: '', score: -1 };

        representatives.forEach(rep => {
            let score = 0;

            // 1. Zone match (Critical)
            if (doctor.zone_id === rep.zone_id) {
                score += 50;
            } else {
                return; // Don't assign if zones don't match
            }

            // 2. Specialty overlap (Simulated)
            // Skip specialty matching for non-doctor types unless they have special data
            if (doctor.contact_type === 'doctor' && rep.therapeutic_area && doctor.specialty) {
                const therapeuticAreas = SPECIALTY_THERAPEUTIC_MAP[doctor.specialty] || [];
                if (therapeuticAreas.some(ta => rep.therapeutic_area.toLowerCase().includes(ta.toLowerCase()))) {
                    score += 40;
                }
            } else if (doctor.contact_type !== 'doctor') {
                // For POS, we might have other scoring factors later, but for now just zone is enough (+99 for zone match)
                score += 40; // High score just for being in the same zone
            }

            // 3. Workload balance (Simulated)
            // Assuming we track how many assignments each rep has
            const currentAssignments = assignments.filter(a => a.representativeId === rep.id).length;
            score -= (currentAssignments * 5);

            if (score > bestMatch.score) {
                bestMatch = { id: rep.id, score };
            }
        });

        if (bestMatch.id) {
            assignments.push({
                doctorId: doctor.id,
                representativeId: bestMatch.id,
                matchScore: bestMatch.score
            });
        }
    });

    return assignments;
}
