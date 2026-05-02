/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
 ======================================================================== */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { trackEvent } from '@/lib/analytics';
import { Send, User, Mail, Building2, MessageSquare, Loader2, CheckCircle2, Stethoscope } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ContactSection() {
    const { toast } = useToast();
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        company: '',
        message: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        trackEvent('submit_contact_form_init');

        try {
            // N8N Webhook Integration (placeholder for the real URL)
            const WEBHOOK_URL = 'https://n8n-catools.onrender.com/webhook/contact-form';

            const response = await fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    source: 'landing_page',
                    sentinel_audit: 'CA-PROD-SENTINEL-001',
                    timestamp: new Date().toISOString()
                })
            });

            if (!response.ok) throw new Error('Fallo en la orquestación');

            setSubmitted(true);
            trackEvent('submit_contact_form_success');
            toast({
                title: "Misión Cumplida",
                description: "Tu mensaje ha sido orquestado. Mission Control se pondrá en contacto pronto.",
            });
        } catch (error) {
            console.error('Error in n8n pipeline:', error);
            trackEvent('submit_contact_form_error');
            toast({
                variant: "destructive",
                title: "Error de Sincronización",
                description: "No pudimos conectar con el orquestador. Por favor, intenta de nuevo.",
            });
        } finally {
            setSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <section id="contacto" className="py-20 lg:py-32 px-4 sm:px-6 lg:px-8 bg-slate-950 relative overflow-hidden border-t border-white/5">
                <div className="max-w-3xl mx-auto text-center space-y-8 lg:space-y-10 animate-in zoom-in duration-700">
                    <div className="w-20 lg:w-24 h-20 lg:h-24 bg-blue-500/10 rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl shadow-blue-500/20 border border-blue-500/20">
                        <CheckCircle2 className="w-10 lg:w-12 h-10 lg:h-12 text-blue-400" />
                    </div>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight break-words">¡Conexión Exitosa!</h2>
                    <p className="text-lg lg:text-xl text-slate-400 font-medium leading-relaxed">
                        Su información ha sido capturada por el sistema Sentinel. <br />
                        Uno de nuestros directores técnicos revisará su caso en breve.
                    </p>
                    <Button
                        onClick={() => setSubmitted(false)}
                        variant="outline"
                        className="rounded-xl border-white/10 text-white hover:bg-white/5 font-bold text-sm h-12 px-8"
                    >
                        Enviar otro mensaje
                    </Button>
                </div>
            </section>
        );
    }

    return (
        <section id="contacto" className="py-20 lg:py-32 px-4 sm:px-6 lg:px-8 bg-slate-950 relative overflow-hidden text-white border-t border-white/5">
            {/* Design Ornaments */}
            <div className="absolute top-0 right-0 w-full max-w-[400px] h-full max-h-[400px] bg-blue-600/5 blur-[120px] rounded-full -z-10 translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-full max-w-[400px] h-full max-h-[400px] bg-blue-900/5 blur-[120px] rounded-full -z-10 -translate-x-1/2 translate-y-1/2 pointer-events-none"></div>

            <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
                {/* Text Side */}
                <div className="space-y-8 lg:space-y-10 text-center lg:text-left">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold tracking-wide">
                        Contacto Mission Control
                    </div>
                    <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.1] tracking-tight break-words">
                        ¿Listo para <span className="text-blue-500">orquestar</span> <br className="hidden sm:block" /> su éxito comercial?
                    </h2>
                    <p className="text-lg text-slate-400 font-medium leading-relaxed max-w-lg mx-auto lg:mx-0">
                        Únete a la élite de visitadores médicos en Latinoamérica. Déjanos tus datos y un especialista diseñará tu plan estratégico.
                    </p>

                    <div className="grid sm:grid-cols-2 gap-6 pt-6 text-left">
                        <div className="flex items-center gap-5 p-5 bg-white/5 rounded-2xl border border-white/5">
                            <div className="w-12 h-12 rounded-xl bg-blue-600/10 flex items-center justify-center">
                                <Mail className="w-6 h-6 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Escríbenos</p>
                                <p className="text-sm font-bold text-white">elite@medivisitpro.com</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-5 p-5 bg-white/5 rounded-2xl border border-white/5">
                            <div className="w-12 h-12 rounded-xl bg-blue-600/10 flex items-center justify-center">
                                <Stethoscope className="w-6 h-6 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Soporte</p>
                                <p className="text-sm font-bold text-white">Atención 24/7 Global</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form Side */}
                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-blue-400 rounded-[2.5rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                    <form
                        onSubmit={handleSubmit}
                        className="relative bg-slate-900/90 backdrop-blur-3xl p-8 lg:p-10 rounded-[2.2rem] border border-white/10 shadow-2xl space-y-6"
                    >
                        <div className="grid sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-slate-300 ml-1">Nombre Maestro</Label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <Input
                                        required
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Tu nombre completo"
                                        className="h-12 pl-12 bg-white/5 border-white/10 text-white rounded-xl focus:ring-blue-600 font-medium"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-slate-300 ml-1">Email Corporativo</Label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <Input
                                        required
                                        type="email"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="ejemplo@pharma.com"
                                        className="h-12 pl-12 bg-white/5 border-white/10 text-white rounded-xl focus:ring-blue-600 font-medium"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-300 ml-1">Organización / Empresa</Label>
                            <div className="relative">
                                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <Input
                                    required
                                    value={formData.company}
                                    onChange={e => setFormData({ ...formData, company: e.target.value })}
                                    placeholder="Nombre de tu laboratorio o clínica"
                                    className="h-12 pl-12 bg-white/5 border-white/10 text-white rounded-xl focus:ring-blue-600 font-medium"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-300 ml-1">Mensaje de Orquestación</Label>
                            <div className="relative">
                                <MessageSquare className="absolute left-4 top-4 w-4 h-4 text-slate-500" />
                                <Textarea
                                    required
                                    value={formData.message}
                                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                                    placeholder="¿Cómo podemos potenciar su gestión?"
                                    className="min-h-[140px] pl-12 pt-4 bg-white/5 border-white/10 text-white rounded-xl focus:ring-blue-600 resize-none font-medium leading-relaxed"
                                />
                            </div>
                        </div>

                        <Button
                            disabled={submitting}
                            className="w-full h-14 bg-blue-600 hover:bg-blue-500 text-white transition-all font-bold text-base rounded-xl shadow-2xl shadow-blue-500/20 active:scale-95"
                        >
                            {submitting ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Sincronizando...
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    Enviar solicitud al sistema
                                    <Send className="w-4 h-4" />
                                </div>
                            )}
                        </Button>

                        <p className="text-[10px] text-center text-slate-500 font-medium">
                            Sus datos están protegidos por encriptación de grado militar y cumplimiento ISO 27001.
                        </p>
                    </form>
                </div>
            </div>
        </section>
    );
}
