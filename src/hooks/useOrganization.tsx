/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Organization, PlanTier, SubscriptionStatus } from '@/types/organization';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface OrganizationContextType {
    organization: Organization | null;
    allOrganizations: Organization[];
    planFeatures: string[]; // NEW
    isLoading: boolean;
    error: Error | null;
    isOrgAdmin: boolean;
    isMaster: boolean;
    isSaaSStaff: boolean; // NEW
    switchOrganization: (orgId: string) => Promise<void>;
    refetch: () => Promise<void>;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

const DEMO_ORG_ID = 'd3300000-0000-0000-0000-000000000001';
const DEMO_ORG: Organization = {
    id: DEMO_ORG_ID,
    name: 'Demo Medical Corp',
    slug: 'demo-medivisitpro',
    plan_tier: 'professional',
    subscription_status: 'active',
    onboarding_completed: true,
    is_system_owner: false,
    logo_url: null,
    stripe_customer_id: null,
    stripe_subscription_id: null,
    trial_ends_at: null,
    settings: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
};

const DEMO_FEATURES = [
    'basic_visits', 'advanced_reports', 'smart_agenda', 'sample_tracking', 'export_data', 'offline_sync', 'unlimited_doctors'
];

export function OrganizationProvider({ children }: { children: ReactNode }) {
    const { enterAuditMode, exitAuditMode } = useAuth();
    const [organization, setOrganization] = useState<Organization | null>(null);
    const [allOrganizations, setAllOrganizations] = useState<Organization[]>([]);
    const [planFeatures, setPlanFeatures] = useState<string[]>([]); // NEW
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [isOrgAdmin, setIsOrgAdmin] = useState(false);
    const [isMaster, setIsMaster] = useState(false);
    const [isSaaSStaff, setIsSaaSStaff] = useState(false); // NEW

    const fetchOrganization = async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Bypassear en modo demo para evitar timeouts de Supabase y caídas offline
            const isDemo = typeof window !== 'undefined' && (
                window.location.pathname.startsWith('/demo') || 
                window.location.pathname.includes('/demo') ||
                localStorage.getItem('sb-medivisit-auth-token')?.includes('"email":"demo.medivisitpro@gmail.com"')
            );

            if (isDemo) {
                console.log('[useOrganization] Offline Demo Mode active. Bypassing Supabase fetch...');
                setOrganization(DEMO_ORG);
                setAllOrganizations([DEMO_ORG]);
                setPlanFeatures(DEMO_FEATURES);
                setIsOrgAdmin(true);
                setIsMaster(false);
                setIsSaaSStaff(false);
                setIsLoading(false);
                return;
            }

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setOrganization(null);
                setIsOrgAdmin(false);
                setPlanFeatures([]);
                return;
            }

            let isMasterUser = false;

            // 1. Get profile and role data
            const [{ data: profile }, { data: userRole }] = await Promise.all([
                supabase
                    .from('profiles')
                    .select('company_id, organization_id, is_org_admin')
                    .eq('user_id', user.id)
                    .maybeSingle(),
                supabase
                    .from('user_roles')
                    .select('company_id, organization_id, role')
                    .eq('user_id', user.id)
                    .maybeSingle()
            ]);

            const userRoleName = userRole?.role || 'representative';
            const saasRoles = ['master', 'admin_saas', 'soporte_saas', 'desarrollo_saas'];
            
            // SECURITY CHECK: Verify master status via RPC as source of truth
            const { data: rpcIsMaster } = await supabase.rpc('is_system_master');
            
            const isActuallyMaster = userRoleName === 'master' || rpcIsMaster === true;
            const isActuallySaaSStaff = saasRoles.includes(userRoleName) || rpcIsMaster === true;

            console.log('[useOrganization] Security Check:', { 
                roleTable: userRoleName, 
                rpcCheck: rpcIsMaster, 
                finalIsMaster: isActuallyMaster 
            });

            setIsMaster(isActuallyMaster);
            setIsSaaSStaff(isActuallySaaSStaff);

            setIsOrgAdmin(
                profile?.is_org_admin ||
                userRoleName === 'admin' ||
                userRoleName === 'manager' ||
                isActuallySaaSStaff
            );

            let currentOrg: Organization | null = null;
            let currentOrgsList: Organization[] = [];

            if (isActuallySaaSStaff) {
                try {
                    const { data: allOrgs, error: orgsError } = await supabase
                        .from('organizations')
                        .select('id, name, slug, plan_tier, subscription_status, settings, onboarding_completed, is_system_owner')
                        .order('name');

                    if (orgsError) {
                        console.error('CRITICAL: RLS Block on organizations table:', orgsError);
                        // Don't throw here, just log and keep going with empty list
                        // This prevents the whole hook from breaking
                    } else if (allOrgs) {
                        const orgs = allOrgs.map(o => ({
                            ...o,
                            plan_tier: o.plan_tier as PlanTier,
                            subscription_status: o.subscription_status as SubscriptionStatus,
                            is_system_owner: !!(o as any).is_system_owner
                        })) as Organization[];

                        currentOrgsList = orgs;

                        const savedOrgId = localStorage.getItem('medivisit_master_active_org');
                        const assignedOrgId = profile?.organization_id || userRole?.organization_id;

                        currentOrg = orgs.find(o => o.id === savedOrgId) ||
                            orgs.find(o => o.id === assignedOrgId) ||
                            orgs.find(o => o.is_system_owner) ||
                            orgs[0] || null;
                    }
                } catch (orgFetchErr) {
                    console.error('Failed to fetch organizations list:', orgFetchErr);
                }
            } else {
                let organizationId = profile?.organization_id || userRole?.organization_id;
                if (organizationId) {
                    const { data: org } = await supabase
                        .from('organizations')
                        .select('id, name, slug, plan_tier, subscription_status, settings, onboarding_completed, is_system_owner')
                        .eq('id', organizationId)
                        .maybeSingle();

                    if (org) {
                        currentOrg = {
                            ...org,
                            plan_tier: org.plan_tier as PlanTier,
                            subscription_status: org.subscription_status as SubscriptionStatus,
                            is_system_owner: !!(org as any).is_system_owner
                        } as Organization;
                        currentOrgsList = [currentOrg];
                    }
                }
            }

            setOrganization(currentOrg);
            setAllOrganizations(currentOrgsList);

            // FETCH FEATURES DYNAMICALLY
            if (currentOrg) {
                try {
                    const { data: planData } = await (supabase as any)
                        .from('subscription_plans')
                        .select('features')
                        .ilike('name', `%${currentOrg.plan_tier}%`)
                        .eq('active', true)
                        .maybeSingle();

                    if (planData) {
                        setPlanFeatures((planData.features as unknown as string[]) || []);
                    } else {
                        setPlanFeatures(['basic_visits', 'basic_reports']);
                    }
                } catch (featureErr) {
                    setPlanFeatures(['basic_visits', 'basic_reports']);
                }
            } else {
                setPlanFeatures([]);
            }

        } catch (err) {
            console.error('Error in useOrganization flow:', err);
            setError(err instanceof Error ? err : new Error('Failed to fetch organization'));
            setPlanFeatures(['basic_visits', 'basic_reports']);
        } finally {
            setIsLoading(false);
        }
    };

    // Allow manual switching of organization (context only)
    const switchOrganization = async (orgId: string) => {
        if (!isSaaSStaff) return; // All staff can switch

        const targetOrg = allOrganizations.find(o => o.id === orgId);
        if (targetOrg) {
            setOrganization(targetOrg);
            localStorage.setItem('medivisit_master_active_org', orgId);
            await enterAuditMode(orgId);
            fetchOrganization(); // Re-fetch to update features
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
            planFeatures,
            isLoading,
            error,
            isOrgAdmin,
            isMaster,
            isSaaSStaff,
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
    const { organization, planFeatures, isMaster } = useOrganization();

    if (isMaster) return true;

    if (!organization) return false;

    // Master has access to everything
    if (organization.plan_tier === 'enterprise' || planFeatures.includes('all_features')) {
        return true;
    }

    return planFeatures.includes(feature) || planFeatures.some(f => f.toLowerCase() === feature.toLowerCase());
}
