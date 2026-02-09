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
import { read, utils } from 'xlsx';
import { FileSpreadsheet, HelpCircle, Upload } from "lucide-react";
import { AdminDataFilter } from "@/components/admin/AdminDataFilter";
import { useNavigate } from "react-router-dom";
import { getStatesInRegion } from "@/constants/regions";
import { useDemoData } from "@/contexts/MockDataProvider";
import { PremiumEmptyState } from "@/components/ui/PremiumEmptyState";

interface AdminFilterState {
  region?: string;
  state?: string;
  zoneId?: string;
  repId?: string;
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
      // Query with contacts join
      let query: any = supabase
        .from('visits')
        .select(`
          *,
          contacts(name, specialty, address, email, phone, priority)
        `)
        .eq('organization_id', organizationId);

      if (isSupervisor && zoneId) {
        // Supervisor: Base scope is their zone, but AdminFilter can refine it
        if (adminFilters.repId && adminFilters.repId !== 'all') {
          query = query.eq('user_id', adminFilters.repId);
        } else if (adminFilters.zoneId && adminFilters.zoneId !== 'all') {
          query = query.eq('zone_id', adminFilters.zoneId);
        } else {
          query = query.eq('zone_id', zoneId);
        }
      } else if (!canViewAllData) {
        // Representative: Restricted to their own data
        query = query.eq('user_id', user.id);
      } else {
        // Master/Manager: Full access narrowed by admin filters
        if (adminFilters.repId && adminFilters.repId !== 'all') {
          query = query.eq('user_id', adminFilters.repId);
        } else if (adminFilters.zoneId && adminFilters.zoneId !== 'all') {
          query = query.eq('zone_id', adminFilters.zoneId);
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
        visit.contacts?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        visit.contacts?.specialty?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
        const bstr = event.target?.result;
        const wb = read(bstr, { type: 'binary' });
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestión de Visitas</h1>
          <p className="text-muted-foreground">Administra y realiza seguimiento de todas tus visitas médicas</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={() => setShowHelp(!showHelp)} title="Ver Ayuda">
            <span className="sr-only">Ayuda</span>
            <Lightbulb className="h-5 w-5 text-yellow-500" />
          </Button>
          {/* ... buttons ... */}
        </div>
      </div>

      {showHelp && (
        <InstructionCard
          title="Planificación y Reporte de Visitas"
          description="Organiza tu agenda diaria. Recuerda planificar tus visitas con antelación."
          items={[
            "Usa 'Nueva Visita' para agendar una cita individual.",
            "Al finalizar una visita, márcala como 'Completada' para reportar el resultado.",
            "Usa la vista de Calendario para ver tu distribución mensual."
          ]}
        />
      )}

      <Button variant="outline" onClick={handlePrint}>
        <Printer className="mr-2 h-4 w-4" />
        Imprimir
      </Button>
      <Button variant="outline" size="icon" onClick={() => setHelpDialogOpen(true)} title="Ayuda Importación">
        <HelpCircle className="h-4 w-4" />
      </Button>
      <Button variant="outline" onClick={triggerImport} disabled={importing}>
        {importing ? <FileSpreadsheet className="mr-2 h-4 w-4 animate-pulse" /> : <Upload className="mr-2 h-4 w-4" />}
        Importar
      </Button>
      <input
        id="import-visits-input"
        type="file"
        accept=".xlsx, .xls, .csv"
        className="hidden"
        onChange={handleImport}
      />
      <Button variant="outline" onClick={() => exportToCSV(filteredVisits, 'visitas')}>
        <Download className="mr-2 h-4 w-4" />
        Exportar
      </Button>
      {/* Nueva Visita Button via State */}
      <Button className="btn-medical" onClick={() => setWizardOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Nueva Visita
      </Button>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="medical-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Visitas</p>
                <p className="text-2xl font-bold text-foreground">{visitsByStatus.total}</p>
              </div>
              <FileText className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="medical-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completadas</p>
                <p className="text-2xl font-bold text-success">{visitsByStatus.completed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card className="medical-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Programadas</p>
                <p className="text-2xl font-bold text-warning">{visitsByStatus.scheduled}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card className="medical-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Canceladas</p>
                <p className="text-2xl font-bold text-destructive">{visitsByStatus.cancelled}</p>
              </div>
              <XCircle className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
      </div >

      {/* Admin Filters (only for Master/Manager) */}
      {
        (canViewAllData || isSupervisor) && (
          <AdminDataFilter
            onFilterChange={setAdminFilters}
          />
        )
      }

      {/* Filters */}
      <Card className="medical-card">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar por médico, especialidad o objetivo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="scheduled">Programadas</SelectItem>
                <SelectItem value="completed">Completadas</SelectItem>
                <SelectItem value="cancelled">Canceladas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Visits List */}
      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list">Vista Lista</TabsTrigger>
          <TabsTrigger value="calendar">Vista Calendario</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {filteredVisits.map((visit) => (
            <Card key={visit.id} className="medical-card-hover">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex gap-2 items-center">
                        <h3 className="text-lg font-semibold text-foreground">
                          {visit.contacts?.name || "Contacto no disponible"}
                        </h3>
                        {visit.contacts?.potential === 'Alto' && (
                          <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-[10px] h-5 px-1.5 font-bold animate-pulse">
                            PARETO A
                          </Badge>
                        )}

                        {/* Edit and Delete Actions */}
                        <div className="flex gap-1">
                          {/* TODO: Add edit functionality */}
                          {/*
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <Edit className="h-3 w-3" />
                          </Button>
                          */}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive">
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Eliminar visita?</AlertDialogTitle>
                                <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(visit.id)}>Eliminar</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                      <Badge className={getStatusColor(visit.status)}>
                        {getStatusIcon(visit.status)}
                        <span className="ml-1">{getStatusText(visit.status)}</span>
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <User className="h-4 w-4 mr-2" />
                          {visit.contacts?.specialty || "Especialidad no especificada"}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4 mr-2" />
                          {visit.contacts?.address || "Dirección no disponible"}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4 mr-2" />
                          {new Date(visit.scheduled_date).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="h-4 w-4 mr-2" />
                          {new Date(visit.scheduled_date).toLocaleTimeString('es-ES', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>

                    {visit.objective && (
                      <p className="text-sm text-foreground mb-4 p-3 bg-muted/50 rounded-lg">
                        <strong>Objetivo:</strong> {visit.objective}
                      </p>
                    )}

                    <div className="flex items-center space-x-2">
                      {/* TODO: Add view details dialog */}
                      {/*
                      <Button variant="outline" size="sm">
                        Ver Detalles
                      </Button>
                      */}

                      {visit.status === 'completed' && (
                        <VisitReportDialog
                          trigger={
                            <Button variant="outline" size="sm" className="btn-success">
                              Ver Reporte
                            </Button>
                          }
                          visitData={visit}
                        />
                      )}

                      {visit.status === 'scheduled' && (
                        <Button
                          size="sm"
                          className="btn-medical"
                          onClick={() => navigate(`/visits/execution/${visit.id}`)}
                        >
                          Iniciar Visita
                        </Button>
                      )}

                      {visit.status === 'in_progress' && (
                        <Button
                          size="sm"
                          className="btn-medical bg-amber-500 hover:bg-amber-600"
                          onClick={() => navigate(`/visits/execution/${visit.id}`)}
                        >
                          <Clock className="w-4 h-4 mr-2" />
                          Retomar Visita
                        </Button>
                      )}
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

        <TabsContent value="calendar" className="space-y-4">
          <Card className="medical-card">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-8">
                {/* Calendar Component */}
                <div className="flex-1 flex justify-center">
                  {/* We can use the simple shadcn/ui Calendar if installed, or build a simple grid. 
                             Assuming shadcn Calendar component is available @/components/ui/calendar 
                             If not, we'll assume a standard DayPicker implementation or similar.
                             For now, I'll use a widely compatible approach or assume standard Shadcn Calendar import.
                         */}
                  <div className="w-full max-w-md">
                    <div className="bg-muted/10 p-4 rounded-lg border">
                      <h3 className="text-lg font-semibold text-center mb-4 text-primary">Calendario de Visitas</h3>
                      <div className="grid grid-cols-7 gap-1 text-center font-medium text-sm text-muted-foreground mb-2">
                        <div>Dom</div><div>Lun</div><div>Mar</div><div>Mié</div><div>Jue</div><div>Vie</div><div>Sáb</div>
                      </div>
                      {/* Simple Logic to render current month's calendar */}
                      <SimpleCalendarPreview visits={visits} />
                    </div>
                  </div>
                </div>

                {/* Side Panel: Visits for Selected Month/Day */}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-4">Resumen del Mes</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-green-50 rounded-lg border border-green-100 dark:bg-green-900/20 dark:border-green-900/50">
                        <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                          {visitsByStatus.completed}
                        </div>
                        <div className="text-sm text-green-600 dark:text-green-500">Completadas</div>
                      </div>
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 dark:bg-blue-900/20 dark:border-blue-900/50">
                        <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                          {visitsByStatus.scheduled}
                        </div>
                        <div className="text-sm text-blue-600 dark:text-blue-500">Programadas</div>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <h4 className="font-medium mb-2 text-sm text-muted-foreground">Próximas Visitas</h4>
                      <div className="space-y-2 max-h-[300px] overflow-y-auto">
                        {visits
                          .filter(v => new Date(v.scheduled_date) >= new Date() && v.status === 'scheduled')
                          .slice(0, 5)
                          .map(v => (
                            <div key={v.id} className="flex items-center justify-between p-3 bg-muted/50 rounded text-sm">
                              <div>
                                <p className="font-medium">{v.contacts?.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(v.scheduled_date).toLocaleDateString()}
                                </p>
                              </div>
                              <Badge variant="outline">Programada</Badge>
                            </div>
                          ))
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <Dialog open={helpDialogOpen} onOpenChange={setHelpDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Ayuda - Importación de Visitas</DialogTitle>
            <DialogDescription>
              Asegúrese de que los contactos ya existan en su agenda antes de importar las visitas.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm">El archivo debe contener las siguientes columnas:</p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Columna</TableHead>
                  <TableHead>Descripción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-mono">Contacto</TableCell>
                  <TableCell>Nombre exacto del contacto (Médico/Farmacia) *Requerido</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono">Fecha</TableCell>
                  <TableCell>Fecha de la visita (YYYY-MM-DD)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono">Hora</TableCell>
                  <TableCell>Hora programada (HH:MM)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono">Tipo</TableCell>
                  <TableCell>'Medico' o 'Farmacia'</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono">Objetivo</TableCell>
                  <TableCell>Objetivo de la visita</TableCell>
                </TableRow>
              </TableBody>
            </Table>
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
          <span className="absolute bottom-1 w-1 h-1 rounded-full bg-primary"></span>
        )}
      </div>
    );
  }

  return <div className="grid grid-cols-7 gap-1">{days}</div>;
}

