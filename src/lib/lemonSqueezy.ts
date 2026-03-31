/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */


interface CheckoutOptions {
    variantId: string;
    userEmail?: string;
    userId?: string;
    redirectUrl?: string;
}

export function getCheckoutUrl({ variantId, userEmail, userId, redirectUrl }: CheckoutOptions): string {
    const storeId = import.meta.env.VITE_LEMONSQUEEZY_STORE_ID;
    const baseUrl = `https://medivisitpro.lemonsqueezy.com/buy/${variantId}`;

    const params = new URLSearchParams();

    // Pre-fill user data
    if (userEmail) {
        params.append('checkout[email]', userEmail);
    }

    // Pass custom data for webhook processing
    if (userId) {
        params.append('checkout[custom][user_id]', userId);
    }

    // Redirect back to app after purchase
    const finalRedirect = redirectUrl || window.location.origin + '/dashboard?checkout=success';
    params.append('checkout[redirect_url]', finalRedirect);

    return `${baseUrl}?${params.toString()}`;
}

export const LEMONSQUEEZY_CONFIG = {
    storeId: import.meta.env.VITE_LEMONSQUEEZY_STORE_ID,
    proVariantId: import.meta.env.VITE_LEMONSQUEEZY_PRO_VARIANT_ID
};
