/* ========================================================================
   MASTER FRAMEWORK - EMPRESA CA
   Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
   ======================================================================== */

import React, { useState } from "react";
import { ThemeConfig } from "@/context/ThemeContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, ClipboardList, Calendar, MapPin, 
  Zap, DollarSign, Bot, ArrowRight, Activity 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ThemePreviewProps {
  theme: ThemeConfig;
  previewView: "dashboard" | "visits" | "mobile";
}

export function ThemePreview({ theme, previewView }: ThemePreviewProps) {
  return (
    <div className="w-full h-full border border-border/40 bg-background/50 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden shadow-premium-2xl min-h-[600px]">
      
      {/* Dynamic Theme Simulator Scale Container */}
      <div className="flex-1 flex items-center justify-center p-4">
        {previewView === "mobile" ? (
          <div className="w-[320px] h-[550px] bg-background border-[8px] border-slate-950 rounded-[2.5rem] shadow-premium-2xl relative overflow-hidden flex flex-col animate-in fade-in zoom-in duration-500">
            {/* Camera notch */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-4 bg-slate-950 rounded-full z-50 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-slate-800 ml-auto mr-4" />
            </div>
            
            <div className="flex-1 flex flex-col pt-6 overflow-hidden">
              <MobilePreviewMini theme={theme} />
            </div>
          </div>
        ) : (
          <div className="w-full max-w-[900px] h-[550px] bg-background border border-border/40 rounded-2xl shadow-premium-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-500">
            <div className="flex-1 flex overflow-hidden">
              {/* Scaled sidebar simulation */}
              <div className={cn(
                "w-48 bg-card border-r border-border/40 flex flex-col transition-all duration-300",
                theme.sidebar_default === "collapsed" && "w-16"
              )}>
                {/* Simulated Logo Section */}
                <div className="h-14 border-b border-border/40 px-4 flex items-center gap-2 overflow-hidden bg-muted/5">
                  <div className="w-7 h-7 bg-primary text-white rounded-lg flex items-center justify-center flex-shrink-0">
                    <Zap className="h-4 w-4" />
                  </div>
                  {theme.sidebar_default === "expanded" && (
                    <span className="text-xs font-black uppercase tracking-tight text-foreground truncate">
                      {theme.app_name || "MediVisitPro"}
                    </span>
                  )}
                </div>

                {/* Nav list */}
                <div className="flex-1 p-2 space-y-1">
                  <div className={cn("px-2 py-1.5 text-[8px] font-bold text-muted-foreground uppercase tracking-widest", theme.sidebar_default === "collapsed" && "hidden")}>
                    MENÚ PRINCIPAL
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center px-3 py-1.5 rounded-lg bg-primary text-white text-[10px] font-bold cursor-pointer">
                      <Zap className="w-3.5 h-3.5 mr-2" />
                      {theme.sidebar_default === "expanded" && <span>Panel Principal</span>}
                    </div>
                    <div className="flex items-center px-3 py-1.5 rounded-lg text-muted-foreground hover:bg-muted/10 hover:text-primary text-[10px] cursor-pointer">
                      <ClipboardList className="w-3.5 h-3.5 mr-2" />
                      {theme.sidebar_default === "expanded" && <span>Visitas Médicas</span>}
                    </div>
                    {theme.enable_sample_tracking && (
                      <div className="flex items-center px-3 py-1.5 rounded-lg text-muted-foreground hover:bg-muted/10 hover:text-primary text-[10px] cursor-pointer">
                        <Zap className="w-3.5 h-3.5 mr-2" />
                        {theme.sidebar_default === "expanded" && <span>Muestras</span>}
                      </div>
                    )}
                    {theme.enable_finance_monitor && (
                      <div className="flex items-center px-3 py-1.5 rounded-lg text-muted-foreground hover:bg-muted/10 hover:text-primary text-[10px] cursor-pointer">
                        <DollarSign className="w-3.5 h-3.5 mr-2" />
                        {theme.sidebar_default === "expanded" && <span>Monitor Financiero</span>}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer simulation */}
                <div className="p-3 border-t border-border/40 bg-muted/5 flex items-center gap-2 overflow-hidden">
                  <div className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-[10px] font-bold text-primary">US</span>
                  </div>
                  {theme.sidebar_default === "expanded" && (
                    <div className="truncate">
                      <p className="text-[9px] font-bold text-foreground leading-none">César Ascanio</p>
                      <p className="text-[8px] text-muted-foreground leading-none mt-0.5 truncate">Administrador</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Main Content View Sim */}
              <div className="flex-1 flex flex-col bg-background overflow-y-auto">
                {/* Header Sim */}
                <div className="h-14 border-b border-border/40 px-6 flex items-center justify-between bg-card/40">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-foreground">Escritorio Ejecutivo</span>
                    <Badge variant="outline" className="text-[8px] bg-muted">{theme.locale.toUpperCase()}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    {theme.logo_url ? (
                      <img src={theme.logo_url} className="h-6 object-contain" alt="Org Logo" />
                    ) : (
                      <span className="text-xs font-black text-primary">{theme.app_name}</span>
                    )}
                  </div>
                </div>

                {/* Scaled body */}
                <div className="p-6 flex-1 overflow-hidden">
                  {previewView === "dashboard" ? (
                    <DashboardPreviewMini theme={theme} />
                  ) : (
                    <VisitsPreviewMini theme={theme} />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}

/* ========================================================================
   SUB-COMPONENTS FOR PREVIEW MODES (SIMULATING COMPONENTS WITH CURRENT VARIABLES)
   ======================================================================== */

function DashboardPreviewMini({ theme }: { theme: ThemeConfig }) {
  const radiusMapClass = theme.border_radius_scale === "sharp" ? "rounded-none" : theme.border_radius_scale === "default" ? "rounded-xl" : "rounded-2xl";
  
  return (
    <div className="space-y-4 h-full flex flex-col justify-between">
      {/* 3 mini KPI Cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card className={cn("bg-card border border-border/40 shadow-sm border-l-2 border-l-primary", radiusMapClass)}>
          <CardContent className="p-3">
            <p className="text-[9px] text-muted-foreground uppercase font-bold">Cobertura</p>
            <h4 className="text-sm font-bold text-foreground mt-0.5">92%</h4>
          </CardContent>
        </Card>
        <Card className={cn("bg-card border border-border/40 shadow-sm border-l-2 border-l-secondary", radiusMapClass)}>
          <CardContent className="p-3">
            <p className="text-[9px] text-muted-foreground uppercase font-bold">Visitas Hoy</p>
            <h4 className="text-sm font-bold text-foreground mt-0.5">14 / 16</h4>
          </CardContent>
        </Card>
        <Card className={cn("bg-card border border-border/40 shadow-sm border-l-2 border-l-accent", radiusMapClass)}>
          <CardContent className="p-3">
            <p className="text-[9px] text-muted-foreground uppercase font-bold">Alertas Activas</p>
            <h4 className="text-sm font-bold text-foreground mt-0.5">3</h4>
          </CardContent>
        </Card>
      </div>

      {/* Main body: Map and Smart Assistant preview */}
      <div className="grid grid-cols-3 gap-4 flex-1">
        <div className={cn("col-span-2 border border-border/40 bg-muted/10 p-3 flex flex-col justify-between shadow-sm relative overflow-hidden", radiusMapClass)}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-bold text-foreground">Territorio de Ventas (GPS)</span>
            {theme.enable_geolocation && <Badge variant="outline" className="text-[8px] bg-emerald-500/10 text-emerald-500 border-none">GPS Activo</Badge>}
          </div>
          {/* Mock Map illustration */}
          <div className="flex-1 bg-muted/20 border border-dashed border-border/40 rounded-lg flex items-center justify-center p-4">
            <MapPin className="w-8 h-8 text-primary animate-pulse" />
          </div>
        </div>

        <div className="space-y-3">
          {/* Smart Assistant Card */}
          {theme.enable_smart_assistant && (
            <Card className={cn("bg-primary/5 border border-primary/20", radiusMapClass)}>
              <CardContent className="p-3 space-y-2">
                <div className="flex items-center gap-1.5">
                  <Bot className="w-4 h-4 text-primary" />
                  <span className="text-[10px] font-bold text-foreground">Asistente IA</span>
                </div>
                <p className="text-[9px] text-muted-foreground">La cobertura médica aumentó un 5% en la zona Caracas este mes.</p>
                <div className="flex justify-end">
                  <button className="text-[8px] font-bold text-primary flex items-center hover:underline">
                    Ver Plan <ArrowRight className="w-2.5 h-2.5 ml-1" />
                  </button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Simple samples display */}
          {theme.enable_sample_tracking && (
            <Card className={cn("bg-card border border-border/40", radiusMapClass)}>
              <CardContent className="p-3">
                <span className="text-[9px] font-bold text-foreground">Inventario</span>
                <div className="space-y-1.5 mt-1">
                  <div className="flex justify-between text-[8px] bg-muted/20 p-1 rounded border border-border/20">
                    <span className="text-muted-foreground">Atorvastatina</span>
                    <span className="font-bold text-foreground">120 u.</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function VisitsPreviewMini({ theme }: { theme: ThemeConfig }) {
  const radiusMapClass = theme.border_radius_scale === "sharp" ? "rounded-none" : theme.border_radius_scale === "default" ? "rounded-xl" : "rounded-2xl";
  const innerRadiusClass = theme.border_radius_scale === "sharp" ? "rounded-none" : theme.border_radius_scale === "default" ? "rounded-md" : "rounded-lg";

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <h4 className="text-[11px] font-bold text-foreground">Gestión de Visitas Médicas</h4>
        <button className={cn("bg-primary text-white text-[9px] font-bold px-3 py-1.5 flex items-center hover:bg-secondary transition-colors shadow-premium-sm", radiusMapClass)}>
          <Calendar className="w-3 h-3 mr-1" /> Agendar Nueva
        </button>
      </div>

      <Card className={cn("bg-card border border-border/40 flex-1 flex flex-col overflow-hidden", radiusMapClass)}>
        <CardContent className="p-0 flex-1 flex flex-col">
          {/* Table Headers */}
          <div className="grid grid-cols-4 bg-muted/20 border-b border-border/40 p-2 text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
            <div>Médico</div>
            <div>Especialidad</div>
            <div>Fecha</div>
            <div className="text-right">Estatus</div>
          </div>
          {/* Table Body Sim */}
          <div className="flex-1 divide-y divide-border/20">
            <div className="grid grid-cols-4 p-2.5 text-[9px] hover:bg-muted/10 items-center">
              <div className="font-bold text-foreground">Dr. Alejandro Pérez</div>
              <div className="text-muted-foreground">Cardiología</div>
              <div className="text-muted-foreground">Hoy, 10:30 AM</div>
              <div className="text-right">
                <Badge variant="outline" className="text-[8px] bg-primary/10 text-primary border-primary/20">Confirmado</Badge>
              </div>
            </div>
            <div className="grid grid-cols-4 p-2.5 text-[9px] hover:bg-muted/10 items-center">
              <div className="font-bold text-foreground">Dra. María Colina</div>
              <div className="text-muted-foreground">Pediatría</div>
              <div className="text-muted-foreground">Hoy, 02:15 PM</div>
              <div className="text-right">
                <Badge variant="outline" className="text-[8px] bg-amber-500/10 text-amber-500 border-amber-500/20">Pendiente</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MobilePreviewMini({ theme }: { theme: ThemeConfig }) {
  const radiusMapClass = theme.border_radius_scale === "sharp" ? "rounded-none" : theme.border_radius_scale === "default" ? "rounded-xl" : "rounded-2xl";

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Top Mobile Bar Sim */}
      <div className="h-12 border-b border-border/40 px-4 flex items-center justify-between bg-card/40">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-primary text-white rounded flex items-center justify-center">
            <Zap className="h-3 w-3" />
          </div>
          <span className="text-[10px] font-bold text-foreground truncate max-w-[120px]">
            {theme.app_name} Mobile
          </span>
        </div>
        <div className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
          <span className="text-[8px] font-bold text-primary">US</span>
        </div>
      </div>

      {/* Main body scroll sim */}
      <div className="flex-1 p-3 space-y-3 overflow-y-auto">
        <div className={cn("bg-primary/5 border border-primary/20 p-3 space-y-1.5", radiusMapClass)}>
          <span className="text-[9px] font-bold text-foreground flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 text-primary" /> Estatus Semanal
          </span>
          <p className="text-[8px] text-muted-foreground">Has cubierto el 85% de tu ruta médica en Caracas.</p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Card className={cn("bg-card border border-border/40", radiusMapClass)}>
            <CardContent className="p-3 flex flex-col justify-between h-16">
              <span className="text-[8px] text-muted-foreground uppercase font-bold">Visitas</span>
              <span className="text-xs font-bold text-foreground">12 de 15</span>
            </CardContent>
          </Card>
          <Card className={cn("bg-card border border-border/40", radiusMapClass)}>
            <CardContent className="p-3 flex flex-col justify-between h-16">
              <span className="text-[8px] text-muted-foreground uppercase font-bold">Muestras</span>
              <span className="text-xs font-bold text-foreground">24 u.</span>
            </CardContent>
          </Card>
        </div>

        <h5 className="text-[9px] font-bold text-foreground px-1">Próxima Visita</h5>
        <div className={cn("bg-card border border-border/40 p-3 hover:bg-muted/10 transition-colors flex items-center justify-between", radiusMapClass)}>
          <div>
            <h6 className="text-[9px] font-bold text-foreground">Dr. Alejandro Pérez</h6>
            <p className="text-[8px] text-muted-foreground">Cardiología · 10:30 AM</p>
          </div>
          <Badge className="text-[8px] bg-primary text-white">Ruta</Badge>
        </div>
      </div>

      {/* Bottom Nav Sim */}
      <div className="h-12 border-t border-border/40 bg-card/60 flex items-center justify-around px-2">
        <div className="flex flex-col items-center text-primary cursor-pointer">
          <Zap className="w-4 h-4" />
          <span className="text-[7px] font-bold mt-0.5">Inicio</span>
        </div>
        <div className="flex flex-col items-center text-muted-foreground cursor-pointer hover:text-primary">
          <ClipboardList className="w-4 h-4" />
          <span className="text-[7px] mt-0.5">Visitas</span>
        </div>
        <div className="flex flex-col items-center text-muted-foreground cursor-pointer hover:text-primary">
          <MapPin className="w-4 h-4" />
          <span className="text-[7px] mt-0.5">Rutas</span>
        </div>
      </div>
    </div>
  );
}
