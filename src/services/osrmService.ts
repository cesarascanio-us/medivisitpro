const OSRM_URL = 'https://router.project-osrm.org';

export interface OSRMRoute {
    distance: number; // metros
    duration: number; // segundos
    geometry: string; // polyline encoded
    legs: OSRMLeg[];
}

export interface OSRMLeg {
    distance: number;
    duration: number;
    steps: OSRMStep[];
}

export interface OSRMStep {
    distance: number;
    duration: number;
    name: string;
    maneuver: {
        type: string;
        modifier?: string;
    };
}

export interface OptimizedRoute {
    optimizedOrder: string[];
    totalDistance: number;
    totalDuration: number;
    polyline: [number, number][];
}

/**
 * Calcula una ruta entre múltiples puntos
 * @param points - Array de puntos {lat, lng, id?}
 * @returns Ruta calculada con distancia y duración
 */
export async function calculateRoute(
    points: { lat: number; lng: number; id?: string }[]
): Promise<OSRMRoute | null> {
    if (points.length < 2) {
        return null;
    }

    try {
        // OSRM usa formato lng,lat (al revés de lat,lng)
        const coords = points
            .map(p => `${p.lng},${p.lat}`)
            .join(';');

        const response = await fetch(
            `${OSRM_URL}/route/v1/driving/${coords}?` +
            new URLSearchParams({
                overview: 'full',
                geometries: 'polyline',
                steps: 'true'
            })
        );

        const data = await response.json();

        if (data.code !== 'Ok') {
            console.error('OSRM error:', data.message);
            return null;
        }

        return data.routes[0];
    } catch (error) {
        console.error('Error calculando ruta:', error);
        return null;
    }
}

/**
 * Optimiza el orden de waypoints (Traveling Salesman Problem)
 * @param start - Punto de inicio
 * @param points - Puntos a visitar
 * @returns Ruta optimizada con orden de visitas
 */
export async function optimizeRoute(
    start: { lat: number; lng: number },
    points: { lat: number; lng: number; id: string }[]
): Promise<OptimizedRoute | null> {
    if (points.length === 0) {
        return null;
    }

    try {
        const allPoints = [start, ...points];
        const coords = allPoints
            .map(p => `${p.lng},${p.lat}`)
            .join(';');

        // Usar servicio Trip de OSRM que optimiza el orden
        const response = await fetch(
            `${OSRM_URL}/trip/v1/driving/${coords}?` +
            new URLSearchParams({
                overview: 'full',
                geometries: 'polyline',
                source: 'first', // Comenzar desde el primer punto
                destination: 'any', // Terminar en cualquier punto
                roundtrip: 'false' // No regresar al inicio
            })
        );

        const data = await response.json();

        if (data.code !== 'Ok') {
            console.error('OSRM trip error:', data.message);
            return null;
        }

        const trip = data.trips[0];

        // Obtener orden optimizado (excluyendo el punto de inicio)
        const waypointIndices = trip.waypoints
            .slice(1) // Excluir punto de inicio
            .map((wp: any) => wp.waypoint_index - 1); // Ajustar índice

        const optimizedOrder = waypointIndices
            .map((idx: number) => points[idx]?.id)
            .filter(Boolean);

        // Decodificar polyline
        const polylineCoords = decodePolyline(trip.geometry);

        return {
            optimizedOrder,
            totalDistance: trip.distance,
            totalDuration: trip.duration,
            polyline: polylineCoords
        };
    } catch (error) {
        console.error('Error optimizando ruta:', error);
        return null;
    }
}

/**
 * Decodifica un polyline de OSRM a coordenadas
 * @param encoded - String encoded polyline
 * @returns Array de coordenadas [lat, lng]
 */
export function decodePolyline(encoded: string): [number, number][] {
    const coords: [number, number][] = [];
    let index = 0;
    let lat = 0;
    let lng = 0;

    while (index < encoded.length) {
        let shift = 0;
        let result = 0;
        let byte;

        // Decodificar latitud
        do {
            byte = encoded.charCodeAt(index++) - 63;
            result |= (byte & 0x1f) << shift;
            shift += 5;
        } while (byte >= 0x20);

        const deltaLat = (result & 1) ? ~(result >> 1) : (result >> 1);
        lat += deltaLat;

        shift = 0;
        result = 0;

        // Decodificar longitud
        do {
            byte = encoded.charCodeAt(index++) - 63;
            result |= (byte & 0x1f) << shift;
            shift += 5;
        } while (byte >= 0x20);

        const deltaLng = (result & 1) ? ~(result >> 1) : (result >> 1);
        lng += deltaLng;

        coords.push([lat / 1e5, lng / 1e5]);
    }

    return coords;
}

/**
 * Formatea distancia en metros a string legible
 * @param meters - Distancia en metros
 * @returns String formateado (ej: "1.5 km")
 */
export function formatDistance(meters: number): string {
    if (meters < 1000) {
        return `${Math.round(meters)} m`;
    }
    return `${(meters / 1000).toFixed(1)} km`;
}

/**
 * Formatea duración en segundos a string legible
 * @param seconds - Duración en segundos
 * @returns String formateado (ej: "1h 30min")
 */
export function formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
        return `${hours}h ${minutes}min`;
    }
    return `${minutes} min`;
}

/**
 * Calcula distancia estimada entre dos puntos (Haversine)
 * Útil para estimaciones rápidas sin llamar a OSRM
 * @param p1 - Punto 1
 * @param p2 - Punto 2
 * @returns Distancia en metros
 */
export function calculateDistance(
    p1: { lat: number; lng: number },
    p2: { lat: number; lng: number }
): number {
    const R = 6371e3; // Radio de la Tierra en metros
    const φ1 = (p1.lat * Math.PI) / 180;
    const φ2 = (p2.lat * Math.PI) / 180;
    const Δφ = ((p2.lat - p1.lat) * Math.PI) / 180;
    const Δλ = ((p2.lng - p1.lng) * Math.PI) / 180;

    const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}
