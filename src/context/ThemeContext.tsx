/* ========================================================================
   MASTER FRAMEWORK - EMPRESA CA
   Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
   ======================================================================== */

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { hexToHsl } from "@/utils/colorUtils";

export interface ThemeTexts {
  // --- YA EXISTENTES ---
  sidebar_title: string;
  sidebar_subtitle: string;
  login_welcome: string;
  login_subtitle: string;
  visits_title: string;
  visits_subtitle: string;
  pharmacies_title: string;
  pharmacies_subtitle: string;
  doctors_title: string;
  doctors_subtitle: string;
  transfers_title: string;
  transfers_subtitle: string;

  // --- PANTALLA DE LOGIN (nuevos) ---
  login_hero_title_1: string;
  login_hero_title_2: string;
  login_hero_title_3: string;
  login_hero_subtitle: string;
  login_feature_1_title: string;
  login_feature_1_sub: string;
  login_feature_2_title: string;
  login_feature_2_sub: string;
  login_form_email_label: string;
  login_form_password_label: string;
  login_form_button: string;
  login_badge: string;
  login_footer_left: string;
  login_footer_right: string;

  // --- DASHBOARD ---
  dashboard_greeting: string;
  dashboard_title: string;
  dashboard_subtitle: string;

  // --- MÉDICOS ---
  doctors_empty_state: string;

  // --- FARMACIAS ---
  pharmacies_empty_state: string;

  // --- TRANSFERENCIAS ---
  transfers_empty_state: string;

  // --- AGENDA ---
  agenda_title: string;
  agenda_subtitle: string;

  // --- MUESTRAS ---
  samples_title: string;
  samples_subtitle: string;

  // --- OBJETIVOS / METAS ---
  objectives_title: string;
  objectives_subtitle: string;

  // --- REPORTES ---
  reports_title: string;
  reports_subtitle: string;

  // --- ZONAS / TERRITORIOS ---
  zones_title: string;
  zones_subtitle: string;

  // --- USUARIOS ---
  users_title: string;
  users_subtitle: string;

  // --- MONITOR FINANCIERO ---
  finance_title: string;
  finance_subtitle: string;

  // --- MAPA DE COBERTURA ---
  coverage_title: string;
  coverage_subtitle: string;

  // --- DOCUMENTOS ---
  documents_title: string;
  documents_subtitle: string;

  // --- NOTIFICACIONES ---
  notifications_empty: string;

  // --- ERRORES Y ESTADOS VACÍOS GLOBALES ---
  empty_state_title: string;
  empty_state_subtitle: string;
  error_title: string;
  error_subtitle: string;
  loading_text: string;

  // --- BOTONES GLOBALES ---
  btn_save: string;
  btn_cancel: string;
  btn_edit: string;
  btn_delete: string;
  btn_create: string;
  btn_search_placeholder: string;
  btn_export: string;
  btn_import: string;
  btn_back: string;
  btn_next: string;
  btn_close: string;
  btn_confirm: string;
  footer_text: string;
  custom_nav_label_1: string;
  custom_nav_label_2: string;
}

export interface ThemeConfig {
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_style: "dark" | "light" | "auto";
  logo_url: string;
  favicon_url: string;
  app_name: string;
  enable_geolocation: boolean;
  enable_sample_tracking: boolean;
  enable_finance_monitor: boolean;
  enable_pmbok: boolean;
  enable_smart_assistant: boolean;
  enable_coverage_map: boolean;
  locale: "es" | "en" | "pt";
  custom_css: string;
  border_radius_scale: "sharp" | "default" | "rounded";
  sidebar_default: "expanded" | "collapsed";
  texts: ThemeTexts;
}

