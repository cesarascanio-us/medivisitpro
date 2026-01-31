import { useState, useEffect } from "react";
import { Bell, Search, Calendar, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { NotificationBadge } from "@/components/layout/NotificationBadge";
import { OrganizationSwitcher } from "@/components/organization/OrganizationSwitcher";
import { Badge } from "@/components/ui/badge";
export function Header() {
  const navigate = useNavigate();
  const { user, isMaster, isSystemAdmin } = useAuth();

  const today = new Date();
  const todayFormatted = today.toLocaleDateString('es-ES', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  });

  return (
    <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-700/50 px-4 py-3 shadow-lg shrink-0 h-14 z-20">
      <div className="flex items-center justify-between h-full gap-4">
        {/* Left side - Date */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm font-medium text-white capitalize">
            <Calendar className="h-4 w-4 text-emerald-400" />
            <span className="hidden sm:inline">{todayFormatted}</span>
          </div>
          {isSystemAdmin && (
            <Badge variant="outline" className="ml-2 bg-purple-500/10 text-purple-400 border-purple-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
              System Admin
            </Badge>
          )}
        </div>

        {/* Organization Switcher (Master Only) */}
        <OrganizationSwitcher />

        {/* Center - Search (hidden on small screens) */}
        <div className="hidden md:block flex-1 max-w-md mx-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Buscar..."
              className="pl-10 h-9 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-emerald-500 focus-visible:border-emerald-500"
            />
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-2">
          {/* New Visit Button - Hidden for Master */}
          {/* New Visit Button Removed */}

          {/* Notifications */}
          <NotificationBadge />
        </div>
      </div>

    </header>
  );
}
