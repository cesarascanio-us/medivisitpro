import React, { lazy } from 'react';
import { useAuth } from '@/hooks/useAuth';

const DashboardMaster = lazy(() => import('./DashboardMaster'));
const DashboardManager = lazy(() => import('./DashboardManager'));
const DashboardRep = lazy(() => import('./DashboardRep'));
const DashboardDoctor = lazy(() => import('./DashboardDoctor'));
const DashboardSupervisor = lazy(() => import('@/pages/DashboardSupervisor'));
const DashboardTelemarketing = lazy(() => import('@/pages/DashboardTelemarketing'));
const DashboardJefe = lazy(() => import('./DashboardJefe'));
const PortalFarmacia = lazy(() => import('@/pages/portals/PortalFarmacia'));
const PortalCompras = lazy(() => import('@/pages/portals/PortalCompras'));

const DashboardDefault = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <p className="text-muted-foreground text-sm">Cargando su panel de control personalizado...</p>
  </div>
);

export default function DashboardRouter() {
  const { profile, organizationId } = useAuth();
  
  if (!profile || !organizationId) {
    return <DashboardDefault />;
  }

  const role = profile.role;

  if (role === 'master' || role === 'admin') {
    return <DashboardMaster />;
  }

  // 1. Ejecutivos → DashboardManager (Admin, Gerente)
  if (['admin', 'gerente', 'manager', 'organization_admin'].includes(role)) {
    return <DashboardManager organizationId={organizationId} />;
  }

  // 2. Jefe Regional → DashboardJefe
  if (['jefe', 'chief'].includes(role)) {
    return <DashboardJefe organizationId={organizationId} />;
  }

  // 3. Supervisión táctica → DashboardSupervisor
  if (['coordinador', 'coordinator', 'supervisor'].includes(role)) {
    return <DashboardSupervisor />;
  }

  // 4. Telemarketing → DashboardTelemarketing
  if (role === 'telemarketing') {
    return <DashboardTelemarketing />;
  }

  // 5. Campo → DashboardRep (Comercial, Médico, Integral)
  if (['rep_comercial', 'visitador_medico', 'rep_integral', 'representative'].includes(role)) {
    const mode = role === 'rep_comercial' ? 'comercial' : 
                 role === 'visitador_medico' ? 'medico' : 'integral';
    return <DashboardRep mode={mode as any} />;
  }

  // 6. Portal Médico
  if (['medico', 'doctor'].includes(role)) {
    return <DashboardDoctor organizationId={organizationId} doctorId={profile?.id || ''} />;
  }

  // 7. Portal Farmacia (B2B)
  if (['farmacia', 'pharmacist'].includes(role)) {
    return <PortalFarmacia />;
  }

  // 8. Portal Compras (Institucional)
  if (['compras', 'buyer'].includes(role)) {
    return <PortalCompras />;
  }

  return (
    <div className="p-8 flex flex-col items-center justify-center text-center space-y-4">
      <h2 className="text-xl font-bold">¡Bienvenido a MediVisitPro!</h2>
      <p className="text-muted-foreground">Su rol actual ({role}) no tiene un panel especializado aún. Contacte al administrador.</p>
    </div>
  );
}
