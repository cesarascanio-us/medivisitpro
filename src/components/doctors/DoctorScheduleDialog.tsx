/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */


import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Clock, MapPin, Calendar, Building2, Globe, ShieldCheck, Navigation } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { GeocodingButton } from "@/components/forms/GeocodingButton";
import { Separator } from "@/components/ui/separator";

interface DoctorScheduleDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    doctorId: string;
    scheduleData?: any;
    onSaved: () => void;
}

export function DoctorScheduleDialog({
    open,
    onOpenChange,
    doctorId,
    scheduleData,
    onSaved
}: DoctorScheduleDialogProps) {
    const { user } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [healthCenters, setHealthCenters] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        health_center_id: scheduleData?.health_center_id || "",
        direccion: scheduleData?.direccion || "",
        zona_sector: scheduleData?.zona_sector || "",
        ciudad: scheduleData?.ciudad || "",
        estado: scheduleData?.estado || "",
        dias_atencion: scheduleData?.dias_atencion || "",
        hora_inicio: scheduleData?.hora_inicio || "",
        hora_fin: scheduleData?.hora_fin || "",
        activo: scheduleData?.activo ?? true,
        notas: scheduleData?.notas || "",
        latitude: scheduleData?.latitude || null,
        longitude: scheduleData?.longitude || null
    });

    useEffect(() => {
        if (open) {
            loadHealthCenters();
        }
    }, [open]);

    const loadHealthCenters = async () => {
        if (!user) return;
        const { data, error } = await supabase
            .from('health_centers')
            .select('id, name')
            .eq('user_id', user.id)
            .order('name');

        if (error) {
            console.error('Error loading health centers:', error);
            return;
        }
        setHealthCenters(data || []);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        if (!formData.dias_atencion || !formData.hora_inicio || !formData.hora_fin) {
            toast({
                title: "Error",
                description: "Días de atención y horarios son obligatorios",
                variant: "destructive"
            });
            return;
        }

        setLoading(true);

        try {
            const payload = {
                doctor_id: doctorId,
                health_center_id: formData.health_center_id || null,
                direccion: formData.direccion || null,
                zona_sector: formData.zona_sector || null,
                ciudad: formData.ciudad || null,
                estado: formData.estado || null,
                dias_atencion: formData.dias_atencion,
                hora_inicio: formData.hora_inicio,
                hora_fin: formData.hora_fin,
                activo: formData.activo,
                notas: formData.notas || null,
                latitude: formData.latitude || null,
                longitude: formData.longitude || null,
                user_id: user.id
            };

            let result;
            if (scheduleData) {
                result = await supabase
                    .from('doctor_schedules')
                    .update(payload)
                    .eq('id', scheduleData.id);
            } else {
                result = await supabase
                    .from('doctor_schedules')
                    .insert([payload]);
            }

            if (result.error) throw result.error;

            toast({
                title: scheduleData ? "Horario actualizado" : "Horario agregado",
                description: "Los cambios han sido guardados correctamente."
            });

            onOpenChange(false);
            onSaved();
        } catch (error) {
            console.error('Error saving schedule:', error);
            toast({
                title: "Error",
                description: "No se pudo guardar el horario",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl p-0 overflow-hidden border-none shadow-2xl rounded-3xl">
                <div className="bg-slate-800 px-6 py-8 text-white">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-background/10 flex items-center justify-center">
                            <Clock className="h-5 w-5" />
                        </div>
                        <DialogTitle className="text-xl font-black mt-0">
                            {scheduleData ? "Modificar Horario" : "Definir Nueva Sede"}
                        </DialogTitle>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="px-8 py-6 space-y-6 bg-card max-h-[70vh] overflow-y-auto custom-scrollbar">
                    {/* Centro de Salud */}
                    <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Centro de Salud Vinculado</Label>
                        <Select
                            value={formData.health_center_id}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, health_center_id: value }))}
                        >
                            <SelectTrigger className="h-12 border-slate-200 rounded-xl font-bold bg-slate-50/50">
                                <SelectValue placeholder="Seleccionar centro o usar dirección manual" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                <SelectItem value="">Ninguno (usar dirección manual)</SelectItem>
                                {healthCenters.map(center => (
                                    <SelectItem key={center.id} value={center.id} className="font-bold">
                                        🏢 {center.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <Separator className="bg-slate-100" />

                    {/* Dirección Manual */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <MapPin className="h-3 w-3 text-slate-400" />
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Detalles de Ubicación</h4>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold text-slate-400 ml-1">Dirección Exacta</Label>
                            <Input
                                value={formData.direccion}
                                onChange={(e) => setFormData(prev => ({ ...prev, direccion: e.target.value }))}
                                placeholder="Torre Médica, Piso, Consultorio..."
                                className="h-11 border-slate-200 rounded-xl font-bold"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold text-slate-400 ml-1">Zona / Sector</Label>
                                <Input
                                    value={formData.zona_sector}
                                    onChange={(e) => setFormData(prev => ({ ...prev, zona_sector: e.target.value }))}
                                    placeholder="Sector"
                                    className="h-11 border-slate-200 rounded-xl font-bold"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold text-slate-400 ml-1">Ciudad</Label>
                                <Input
                                    value={formData.ciudad}
                                    onChange={(e) => setFormData(prev => ({ ...prev, ciudad: e.target.value }))}
                                    placeholder="Ciudad"
                                    className="h-11 border-slate-200 rounded-xl font-bold"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Geocoding Section */}
                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-4 shadow-inner">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Navigation className="h-4 w-4 text-blue-600" />
                                <span className="text-[10px] font-black uppercase text-slate-600 tracking-tight">Geolocalización</span>
                            </div>
                            <GeocodingButton
                                address={{
                                    street: formData.direccion,
                                    city: formData.ciudad,
                                    state: formData.estado,
                                    country: "Venezuela"
                                }}
                                onCoordinatesFound={(lat, lng) => {
                                    setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));
                                    toast({ title: "Ubicación detectada" });
                                }}
                                disabled={!formData.ciudad}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                type="number"
                                step="any"
                                value={formData.latitude || ""}
                                onChange={(e) => setFormData(prev => ({ ...prev, latitude: parseFloat(e.target.value) || null }))}
                                placeholder="Latitud"
                                className="h-9 text-[10px] font-mono font-bold bg-card"
                            />
                            <Input
                                type="number"
                                step="any"
                                value={formData.longitude || ""}
                                onChange={(e) => setFormData(prev => ({ ...prev, longitude: parseFloat(e.target.value) || null }))}
                                placeholder="Longitud"
                                className="h-9 text-[10px] font-mono font-bold bg-card"
                            />
                        </div>
                    </div>

                    <Separator className="bg-slate-100" />

                    {/* Horarios */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3 text-slate-400" />
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Días & Horarios</h4>
                        </div>
                        <div className="space-y-3">
                            <Label className="text-[10px] font-bold text-slate-400 ml-1">Días de Atención</Label>
                            <Select
                                value={formData.dias_atencion}
                                onValueChange={(value) => setFormData(prev => ({ ...prev, dias_atencion: value }))}
                            >
                                <SelectTrigger className="h-11 border-slate-200 rounded-xl font-bold">
                                    <SelectValue placeholder="Seleccionar frecuencia" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl font-bold">
                                    <SelectItem value="Lunes a Viernes">📅 Lunes a Viernes</SelectItem>
                                    <SelectItem value="Lunes a Sábado">📅 Lunes a Sábado</SelectItem>
                                    <SelectItem value="Lunes, Miércoles y Viernes">🔄 Lunes, Miércoles y Viernes</SelectItem>
                                    <SelectItem value="Martes y Jueves">🔄 Martes y Jueves</SelectItem>
                                    <SelectItem value="Sábado">✨ Sábado</SelectItem>
                                    <SelectItem value="Domingo">✨ Domingo</SelectItem>
                                </SelectContent>
                            </Select>
                            <Input
                                placeholder="O defina manualmente..."
                                value={formData.dias_atencion}
                                onChange={(e) => setFormData(prev => ({ ...prev, dias_atencion: e.target.value }))}
                                className="h-11 border-slate-200 rounded-xl font-bold"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold text-slate-400 ml-1">Hora Inicio</Label>
                                <Input
                                    type="time"
                                    value={formData.hora_inicio}
                                    onChange={(e) => setFormData(prev => ({ ...prev, hora_inicio: e.target.value }))}
                                    className="h-11 border-slate-200 rounded-xl font-bold"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold text-slate-400 ml-1">Hora Fin</Label>
                                <Input
                                    type="time"
                                    value={formData.hora_fin}
                                    onChange={(e) => setFormData(prev => ({ ...prev, hora_fin: e.target.value }))}
                                    className="h-11 border-slate-200 rounded-xl font-bold"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Observaciones</Label>
                        <Textarea
                            value={formData.notas}
                            onChange={(e) => setFormData(prev => ({ ...prev, notas: e.target.value }))}
                            placeholder="Notas sobre parqueo, entrada, o protocolos..."
                            className="bg-slate-50/30 border-slate-200 rounded-2xl p-4 font-medium min-h-[100px]"
                        />
                    </div>

                    <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-3">
                        <Checkbox
                            id="activo"
                            checked={formData.activo}
                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, activo: !!checked }))}
                            className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                        />
                        <Label htmlFor="activo" className="text-xs font-bold text-slate-600 cursor-pointer">
                            Habilitar esta sede para visitas actuales
                        </Label>
                    </div>
                </form>

                <div className="bg-card border-t border-slate-100 px-8 py-6 flex items-center justify-between gap-4">
                    <Button variant="ghost" onClick={() => onOpenChange(false)} className="h-12 px-6 font-bold text-slate-400">Descartar</Button>
                    <Button onClick={handleSubmit} disabled={loading} className="h-12 px-8 bg-slate-800 hover:bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl transition-all hover:scale-[1.02]">
                        {loading ? "Sincronizando..." : (scheduleData ? "Actualizar Sede" : "Confirmar Nueva Sede")}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
