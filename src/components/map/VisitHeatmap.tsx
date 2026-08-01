/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

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

        // Verificar si leaflet.heat está cargado
        if (typeof L.heatLayer !== 'function') {
            console.error('L.heatLayer is not a function. Heatmap plugin may not be loaded.');
            return;
        }

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
                try {
                    map.removeLayer(heatLayerRef.current);
                } catch (e) {
                    console.warn("Leaflet map already destroyed during cleanup", e);
                }
                heatLayerRef.current = null;
            }
        };
    }, [map, visits, show, radius, blur, maxZoom]);

    // Este componente no renderiza nada visible, solo agrega capas al mapa
    return null;
}

export default VisitHeatmap;
