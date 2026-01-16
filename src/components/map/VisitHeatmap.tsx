import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';

interface VisitHeatmapProps {
    visits: Array<{
        latitude: number;
        longitude: number;
        intensity?: number;
    }>;
    show: boolean;
    radius?: number;
    blur?: number;
    maxZoom?: number;
}

/**
 * Componente de mapa de calor para visualizar densidad de visitas
 * Usa leaflet.heat para renderizar el heatmap
 */
export function VisitHeatmap({
    visits,
    show,
    radius = 25,
    blur = 15,
    maxZoom = 17
}: VisitHeatmapProps) {
    const map = useMap();
    const heatLayerRef = useRef<any>(null);

    useEffect(() => {
        // Solo crear el heatmap si show=true y hay datos
        if (!show || visits.length === 0) {
            // Remover capa existente si está oculta
            if (heatLayerRef.current) {
                map.removeLayer(heatLayerRef.current);
                heatLayerRef.current = null;
            }
            return;
        }

        // Preparar datos en formato [lat, lng, intensity]
        const heatData = visits.map(v => [
            v.latitude,
            v.longitude,
            v.intensity || 1
        ] as [number, number, number]);

        // Remover capa anterior si existe
        if (heatLayerRef.current) {
            map.removeLayer(heatLayerRef.current);
        }

        // Crear nueva capa de heatmap
        // @ts-ignore - leaflet.heat no tiene tipos completos
        heatLayerRef.current = L.heatLayer(heatData, {
            radius,
            blur,
            maxZoom,
            gradient: {
                0.0: '#3b82f6',  // Azul (baja densidad)
                0.3: '#10b981',  // Verde
                0.5: '#fbbf24',  // Amarillo
                0.7: '#f59e0b',  // Naranja
                1.0: '#ef4444'   // Rojo (alta densidad)
            },
            minOpacity: 0.3,
            max: Math.max(...heatData.map(d => d[2]))
        });

        // Agregar al mapa
        heatLayerRef.current.addTo(map);

        // Cleanup al desmontar
        return () => {
            if (heatLayerRef.current) {
                map.removeLayer(heatLayerRef.current);
                heatLayerRef.current = null;
            }
        };
    }, [map, visits, show, radius, blur, maxZoom]);

    // Este componente no renderiza nada visible, solo agrega capas al mapa
    return null;
}

export default VisitHeatmap;
