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

export const loginToDemo = async (): Promise<{ success: boolean; error?: string }> => {
    try {
        console.log('[Demo] Attempting demo login...');

        // Attempt to sign in using real Supabase
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

            // Fallback for other sign-in errors (including connection/network errors)
            console.log('[Demo] Other error encountered, attempting local offline mock session bypass...');
            return triggerOfflineSessionBypass();
        }

        console.log('[Demo] Login successful');
        return { success: true };

    } catch (error: any) {
        console.error('[Demo] Unexpected error, attempting local offline mock session bypass:', error);
        return triggerOfflineSessionBypass();
    }
};

/**
 * Bypasses Supabase Auth by setting a mock session directly in localStorage
 * and redirecting using window.location.href to /demo/dashboard.
 */
const triggerOfflineSessionBypass = (): { success: boolean; error?: string } => {
    try {
        console.log('[Demo] Setting local offline session mock in localStorage...');
        const mockSession = {
            access_token: "mock-jwt-token-for-local-demo-purposes",
            token_type: "bearer",
            expires_in: 315360000, // 10 years
            refresh_token: "mock-refresh-token",
            user: {
                id: "d3300000-0000-0000-0000-000000000001",
                aud: "authenticated",
                role: "authenticated",
                email: DEMO_EMAIL,
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
                    organization_id: DEMO_ORG_ID,
                    role: "representative"
                },
                identities: [],
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            },
            expires_at: Math.floor(Date.now() / 1000) + 315360000
        };

        // Write directly to the Supabase client storage key
        localStorage.setItem('sb-medivisit-auth-token', JSON.stringify(mockSession));
        
        console.log('[Demo] Local session stored. Redirecting...');
        
        // Force full page load redirect to dashboard so AuthProvider picks up the session
        setTimeout(() => {
            window.location.href = '/demo/dashboard';
        }, 100);

        return { success: true };
    } catch (e: any) {
        console.error('[Demo] Failed to trigger offline bypass:', e);
        return {
            success: false,
            error: e.message || 'No se pudo configurar la sesión sin conexión'
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
