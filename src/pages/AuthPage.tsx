/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 ======================================================================== */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
    Loader2,
    Stethoscope,
    Mail,
    Lock,
    ShieldCheck,
    Rocket,
    MapPin,
    ArrowRight,
    User
} from 'lucide-react';
import { SEO } from '@/components/common/SEO';
import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/lib/utils';

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
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                        <Stethoscope className="h-5 w-5 text-primary" strokeWidth={1.5} />
                    </div>
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
            </div>
        );
    }

    const features = [
        {
            icon: MapPin,
            text: theme?.texts?.login_feature_1_title || 'Optimización de Rutas',
            sub: theme?.texts?.login_feature_1_sub || 'Navegación GPS inteligente'
        },
        {
            icon: ShieldCheck,
            text: theme?.texts?.login_feature_2_title || 'Acceso Seguro',
            sub: theme?.texts?.login_feature_2_sub || 'Encriptado de extremo a extremo'
        },
    ];

    return (
        <div className="h-screen flex flex-col lg:flex-row font-sans overflow-hidden bg-background">
            <SEO
                title={`${theme?.texts?.login_welcome || "Acceso"} — ${theme?.app_name || "MediVisitPro"}`}
                description="Accede a tu centro de gestión farmacéutica."
            />

            {/* ── Sección Izquierda — Hero corporativo ── */}
            <div className="hidden lg:flex flex-[1.2] relative flex-col justify-between p-12 xl:p-16 overflow-hidden bg-primary">
                {/* Patrón de fondo sutil */}
                <div
                    className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.15) 0%, transparent 50%),
                                          radial-gradient(circle at 75% 75%, rgba(255,255,255,0.08) 0%, transparent 50%)`
                    }}
                />
                <div className="absolute inset-0 bg-cover bg-center opacity-20"
                    style={{ backgroundImage: "url('/medical_tech_background.png')" }}
                />

                {/* Logo */}
                <div className="relative z-10 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-md bg-white/20 flex items-center justify-center">
                        <img src={theme?.logo_url || "/favicon.svg"} className="w-6 h-6 object-contain" alt="Logo" />
                    </div>
                    <span className="text-sm font-semibold text-white">
                        {theme?.app_name || 'MediVisitPro'}
                    </span>
                </div>

                {/* Hero content */}
                <div className="relative z-10 max-w-sm">
                    {theme?.texts?.login_badge && (
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 border border-white/20 rounded-full mb-6">
                            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                            <span className="text-xs font-medium text-white/90 uppercase tracking-wider">
                                {theme.texts.login_badge}
                            </span>
                        </div>
                    )}

                    <h1 className="text-3xl xl:text-4xl font-semibold leading-tight text-white mb-4 tracking-tight">
                        {theme?.texts?.login_hero_title_1 || "Gestión farmacéutica"}{" "}
                        <span className="text-white/70">
                            {theme?.texts?.login_hero_title_2 || "de alta precisión"}
                        </span>
                    </h1>

                    <p className="text-sm text-white/70 leading-relaxed mb-8">
                        {theme?.texts?.login_hero_subtitle || "Controla tu fuerza de ventas, rutas y muestras médicas desde un solo lugar."}
                    </p>

                    {/* Feature cards */}
                    <div className="space-y-3">
                        {features.map((item, idx) => (
                            <div
                                key={idx}
                                className="flex items-center gap-3 p-3 bg-white/10 border border-white/15 rounded-lg backdrop-blur-sm"
                            >
                                <div className="w-8 h-8 rounded-md bg-white/15 flex items-center justify-center flex-shrink-0">
                                    <item.icon className="w-4 h-4 text-white" strokeWidth={1.5} />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-white leading-none">{item.text}</p>
                                    <p className="text-xs text-white/60 mt-0.5">{item.sub}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer izquierdo */}
                <div className="relative z-10">
                    <p className="text-xs text-white/40">
                        {theme?.texts?.footer_text || "© 2026 MediVisitPro · CA Labs"}
                    </p>
                </div>
            </div>

            {/* ── Sección Derecha — Formulario ── */}
            <div className="flex-1 flex flex-col justify-center items-center p-6 bg-background overflow-y-auto">
                <div className="w-full max-w-[380px]">

                    {/* Brand Header — solo mobile */}
                    <div className="lg:hidden flex items-center justify-center gap-2.5 mb-8">
                        <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center">
                            <Stethoscope className="h-5 w-5 text-primary" strokeWidth={1.5} />
                        </div>
                        <span className="text-base font-semibold text-foreground">
                            {theme?.app_name || 'MediVisitPro'}
                        </span>
                    </div>

                    {/* Welcome text */}
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold text-foreground tracking-tight">
                            {theme?.texts?.login_welcome || "Bienvenido"}
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            {theme?.texts?.login_subtitle || "Ingresa tus credenciales para continuar"}
                        </p>
                    </div>

                    {/* Demo button */}
                    <Button
                        onClick={() => navigate('/demo')}
                        variant="outline"
                        className="w-full mb-5 h-9 border-border text-sm gap-2 group"
                    >
                        <Rocket className="w-3.5 h-3.5 text-primary" strokeWidth={1.5} />
                        Solicitar Demo 72h
                        <ArrowRight className="w-3.5 h-3.5 ml-auto text-muted-foreground group-hover:translate-x-0.5 transition-transform" strokeWidth={1.5} />
                    </Button>

                    {/* Divider */}
                    <div className="relative mb-5">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-border" />
                        </div>
                        <div className="relative flex justify-center">
                            <span className="bg-background px-3 text-xs text-muted-foreground">o continúa con tu cuenta</span>
                        </div>
                    </div>

                    {/* Auth Tabs */}
                    <div className="bg-card border border-border rounded-lg overflow-hidden">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid w-full grid-cols-2 bg-muted rounded-none border-b border-border h-auto p-0">
                                <TabsTrigger
                                    value="login"
                                    className="rounded-none h-10 text-xs font-medium data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-none border-r border-border data-[state=active]:border-b-2 data-[state=active]:border-b-primary"
                                >
                                    Iniciar Sesión
                                </TabsTrigger>
                                <TabsTrigger
                                    value="signup"
                                    className="rounded-none h-10 text-xs font-medium data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-b-primary"
                                >
                                    Registrarse
                                </TabsTrigger>
                            </TabsList>

                            <CardContent className="p-5">
                                {/* LOGIN TAB */}
                                <TabsContent value="login" className="mt-0">
                                    <form onSubmit={handleLogin} className="space-y-4">
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-medium text-foreground">
                                                {theme?.texts?.login_form_email_label || "Correo Electrónico"}
                                            </Label>
                                            <div className="relative">
                                                <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />
                                                <Input
                                                    type="email"
                                                    id="login-email"
                                                    placeholder="usuario@empresa.com"
                                                    value={loginEmail}
                                                    onChange={(e) => setLoginEmail(e.target.value)}
                                                    className="pl-8 h-9 text-sm border-border focus:border-primary focus:ring-1 focus:ring-primary"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-medium text-foreground">
                                                {theme?.texts?.login_form_password_label || "Contraseña"}
                                            </Label>
                                            <div className="relative">
                                                <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />
                                                <Input
                                                    type="password"
                                                    id="login-password"
                                                    placeholder="••••••••"
                                                    value={loginPassword}
                                                    onChange={(e) => setLoginPassword(e.target.value)}
                                                    className="pl-8 h-9 text-sm border-border focus:border-primary focus:ring-1 focus:ring-primary"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="flex justify-end">
                                            <button
                                                type="button"
                                                className="text-xs text-primary hover:text-primary/80 transition-colors"
                                                onClick={() => toast({ title: 'Recuperar contraseña', description: 'Contacta a tu administrador.' })}
                                            >
                                                ¿Olvidaste tu contraseña?
                                            </button>
                                        </div>

                                        <Button
                                            type="submit"
                                            id="login-submit"
                                            className="w-full h-9 text-sm font-medium"
                                            disabled={loading}
                                        >
                                            {loading
                                                ? <Loader2 className="h-4 w-4 animate-spin" />
                                                : (theme?.texts?.login_form_button || 'Iniciar Sesión')
                                            }
                                        </Button>
                                    </form>
                                </TabsContent>

                                {/* SIGNUP TAB */}
                                <TabsContent value="signup" className="mt-0">
                                    <form onSubmit={handleSignup} className="space-y-4">
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-medium text-foreground">Nombre Completo</Label>
                                            <div className="relative">
                                                <User className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />
                                                <Input
                                                    id="signup-name"
                                                    placeholder="Tu nombre completo"
                                                    value={signupFullName}
                                                    onChange={(e) => setSignupFullName(e.target.value)}
                                                    className="pl-8 h-9 text-sm border-border focus:border-primary focus:ring-1 focus:ring-primary"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-medium text-foreground">Email</Label>
                                            <div className="relative">
                                                <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />
                                                <Input
                                                    id="signup-email"
                                                    type="email"
                                                    placeholder="email@empresa.com"
                                                    value={signupEmail}
                                                    onChange={(e) => setSignupEmail(e.target.value)}
                                                    className="pl-8 h-9 text-sm border-border focus:border-primary focus:ring-1 focus:ring-primary"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1.5">
                                                <Label className="text-xs font-medium text-foreground">Contraseña</Label>
                                                <Input
                                                    id="signup-password"
                                                    type="password"
                                                    placeholder="••••••••"
                                                    value={signupPassword}
                                                    onChange={(e) => setSignupPassword(e.target.value)}
                                                    className="h-9 text-sm border-border focus:border-primary focus:ring-1 focus:ring-primary"
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-xs font-medium text-foreground">Confirmar</Label>
                                                <Input
                                                    id="signup-confirm"
                                                    type="password"
                                                    placeholder="••••••••"
                                                    value={signupConfirmPassword}
                                                    onChange={(e) => setSignupConfirmPassword(e.target.value)}
                                                    className="h-9 text-sm border-border focus:border-primary focus:ring-1 focus:ring-primary"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <Button
                                            type="submit"
                                            id="signup-submit"
                                            className="w-full h-9 text-sm font-medium"
                                            disabled={loading}
                                        >
                                            {loading
                                                ? <Loader2 className="h-4 w-4 animate-spin" />
                                                : 'Crear Cuenta'
                                            }
                                        </Button>
                                    </form>
                                </TabsContent>
                            </CardContent>
                        </Tabs>
                    </div>

                    {/* Footer */}
                    <p className="mt-6 text-center text-xs text-muted-foreground">
                        {theme?.texts?.footer_text || "© 2026 MediVisitPro. Todos los derechos reservados."}
                    </p>
                </div>
            </div>
        </div>
    );
}
