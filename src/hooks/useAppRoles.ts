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
    { id: '1', slug: 'admin', name: 'Administrador', description: 'Control total de la organización', is_system: true, color: '#0B5C6E' },
    { id: '2', slug: 'gerente', name: 'Gerente', description: 'Master de su organización — visión y control total', is_system: true, color: '#1D4ED8' },
    { id: '3', slug: 'jefe', name: 'Jefe Regional', description: 'Control de múltiples zonas y supervisores', is_system: true, color: '#6D28D9' },
    { id: '4', slug: 'coordinador', name: 'Coordinador', description: 'Coordina y aprueba rutas en oficina', is_system: true, color: '#B45309' },
    { id: '5', slug: 'supervisor', name: 'Supervisor', description: 'Supervisión de campo (Coaching)', is_system: true, color: '#15803D' },
    { id: '6', slug: 'rep_comercial', name: 'Rep. Comercial', description: 'Visita farmacias y droguerías (B2B)', is_system: true, color: '#0369A1' },
    { id: '7', slug: 'visitador_medico', name: 'Visitador Médico', description: 'Visita médicos (Generación Demanda)', is_system: true, color: '#047857' },
    { id: '8', slug: 'rep_integral', name: 'Rep. Integral', description: 'Visita farmacias y médicos (Híbrido)', is_system: true, color: '#6B21A8' },
    { id: '9', slug: 'telemarketing', name: 'Telemarketing', description: 'Venta telefónica y recordatorios', is_system: true, color: '#BE123C' },
    { id: '10', slug: 'farmacia', name: 'Farmacia', description: 'Portal B2B (Compras directas)', is_system: true, color: '#0F766E' },
    { id: '11', slug: 'medico', name: 'Médico', description: 'Portal Médico (Educación y Muestras)', is_system: true, color: '#1D4ED8' },
    { id: '12', slug: 'compras', name: 'Compras Inst.', description: 'Portal B2B (Licitaciones clínicas)', is_system: true, color: '#374151' }
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
