/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Search, Filter, Users as UsersIcon, Building2, Building, Hospital, RefreshCw, Leaf as LeafIcon, Store, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, UserRole } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMapViewport } from "@/hooks/useMapViewport";
import { useDemoData } from "@/contexts/MockDataProvider";
import LeafletMap, { PolylineData } from "@/components/map/LeafletMap";
import { OptimizedRouteView } from "@/components/map/OptimizedRouteView";
import { Activity } from "lucide-react";
import { VisitHeatmap } from "@/components/map/VisitHeatmap";
import { PlacesSearch } from "@/components/map/PlacesSearch";
import { OverpassPlace, formatPlaceInfo } from "@/services/overpassService";
import { PharmacyProximityAnalysis } from "@/components/map/PharmacyProximityAnalysis";
import { getStateCenter } from "@/utils/stateCoordinates";
import type { ProximityResult, Location } from "@/utils/proximityCalculations";
import { EliteHeader, EliteKPICard, EliteCard } from "@/components/layout/DesignSystem";
import { useTexts } from "@/hooks/useTexts";
import { useContacts } from "@/hooks/useContacts";
import { useOrganization } from "@/hooks/useOrganization";
import { geocodeAddress } from "@/services/nominatimService";
import { useMapEvents } from "react-leaflet";

// Local interface compatible with OptimizedRouteView's callback
interface OptimizedRoute {
    stops: Array<{
        id: string;
        name: string;
        lat: number;
        lng: number;
    }>;
    totalDistance: number;
    estimatedDuration: number;
    polyline?: [number, number][];
    savingsPercent?: number;
}

const MARKER_COLORS: Record<string, string> = {
    doctor: '#2563EB',    // Royal Blue Premium
    pharmacy: '#059669',  // Emerald Green Premium
    health_center: '#DC2626', // Deep Red Premium
    natural_store: '#10B981', // Emerald
    drugstore: '#7C3AED', // Indigo/Purple Premium
    hospital: '#DC2626',  // Deep Red Premium
    clinic: '#D97706',    // Amber Premium
    commerce: '#0EA5E9',  // Sky Blue Premium
};

const getTypeIcon = (type: string) => {
    switch (type) {
        case 'doctor': return <UsersIcon className="h-4 w-4" />;
        case 'pharmacy': return <Building2 className="h-4 w-4" />;
        case 'health_center': return <Hospital className="h-4 w-4" />;
        case 'natural_store': return <LeafIcon className="h-4 w-4" />;
        case 'drugstore': return <Building className="h-4 w-4" />;
        case 'hospital': return <Hospital className="h-4 w-4" />;
        case 'clinic': return <Building className="h-4 w-4" />;
        case 'commerce': return <Store className="h-4 w-4" />;
        default: return <MapPin className="h-4 w-4" />;
    }
};

const getTypeLabel = (type: string) => {
    switch (type) {
        case 'doctor': return 'Médico';
        case 'pharmacy': return 'Farmacia';
        case 'health_center': return 'Centro de Salud';
        case 'natural_store': return 'Tienda Naturista';
        case 'drugstore': return 'Droguería';
        case 'hospital': return 'Hospital';
        case 'clinic': return 'Clínica';
        case 'commerce': return 'Comercio';
        default: return type;
    }
};

// Venezuela states from BIOFARCO data
const VENEZUELA_STATES = [
    { id: 'AMA', name: 'Amazonas' },
    { id: 'ANZ', name: 'Anzoátegui' },
    { id: 'APU', name: 'Apure' },
    { id: 'ARA', name: 'Aragua' },
    { id: 'BAR', name: 'Barinas' },
    { id: 'BOL', name: 'Bolívar' },
    { id: 'CAR', name: 'Carabobo' },
    { id: 'COJ', name: 'Cojedes' },
    { id: 'DAL', name: 'Delta Amacuro' },
    { id: 'DC', name: 'Distrito Capital' },
    { id: 'FAL', name: 'Falcón' },
    { id: 'GUA', name: 'Guárico' },
    { id: 'LGR', name: 'La Guaira' },
    { id: 'LAR', name: 'Lara' },
    { id: 'MER', name: 'Mérida' },
    { id: 'MIR', name: 'Miranda' },
    { id: 'MON', name: 'Monagas' },
    { id: 'NUE', name: 'Nueva Esparta' },
    { id: 'POR', name: 'Portuguesa' },
    { id: 'SUC', name: 'Sucre' },
    { id: 'TAC', name: 'Táchira' },
    { id: 'TRU', name: 'Trujillo' },
    { id: 'YAR', name: 'Yaracuy' },
    { id: 'ZUL', name: 'Zulia' },
];

