/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 ======================================================================== */

import { useState } from "react";
import { Bell, Search, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "next-themes";
import { useAuth } from "@/hooks/useAuth";
import { NotificationBadge } from "@/components/layout/NotificationBadge";
import { OrganizationSwitcher } from "@/components/organization/OrganizationSwitcher";
import { Badge } from "@/components/ui/badge";
import { OnlineStatusIndicator } from "@/components/common/OnlineStatusIndicator";

// Page title map from pathname
function usePageTitle() {
  const location = useLocation();
  const titleMap: Record<string, string> = {
    '/dashboard':           'Resumen de Actividad',
    '/dashboard-master':    'Panel Master',
    '/master-panel':        'Consola de Administración',
    '/visits':              'Visitas',
    '/doctors':             'Médicos',
    '/pharmacies':          'Farmacias',
    '/sample-banks':        'Muestras',
    '/agenda':              'Agenda',
    '/users':               'Usuarios',
    '/zones':               'Zonas',
    '/transfer-orders':     'Transferencias',
    '/health-centers':      'Centros Médicos',
    '/drugstores':          'Droguerías',
    '/coverage-map':        'Mapa de Cobertura',
    '/sales-pipeline':      'Pipeline de Ventas',
    '/finance-monitor':     'Monitor Financiero',
    '/hr':                  'Capital Humano',
    '/documentos':          'Documentos',
    '/admin/theme-builder': 'Personalizador Visual',
    '/planner':             'Planificador de Rutas',
    '/work-processes':      'Modelado de Procesos',
  };
  return titleMap[location.pathname] || 'MediVisitPro';
}

export function HeaderActions() {
  const { theme, setTheme } = useTheme();
  const isDarkMode = theme === "dark";

  const toggleDarkMode = () => {
    setTheme(isDarkMode ? "light" : "dark");
  };

  return (
    <div className="flex items-center gap-1.5">
      <OnlineStatusIndicator />

      <Button
        variant="ghost"
        size="icon"
        onClick={toggleDarkMode}
        className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
        title={isDarkMode ? "Modo Claro" : "Modo Oscuro"}
      >
        {isDarkMode ? <Sun className="h-4 w-4" strokeWidth={1.5} /> : <Moon className="h-4 w-4" strokeWidth={1.5} />}
      </Button>

      <NotificationBadge />
    </div>
  );
}

export function Header() {
  const navigate = useNavigate();
  const { isSystemAdmin, user, role } = useAuth();
  const pageTitle = usePageTitle();

  const userName = user?.user_metadata?.first_name || user?.email?.split('@')[0] || "Usuario";
  const userInitials = userName.substring(0, 2).toUpperCase();

  const getRoleLabel = () => {
    const roleLabels: Record<string, string> = {
      master:       'Master',
      admin:        'Administrador',
      manager:      'Gerente',
      coordinator:  'Coordinador',
      supervisor:   'Supervisor',
      representative: 'Representante',
      doctor:       'Médico',
    };
    return roleLabels[role] || role || 'Usuario';
  };

  return (
    <header className="h-13 sticky top-0 z-40 w-full bg-card border-b border-border flex items-center px-4 gap-3 shrink-0" style={{ height: '52px' }}>

      {/* Left: Page title */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <span className="text-sm font-semibold text-foreground truncate">{pageTitle}</span>
        {isSystemAdmin && (
          <Badge
            variant="outline"
            className="ml-1 bg-primary/10 text-primary border-primary/20 px-1.5 py-0 text-[10px] font-medium hidden sm:inline-flex"
          >
            System Admin
          </Badge>
        )}
      </div>

      {/* Center: Organization Switcher */}
      <OrganizationSwitcher />

      {/* Right: Search + Actions */}
      <div className="flex items-center gap-2">

        {/* Global Search — compact */}
        <div
          className="hidden md:flex items-center gap-2 h-8 px-3 bg-muted rounded-md w-44 text-xs text-muted-foreground cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors group"
          onClick={() => {/* TODO: open search modal */}}
          title="Buscar (⌘K)"
        >
          <Search className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={1.5} />
          <span className="flex-1">Buscar...</span>
          <kbd className="text-[10px] bg-background text-muted-foreground px-1 rounded border border-border hidden lg:inline">
            ⌘K
          </kbd>
        </div>

        {/* Dark mode + Notifications */}
        <HeaderActions />

        {/* User Avatar */}
        <div className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-muted cursor-pointer transition-colors">
          <div className="w-7 h-7 rounded-md bg-accent flex items-center justify-center flex-shrink-0 border border-border">
            <span className="text-xs font-semibold text-primary">{userInitials}</span>
          </div>
          <div className="hidden md:block min-w-0">
            <p className="text-xs font-medium text-foreground leading-none truncate max-w-[100px]">{userName}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5 leading-none">{getRoleLabel()}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