const DEFAULT_THEME: ThemeConfig = {
  primary_color: "#10b981", // Emerald default
  secondary_color: "#059669",
  accent_color: "#f59e0b",
  background_style: "dark",
  logo_url: "",
  favicon_url: "/favicon.ico",
  app_name: "MediVisitPro",
  enable_geolocation: true,
  enable_sample_tracking: true,
  enable_finance_monitor: true,
  enable_pmbok: true,
  enable_smart_assistant: true,
  enable_coverage_map: true,
  locale: "es",
  custom_css: "",
  border_radius_scale: "default",
  sidebar_default: "expanded",
  texts: {
    sidebar_title: "MediVisitPro",
    sidebar_subtitle: "Plataforma Médica",
    login_welcome: "Bienvenido de nuevo",
    login_subtitle: "Ingresa tus credenciales para continuar",
    visits_title: "Historial de Visitas",
    visits_subtitle: "Registro de visitas y auditorías médicas",
    pharmacies_title: "Farmacias y POS",
    pharmacies_subtitle: "Gestión de Activos Biofarco",
    doctors_title: "Directorio Profesional",
    doctors_subtitle: "Gestión de Especialistas Biofarco",
    transfers_title: "Transferencias",
    transfers_subtitle: "Gestión de órdenes de transferencia y logística de suministro",

    // --- PANTALLA DE LOGIN (nuevos) ---
    login_hero_title_1: "El poder de la",
    login_hero_title_2: "Inteligencia",
    login_hero_title_3: "Farmacéutica",
    login_hero_subtitle: "Gestione su fuerza comercial con la precisión de un cirujano. Datos en tiempo real, rutas optimizadas y control total de muestras médicas.",
    login_feature_1_title: "Optimización de Rutas",
    login_feature_1_sub: "Navegación GPS Inteligente",
    login_feature_2_title: "Acceso Seguro",
    login_feature_2_sub: "ISO 27001 READY",
    login_form_email_label: "Correo Electrónico",
    login_form_password_label: "Contraseña",
    login_form_button: "Iniciar Sesión",
    login_badge: "Sistema Operativo v4.0",
    login_footer_left: "Powered by CA Labs",
    login_footer_right: "Sentinel Oracle Integrated",

    // --- DASHBOARD ---
    dashboard_greeting: "Buenos días",
    dashboard_title: "Panel de Control",
    dashboard_subtitle: "Resumen ejecutivo",

    // --- MÉDICOS ---
    doctors_empty_state: "No hay médicos aún",

    // --- FARMACIAS ---
    pharmacies_empty_state: "No hay farmacias aún",

    // --- TRANSFERENCIAS ---
    transfers_empty_state: "No hay transferencias aún",

    // --- AGENDA ---
    agenda_title: "Agenda de Visitas",
    agenda_subtitle: "Planificación diaria",

    // --- MUESTRAS ---
    samples_title: "Banco de Muestras",
    samples_subtitle: "Control de inventario",

    // --- OBJETIVOS / METAS ---
    objectives_title: "Metas del Ciclo",
    objectives_subtitle: "Seguimiento de metas",

    // --- REPORTES ---
    reports_title: "Reportería Avanzada",
    reports_subtitle: "Análisis y KPIs",

    // --- ZONAS / TERRITORIOS ---
    zones_title: "Territorios",
    zones_subtitle: "Gestión de zonas",

    // --- USUARIOS ---
    users_title: "Gestión de Usuarios",
    users_subtitle: "Equipo y accesos",

    // --- MONITOR FINANCIERO ---
    finance_title: "Monitor Financiero",
    finance_subtitle: "KPIs financieros",

    // --- MAPA DE COBERTURA ---
    coverage_title: "Mapa de Cobertura",
    coverage_subtitle: "Distribución territorial",

    // --- DOCUMENTOS ---
    documents_title: "Centro de Documentos",
    documents_subtitle: "Repositorio documental",

    // --- NOTIFICACIONES ---
    notifications_empty: "No tienes notificaciones",

    // --- ERRORES Y ESTADOS VACÍOS GLOBALES ---
    empty_state_title: "Sin resultados",
    empty_state_subtitle: "No hay datos disponibles",
    error_title: "Algo salió mal",
    error_subtitle: "Por favor intenta de nuevo",
    loading_text: "Cargando...",

    // --- BOTONES GLOBALES ---
    btn_save: "Guardar",
    btn_cancel: "Cancelar",
    btn_edit: "Editar",
    btn_delete: "Eliminar",
    btn_create: "Crear",
    btn_search_placeholder: "Buscar...",
    btn_export: "Exportar",
    btn_import: "Importar",
    btn_back: "Regresar",
    btn_next: "Siguiente",
    btn_close: "Cerrar",
    btn_confirm: "Confirmar",
    footer_text: "© 2026 MediVisitPro. Todos los derechos reservados.",
    custom_nav_label_1: "",
    custom_nav_label_2: ""
  }
};

