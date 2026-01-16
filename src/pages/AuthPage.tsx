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
            <div className="min-h-screen flex items-center justify-center bg-[#020617]">
                <Loader2 className="h-12 w-12 animate-spin text-emerald-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#020617] flex flex-col lg:flex-row overflow-hidden">
            {/* Left Side: Hero & Features */}
            <div className="hidden lg:flex flex-1 relative flex-col justify-center p-12 xl:p-24 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/20 via-blue-900/40 to-slate-900 z-0" />
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] -mr-48 -mt-48 animate-pulse" />

                <div className="relative z-10 max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-8">
                        <Zap className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Nueva Era en Visita Médica</span>
                    </div>

                    <h1 className="text-5xl xl:text-7xl font-extrabold text-white leading-tight mb-6">
                        Optimiza tu fuerza <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Comercial Médica</span>
                    </h1>

                    <p className="text-xl text-slate-400 mb-12 leading-relaxed">
                        Gestiona visitas, muestras, farmacias y análisis de mercado en una única plataforma diseñada para el éxito farmacéutico.
                    </p>

                    <div className="grid grid-cols-2 gap-8 mb-12">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-500/20 rounded-lg">
                                    <MapPin className="w-5 h-5 text-emerald-400" />
                                </div>
                                <span className="font-semibold text-white">Rutas Geocalizadas</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-500/20 rounded-lg">
                                    <PieChart className="w-5 h-5 text-blue-400" />
                                </div>
                                <span className="font-semibold text-white">Analytics Avanzado</span>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-500/20 rounded-lg">
                                    <Stethoscope className="w-5 h-5 text-purple-400" />
                                </div>
                                <span className="font-semibold text-white">Panel de Doctores</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-teal-500/20 rounded-lg">
                                    <CheckCircle2 className="w-5 h-5 text-teal-400" />
                                </div>
                                <span className="font-semibold text-white">Control de Muestras</span>
                            </div>
                        </div>
                    </div>

                    {/* Trust Badges */}
                    <div className="flex items-center gap-8 pt-8 border-t border-slate-800">
                        <div className="flex flex-col gap-1">
                            <ShieldCheck className="w-6 h-6 text-emerald-500/50" />
                            <span className="text-[10px] uppercase tracking-tighter text-slate-500 font-bold">HIPAA Compliant</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <Lock className="w-6 h-6 text-blue-500/50" />
                            <span className="text-[10px] uppercase tracking-tighter text-slate-500 font-bold">SSL Secure</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <Shield className="w-6 h-6 text-amber-500/50" />
                            <span className="text-[10px] uppercase tracking-tighter text-slate-500 font-bold">ISO 27001 Certified</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side: Auth Form */}
            <div className="flex-1 flex flex-col justify-center items-center p-6 lg:bg-slate-900/50 relative">
                <div className="w-full max-w-[420px] animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="lg:hidden text-center mb-12">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/25 mb-4">
                            <Stethoscope className="h-7 w-7 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">MediVisitPro</h1>
                    </div>

                    <div className="mb-8 hidden lg:block">
                        <h2 className="text-2xl font-bold text-white mb-2">Comienza ahora</h2>
                        <p className="text-slate-400">Ingresa tus credenciales para acceder al panel.</p>
                    </div>

                    {/* Demo Banner Button */}
                    <Button
                        onClick={handleDemoLogin}
                        className="w-full mb-8 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold h-14 rounded-xl shadow-xl shadow-emerald-500/10 border-b-4 border-emerald-800 transition-all hover:-translate-y-1 group relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12" />
                        <Rocket className="mr-3 w-5 h-5 animate-bounce" />
                        PROBAR DEMO EN VIVO
                        <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>

                    <div className="relative mb-8">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-slate-800" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-[#020617] lg:bg-transparent px-2 text-slate-500 font-medium">O accede con tu cuenta</span>
                        </div>
                    </div>

                    <Card className="border-slate-800 bg-slate-900/40 backdrop-blur-md shadow-2xl rounded-2xl overflow-hidden">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid w-full grid-cols-2 bg-slate-900/80 p-1 rounded-none border-b border-slate-800">
                                <TabsTrigger value="login" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white rounded-md text-slate-400 text-sm font-semibold">Login</TabsTrigger>
                                <TabsTrigger value="signup" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white rounded-md text-slate-400 text-sm font-semibold">Registro</TabsTrigger>
                            </TabsList>

                            <CardContent className="pt-6 pb-8">
                                <TabsContent value="login" className="mt-0 animate-in fade-in duration-300">
                                    <form onSubmit={handleLogin} className="space-y-5">
                                        <div className="space-y-2">
                                            <Label htmlFor="login-email" className="text-slate-300 text-xs font-bold uppercase tracking-wider">Email Corporativo</Label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                                <Input
                                                    id="login-email"
                                                    type="email"
                                                    placeholder="nombre@laboratorio.com"
                                                    value={loginEmail}
                                                    onChange={(e) => setLoginEmail(e.target.value)}
                                                    className="pl-10 h-12 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-600 focus:ring-emerald-500 rounded-xl"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="login-password" className="text-slate-300 text-xs font-bold uppercase tracking-wider">Contraseña</Label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                                <Input
                                                    id="login-password"
                                                    type="password"
                                                    placeholder="••••••••"
                                                    value={loginPassword}
                                                    onChange={(e) => setLoginPassword(e.target.value)}
                                                    className="pl-10 h-12 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-600 focus:ring-emerald-500 rounded-xl"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <Button type="submit" className="w-full bg-slate-100 hover:bg-white text-slate-900 font-bold h-12 rounded-xl transition-all shadow-lg" disabled={loading}>
                                            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Acceder al Sistema'}
                                        </Button>
                                    </form>
                                </TabsContent>

                                <TabsContent value="signup" className="mt-0 animate-in fade-in duration-300">
                                    <form onSubmit={handleSignup} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="signup-name" className="text-slate-300 text-xs font-bold">Nombre Completo</Label>
                                            <Input
                                                id="signup-name"
                                                placeholder="Ej: Manuel García"
                                                value={signupFullName}
                                                onChange={(e) => setSignupFullName(e.target.value)}
                                                className="bg-slate-800/50 border-slate-700 text-white h-11 rounded-lg"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="signup-email" className="text-slate-300 text-xs font-bold">Email</Label>
                                            <Input
                                                id="signup-email"
                                                type="email"
                                                placeholder="email@ejemplo.com"
                                                value={signupEmail}
                                                onChange={(e) => setSignupEmail(e.target.value)}
                                                className="bg-slate-800/50 border-slate-700 text-white h-11 rounded-lg"
                                                required
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="signup-password" className="text-slate-300 text-xs font-bold">Password</Label>
                                                <Input
                                                    id="signup-password"
                                                    type="password"
                                                    value={signupPassword}
                                                    onChange={(e) => setSignupPassword(e.target.value)}
                                                    className="bg-slate-800/50 border-slate-700 text-white h-11 rounded-lg"
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="signup-confirm" className="text-slate-300 text-xs font-bold">Confirma</Label>
                                                <Input
                                                    id="signup-confirm"
                                                    type="password"
                                                    value={signupConfirmPassword}
                                                    onChange={(e) => setSignupConfirmPassword(e.target.value)}
                                                    className="bg-slate-800/50 border-slate-700 text-white h-11 rounded-lg"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-11 rounded-lg mt-4 shadow-lg active:scale-95 transition-all" disabled={loading}>
                                            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Crear Cuenta'}
                                        </Button>
                                    </form>
                                </TabsContent>
                            </CardContent>
                        </Tabs>
                    </Card>

                    <p className="mt-8 text-center text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                        Al continuar, aceptas nuestros <strong>Términos de Servicio</strong> y la <strong>Política de Privacidad</strong> para el manejo de datos médicos.
                    </p>
                </div>
            </div>
        </div>
    );
}
