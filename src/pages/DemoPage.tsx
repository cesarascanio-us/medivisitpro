/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, Rocket, CheckCircle2, Sparkles, ArrowLeft } from 'lucide-react';
import { loginToDemo, createDemoWelcomeToast } from '@/lib/demoUtils';
import { useToast } from '@/hooks/use-toast';
import { DemoRegistrationForm } from '@/components/demo/DemoRegistrationForm';

export default function DemoPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { toast } = useToast();
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState('Verificando acceso...');
    const [error, setError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);

    const code = searchParams.get('code');

    useEffect(() => {
        // Si no hay código en la URL, mostramos el formulario de registro
        if (!code) {
            setShowForm(true);
            return;
        }

        const initializeDemo = async () => {
            // Progress animation
            const progressSteps = [
                { progress: 25, message: 'Validando código de acceso...', delay: 300 },
                { progress: 50, message: 'Preparando tu entorno...', delay: 600 },
                { progress: 75, message: 'Cargando datos de ejemplo...', delay: 900 },
                { progress: 100, message: '¡Listo! Redirigiendo...', delay: 1200 }
            ];

            // Animate progress
            for (const step of progressSteps) {
                await new Promise(resolve => setTimeout(resolve, step.delay));
                setProgress(step.progress);
                setStatus(step.message);
            }

            // Perform actual login
            const result = await loginToDemo();

            if (result.success) {
                // Show success toast
                createDemoWelcomeToast(toast);

                // Redirect to dashboard
                setTimeout(() => {
                    navigate('/demo/dashboard', { replace: true });
                }, 500);
            } else {
                setError(result.error || 'No se pudo acceder a la demo');
                setProgress(0);
            }
        };

        initializeDemo();
    }, [navigate, toast, code]);

    const handleRetry = () => {
        setError(null);
        setProgress(0);
        window.location.reload();
    };

    // Si no hay código y no hay error, mostramos el formulario
    if (showForm && !code) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
                {/* Back button to landing */}
                <button 
                    onClick={() => navigate('/')}
                    className="absolute top-8 left-8 flex items-center gap-2 text-slate-400 hover:text-primary transition-colors font-bold uppercase tracking-[0.2em] text-[10px]"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Regresar a Inicio
                </button>

                <DemoRegistrationForm onSuccess={() => {
                    // Después de registrarse, podríamos esperar a que n8n mande el mail
                    // o redirigir a una página de "Pendiente"
                }} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-4">
                <div className="max-w-md w-full text-center space-y-6">
                    <div className="w-20 h-20 mx-auto rounded-full bg-red-50 flex items-center justify-center">
                        <Rocket className="w-10 h-10 text-red-500" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-text-main mb-2">Error al Cargar Demo</h1>
                        <p className="text-text-muted">{error}</p>
                    </div>
                    <button
                        onClick={handleRetry}
                        className="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg font-semibold transition-colors shadow-lg"
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-4">
            <div className="max-w-md w-full text-center space-y-8">
                {/* Animated Icon */}
                <div className="relative">
                    <div className="absolute inset-0 bg-primary/10 rounded-full blur-2xl animate-pulse" />
                    <div className="relative w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center shadow-xl shadow-primary/20">
                        <Rocket className="w-12 h-12 text-white animate-bounce" />
                    </div>
                </div>

                {/* Status Text */}
                <div className="space-y-3">
                    <h1 className="text-3xl font-extrabold text-text-main tracking-tight">
                        {status}
                    </h1>
                    <p className="text-text-muted font-medium">
                        Estamos preparando una experiencia increíble para ti
                    </p>
                </div>

                {/* Progress Bar */}
                <div className="space-y-3">
                    <div className="h-3 bg-muted rounded-full overflow-hidden shadow-inner">
                        <div
                            className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500 ease-out shadow-[0_0_10px_rgba(0,86,179,0.3)]"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <p className="text-sm text-primary font-black font-mono">{progress}%</p>
                </div>

                {/* Feature Highlights */}
                <div className="grid grid-cols-3 gap-4 pt-8">
                    {[
                        { icon: CheckCircle2, label: 'Datos Reales' },
                        { icon: Sparkles, label: 'Sin Registro' },
                        { icon: Rocket, label: 'Instantáneo' }
                    ].map((feature, i) => (
                        <div
                            key={i}
                            className="flex flex-col items-center gap-2 opacity-0 animate-in fade-in slide-in-from-bottom-4"
                            style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'forwards' }}
                        >
                            <div className="w-12 h-12 rounded-2xl bg-card border border-border shadow-soft flex items-center justify-center">
                                <feature.icon className="w-6 h-6 text-primary" />
                            </div>
                            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{feature.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
