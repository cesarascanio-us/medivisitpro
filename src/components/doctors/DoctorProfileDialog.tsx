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
import { MapPin, Phone, Mail, Navigation, AlertTriangle, CheckCircle, ClipboardList, CalendarClock, History } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useDemoData } from "@/contexts/MockDataProvider";

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
    const [pastVisits, setPastVisits] = useState<any[]>([]);
    const [upcomingVisit, setUpcomingVisit] = useState<any | null>(null);
    const demoData = useDemoData();

    useEffect(() => {
        if (open && doctor?.id) {
            loadNearbyPharmacies();
            loadVisits();
        }
    }, [open, doctor]);

    const loadVisits = async () => {
        if (demoData) {
            const docVisits = demoData.visits.filter((v: any) => v.contact_id === doctor.id || v.contact_id === doctor.user_id);
            const now = new Date();
            const past = docVisits.filter((v: any) => v.status === 'completed' || new Date(v.scheduled_date) < now)
                                  .sort((a: any, b: any) => new Date(b.scheduled_date).getTime() - new Date(a.scheduled_date).getTime());
            const upcoming = docVisits.filter((v: any) => v.status === 'scheduled' && new Date(v.scheduled_date) >= now)
                                      .sort((a: any, b: any) => new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime());
            
            setPastVisits(past);
            setUpcomingVisit(upcoming.length > 0 ? upcoming[0] : null);
            return;
        }

        try {
            const nowIso = new Date().toISOString();
            const { data: pastData } = await supabase
                .from('visits')
                .select('*')
                .eq('contact_id', doctor.id)
                .eq('status', 'completed')
                .order('scheduled_date', { ascending: false })
                .limit(5);
            setPastVisits(pastData || []);

            const { data: upcomingData } = await supabase
                .from('visits')
                .select('*')
                .eq('contact_id', doctor.id)
                .eq('status', 'scheduled')
                .gte('scheduled_date', nowIso)
                .order('scheduled_date', { ascending: true })
                .limit(1);
            setUpcomingVisit(upcomingData && upcomingData.length > 0 ? upcomingData[0] : null);
        } catch (err) {
            console.error("Error loading visits:", err);
        }
    };

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
                                    <div className="p-2 bg-muted/50 border border-border/40 rounded-lg text-foreground">
                                        <p className="text-xs text-muted-foreground">Potencial</p>
                                        <p className="font-bold text-primary">{doctor.potential || 'Medio'}</p>
                                    </div>
                                    <div className="p-2 bg-muted/50 border border-border/40 rounded-lg text-foreground">
                                        <p className="text-xs text-muted-foreground">Estado</p>
                                        <p className="font-bold text-emerald-500">{doctor.status || 'Activo'}</p>
                                    </div>
                                    <div className="p-2 bg-muted/50 border border-border/40 rounded-lg text-foreground col-span-2">
                                        <p className="text-xs text-muted-foreground">Total Visitas Históricas</p>
                                        <p className="font-bold text-blue-500">{pastVisits.length}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Column 2 & 3: Panels */}
                    <div className="md:col-span-2 space-y-4">
                        {/* Historial de Gestión */}
                        <Card className="border-border/40 shadow-premium-sm">
                            <CardContent className="pt-6">
                                <h3 className="font-semibold text-lg flex items-center gap-2 mb-4">
                                    <History className="h-5 w-5 text-primary" />
                                    Historial de Gestión
                                </h3>
                                <div className="space-y-4">
                                    {/* Próxima Visita */}
                                    <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                                            <CalendarClock className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Próxima Visita Programada</h4>
                                            {upcomingVisit ? (
                                                <p className="text-sm text-foreground">
                                                    {new Date(upcomingVisit.scheduled_date).toLocaleDateString()} a las {new Date(upcomingVisit.scheduled_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                </p>
                                            ) : (
                                                <p className="text-sm text-muted-foreground">No hay visitas programadas a futuro.</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Comentarios Anteriores */}
                                    <div className="space-y-3">
                                        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest border-b border-border/40 pb-2">Últimos Registros</h4>
                                        {pastVisits.length > 0 ? (
                                            pastVisits.map((v, i) => (
                                                <div key={v.id || i} className="bg-muted/30 border border-border/40 rounded-lg p-3">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="text-xs font-bold text-foreground">{new Date(v.scheduled_date).toLocaleDateString()}</span>
                                                        <Badge variant="outline" className="text-[9px] uppercase">{v.visit_type || 'Visita Regular'}</Badge>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">
                                                        {v.summary || v.objective || 'Sin comentarios registrados en esta visita.'}
                                                    </p>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-4 bg-muted/20 rounded-lg border border-dashed border-border/40">
                                                <p className="text-sm text-muted-foreground">No hay historial de visitas registradas.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Corredor Terapéutico */}
                        <Card className="border-2 border-primary/10 shadow-premium-sm">
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
                                    <div className="text-center py-8 text-muted-foreground bg-muted/50 border border-border/40 rounded-lg">
                                        No se encontraron farmacias en un radio de 2km.
                                    </div>
                                ) : (
                                    <div className="grid gap-3">
                                        {nearbyPharmacies.map(pharmacy => (
                                            <div key={pharmacy.pharmacy_id} className="flex items-center justify-between p-3 border border-border/40 rounded-lg hover:bg-muted/50 transition-colors">
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
