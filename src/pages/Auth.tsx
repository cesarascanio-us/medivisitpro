import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Activity } from 'lucide-react';

const Auth = () => {
    const [loading, setLoading] = useState(false);
    const { signIn, signUp } = useAuth();
    const navigate = useNavigate();

    // Login state
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

    // Signup state
    const [signupNombre, setSignupNombre] = useState('');
    const [signupEmail, setSignupEmail] = useState('');
    const [signupPassword, setSignupPassword] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await signIn(loginEmail, loginPassword);

            if (error) {
                if (error.message.includes('Invalid login credentials')) {
                    toast.error('Credenciales inválidas. Verifica tu email y contraseña.');
                } else {
                    toast.error(error.message);
                }
                return;
            }

            toast.success('¡Bienvenido!');
            navigate('/dashboard');
        } catch (error: any) {
            toast.error('Error al iniciar sesión');
        } finally {
            setLoading(false);
        }
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await signUp(signupEmail, signupPassword, signupNombre);

            if (error) {
                if (error.message.includes('already registered')) {
                    toast.error('Este email ya está registrado. Intenta iniciar sesión.');
                } else {
                    toast.error(error.message);
                }
                return;
            }

            toast.success('¡Cuenta creada exitosamente!');
            navigate('/dashboard');
        } catch (error: any) {
            toast.error('Error al crear cuenta');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-subtle p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-primary mb-4 shadow-lg">
                        <Activity className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <h1 className="text-3xl font-bold text-foreground mb-2">MedVisitPro</h1>
                    <p className="text-muted-foreground">Gestión inteligente de visitas médicas</p>
                </div>

                <Card className="border-border/50 shadow-xl">
                    <CardHeader>
                        <CardTitle>Acceso al Sistema</CardTitle>
                        <CardDescription>Inicia sesión o crea una nueva cuenta</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="login" className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
                                <TabsTrigger value="signup">Registrarse</TabsTrigger>
                            </TabsList>

                            <TabsContent value="login">
                                <form onSubmit={handleLogin} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="login-email">Email</Label>
                                        <Input
                                            id="login-email"
                                            type="email"
                                            placeholder="tu@email.com"
                                            value={loginEmail}
                                            onChange={(e) => setLoginEmail(e.target.value)}
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="login-password">Contraseña</Label>
                                        <Input
                                            id="login-password"
                                            type="password"
                                            placeholder="••••••••"
                                            value={loginPassword}
                                            onChange={(e) => setLoginPassword(e.target.value)}
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
                                        disabled={loading}
                                    >
                                        {loading ? 'Iniciando...' : 'Iniciar Sesión'}
                                    </Button>
                                </form>
                            </TabsContent>

                            <TabsContent value="signup">
                                <form onSubmit={handleSignup} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="signup-nombre">Nombre Completo</Label>
                                        <Input
                                            id="signup-nombre"
                                            type="text"
                                            placeholder="Juan Pérez"
                                            value={signupNombre}
                                            onChange={(e) => setSignupNombre(e.target.value)}
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="signup-email">Email</Label>
                                        <Input
                                            id="signup-email"
                                            type="email"
                                            placeholder="tu@email.com"
                                            value={signupEmail}
                                            onChange={(e) => setSignupEmail(e.target.value)}
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="signup-password">Contraseña</Label>
                                        <Input
                                            id="signup-password"
                                            type="password"
                                            placeholder="••••••••"
                                            value={signupPassword}
                                            onChange={(e) => setSignupPassword(e.target.value)}
                                            required
                                            disabled={loading}
                                            minLength={6}
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        className="w-full bg-gradient-accent hover:opacity-90 transition-opacity"
                                        disabled={loading}
                                    >
                                        {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
                                    </Button>
                                </form>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Auth;
