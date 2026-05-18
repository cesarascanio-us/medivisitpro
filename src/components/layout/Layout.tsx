/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
 ======================================================================== */

import React, { useEffect, useState, lazy, Suspense } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Header, HeaderActions } from './Header';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { useAuth } from '@/hooks/useAuth';
import { Rocket, LogOut, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const StrategicOnboarding360 = lazy(() => import('../onboarding/StrategicOnboarding360').then(module => ({ default: module.StrategicOnboarding360 })));

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
    <div className="h-screen overflow-hidden bg-background text-foreground flex flex-col relative font-outfit transition-colors duration-500">
      {/* Premium Corporate Background Orbs — Dark-Aware */}
      <div className="absolute top-[-10%] left-[-5%] w-[50%] h-[50%] bg-primary/5 dark:bg-primary/10 rounded-full blur-[160px] -z-10 pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-secondary/5 dark:bg-secondary/10 rounded-full blur-[160px] -z-10 pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-primary/3 dark:bg-primary/5 rounded-full blur-[180px] -z-10 pointer-events-none"></div>

      {/* Compact Demo Mode Banner - Only shown on explicit demo routes */}
      {location.pathname.startsWith('/demo/') && (
        <div className="bg-gradient-to-r from-primary-dark to-primary text-white px-3 py-1.5 shadow-md flex items-center justify-between z-50">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-background/20 rounded-full text-xs">
              <Rocket className="h-3 w-3" />
              <span className="font-bold">MODO DEMO</span>
            </div>
            <span className="text-xs hidden sm:inline font-medium">
              Explorando con datos de ejemplo • Sin límites arquitectónicos
            </span>
          </div>

          <div className="flex items-center gap-1">
            <Button
              onClick={handleCreateAccount}
              size="sm"
              className="bg-background text-primary hover:bg-accent text-[10px] font-bold h-6 px-3 hidden sm:inline-flex rounded-full"
            >
              <UserPlus className="h-3 w-3 mr-1" />
              REGISTRARSE
            </Button>
            <Button
              onClick={handleExitDemo}
              size="sm"
              variant="ghost"
              className="text-white hover:bg-background/20 text-[10px] font-bold h-6 px-3 rounded-full"
            >
              <LogOut className="h-3 w-3 mr-1" />
              SALIR
            </Button>
          </div>
        </div>
      )}

      {/* Main container with sidebar and content */}
      <div className="flex flex-1 overflow-hidden h-full">
        {/* Sidebar - Hidden on mobile/tablet, visible on laptop+ (lg breakpoint) */}
        {/* CRITICAL: relative z-50 ensures sidebar is above any map elements */}
        <Sidebar className="hidden lg:block relative z-50 h-full" />

        {/* Content area - z-0 to ensure it's below sidebar */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative z-0">
          {/* Mobile/Tablet Header with hamburger menu */}
          <div className="lg:hidden p-3 md:p-4 border-b border-border flex items-center justify-between bg-card/95 backdrop-blur-md sticky top-0 z-40 transition-all duration-300">
            <div className="flex items-center gap-3">
              <MobileNav />
              <div className="flex items-center gap-2" onClick={() => navigate('/')}>
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/10">
                  <span className="text-xs font-bold text-white">M</span>
                </div>
                <span className="font-bold text-base text-slate-900 dark:text-white tracking-tight">MediVisitPro</span>
              </div>
            </div>
            <HeaderActions />
          </div>

          {/* Desktop Header - only on lg+ */}
          <div className="hidden lg:block shrink-0">
            <Header />
          </div>

          {/* Main Content - Responsive padding - Only main scrolls */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden p-3 md:p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {children}
          </main>
        </div>
      </div>
      <Suspense fallback={null}>
        <StrategicOnboarding360 />
      </Suspense>
    </div>
  );
}
