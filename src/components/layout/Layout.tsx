import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { useAuth } from '@/hooks/useAuth';
import { Rocket, LogOut, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { StrategicOnboarding360 } from '../onboarding/StrategicOnboarding360';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { isDemo } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // FIX: Force resync if browser URL doesn't match React Router location
  // This fixes the map freeze issue where navigation clicks change URL but not component
  const lastReloadRef = React.useRef<number>(0);

  useEffect(() => {
    const checkUrlSync = () => {
      const browserPath = window.location.pathname;
      const now = Date.now();

      // Only proceed if URLs don't match
      if (browserPath !== location.pathname) {
        // Anti-loop protection: don't reload if we just reloaded within last 2 seconds
        if (now - lastReloadRef.current < 2000) {
          console.log('[Layout] Skipping reload - too recent');
          return;
        }

        console.warn('[Layout] URL mismatch detected:', browserPath, 'vs', location.pathname);
        lastReloadRef.current = now;

        // Store in sessionStorage to track across reloads
        const reloadCount = parseInt(sessionStorage.getItem('mapFixReloadCount') || '0');
        if (reloadCount >= 3) {
          console.error('[Layout] Too many reloads, stopping to prevent infinite loop');
          sessionStorage.removeItem('mapFixReloadCount');
          return;
        }

        sessionStorage.setItem('mapFixReloadCount', String(reloadCount + 1));

        // FIX: Redirect to the browser's URL instead of reloading
        // reload() would reload the corrupted React Router state
        // replace() forces navigation to the actual URL the user clicked
        window.location.replace(browserPath + window.location.search);
      } else {
        // URLs match, clear the reload counter
        sessionStorage.removeItem('mapFixReloadCount');
      }
    };

    // Check after a longer delay to allow React Router to sync naturally first
    const timeoutId = setTimeout(checkUrlSync, 500);

    // Also listen for popstate events
    window.addEventListener('popstate', checkUrlSync);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('popstate', checkUrlSync);
    };
  }, [location.pathname]);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-[#020617] text-slate-200 flex flex-col relative overflow-hidden">
      {/* Premium War Room Background Orbs */}
      <div className="absolute top-[-10%] left-[-5%] w-[50%] h-[50%] bg-emerald-500/5 rounded-full blur-[160px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-blue-600/5 rounded-full blur-[160px] pointer-events-none animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-purple-500/5 rounded-full blur-[180px] pointer-events-none"></div>

      {/* Compact Demo Mode Banner - Only shown on explicit demo routes */}
      {location.pathname.startsWith('/demo/') && (
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-3 py-1.5 shadow-md flex items-center justify-between z-50">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-white/20 rounded-full text-xs">
              <Rocket className="h-3 w-3" />
              <span className="font-bold">DEMO</span>
            </div>
            <span className="text-xs hidden sm:inline">
              Explorando con datos de ejemplo • Sin límites
            </span>
          </div>

          <div className="flex items-center gap-1">
            <Button
              onClick={handleCreateAccount}
              size="sm"
              className="bg-white text-emerald-700 hover:bg-slate-100 text-xs h-6 px-2 hidden sm:inline-flex"
            >
              <UserPlus className="h-3 w-3 mr-1" />
              Crear Cuenta
            </Button>
            <Button
              onClick={handleExitDemo}
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/20 text-xs h-6 px-2"
            >
              <LogOut className="h-3 w-3 mr-1" />
              Salir
            </Button>
          </div>
        </div>
      )}

      {/* Main container with sidebar and content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Hidden on mobile/tablet, visible on laptop+ (lg breakpoint) */}
        {/* CRITICAL: relative z-50 ensures sidebar is above any map elements */}
        <div className="hidden lg:block flex-shrink-0 relative z-50 sidebar-wrapper">
          <Sidebar />
        </div>

        {/* Content area - z-0 to ensure it's below sidebar */}
        <div className="flex-1 flex flex-col overflow-hidden relative z-0">
          {/* Mobile/Tablet Header with hamburger menu */}
          <div className="lg:hidden p-3 border-b border-sidebar-border flex items-center justify-between bg-brand-primary/95 backdrop-blur-md sticky top-0 z-40">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <MobileNav />
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center">
                  <span className="text-xs font-bold text-white">M</span>
                </div>
                <span className="font-bold text-base text-white">MediVisitPro</span>
              </div>
            </div>
          </div>

          {/* Desktop Header - only on lg+ */}
          <div className="hidden lg:block">
            <Header />
          </div>

          {/* Main Content - Responsive padding */}
          <main key={location.pathname} className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-5 lg:p-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {children}
          </main>
        </div>
      </div>
      <StrategicOnboarding360 />
    </div>
  );
}
