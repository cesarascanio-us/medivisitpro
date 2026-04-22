/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import { useState } from 'react';
import { Search, MapPin, Phone, Clock, ExternalLink, Plus, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
    findNearbyPlaces,
    formatPlaceInfo,
    formatPlaceDistance,
    OverpassPlace
} from '@/services/overpassService';

interface PlacesSearchProps {
    center: { lat: number; lng: number };
    onPlaceSelected?: (place: OverpassPlace) => void;
    onAddAsContact?: (place: OverpassPlace) => void;
}

export function PlacesSearch({ center, onPlaceSelected, onAddAsContact }: PlacesSearchProps) {
    const [placeType, setPlaceType] = useState<'hospital' | 'pharmacy' | 'doctors' | 'clinic'>('pharmacy');
    const [radius, setRadius] = useState(5);
    const [results, setResults] = useState<OverpassPlace[]>([]);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const handleSearch = async () => {
        setLoading(true);
        try {
            const places = await findNearbyPlaces(center, placeType, radius);

            setResults(places);

            toast({
                title: "Búsqueda completada",
                description: `Se encontraron ${places.length} lugares`,
            });
        } catch (error) {
            console.error('Error searching places:', error);
            toast({
                title: "Error",
                description: "No se pudo completar la búsqueda",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const getTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            hospital: 'Hospital',
            pharmacy: 'Farmacia',
            doctors: 'Consultorio Médico',
            clinic: 'Clínica'
        };
        return labels[type] || type;
    };

    const getTypeColor = (type: string) => {
        const colors: Record<string, string> = {
            hospital: 'bg-red-100 text-red-800',
            pharmacy: 'bg-green-100 text-green-800',
            doctors: 'bg-blue-100 text-blue-800',
            clinic: 'bg-amber-100 text-amber-800'
        };
        return colors[type] || 'bg-muted text-muted-foreground';
    };

    return (
        <Card className="medical-card">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-lg">
                    <Search className="mr-2 h-5 w-5 text-primary" />
                    Buscar Lugares Cercanos
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Search Controls */}
                <div className="space-y-3">
                    <div className="space-y-2">
                        <Label>Tipo de Lugar</Label>
                        <Select value={placeType} onValueChange={(v: any) => setPlaceType(v)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="pharmacy">Farmacias</SelectItem>
                                <SelectItem value="hospital">Hospitales</SelectItem>
                                <SelectItem value="doctors">Consultorios Médicos</SelectItem>
                                <SelectItem value="clinic">Clínicas</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Radio de Búsqueda</Label>
                        <Select value={radius.toString()} onValueChange={(v) => setRadius(parseInt(v))}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1">1 km</SelectItem>
                                <SelectItem value="2">2 km</SelectItem>
                                <SelectItem value="5">5 km</SelectItem>
                                <SelectItem value="10">10 km</SelectItem>
                                <SelectItem value="20">20 km</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Button
                        onClick={handleSearch}
                        disabled={loading}
                        className="w-full btn-medical"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Buscando...
                            </>
                        ) : (
                            <>
                                <Search className="mr-2 h-4 w-4" />
                                Buscar
                            </>
                        )}
                    </Button>
                </div>

                {/* Results */}
                {results.length > 0 && (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium">
                                Resultados ({results.length})
                            </Label>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setResults([])}
                            >
                                Limpiar
                            </Button>
                        </div>

                        <ScrollArea className="h-[400px]">
                            <div className="space-y-2 pr-2">
                                {results.map((place) => {
                                    const info = formatPlaceInfo(place);
                                    return (
                                        <div
                                            key={place.id}
                                            className="p-3 rounded-lg border bg-card hover:bg-accent transition-colors cursor-pointer"
                                            onClick={() => onPlaceSelected?.(place)}
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className="font-medium text-sm truncate">
                                                            {info.name}
                                                        </h4>
                                                        <Badge className={getTypeColor(placeType)} variant="secondary">
                                                            {getTypeLabel(placeType)}
                                                        </Badge>
                                                    </div>

                                                    <div className="space-y-1">
                                                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                            <MapPin className="h-3 w-3" />
                                                            {info.address}
                                                        </p>

                                                        {place.distance && (
                                                            <p className="text-xs text-muted-foreground">
                                                                📍 {formatPlaceDistance(place.distance)}
                                                            </p>
                                                        )}

                                                        {info.phone && (
                                                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                                <Phone className="h-3 w-3" />
                                                                {info.phone}
                                                            </p>
                                                        )}

                                                        {info.openingHours && (
                                                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                                <Clock className="h-3 w-3" />
                                                                {info.openingHours}
                                                            </p>
                                                        )}

                                                        {info.website && (
                                                            <a
                                                                href={info.website}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-xs text-primary hover:underline flex items-center gap-1"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                <ExternalLink className="h-3 w-3" />
                                                                Sitio web
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>

                                                {onAddAsContact && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onAddAsContact(place);
                                                        }}
                                                    >
                                                        <Plus className="h-3 w-3" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </ScrollArea>
                    </div>
                )}

                {/* Empty State */}
                {!loading && results.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                        <Search className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Busca lugares cercanos</p>
                        <p className="text-xs mt-1">Selecciona un tipo y radio, luego haz clic en Buscar</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export default PlacesSearch;
