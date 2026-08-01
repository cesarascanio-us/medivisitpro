/* ========================================================================
   MASTER FRAMEWORK - EMPRESA CA
   Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
   ======================================================================== */

import React, { useState, useRef } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useThemeStorage } from "@/hooks/useTheme";
import { ThemeColorPicker } from "./ThemeColorPicker";
import { ThemePreview } from "./ThemePreview";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Palette, Upload, Trash2, CheckCircle2, RotateCcw, 
  Eye, Save, Loader2, MapPin, Pill, DollarSign, 
  Layers, Bot, Map, ShieldAlert, Globe, Type,
  ChevronDown, ChevronUp
} from "lucide-react";
import { cn } from "@/lib/utils";

// Palette Presets for Quick Selection
const PALETTE_PRESETS = [
  { name: "Esmeralda", primary: "#10b981", secondary: "#059669", accent: "#f59e0b" },
  { name: "Azul Corp", primary: "#3b82f6", secondary: "#1d4ed8", accent: "#f59e0b" },
  { name: "Violeta", primary: "#8b5cf6", secondary: "#6d28d9", accent: "#10b981" },
  { name: "Rojo Med", primary: "#ef4444", secondary: "#b91c1c", accent: "#3b82f6" },
  { name: "Cian", primary: "#06b6d4", secondary: "#0891b2", accent: "#f59e0b" },
  { name: "Naranja", primary: "#f97316", secondary: "#ea580c", accent: "#3b82f6" },
  { name: "Rosa", primary: "#ec4899", secondary: "#db2777", accent: "#8b5cf6" },
  { name: "Pizarra", primary: "#64748b", secondary: "#475569", accent: "#10b981" },
];

