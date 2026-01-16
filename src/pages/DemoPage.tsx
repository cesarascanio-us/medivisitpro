import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Rocket, CheckCircle2, Sparkles } from 'lucide-react';
import { loginToDemo, createDemoWelcomeToast } from '@/lib/demoUtils';
import { useToast } from '@/hooks/use-toast';

export default function DemoPage() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState('Iniciando demo...');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const initializeDemo = async () => {
            // Progress animation
            const progressSteps = [
                { progress: 25, message: 'Preparando tu demo...', delay: 300 },
                { progress: 50, message: 'Cargando datos de ejemplo...', delay: 600 },
                { progress: 75, message: 'Configurando dashboard...', delay: 900 },
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
                    navigate('/dashboard', { replace: true });
                }, 500);
            } else {
                setError(result.error || 'No se pudo acceder a la demo');
                setProgress(0);
            }
        };

        initializeDemo();
    }, [navigate, toast]);

    const handleRetry = () => {
        setError(null);
        setProgress(0);
        window.location.reload();
    };

    if (error) {
        return (
            <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4">
                <div className="max-w-md w-full text-center space-y-6">
                    <div className="w-20 h-20 mx-auto rounded-full bg-red-500/10 flex items-center justify-center">
                        <Rocket className="w-10 h-10 text-red-500" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white mb-2">Error al Cargar Demo</h1>
                        <p className="text-slate-400">{error}</p>
                    </div>
                    <button
                        onClick={handleRetry}
                        className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition-colors"
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4">
            <div className="max-w-md w-full text-center space-y-8">
                {/* Animated Icon */}
                <div className="relative">
                    <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl animate-pulse" />
                    <div className="relative w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-2xl shadow-emerald-500/30">
                        <Rocket className="w-12 h-12 text-white animate-bounce" />
                    </div>
                </div>

                {/* Status Text */}
                <div className="space-y-3">
                    <h1 className="text-3xl font-bold text-white">
                        {status}
                    </h1>
                    <p className="text-slate-400">
                        Estamos preparando una experiencia increíble para ti
                    </p>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <p className="text-sm text-slate-500 font-mono">{progress}%</p>
                </div>

                {/* Feature Highlights */}
                <div className="grid grid-cols-3 gap-4 pt-8">
                    {[
                        { icon: CheckCircle2, label: 'Datos Reales' },
                        { icon: Sparkles, label: 'Sin Registro' },
                        { icon: Rocket, label: 'Acceso Instant áneo' }
                    ].map((feature, i) => (
                        <div
                            key={i}
                            className="flex flex-col items-center gap-2 opacity-0 animate-in fade-in slide-in-from-bottom-4"
                            style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'forwards' }}
                        >
                            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                <feature.icon className="w-5 h-5 text-emerald-400" />
                            </div>
                            <span className="text-xs text-slate-400">{feature.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
