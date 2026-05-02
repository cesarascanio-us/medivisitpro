/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import React, { useState, useEffect } from "react";
import { m, AnimatePresence } from "framer-motion";
import {
    X, ChevronRight, ChevronLeft, Map, Stethoscope,
    ShieldAlert, TrendingUp, Sparkles, CheckCircle2,
    Target, ShoppingCart, Award, GraduationCap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const STEPS = [
    {
        title: "Fase 1: Inteligencia y Planificación",
        subtitle: "El Pre-Vuelo: Conquista el territorio en el mapa",
        icon: <Map className="h-10 w-10 text-blue-500" />,
        description: "Antes de salir, identifica a tus médicos Triple A (A) y visualiza las 'Zonas Calientes' en el Heatmap. El 20% de tus médicos genera el 80% de tus recetas.",
        color: "blue",
        features: ["Segmentación Oro/Plata", "Heatmap de Cobertura", "Análisis de Proximidad PDV"]
    },
    {
        title: "Fase 2: Generación de Demanda",
        subtitle: "La Espada: Crea la necesidad clínica",
        icon: <Stethoscope className="h-10 w-10 text-emerald-500" />,
        description: "Usa el Argumento Clínico y el Motor de Dosificación. Recuerda: La muestra médica es una semilla; el Compromiso de Recetas es el agua.",
        color: "emerald",
        features: ["Motor de Dosificación", "Selling Points dinámicos", "Registro de Compromisos"]
    },
    {
        title: "Fase 3: Blindaje y Aseguramiento",
        subtitle: "El Escudo: Evita la sustitución en Farmacia",
        icon: <ShieldAlert className="h-10 w-10 text-amber-500" />,
        description: "Verifica el Stock de Seguridad y capacita al personal de mostrador. Asegura que el material POP refuerce tu marca en el punto de venta.",
        color: "amber",
        features: ["Auditoría de Inventario", "Checklist POP Dinámico", "Capacitación de Dependientes"]
    },
    {
        title: "Fase 4: Estrategia 360° y Control",
        subtitle: "Cierre de Circuito: Asegura tu cuota",
        icon: <TrendingUp className="h-10 w-10 text-purple-500" />,
        description: "Analiza la 'Fuga de Ventas' para corregir el despliegue. Si hay recetas pero no hay stock, usa el Pedido por Transferencia inmediato.",
        color: "purple",
        features: ["Análisis de Fuga de Ventas", "Pedidos por Transferencia", "Reporte Competitivo"]
    }
];

export function StrategicOnboarding360() {
    const { user, profile } = useAuth();
    const [currentStep, setCurrentStep] = useState(0);
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (profile && profile.has_completed_onboarding === false) {
            setShow(true);
        }
    }, [profile]);

    const handleFinish = async () => {
        if (user?.id) {
            await supabase
                .from("profiles")
                .update({ has_completed_onboarding: true })
                .eq("id", profile.id);
            setShow(false);
        }
    };

    if (!show) return null;

    const step = STEPS[currentStep];
    const progress = ((currentStep + 1) / STEPS.length) * 100;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
            <m.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="w-full max-w-2xl"
            >
                <Card className="border-2 border-primary/20 shadow-2xl overflow-hidden bg-card">
                    <div className={`h-2 bg-${step.color}-500/10`}>
                        <Progress value={progress} className="h-full rounded-none" />
                    </div>

                    <CardContent className="p-8">
                        <div className="flex justify-between items-start mb-6">
                            <div className={`p-4 bg-${step.color}-50 rounded-2xl`}>
                                {step.icon}
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setShow(false)}>
                                <X className="h-5 w-5" />
                            </Button>
                        </div>

                        <AnimatePresence mode="wait">
                            <m.div
                                key={currentStep}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-4"
                            >
                                <div>
                                    <h2 className="text-3xl font-bold tracking-tight">{step.title}</h2>
                                    <p className={`text-${step.color}-600 font-semibold mt-1`}>{step.subtitle}</p>
                                </div>

                                <p className="text-lg text-muted-foreground leading-relaxed">
                                    {step.description}
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6">
                                    {step.features.map((f, i) => (
                                        <div key={i} className="flex items-center gap-2 text-sm font-medium p-3 rounded-lg bg-secondary/50 border border-border">
                                            <CheckCircle2 className={`h-4 w-4 text-${step.color}-500`} />
                                            {f}
                                        </div>
                                    ))}
                                </div>
                            </m.div>
                        </AnimatePresence>

                        <div className="flex items-center justify-between mt-10">
                            <Button
                                variant="outline"
                                onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
                                disabled={currentStep === 0}
                            >
                                <ChevronLeft className="mr-2 h-4 w-4" /> Anterior
                            </Button>

                            <div className="flex gap-2">
                                {STEPS.map((_, i) => (
                                    <div
                                        key={i}
                                        className={`h-1.5 w-6 rounded-full transition-colors ${i === currentStep ? `bg-${step.color}-500` : "bg-muted"
                                            }`}
                                    />
                                ))}
                            </div>

                            {currentStep < STEPS.length - 1 ? (
                                <Button onClick={() => setCurrentStep(prev => prev + 1)}>
                                    Siguiente <ChevronRight className="ml-2 h-4 w-4" />
                                </Button>
                            ) : (
                                <Button className="bg-primary hover:bg-primary/90 text-white" onClick={handleFinish}>
                                    ¡Empezar mi día 360! <Sparkles className="ml-2 h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </m.div>
        </div>
    );
}
