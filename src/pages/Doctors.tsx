import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  Plus, UserRound, Phone, Mail, MapPin, Search, Stethoscope, 
  Building, Download, Upload, Trash2, Pencil, AlertCircle, Calendar, 
  ClipboardCheck, RefreshCw, Filter, MoreVertical, Star
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { exportToCSV } from "@/utils/exportUtils";
import { DoctorFormDialog } from "@/components/doctors/DoctorFormDialog";
import { DoctorProfileDialog } from "@/components/doctors/DoctorProfileDialog";
import { AdminDataFilter } from "@/components/admin/AdminDataFilter";
import { getStatesInRegion } from "@/constants/regions";
import { useDemoData } from "@/contexts/MockDataProvider";
import { EliteKPICard, EliteHeader, EliteTable, EliteButton } from "@/components/layout/DesignSystem";
import { useTheme } from "@/context/ThemeContext";

interface AdminFilterState {
    region?: string;
    state?: string;
    zoneId?: string;
    userId?: string;
}

interface Doctor {
    id: string;
    user_id: string;
    representative_id: string | null;
    name: string;
    birth_date: string | null;
    phone: string | null;
    mobile: string | null;
    email: string | null;
    specialty: string | null;
    specialty_id: string | null;
    specialties: { name: string } | null;
    msds: string | null;
    cm: string | null;
    address: string | null;
    location: string | null;
    city: string | null;
    state: string | null;
    health_center: string | null;
    health_center_id: string | null;
    days: string | null;
    start_time: string | null;
    end_time: string | null;
    potential: 'Alto' | 'Medio' | 'Bajo' | null;
    observations: string | null;
    last_visit: string | null;
    status: 'Activo' | 'Inactivo';
    instagram: string | null;
    notes: string | null;
    priority: string | null;
    created_at: string;
    updated_at: string;
}

