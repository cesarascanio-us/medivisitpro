import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Clock, MapPin, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { GeocodingButton } from "@/components/forms/GeocodingButton";

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
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {scheduleData ? "Editar Horario" : "Agregar Ubicación/Horario"}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Health Center Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="health_center">
                            <MapPin className="inline mr-1 h-4 w-4" />
                            Centro de Salud (Opcional)
                        </Label>
                        <Select
                            value={formData.health_center_id}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, health_center_id: value }))}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar centro o usar dirección manual" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">Ninguno (usar dirección manual)</SelectItem>
                                {healthCenters.map(center => (
                                    <SelectItem key={center.id} value={center.id}>
                                        {center.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Manual Address Fields */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="direccion">Dirección</Label>
                            <Input
                                id="direccion"
                                value={formData.direccion}
                                onChange={(e) => setFormData(prev => ({ ...prev, direccion: e.target.value }))}
                                placeholder="Av. Principal, Torre Médica, Piso 5"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="zona">Zona/Sector</Label>
                            <Input
                                id="zona"
                                value={formData.zona_sector}
                                onChange={(e) => setFormData(prev => ({ ...prev, zona_sector: e.target.value }))}
                                placeholder="Zona Norte, Sector 3"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="ciudad">Ciudad</Label>
                            <Input
                                id="ciudad"
                                value={formData.ciudad}
                                onChange={(e) => setFormData(prev => ({ ...prev, ciudad: e.target.value }))}
                                placeholder="Caracas"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="estado">Estado</Label>
                            <Input
                                id="estado"
                                value={formData.estado}
                                onChange={(e) => setFormData(prev => ({ ...prev, estado: e.target.value }))}
                                placeholder="Miranda"
                            />
                        </div>
                    </div>

                    {/* Geocoding Section */}
                    <div className="space-y-3 p-4 bg-muted/30 rounded-lg border">
                        <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium">Coordenadas GPS</Label>
                            <GeocodingButton
                                address={{
                                    street: formData.direccion,
                                    city: formData.ciudad,
                                    state: formData.estado,
                                    country: "Venezuela"
                                }}
                                onCoordinatesFound={(lat, lng) => {
                                    setFormData(prev => ({
                                        ...prev,
                                        latitude: lat,
                                        longitude: lng
                                    }));
                                    toast({
                                        title: "Coordenadas obtenidas",
                                        description: `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`
                                    });
                                }}
                                disabled={!formData.ciudad}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="latitude" className="text-xs">Latitud</Label>
                                <Input
                                    id="latitude"
                                    type="number"
                                    step="any"
                                    value={formData.latitude || ""}
                                    onChange={(e) => setFormData(prev => ({ ...prev, latitude: parseFloat(e.target.value) || null }))}
                                    placeholder="10.4880"
                                    className="text-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="longitude" className="text-xs">Longitud</Label>
                                <Input
                                    id="longitude"
                                    type="number"
                                    step="any"
                                    value={formData.longitude || ""}
                                    onChange={(e) => setFormData(prev => ({ ...prev, longitude: parseFloat(e.target.value) || null }))}
                                    placeholder="-66.8792"
                                    className="text-sm"
                                />
                            </div>
                        </div>

                        {formData.latitude && formData.longitude && (
                            <p className="text-xs text-muted-foreground">
                                ✓ Ubicación establecida - Aparecerá en el mapa
                            </p>
                        )}
                    </div>

                    {/* Schedule Fields */}
                    <div className="space-y-2">
                        <Label htmlFor="dias">
                            <Calendar className="inline mr-1 h-4 w-4" />
                            Días de Atención *
                        </Label>
                        <Select
                            value={formData.dias_atencion}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, dias_atencion: value }))}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar días" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Lunes a Viernes">Lunes a Viernes</SelectItem>
                                <SelectItem value="Lunes a Sábado">Lunes a Sábado</SelectItem>
                                <SelectItem value="Lunes, Miércoles y Viernes">Lunes, Miércoles y Viernes</SelectItem>
                                <SelectItem value="Martes y Jueves">Martes y Jueves</SelectItem>
                                <SelectItem value="Sábado">Sábado</SelectItem>
                                <SelectItem value="Domingo">Domingo</SelectItem>
                            </SelectContent>
                        </Select>
                        <Input
                            placeholder="O escribir manualmente: ej. Lunes, Miércoles de 2-6pm"
                            value={formData.dias_atencion}
                            onChange={(e) => setFormData(prev => ({ ...prev, dias_atencion: e.target.value }))}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="hora_inicio">
                                <Clock className="inline mr-1 h-4 w-4" />
                                Hora Inicio *
                            </Label>
                            <Input
                                id="hora_inicio"
                                type="time"
                                value={formData.hora_inicio}
                                onChange={(e) => setFormData(prev => ({ ...prev, hora_inicio: e.target.value }))}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="hora_fin">
                                <Clock className="inline mr-1 h-4 w-4" />
                                Hora Fin *
                            </Label>
                            <Input
                                id="hora_fin"
                                type="time"
                                value={formData.hora_fin}
                                onChange={(e) => setFormData(prev => ({ ...prev, hora_fin: e.target.value }))}
                                required
                            />
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <Label htmlFor="notas">Notas</Label>
                        <Textarea
                            id="notas"
                            value={formData.notas}
                            onChange={(e) => setFormData(prev => ({ ...prev, notas: e.target.value }))}
                            placeholder="Notas adicionales sobre este horario..."
                            rows={2}
                        />
                    </div>

                    {/* Active Checkbox */}
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="activo"
                            checked={formData.activo}
                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, activo: !!checked }))}
                        />
                        <Label htmlFor="activo" className="font-normal cursor-pointer">
                            Horario activo
                        </Label>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end space-x-2 pt-4 border-t">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Guardando..." : (scheduleData ? "Actualizar" : "Guardar")}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
