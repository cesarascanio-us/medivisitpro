import React from 'react';
import { useAuth } from '@/hooks/useAuth';

const DashboardMaster = React.lazy(() => import('./DashboardMaster'));
const DashboardManager = React.lazy(() => import('./DashboardManager'));
const DashboardRep = React.lazy(() => import('./DashboardRep'));
const DashboardDoctor = React.lazy(() => import('./DashboardDoctor'));

// Un fallback o skeleton se usa en React.Suspense que envuelve este componente desde App.tsx
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

  if (role === 'manager' || role === 'coordinator' || role === 'supervisor') {
    return <DashboardManager organizationId={organizationId} />;
  }

  if (role === 'representative' || role === 'telemarketing') {
    return <DashboardRep />;
  }

  if (role === 'doctor') {
    return <DashboardDoctor organizationId={organizationId} doctorId={profile.id} />;
  }

  return (
    <div className="p-8 flex flex-col items-center justify-center text-center space-y-4">
      <h2 className="text-xl font-bold">¡Bienvenido a MediVisitPro!</h2>
      <p className="text-muted-foreground">Su rol actual ({role}) no tiene un panel especializado aún. Contacte al administrador.</p>
    </div>
  );
}
