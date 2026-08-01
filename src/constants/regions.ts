/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

export const REGION_MAPPING: Record<string, string> = {
    'Distrito Capital': 'Capital', 'Miranda': 'Capital', 'La Guaira': 'Capital',
    'Aragua': 'Central', 'Carabobo': 'Central', 'Cojedes': 'Central', 'Guárico': 'Central',
    'Zulia': 'Occidente', 'Falcón': 'Occidente', 'Lara': 'Occidente', 'Yaracuy': 'Occidente',
    'Mérida': 'Los Andes', 'Táchira': 'Los Andes', 'Trujillo': 'Los Andes',
    'Anzoátegui': 'Oriente', 'Monagas': 'Oriente', 'Sucre': 'Oriente', 'Nueva Esparta': 'Oriente',
    'Bolívar': 'Guayana', 'Barinas': 'Llanos', 'Portuguesa': 'Llanos', 'Apure': 'Llanos'
};

export const getStatesInRegion = (region: string) => {
    return Object.entries(REGION_MAPPING)
        .filter(([_, r]) => r === region)
        .map(([state]) => state);
};

export const getAllStates = () => {
    return Object.keys(REGION_MAPPING).sort().filter((v, i, a) => a.indexOf(v) === i);
};

export const getAllRegions = () => {
    return Object.values(REGION_MAPPING).filter((v, i, a) => a.indexOf(v) === i).sort();
};
