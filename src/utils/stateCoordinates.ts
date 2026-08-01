/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

/**
 * Coordenadas de los estados de Venezuela
 * Centro en la capital de cada estado para centrado automático del mapa
 */

export interface StateInfo {
    center: [number, number]; // [lat, lng]
    zoom: number;
    capital: string;
}

export const VENEZUELA_STATES: Record<string, StateInfo> = {
    'Amazonas': {
        center: [5.6637, -67.6234],
        zoom: 9,
        capital: 'Puerto Ayacucho'
    },
    'Anzoátegui': {
        center: [10.1635, -64.6323],
        zoom: 10,
        capital: 'Barcelona'
    },
    'Apure': {
        center: [7.8889, -67.4708],
        zoom: 9,
        capital: 'San Fernando de Apure'
    },
    'Aragua': {
        center: [10.2469, -67.5958],
        zoom: 11,
        capital: 'Maracay'
    },
    'Barinas': {
        center: [8.6226, -70.2441],
        zoom: 10,
        capital: 'Barinas'
    },
    'Bolívar': {
        center: [8.1223, -63.5497],
        zoom: 9,
        capital: 'Ciudad Bolívar'
    },
    'Carabobo': {
        center: [10.1807, -68.0037],
        zoom: 11,
        capital: 'Valencia'
    },
    'Cojedes': {
        center: [9.6615, -68.5875],
        zoom: 10,
        capital: 'San Carlos'
    },
    'Delta Amacuro': {
        center: [8.9347, -62.0508],
        zoom: 9,
        capital: 'Tucupita'
    },
    'Distrito Capital': {
        center: [10.4806, -66.9036],
        zoom: 12,
        capital: 'Caracas'
    },
    'Falcón': {
        center: [11.4045, -69.6733],
        zoom: 10,
        capital: 'Coro'
    },
    'Guárico': {
        center: [8.7514, -66.9335],
        zoom: 10,
        capital: 'San Juan de los Morros'
    },
    'Lara': {
        center: [10.0647, -69.3570],
        zoom: 10,
        capital: 'Barquisimeto'
    },
    'Mérida': {
        center: [8.5897, -71.1561],
        zoom: 10,
        capital: 'Mérida'
    },
    'Miranda': {
        center: [10.4806, -66.9036],
        zoom: 11,
        capital: 'Los Teques'
    },
    'Monagas': {
        center: [9.7469, -63.1832],
        zoom: 10,
        capital: 'Maturín'
    },
    'Nueva Esparta': {
        center: [11.0048, -63.8560],
        zoom: 11,
        capital: 'La Asunción'
    },
    'Portuguesa': {
        center: [9.0562, -69.1978],
        zoom: 10,
        capital: 'Guanare'
    },
    'Sucre': {
        center: [10.4539, -64.1778],
        zoom: 10,
        capital: 'Cumaná'
    },
    'Táchira': {
        center: [7.7669, -72.2252],
        zoom: 10,
        capital: 'San Cristóbal'
    },
    'Trujillo': {
        center: [9.3658, -70.4370],
        zoom: 10,
        capital: 'Trujillo'
    },
    'Vargas': {
        center: [10.5949, -66.9339],
        zoom: 11,
        capital: 'La Guaira'
    },
    'Yaracuy': {
        center: [10.3397, -68.7424],
        zoom: 10,
        capital: 'San Felipe'
    },
    'Zulia': {
        center: [10.6666, -71.6124],
        zoom: 10,
        capital: 'Maracaibo'
    }
};

/**
 * Obtiene el centro del mapa para un estado específico
 * @param stateName - Nombre del estado
 * @returns Coordenadas del centro y zoom, o Venezuela completa si no se encuentra
 */
export function getStateCenter(stateName: string | null | undefined): {
    center: [number, number];
    zoom: number;
} {
    if (!stateName || !VENEZUELA_STATES[stateName]) {
        // Centro de Venezuela (aprox)
        return {
            center: [8.0, -66.0],
            zoom: 6
        };
    }

    const state = VENEZUELA_STATES[stateName];
    return {
        center: state.center,
        zoom: state.zoom
    };
}

/**
 * Lista de todos los estados de Venezuela
 */
export const STATES_LIST = Object.keys(VENEZUELA_STATES).sort();
