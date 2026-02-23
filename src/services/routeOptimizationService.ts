/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

/**
 * Route Optimization Service
 * Uses a simple greedy "Nearest Neighbor" algorithm for route optimization
 */

interface Location {
    id: string;
    name: string;
    lat: number;
    lng: number;
    type: string;
    priority?: 'high' | 'medium' | 'low';
    visitDuration?: number; // minutes
}

interface OptimizedRoute {
    stops: Location[];
    totalDistance: number; // in km
    estimatedDuration: number; // in minutes
    savingsPercent: number;
}

/**
 * Calculate distance between two points using Haversine formula
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
 * Calculate total distance of a route
 */
function calculateTotalDistance(locations: Location[]): number {
    let total = 0;
    for (let i = 0; i < locations.length - 1; i++) {
        total += calculateDistance(
            locations[i].lat, locations[i].lng,
            locations[i + 1].lat, locations[i + 1].lng
        );
    }
    return total;
}

/**
 * Nearest Neighbor Algorithm for route optimization
 * Starts from the first location and always goes to the nearest unvisited location
 */
function nearestNeighborOptimization(locations: Location[], startIndex: number = 0): Location[] {
    if (locations.length <= 2) return [...locations];

    const optimized: Location[] = [];
    const unvisited = [...locations];

    // Start from the specified index
    let current = unvisited.splice(startIndex, 1)[0];
    optimized.push(current);

    while (unvisited.length > 0) {
        // Find nearest unvisited location
        let nearestIndex = 0;
        let nearestDistance = Infinity;

        for (let i = 0; i < unvisited.length; i++) {
            const distance = calculateDistance(
                current.lat, current.lng,
                unvisited[i].lat, unvisited[i].lng
            );

            // Apply priority weight (high priority = lower effective distance)
            let effectiveDistance = distance;
            if (unvisited[i].priority === 'high') effectiveDistance *= 0.7;
            else if (unvisited[i].priority === 'medium') effectiveDistance *= 0.85;

            if (effectiveDistance < nearestDistance) {
                nearestDistance = effectiveDistance;
                nearestIndex = i;
            }
        }

        current = unvisited.splice(nearestIndex, 1)[0];
        optimized.push(current);
    }

    return optimized;
}

/**
 * 2-opt optimization to improve the route
 * Tries to uncross any crossed paths
 */
function twoOptImprovement(locations: Location[]): Location[] {
    if (locations.length <= 3) return [...locations];

    let improved = [...locations];
    let betterFound = true;

    while (betterFound) {
        betterFound = false;
        for (let i = 1; i < improved.length - 2; i++) {
            for (let j = i + 1; j < improved.length - 1; j++) {
                const currentDistance =
                    calculateDistance(improved[i - 1].lat, improved[i - 1].lng, improved[i].lat, improved[i].lng) +
                    calculateDistance(improved[j].lat, improved[j].lng, improved[j + 1].lat, improved[j + 1].lng);

                const newDistance =
                    calculateDistance(improved[i - 1].lat, improved[i - 1].lng, improved[j].lat, improved[j].lng) +
                    calculateDistance(improved[i].lat, improved[i].lng, improved[j + 1].lat, improved[j + 1].lng);

                if (newDistance < currentDistance - 0.001) { // Small threshold to avoid floating point issues
                    // Reverse the segment between i and j
                    const reversed = improved.slice(i, j + 1).reverse();
                    improved = [
                        ...improved.slice(0, i),
                        ...reversed,
                        ...improved.slice(j + 1)
                    ];
                    betterFound = true;
                }
            }
        }
    }

    return improved;
}

/**
 * Main optimization function
 * Combines Nearest Neighbor with 2-opt improvement
 */
export function optimizeRoute(
    locations: Location[],
    startLocation?: Location,
    endLocation?: Location
): OptimizedRoute {
    if (locations.length === 0) {
        return {
            stops: [],
            totalDistance: 0,
            estimatedDuration: 0,
            savingsPercent: 0
        };
    }

    // Calculate original distance
    const originalDistance = calculateTotalDistance(locations);

    // Build the list to optimize
    let toOptimize = [...locations];
    let startIndex = 0;

    // If start location is specified and in the list, move it to the beginning
    if (startLocation) {
        const startIdx = toOptimize.findIndex(l => l.id === startLocation.id);
        if (startIdx >= 0) {
            startIndex = startIdx;
        } else {
            toOptimize = [startLocation, ...toOptimize];
        }
    }

    // Apply Nearest Neighbor algorithm
    let optimized = nearestNeighborOptimization(toOptimize, startIndex);

    // Apply 2-opt improvement
    optimized = twoOptImprovement(optimized);

    // If end location is specified, ensure it's at the end
    if (endLocation) {
        const endIdx = optimized.findIndex(l => l.id === endLocation.id);
        if (endIdx >= 0 && endIdx !== optimized.length - 1) {
            const [endLoc] = optimized.splice(endIdx, 1);
            optimized.push(endLoc);
        } else if (endIdx < 0) {
            optimized.push(endLocation);
        }
    }

    // Calculate optimized distance
    const optimizedDistance = calculateTotalDistance(optimized);

    // Calculate estimated duration (assuming 30 km/h average speed + visit times)
    const travelTime = (optimizedDistance / 30) * 60; // minutes
    const visitTime = optimized.reduce((sum, loc) => sum + (loc.visitDuration || 20), 0);
    const estimatedDuration = travelTime + visitTime;

    // Calculate savings
    const savingsPercent = originalDistance > 0
        ? Math.round(((originalDistance - optimizedDistance) / originalDistance) * 100)
        : 0;

    return {
        stops: optimized,
        totalDistance: Math.round(optimizedDistance * 10) / 10,
        estimatedDuration: Math.round(estimatedDuration),
        savingsPercent: Math.max(0, savingsPercent)
    };
}

/**
 * Get the optimal order for a list of visits
 */
export async function getOptimalVisitOrder(
    visits: Array<{
        id: string;
        contact_name: string;
        latitude: number;
        longitude: number;
        contact_type: string;
        priority?: 'high' | 'medium' | 'low';
    }>,
    userLocation?: { lat: number; lng: number }
): Promise<OptimizedRoute> {
    const locations: Location[] = visits.map(v => ({
        id: v.id,
        name: v.contact_name,
        lat: v.latitude,
        lng: v.longitude,
        type: v.contact_type,
        priority: v.priority,
        visitDuration: 20 // Default 20 minutes per visit
    }));

    const startLocation = userLocation ? {
        id: 'start',
        name: 'Mi ubicación',
        lat: userLocation.lat,
        lng: userLocation.lng,
        type: 'user',
        visitDuration: 0
    } : undefined;

    return optimizeRoute(locations, startLocation);
}

/**
 * Format duration for display
 */
export function formatDuration(minutes: number): string {
    if (minutes < 60) {
        return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
}

export type { Location, OptimizedRoute };
