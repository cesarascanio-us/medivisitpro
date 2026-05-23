/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 ======================================================================== */

import React, { lazy, Suspense } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Header, HeaderActions } from './Header';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { useAuth } from '@/hooks/useAuth';
import { Rocket, LogOut, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const StrategicOnboarding360 = lazy(() =>
  import('../onboarding/StrategicOnboarding360').then(module => ({ default: module.StrategicOnboarding360 }))
);

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { isDemo } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const handleExitDemo = async () => {
    await supabase.auth.signOut();
    toast({
      title: 'Sesión de Demo Finalizada',
      description: '¡Esperamos que hayas disfrutado probando MediVisitPro!',
    });
    navigate('/', { replace: true });
  };

  const handleCreateAccount = () => {
    navigate('/auth');
  };

  return (
    <div className="h-screen overflow-hidden bg-background text-foreground flex flex-col relative font-sans transition-colors duration-300">

      {/* Demo Mode Banner — only on /demo/* routes */}
      {location.pathname.startsWith('/demo/') && (
        <div className="bg-primary text-primary-foreground px-4 py-1.5 flex items-center justify-between z-50 shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-white/20 rounded-full text-xs font-semibold">
              <Rocket className="h-3 w-3" />
              <span>MODO DEMO</span>
            </div>
            <span className="text-xs hidden sm:inline opacity-90">
              Explorando con datos de ejemplo
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              onClick={handleCreateAccount}
              size="sm"
              className="bg-white text-primary hover:bg-white/90 text-xs font-semibold h-6 px-3 hidden sm:inline-flex rounded-md"
            >
              <UserPlus className="h-3 w-3 mr-1" />
              Registrarse
            </Button>
            <Button
              onClick={handleExitDemo}
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/20 text-xs h-6 px-3 rounded-md"
            >
              <LogOut className="h-3 w-3 mr-1" />
              Salir
            </Button>
          </div>
        </div>
      )}

      {/* Main: sidebar + content */}
      <div className="flex flex-1 overflow-hidden">

        {/* Sidebar — only on lg+ */}
        <Sidebar className="hidden lg:flex relative z-40 h-full" />

        {/* Content area */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">

          {/* Mobile/Tablet header */}
          <div className="lg:hidden px-3 py-2 border-b border-border flex items-center justify-between bg-card sticky top-0 z-40">
            <div className="flex items-center gap-2">
              <MobileNav />
              <div
                className="flex items-center gap-1.5 cursor-pointer"
                onClick={() => navigate('/')}
              >
                <div className="w-7 h-7 bg-primary rounded-md flex items-center justify-center">
                  <span className="text-xs font-semibold text-white">M</span>
                </div>
                <span className="font-semibold text-sm text-foreground">MediVisitPro</span>
              </div>
            </div>
            <HeaderActions />
          </div>

          {/* Desktop header */}
          <div className="hidden lg:block shrink-0">
            <Header />
          </div>

          {/* Main content */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden bg-background p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>

      <Suspense fallback={null}>
        <StrategicOnboarding360 />
      </Suspense>
    </div>
  );
};
