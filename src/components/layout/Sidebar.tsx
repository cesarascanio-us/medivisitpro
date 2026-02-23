/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
 ======================================================================== */

import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Calendar,
  Users,
  FileText,
  BarChart3,
  Package,
  Boxes,
  Settings,
  Home,
  Stethoscope,
  Building2,
  GitBranch,
  CalendarDays,
  Target,
  Pill,
  DollarSign,
  Bell,
  HelpCircle,
  ClipboardList,
  UserRound,
  Store,
  Shield,
  LogOut,
  Crown,
  Megaphone,
  Map,
  RefreshCw,
  Award,
  Truck,
  CalendarCheck,
  Layers,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Leaf,
  Globe
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

// Navigation Groups
// --- STRICT NAVIGATION CONFIGURATIONS ---

// GOD MODE NAV (Merged System Admin + Manager + Rep capabilities)
const SYSTEM_ADMIN_NAV = [
  {
    title: "CORE SYSTEM",
    items: [
      { name: "Centro de Mando", href: "/dashboard-master", icon: BarChart3 },
      { name: "Dashboard Operativo", href: "/dashboard", icon: Home },
      { name: "Panel Master", href: "/master-panel", icon: Crown },
      { name: "Control Organizaciones", href: "/master-panel?tab=orgs", icon: Building2 },
      { name: "SaaS & Facturación", href: "/master/billing", icon: DollarSign },
      { name: "Auditoría de Sistema", href: "/master/logs", icon: Shield },
    ]
  },
  {
    title: "GESTIÓN COMERCIAL & EQUIPO",
    items: [
      { name: "Mi Equipo (Usuarios)", href: "/users", icon: Users },
      { name: "Talento Humano (LOTTT)", href: "/hr", icon: Shield },
      { name: "Reportes Globales", href: "/reports", icon: BarChart3 },
      { name: "Planificación & Ciclos", href: "/promotional-cycles", icon: Layers },
      { name: "Zonas y Territorios", href: "/zones", icon: GitBranch },
    ]
  },
  {
    title: "OPERACIÓN DE CAMPO",
    items: [
      { name: "Contactos (Directorio)", href: "/contacts", icon: Users },
      { name: "Fichero Médico (IP)", href: "/doctors", icon: Stethoscope },
      { name: "Farmacias & POS", href: "/pharmacies", icon: Store },
      { name: "Tiendas Naturistas", href: "/natural-stores", icon: Leaf },
      { name: "Droguerías", href: "/drugstores", icon: Truck },
      { name: "Centros de Salud", href: "/health-centers", icon: Building2 },
      { name: "Rutas y Territorios", href: "/visits", icon: FileText },
      { name: "Pedidos y Transferencias", href: "/transfer-orders", icon: Truck },
      { name: "Cobertura Global", href: "/coverage-map", icon: Map },
    ]
  },
  {
    title: "INVENTARIO & RECURSOS",
    items: [
      { name: "Catálogo Maestro", href: "/products", icon: Package },
      { name: "Control Almacén", href: "/warehouse", icon: Boxes },
      { name: "Muestras Médicas", href: "/muestras", icon: Pill },
      { name: "Material POP", href: "/material-pop", icon: Megaphone },
      { name: "Agenda Global", href: "/agenda", icon: Calendar },
    ]
  }
];

