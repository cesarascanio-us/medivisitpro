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
  Leaf
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

// Navigation Groups
// --- STRICT NAVIGATION CONFIGURATIONS ---

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
      { name: "Reportes Globales", href: "/reports", icon: BarChart3 },
      { name: "Planificación & Ciclos", href: "/planning/cycles", icon: Layers },
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

const MANAGER_NAV = [
  {
    title: "Gestión Local",
    items: [
      { name: "Mi Dashboard", href: "/dashboard", icon: Home },
      { name: "Mi Equipo", href: "/users", icon: Users },
      { name: "Contactos", href: "/contacts", icon: Users }, // Restored
      { name: "Tiendas Naturistas", href: "/natural-stores", icon: Leaf },
      { name: "Centros de Salud", href: "/health-centers", icon: Building2 },
      { name: "Zona / Territorio", href: "/zones", icon: Map },
      { name: "Reportes Venta", href: "/reports", icon: BarChart3 },
    ]
  },
  {
    title: "Operaciones",
    items: [
      { name: "Ciclos Promo", href: "/promotional-cycles", icon: RefreshCw },
      { name: "Planificación", href: "/planning/cycles", icon: Layers },
      { name: "Control Almacén", href: "/warehouse", icon: Boxes },
      { name: "Transfer Orders", href: "/transfer-orders", icon: Truck },
    ]
  },
  {
    title: "Catálogo & Stock",
    items: [
      { name: "Productos", href: "/products", icon: Package },
      { name: "Muestras", href: "/muestras", icon: Pill },
      { name: "Material POP", href: "/material-pop", icon: Megaphone },
    ]
  }
];

const REPRESENTATIVE_NAV = [
  {
    title: "Mi Jornada",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: Home },
      { name: "Agenda", href: "/agenda", icon: Calendar },
      { name: "Contactos", href: "/contacts", icon: Users }, // Restored
      { name: "Fichero Médico", href: "/doctors", icon: Stethoscope },
      { name: "Farmacias", href: "/pharmacies", icon: Store },
    ]
  },
  {
    title: "Actividad Comercial",
    items: [
      { name: "Mis Visitas", href: "/visits", icon: FileText },
      { name: "Mis Pedidos", href: "/transfer-orders", icon: Truck },
      { name: "Planificador", href: "/planner", icon: ClipboardList },
      { name: "Gastos", href: "/expenses", icon: DollarSign },
    ]
  },
  {
    title: "Herramientas",
    items: [
      { name: "Muestras", href: "/muestras", icon: Pill },
      { name: "Catálogo", href: "/products", icon: Package },
      { name: "Mapa", href: "/coverage-map", icon: Map },
    ]
  }
];

// Fallback for other roles (supervisor, telemarketing, etc.)
const DEFAULT_NAV = [
  {
    title: "Inicio",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: Home },
      { name: "Contactos", href: "/contacts", icon: Users },
      { name: "Ayuda", href: "/help", icon: HelpCircle },
    ]
  }
];

interface SidebarProps {
  className?: string;
  isMobile?: boolean; // New prop for mobile sheet
}

