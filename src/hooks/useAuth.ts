/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

// Re-export specific types and the hook from the Provider
export type { UserRole, UserProfile } from '@/components/auth/AuthProvider';
export { useAuth } from '@/components/auth/AuthProvider';