interface MapContact {
    id: string;
    name: string;
    type: 'doctor' | 'pharmacy' | 'health_center' | 'drugstore' | 'natural_store' | 'commerce' | string;
    specialty?: string;
    address?: string;
    city?: string;
    phone?: string;
    state?: string;
    zoneId?: string;
    latitude: number;
    longitude: number;
    priority?: string;
    hasCoordinates?: boolean;
    source?: string;
}

export default function CoverageMap() {
    const t = useTexts();
    const { organization } = useOrganization();
    const organizationId = organization?.id;

    const handleAutoGeocode = async (contact: any) => {
        try {
            toast({
                title: "Buscando...",
                description: `Intentando geolocalizar ${contact.name}`
            });

            const query = [contact.address, contact.city, contact.state].filter(Boolean).join(", ");
            const result = await geocodeAddress(query);

            if (result && result.lat && result.lng) {
                const { error } = await supabase
                    .from(contact.source || 'contacts')
                    .update({ latitude: result.lat, longitude: result.lng })
                    .eq('id', contact.id);

                if (error) throw error;

                toast({
                    title: "Éxito",
                    description: `Ubicación encontrada para ${contact.name}`,
                });
                
                // Realmente recargaríamos los contactos aquí, 
                // asumiendo que loadContacts es inyectado o usamos un reload global
                window.location.reload(); 
            } else {
                toast({
                    title: "Sin resultados",
                    description: "No se pudo encontrar la dirección automáticamente. Intenta usar el pin manual.",
                    variant: "destructive"
                });
            }
        } catch (error: any) {
            console.error(error);
            toast({
                title: "Error",
                description: "Ocurrió un problema al geolocalizar.",
                variant: "destructive"
            });
        }
    };

    const [pinningContact, setPinningContact] = useState<any>(null);

    const MapClickHandler = () => {
        useMapEvents({
            click(e) {
                if (pinningContact) {
                    const { lat, lng } = e.latlng;
                    handleManualPin(pinningContact, lat, lng);
                }
            }
        });
        return null;
    };

    const handleManualPin = async (contact: any, lat: number, lng: number) => {
        try {
            toast({
                title: "Fijando ubicación...",
                description: "Guardando coordenadas..."
            });

            const { error } = await supabase
                .from(contact.source || 'contacts')
                .update({ latitude: lat, longitude: lng })
                .eq('id', contact.id);

            if (error) throw error;

            toast({
                title: "Pin fijado",
                description: "Ubicación asignada manualmente.",
            });
            
            setPinningContact(null);
            window.location.reload();
        } catch (error: any) {
            console.error(error);
            toast({
                title: "Error",
                description: "No se pudo guardar la ubicación.",
                variant: "destructive"
            });
        }
    };
    const { user, role, userState, zoneId, canViewAllData } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedZone, setSelectedZone] = useState<string>("all");
    const [selectedState, setSelectedState] = useState<string>("all");
    const { allContacts, refresh: refreshContacts } = useContacts();
    const [zones, setZones] = useState<{ id: string; name: string }[]>([]);
    const [selectedContact, setSelectedContact] = useState<MapContact | null>(null);
    const [optimizedRoute, setOptimizedRoute] = useState<OptimizedRoute | null>(null);
    const [showOptimizedRoute, setShowOptimizedRoute] = useState(false);
    const [currentUserLocation, setCurrentUserLocation] = useState<{ lat: number; lng: number } | undefined>(undefined);
    const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'terrain' | 'hybrid' | 'light'>('roadmap');
    const [showInfluenceCircles, setShowInfluenceCircles] = useState(false);
    const [showHeatmap, setShowHeatmap] = useState(false);
    const [visitHistory, setVisitHistory] = useState<Array<{ latitude: number; longitude: number; intensity: number }>>([]);
    const [proximityResults, setProximityResults] = useState<ProximityResult[]>([]);
    const [proximityRadius, setProximityRadius] = useState(1000);
    const [showProximityCircles, setShowProximityCircles] = useState(false);
    const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    const demoData = useDemoData();

    // Viewport management based on role
    const { center: initialCenter, zoom: initialZoom } = useMapViewport(role as UserRole, userState as string, currentUserLocation);

    // Determine initial center and zoom
    const getInitialViewport = () => {
        if (demoData) {
            // For demo, center in Maracay where we added specific data
            return { center: [10.2542, -67.5922] as [number, number], zoom: 12 };
        }
        return { center: initialCenter, zoom: initialZoom };
    };

    const viewport = getInitialViewport();

    // Auto-center based on user's state
    const getUserStateCenter = () => {
        // Master, Admin, Manager see everything
        if (role === 'master' || role === 'admin' || role === 'manager') {
            return viewport; // Full Venezuela
        }

        // Supervisor and Representative see their assigned state
        if (userState) {
            const stateCenter = getStateCenter(userState);
            return stateCenter;
        }

        return viewport;
    };

    const initialMapView = getUserStateCenter();
    const [mapCenter, setMapCenter] = useState<[number, number]>(initialMapView.center);
    const [mapZoom, setMapZoom] = useState(initialMapView.zoom);

    // Filter states
    const [showDoctors, setShowDoctors] = useState(true);
    const [showPharmacies, setShowPharmacies] = useState(true);
    const [showHealthCenters, setShowHealthCenters] = useState(true);
    const [showDrugstores, setShowDrugstores] = useState(true);
    const [showNaturalStores, setShowNaturalStores] = useState(true);
    const [showCommerces, setShowCommerces] = useState(true);

    useEffect(() => {
        if (user) {
            loadData();
        }
    }, [user, selectedZone, selectedState]);

    // Load visit history for heatmap
    useEffect(() => {
        if (!showHeatmap || !user) {
            setVisitHistory([]);
            return;
        }

        const loadVisitHistory = async () => {
            try {
                // Get visits from last 3 months
                const threeMonthsAgo = new Date();
                threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

                const { data, error } = await supabase
                    .from('visits')
                    .select(`
                        id, 
                        location_lat, 
                        location_lng, 
                        scheduled_date,
                        contact_id
                    `)
                    .gte('scheduled_date', threeMonthsAgo.toISOString())
                    .not('location_lat', 'is', null)
                    .not('location_lng', 'is', null);

                if (error) throw error;

                // Weighting for activity heatmap based on priority
                const weights: Record<string, number> = {
                    'urgent': 4,
                    'high': 3,
                    'medium': 2,
                    'low': 1
                };

                // Count visits per location for intensity (weighted by contact potential)
                const locationMap = new Map<string, { lat: number; lng: number; count: number }>();

                (data || []).forEach((visit: any) => {
                    const lat = visit.location_lat;
                    const lng = visit.location_lng;
                    const contact = allContacts.find(c => c.id === visit.contact_id);
                    const contactPriority = contact?.priority || 'medium';
                    const weight = weights[contactPriority.toLowerCase()] || 2;

                    if (lat == null || lng == null) return;

                    const key = `${lat},${lng}`;
                    if (locationMap.has(key)) {
                        locationMap.get(key)!.count += weight;
                    } else {
                        locationMap.set(key, {
                            lat: lat,
                            lng: lng,
                            count: weight
                        });
                    }
                });

                // Convert to heatmap format
                const heatmapData = Array.from(locationMap.values()).map(loc => ({
                    latitude: loc.lat,
                    longitude: loc.lng,
                    intensity: loc.count
                }));

                setVisitHistory(heatmapData);
            } catch (error) {
                console.error('Error loading visit history:', error);
                toast({
                    title: "Error",
                    description: "No se pudo cargar el historial de visitas",
                    variant: "destructive"
                });
            }
        };

        loadVisitHistory();
    }, [showHeatmap, user]);

    useEffect(() => {
        if (demoData) {
            // Simulate user location in Maracay for Demo Mode (e.g., Hotel Pipo)
            setCurrentUserLocation({
                lat: 10.2676,
                lng: -67.5936
            });
            return;
        }

        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setCurrentUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (error) => {
                    console.warn("Error getting user location:", error);
                }
            );
        }
    }, [demoData]);

    const loadData = async () => {
        setLoading(true);
        try {
            await refreshContacts();

            if (demoData) {
                setZones([
                    { id: 'zone-1', name: 'Aragua - Maracay' },
                    { id: 'zone-2', name: 'Caracas - Centro' },
                    { id: 'zone-3', name: 'Carabobo - Valencia' }
                ]);
                setLoading(false);
                return;
            }

            // Load zones for filter
            const { data: zonesData } = await supabase
                .from('zones')
                .select('id, name')
                .order('name');
            setZones(zonesData || []);

        } catch (error) {
            console.error("Error loading map data:", error);
            toast({
                title: "Error",
                description: "No se pudieron cargar los datos del mapa.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const contacts = useMemo(() => {
        return allContacts.map(c => {
            const latRaw = c.latitude || c.lat;
            const lngRaw = c.longitude || c.lng;

            let lat = parseFloat(String(latRaw));
            let lng = parseFloat(String(lngRaw));
            const hasCoordinates = !isNaN(lat) && !isNaN(lng) && latRaw != null && lngRaw != null && lat !== 0 && lng !== 0;

            if (!hasCoordinates) {
                // Return null lat/lng to indicate it's ungeolocated
                lat = 0;
                lng = 0;
            }

            // Bulletproof normalization directly in the map renderer
            let rawCType = c.contact_type || 'doctor';
            let finalType = rawCType;
            
            const validTypes = ['doctor', 'pharmacy', 'health_center', 'hospital', 'clinic', 'drugstore', 'natural_store', 'commerce'];
            
            if (!validTypes.includes(finalType) || ['Centro de Salud', 'health_centers'].includes(finalType)) {
                finalType = 'health_center';
                // Preserve specific types if they were just capitalized
                if (rawCType.toLowerCase() === 'hospital') finalType = 'hospital';
                if (rawCType.toLowerCase() === 'clínica' || rawCType.toLowerCase() === 'clinic') finalType = 'clinic';
            }

            return {
                id: c.id,
                name: c.name,
                type: finalType as MapContact['type'],
                specialty: c.specialty,
                address: c.address,
                city: c.city,
                state: c.state,
                zoneId: c.zone_id,
                latitude: lat,
                longitude: lng,
                priority: c.priority,
                hasCoordinates: hasCoordinates,
                source: c.source
            };
        }).filter(Boolean) as (MapContact & { hasCoordinates: boolean; source: string })[];
    }, [allContacts]);

    const filteredContacts = useMemo(() => contacts.filter(contact => {
        // Type filter
        if (!showDoctors && contact.type === 'doctor') return false;
        if (!showPharmacies && contact.type === 'pharmacy') return false;
        if (!showHealthCenters && (contact.type === 'health_center' || contact.type === 'hospital' || contact.type === 'clinic')) return false;
        if (!showDrugstores && contact.type === 'drugstore') return false;
        if (!showNaturalStores && contact.type === 'natural_store') return false;
        if (!showCommerces && contact.type === 'commerce') return false;

        // State filter - stored as code (ARA, CAR, etc.), compare against selectedState ID
        if (selectedState !== 'all' && contact.state) {
            if (contact.state.toUpperCase() !== selectedState.toUpperCase()) return false;
        }

        // Zone filter (client-side, by zoneId)
        if (selectedZone !== 'all' && contact.zoneId && contact.zoneId !== selectedZone) return false;

        // Search filter
        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            return (
                contact.name.toLowerCase().includes(search) ||
                contact.specialty?.toLowerCase().includes(search) ||
                contact.city?.toLowerCase().includes(search) ||
                contact.state?.toLowerCase().includes(search)
            );
        }

        return true;
    }), [contacts, showDoctors, showPharmacies, showHealthCenters, showDrugstores, showNaturalStores, showCommerces, searchTerm, selectedState, selectedZone]);

    const focusOnContact = (contact: MapContact) => {
        setMapCenter([contact.latitude, contact.longitude]);
        setMapZoom(15);
        setSelectedContact(contact);
    };

    const stats = {
        doctors: contacts.filter(c => c.type === 'doctor').length,
        pharmacies: contacts.filter(c => c.type === 'pharmacy').length,
        healthCenters: contacts.filter(c => ['health_center', 'hospital', 'clinic'].includes(c.type)).length,
        drugstores: contacts.filter(c => c.type === 'drugstore').length,
        naturalStores: contacts.filter(c => c.type === 'natural_store').length,
        commerces: contacts.filter(c => c.type === 'commerce').length,
    };

    // Map Polylines for optimized route
    const mapPolylines: PolylineData[] = optimizedRoute && showOptimizedRoute
        ? [{
            id: 'optimized-route',
            // Use OSRM polyline if available (real roads), otherwise straight lines
            positions: optimizedRoute.polyline || optimizedRoute.stops.map(s => [s.lat, s.lng] as [number, number]),
            color: '#3B82F6',
            weight: 4,
            opacity: 0.6
        }]
        : [];

    // Convert contacts to map markers - Memoized to prevent re-renders in LeafletMap
    const mapMarkers = useMemo(() => filteredContacts.filter(c => c.hasCoordinates).map(contact => {
        // Determine custom styling for pharmacies during analysis
        let customColor: string | undefined = undefined;
        let opacity: number = 1;

        if (showProximityCircles && contact.type === 'pharmacy') {
            const result = proximityResults.find(r => r.pharmacy.id === contact.id);
            if (result && result.totalNearby > 0) {
                customColor = '#10B981'; // Bright Green
                opacity = 1;
            } else {
                customColor = '#94a3b8'; // Grey (slate-400)
                opacity = 0.5;
            }
        }

        return {
            id: contact.id,
            position: [contact.latitude, contact.longitude] as [number, number],
            type: contact.type,
            name: contact.name,
            customColor,
            opacity,
            onClick: () => setSelectedContact(contact),
            popupContent: (
                <div className="p-2 space-y-3 min-w-[220px]">
                    <div className="flex items-center space-x-2 border-b border-border/50 pb-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            {getTypeIcon(contact.type)}
                        </div>
                        <div>
                            <h3 className="font-bold text-sm leading-tight">{contact.name}</h3>
                            <p className="text-[10px] text-muted-foreground">{getTypeLabel(contact.type)}</p>
                        </div>
                    </div>
                    {(contact.specialty || contact.city || contact.address) && (
                        <div className="space-y-1.5 text-xs">
                            {contact.specialty && <p className="flex items-center text-muted-foreground"><UsersIcon className="w-3 h-3 mr-1.5 opacity-70" /> {contact.specialty}</p>}
                            {contact.city && <p className="flex items-center text-muted-foreground"><MapPin className="w-3 h-3 mr-1.5 opacity-70" /> {contact.city}, {contact.state}</p>}
                            {contact.address && <p className="text-[10px] text-muted-foreground/70 line-clamp-2 mt-1">{contact.address}</p>}
                        </div>
                    )}
                    <div className="pt-2 flex gap-2">
                        <Button
                            size="sm"
                            variant="default"
                            className="w-full text-xs h-8 bg-primary hover:bg-primary/90 text-primary-foreground"
                            onClick={(e) => {
                                e.stopPropagation();
                                const route = contact.type === 'doctor' ? 'doctors' :
                                    contact.type === 'pharmacy' ? 'pharmacies' :
                                    contact.type === 'drugstore' ? 'drugstores' :
                                    contact.type === 'natural_store' ? 'natural-stores' :
                                    contact.type === 'commerce' ? 'commerces' :
                                    'health-centers';
                                navigate(`/${route}?id=${contact.id}`);
                            }}
                        >
                            Ver Perfil
                        </Button>
                    </div>
                </div>
            ),
        };
    }), [filteredContacts, showProximityCircles, proximityResults]);

    const ungeolocatedContacts = useMemo(() => {
        return filteredContacts.filter(c => !c.hasCoordinates);
    }, [filteredContacts]);

    // Memoize visits for OptimizedRouteView to prevent optimization loops
    const visitsForOptimization = useMemo(() => filteredContacts.map(c => ({
        id: c.id,
        contact_name: c.name,
        latitude: c.latitude,
        longitude: c.longitude,
        contact_type: c.type,
        priority: c.priority as 'high' | 'medium' | 'low'
    })), [filteredContacts]);

    return (
        <div className="flex flex-col w-full min-h-screen bg-transparent relative overflow-hidden animate-in fade-in duration-500">
            
            <div className="relative z-10 w-full h-full space-y-8 p-4 md:p-8 pb-10 max-w-[1400px] mx-auto">
                {/* Elite Header */}
            <EliteHeader
                title={t.coverage_title}
                subtitle={t.coverage_subtitle}
                icon={MapPin}
                badgeText="Mapa"
                statusText={loading ? "Sincronizando..." : "Mapa activo"}
                statusColor={loading ? "bg-amber-500" : "bg-emerald-500"}
                rightContent={
                    <Button 
                        onClick={loadData} 
                        variant="outline" 
                        disabled={loading}
                        className="bg-card border-slate-200 hover:bg-slate-50 rounded-xl h-12 px-6 font-bold text-xs transition-all shadow-sm active:scale-95"
                    >
                        <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        Sincronizar datos
                    </Button>
                }
            />

            {/* Elite Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 px-1">
                <EliteKPICard
                    title="Médicos"
                    value={stats.doctors}
                    subtitle="Especialistas"
                    icon={UsersIcon}
                    color="blue"
                    delay={100}
                />
                <EliteKPICard
                    title="Farmacias"
                    value={stats.pharmacies}
                    subtitle="Puntos de venta"
                    icon={Building2}
                    color="emerald"
                    delay={200}
                />
                <EliteKPICard
                    title="C. de Salud"
                    value={stats.healthCenters}
                    subtitle="Hospitales/Clínicas"
                    icon={Hospital}
                    color="rose"
                    delay={300}
                />
                <EliteKPICard
                    title="Droguerías"
                    value={stats.drugstores}
                    subtitle="Mayoristas"
                    icon={Building}
                    color="indigo"
                    delay={400}
                />
                <EliteKPICard
                    title="Naturistas"
                    value={stats.naturalStores}
                    subtitle="Tiendas"
                    icon={LeafIcon}
                    color="lime"
                    delay={500}
                />
                <EliteKPICard
                    title="Comercios"
                    value={stats.commerces}
                    subtitle="Retail"
                    icon={Store}
                    color="amber"
                    delay={600}
                />
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 relative">
                {/* Elite Sidebar - Consola de Control */}
                <EliteCard className="lg:col-span-1 p-0 overflow-hidden relative z-20 flex flex-col max-h-[700px]">
                    <div className="pb-4 pt-6 px-6 bg-muted/20 border-b border-white/5 backdrop-blur-sm flex-shrink-0">
                        <h3 className="flex items-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                            <Filter className="mr-2 h-4 w-4" />
                            Filtros de Análisis
                        </h3>
                    </div>
                    <div className="space-y-6 p-6 overflow-y-auto flex-1 custom-scrollbar">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar contacto..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9"
                            />
                        </div>

                        {/* Estado Filter */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Estado</label>
                            <Select value={selectedState} onValueChange={setSelectedState}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Todos los estados" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos los estados</SelectItem>
                                    {VENEZUELA_STATES.map(state => (
                                        <SelectItem key={state.id} value={state.id}>{state.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Zone Filter */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Zona</label>
                            <Select value={selectedZone} onValueChange={setSelectedZone}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Todas las zonas" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todas las zonas</SelectItem>
                                    {zones.map(zone => (
                                        <SelectItem key={zone.id} value={zone.id}>{zone.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Map Configuration */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Modo de visualización</label>
                            <Select value={mapType} onValueChange={(v: any) => setMapType(v)}>
                                <SelectTrigger className="rounded-xl border-slate-200 h-10 text-xs font-semibold">
                                    <SelectValue placeholder="Seleccionar modo" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                                    <SelectItem value="roadmap" className="text-xs font-medium">Mapa estándar</SelectItem>
                                    <SelectItem value="satellite" className="text-xs font-medium">Vista satelital</SelectItem>
                                    <SelectItem value="hybrid" className="text-xs font-medium">Vista híbrida</SelectItem>
                                    <SelectItem value="terrain" className="text-xs font-medium">Relieve físico</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Type Filters */}
                        <div className="space-y-4">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Tipo de Contacto</label>
                            <div className="grid grid-cols-1 gap-2">
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="doctors" checked={showDoctors} onCheckedChange={(c) => setShowDoctors(!!c)} />
                                    <label htmlFor="doctors" className="flex items-center text-sm cursor-pointer">
                                        <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                                        Médicos ({stats.doctors})
                                    </label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="pharmacies" checked={showPharmacies} onCheckedChange={(c) => setShowPharmacies(!!c)} />
                                    <label htmlFor="pharmacies" className="flex items-center text-sm cursor-pointer">
                                        <div className="w-3 h-3 rounded-full bg-emerald-500 mr-2"></div>
                                        Farmacias ({stats.pharmacies})
                                    </label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="healthCenters" checked={showHealthCenters} onCheckedChange={(c) => setShowHealthCenters(!!c)} />
                                    <label htmlFor="healthCenters" className="flex items-center text-sm cursor-pointer">
                                        <div className="w-3 h-3 rounded-full bg-rose-500 mr-2"></div>
                                        Centros de Salud ({stats.healthCenters})
                                    </label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="drugstores" checked={showDrugstores} onCheckedChange={(c) => setShowDrugstores(!!c)} />
                                    <label htmlFor="drugstores" className="flex items-center text-sm cursor-pointer">
                                        <div className="w-3 h-3 rounded-full bg-indigo-500 mr-2"></div>
                                        Droguerías ({stats.drugstores})
                                    </label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="naturalStores" checked={showNaturalStores} onCheckedChange={(c) => setShowNaturalStores(!!c)} />
                                    <label htmlFor="naturalStores" className="flex items-center text-sm cursor-pointer">
                                        <div className="w-3 h-3 rounded-full bg-lime-500 mr-2"></div>
                                        Tiendas Naturistas ({stats.naturalStores})
                                    </label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="commerces" checked={showCommerces} onCheckedChange={(c) => setShowCommerces(!!c)} />
                                    <label htmlFor="commerces" className="flex items-center text-sm cursor-pointer">
                                        <div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>
                                        Comercios ({stats.commerces})
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Analysis Tools */}
                        <div className="pt-4 border-t space-y-3">
                            <label className="text-sm font-semibold flex items-center">
                                <Activity className="mr-2 h-4 w-4 text-emerald-500" />
                                Herramientas de Gestión
                            </label>
                            <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                                <div className="space-y-0.5">
                                    <label htmlFor="influence-radios" className="text-xs font-medium cursor-pointer">
                                        Radios de Cobertura (1km)
                                    </label>
                                    <p className="text-[10px] text-muted-foreground">Ver alcance de centros de salud</p>
                                </div>
                                <Checkbox
                                    id="influence-radios"
                                    checked={showInfluenceCircles}
                                    onCheckedChange={(c) => {
                                        setShowInfluenceCircles(!!c);
                                        // Also show proximity UI if activating radios
                                        if (!!c && !showProximityCircles) {
                                            setShowProximityCircles(true);
                                        }
                                    }}
                                />
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                                <div className="space-y-0.5">
                                    <label htmlFor="heatmap" className="text-xs font-bold tracking-tight cursor-pointer">
                                        Mapa de Calor de Actividad
                                    </label>
                                    <p className="text-[10px] font-medium text-slate-400">Densidad de visitas recientes</p>
                                </div>
                                <Checkbox
                                    id="heatmap"
                                    checked={showHeatmap}
                                    onCheckedChange={(c) => setShowHeatmap(!!c)}
                                    className="rounded-md w-5 h-5"
                                />
                            </div>
                        </div>

                        {/* Contact List */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Contactos ({filteredContacts.length})</label>
                            <div className="h-[300px] overflow-y-auto custom-scrollbar">
                                <div className="space-y-2 pr-2">
                                    {filteredContacts.filter(c => c.hasCoordinates).map(contact => (
                                            <div
                                            key={contact.id}
                                            onClick={() => focusOnContact(contact)}
                                            className={`p-3 rounded-xl cursor-pointer transition-all duration-300 ${selectedContact?.id === contact.id
                                                ? 'bg-primary/5 border border-primary/20 shadow-inner'
                                                : 'bg-card hover:bg-muted/50 border border-border/50'
                                                }`}
                                        >
                                            <div className="flex items-start space-x-3">
                                                <div
                                                    className="mt-1.5 w-2 h-2 rounded-full flex-shrink-0"
                                                    style={{ backgroundColor: MARKER_COLORS[contact.type] }}
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-xs tracking-tight truncate text-foreground">{contact.name}</p>
                                                    <p className="text-[10px] font-medium text-muted-foreground truncate">
                                                        {contact.specialty || getTypeLabel(contact.type)}
                                                    </p>
                                                    {contact.city && (
                                                        <p className="text-[9px] font-medium text-muted-foreground/70 truncate mt-0.5">{contact.city}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {filteredContacts.filter(c => c.hasCoordinates).length === 0 && (
                                        <div className="text-center py-8 text-muted-foreground">
                                            <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                            <p className="text-sm">No hay contactos con ubicación</p>
                                            <p className="text-xs mt-1">Busca nuevos lugares para agregar</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Ungeolocated Contacts */}
                        {ungeolocatedContacts.length > 0 && (
                            <div className="space-y-2 pt-4 border-t border-destructive/20">
                                <label className="text-sm font-bold flex items-center text-destructive">
                                    <AlertCircle className="mr-2 h-4 w-4" />
                                    Sin Geolocalizar ({ungeolocatedContacts.length})
                                </label>
                                <p className="text-[10px] text-muted-foreground mb-2 leading-tight">
                                    Estos contactos no aparecerán en el mapa hasta que les asignes una ubicación real.
                                </p>
                                {pinningContact && (
                                    <div className="bg-primary/10 border border-primary/20 text-primary p-2 mb-2 rounded text-xs text-center animate-pulse">
                                        Haz clic en cualquier parte del mapa para fijar la ubicación de <br/>
                                        <strong>{pinningContact.name}</strong>
                                        <div className="mt-2">
                                            <Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={() => setPinningContact(null)}>
                                                Cancelar Pin
                                            </Button>
                                        </div>
                                    </div>
                                )}
                                <div className="h-[200px] overflow-y-auto custom-scrollbar">
                                    <div className="space-y-2 pr-2">
                                        {ungeolocatedContacts.map(contact => (
                                            <div key={contact.id} className="p-3 rounded-xl bg-destructive/5 border border-destructive/20 relative group">
                                                <div className="flex items-start space-x-3 pr-16">
                                                    <div className="mt-1 flex-shrink-0">
                                                        <MapPin className="w-4 h-4 text-destructive/70" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-bold text-xs tracking-tight truncate text-foreground">{contact.name}</p>
                                                        <p className="text-[10px] font-medium text-muted-foreground truncate">
                                                            {contact.address ? contact.address : 'Sin dirección'}
                                                        </p>
                                                        {contact.city && (
                                                            <p className="text-[9px] font-medium text-muted-foreground/70 truncate mt-0.5">{contact.city}, {contact.state}</p>
                                                        )}
                                                    </div>
                                                </div>
                                                {/* Actions overlay */}
                                                <div className="absolute right-2 top-2 bottom-2 flex flex-col justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button size="icon" variant="outline" className="h-6 w-6 bg-background border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground" title="Fijar Manualmente en el Mapa" onClick={() => setPinningContact(contact)}>
                                                        <MapPin className="h-3 w-3" />
                                                    </Button>
                                                    <Button size="icon" variant="outline" className="h-6 w-6 bg-background border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground" title="Geolocalizar Automáticamente" onClick={() => handleAutoGeocode(contact)}>
                                                        <RefreshCw className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="pt-4 border-t border-border/50">
                            <OptimizedRouteView
                                visits={visitsForOptimization}
                                userLocation={currentUserLocation}
                                onRouteOptimized={(route) => {
                                    setOptimizedRoute(route);
                                }}
                                onReorderVisits={(orderedIds) => {
                                    setShowOptimizedRoute(true);
                                }}
                                compact
                            />
                        </div>
                    </div>
                </EliteCard>

                {/* Map Implementation */}
                <EliteCard className="lg:col-span-3 p-0 overflow-hidden relative z-10">
                    <div className="h-[700px] overflow-hidden">
                        <LeafletMap
                            center={mapCenter}
                            zoom={mapZoom}
                            markers={mapMarkers}
                            polylines={mapPolylines}
                            height="600px"
                            showInfluenceCircles={showInfluenceCircles || showProximityCircles}
                            influenceRadius={proximityRadius}
                            mapType={mapType}
                        >
                            <MapClickHandler />
                            <VisitHeatmap
                                visits={visitHistory}
                                show={showHeatmap}
                                radius={30}
                                blur={20}
                            />
                        </LeafletMap>
                    </div>
                </EliteCard>
            </div>

            {/* Places Search */}
            {currentUserLocation && (
                <div className="mt-8">
                    <EliteCard className="p-0 overflow-hidden">
                        <div className="p-0">
                            <PlacesSearch
                                center={currentUserLocation}
                                onPlaceSelected={(place) => {
                                    // Center map on selected place
                                    setMapCenter([place.lat, place.lon]);
                                    setMapZoom(16);
                                    toast({
                                        title: "Lugar seleccionado",
                                        description: place.tags.name || "Ubicación en el mapa"
                                    });
                                }}
                                onAddAsContact={async (place) => {
                                    if (!user || !organizationId) return;

                                    try {
                                        const info = formatPlaceInfo(place);
                                        
                                        // Map OSM amenity to our contact_type
                                        const typeMap: Record<string, string> = {
                                            'pharmacy': 'pharmacy',
                                            'hospital': 'hospital',
                                            'clinic': 'clinic',
                                            'doctors': 'doctor'
                                        };
                                        
                                        const amenity = place.tags.amenity || 'pharmacy';
                                        const contactType = typeMap[amenity] || 'pharmacy';

                                        const { error } = await supabase
                                            .from('contacts')
                                            .insert({
                                                name: info.name,
                                                contact_type: contactType as any,
                                                address: info.address,
                                                city: place.tags['addr:city'] || null,
                                                latitude: place.lat,
                                                longitude: place.lon,
                                                user_id: user.id,
                                                organization_id: organizationId,
                                                zone_id: zoneId || null,
                                                priority: 'medium' as any,
                                                status: 'active'
                                            } as any);

                                        if (error) throw error;

                                        toast({
                                            title: "Contacto Guardado",
                                            description: `${info.name} ha sido agregado exitosamente.`,
                                        });

                                        loadData(); // Refresh map
                                    } catch (error: any) {
                                        console.error("Error adding contact:", error);
                                        toast({
                                            title: "Error al guardar",
                                            description: error.message || "No se pudo agregar el contacto.",
                                            variant: "destructive"
                                        });
                                    }
                                }}
                            />
                        </div>
                    </EliteCard>
                </div>
            )}

            {/* Pharmacy Proximity Analysis */}
            <div className="mt-6">
                <PharmacyProximityAnalysis
                    pharmacies={contacts
                        .filter(c => c.type === 'pharmacy' && c.latitude && c.longitude)
                        .map(c => ({
                            id: c.id,
                            name: c.name,
                            latitude: c.latitude,
                            longitude: c.longitude,
                            type: c.type
                        }))}
                    hospitals={contacts
                        .filter(c => (c.type === 'hospital' || c.type === 'clinic') && c.latitude && c.longitude)
                        .map(c => ({
                            id: c.id,
                            name: c.name,
                            latitude: c.latitude,
                            longitude: c.longitude,
                            type: c.type
                        }))}
                    onAnalysisChange={(results, showCircles, radius) => {
                        setProximityResults(results);
                        setShowProximityCircles(showCircles);
                        if (radius) setProximityRadius(radius);
                    }}
                />
            </div>
            </div>
        </div>
    );
}
