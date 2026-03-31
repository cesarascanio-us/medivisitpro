/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

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
import { OnlineStatusIndicator } from "@/components/common/OnlineStatusIndicator";

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
    <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200 px-6 py-3 shadow-sm shrink-0 h-16 z-20">
      <div className="flex items-center justify-between h-full gap-4">
        {/* Left side - Date */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-text-main capitalize">
            <Calendar className="h-4 w-4 text-primary" />
            <span className="hidden sm:inline opacity-80">{todayFormatted}</span>
          </div>
          {isSystemAdmin && (
            <Badge variant="outline" className="ml-2 bg-primary/10 text-primary border-primary/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
              System Admin
            </Badge>
          )}
        </div>

        {/* Organization Switcher (Master Only) */}
        <OrganizationSwitcher />

        {/* Center - Search (hidden on small screens) */}
        <div className="hidden md:block flex-1 max-w-md mx-4">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
            <Input
              type="text"
              placeholder="Buscar..."
              className="pl-10 h-10 bg-gray-50 border-gray-200 text-text-main placeholder:text-gray-400 focus-visible:ring-primary focus-visible:border-primary rounded-xl"
            />
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-4">
          <OnlineStatusIndicator />
          {/* Notifications */}
          <NotificationBadge />
        </div>
      </div>

    </header>
  );
}
