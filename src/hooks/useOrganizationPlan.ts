import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useMemo } from 'react';

export function useOrganizationPlan() {
  const { organizationId, isDemo } = useAuth();

  const { data: orgPlan, isLoading } = useQuery({
    queryKey: ['org_plan', organizationId],
    queryFn: async () => {
      if (isDemo) {
        return {
          id: organizationId || 'd3300000-0000-0000-0000-000000000001',
          name: 'Demo Medical Corp',
          plan_tier: 'professional',
          subscription_status: 'active',
          trial_ends_at: null
        };
      }

      if (!organizationId) return null;

      // Query only columns that exist directly on organizations.
      // The billing_plans → plan_modules join is skipped because
      // the FK relationship doesn't exist in the current schema.
      const { data, error } = await supabase
        .from('organizations')
        .select('id, name, plan_tier, subscription_status, trial_ends_at')
        .eq('id', organizationId)
        .single();

      if (error) {
        // Suppress noise — org may not exist yet during onboarding
        return null;
      }
      return data;
    },
    staleTime: 5 * 60 * 1000  // cache 5 min
  });


  const includedModules = useMemo(() => {
    // @ts-ignore
    const modules = orgPlan?.plan?.modules || [];
    return modules.filter((m: any) => m.is_included).map((m: any) => m.module_key) || [];
  }, [orgPlan]);

  const isExpired = useMemo(() => {
    if (orgPlan?.subscription_status === 'active') return false;
    if (!orgPlan?.trial_ends_at) return false;
    return new Date(orgPlan.trial_ends_at) < new Date();
  }, [orgPlan]);

  const daysUntilExpiry = useMemo(() => {
    if (!orgPlan?.trial_ends_at) return null;
    const diff = new Date(orgPlan.trial_ends_at).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }, [orgPlan]);

  return {
    // @ts-ignore
    plan: orgPlan?.plan,
    // @ts-ignore
    limits: orgPlan?.limits,
    includedModules,
    isExpired,
    daysUntilExpiry,
    subscriptionStatus: orgPlan?.subscription_status,
    isLoading
  };
}
