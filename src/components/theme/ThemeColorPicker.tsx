/* ========================================================================
   MASTER FRAMEWORK - EMPRESA CA
   Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
   ======================================================================== */

import React, { useRef } from "react";
import { Input } from "@/components/ui/button"; // Standard components or custom styled
import { Eye, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThemeColorPickerProps {
  label: string;
  value: string;
  onChange: (hex: string) => void;
  presetColors?: string[];
}

export function ThemeColorPicker({ 
  label, 
  value, 
  onChange, 
  presetColors = ["#10b981", "#3b82f6", "#8b5cf6", "#ef4444", "#06b6d4", "#f97316", "#ec4899", "#64748b"] 
}: ThemeColorPickerProps) {
  const colorInputRef = useRef<HTMLInputElement>(null);

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hex = e.target.value;
    // Basic HEX validation
    if (/^#[0-9A-F]{6}$/i.test(hex) || hex.length === 0) {
      onChange(hex);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <label className="text-xs font-bold text-foreground uppercase tracking-wider">{label}</label>
        <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded border border-border/40">
          {value || "#ffffff"}
        </span>
      </div>

      <div className="flex gap-3">
        {/* Color preview circle with hidden HTML color picker input */}
        <div 
          onClick={() => colorInputRef.current?.click()}
          className="w-10 h-10 rounded-xl border border-border/40 shadow-inner cursor-pointer flex-shrink-0 transition-transform hover:scale-105 active:scale-95 flex items-center justify-center relative overflow-hidden"
          style={{ backgroundColor: value || "#ffffff" }}
        >
          <input 
            ref={colorInputRef}
            type="color" 
            value={value || "#ffffff"} 
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
        </div>

        {/* Manual text input for hexadecimal value */}
        <input
          type="text"
          value={value}
          onChange={handleHexChange}
          placeholder="#000000"
          maxLength={7}
          className="flex h-10 w-full rounded-xl border border-border/40 bg-card px-3 py-2 text-xs text-foreground ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      {/* Suggested palette shortcut list */}
      <div className="flex flex-wrap gap-2 pt-1">
        {presetColors.map((color) => {
          const isSelected = color.toLowerCase() === value.toLowerCase();
          return (
            <button
              key={color}
              onClick={() => onChange(color)}
              type="button"
              className={cn(
                "w-6 h-6 rounded-lg border border-border/40 transition-all hover:scale-110 active:scale-90 flex items-center justify-center relative shadow-sm",
                isSelected && "ring-1 ring-primary ring-offset-1"
              )}
              style={{ backgroundColor: color }}
              title={color}
            >
              {isSelected && <Check className="w-3.5 h-3.5 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
