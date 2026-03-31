/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Building2, Users, Calendar, Briefcase, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useOrganization } from '@/hooks/useOrganization';

interface OnboardingData {
    companyName: string;
    industry: string;
    teamSize: string;
    userRole: string;
    primaryGoal: string;
}

const INDUSTRIES = [
    'Farmacéutica',
    'Dispositivos Médicos',
    'Suplementos Nutricionales',
    'Cosméticos',
    'Otro'
];

const TEAM_SIZES = [
    '1-5 representantes',
    '6-15 representantes',
    '16-50 representantes',
    '50+ representantes'
];

const GOALS = [
    'Organizar visitas médicas',
    'Gestionar muestras médicas',
    'Seguimiento de farmacias',
    'Control de inventario',
    'Todo lo anterior'
];

export const OnboardingWizard: React.FC = () => {
    const navigate = useNavigate();
    const { profile, isMaster } = useAuth();
    const { organization } = useOrganization();
    const [step, setStep] = useState(1);

    // [UI BYPASS] Demo & Master should NEVER be here
    React.useEffect(() => {
        const isDemo = profile?.organization_id === 'd3300000-0000-0000-0000-000000000001';
        if (isMaster || isDemo || organization) {
            console.log('OnboardingWizard: Redirecting authorized user to dashboard', { isMaster, isDemo, organization });
            navigate('/dashboard', { replace: true });
        }
    }, [isMaster, profile, organization, navigate]);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<OnboardingData>({
        companyName: '',
        industry: '',
        teamSize: '',
        userRole: 'admin',
        primaryGoal: ''
    });
    const { toast } = useToast();

    const totalSteps = 4;
    const progress = (step / totalSteps) * 100;

    const updateData = (field: keyof OnboardingData, value: string) => {
        setData(prev => ({ ...prev, [field]: value }));
    };

    const canProceed = () => {
        switch (step) {
            case 1: return data.companyName.length > 2;
            case 2: return data.industry !== '';
            case 3: return data.teamSize !== '';
            case 4: return data.primaryGoal !== '';
            default: return true;
        }
    };

    const handleComplete = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('No user found');

            // Create organization
            const slug = data.companyName
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');

            const { data: org, error: orgError } = await supabase
                .from('organizations')
                .insert({
                    name: data.companyName,
                    slug: slug,
                    plan_tier: 'free',
                    subscription_status: 'trialing',
                    onboarding_completed: true,
                    settings: {
                        industry: data.industry,
                        teamSize: data.teamSize,
                        primaryGoal: data.primaryGoal,
                        onboardingCompleted: true
                    }
                })
                .select()
                .single();

            if (orgError) throw orgError;

            // Update user profile with organization
            const { error: profileError } = await supabase
                .from('profiles')
                .update({
                    organization_id: org.id,
                    is_org_admin: true
                })
                .eq('id', user.id);

            if (profileError) throw profileError;

            // Create user role
            const { error: roleError } = await supabase
                .from('user_roles')
                .insert({
                    user_id: user.id,
                    role: 'admin',
                    organization_id: org.id,
                    is_active: true
                });

            if (roleError) throw roleError;

            // Trigger seed data function
            try {
                const { error: seedError } = await supabase.functions.invoke('seed-tenant-data', {
                    body: {
                        organization_id: org.id,
                        user_id: user.id
                    }
                });

                if (seedError) {
                    console.warn('Seed data warning:', seedError);
                    // We don't throw here to allow the user to continue even if seeding fails
                }
            } catch (seedCatch) {
                console.warn('Seed data catch error:', seedCatch);
            }

            toast({
                title: '¡Bienvenido a MediVisitPro!',
                description: 'Tu organización ha sido creada y configurada con datos iniciales.',
            });

            navigate('/dashboard');
        } catch (error: any) {
            console.error('Onboarding error:', error);
            toast({
                title: 'Error',
                description: error.message || 'Error al completar el onboarding',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />

            <Card className="w-full max-w-xl relative z-10 bg-slate-800/90 backdrop-blur-xl border-slate-700/50 shadow-2xl">
                <CardHeader className="text-center pb-2">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30">
                        <Briefcase className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-white">
                        Configura tu cuenta
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                        Paso {step} de {totalSteps}
                    </CardDescription>
                    <Progress value={progress} className="mt-4 h-2" />
                </CardHeader>

                <CardContent className="space-y-6 pt-4">
                    {step === 1 && (
                        <div className="space-y-4 animate-fadeIn">
                            <div className="text-center mb-6">
                                <Building2 className="w-12 h-12 mx-auto text-blue-400 mb-3" />
                                <h3 className="text-xl font-semibold text-white">¿Cómo se llama tu empresa?</h3>
                                <p className="text-slate-400 text-sm mt-1">Nombre de tu laboratorio o empresa farmacéutica</p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="company" className="text-slate-300">Nombre de la empresa</Label>
                                <Input
                                    id="company"
                                    placeholder="Ej: Laboratorios ABC"
                                    value={data.companyName}
                                    onChange={(e) => updateData('companyName', e.target.value)}
                                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4 animate-fadeIn">
                            <div className="text-center mb-6">
                                <Briefcase className="w-12 h-12 mx-auto text-cyan-400 mb-3" />
                                <h3 className="text-xl font-semibold text-white">¿En qué industria operas?</h3>
                                <p className="text-slate-400 text-sm mt-1">Esto nos ayuda a personalizar tu experiencia</p>
                            </div>
                            <div className="grid gap-2">
                                {INDUSTRIES.map((industry) => (
                                    <Button
                                        key={industry}
                                        variant={data.industry === industry ? 'default' : 'outline'}
                                        className={`justify-start h-12 ${data.industry === industry
                                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                            : 'bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-700'
                                            }`}
                                        onClick={() => updateData('industry', industry)}
                                    >
                                        {data.industry === industry && <CheckCircle2 className="w-4 h-4 mr-2" />}
                                        {industry}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-4 animate-fadeIn">
                            <div className="text-center mb-6">
                                <Users className="w-12 h-12 mx-auto text-emerald-400 mb-3" />
                                <h3 className="text-xl font-semibold text-white">¿Cuántos representantes tienes?</h3>
                                <p className="text-slate-400 text-sm mt-1">Tamaño de tu fuerza de ventas</p>
                            </div>
                            <div className="grid gap-2">
                                {TEAM_SIZES.map((size) => (
                                    <Button
                                        key={size}
                                        variant={data.teamSize === size ? 'default' : 'outline'}
                                        className={`justify-start h-12 ${data.teamSize === size
                                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                            : 'bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-700'
                                            }`}
                                        onClick={() => updateData('teamSize', size)}
                                    >
                                        {data.teamSize === size && <CheckCircle2 className="w-4 h-4 mr-2" />}
                                        {size}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="space-y-4 animate-fadeIn">
                            <div className="text-center mb-6">
                                <Calendar className="w-12 h-12 mx-auto text-purple-400 mb-3" />
                                <h3 className="text-xl font-semibold text-white">¿Cuál es tu objetivo principal?</h3>
                                <p className="text-slate-400 text-sm mt-1">¿Qué quieres lograr con MediVisitPro?</p>
                            </div>
                            <div className="grid gap-2">
                                {GOALS.map((goal) => (
                                    <Button
                                        key={goal}
                                        variant={data.primaryGoal === goal ? 'default' : 'outline'}
                                        className={`justify-start h-12 ${data.primaryGoal === goal
                                            ? 'bg-purple-600 hover:bg-purple-700 text-white'
                                            : 'bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-700'
                                            }`}
                                        onClick={() => updateData('primaryGoal', goal)}
                                    >
                                        {data.primaryGoal === goal && <CheckCircle2 className="w-4 h-4 mr-2" />}
                                        {goal}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Navigation */}
                    <div className="flex justify-between pt-4">
                        <Button
                            variant="ghost"
                            onClick={() => setStep(s => Math.max(1, s - 1))}
                            disabled={step === 1}
                            className="text-slate-400 hover:text-white"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Anterior
                        </Button>

                        {step < totalSteps ? (
                            <Button
                                onClick={() => setStep(s => s + 1)}
                                disabled={!canProceed()}
                                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                            >
                                Siguiente
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        ) : (
                            <Button
                                onClick={handleComplete}
                                disabled={!canProceed() || loading}
                                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                            >
                                {loading ? 'Creando...' : 'Comenzar'}
                                <CheckCircle2 className="w-4 h-4 ml-2" />
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default OnboardingWizard;
