import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AppRole {
    id: string;
    slug: string;
    name: string;
    description: string | null;
    is_system: boolean;
    color: string;
}

const MOCK_ROLES: AppRole[] = [
    { id: '1', slug: 'master', name: 'Master', description: 'Acceso total de superadministrador', is_system: true, color: '#FF5555' },
    { id: '2', slug: 'admin', name: 'Administrador', description: 'Administrador de la organización', is_system: true, color: '#3B82F6' },
    { id: '3', slug: 'manager', name: 'Gerente', description: 'Gerente comercial', is_system: true, color: '#10B981' },
    { id: '4', slug: 'representative', name: 'Visitador Médico', description: 'Representante de ventas', is_system: true, color: '#8B5CF6' },
    { id: '5', slug: 'supervisor', name: 'Supervisor', description: 'Supervisor de zona', is_system: true, color: '#F59E0B' }
];

export function useAppRoles() {
    return useQuery({
        queryKey: ['app_roles'],
        queryFn: async () => {
            const isDemo = typeof window !== 'undefined' && (
                window.location.pathname.startsWith('/demo') || 
                window.location.pathname.includes('/demo') ||
                localStorage.getItem('sb-medivisit-auth-token')?.includes('"email":"demo.medivisitpro@gmail.com"')
            );

            if (isDemo) {
                console.log('[useAppRoles] Offline Demo Mode active. Returning mock roles...');
                return MOCK_ROLES;
            }

            const { data, error } = await supabase
                .from('app_roles')
                .select('*')
                .order('created_at', { ascending: true });
            
            if (error) {
                console.error('Error fetching app roles:', error);
                throw error;
            }
            
            return (data || []) as AppRole[];
        },
        staleTime: 1000 * 60 * 60 // 1 hour
    });
}
