/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
 ======================================================================== */

import { useState, useEffect } from "react";
import { Bell, Search, Calendar, Plus, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import { useAuth } from "@/hooks/useAuth";
import { NotificationBadge } from "@/components/layout/NotificationBadge";
import { OrganizationSwitcher } from "@/components/organization/OrganizationSwitcher";
import { Badge } from "@/components/ui/badge";
import { OnlineStatusIndicator } from "@/components/common/OnlineStatusIndicator";

export function HeaderActions() {
  const { theme, setTheme } = useTheme();
  const isDarkMode = theme === "dark";

  const toggleDarkMode = () => {
    setTheme(isDarkMode ? "light" : "dark");
  };

  return (
    <div className="flex items-center gap-2 md:gap-4">
      <OnlineStatusIndicator />
      
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleDarkMode}
        className="h-9 w-9 md:h-10 md:w-10 text-slate-500 hover:text-primary hover:bg-primary/10 rounded-full transition-all duration-300"
        title={isDarkMode ? "Cambiar a Modo Claro" : "Cambiar a Modo Oscuro"}
      >
        {isDarkMode ? <Sun className="h-4 w-4 md:h-5 md:w-5" /> : <Moon className="h-4 w-4 md:h-5 md:w-5" />}
      </Button>

      <NotificationBadge />
    </div>
  );
}

export function Header() {
  const navigate = useNavigate();
  const { isSystemAdmin } = useAuth();

  const today = new Date();
  const todayFormatted = today.toLocaleDateString('es-ES', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  });

  return (
    <header className="bg-background border-b border-border px-6 py-3 shadow-none shrink-0 h-16 z-20 transition-all duration-300">
      <div className="flex items-center justify-between h-full gap-4">
        {/* Left side - Date */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground capitalize">
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
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              type="text"
              placeholder="Buscar actividad..."
              className="pl-10 h-10 bg-muted/20 border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary focus-visible:border-primary rounded-xl transition-all"
            />
          </div>
        </div>

        {/* Right side - Actions */}
        <HeaderActions />
      </div>
    </header>
  );
}
