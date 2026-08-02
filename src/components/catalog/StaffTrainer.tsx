import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Lightbulb, CheckCircle2, Award, Info, FileQuestion } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

import faqDataRaw from "@/data/faq_detailed.json";
import { getProductImageUrl } from "@/utils/productImages";

interface FAQItem {
  Id_QyA: number;
  "Nombre del Producto": string;
  "Tipo de Pregunta": string;
  "Pregunta del Médico": string;
  "Lógica del Médico": string;
  "Respuesta Técnica del Visitador Médico": string;
}

const faqData = faqDataRaw as FAQItem[];

function normalizeStr(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export function StaffTrainer({ productName }: { productName?: string }) {
    const { toast } = useToast();

    const productImage = useMemo(() => getProductImageUrl(productName), [productName]);

    const productFaqs = useMemo(() => {
        if (!productName) return [];
        const normTarget = normalizeStr(productName);
        return faqData.filter(faq => {
            const normFaq = normalizeStr(faq["Nombre del Producto"]);
            return normFaq.includes(normTarget) || normTarget.includes(normFaq);
        });
    }, [productName]);

    const handleRegisterTraining = () => {
        toast({
            title: "Capacitación Registrada",
            description: `Se ha marcado al personal como capacitado en ${productName || "este producto"}.`,
        });
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };

    // If no FAQs for this product, show empty state or fallback
    if (productFaqs.length === 0) {
        return (
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center p-12 text-center bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl"
            >
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10 shadow-inner">
                    <FileQuestion className="h-10 w-10 text-slate-400 opacity-50" />
                </div>
                <h3 className="font-extrabold text-2xl tracking-tight text-slate-200">SIN ARGUMENTARIO DISPONIBLE</h3>
                <p className="text-slate-400 mt-3 max-w-md leading-relaxed">
                    Actualmente no hay preguntas frecuentes cargadas para este producto en la base de conocimientos médica.
                </p>
            </motion.div>
        );
    }

    return (
        <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
            <motion.div variants={itemVariants} className="md:col-span-2 space-y-6">
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl rounded-3xl overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
                    
                    <div className="p-6 border-b border-white/5 relative z-10 flex items-center justify-between">
                        <h3 className="flex items-center gap-3 text-amber-400 font-extrabold uppercase tracking-widest text-lg">
                            <div className="p-2 bg-amber-500/20 rounded-xl shadow-inner border border-amber-500/20">
                                <Lightbulb className="h-5 w-5" />
                            </div>
                            Argumentario Dinámico
                        </h3>
                        {productImage && (
                            <div className="h-12 w-12 rounded-xl bg-white/10 p-1 flex items-center justify-center border border-white/10">
                                <img src={productImage} alt={productName} className="h-full w-full object-contain" />
                            </div>
                        )}
                    </div>
                    <div className="p-6 relative z-10">
                        <Accordion type="single" collapsible className="w-full space-y-4">
                            {productFaqs.map((faq, idx) => (
                                <AccordionItem key={faq.Id_QyA || idx} value={`faq-${idx}`} className="border border-white/10 rounded-2xl bg-white/5 px-4 shadow-sm overflow-hidden data-[state=open]:bg-white/10 transition-colors">
                                    <AccordionTrigger className="hover:no-underline hover:text-amber-300 text-left font-semibold text-slate-200 py-4">
                                        {faq["Pregunta del Médico"]}
                                    </AccordionTrigger>
                                    <AccordionContent className="pb-4 pt-1 space-y-4">
                                        {faq["Lógica del Médico"] && (
                                            <div className="flex items-start gap-3 text-sm text-amber-200/90 bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl shadow-inner">
                                                <Info className="h-5 w-5 shrink-0 mt-0.5 text-amber-400" />
                                                <div>
                                                    <strong className="block uppercase tracking-widest text-[10px] mb-1 text-amber-500 font-bold">Por qué lo pregunta:</strong>
                                                    <span className="leading-relaxed">{faq["Lógica del Médico"]}</span>
                                                </div>
                                            </div>
                                        )}
                                        <div className="text-sm text-slate-300 pl-4 border-l-2 border-emerald-500/50 leading-relaxed bg-white/5 p-4 rounded-r-xl">
                                            {faq["Respuesta Técnica del Visitador Médico"]}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </div>
                </div>
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-6">
                <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900/80 backdrop-blur-xl border border-indigo-500/20 shadow-2xl rounded-3xl overflow-hidden relative group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-bl-full -mr-16 -mt-16 z-0 group-hover:scale-110 transition-transform duration-700"></div>
                    
                    <div className="p-8 text-center space-y-6 relative z-10">
                        <div className="mx-auto w-20 h-20 bg-indigo-500/20 rounded-2xl flex items-center justify-center border border-indigo-500/30 shadow-inner shadow-indigo-500/20">
                            <Award className="h-10 w-10 text-indigo-400" />
                        </div>
                        <div>
                            <h3 className="font-extrabold text-xl text-white drop-shadow-md">Registro de Capacitación</h3>
                            <p className="text-sm text-indigo-200 mt-3 leading-relaxed">
                                Confirma que has revisado y dominas este argumentario clínico para el terreno.
                            </p>
                        </div>
                        <Button 
                            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-500/25 font-bold uppercase tracking-widest text-xs h-12 transition-all hover:scale-[1.02]" 
                            onClick={handleRegisterTraining}
                        >
                            <CheckCircle2 className="mr-2 h-5 w-5" />
                            Entrenamiento Completado
                        </Button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
