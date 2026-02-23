/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Lightbulb, CheckCircle2, Award } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function StaffTrainer() {
    const { toast } = useToast();

    const handleRegisterTraining = () => {
        toast({
            title: "Capacitación Registrada",
            description: "Se ha marcado al personal como capacitado en este producto.",
        });
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
                <Card className="bg-amber-50/50 border-amber-200">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-amber-800">
                            <Lightbulb className="h-5 w-5 text-amber-600" /> Tips de Mostrador
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="item-1" className="border-amber-200">
                                <AccordionTrigger className="hover:text-amber-700">¿Para quién es ideal?</AccordionTrigger>
                                <AccordionContent className="text-slate-600 bg-white/50 p-2 rounded">
                                    Pacientes adultos con síntomas moderados que buscan alivio rápido sin somnolencia.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-2" className="border-amber-200">
                                <AccordionTrigger className="hover:text-amber-700">Diferenciador Clave</AccordionTrigger>
                                <AccordionContent className="text-slate-600 bg-white/50 p-2 rounded">
                                    A diferencia de la competencia, nuestro producto actúa en 15 minutos y dura 12 horas.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-3" className="border-amber-200">
                                <AccordionTrigger className="hover:text-amber-700">Venta Cruzada</AccordionTrigger>
                                <AccordionContent className="text-slate-600 bg-white/50 p-2 rounded">
                                    Recomendar junto con vitamina C o hidratación oral para recuperación completa.
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Argumentario Rápido</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-3">
                            <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs shrink-0">1</div>
                            <p className="text-sm">Escuche al paciente describir sus síntomas.</p>
                        </div>
                        <div className="flex gap-3">
                            <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs shrink-0">2</div>
                            <p className="text-sm">Si menciona dolor agudo, ofrezca la versión Forte.</p>
                        </div>
                        <div className="flex gap-3">
                            <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs shrink-0">3</div>
                            <p className="text-sm">Recuerde mencionar la promoción de "lleve 3 pague 2" vigente.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-6">
                <Card className="bg-gradient-to-br from-indigo-50 to-white border-indigo-100">
                    <CardContent className="pt-6 text-center space-y-4">
                        <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
                            <Award className="h-8 w-8 text-indigo-600" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-indigo-900">Registro de Capacitación</h3>
                            <p className="text-sm text-indigo-600/80">Marcar visita como entrenamiento al personal</p>
                        </div>
                        <Button className="w-full bg-indigo-600 hover:bg-indigo-700" onClick={handleRegisterTraining}>
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Confirmar Entrenamiento
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
