/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, CheckCircle, MessageSquare, Shield, Star, Target } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

interface SupervisorEvaluationModalProps {
    isOpen: boolean;
    onClose: () => void;
    visitId: string;
    representativeId: string;
    representativeName: string;
}

export const SupervisorEvaluationModal = ({
    isOpen,
    onClose,
    visitId,
    representativeId,
    representativeName
}: SupervisorEvaluationModalProps) => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    // Initial State for form
    const [formData, setFormData] = useState({
        score_vademecum: 0,
        score_objection_handling: 0,
        score_closing_skills: 0,
        score_pre_call_planning: 0,
        score_sample_strategy: false,
        strengths: '',
        areas_for_improvement: '',
        action_plan: ''
    });

    if (!isOpen) return null;

    const handleStarClick = (field: string, value: number) => {
         
        setFormData((prev: any) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        if (!user) return;

        // Basic validation
        if (formData.score_vademecum === 0 || formData.score_closing_skills === 0) {
            toast({
                title: "Evaluación Incompleta",
                description: "Por favor califique al menos el Dominio del Vademécum y Cierre.",
                variant: "destructive"
            });
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase
                .from('field_evaluations')
                .insert({
                    visit_id: visitId,
                    supervisor_id: user.id,
                    representative_id: representativeId,
                    score_vademecum: formData.score_vademecum,
                    score_objection_handling: formData.score_objection_handling,
                    score_closing_skills: formData.score_closing_skills,
                    score_pre_call_planning: formData.score_pre_call_planning,
                    score_sample_strategy: formData.score_sample_strategy,
                    strengths: formData.strengths,
                    areas_for_improvement: formData.areas_for_improvement,
                    action_plan: formData.action_plan
                });

            if (error) throw error;

            toast({
                title: "Evaluación Registrada",
                description: `Feedback guardado exitosamente para ${representativeName}.`,
            });
            onClose();

        } catch (error: any) {
            console.error("Error submitting evaluation:", error);
            toast({
                title: "Error al guardar",
                description: error.message || "No se pudo registrar la evaluación.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    // Helper to render star rating
    const renderStars = (field: string, currentVal: number) => (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    onClick={() => handleStarClick(field, star)}
                    className={`p-1 transition-all hover:scale-110 focus:outline-none ${star <= currentVal ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'
                        }`}
                >
                    <Star className={`w-6 h-6 ${star <= currentVal ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                </button>
            ))}
        </div>
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border-primary/20 bg-background">
                <CardHeader className="bg-primary/5 border-b border-primary/10">
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <Shield className="w-6 h-6 text-primary" />
                                Evaluación de Visita Dual
                            </CardTitle>
                            <CardDescription>
                                Evaluando a: <span className="font-semibold text-foreground">{representativeName}</span>
                            </CardDescription>
                        </div>
                        <Button variant="ghost" onClick={onClose} size="sm">
                            Cancelar
                        </Button>
                    </div>
                </CardHeader>

                <CardContent className="space-y-6 pt-6">

                    {/* Section 1: Technical Skills */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <Target className="w-4 h-4 text-muted-foreground" /> Dominio del Vademécum
                            </Label>
                            {renderStars('score_vademecum', formData.score_vademecum)}
                            <p className="text-xs text-muted-foreground">Conocimiento técnico de productos (Ej. Calcio, Hierro)</p>
                        </div>

                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-muted-foreground" /> Manejo de Objeciones
                            </Label>
                            {renderStars('score_objection_handling', formData.score_objection_handling)}
                            <p className="text-xs text-muted-foreground">Capacidad para rebatir argumentos del médico</p>
                        </div>

                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-muted-foreground" /> Cierre de Venta
                            </Label>
                            {renderStars('score_closing_skills', formData.score_closing_skills)}
                            <p className="text-xs text-muted-foreground">Logró un compromiso claro de prescripción</p>
                        </div>

                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <Target className="w-4 h-4 text-muted-foreground" /> Planning Pre-Visita
                            </Label>
                            {renderStars('score_pre_call_planning', formData.score_pre_call_planning)}
                            <p className="text-xs text-muted-foreground">¿Tenía un objetivo claro antes de entrar?</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2 border p-3 rounded-lg bg-accent/5">
                        <input
                            type="checkbox"
                            checked={formData.score_sample_strategy}
                            onChange={(e) => setFormData(prev => ({ ...prev, score_sample_strategy: e.target.checked }))}
                            id="sample_strategy"
                            className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                        />
                        <Label htmlFor="sample_strategy" className="cursor-pointer font-medium">
                            ¿Usó las muestras médicas estratégicamente? (Inicio de tratamiento)
                        </Label>
                    </div>

                    {/* Section 2: Qualitative Feedback */}
                    <div className="space-y-4 border-t pt-4">
                        <h3 className="font-semibold flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-accent" /> Feedback Cualitativo
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Fortalezas Observadas</Label>
                                <Textarea
                                    placeholder="¿Qué hizo bien el representante?"
                                    value={formData.strengths}
                                    onChange={(e) => setFormData(prev => ({ ...prev, strengths: e.target.value }))}
                                    className="resize-none h-24"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Áreas de Mejora</Label>
                                <Textarea
                                    placeholder="¿Qué debe corregir para la próxima?"
                                    value={formData.areas_for_improvement}
                                    onChange={(e) => setFormData(prev => ({ ...prev, areas_for_improvement: e.target.value }))}
                                    className="resize-none h-24"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-primary font-semibold">Plan de Acción (Acuerdos)</Label>
                            <Textarea
                                placeholder="Acciones concretas a realizar antes de la próxima supervisión..."
                                value={formData.action_plan}
                                onChange={(e) => setFormData(prev => ({ ...prev, action_plan: e.target.value }))}
                                className="h-20 border-primary/30"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button variant="outline" onClick={onClose} disabled={loading}>
                            Cancelar
                        </Button>
                        <Button onClick={handleSubmit} disabled={loading} className="bg-gradient-primary">
                            {loading ? "Guardando..." : "Guardar Evaluación"}
                        </Button>
                    </div>

                </CardContent>
            </Card>
        </div>
    );
};
