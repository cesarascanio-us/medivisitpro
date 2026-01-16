const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

export interface OverpassPlace {
    id: number;
    lat: number;
    lon: number;
    tags: {
        name?: string;
        amenity?: string;
        'addr:street'?: string;
        'addr:city'?: string;
        'addr:housenumber'?: string;
        phone?: string;
        opening_hours?: string;
        website?: string;
    };
    distance?: number; // Calculated distance from search center
}

/**
 * Busca lugares cercanos usando Overpass API (OpenStreetMap)
 * @param center - Centro de búsqueda {lat, lng}
 * @param type - Tipo de lugar: hospital, pharmacy, doctors, clinic
 * @param radiusKm - Radio de búsqueda en kilómetros (default: 5km)
 * @returns Lista de lugares encontrados
 */
export async function findNearbyPlaces(
    center: { lat: number; lng: number },
    type: 'hospital' | 'pharmacy' | 'doctors' | 'clinic',
    radiusKm: number = 5
): Promise<OverpassPlace[]> {
    // Convertir km a metros para Overpass
    const radiusMeters = radiusKm * 1000;

    // Mapeo de tipos de amenity en OpenStreetMap
    const amenityMap: Record<string, string> = {
        hospital: 'hospital',
        pharmacy: 'pharmacy',
        doctors: 'doctors',
        clinic: 'clinic'
    };

    const amenity = amenityMap[type];

    // Query en Overpass QL
    // Busca tanto nodos como áreas (ways) con el amenity especificado
    const query = `
    [out:json][timeout:25];
    (
      node["amenity"="${amenity}"](around:${radiusMeters},${center.lat},${center.lng});
      way["amenity"="${amenity}"](around:${radiusMeters},${center.lat},${center.lng});
    );
    out center;
  `;

    try {
        const response = await fetch(OVERPASS_URL, {
            method: 'POST',
            body: query,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        if (!response.ok) {
            throw new Error(`Overpass API error: ${response.status}`);
        }

        const data = await response.json();

        // Procesar resultados y calcular distancia
        const places: OverpassPlace[] = data.elements.map((element: any) => {
            // Para ways, usar el centro calculado
            const lat = element.lat || element.center?.lat;
            const lon = element.lon || element.center?.lon;

            // Calcular distancia aproximada desde el centro de búsqueda
            const distance = calculateDistanceSimple(
                center.lat,
                center.lng,
                lat,
                lon
            );

            return {
                id: element.id,
                lat,
                lon,
                tags: element.tags || {},
                distance
            };
        });

        // Ordenar por distancia
        places.sort((a, b) => (a.distance || 0) - (b.distance || 0));

        return places;
    } catch (error) {
        console.error('Error en Overpass API:', error);
        return [];
    }
}

/**
 * Búsqueda genérica de lugares por tags personalizados
 * @param center - Centro de búsqueda
 * @param tags - Tags de OpenStreetMap a buscar (ej: {healthcare: 'hospital'})
 * @param radiusKm - Radio en kilómetros
 * @returns Lugares encontrados
 */
export async function searchPlacesByTags(
    center: { lat: number; lng: number },
    tags: Record<string, string>,
    radiusKm: number = 5
): Promise<OverpassPlace[]> {
    const radiusMeters = radiusKm * 1000;

    // Construir condiciones de tags
    const tagConditions = Object.entries(tags)
        .map(([key, value]) => `["${key}"="${value}"]`)
        .join('');

    const query = `
    [out:json][timeout:25];
    (
      node${tagConditions}(around:${radiusMeters},${center.lat},${center.lng});
      way${tagConditions}(around:${radiusMeters},${center.lat},${center.lng});
    );
    out center;
  `;

    try {
        const response = await fetch(OVERPASS_URL, {
            method: 'POST',
            body: query
        });

        if (!response.ok) {
            throw new Error(`Overpass API error: ${response.status}`);
        }

        const data = await response.json();

        const places: OverpassPlace[] = data.elements.map((element: any) => {
            const lat = element.lat || element.center?.lat;
            const lon = element.lon || element.center?.lon;

            return {
                id: element.id,
                lat,
                lon,
                tags: element.tags || {},
                distance: calculateDistanceSimple(center.lat, center.lng, lat, lon)
            };
        });

        places.sort((a, b) => (a.distance || 0) - (b.distance || 0));

        return places;
    } catch (error) {
        console.error('Error en Overpass API:', error);
        return [];
    }
}

/**
 * Formatea información de un lugar de Overpass
 * @param place - Lugar de Overpass
 * @returns Información formateada para mostrar
 */
export function formatPlaceInfo(place: OverpassPlace): {
    name: string;
    address: string;
    phone?: string;
    website?: string;
    openingHours?: string;
} {
    const tags = place.tags;

    // Construir dirección
    const addressParts = [
        tags['addr:street'],
        tags['addr:housenumber'],
        tags['addr:city']
    ].filter(Boolean);

    return {
        name: tags.name || 'Sin nombre',
        address: addressParts.join(', ') || 'Dirección no disponible',
        phone: tags.phone,
        website: tags.website,
        openingHours: tags.opening_hours
    };
}

/**
 * Cálculo simple de distancia (Haversine)
 * @returns Distancia en kilómetros
 */
function calculateDistanceSimple(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
): number {
    const R = 6371; // Radio de la Tierra en km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

/**
 * Formatea distancia en km o metros
 */
export function formatPlaceDistance(distanceKm: number): string {
    if (distanceKm < 1) {
        return `${Math.round(distanceKm * 1000)} m`;
    }
    return `${distanceKm.toFixed(1)} km`;
}