interface ThemeContextType {
  theme: ThemeConfig;
  isLoading: boolean;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  updateTheme: (partial: Partial<ThemeConfig>) => void; // Live Preview
  saveTheme: () => Promise<void>; // Persist to database
  resetTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { organizationId, isMaster, isAdmin } = useAuth();
  const [dbTheme, setDbTheme] = useState<ThemeConfig>(DEFAULT_THEME);
  const [currentTheme, setCurrentTheme] = useState<ThemeConfig>(DEFAULT_THEME);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDefaultTheme, setIsDefaultTheme] = useState(true);

  const hasUnsavedChanges = JSON.stringify(dbTheme) !== JSON.stringify(currentTheme);

  // Apply colors and styling immediately to documentElement
  const injectTheme = useCallback((config: ThemeConfig, isDefault = false) => {
    const root = document.documentElement;

    // Solo inyectar colores si NO son los valores por defecto (es decir, si el master los cambió explícitamente)
    if (!isDefault || config.primary_color !== DEFAULT_THEME.primary_color) {
      root.style.setProperty("--primary", hexToHsl(config.primary_color));
    }
    if (!isDefault || config.secondary_color !== DEFAULT_THEME.secondary_color) {
      root.style.setProperty("--secondary", hexToHsl(config.secondary_color));
    }
    if (!isDefault || config.accent_color !== DEFAULT_THEME.accent_color) {
      root.style.setProperty("--accent", hexToHsl(config.accent_color));
    }

    // Dark / Light classes
    if (!isDefault || config.background_style !== DEFAULT_THEME.background_style) {
      if (config.background_style === "dark") {
        root.classList.add("dark");
        root.classList.remove("light");
      } else if (config.background_style === "light") {
        root.classList.add("light");
        root.classList.remove("dark");
      }
    }

    // Border radius scaling
    if (!isDefault || config.border_radius_scale !== DEFAULT_THEME.border_radius_scale) {
      const radiusMap = { sharp: "4px", default: "8px", rounded: "16px" };
      root.style.setProperty("--radius", radiusMap[config.border_radius_scale]);
    }

    // Favicon update
    const favicon = document.querySelector("link[rel='icon']") as HTMLLinkElement;
    if (favicon && config.favicon_url && (!isDefault || config.favicon_url !== DEFAULT_THEME.favicon_url)) {
      favicon.href = config.favicon_url;
    }

    // Custom organization branding name
    if (config.app_name && (!isDefault || config.app_name !== DEFAULT_THEME.app_name)) {
      document.title = config.app_name;
    }

    // Custom CSS injection
    if (!isDefault || config.custom_css) {
      let customStyle = document.getElementById("custom-org-css");
      if (!customStyle) {
        customStyle = document.createElement("style");
        customStyle.id = "custom-org-css";
        document.head.appendChild(customStyle);
      }
      customStyle.textContent = config.custom_css || "";
    }
  }, []);

  // 1. Fetch organization settings on mount
  useEffect(() => {
    let active = true;

    async function loadTheme() {
      if (!organizationId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("organizations")
          .select("settings, name, logo_url")
          .eq("id", organizationId)
          .maybeSingle();

        if (error) throw error;

        if (active && data) {
          const orgSettings = (data.settings || {}) as any;
          const hasCustomSettings = !!(
            orgSettings.primary_color ||
            orgSettings.secondary_color ||
            orgSettings.logo_url ||
            orgSettings.app_name
          );

          const mergedTheme: ThemeConfig = {
            ...DEFAULT_THEME,
            logo_url: data.logo_url || orgSettings.logo_url || DEFAULT_THEME.logo_url,
            app_name: orgSettings.app_name || data.name || DEFAULT_THEME.app_name,
            primary_color: orgSettings.primary_color || DEFAULT_THEME.primary_color,
            secondary_color: orgSettings.secondary_color || DEFAULT_THEME.secondary_color,
            accent_color: orgSettings.accent_color || DEFAULT_THEME.accent_color,
            background_style: orgSettings.background_style || DEFAULT_THEME.background_style,
            favicon_url: orgSettings.favicon_url || DEFAULT_THEME.favicon_url,
            enable_geolocation: orgSettings.enable_geolocation !== false,
            enable_sample_tracking: orgSettings.enable_sample_tracking !== false,
            enable_finance_monitor: orgSettings.enable_finance_monitor !== false,
            enable_pmbok: orgSettings.enable_pmbok !== false,
            enable_smart_assistant: orgSettings.enable_smart_assistant !== false,
            enable_coverage_map: orgSettings.enable_coverage_map !== false,
            locale: orgSettings.locale || DEFAULT_THEME.locale,
            custom_css: orgSettings.custom_css || DEFAULT_THEME.custom_css,
            border_radius_scale: orgSettings.border_radius_scale || DEFAULT_THEME.border_radius_scale,
            sidebar_default: orgSettings.sidebar_default || DEFAULT_THEME.sidebar_default,
            texts: {
              ...DEFAULT_THEME.texts,
              ...(orgSettings.texts || {})
            }
          };

          setDbTheme(mergedTheme);
          setCurrentTheme(mergedTheme);
          setIsDefaultTheme(!hasCustomSettings);
          injectTheme(mergedTheme, !hasCustomSettings);
        }
      } catch (err) {
        console.warn("Failed to load custom organization theme settings:", err);
      } finally {
        if (active) setIsLoading(false);
      }
    }

    loadTheme();

    return () => {
      active = false;
    };
  }, [organizationId, injectTheme]);

  // 2. Realtime subscription for cross-device theme updates
  useEffect(() => {
    if (!organizationId) return;

    const channel = supabase
      .channel(`theme-sync-${organizationId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "organizations",
          filter: `id=eq.${organizationId}`,
        },
        (payload: any) => {
          const updatedOrg = payload.new;
          if (updatedOrg && updatedOrg.settings) {
            const orgSettings = updatedOrg.settings;
            const hasCustomSettings = !!(
              orgSettings.primary_color ||
              orgSettings.secondary_color ||
              orgSettings.logo_url ||
              orgSettings.app_name
            );

            const updatedTheme: ThemeConfig = {
              ...DEFAULT_THEME,
              logo_url: updatedOrg.logo_url || orgSettings.logo_url || DEFAULT_THEME.logo_url,
              app_name: orgSettings.app_name || updatedOrg.name || DEFAULT_THEME.app_name,
              primary_color: orgSettings.primary_color || DEFAULT_THEME.primary_color,
              secondary_color: orgSettings.secondary_color || DEFAULT_THEME.secondary_color,
              accent_color: orgSettings.accent_color || DEFAULT_THEME.accent_color,
              background_style: orgSettings.background_style || DEFAULT_THEME.background_style,
              favicon_url: orgSettings.favicon_url || DEFAULT_THEME.favicon_url,
              enable_geolocation: orgSettings.enable_geolocation !== false,
              enable_sample_tracking: orgSettings.enable_sample_tracking !== false,
              enable_finance_monitor: orgSettings.enable_finance_monitor !== false,
              enable_pmbok: orgSettings.enable_pmbok !== false,
              enable_smart_assistant: orgSettings.enable_smart_assistant !== false,
              enable_coverage_map: orgSettings.enable_coverage_map !== false,
              locale: orgSettings.locale || DEFAULT_THEME.locale,
              custom_css: orgSettings.custom_css || DEFAULT_THEME.custom_css,
              border_radius_scale: orgSettings.border_radius_scale || DEFAULT_THEME.border_radius_scale,
              sidebar_default: orgSettings.sidebar_default || DEFAULT_THEME.sidebar_default,
              texts: {
                ...DEFAULT_THEME.texts,
                ...(orgSettings.texts || {})
              }
            };

            setDbTheme(updatedTheme);
            setCurrentTheme(updatedTheme);
            setIsDefaultTheme(!hasCustomSettings);
            injectTheme(updatedTheme, !hasCustomSettings);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [organizationId, injectTheme]);

  // 3. Live Preview / Temporary update
  const updateTheme = useCallback((partial: Partial<ThemeConfig>) => {
    setCurrentTheme(prev => {
      const next = { ...prev, ...partial };
      setIsDefaultTheme(false); // Cuando se edita activamente, deja de ser default
      injectTheme(next, false);
      return next;
    });
  }, [injectTheme]);

  // 4. Save to Database
  const saveTheme = async () => {
    if (!organizationId) return;

    try {
      setIsSaving(true);
      
      // Update logo_url and name in their own columns, plus settings in jsonb
      const { error } = await supabase
        .from("organizations")
        .update({
          logo_url: currentTheme.logo_url,
          name: currentTheme.app_name,
          settings: {
            primary_color: currentTheme.primary_color,
            secondary_color: currentTheme.secondary_color,
            accent_color: currentTheme.accent_color,
            background_style: currentTheme.background_style,
            favicon_url: currentTheme.favicon_url,
            enable_geolocation: currentTheme.enable_geolocation,
            enable_sample_tracking: currentTheme.enable_sample_tracking,
            enable_finance_monitor: currentTheme.enable_finance_monitor,
            enable_pmbok: currentTheme.enable_pmbok,
            enable_smart_assistant: currentTheme.enable_smart_assistant,
            enable_coverage_map: currentTheme.enable_coverage_map,
            locale: currentTheme.locale,
            custom_css: currentTheme.custom_css,
            border_radius_scale: currentTheme.border_radius_scale,
            sidebar_default: currentTheme.sidebar_default,
            texts: currentTheme.texts,
          }
        })
        .eq("id", organizationId);

      if (error) throw error;

      setDbTheme(currentTheme);
      setIsDefaultTheme(false); // Al guardar, la BD ya contiene parámetros no-vacíos
    } catch (err) {
      console.error("Error saving theme adjustments:", err);
      alert("Error al guardar la configuración visual.");
    } finally {
      setIsSaving(false);
    }
  };

  // 5. Reset to database settings
  const resetTheme = () => {
    setCurrentTheme(dbTheme);
    injectTheme(dbTheme, isDefaultTheme);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme: currentTheme,
        isLoading,
        isSaving,
        hasUnsavedChanges,
        updateTheme,
        saveTheme,
        resetTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
