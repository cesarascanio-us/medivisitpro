/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
 ======================================================================== */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
    Loader2,
    Stethoscope,
    Mail,
    Lock,
    ShieldCheck,
    Shield,
    Rocket,
    CheckCircle2,
    MapPin,
    PieChart,
    Zap,
    ArrowRight
} from 'lucide-react';

export default function AuthPage() {
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('login');

    // Login form state
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

    // Signup form state
    const [signupEmail, setSignupEmail] = useState('');
    const [signupPassword, setSignupPassword] = useState('');
    const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
    const [signupFullName, setSignupFullName] = useState('');

    useEffect(() => {
        if (!authLoading && user) {
            navigate('/dashboard', { replace: true });
        }
    }, [user, authLoading, navigate]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email: loginEmail,
                password: loginPassword,
            });

            if (error) throw error;

            toast({ title: '¡Bienvenido!', description: 'Has iniciado sesión correctamente.' });
            navigate('/dashboard');
        } catch (error: any) {
            toast({
                title: 'Error de inicio de sesión',
                description: error.message || 'Credenciales inválidas.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (signupPassword !== signupConfirmPassword) {
            toast({ title: 'Error', description: 'Las contraseñas no coinciden.', variant: 'destructive' });
            return;
        }
        setLoading(true);
        try {
            const { error } = await supabase.auth.signUp({
                email: signupEmail,
                password: signupPassword,
                options: { data: { full_name: signupFullName } },
            });
            if (error) throw error;
            toast({ title: '¡Cuenta creada!', description: 'Revisa tu correo para confirmar tu cuenta.' });
        } catch (error: any) {
            toast({
                title: 'Error de registro',
                description: error.message || 'No se pudo crear la cuenta.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-card">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col lg:flex-row font-display overflow-hidden bg-slate-950">
            {/* Seccion Izquierda: Hero & Features - Elite Titanium Edition */}
            <div className="hidden lg:flex flex-[1.4] relative flex-col justify-center p-12 xl:p-20 overflow-hidden text-white border-r border-white/5">
                {/* Hero Background with High-End Medical Image */}
                <div 
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-[30s] hover:scale-110 opacity-40" 
                    style={{ backgroundImage: `url('/medical_tech_background_1777751917579.png')` }}
                />
                
                {/* Sophisticated Overlays */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900/80 to-primary/20" />
                <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-[2px]" />
                
                {/* Elite Effects */}
                <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay" />
                <div className="absolute top-20 right-20 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[180px] animate-pulse" />

                <div className="relative z-10 max-w-xl">
                    <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-10 backdrop-blur-3xl shadow-2xl transition-all hover:bg-white/10 group">
                        <Zap className="w-4 h-4 text-secondary fill-secondary group-hover:scale-125 transition-transform" />
                        <span className="text-[9px] font-black text-white uppercase tracking-[0.4em] leading-none">Nueva Era en Visita Médica</span>
                    </div>

                    <h1 className="text-3xl lg:text-5xl xl:text-6xl font-black text-white leading-[0.9] mb-6 tracking-tighter uppercase select-none">
                        Optimiza <br />
                        tu fuerza <br />
                        <span className="text-secondary drop-shadow-[0_10px_30px_rgba(255,183,1,0.3)]">Comercial</span> <br />
                        <span className="relative inline-block text-white">
                            Médica 
                            <div className="absolute bottom-2 left-0 w-full h-2 bg-secondary/20 -z-10 skew-x-[-12deg]" />
                        </span>
                    </h1>

                    <p className="text-sm lg:text-base text-white/60 mb-8 leading-relaxed font-medium max-w-md">
                        Gestiona visitas, muestras y análisis de mercado en una única plataforma diseñada para el éxito farmacéutico.
                    </p>

                    <div className="grid grid-cols-2 gap-4 lg:gap-6 mb-12">
                        {[
                            { icon: MapPin, text: 'Rutas Intelligentes' },
                            { icon: Stethoscope, text: 'Panel Médico' },
                            { icon: PieChart, text: 'Analytics Elite' },
                            { icon: CheckCircle2, text: 'Muestras Control' }
                        ].map((item, idx) => (
                            <div key={idx} className="flex items-center gap-3 group cursor-default">
                                <div className="w-10 h-10 bg-white/5 rounded-xl group-hover:bg-white/10 transition-all border border-white/10 shadow-2xl flex items-center justify-center backdrop-blur-3xl group-hover:scale-110 duration-500">
                                    <item.icon className="w-5 h-5 text-secondary" />
                                </div>
                                <span className="font-bold text-white text-[11px] tracking-widest uppercase opacity-60 group-hover:opacity-100 transition-all">{item.text}</span>
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center gap-12 pt-8 border-t border-white/10 opacity-40">
                        {['HIPAA', 'SECURE', 'ISO 27001'].map((tag, i) => (
                            <div key={i} className="flex items-center gap-2 group">
                                <ShieldCheck className="w-4 h-4 text-white" />
                                <span className="text-[9px] uppercase font-black tracking-[0.2em] text-white">{tag}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Seccion Derecha: El Panel de Control Elite */}
            <div className="flex-1 flex flex-col justify-center items-center p-6 lg:p-8 bg-white relative h-screen overflow-hidden">
                <div className="w-full max-w-[420px] animate-in fade-in slide-in-from-right-8 duration-700">
                    {/* Brand Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-[1.5rem] bg-slate-50 shadow-premium-md mb-4 group transition-all duration-700 hover:shadow-premium-lg border border-slate-100">
                            <Stethoscope className="h-8 w-8 text-primary group-hover:rotate-12 transition-transform" />
                        </div>
                        <h2 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tighter uppercase select-none">Bienvenido</h2>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em] mt-2">Portal de Gestión Profesional</p>
                    </div>

                    {/* Boton de Demo Elite - INTERNO */}
                    <Button
                        onClick={() => navigate('/demo')}
                        className="w-full mb-8 bg-primary hover:bg-primary-dark text-white font-black h-16 rounded-2xl shadow-xl transition-all hover:-translate-y-1 active:scale-95 group relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 skew-x-12" />
                        <div className="flex flex-col items-center">
                            <div className="flex items-center gap-3">
                                <Rocket className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                                <span className="text-base lg:text-lg tracking-[0.05em] uppercase font-black">Acceso Demo Inmediato</span>
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                            </div>
                            <span className="text-[8px] uppercase tracking-[0.2em] opacity-40 font-bold">Experiencia 360 Full Access</span>
                        </div>
                    </Button>

                    <div className="relative mb-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-100" />
                        </div>
                        <div className="relative flex justify-center">
                            <span className="bg-white px-4 text-slate-400 font-black tracking-[0.3em] text-[8px] uppercase opacity-40">Identificación de Usuario</span>
                        </div>
                    </div>

                    <Card className="border-none bg-white shadow-premium-lg rounded-[2.5rem] p-1 border-2 border-slate-50">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid w-full grid-cols-2 bg-slate-50/50 p-1 rounded-xl mb-2">
                                <TabsTrigger value="login" className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-lg h-10 text-[9px] font-black tracking-[0.2em] transition-all uppercase">Login</TabsTrigger>
                                <TabsTrigger value="signup" className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-lg h-10 text-[9px] font-black tracking-[0.2em] transition-all uppercase">Registro</TabsTrigger>
                            </TabsList>

                            <CardContent className="pt-4 pb-6 px-4">
                                <TabsContent value="login" className="mt-0 space-y-6">
                                    <form onSubmit={handleLogin} className="space-y-6">
                                        <div className="space-y-3">
                                            <Label className="text-slate-400 text-[9px] font-black uppercase tracking-[0.3em] ml-2">Credencial Corporativa</Label>
                                            <div className="relative group">
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-primary transition-colors" />
                                                <Input
                                                    type="email"
                                                    placeholder="EMAIL@SISTEMA.COM"
                                                    value={loginEmail}
                                                    onChange={(e) => setLoginEmail(e.target.value)}
                                                    className="pl-12 h-14 bg-slate-50 border-slate-100 text-slate-900 placeholder:text-slate-300 rounded-xl text-sm transition-all font-bold uppercase tracking-tight focus:bg-white"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <Label className="text-slate-400 text-[9px] font-black uppercase tracking-[0.3em] ml-2">Código Secreto</Label>
                                            <div className="relative group">
                                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-primary transition-colors" />
                                                <Input
                                                    type="password"
                                                    placeholder="••••••••"
                                                    value={loginPassword}
                                                    onChange={(e) => setLoginPassword(e.target.value)}
                                                    className="pl-12 h-14 bg-slate-50 border-slate-100 text-slate-900 placeholder:text-slate-300 rounded-xl text-sm transition-all font-bold focus:bg-white"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black h-16 rounded-xl transition-all shadow-lg text-sm tracking-widest active:scale-95" disabled={loading}>
                                            {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : 'AUTENTICAR ACCESO'}
                                        </Button>
                                    </form>
                                </TabsContent>

                                <TabsContent value="signup" className="mt-0">
                                    {/* Signup form simplified for one-view fit */}
                                    <form onSubmit={handleSignup} className="space-y-4">
                                        <Input
                                            placeholder="NOMBRE COMPLETO"
                                            value={signupFullName}
                                            onChange={(e) => setSignupFullName(e.target.value)}
                                            className="h-12 bg-slate-50 border-slate-100 rounded-xl font-bold text-xs"
                                            required
                                        />
                                        <Input
                                            type="email"
                                            placeholder="EMAIL CORPORATIVO"
                                            value={signupEmail}
                                            onChange={(e) => setSignupEmail(e.target.value)}
                                            className="h-12 bg-slate-50 border-slate-100 rounded-xl font-bold text-xs"
                                            required
                                        />
                                        <div className="grid grid-cols-2 gap-3">
                                            <Input
                                                type="password"
                                                placeholder="PASSWORD"
                                                value={signupPassword}
                                                onChange={(e) => setSignupPassword(e.target.value)}
                                                className="h-12 bg-slate-50 border-slate-100 rounded-xl font-bold text-xs"
                                                required
                                            />
                                            <Input
                                                type="password"
                                                placeholder="CONFIRMA"
                                                value={signupConfirmPassword}
                                                onChange={(e) => setSignupConfirmPassword(e.target.value)}
                                                className="h-12 bg-slate-50 border-slate-100 rounded-xl font-bold text-xs"
                                                required
                                            />
                                        </div>
                                        <Button type="submit" className="w-full bg-primary hover:bg-primary-dark text-white font-black h-14 rounded-xl mt-2 text-xs tracking-widest" disabled={loading}>
                                            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'CREAR CREDENCIAL'}
                                        </Button>
                                    </form>
                                </TabsContent>
                            </CardContent>
                        </Tabs>
                    </Card>

                    <div className="mt-8 text-center space-y-4 opacity-30 hover:opacity-100 transition-opacity duration-1000">
                        <div className="h-px w-20 bg-slate-200 mx-auto" />
                        <p className="text-[8px] text-slate-400 font-black uppercase tracking-[0.3em]">
                            System v4.0 Titanium • © 2026 César Ascanio
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
