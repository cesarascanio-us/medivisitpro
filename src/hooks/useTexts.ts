/* ========================================================================
   MASTER FRAMEWORK - EMPRESA CA
   Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
   ======================================================================== */

import { useTheme } from "@/context/ThemeContext";

/**
 * Hook de conveniencia para acceder a los textos corporativos de forma segura,
 * garantizando que siempre haya un valor fallback en español en caso de que no
 * se haya guardado ninguna personalización de marca blanca.
 */
export function useTexts() {
  const { theme } = useTheme();

  // Valores predeterminados en caso de que el máster no haya personalizado nada
  return {
    // Identidad del Menú & Sidebar
    sidebar_title: theme?.texts?.sidebar_title || "MediVisitPro",
    sidebar_subtitle: theme?.texts?.sidebar_subtitle || "Plataforma Médica",

    // Pantalla de Login / Acceso
    login_welcome: theme?.texts?.login_welcome || "Bienvenido de nuevo",
    login_subtitle: theme?.texts?.login_subtitle || "Ingresa tus credenciales para continuar",
    login_badge: theme?.texts?.login_badge || "Sistema Operativo v4.0",
    login_hero_title_1: theme?.texts?.login_hero_title_1 || "El poder de la",
    login_hero_title_2: theme?.texts?.login_hero_title_2 || "Inteligencia",
    login_hero_title_3: theme?.texts?.login_hero_title_3 || "Farmacéutica",
    login_hero_subtitle: theme?.texts?.login_hero_subtitle || "Gestione su fuerza comercial con la precisión de un cirujano. Datos en tiempo real, rutas optimizadas y control total de muestras médicas.",
    login_feature_1_title: theme?.texts?.login_feature_1_title || "Optimización de Rutas",
    login_feature_1_sub: theme?.texts?.login_feature_1_sub || "Navegación GPS Inteligente",
    login_feature_2_title: theme?.texts?.login_feature_2_title || "Acceso Seguro",
    login_feature_2_sub: theme?.texts?.login_feature_2_sub || "ISO 27001 READY",
    login_form_email_label: theme?.texts?.login_form_email_label || "Correo Electrónico",
    login_form_password_label: theme?.texts?.login_form_password_label || "Contraseña",
    login_form_button: theme?.texts?.login_form_button || "Iniciar Sesión",
    login_footer_left: theme?.texts?.login_footer_left || "Powered by CA Labs",
    login_footer_right: theme?.texts?.login_footer_right || "Sentinel Oracle Integrated",

    // Módulos
    dashboard_title: theme?.texts?.dashboard_title || "Panel de Control",
    dashboard_subtitle: theme?.texts?.dashboard_subtitle || "Resumen ejecutivo e indicadores clave de rendimiento",
    dashboard_greeting: theme?.texts?.dashboard_greeting || "Buenos días",
    
    visits_title: theme?.texts?.visits_title || "Historial de Visitas",
    visits_subtitle: theme?.texts?.visits_subtitle || "Registro de visitas y auditorías médicas en campo",
    
    doctors_title: theme?.texts?.doctors_title || "Directorio Profesional",
    doctors_subtitle: theme?.texts?.doctors_subtitle || "Gestión de especialistas médicos y fichas profesionales",
    doctors_empty_state: theme?.texts?.doctors_empty_state || "No se encontraron profesionales médicos registrados en el sistema.",
    
    pharmacies_title: theme?.texts?.pharmacies_title || "Farmacias y POS",
    pharmacies_subtitle: theme?.texts?.pharmacies_subtitle || "Monitoreo y visitas a farmacias colaboradoras",
    pharmacies_empty_state: theme?.texts?.pharmacies_empty_state || "No hay farmacias registradas en el territorio actual.",
    
    transfers_title: theme?.texts?.transfers_title || "Transferencias",
    transfers_subtitle: theme?.texts?.transfers_subtitle || "Gestión de órdenes de transferencia y logística de suministro",
    transfers_empty_state: theme?.texts?.transfers_empty_state || "No se registran órdenes de transferencia procesadas.",

    agenda_title: theme?.texts?.agenda_title || "Agenda de Trabajo",
    agenda_subtitle: theme?.texts?.agenda_subtitle || "Planificación y calendario de actividades comerciales",

    samples_title: theme?.texts?.samples_title || "Banco de Muestras",
    samples_subtitle: theme?.texts?.samples_subtitle || "Control de inventario y distribución de muestras médicas",

    objectives_title: theme?.texts?.objectives_title || "Objetivos del Equipo",
    objectives_subtitle: theme?.texts?.objectives_subtitle || "Monitoreo de metas comerciales e indicadores de desempeño",

    reports_title: theme?.texts?.reports_title || "Reportes de Gestión",
    reports_subtitle: theme?.texts?.reports_subtitle || "Análisis avanzados y descarga de informes corporativos",

    zones_title: theme?.texts?.zones_title || "Territorios y Zonas",
    zones_subtitle: theme?.texts?.zones_subtitle || "Asignación geográfica y delimitación de rutas comerciales",

    users_title: theme?.texts?.users_title || "Usuarios del Sistema",
    users_subtitle: theme?.texts?.users_subtitle || "Administración de accesos y perfiles del equipo",

    finance_title: theme?.texts?.finance_title || "Monitor Financiero",
    finance_subtitle: theme?.texts?.finance_subtitle || "Monitoreo financiero, facturación y control de presupuestos",

    coverage_title: theme?.texts?.coverage_title || "Mapa de Cobertura",
    coverage_subtitle: theme?.texts?.coverage_subtitle || "Geolocalización en tiempo real y alcance del equipo",

    documents_title: theme?.texts?.documents_title || "Centro Documental",
    documents_subtitle: theme?.texts?.documents_subtitle || "Bandeja de normativas, guías y documentos corporativos",

    // Acciones y Botones
    btn_save: theme?.texts?.btn_save || "Guardar",
    btn_cancel: theme?.texts?.btn_cancel || "Cancelar",
    btn_edit: theme?.texts?.btn_edit || "Editar",
    btn_delete: theme?.texts?.btn_delete || "Eliminar",
    btn_create: theme?.texts?.btn_create || "Crear",
    btn_search_placeholder: theme?.texts?.btn_search_placeholder || "Buscar...",
    btn_export: theme?.texts?.btn_export || "Exportar",
    btn_import: theme?.texts?.btn_import || "Importar",
    btn_confirm: theme?.texts?.btn_confirm || "Confirmar",
    btn_close: theme?.texts?.btn_close || "Cerrar",

    // Estados Globales
    notifications_empty: theme?.texts?.notifications_empty || "No tienes notificaciones pendientes.",
    empty_state_title: theme?.texts?.empty_state_title || "Sin registros disponibles",
    empty_state_subtitle: theme?.texts?.empty_state_subtitle || "No se encontraron elementos con los filtros actuales.",
    error_title: theme?.texts?.error_title || "Ha ocurrido un error inesperado",
    error_subtitle: theme?.texts?.error_subtitle || "El sistema no pudo procesar la solicitud. Por favor, reintente.",
    loading_text: theme?.texts?.loading_text || "Procesando información del servidor...",
    footer_text: theme?.texts?.footer_text || "© 2026 MediVisitPro. Todos los derechos reservados."
  };
}
