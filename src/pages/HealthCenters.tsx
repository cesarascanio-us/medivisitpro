/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import { useState, useEffect, useRef } from "react";
import { InstructionCard } from "@/components/ui/InstructionCard";
import { Plus, Building, Phone, MapPin, Search, Download, Upload, Printer, HelpCircle, FileSpreadsheet, Trash2, RefreshCw, Edit, Users, Stethoscope, Lightbulb } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { exportToCSV, handlePrint } from "@/utils/exportUtils";
import * as XLSX from 'xlsx';
import { AdminDataFilter } from "@/components/admin/AdminDataFilter";
import { useDemoData } from "@/contexts/MockDataProvider";

interface AdminFilterState {
  region?: string;
  state?: string;
  zoneId?: string;
  repId?: string;
}

interface HealthCenter {
  id: string;
  name: string;
  facility_type: string;
  address: string | null;
  city: string | null;
  state: string | null;
  zone_id: string | null;
  phone: string | null;
  potential: string | null;
  last_visit: string | null;
}

export default function HealthCenters() {
  const { user, organizationId, canViewAllData, isSupervisor, zoneId } = useAuth();
  const { toast } = useToast();
  const [healthCenters, setHealthCenters] = useState<HealthCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [helpDialogOpen, setHelpDialogOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [directoryOpen, setDirectoryOpen] = useState(false);
  const [selectedCenterForDirectory, setSelectedCenterForDirectory] = useState<HealthCenter | null>(null);
  const [centerDoctors, setCenterDoctors] = useState<any[]>([]);
  const [adminFilters, setAdminFilters] = useState<AdminFilterState>({});
  const [showHelp, setShowHelp] = useState(false);

  // Demo mode hook
  const demoData = useDemoData();

  const [formData, setFormData] = useState({
    id: "", // Added ID for editing
    name: "",
    facility_type: "",
    address: "",
    city: "",
    state: "",
    zone_id: "",
    phone: "",
    potential: "Medio",
    last_visit: ""
  });

  useEffect(() => {
    if (user) loadHealthCenters();
  }, [user, adminFilters, organizationId, demoData]);

  const loadHealthCenters = async () => {
    try {
      setLoading(true);

      // DEMO MODE: Use mock data
      if (demoData) {
        console.log("HealthCenters: Using mock demo data");
        const mockCenters = demoData.healthCenters.map((hc: any) => ({
          ...hc,
          facility_type: hc.type
        })) as unknown as HealthCenter[];
        setHealthCenters(mockCenters);
        setLoading(false);
        return;
      }

      let query: any = supabase
        .from('health_centers')
        .select('*')
        .eq('organization_id', organizationId);

      if (isSupervisor && zoneId) {
        query = query.eq('zone_id', zoneId);
        if (adminFilters.repId && adminFilters.repId !== 'all') {
          query = query.eq('user_id', adminFilters.repId);
        }
      } else if (!canViewAllData) {
        query = query.eq('user_id', user.id);
      } else {
        // Master/Manager with optional filters
        if (adminFilters.repId && adminFilters.repId !== 'all') {
          query = query.eq('user_id', adminFilters.repId);
        }
        if (adminFilters.zoneId && adminFilters.zoneId !== 'all') {
          query = query.eq('zone_id', adminFilters.zoneId);
        }
        if (adminFilters.state && adminFilters.state !== 'all') {
          query = query.ilike('state', `%${adminFilters.state}%`);
        }
      }

      const { data, error } = await query.order('name', { ascending: true });

      if (error) throw error;
      setHealthCenters(data || []);
    } catch (error) {
      console.error('Error loading health centers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      if (demoData) {
        toast({ title: "Sincronizado (Demo)", description: "En modo demo no se pueden crear registros nuevos." });
        return;
      }

      // 1. Get all doctors with a health center assigned
      const { data: doctors, error: docError } = await supabase
        .from('doctors')
        .select('health_center')
        .not('health_center', 'is', null);

      if (docError) throw docError;
      if (!doctors || doctors.length === 0) {
        toast({ title: "Info", description: "No hay médicos con centro de salud asignado." });
        return;
      }

      // 2. Extract unique centers
      const uniqueCenters = [...new Set(doctors.map(d => d.health_center).filter(Boolean))];

      // 3. Get existing centers
      const { data: existing, error: existError } = await supabase
        .from('health_centers')
        .select('name');

      if (existError) throw existError;
      const existingNames = new Set(existing?.map(e => e.name) || []);

      // 4. Identify missing centers
      const missingCenters = uniqueCenters.filter(name => !existingNames.has(name));

      if (missingCenters.length === 0) {
        toast({ title: "Sincronizado", description: "Todos los centros de los médicos ya están registrados." });
        return;
      }

      // 5. Insert missing centers
      const newCenters = missingCenters.map(name => ({
        user_id: user?.id,
        name: name,
        facility_type: 'Otro', // Default type, user can edit later
        potential: 'Medio'
      }));

      const { error: insertError } = await supabase
        .from('health_centers')
        .insert(newCenters);

      if (insertError) throw insertError;

      toast({
        title: "Sincronización Exitosa",
        description: `Se han creado ${newCenters.length} nuevos centros de salud a partir de tu lista de médicos.`
      });
      loadHealthCenters();

    } catch (error: any) {
      console.error('Sync error:', error);
      toast({
        title: "Error de Sincronización",
        description: error.message || "No se pudo sincronizar.",
        variant: "destructive"
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleEdit = (center: HealthCenter) => {
    setFormData({
      id: center.id,
      name: center.name,
      facility_type: center.facility_type,
      address: center.address || "",
      city: center.city || "",
      state: center.state || "",
      zone_id: center.zone_id || "",
      phone: center.phone || "",
      potential: center.potential || "Medio",
      last_visit: center.last_visit || ""
    });
    setDialogOpen(true);
  };

  const handleOpenDirectory = async (center: HealthCenter) => {
    setSelectedCenterForDirectory(center);
    setDirectoryOpen(true);
    setCenterDoctors([]);

    if (demoData) {
      console.log("HealthCenter Directory: Using mock demo data");
      // Find doctors in demoData that belong to this health center
      const mockDoctors = (demoData.doctors || []).filter((d: any) => d.health_center === center.name);
      setCenterDoctors(mockDoctors);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .eq('health_center', center.name)
        .order('specialty', { ascending: true });

      if (error) throw error;
      setCenterDoctors(data || []);
    } catch (error) {
      console.error("Error loading doctors for center", error);
    }
  };

  const handleSubmit = async () => {
    if (!user || !formData.name || !formData.facility_type) {
      toast({ title: "Error", description: "Nombre y tipo de centro son obligatorios.", variant: "destructive" });
      return;
    }

    try {
      const payload = {
        user_id: user.id,
        name: formData.name,
        facility_type: formData.facility_type,
        address: formData.address || null,
        city: formData.city || null,
        state: formData.state || null,
        zone_id: formData.zone_id || null,
        phone: formData.phone || null,
        potential: formData.potential || null,
        last_visit: formData.last_visit || null
      };

      let error;

      if (formData.id) {
        // Update
        const { error: updateError } = await supabase
          .from('health_centers')
          .update(payload)
          .eq('id', formData.id);
        error = updateError;
        toast({ title: "Centro actualizado", description: "La información ha sido actualizada." });
      } else {
        // Insert
        const { error: insertError } = await supabase
          .from('health_centers')
          .insert(payload);
        error = insertError;
        toast({ title: "Centro agregado", description: "El centro de salud ha sido registrado exitosamente." });
      }

      if (error) throw error;

      setDialogOpen(false);
      setFormData({
        id: "",
        name: "", facility_type: "", address: "", city: "", state: "",
        zone_id: "", phone: "", potential: "Medio", last_visit: ""
      });
      loadHealthCenters();
    } catch (error) {
      toast({ title: "Error", description: "No se pudo guardar la información.", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('health_centers')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: "Centro eliminado", description: "El centro de salud ha sido eliminado." });
      loadHealthCenters();
    } catch (error) {
      console.error('Error deleting health center:', error);
      toast({ title: "Error", description: "No se pudo eliminar el centro de salud.", variant: "destructive" });
    }
  };

  const triggerImport = () => {
    fileInputRef.current?.click();
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

          const centersToInsert = jsonData.map((row: any) => ({
            user_id: user?.id,
            name: row['Nombre'] || row['nombre'] || row['Name'] || row['Nombre Centro'] || '',
            facility_type: row['Tipo'] || row['tipo'] || row['Type'] || row['Tipo Centro'] || row['Facility Type'] || 'Otro',
            address: row['Direccion'] || row['direccion'] || row['Address'] || null,
            city: row['Ciudad'] || row['ciudad'] || row['City'] || null,
            state: row['Estado'] || row['estado'] || row['State'] || null,
            zone_id: row['Zona'] || row['zona'] || row['ZonaID'] || row['Zone'] || null,
            phone: row['Telefono'] || row['telefono'] || row['Phone'] || row['Teléfono Principal'] || null,
            potential: row['Potencial'] || row['potencial'] || row['Potential'] || null,
            last_visit: row['Ultima Visita'] || row['ultima_visita'] || row['Last Visit'] || row['Última_Visita'] || null
          })).filter(c => c.name && c.facility_type);

          if (centersToInsert.length === 0) {
            throw new Error("No se encontraron centros válidos para importar.");
          }

          const { error } = await supabase
            .from('health_centers')
            .insert(centersToInsert);

          if (error) throw error;

          toast({
            title: "Importación completa",
            description: `Se han importado ${centersToInsert.length} centros de salud correctamente.`
          });
          loadHealthCenters();

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

  const handleExport = () => {
    if (healthCenters.length === 0) {
      toast({ title: "Sin datos", description: "No hay centros para exportar.", variant: "destructive" });
      return;
    }

    const exportData = healthCenters.map(c => ({
      Nombre: c.name,
      Tipo: c.facility_type,
      Direccion: c.address || '',
      Ciudad: c.city || '',
      Estado: c.state || '',
      Zona: c.zone_id || '',
      Telefono: c.phone || '',
      Potencial: c.potential || '',
      'Ultima Visita': c.last_visit || ''
    }));

    exportToCSV(exportData, `centros_salud_${new Date().toISOString().split('T')[0]}`);
    toast({ title: "Exportación exitosa", description: "Los centros han sido descargados correctamente." });
  };

  const getPotentialBadge = (potential: string | null) => {
    const variants: Record<string, string> = {
      'Alto': 'bg-indigo-100 text-indigo-800',
      'Medio': 'bg-amber-100 text-amber-800',
      'Bajo': 'bg-rose-100 text-rose-800'
    };
    return variants[potential || 'Medio'] || 'bg-slate-100 text-slate-800';
  };

  const filteredCenters = healthCenters.filter(center =>
    center.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    center.facility_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    center.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const facilityTypes = ['Hospital', 'Clínica', 'Consultorio', 'Ambulatorio', 'Centro Médico', 'Otro'];
  const potentialLevels = ['Alto', 'Medio', 'Bajo'];

  return (
    <div className="space-y-6">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImport}
        accept=".xlsx,.xls,.csv"
        className="hidden"
      />

      {/* Header */}
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl -mr-32 -mt-32 transition-colors group-hover:bg-indigo-100/50" />
        <div className="relative z-10">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-xl shadow-indigo-200">
              <Building className="h-7 w-7 text-white" />
            </div>
            Centros de Salud
          </h1>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-3 ml-18">Gestión de Infraestructura Médica & Hospitalaria</p>
        </div>
        <div className="flex items-center gap-3 relative z-10">
          <Button variant="ghost" size="icon" onClick={() => setShowHelp(!showHelp)} className="w-11 h-11 rounded-xl hover:bg-slate-50">
            <Lightbulb className="h-5 w-5 text-amber-500" />
          </Button>
          <Button variant="outline" onClick={() => handleSync()} disabled={syncing} className="h-11 px-6 rounded-xl border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2">
            <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
            Sincronizar
          </Button>
          <Dialog open={dialogOpen} onOpenChange={open => {
            if (!open) setFormData({ id: "", name: "", facility_type: "", address: "", city: "", state: "", zone_id: "", phone: "", potential: "Medio", last_visit: "" });
            setDialogOpen(open);
          }}>
            <DialogTrigger asChild>
              <Button className="h-11 px-8 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-[10px] rounded-xl shadow-xl shadow-indigo-500/20 transition-all hover:scale-[1.02] flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Nueva Sede
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl p-0 overflow-hidden border-none shadow-2xl rounded-[2rem]">
              <div className="bg-gradient-to-br from-indigo-700 via-indigo-800 to-slate-900 px-8 py-10 text-white relative">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Building className="w-32 h-32" />
                </div>
                <div className="flex items-center gap-5 relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-inner">
                    <Building className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <DialogTitle className="text-2xl font-black tracking-tight text-white mb-0 uppercase">
                      {formData.id ? 'Gestión de Sede' : 'Alta Institucional'}
                    </DialogTitle>
                    <p className="text-indigo-200/70 text-[10px] font-black uppercase tracking-[0.2em] mt-1.5">
                      Registro de Infraestructura Médica 🏥
                    </p>
                  </div>
                </div>
              </div>

              <div className="px-8 py-8 space-y-8 bg-slate-50/30">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Nombre Comercial *</Label>
                    <Input
                      placeholder="Ej. Hospital Central"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="h-12 border-slate-200 rounded-xl font-bold focus:ring-indigo-500/10 focus:border-indigo-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Tipo de Institución *</Label>
                    <Select value={formData.facility_type} onValueChange={val => setFormData({ ...formData, facility_type: val })}>
                      <SelectTrigger className="h-12 border-slate-200 rounded-xl font-bold"><SelectValue placeholder="Seleccionar tipo" /></SelectTrigger>
                      <SelectContent>{facilityTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Dirección Completa</Label>
                  <Input
                    placeholder="Calle, Edificio, Punto de referencia..."
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                    className="h-12 border-slate-200 rounded-xl font-bold focus:ring-indigo-500/10 focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Ciudad</Label>
                    <Input
                      placeholder="Ciudad"
                      value={formData.city}
                      onChange={e => setFormData({ ...formData, city: e.target.value })}
                      className="h-12 border-slate-200 rounded-xl font-bold focus:ring-indigo-500/10 focus:border-indigo-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Estado</Label>
                    <Input
                      placeholder="Estado"
                      value={formData.state}
                      onChange={e => setFormData({ ...formData, state: e.target.value })}
                      className="h-12 border-slate-200 rounded-xl font-bold focus:ring-indigo-500/10 focus:border-indigo-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">ID Zona</Label>
                    <Input
                      placeholder="Zona ID"
                      value={formData.zone_id}
                      onChange={e => setFormData({ ...formData, zone_id: e.target.value })}
                      className="h-12 border-slate-200 rounded-xl font-bold focus:ring-indigo-500/10 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Teléfono</Label>
                    <Input
                      placeholder="Teléfono"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      className="h-12 border-slate-200 rounded-xl font-bold focus:ring-indigo-500/10 focus:border-indigo-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Frecuencia</Label>
                    <Select value={formData.potential} onValueChange={val => setFormData({ ...formData, potential: val })}>
                      <SelectTrigger className="h-12 border-slate-200 rounded-xl font-bold"><SelectValue /></SelectTrigger>
                      <SelectContent>{potentialLevels.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Última Visita</Label>
                    <Input
                      type="date"
                      value={formData.last_visit}
                      onChange={e => setFormData({ ...formData, last_visit: e.target.value })}
                      className="h-12 border-slate-200 rounded-xl font-bold focus:ring-indigo-500/10 focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white border-t border-slate-100 px-8 py-6 flex items-center justify-between gap-4">
                <Button variant="ghost" onClick={() => setDialogOpen(false)} className="h-12 px-6 font-bold text-slate-400 hover:text-slate-600 rounded-xl">
                  Descartar
                </Button>
                <Button onClick={handleSubmit} className="h-12 px-10 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-[10px] rounded-xl shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.02] flex-1">
                  {formData.id ? 'Actualizar Master Record' : 'Finalizar Alta Institucional'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {showHelp && (
        <InstructionCard
          title="Gestión de Centros de Salud"
          description="Aquí administras tu panel de instituciones médicas. Puedes filtrar, editar o agregar nuevos centros."
          items={[
            "Usa el botón 'Nuevo Centro' para registrar una nueva institución.",
            "Utiliza 'Sincronizar' para actualizar centros basados en el fichero de médicos.",
            "Haz clic en el icono de directorio para ver médicos por centro."
          ]}
        />
      )}

      {/* Admin Filters */}
      <AdminDataFilter onFilterChange={setAdminFilters} moduleType="contacts" />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-white border-slate-100 rounded-2xl shadow-sm p-6 group hover:border-indigo-100 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Sedes</p>
              <p className="text-3xl font-black text-slate-900 tracking-tighter">{healthCenters.length}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center">
              <Building className="h-6 w-6 text-indigo-600" />
            </div>
          </div>
        </Card>

        {['Hospital', 'Clínica', 'Consultorio', 'Ambulatorio'].map(type => {
          const count = healthCenters.filter(c => {
            if (!c.facility_type) return false;
            const dbType = c.facility_type.toLowerCase();
            const targetType = type.toLowerCase();
            if (targetType === 'clínica') return dbType.includes('clínica') || dbType.includes('clinica');
            if (targetType === 'consultorio') return dbType.includes('consultorio');
            if (targetType === 'ambulatorio') return dbType.includes('ambulatorio');
            return dbType.includes(targetType);
          }).length;

          return (
            <Card key={type} className="bg-white border-slate-100 rounded-2xl shadow-sm p-6 group hover:border-indigo-100 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{type}s</p>
                  <p className="text-3xl font-black text-slate-900 tracking-tighter">{count}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-indigo-400" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Action Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar centros por nombre, tipo o ciudad..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
        </div>

        <div className="flex items-center gap-2">
          <Dialog open={helpDialogOpen} onOpenChange={setHelpDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" title="Ayuda de Importación">
                <HelpCircle className="h-5 w-5 text-muted-foreground" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Estructura de Archivo para Importación</DialogTitle>
                <DialogDescription>Para importar centros de salud, utiliza un archivo Excel o CSV con estas columnas:</DialogDescription>
              </DialogHeader>
              <div className="border rounded-md overflow-hidden">
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
                      <TableCell className="font-mono">Nombre</TableCell>
                      <TableCell>Nombre del centro (Obligatorio)</TableCell>
                      <TableCell>Hospital Central</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-mono">Tipo</TableCell>
                      <TableCell>Tipo (Obligatorio)</TableCell>
                      <TableCell>Hospital, Clínica...</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-mono">Direccion</TableCell>
                      <TableCell>Dirección completa</TableCell>
                      <TableCell>Av. Principal 123</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-mono">Ciudad</TableCell>
                      <TableCell>Ciudad</TableCell>
                      <TableCell>Caracas</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-mono">Potencial</TableCell>
                      <TableCell>Potencial</TableCell>
                      <TableCell>Alto, Medio, Bajo</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </DialogContent>
          </Dialog>

          <Button variant="outline" onClick={triggerImport} disabled={importing} title="Importar desde Excel">
            {importing ? <FileSpreadsheet className="h-4 w-4 animate-pulse md:mr-2" /> : <Upload className="h-4 w-4 md:mr-2" />}
            <span className="hidden md:inline">Importar</span>
          </Button>

          <Button variant="outline" onClick={handleExport} title="Exportar a CSV">
            <Download className="h-4 w-4 md:mr-2" />
            <span className="hidden md:inline">Exportar</span>
          </Button>

          <Button variant="outline" onClick={() => handlePrint()} className="h-11 px-4 rounded-xl border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2">
            <Printer className="h-4 w-4" />
            <span className="hidden md:inline">Imprimir</span>
          </Button>

        </div>
      </div>

      {/* Table */}
      <Card className="medical-card overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50 border-b border-slate-100">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 py-5 pl-8">Nombre de Sede</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 py-5">Nivel Institucional</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 py-5">Ciudad</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 py-5">Clasificación</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 py-5">Last Data Sync</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 py-5 pr-8 text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div></TableCell></TableRow>
              ) : filteredCenters.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-20 text-slate-400 font-bold uppercase text-[10px] tracking-widest">No hay registros vinculados</TableCell></TableRow>
              ) : (
                filteredCenters.map((center) => (
                  <TableRow key={center.id} className="group cursor-pointer hover:bg-slate-50/50 transition-colors border-b border-slate-50 last:border-none" onClick={() => handleOpenDirectory(center)}>
                    <TableCell className="py-5 pl-8">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                          <Building className="h-4 w-4 text-indigo-600" />
                        </div>
                        <span className="font-bold text-slate-900">{center.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-5"><Badge variant="secondary" className="bg-slate-100 text-slate-600 font-bold uppercase text-[9px] tracking-widest border-none px-2.5 py-1">{center.facility_type}</Badge></TableCell>
                    <TableCell className="py-5 text-slate-500 font-medium">{center.city || '-'}</TableCell>
                    <TableCell className="py-5"><Badge className={`${getPotentialBadge(center.potential)} border-none font-black uppercase text-[9px] tracking-widest px-2.5 py-1`}>{center.potential || 'Medio'}</Badge></TableCell>
                    <TableCell className="py-5 text-slate-400 font-mono text-[11px]">{center.last_visit || '-'}</TableCell>
                    <TableCell className="py-5 pr-8 text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(center)} className="h-8 w-8 p-0 rounded-lg hover:bg-indigo-50 hover:text-indigo-600"><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => handleOpenDirectory(center)} className="h-8 w-8 p-0 rounded-lg hover:bg-purple-50 hover:text-purple-600"><Users className="h-4 w-4" /></Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild><Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg hover:bg-rose-50 hover:text-rose-600"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                          <AlertDialogContent className="rounded-[2rem] border-none shadow-2xl">
                            <AlertDialogHeader><AlertDialogTitle className="text-xl font-black tracking-tight uppercase">¿Eliminar registro maestro?</AlertDialogTitle><AlertDialogDescription className="text-slate-500 font-medium">Se eliminará permanentemente la sede {center.name}. Esta acción no se puede deshacer.</AlertDialogDescription></AlertDialogHeader>
                            <AlertDialogFooter className="gap-3"><AlertDialogCancel className="rounded-xl font-bold">Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(center.id)} className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-black uppercase tracking-widest text-[10px]">Confirmar Eliminación</AlertDialogAction></AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {/* Directory Dialog */}
      <Dialog open={directoryOpen} onOpenChange={setDirectoryOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Building className="h-6 w-6 text-primary" />
              {selectedCenterForDirectory?.name}
            </DialogTitle>
            <DialogDescription>
              Detalles del centro y directorio médico asociado.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Center Details Section */}
            {selectedCenterForDirectory && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg border">
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground font-semibold uppercase">Tipo</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{selectedCenterForDirectory.facility_type}</Badge>
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground font-semibold uppercase">Ubicación</span>
                  <div className="flex items-center gap-1 text-sm">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                    {selectedCenterForDirectory.city || 'N/A'} {selectedCenterForDirectory.state ? `, ${selectedCenterForDirectory.state}` : ''}
                  </div>
                  {selectedCenterForDirectory.address && (
                    <p className="text-xs text-muted-foreground/80 truncate" title={selectedCenterForDirectory.address}>
                      {selectedCenterForDirectory.address}
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground font-semibold uppercase">Contacto</span>
                  <div className="flex items-center gap-1 text-sm">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                    {selectedCenterForDirectory.phone || 'No registrado'}
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground font-semibold uppercase">Potencial</span>
                  <div>
                    <Badge className={getPotentialBadge(selectedCenterForDirectory.potential)}>
                      {selectedCenterForDirectory.potential || 'Medio'}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground font-semibold uppercase">Última Visita</span>
                  <p className="text-sm">{selectedCenterForDirectory.last_visit || 'N/A'}</p>
                </div>
              </div>
            )}

            <div className="border-t pt-4">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Directorio Médico
              </h3>

              {centerDoctors.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p>No hay médicos registrados en este centro aún.</p>
                  <div className="flex justify-center mt-2">
                    <Button variant="link" onClick={handleSync}>Intentar Sincronizar</Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(centerDoctors.reduce((acc: any, doctor: any) => {
                    const spec = doctor.specialty || 'Sin Especialidad';
                    if (!acc[spec]) acc[spec] = [];
                    acc[spec].push(doctor);
                    return acc;
                  }, {})).map(([specialty, doctors]: [string, any]) => (
                    <div key={specialty} className="border rounded-lg p-4 bg-card">
                      <h3 className="font-semibold text-primary mb-3 flex items-center gap-2">
                        <Stethoscope className="h-4 w-4" />
                        {specialty} <Badge variant="secondary" className="ml-2">{(doctors as any[]).length}</Badge>
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {(doctors as any[]).map((doc: any) => (
                          <div key={doc.id} className="flex items-start gap-3 p-2 hover:bg-muted/50 rounded-md transition-colors border border-transparent hover:border-muted">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                              {doc.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-medium text-sm">{doc.name}</div>
                              <div className="text-xs text-muted-foreground flex flex-col">
                                {doc.phone && <span>📞 {doc.phone}</span>}
                                {doc.email && <span>📧 {doc.email}</span>}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}