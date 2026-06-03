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
        <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-muted/30 font-sans">
            <SEO
                title={`${theme?.texts?.login_welcome || "Acceso"} — ${theme?.app_name || "MediVisitPro"}`}
                description="Accede a tu centro de gestión farmacéutica."
            />

            <div className="w-full max-w-[420px]">
                {/* Header Logo */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-12 h-12 rounded-xl bg-card shadow-sm border border-border flex items-center justify-center mb-4">
                        <img src={theme?.logo_url || "/favicon.svg"} className="w-8 h-8 object-contain" alt="Logo" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        {theme?.app_name || 'MediVisitPro'}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1 text-center">
                        {theme?.texts?.login_hero_subtitle || "Controla tu fuerza de ventas, rutas y muestras médicas."}
                    </p>
                </div>

                {/* Main Card */}
                <div className="bg-card border border-border shadow-premium-xl rounded-xl overflow-hidden">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 bg-muted/50 rounded-none border-b border-border h-12 p-0">
                            <TabsTrigger
                                value="login"
                                className="rounded-none h-full text-xs font-semibold data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-none border-r border-border data-[state=active]:border-b-2 data-[state=active]:border-b-primary"
                            >
                                Iniciar Sesión
                            </TabsTrigger>
                            <TabsTrigger
                                value="signup"
                                className="rounded-none h-full text-xs font-semibold data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-b-primary"
                            >
                                Registrarse
                            </TabsTrigger>
                        </TabsList>

                        <div className="p-6">
                            {/* LOGIN TAB */}
                            <TabsContent value="login" className="mt-0">
                                <form onSubmit={handleLogin} className="space-y-5">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-medium text-foreground">
                                            {theme?.texts?.login_form_email_label || "Correo Electrónico"}
                                        </Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                                            <Input
                                                type="email"
                                                id="login-email"
                                                placeholder="usuario@empresa.com"
                                                value={loginEmail}
                                                onChange={(e) => setLoginEmail(e.target.value)}
                                                className="pl-9 h-10 text-sm border-border focus:border-primary"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs font-medium text-foreground">
                                            {theme?.texts?.login_form_password_label || "Contraseña"}
                                        </Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                                            <Input
                                                type="password"
                                                id="login-password"
                                                placeholder="••••••••"
                                                value={loginPassword}
                                                onChange={(e) => setLoginPassword(e.target.value)}
                                                className="pl-9 h-10 text-sm border-border focus:border-primary"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-end">
                                        <button
                                            type="button"
                                            className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                                            onClick={() => toast({ title: 'Recuperar contraseña', description: 'Contacta a tu administrador.' })}
                                        >
                                            ¿Olvidaste tu contraseña?
                                        </button>
                                    </div>

                                    <Button
                                        type="submit"
                                        id="login-submit"
                                        className="w-full h-10 text-sm font-semibold"
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
                                <form onSubmit={handleSignup} className="space-y-5">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-medium text-foreground">Nombre Completo</Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                                            <Input
                                                id="signup-name"
                                                placeholder="Tu nombre completo"
                                                value={signupFullName}
                                                onChange={(e) => setSignupFullName(e.target.value)}
                                                className="pl-9 h-10 text-sm border-border focus:border-primary"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs font-medium text-foreground">Correo Electrónico</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                                            <Input
                                                id="signup-email"
                                                type="email"
                                                placeholder="email@empresa.com"
                                                value={signupEmail}
                                                onChange={(e) => setSignupEmail(e.target.value)}
                                                className="pl-9 h-10 text-sm border-border focus:border-primary"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-medium text-foreground">Contraseña</Label>
                                            <Input
                                                id="signup-password"
                                                type="password"
                                                placeholder="••••••••"
                                                value={signupPassword}
                                                onChange={(e) => setSignupPassword(e.target.value)}
                                                className="h-10 text-sm border-border focus:border-primary"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-medium text-foreground">Confirmar</Label>
                                            <Input
                                                id="signup-confirm"
                                                type="password"
                                                placeholder="••••••••"
                                                value={signupConfirmPassword}
                                                onChange={(e) => setSignupConfirmPassword(e.target.value)}
                                                className="h-10 text-sm border-border focus:border-primary"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        id="signup-submit"
                                        className="w-full h-10 text-sm font-semibold"
                                        disabled={loading}
                                    >
                                        {loading
                                            ? <Loader2 className="h-4 w-4 animate-spin" />
                                            : 'Crear Cuenta'
                                        }
                                    </Button>
                                </form>
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>

                {/* Direct Demo Bypass Access */}
                <div className="mt-4">
                    <Button
                        variant="outline"
                        onClick={() => window.location.href = '/#contacto'}
                        className="w-full h-10 text-xs font-extrabold border-dashed border-primary/40 hover:border-primary/80 hover:bg-primary/5 transition-all text-primary flex items-center justify-center gap-2 shadow-sm rounded-xl"
                    >
                        <Rocket className="h-4.5 w-4.5 animate-pulse" />
                        Solicitar Acceso a Demo
                    </Button>
                </div>

                {/* Footer */}
                <p className="mt-8 text-center text-xs text-muted-foreground font-medium">
                    {theme?.texts?.footer_text || "© 2026 MediVisitPro · Master Framework"}
                </p>
            </div>
        </div>
    );
}
