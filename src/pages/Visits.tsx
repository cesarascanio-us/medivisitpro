/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import { useState, useEffect } from "react";
import { InstructionCard } from "@/components/ui/InstructionCard";
import { FileText, Plus, Calendar, MapPin, Clock, User, CheckCircle, XCircle, AlertCircle, Printer, Download, Trash2, Edit, Lightbulb } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QuickScheduleWizard } from "@/components/visits/QuickScheduleWizard";
import { VisitReportDialog } from "@/components/visits/VisitReportDialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { exportToCSV, handlePrint } from "@/utils/exportUtils";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileSpreadsheet, HelpCircle, Upload } from "lucide-react";
import { AdminDataFilter } from "@/components/admin/AdminDataFilter";
import { useNavigate } from "react-router-dom";
import { getStatesInRegion } from "@/constants/regions";
import { useDemoData } from "@/contexts/MockDataProvider";
import { PremiumEmptyState } from "@/components/ui/PremiumEmptyState";
import { cn } from "@/lib/utils";
import { EliteHeader, EliteKPICard } from "@/components/layout/DesignSystem";
import { ArrowRight } from "lucide-react";

interface AdminFilterState {
  region?: string;
  state?: string;
  zoneId?: string;
  userId?: string;
}

export default function Visits() {
  const navigate = useNavigate();
  const [visits, setVisits] = useState<any[]>([]);
  const [filteredVisits, setFilteredVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { user, canViewAllData, isSupervisor, zoneId, organizationId } = useAuth();
  const { toast } = useToast();
  const [importing, setImporting] = useState(false);
  const [helpDialogOpen, setHelpDialogOpen] = useState(false);
  const [adminFilters, setAdminFilters] = useState<AdminFilterState>({});
  const [wizardOpen, setWizardOpen] = useState(false);

  // Demo mode hook
  const demoData = useDemoData();

  useEffect(() => {
    loadVisits();
  }, [user, adminFilters]);

  useEffect(() => {
    filterVisits();
  }, [visits, searchTerm, statusFilter]);

  const loadVisits = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    // DEMO MODE: Use mock data
    if (demoData) {
      console.log("Visits: Using mock demo data");
      setVisits(demoData.visits as any[]);
      setLoading(false);
      return;
    }

    try {
      // 0. Preparar IDs territoriales para triangulación
      let zoneIds: string[] = [];

      if (adminFilters.state && adminFilters.state !== 'all') {
          const { data: zoneData } = await supabase.from('zones').select('id').eq('state', adminFilters.state);
          zoneIds = zoneData?.map(z => z.id) || [];
      } else if (adminFilters.region && adminFilters.region !== 'all') {
          const { data: zoneData } = await supabase.from('zones').select('id').eq('region', adminFilters.region);
          zoneIds = zoneData?.map(z => z.id) || [];
      }

      // 1. Continous Query Configuration
      let query: any = supabase
        .from('visits')
        .select(`
          *,
          unified_contacts(full_name, specialty, address, email, phone, priority, potential)
        `)
        .eq('organization_id', organizationId);

      if (isSupervisor && zoneId) {
        if (adminFilters.userId && adminFilters.userId !== 'all') {
          query = query.eq('user_id', adminFilters.userId);
        } else if (adminFilters.zoneId && adminFilters.zoneId !== 'all') {
          query = query.eq('zone_id', adminFilters.zoneId);
        } else {
          query = query.eq('zone_id', zoneId);
        }
      } else if (!canViewAllData) {
        query = query.eq('user_id', user.id);
      } else {
        // Master/Manager: Full access narrowed by admin filters
        if (adminFilters.userId && adminFilters.userId !== 'all') {
          query = query.eq('user_id', adminFilters.userId);
        } else if (adminFilters.zoneId && adminFilters.zoneId !== 'all') {
          query = query.eq('zone_id', adminFilters.zoneId);
        } else if (zoneIds.length > 0) {
          query = query.in('zone_id', zoneIds);
        }
      }

      const { data, error } = await query.order('scheduled_date', { ascending: false });

      if (error) throw error;

      setVisits(data || []);
    } catch (error) {
      console.error('Error loading visits:', error, {
        message: (error as any)?.message || error,
        details: (error as any)?.details,
        code: (error as any)?.code
      });
      toast({
        title: "Error",
        description: "No se pudieron cargar las visitas.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('visits')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: "Visita eliminada", description: "La visita ha sido eliminada." });
      loadVisits();
    } catch (error) {
      console.error('Error deleting visit:', error);
      toast({ title: "Error", description: "No se pudo eliminar la visita.", variant: "destructive" });
    }
  }

  const filterVisits = () => {
    let filtered = visits;

    if (searchTerm) {
      filtered = filtered.filter(visit =>
        visit.unified_contacts?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        visit.unified_contacts?.specialty?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        visit.objective?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(visit => visit.status === statusFilter);
    }

    setFilteredVisits(filtered);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      case 'scheduled':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'status-active';
      case 'cancelled':
        return 'bg-destructive/10 text-destructive border border-destructive/20';
      case 'scheduled':
        return 'status-pending';
      default:
        return 'status-inactive';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completada';
      case 'cancelled':
        return 'Cancelada';
      case 'scheduled':
        return 'Programada';
      default:
        return 'Pendiente';
    }
  };

  const visitsByStatus = {
    total: visits.length,
    completed: visits.filter(v => v.status === 'completed').length,
    scheduled: visits.filter(v => v.status === 'scheduled').length,
    cancelled: visits.filter(v => v.status === 'cancelled').length
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const { read, utils } = await import('xlsx');
        const bstr = event.target?.result;
        const wb = read(bstr as string, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = utils.sheet_to_json(ws);

        if (data.length === 0) {
          throw new Error("El archivo está vacío");
        }

        // Helper to normalize strings (remove accents, lowercase)
        const normalize = (str: string) => {
          return str.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        };

        // Fetch contacts to map names to IDs
        const { data: contactsData } = await supabase
          .from('contacts')
          .select('id, name')
          .eq('user_id', user?.id);

        const contactMap = new Map(contactsData?.map(c => [normalize(c.name), c.id]) || []);

        const missingContacts: string[] = [];
        const visitsToInsert: any[] = [];
        let headersFound: string[] = [];

        if (data.length > 0) {
          headersFound = Object.keys(data[0] as object);
        }

        data.forEach((row: any) => {
          // Try multiple column names for Contact, prioritizing Names over Refs/IDs
          const rowName = (
            row['Contacto'] ||
            row['Nombre Contacto'] ||
            row['Nombre'] ||
            row['Farmacia Visitada'] ||
            row['Medico Visitado'] ||
            row['Médico Visitado'] ||
            row['Farmacia'] ||
            row['Medico'] ||
            row['Médico'] ||
            row['Doctor'] ||
            // Fallbacks (might be IDs, but giving it a shot if names are missing)
            row['Farmacia Visitada Ref'] ||
            row['Medico Visitado Ref'] ||
            row['Médico Visitado Ref'] ||
            ''
          ).toString();

          const normalizedName = normalize(rowName);

          // If the detected name is purely numeric, it's likely an ID which we can't map.
          if (/^\d+$/.test(normalizedName)) {
            // Verify if we have a special legacy mapping (future feature). For now, treat as invalid format.
            if (!missingContacts.includes(`${rowName} (ID Numérico - Requiere Nombre)`)) {
              missingContacts.push(`${rowName} (ID Numérico - Requiere Nombre)`);
            }
            return;
          }

          if (!normalizedName) return; // Skip empty rows

          const contactId = contactMap.get(normalizedName);

          if (!contactId) {
            // If not found by name, check if it looks like a legacy ID (number)
            // and pass it through blindly to Supabase. Supabase will error if it doesn't exist,
            // but user might have these IDs in their contacts.
            if (/^\d+$/.test(normalizedName)) {
              // It's a number, use it as ID directly (assuming user knows what they are doing)
              // Wait! Supabase uses UUIDs. If these are legacy INT ids, they won't match UUIDs.
              // UNLESS the user has a column for Legacy ID.
              // But for now, let's treat these as "Missing" and tell the user they need NAMES.
              if (!missingContacts.includes(rowName)) missingContacts.push(rowName);
              return;
            }

            if (!missingContacts.includes(rowName)) missingContacts.push(rowName);
            return;
          }

          // Date parsing
          let dateStr = row['Fecha'] || row['FechaHora'] || row['Fecha Visita'] || new Date().toISOString().split('T')[0];
          // If it's a full ISO string/date-time, extract just YYYY-MM-DD
          if (dateStr && typeof dateStr === 'string' && dateStr.includes('T')) dateStr = dateStr.split('T')[0];

          // Time parsing
          let timeStr = row['Hora'] || row['Hora Llegada'] || row['Hora Visita'] || '09:00';
          // Simple clean up if time includes seconds or other junk
          if (timeStr && typeof timeStr === 'string' && timeStr.length > 5) timeStr = timeStr.substring(0, 5);

          // Visit Type parsing
          const typeVal = (row['Tipo'] || row['Tipo Contacto Visitado'] || '').toLowerCase();
          const visitType = (typeVal.includes('farmacia') || typeVal.includes('pharmacy')) ? 'pharmacy' : 'doctor';

          visitsToInsert.push({
            user_id: user?.id,
            contact_id: contactId,
            scheduled_date: `${dateStr}T${timeStr}:00`,
            arrival_time: row['Hora Llegada'] || null,
            departure_time: row['Hora Salida'] || null,
            visit_type: visitType,
            status: row['Estado_Visita'] === 'Realizada' ? 'completed' : 'scheduled',
            objective: row['Objetivo'] || null,
            notes: row['Notas'] || null,
          });
        });

        if (visitsToInsert.length === 0) {
          if (missingContacts.length === 0) {
            // No valid rows found at all -> Column mismatch likely
            toast({
              title: "Error de Formato",
              description: `No se encontró la columna 'Contacto'. Columnas detectadas: ${headersFound.join(", ")}`,
              variant: "destructive"
            });
          } else {
            const missingSample = missingContacts.slice(0, 3).join(", ");
            toast({
              title: "Error de Coincidencia",
              description: `No se encontró ningún contacto. Ejemplos fallidos: ${missingSample}... Verifique los nombres.`,
              variant: "destructive"
            });
          }
        } else {
          const { error } = await supabase.from('visits').insert(visitsToInsert);
          if (error) throw error;

          if (missingContacts.length > 0) {
            toast({
              title: "⚠️ Importación Parcial",
              description: `Se importaron ${visitsToInsert.length} visitas. No se encontraron ${missingContacts.length} contactos (ej: ${missingContacts[0]}).`,
              // variant: "warning" is not supported, using default
            });
          } else {
            toast({
              title: "Importación exitosa",
              description: `Se han importado ${visitsToInsert.length} visitas correctamente.`
            });
          }
          loadVisits();
        }
      } catch (error) {
        console.error("Error importing:", error);
        toast({
          title: "Error de importación",
          description: "Hubo un problema al leer el archivo. Verifique el formato.",
          variant: "destructive"
        });
      } finally {
        setImporting(false);
        // Reset input
        e.target.value = '';
      }
    };
    reader.readAsBinaryString(file);
  };

  const triggerImport = () => {
    document.getElementById('import-visits-input')?.click();
  };


  // ... code
  const [showHelp, setShowHelp] = useState(false);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <EliteHeader 
        title="Agenda de Visitas"
        subtitle="Seguimiento de actividad comercial y reportes"
        icon={Calendar}
        badgeText="Visitas"
        statusText="Control de actividad activo"
        statusColor="bg-emerald-500"
        rightContent={
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setShowHelp(!showHelp)} className={cn("h-12 w-12 rounded-xl transition-all", showHelp ? "bg-amber-50 text-amber-500 shadow-inner" : "hover:bg-slate-50 text-slate-400")}>
              <Lightbulb className="h-5 w-5" />
            </Button>
            <Button className="h-14 px-8 bg-primary hover:bg-primary/90 text-white rounded-xl shadow-md font-bold text-xs transition-all active:scale-95 flex items-center gap-2" onClick={() => setWizardOpen(true)}>
              <Plus className="h-5 w-5" />
              Nueva Visita
            </Button>
          </div>
        }
      />

      {showHelp && (
        <InstructionCard
          title="Guía de uso: Visitas"
          description="Estandarización de la agenda y reporte de resultados comerciales."
          items={[
            "Carga masiva: Utiliza la importación para planificar ciclos de trabajo completos.",
            "Ejecución: Inicia la visita desde el panel para registrar el seguimiento en vivo.",
            "Reporte: Completa el análisis de resultados inmediatamente al finalizar la visita."
          ]}
        />
      )}

      {/* Admin Filters (only for Master/Manager) */}
      {(canViewAllData || isSupervisor) && <AdminDataFilter onFilterChange={setAdminFilters} moduleType="visits" />}

      {/* Industrial Tools Area */}
      <div className="flex flex-wrap items-center gap-4 bg-card/50 backdrop-blur-sm p-4 rounded-2xl border border-slate-100 shadow-sm">
        <Button variant="outline" onClick={handlePrint} className="h-10 px-6 border-slate-200 rounded-lg font-bold text-xs hover:bg-card transition-all group">
          <Printer className="mr-2 h-4 w-4 text-slate-400 group-hover:text-primary" />
          Imprimir reporte
        </Button>
        <div className="flex items-center h-10 shadow-sm rounded-lg overflow-hidden border border-slate-200">
          <Button variant="ghost" className="h-full bg-card border-r border-slate-200 px-6 font-bold text-xs hover:bg-slate-50 transition-all group" onClick={triggerImport} disabled={importing}>
            {importing ? <FileSpreadsheet className="mr-2 h-4 w-4 animate-pulse text-primary" /> : <Upload className="mr-2 h-4 w-4 text-slate-400 group-hover:text-primary" />}
            Importar ciclo
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setHelpDialogOpen(true)} className="h-full w-10 bg-card hover:bg-blue-50 text-slate-400 hover:text-blue-500">
            <HelpCircle className="h-4 w-4" />
          </Button>
        </div>
        <Button variant="outline" onClick={() => exportToCSV(filteredVisits, 'visitas')} className="h-10 px-6 border-slate-200 rounded-lg font-bold text-xs hover:bg-card transition-all group">
          <Download className="mr-2 h-4 w-4 text-slate-400 group-hover:text-primary" />
          Exportar datos
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <EliteKPICard 
              title="Total visitas" 
              value={visitsByStatus.total.toString()} 
              subtitle="Carga operativa"
              icon={FileText}
              color="blue"
              onClick={() => setStatusFilter("all")}
              isActive={statusFilter === "all"}
          />
          <EliteKPICard 
              title="Completadas" 
              value={visitsByStatus.completed.toString()} 
              subtitle="Gestiones cerradas"
              icon={CheckCircle}
              trend={visitsByStatus.total > 0 ? (visitsByStatus.completed / visitsByStatus.total) * 100 : 0}
              color="emerald"
              onClick={() => setStatusFilter("completed")}
              isActive={statusFilter === "completed"}
          />
          <EliteKPICard 
              title="Programadas" 
              value={visitsByStatus.scheduled.toString()} 
              subtitle="Pendientes en agenda"
              icon={Calendar}
              color="amber"
              onClick={() => setStatusFilter("scheduled")}
              isActive={statusFilter === "scheduled"}
          />
          <EliteKPICard 
              title="Canceladas" 
              value={visitsByStatus.cancelled.toString()} 
              subtitle="No realizadas"
              icon={XCircle}
              color="rose"
              onClick={() => setStatusFilter("cancelled")}
              isActive={statusFilter === "cancelled"}
          />
      </div>



      {/* Filters - PRECISION TOOLS */}
      <Card className="border-slate-100 shadow-sm bg-card rounded-2xl overflow-hidden">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Input
                placeholder="Buscar por médico, especialidad u objetivo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-12 bg-slate-50 border-none focus-visible:ring-primary rounded-xl px-6 font-semibold text-xs shadow-inner placeholder:text-slate-400 text-slate-900"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-12 w-full md:w-56 bg-slate-50 border-none focus:ring-primary rounded-xl font-bold text-xs shadow-inner text-slate-900">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-200">
                <SelectItem value="all">Todas las visitas</SelectItem>
                <SelectItem value="scheduled">Programadas</SelectItem>
                <SelectItem value="completed">Completadas</SelectItem>
                <SelectItem value="cancelled">Canceladas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Visits List - OPERATIONAL VIEWPORT */}
      <Tabs defaultValue="list" className="w-full space-y-8">
        <TabsList className="flex w-full md:w-96 p-1 bg-slate-50 rounded-2xl border border-border/40 shadow-inner text-slate-900">
          <TabsTrigger value="list" className="flex-1 rounded-xl font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-premium-sm transition-all h-10">Vista Operativa</TabsTrigger>
          <TabsTrigger value="calendar" className="flex-1 rounded-xl font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-premium-sm transition-all h-10">Vista Calendario</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
          {filteredVisits.map((visit) => (
            <Card key={visit.id} className="border-border/40 shadow-premium-sm bg-card rounded-[2.5rem] overflow-hidden hover:shadow-premium-md hover:border-primary/20 transition-all duration-500 group">
              <CardContent className="p-8">
                <div className="flex flex-col lg:flex-row gap-8">
                  {/* Left Side: Contact Info */}
                  <div className="flex-1 space-y-6">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center border border-border/40 group-hover:bg-primary/5 group-hover:border-primary/10 transition-colors text-slate-900">
                          <User className="h-6 w-6 text-slate-400 group-hover:text-primary transition-colors" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-foreground tracking-tight group-hover:text-primary transition-colors">
                            {visit.unified_contacts?.full_name || "Sin identificar"}
                          </h3>
                          <div className="flex items-center gap-3 mt-1">
                            <Badge className="bg-slate-100 text-slate-500 border-none font-black text-[9px] h-5 px-2 uppercase tracking-widest">
                              {visit.unified_contacts?.specialty || "General"}
                            </Badge>
                            {visit.unified_contacts?.potential === 'Alto' && (
                              <Badge className="bg-amber-100 text-amber-700 border-none text-[9px] h-5 px-2 font-black uppercase tracking-widest animate-pulse">
                                PARETO ELITE
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <Badge className={cn("px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest border-none shadow-soft flex items-center gap-2", getStatusColor(visit.status))}>
                        {getStatusIcon(visit.status)}
                        {getStatusText(visit.status)}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-muted/30 p-6 rounded-3xl border border-border/40">
                      <div className="space-y-3">
                        <div className="flex items-center text-xs font-bold text-slate-500 uppercase tracking-tight">
                          <MapPin className="h-4 w-4 mr-3 text-primary" />
                          <span className="truncate">{visit.unified_contacts?.address || "Ubicación Geográfica Protegida"}</span>
                        </div>
                        <div className="flex items-center text-xs font-bold text-slate-500 uppercase tracking-tight">
                          <Clock className="h-4 w-4 mr-3 text-primary" />
                          {new Date(visit.scheduled_date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} Horas
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center text-xs font-bold text-slate-500 uppercase tracking-tight">
                          <Calendar className="h-4 w-4 mr-3 text-primary" />
                          {new Date(visit.scheduled_date).toLocaleDateString('es-ES', { day: '2-digit', month: 'long' })}
                        </div>
                        <div className="flex items-center text-xs font-bold text-slate-500 uppercase tracking-tight">
                          <FileText className="h-4 w-4 mr-3 text-primary" />
                          ID: {visit.id.substring(0, 8).toUpperCase()}
                        </div>
                      </div>
                    </div>

                    {visit.objective && (
                      <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">Misión Operativa</p>
                        <p className="text-xs text-foreground/70 font-bold leading-relaxed">{visit.objective}</p>
                      </div>
                    )}
                  </div>

                  {/* Right Side: Actions */}
                  <div className="flex lg:flex-col justify-end gap-3 min-w-[200px]">
                    {visit.status === 'completed' && (
                      <VisitReportDialog
                        trigger={
                          <Button variant="outline" className="w-full h-12 border-slate-200 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-all">
                            Analizar Reporte
                          </Button>
                        }
                        visitData={visit}
                      />
                    )}

                    {visit.status === 'scheduled' && (
                      <Button
                        className="w-full h-14 bg-primary hover:bg-primary/90 text-white rounded-xl shadow-premium-md font-black uppercase text-[10px] tracking-widest transition-all active:scale-95"
                        onClick={() => navigate(`/visits/execution/${visit.id}`)}
                      >
                        Iniciar Misión
                      </Button>
                    )}

                    <div className="flex gap-2">
                       <Button variant="ghost" className="flex-1 h-12 rounded-xl text-slate-400 hover:text-primary hover:bg-slate-50">
                         <Edit className="h-4 w-4 mr-2" />
                         <span className="text-[10px] font-black uppercase tracking-widest">Editar</span>
                       </Button>
                       <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" className="h-12 w-12 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="rounded-[2rem] border-none shadow-premium-2xl font-display">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-2xl font-black text-foreground uppercase tracking-tighter">¿Abortar Registro?</AlertDialogTitle>
                            <AlertDialogDescription className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                              Esta acción eliminará permanentemente el registro de visita del sistema.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="mt-8">
                            <AlertDialogCancel className="h-12 rounded-xl font-black uppercase text-[10px] tracking-widest border-border/40">Ignorar</AlertDialogCancel>
                            <AlertDialogAction className="h-12 rounded-xl font-black uppercase text-[10px] tracking-widest bg-rose-500 hover:bg-rose-600" onClick={() => handleDelete(visit.id)}>Confirmar Eliminación</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredVisits.length === 0 && (
            <div className="medical-card mt-6">
              <PremiumEmptyState
                icon={FileText}
                title={searchTerm || statusFilter !== "all" ? "Sin resultados" : "Tu agenda está despejada"}
                description={searchTerm || statusFilter !== "all"
                  ? "Prueba ajustando los filtros de búsqueda para encontrar lo que buscas."
                  : "Es un buen momento para planificar tus próximas visitas y conquistar tu territorio."
                }
                actionLabel={searchTerm || statusFilter !== "all" ? undefined : "Programar Primera Visita"}
                onAction={searchTerm || statusFilter !== "all" ? undefined : () => setWizardOpen(true)}
              />
            </div>
          )}
        </TabsContent>

        <TabsContent value="calendar" className="animate-in slide-in-from-bottom-4 duration-500">
          <Card className="border-border/40 shadow-premium-lg bg-card rounded-[2.5rem] overflow-hidden">
            <CardContent className="p-10">
              <div className="flex flex-col xl:flex-row gap-12">
                {/* Calendar Component - MASTER VIEW */}
                <div className="flex-1">
                  <div className="bg-slate-50 p-8 rounded-[2rem] border border-border/40 shadow-inner text-slate-900">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-xl font-black text-foreground uppercase tracking-tighter font-display">Radar de Tiempos</h3>
                      <Badge className="bg-primary text-white border-none font-black text-[9px] px-3 py-1 uppercase tracking-widest shadow-premium-sm">Visión Mensual</Badge>
                    </div>
                    <div className="grid grid-cols-7 gap-2 text-center font-black text-[10px] text-slate-400 uppercase tracking-[0.2em] mb-6">
                      <div>Dom</div><div>Lun</div><div>Mar</div><div>Mié</div><div>Jue</div><div>Vie</div><div>Sáb</div>
                    </div>
                    <SimpleCalendarPreview visits={visits} />
                  </div>
                </div>

                {/* Side Panel: Summary - COMMAND SUMMARY */}
                <div className="w-full xl:w-96 space-y-8">
                  <div>
                    <h3 className="text-lg font-black text-foreground uppercase tracking-tighter font-display mb-6">Consolidado del Ciclo</h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="p-6 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 shadow-soft flex items-center justify-between">
                        <div>
                          <p className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.2em] mb-1">Misiones Exitosas</p>
                          <p className="text-3xl font-black text-emerald-700 dark:text-emerald-400 font-display">{visitsByStatus.completed}</p>
                        </div>
                        <CheckCircle className="h-10 w-10 text-emerald-500/50" />
                      </div>
                      <div className="p-6 bg-blue-500/10 rounded-2xl border border-blue-500/20 shadow-soft flex items-center justify-between">
                        <div>
                          <p className="text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em] mb-1">Misiones en Radar</p>
                          <p className="text-3xl font-black text-blue-700 dark:text-blue-400 font-display">{visitsByStatus.scheduled}</p>
                        </div>
                        <Calendar className="h-10 w-10 text-blue-500/50" />
                      </div>
                    </div>
                  </div>

                  <div className="pt-8 border-t border-border/40">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6">Próximos Despliegues</h4>
                    <div className="space-y-3">
                      {visits
                        .filter(v => new Date(v.scheduled_date) >= new Date() && v.status === 'scheduled')
                        .sort((a, b) => new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime())
                        .slice(0, 5)
                        .map(v => (
                          <div key={v.id} className="flex items-center justify-between p-4 bg-slate-50 hover:bg-card hover:shadow-premium-sm border border-transparent hover:border-border/40 rounded-2xl transition-all group text-slate-900">
                            <div className="flex items-center gap-4">
                               <div className="w-2 h-2 rounded-full bg-primary text-white" />
                               <div>
                                 <p className="text-[11px] font-black text-foreground uppercase tracking-tighter group-hover:text-primary transition-colors">{v.unified_contacts?.name || v.contacts?.name}</p>
                                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                   {new Date(v.scheduled_date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })} • {new Date(v.scheduled_date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                                 </p>
                               </div>
                            </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg group-hover:bg-primary group-hover:text-white transition-all" onClick={() => navigate(`/visits/execution/${v.id}`)}>
                               <ArrowRight className="h-4 w-4" />
                            </Button>
                          </div>
                        ))
                      }
                      {visits.filter(v => new Date(v.scheduled_date) >= new Date() && v.status === 'scheduled').length === 0 && (
                        <div className="text-center py-6">
                           <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Sin despliegues pendientes</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <Dialog open={helpDialogOpen} onOpenChange={setHelpDialogOpen}>
        <DialogContent className="max-w-[700px] bg-card rounded-[2.5rem] border-none shadow-premium-2xl p-0 overflow-hidden font-display">
          <div className="bg-slate-50 p-8 border-b border-border/40 text-slate-900">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-card flex items-center justify-center shadow-soft border border-slate-200">
                 <FileSpreadsheet className="h-6 w-6 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-xl font-black text-foreground uppercase tracking-tighter">Protocolo de Importación</DialogTitle>
                <DialogDescription className="text-slate-400 font-bold uppercase text-[9px] tracking-widest mt-1">Sincronización masiva de inteligencia operativa</DialogDescription>
              </div>
            </div>
          </div>
          <div className="p-10 space-y-8">
            <div className="bg-primary/5 p-6 rounded-3xl border border-primary/10 flex gap-5">
              <AlertCircle className="h-6 w-6 text-primary shrink-0" />
              <p className="text-xs font-bold text-slate-600 leading-relaxed uppercase tracking-tight">
                IMPORTANTE: Los contactos individuales (Médicos o Farmacias) deben existir previamente en su centro de mandos para garantizar la trazabilidad íntegra de la misión.
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Estructura del Manifiesto (Excel/CSV)</h4>
              <div className="rounded-[1.5rem] border border-border/40 overflow-hidden shadow-soft">
                <Table>
                  <TableHeader className="bg-slate-50 text-slate-900">
                    <TableRow className="border-border/40">
                      <TableHead className="font-black text-[10px] uppercase tracking-widest text-foreground py-4 px-6">Columna Maestra</TableHead>
                      <TableHead className="font-black text-[10px] uppercase tracking-widest text-foreground py-4 px-6">Propósito Operativo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      { col: 'Contacto', desc: 'Nombre exacto registrado en MediVisitPro' },
                      { col: 'Fecha', desc: 'Formato ISO Estándar (YYYY-MM-DD)' },
                      { col: 'Hora', desc: 'Sincronización horaria (HH:MM)' },
                      { col: 'Tipo', desc: '"Medico" o "Farmacia" (Discriminador)' },
                      { col: 'Objetivo', desc: 'Descripción táctica de la visita' },
                    ].map((row, i) => (
                      <TableRow key={i} className="border-slate-50 hover:bg-muted/30 transition-colors">
                        <TableCell className="font-mono text-[11px] font-black text-primary py-4 px-6 uppercase">{row.col}</TableCell>
                        <TableCell className="text-[10px] font-bold text-slate-500 uppercase tracking-tight py-4 px-6">{row.desc}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="flex justify-end">
               <Button onClick={() => setHelpDialogOpen(false)} className="h-12 bg-slate-900 text-white rounded-xl px-10 font-black uppercase text-[10px] tracking-widest shadow-premium-md transition-all active:scale-95">
                 Entendido, Capitán
               </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <QuickScheduleWizard
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        onSuccess={loadVisits}
      />
    </div >
  );
}

// Simple internal component to render a calendar grid cleanly without external massive deps if not needed
function SimpleCalendarPreview({ visits }: { visits: any[] }) {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDay = firstDay.getDay(); // 0 = Sun

  const days = [];
  // Padding
  for (let i = 0; i < startingDay; i++) {
    days.push(<div key={`pad-${i}`} className="h-10"></div>);
  }

  // Days
  for (let i = 1; i <= daysInMonth; i++) {
    const dateStr = new Date(today.getFullYear(), today.getMonth(), i).toDateString();
    const visitsToday = visits.filter(v => new Date(v.scheduled_date).toDateString() === dateStr);
    const hasVisit = visitsToday.length > 0;
    const isToday = i === today.getDate();

    days.push(
      <div key={i} className={`h-10 w-full flex items-center justify-center rounded-md text-sm relative
                ${isToday ? 'bg-primary text-primary-foreground font-bold' : 'hover:bg-muted cursor-pointer'}
                ${hasVisit && !isToday ? 'bg-primary/10 font-semibold' : ''}
            `}>
        {i}
        {hasVisit && !isToday && (
          <span className="absolute bottom-1 w-1 h-1 rounded-full bg-primary text-white"></span>
        )}
      </div>
    );
  }

  return <div className="grid grid-cols-7 gap-1">{days}</div>;
}

