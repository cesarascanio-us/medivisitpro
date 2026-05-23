import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Users,
  BarChart3,
  Building2,
  GitBranch,
  Home,
  Shield,
  DollarSign,
  Crown,
  Truck,
  Layers,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  Map,
  ShoppingCart,
  Store,
  Stethoscope,
  Calendar,
  MapPin,
  FileText,
  Pill,
  ClipboardList,
  FlaskConical,
  LogOut,
  LayoutDashboard,
  Palette,
  Globe,
  ChevronLeft,
  ChevronDown,
  Database
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/context/ThemeContext";
import { useTexts } from "@/hooks/useTexts";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  className?: string;
  isMobile?: boolean;
}

export function Sidebar({ className, isMobile = false }: SidebarProps) {
  const {
    user,
    signOut,
    role,
    isMaster,
    isAdmin,
    isManager,
    isCoordinator,
    isSupervisor,
    organizationName,
    loading
  } = useAuth();

  const { theme } = useTheme();
  const texts = useTexts();
  const navigate = useNavigate();
  const location = useLocation();

  const [isExpanded, setIsExpanded] = useState(theme?.sidebar_default !== "collapsed");
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsedGroups(prev => ({ ...prev, [title]: !prev[title] }));
  };

  const handleSignOut = async () => { await signOut(); };

  const userInitials = user?.email?.substring(0, 2).toUpperCase() || "U";
  const userName = user?.user_metadata?.first_name || user?.email?.split('@')[0] || "Usuario";

  const getRoleLabel = () => {
    if (isMaster) return 'Master';
    if (isAdmin) return 'Administrador';
    if (isManager) return 'Gerente';
    if (isCoordinator) return 'Coordinador';
    if (isSupervisor) return 'Supervisor';
    return 'Representante';
  };

  const canSeeMaster      = isMaster;
  const canSeeManagement  = isMaster || isAdmin || isManager || isCoordinator || isSupervisor;
  const canSeeAnalytics   = isMaster || isAdmin || isManager;
  const canSeeZones       = isMaster || isAdmin || isManager;
  const canSeeHR          = isMaster || isAdmin || isManager;

  const filteredNav = [
    {
      title: "Administración SaaS",
      items: [
        { name: "Consola Sentinel", href: "/master-panel", icon: Crown, visible: canSeeMaster },
        { name: "Planes & Capacidad", href: "/master/plans", icon: Shield, visible: canSeeMaster },
        { name: "Cobros & Facturación", href: "/master/billing", icon: DollarSign, visible: canSeeMaster },
        { name: "Auditoría Global", href: "/master/logs", icon: Database, visible: canSeeMaster },
        { name: "Soporte Técnico", href: "/master/tickets", icon: ClipboardList, visible: canSeeMaster },
        { name: "Editor de Homepage", href: "/master/landing", icon: Globe, visible: canSeeMaster },
      ]
    },
    {
      title: "Panel de Control",
      items: [
        { name: "Resumen de Actividad", href: "/dashboard", icon: Home, visible: true },
        { name: texts.finance_title, href: "/finance-monitor", icon: DollarSign, visible: isMaster || (canSeeAnalytics && theme.enable_finance_monitor) },
        { name: "Personalizador Visual", href: "/admin/theme-builder", icon: Palette, visible: isMaster || isAdmin },
        { name: texts.documents_title, href: "/documentos", icon: FileText, visible: true },
      ]
    },
    {
      title: "Gestión Médica",
      items: [
        { name: texts.visits_title, href: "/visits", icon: ClipboardList, visible: true },
        { name: texts.samples_title, href: "/sample-banks", icon: Pill, visible: isMaster || theme.enable_sample_tracking },
        { name: texts.doctors_title, href: "/doctors", icon: Stethoscope, visible: true },
        { name: texts.agenda_title, href: "/agenda", icon: Calendar, visible: true },
        { name: "Planificador de Rutas", href: "/planner", icon: MapPin, visible: isMaster || theme.enable_geolocation },
      ]
    },
    {
      title: "Gestión Comercial",
      items: [
        { name: texts.users_title, href: "/users", icon: Users, visible: canSeeManagement },
        { name: "Capital Humano", href: "/hr", icon: Shield, visible: canSeeHR },
        { name: "Pipeline de Ventas", href: "/sales-pipeline", icon: TrendingUp, visible: true },
        { name: texts.zones_title, href: "/zones", icon: GitBranch, visible: canSeeZones },
        { name: "Modelado de Procesos", href: "/work-processes", icon: Layers, visible: isMaster || theme.enable_pmbok },
      ]
    },
    {
      title: "Logística y Cobertura",
      items: [
        { name: texts.transfers_title, href: "/transfer-orders", icon: Truck, visible: true },
        { name: "Centros Médicos", href: "/health-centers", icon: Building2, visible: true },
        { name: texts.pharmacies_title, href: "/pharmacies", icon: Store, visible: true },
        { name: "Droguerías Aliadas", href: "/drugstores", icon: FlaskConical, visible: true },
        { name: texts.coverage_title, href: "/coverage-map", icon: Map, visible: isMaster || (canSeeManagement && theme.enable_coverage_map) },
      ]
    }
  ]
    .map(group => ({
      ...group,
      items: group.items.filter(item => item.visible)
    }))
    .filter(group => group.items.length > 0);

  return (
    <aside
      className={cn(
        "flex flex-col bg-card border-r border-border h-screen sticky top-0 flex-shrink-0 z-40",
        "transition-all duration-300 ease-in-out",
        isExpanded ? "w-56" : "w-14",
        className
      )}
    >
      {/* Brand Area */}
      <div
        className={cn(
          "flex items-center h-14 px-3 border-b border-border cursor-pointer select-none flex-shrink-0",
          isExpanded ? "gap-2.5 justify-between" : "justify-center"
        )}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 overflow-hidden bg-primary/10">
            <img
              src={theme?.logo_url || "/favicon.svg"}
              className="w-full h-full object-contain"
              alt="Logo"
            />
          </div>
          {isExpanded && (
            <div className="min-w-0 flex-1 animate-in fade-in duration-200">
              <p className="text-sm font-semibold text-foreground truncate leading-tight">
                {theme?.texts?.sidebar_title || theme?.app_name || "MediVisitPro"}
              </p>
              {theme?.texts?.sidebar_subtitle && (
                <p className="text-xs text-muted-foreground truncate leading-none mt-0.5">
                  {theme.texts.sidebar_subtitle}
                </p>
              )}
            </div>
          )}
        </div>
        {isExpanded && (
          <ChevronLeft className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5 scrollbar-none">
        {loading ? (
          <div className="space-y-1 px-1">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-8 bg-muted rounded-md animate-pulse" />
            ))}
          </div>
        ) : (
          filteredNav.map((group) => (
            <div key={group.title} className="mb-3">
              {/* Group label */}
              {isExpanded && (
                <div
                  className="flex items-center justify-between px-2 py-1 cursor-pointer group/title"
                  onClick={(e) => toggleGroup(group.title, e)}
                >
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                    {group.title}
                  </span>
                  <ChevronDown
                    className={cn(
                      "w-3 h-3 text-muted-foreground transition-transform duration-200",
                      collapsedGroups[group.title] ? "-rotate-90" : "rotate-0"
                    )}
                  />
                </div>
              )}

              {/* Group items */}
              {!collapsedGroups[group.title] && (
                <div className="space-y-0.5 mt-0.5">
                  {group.items.map((item: any) => {
                    const isActive = location.pathname === item.href;
                    return (
                      <NavLink
                        key={item.name}
                        to={item.href}
                        title={!isExpanded ? item.name : undefined}
                        className={cn(
                          "flex items-center rounded-md transition-all duration-150 group relative",
                          isExpanded ? "px-2 py-1.5 gap-2.5" : "px-0 py-1.5 justify-center",
                          isActive
                            ? "bg-accent text-accent-foreground font-medium"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        <item.icon
                          className={cn(
                            "w-4 h-4 flex-shrink-0 transition-colors",
                            isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                          )}
                          strokeWidth={1.5}
                        />
                        {isExpanded && (
                          <span className="text-xs truncate">{item.name}</span>
                        )}
                        {/* Active indicator */}
                        {isActive && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-r-full" />
                        )}
                      </NavLink>
                    );
                  })}
                </div>
              )}
            </div>
          ))
        )}
      </nav>

      {/* User Footer */}
      <div className={cn(
        "border-t border-border p-2 flex-shrink-0",
        isExpanded ? "" : "flex justify-center"
      )}>
        <div className={cn(
          "flex items-center rounded-md p-2 hover:bg-muted transition-colors",
          isExpanded ? "gap-2.5 w-full" : "w-10 h-10 justify-center"
        )}>
          {/* Avatar */}
          <div className="w-7 h-7 rounded-md bg-accent flex items-center justify-center flex-shrink-0 border border-border">
            <span className="text-xs font-semibold text-primary">{userInitials}</span>
          </div>

          {isExpanded && (
            <div className="min-w-0 flex-1 animate-in fade-in duration-200">
              <p className="text-xs font-medium text-foreground truncate leading-tight">{userName}</p>
              <p className="text-[10px] text-muted-foreground truncate mt-0.5">{getRoleLabel()}</p>
            </div>
          )}

          {isExpanded && (
            <Button
              variant="ghost"
              size="icon"
              className="w-6 h-6 flex-shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              onClick={handleSignOut}
              title="Cerrar sesión"
            >
              <LogOut className="w-3.5 h-3.5" strokeWidth={1.5} />
            </Button>
          )}
        </div>
      </div>
    </aside>
  );
}
