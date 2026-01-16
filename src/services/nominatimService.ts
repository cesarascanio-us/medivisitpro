const NOMINATIM_URL = 'https://nominatim.openstreetmap.org';

export interface NominatimResult {
    lat: string;
    lon: string;
    display_name: string;
    address?: {
        city?: string;
        state?: string;
        country?: string;
        road?: string;
    };
}

// Rate limiting: Nominatim requiere máximo 1 request/segundo
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000; // 1 segundo

async function rateLimitedFetch<T>(fetchFn: () => Promise<T>): Promise<T> {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;

    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
        await new Promise(resolve =>
            setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest)
        );
    }

    lastRequestTime = Date.now();
    return await fetchFn();
}

/**
 * Geocoding: Convierte una dirección en coordenadas
 * @param address - Dirección a geocodificar
 * @param countryCode - Código de país (ve = Venezuela)
 * @returns Coordenadas {lat, lng} o null si no se encuentra
 */
export async function geocodeAddress(
    address: string,
    countryCode: string = 've'
): Promise<{ lat: number; lng: number } | null> {
    if (!address || address.trim().length < 3) {
        return null;
    }

    try {
        const result = await rateLimitedFetch(async () => {
            const response = await fetch(
                `${NOMINATIM_URL}/search?` +
                new URLSearchParams({
                    q: address,
                    format: 'json',
                    limit: '1',
                    countrycodes: countryCode,
                    addressdetails: '1'
                }),
                {
                    headers: {
                        'User-Agent': 'MediVisitPro/1.0 (contact: your-email@example.com)'
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`Nominatim error: ${response.status}`);
            }

            return await response.json();
        });

        const data: NominatimResult[] = result;

        if (data.length === 0) {
            console.warn(`No se encontraron resultados para: ${address}`);
            return null;
        }

        return {
            lat: parseFloat(data[0].lat),
            lng: parseFloat(data[0].lon)
        };
    } catch (error) {
        console.error('Error en geocoding:', error);
        return null;
    }
}

/**
 * Reverse Geocoding: Convierte coordenadas en una dirección
 * @param lat - Latitud
 * @param lng - Longitud
 * @returns Dirección formateada o string vacío si falla
 */
export async function reverseGeocode(
    lat: number,
    lng: number
): Promise<string> {
    try {
        const result = await rateLimitedFetch(async () => {
            const response = await fetch(
                `${NOMINATIM_URL}/reverse?` +
                new URLSearchParams({
                    lat: lat.toString(),
                    lon: lng.toString(),
                    format: 'json',
                    addressdetails: '1'
                }),
                {
                    headers: {
                        'User-Agent': 'MediVisitPro/1.0 (contact: your-email@example.com)'
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`Nominatim error: ${response.status}`);
            }

            return await response.json();
        });

        const data: NominatimResult = result;
        return data.display_name || '';
    } catch (error) {
        console.error('Error en reverse geocoding:', error);
        return '';
    }
}

/**
 * Búsqueda de direcciones con autocompletado
 * @param query - Texto a buscar
 * @param countryCode - Código de país
 * @returns Lista de resultados
 */
export async function searchAddresses(
    query: string,
    countryCode: string = 've',
    limit: number = 5
): Promise<NominatimResult[]> {
    if (!query || query.trim().length < 3) {
        return [];
    }

    try {
        const result = await rateLimitedFetch(async () => {
            const response = await fetch(
                `${NOMINATIM_URL}/search?` +
                new URLSearchParams({
                    q: query,
                    format: 'json',
                    limit: limit.toString(),
                    countrycodes: countryCode,
                    addressdetails: '1'
                }),
                {
                    headers: {
                        'User-Agent': 'MediVisitPro/1.0 (contact: your-email@example.com)'
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`Nominatim error: ${response.status}`);
            }

            return await response.json();
        });

        return result;
    } catch (error) {
        console.error('Error en búsqueda de direcciones:', error);
        return [];
    }
}

/**
 * Formatea una dirección desde componentes
 * @param street - Calle
 * @param city - Ciudad
 * @param state - Estado
 * @param country - País
 * @returns Dirección formateada para geocoding
 */
export function formatAddressForGeocoding(
    street?: string,
    city?: string,
    state?: string,
    country: string = 'Venezuela'
): string {
    const parts = [street, city, state, country].filter(Boolean);
    return parts.join(', ');
}
