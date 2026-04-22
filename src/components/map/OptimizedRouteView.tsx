/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import { useState, useEffect } from 'react';
import { Route, MapPin, Clock, Navigation, Sparkles, RefreshCw, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { optimizeRoute as osrmOptimizeRoute, formatDuration, formatDistance } from '@/services/osrmService';
import { useToast } from '@/hooks/use-toast';

interface Visit {
    id: string;
    contact_name: string;
    latitude?: number | null;
    longitude?: number | null;
    contact_type: string;
    priority?: 'high' | 'medium' | 'low';
    scheduled_time?: string;
    address?: string;
}

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

interface OptimizedRouteViewProps {
    visits: Visit[];
    userLocation?: { lat: number; lng: number };
    onReorderVisits?: (orderedIds: string[]) => void;
    onRouteOptimized?: (route: OptimizedRoute) => void;
    compact?: boolean;
}

const TYPE_COLORS: Record<string, string> = {
    doctor: 'bg-blue-500',
    pharmacy: 'bg-green-500',
    hospital: 'bg-red-500',
    clinic: 'bg-amber-500',
    health_center: 'bg-purple-500',
    default: 'bg-muted'
};

const PRIORITY_BADGES: Record<string, { color: string; label: string }> = {
    high: { color: 'bg-red-100 text-red-800', label: 'Alta' },
    medium: { color: 'bg-yellow-100 text-yellow-800', label: 'Media' },
    low: { color: 'bg-green-100 text-green-800', label: 'Baja' }
};

export function OptimizedRouteView({
    visits,
    userLocation,
    onReorderVisits,
    onRouteOptimized,
    compact = false
}: OptimizedRouteViewProps) {
    const [optimizedRoute, setOptimizedRoute] = useState<OptimizedRoute | null>(null);
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [showOptimized, setShowOptimized] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (visits.length > 0) {
            runOptimization();
        }
    }, [visits, userLocation]);

    const runOptimization = async () => {
        // Filter visits with valid coordinates
        const validVisits = visits.filter(v => v.latitude && v.longitude);

        if (validVisits.length < 2) {
            setOptimizedRoute(null);
            return;
        }

        setIsOptimizing(true);
        try {
            const points = validVisits.map(v => ({
                id: v.id,
                lat: v.latitude!,
                lng: v.longitude!,
            }));

            const startLocation = userLocation || {
                lat: validVisits[0].latitude!,
                lng: validVisits[0].longitude!
            };

            // Use OSRM for real route optimization
            const osrmResult = await osrmOptimizeRoute(startLocation, points);

            if (!osrmResult) {
                // Fallback: simple order if OSRM fails
                console.warn('OSRM optimization failed, using original order');
                setOptimizedRoute({
                    stops: validVisits.map(v => ({
                        id: v.id,
                        name: v.contact_name,
                        lat: v.latitude!,
                        lng: v.longitude!
                    })),
                    totalDistance: 0,
                    estimatedDuration: validVisits.length * 20 * 60, // 20 min per visit
                    savingsPercent: 0
                });
                return;
            }

            // Build optimized route with visit details
            const optimizedStops = osrmResult.optimizedOrder.map(id => {
                const visit = validVisits.find(v => v.id === id)!;
                return {
                    id: visit.id,
                    name: visit.contact_name,
                    lat: visit.latitude!,
                    lng: visit.longitude!
                };
            });

            const route: OptimizedRoute = {
                stops: optimizedStops,
                totalDistance: osrmResult.totalDistance / 1000, // Convert to km
                estimatedDuration: osrmResult.totalDuration,
                polyline: osrmResult.polyline,
                savingsPercent: 0 // Will be calculated if needed
            };

            setOptimizedRoute(route);
            onRouteOptimized?.(route);

            // Show success toast
            toast({
                title: "Ruta optimizada",
                description: `${formatDistance(osrmResult.totalDistance)} en ${formatDuration(osrmResult.totalDuration)}`
            });
        } catch (error) {
            console.error('Error optimizing route:', error);
            toast({
                title: "Error",
                description: "No se pudo optimizar la ruta. Se muestra orden original.",
                variant: "destructive"
            });
        } finally {
            setIsOptimizing(false);
        }
    };

    const applyOptimizedOrder = () => {
        if (optimizedRoute && onReorderVisits) {
            const orderedIds = optimizedRoute.stops
                .filter(s => s.id !== 'start')
                .map(s => s.id);
            onReorderVisits(orderedIds);
            setShowOptimized(true);
        }
    };

    const displayVisits = showOptimized && optimizedRoute
        ? optimizedRoute.stops.filter(s => s.id !== 'start')
        : visits.filter(v => v.latitude && v.longitude);

    if (visits.length === 0) {
        return (
            <Card className="medical-card">
                <CardContent className="p-6 text-center text-muted-foreground">
                    <Route className="mx-auto h-10 w-10 mb-2 opacity-50" />
                    <p>No hay visitas programadas para optimizar</p>
                </CardContent>
            </Card>
        );
    }

    const validVisitsCount = visits.filter(v => v.latitude && v.longitude).length;

    return (
        <Card className="medical-card">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center text-lg">
                            <Route className="mr-2 h-5 w-5 text-primary" />
                            Ruta del Día
                            {showOptimized && (
                                <Badge className="ml-2 bg-green-500">Optimizada</Badge>
                            )}
                        </CardTitle>
                        <CardDescription>
                            {validVisitsCount} visitas con ubicación válida
                        </CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={runOptimization}
                            disabled={isOptimizing || validVisitsCount < 2}
                        >
                            <RefreshCw className={`h-4 w-4 mr-1 ${isOptimizing ? 'animate-spin' : ''}`} />
                            Recalcular
                        </Button>
                        {optimizedRoute && !showOptimized && (
                            <Button
                                size="sm"
                                onClick={applyOptimizedOrder}
                                className="btn-medical"
                            >
                                <Sparkles className="h-4 w-4 mr-1" />
                                Aplicar
                            </Button>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {/* Route Stats */}
                {optimizedRoute && (
                    <div className="grid grid-cols-3 gap-3 mb-4 p-3 bg-muted/50 rounded-lg">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-primary">
                                {optimizedRoute.totalDistance} km
                            </p>
                            <p className="text-xs text-muted-foreground">Distancia total</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-primary">
                                {formatDuration(optimizedRoute.estimatedDuration)}
                            </p>
                            <p className="text-xs text-muted-foreground">Tiempo estimado</p>
                        </div>
                        <div className="text-center">
                            <p className={`text-2xl font-bold ${optimizedRoute.savingsPercent > 0 ? 'text-green-500' : 'text-muted-foreground'}`}>
                                {optimizedRoute.savingsPercent > 0 ? `-${optimizedRoute.savingsPercent}%` : '0%'}
                            </p>
                            <p className="text-xs text-muted-foreground">Ahorro distancia</p>
                        </div>
                    </div>
                )}

                {/* Route Stops */}
                <ScrollArea className={compact ? "h-[200px]" : "h-[300px]"}>
                    <div className="space-y-2">
                        {/* Start location */}
                        {userLocation && (
                            <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                <div className="relative">
                                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                                        <Navigation className="h-4 w-4" />
                                    </div>
                                    <div className="absolute -bottom-4 left-1/2 w-0.5 h-4 bg-muted -translate-x-1/2" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-sm">Mi ubicación</p>
                                    <p className="text-xs text-muted-foreground">Punto de inicio</p>
                                </div>
                            </div>
                        )}

                        {/* Visit stops */}
                        {displayVisits.map((item, index) => {
                            const visit = 'name' in item
                                ? visits.find(v => v.id === item.id)
                                : item as Visit;

                            if (!visit) return null;

                            const typeColor = TYPE_COLORS[visit.contact_type] || TYPE_COLORS.default;
                            const priority = visit.priority ? PRIORITY_BADGES[visit.priority] : null;
                            const isLast = index === displayVisits.length - 1;

                            return (
                                <div
                                    key={visit.id}
                                    className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                                >
                                    <div className="relative">
                                        <div className={`w-8 h-8 rounded-full ${typeColor} flex items-center justify-center text-white font-bold text-sm`}>
                                            {index + 1}
                                        </div>
                                        {!isLast && (
                                            <div className="absolute -bottom-4 left-1/2 w-0.5 h-4 bg-muted -translate-x-1/2" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="font-medium text-sm truncate">{visit.contact_name}</p>
                                            {priority && (
                                                <Badge className={priority.color} variant="secondary">
                                                    {priority.label}
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground capitalize">
                                            {visit.contact_type.replace('_', ' ')}
                                        </p>
                                        {visit.scheduled_time && (
                                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                                <Clock className="h-3 w-3" />
                                                {visit.scheduled_time}
                                            </p>
                                        )}
                                    </div>
                                    {!isLast && (
                                        <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </ScrollArea>

                {validVisitsCount < visits.length && (
                    <p className="text-xs text-center text-muted-foreground mt-2">
                        ⚠️ {visits.length - validVisitsCount} visitas sin coordenadas no se incluyen en la ruta
                    </p>
                )}
            </CardContent>
        </Card>
    );
}

export default OptimizedRouteView;
