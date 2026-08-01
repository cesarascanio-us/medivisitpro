import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
    Loader2,
    Stethoscope,
    Mail,
    Lock,
    User,
    Rocket
} from 'lucide-react';
import { SEO } from '@/components/common/SEO';
import { useTheme } from '@/contexts/ThemeContext';

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
            const errorStr = (error.message || error.toString() || '').toLowerCase();
            const isNetworkError = errorStr.includes('failed to fetch') || 
                                   errorStr.includes('net::err') || 
                                   errorStr.includes('not_resolved') ||
                                   !navigator.onLine;

            if (isNetworkError) {
                console.log('[AuthPage] Network error detected. Activating local demo mode fallback...');
                toast({
                    title: '🔌 Base de Datos Offline',
                    description: 'No pudimos conectar con el servidor. Activando modo demostración local sin conexión...',
                });

                // Trigger local demo session setup
                const mockSession = {
                    access_token: "mock-jwt-token-for-local-demo-purposes",
                    token_type: "bearer",
                    expires_in: 315360000, // 10 years
                    refresh_token: "mock-refresh-token",
                    user: {
                        id: "d3300000-0000-0000-0000-000000000001",
                        aud: "authenticated",
                        role: "authenticated",
                        email: "demo.medivisitpro@gmail.com",
                        email_confirmed_at: new Date().toISOString(),
                        phone: "",
                        confirmed_at: new Date().toISOString(),
                        last_sign_in_at: new Date().toISOString(),
                        app_metadata: {
                            provider: "email",
                            providers: ["email"]
                        },
                        user_metadata: {
                            first_name: "Usuario",
                            last_name: "Demo",
                            organization_id: "d3300000-0000-0000-0000-000000000001",
                            role: "representative"
                        },
                        identities: [],
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    },
                    expires_at: Math.floor(Date.now() / 1000) + 315360000
                };

                localStorage.setItem('sb-medivisit-auth-token', JSON.stringify(mockSession));

                setTimeout(() => {
                    window.location.href = '/demo/dashboard';
                }, 1000);
                return;
            }

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

    return (
        <div className="min-h-screen w-full flex bg-background font-sans relative overflow-hidden">
            {/* ─── LEFT PANEL (DESKTOP ONLY) ─── */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-card overflow-hidden flex-col justify-between p-12 xl:p-20 border-r border-white/5">
                {/* Background Blobs for Visual Depth */}
                <div className="absolute top-0 -left-4 w-96 h-96 bg-primary/20 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob" />
                <div className="absolute top-0 -right-4 w-96 h-96 bg-secondary/20 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob animation-delay-2000" />
                <div className="absolute -bottom-8 left-20 w-96 h-96 bg-primary/20 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob animation-delay-4000" />

                <div className="relative z-10 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-card/50 backdrop-blur-md shadow-premium-sm border border-white/10 flex items-center justify-center">
                        <img src={theme?.logo_url || "/favicon.svg"} className="w-8 h-8 object-contain" alt="Logo" />
                    </div>
                    <span className="text-2xl font-bold tracking-tight font-display bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                        {theme?.app_name || 'MediVisitPro'}
                    </span>
                </div>

                <div className="relative z-10 max-w-lg mx-auto w-full flex flex-col gap-6">
                    {/* The Allegorical Image */}
                    <div className="relative w-full aspect-[16/9] rounded-[2rem] overflow-hidden shadow-premium-2xl border border-white/10 mt-6 transform hover:scale-[1.02] transition-transform duration-700">
                        <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent z-10 mix-blend-multiply"></div>
                        <img 
                            src="/img/landing/hero-premium.png" 
                            alt="Representante Médico" 
                            className="object-cover object-top w-full h-full"
                        />
                    </div>

                    <div className="mt-4">
                        <h1 className="text-4xl xl:text-5xl font-extrabold tracking-tight font-display leading-[1.1] mb-6 text-foreground">
                            Gestión de <br />
                            <span className="text-primary">Clase Mundial.</span>
                        </h1>
                        <p className="text-lg text-muted-foreground leading-relaxed font-medium">
                            Controla tu fuerza de ventas, optimiza rutas en tiempo real y asegura el inventario médico con una precisión quirúrgica.
                        </p>
                        
                        <div className="mt-10 flex items-center gap-4">
                            <div className="flex -space-x-3">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="w-10 h-10 rounded-full border-2 border-card bg-muted flex items-center justify-center overflow-hidden shadow-sm">
                                        <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" />
                                    </div>
                                ))}
                            </div>
                            <div className="text-sm font-medium text-muted-foreground">
                                <span className="text-foreground font-bold">Confianza global</span> de <br/>líderes farmacéuticos.
                            </div>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 text-sm font-medium text-muted-foreground/60">
                    {theme?.texts?.footer_text || "© 2026 MediVisitPro · Master Framework"}
                </div>
            </div>

            {/* ─── RIGHT PANEL (LOGIN/SIGNUP) ─── */}
            <div className="flex-1 flex flex-col justify-center items-center p-6 lg:p-12 relative z-10">
                <SEO
                    title={`${theme?.texts?.login_welcome || "Acceso"} — ${theme?.app_name || "MediVisitPro"}`}
                    description="Accede a tu centro de gestión farmacéutica."
                />

                {/* Mobile Background Elements */}
                <div className="absolute top-[-10%] right-[-10%] w-[50%] aspect-square rounded-full bg-primary/10 blur-[120px] pointer-events-none lg:hidden" />
                
                <div className="w-full max-w-[420px] animate-in fade-in slide-in-from-bottom-4 duration-700">
                    
                    {/* Mobile Header (Hidden on Desktop) */}
                    <div className="flex flex-col items-center mb-8 lg:hidden">
                        <div className="w-14 h-14 rounded-2xl glass-elite shadow-premium-md border border-white/10 flex items-center justify-center mb-5">
                            <img src={theme?.logo_url || "/favicon.svg"} className="w-9 h-9 object-contain" alt="Logo" />
                        </div>
                        <h1 className="text-3xl font-extrabold tracking-tight font-display bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                            {theme?.app_name || 'MediVisitPro'}
                        </h1>
                        <p className="text-sm text-muted-foreground mt-2 text-center">
                            {theme?.texts?.login_hero_subtitle || "Bienvenido a tu panel de control."}
                        </p>
                    </div>

                    <div className="mb-8 hidden lg:block">
                        <h2 className="text-3xl font-extrabold tracking-tight font-display text-foreground mb-2">Bienvenido de nuevo</h2>
                        <p className="text-muted-foreground font-medium">Ingresa tus credenciales para acceder a tu entorno.</p>
                    </div>

                    {/* Main Auth Card */}
                    <div className="glass-elite border border-white/5 shadow-premium-xl rounded-2xl overflow-hidden bg-card/60 backdrop-blur-[40px]">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid w-full grid-cols-2 bg-transparent rounded-none border-b border-white/5 h-14 p-0">
                                <TabsTrigger
                                    value="login"
                                    className="rounded-none h-full text-sm font-semibold data-[state=active]:bg-card/40 data-[state=active]:text-primary data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-b-primary transition-all duration-300"
                                >
                                    Iniciar Sesión
                                </TabsTrigger>
                                <TabsTrigger
                                    value="signup"
                                    className="rounded-none h-full text-sm font-semibold data-[state=active]:bg-card/40 data-[state=active]:text-primary data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-b-primary transition-all duration-300"
                                >
                                    Registrarse
                                </TabsTrigger>
                            </TabsList>

                            <div className="p-8">
                                {/* LOGIN TAB */}
                                <TabsContent value="login" className="mt-0">
                                    <form onSubmit={handleLogin} className="space-y-5">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                                {theme?.texts?.login_form_email_label || "Correo Electrónico"}
                                            </Label>
                                            <div className="relative group">
                                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" strokeWidth={2} />
                                                <Input
                                                    type="email"
                                                    id="login-email"
                                                    placeholder="usuario@empresa.com"
                                                    value={loginEmail}
                                                    onChange={(e) => setLoginEmail(e.target.value)}
                                                    className="pl-10 h-12 text-base rounded-xl border-white/10 bg-black/5 dark:bg-white/5 focus:bg-card/80 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 shadow-inner"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                                    {theme?.texts?.login_form_password_label || "Contraseña"}
                                                </Label>
                                                <button
                                                    type="button"
                                                    className="text-xs font-bold text-primary hover:text-primary/80 transition-colors"
                                                    onClick={() => toast({ title: 'Recuperar contraseña', description: 'Contacta a tu administrador.' })}
                                                >
                                                    ¿Olvidaste tu contraseña?
                                                </button>
                                            </div>
                                            <div className="relative group">
                                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" strokeWidth={2} />
                                                <Input
                                                    type="password"
                                                    id="login-password"
                                                    placeholder="••••••••"
                                                    value={loginPassword}
                                                    onChange={(e) => setLoginPassword(e.target.value)}
                                                    className="pl-10 h-12 text-base rounded-xl border-white/10 bg-black/5 dark:bg-white/5 focus:bg-card/80 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 shadow-inner"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="pt-2">
                                            <Button
                                                type="submit"
                                                id="login-submit"
                                                className="w-full h-12 text-sm font-bold tracking-wide rounded-xl shadow-premium-md hover:shadow-premium-lg hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-300 group"
                                                disabled={loading}
                                            >
                                                {loading
                                                    ? <Loader2 className="h-5 w-5 animate-spin" />
                                                    : <span className="flex items-center gap-2">
                                                        {theme?.texts?.login_form_button || 'Iniciar Sesión'}
                                                        <Rocket className="h-4 w-4 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                                      </span>
                                                }
                                            </Button>
                                        </div>
                                    </form>
                                </TabsContent>

                                {/* SIGNUP TAB */}
                                <TabsContent value="signup" className="mt-0">
                                    <form onSubmit={handleSignup} className="space-y-5">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Nombre Completo</Label>
                                            <div className="relative group">
                                                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" strokeWidth={2} />
                                                <Input
                                                    id="signup-name"
                                                    placeholder="Tu nombre"
                                                    value={signupFullName}
                                                    onChange={(e) => setSignupFullName(e.target.value)}
                                                    className="pl-10 h-12 text-base rounded-xl border-white/10 bg-black/5 dark:bg-white/5 focus:bg-card/80 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 shadow-inner"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Correo Electrónico</Label>
                                            <div className="relative group">
                                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" strokeWidth={2} />
                                                <Input
                                                    id="signup-email"
                                                    type="email"
                                                    placeholder="email@empresa.com"
                                                    value={signupEmail}
                                                    onChange={(e) => setSignupEmail(e.target.value)}
                                                    className="pl-10 h-12 text-base rounded-xl border-white/10 bg-black/5 dark:bg-white/5 focus:bg-card/80 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 shadow-inner"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Contraseña</Label>
                                                <Input
                                                    id="signup-password"
                                                    type="password"
                                                    placeholder="••••••••"
                                                    value={signupPassword}
                                                    onChange={(e) => setSignupPassword(e.target.value)}
                                                    className="h-12 text-base rounded-xl border-white/10 bg-black/5 dark:bg-white/5 focus:bg-card/80 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 shadow-inner"
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Confirmar</Label>
                                                <Input
                                                    id="signup-confirm"
                                                    type="password"
                                                    placeholder="••••••••"
                                                    value={signupConfirmPassword}
                                                    onChange={(e) => setSignupConfirmPassword(e.target.value)}
                                                    className="h-12 text-base rounded-xl border-white/10 bg-black/5 dark:bg-white/5 focus:bg-card/80 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 shadow-inner"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="pt-2">
                                            <Button
                                                type="submit"
                                                id="signup-submit"
                                                className="w-full h-12 text-sm font-bold tracking-wide rounded-xl shadow-premium-md hover:shadow-premium-lg hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-300"
                                                disabled={loading}
                                            >
                                                {loading
                                                    ? <Loader2 className="h-5 w-5 animate-spin" />
                                                    : 'Crear Cuenta'
                                                }
                                            </Button>
                                        </div>
                                    </form>
                                </TabsContent>
                            </div>
                        </Tabs>
                    </div>

                    <p className="mt-8 text-center text-xs text-muted-foreground/60 font-medium lg:hidden">
                        {theme?.texts?.footer_text || "© 2026 MediVisitPro · Master Framework"}
                    </p>
                </div>
            </div>
        </div>
    );
}
