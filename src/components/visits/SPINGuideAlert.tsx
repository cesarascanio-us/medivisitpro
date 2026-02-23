/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { X, Lightbulb } from "lucide-react";

interface SPINGuide {
    id: string;
    question_text: string;
    question_type: string;
}

interface SPINGuideAlertProps {
    productId?: string;
    entityType: 'doctor' | 'farmacia';
}

export function SPINGuideAlert({ productId, entityType }: SPINGuideAlertProps) {
    const [guides, setGuides] = useState<SPINGuide[]>([]);
    const [dismissed, setDismissed] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (productId || entityType) {
            loadGuides();
        }
    }, [productId, entityType]);

    const loadGuides = async () => {
        setLoading(true);
        try {
            // Cast to any because sales_guides table is not in generated types yet
            const supabaseAny = supabase as any;

            let query = supabaseAny
                .from('sales_guides')
                .select('*')
                .eq('is_active', true)
                .in('entity_target', [entityType, 'both'])
                .order('display_order');

            if (productId) {
                query = query.or(`product_id.eq.${productId},product_id.is.null`);
            } else {
                query = query.is('product_id', null);
            }

            const { data, error } = await query;
            if (error) throw error;

            setGuides(data || []);
            setDismissed(false);
        } catch (error) {
            console.error("Error loading SPIN guides:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading || dismissed || guides.length === 0) return null;

    const getQuestionTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            situation: "Situación",
            problem: "Problema",
            implication: "Implicación",
            need_payoff: "Necesidad-Beneficio"
        };
        return labels[type] || type;
    };

    return (
        <Alert className="bg-blue-50 border-blue-200 relative">
            <button
                onClick={() => setDismissed(true)}
                className="absolute top-2 right-2 text-blue-400 hover:text-blue-600"
            >
                <X className="h-4 w-4" />
            </button>
            <div className="flex gap-3">
                <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                    <h4 className="font-semibold text-blue-900 mb-2">
                        💡 Guía de Preguntas SPIN
                    </h4>
                    <AlertDescription className="text-blue-800 space-y-2">
                        {guides.map((guide, index) => (
                            <div key={guide.id} className="text-sm">
                                <span className="font-medium text-blue-700">
                                    {getQuestionTypeLabel(guide.question_type)}:
                                </span>{" "}
                                {guide.question_text}
                            </div>
                        ))}
                    </AlertDescription>
                </div>
            </div>
        </Alert>
    );
}
