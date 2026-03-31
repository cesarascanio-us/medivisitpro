/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

interface MapContact {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    [key: string]: any;
}

/**
 * Calculate distance between two coordinates using Haversine formula
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

/**
 * Find the nearest unvisited contact
 */
function findNearest(
    current: { lat: number; lng: number },
    contacts: MapContact[],
    visited: Set<string>
): MapContact | null {
    let nearest: MapContact | null = null;
    let minDistance = Infinity;

    for (const contact of contacts) {
        if (visited.has(contact.id)) continue;

        const distance = calculateDistance(
            current.lat,
            current.lng,
            contact.latitude,
            contact.longitude
        );

        if (distance < minDistance) {
            minDistance = distance;
            nearest = contact;
        }
    }

    return nearest;
}

/**
 * Optimize route using Nearest Neighbor algorithm
 * Returns contacts sorted in optimal travel order
 */
export function optimizeRoute(
    contacts: MapContact[],
    startLocation?: { lat: number; lng: number }
): MapContact[] {
    if (contacts.length <= 1) return contacts;

    const optimized: MapContact[] = [];
    const visited = new Set<string>();

    // Start from provided location or first contact
    let current = startLocation || {
        lat: contacts[0].latitude,
        lng: contacts[0].longitude
    };

    // If starting from a contact, add it first
    if (!startLocation && contacts.length > 0) {
        optimized.push(contacts[0]);
        visited.add(contacts[0].id);
        current = { lat: contacts[0].latitude, lng: contacts[0].longitude };
    }

    // Find nearest neighbor for remaining contacts
    while (visited.size < contacts.length) {
        const nearest = findNearest(current, contacts, visited);
        if (!nearest) break;

        optimized.push(nearest);
        visited.add(nearest.id);
        current = { lat: nearest.latitude, lng: nearest.longitude };
    }

    return optimized;
}

/**
 * Calculate total route distance in km
 */
export function calculateRouteDistance(contacts: MapContact[]): number {
    if (contacts.length < 2) return 0;

    let totalDistance = 0;
    for (let i = 0; i < contacts.length - 1; i++) {
        totalDistance += calculateDistance(
            contacts[i].latitude,
            contacts[i].longitude,
            contacts[i + 1].latitude,
            contacts[i + 1].longitude
        );
    }

    return Math.round(totalDistance * 10) / 10;
}

/**
 * Estimate travel time in minutes (assuming 40km/h average in urban areas)
 */
export function estimateTravelTime(distanceKm: number): number {
    const averageSpeedKmH = 40;
    return Math.round((distanceKm / averageSpeedKmH) * 60);
}

/**
 * Get route summary
 */
export function getRouteSummary(contacts: MapContact[]): {
    stops: number;
    totalDistance: number;
    estimatedTime: number;
} {
    const distance = calculateRouteDistance(contacts);
    return {
        stops: contacts.length,
        totalDistance: distance,
        estimatedTime: estimateTravelTime(distance)
    };
}
