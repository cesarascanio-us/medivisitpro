import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function usePermissions() {
  const { profile, organizationId, isDemo } = useAuth();
  // Safe extraction of role (we assume profile.role if it's there or userRole string from elsewhere)
  const userRole = profile?.role || 'representative'; 
  const orgRoleId = profile?.org_role_id || null;

  const { data: permissions, isLoading } = useQuery({
    queryKey: ['user_permissions', profile?.id, organizationId],
    queryFn: async () => {
      // Si es demo o master → todos los permisos de inmediato
      if (isDemo || profile?.is_master) {
          return { all: true, codes: new Set<string>() };
      }

      // 2. Obtener permisos del rol base del sistema
      const { data: basePerms } = await supabase
        .from('role_permissions')
        .select('permission_code')
        .eq('role_slug', userRole);

      const codes = new Set(basePerms?.map(p => p.permission_code) || []);

      // 3. Si tiene rol personalizado, combinar con permisos de la org
      if (orgRoleId) {
          const { data: orgPerms } = await supabase
            .from('org_role_permissions')
            .select('permission_code, granted')
            .eq('org_role_id', orgRoleId);

          // 4. Merge: permisos base + overrides de la org
          orgPerms?.forEach(p => {
            if (p.granted) codes.add(p.permission_code);
            else codes.delete(p.permission_code);  // org puede revocar permisos base
          });
      }

      return { all: false, codes };
    },
    enabled: !!profile?.id // Solo ejecuta si el usuario está cargado
  });

  // Obtenemos los módulos del plan desde la base de datos de forma dinámica
  const { data: orgModules } = useQuery({
    queryKey: ['org_modules', organizationId],
    queryFn: async () => {
      if (!organizationId) return [] as string[];

      const { data, error } = await supabase
        .from('organizations')
        .select('plan_tier')
        .eq('id', organizationId)
        .maybeSingle();

      if (error || !data) {
        console.error('Error fetching org plan_tier:', error);
        return [] as string[];
      }

      const tier = data.plan_tier || 'starter';
      const { DEFAULT_PLAN_MODULES } = await import('@/config/systemModules');
      return DEFAULT_PLAN_MODULES[tier] || DEFAULT_PLAN_MODULES['starter'];
    },
    enabled: !!organizationId && !isDemo
  });


  const can = (permission: string): boolean => {
    if (!permissions) return false;
    if (permissions.all) return true;
    return permissions.codes.has(permission);
  };

  const canAccessModule = (moduleKey: string): boolean => {
    // Si es master o demo, puede ver todo
    if (profile?.is_master || isDemo) return true;
    
    // Verifica si el plan de la organización incluye este módulo
    if (orgModules && orgModules.length > 0) {
      return orgModules.includes(moduleKey);
    }

    // Fallback: Si el usuario tiene el permiso en su rol, lo permitimos
    if (can(moduleKey)) return true;

    // Fallback global en caso de que la tabla de planes no esté lista
    const basicModules = [
      'visits', 'doctors', 'agenda', 'pharmacies', 'documents', 
      'zones', 'sales_pipeline', 'transfers', 'pmbok',
      'expenses', 'objectives', 'sample_banks'
    ];
    return basicModules.includes(moduleKey);
  };

  return { 
      can, 
      canAccessModule, 
      isLoading: isLoading || (!!organizationId && !orgModules && !isDemo) 
  };
}
