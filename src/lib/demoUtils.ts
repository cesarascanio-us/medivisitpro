/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Demo constants
export const DEMO_EMAIL = 'demo.medivisitpro@gmail.com';
export const DEMO_PASSWORD = 'demo123456';
export const DEMO_ORG_ID = 'd3300000-0000-0000-0000-000000000001';

/**
 * Logs into the demo account programmatically
 * Creates the account if it doesn't exist (self-healing)
 */
export const loginToDemo = async (): Promise<{ success: boolean; error?: string }> => {
    try {
        console.log('[Demo] Attempting demo login...');

        // Attempt to sign in
        const { error: signInError } = await supabase.auth.signInWithPassword({
            email: DEMO_EMAIL,
            password: DEMO_PASSWORD,
        });

        if (signInError) {
            console.warn('[Demo] Sign in failed:', signInError.message);

            // If user doesn't exist, create it (self-healing)
            if (
                signInError.message?.toLowerCase().includes('invalid login credentials') ||
                signInError.message?.toLowerCase().includes('no user found')
            ) {
                console.log('[Demo] User not found, creating demo account...');

                const { error: signUpError } = await supabase.auth.signUp({
                    email: DEMO_EMAIL,
                    password: DEMO_PASSWORD,
                    options: {
                        data: {
                            first_name: 'Usuario',
                            last_name: 'Demo',
                            organization_id: DEMO_ORG_ID,
                            role: 'representative'
                        }
                    }
                });

                if (signUpError) {
                    console.error('[Demo] Account creation failed:', signUpError);
                    return {
                        success: false,
                        error: `No se pudo crear la cuenta demo: ${signUpError.message}`
                    };
                }

                console.log('[Demo] Demo account created successfully');
                return { success: true };
            }

            // Other sign-in errors
            return {
                success: false,
                error: signInError.message
            };
        }

        console.log('[Demo] Login successful');
        return { success: true };

    } catch (error: any) {
        console.error('[Demo] Unexpected error:', error);
        return {
            success: false,
            error: error.message || 'Error desconocido'
        };
    }
};

/**
 * Check if the current session is a demo session
 */
export const isDemoSession = (email?: string | null): boolean => {
    if (!email) return false;
    return email.toLowerCase().trim() === DEMO_EMAIL.toLowerCase();
};

/**
 * Create a standardized welcome toast for demo mode
 */
export const createDemoWelcomeToast = (toast: ReturnType<typeof useToast>['toast']) => {
    toast({
        title: '🚀 Modo Demo Activo',
        description: 'Explorando MediVisitPro con datos de ejemplo. ¡Descubre todas las funcionalidades!',
        duration: 5000,
    });
};
