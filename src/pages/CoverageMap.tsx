import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Search, Filter, Users as UsersIcon, Building2, Building, Hospital, RefreshCw, Leaf as LeafIcon } from "lucide-react";
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
import { OverpassPlace } from "@/services/overpassService";
import { PharmacyProximityAnalysis } from "@/components/map/PharmacyProximityAnalysis";
import { getStateCenter } from "@/utils/stateCoordinates";
import type { ProximityResult, Location } from "@/utils/proximityCalculations";

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
    doctor: '#3B82F6',    // Blue
    pharmacy: '#10B981',  // Green
    natural_store: '#10B981', // Green (Leafy)
    drugstore: '#8B5CF6', // Purple
    hospital: '#EF4444',  // Red
    clinic: '#F59E0B',    // Amber
};

const getTypeIcon = (type: string) => {
    switch (type) {
        case 'doctor': return <UsersIcon className="h-4 w-4" />;
        case 'pharmacy': return <Building2 className="h-4 w-4" />;
        case 'natural_store': return <LeafIcon className="h-4 w-4" />;
        case 'drugstore': return <Building className="h-4 w-4" />;
        case 'hospital': return <Hospital className="h-4 w-4" />;
        case 'clinic': return <Building className="h-4 w-4" />;
        default: return <MapPin className="h-4 w-4" />;
    }
};

const getTypeLabel = (type: string) => {
    switch (type) {
        case 'doctor': return 'Médico';
        case 'pharmacy': return 'Farmacia';
        case 'natural_store': return 'Tienda Naturista';
        case 'drugstore': return 'Droguería';
        case 'hospital': return 'Hospital';
        case 'clinic': return 'ClÃ­nica';
        default: return type;
    }
};

interface MapContact {
    id: string;
    name: string;
    type: 'doctor' | 'pharmacy' | 'hospital' | 'clinic';
    specialty?: string;
    address?: string;
    city?: string;
    phone?: string;
    latitude: number;
    longitude: number;
    priority?: string;
}

