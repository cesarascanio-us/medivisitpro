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
import { useToast } from '@/hooks/use-toast';
import { trackEvent } from '@/lib/analytics';
import { 
    Loader2, 
    User, 
    Mail, 
    Building2, 
    Send, 
    ShieldCheck,
    Clock,
    SendHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DemoRegistrationFormProps {
    onSuccess?: (code?: string) => void;
}

export function DemoRegistrationForm({ onSuccess }: DemoRegistrationFormProps) {
    const { toast } = useToast();
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        company: '',
        telegram: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        trackEvent('demo_registration_init');

        try {
            // N8N Webhook Integration for 72h Trials
            const WEBHOOK_URL = 'https://n8n-catools.onrender.com/webhook/contact-form';

            const response = await fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    type: 'demo_request',
                    source: 'medivisitpro_internal',
                    timestamp: new Date().toISOString()
                })
            });

            if (!response.ok) throw new Error('Error en la orquestación');

            trackEvent('demo_registration_success');
            
            toast({
                title: "Solicitud Enviada",
                description: "Tu acceso de 72 horas está siendo procesado. Revisa tu email o Telegram.",
            });

            if (onSuccess) onSuccess();
        } catch (error) {
            console.error('Error in demo registration:', error);
            trackEvent('demo_registration_error');
            toast({
                variant: "destructive",
                title: "Error de Conexión",
                description: "No pudimos conectar con el servidor de licencias. Intenta de nuevo.",
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="w-full max-w-lg mx-auto bg-card/50 backdrop-blur-xl rounded-[2.5rem] border border-white/20 p-8 md:p-12 shadow-2xl relative overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl -translate-y-1/2 translate-x-1/2 rounded-full" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/10 blur-3xl translate-y-1/2 -translate-x-1/2 rounded-full" />

            <div className="relative space-y-8">
                {/* Header */}
                <div className="space-y-3 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-[10px] font-black uppercase tracking-widest mx-auto">
                        <Clock className="w-3 h-3" />
                        72 Horas Acceso Elite
                    </div>
                    <h2 className="text-3xl font-black text-foreground tracking-tighter">
                        PROBAR <span className="text-primary">MEDIVISIT PRO</span>
                    </h2>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-xs mx-auto">
                        Ingresa tus credenciales para iniciar tu período de prueba quirúrgica.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Nombre */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Nombre Completo</label>
                        <div className="relative group">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                            <Input
                                required
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Tu nombre"
                                className="h-14 pl-12 rounded-2xl bg-slate-50 border-slate-200 focus:bg-white transition-all font-semibold"
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Email Corporativo</label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                            <Input
                                required
                                type="email"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                placeholder="email@empresa.com"
                                className="h-14 pl-12 rounded-2xl bg-slate-50 border-slate-200 focus:bg-white transition-all font-semibold"
                            />
                        </div>
                    </div>

                    {/* Empresa */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Empresa / Organización</label>
                        <div className="relative group">
                            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                            <Input
                                required
                                value={formData.company}
                                onChange={e => setFormData({ ...formData, company: e.target.value })}
                                placeholder="Nombre de tu empresa"
                                className="h-14 pl-12 rounded-2xl bg-slate-50 border-slate-200 focus:bg-white transition-all font-semibold"
                            />
                        </div>
                    </div>

                    {/* Telegram */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Telegram (@usuario)</label>
                        <div className="relative group">
                            <Send className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                            <Input
                                required
                                value={formData.telegram}
                                onChange={e => setFormData({ ...formData, telegram: e.target.value })}
                                placeholder="@tuusuario"
                                className="h-14 pl-12 rounded-2xl bg-slate-50 border-slate-200 focus:bg-white transition-all font-semibold"
                            />
                        </div>
                    </div>

                    <Button
                        disabled={submitting}
                        className="w-full h-16 bg-foreground hover:bg-slate-800 text-white rounded-2xl shadow-xl transition-all font-black text-sm uppercase tracking-[0.2em] group mt-4"
                    >
                        {submitting ? (
                            <div className="flex items-center gap-3">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Validando...
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                Activar 72 Horas
                                <SendHorizontal className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </div>
                        )}
                    </Button>

                    <p className="text-[9px] text-slate-400 text-center font-bold uppercase tracking-widest pt-2">
                        Al iniciar, un consultor validará tu perfil para liberar el acceso.
                    </p>
                </form>
            </div>
        </div>
    );
}
