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
    security: {
        title: string;
        items: Array<{ icon: string; title: string; subtitle: string }>;
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
        badge: "Tecnología de Grado Operativo",
        title_part1: "Orquestación inteligente de",
        title_highlight: "Visita Médica de Élite",
        subtitle: "Diseñado para la administración médica de élite. Arquitectura totalmente compatible con ISO 9000, pensada para entornos empresariales de alto rendimiento.",
        cta_primary: "Contactar Ventas",
        cta_secondary: "Ver Ecosistema",
        hero_image: "/img/landing/hero-premium.png"
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
        title: "Capacidades de Grado Maestro",
        subtitle: "Diseñado para organizaciones que exigen la perfección operativa y la trazabilidad absoluta en cada visita médica.",
        items: [
            { icon: "Calendar", title: 'Visit Management 2.0', description: 'Motor automatizado de programación predictiva y orquestación para territorios complejos. Routing inteligente con balanceo de carga.' },
            { icon: "Package", title: 'Sample Vault', description: 'Inventario inmutable certificado de muestras médicas. Rastreo de alta seguridad desde calibración en bodega hasta entrega en el consultorio.' },
            { icon: "BarChart3", title: 'Intelligent Dashboard', description: 'Analíticas predictivas en tiempo real. Monitorea la cobertura y desempeño de zona con micro-ajustes operativos en vivo.' }
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
    security: {
        title: "Hardened Enterprise Security",
        items: [
            { icon: "ShieldCheck", title: "ISO 9001 Certified", subtitle: "Quality Management System" },
            { icon: "Lock", title: "GDPR Compliant", subtitle: "EU Data Protection" },
            { icon: "CheckCircle2", title: "HIPAA Compliant", subtitle: "Medical Data Privacy" }
        ]
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
        const { data, error } = await (supabase as any)
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
    const { error } = await (supabase as any)
        .from('site_settings')
        .upsert({
            key: 'landing_content',
            value: content
        }, { onConflict: 'key' });

    if (error) throw error;
};
