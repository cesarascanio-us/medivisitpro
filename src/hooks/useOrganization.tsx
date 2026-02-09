import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Organization, PlanTier, SubscriptionStatus } from '@/types/organization';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

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



export function OrganizationProvider({ children }: { children: ReactNode }) {
    const { enterAuditMode, exitAuditMode } = useAuth();
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

            // Let isMaster be determined by the actual role in the database
            let isMasterUser = false;

            // Get profile and role data
            const [{ data: profile }, { data: userRole }] = await Promise.all([
                supabase
                    .from('profiles')
                    .select('organization_id, is_org_admin')
                    .eq('id', user.id)
                    .maybeSingle(),
                supabase
                    .from('user_roles')
                    .select('organization_id, role')
                    .eq('user_id', user.id)
                    .maybeSingle()
            ]);

            const userRoleName = userRole?.role || 'representative';
            isMasterUser = userRoleName === 'master';
            setIsMaster(isMasterUser);

            // Access control: admins and managers are considered org admins
            setIsOrgAdmin(
                profile?.is_org_admin ||
                userRoleName === 'admin' ||
                userRoleName === 'manager' ||
                isMasterUser
            );

            if (isMasterUser) {
                // MASTER FLOW: Load ALL organizations
                const { data: allOrgs, error: allOrgsError } = await supabase
                    .from('organizations')
                    .select('*')
                    .order('name');

                if (allOrgsError) console.error('Error fetching all orgs for master:', allOrgsError);

                const orgs = (allOrgs || []).map(o => ({
                    ...o,
                    plan_tier: o.plan_tier as PlanTier,
                    subscription_status: o.subscription_status as SubscriptionStatus
                })) as Organization[];
                setAllOrganizations(orgs);

                const assignedOrgId = profile?.organization_id || userRole?.organization_id;

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

                const typedOrg = org ? {
                    ...org,
                    plan_tier: org.plan_tier as PlanTier,
                    subscription_status: org.subscription_status as SubscriptionStatus
                } as Organization : null;

                setOrganization(typedOrg);
                setAllOrganizations(typedOrg ? [typedOrg] : []);
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
            localStorage.setItem('medivisit_master_active_org', orgId);

            // SYNC: Update AuthProvider to reflect this org change
            await enterAuditMode(orgId);

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
        free: ['basic_visits', 'basic_reports', 'smart_agenda'],
        starter: ['basic_visits', 'basic_reports', 'smart_agenda', 'sample_tracking', 'export_data'],
        professional: ['basic_visits', 'advanced_reports', 'smart_agenda', 'sample_tracking', 'export_data', 'offline_sync', 'unlimited_doctors'],
        enterprise: ['all_features', 'advanced_reports', 'smart_agenda', 'sample_tracking', 'export_data', 'offline_sync', 'unlimited_doctors', 'kpi_analytics', 'geolocalization', 'team_management', 'api_access', 'custom_integrations', 'sso']
    };

    const features = PLAN_FEATURES[organization.plan_tier] || [];
    return features.includes(feature);
}