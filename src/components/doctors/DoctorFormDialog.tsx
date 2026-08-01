/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */


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
import {
    Plus,
    Clock,
    Edit,
    Trash2,
    User,
    Stethoscope,
    Calendar,
    MapPin,
    Mail,
    Phone,
    Smartphone,
    Instagram,
    Activity,
    ShieldCheck,
    Info,
    GraduationCap,
    HeartPulse,
    Building2
} from "lucide-react";
import { DoctorScheduleDialog } from "@/components/doctors/DoctorScheduleDialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { HealthCenterSelect } from "./HealthCenterSelect";

interface DoctorFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    formData: any;
    setFormData: (data: any) => void;
    onSubmit: () => void;
    showTrigger?: boolean;
}

export function DoctorFormDialog({ open, onOpenChange, formData, setFormData, onSubmit, showTrigger = true }: DoctorFormDialogProps) {
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
        setEditingSchedule({
            health_center_id: formData.health_center_id || null,
        });
        setScheduleDialog(true);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {showTrigger && (
                <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 rounded-xl shadow-lg shadow-blue-500/20 transition-all">
                        <Plus className="mr-2 h-4 w-4" /> Nuevo Médico
                    </Button>
                </DialogTrigger>
            )}
            <DialogContent aria-describedby={undefined} className="max-w-4xl p-0 overflow-hidden border-none shadow-2xl rounded-3xl max-h-[90vh] flex flex-col">
                {/* Medical Header */}
                <div className="bg-gradient-to-br from-blue-600 to-blue-800 px-8 py-10 text-white relative overflow-hidden shrink-0">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <HeartPulse className="w-32 h-32" />
                    </div>
                    <div className="relative z-10 flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-background/10 backdrop-blur-xl border border-border/20 flex items-center justify-center shadow-inner">
                            <Stethoscope className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <DialogTitle className="text-3xl font-black tracking-tight text-white mb-1">
                                {formData?.id ? 'Ficha Médica Digital' : 'Alta de Facultativo'}
                            </DialogTitle>
                            <p className="text-blue-100/70 font-bold text-sm uppercase tracking-widest">
                                Gestión de Profesionales de la Salud 🩺
                            </p>
                        </div>
                    </div>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col w-full min-h-0">
                    <div className="px-8 pt-4 pb-2 border-b border-border/40 shrink-0 bg-background">
                        <TabsList className="w-full grid grid-cols-2 md:grid-cols-4 bg-muted/50 p-1 rounded-xl">
                            <TabsTrigger value="personal" className="rounded-lg font-bold text-[11px] uppercase tracking-wider flex items-center gap-2">
                                <User className="w-3.5 h-3.5" /> <span className="hidden md:inline">Datos Personales</span><span className="md:hidden">Personal</span>
                            </TabsTrigger>
                            <TabsTrigger value="professional" className="rounded-lg font-bold text-[11px] uppercase tracking-wider flex items-center gap-2">
                                <GraduationCap className="w-3.5 h-3.5" /> <span className="hidden md:inline">Especialidad</span><span className="md:hidden">Espec.</span>
                            </TabsTrigger>
                            <TabsTrigger value="location" className="rounded-lg font-bold text-[11px] uppercase tracking-wider flex items-center gap-2">
                                <Clock className="w-3.5 h-3.5" /> <span className="hidden md:inline">Horarios & Clínicas</span><span className="md:hidden">Horarios</span>
                            </TabsTrigger>
                            <TabsTrigger value="tracking" className="rounded-lg font-bold text-[11px] uppercase tracking-wider flex items-center gap-2">
                                <Activity className="w-3.5 h-3.5" /> <span className="hidden md:inline">Seguimiento</span><span className="md:hidden">Seguim.</span>
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="px-8 py-6 overflow-y-auto custom-scrollbar flex-1 bg-card">
                            {/* Tab 1: Información Personal */}
                            <TabsContent value="personal" className="m-0 space-y-8 mt-0 animate-in fade-in slide-in-from-right-2">
                                <section className="space-y-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-1.5 h-6 bg-blue-600 rounded-full text-white" />
                                        <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Identificación Básica</h3>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Nombre Completo *</Label>
                                        <div className="relative group">
                                            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500/50 group-hover:text-blue-600 transition-colors" />
                                            <Input
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                placeholder="Ej: Dr. Juan Pérez"
                                                className="h-12 pl-10 border-border rounded-xl font-bold focus:ring-blue-500/10"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Fecha de Nacimiento</Label>
                                            <div className="relative group">
                                                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500/50" />
                                                <Input
                                                    type="date"
                                                    value={formData.birth_date}
                                                    onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                                                    className="h-12 pl-10 border-border rounded-xl font-bold"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Correo Institucional</Label>
                                            <div className="relative group">
                                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500/50" />
                                                <Input
                                                    type="email"
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                    placeholder="doctor@medical.com"
                                                    className="h-12 pl-10 border-border rounded-xl font-bold"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Teléfono Consultorio</Label>
                                            <div className="relative group">
                                                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500/50" />
                                                <Input
                                                    value={formData.phone}
                                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                    placeholder="+58 212 1234567"
                                                    className="h-12 pl-10 border-border rounded-xl font-bold"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Móvil Personal</Label>
                                            <div className="relative group">
                                                <Smartphone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500/50" />
                                                <Input
                                                    value={formData.mobile}
                                                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                                                    placeholder="+58 414 1234567"
                                                    className="h-12 pl-10 border-border rounded-xl font-bold"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Perfil Académico / Social</Label>
                                        <div className="relative group">
                                            <Instagram className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-pink-500/50" />
                                            <Input
                                                value={formData.instagram}
                                                onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                                                placeholder="@tu_usuario_medico"
                                                className="h-12 pl-10 border-border rounded-xl font-bold"
                                            />
                                        </div>
                                    </div>
                                </section>
                            </TabsContent>

                            {/* Tab 2: Información Profesional */}
                            <TabsContent value="professional" className="m-0 space-y-8 mt-0 animate-in fade-in slide-in-from-right-2">
                                <section className="space-y-8">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-1.5 h-6 bg-blue-600 rounded-full text-white" />
                                        <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Credenciales Médicas</h3>
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Centro de Salud Principal</Label>
                                        <HealthCenterSelect 
                                            value={formData.health_center_id}
                                            fallbackName={formData.health_center || undefined}
                                            onValueChange={(id, name) => setFormData({ 
                                                ...formData, 
                                                health_center_id: id,
                                                health_center: name 
                                            })}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Especialidad Principal</Label>
                                        <Select
                                            value={formData.specialty_id || undefined}
                                            onValueChange={(v) => {
                                                setFormData({ ...formData, specialty_id: v })
                                            }}
                                        >
                                            <SelectTrigger className="h-14 rounded-2xl border-border font-bold bg-muted shadow-inner">
                                                <SelectValue placeholder="Seleccione especialidad" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-2xl border-none shadow-2xl">
                                                {specialties.length === 0 ? (
                                                    <div className="py-2 px-4 text-sm text-muted-foreground ">
                                                        Cargando especialidades...
                                                    </div>
                                                ) : (
                                                    specialties.filter(s => s.id && s.id !== '').map((s) => (
                                                        <SelectItem key={s.id} value={s.id} className="font-bold py-3">
                                                            🌟 {s.name}
                                                        </SelectItem>
                                                    ))
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Registro MSDS</Label>
                                            <div className="relative group">
                                                <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500/50" />
                                                <Input
                                                    value={formData.msds}
                                                    onChange={(e) => setFormData({ ...formData, msds: e.target.value })}
                                                    placeholder="Número MSDS"
                                                    className="h-12 pl-10 border-border rounded-xl font-mono font-bold"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Código Colegio Médico (CM)</Label>
                                            <div className="relative group">
                                                <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500/50" />
                                                <Input
                                                    value={formData.cm}
                                                    onChange={(e) => setFormData({ ...formData, cm: e.target.value })}
                                                    placeholder="Código CM"
                                                    className="h-12 pl-10 border-border rounded-xl font-mono font-bold"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-4 border-t border-border">
                                        <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1 tracking-[0.2em]">Potencial de Recetado</Label>
                                        <div className="flex gap-3">
                                            {['Alto', 'Medio', 'Bajo'].map((p) => (
                                                <button
                                                    key={p}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, potential: p })}
                                                    className={`flex-1 py-4 rounded-2xl border-2 font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-sm ${formData.potential === p
                                                        ? 'bg-blue-600 border-blue-600 text-white shadow-blue-500/20'
                                                        : 'bg-card border-border text-muted-foreground hover:border-blue-100'
                                                        }`}
                                                >
                                                    {p}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </section>
                            </TabsContent>

                            {/* Tab 3: Ubicación y Horario */}
                            <TabsContent value="location" className="m-0 space-y-8 mt-0 animate-in fade-in slide-in-from-right-2">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-6 bg-blue-600 rounded-full text-white" />
                                        <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Centros de Trabajo</h3>
                                    </div>
                                    <Button
                                        onClick={handleAddSchedule}
                                        disabled={!formData.id}
                                        className="bg-blue-600 hover:bg-blue-700 h-9 rounded-lg font-bold text-xs uppercase tracking-wider text-white"
                                    >
                                        <Plus className="mr-2 h-3.5 w-3.5" />
                                        Añadir Sede
                                    </Button>
                                </div>

                                {!formData.id ? (
                                    <div className="bg-muted border-2 border-dashed border-border rounded-3xl p-12 text-center space-y-4">
                                        <div className="w-16 h-16 bg-muted rounded-2xl shadow-sm flex items-center justify-center mx-auto">
                                            <Info className="w-8 h-8 text-blue-300" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="font-bold text-foreground">Configuración Requerida</p>
                                            <p className="text-xs text-muted-foreground max-w-[200px] mx-auto">Guarda el perfil básico del médico primero para gestionar sus horarios y sedes.</p>
                                        </div>
                                    </div>
                                ) : schedules.length === 0 ? (
                                    <div className="bg-muted border-2 border-dashed border-border rounded-3xl p-12 text-center space-y-4">
                                        <div className="w-16 h-16 bg-muted rounded-2xl shadow-sm flex items-center justify-center mx-auto">
                                            <MapPin className="w-8 h-8 text-blue-300" />
                                        </div>
                                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest text-center">Sin sedes registradas</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {schedules.map((schedule) => (
                                            <div key={schedule.id} className="group flex items-center justify-between p-4 bg-card border border-border rounded-2xl hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/5 transition-all">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-slate-900">
                                                        <Building2 className="w-5 h-5 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-foreground">{schedule.health_centers?.name || schedule.direccion || 'Sin ubicación'}</h4>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <Badge variant="outline" className="text-[9px] font-black uppercase tracking-tight border-border text-muted-foreground px-1.5 py-0">
                                                                {schedule.dias_atencion}
                                                            </Badge>
                                                            <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-bold">
                                                                <Clock className="h-2.5 w-2.5" />
                                                                {schedule.hora_inicio} - {schedule.hora_fin}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Button variant="ghost" size="icon" onClick={() => handleEditSchedule(schedule)} className="h-8 w-8 text-muted-foreground hover:text-blue-600">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => handleDeleteSchedule(schedule.id)} className="h-8 w-8 text-muted-foreground hover:text-rose-600">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
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
                            <TabsContent value="tracking" className="m-0 space-y-8 mt-0 animate-in fade-in slide-in-from-right-2">
                                <section className="space-y-8">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-6 bg-blue-600 rounded-full text-white" />
                                        <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Control de Visitas</h3>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Última Gestión / Contacto</Label>
                                            <Input
                                                type="date"
                                                value={formData.last_visit}
                                                onChange={(e) => setFormData({ ...formData, last_visit: e.target.value })}
                                                className="h-14 rounded-2xl border-border font-bold bg-muted shadow-inner"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Estatus Profesional</Label>
                                            <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                                                <SelectTrigger className="h-14 rounded-2xl border-border font-bold bg-muted shadow-inner">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-2xl border-none shadow-2xl">
                                                    <SelectItem value="Activo" className="font-bold text-emerald-600 py-3">🟢 ACTIVO (VISITABLE)</SelectItem>
                                                    <SelectItem value="Inactivo" className="font-bold text-muted-foreground py-3">⚪ INACTIVO / PASIVO</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1 tracking-[0.2em]">Observaciones Estratégicas</Label>
                                        <Textarea
                                            value={formData.observations}
                                            onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                                            placeholder="Describa perfil psicológico, preferencias de receta, influencias..."
                                            className="min-h-[220px] rounded-2xl border-border font-medium p-6 resize-none focus:ring-blue-500/10 shadow-inner"
                                        />
                                    </div>
                                </section>
                            </TabsContent>
                        </div>
                </Tabs>

                <div className="bg-muted border-t border-border px-8 py-6 flex items-center justify-between gap-4 shrink-0">
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        className="h-12 px-6 font-bold text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl"
                    >
                        Descartar
                    </Button>
                    <Button
                        onClick={onSubmit}
                        className="h-12 px-10 bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-800 hover:to-indigo-900 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-2xl shadow-blue-500/30 transition-all hover:scale-[1.02]"
                    >
                        {formData?.id ? 'Actualizar Ficha' : 'Crear Ficha Médica'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog >
    );
}
