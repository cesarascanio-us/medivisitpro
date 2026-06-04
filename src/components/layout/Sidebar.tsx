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
  GraduationCap,
  FlaskConical,
  LogOut,
  LayoutDashboard,
  Gift,
  Palette,
  Globe,
  ChevronLeft,
  ChevronDown,
  Database,
  Settings as SettingsIcon
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/context/ThemeContext";
import { useTexts } from "@/hooks/useTexts";
import { Button } from "@/components/ui/button";
import { usePermissions } from "@/hooks/usePermissions";
import { useAppRoles } from "@/hooks/useAppRoles";

interface SidebarProps {
  className?: string;
  isMobile?: boolean;
}

export function Sidebar({ className, isMobile = false }: SidebarProps) {
  const {
    user,
    profile,
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
  const { canAccessModule, can } = usePermissions();

  const [isExpanded, setIsExpanded] = useState(theme?.sidebar_default !== "collapsed");
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsedGroups(prev => ({ ...prev, [title]: !prev[title] }));
  };

  const handleSignOut = async () => { await signOut(); };

  const userName = profile?.first_name 
    ? `${profile.first_name} ${profile.last_name || ''}`.trim()
    : user?.user_metadata?.first_name 
      || user?.email?.split('@')[0] 
      || "Usuario";
      
  const userInitials = profile?.first_name 
    ? `${profile.first_name.charAt(0)}${(profile.last_name || '').charAt(0) || user?.email?.charAt(0)?.toUpperCase() || 'U'}`.toUpperCase()
    : user?.email?.substring(0, 2).toUpperCase() || "U";

  const { data: appRoles } = useAppRoles();
  const getRoleLabel = () => {
    return appRoles?.find(r => r.slug === role)?.name || role;
  };

  const canSeeMaster      = isMaster;

  // Mock states for visual design specs
  const pendingVisits = role === 'representative' ? 3 : 0;
  const pendingTransfers = (isManager || role === 'representative') ? 5 : 0;
  const hasActiveVisit = role === 'representative';

  // Determinar grupo según rol del perfil
  const getRoleGroup = () => {
    if (['master', 'admin'].includes(role)) return 'master';
    if (['gerente', 'manager', 'jefe', 'chief'].includes(role)) return 'ejecutivo';
    if (['coordinador', 'coordinator', 'supervisor'].includes(role)) return 'supervision';
    if (role === 'telemarketing') return 'telemarketing';
    if (['rep_comercial', 'commercial_rep', 'visitador_medico', 'medical_visitor', 'rep_integral', 'integral_rep', 'representative'].includes(role)) return 'campo';
    if (['farmacia', 'medico', 'compras', 'pharmacist', 'doctor', 'buyer'].includes(role)) return 'externo';
    return 'ejecutivo'; // fallback
  };

  const roleGroup = getRoleGroup();

  const NAV_GROUPS: Record<string, any[]> = {
    ejecutivo: [
      {
        title: "Administración SaaS",
        visible: canSeeMaster,
        items: [
          { name: "Consola Sentinel", href: "/master-panel", icon: Crown, visible: canSeeMaster },
          { name: "Matriz de Roles", href: "/roles", icon: Shield, visible: canSeeMaster },
          { name: "Planes & Capacidad", href: "/master/plans", icon: Shield, visible: canSeeMaster },
          { name: "Cobros & Facturación", href: "/master/billing", icon: DollarSign, visible: canSeeMaster },
          { name: "Auditoría Global", href: "/master/logs", icon: Database, visible: canSeeMaster },
          { name: "Soporte Técnico", href: "/master/tickets", icon: ClipboardList, visible: canSeeMaster },
          { name: "Editor de Homepage", href: "/master/landing", icon: Globe, visible: canSeeMaster },
        ]
      },
      {
        title: "Estrategia",
        visible: true,
        items: [
          { name: "Resumen Gerencial", href: "/dashboard", icon: Home, visible: true },
          { name: "Objetivos", href: "/objectives", icon: BarChart3, visible: can('reports.national') || can('reports.regional') },
          { name: "Pipeline de Ventas", href: "/sales-pipeline", icon: TrendingUp, visible: true },
          { name: texts.finance_title, href: "/finance-monitor", icon: DollarSign, visible: can('reports.financial') },
        ]
      },
      {
        title: "Gestión Territorial",
        visible: true,
        items: [
          { name: "Capital Humano", href: "/hr", icon: Shield, visible: can('admin.users') },
          { name: texts.users_title, href: "/users", icon: Users, visible: can('admin.users') },
          { name: texts.zones_title, href: "/zones", icon: GitBranch, visible: can('admin.zones') },
          { name: texts.coverage_title, href: "/coverage-map", icon: Map, visible: can('dashboard.regional') || can('dashboard.executive') },
          { name: "Modelado de Procesos", href: "/work-processes", icon: Layers, visible: canSeeMaster },
        ]
      }
    ],
    supervision: [
      {
        title: "Control de Campo",
        visible: true,
        items: [
          { name: "Dashboard", href: "/dashboard", icon: Home, visible: true },
          { name: "Objetivos", href: "/objectives", icon: BarChart3, visible: true },
          { name: "Coaching de Campo", href: "/coaching", icon: ShieldCheck, visible: can('visits.coaching') || true },
          { name: "Rutas Semanales", href: "/route-planner", icon: MapPin, visible: can('planning.routes') || true },
          { name: "Agenda de Equipo", href: "/agenda", icon: Calendar, visible: can('planning.agenda_team') || true },
          { name: "Historial de Visitas", href: "/visits", icon: ClipboardList, visible: true },
        ]
      },
      {
        title: "Gestión Comercial",
        visible: true,
        items: [
          { name: "Muestras", href: "/sample-banks", icon: Pill, visible: true },
          { name: "Material POP", href: "/material-pop", icon: Gift, visible: true },
          { name: "Aprobaciones", href: "/transfer-orders", icon: Truck, visible: true },
        ]
      }
    ],
    telemarketing: [
      {
        title: "Ventas Internas",
        visible: true,
        items: [
          { name: "Panel Operativo", href: "/dashboard", icon: Home, visible: true },
          { name: "Objetivos", href: "/objectives", icon: BarChart3, visible: true },
          { name: "Directorio", href: "/contacts", icon: Users, visible: true },
          { name: "Pedidos", href: "/transfer-orders", icon: ShoppingCart, visible: true },
          { name: "Cotizaciones", href: "/quotes", icon: FileText, visible: true },
        ]
      }
    ],
    campo: [
      {
        title: "Mi Día",
        visible: true,
        items: [
          { name: "Dashboard", href: "/dashboard", icon: Home, visible: true },
          { name: "Objetivos", href: "/objectives", icon: BarChart3, visible: true },
          { name: "Rutas Semanales", href: "/route-planner", icon: MapPin, visible: true },
          { name: "Plan Diario", href: "/planner", icon: Calendar, visible: true },
          { name: "Mis Visitas", href: "/visits", icon: ClipboardList, visible: true },
          { name: "Mis Gastos", href: "/expenses", icon: DollarSign, visible: true },
        ]
      },
      {
        title: "Cartera",
        visible: true,
        items: [
          { name: texts.doctors_title, href: "/doctors", icon: Stethoscope, visible: can('directory.view') || true },
          { name: texts.pharmacies_title, href: "/pharmacies", icon: Store, visible: can('commercial.pharmacies') || true },
          { name: "Droguerías Aliadas", href: "/drugstores", icon: FlaskConical, visible: can('commercial.stock') },
          { name: "Centros Médicos", href: "/health-centers", icon: Building2, visible: can('commercial.pharmacies') },
        ]
      },
      {
        title: "Herramientas",
        visible: true,
        items: [
          { name: "Catálogo Interactivo", href: "/products", icon: ShoppingCart, visible: true },
          { name: "Gestión de Baremos", href: "/baremos", icon: FileText, visible: true },
          { name: "Mis Pedidos", href: "/transfer-orders", icon: Truck, visible: true },
          { name: "Banco de Muestras", href: "/sample-banks", icon: Pill, visible: true },
        ]
      }
    ],
    externo: [
      {
        title: "Portal",
        visible: true,
        items: [
          { name: "Mi Panel", href: "/dashboard", icon: Home, visible: true },
          { name: "Catálogo", href: "/products", icon: ShoppingCart, visible: true },
          { name: "Mis Pedidos", href: "/transfer-orders", icon: Truck, visible: true },
        ]
      }
    ]
  };

  const commonGroup = {
    title: "Soporte",
    visible: true,
    items: [
      { name: "Configuración", href: "/settings", icon: SettingsIcon, visible: true },
      { name: "Ayuda", href: "/help", icon: ShieldCheck, visible: true },
    ]
  };

  const masterGroups = [
    ...(NAV_GROUPS.ejecutivo || []),
    ...(NAV_GROUPS.supervision || []).map(g => ({
      ...g,
      items: g.items.filter(i => i.name !== 'Dashboard' && i.name !== 'Objetivos')
    })),
    ...(NAV_GROUPS.campo || []).map(g => ({
      ...g,
      items: g.items.filter(i => !['Dashboard', 'Objetivos', 'Rutas Semanales', 'Plan Diario', 'Mis Visitas'].includes(i.name))
    }))
  ];

  const baseGroups = roleGroup === 'master' ? masterGroups : (NAV_GROUPS[roleGroup] || []);

  const filteredNav = [
    ...baseGroups,
    // commonGroup
  ]
    .filter(group => group.visible)
    .map(group => ({
      ...group,
      items: group.items.filter((item: any) => item.visible)
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
                            ? "bg-accent text-primary font-medium"
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
                          <span className="text-xs truncate flex-1 text-left">{item.name}</span>
                        )}
                        {/* Badges */}
                        {isExpanded && item.badge > 0 && (
                          <span className={cn("px-1.5 py-0.5 rounded-full text-[9px] font-bold text-white", item.badgeColor || "bg-primary")}>
                            {item.badge}
                          </span>
                        )}
                        {!isExpanded && item.badge > 0 && (
                          <span className={cn("absolute top-1 right-1 w-2 h-2 rounded-full", item.badgeColor || "bg-primary")} />
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
          isExpanded ? "gap-2.5 w-full" : "w-10 h-10 justify-center relative"
        )}>
          {/* Avatar */}
          <div className="w-7 h-7 rounded-md bg-accent flex items-center justify-center flex-shrink-0 border border-border relative">
            <span className="text-xs font-semibold text-primary">{userInitials}</span>
            {!isExpanded && hasActiveVisit && (
               <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full border border-card animate-pulse" />
            )}
          </div>

          {isExpanded && (
            <div className="min-w-0 flex-1 animate-in fade-in duration-200">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-medium text-foreground truncate leading-tight">{userName}</p>
                {hasActiveVisit && (
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse flex-shrink-0" title="Visita en curso" />
                )}
              </div>
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
