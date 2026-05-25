import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Lightbulb, CheckCircle2, Award, Info, FileQuestion } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import faqDataRaw from "@/data/faq_detailed.json";

interface FAQItem {
  Id_QyA: number;
  "Nombre del Producto": string;
  "Tipo de Pregunta": string;
  "Pregunta del Médico": string;
  "Lógica del Médico": string;
  "Respuesta Técnica del Visitador Médico": string;
}

const faqData = faqDataRaw as FAQItem[];

export function StaffTrainer({ productName }: { productName?: string }) {
    const { toast } = useToast();

    const productFaqs = useMemo(() => {
        if (!productName) return [];
        const nameLower = productName.toLowerCase();
        return faqData.filter(faq => {
            const faqName = faq["Nombre del Producto"].trim().toLowerCase();
            return faqName.includes(nameLower) || nameLower.includes(faqName);
        });
    }, [productName]);

    const handleRegisterTraining = () => {
        toast({
            title: "Capacitación Registrada",
            description: `Se ha marcado al personal como capacitado en ${productName || "este producto"}.`,
        });
    };

    // If no FAQs for this product, show empty state or fallback
    if (productFaqs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center bg-card rounded-2xl border border-dashed border-border/60">
                <FileQuestion className="h-12 w-12 text-muted-foreground/30 mb-4" />
                <h3 className="font-display font-black text-lg">SIN ARGUMENTARIO DISPONIBLE</h3>
                <p className="text-muted-foreground text-sm max-w-sm mt-2">
                    Actualmente no hay preguntas frecuentes cargadas para este producto en la base de conocimientos.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
                <Card className="bg-amber-50/50 border-amber-200 shadow-none">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-amber-800 font-display uppercase tracking-tight">
                            <Lightbulb className="h-5 w-5 text-amber-600" /> Argumentario Dinámico
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Accordion type="single" collapsible className="w-full">
                            {productFaqs.map((faq, idx) => (
                                <AccordionItem key={faq.Id_QyA || idx} value={`faq-${idx}`} className="border-amber-200">
                                    <AccordionTrigger className="hover:text-amber-700 text-left font-medium text-sm">
                                        {faq["Pregunta del Médico"]}
                                    </AccordionTrigger>
                                    <AccordionContent className="bg-white/50 p-4 rounded-xl border border-amber-100/50 space-y-3">
                                        {faq["Lógica del Médico"] && (
                                            <div className="flex items-start gap-2 text-xs text-amber-800/80 bg-amber-100/50 p-2 rounded-lg">
                                                <Info className="h-4 w-4 shrink-0 mt-0.5" />
                                                <div>
                                                    <strong className="block uppercase tracking-widest text-[9px] mb-0.5">Por qué lo pregunta:</strong>
                                                    <span>{faq["Lógica del Médico"]}</span>
                                                </div>
                                            </div>
                                        )}
                                        <div className="text-sm text-slate-700 pl-3 border-l-2 border-amber-300">
                                            {faq["Respuesta Técnica del Visitador Médico"]}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-6">
                <Card className="bg-gradient-to-br from-indigo-50 to-white border-indigo-100 shadow-none">
                    <CardContent className="pt-6 text-center space-y-4">
                        <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
                            <Award className="h-8 w-8 text-indigo-600" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-indigo-900">Registro de Capacitación</h3>
                            <p className="text-sm text-indigo-600/80 leading-tight mt-1">
                                Confirma que has revisado este argumentario clínico.
                            </p>
                        </div>
                        <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md shadow-indigo-200 font-bold uppercase tracking-widest text-[10px]" onClick={handleRegisterTraining}>
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Entrenamiento Completado
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
