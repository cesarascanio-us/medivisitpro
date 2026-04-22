/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
 ======================================================================== */

import { LucideIcon, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trending?: number;
  variant?: "default" | "success" | "warning" | "primary" | "destructive";
}

export const StatsCard = ({ title, value, subtitle, icon: Icon, trending, variant = "default" }: StatsCardProps) => {
  const getVibrantClass = () => {
    switch (variant) {
      case "primary": return "icon-vibrant-primary";
      case "success": return "icon-vibrant-success";
      case "warning": return "icon-vibrant-warning";
      case "destructive": return "icon-vibrant-purple"; // using purple for destructive/alt
      default: return "icon-vibrant-info";
    }
  };

  const vibrantClass = getVibrantClass();

  return (
    <Card className="group relative overflow-hidden border-none bg-background/80 backdrop-blur-sm shadow-soft hover:shadow-card transition-all duration-500 rounded-3xl">
      <div className={`absolute top-0 left-0 w-1.5 h-full ${variant === 'primary' ? 'bg-primary' : variant === 'success' ? 'bg-emerald-500' : 'bg-transparent'}`}></div>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 transform group-hover:scale-110 group-hover:rotate-3 ${vibrantClass}`}>
            <Icon className="h-7 w-7" />
          </div>
          {trending !== undefined && (
            <div className="flex items-center gap-1 text-[11px] font-bold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm">
              <TrendingUp className="h-3.5 w-3.5" />
              +{trending}%
            </div>
          )}
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1.5">
            {title}
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight tabular-nums drop-shadow-sm">
              {value}
            </h3>
          </div>
          {subtitle && (
            <p className="text-[11px] text-slate-500 mt-2 font-semibold flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
              {subtitle}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
