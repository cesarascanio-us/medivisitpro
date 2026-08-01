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
import { cn } from '@/lib/utils';

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
        <div className="min-h-screen bg-muted/20 flex items-center justify-center p-4 relative overflow-hidden font-sans">
            {/* Ambient Background Light Blobs */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] aspect-square rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[55%] aspect-square rounded-full bg-secondary/5 blur-[150px] pointer-events-none" />
            <div className="absolute top-[20%] right-[10%] w-[35%] aspect-square rounded-full bg-primary/3 blur-[90px] pointer-events-none" />

            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03] pointer-events-none" />

            <Card className="w-full max-w-xl relative z-10 bg-card/75 backdrop-blur-xl border border-border/50 shadow-premium-xl rounded-2xl overflow-hidden animate-in fade-in duration-500">
                <CardHeader className="text-center pb-2">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-primary/10 hover:scale-105 transition-transform duration-300">
                        <Briefcase className="w-7 h-7 text-primary-foreground" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-foreground">
                        Configura tu cuenta
                    </CardTitle>
                    <CardDescription className="text-muted-foreground font-medium">
                        Paso {step} de {totalSteps}
                    </CardDescription>
                    <Progress value={progress} className="mt-4 h-2 bg-muted transition-all duration-300" />
                </CardHeader>

                <CardContent className="space-y-6 pt-4">
                    {step === 1 && (
                        <div className="space-y-4 animate-in fade-in duration-300">
                            <div className="text-center mb-6">
                                <Building2 className="w-10 h-10 mx-auto text-primary mb-3" />
                                <h3 className="text-xl font-bold text-foreground">¿Cómo se llama tu empresa?</h3>
                                <p className="text-muted-foreground text-sm mt-1">Nombre de tu laboratorio o empresa farmacéutica</p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="company" className="text-xs font-semibold text-foreground uppercase tracking-wider">Nombre de la empresa</Label>
                                <Input
                                    id="company"
                                    placeholder="Ej: Laboratorios ABC"
                                    value={data.companyName}
                                    onChange={(e) => updateData('companyName', e.target.value)}
                                    className="bg-card/45 border-border text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                                />
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4 animate-in fade-in duration-300">
                            <div className="text-center mb-6">
                                <Briefcase className="w-10 h-10 mx-auto text-primary mb-3" />
                                <h3 className="text-xl font-bold text-foreground">¿En qué industria operas?</h3>
                                <p className="text-muted-foreground text-sm mt-1">Esto nos ayuda a personalizar tu experiencia</p>
                            </div>
                            <div className="grid gap-2">
                                {INDUSTRIES.map((industry) => {
                                    const isSelected = data.industry === industry;
                                    return (
                                        <Button
                                            key={industry}
                                            variant={isSelected ? 'default' : 'outline'}
                                            className={cn(
                                                "justify-start h-12 rounded-xl text-sm font-semibold uppercase tracking-wider transition-all duration-200 active:scale-[0.99]",
                                                isSelected
                                                    ? 'bg-primary hover:bg-primary/95 text-white shadow-premium-sm border-transparent'
                                                    : 'bg-card/45 border-border/60 text-muted-foreground hover:bg-accent/40 hover:text-primary hover:border-primary/20'
                                            )}
                                            onClick={() => updateData('industry', industry)}
                                        >
                                            {isSelected ? <CheckCircle2 className="w-4 h-4 mr-2 text-white" /> : <div className="w-4 h-4 mr-2 border border-muted-foreground/40 rounded-full" />}
                                            {industry}
                                        </Button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-4 animate-in fade-in duration-300">
                            <div className="text-center mb-6">
                                <Users className="w-10 h-10 mx-auto text-secondary mb-3" />
                                <h3 className="text-xl font-bold text-foreground">¿Cuántos representantes tienes?</h3>
                                <p className="text-muted-foreground text-sm mt-1">Tamaño de tu fuerza de ventas</p>
                            </div>
                            <div className="grid gap-2">
                                {TEAM_SIZES.map((size) => {
                                    const isSelected = data.teamSize === size;
                                    return (
                                        <Button
                                            key={size}
                                            variant={isSelected ? 'default' : 'outline'}
                                            className={cn(
                                                "justify-start h-12 rounded-xl text-sm font-semibold uppercase tracking-wider transition-all duration-200 active:scale-[0.99]",
                                                isSelected
                                                    ? 'bg-secondary hover:bg-secondary/95 text-white shadow-premium-sm border-transparent'
                                                    : 'bg-card/45 border-border/60 text-muted-foreground hover:bg-accent/40 hover:text-secondary hover:border-secondary/20'
                                            )}
                                            onClick={() => updateData('teamSize', size)}
                                        >
                                            {isSelected ? <CheckCircle2 className="w-4 h-4 mr-2 text-white" /> : <div className="w-4 h-4 mr-2 border border-muted-foreground/40 rounded-full" />}
                                            {size}
                                        </Button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="space-y-4 animate-in fade-in duration-300">
                            <div className="text-center mb-6">
                                <Calendar className="w-10 h-10 mx-auto text-primary mb-3" />
                                <h3 className="text-xl font-bold text-foreground">¿Cuál es tu objetivo principal?</h3>
                                <p className="text-muted-foreground text-sm mt-1">¿Qué quieres lograr con MediVisitPro?</p>
                            </div>
                            <div className="grid gap-2">
                                {GOALS.map((goal) => {
                                    const isSelected = data.primaryGoal === goal;
                                    return (
                                        <Button
                                            key={goal}
                                            variant={isSelected ? 'default' : 'outline'}
                                            className={cn(
                                                "justify-start h-12 rounded-xl text-sm font-semibold uppercase tracking-wider transition-all duration-200 active:scale-[0.99]",
                                                isSelected
                                                    ? 'bg-primary hover:bg-primary/95 text-white shadow-premium-sm border-transparent'
                                                    : 'bg-card/45 border-border/60 text-muted-foreground hover:bg-accent/40 hover:text-primary hover:border-primary/20'
                                            )}
                                            onClick={() => updateData('primaryGoal', goal)}
                                        >
                                            {isSelected ? <CheckCircle2 className="w-4 h-4 mr-2 text-white" /> : <div className="w-4 h-4 mr-2 border border-muted-foreground/40 rounded-full" />}
                                            {goal}
                                        </Button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Navigation */}
                    <div className="flex justify-between pt-4 border-t border-border/50">
                        <Button
                            variant="ghost"
                            onClick={() => setStep(s => Math.max(1, s - 1))}
                            disabled={step === 1}
                            className="text-muted-foreground hover:text-foreground hover:bg-muted"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Anterior
                        </Button>

                        {step < totalSteps ? (
                            <Button
                                onClick={() => setStep(s => s + 1)}
                                disabled={!canProceed()}
                                className="bg-primary hover:bg-primary/90 text-white rounded-xl shadow-premium-sm hover:shadow-premium-md transition-all active:scale-[0.98] font-bold uppercase tracking-widest text-[10px]"
                            >
                                Siguiente
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        ) : (
                            <Button
                                onClick={handleComplete}
                                disabled={!canProceed() || loading}
                                className="bg-secondary hover:bg-secondary/90 text-white rounded-xl shadow-premium-sm hover:shadow-premium-md transition-all active:scale-[0.98] font-bold uppercase tracking-widest text-[10px]"
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
