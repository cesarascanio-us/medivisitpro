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
            <div className="min-h-screen flex items-center justify-center bg-white">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white flex flex-col lg:flex-row overflow-hidden font-sans">
            {/* Seccion Izquierda: Hero & Features - Elite Titanium Edition */}
            <div className="hidden lg:flex flex-[1.4] relative flex-col justify-center p-16 xl:p-28 overflow-hidden bg-[#001a33]">
                {/* Hero Background with Deep Glassmorphism Overlay */}
                <div 
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-[20s] hover:scale-110" 
                    style={{ backgroundImage: "url('/img/hero-auth.png')" }}
                />
                <div className="absolute inset-0 bg-gradient-to-br from-[#001a33] via-[#001a33]/90 to-transparent" />
                <div className="absolute inset-0 bg-primary-dark/20 backdrop-blur-[1px]" />
                
                {/* Elite Effects */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay" />
                <div className="absolute top-20 right-20 w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[180px] animate-pulse" />
                <div className="absolute -bottom-40 -left-20 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[150px]" />

                <div className="relative z-10 max-w-2xl">
                    <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl mb-16 backdrop-blur-3xl shadow-2xl transition-all hover:bg-white/10 group">
                        <Zap className="w-5 h-5 text-secondary fill-secondary group-hover:scale-125 transition-transform" />
                        <span className="text-[11px] font-black text-white uppercase tracking-[0.4em] leading-none">Nueva Era en Visita Médica</span>
                    </div>

                    <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black text-white leading-[0.95] mb-6 lg:mb-10 tracking-tighter uppercase select-none">
                        Optimiza <br />
                        tu fuerza <br />
                        <span className="text-secondary drop-shadow-[0_10px_30px_rgba(255,183,1,0.3)]">Comercial</span> <br />
                        <span className="relative inline-block text-white">
                            Médica 
                            <div className="absolute bottom-1 lg:bottom-3 left-0 w-full h-1.5 lg:h-3 bg-secondary/20 -z-10 skew-x-[-12deg]" />
                        </span>
                    </h1>

                    <div className="w-24 h-2 bg-secondary mb-12 rounded-full" />

                    <p className="text-base lg:text-lg xl:text-xl text-white/70 mb-10 lg:mb-16 leading-relaxed font-bold max-w-lg opacity-90">
                        Gestiona visitas, muestras, farmacias y análisis de mercado en una única plataforma diseñada para el éxito farmacéutico.
                    </p>

                    <div className="grid grid-cols-2 gap-x-6 lg:gap-x-12 gap-y-6 lg:gap-y-10 mb-10 lg:mb-20">
                        {[
                            { icon: MapPin, text: 'Rutas Intelligentes' },
                            { icon: Stethoscope, text: 'Panel Médico' },
                            { icon: PieChart, text: 'Analytics Elite' },
                            { icon: CheckCircle2, text: 'Muestras Control' }
                        ].map((item, idx) => (
                            <div key={idx} className="flex items-center gap-4 lg:gap-5 group cursor-default">
                                <div className="w-10 h-10 lg:w-14 lg:h-14 bg-white/5 rounded-xl lg:rounded-2xl group-hover:bg-white/10 transition-all border border-white/5 shadow-2xl flex items-center justify-center backdrop-blur-3xl group-hover:scale-110 duration-500">
                                    <item.icon className="w-5 h-5 lg:w-7 lg:h-7 text-secondary" />
                                </div>
                                <span className="font-black text-white text-xs lg:text-lg tracking-tight uppercase opacity-80 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-300">{item.text}</span>
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center gap-20 pt-16 border-t border-white/5">
                        {['HIPAA', 'SECURE', 'ISO 27001'].map((tag, i) => (
                            <div key={i} className="flex flex-col gap-4 items-center group opacity-30 hover:opacity-100 transition-all duration-700">
                                {i === 0 ? <ShieldCheck className="w-10 h-10 text-white group-hover:scale-110 transition-transform" /> : i === 1 ? <Lock className="w-10 h-10 text-white group-hover:scale-110 transition-transform" /> : <Shield className="w-10 h-10 text-white group-hover:scale-110 transition-transform" />}
                                <span className="text-[10px] uppercase font-black tracking-[0.5em] text-white whitespace-nowrap">{tag}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Seccion Derecha: El Panel de Control Elite */}
                    <div className="flex-1 flex flex-col justify-center items-center p-6 lg:p-12 bg-[#f4f7f9] relative min-h-screen">
                <div className="w-full max-w-[460px] animate-in fade-in slide-in-from-right-12 duration-1000">
                    {/* Brand Mobile */}
                    <div className="lg:hidden text-center mb-12">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary shadow-xl shadow-primary/40 mb-6">
                            <Stethoscope className="h-8 w-8 text-white" />
                        </div>
                        <h1 className="text-4xl font-black text-text-main tracking-tighter uppercase mb-1">MediVisitPro</h1>
                        <p className="text-primary font-black tracking-[0.4em] text-[9px] uppercase opacity-60">Elite Medical Management</p>
                    </div>

                    <div className="mb-8 lg:mb-12 hidden lg:block text-center relative">
                        <div className="inline-flex items-center justify-center w-16 h-16 lg:w-24 lg:h-24 rounded-2xl lg:rounded-[2rem] bg-white shadow-[15px_15px_30px_#d1d9e6,-15px_-15px_30px_#ffffff] mb-6 lg:mb-10 group transition-all duration-1000 hover:shadow-[0_0_60px_rgba(0,102,204,0.15)] relative">
                            <Stethoscope className="h-8 w-8 lg:h-12 lg:w-12 text-primary group-hover:scale-110 transition-transform duration-700" />
                        </div>
                        <h2 className="text-4xl lg:text-6xl font-black text-text-main mb-3 tracking-tighter uppercase select-none">Bienvenido</h2>
                        <div className="flex justify-center gap-1.5 mb-5">
                            <div className="h-1.5 w-10 bg-primary rounded-full" />
                            <div className="h-1.5 w-3 bg-secondary rounded-full" />
                            <div className="h-1.5 w-1.5 bg-gray-300 rounded-full" />
                        </div>
                        <p className="text-text-muted text-sm lg:text-base font-black opacity-25 uppercase tracking-[0.4em]">Portal de Gestión Profesional</p>
                    </div>

                    {/* Boton de Demo Elite */}
                    <Button
                        onClick={() => window.location.href = "https://cesarascanioweb.vercel.app/#demos"}
                        className="w-full mb-6 lg:mb-12 bg-primary hover:bg-primary-dark text-white font-black h-16 lg:h-24 rounded-2xl lg:rounded-[2rem] shadow-xl transition-all hover:-translate-y-2 active:scale-95 group relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 skew-x-12" />
                        <div className="flex flex-col items-center gap-0.5">
                            <div className="flex items-center gap-3 lg:gap-4">
                                <Rocket className="w-5 h-5 lg:w-8 lg:h-8 group-hover:rotate-12 group-hover:scale-110 transition-all duration-500" />
                                <span className="text-lg lg:text-2xl tracking-[0.05em] uppercase font-black">Solicitar Demo</span>
                                <ArrowRight className="w-4 h-4 lg:w-6 lg:h-6 group-hover:translate-x-3 transition-transform duration-500" />
                            </div>
                            <span className="text-[9px] lg:text-[10px] uppercase tracking-[0.3em] opacity-40 font-bold">Experiencia 360 Full Access</span>
                        </div>
                    </Button>

                    <div className="relative mb-12">
                        <div className="absolute inset-0 flex items-center px-4">
                            <div className="w-full border-t border-gray-200/60" />
                        </div>
                        <div className="relative flex justify-center px-6">
                            <span className="bg-[#f4f7f9] px-6 text-text-muted font-black tracking-[0.4em] text-[9px] uppercase opacity-30">Identificación de Usuario</span>
                        </div>
                    </div>

                    <Card className="border-none bg-white shadow-[40px_40px_80px_#d1d9e6,-40px_-40px_80px_#ffffff] rounded-[4rem] overflow-hidden p-3 border-4 border-white">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid w-full grid-cols-2 bg-gray-50/70 p-1.5 rounded-xl lg:rounded-2xl mb-5">
                                <TabsTrigger value="login" className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-lg lg:rounded-xl h-11 lg:h-16 text-[10px] lg:text-xs font-black tracking-[0.2em] transition-all uppercase">Login</TabsTrigger>
                                <TabsTrigger value="signup" className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-lg lg:rounded-xl h-11 lg:h-16 text-[10px] lg:text-xs font-black tracking-[0.2em] transition-all uppercase">Registro</TabsTrigger>
                            </TabsList>

                            <CardContent className="pt-6 pb-12 px-8">
                                <TabsContent value="login" className="mt-0 space-y-12 animate-in fade-in slide-in-from-top-4 duration-700">
                                    <form onSubmit={handleLogin} className="space-y-10">
                                        <div className="space-y-5">
                                            <Label htmlFor="login-email" className="text-text-main text-[10px] font-black uppercase tracking-[0.4em] opacity-30 ml-3">Credencial Corporativa</Label>
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-0 w-16 flex items-center justify-center pointer-events-none pr-2">
                                                    <Mail className="h-7 w-7 text-gray-400 group-focus-within:text-primary transition-all duration-500 group-focus-within:scale-125" />
                                                </div>
                                                <Input
                                                    id="login-email"
                                                    type="email"
                                                    placeholder="EMAIL@SISTEMA.COM"
                                                    value={loginEmail}
                                                    onChange={(e) => setLoginEmail(e.target.value)}
                                                    className="pl-14 h-14 lg:h-20 bg-gray-50/30 border-gray-100/50 text-text-main placeholder:text-gray-200 focus:ring-0 focus:border-primary/40 rounded-xl lg:rounded-2xl text-base lg:text-lg transition-all font-black uppercase tracking-tight shadow-sm hover:bg-white"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-5">
                                            <Label htmlFor="login-password" className="text-text-main text-[10px] font-black uppercase tracking-[0.4em] opacity-30 ml-3">Código Secreto</Label>
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-0 w-16 flex items-center justify-center pointer-events-none pr-2">
                                                    <Lock className="h-7 w-7 text-gray-400 group-focus-within:text-primary transition-all duration-500 group-focus-within:scale-125" />
                                                </div>
                                                <Input
                                                    id="login-password"
                                                    type="password"
                                                    placeholder="••••••••"
                                                    value={loginPassword}
                                                    onChange={(e) => setLoginPassword(e.target.value)}
                                                    className="pl-14 h-14 lg:h-20 bg-gray-50/30 border-gray-100/50 text-text-main placeholder:text-gray-200 focus:ring-0 focus:border-primary/40 rounded-xl lg:rounded-2xl text-base lg:text-lg transition-all font-black uppercase shadow-sm hover:bg-white"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <Button type="submit" className="w-full bg-primary hover:bg-primary-dark text-white font-black h-16 lg:h-24 rounded-xl lg:rounded-2xl transition-all shadow-lg text-lg lg:text-xl group overflow-hidden mt-6 lg:mt-10 active:scale-95" disabled={loading}>
                                            {loading ? <Loader2 className="h-8 w-8 lg:h-10 lg:w-10 animate-spin text-white" /> : (
                                                <div className="flex items-center gap-3 lg:gap-4">
                                                    <span>AUTENTICAR</span>
                                                    <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                                                        <ArrowRight className="w-4 h-4 lg:w-5 lg:h-5 group-hover:translate-x-2 transition-transform duration-500" />
                                                    </div>
                                                </div>
                                            )}
                                        </Button>
                                    </form>
                                </TabsContent>

                                <TabsContent value="signup" className="mt-0 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                    <form onSubmit={handleSignup} className="space-y-8">
                                        {[
                                            { id: 'signup-name', label: 'Nombre Completo', placeholder: 'EJ: MANUEL GARCÍA' },
                                            { id: 'signup-email', label: 'Email Corporativo', placeholder: 'EMAIL@SISTEMA.COM', type: 'email' }
                                        ].map((field) => (
                                            <div key={field.id} className="space-y-4">
                                                <Label htmlFor={field.id} className="text-text-main text-[10px] font-black uppercase tracking-[0.4em] opacity-30 ml-4">{field.label}</Label>
                                                <Input
                                                    id={field.id}
                                                    type={field.type || 'text'}
                                                    placeholder={field.placeholder}
                                                    value={field.id === 'signup-name' ? signupFullName : signupEmail}
                                                    onChange={(e) => field.id === 'signup-name' ? setSignupFullName(e.target.value) : setSignupEmail(e.target.value)}
                                                    className="bg-gray-50/50 border-gray-100 text-text-main h-20 rounded-[1.5rem] focus:ring-12 focus:ring-primary/5 focus:border-primary font-black text-xl uppercase tracking-tight px-8"
                                                    required
                                                />
                                            </div>
                                        ))}

                                        <div className="grid grid-cols-2 gap-8">
                                            <div className="space-y-4">
                                                <Label htmlFor="signup-password" className="text-text-main text-[10px] font-black uppercase tracking-[0.4em] opacity-30 ml-4">Password</Label>
                                                <Input
                                                    id="signup-password"
                                                    type="password"
                                                    value={signupPassword}
                                                    onChange={(e) => setSignupPassword(e.target.value)}
                                                    className="bg-gray-50/50 border-gray-100 text-text-main h-20 rounded-[1.5rem] focus:ring-12 focus:ring-primary/5 focus:border-primary font-black px-8"
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-4">
                                                <Label htmlFor="signup-confirm" className="text-text-main text-[10px] font-black uppercase tracking-[0.4em] opacity-30 ml-4">Confirma</Label>
                                                <Input
                                                    id="signup-confirm"
                                                    type="password"
                                                    value={signupConfirmPassword}
                                                    onChange={(e) => setSignupConfirmPassword(e.target.value)}
                                                    className="bg-gray-50/50 border-gray-100 text-text-main h-20 rounded-[1.5rem] focus:ring-12 focus:ring-primary/5 focus:border-primary font-black px-8"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <Button type="submit" className="w-full bg-primary hover:bg-primary-dark text-white font-black h-24 rounded-[2rem] mt-10 shadow-2xl active:scale-95 transition-all text-xl tracking-widest uppercase" disabled={loading}>
                                            {loading ? <Loader2 className="h-10 w-10 animate-spin" /> : 'Registrar Credencial'}
                                        </Button>
                                    </form>
                                </TabsContent>
                            </CardContent>
                        </Tabs>
                    </Card>

                    <div className="mt-20 text-center space-y-8 pb-10">
                        <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
                        <p className="text-[11px] text-text-muted leading-relaxed max-w-sm mx-auto font-black uppercase tracking-[0.3em] opacity-20 hover:opacity-100 transition-opacity duration-1000">
                            Propiedad Tecnológica de César Ascanio <br />
                            MediVisit Pro System v4.0 titanium <br />
                            © 2026 Reservados todos los derechos
                        </p>
                        <div className="flex justify-center gap-10 text-[10px] font-black text-primary opacity-30 uppercase tracking-[0.5em] italic">
                            <span className="cursor-pointer hover:text-primary transition-colors hover:underline">Compliance</span>
                            <span className="cursor-p