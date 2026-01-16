import React from 'react';
import { useAuth } from '@/hooks/useAuth';

interface PermissionGateProps {
    children: React.ReactNode;
    permission?: boolean;
    role?: string | string[];
    fallback?: React.ReactNode;
}

/**
 * Componente que renderiza sus hijos solo si el usuario cumple con los permisos o roles especificados.
 */
export const PermissionGate: React.FC<PermissionGateProps> = ({
    children,
    permission,
    role,
    fallback = null
}) => {
    const { role: userRole } = useAuth();

    // Si se pasa un permiso explícito (ej: canManageUsers), verificarlo
    if (permission !== undefined) {
        return permission ? <>{children}</> : <>{fallback}</>;
    }

    // Si se pasa un rol o lista de roles, verificar contra el rol del usuario
    if (role) {
        const roles = Array.isArray(role) ? role : [role];
        if (roles.includes(userRole)) {
            return <>{children}</>;
        }
        return <>{fallback}</>;
    }

    // Si no se especifica nada, mostrar por defecto (o manejar según necesidad)
    return <>{children}</>;
};
