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
import { X, Lightbulb, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

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

    const getTypeColor = (type: string) => {
        const colors: Record<string, string> = {
            situation: "text-blue-400",
            problem: "text-amber-400",
            implication: "text-rose-400",
            need_payoff: "text-emerald-400"
        };
        return colors[type] || "text-primary";
    };

    return (
        <Alert className="bg-primary/5 border-primary/20 relative text-foreground rounded-[2rem] p-8 shadow-inner overflow-hidden font-display">
            <div className="absolute top-0 right-0 p-8 opacity-5">
                <Sparkles className="w-24 h-24 text-primary" />
            </div>
            
            <button
                onClick={() => setDismissed(true)}
                className="absolute top-4 right-4 text-muted-foreground/40 hover:text-foreground transition-colors"
            >
                <X className="h-5 w-5" />
            </button>
            
            <div className="flex gap-6 relative z-10">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner border border-primary/20 shrink-0">
                    <Lightbulb className="h-6 w-6" />
                </div>
                
                <div className="flex-1">
                    <h4 className="text-sm font-black uppercase tracking-[0.3em] text-foreground mb-6 flex items-center gap-2">
                        Guía de Inteligencia SPIN CA
                    </h4>
                    
                    <AlertDescription className="space-y-4">
                        {guides.map((guide) => (
                            <div key={guide.id} className="group p-4 bg-muted/5 rounded-xl border border-border/40 hover:border-primary/20 transition-all">
                                <span className={cn("text-elite-xs font-black uppercase tracking-widest block mb-2", getTypeColor(guide.question_type))}>
                                    {getQuestionTypeLabel(guide.question_type)}
                                </span>
                                <p className="text-xs font-bold text-foreground/80 leading-relaxed uppercase">
                                    {guide.question_text}
                                </p>
                            </div>
                        ))}
                    </AlertDescription>
                </div>
            </div>
        </Alert>
    );
}
