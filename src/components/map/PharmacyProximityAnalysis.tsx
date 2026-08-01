/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import { useState, useEffect } from 'react';
import { Target, TrendingUp, MapPin, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    findPharmaciesNearHospitals,
    getGoldOpportunities,
    getProximityStats,
    formatDistance,
    type Location,
    type ProximityResult,
    exportProximityToExcel
} from '@/utils/proximityCalculations';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PharmacyProximityAnalysisProps {
    pharmacies: Location[];
    hospitals: Location[];
    onAnalysisChange?: (results: ProximityResult[], showCircles: boolean, radius: number) => void;
}

export function PharmacyProximityAnalysis({
    pharmacies,
    hospitals,
    onAnalysisChange
}: PharmacyProximityAnalysisProps) {
    const [radius, setRadius] = useState(1000); // 1km default
    const [showAnalysis, setShowAnalysis] = useState(false);
    const [results, setResults] = useState<ProximityResult[]>([]);

    useEffect(() => {
        if (showAnalysis && pharmacies.length > 0 && hospitals.length > 0) {
            const proximityResults = findPharmaciesNearHospitals(pharmacies, hospitals, radius);
            setResults(proximityResults);
            onAnalysisChange?.(proximityResults, showAnalysis, radius);
        } else {
            setResults([]);
            onAnalysisChange?.([], false, radius);
        }
    }, [showAnalysis, radius, pharmacies, hospitals]);

    const stats = getProximityStats(results);
    const goldOpportunities = getGoldOpportunities(results);

    return (
        <Card className="medical-card">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-lg">
                    <Target className="mr-2 h-5 w-5 text-primary" />
                    Análisis de Proximidad
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Controls */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                        <div className="space-y-0.5">
                            <Label htmlFor="proximity-analysis" className="text-xs font-medium cursor-pointer">
                                Activar Análisis
                            </Label>
                            <p className="text-[10px] text-muted-foreground">
                                Farmacias cerca de hospitales/clínicas
                            </p>
                        </div>
                        <Checkbox
                            id="proximity-analysis"
                            checked={showAnalysis}
                            onCheckedChange={(c) => setShowAnalysis(!!c)}
                        />
                    </div>

                    {showAnalysis && (
                        <div className="space-y-2">
                            <Label>Radio de Influencia</Label>
                            <Select value={radius.toString()} onValueChange={(v) => setRadius(parseInt(v))}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="500">500 m</SelectItem>
                                    <SelectItem value="1000">1 km</SelectItem>
                                    <SelectItem value="2000">2 km</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </div>

                {/* Statistics */}
                {showAnalysis && results.length > 0 && (
                    <>
                        <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                            <h4 className="font-semibold text-sm flex items-center">
                                📊 Estadísticas
                            </h4>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <p className="text-2xl font-bold text-primary">{stats.total}</p>
                                    <p className="text-xs text-muted-foreground">Total Farmacias</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-green-500">{stats.inZone}</p>
                                    <p className="text-xs text-muted-foreground">En Zona ({stats.percentageInZone}%)</p>
                                </div>
                            </div>

                            <div className="pt-2 border-t flex items-center justify-between">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 text-xs gap-1.5"
                                    onClick={() => exportProximityToExcel(results, radius)}
                                    disabled={results.length === 0}
                                >
                                    <Download className="h-3.5 w-3.5" />
                                    Exportar Lista
                                </Button>
                            </div>

                            <div className="pt-2 border-t">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Fuera de zona:</span>
                                    <span className="font-medium">{stats.outOfZone}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm mt-1">
                                    <span className="text-muted-foreground">🏆 Oportunidades Gold:</span>
                                    <Badge variant="default" className="bg-amber-500">{stats.goldOpportunities}</Badge>
                                </div>
                            </div>
                        </div>

                        {/* Gold Opportunities */}
                        {goldOpportunities.length > 0 && (
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4 text-amber-500" />
                                    <Label className="text-sm font-semibold">
                                        Oportunidades Estratégicas
                                    </Label>
                                </div>
                                <ScrollArea className="h-[200px]">
                                    <div className="space-y-2 pr-2">
                                        {goldOpportunities.map((result) => (
                                            <div
                                                key={result.pharmacy.id}
                                                className="p-3 rounded-lg border bg-card hover:bg-accent transition-colors"
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h5 className="font-medium text-sm truncate">
                                                                {result.pharmacy.name}
                                                            </h5>
                                                            <Badge
                                                                className={
                                                                    result.priority === 'high'
                                                                        ? 'bg-red-100 text-red-800'
                                                                        : 'bg-amber-100 text-amber-800'
                                                                }
                                                                variant="secondary"
                                                            >
                                                                {result.totalNearby} centros
                                                            </Badge>
                                                        </div>

                                                        <div className="space-y-1">
                                                            {result.nearbyHospitals.slice(0, 3).map((item, idx) => (
                                                                <p key={idx} className="text-xs text-muted-foreground flex items-center gap-1">
                                                                    <MapPin className="h-3 w-3" />
                                                                    {item.hospital.name} - {formatDistance(item.distance)}
                                                                </p>
                                                            ))}
                                                            {result.nearbyHospitals.length > 3 && (
                                                                <p className="text-xs text-muted-foreground">
                                                                    + {result.nearbyHospitals.length - 3} más...
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </div>
                        )}

                        {/* Info */}
                        <div className="flex items-start gap-2 p-2 bg-blue-50 dark:bg-blue-950/20 rounded-lg text-slate-900">
                            <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-muted-foreground">
                                Las farmacias cerca de 2+ hospitales son <strong>oportunidades estratégicas</strong> para
                                maximizar ventas y cobertura.
                            </p>
                        </div>
                    </>
                )}

                {/* Empty State */}
                {showAnalysis && results.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                        <Target className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No hay datos para analizar</p>
                        <p className="text-xs mt-1">Asegúrate de tener farmacias y hospitales con coordenadas</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export default PharmacyProximityAnalysis;
