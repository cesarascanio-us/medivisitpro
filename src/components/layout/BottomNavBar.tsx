import { NavLink, useLocation } from "react-router-dom";
import { Home, Calendar, MapPin, Store, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "./Sidebar";
import { HeaderActions } from "./Header";
import { OrganizationSwitcher } from "../organization/OrganizationSwitcher";
import { ThemeToggle } from "@/components/theme-toggle";

const bottomNavItems = [
  { name: "Inicio", href: "/dashboard", icon: Home },
  { name: "Agenda", href: "/planner", icon: Calendar },
  { name: "Rutas", href: "/route-planner", icon: MapPin },
  { name: "Comercios", href: "/pharmacies", icon: Store },
];

export function BottomNavBar() {
  const location = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden glass-elite border-t border-white/5 bg-card/90 backdrop-blur-[24px] shadow-[0_-8px_30px_rgba(0,0,0,0.12)]">
      <div className="flex items-center justify-around h-16 px-4 pb-safe">
        {bottomNavItems.map((item) => {
          const isActive = location.pathname.startsWith(item.href);
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-all",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className={cn(
                "p-1.5 rounded-xl transition-all duration-300",
                isActive ? "bg-primary/10 shadow-premium-sm" : "bg-transparent"
              )}>
                <item.icon className="w-5 h-5" strokeWidth={isActive ? 2 : 1.5} />
              </div>
              <span className={cn(
                "text-[10px] font-medium transition-all duration-300",
                isActive ? "font-bold" : "font-normal"
              )}>
                {item.name}
              </span>
            </NavLink>
          );
        })}

        {/* More Menu (Sidebar Trigger) */}
        <Sheet>
          <SheetTrigger asChild>
            <button className="flex flex-col items-center justify-center w-full h-full space-y-1 text-muted-foreground hover:text-foreground transition-all">
              <div className="p-1.5 rounded-xl bg-transparent transition-all duration-300 active:bg-muted/50">
                <Menu className="w-5 h-5" strokeWidth={1.5} />
              </div>
              <span className="text-[10px] font-medium">Más</span>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[85vh] p-0 bg-card/95 backdrop-blur-[24px] border-t border-white/10 rounded-t-3xl flex flex-col glass-elite">
            <div className="w-12 h-1.5 bg-muted rounded-full mx-auto my-3 opacity-50" />
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <OrganizationSwitcher />
            </div>
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Ajustes</span>
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <HeaderActions />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto pb-6">
              <Sidebar className="border-none shadow-none w-full bg-transparent" isMobile={true} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