const OPERATIONAL_NAV = [
  {
    title: "GESTIÓN COMERCIAL & EQUIPO",
    items: [
      { name: "Mi Equipo (Usuarios)", href: "/users", icon: Users },
      { name: "Talento Humano (LOTTT)", href: "/hr", icon: Shield },
      { name: "Reportes Globales", href: "/reports", icon: BarChart3 },
      { name: "Planificación & Ciclos", href: "/promotional-cycles", icon: Layers },
      { name: "Zonas y Territorios", href: "/zones", icon: GitBranch },
    ]
  },
  {
    title: "OPERACIÓN DE CAMPO",
    items: [
      { name: "Contactos (Directorio)", href: "/contacts", icon: Users },
      { name: "Fichero Médico (IP)", href: "/doctors", icon: Stethoscope },
      { name: "Farmacias & POS", href: "/pharmacies", icon: Store },
      { name: "Tiendas Naturistas", href: "/natural-stores", icon: Leaf },
      { name: "Droguerías", href: "/drugstores", icon: Truck },
      { name: "Centros de Salud", href: "/health-centers", icon: Building2 },
      { name: "Rutas y Territorios", href: "/visits", icon: FileText },
      { name: "Pedidos y Transferencias", href: "/transfer-orders", icon: Truck },
      { name: "Cobertura Global", href: "/coverage-map", icon: Map },
    ]
  },
  {
    title: "INVENTARIO & RECURSOS",
    items: [
      { name: "Catálogo Maestro", href: "/products", icon: Package },
      { name: "Control Almacén", href: "/warehouse", icon: Boxes },
      { name: "Muestras Médicas", href: "/muestras", icon: Pill },
      { name: "Material POP", href: "/material-pop", icon: Megaphone },
      { name: "Agenda Global", href: "/agenda", icon: Calendar },
    ]
  }
];

const REPRESENTATIVE_NAV = [
  {
    title: "Mi Día",
    items: [
      { name: "Mi Dashboard", href: "/dashboard", icon: Home },
      { name: "Agenda", href: "/agenda", icon: Calendar },
      { name: "Objetivos", href: "/objectives", icon: Target }
    ]
  },
  {
    title: "Operación de Campo",
    items: [
      { name: "Contactos (Directorio)", href: "/contacts", icon: Users },
      { name: "Fichero Médico (IP)", href: "/doctors", icon: Stethoscope },
      { name: "Farmacias & POS", href: "/pharmacies", icon: Store },
      { name: "Tiendas Naturistas", href: "/natural-stores", icon: Leaf },
      { name: "Droguerías", href: "/drugstores", icon: Truck },
      { name: "Centros de Salud", href: "/health-centers", icon: Building2 },
      { name: "Rutas y Territorios", href: "/visits", icon: FileText },
      { name: "Cobertura Global", href: "/coverage-map", icon: Map },
      { name: "Pedidos y Transferencias", href: "/transfer-orders", icon: Truck },
    ]
  },
  {
    title: "Recursos",
    items: [
      { name: "Catálogo", href: "/products", icon: Package },
      { name: "Muestras", href: "/muestras", icon: Pill }
    ]
  }
];

const COORDINATOR_NAV = [
  {
    title: "Supervisión",
    items: [
      { name: "Tablero de Mando", href: "/dashboard-supervisor", icon: BarChart3 },
      { name: "Agenda Equipo", href: "/agenda", icon: Calendar }, // Restored
      { name: "Mi Equipo", href: "/users", icon: Users },
      { name: "Rutas de Tropa", href: "/visits", icon: Map },
      // { name: "Cobertura", href: "/coverage-map", icon: Map }, // Hidden for Reps/Coordinators by default logic if this is shared? Wait, this is COORDINATOR_NAV.
      { name: "Cobertura", href: "/coverage-map", icon: Map }, // Coordinators see this. Reps use a different list?
    ]
  },
  {
    title: "Gestión",
    items: [
      { name: "Objetivos Equipo", href: "/objectives", icon: Target }, // Restored
      { name: "Planificador", href: "/planner", icon: ClipboardList }, // Restored
      { name: "Eventos", href: "/events", icon: CalendarCheck }, // Restored
      { name: "Pedidos Especiales", href: "/transfer-orders", icon: ClipboardList },
      { name: "Reportes", href: "/reports", icon: FileText },
    ]
  },
  {
    title: "Herramientas de Apoyo", // Restored full tools for support
    items: [
      { name: "Catálogo", href: "/products", icon: Package },
      { name: "Muestras", href: "/muestras", icon: Pill },
      { name: "Procesos", href: "/work-processes", icon: GitBranch },
      { name: "Activos", href: "/resources/assets", icon: Boxes },
    ]
  }
];

