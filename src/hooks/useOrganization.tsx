import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Organization, PlanTier, SubscriptionStatus } from '@/types/organization';

interface OrganizationContextType {
    organization: Organization | null;
    isLoading: boolean;
    error: Error | null;
    isOrgAdmin: boolean;
    refetch: () => Promise<void>;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

const DEMO_ORG_ID = 'd3300000-0000-0000-0000-000000000001';
const DEMO_ORG = {
    id: DEMO_ORG_ID,
    name: 'Demo Medical Corp',
    slug: 'demo-medivisitpro',
    plan_tier: 'professional',
    subscription_status: 'active',
    onboarding_completed: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
};

export function OrganizationProvider({ children }: { children: ReactNode }) {
    const [organization, setOrganization] = useState<Organization | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [isOrgAdmin, setIsOrgAdmin] = useState(false);

    const fetchOrganization = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setOrganization(null);
                setIsOrgAdmin(false);
                return;
            }

            // [STRICT FAIL-SAFE] Demo & Master Bypass
            // We check this BEFORE any DB call to avoid "Infinite Recursion" RLS errors
            const lowerEmail = user.email?.trim().toLowerCase();
            if (lowerEmail === 'demo.medivisitpro@gmail.com') {
                console.log('AuthProvider: Modo Demo detectado (Bypass RLS activo)');
                setOrganization(DEMO_ORG as any);
                setIsOrgAdmin(false);
                setIsLoading(false);
                return;
            }

            if (lowerEmail === 'cesar.ascanio@gmail.com') {
                console.log('AuthProvider: Usuario Master detectado (Bypass RLS activo)');
                setOrganization(DEMO_ORG as any); // Use Demo Org as placeholder for Master to avoid errors
                setIsOrgAdmin(true);
                setIsLoading(false);
                return;
            }

            // Get profile with organization - Check both tables for resilience
            const [{ data: profile }, { data: userRole }] = await Promise.all([
                supabase
                    .from('profiles')
                    .select('organization_id, is_org_admin')
                    .eq('id', user.id)
                    .maybeSingle(),
                supabase
                    .from('user_roles')
                    .select('organization_id')
                    .eq('user_id', user.id)
                    .maybeSingle()
            ]);

            let organizationId = profile?.organization_id || userRole?.organization_id;

            // Fail-safe for Demo User
            if (user.email === 'demo.medivisitpro@gmail.com') {
                setOrganization(DEMO_ORG as any);
                setIsOrgAdmin(false);
                setIsLoading(false);
                return;
            }

            if (!organizationId) {
                setOrganization(null);
                setIsOrgAdmin(false);
                return;
            }

            setIsOrgAdmin(profile?.is_org_admin || false);

            // Get organization details
            const { data: org, error: orgError } = await supabase
                .from('organizations')
                .select('*')
                .eq('id', organizationId)
                .maybeSingle();

            if (orgError) {
                console.warn('Organization fetch error:', orgError);
                setOrganization(null);
                return;
            }

            setOrganization(org as Organization);
        } catch (err) {
            console.error('Error fetching organization:', err);
            setError(err instanceof Error ? err : new Error('Failed to fetch organization'));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOrganization();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
            fetchOrganization();
        });

        return () => subscription.unsubscribe();
    }, []);

    return (
        <OrganizationContext.Provider value={{
            organization,
            isLoading,
            error,
            isOrgAdmin,
            refetch: fetchOrganization
        }}>
            {children}
        </OrganizationContext.Provider>
    );
}

export function useOrganization() {
    const context = useContext(OrganizationContext);
    if (context === undefined) {
        throw new Error('useOrganization must be used within an OrganizationProvider');
    }
    return context;
}

// Hook to get just the organization ID (commonly needed)
export function useOrganizationId(): string | null {
    const { organization } = useOrganization();
    return organization?.id ?? null;
}

// Hook to check subscription status
export function useSubscriptionStatus(): {
    isActive: boolean;
    status: SubscriptionStatus | null;
    planTier: PlanTier | null;
    isTrialing: boolean;
    trialEndsAt: Date | null;
} {
    const { organization } = useOrganization();

    if (!organization) {
        return {
            isActive: false,
            status: null,
            planTier: null,
            isTrialing: false,
            trialEndsAt: null
        };
    }

    const isTrialing = organization.subscription_status === 'trialing';
    const isActive = organization.subscription_status === 'active' || isTrialing;

    return {
        isActive,
        status: organization.subscription_status,
        planTier: organization.plan_tier,
        isTrialing,
        trialEndsAt: organization.trial_ends_at ? new Date(organization.trial_ends_at) : null
    };
}

// Hook to check if user has access to a feature
export function useFeatureAccess(feature: string): boolean {
    const { organization } = useOrganization();

    if (!organization) return false;

    // Import plan limits dynamically to avoid circular dependencies
    const PLAN_FEATURES: Record<PlanTier, string[]> = {
        free: ['basic_visits', 'basic_reports'],
        starter: ['basic_visits', 'basic_reports', 'sample_tracking', 'export_data'],
        professional: ['basic_visits', 'basic_reports', 'sample_tracking', 'export_data', 'advanced_analytics', 'api_access'],
        enterprise: ['basic_visits', 'basic_reports', 'sample_tracking', 'export_data', 'advanced_analytics', 'api_access', 'custom_integrations', 'dedicated_support', 'sso']
    };

    const features = PLAN_FEATURES[organization.plan_tier] || [];
    return features.includes(feature);
}
