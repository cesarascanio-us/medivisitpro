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
  const getVariantStyles = () => {
    switch (variant) {
      case "primary": return "bg-primary/5 border-primary/20 text-primary";
      case "success": return "bg-secondary/10 border-secondary/20 text-secondary";
      case "warning": return "bg-amber-500/10 border-amber-500/20 text-amber-600";
      case "destructive": return "bg-red-500/10 border-red-500/20 text-red-600";
      default: return "bg-gray-50 border-gray-200 text-gray-500";
    }
  };

  const styleClasses = getVariantStyles();
  const iconColor = styleClasses.split(' ').pop();

  return (
    <Card className="group relative overflow-hidden border-gray-200 bg-white shadow-soft hover:shadow-card transition-all duration-300 rounded-2xl">
      <div className={`absolute top-0 left-0 w-1 h-full ${variant === 'primary' ? 'bg-primary' : variant === 'success' ? 'bg-secondary' : 'bg-transparent'}`}></div>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-5">
          <div className={`p-3 rounded-xl ${styleClasses.split(' ').slice(0, 2).join(' ')} shadow-sm group-hover:scale-110 transition-transform duration-500`}>
            <Icon className={`h-6 w-6 ${iconColor}`} />
          </div>
          {trending !== undefined && (
            <div className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-green-50 text-green-600 border border-green-100 uppercase tracking-tight">
              <TrendingUp className="h-3.5 w-3.5" />
              {trending}%
            </div>
          )}
        </div>
        <div>
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1 group-hover:text-gray-500 transition-colors">
            {title}
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold text-text-main tracking-tight tabular-nums">
              {value}
            </h3>
          </div>
          {subtitle && (
            <p className="text-xs text-text-muted mt-2 font-medium opacity-80 group-hover:opacity-100 transition-opacity">
              {subtitle}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};