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
import { SEO } from '@/components/common/SEO';
import { useTheme } from '@/context/ThemeContext';

export default function AuthPage() {
    const { theme } = useTheme();
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
        <div className="h-screen flex flex-col lg:flex-row font-display overflow-hidden bg-slate-950 text-white">
            <SEO title={`${theme?.texts?.login_welcome || "Acceso"} - ${theme?.app_name || "MediVisitPro"}`} description="Acceso al centro de mando." />

            {/* Seccion Izquierda: The Visionary Hero */}
            <div className="hidden lg:flex flex-[1.3] relative flex-col justify-center p-16 xl:p-24 overflow-hidden border-r border-white/5">
                {/* Hero Background - High End Treatment */}
                <div 
                    className="absolute inset-0 bg-cover bg-center scale-100 opacity-60" 
                    style={{ backgroundImage: "url('/medical_tech_background.png')" }}
                />
                
                {/* Deep Sophisticated Overlays - Adjusted for clarity */}
                <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-950/40 to-blue-900/10" />
                <div className="absolute inset-0 backdrop-blur-[0.5px]" />
                
                {/* Data Grid Overlay Effect - Subtler */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 mix-blend-overlay" />

                <div className="relative z-10 max-w-xl">
                    {theme?.texts?.login_badge && (
                        <div className="inline-flex items-center gap-3 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full mb-8 backdrop-blur-3xl">
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                            <span className="text-[10px] font-bold tracking-wider text-blue-100 uppercase">
                                {theme.texts.login_badge}
                            </span>
                        </div>
                    )}

                    <h1 className="text-4xl lg:text-5xl xl:text-6xl font-black leading-[1.1] mb-6 tracking-tight">
                        {theme?.texts?.login_hero_title_1 || "El poder de la"}{" "}<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-200">
                            {theme?.texts?.login_hero_title_2 || "Inteligencia"}
                        </span> <br />
                        <span className="text-amber-500 drop-shadow-[0_0_30px_rgba(245,158,11,0.4)]">
                            {theme?.texts?.login_hero_title_3 || "Farmacéutica"}
                        </span>
                    </h1>

                    <p className="text-base text-muted-foreground mb-10 leading-relaxed font-medium max-w-md">
                        {theme?.texts?.login_hero_subtitle || "Gestione su fuerza comercial con la precisión de un cirujano. Datos en tiempo real, rutas optimizadas y control total de muestras médicas."}
                    </p>

                    <div className="grid grid-cols-2 gap-6">
                        {[
                            { 
                                icon: MapPin, 
                                text: theme?.texts?.login_feature_1_title || 'Optimización de Rutas', 
                                sub: theme?.texts?.login_feature_1_sub || 'Navegación GPS Inteligente' 
                            },
                            { 
                                icon: ShieldCheck, 
                                text: theme?.texts?.login_feature_2_title || 'Acceso Seguro', 
                                sub: theme?.texts?.login_feature_2_sub || 'ISO 27001 READY' 
                            }
                        ].map((item, idx) => (
                            <div key={idx} className="flex items-start gap-4 p-5 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl hover:bg-white/10 transition-all group">
                                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <item.icon className="w-5 h-5 text-blue-400" />
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-white">{item.text}</p>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight mt-1">{item.sub}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer Left */}
                <div className="absolute bottom-12 left-16 flex items-center gap-6 opacity-30">
                    <span className="text-[10px] font-bold tracking-wider">
                        {theme?.texts?.login_footer_left || "Powered by CA Labs"}
                    </span>
                    <div className="w-12 h-px bg-white/20" />
                    <span className="text-[10px] font-bold tracking-wider">
                        {theme?.texts?.login_footer_right || "Sentinel Oracle Integrated"}
                    </span>
                </div>
            </div>

            {/* Seccion Derecha: Command Center Access */}
            <div className="flex-1 flex flex-col justify-center items-center p-6 bg-slate-950 relative h-screen overflow-hidden">
                {/* Subtle Ambient Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

                <div className="w-full max-w-[400px] relative z-10 animate-in fade-in zoom-in-95 duration-700">
                    {/* Brand Header */}
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 shadow-2xl shadow-blue-500/20 mb-6 group">
                            <Stethoscope className="h-7 w-7 text-white group-hover:rotate-12 transition-transform" />
                        </div>
                        <h2 className="text-3xl font-black text-white tracking-tight">
                            {theme?.texts?.login_welcome || "Bienvenido de nuevo"}
                        </h2>
                        <p className="text-blue-400 text-[10px] font-bold uppercase tracking-[0.3em] mt-1.5">
                            {theme?.texts?.login_subtitle || "Ingresa tus credenciales para continuar"}
                        </p>
                    </div>

                    {/* Boton de Demo Elite - AMBER ACCENT */}
                    <Button
                        onClick={() => navigate('/demo')}
                        className="w-full mb-10 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold h-14 rounded-2xl shadow-[0_0_40px_rgba(245,158,11,0.2)] transition-all hover:-translate-y-1 active:scale-95 group relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 skew-x-12" />
                        <div className="flex items-center justify-center gap-3">
                            <Rocket className="w-5 h-5" />
                            <span className="text-sm font-bold">Solicitar Demo 72h</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </Button>

                    <div className="relative mb-10">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/5" />
                        </div>
                        <div className="relative flex justify-center">
                            <span className="bg-slate-950 px-4 text-muted-foreground/60 font-bold text-xs tracking-wider">Credenciales del Sistema</span>
                        </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 p-1.5 rounded-3xl backdrop-blur-2xl shadow-2xl">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid w-full grid-cols-2 bg-black/40 p-1.5 rounded-2xl mb-4">
                                <TabsTrigger value="login" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-xl h-11 text-xs font-bold transition-all">Identificarse</TabsTrigger>
                                <TabsTrigger value="signup" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-xl h-11 text-xs font-bold transition-all">Registrarse</TabsTrigger>
                            </TabsList>

                            <CardContent className="pt-2 pb-8 px-6">
                                <TabsContent value="login" className="mt-0 space-y-8">
                                    <form onSubmit={handleLogin} className="space-y-8">
                                        <div className="space-y-3">
                                            <Label className="text-muted-foreground/80 text-xs font-bold ml-1">
                                                {theme?.texts?.login_form_email_label || "Correo Electrónico"}
                                            </Label>
                                            <div className="relative group">
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/40 group-focus-within:text-blue-400 transition-colors" />
                                                <Input
                                                    type="email"
                                                    placeholder="usuario@corporativo.com"
                                                    value={loginEmail}
                                                    onChange={(e) => setLoginEmail(e.target.value)}
                                                    className="pl-12 h-14 bg-white/5 border-white/10 text-white placeholder:text-muted-foreground/20 rounded-xl text-base transition-all font-medium focus:bg-white/10 focus:border-blue-500/50"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <Label className="text-muted-foreground/80 text-xs font-bold ml-1">
                                                {theme?.texts?.login_form_password_label || "Contraseña"}
                                            </Label>
                                            <div className="relative group">
                                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/40 group-focus-within:text-blue-400 transition-colors" />
                                                <Input
                                                    type="password"
                                                    placeholder="••••••••"
                                                    value={loginPassword}
                                                    onChange={(e) => setLoginPassword(e.target.value)}
                                                    className="pl-12 h-14 bg-white/5 border-white/10 text-white placeholder:text-muted-foreground/20 rounded-xl text-base transition-all font-medium focus:bg-white/10 focus:border-blue-500/50"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <Button type="submit" className="w-full bg-white text-slate-950 hover:bg-slate-200 font-bold h-14 rounded-xl transition-all shadow-xl text-sm active:scale-95" disabled={loading}>
                                            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (theme?.texts?.login_form_button || 'Iniciar Sesión')}
                                        </Button>
                                    </form>
                                </TabsContent>

                                <TabsContent value="signup" className="mt-0 space-y-6">
                                    <form onSubmit={handleSignup} className="space-y-6">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold text-slate-300 ml-1">Nombre Completo</Label>
                                            <Input
                                                placeholder="Nombre completo"
                                                value={signupFullName}
                                                onChange={(e) => setSignupFullName(e.target.value)}
                                                className="h-12 bg-white/5 border-white/10 text-white rounded-xl font-medium text-sm"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold text-slate-300 ml-1">Email</Label>
                                            <Input
                                                type="email"
                                                placeholder="email@corporativo.com"
                                                value={signupEmail}
                                                onChange={(e) => setSignupEmail(e.target.value)}
                                                className="h-12 bg-white/5 border-white/10 text-white rounded-xl font-medium text-sm"
                                                required
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold text-slate-300 ml-1">Password</Label>
                                                <Input
                                                    type="password"
                                                    placeholder="••••••••"
                                                    value={signupPassword}
                                                    onChange={(e) => setSignupPassword(e.target.value)}
                                                    className="h-12 bg-white/5 border-white/10 text-white rounded-xl font-medium text-sm"
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold text-slate-300 ml-1">Confirmar</Label>
                                                <Input
                                                    type="password"
                                                    placeholder="••••••••"
                                                    value={signupConfirmPassword}
                                                    onChange={(e) => setSignupConfirmPassword(e.target.value)}
                                                    className="h-12 bg-white/5 border-white/10 text-white rounded-xl font-medium text-sm"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold h-14 rounded-xl mt-4 text-sm" disabled={loading}>
                                            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Registrarse'}
                                        </Button>
                                    </form>
                                </TabsContent>
                            </CardContent>
                        </Tabs>
                    </div>

                    <div className="mt-12 text-center opacity-40 hover:opacity-100 transition-opacity duration-1000">
                        <p className="text-[10px] text-muted-foreground font-bold tracking-wider">
                            {theme?.texts?.footer_text || "© 2026 MediVisitPro. Todos los derechos reservados."}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
