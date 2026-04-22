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
  ChevronDown,
  TrendingUp,
  ShieldCheck,
  Map,
  Leaf,
  ShoppingCart,
  Store,
  Zap,
  Stethoscope,
  Calendar,
  MapPin,
  FileText,
  Pill,
  ClipboardList,
  Sprout,
  FlaskConical
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
    isRepresentative,
    organizationName
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
    if (isMaster) return 'Sovereign Master';
    if (isAdmin) return 'Admin Elite';
    if (isManager) return 'Gerente CA';
    if (isCoordinator) return 'Coordinador';
    if (isSupervisor) return 'Supervisor';
    return 'Representante';
  };

  // Visibility Logic for Navigation Items (ZERO TRUST SECURITY)
  const canSeeMaster = isMaster;
  const canSeeManagement = isMaster || isAdmin || isManager || isCoordinator || isSupervisor;
  const canSeeAnalytics = isMaster || isAdmin || isManager;
  const canSeeZones = isMaster || isAdmin || isManager;
  const canSeeHR = isMaster || isAdmin || isManager;

  const filteredNav = [
    {
      title: "CORE SYSTEM",
      items: [
        { name: "Centro de Mando", href: "/dashboard-master", icon: BarChart3, visible: canSeeMaster },
        { name: "Dashboard Operativo", href: "/dashboard", icon: Home, visible: true },
        { name: "Panel Master", href: "/master-panel", icon: Crown, visible: canSeeMaster },
        { name: "Control Organizaciones", href: "/master-panel?tab=orgs", icon: Building2, visible: canSeeMaster },
        { name: "SaaS & Facturación", href: "/master/billing", icon: DollarSign, visible: canSeeMaster },
        { name: "Auditoría de Sistema", href: "/master/logs", icon: Shield, visible: canSeeMaster },
        { name: "Finance Monitor", href: "/finance-monitor", icon: BarChart3, visible: canSeeAnalytics },
        { name: "Búnker de Activos", href: "/asset-bunker", icon: ShieldCheck, visible: canSeeMaster },
      ]
    },
    {
      title: "CENTRO MÉDICO & AGENDA",
      items: [
        { name: "Mis Médicos", href: "/doctors", icon: Stethoscope, visible: true },
        { name: "Agenda Táctica", href: "/agenda", icon: Calendar, visible: true },
        { name: "Planificador Ruta", href: "/planner", icon: MapPin, visible: true },
        { name: "Visitas de Hoy", href: "/visits", icon: ClipboardList, visible: true },
        { name: "Muestras Médicas", href: "/muestras", icon: Pill, visible: true },
      ]
    },
    {
      title: "GESTIÓN COMERCIAL & EQUIPO",
      items: [
        { name: "Mi Equipo (Usuarios)", href: "/users", icon: Users, visible: canSeeManagement },
        { name: "Talento Humano (LOTTT)", href: "/hr", icon: Shield, visible: canSeeHR },
        { name: "Pipeline de Ventas", href: "/sales-pipeline", icon: TrendingUp, visible: true },
        { name: "Zonas y Territorios", href: "/zones", icon: GitBranch, visible: canSeeZones },
        { name: "Procesos de Trabajo", href: "/work-processes", icon: Layers, visible: true },
      ]
    },
    {
      title: "OPERACIÓN DE CAMPO",
      items: [
        { name: "Pedidos y Transferencias", href: "/transfer-orders", icon: Truck, visible: true },
        { name: "Centros de Salud", href: "/health-centers", icon: Building2, visible: true },
        { name: "Farmacias & POS", href: "/pharmacies", icon: Store, visible: true },
        { name: "Tiendas Naturistas", href: "/natural-stores", icon: Sprout, visible: true },
        { name: "Comercios", href: "/commerces", icon: Store, visible: true },
        { name: "Droguerías", href: "/drugstores", icon: FlaskConical, visible: true },
        { name: "Cobertura Global", href: "/coverage-map", icon: Map, visible: canSeeManagement },
      ]
    }
  ].map(group => ({
    ...group,
    items: group.items.filter(item => item.visible)
  })).filter(group => group.items.length > 0);

  return (
    <div
      className={cn(
        "flex flex-col bg-card text-foreground border-r border-border h-screen shadow-premium-md z-50 transition-all duration-300 ease-in-out font-display",
        isExpanded ? "w-72" : "w-16",
        className
      )}
    >
      {/* Header Naturista Elite */}
      <div className="flex items-center justify-between h-24 px-4 border-b border-border bg-background/50 backdrop-blur-md relative overflow-hidden">
        <div className="flex items-center gap-4 overflow-hidden" onClick={() => setIsExpanded(!isExpanded)}>
          <div className="w-12 h-12 bg-primary text-primary-foreground rounded-[1.2rem] flex items-center justify-center shadow-xl flex-shrink-0 cursor-pointer hover:scale-110 transition-transform premium-icon">
            <Zap className="h-6 w-6" />
          </div>
          {isExpanded && (
            <div className="animate-in fade-in slide-in-from-left duration-500">
              <h1 className="text-xl font-black text-foreground tracking-tighter uppercase leading-none">MediVisitPro</h1>
              <div className="flex items-center gap-2 mt-1.5">
                <Badge className="bg-primary/5 text-primary border-none font-black text-[8px] uppercase tracking-widest px-2 py-0.5">
                  {getRoleLabel(role)}
                </Badge>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Elite */}
      <nav className="flex-1 px-3 py-6 space-y-6 overflow-y-auto custom-scrollbar scrollbar-none">
        {filteredNav.map((group) => (
          <div key={group.title} className="space-y-2">
            {isExpanded && (
              <div className="px-3 flex items-center justify-between cursor-pointer mb-2 group/title" onClick={(e) => toggleGroup(group.title, e)}>
                <div className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em]  group-hover/title:text-primary transition-colors">{group.title}</div>
                <ChevronDown className={cn("h-3 w-3 text-muted-foreground transition-all group-hover/title:text-primary", collapsedGroups[group.title] ? "-rotate-90" : "rotate-0")} />
              </div>
            )}
            {!collapsedGroups[group.title] && (
              <div className="space-y-1 animate-in fade-in slide-in-from-top-2 duration-300">
                {group.items.map((item: any) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <NavLink
                      key={item.name}
                      to={item.href}
                      className={cn(
                        "flex items-center px-4 py-3 text-sm font-black rounded-[1.2rem] transition-all group relative overflow-hidden uppercase  tracking-tight",
                         isActive 
                          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                          : "text-muted-foreground hover:bg-muted/50 hover:text-primary transition-colors"
                      )}
                    >
                      {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-background" />}
                      <item.icon className={cn("h-5 w-5 flex-shrink-0 transition-transform group-hover:scale-110 premium-icon", isActive ? "text-primary-foreground premium-icon-active" : "text-muted-foreground premium-icon-hover")} />
                      {isExpanded && <span className="ml-4 transition-all">{item.name}</span>}
                    </NavLink>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Profile Footer Elite - Light Clean */}
      <div className="p-4 bg-muted/30 border-t border-border mt-auto">
        <div className={cn("flex items-center gap-4 p-3 bg-card rounded-[1.8rem] border border-border shadow-sm", !isExpanded && "justify-center")}>
          <div className="w-12 h-12 bg-primary/5 rounded-[1.1rem] flex items-center justify-center flex-shrink-0 border border-primary/10 group hover:border-primary/30 transition-colors">
            <span className="text-sm font-black text-primary">{userInitials}</span>
          </div>
          {isExpanded && (
            <div className="min-w-0 flex-1 animate-in fade-in slide-in-from-left duration-500">
              <p className="text-xs font-black text-foreground truncate uppercase ">{userName}</p>
              <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">{organizationName || 'MediVisitPro Premier'}</p>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 p-0 text-[10px] text-rose-500 hover:text-rose-600 hover:bg-transparent font-black uppercase tracking-widest mt-1.5" 
                onClick={handleSignOut}
              >
                Cerrar Sesión
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