const TELEMARKETING_NAV = [
  {
    title: "Ventas Internas",
    items: [
      { name: "Panel de Ventas", href: "/dashboard", icon: Home },
      { name: "Lista de Llamadas", href: "/contacts", icon: Users },
      { name: "Nuevo Pedido", href: "/commercial/builder", icon: DollarSign },
      { name: "Mis Pedidos", href: "/transfer-orders", icon: Truck }, // Restored
      { name: "Objetivos Venta", href: "/objectives", icon: Target }, // Restored
    ]
  },
  {
    title: "Recursos",
    items: [
      { name: "Catálogo", href: "/products", icon: Package },
      { name: "Promociones", href: "/promotional-cycles", icon: Award },
      { name: "Procesos (Scripts)", href: "/work-processes", icon: GitBranch }, // Restored
    ]
  }
];

// DEFAULT NAV for Unassigned/Demo
const DEFAULT_NAV = [
  {
    title: "Inicio",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: Home },
      { name: "Ayuda", href: "/help", icon: HelpCircle },
    ]
  }
];

// MASTER SAAS NAV (Default View - No Org Selected)
const MASTER_SAAS_NAV = [
  {
    title: "SAAS CONTROL",
    items: [
      { name: "SaaS Dashboard", href: "/dashboard-master", icon: BarChart3 },
      { name: "Global Audit Logs", href: "/master/logs", icon: Shield },
      { name: "SaaS Billing", href: "/master/billing", icon: DollarSign },
      { name: "Alerts & Health", href: "/master/alerts", icon: Bell },
    ]
  },
  {
    title: "ADMINISTRACIÓN GLOBAL",
    items: [
      { name: "Organizaciones", href: "/master-panel?tab=orgs", icon: Building2 },
      { name: "Gestión de Cuentas", href: "/users", icon: Users },
      { name: "Talento Humano (LOTTT)", href: "/hr", icon: Shield },
      { name: "Planes & Suscripciones", href: "/master/plans", icon: Layers },
      { name: "Editor Landing Page", href: "/master/landing", icon: Globe },
    ]
  }
];

const SOPORTE_SAAS_NAV = [
  {
    title: "SOPORTE TÉCNICO",
    items: [
      { name: "Dashboard SaaS", href: "/dashboard-master", icon: BarChart3 },
      { name: "Tickets Activos", href: "/master/tickets", icon: HelpCircle },
      { name: "Documentación", href: "/documentation", icon: FileText },
    ]
  },
  {
    title: "GESTIÓN DE CLIENTES",
    items: [
      { name: "Organizaciones", href: "/master-panel?tab=orgs", icon: Building2 },
      { name: "Directorio de Usuarios", href: "/users", icon: Users },
    ]
  }
];

const DESARROLLO_SAAS_NAV = [
  {
    title: "DEV & MAINTENANCE",
    items: [
      { name: "Dashboard SaaS", href: "/dashboard-master", icon: BarChart3 },
      { name: "Logs de Auditoría", href: "/master/logs", icon: Shield },
      { name: "Estado del Sistema", href: "/master/alerts", icon: Bell },
    ]
  },
  {
    title: "OPERACIÓN TÉCNICA",
    items: [
      { name: "Organizaciones", href: "/master-panel?tab=orgs", icon: Building2 },
      { name: "Configuración Base", href: "/documentation", icon: Settings },
    ]
  }
];

const ADMIN_NAV = [
  ...OPERATIONAL_NAV,
  {
    title: "ADMINISTRACIÓN EMPRESARIAL",
    items: [
      { name: "Configuración General", href: "/settings", icon: Settings },
      { name: "Suscripción y Pagos", href: "/billing", icon: DollarSign }, // Placeholder for future tenant billing
      { name: "Auditoría Interna", href: "/logs", icon: Shield }, // Placeholder for tenant logs
    ]
  }
];

interface SidebarProps {
  className?: string;
  isMobile?: boolean; // Optional prop to detect mobile state
}

