/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
 ======================================================================== */

import React, { useEffect, useState, lazy, Suspense } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Header } from './Header';
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
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-y-auto font-outfit transition-colors duration-500">
      {/* Premium Corporate Background Orbs — Dark-Aware */}
      <div className="absolute top-[-10%] left-[-5%] w-[50%] h-[50%] bg-primary/5 dark:bg-primary/10 rounded-full blur-[160px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-secondary/5 dark:bg-secondary/10 rounded-full blur-[160px] pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-primary/3 dark:bg-primary/5 rounded-full blur-[180px] pointer-events-none"></div>

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
      <div className="flex flex-1 overflow-visible">
        {/* Sidebar - Hidden on mobile/tablet, visible on laptop+ (lg breakpoint) */}
        {/* CRITICAL: relative z-50 ensures sidebar is above any map elements */}
        <div className="hidden lg:block flex-shrink-0 relative z-50 sidebar-wrapper">
          <Sidebar />
        </div>

        {/* Content area - z-0 to ensure it's below sidebar */}
        <div className="flex-1 flex flex-col min-h-0 overflow-visible relative z-0">
          {/* Mobile/Tablet Header with hamburger menu */}
          <div className="lg:hidden p-3 border-b border-border flex items-center justify-between bg-card/95 backdrop-blur-md sticky top-0 z-40">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <MobileNav />
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-light rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
                  <span className="text-xs font-black text-white">M</span>
                </div>
                <span className="font-black text-base text-primary tracking-tight">MediVisitPro</span>
              </div>
            </div>
          </div>

          {/* Desktop Header - only on lg+ */}
          <div className="hidden lg:block">
            <Header />
          </div>

          {/* Main Content - Responsive padding */}
          <main className="flex-1 overflow-hidden p-4 md:p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
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
