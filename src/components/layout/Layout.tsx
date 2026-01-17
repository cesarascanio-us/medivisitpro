import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { useAuth } from '@/hooks/useAuth';
import { Rocket, LogOut, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { isDemo } = useAuth();
  const navigate = useNavigate();
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
    <div className="min-h-screen bg-background flex flex-col">
      {/* Compact Demo Mode Banner */}
      {isDemo && (
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
        <div className="hidden lg:block flex-shrink-0">
          <Sidebar />
        </div>

        {/* Content area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile/Tablet Header with hamburger menu */}
          <div className="lg:hidden p-3 border-b border-slate-700/50 flex items-center justify-between bg-slate-900/95 backdrop-blur-md sticky top-0 z-40">
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
          <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-5 lg:p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}