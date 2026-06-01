/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import { useEffect, useState, useRef, ReactNode } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, ZoomControl, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';

// Import Leaflet markers CSS
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

export interface MapMarker {
    id: string;
    position: [number, number];
    type: 'doctor' | 'pharmacy' | 'hospital' | 'clinic';
    name: string;
    popupContent: ReactNode;
    onClick?: () => void;
    customColor?: string;
    opacity?: number;
}

export interface PolylineData {
    id: string;
    positions: [number, number][];
    color: string;
    weight?: number;
    opacity?: number;
}

interface LeafletMapProps {
    center: [number, number];
    zoom: number;
    markers: MapMarker[];
    polylines?: PolylineData[];
    height?: string;
    showInfluenceCircles?: boolean;
    influenceRadius?: number;
    children?: ReactNode; // Allow custom components like VisitHeatmap
}

// Custom Icons for different types
const getIconForType = (type: MapMarker['type'], customColor?: string, opacity: number = 1) => {
    let color = customColor || '#3B82F6'; // Default Blue
    let emoji = '📍';

    switch (type) {
        case 'hospital':
        case 'clinic':
            color = customColor || '#EF4444'; // Red
            emoji = '🏥';
            break;
        case 'doctor':
            color = customColor || '#3B82F6'; // Blue
            emoji = '👨‍⚕️';
            break;
        case 'pharmacy':
            color = customColor || '#10B981'; // Green
            emoji = '💊';
            break;
    }

    return L.divIcon({
        className: 'custom-marker',
        html: `<div style="
            position: relative;
            width: 34px;
            height: 34px;
            background-color: ${color};
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 2px solid white;
            box-shadow: 0 0 10px ${color}88, 0 4px 6px rgba(0,0,0,0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            opacity: ${opacity};
        ">
            <span style="transform: rotate(45deg);">${emoji}</span>
        </div>`,
        iconSize: [34, 34],
        iconAnchor: [17, 34],
        popupAnchor: [0, -34],
    });
};

const createClusterCustomIcon = (cluster: any) => {
    return L.divIcon({
        html: `
            <div style="
                background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                width: 40px;
                height: 40px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
                border: 2px solid white;
                box-shadow: 0 4px 10px rgba(59, 130, 246, 0.5);
                font-size: 14px;
            ">
                ${cluster.getChildCount()}
            </div>
        `,
        className: 'custom-marker-cluster',
        iconSize: L.point(40, 40),
    });
};

// Component to handle map view updates internally
function ChangeView({ center, zoom }: { center: [number, number], zoom: number }) {
    const map = useMap();
    const prevRef = useRef<{ center: [number, number], zoom: number }>({ center, zoom });

    useEffect(() => {
        if (map && center && zoom) {
            const isCenterSame = prevRef.current.center[0] === center[0] && prevRef.current.center[1] === center[1];
            const isZoomSame = prevRef.current.zoom === zoom;

            // Only trigger setView if PROPS changed relative to their previous values
            // This prevents snapping back when the user interacts directly with the map
            if (!isCenterSame || !isZoomSame) {
                map.setView(center, zoom);
                prevRef.current = { center, zoom };
            }
        }
    }, [center, zoom, map]);

    return null;
}

// Sub-component for individual markers to manage popup/tooltip state
function MapMarkerItem({ marker }: { marker: MapMarker }) {
    const [isPopupOpen, setIsPopupOpen] = useState(false);

    return (
        <Marker
            position={marker.position}
            icon={getIconForType(marker.type, marker.customColor, marker.opacity)}
            eventHandlers={{
                click: () => {
                    if (marker.onClick) marker.onClick();
                },
                popupopen: () => setIsPopupOpen(true),
                popupclose: () => setIsPopupOpen(false),
            }}
        >
            {!isPopupOpen && (
                <Tooltip direction="top" offset={[0, -32]} opacity={1} interactive={false}>
                    <div className="px-2 py-1 bg-slate-900 border border-slate-700 rounded shadow-lg pointer-events-none text-white">
                        <p className="font-bold text-sm text-white tracking-tight">{marker.name}</p>
                        <p className="text-[10px] text-emerald-400 uppercase font-semibold leading-none mt-0.5">
                            {marker.type === 'doctor' ? 'Médico' :
                                marker.type === 'pharmacy' ? 'Farmacia' :
                                    marker.type === 'hospital' ? 'Hospital' : 'Clínica'}
                        </p>
                    </div>
                </Tooltip>
            )}
            <Popup className="custom-popup">
                {marker.popupContent}
            </Popup>
        </Marker>
    );
}

export default function LeafletMap({
    center,
    zoom,
    markers,
    height = '600px',
    showInfluenceCircles = false,
    influenceRadius = 1000,
    children
}: LeafletMapProps) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) return <div style={{ height }} className="bg-muted animate-pulse rounded-lg" />;

    return (
        <div style={{ height, width: '100%', borderRadius: '0.5rem', overflow: 'hidden', position: 'relative' }}>
            <MapContainer
                center={center || [10.2542, -67.5922]}
                zoom={zoom || 12}
                style={{ height: '100%', width: '100%' }}
                zoomControl={false} // Custom zoom control position
            >
                <TileLayer
                    attribution='Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
                    maxZoom={19}
                />

                <ZoomControl position="bottomright" />
                <ChangeView center={center} zoom={zoom} />

                {/* Clusters Layer */}
                <MarkerClusterGroup
                    chunkedLoading
                    iconCreateFunction={createClusterCustomIcon}
                    spiderfyOnMaxZoom={true}
                    showCoverageOnHover={false}
                    disableClusteringAtZoom={16}
                >
                    {markers.filter(m =>
                        m.position &&
                        typeof m.position[0] === 'number' &&
                        typeof m.position[1] === 'number' &&
                        !isNaN(m.position[0]) &&
                        !isNaN(m.position[1])
                    ).map((marker) => (
                        <MapMarkerItem key={marker.id} marker={marker} />
                    ))}
                </MarkerClusterGroup>

                {/* Influence Circles (1km around hospitals/clinics) */}
                {showInfluenceCircles && markers.map((marker) => (
                    (marker.type === 'hospital' || marker.type === 'clinic') && (
                        <Circle
                            key={`influence-${marker.id}`}
                            center={marker.position}
                            pathOptions={{
                                color: '#EF4444',
                                fillColor: '#EF4444',
                                fillOpacity: 0.1,
                                weight: 1,
                                dashArray: '5, 5'
                            }}
                            radius={influenceRadius} // Dynamic radius
                        />
                    )
                ))}

                {/* Render custom children (like VisitHeatmap) */}
                {children}
            </MapContainer>
        </div>
    );
}