export function Sidebar({ className, isMobile = false }: SidebarProps) {
  const {
    user,
    signOut,
    isMaster,
    isAdmin,
    isManager,
    isChief,
    isCoordinator,
    isSupervisor,
    isTelemarketing,
    isSystemAdmin,
    isSaaSAdmin,
    isSaaSSupport,
    isSaaSDev,
    isSaaSStaff,
    role,
    organizationId,
    isDemo
  } = useAuth();

  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isPinned, setIsPinned] = useState(true);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  // Auto-collapse on mobile or logic
  // For now keep simple
  const togglePin = () => setIsPinned(!isPinned);
  const toggleGroup = (title: string, e: any) => {
    e.stopPropagation();
    setCollapsedGroups(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  const handleSignOut = async () => {
    await signOut();
  };

  // User Initials
  const userInitials = user?.email?.substring(0, 2).toUpperCase() || "U";
  const userName = user?.user_metadata?.first_name || user?.email?.split('@')[0] || "Usuario";
  const roleLabel = role?.toUpperCase() || "INVITADO";

  // --- SELECT NAVIGATION BY ROLE ---
  const getNavigationGroups = () => {
    // 1. SAAS STAFF - Internal Team Navigation
    if (isSaaSStaff) {
      // If Staff has selected an Organization (Impersonation Mode)
      if (organizationId) {
        return SYSTEM_ADMIN_NAV;
      }

      // Default: Pure SaaS Admin/Support/Dev View
      if (isMaster || isSaaSAdmin) return MASTER_SAAS_NAV;
      if (isSaaSSupport) return SOPORTE_SAAS_NAV;
      if (isSaaSDev) return DESARROLLO_SAAS_NAV;

      return MASTER_SAAS_NAV; // Fallback for staff
    }

    // 2. SAFETY CHECK: If no Org assigned (and not Master), restrict view. 
    // EXCEPTION: Trusted roles (Rep, Supervisor, etc.) pass even if OrgID is transiently missing to avoid UI lockout.
    const trustedRoles = ['representative', 'supervisor', 'coordinator', 'chief', 'telemarketing', 'manager', 'admin'];
    if (!organizationId && !isDemo && !trustedRoles.includes(role)) {
      return [
        {
          title: "CUENTA PENDIENTE",
          items: [
            { name: "Asignación Pendiente", href: "/dashboard", icon: Shield },
            { name: "Contactar Master", href: "mailto:soporte@medivisitpro.com", icon: HelpCircle },
          ]
        },
        ...DEFAULT_NAV
      ];
    }

    // 3. ROLE SPECIFIC NAV

    // Level 1: Company Owners & Support
    // Manager (Client Owner) and Admin (SaaS Support) see everything including Business Settings
    if (isManager || isAdmin) return ADMIN_NAV;

    // Level 2: High Level Operations (Chiefs)
    // Chiefs run the operation but don't own the business settings
    if (isChief) return OPERATIONAL_NAV;

    // Level 3: Coordinator / Supervisor (Team Leaders)
    if (isCoordinator || isSupervisor) return COORDINATOR_NAV;

    // Level 4: Desk Users (Telemarketing)
    if (isTelemarketing) return TELEMARKETING_NAV;

    // Level 5: Field Users (Representative)
    // Default fallback for representatives and specialized roles
    return REPRESENTATIVE_NAV;
  };

  const activeNavGroups = getNavigationGroups();

  return (
    <div
      className={cn(
        "flex flex-col bg-white text-slate-700 border-r border-gray-200 h-screen shadow-xl z-50 transition-all duration-300 ease-in-out",
        isExpanded ? "w-64" : "w-16",
        className
      )}
      onMouseEnter={() => !isMobile && setIsHovered(true)}
      onMouseLeave={() => !isMobile && setIsHovered(false)}
    >
      {/* Header */}
      <div className="flex items-center justify-between h-14 px-3 border-b border-gray-200 bg-white shadow-sm">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
            <Stethoscope className="h-5 w-5 text-primary" />
          </div>
          <div className={cn("transition-all duration-300", isExpanded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 pointer-events-none")}>
            <h1 className="text-sm font-bold text-slate-800 whitespace-nowrap">MediVisitPro</h1>
            <p className="text-[9px] text-slate-500 uppercase tracking-wider">Visitador</p>
          </div>
        </div>

        {/* Pin Toggle - Desktop Only */}
        {!isMobile && isExpanded && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-slate-400 hover:text-primary hover:bg-primary/5 transition-colors"
            onClick={togglePin}
            title={isPinned ? "Desafijar Menú" : "Fijar Menú"}
          >
            <Shield className={cn("h-4 w-4 transition-all", isPinned ? "fill-current text-primary rotate-0" : "rotate-45")} />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3 space-y-4 overflow-y-auto custom-scrollbar">
        {activeNavGroups.map((group, groupIndex) => {
          // No more internal filtering needed as the arrays are role-specific
          const hasAccessToGroup = true;

          if (!hasAccessToGroup) return null;

          const isGroupCollapsed = isExpanded && collapsedGroups[group.title];

          return (
            <div key={group.title} className="space-y-1">
              {/* Group Title - Clickable */}
              <div
                className={cn(
                  "px-2 flex items-center justify-between cursor-pointer group/header mb-1 transition-all duration-300",
                  isExpanded ? "opacity-100" : "opacity-0 h-0 overflow-hidden"
                )}
                onClick={(e) => toggleGroup(group.title, e)}
              >
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ">
                  {group.title}
                </div>
                <ChevronDown
                  className={cn(
                    "h-3 w-3 text-slate-600 transition-transform duration-200",
                    isGroupCollapsed ? "-rotate-90" : ""
                  )}
                />
              </div>

              {/* Separator for collapsed mode */}
              {!isExpanded && groupIndex > 0 && (
                <div className="my-2 mx-2 border-t border-slate-700/50" />
              )}

              {/* Group Items Container */}
              <div className={cn(
                "space-y-1 transition-all duration-300",
                isGroupCollapsed ? "hidden" : "block"
              )}>
                {group.items.map((item: any) => {
                  // Staff users always use root routes (real data) even if in Demo Org
                  const itemHref = isSaaSStaff ? item.href : (isDemo ? `/demo${item.href}` : item.href);
                  const isActive = location.pathname === itemHref;
                  return (
                    <NavLink
                      key={item.name}
                      to={itemHref}
                      title={!isExpanded ? item.name : undefined}
                      onClick={(e) => {
                        // FIX: When on coverage-map, Leaflet corrupts React Router state
                        // Use hard navigation to ensure proper page transition
                        const targetPath = itemHref;
                        if (location.pathname.includes('/coverage-map') && !targetPath.includes('/coverage-map')) {
                          e.preventDefault();
                          console.log('[Sidebar] Hard navigation from coverage-map to:', targetPath);
                          window.location.href = targetPath;
                        }
                      }}
                      className={cn(
                        "flex items-center px-2 py-2 text-sm font-medium rounded-lg transition-all group",
                        isActive
                          ? "bg-primary text-white shadow-md shadow-primary/20"
                          : "text-slate-500 hover:bg-slate-100 hover:text-primary"
                      )}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      <span className={cn("ml-3 whitespace-nowrap transition-all duration-300", isExpanded ? "opacity-100" : "opacity-0 w-0 overflow-hidden")}>
                        {item.name}
                      </span>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Footer - User Info */}
      <div className="p-2 bg-gray-50 border-t border-gray-200">
        {isExpanded ? (
          // Expanded: show user info and logout
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-primary">{userInitials}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-slate-700 truncate">{userName}</p>
                <p className="text-[10px] text-slate-500 truncate">{roleLabel}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-400 hover:text-primary hover:bg-slate-100 flex-shrink-0 h-8 w-8"
              onClick={handleSignOut}
              title="Cerrar Sesión"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          // Collapsed: only logout icon centered
          <div className="flex justify-center">
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-400 hover:text-primary hover:bg-slate-100 h-10 w-10"
              onClick={handleSignOut}
              title="Cerrar Sesión"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}