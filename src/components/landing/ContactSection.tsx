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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { trackEvent } from '@/lib/analytics';
import { Send, User, Mail, Building2, MessageSquare, Loader2, CheckCircle2 } from 'lucide-react';
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
            <section id="contacto" className="py-24 px-4 bg-white relative overflow-hidden">
                <div className="max-w-3xl mx-auto text-center space-y-8 animate-in zoom-in duration-700">
                    <div className="w-24 h-24 bg-emerald-500/10 rounded-3xl flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20">
                        <CheckCircle2 className="w-12 h-12 text-emerald-600" />
                    </div>
                    <h2 className="text-4xl font-bold text-slate-900 tracking-tighter">¡Conexión Exitosa!</h2>
                    <p className="text-xl text-slate-500 font-medium leading-relaxed">
                        Tu información ha sido capturada por el sistema **Sentinel**. <br />
                        Uno de nuestros directores técnicos revisará tu caso en breve.
                    </p>
                    <Button
                        onClick={() => setSubmitted(false)}
                        variant="outline"
                        className="rounded-xl border-slate-200"
                    >
                        Enviar otro mensaje
                    </Button>
                </div>
            </section>
        );
    }

    return (
        <section id="contacto" className="py-24 px-4 bg-slate-50 relative overflow-hidden">
            {/* Design Ornaments */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[120px] rounded-full -z-10 translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/5 blur-[120px] rounded-full -z-10 -translate-x-1/2 translate-y-1/2"></div>

            <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
                {/* Text Side */}
                <div className="space-y-8">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary-dark text-[10px] font-black uppercase tracking-widest">
                        Contacto Mission Control
                    </div>
                    <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 leading-[1.1] tracking-tighter">
                        ¿Listo para <span className="text-primary">Orquestar</span> tu Crecimiento?
                    </h2>
                    <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-lg">
                        Únete a la élite de visitadores médicos en Latinoamérica. Déjanos tus datos y un especialista diseñará tu plan estratégico.
                    </p>

                    <div className="space-y-6 pt-4">
                        {[
                            { icon: Mail, label: 'Soporte Directo', text: 'missioncontrol@medivisitpro.com' },
                            { icon: Building2, label: 'Centro de Operaciones', text: 'Caracas, Venezuela / Global Remote' }
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-4 group">
                                <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center group-hover:bg-primary transition-all duration-300">
                                    <item.icon className="w-5 h-5 text-primary group-hover:text-white" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
                                    <p className="font-bold text-slate-900">{item.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Form Side */}
                <div className="relative">
                    <div className="absolute inset-0 bg-white/40 backdrop-blur-3xl rounded-[2.5rem] -rotate-2 scale-105 -z-10 border border-white/60"></div>
                    <div className="bg-white rounded-[2.5rem] p-10 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] border border-slate-100 relative">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Nombre</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <Input
                                            required
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="Tu nombre completo"
                                            className="h-14 pl-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-all font-medium"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Correo Corporativo</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <Input
                                            required
                                            type="email"
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="ejemplo@pharma.com"
                                            className="h-14 pl-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-all font-medium"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Organización / Empresa</label>
                                <div className="relative">
                                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input
                                        required
                                        value={formData.company}
                                        onChange={e => setFormData({ ...formData, company: e.target.value })}
                                        placeholder="Nombre de tu laboratorio o empresa"
                                        className="h-14 pl-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-all font-medium"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Mensaje de Orquestación</label>
                                <div className="relative">
                                    <MessageSquare className="absolute left-4 top-4 w-4 h-4 text-slate-400" />
                                    <Textarea
                                        required
                                        value={formData.message}
                                        onChange={e => setFormData({ ...formData, message: e.target.value })}
                                        placeholder="¿Cómo podemos potenciar tu gestión médica?"
                                        className="min-h-[140px] pl-12 pt-4 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-all font-medium resize-none"
                                    />
                                </div>
                            </div>

                            <Button
                                disabled={submitting}
                                className="w-full h-16 bg-primary hover:bg-primary-dark text-white rounded-2xl shadow-xl shadow-primary/30 transition-all font-bold text-lg group"
                            >
                                {submitting ? (
                                    <div className="flex items-center gap-3">
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Iniciando Sincronización...
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3">
                                        Enviar Mensaje
                                        <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                    </div>
                                )}
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
}
