/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import { ReactNode, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useOrganization } from '@/hooks/useOrganization';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
    children: ReactNode;
    allowedRoles?: string[]; // New optional prop
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const { user, loading, isMaster, role, isFieldRep } = useAuth();
    const { organization, isLoading: orgLoading } = useOrganization();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {

        if (!loading && !user) {
            navigate('/auth', { replace: true });
        } else if (!loading && user && !orgLoading) {
            const isAtOnboarding = location.pathname === '/onboarding';

            if (!organization && !isAtOnboarding && !isMaster) {
                // Modified behavior: Allow access to Dashboard even without organization
                // This allows the "Demo" experience or "Pending Assignment" state.
                // console.log('No organization found, but allowing dashboard access...');
                // navigate('/onboarding', { replace: true }); 
            } else if ((organization || isMaster) && isAtOnboarding) {
                // Organization exists OR user is master, skip onboarding
                console.log('Organization found or Master user, skipping onboarding...');
                navigate('/dashboard', { replace: true });
            }

            // Role Check
            // Role Check
            if (allowedRoles && user && !isMaster) {
                const isRoleAllowed = allowedRoles.includes(role);
                const isRepAllowed = allowedRoles.includes('representative') && isFieldRep;
                
                if (!isRoleAllowed && !isRepAllowed) {
                    console.warn(`User role ${role} not allowed in restricted route.`);
                    navigate('/dashboard', { replace: true });
                }
            }
        }
    }, [user, loading, organization, orgLoading, navigate, location.pathname, isMaster, role, allowedRoles, isFieldRep]);

    if (loading || orgLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center space-y-4">
                    <Loader2 className="h-12 w-12 animate-spin text-emerald-500 mx-auto" />
                    <p className="text-muted-foreground">Preparando tu entorno...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return <>{children}</>;
}
