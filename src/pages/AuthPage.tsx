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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
    Loader2,
    Stethoscope,
    Mail,
    Lock,
    User,
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

    const handleDemoLogin = async () => {
        setLoading(true);
        const demoEmail = 'demo.medivisitpro@gmail.com';
        const demoPass = 'demo123456';
        const demoOrgId = 'd3300000-0000-0000-0000-000000000001';

        try {
            console.log('Intentando login demo...', demoEmail);
            // 1. Intentar iniciar sesión
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: demoEmail,
                password: demoPass,
            });

            if (signInError) {
                console.warn('SignIn Error details:', signInError);

                // Si el error es que el usuario no existe, intentar registrarlo (Self-Healing)
                if (signInError.message?.toLowerCase().includes('invalid login credentials') ||
                    signInError.message?.toLowerCase().includes('no user found')) {

                    console.log('Usuario demo no encontrado, intentando registro automático...');
                    const { error: signUpError } = await supabase.auth.signUp({
                        email: demoEmail,
                        password: demoPass,
                        options: {
                            data: {
                                first_name: 'Usuario',
                                last_name: 'Demo',
                                organization_id: demoOrgId,
                                role: 'representative'
                            }
                        }
                    });

                    if (signUpError) {
                        console.error('SignUp Error details:', signUpError);
                        throw signUpError;
                    }

                    toast({
                        title: 'Modo Demo Inicializado',
                        description: 'La cuenta demo ha sido creada. Iniciando sesión...'
                    });
                } else {
                    throw signInError;
                }
            }

            // 2. Éxito
            toast({
                title: 'Modo Demo Activo',
                description: 'Explorando Demo Medical Corp con permisos de Representante.'
            });
            navigate('/dashboard');

        } catch (error: any) {
            console.error('Demo login error', error);
            toast({
                title: 'Error en Modo Demo',
                description: `No se pudo acceder a la demo: ${error.message || 'Error desconocido'}`,
                variant: 'destructive'
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
        <div className="min-h-screen bg-[#f8f9fa] flex flex-col lg:flex-row overflow-hidden font-sans">
            {/* Left Side: Hero & Features - Corporate Blue Gradient */}
            <div className="hidden lg:flex flex-1 relative flex-col justify-center p-12 xl:p-24 overflow-hidden bg-primary-dark">
                {/* Decorative Pattern / Mesh Gradient */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-secondary/20 rounded-full blur-[120px] -mr-48 -mt-48 animate-pulse" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[100px] -ml-32 -mb-32" />

                <div className="relative z-10 max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-full mb-10 backdrop-blur-sm">
                        <Zap className="w-4 h-4 text-secondary" />
                        <span className="text-xs font-bold text-white uppercase tracking-widest">Nueva Era en Visita Médica</span>
                    </div>

                    <h1 className="text-5xl xl:text-7xl font-bold text-white leading-tight mb-8">
                        Optimiza tu fuerza <br />
                        <span className="text-secondary">Comercial Médica</span>
                    </h1>

                    <p className="text-xl text-blue-100/80 mb-12 leading-relaxed font-medium">
                        Gestiona visitas, muestras, farmacias y análisis de mercado en una única plataforma diseñada para el éxito farmacéutico.
                    </p>

                    <div className="grid grid-cols-2 gap-10 mb-16">
                        <div className="space-y-6">
                            <div className="flex items-center gap-4 group">
                                <div className="p-3 bg-white/10 rounded-xl group-hover:bg-white/20 transition-colors">
                                    <MapPin className="w-6 h-6 text-secondary" />
                                </div>
                                <span className="font-semibold text-white text-lg">Rutas Geocalizadas</span>
                            </div>
                            <div className="flex items-center gap-4 group">
                                <div className="p-3 bg-white/10 rounded-xl group-hover:bg-white/20 transition-colors">
                                    <PieChart className="w-6 h-6 text-secondary" />
                                </div>
                                <span className="font-semibold text-white text-lg">Analytics Avanzado</span>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div className="flex items-center gap-4 group">
                                <div className="p-3 bg-white/10 rounded-xl group-hover:bg-white/20 transition-colors">
                                    <Stethoscope className="w-6 h-6 text-secondary" />
                                </div>
                                <span className="font-semibold text-white text-lg">Panel de Doctores</span>
                            </div>
                            <div className="flex items-center gap-4 group">
                                <div className="p-3 bg-white/10 rounded-xl group-hover:bg-white/20 transition-colors">
                                    <CheckCircle2 className="w-6 h-6 text-secondary" />
                                </div>
                                <span className="font-semibold text-white text-lg">Control de Muestras</span>
                            </div>
                        </div>
                    </div>

                    {/* Trust Badges */}
                    <div className="flex items-center gap-10 pt-10 border-t border-white/10">
                        <div className="flex flex-col gap-2 items-center opacity-70 hover:opacity-100 transition-opacity">
                            <ShieldCheck className="w-6 h-6 text-white" />
                            <span className="text-[10px] uppercase tracking-widest text-white/60 font-bold">HIPAA Compliant</span>
                        </div>
                        <div className="flex flex-col gap-2 items-center opacity-70 hover:opacity-100 transition-opacity">
                            <Lock className="w-6 h-6 text-white" />
                            <span className="text-[10px] uppercase tracking-widest text-white/60 font-bold">SSL Secure</span>
                        </div>
                        <div className="flex flex-col gap-2 items-center opacity-70 hover:opacity-100 transition-opacity">
                            <Shield className="w-6 h-6 text-white" />
                            <span className="text-[10px] uppercase tracking-widest text-white/60 font-bold">ISO 27001 Certified</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side: Auth Form - Clean Light Style */}
            <div className="flex-1 flex flex-col justify-center items-center p-6 bg-white lg:bg-[#f8f9fa] relative">
                <div className="w-full max-w-[440px] animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="lg:hidden text-center mb-12">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary shadow-lg shadow-primary/20 mb-4 transition-transform hover:scale-110">
                            <Stethoscope className="h-7 w-7 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-text-main tracking-tight">MediVisitPro</h1>
                    </div>

                    <div className="mb-10 hidden lg:block">
                        <h2 className="text-3xl font-bold text-text-main mb-3">Comienza ahora</h2>
                        <p className="text-text-muted text-lg font-medium">Ingresa tus credenciales para acceder al panel profesional.</p>
                    </div>

                    {/* Demo Banner Button - Primary Blue */}
                    <Button
                        onClick={handleDemoLogin}
                        className="w-full mb-10 bg-primary hover:bg-primary-dark text-white font-bold h-14 rounded-xl shadow-xl shadow-primary/10 transition-all hover:-translate-y-1 group relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12" />
                        <Rocket className="mr-3 w-5 h-5" />
                        PROBAR DEMO EN VIVO
                        <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>

                    <div className="relative mb-10">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-gray-200" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-[#f8f9fa] px-4 text-text-muted font-bold tracking-widest">O accede con tu cuenta</span>
                        </div>
                    </div>

                    <Card className="border-gray-200 bg-white shadow-2xl rounded-2xl overflow-hidden border-t-4 border-t-primary">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid w-full grid-cols-2 bg-gray-50 p-1 rounded-none border-b border-gray-100">
                                <TabsTrigger value="login" className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-md text-text-muted text-sm font-bold transition-all">Login</TabsTrigger>
                                <TabsTrigger value="signup" className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-md text-text-muted text-sm font-bold transition-all">Registro</TabsTrigger>
                            </TabsList>

                            <CardContent className="pt-8 pb-10">
                                <TabsContent value="login" className="mt-0 animate-in fade-in duration-300">
                                    <form onSubmit={handleLogin} className="space-y-6">
                                        <div className="space-y-3">
                                            <Label htmlFor="login-email" className="text-text-main text-sm font-bold uppercase tracking-wider opacity-80">Email Corporativo</Label>
                                            <div className="relative">
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                                <Input
                                                    id="login-email"
                                                    type="email"
                                                    placeholder="nombre@laboratorio.com"
                                                    value={loginEmail}
                                                    onChange={(e) => setLoginEmail(e.target.value)}
                                                    className="pl-12 h-14 bg-gray-50 border-gray-200 text-text-main placeholder:text-gray-400 focus:ring-primary focus:border-primary rounded-xl text-base transition-all"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <Label htmlFor="login-password" className="text-text-main text-sm font-bold uppercase tracking-wider opacity-80">Contraseña</Label>
                                            <div className="relative">
                                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                                <Input
                                                    id="login-password"
                                                    type="password"
                                                    placeholder="••••••••"
                                                    value={loginPassword}
                                                    onChange={(e) => setLoginPassword(e.target.value)}
                                                    className="pl-12 h-14 bg-gray-50 border-gray-200 text-text-main placeholder:text-gray-400 focus:ring-primary focus:border-primary rounded-xl text-base transition-all"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <Button type="submit" className="w-full bg-primary hover:bg-primary-dark text-white font-bold h-14 rounded-xl transition-all shadow-lg text-lg group" disabled={loading}>
                                            {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : (
                                                <span className="flex items-center gap-2">
                                                    Acceder al Sistema
                                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                                </span>
                                            )}
                                        </Button>
                                    </form>
                                </TabsContent>

                                <TabsContent value="signup" className="mt-0 animate-in fade-in duration-300">
                                    <form onSubmit={handleSignup} className="space-y-5">
                                        <div className="space-y-2">
                                            <Label htmlFor="signup-name" className="text-text-main text-xs font-bold uppercase tracking-wider opacity-80">Nombre Completo</Label>
                                            <Input
                                                id="signup-name"
                                                placeholder="Ej: Manuel García"
                                                value={signupFullName}
                                                onChange={(e) => setSignupFullName(e.target.value)}
                                                className="bg-gray-50 border-gray-200 text-text-main h-12 rounded-xl focus:ring-primary"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="signup-email" className="text-text-main text-xs font-bold uppercase tracking-wider opacity-80">Email</Label>
                                            <Input
                                                id="signup-email"
                                                type="email"
                                                placeholder="email@ejemplo.com"
                                                value={signupEmail}
                                                onChange={(e) => setSignupEmail(e.target.value)}
                                                className="bg-gray-50 border-gray-200 text-text-main h-12 rounded-xl focus:ring-primary"
                                                required
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="signup-password" className="text-text-main text-xs font-bold uppercase tracking-wider opacity-80">Password</Label>
                                                <Input
                                                    id="signup-password"
                                                    type="password"
                                                    value={signupPassword}
                                                    onChange={(e) => setSignupPassword(e.target.value)}
                                                    className="bg-gray-50 border-gray-200 text-text-main h-12 rounded-xl focus:ring-primary"
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="signup-confirm" className="text-text-main text-xs font-bold uppercase tracking-wider opacity-80">Confirma</Label>
                                                <Input
                                                    id="signup-confirm"
                                                    type="password"
                                                    value={signupConfirmPassword}
                                                    onChange={(e) => setSignupConfirmPassword(e.target.value)}
                                                    className="bg-gray-50 border-gray-200 text-text-main h-12 rounded-xl focus:ring-primary"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <Button type="submit" className="w-full bg-primary hover:bg-primary-dark text-white font-bold h-12 rounded-xl mt-6 shadow-lg active:scale-95 transition-all" disabled={loading}>
                                            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Crear Cuenta'}
                                        </Button>
                                    </form>
                                </TabsContent>
                            </CardContent>
                        </Tabs>
                    </Card>

                    <p className="mt-10 text-center text-xs text-text-muted leading-relaxed max-w-xs mx-auto font-medium">
                        Al continuar, aceptas nuestros <strong className="text-primary cursor-pointer hover:underline">Términos de Servicio</strong> y la <strong className="text-primary cursor-pointer hover:underline">Política de Privacidad</strong> para el manejo de datos médicos.
                    </p>
                </div>
            </div>
        </div>
    );
}
