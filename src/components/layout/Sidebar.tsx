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
  ChevronDown
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

// Navigation Groups
const navigationGroups = [
  {
    title: "Inicio",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: Home },
      { name: "Centro de Mando", href: "/dashboard-master", icon: BarChart3, managerOnly: true },
      { name: "Panel Master", href: "/master-panel", icon: Crown, adminOnly: true },
      { name: "Mapa", href: "/coverage-map", icon: Map },
    ]
  },
  {
    title: "Gestión Clientes",
    items: [
      { name: "Contactos", href: "/contacts", icon: Users },
      { name: "Médicos", href: "/doctors", icon: UserRound },
      { name: "Farmacias", href: "/pharmacies", icon: Store },
      { name: "Droguerías", href: "/drugstores", icon: Truck },
      { name: "Centros", href: "/health-centers", icon: Building2 },
    ]
  },
  {
    title: "Actividad Comercial",
    items: [
      { name: "Agenda", href: "/agenda", icon: Calendar, repOnly: true },
      { name: "Visitas", href: "/visits", icon: FileText },
      { name: "Planificador", href: "/planner", icon: ClipboardList, repOnly: true },
      { name: "Planificación", href: "/planning/weekly", icon: CalendarCheck, repOnly: true },
      { name: "Eventos", href: "/events", icon: CalendarDays },
      { name: "Ventas", href: "/transfer-orders", icon: Truck, managerOnly: true },
      { name: "Objetivos", href: "/objectives", icon: Target },
      { name: "Gastos", href: "/expenses", icon: DollarSign, repOnly: true },
    ]
  },
  {
    title: "Inventario",
    items: [
      { name: "Productos", href: "/products", icon: Package },
      { name: "Muestras", href: "/muestras", icon: Pill },
      { name: "Material POP", href: "/material-pop", icon: Megaphone },
      { name: "Almacén", href: "/warehouse", icon: Boxes, managerOnly: true },
    ]
  },
  {
    title: "Administración",
    items: [
      { name: "Ciclos Promo", href: "/promotional-cycles", icon: RefreshCw, managerOnly: true },
      { name: "Ciclos", href: "/planning/cycles", icon: Layers, managerOnly: true },
      { name: "Procesos", href: "/work-processes", icon: GitBranch },
      { name: "Reportes", href: "/reports", icon: BarChart3, adminOnly: true, managerOnly: true }, // Logic adjusted below to allow managers
      { name: "Notificaciones", href: "/notifications", icon: Bell },
      { name: "Especialidades", href: "/specialties", icon: Stethoscope, managerOnly: true },
      { name: "Usuarios", href: "/users", icon: Shield, adminOnly: true },
      { name: "Zonas", href: "/zones", icon: Building2, adminOnly: true },
      { name: "Config", href: "/settings", icon: Settings },
      { name: "Ayuda", href: "/help", icon: HelpCircle },
      // Master specific mixed in Admin group or separate? Keeping simple for now
      { name: "Soporte", href: "/master/tickets", icon: HelpCircle, adminOnly: true },
      { name: "Auditoría", href: "/master/logs", icon: Shield, adminOnly: true },
      { name: "Facturación", href: "/master/billing", icon: DollarSign, adminOnly: true },
      { name: "Alertas", href: "/master/alerts", icon: Bell, adminOnly: true },
      { name: "Planes", href: "/master/plans", icon: Target, adminOnly: true },
    ]
  }
];

interface SidebarProps {
  className?: string;
  isMobile?: boolean; // New prop for mobile sheet
}

export function Sidebar({ className, isMobile = false }: SidebarProps) {
  const location = useLocation();
  const { user, signOut, role, isMaster, isAdmin, isManager, isSupervisor, isDemo, canUseSales, canUseEvents, canUseWarehouse } = useAuth();

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
  const roleLabel = roleLabels[role as string] || 'Usuario';

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

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
        {navigationGroups.map((group, groupIndex) => {
          // Check if user has access to at least one item in the group
          const hasAccessToGroup = group.items.some(item => {
            // Access logic duplicated for check
            const salesItems = ["Agenda", "Planificación", "Planificador", "Visitas", "Objetivos", "Gastos", "Muestras", "Material POP"];
            if (salesItems.includes(item.name) && !canUseSales) return false;
            if (item.name === "Eventos" && !canUseEvents) return false;
            if (item.name === "Ciclo Promo" && !isManager) return false; // Fixed name check
            if (item.name === "Control Almacén" && !canUseWarehouse) return false; // Fixed name check

            if (item.adminOnly && !isAdmin && !isMaster) return false;
            // Allow managers to see reports
            if (item.managerOnly && !isManager && !isAdmin && !isMaster && item.name !== "Reportes") return false;
            if (item.name === "Reportes" && !isManager && !isAdmin && !isMaster) return false;
            if (item.repOnly && isSupervisor) return false;
            return true;
          });

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
                  // Feature Toggle Checks
                  const salesItems = ["Agenda", "Planificación", "Planificador", "Visitas", "Objetivos", "Gastos", "Muestras", "Material POP"];
                  if (salesItems.includes(item.name) && !canUseSales) return null;

                  if (item.name === "Eventos" && !canUseEvents) return null;
                  if (item.name === "Control Almacén" && !canUseWarehouse) return null;

                  // Filter by role/permission
                  if (item.adminOnly && !isAdmin && !isMaster) return null;
                  if (item.managerOnly && !isManager && !isAdmin && !isMaster && item.name !== "Reportes") return null;
                  if (item.name === "Reportes" && !isManager && !isAdmin && !isMaster) return null;
                  // Hide rep-only items for supervisors
                  if (item.repOnly && isSupervisor) return null;

                  // Hide specific modules for demo users
                  const demoHiddenItems = ["Mapa", "Planificador", "Planificación", "Ciclos", "Procesos"];
                  if (isDemo && demoHiddenItems.includes(item.name)) return null;

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