export default function Doctors() {
    const { theme } = useTheme();
    const navigate = useNavigate();
    const { user, canViewAllData, isSupervisor, zoneId, organizationId, organizationName } = useAuth();
    const { toast } = useToast();
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState('all');
    const [importing, setImporting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
    const [adminFilters, setAdminFilters] = useState<AdminFilterState>({});
    const demoData = useDemoData();

    const [formData, setFormData] = useState({
        id: "", user_id: "", name: "", birth_date: "", phone: "", mobile: "", email: "",
        specialty: "", specialty_id: "", msds: "", cm: "",
        address: "", location: "", city: "", state: "", health_center: "", health_center_id: "",
        days: "", start_time: "", end_time: "", potential: "Medio" as 'Alto' | 'Medio' | 'Bajo',
        observations: "", last_visit: "", status: "Activo" as 'Activo' | 'Inactivo',
        instagram: "", notes: "", priority: "medium", representative_id: null as string | null
    });

    useEffect(() => { if (user) loadDoctors(); }, [user, adminFilters, organizationId, demoData]);

    const loadDoctors = async () => {
        try {
            setLoading(true);
            if (demoData) {
                setDoctors(demoData.doctors as unknown as Doctor[]);
                setLoading(false);
                return;
            }

            if (!organizationId && !demoData) {
                console.warn('Doctors: Missing organizationId, skipping load');
                setLoading(false);
                return;
            }

            let triangulatedUserIds: string[] = [];
            
            if (adminFilters.zoneId && adminFilters.zoneId !== 'all') {
                const { data: userData } = await (supabase as any).from('profiles').select('id').eq('zone_id', adminFilters.zoneId);
                triangulatedUserIds = userData?.map((u: any) => u.id) || [];
            }

            let query: any = supabase.from('doctors').select('*');
            
            if (organizationId) {
                query = query.eq('organization_id', organizationId);
            }
            
            if (isSupervisor && zoneId) {
                if (adminFilters.userId && adminFilters.userId !== 'all') {
                    query = query.or(`representative_id.eq.${adminFilters.userId},user_id.eq.${adminFilters.userId}`);
                } else {
                    const { data: zoneUsers } = await supabase.from('profiles').select('id').eq('zone_id', zoneId);
                    const userIds = zoneUsers?.map(u => u.id) || [];
                    if (userIds.length > 0) {
                        query = query.or(`representative_id.in.(${userIds.join(',')}),user_id.in.(${userIds.join(',')})`);
                    } else {
                        query = query.eq('id', '00000000-0000-0000-0000-000000000000');
                    }
                }
            } else if (!canViewAllData && user?.id) {
                query = query.or(`representative_id.eq.${user.id},user_id.eq.${user.id}`);
            } else {
                if (adminFilters.userId && adminFilters.userId !== 'all') {
                    query = query.or(`representative_id.eq.${adminFilters.userId},user_id.eq.${adminFilters.userId}`);
                } else if (adminFilters.zoneId && adminFilters.zoneId !== 'all') {
                    if (triangulatedUserIds.length > 0) {
                        query = query.or(`representative_id.in.(${triangulatedUserIds.join(',')}),user_id.in.(${triangulatedUserIds.join(',')})`);
                    } else {
                        query = query.eq('id', '00000000-0000-0000-0000-000000000000');
                    }
                } else if (adminFilters.state && adminFilters.state !== 'all') {
                    query = query.eq('state', adminFilters.state);
                } else if (adminFilters.region && adminFilters.region !== 'all') {
                    const states = getStatesInRegion(adminFilters.region);
                    if (states.length > 0) query = query.in('state', states);
                    else query = query.eq('id', '00000000-0000-0000-0000-000000000000');
                }
            }

            const { data, error } = await query.order('name', { ascending: true });
            if (error) throw error;
            setDoctors((data || []).filter((d: any) => d && typeof d === 'object' && d.name));
        } catch (error) { console.error('Error:', error); setDoctors([]); } finally { setLoading(false); }
    };

    const handleEdit = (doctor: Doctor) => {
        setFormData({
            id: doctor.id, user_id: doctor.user_id, representative_id: doctor.representative_id,
            name: doctor.name, birth_date: doctor.birth_date || "", phone: doctor.phone || "",
            mobile: doctor.mobile || "", email: doctor.email || "", specialty: doctor.specialty || "",
            specialty_id: doctor.specialty_id || "", msds: doctor.msds || "", cm: doctor.cm || "",
            address: doctor.address || "", location: doctor.location || "", city: doctor.city || "",
            state: doctor.state || "", health_center: doctor.health_center || "", 
            health_center_id: doctor.health_center_id || "",
            days: doctor.days || "",
            start_time: doctor.start_time || "", end_time: doctor.end_time || "",
            potential: doctor.potential || "Medio", observations: doctor.observations || "",
            last_visit: doctor.last_visit || "", status: doctor.status || "Activo",
            instagram: doctor.instagram || "", notes: doctor.notes || "", priority: doctor.priority || "medium",
        });
        setDialogOpen(true);
    };

    const handleSubmit = async () => {
        if (!user || !formData.name) return;
        try {
            const dataToSave = {
                user_id: user.id, organization_id: organizationId, representative_id: formData.representative_id,
                name: formData.name, birth_date: formData.birth_date || null, phone: formData.phone || null,
                mobile: formData.mobile || null, email: formData.email || null, specialty: formData.specialty || null,
                specialty_id: formData.specialty_id || null, msds: formData.msds || null, cm: formData.cm || null,
                address: formData.address || null, location: formData.location || null, city: formData.city || null,
                state: formData.state || null, health_center: formData.health_center || null, days: formData.days || null,
                start_time: formData.start_time || null, end_time: formData.end_time || null, potential: formData.potential || 'Medio',
                observations: formData.observations || null, last_visit: formData.last_visit || null, status: formData.status || 'Activo',
                instagram: formData.instagram || null,
            };
            if (formData.id) { await supabase.from('doctors').update(dataToSave).eq('id', formData.id); } 
            else { await supabase.from('doctors').insert(dataToSave); }
            toast({ title: "Médico Guardado", description: "La base de datos de especialistas ha sido actualizada." });
            setDialogOpen(false);
            loadDoctors();
        } catch (error) { console.error('Error:', error); }
    };

    const triggerImport = () => fileInputRef.current?.click();

    const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        setImporting(true);
        try {
            const XLSX = await import('xlsx');
            const reader = new FileReader();
            reader.onload = async (e) => {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
                const doctorsToInsert = jsonData.map((row: any) => ({
                    user_id: user?.id, organization_id: organizationId,
                    name: row['Nombre'] || row['nombre'] || '',
                    potential: 'Medio', status: 'Activo'
                })).filter(d => d.name);
                await supabase.from('doctors').insert(doctorsToInsert);
                loadDoctors();
            };
            reader.readAsArrayBuffer(file);
        } catch (error) { console.error('Error:', error); } finally { setImporting(false); }
    };

    const getPriorityBadge = (priority: string | null) => {
        const styles: Record<string, string> = { 
            high: "bg-rose-500/10 text-rose-400 border-rose-500/30", 
            medium: "bg-amber-500/10 text-amber-400 border-amber-500/30", 
            low: "bg-blue-500/10 text-blue-400 border-blue-500/30" 
        };
        const labels: Record<string, string> = { high: "ALTA PRIORIDAD", medium: "MEDIA", low: "BAJA" };
        return <Badge className={cn(styles[priority || 'medium'], "border font-black text-[9px] tracking-widest px-3 py-1 rounded-full uppercase")}>{labels[priority || 'medium']}</Badge>;
    };

    const filteredDoctors = doctors.filter(d => {
        const matchesSearch = d.name.toLowerCase().includes(searchTerm.toLowerCase());
        let matchesFilter = true;
        if (statusFilter === 'high') matchesFilter = d.priority === 'high';
        else if (statusFilter === 'visited') matchesFilter = !!d.last_visit;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="flex flex-col h-full space-y-10 font-display animate-in fade-in duration-700 text-foreground pb-20">
            <input type="file" ref={fileInputRef} onChange={handleImport} accept=".xlsx,.xls,.csv" className="hidden" />

            <EliteHeader 
                title={theme?.texts?.doctors_title || "Directorio Alpha"}
                subtitle={theme?.texts?.doctors_subtitle || organizationName || "Gestión de Especialistas Biofarco"}
                icon={Stethoscope}
                badgeText="Activos Humanos"
                statusText={`${doctors.length} Especialistas Registrados`}
                statusColor="bg-emerald-500"
                rightContent={
                    <div className="flex items-center gap-4">
                        <EliteButton variant="secondary" onClick={() => exportToCSV(filteredDoctors, 'medicos')} icon={Download}>
                            Exportar Inteligencia
                        </EliteButton>
                        <EliteButton variant="secondary" onClick={triggerImport} disabled={importing} icon={importing ? RefreshCw : Upload}>
                            {importing ? "Sincronizando..." : "Sincronizar Manifiesto"}
                        </EliteButton>
                        <EliteButton onClick={() => setDialogOpen(true)} icon={Plus}>
                            Nuevo Especialista
                        </EliteButton>
                    </div>
                }
            />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <EliteKPICard title="Total Gremio" value={doctors.length} icon={UserRound} color="blue" onClick={() => setStatusFilter('all')} isActive={statusFilter === 'all'} subtitle="Activos en red" />
                <EliteKPICard title="Alta Prioridad" value={doctors.filter(d => d.priority === 'high').length} icon={Star} color="rose" onClick={() => setStatusFilter('high')} isActive={statusFilter === 'high'} subtitle="Segmento Pareto" />
                <EliteKPICard title="Zonas Activas" value={new Set(doctors.map(d => d.state).filter(Boolean)).size} icon={MapPin} color="indigo" subtitle="Cobertura Territorial" />
                <EliteKPICard title="Impacto Mes" value={doctors.filter(d => d.last_visit).length} icon={ClipboardCheck} color="emerald" onClick={() => setStatusFilter('visited')} isActive={statusFilter === 'visited'} subtitle="Trazabilidad Positiva" />
            </div>

            <AdminDataFilter onFilterChange={(f) => setAdminFilters(f)} moduleType="doctors" />

            <EliteTable 
                title="Consolidado de Especialistas"
                description="Control maestro de médicos, especialidades y geolocalización comercial."
                searchPlaceholder="LOCALIZAR POR NOMBRE, ESPECIALIDAD O ENTIDAD..."
                onSearch={setSearchTerm}
            >
                <Table>
                    <TableHeader>
                        <TableRow className="border-b border-border/40 hover:bg-transparent">
                            <TableHead className="font-black text-[10px] text-muted-foreground uppercase tracking-widest py-8 pl-8">Especialista Alpha</TableHead>
                            <TableHead className="font-black text-[10px] text-muted-foreground uppercase tracking-widest py-8">Ubicación / Centro</TableHead>
                            <TableHead className="font-black text-[10px] text-muted-foreground uppercase tracking-widest py-8">Canal Directo</TableHead>
                            <TableHead className="font-black text-[10px] text-muted-foreground uppercase tracking-widest py-8">Estatus Operativo</TableHead>
                            <TableHead className="font-black text-[10px] text-muted-foreground uppercase tracking-widest py-8 text-right pr-8">Operaciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            [1, 2, 3, 4, 5].map(i => (
                                <TableRow key={i} className="animate-pulse border-border/40">
                                    <TableCell colSpan={5} className="py-10">
                                        <div className="h-4 bg-muted/20 rounded-full w-full"></div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : filteredDoctors.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-40 text-center text-muted-foreground font-black uppercase text-[10px] tracking-widest opacity-50">
                                    Sin activos interceptados en los cuadrantes actuales.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredDoctors.map((doc) => (
                                <TableRow key={doc.id} className="border-b border-border/20 hover:bg-muted/5 cursor-pointer group transition-colors" onClick={() => { setSelectedDoctor(doc); setProfileOpen(true); }}>
                                    <TableCell className="py-8 pl-8">
                                        <div className="flex items-center gap-6">
                                            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center shadow-inner border border-primary/20 group-hover:scale-105 transition-transform duration-500">
                                                <Stethoscope className="h-7 w-7 text-primary" />
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                <p className="font-black text-base text-foreground uppercase tracking-tighter group-hover:text-primary transition-colors">{doc.name}</p>
                                                <div className="flex items-center gap-3">
                                                    <Badge variant="outline" className="text-[9px] text-muted-foreground font-black uppercase tracking-widest px-2 py-0.5 border-border/40">
                                                        {doc.specialties?.name || doc.specialty || 'MÉDICO GENERAL'}
                                                    </Badge>
                                                    {getPriorityBadge(doc.priority)}
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-8">
                                        <div className="flex flex-col gap-3">
                                            <div className="flex items-center text-[10px] text-muted-foreground font-black uppercase tracking-widest">
                                                <Building className="h-4 w-4 mr-3 text-primary opacity-60" />
                                                <span className="truncate max-w-[200px]">{doc.health_center || 'SIN ENTIDAD ASIGNADA'}</span>
                                            </div>
                                            <div className="flex items-center text-[10px] text-muted-foreground font-black uppercase tracking-widest">
                                                <MapPin className="h-4 w-4 mr-3 text-primary opacity-60" />
                                                <span className="truncate max-w-[200px]">{doc.city || 'UBICACIÓN DESCONOCIDA'}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-8">
                                        <div className="flex flex-col gap-3">
                                            <div className="flex items-center text-[10px] text-muted-foreground font-black uppercase tracking-widest">
                                                <Phone className="h-4 w-4 mr-3 text-primary opacity-60" />
                                                {doc.mobile || doc.phone || 'SIN CONTACTO'}
                                            </div>
                                            <div className="flex items-center text-[10px] text-muted-foreground font-black uppercase tracking-widest">
                                                <Mail className="h-4 w-4 mr-3 text-primary opacity-60" />
                                                <span className="truncate max-w-[150px]">{doc.email || 'SIN CORREO'}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-8">
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center text-[10px] font-black uppercase tracking-widest">
                                                <ClipboardCheck className="h-4 w-4 mr-3 text-emerald-500" />
                                                <span className={cn(doc.last_visit ? "text-emerald-400" : "text-muted-foreground/50")}>
                                                    {doc.last_visit ? new Date(doc.last_visit).toLocaleDateString() : 'SIN IMPACTO'}
                                                </span>
                                            </div>
                                            <span className="text-[8px] text-muted-foreground/40 font-black uppercase tracking-[0.2em] ml-7">Sincronización de Visita</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-8 text-right pr-8">
                                        <div className="flex justify-end gap-3">
                                            <Button 
                                                variant="outline" 
                                                onClick={(e) => { e.stopPropagation(); navigate(`/agenda?doctorId=${doc.id}&doctorName=${encodeURIComponent(doc.name)}`); }} 
                                                className="h-12 px-6 rounded-2xl font-black text-[10px] uppercase tracking-widest border-border/40 hover:bg-primary/10 hover:text-primary transition-all shadow-inner bg-card"
                                            >
                                                <Calendar className="h-4 w-4 mr-3" /> Agendar
                                            </Button>
                                            <Button 
                                                variant="ghost" 
                                                onClick={(e) => { e.stopPropagation(); handleEdit(doc); }} 
                                                className="h-12 w-12 p-0 rounded-2xl hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all border border-transparent hover:border-primary/20 shadow-inner"
                                            >
                                                <Pencil className="h-5 w-5" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </EliteTable>

            <DoctorFormDialog open={dialogOpen} onOpenChange={setDialogOpen} formData={formData} setFormData={setFormData} onSubmit={handleSubmit} />
            <DoctorProfileDialog open={profileOpen} onOpenChange={setProfileOpen} doctor={selectedDoctor} />
        </div>
    );
}
