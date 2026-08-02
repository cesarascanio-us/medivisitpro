/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 ======================================================================== */

import React, { lazy, Suspense } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Header, HeaderActions } from './Header';
import { Sidebar } from './Sidebar';
import { BottomNavBar } from './BottomNavBar';
import { SubscriptionBanner } from '../common/SubscriptionBanner';
import { useAuth } from '@/hooks/useAuth';
import { Rocket, LogOut, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { lazyWithRetry } from '@/utils/lazyWithRetry';

const StrategicOnboarding360 = lazyWithRetry(
  () => import('../onboarding/StrategicOnboarding360').then(module => ({ default: module.StrategicOnboarding360 })),
  'StrategicOnboarding360'
);

interface LayoutProps {
  children?: React.ReactNode;
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
    <div className="flex flex-col h-screen overflow-hidden bg-background relative transition-colors duration-500">
      {/* Global Background from Landing Page */}
      <div className="absolute inset-0 hidden dark:block bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.05] pointer-events-none z-0"></div>
      <div className="absolute top-0 right-0 w-full max-w-[800px] h-full max-h-[800px] bg-primary/10 dark:bg-primary/15 rounded-full blur-[100px] dark:blur-[150px] z-0 translate-x-1/3 -translate-y-1/3 pointer-events-none transition-all duration-1000" />
      <div className="absolute bottom-0 left-0 w-full max-w-[600px] h-full max-h-[600px] bg-secondary/10 dark:bg-secondary/20 rounded-full blur-[100px] dark:blur-[120px] z-0 -translate-x-1/3 translate-y-1/3 pointer-events-none transition-all duration-1000" />

      {/* Demo Mode Banner */}
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

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden z-10 relative">
        {/* SIDEBAR */}
        <Sidebar className="hidden lg:flex" />

        {/* CONTENIDO */}
        <div className="flex flex-col flex-1 overflow-hidden relative pb-16 lg:pb-0">
          {/* Mobile/Tablet header */}
          <div className="lg:hidden h-14 px-4 border-b border-white/5 flex items-center justify-between glass-elite bg-card/90 backdrop-blur-[24px] sticky top-0 z-40 shadow-premium-sm">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-premium-sm">
                <span className="text-sm font-bold text-white">M</span>
              </div>
              <span className="font-bold text-base text-foreground tracking-tight">MediVisitPro</span>
            </div>
            <HeaderActions />
          </div>

          {/* Desktop header */}
          <div className="hidden lg:block shrink-0">
            <Header />
          </div>

          <SubscriptionBanner />

          <main className="flex-1 overflow-y-auto bg-transparent p-4 lg:p-6 pb-20 lg:pb-6">
            {children || <Outlet />}
          </main>
          
          <BottomNavBar />
        </div>
      </div>

      <Suspense fallback={null}>
        <StrategicOnboarding360 />
      </Suspense>
    </div>
  );
};
