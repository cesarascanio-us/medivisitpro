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

export function useAppRoles() {
    return useQuery({
        queryKey: ['app_roles'],
        queryFn: async () => {
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
