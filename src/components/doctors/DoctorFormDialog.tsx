import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Clock, Edit, Trash2 } from "lucide-react";
import { DoctorScheduleDialog } from "@/components/doctors/DoctorScheduleDialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface DoctorFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    formData: any;
    setFormData: (data: any) => void;
    onSubmit: () => void;
}

export function DoctorFormDialog({ open, onOpenChange, formData, setFormData, onSubmit }: DoctorFormDialogProps) {
    const [activeTab, setActiveTab] = useState("personal");
    const [schedules, setSchedules] = useState<any[]>([]);
    const [specialties, setSpecialties] = useState<any[]>([]);
    const [scheduleDialog, setScheduleDialog] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState<any>(null);
    const { user } = useAuth();
    const { toast } = useToast();

    useEffect(() => {
        if (open) {
            loadSpecialties();
        }
        if (formData.id && open) {
            loadSchedules();
        }
    }, [formData.id, open]);

    const loadSpecialties = async () => {
        try {
            const { data, error } = await supabase
                .from('specialties')
                .select('*')
                .order('name');
            
            if (error) throw error;
            setSpecialties(data || []);
        } catch (error: any) {
            console.error('Error loading specialties:', error);
            toast({
                title: "Error",
                description: "No se pudieron cargar las especialidades",
                variant: "destructive"
            });
        }
    };

    const loadSchedules = async () => {
        if (!formData.id) return;
        const { data, error } = await supabase
            .from('doctor_schedules')
            .select(`
                *,
                health_centers (name)
            `)
            .eq('doctor_id', formData.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error loading schedules:', error);
            return;
        }
        setSchedules(data || []);
    };

    const handleDeleteSchedule = async (id: string) => {
        const { error } = await supabase
            .from('doctor_schedules')
            .delete()
            .eq('id', id);

        if (error) {
            toast({ title: "Error", description: "No se pudo eliminar el horario", variant: "destructive" });
            return;
        }

        toast({ title: "Eliminado", description: "Horario eliminado correctamente" });
        loadSchedules();
    };

    const handleEditSchedule = (schedule: any) => {
        setEditingSchedule(schedule);
        setScheduleDialog(true);
    };

    const handleAddSchedule = () => {
        setEditingSchedule(null);
        setScheduleDialog(true);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                <Button className="btn-medical">
                    <Plus className="mr-2 h-4 w-4" /> Nuevo Médico
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{formData?.id ? 'Editar Médico' : 'Agregar Médico'}</DialogTitle>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="personal">Personal</TabsTrigger>
                        <TabsTrigger value="professional">Profesional</TabsTrigger>
                        <TabsTrigger value="location">Ubicación/Horario</TabsTrigger>
                        <TabsTrigger value="tracking">Seguimiento</TabsTrigger>
                    </TabsList>

                    {/* Tab 1: Información Personal */}
                    <TabsContent value="personal" className="space-y-4 mt-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2 space-y-2">
                                <Label>Nombre Completo *</Label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Dr. Juan Pérez"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Fecha de Nacimiento</Label>
                                <Input
                                    type="date"
                                    value={formData.birth_date}
                                    onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Email</Label>
                                <Input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="doctor@hospital.com"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Teléfono</Label>
                                <Input
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="+58 212 1234567"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Móvil</Label>
                                <Input
                                    value={formData.mobile}
                                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                                    placeholder="+58 414 1234567"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Instagram</Label>
                            <Input
                                value={formData.instagram}
                                onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                                placeholder="@dr_juanperez"
                            />
                        </div>
                    </TabsContent>

                    {/* Tab 2: Información Profesional */}
                    <TabsContent value="professional" className="space-y-4 mt-4">
                        <div className="space-y-2">
                            <Label>Especialidad</Label>
                            <Select
                                value={formData.specialty_id || undefined}
                                onValueChange={(v) => {
                                    setFormData({ ...formData, specialty_id: v })
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccione especialidad" />
                                </SelectTrigger>
                                <SelectContent>
                                    {specialties.length === 0 ? (
                                        <div className="py-2 px-4 text-sm text-muted-foreground">
                                            Cargando especialidades...
                                        </div>
                                    ) : (
                                        specialties.map((s) => (
                                            <SelectItem key={s.id} value={s.id}>
                                                {s.name}
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>MSDS</Label>
                                <Input
                                    value={formData.msds}
                                    onChange={(e) => setFormData({ ...formData, msds: e.target.value })}
                                    placeholder="Número MSDS"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>CM</Label>
                                <Input
                                    value={formData.cm}
                                    onChange={(e) => setFormData({ ...formData, cm: e.target.value })}
                                    placeholder="Código CM"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Potencial</Label>
                            <Select value={formData.potential} onValueChange={(v) => setFormData({ ...formData, potential: v })}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Alto">Alto</SelectItem>
                                    <SelectItem value="Medio">Medio</SelectItem>
                                    <SelectItem value="Bajo">Bajo</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </TabsContent>

                    {/* Tab 3: Ubicación y Horario */}
                    <TabsContent value="location" className="space-y-4 mt-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-medium">Horarios de Atención</h3>
                                <p className="text-sm text-muted-foreground">
                                    Gestiona las ubicaciones y horarios del médico
                                </p>
                            </div>
                            <Button
                                onClick={handleAddSchedule}
                                disabled={!formData.id}
                                size="sm"
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Agregar Ubicación
                            </Button>
                        </div>

                        {!formData.id && (
                            <div className="text-center py-8 text-muted-foreground bg-muted/50 rounded-lg">
                                Guarda el médico primero para agregar horarios
                            </div>
                        )}

                        {formData.id && schedules.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground bg-muted/50 rounded-lg">
                                No hay horarios registrados. Haz clic en "Agregar Ubicación" para comenzar.
                            </div>
                        )}

                        {formData.id && schedules.length > 0 && (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Ubicación</TableHead>
                                        <TableHead>Días</TableHead>
                                        <TableHead>Horario</TableHead>
                                        <TableHead>Estado</TableHead>
                                        <TableHead className="text-right">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {schedules.map((schedule) => (
                                        <TableRow key={schedule.id}>
                                            <TableCell>
                                                <div>
                                                    {schedule.health_centers?.name || schedule.direccion || 'Sin ubicación'}
                                                    {schedule.ciudad && (
                                                        <div className="text-sm text-muted-foreground">
                                                            {schedule.ciudad}, {schedule.estado}
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>{schedule.dias_atencion}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center">
                                                    <Clock className="mr-1 h-3 w-3" />
                                                    {schedule.hora_inicio} - {schedule.hora_fin}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={schedule.activo ? "default" : "secondary"}>
                                                    {schedule.activo ? "Activo" : "Inactivo"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEditSchedule(schedule)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDeleteSchedule(schedule.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}

                        {/* Schedule Dialog */}
                        {formData.id && (
                            <DoctorScheduleDialog
                                open={scheduleDialog}
                                onOpenChange={setScheduleDialog}
                                doctorId={formData.id}
                                scheduleData={editingSchedule}
                                onSaved={() => {
                                    loadSchedules();
                                    setScheduleDialog(false);
                                    setEditingSchedule(null);
                                }}
                            />
                        )}
                    </TabsContent>

                    {/* Tab 4: Seguimiento */}
                    <TabsContent value="tracking" className="space-y-4 mt-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Última Visita</Label>
                                <Input
                                    type="date"
                                    value={formData.last_visit}
                                    onChange={(e) => setFormData({ ...formData, last_visit: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Status</Label>
                                <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Activo">Activo</SelectItem>
                                        <SelectItem value="Inactivo">Inactivo</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Observaciones</Label>
                            <Textarea
                                value={formData.observations}
                                onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                                placeholder="Notas sobre el médico, preferencias, etc..."
                                rows={6}
                            />
                        </div>
                    </TabsContent>
                </Tabs>

                <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button onClick={onSubmit} className="btn-medical">
                        {formData?.id ? 'Guardar Cambios' : 'Guardar Médico'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog >
    );
}
