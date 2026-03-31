/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */


import { supabase } from "@/integrations/supabase/client";

export type LandingSectionKey = 'hero' | 'stats' | 'intelligence' | 'features' | 'testimonials' | 'faq' | 'cta';

export interface LandingContent {
    hero: {
        badge: string;
        title_part1: string;
        title_highlight: string;
        subtitle: string;
        cta_primary: string;
        cta_secondary: string;
        hero_image: string;
    };
    stats: Array<{ value: string; label: string }>;
    intelligence: {
        badge: string;
        title: string;
        subtitle: string;
        features: string[];
        cta: string;
        image: string;
    };
    features: {
        title: string;
        subtitle: string;
        items: Array<{ icon: string; title: string; description: string }>;
    };
    testimonials: {
        badge: string;
        title: string;
        quote: string;
        author: string;
        role: string;
        avatar: string;
    };
    faq: Array<{ q: string; a: string }>;
    cta: {
        title: string;
        subtitle: string;
        button_primary: string;
        button_secondary: string;
    };
}

export const DEFAULT_LANDING_CONTENT: LandingContent = {
    hero: {
        badge: "Demo Gratuita Disponible",
        title_part1: "Domina tu",
        title_highlight: "Territorio.",
        subtitle: "Deja de perder tiempo en reportes y enfócate en lo que importa: las relaciones con tus médicos. La única herramienta diseñada por y para visitadores de alto rendimiento.",
        cta_primary: "Probar Demo Gratis",
        cta_secondary: "Únete a +500 visitadores",
        hero_image: "/img/landing/hero-3d.png"
    },
    stats: [
        { value: '+30%', label: 'Más Visitas/Día' },
        { value: '100%', label: 'Control de Stock' },
        { value: '0', label: 'Errores de Reporte' },
        { value: '4.9/5', label: 'Valoración Usuarios' }
    ],
    intelligence: {
        badge: "Inteligencia de Datos",
        title: "Visualiza tu Éxito con Mapas de Calor",
        subtitle: "No dispongas tus esfuerzos al azar. Nuestra tecnología de geolocalización avanzada identifica dónde están tus mayores oportunidades en tiempo real.",
        features: [
            'Identificación de zonas con baja cobertura',
            'Optimización de rutas por proximidad',
            'Seguimiento visual de objetivos de ciclo'
        ],
        cta: "Explorar Mapas Inteligentes",
        image: "/img/landing/territory-3d.png"
    },
    features: {
        title: "Tu Ventaja Competitiva",
        subtitle: "Mientras otros pierden el tiempo llenando excels, tú estarás cerrando tratos.",
        items: [
            { icon: "Calendar", title: 'Recupera 10+ Horas Semanales', description: 'Olvídate de organizar la agenda manualmente. Nuestro algoritmo optimiza tus rutas y visitas automáticamente.' },
            { icon: "Users", title: 'Relaciones que Generan Ventas', description: 'Historial detallado de cada médico y farmacia. Llega a la visita sabiendo exactamente qué necesitan.' },
            { icon: "BarChart3", title: 'Tus Métricas, Tu Ascenso', description: 'Demuestra tu rendimiento con reportes automáticos. KPIs claros para negociar tus comisiones.' },
            { icon: "Package", title: 'Cero Muestras Perdidas', description: 'Control total de tu inventario promocional. Nunca más te quedes sin material para un médico clave.' },
            { icon: "ShieldCheck", title: 'Funciona Offline', description: '¿Sin señal en el hospital? No hay problema. Tu información está siempre disponible y se sincroniza después.' },
            { icon: "Smartphone", title: 'Oficina en tu Bolsillo', description: 'Toda la potencia de un CRM corporativo, diseñado para la pantalla de tu móvil.' }
        ]
    },
    testimonials: {
        badge: "Casos de Éxito",
        title: "Dejaron el Excel y recuperaron su tiempo.",
        quote: "Antes pasaba todo mi sábado haciendo reportes del ciclo. Con MediVisitPro, simplemente cierro mi sesión al final del día y el reporte ya está en la bandeja de mi jefe. He subido mis visitas un 25%.",
        author: "Carlos M.",
        role: "Representante Senior - Lab Farmacéutico",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
    },
    faq: [
        { q: "¿Realmente funciona sin conexión a internet?", a: "Sí. MediVisitPro está construida como una PWA. Puedes registrar visitas y ver tu agenda sin señal; se sincroniza al recuperar conexión." },
        { q: "¿Cómo calculan las rutas optimizadas?", a: "Utilizamos algoritmos de optimización de rutas (TSP) basados en OSRM para ofrecerte el camino más corto." },
        { q: "¿Mis datos están seguros?", a: "Absolutamente. Utilizamos Supabase con encriptación de grado bancario y RLS." },
        { q: "¿Puedo importar mi lista actual de médicos?", a: "Sí, contamos con una herramienta de importación masiva que acepta archivos CSV y Excel." }
    ],
    cta: {
        title: "¿Listo para ser el N°1 de tu zona?",
        subtitle: "No necesitas tarjeta de crédito. Empieza a usar MediVisitPro hoy y nota la diferencia en tu primera semana.",
        button_primary: "Empezar Ahora - Es Gratis",
        button_secondary: "Ver Demo Primero"
    }
};

export const fetchLandingContent = async (): Promise<LandingContent> => {
    try {
        const { data, error } = await supabase
            .from('site_settings')
            .select('*')
            .eq('key', 'landing_content')
            .maybeSingle();

        if (error) {
            console.error("Error fetching landing content:", error);
            return DEFAULT_LANDING_CONTENT;
        }

        if (!data) {
            // First run, return defaults silently
            return DEFAULT_LANDING_CONTENT;
        }

        return data.value as LandingContent;
    } catch (e) {
        console.error("Error fetching landing content", e);
        return DEFAULT_LANDING_CONTENT;
    }
};

export const saveLandingContent = async (content: LandingContent) => {
    const { error } = await supabase
        .from('site_settings')
        .upsert({
            key: 'landing_content',
            value: content
        }, { onConflict: 'key' });

    if (error) throw error;
};
