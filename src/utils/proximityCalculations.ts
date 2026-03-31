/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

/**
 * Utilidades para cálculos de proximidad entre ubicaciones
 * Útil para análisis de farmacias cercanas a hospitales
 */

export interface Location {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    type?: string;
}

export interface ProximityResult {
    pharmacy: Location;
    nearbyHospitals: Array<{
        hospital: Location;
        distance: number; // en metros
    }>;
    isGoldOpportunity: boolean; // Cerca de 2 o más hospitales
    priority: 'high' | 'medium' | 'low';
    totalNearby: number;
}

/**
 * Calcula la distancia entre dos puntos usando la fórmula Haversine
 * @returns Distancia en metros
 */
export function calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number {
    const R = 6371e3; // Radio de la Tierra en metros
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distancia en metros
}

/**
 * Encuentra farmacias cercanas a hospitales/clínicas
 * @param pharmacies - Lista de farmacias
 * @param hospitals - Lista de hospitales y clínicas
 * @param radius - Radio de búsqueda en metros (default: 1000m = 1km)
 * @returns Lista de resultados de proximidad ordenados por prioridad
 */
export function findPharmaciesNearHospitals(
    pharmacies: Location[],
    hospitals: Location[],
    radius: number = 1000
): ProximityResult[] {
    const results: ProximityResult[] = pharmacies.map((pharmacy) => {
        const nearbyHospitals = hospitals
            .map((hospital) => {
                const distance = calculateDistance(
                    pharmacy.latitude,
                    pharmacy.longitude,
                    hospital.latitude,
                    hospital.longitude
                );

                return {
                    hospital,
                    distance
                };
            })
            .filter((item) => item.distance <= radius)
            .sort((a, b) => a.distance - b.distance);

        const totalNearby = nearbyHospitals.length;
        const isGoldOpportunity = totalNearby >= 2;

        let priority: 'high' | 'medium' | 'low' = 'low';
        if (totalNearby >= 3) {
            priority = 'high';
        } else if (totalNearby === 2) {
            priority = 'medium';
        }

        return {
            pharmacy,
            nearbyHospitals,
            isGoldOpportunity,
            priority,
            totalNearby
        };
    });

    // Ordenar por prioridad (más hospitales cercanos primero)
    return results.sort((a, b) => b.totalNearby - a.totalNearby);
}

/**
 * Filtra solo las farmacias que están en zona de influencia
 * @param results - Resultados de proximidad
 * @returns Solo farmacias con al menos 1 hospital cercano
 */
export function getPharmaciesInZone(results: ProximityResult[]): ProximityResult[] {
    return results.filter((r) => r.totalNearby > 0);
}

/**
 * Filtra solo las oportunidades "gold" (2+ hospitales cercanos)
 * @param results - Resultados de proximidad
 * @returns Solo farmacias con 2 o más hospitales cercanos
 */
export function getGoldOpportunities(results: ProximityResult[]): ProximityResult[] {
    return results.filter((r) => r.isGoldOpportunity);
}

/**
 * Formatea distancia para mostrar al usuario
 * @param meters - Distancia en metros
 * @returns String formateado (ej: "450 m" o "1.2 km")
 */
export function formatDistance(meters: number): string {
    if (meters < 1000) {
        return `${Math.round(meters)} m`;
    }
    return `${(meters / 1000).toFixed(1)} km`;
}

/**
 * Genera estadísticas del análisis de proximidad
 */
export function getProximityStats(results: ProximityResult[]) {
    const total = results.length;
    const inZone = results.filter((r) => r.totalNearby > 0).length;
    const outOfZone = total - inZone;
    const goldOpportunities = results.filter((r) => r.isGoldOpportunity).length;
    const percentageInZone = total > 0 ? Math.round((inZone / total) * 100) : 0;

    return {
        total,
        inZone,
        outOfZone,
        goldOpportunities,
        percentageInZone,
        highPriority: results.filter((r) => r.priority === 'high').length,
        mediumPriority: results.filter((r) => r.priority === 'medium').length,
        lowPriority: results.filter((r) => r.priority === 'low').length
    };
}

/**
 * Exporta los resultados a formato CSV/Excel básico
 */
export function exportProximityToExcel(results: ProximityResult[], radius: number) {
    if (results.length === 0) return;

    const headers = ['Farmacia', 'Estado Proximidad', 'Centros Cercanos', 'Distacia Mínima', 'Detalle Centros'];
    const rows = results.map(r => {
        const inZone = r.totalNearby > 0 ? 'EN ZONA' : 'FUERA';
        const centersLine = r.nearbyHospitals.map(h => `${h.hospital.name} (${formatDistance(h.distance)})`).join('| ');
        const minDistance = r.totalNearby > 0 ? formatDistance(r.nearbyHospitals[0].distance) : 'N/A';

        return [
            r.pharmacy.name,
            inZone,
            r.totalNearby,
            minDistance,
            centersLine
        ];
    });

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Analisis_Proximidad_${radius}m.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
