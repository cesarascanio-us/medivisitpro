import { useState, useEffect, useRef } from "react";
// Sync trigger for Vercel deployment
import { InstructionCard } from "@/components/ui/InstructionCard";
import { Plus, UserRound, Phone, Mail, MapPin, Search, Stethoscope, Building, Download, Upload, Printer, HelpCircle, FileSpreadsheet, Trash2, Pencil, Lightbulb, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { exportToCSV, handlePrint } from "@/utils/exportUtils";
import * as XLSX from 'xlsx';
import { DoctorFormDialog } from "@/components/doctors/DoctorFormDialog";
import { DoctorProfileDialog } from "@/components/doctors/DoctorProfileDialog";
import { AdminDataFilter } from "@/components/admin/AdminDataFilter";
import { getStatesInRegion } from "@/constants/regions";
import { useDemoData } from "@/contexts/MockDataProvider";

interface AdminFilterState {
    region?: string;
    state?: string;
    zoneId?: string;
    repId?: string;
}

interface Doctor {
    id: string;
    user_id: string;
    representative_id: string | null;

    // Información personal
    name: string;
    birth_date: string | null;
    phone: string | null;
    mobile: string | null;
    email: string | null;

    // Información profesional
    specialty: string | null; // Legacy
    specialty_id: string | null;
    specialties: { name: string } | null;
    msds: string | null;
    cm: string | null;

    // Ubicación
    address: string | null;
    location: string | null;
    city: string | null;
    state: string | null;
    health_center: string | null;

    // Horario
    days: string | null;
    start_time: string | null;
    end_time: string | null;

    // Clasificación
    potential: 'Alto' | 'Medio' | 'Bajo' | null;

    // Seguimiento
    observations: string | null;
    last_visit: string | null;
    status: 'Activo' | 'Inactivo';

    // Redes sociales
    instagram: string | null;

    // Campos legacy
    notes: string | null;
    priority: string | null;

    // Metadata
    created_at: string;
    updated_at: string;
}

export default function Doctors() {
    const { user, canViewAllData, isSupervisor, zoneId } = useAuth();
    const { toast } = useToast();
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [importing, setImporting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
    const [adminFilters, setAdminFilters] = useState<AdminFilterState>({});

    // Demo mode hook - provides mock data when in demo mode
    const demoData = useDemoData();

    const [formData, setFormData] = useState({
        // Personal
        id: "",
        user_id: "",
        name: "",
        birth_date: "",
        phone: "",
        mobile: "",
        email: "",

        // Profesional
        specialty: "",
        specialty_id: "",
        msds: "",
        cm: "",

        // Ubicación
        address: "",
        location: "",
        city: "",
        state: "",
        health_center: "",

        // Horario
        days: "",
        start_time: "",
        end_time: "",

        // Clasificación
        potential: "Medio" as 'Alto' | 'Medio' | 'Bajo',

        // Seguimiento
        observations: "",
        last_visit: "",
        status: "Activo" as 'Activo' | 'Inactivo',

        // Redes
        instagram: "",

        // Legacy
        notes: "",
        priority: "medium",

        // Referencias
        representative_id: null as string | null
    });

    useEffect(() => {
        if (user) loadDoctors();
    }, [user, adminFilters]); // Reload when filters change

    const loadDoctors = async () => {
        try {
            setLoading(true);

            // DEMO MODE: Use mock data instead of Supabase
            if (demoData) {
                console.log("Doctors: Using mock demo data");
                setDoctors(demoData.doctors as unknown as Doctor[]);
                setLoading(false);
                return;
            }

            let query: any = supabase
                .from('doctors')
                .select('*, specialties(name)');

            // Security and Filtering Logic using AdminFilterState
            if (isSupervisor && zoneId) {
                // Supervisor: Base scope is their zone, but AdminFilter can refine it
                if (adminFilters.repId && adminFilters.repId !== 'all') {
                    query = query.or(`representative_id.eq.${adminFilters.repId},user_id.eq.${adminFilters.repId}`);
                } else if (adminFilters.zoneId && adminFilters.zoneId !== 'all') {
                    query = query.eq('zone_id', adminFilters.zoneId);
                } else if (adminFilters.state && adminFilters.state !== 'all') {
                    query = query.ilike('state', `%${adminFilters.state}%`);
                } else {
                    // Default to assigned zone
                    // @ts-ignore
                    query = query.eq('zone_id', zoneId);
                }
            } else if (!canViewAllData) {
                // Representative: Restricted to their own data
                query = query.or(`representative_id.eq.${user.id},user_id.eq.${user.id}`);
            } else {
                // Master/Manager: Full access narrowed by admin filters
                if (adminFilters.repId && adminFilters.repId !== 'all') {
                    query = query.or(`representative_id.eq.${adminFilters.repId},user_id.eq.${adminFilters.repId}`);
                } else if (adminFilters.zoneId && adminFilters.zoneId !== 'all') {
                    query = query.eq('zone_id', adminFilters.zoneId);
                } else if (adminFilters.state && adminFilters.state !== 'all') {
                    query = query.ilike('state', `%${adminFilters.state}%`);
                } else if (adminFilters.region && adminFilters.region !== 'all') {
                    const states = getStatesInRegion(adminFilters.region);
                    if (states.length > 0) {
                        query = query.in('state', states);
                    }
                }
            }

            const { data, error } = await query.order('name', { ascending: true });

            if (error) throw error;

            // Safeguard: Ensure we only set doctors that are objects and have a name
            // This prevents crashes in the filter logic below if the DB returns corrupt partial data
            const validDoctors = (data || []).filter((d: any) => d && typeof d === 'object' && d.name);
            setDoctors(validDoctors);
        } catch (error) {
            console.error('Error loading doctors:', error);
            // On error, set empty to ensure UI renders "No doctors" or empty state instead of crashing
            setDoctors([]);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (doctor: Doctor) => {
        setFormData({
            id: doctor.id,
            user_id: doctor.user_id,
            representative_id: doctor.representative_id,
            name: doctor.name,
            birth_date: doctor.birth_date || "",
            phone: doctor.phone || "",
            mobile: doctor.mobile || "",
            email: doctor.email || "",
            specialty: doctor.specialty || "",
            specialty_id: doctor.specialty_id || "",
            msds: doctor.msds || "",
            cm: doctor.cm || "",
            address: doctor.address || "",
            location: doctor.location || "",
            city: doctor.city || "",
            state: doctor.state || "",
            health_center: doctor.health_center || "",
            days: doctor.days || "",
            start_time: doctor.start_time || "",
            end_time: doctor.end_time || "",
            potential: doctor.potential || "Medio",
            observations: doctor.observations || "",
            last_visit: doctor.last_visit || "",
            status: doctor.status || "Activo",
            instagram: doctor.instagram || "",
            notes: doctor.notes || "",
            priority: doctor.priority || "medium",
        });
        setDialogOpen(true);
    };

    const handleSubmit = async () => {
        if (!user || !formData.name) {
            toast({ title: "Error", description: "El nombre es obligatorio.", variant: "destructive" });
            return;
        }

        try {
            const dataToSave = {
                user_id: user.id,
                representative_id: formData.representative_id,
                name: formData.name,
                birth_date: formData.birth_date || null,
                phone: formData.phone || null,
                mobile: formData.mobile || null,
                email: formData.email || null,
                specialty: formData.specialty || null,
                specialty_id: formData.specialty_id || null,
                msds: formData.msds || null,
                cm: formData.cm || null,
                address: formData.address || null,
                location: formData.location || null,
                city: formData.city || null,
                state: formData.state || null,
                health_center: formData.health_center || null,
                days: formData.days || null,
                start_time: formData.start_time || null,
                end_time: formData.end_time || null,
                potential: formData.potential || 'Medio',
                observations: formData.observations || null,
                last_visit: formData.last_visit || null,
                status: formData.status || 'Activo',
                instagram: formData.instagram || null,
            };

            let error;

            if (formData.id) {
                const { error: updateError } = await supabase
                    .from('doctors')
                    .update(dataToSave)
                    .eq('id', formData.id);
                error = updateError;
            } else {
                const { error: insertError } = await supabase
                    .from('doctors')
                    .insert(dataToSave);
                error = insertError;
            }

            if (error) throw error;

            toast({
                title: formData.id ? "Médico actualizado" : "Médico agregado",
                description: formData.id ? "Los datos se han actualizado correctamente." : "El médico ha sido registrado exitosamente."
            });
            setDialogOpen(false);

            // Reset form
            setFormData({
                id: "",
                name: "", birth_date: "", phone: "", mobile: "", email: "",
                specialty: "", specialty_id: "", msds: "", cm: "",
                address: "", location: "", city: "", state: "", health_center: "",
                days: "", start_time: "", end_time: "",
                potential: "Medio", observations: "", last_visit: "", status: "Activo",
                instagram: "", notes: "", priority: "medium", representative_id: null, user_id: ""
            });

            loadDoctors();
        } catch (error) {
            console.error('Error saving doctor:', error);
            toast({ title: "Error", description: "No se pudo guardar la información.", variant: "destructive" });
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const { error } = await supabase
                .from('doctors')
                .delete()
                .eq('id', id);

            if (error) throw error;
            toast({ title: "Médico eliminado", description: "El médico ha sido eliminado." });
            loadDoctors();
        } catch (error) {
            console.error('Error deleting doctor:', error);
            toast({ title: "Error", description: "No se pudo eliminar el médico.", variant: "destructive" });
        }
    };

    const triggerImport = () => {
        fileInputRef.current?.click();
    };

    const formatTimeForDB = (timeStr: any): string | null => {
        if (!timeStr) return null;
        try {
            // Handle Excel fractional days (e.g. 0.5 = 12:00)
            if (typeof timeStr === 'number') {
                const totalSeconds = Math.round(timeStr * 24 * 60 * 60);
                const hours = Math.floor(totalSeconds / 3600);
                const minutes = Math.floor((totalSeconds % 3600) / 60);
                return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
            }

            // Handle strings
            let cleanStr = String(timeStr).toLowerCase().trim();
            // Remove dots from a.m./p.m. -> am/pm
            cleanStr = cleanStr.replace(/\./g, '');
            // standardized space
            cleanStr = cleanStr.replace(/\s+/g, ' ');

            // Simple check matches 24h format HH:MM or HH:MM:SS
            if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(cleanStr)) {
                return cleanStr;
            }

            // Parse 12h format
            const timeParts = cleanStr.match(/(\d{1,2}):(\d{2})\s*(am|pm)?/);
            if (timeParts) {
                let hours = parseInt(timeParts[1]);
                let minutes = parseInt(timeParts[2]);
                const meridian = timeParts[3];

                if (meridian === 'pm' && hours < 12) hours += 12;
                if (meridian === 'am' && hours === 12) hours = 0;

                return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
            }
            return null;
        } catch (e) {
            return null;
        }
    };

    const formatDateForDB = (dateStr: any): string | null => {
        if (!dateStr) return null;
        try {
            // Excel serial date handling
            if (typeof dateStr === 'number') {
                const date = new Date((dateStr - (25567 + 2)) * 86400 * 1000);
                return date.toISOString().split('T')[0];
            }

            // Already ISO or Date object
            if (dateStr instanceof Date) return dateStr.toISOString().split('T')[0];

            const cleanStr = String(dateStr).trim();
            if (!cleanStr) return null;

            // Handle DD/MM/YYYY
            if (cleanStr.includes('/')) {
                const parts = cleanStr.split('/');
                // Assumption: DD/MM/YYYY or MM/DD/YYYY depending on locale, 
                // defaulting to DD/MM/YYYY for Latin America contexts usually
                if (parts.length === 3) {
                    // Check if first part > 12 -> definitely day (DD/MM/YYYY)
                    // or usually standard input is DD/MM/YYYY
                    return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
                }
            }

            // Try standard Date parse
            const date = new Date(cleanStr);
            if (!isNaN(date.getTime())) {
                return date.toISOString().split('T')[0];
            }
            return null;
        } catch (e) {
            return null;
        }
    };

    const formatPotentialForDB = (val: any): 'Alto' | 'Medio' | 'Bajo' | 'Medio' => {
        if (!val) return 'Medio';
        const str = String(val).toLowerCase().trim();

        if (str.includes('alto') || str.includes('alta') || str.includes('high') || str === 'a') return 'Alto';
        if (str.includes('bajo') || str.includes('baja') || str.includes('low') || str === 'c') return 'Bajo';

        return 'Medio';
    };

    const formatStatusForDB = (val: any): 'Activo' | 'Inactivo' | 'Activo' => {
        if (!val) return 'Activo';
        const str = String(val).toLowerCase().trim();

        if (str.includes('inactivo') || str.includes('inactive') || str === 'i' || str === 'false' || str === '0') return 'Inactivo';

        return 'Activo';
    };

    const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setImporting(true);

        try {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const data = new Uint8Array(e.target?.result as ArrayBuffer);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet);

                    if (!jsonData || jsonData.length === 0) {
                        throw new Error("El archivo está vacío o no tiene el formato correcto.");
                    }

                    const doctorsToInsert = jsonData.map((row: any) => ({
                        user_id: user?.id,
                        representative_id: row['ID Representante'] || row['id_representante'] || null,

                        // Personal
                        name: row['Nombre'] || row['nombre'] || row['Name'] || '',
                        birth_date: formatDateForDB(row['Fecha Nacimiento'] || row['fecha_nacimiento'] || row['Birth Date']),
                        phone: row['Telefono'] || row['telefono'] || row['Phone'] || null,
                        mobile: row['Movil'] || row['movil'] || row['Mobile'] || null,
                        email: row['Email'] || row['email'] || null,

                        // Profesional
                        specialty: row['Especialidad'] || row['especialidad'] || row['Specialty'] || null,
                        msds: row['MSDS'] || row['msds'] || null,
                        cm: row['CM'] || row['cm'] || null,

                        // Ubicación
                        address: row['Direccion'] || row['direccion'] || row['Address'] || null,
                        location: row['Ubicacion'] || row['ubicacion'] || row['Location'] || null,
                        city: row['Ciudad'] || row['ciudad'] || row['City'] || null,
                        state: row['Estado'] || row['estado'] || row['State'] || null,
                        health_center: row['Centro Salud'] || row['centro_salud'] || row['Health Center'] || null,

                        // Horario
                        days: row['Dias'] || row['dias'] || row['Days'] || null,
                        start_time: formatTimeForDB(row['Hora Inicio'] || row['hora_inicio'] || row['Start Time']),
                        end_time: formatTimeForDB(row['Hora Fin'] || row['hora_fin'] || row['End Time']),

                        // Clasificación
                        potential: formatPotentialForDB(row['Potencial'] || row['potencial'] || row['Potential']),

                        // Seguimiento
                        observations: row['Observaciones'] || row['observaciones'] || row['Observations'] || row['Notas'] || row['notas'] || row['Notes'] || null,
                        last_visit: formatDateForDB(row['Ultima Visita'] || row['ultima_visita'] || row['Last Visit']),
                        status: formatStatusForDB(row['Status'] || row['status'] || row['Estado']),

                        // Redes
                        instagram: row['Instagram'] || row['instagram'] || null,

                        // Legacy (removed from DB)
                        // notes: row['Notas'] || row['notas'] || row['Notes'] || null,
                        // priority: row['Prioridad'] || row['prioridad'] || row['Priority'] || 'medium'
                    })).filter(d => d.name);

                    if (doctorsToInsert.length === 0) {
                        throw new Error("No se encontraron médicos válidos para importar.");
                    }

                    const { error } = await supabase
                        .from('doctors')
                        .insert(doctorsToInsert);

                    if (error) throw error;

                    toast({
                        title: "Importación exitosa",
                        description: `Se han importado ${doctorsToInsert.length} médicos correctamente.`
                    });
                    loadDoctors();
                } catch (error: any) {
                    console.error("Import parsing error:", error);
                    toast({
                        title: "Error de Importación",
                        description: error.message || "Hubo un error al procesar el archivo.",
                        variant: "destructive"
                    });
                } finally {
                    setImporting(false);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                }
            };
            reader.readAsArrayBuffer(file);
        } catch (error) {
            console.error("File reading error:", error);
            setImporting(false);
        }
    };


    const getPriorityBadge = (priority: string | null) => {
        const styles: Record<string, string> = {
            high: "bg-red-100 text-red-800",
            medium: "bg-yellow-100 text-yellow-800",
            low: "bg-green-100 text-green-800"
        };
        const labels: Record<string, string> = {
            high: "Alta",
            medium: "Media",
            low: "Baja"
        };
        return <Badge className={styles[priority || 'medium']}>{labels[priority || 'medium']}</Badge>;
    };

    const filteredDoctors = doctors.filter(d =>
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        // Prioritize relation, fall back to legacy
        (d.specialties?.name || d.specialty || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.city?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const specialties = [...new Set(doctors.map(d => d.specialties?.name || d.specialty).filter(Boolean))];

    const [showHelp, setShowHelp] = useState(false);


    return (
        <div className="space-y-6">
            {/* Hidden File Input */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleImport}
                accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                className="hidden"
            />

            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                        <Stethoscope className="h-6 w-6 text-primary" />
                        Directorio Médico
                    </h1>
                    <p className="text-muted-foreground">Gestiona tus contactos médicos profesionales y sus especialidades</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => setShowHelp(!showHelp)} title="Ver Ayuda">
                        <span className="sr-only">Ayuda</span>
                        <Lightbulb className="h-5 w-5 text-yellow-500" />
                    </Button>
                </div>
            </div>

            {showHelp && (
                <InstructionCard
                    title="Gestión de Fichero Médico"
                    description="Aquí administras tu panel de médicos. Puedes filtrar, editar o agregar nuevos contactos."
                    items={[
                        "Usa el botón 'Nuevo Médico' para agregar un nuevo contacto.",
                        "Haz clic en 'Importar' para cargar masivamente desde Excel.",
                        "Usa los filtros avanzados si eres supervisor para ver datos de tu equipo."
                    ]}
                />
            )}

            {/* Admin Data Filter for Master/Manager */}
            <AdminDataFilter
                onFilterChange={(filters) => setAdminFilters(filters)}
                moduleType="doctors"
            />

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="medical-card">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground font-medium">Total Médicos</p>
                                <p className="text-2xl font-bold text-foreground">{doctors.length}</p>
                            </div>
                            <UserRound className="h-8 w-8 text-primary opacity-20" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="medical-card">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground font-medium">Especialidades</p>
                                <p className="text-2xl font-bold text-foreground">{specialties.length}</p>
                            </div>
                            <Stethoscope className="h-8 w-8 text-primary opacity-20" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="medical-card">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground font-medium">Alta Prioridad</p>
                                <p className="text-2xl font-bold text-red-600">{doctors.filter(d => d.priority === 'high').length}</p>
                            </div>
                            <AlertCircle className="h-8 w-8 text-destructive opacity-20" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Action Bar */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Buscar por nombre, especialidad o ciudad..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
                </div>

                <div className="flex items-center gap-2">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" title="Ayuda de Importación">
                                <HelpCircle className="h-5 w-5 text-muted-foreground" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Estructura de Archivo para Importación</DialogTitle>
                                <DialogDescription>
                                    Para importar médicos, utiliza un archivo Excel (.xlsx) o CSV con las siguientes columnas.
                                    La primera fila debe contener los encabezados exactos.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="border rounded-md overflow-hidden max-h-[60vh] overflow-y-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Columna</TableHead>
                                            <TableHead>Descripción</TableHead>
                                            <TableHead>Ejemplo</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell className="font-medium">Nombre</TableCell>
                                            <TableCell>Nombre completo (Obligatorio)</TableCell>
                                            <TableCell>Dr. Juan Pérez</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-medium">Fecha Nacimiento</TableCell>
                                            <TableCell>Fecha de nacimiento</TableCell>
                                            <TableCell>1980-05-15</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-medium">Telefono</TableCell>
                                            <TableCell>Teléfono fijo</TableCell>
                                            <TableCell>+58 212 1234567</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-medium">Movil</TableCell>
                                            <TableCell>Teléfono móvil</TableCell>
                                            <TableCell>+58 414 1234567</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-medium">Email</TableCell>
                                            <TableCell>Correo electrónico</TableCell>
                                            <TableCell>doctor@hospital.com</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-medium">Especialidad</TableCell>
                                            <TableCell>Especialidad médica</TableCell>
                                            <TableCell>Cardiología</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-medium">MSDS</TableCell>
                                            <TableCell>Código MSDS</TableCell>
                                            <TableCell>12345</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-medium">CM</TableCell>
                                            <TableCell>Código CM</TableCell>
                                            <TableCell>CM-678</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-medium">Direccion</TableCell>
                                            <TableCell>Dirección completa</TableCell>
                                            <TableCell>Av. Principal, Torre Médica</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-medium">Ubicacion</TableCell>
                                            <TableCell>Zona o sector</TableCell>
                                            <TableCell>Chacao</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-medium">Ciudad</TableCell>
                                            <TableCell>Ciudad</TableCell>
                                            <TableCell>Caracas</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-medium">Estado</TableCell>
                                            <TableCell>Estado/Región</TableCell>
                                            <TableCell>Miranda</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-medium">Centro Salud</TableCell>
                                            <TableCell>Centro de salud donde trabaja</TableCell>
                                            <TableCell>Hospital Central</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-medium">Dias</TableCell>
                                            <TableCell>Días de atención</TableCell>
                                            <TableCell>Lunes a Viernes</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-medium">Hora Inicio</TableCell>
                                            <TableCell>Hora de inicio</TableCell>
                                            <TableCell>08:00</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-medium">Hora Fin</TableCell>
                                            <TableCell>Hora de fin</TableCell>
                                            <TableCell>17:00</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-medium">Potencial</TableCell>
                                            <TableCell>Potencial de negocio</TableCell>
                                            <TableCell>Alto, Medio, Bajo</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-medium">Observaciones</TableCell>
                                            <TableCell>Notas y observaciones</TableCell>
                                            <TableCell>Prefiere productos X</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-medium">Ultima Visita</TableCell>
                                            <TableCell>Fecha de última visita</TableCell>
                                            <TableCell>2024-12-15</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-medium">Status</TableCell>
                                            <TableCell>Estado</TableCell>
                                            <TableCell>Activo, Inactivo</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-medium">Instagram</TableCell>
                                            <TableCell>Usuario de Instagram</TableCell>
                                            <TableCell>@dr_juanperez</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </div>
                        </DialogContent>
                    </Dialog>

                    <Button variant="outline" onClick={() => exportToCSV(filteredDoctors, 'medicos')} title="Exportar a CSV">
                        <Download className="h-4 w-4 md:mr-2" />
                        <span className="hidden md:inline">Exportar</span>
                    </Button>

                    <Button variant="outline" onClick={triggerImport} disabled={importing} title="Importar desde Excel">
                        {importing ? <FileSpreadsheet className="h-4 w-4 animate-pulse md:mr-2" /> : <Upload className="h-4 w-4 md:mr-2" />}
                        <span className="hidden md:inline">{importing ? "Importando..." : "Importar"}</span>
                    </Button>

                    <Button variant="outline" onClick={handlePrint} className="hidden sm:flex" title="Imprimir Listado">
                        <Printer className="h-4 w-4 md:mr-2" />
                        <span className="hidden md:inline">Imprimir</span>
                    </Button>

                    <Button className="btn-medical" onClick={() => {
                        setFormData({
                            id: "", name: "", birth_date: "", phone: "", mobile: "", email: "",
                            specialty: "", specialty_id: "", msds: "", cm: "",
                            address: "", location: "", city: "", state: "", health_center: "",
                            days: "", start_time: "", end_time: "",
                            potential: "Medio", observations: "", last_visit: "", status: "Activo",
                            instagram: "", notes: "", priority: "medium", representative_id: null, user_id: ""
                        });
                        setDialogOpen(true);
                    }}>
                        <Plus className="h-4 w-4 md:mr-2" />
                        <span className="hidden md:inline">Nuevo Médico</span>
                    </Button>
                </div>
            </div>

            {/* List */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : filteredDoctors.length === 0 ? (
                <Card className="medical-card">
                    <CardContent className="text-center py-12">
                        <UserRound className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">No hay médicos registrados</h3>
                        <p className="text-muted-foreground mb-4">Agrega tu primer contacto médico</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredDoctors.map((doctor) => (
                        <Card key={doctor.id} className="medical-card hover:shadow-lg transition-all duration-200 group flex flex-col">
                            <CardHeader className="pb-3 px-6 pt-6">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <CardTitle className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">{doctor.name}</CardTitle>
                                        {(doctor.specialties?.name || doctor.specialty) && (
                                            <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                                                {doctor.specialties?.name || doctor.specialty}
                                            </Badge>
                                        )}
                                    </div>
                                    {getPriorityBadge(doctor.priority)}
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3 px-6 pb-6 flex-1">
                                {doctor.address && (
                                    <div className="flex items-start text-sm text-muted-foreground">
                                        <MapPin className="mr-2 h-4 w-4 mt-0.5 text-primary/60" />
                                        <span className="line-clamp-2">{doctor.address}</span>
                                    </div>
                                )}
                                {doctor.city && !doctor.address && (
                                    <div className="flex items-center text-sm text-muted-foreground">
                                        <Building className="mr-2 h-4 w-4 text-primary/60" />
                                        {doctor.city}
                                    </div>
                                )}
                                {doctor.phone && (
                                    <div className="flex items-center text-sm text-muted-foreground">
                                        <Phone className="mr-2 h-4 w-4 text-primary/60" />
                                        {doctor.phone}
                                    </div>
                                )}
                                {doctor.email && (
                                    <div className="flex items-center text-sm text-muted-foreground">
                                        <Mail className="mr-2 h-4 w-4 text-primary/60" />
                                        <span className="truncate">{doctor.email}</span>
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter className="flex justify-between gap-2 px-6 py-4 bg-muted/30 border-t group-hover:bg-muted/50 transition-colors">
                                <Button variant="outline" size="sm" className="flex-1 bg-background" onClick={() => { setSelectedDoctor(doctor); setProfileOpen(true); }}>
                                    <UserRound className="h-4 w-4 mr-2" />
                                    Perfil
                                </Button>
                                <div className="flex gap-1">
                                    <Button variant="ghost" size="sm" onClick={() => handleEdit(doctor)} className="hover:bg-primary/10 hover:text-primary">
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 hover:text-destructive">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Esta acción no se puede deshacer. Se eliminará permanentemente al Dr. {doctor.name}.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDelete(doctor.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors">
                                                    Eliminar
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}

            <DoctorFormDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleSubmit}
            />

            <DoctorProfileDialog
                open={profileOpen}
                onOpenChange={setProfileOpen}
                doctor={selectedDoctor}
            />
        </div>
    );
}
