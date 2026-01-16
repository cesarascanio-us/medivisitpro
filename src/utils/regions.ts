export const REGION_MAPPING: Record<string, string> = {
    'Distrito Capital': 'Capital', 'Miranda': 'Capital', 'La Guaira': 'Capital',
    'Aragua': 'Central', 'Carabobo': 'Central', 'Cojedes': 'Central', 'Guárico': 'Central',
    'Zulia': 'Occidente', 'Falcón': 'Occidente', 'Lara': 'Occidente', 'Yaracuy': 'Occidente',
    'Mérida': 'Los Andes', 'Táchira': 'Los Andes', 'Trujillo': 'Los Andes',
    'Anzoátegui': 'Oriente', 'Monagas': 'Oriente', 'Sucre': 'Oriente', 'Nueva Esparta': 'Oriente',
    'Bolívar': 'Guayana', 'Barinas': 'Llanos', 'Portuguesa': 'Llanos', 'Apure': 'Llanos'
};

export const getRegion = (state: string) => REGION_MAPPING[state] || 'Otras';

export const getStatesInRegion = (region: string) => {
    return Object.entries(REGION_MAPPING)
        .filter(([_, r]) => r === region)
        .map(([state]) => state);
};