export function Sidebar({ className, isMobile = false }: SidebarProps) {
  const location = useLocation();
  const { user, signOut, role, isMaster, isSystemAdmin, isAdmin, isManager, isRepresentative, isSupervisor, isTelemarketing, isCoordinator, isChief, isSpecializedRole, isDemo, canUseSales, canUseEvents, canUseWarehouse, features, organizationId } = useAuth();

  // Persistent pinned state for desktop
  const [isPinned, setIsPinned] = useState(() => {
    if (typeof window !== 'undefined' && !isMobile) {
      return localStorage.getItem('sidebar-pinned') === 'true';
    }
    return false;
  });

  const [isHovered, setIsHovered] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  // Side effect to update localStorage when pinned state changes
  const togglePin = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newPinned = !isPinned;
    setIsPinned(newPinned);
    if (!isMobile) {
      localStorage.setItem('sidebar-pinned', String(newPinned));
    }
  };

  // Sidebar is expanded if pinned, hovered, or in mobile mode
  const isExpanded = isMobile || isPinned || isHovered;

  const toggleGroup = (title: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent affecting sidebar expansion if needed
    setCollapsedGroups(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  const userEmail = user?.email || '';
  const userName = userEmail.split('@')[0] || 'Usuario';
  const userInitials = userName.substring(0, 2).toUpperCase();

  const roleLabels: Record<string, string> = {
    master: 'Master',
    admin: 'Admin',
    manager: 'Gerente',
    supervisor: 'Supervisor',
    representative: 'Rep'
  };
  const roleLabel = isSystemAdmin ? 'System Admin' : (roleLabels[role as string] || 'Usuario');

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // --- NEW ROLE CONFIGURATIONS ---

  const COORDINATOR_NAV = [
    {
      title: "Supervisión",
      items: [
        { name: "Tablero de Mando", href: "/dashboard-supervisor", icon: BarChart3 },
        { name: "Mi Equipo", href: "/users", icon: Users },
        { name: "Rutas de Tropa", href: "/visits", icon: Map },
      ]
    },
    {
      title: "Aprobaciones",
      items: [
        { name: "Pedidos Especiales", href: "/transfer-orders", icon: ClipboardList },
        { name: "Reportes", href: "/reports", icon: FileText },
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
      ]
    },
    {
      title: "Catálogo",
      items: [
        { name: "Productos", href: "/products", icon: Package },
        { name: "Promociones", href: "/promotional-cycles", icon: Award },
      ]
    }
  ];

  // ... (existing constants)

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
        { name: "Usuarios Globales", href: "/users", icon: Users },
        { name: "Planes & Suscripciones", href: "/master/plans", icon: Layers },
      ]
    },
    {
      title: "SOPORTE & AYUDA",
      items: [
        { name: "Tickets de Soporte", href: "/master/tickets", icon: HelpCircle },
        { name: "Base de Conocimiento", href: "/documentation", icon: FileText },
      ]
    }
  ];

  // ... (Existing Constants)

  // --- SELECT NAVIGATION BY ROLE ---
  const getNavigationGroups = () => {
    // 1. MASTER - THE POWER OF ALL (God Mode vs SaaS Mode)
    if (isMaster || isSystemAdmin) {
      // If Master has selected an Organization (Drill-down / Impersonation Mode)
      // Show the full Operational Suite for that Org
      if (organizationId) {
        return SYSTEM_ADMIN_NAV;
      }
      // Default: Pure SaaS Admin View
      return MASTER_SAAS_NAV;
    }

    // 2. SAFETY CHECK: If no Org assigned (and not Master), restrict view
    if (!organizationId && !isDemo) {
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

    // Level 2: Manager / General Admin
    if (isManager || isAdmin || isChief) return MANAGER_NAV;

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
        "flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border h-screen shadow-2xl z-30 transition-all duration-300 ease-in-out",
        isExpanded ? "w-64" : "w-16",
        className
      )}
      onMouseEnter={() => !isMobile && setIsHovered(true)}
      onMouseLeave={() => !isMobile && setIsHovered(false)}
    >
      {/* Header */}
      <div className="flex items-center justify-between h-14 px-3 border-b border-slate-700/50">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25 flex-shrink-0">
            <Stethoscope className="h-5 w-5 text-white" />
          </div>
          <div className={cn("transition-all duration-300", isExpanded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 pointer-events-none")}>
            <h1 className="text-sm font-bold text-white whitespace-nowrap">MediVisitPro</h1>
            <p className="text-[9px] text-slate-400 uppercase tracking-wider">Visitador</p>
          </div>
        </div>

        {/* Pin Toggle - Desktop Only */}
        {!isMobile && isExpanded && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-slate-500 hover:text-white"
            onClick={togglePin}
            title={isPinned ? "Desafijar Menú" : "Fijar Menú"}
          >
            <Shield className={cn("h-4 w-4 transition-all", isPinned ? "fill-current text-white rotate-0" : "rotate-45")} />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3 space-y-4 overflow-y-auto custom-scrollbar">
        {activeNavGroups.map((group, groupIndex) => {
          // No more internal filtering needed as the arrays are role-specific
          const hasAccessToGroup = true;

          if (!hasAccessToGroup) return null;

          // Logic to force expand if sidebar is minimized so icons are accessible, 
          // OR we could just let them trigger it. But with hidden titles, they can't trigger it when minimized.
          // Best UX: When minimized, ignore collapsed state (always show). When expanded, respect state.
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

              {/* Group Items Container - Animated Height? keeping simple for now */}
              <div className={cn(
                "space-y-1 transition-all duration-300",
                isGroupCollapsed ? "hidden" : "block"
              )}>
                {group.items.map((item: any) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <NavLink
                      key={item.name}
                      to={item.href}
                      title={!isExpanded ? item.name : undefined}
                      className={cn(
                        "flex items-center px-2 py-2 text-sm font-medium rounded-lg transition-all group",
                        isActive
                          ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25"
                          : "text-slate-400 hover:bg-slate-800 hover:text-white"
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
      <div className="p-2 bg-slate-900/50 border-t border-slate-700/50">
        {isExpanded ? (
          // Expanded: show user info and logout
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/25 flex-shrink-0">
                <span className="text-xs font-bold text-white">{userInitials}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-white truncate">{userName}</p>
                <p className="text-[10px] text-slate-400 truncate">{roleLabel}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-400 hover:text-white hover:bg-slate-800 flex-shrink-0 h-8 w-8"
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
              className="text-slate-400 hover:text-white hover:bg-slate-800 h-10 w-10"
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