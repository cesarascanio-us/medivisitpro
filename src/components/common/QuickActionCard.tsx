/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import React from 'react';
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface QuickActionCardProps {
  label: string;
  icon: React.ReactNode;
  selected: boolean;
  onClick: () => void;
  color?: "primary" | "emerald" | "blue" | "amber" | "rose" | "indigo";
  description?: string;
  className?: string;
}

export function QuickActionCard({ 
  label, 
  icon, 
  selected, 
  onClick, 
  color = "primary", 
  description,
  className 
}: QuickActionCardProps) {
  
  const colorStyles = {
    primary: "border-primary/20 hover:border-primary bg-primary/5 text-primary",
    emerald: "border-emerald-200 hover:border-emerald-500 bg-emerald-50 text-emerald-700",
    blue: "border-blue-200 hover:border-blue-500 bg-blue-50 text-blue-700",
    amber: "border-amber-200 hover:border-amber-500 bg-amber-50 text-amber-700",
    rose: "border-rose-200 hover:border-rose-500 bg-rose-50 text-rose-700",
    indigo: "border-indigo-200 hover:border-indigo-500 bg-indigo-50 text-indigo-700",
  };

  const selectedStyles = {
    primary: "border-primary bg-primary text-white ring-4 ring-primary/20",
    emerald: "border-emerald-600 bg-emerald-600 text-white ring-4 ring-emerald-100",
    blue: "border-blue-600 bg-blue-600 text-white ring-4 ring-blue-100",
    amber: "border-amber-500 bg-amber-500 text-white ring-4 ring-amber-100",
    rose: "border-rose-600 bg-rose-600 text-white ring-4 ring-rose-100",
    indigo: "border-indigo-600 bg-indigo-600 text-white ring-4 ring-indigo-100",
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "relative cursor-pointer rounded-[2rem] border-2 p-6 transition-all duration-300 active:scale-95 group overflow-hidden",
        selected ? selectedStyles[color] : colorStyles[color],
        className
      )}
    >
      {/* Decorative background circle */}
      <div className={cn(
        "absolute -right-4 -top-4 w-20 h-20 rounded-full blur-3xl transition-opacity",
        selected ? "bg-background/20 opacity-100" : "bg-current opacity-0 group-hover:opacity-10"
      )} />

      <div className="flex flex-col items-center text-center gap-3 relative z-10">
        <div className={cn(
          "p-4 rounded-2xl transition-colors duration-300",
          selected ? "bg-background/20" : "bg-card shadow-sm"
        )}>
          {React.cloneElement(icon as React.ReactElement, { 
            className: cn("h-8 w-8", (icon as any).props?.className) 
          })}
        </div>
        
        <div className="space-y-1">
          <h4 className="font-black text-lg uppercase tracking-tight leading-tight">
            {label}
          </h4>
          {description && (
            <p className={cn(
              "text-[10px] font-bold uppercase tracking-widest opacity-70",
              selected ? "text-white" : "text-slate-400"
            )}>
              {description}
            </p>
          )}
        </div>

        {selected && (
          <div className="absolute top-0 right-0 p-1 bg-card rounded-full translate-x-1 -translate-y-1 shadow-md">
            <Check className="h-4 w-4 text-emerald-600" />
          </div>
        )}
      </div>
    </div>
  );
}
