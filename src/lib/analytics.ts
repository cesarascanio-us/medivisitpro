/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */


type EventName =
    | 'view_landing'
    | 'click_start_free'
    | 'click_demo'
    | 'click_whatsapp'
    | 'click_login'
    | 'click_pricing_plan'
    | 'calculate_commissions'
    | 'submit_contact_form_init'
    | 'submit_contact_form_success'
    | 'submit_contact_form_error'
    | 'click_demo_header'
    | 'click_demo_hero';

interface EventProperties {
    [key: string]: string | number | boolean;
}

export const trackEvent = (name: EventName, properties?: EventProperties) => {
    // In a real app, this would send data to GA4, Mixpanel, etc.
    // For now, we log to console in development to verify it works.
    if (import.meta.env.DEV) {
        console.log(`[Analytics] ${name}`, properties);
    }

    // Example of how to integrate with window.gtag if it were present
    // if (typeof window !== 'undefined' && (window as any).gtag) {
    //   (window as any).gtag('event', name, properties);
    // }
};
