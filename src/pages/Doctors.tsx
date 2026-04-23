/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
 ======================================================================== */

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  Plus, UserRound, Phone, Mail, MapPin, Search, Stethoscope, 
  Building, Download, Upload, Printer, HelpCircle, FileSpreadsheet, 
  Trash2, Pencil, Lightbulb, AlertCircle, Calendar, 
  ChevronRight, ClipboardCheck, RefreshCw
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { exportToCSV, handlePrint } from "@/utils/exportUtils";
import { DoctorFormDialog } from "@/components/doctors/DoctorFormDialog";
import { DoctorProfileDialog } from "@/components/doctors/DoctorProfileDialog";
import { AdminDataFilter } from "@/components/admin/AdminDataFilter";
import { getStatesInRegion } from "@/constants/regions";
import { useDemoData } from "@/contexts/MockDataProvider";
import { InstructionCard } from "@/components/ui/InstructionCard";
import { EliteKPICard, EliteHeader } from "@/components/layout/DesignSystem";

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
    const navigate = useNavigate();
    const { user, canViewAllData, isSupervisor, zoneId, organizationId } = useAuth();
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

            // 0. Preparar IDs territoriales para triangulación si es necesario
            let triangulatedUserIds: string[] = [];
            
            if (adminFilters.zoneId && adminFilters.zoneId !== 'all') {
                const { data: userData } = await (supabase as any).from('profiles').select('id').eq('zone_id', adminFilters.zoneId);
                triangulatedUserIds = userData?.map((u: any) => u.id) || [];
            } else if (adminFilters.state && adminFilters.state !== 'all') {
                // El estado es nativo en doctors, no requiere triangulación
            } else if (adminFilters.region && adminFilters.region !== 'all') {
                // La región no es nativa, triangulamos por estados de la región
                const states = getStatesInRegion(adminFilters.region);
                if (states.length > 0) {
                   // Usaremos query.in('state', states) más adelante
                }
            }

            let query: any = supabase.from('doctors').select('*, specialties(name)').eq('organization_id', organizationId);
            
            if (isSupervisor && zoneId) {
                // Lógica de Supervisor: Limitado a su zona de control
                if (adminFilters.userId && adminFilters.userId !== 'all') {
                    query = query.or(`representative_id.eq.${adminFilters.userId},user_id.eq.${adminFilters.userId}`);
                } else {
                    // Como doctors no tiene zone_id, buscamos los usuarios de la zona del supervisor
                    const { data: zoneUsers } = await supabase.from('profiles').select('id').eq('zone_id', zoneId);
                    const userIds = zoneUsers?.map(u => u.id) || [];
                    if (userIds.length > 0) {
                        query = query.or(`representative_id.in.(${userIds.join(',')}),user_id.in.(${userIds.join(',')})`);
                    } else {
                        query = query.eq('id', '00000000-0000-0000-0000-000000000000');
                    }
                }
            } else if (!canViewAllData) {
                // Lógica de Representante: Datos propios
                query = query.or(`representative_id.eq.${user?.id},user_id.eq.${user?.id}`);
            } else {
                // Lógica Master/Admin
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
            toast({ title: "Médico guardado" });
            setDialogOpen(false);
            loadDoctors();
        } catch (error) { console.error('Error:', error); }
    };

    const handleDelete = async (id: string) => {
        try { await supabase.from('doctors').delete().eq('id', id); loadDoctors(); } catch (error) { console.error('Error:', error); }
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
        const styles: Record<string, string> = { high: "bg-rose-500/10 text-rose-500", medium: "bg-amber-500/10 text-amber-500", low: "bg-emerald-500/10 text-emerald-500" };
        const labels: Record<string, string> = { high: "ALTA", medium: "MEDIA", low: "BAJA" };
        return <Badge className={`${styles[priority || 'medium']} border-none font-black text-[9px] tracking-widest`}>{labels[priority || 'medium']}</Badge>;
    };

    const filteredDoctors = doctors.filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return (
        <div className="space-y-10 pb-10 font-display animate-in fade-in duration-700">
            <input type="file" ref={fileInputRef} onChange={handleImport} accept=".xlsx,.xls,.csv" className="hidden" />

            <EliteHeader 
                title="Directorio Médico"
                subtitle="Gestión de Activos Humanos & Especialidades"
                icon={Stethoscope}
                badgeText="V6.0 ALPHA"
                statusText="Sincronización de Gremio OK"
                statusColor="bg-emerald-500"
                rightContent={
                    <div className="flex items-center gap-4">
                        <Button variant="outline" onClick={() => exportToCSV(filteredDoctors, 'medicos')} className="h-14 px-8 rounded-2xl border-slate-100 bg-card text-slate-900 font-black text-[10px] uppercase tracking-widest shadow-premium-sm hover:shadow-premium-md transition-all">
                            <Download className="h-5 w-5 mr-3 text-primary" /> Exportar
                        </Button>
                        <Button variant="outline" onClick={triggerImport} disabled={importing} className="h-14 px-8 rounded-2xl border-slate-100 bg-card text-slate-900 font-black text-[10px] uppercase tracking-widest shadow-premium-sm hover:shadow-premium-md transition-all">
                            {importing ? <RefreshCw className="animate-spin h-5 w-5 mr-3 text-primary" /> : <Upload className="h-5 w-5 mr-3 text-primary" />} Importar
                        </Button>
                        <Button onClick={() => setDialogOpen(true)} className="h-16 px-10 bg-primary hover:bg-primary/90 text-white rounded-2xl shadow-premium-md font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 flex items-center gap-3">
                            <Plus className="h-6 w-6" /> Nuevo Médico
                        </Button>
                    </div>
                }
            />

            {/* KPI STRIP - Estatus del Fichero */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <EliteKPICard title="Total Médicos" value={doctors.length} icon={UserRound} color="blue" />
                <EliteKPICard title="Alta Prioridad" value={doctors.filter(d => d.priority === 'high').length} icon={AlertCircle} color="rose" />
                <EliteKPICard title="Zonas Activas" value={new Set(doctors.map(d => d.state)).size} icon={MapPin} color="indigo" />
                <EliteKPICard title="Visitas Mes" value={doctors.filter(d => d.last_visit).length} icon={ClipboardCheck} color="emerald" />
            </div>

            <AdminDataFilter onFilterChange={(f) => setAdminFilters(f)} moduleType="doctors" />

            {/* SEARCH AREA PREMIUM */}
            <div className="flex flex-col md:flex-row gap-6">
                <Card className="bg-card border border-border/40 rounded-[2.5rem] shadow-premium-sm p-6 flex-1 flex flex-col md:flex-row gap-6 relative overflow-hidden group/search">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl opacity-0 group-hover/search:opacity-100 transition-opacity" />
                    <div className="flex-1 relative">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-300 group-focus-within/search:text-primary transition-colors" />
                        <Input 
                            placeholder="LOCALIZAR POR NOMBRE, ESPECIALIDAD O ENTIDAD..." 
                            value={searchTerm} 
                            onChange={e => setSearchTerm(e.target.value)} 
                            className="pl-16 h-16 bg-muted/30 border-border focus-visible:ring-primary/20 font-black rounded-2xl text-foreground placeholder:text-muted-foreground/50 transition-all text-xs tracking-widest shadow-inner uppercase" 
                        />
                    </div>
                </Card>
            </div>

            {loading ? (
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map(i => <div key={i} className="h-80 bg-card rounded-[3rem] animate-pulse border border-border/40 shadow-premium-sm" />)}
                </div>
            ) : filteredDoctors.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 bg-slate-50/50 rounded-[4rem] border border-dashed border-slate-200">
                    <div className="w-24 h-24 rounded-full bg-card flex items-center justify-center shadow-soft mb-6">
                        <Search className="h-10 w-10 text-slate-200" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter mb-2">Sin Resultados Digitales</h3>
                    <p className="text-slate-400 font-bold uppercase text-[9px] tracking-widest">Ajusta los parámetros de búsqueda o filtros territoriales</p>
                </div>
            ) : (
                <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
                    {filteredDoctors.map((doc) => (
                        <Card key={doc.id} className="bg-card border-border/40 rounded-[3rem] overflow-hidden hover:border-primary/30 transition-all duration-700 group relative shadow-premium-sm hover:shadow-premium-xl cursor-pointer" onClick={() => { setSelectedDoctor(doc); setProfileOpen(true); }}>
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-50 overflow-hidden">
                                <div className={cn("h-full transition-all duration-1000", doc.priority === 'high' ? 'bg-rose-500 w-full' : doc.priority === 'medium' ? 'bg-amber-500 w-2/3' : 'bg-emerald-500 w-1/3')} />
                            </div>
                            <CardHeader className="p-10 pb-4">
                                <div className="flex justify-between items-start gap-4">
                                    <div className="space-y-3 flex-1">
                                        <CardTitle className="text-2xl font-black text-slate-900 uppercase tracking-tighter group-hover:text-primary transition-colors leading-none font-display">{doc.name}</CardTitle>
                                        <div className="flex items-center gap-2">
                                            <Badge className="bg-primary/5 text-primary border-none font-black text-[9px] uppercase tracking-widest px-3 py-1">{doc.specialties?.name || doc.specialty || 'GENERAL'}</Badge>
                                            {getPriorityBadge(doc.priority)}
                                        </div>
                                    </div>
                                    <div className="w-14 h-14 rounded-2xl bg-muted/30 flex items-center justify-center shadow-inner group-hover:bg-primary transition-all group-hover:rotate-6">
                                        <Stethoscope className="h-6 w-6 text-slate-300 group-hover:text-white" />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-10 pt-4 space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-center text-[11px] text-slate-400 font-black uppercase tracking-widest group/item">
                                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center mr-4 group-hover/item:bg-primary/10 transition-colors">
                                            <MapPin className="h-4 w-4 text-primary opacity-60" />
                                        </div>
                                        <span className="truncate">{doc.address || doc.city || 'UBICACIÓN S.O.'}</span>
                                    </div>
                                    <div className="flex items-center text-[11px] text-slate-400 font-black uppercase tracking-widest group/item">
                                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center mr-4 group-hover/item:bg-primary/10 transition-colors">
                                            <Phone className="h-4 w-4 text-primary opacity-60" />
                                        </div>
                                        <span>{doc.mobile || doc.phone || 'SIN CONTACTO'}</span>
                                    </div>
                                    <div className="flex items-center text-[11px] text-slate-400 font-black uppercase tracking-widest group/item">
                                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center mr-4 group-hover/item:bg-primary/10 transition-colors">
                                            <ClipboardCheck className="h-4 w-4 text-primary opacity-60" />
                                        </div>
                                        <span className={cn(doc.last_visit ? "text-emerald-600" : "text-slate-300")}>ÚLTIMA VISITA: {doc.last_visit || 'PENDIENTE'}</span>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="p-6 bg-slate-50/50 flex items-center gap-3 border-t border-slate-50">
                                <Button onClick={(e) => { e.stopPropagation(); navigate(`/agenda?doctorId=${doc.id}&doctorName=${encodeURIComponent(doc.name)}`); }} className="flex-1 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-primary/90 shadow-premium-md h-12">
                                    <Calendar className="h-4 w-4 mr-2" /> AGENDAR
                                </Button>
                                <Button variant="ghost" onClick={(e) => { e.stopPropagation(); handleEdit(doc); }} className="w-12 h-12 rounded-xl border border-slate-200 bg-card hover:bg-slate-50 text-slate-400 hover:text-primary transition-all">
                                    <Pencil className="h-4 w-4" />
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}

            <DoctorFormDialog open={dialogOpen} onOpenChange={setDialogOpen} formData={formData} setFormData={setFormData} onSubmit={handleSubmit} />
            <DoctorProfileDialog open={profileOpen} onOpenChange={setProfileOpen} doctor={selectedDoctor} />
        </div>
    );
}
