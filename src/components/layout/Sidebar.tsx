/* ========================================================================
 MASTER FRAMEWORK - CESAR ASCANIO CA
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
  Target,
  Pill,
  DollarSign,
  Bell,
  HelpCircle,
  ClipboardList,
  Store,
  Shield,
  LogOut,
  Crown,
  Truck,
  Layers,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  Map,
  Leaf,
  Globe,
  Award,
  CalendarCheck
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

// Navigation Groups
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
      { name: "Finance Monitor", href: "/finance-monitor", icon: BarChart3 },
      { name: "Búnker de Activos", href: "/asset-bunker", icon: ShieldCheck },
    ]
  },
  {
    title: "GESTIÓN COMERCIAL & EQUIPO",
    items: [
      { name: "Mi Equipo (Usuarios)", href: "/users", icon: Users },
      { name: "Talento Humano (LOTTT)", href: "/hr", icon: Shield },
      { name: "Pipeline de Ventas", href: "/sales-pipeline", icon: TrendingUp },
      { name: "Zonas y Territorios", href: "/zones", icon: GitBranch },
    ]
  },
  {
    title: "OPERACIÓN DE CAMPO",
    items: [
      { name: "Pedidos y Transferencias", href: "/transfer-orders", icon: Truck },
      { name: "Farmacias & POS", href: "/pharmacies", icon: Store },
      { name: "Droguerías", href: "/drugstores", icon: Truck },
      { name: "Cobertura Global", href: "/coverage-map", icon: Map },
    ]
  }
];

interface SidebarProps {
  className?: string;
  isMobile?: boolean;
}

export function Sidebar({ className, isMobile = false }: SidebarProps) {
  const {
    user,
    signOut,
    role,
    isSaaSStaff
  } = useAuth();

  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(true);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (title: string, e: any) => {
    e.stopPropagation();
    setCollapsedGroups(prev => ({ ...prev, [title]: !prev[title] }));
  };

  const handleSignOut = async () => { await signOut(); };

  const userInitials = user?.email?.substring(0, 2).toUpperCase() || "U";
  const userName = user?.user_metadata?.first_name || user?.email?.split('@')[0] || "Usuario";
  
  const getRoleLabel = (r: string) => {
    switch (r) {
      case 'master': return 'System Admin';
      case 'admin': return 'Administrador';
      case 'manager': return 'Gerente';
      default: return 'Usuario';
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col bg-card text-foreground border-r border-border h-screen shadow-xl z-50 transition-all duration-300 ease-in-out",
        isExpanded ? "w-64" : "w-16",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between h-20 px-3 border-b border-border bg-card/50 backdrop-blur-md relative overflow-hidden">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-12 h-12 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 flex-shrink-0">
            <Stethoscope className="h-6 w-6" />
          </div>
          {isExpanded && (
            <div>
              <h1 className="text-base font-black text-foreground whitespace-nowrap">MediVisitPro</h1>
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{getRoleLabel(role)}</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3 space-y-4 overflow-y-auto custom-scrollbar">
        {SYSTEM_ADMIN_NAV.map((group) => (
          <div key={group.title} className="space-y-1">
            {isExpanded && (
              <div className="px-2 flex items-center justify-between cursor-pointer mb-1" onClick={(e) => toggleGroup(group.title, e)}>
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{group.title}</div>
                <ChevronDown className={cn("h-3 w-3 text-muted-foreground transition-all", collapsedGroups[group.title] ? "-rotate-90" : "")} />
              </div>
            )}
            {!collapsedGroups[group.title] && (
              <div className="space-y-1">
                {group.items.map((item: any) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <NavLink
                      key={item.name}
                      to={item.href}
                      className={cn(
                        "flex items-center px-3 py-2.5 text-sm font-semibold rounded-xl transition-all group",
                        isActive ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
                      )}
                    >
                      <item.icon className={cn("h-5 w-5 flex-shrink-0", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary")} />
                      {isExpanded && <span className="ml-3 font-medium transition-all">{item.name}</span>}
                    </NavLink>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Profile Footer */}
      <div className="p-3 bg-muted/20 border-t border-border mt-auto">
        <div className={cn("flex items-center gap-3 p-2 bg-card rounded-2xl border border-border shadow-sm", !isExpanded && "justify-center")}>
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-black text-primary">{userInitials}</span>
          </div>
          {isExpanded && (
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-foreground truncate">{userName}</p>
              <Button variant="ghost" size="sm" className="h-6 p-0 text-[10px] text-red-500 hover:bg-transparent font-black" onClick={handleSignOut}>LOGOUT</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}