export default function CoverageMap() {
    const { user, role, userState, zoneId, canViewAllData } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedZone, setSelectedZone] = useState<string>("all");
    const [contacts, setContacts] = useState<MapContact[]>([]);
    const [zones, setZones] = useState<{ id: string; name: string }[]>([]);
    const [selectedContact, setSelectedContact] = useState<MapContact | null>(null);
    const [optimizedRoute, setOptimizedRoute] = useState<OptimizedRoute | null>(null);
    const [showOptimizedRoute, setShowOptimizedRoute] = useState(false);
    const [currentUserLocation, setCurrentUserLocation] = useState<{ lat: number; lng: number } | undefined>(undefined);
    const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'terrain' | 'hybrid' | 'dark'>('dark');
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
    const [showHospitals, setShowHospitals] = useState(true);
    const [showClinics, setShowClinics] = useState(true);

    useEffect(() => {
        if (user) {
            loadData();
        }
    }, [user, selectedZone]);

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
                    .select('id, location_lat, location_lng, scheduled_date')
                    .gte('scheduled_date', threeMonthsAgo.toISOString())
                    .not('location_lat', 'is', null)
                    .not('location_lng', 'is', null);

                if (error) throw error;

                // Count visits per location for intensity
                const locationMap = new Map<string, { lat: number; lng: number; count: number }>();

                (data || []).forEach(visit => {
                    const lat = visit.location_lat;
                    const lng = visit.location_lng;
                    if (lat == null || lng == null) return;

                    const key = `${lat},${lng}`;
                    if (locationMap.has(key)) {
                        locationMap.get(key)!.count++;
                    } else {
                        locationMap.set(key, {
                            lat: lat,
                            lng: lng,
                            count: 1
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
            if (demoData) {
                // Load mock zones
                setZones([
                    { id: 'zone-1', name: 'Aragua - Maracay' },
                    { id: 'zone-2', name: 'Caracas - Centro' },
                    { id: 'zone-3', name: 'Carabobo - Valencia' }
                ]);

                // Map all mock data to MapContact format
                const mockContacts: MapContact[] = [
                    ...demoData.doctors.map((d: any) => ({
                        id: d.id,
                        name: d.name,
                        type: 'doctor' as const,
                        specialty: d.specialty,
                        address: d.address,
                        city: d.city,
                        latitude: d.latitude || 10.2542, // Fallback to Maracay if not set
                        longitude: d.longitude || -67.5922,
                        priority: d.potential === 'Alto' ? 'high' : 'medium'
                    })),
                    ...demoData.pharmacies.map((p: any) => ({
                        id: p.id,
                        name: p.name,
                        type: 'pharmacy' as const,
                        address: p.address,
                        city: p.city,
                        latitude: p.latitude,
                        longitude: p.longitude,
                        priority: p.priority
                    })),
                    ...demoData.healthCenters.map((hc: any) => ({
                        id: hc.id,
                        name: hc.name,
                        type: (hc.type === 'hospital' ? 'hospital' : 'clinic') as MapContact['type'],
                        address: hc.address,
                        city: hc.city,
                        latitude: hc.latitude,
                        longitude: hc.longitude,
                        priority: hc.potential === 'Alto' ? 'high' : 'medium'
                    }))
                ];

                setContacts(mockContacts);
                setLoading(false);
                return;
            }

            // Load zones for filter
            const { data: zonesData } = await (supabase
                .from('zones' as any)
                .select('id, name')
                .order('name') as any);
            setZones((zonesData as { id: string; name: string }[]) || []);

            // Determine role-based filters (Territory Hierarchy)
            let query = supabase.from('view_geo_map' as any).select('*');

            // 1. Implementation of God Mode & Hierarchy
            if (role === 'master' || role === 'admin' || role === 'manager') {
                // God Mode: No filters for master/manager - See all national territory
                console.log("CoverageMap: God Mode Active - Fetching all coordinates");
            } else {
                // For ALL other roles (Supervisor, Coordinator, Representative), STRICTLY filter by State
                // This ensures a Rep from Aragua ONLY sees Aragua.
                if (userState) {
                    query = query.ilike('state', `%${userState}%`); // Using ilike for safer matching
                } else if (role === 'representative') {
                    // If no state assigned (rare), fallback to own contacts + zone
                    query = query.or(`assigned_rep_id.eq.${user?.id},zone_id.eq.${zoneId}`);
                }
            }

            // Always ensure we have coordinates to avoid render errors
            query = query.not('lat', 'is', null).not('lng', 'is', null);

            // Load view data
            const { data: geoData, error } = await query;

            if (error) {
                console.warn("Could not load view_geo_map, falling back to contacts table:", error);

                // Fallback to contacts with hierarchy
                let fallbackQuery = supabase
                    .from('contacts')
                    .select('id, name, contact_type, specialty, address, city, latitude, longitude, priority, user_id, zone_id')
                    .not('latitude', 'is', null)
                    .not('longitude', 'is', null);

                if (role !== 'master' && role !== 'admin' && role !== 'manager') {
                    if (role === 'representative') {
                        fallbackQuery = fallbackQuery.eq('user_id', user?.id);
                    } else if (userState) {
                        // For fallback, we'd need to join with regions/zones, 
                        // but keeping it simple for master/manager fix.
                    }
                }

                const { data: contactsData, error: contactsError } = await fallbackQuery;

                if (contactsError) throw contactsError;

                const mapped = (contactsData || [])
                    .map(c => {
                        try {
                            const lat = parseFloat(String(c.latitude));
                            const lng = parseFloat(String(c.longitude));

                            // Validate coordinates
                            if (isNaN(lat) || isNaN(lng)) return null;

                            return {
                                id: c.id,
                                name: c.name,
                                type: c.contact_type as MapContact['type'],
                                specialty: c.specialty || undefined,
                                address: c.address || undefined,
                                city: c.city || undefined,
                                latitude: lat,
                                longitude: lng,
                                priority: c.priority || undefined,
                            };
                        } catch (e) {
                            return null;
                        }
                    })
                    .filter(Boolean) as MapContact[];

                setContacts(mapped);
            } else {
                const mappedContacts: MapContact[] = (geoData || [])
                    .map((item: any) => {
                        try {
                            const lat = parseFloat(String(item.lat));
                            const lng = parseFloat(String(item.lng));

                            if (isNaN(lat) || isNaN(lng)) return null;

                            return {
                                id: item.id,
                                name: item.name,
                                type: item.type as MapContact['type'],
                                specialty: item.detail || undefined,
                                address: item.address || undefined,
                                city: item.city || undefined,
                                latitude: lat,
                                longitude: lng,
                                priority: item.priority || undefined,
                            };
                        } catch (e) {
                            return null;
                        }
                    })
                    .filter(Boolean) as MapContact[];

                setContacts(mappedContacts);
            }

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

    const filteredContacts = useMemo(() => contacts.filter(contact => {
        // Type filter
        if (!showDoctors && contact.type === 'doctor') return false;
        if (!showPharmacies && contact.type === 'pharmacy') return false;
        if (!showHospitals && contact.type === 'hospital') return false;
        if (!showClinics && contact.type === 'clinic') return false;

        // Search filter
        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            return (
                contact.name.toLowerCase().includes(search) ||
                contact.specialty?.toLowerCase().includes(search) ||
                contact.city?.toLowerCase().includes(search)
            );
        }

        return true;
    }), [contacts, showDoctors, showPharmacies, showHospitals, showClinics, searchTerm]);


    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'doctor': return 'MÃ©dico';
            case 'pharmacy': return 'Farmacia';
            case 'hospital': return 'Hospital';
            case 'clinic': return 'ClÃ­nica';
            default: return 'Contacto';
        }
    };

    const focusOnContact = (contact: MapContact) => {
        setMapCenter([contact.latitude, contact.longitude]);
        setMapZoom(15);
        setSelectedContact(contact);
    };

    const stats = {
        doctors: contacts.filter(c => c.type === 'doctor').length,
        pharmacies: contacts.filter(c => c.type === 'pharmacy').length,
        hospitals: contacts.filter(c => c.type === 'hospital').length,
        clinics: contacts.filter(c => c.type === 'clinic').length,
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
    const mapMarkers = useMemo(() => filteredContacts.map(contact => {
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
                <div className="min-w-[220px] p-1">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                            {getTypeIcon(contact.type)}
                            <Badge variant="outline" className="text-[10px] uppercase font-bold">
                                {getTypeLabel(contact.type)}
                            </Badge>
                        </div>
                    </div>
                    <h3 className="font-bold text-base leading-tight mb-1">{contact.name}</h3>
                    <div className="space-y-1 mb-4">
                        {contact.specialty && (
                            <p className="text-xs text-muted-foreground flex items-center">
                                <UsersIcon className="h-3 w-3 mr-1" /> {contact.specialty}
                            </p>
                        )}
                        {contact.address && (
                            <p className="text-[11px] leading-snug">
                                {contact.address}
                            </p>
                        )}
                    </div>

                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            variant="default"
                            className="w-full text-xs h-8 gradient-medical"
                            onClick={() => {
                                const route = contact.type === 'doctor' ? 'doctors' :
                                    contact.type === 'pharmacy' ? 'pharmacies' :
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
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Mapa de Cobertura</h1>
                    <p className="text-muted-foreground">Visualiza la ubicaciÃ³n geogrÃ¡fica de tus contactos</p>
                </div>
                <Button onClick={loadData} variant="outline" disabled={loading}>
                    <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    Actualizar
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="medical-card">
                    <CardContent className="p-4 flex items-center space-x-3">
                        <div className="p-2 rounded-full bg-blue-100">
                            <UsersIcon className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats.doctors}</p>
                            <p className="text-xs text-muted-foreground">MÃ©dicos</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="medical-card">
                    <CardContent className="p-4 flex items-center space-x-3">
                        <div className="p-2 rounded-full bg-green-100">
                            <Building2 className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats.pharmacies}</p>
                            <p className="text-xs text-muted-foreground">Farmacias</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="medical-card">
                    <CardContent className="p-4 flex items-center space-x-3">
                        <div className="p-2 rounded-full bg-red-100">
                            <Hospital className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats.hospitals}</p>
                            <p className="text-xs text-muted-foreground">Hospitales</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="medical-card">
                    <CardContent className="p-4 flex items-center space-x-3">
                        <div className="p-2 rounded-full bg-amber-100">
                            <Building className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats.clinics}</p>
                            <p className="text-xs text-muted-foreground">ClÃ­nicas</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 relative">
                {/* Sidebar */}
                <Card className="medical-card lg:col-span-1 shadow-2xl relative z-20">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center text-lg">
                            <Filter className="mr-2 h-5 w-5" />
                            Filtros
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
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

                        {/* Zone Filter */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Zona</label>
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

                        {/* Map Type Filter */}
                        {googleMapsApiKey && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Tipo de Mapa</label>
                                <Select value={mapType} onValueChange={(v: any) => setMapType(v)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Oscuro (Default)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="dark">Mapa Oscuro</SelectItem>
                                        <SelectItem value="roadmap">Google Roadmap</SelectItem>
                                        <SelectItem value="satellite">Google SatÃ©lite</SelectItem>
                                        <SelectItem value="hybrid">Google HÃ­brido</SelectItem>
                                        <SelectItem value="terrain">Google Terreno</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* Type Filters */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Tipo de Contacto</label>
                            <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="doctors" checked={showDoctors} onCheckedChange={(c) => setShowDoctors(!!c)} />
                                    <label htmlFor="doctors" className="flex items-center text-sm cursor-pointer">
                                        <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                                        MÃ©dicos ({stats.doctors})
                                    </label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="pharmacies" checked={showPharmacies} onCheckedChange={(c) => setShowPharmacies(!!c)} />
                                    <label htmlFor="pharmacies" className="flex items-center text-sm cursor-pointer">
                                        <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                                        Farmacias ({stats.pharmacies})
                                    </label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="hospitals" checked={showHospitals} onCheckedChange={(c) => setShowHospitals(!!c)} />
                                    <label htmlFor="hospitals" className="flex items-center text-sm cursor-pointer">
                                        <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                                        Hospitales ({stats.hospitals})
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Analysis Tools */}
                        <div className="pt-4 border-t space-y-3">
                            <label className="text-sm font-semibold flex items-center">
                                <Activity className="mr-2 h-4 w-4 text-emerald-500" />
                                Herramientas de AnÃ¡lisis
                            </label>
                            <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                                <div className="space-y-0.5">
                                    <label htmlFor="influence-radios" className="text-xs font-medium cursor-pointer">
                                        Radios de Influencia (1km)
                                    </label>
                                    <p className="text-[10px] text-muted-foreground">Ver cobertura de hospitales</p>
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
                            <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                                <div className="space-y-0.5">
                                    <label htmlFor="heatmap" className="text-xs font-medium cursor-pointer">
                                        Mapa de Calor de Visitas
                                    </label>
                                    <p className="text-[10px] text-muted-foreground">Visualizar densidad de actividad</p>
                                </div>
                                <Checkbox
                                    id="heatmap"
                                    checked={showHeatmap}
                                    onCheckedChange={(c) => setShowHeatmap(!!c)}
                                />
                            </div>
                        </div>

                        {/* Contact List */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Contactos ({filteredContacts.length})</label>
                            <ScrollArea className="h-[300px]">
                                <div className="space-y-2 pr-2">
                                    {filteredContacts.map(contact => (
                                        <div
                                            key={contact.id}
                                            onClick={() => focusOnContact(contact)}
                                            className={`p-3 rounded-lg cursor-pointer transition-colors ${selectedContact?.id === contact.id
                                                ? 'bg-primary/10 border border-primary'
                                                : 'bg-muted/50 hover:bg-muted'
                                                }`}
                                        >
                                            <div className="flex items-start space-x-2">
                                                <div
                                                    className="mt-1 w-2 h-2 rounded-full flex-shrink-0"
                                                    style={{ backgroundColor: MARKER_COLORS[contact.type] }}
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-sm truncate">{contact.name}</p>
                                                    <p className="text-xs text-muted-foreground truncate">
                                                        {contact.specialty || getTypeLabel(contact.type)}
                                                    </p>
                                                    {contact.city && (
                                                        <p className="text-xs text-muted-foreground truncate">{contact.city}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {filteredContacts.length === 0 && (
                                        <div className="text-center py-8 text-muted-foreground">
                                            <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                            <p className="text-sm">No hay contactos con ubicaciÃ³n</p>
                                            <p className="text-xs mt-1">Agrega coordenadas a tus contactos</p>
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>
                        </div>

                        <div className="pt-4 border-t">
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
                    </CardContent>
                </Card>

                {/* Map */}
                <Card className="bg-card/50 border border-border lg:col-span-3 overflow-hidden shadow-xl relative z-10">
                    <CardContent className="p-0 h-[600px] rounded-lg overflow-hidden">
                        <LeafletMap
                            center={mapCenter}
                            zoom={mapZoom}
                            markers={mapMarkers}
                            polylines={mapPolylines}
                            height="600px"
                            showInfluenceCircles={showInfluenceCircles || showProximityCircles}
                            influenceRadius={proximityRadius}
                        >
                            <VisitHeatmap
                                visits={visitHistory}
                                show={showHeatmap}
                                radius={30}
                                blur={20}
                            />
                        </LeafletMap>
                    </CardContent>
                </Card>
            </div>

            {/* Places Search */}
            {currentUserLocation && (
                <div className="mt-6">
                    <PlacesSearch
                        center={currentUserLocation}
                        onPlaceSelected={(place) => {
                            // Center map on selected place
                            setMapCenter([place.lat, place.lon]);
                            setMapZoom(16);
                            toast({
                                title: "Lugar seleccionado",
                                description: place.tags.name || "UbicaciÃ³n en el mapa"
                            });
                        }}
                        onAddAsContact={(place) => {
                            toast({
                                title: "PrÃ³ximamente",
                                description: "FunciÃ³n de agregar como contacto en desarrollo",
                            });
                        }}
                    />
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
    );
}
