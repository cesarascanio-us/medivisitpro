/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { MapPin, Phone, Mail, Navigation, AlertTriangle, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface DoctorProfileDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    doctor: any;
}

interface NearbyPharmacy {
    pharmacy_id: string;
    name: string;
    distance_meters: number;
    address: string;
    latitude: number;
    longitude: number;
    stock_status?: 'ok' | 'low' | 'critical'; // Mocked for now or fetched
}

export function DoctorProfileDialog({ open, onOpenChange, doctor }: DoctorProfileDialogProps) {
    const [nearbyPharmacies, setNearbyPharmacies] = useState<NearbyPharmacy[]>([]);
    const [loadingPharmacies, setLoadingPharmacies] = useState(false);

    useEffect(() => {
        if (open && doctor?.id) {
            loadNearbyPharmacies();
        }
    }, [open, doctor]);

    const loadNearbyPharmacies = async () => {
        setLoadingPharmacies(true);
        try {
            const { data, error } = await supabase
                .rpc('get_nearby_pharmacies' as any, {
                    p_doctor_id: doctor.id,
                    p_radius_km: 2.0 // 2km radius
                });

            if (error) throw error;

            // Mock stock status for now since we don't have direct linkage yet
            // In a real scenario, we'd join with view_farmacia_stock_actual
            const pharmaciesWithStock = (data || []).map((p: any) => ({
                ...p,
                stock_status: Math.random() > 0.3 ? 'ok' : (Math.random() > 0.5 ? 'low' : 'critical')
            }));

            setNearbyPharmacies(pharmaciesWithStock);
        } catch (error) {
            console.error("Error loading nearby pharmacies:", error);
        } finally {
            setLoadingPharmacies(false);
        }
    };

    if (!doctor) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-2xl">
                        {doctor.name}
                        {doctor.specialty && <Badge variant="secondary">{doctor.specialty}</Badge>}
                    </DialogTitle>
                    <DialogDescription>
                        Perfil Detallado y Corredor Terapéutico
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                    {/* Column 1: Personal Info */}
                    <div className="space-y-4">
                        <Card>
                            <CardContent className="pt-6 space-y-3">
                                <h3 className="font-semibold text-lg border-b pb-2">Información</h3>
                                <div className="space-y-2 text-sm">
                                    {doctor.email && (
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                            <span>{doctor.email}</span>
                                        </div>
                                    )}
                                    {doctor.phone && (
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-4 w-4 text-muted-foreground" />
                                            <span>{doctor.phone}</span>
                                        </div>
                                    )}
                                    {doctor.address && (
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-muted-foreground" />
                                            <span>{doctor.address}</span>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <h3 className="font-semibold text-lg border-b pb-2 mb-3">Estadísticas</h3>
                                <div className="grid grid-cols-2 gap-4 text-center">
                                    <div className="p-2 bg-slate-50 rounded-lg">
                                        <p className="text-xs text-muted-foreground">Potencial</p>
                                        <p className="font-bold text-primary">{doctor.potential || 'Medio'}</p>
                                    </div>
                                    <div className="p-2 bg-slate-50 rounded-lg">
                                        <p className="text-xs text-muted-foreground">Estado</p>
                                        <p className="font-bold text-emerald-600">{doctor.status || 'Activo'}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Column 2 & 3: Therapeutic Corridor */}
                    <div className="md:col-span-2 space-y-4">
                        <Card className="h-full border-2 border-primary/10">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold text-lg flex items-center gap-2">
                                        <Navigation className="h-5 w-5 text-blue-500" />
                                        Corredor Terapéutico
                                    </h3>
                                    <Badge variant="outline">Radio: 2km</Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Farmacias cercanas donde este médico podría estar generando recetas.
                                    <br />
                                    <span className="text-xs text-red-500 font-medium">* Alerta: Stock Crítico indica riesgo de fuga.</span>
                                </p>

                                {loadingPharmacies ? (
                                    <div className="text-center py-8">Buscando farmacias cercanas...</div>
                                ) : nearbyPharmacies.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground bg-slate-50 rounded-lg">
                                        No se encontraron farmacias en un radio de 2km.
                                    </div>
                                ) : (
                                    <div className="grid gap-3">
                                        {nearbyPharmacies.map(pharmacy => (
                                            <div key={pharmacy.pharmacy_id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 transition-colors">
                                                <div>
                                                    <p className="font-medium">{pharmacy.name}</p>
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                        <MapPin className="h-3 w-3" />
                                                        {Math.round(pharmacy.distance_meters)}m
                                                    </div>
                                                    <p className="text-xs text-muted-foreground truncate max-w-[200px]">{pharmacy.address}</p>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    {pharmacy.stock_status === 'critical' && (
                                                        <div className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded text-xs font-bold border border-red-100">
                                                            <AlertTriangle className="h-3 w-3" />
                                                            CRÍTICO
                                                        </div>
                                                    )}
                                                    {pharmacy.stock_status === 'low' && (
                                                        <div className="flex items-center gap-1 text-yellow-600 bg-yellow-50 px-2 py-1 rounded text-xs font-bold border border-yellow-100">
                                                            <AlertTriangle className="h-3 w-3" />
                                                            BAJO
                                                        </div>
                                                    )}
                                                    {pharmacy.stock_status === 'ok' && (
                                                        <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded text-xs font-bold border border-emerald-100">
                                                            <CheckCircle className="h-3 w-3" />
                                                            CUBIERTO
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