export default function ThemeBuilder() {
  const { 
    theme, 
    isLoading, 
    isSaving, 
    hasUnsavedChanges, 
    updateTheme, 
    saveTheme, 
    resetTheme 
  } = useTheme();
  
  const { uploadLogo, uploadFavicon } = useThemeStorage();
  
  const [activeTab, setActiveTab] = useState<"identity" | "texts" | "colors" | "shape" | "modules" | "advanced">("identity");
  const [expandedGroup, setExpandedGroup] = useState<string>("menu");
  const [previewView, setPreviewView] = useState<"dashboard" | "visits" | "mobile">("dashboard");
  const [logoUploading, setLogoUploading] = useState(false);
  const [faviconUploading, setFaviconUploading] = useState(false);
  
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  // Logo file upload handler
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLogoUploading(true);
      const url = await uploadLogo(file);
      updateTheme({ logo_url: url });
    } catch (err) {
      console.error("Logo upload failed:", err);
      alert("Error al cargar el logo.");
    } finally {
      setLogoUploading(false);
    }
  };

  // Favicon file upload handler
  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setFaviconUploading(true);
      const url = await uploadFavicon(file);
      updateTheme({ favicon_url: url });
    } catch (err) {
      console.error("Favicon upload failed:", err);
      alert("Error al cargar el favicon.");
    } finally {
      setFaviconUploading(false);
    }
  };

  const applyPalette = (p: typeof PALETTE_PRESETS[0]) => {
    updateTheme({
      primary_color: p.primary,
      secondary_color: p.secondary,
      accent_color: p.accent
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground animate-pulse">Sincronizando Marca...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full min-h-screen bg-background space-y-6 p-4 md:p-6 pb-24 max-w-[1400px] mx-auto animate-in fade-in duration-500">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-4 rounded-xl shadow-premium-md border border-border/40">
        <div className="flex items-center gap-4">
          <div className="bg-primary/10 p-3 rounded-lg border border-primary/20">
            <Palette className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-sm font-bold font-sans text-foreground">Personalizador Visual Corporativo</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Control y White-Labeling de MediVisitPro Elite UI</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3">
          {hasUnsavedChanges && (
            <span className="flex items-center gap-1.5 text-xs text-amber-500 font-bold bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20 mr-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              Cambios sin guardar
            </span>
          )}

          <button 
            onClick={resetTheme}
            type="button"
            className="flex items-center justify-center px-4 py-2 text-xs font-bold bg-muted hover:bg-muted/80 text-foreground border border-border/40 rounded-xl transition-all active:scale-95 flex-shrink-0"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-2" /> Restablecer
          </button>

          <button
            onClick={saveTheme}
            disabled={isSaving || !hasUnsavedChanges}
            type="button"
            className={cn(
              "flex items-center justify-center px-4 py-2 text-xs font-bold text-white bg-primary hover:bg-secondary rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex-shrink-0 shadow-premium-sm shadow-primary/20",
              isSaving && "opacity-75"
            )}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" /> Guardando...
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5 mr-2" /> Guardar Cambios
              </>
            )}
          </button>
        </div>
      </div>

      {/* TWO COLUMNS LAYOUT: LEFT SIDEBAR CONTROLS (40%) + RIGHT PREVIEW (60%) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* LEFT COLUMN: CONTROLS */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="bg-card border border-border/40 shadow-premium-md rounded-xl overflow-hidden">
            {/* Tabs selector */}
            <div className="flex border-b border-border/40 bg-muted/20">
              {(["identity", "texts", "colors", "shape", "modules", "advanced"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "flex-1 py-3 text-[10px] font-bold uppercase tracking-wider text-center border-b-2 border-transparent transition-all hover:text-primary",
                    activeTab === tab ? "border-primary text-primary bg-background/50" : "text-muted-foreground"
                  )}
                >
                  {tab === "identity" && "Identidad"}
                  {tab === "texts" && "Textos"}
                  {tab === "colors" && "Colores"}
                  {tab === "shape" && "Forma"}
                  {tab === "modules" && "Módulos"}
                  {tab === "advanced" && "CSS"}
                </button>
              ))}
            </div>

            <CardContent className="p-5 space-y-6">
              
              {/* TAB 1: IDENTIDAD DE MARCA */}
              {activeTab === "identity" && (
                <div className="space-y-5 animate-in fade-in duration-300">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-foreground uppercase tracking-wider">Nombre de Aplicación (White-Label)</label>
                    <Input
                      value={theme.app_name}
                      onChange={(e) => updateTheme({ app_name: e.target.value })}
                      placeholder="Ej: BIOFARCO Suite"
                      className="rounded-xl border-border/40 bg-background/50"
                    />
                  </div>

                  {/* Logo uploader */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-foreground uppercase tracking-wider">Logotipo Corporativo</label>
                    <div 
                      onClick={() => logoInputRef.current?.click()}
                      className="border-2 border-dashed border-border/40 hover:border-primary/40 rounded-xl p-6 text-center cursor-pointer transition-colors bg-muted/10 hover:bg-muted/20 relative"
                    >
                      {logoUploading ? (
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Loader2 className="w-5 h-5 text-primary animate-spin" />
                          <span className="text-[10px] text-muted-foreground">Subiendo logo...</span>
                        </div>
                      ) : theme.logo_url ? (
                        <div className="flex flex-col items-center gap-3">
                          <img src={theme.logo_url} className="h-10 object-contain" alt="Current Logo" />
                          <span className="text-[10px] text-primary font-bold">Cambiar imagen</span>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <Upload className="w-5 h-5 text-muted-foreground mx-auto" />
                          <p className="text-[10px] font-bold text-muted-foreground">Haz clic para subir logotipo</p>
                          <p className="text-[9px] text-muted-foreground/60">PNG, SVG, WebP — máx. 2MB</p>
                        </div>
                      )}
                    </div>
                    <input 
                      ref={logoInputRef} 
                      type="file" 
                      accept="image/*" 
                      onChange={handleLogoUpload} 
                      className="hidden" 
                    />
                  </div>

                  {/* Favicon uploader */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-foreground uppercase tracking-wider">Favicon (Icono navegador)</label>
                    <div 
                      onClick={() => faviconInputRef.current?.click()}
                      className="border-2 border-dashed border-border/40 hover:border-primary/40 rounded-xl p-4 text-center cursor-pointer transition-colors bg-muted/10 hover:bg-muted/20"
                    >
                      {faviconUploading ? (
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 text-primary animate-spin" />
                          <span className="text-[10px] text-muted-foreground">Subiendo favicon...</span>
                        </div>
                      ) : theme.favicon_url ? (
                        <div className="flex items-center justify-center gap-4">
                          <img src={theme.favicon_url} className="w-6 h-6 object-contain" alt="Favicon" />
                          <span className="text-[10px] text-primary font-bold">Cambiar icono</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <Upload className="w-4 h-4 text-muted-foreground" />
                          <span className="text-[10px] font-bold text-muted-foreground">Subir favicon (32x32px)</span>
                        </div>
                      )}
                    </div>
                    <input 
                      ref={faviconInputRef} 
                      type="file" 
                      accept="image/x-icon,image/png" 
                      onChange={handleFaviconUpload} 
                      className="hidden" 
                    />
                  </div>
                </div>
              )}

              {/* TAB 1.5: TEXTOS Y TÍTULOS PERSONALIZABLES */}
              {activeTab === "texts" && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="flex items-center gap-2 pb-2 border-b border-border/40">
                    <Type className="h-4 w-4 text-primary" />
                    <div>
                      <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Textos y Títulos</h4>
                      <p className="text-[10px] text-muted-foreground">Personalice los textos visibles en toda la aplicación</p>
                    </div>
                  </div>

                  {/* ACORDEÓN DE TEXTOS */}
                  <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                    
                    {/* GRUPO 1: IDENTIDAD DEL MENÚ */}
                    <div className="border border-border/40 rounded-xl overflow-hidden bg-background/20 backdrop-blur-md">
                      <button
                        type="button"
                        onClick={() => setExpandedGroup(expandedGroup === "menu" ? "" : "menu")}
                        className="w-full flex items-center justify-between p-3.5 hover:bg-muted/10 transition-colors text-left"
                      >
                        <span className="text-[11px] font-bold text-primary uppercase tracking-wider">
                          Identidad del Menú & Sidebar
                        </span>
                        {expandedGroup === "menu" ? (
                          <ChevronUp className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        )}
                      </button>
                      
                      {expandedGroup === "menu" && (
                        <div className="p-4 border-t border-border/20 bg-muted/5 grid grid-cols-2 gap-4 animate-in slide-in-from-top-1 duration-200">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase block">Título del Menú</label>
                            <Input
                              value={theme.texts?.sidebar_title || ''}
                              onChange={e => updateTheme({ texts: { ...theme.texts, sidebar_title: e.target.value }})}
                              placeholder="MediVisitPro"
                              className="rounded-xl border-border/40 bg-background/50 h-9 text-xs"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase block">Subtítulo del Menú</label>
                            <Input
                              value={theme.texts?.sidebar_subtitle || ''}
                              onChange={e => updateTheme({ texts: { ...theme.texts, sidebar_subtitle: e.target.value }})}
                              placeholder="Plataforma Médica"
                              className="rounded-xl border-border/40 bg-background/50 h-9 text-xs"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* GRUPO 2: PANTALLA DE ACCESO */}
                    <div className="border border-border/40 rounded-xl overflow-hidden bg-background/20 backdrop-blur-md">
                      <button
                        type="button"
                        onClick={() => setExpandedGroup(expandedGroup === "login" ? "" : "login")}
                        className="w-full flex items-center justify-between p-3.5 hover:bg-muted/10 transition-colors text-left"
                      >
                        <span className="text-[11px] font-bold text-primary uppercase tracking-wider">
                          Pantalla de Acceso / Login
                        </span>
                        {expandedGroup === "login" ? (
                          <ChevronUp className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        )}
                      </button>
                      
                      {expandedGroup === "login" && (
                        <div className="p-4 border-t border-border/20 bg-muted/5 space-y-4 animate-in slide-in-from-top-1 duration-200">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-muted-foreground uppercase block">Título de bienvenida</label>
                              <Input
                                value={theme.texts?.login_welcome || ''}
                                onChange={e => updateTheme({ texts: { ...theme.texts, login_welcome: e.target.value }})}
                                placeholder="Bienvenido de nuevo"
                                className="rounded-xl border-border/40 bg-background/50 h-9 text-xs"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-muted-foreground uppercase block">Subtítulo</label>
                              <Input
                                value={theme.texts?.login_subtitle || ''}
                                onChange={e => updateTheme({ texts: { ...theme.texts, login_subtitle: e.target.value }})}
                                placeholder="Ingresa tus credenciales"
                                className="rounded-xl border-border/40 bg-background/50 h-9 text-xs"
                              />
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-muted-foreground uppercase block">Badge Superior (Login)</label>
                              <Input
                                value={theme.texts?.login_badge || ''}
                                onChange={e => updateTheme({ texts: { ...theme.texts, login_badge: e.target.value }})}
                                placeholder="Sistema Operativo v4.0"
                                className="rounded-xl border-border/40 bg-background/50 h-9 text-xs"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-muted-foreground uppercase block">Etiqueta Email</label>
                              <Input
                                value={theme.texts?.login_form_email_label || ''}
                                onChange={e => updateTheme({ texts: { ...theme.texts, login_form_email_label: e.target.value }})}
                                placeholder="Correo Electrónico"
                                className="rounded-xl border-border/40 bg-background/50 h-9 text-xs"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-muted-foreground uppercase block">Etiqueta Contraseña</label>
                              <Input
                                value={theme.texts?.login_form_password_label || ''}
                                onChange={e => updateTheme({ texts: { ...theme.texts, login_form_password_label: e.target.value }})}
                                placeholder="Contraseña"
                                className="rounded-xl border-border/40 bg-background/50 h-9 text-xs"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-muted-foreground uppercase block">Botón de Login</label>
                              <Input
                                value={theme.texts?.login_form_button || ''}
                                onChange={e => updateTheme({ texts: { ...theme.texts, login_form_button: e.target.value }})}
                                placeholder="Iniciar Sesión"
                                className="rounded-xl border-border/40 bg-background/50 h-9 text-xs"
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase block">Título Hero Línea 1</label>
                            <Input
                              value={theme.texts?.login_hero_title_1 || ''}
                              onChange={e => updateTheme({ texts: { ...theme.texts, login_hero_title_1: e.target.value }})}
                              placeholder="El poder de la"
                              className="rounded-xl border-border/40 bg-background/50 h-9 text-xs"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-muted-foreground uppercase block">Título Hero Línea 2 (Destacado)</label>
                              <Input
                                value={theme.texts?.login_hero_title_2 || ''}
                                onChange={e => updateTheme({ texts: { ...theme.texts, login_hero_title_2: e.target.value }})}
                                placeholder="Inteligencia"
                                className="rounded-xl border-border/40 bg-background/50 h-9 text-xs"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-muted-foreground uppercase block">Título Hero Línea 3 (Acento)</label>
                              <Input
                                value={theme.texts?.login_hero_title_3 || ''}
                                onChange={e => updateTheme({ texts: { ...theme.texts, login_hero_title_3: e.target.value }})}
                                placeholder="Farmacéutica"
                                className="rounded-xl border-border/40 bg-background/50 h-9 text-xs"
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase block">Párrafo Descriptivo Hero</label>
                            <textarea
                              value={theme.texts?.login_hero_subtitle || ''}
                              onChange={e => updateTheme({ texts: { ...theme.texts, login_hero_subtitle: e.target.value }})}
                              placeholder="Gestione su fuerza comercial con la precisión de un cirujano..."
                              rows={3}
                              className="w-full p-2.5 rounded-xl border border-border/40 bg-background/50 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-muted-foreground uppercase block">Feature 1 - Título</label>
                              <Input
                                value={theme.texts?.login_feature_1_title || ''}
                                onChange={e => updateTheme({ texts: { ...theme.texts, login_feature_1_title: e.target.value }})}
                                placeholder="Optimización de Rutas"
                                className="rounded-xl border-border/40 bg-background/50 h-9 text-xs"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-muted-foreground uppercase block">Feature 1 - Subtítulo</label>
                              <Input
                                value={theme.texts?.login_feature_1_sub || ''}
                                onChange={e => updateTheme({ texts: { ...theme.texts, login_feature_1_sub: e.target.value }})}
                                placeholder="Navegación GPS Inteligente"
                                className="rounded-xl border-border/40 bg-background/50 h-9 text-xs"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-muted-foreground uppercase block">Feature 2 - Título</label>
                              <Input
                                value={theme.texts?.login_feature_2_title || ''}
                                onChange={e => updateTheme({ texts: { ...theme.texts, login_feature_2_title: e.target.value }})}
                                placeholder="Acceso Seguro"
                                className="rounded-xl border-border/40 bg-background/50 h-9 text-xs"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-muted-foreground uppercase block">Feature 2 - Subtítulo</label>
                              <Input
                                value={theme.texts?.login_feature_2_sub || ''}
                                onChange={e => updateTheme({ texts: { ...theme.texts, login_feature_2_sub: e.target.value }})}
                                placeholder="ISO 27001 READY"
                                className="rounded-xl border-border/40 bg-background/50 h-9 text-xs"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-muted-foreground uppercase block">Footer Izquierdo (Hero)</label>
                              <Input
                                value={theme.texts?.login_footer_left || ''}
                                onChange={e => updateTheme({ texts: { ...theme.texts, login_footer_left: e.target.value }})}
                                placeholder="Powered by CA Labs"
                                className="rounded-xl border-border/40 bg-background/50 h-9 text-xs"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-muted-foreground uppercase block">Footer Derecho (Hero)</label>
                              <Input
                                value={theme.texts?.login_footer_right || ''}
                                onChange={e => updateTheme({ texts: { ...theme.texts, login_footer_right: e.target.value }})}
                                placeholder="Sentinel Oracle Integrated"
                                className="rounded-xl border-border/40 bg-background/50 h-9 text-xs"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* GRUPO 3: MÓDULOS Y SECCIONES */}
                    <div className="border border-border/40 rounded-xl overflow-hidden bg-background/20 backdrop-blur-md">
                      <button
                        type="button"
                        onClick={() => setExpandedGroup(expandedGroup === "modules" ? "" : "modules")}
                        className="w-full flex items-center justify-between p-3.5 hover:bg-muted/10 transition-colors text-left"
                      >
                        <span className="text-[11px] font-bold text-primary uppercase tracking-wider">
                          Módulos & Secciones Principales
                        </span>
                        {expandedGroup === "modules" ? (
                          <ChevronUp className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        )}
                      </button>
                      
                      {expandedGroup === "modules" && (
                        <div className="p-4 border-t border-border/20 bg-muted/5 space-y-4 animate-in slide-in-from-top-1 duration-200 max-h-[350px] overflow-y-auto">
                          
                          {/* Subgrupo: Dashboard */}
                          <div className="space-y-2 border-b border-border/20 pb-3">
                            <span className="text-[10px] font-bold text-primary uppercase tracking-widest block">Dashboard Principal</span>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold text-muted-foreground uppercase block">Título Dashboard</label>
                                <Input
                                  value={theme.texts?.dashboard_title || ''}
                                  onChange={e => updateTheme({ texts: { ...theme.texts, dashboard_title: e.target.value }})}
                                  placeholder="Panel de Control"
                                  className="rounded-xl border-border/40 bg-background/50 h-8 text-xs"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold text-muted-foreground uppercase block">Subtítulo Dashboard</label>
                                <Input
                                  value={theme.texts?.dashboard_subtitle || ''}
                                  onChange={e => updateTheme({ texts: { ...theme.texts, dashboard_subtitle: e.target.value }})}
                                  placeholder="Resumen ejecutivo"
                                  className="rounded-xl border-border/40 bg-background/50 h-8 text-xs"
                                />
                              </div>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-muted-foreground uppercase block">Saludo de Bienvenida</label>
                              <Input
                                value={theme.texts?.dashboard_greeting || ''}
                                onChange={e => updateTheme({ texts: { ...theme.texts, dashboard_greeting: e.target.value }})}
                                placeholder="Buenos días"
                                className="rounded-xl border-border/40 bg-background/50 h-8 text-xs"
                              />
                            </div>
                          </div>

                          {/* Secciones del core */}
                          {[
                            { keyTitle: 'visits_title', keySub: 'visits_subtitle', label: 'Historial de Visitas' },
                            { keyTitle: 'doctors_title', keySub: 'doctors_subtitle', keyEmpty: 'doctors_empty_state', label: 'Médicos y Especialistas' },
                            { keyTitle: 'pharmacies_title', keySub: 'pharmacies_subtitle', keyEmpty: 'pharmacies_empty_state', label: 'Farmacias y POS' },
                            { keyTitle: 'transfers_title', keySub: 'transfers_subtitle', keyEmpty: 'transfers_empty_state', label: 'Logística / Transferencias' },
                            { keyTitle: 'agenda_title', keySub: 'agenda_subtitle', label: 'Agenda y Calendario' },
                            { keyTitle: 'samples_title', keySub: 'samples_subtitle', label: 'Inventario / Muestras' },
                            { keyTitle: 'objectives_title', keySub: 'objectives_subtitle', label: 'Objetivos / Metas' },
                            { keyTitle: 'reports_title', keySub: 'reports_subtitle', label: 'Reportes e Informes' },
                            { keyTitle: 'zones_title', keySub: 'zones_subtitle', label: 'Territorios y Zonas' },
                            { keyTitle: 'users_title', keySub: 'users_subtitle', label: 'Usuarios y Equipo' },
                            { keyTitle: 'finance_title', keySub: 'finance_subtitle', label: 'Monitor Financiero' },
                            { keyTitle: 'coverage_title', keySub: 'coverage_subtitle', label: 'Mapa de Cobertura' },
                            { keyTitle: 'documents_title', keySub: 'documents_subtitle', label: 'Centro Documental' },
                          ].map(module => (
                            <div key={module.label} className="space-y-2 border-b border-border/20 pb-3">
                              <span className="text-[10px] font-bold text-primary uppercase tracking-widest block">{module.label}</span>
                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                  <label className="text-[9px] font-bold text-muted-foreground uppercase block">Título</label>
                                  <Input
                                    value={(theme.texts as any)?.[module.keyTitle] || ''}
                                    onChange={e => updateTheme({ texts: { ...theme.texts, [module.keyTitle]: e.target.value }})}
                                    placeholder="Título"
                                    className="rounded-xl border-border/40 bg-background/50 h-8 text-xs"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[9px] font-bold text-muted-foreground uppercase block">Subtítulo</label>
                                  <Input
                                    value={(theme.texts as any)?.[module.keySub] || ''}
                                    onChange={e => updateTheme({ texts: { ...theme.texts, [module.keySub]: e.target.value }})}
                                    placeholder="Subtítulo"
                                    className="rounded-xl border-border/40 bg-background/50 h-8 text-xs"
                                  />
                                </div>
                              </div>
                              {module.keyEmpty && (
                                <div className="space-y-1">
                                  <label className="text-[9px] font-bold text-muted-foreground uppercase block">Texto Estado Vacío</label>
                                  <Input
                                    value={(theme.texts as any)?.[module.keyEmpty] || ''}
                                    onChange={e => updateTheme({ texts: { ...theme.texts, [module.keyEmpty]: e.target.value }})}
                                    placeholder="No hay elementos aún"
                                    className="rounded-xl border-border/40 bg-background/50 h-8 text-xs"
                                  />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* GRUPO 4: ACCIONES Y GLOBALES */}
                    <div className="border border-border/40 rounded-xl overflow-hidden bg-background/20 backdrop-blur-md">
                      <button
                        type="button"
                        onClick={() => setExpandedGroup(expandedGroup === "actions" ? "" : "actions")}
                        className="w-full flex items-center justify-between p-3.5 hover:bg-muted/10 transition-colors text-left"
                      >
                        <span className="text-[11px] font-bold text-primary uppercase tracking-wider">
                          Acciones, Botones & Globales
                        </span>
                        {expandedGroup === "actions" ? (
                          <ChevronUp className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        )}
                      </button>
                      
                      {expandedGroup === "actions" && (
                        <div className="p-4 border-t border-border/20 bg-muted/5 space-y-4 animate-in slide-in-from-top-1 duration-200 max-h-[350px] overflow-y-auto">
                          
                          {/* Botones */}
                          <div className="space-y-2 border-b border-border/20 pb-3">
                            <span className="text-[10px] font-bold text-primary uppercase tracking-widest block">Textos de Botones</span>
                            <div className="grid grid-cols-2 gap-3">
                              {[
                                { key: 'btn_save', label: 'Botón Guardar', placeholder: 'Guardar' },
                                { key: 'btn_cancel', label: 'Botón Cancelar', placeholder: 'Cancelar' },
                                { key: 'btn_edit', label: 'Botón Editar', placeholder: 'Editar' },
                                { key: 'btn_delete', label: 'Botón Eliminar', placeholder: 'Eliminar' },
                                { key: 'btn_create', label: 'Botón Crear', placeholder: 'Crear' },
                                { key: 'btn_export', label: 'Botón Exportar', placeholder: 'Exportar' },
                                { key: 'btn_import', label: 'Botón Importar', placeholder: 'Importar' },
                                { key: 'btn_confirm', label: 'Botón Confirmar', placeholder: 'Confirmar' },
                                { key: 'btn_close', label: 'Botón Cerrar', placeholder: 'Cerrar' },
                                { key: 'btn_search_placeholder', label: 'Placeholder Buscar', placeholder: 'Buscar...' }
                              ].map(btnField => (
                                <div key={btnField.key} className="space-y-1">
                                  <label className="text-[9px] font-bold text-muted-foreground uppercase block">{btnField.label}</label>
                                  <Input
                                    value={(theme.texts as any)?.[btnField.key] || ''}
                                    onChange={e => updateTheme({ texts: { ...theme.texts, [btnField.key]: e.target.value }})}
                                    placeholder={btnField.placeholder}
                                    className="rounded-xl border-border/40 bg-background/50 h-8 text-xs"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Estados Globales */}
                          <div className="space-y-2 pb-1">
                            <span className="text-[10px] font-bold text-primary uppercase tracking-widest block">Estados Globales</span>
                            <div className="grid grid-cols-2 gap-3">
                              {[
                                { key: 'notifications_empty', label: 'Notificaciones Vacías', placeholder: 'No tienes notificaciones' },
                                { key: 'empty_state_title', label: 'Sin Resultados (Título)', placeholder: 'Sin resultados' },
                                { key: 'empty_state_subtitle', label: 'Sin Resultados (Subtítulo)', placeholder: 'No hay datos disponibles' },
                                { key: 'error_title', label: 'Error (Título)', placeholder: 'Algo salió mal' },
                                { key: 'error_subtitle', label: 'Error (Subtítulo)', placeholder: 'Por favor intenta de nuevo' },
                                { key: 'loading_text', label: 'Texto Cargando', placeholder: 'Cargando...' },
                                { key: 'footer_text', label: 'Copyright / Pie de Página', placeholder: '© 2026 MediVisitPro...' }
                              ].map(globalField => (
                                <div key={globalField.key} className="space-y-1">
                                  <label className="text-[9px] font-bold text-muted-foreground uppercase block">{globalField.label}</label>
                                  <Input
                                    value={(theme.texts as any)?.[globalField.key] || ''}
                                    onChange={e => updateTheme({ texts: { ...theme.texts, [globalField.key]: e.target.value }})}
                                    placeholder={globalField.placeholder}
                                    className="rounded-xl border-border/40 bg-background/50 h-8 text-xs"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              )}

              {/* TAB 2: PALETA DE COLORES SEMÁNTICOS */}
              {activeTab === "colors" && (
                <div className="space-y-5 animate-in fade-in duration-300">
                  
                  {/* Preset quick palettes */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-foreground uppercase tracking-wider">Paletas Corporativas Preestablecidas</label>
                    <div className="grid grid-cols-2 gap-2">
                      {PALETTE_PRESETS.map((preset) => (
                        <button
                          key={preset.name}
                          onClick={() => applyPalette(preset)}
                          type="button"
                          className="flex items-center justify-between p-2 rounded-xl bg-muted/20 border border-border/40 hover:bg-muted/40 transition-all text-[10px] font-bold text-foreground text-left"
                        >
                          <span>{preset.name}</span>
                          <div className="flex gap-1">
                            <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: preset.primary }} />
                            <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: preset.secondary }} />
                            <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: preset.accent }} />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-border/40 my-4" />

                  {/* Individual Pickers */}
                  <ThemeColorPicker 
                    label="Color Primario (Acciones/Resaltado)" 
                    value={theme.primary_color} 
                    onChange={(hex) => updateTheme({ primary_color: hex })} 
                  />

                  <ThemeColorPicker 
                    label="Color Secundario (Hover/Segundario)" 
                    value={theme.secondary_color} 
                    onChange={(hex) => updateTheme({ secondary_color: hex })} 
                  />

                  <ThemeColorPicker 
                    label="Color de Acento (Alertas/Advertencias)" 
                    value={theme.accent_color} 
                    onChange={(hex) => updateTheme({ accent_color: hex })} 
                  />

                  {/* Background mode toggle */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-foreground uppercase tracking-wider block">Esquema de Fondo Predefinido</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(["dark", "light", "auto"] as const).map((style) => (
                        <button
                          key={style}
                          onClick={() => updateTheme({ background_style: style })}
                          type="button"
                          className={cn(
                            "py-2 text-[10px] font-bold uppercase rounded-xl border-2 transition-all capitalize",
                            theme.background_style === style 
                              ? "border-primary bg-primary/10 text-primary" 
                              : "border-border/40 hover:bg-muted/10 text-muted-foreground"
                          )}
                        >
                          {style === "dark" ? "Oscuro" : style === "light" ? "Claro" : "Auto (Sistema)"}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: RADIOS Y FORMA DE BORDES */}
              {activeTab === "shape" && (
                <div className="space-y-5 animate-in fade-in duration-300">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider block">Densidad de Esquinas y Radio de Bordes</label>
                  <div className="grid grid-cols-3 gap-3">
                    {(["sharp", "default", "rounded"] as const).map((scale) => (
                      <button
                        key={scale}
                        onClick={() => updateTheme({ border_radius_scale: scale })}
                        type="button"
                        className={cn(
                          "p-4 border-2 transition-all flex flex-col items-center gap-3",
                          theme.border_radius_scale === scale 
                            ? "border-primary bg-primary/10 text-primary" 
                            : "border-border/40 hover:bg-muted/10 text-muted-foreground",
                          scale === "sharp" ? "rounded-none" : scale === "default" ? "rounded-xl" : "rounded-3xl"
                        )}
                      >
                        <div className={cn(
                          "w-10 h-10 bg-primary",
                          scale === "sharp" ? "rounded-none" : scale === "default" ? "rounded-lg" : "rounded-2xl"
                        )} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">{scale === "sharp" ? "Rígido (0px)" : scale === "default" ? "Estándar (8px)" : "Curvo (16px)"}</span>
                      </button>
                    ))}
                  </div>

                  <div className="space-y-2 mt-4">
                    <label className="text-xs font-bold text-foreground uppercase tracking-wider block">Estado Inicial de Sidebar</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(["expanded", "collapsed"] as const).map((state) => (
                        <button
                          key={state}
                          onClick={() => updateTheme({ sidebar_default: state })}
                          type="button"
                          className={cn(
                            "py-2 text-[10px] font-bold uppercase rounded-xl border-2 transition-all",
                            theme.sidebar_default === state 
                              ? "border-primary bg-primary/10 text-primary" 
                              : "border-border/40 hover:bg-muted/10 text-muted-foreground"
                          )}
                        >
                          {state === "expanded" ? "Desplegado" : "Plegado (Iconos)"}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: MÓDULOS DE NEGOCIO ACTIVOS */}
              {activeTab === "modules" && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <p className="text-xs text-muted-foreground">Habilite o deshabilite dinámicamente los módulos globales de MediVisitPro para simplificar la interfaz.</p>
                  
                  <div className="divide-y divide-border/20">
                    {[
                      { key: "enable_geolocation", label: "Geolocalización GPS", icon: MapPin, desc: "Check-in/out con validación de ubicación." },
                      { key: "enable_sample_tracking", label: "Control de Muestras", icon: Pill, desc: "Dispensación y stock de muestras médicas." },
                      { key: "enable_finance_monitor", label: "Monitor Financiero", icon: DollarSign, desc: "Monitoreo de viáticos, gastos y comisiones." },
                      { key: "enable_pmbok", label: "Gestión de Proyectos", icon: Layers, desc: "Tableros Kanban y ciclo de vida PMBOK." },
                      { key: "enable_smart_assistant", label: "Asistente Inteligente", icon: Bot, desc: "IA contextual para la toma de objetivos." },
                      { key: "enable_coverage_map", label: "Mapa de Cobertura", icon: Map, desc: "Análisis geográfico y mapas de territorio." },
                    ].map((mod) => {
                      const enabled = (theme as any)[mod.key];
                      return (
                        <div key={mod.key} className="flex items-start justify-between py-3">
                          <div className="flex gap-3">
                            <div className="mt-0.5 bg-muted p-1.5 rounded-lg border border-border/40">
                              <mod.icon className="w-4 h-4 text-muted-foreground" />
                            </div>
                            <div>
                              <h5 className="text-xs font-bold text-foreground leading-none">{mod.label}</h5>
                              <p className="text-[10px] text-muted-foreground mt-1">{mod.desc}</p>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => updateTheme({ [mod.key]: !enabled })}
                            type="button"
                            className={cn(
                              "w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition-all duration-300 flex-shrink-0",
                              enabled ? "bg-primary justify-end" : "bg-muted border border-border/40 justify-start"
                            )}
                          >
                            <span className="w-4 h-4 rounded-full bg-white shadow-sm" />
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  <div className="border-t border-border/40 my-4" />

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-foreground uppercase tracking-wider block">Idioma de Interfaz por Defecto</label>
                    <div className="flex gap-2">
                      {[
                        { code: "es", name: "Español", flag: "🇪🇸" },
                        { code: "en", name: "English", flag: "🇺🇸" },
                        { code: "pt", name: "Português", flag: "🇧🇷" },
                      ].map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => updateTheme({ locale: lang.code as any })}
                          type="button"
                          className={cn(
                            "flex-1 py-2 text-[10px] font-bold rounded-xl border transition-all flex items-center justify-center gap-2",
                            theme.locale === lang.code 
                              ? "border-primary bg-primary/10 text-primary" 
                              : "border-border/40 hover:bg-muted/10 text-muted-foreground"
                          )}
                        >
                          <span>{lang.flag}</span>
                          <span>{lang.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: CSS PERSONALIZADO AVANZADO */}
              {activeTab === "advanced" && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                    <ShieldAlert className="w-4 h-4 text-amber-500 flex-shrink-0" />
                    <p className="text-[10px] text-muted-foreground">Inyecte CSS personalizado para sobreescribir estilos a nivel global. Tenga precaución.</p>
                  </div>

                  <div className="relative">
                    <textarea
                      value={theme.custom_css || ""}
                      onChange={(e) => updateTheme({ custom_css: e.target.value })}
                      spellCheck={false}
                      className="w-full h-48 font-mono text-[11px] bg-muted border border-border/40 rounded-xl p-3 text-foreground resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                      placeholder={`/* CSS personalizado para su organización */\n.sidebar-link {\n  font-weight: 700;\n}`}
                    />
                    <span className="absolute top-2 right-2 text-[10px] font-bold text-muted-foreground bg-card border border-border/40 px-2 py-0.5 rounded">CSS</span>
                  </div>
                </div>
              )}

            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: PREVIEW */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between bg-card p-3 rounded-xl border border-border/40 shadow-sm">
            <span className="text-xs font-bold text-foreground">Previsualización Interactiva en Vivo</span>
            
            <div className="flex gap-2">
              {(["dashboard", "visits", "mobile"] as const).map((view) => (
                <button
                  key={view}
                  onClick={() => setPreviewView(view)}
                  className={cn(
                    "px-3 py-1.5 text-[9px] font-bold uppercase rounded-lg transition-all",
                    previewView === view 
                      ? "bg-primary text-white" 
                      : "bg-muted hover:bg-muted/80 text-muted-foreground"
                  )}
                >
                  {view === "dashboard" && "Dashboard"}
                  {view === "visits" && "Visitas"}
                  {view === "mobile" && "Móvil"}
                </button>
              ))}
            </div>
          </div>

          <ThemePreview theme={theme} previewView={previewView} />
        </div>

      </div>

    </div>
  );
}
