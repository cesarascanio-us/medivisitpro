import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Organization, PlanTier, SubscriptionStatus } from '@/types/organization';

interface OrganizationContextType {
    organization: Organization | null;
    allOrganizations: Organization[];
    isLoading: boolean;
    error: Error | null;
    isOrgAdmin: boolean;
    isMaster: boolean;
    switchOrganization: (orgId: string) => Promise<void>;
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

const MASTER_EMAIL = 'cesar.ascanio@gmail.com';

export function OrganizationProvider({ children }: { children: ReactNode }) {
    const [organization, setOrganization] = useState<Organization | null>(null);
    const [allOrganizations, setAllOrganizations] = useState<Organization[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [isOrgAdmin, setIsOrgAdmin] = useState(false);
    const [isMaster, setIsMaster] = useState(false);

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

            // [STRICT FAIL-SAFE] Demo Bypass
            const lowerEmail = user.email?.trim().toLowerCase();
            if (lowerEmail === 'demo.medivisitpro@gmail.com') {
                console.log('AuthProvider: Modo Demo detectado (Bypass RLS activo)');
                setOrganization(DEMO_ORG as any);
                setAllOrganizations([DEMO_ORG as any]);
                setIsOrgAdmin(false);
                setIsLoading(false);
                return;
            }

            // Check if Master
            const isMasterUser = lowerEmail === MASTER_EMAIL;
            setIsMaster(isMasterUser);

            // Get profile and role data
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

            setIsOrgAdmin(profile?.is_org_admin || false);

            if (isMasterUser) {
                // MASTER FLOW: Load ALL organizations
                const { data: allOrgs, error: allOrgsError } = await supabase
                    .from('organizations')
                    .select('*')
                    .order('name');
                
                if (allOrgsError) console.error('Error fetching all orgs for master:', allOrgsError);
                
                const orgs = allOrgs || [];
                setAllOrganizations(orgs);

                // Determine which org to show initially
                // 1. If we have a stored preference or previous state, use that (TODO: Persist)
                // 2. Otherwise use their "assigned" org
                // 3. Fallback to first available
                const assignedOrgId = profile?.organization_id || userRole?.organization_id;
                
                // If we already have an organization selected in state (e.g. from switching), keep it if valid
                // Otherwise default to assigned
                if (!organization) {
                    const initialOrg = orgs.find(o => o.id === assignedOrgId) || orgs[0];
                    setOrganization(initialOrg || null);
                }
            } else {
                // NORMAL USER FLOW
                let organizationId = profile?.organization_id || userRole?.organization_id;

                if (!organizationId) {
                    setOrganization(null);
                    setAllOrganizations([]);
                    return;
                }

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
                setAllOrganizations(org ? [org as Organization] : []);
            }

        } catch (err) {
            console.error('Error fetching organization:', err);
            setError(err instanceof Error ? err : new Error('Failed to fetch organization'));
        } finally {
            setIsLoading(false);
        }
    };

    // Allow manual switching of organization (context only)
    const switchOrganization = async (orgId: string) => {
        if (!isMaster) return; // Only master can switch
        
        const targetOrg = allOrganizations.find(o => o.id === orgId);
        if (targetOrg) {
            setOrganization(targetOrg);
            // Optional: Persist this choice to localStorage so it survives reload
            localStorage.setItem('medivisit_master_active_org', orgId);
            
            // Reload window to ensure all queries re-run with new ID? 
            // Better to rely on React state updates flushing down.
            // But since 'organizationId' hook reads from this context, it should trigger re-renders.
            toast.success(`Organización cambiada a: ${targetOrg.name}`);
        }
    };

    useEffect(() => {
        fetchOrganization();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
            fetchOrganization();
        });

        return () => subscription.unsubscribe();
    }, []);

    return (
        <OrganizationContext.Provider value={{
            organization,
            allOrganizations,
            isLoading,
            error,
            isOrgAdmin,
            isMaster,
            switchOrganization,
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