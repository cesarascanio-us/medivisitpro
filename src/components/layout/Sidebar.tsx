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
  FlaskConical,
  LogOut,
  LayoutDashboard
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
    organizationName,
    loading
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
    if (isMaster) return 'Master';
    if (isAdmin) return 'Administrador';
    if (isManager) return 'Gerente';
    if (isCoordinator) return 'Coordinador';
    if (isSupervisor) return 'Supervisor';
    return 'Representante';
  };

  const canSeeMaster = isMaster;
  const canSeeManagement = isMaster || isAdmin || isManager || isCoordinator || isSupervisor;
  const canSeeAnalytics = isMaster || isAdmin || isManager;
  const canSeeZones = isMaster || isAdmin || isManager;
  const canSeeHR = isMaster || isAdmin || isManager;

  const filteredNav = [
    {
      title: "Panel de Control",
      items: [
        { name: "Panel Principal", href: "/dashboard-master", icon: BarChart3, visible: canSeeMaster },
        { name: "Resumen de Actividad", href: "/dashboard", icon: Home, visible: true },
        { name: "Consola de Administración", href: "/master-panel", icon: Crown, visible: canSeeMaster },
        { name: "Monitor Financiero", href: "/finance-monitor", icon: DollarSign, visible: canSeeAnalytics },
        { name: "Gestión de Seguridad", href: "/asset-bunker", icon: ShieldCheck, visible: canSeeMaster },
      ]
    },
    {
      title: "Gestión Médica",
      items: [
        { name: "Historial de Visitas", href: "/visits", icon: ClipboardList, visible: true },
        { name: "Banco de Muestras", href: "/sample-banks", icon: Pill, visible: true },
        { name: "Directorio Profesional", href: "/doctors", icon: Stethoscope, visible: true },
        { name: "Agenda de Visitas", href: "/agenda", icon: Calendar, visible: true },
        { name: "Planificador de Rutas", href: "/planner", icon: MapPin, visible: true },
      ]
    },
    {
      title: "Gestión Comercial",
      items: [
        { name: "Gestión de Usuarios", href: "/users", icon: Users, visible: canSeeManagement },
        { name: "Capital Humano", href: "/hr", icon: Shield, visible: canSeeHR },
        { name: "Pipeline de Ventas", href: "/sales-pipeline", icon: TrendingUp, visible: true },
        { name: "Territorios", href: "/zones", icon: GitBranch, visible: canSeeZones },
        { name: "Modelado de Procesos", href: "/work-processes", icon: Layers, visible: true },
      ]
    },
    {
      title: "Logística y Cobertura",
      items: [
        { name: "Transferencias", href: "/transfer-orders", icon: Truck, visible: true },
        { name: "Centros Médicos", href: "/health-centers", icon: Building2, visible: true },
        { name: "Farmacias y POS", href: "/pharmacies", icon: Store, visible: true },
        { name: "Droguerías Aliadas", href: "/drugstores", icon: FlaskConical, visible: true },
        { name: "Mapa de Cobertura", href: "/coverage-map", icon: Map, visible: canSeeManagement },
      ]
    }
  ].map(group => ({
    ...group,
    items: group.items.filter(item => item.visible)
  })).filter(group => group.items.length > 0);

  return (
    <div
      className={cn(
        "flex flex-col bg-card text-foreground border-r border-border/40 h-screen shadow-premium-2xl z-50 transition-all duration-500 ease-in-out font-display",
        isExpanded ? "w-80" : "w-24",
        className
      )}
    >
      {/* Branding Section */}
      <div className="flex items-center justify-between h-28 px-6 border-b border-border/40 bg-muted/5 backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-primary/5 opacity-50" />
        <div className="flex items-center gap-5 overflow-hidden relative z-10" onClick={() => setIsExpanded(!isExpanded)}>
          <div className="w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center shadow-premium-md flex-shrink-0 cursor-pointer hover:scale-105 active:scale-95 transition-all duration-300">
            <Zap className="h-7 w-7" />
          </div>
          {isExpanded && (
            <div className="animate-in fade-in slide-in-from-left-5 duration-700">
              <h1 className="text-2xl font-black text-foreground tracking-tighter leading-none uppercase">Elite</h1>
              <div className="flex items-center gap-2 mt-2">
                <Badge className="bg-primary/10 text-primary border-primary/20 font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-lg">
                  {getRoleLabel(role)}
                </Badge>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Section */}
      <nav className="flex-1 px-4 py-8 space-y-10 overflow-y-auto custom-scrollbar scrollbar-none">
        {loading ? (
          <div className="space-y-10 animate-pulse">
            {[1, 2, 3].map(i => (
              <div key={i} className="space-y-4 px-4">
                <div className="h-2 w-20 bg-muted rounded" />
                <div className="space-y-2">
                  <div className="h-10 w-full bg-muted rounded-2xl" />
                  <div className="h-10 w-full bg-muted rounded-2xl" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          filteredNav.map((group) => (
          <div key={group.title} className="space-y-4">
            {isExpanded && (
              <div className="px-4 flex items-center justify-between cursor-pointer group/title" onClick={(e) => toggleGroup(group.title, e)}>
                <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] group-hover/title:text-primary transition-colors">{group.title}</div>
                <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground transition-all duration-500 group-hover/title:text-primary", collapsedGroups[group.title] ? "-rotate-90" : "rotate-0")} />
              </div>
            )}
            {!collapsedGroups[group.title] && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-500">
                {group.items.map((item: any) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <NavLink
                      key={item.name}
                      to={item.href}
                      className={cn(
                        "flex items-center px-5 py-2 text-elite-sm rounded-2xl transition-all group relative overflow-hidden",
                         isActive 
                          ? "bg-primary text-white shadow-premium-lg shadow-primary/20" 
                          : "text-muted-foreground hover:bg-muted/10 hover:text-primary border border-transparent hover:border-border/40 transition-all duration-300"
                      )}
                    >
                      {isActive && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-white/30" />}
                      <item.icon className={cn("h-5 w-5 flex-shrink-0 transition-all duration-500 group-hover:scale-110", isActive ? "text-white" : "text-muted-foreground/60 group-hover:text-primary")} />
                      {isExpanded && <span className="ml-4 truncate">{item.name}</span>}
                    </NavLink>
                  );
                })}
              </div>
            )}
            </div>
          ))
        )}
      </nav>

      {/* Profile Footer Section */}
      <div className="p-6 bg-muted/5 border-t border-border/40 mt-auto">
        <div className={cn("flex items-center gap-5 p-4 bg-card rounded-[2rem] border border-border/40 shadow-inner group", !isExpanded && "justify-center")}>
          <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center flex-shrink-0 border border-primary/20 group-hover:scale-105 transition-transform duration-500">
            <span className="text-base font-black text-primary">{userInitials}</span>
          </div>
          {isExpanded && (
            <div className="min-w-0 flex-1 animate-in fade-in slide-in-from-left-5 duration-700">
              <p className="text-sm font-black text-foreground uppercase tracking-tight truncate">{userName}</p>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest truncate mt-1 opacity-70">{organizationName || 'MediVisitPro Premier'}</p>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 p-0 text-[10px] text-rose-500 hover:text-rose-400 hover:bg-transparent font-black uppercase tracking-widest mt-2 flex items-center gap-2 group/logout" 
                onClick={handleSignOut}
              >
                <LogOut className="h-3.5 w-3.5 group-hover/logout:-translate-x-1 transition-transform" />
                Desconexión
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
