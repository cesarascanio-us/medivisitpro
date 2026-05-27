import { useState, useEffect } from "react";
import { InstructionCard } from "@/components/ui/InstructionCard";
import { FileText, Plus, Calendar, MapPin, Clock, User, CheckCircle, XCircle, AlertCircle, Printer, Download, Trash2, Edit, Lightbulb, FileSpreadsheet, HelpCircle, Upload, ArrowRight, Search, Filter, RefreshCw } from "lucide-react";
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
import { useOrganization } from "@/hooks/useOrganization";
import { useToast } from "@/hooks/use-toast";
import { exportToCSV, handlePrint } from "@/utils/exportUtils";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AdminDataFilter } from "@/components/admin/AdminDataFilter";
import { useNavigate } from "react-router-dom";
import { useDemoData } from "@/contexts/MockDataProvider";
import { PremiumEmptyState } from "@/components/ui/PremiumEmptyState";
import { cn } from "@/lib/utils";
import { EliteHeader, EliteKPICard, EliteTabsList, EliteTabsTrigger } from "@/components/layout/DesignSystem";
import { useTheme } from "@/context/ThemeContext";

interface AdminFilterState {
  region?: string;
  state?: string;
  zoneId?: string;
  userId?: string;
}

export default function Visits() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [visits, setVisits] = useState<any[]>([]);
  const [filteredVisits, setFilteredVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { user, canViewAllData, isSupervisor, zoneId } = useAuth();
  const { organization } = useOrganization();
  const organizationId = organization?.id;
  const organizationName = organization?.name;
  const { toast } = useToast();
  const [importing, setImporting] = useState(false);
  const [helpDialogOpen, setHelpDialogOpen] = useState(false);
  const [adminFilters, setAdminFilters] = useState<AdminFilterState>({});
  const [wizardOpen, setWizardOpen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const demoData = useDemoData();

  useEffect(() => {
    loadVisits();
  }, [user, adminFilters]);

  useEffect(() => {
    filterVisits();
  }, [visits, searchTerm, statusFilter]);

  const loadVisits = async () => {
    if (!user) { setLoading(false); return; }
    if (demoData) { setVisits(demoData.visits as any[]); setLoading(false); return; }

    try {
      let zoneIds: string[] = [];
      if (adminFilters.state && adminFilters.state !== 'all') {
          const { data: zoneData } = await supabase.from('zones').select('id').eq('state', adminFilters.state);
          zoneIds = zoneData?.map(z => z.id) || [];
      } else if (adminFilters.region && adminFilters.region !== 'all') {
          const { data: zoneData } = await supabase.from('zones').select('id').eq('region', adminFilters.region);
          zoneIds = zoneData?.map(z => z.id) || [];
      }

      if (!organizationId && !demoData) { setLoading(false); return; }

      let query: any = supabase.from('visits').select('*');
      if (organizationId) query = query.eq('organization_id', organizationId);
      if (isSupervisor && !canViewAllData && zoneId) {
        if (adminFilters.userId && adminFilters.userId !== 'all') query = query.eq('user_id', adminFilters.userId);
        else if (adminFilters.zoneId && adminFilters.zoneId !== 'all') query = query.eq('zone_id', adminFilters.zoneId);
        else query = query.eq('zone_id', zoneId);
      } else if (!canViewAllData && user?.id) query = query.eq('user_id', user.id);
      else {
        if (adminFilters.userId && adminFilters.userId !== 'all') query = query.eq('user_id', adminFilters.userId);
        else if (adminFilters.zoneId && adminFilters.zoneId !== 'all') query = query.eq('zone_id', adminFilters.zoneId);
        else if (zoneIds.length > 0) query = query.in('zone_id', zoneIds);
      }

      const { data: visitsData, error: visitsError } = await query.order('scheduled_date', { ascending: false });
      if (visitsError) throw visitsError;

      if (visitsData && visitsData.length > 0) {
        const contactIds = Array.from(new Set(visitsData.map(v => v.contact_id).filter(Boolean)));
        if (contactIds.length > 0) {
          const { data: contactsData, error: contactsError } = await supabase.from('unified_contacts').select('*').in('id', contactIds);
          if (!contactsError && contactsData) {
            const enrichedVisits = visitsData.map(visit => ({ ...visit, unified_contacts: contactsData.find(c => c.id === visit.contact_id) || null }));
            setVisits(enrichedVisits);
          } else setVisits(visitsData);
        } else setVisits(visitsData);
      } else setVisits([]);
    } catch (error) { console.error('Error loading visits:', error); } finally { setLoading(false); }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('visits').delete().eq('id', id);
      if (error) throw error;
      toast({ title: "Visita Cancelada", description: "El registro de visita ha sido eliminado del sistema." });
      loadVisits();
    } catch (error) { toast({ title: "Error de Sistema", description: "No se pudo eliminar el registro de visita.", variant: "destructive" }); }
  };

  const filterVisits = () => {
    let filtered = visits;
    if (searchTerm) {
      filtered = filtered.filter(visit =>
        visit.unified_contacts?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        visit.unified_contacts?.specialty?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        visit.objective?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (statusFilter !== "all") filtered = filtered.filter(visit => visit.status === statusFilter);
    setFilteredVisits(filtered);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      case 'scheduled': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'cancelled': return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'scheduled': return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      default: return 'bg-muted/10 text-muted-foreground border-border/40';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completada';
      case 'cancelled': return 'Cancelada';
      case 'scheduled': return 'Programada';
      default: return 'Pendiente';
    }
  };

  const visitsByStatus = {
    total: visits.length,
    completed: visits.filter(v => v.status === 'completed').length,
    scheduled: visits.filter(v => v.status === 'scheduled').length,
    cancelled: visits.filter(v => v.status === 'cancelled').length
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
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
        if (data.length === 0) throw new Error("Archivo vacío");
        const normalize = (str: string) => str.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const { data: contactsData } = await supabase.from('contacts').select('id, name').eq('user_id', user?.id);
        const contactMap = new Map(contactsData?.map(c => [normalize(c.name), c.id]) || []);
        const visitsToInsert: any[] = [];
        data.forEach((row: any) => {
          const rowName = (row['Contacto'] || row['Nombre'] || '').toString();
          const contactId = contactMap.get(normalize(rowName));
          if (!contactId) return;
          let dateStr = row['Fecha'] || new Date().toISOString().split('T')[0];
          let timeStr = row['Hora'] || '09:00';
          const visitType = (row['Tipo'] || '').toLowerCase().includes('farmacia') ? 'pharmacy' : 'doctor';
          visitsToInsert.push({ user_id: user?.id, contact_id: contactId, scheduled_date: `${dateStr}T${timeStr}:00`, visit_type: visitType, status: row['Estado'] === 'Realizada' ? 'completed' : 'scheduled', organization_id: organizationId, objective: row['Objetivo'] || null });
        });
        if (visitsToInsert.length > 0) {
          const { error } = await supabase.from('visits').insert(visitsToInsert);
          if (error) throw error;
          toast({ title: "Sincronización Exitosa", description: `Se han importado ${visitsToInsert.length} visitas al sistema.` });
          loadVisits();
        } else toast({ title: "Error de Mapeo", description: "No se detectaron contactos válidos en el reporte.", variant: "destructive" });
      } catch (error) { toast({ title: "Fallo de Importación", description: "Error en la estructura del archivo operativo.", variant: "destructive" }); }
      finally { setImporting(false); e.target.value = ''; }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="flex flex-col min-h-full space-y-10 animate-in fade-in duration-700 text-foreground pb-20">
      <EliteHeader 
        title={theme?.texts?.visits_title || "Historial de Visitas"}
        subtitle={theme?.texts?.visits_subtitle || organizationName || "Gestión de Visitas Biofarco"}
        icon={Calendar}
        badgeText="Seguimiento Activo"
        statusText={`${visits.length} Visitas Registradas`}
        statusColor="bg-emerald-500"
        rightContent={
          <div className="flex items-center gap-4">
            <Button variant="secondary" size="icon" onClick={() => setShowHelp(!showHelp)} className={cn("h-10 w-10 p-0", showHelp && "bg-primary/10 text-primary border-primary/20")}>
              <Lightbulb className="h-5 w-5" />
            </Button>
            <Button variant="default" size="sm" onClick={() => setWizardOpen(true)}>
              <Plus className="h-4 w-4 mr-2" /> Nueva Visita
            </Button>
          </div>
        }
      />

      {showHelp && (
        <InstructionCard
          title="Guía de Gestión: Visitas"
          description="Estandarización de la agenda y reporte de resultados comerciales de alto impacto."
          items={["Importación: Sincronice ciclos de trabajo completos mediante reportes Excel/CSV.", "Panel en Vivo: Inicie la visita desde el panel para registro de geolocalización activa.", "Post-Visita: Consolide el análisis de resultados inmediatamente al finalizar el contacto."]}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <EliteKPICard title="Total Visitas" value={visitsByStatus.total} subtitle="Carga operativa total" icon={FileText} color="blue" />
          <EliteKPICard title="Completadas" value={visitsByStatus.completed} subtitle="Visitas cerradas" icon={CheckCircle} color="emerald" trend={visitsByStatus.total > 0 ? (visitsByStatus.completed / visitsByStatus.total) * 100 : 0} />
          <EliteKPICard title="En Agenda" value={visitsByStatus.scheduled} subtitle="Próximas actividades" icon={Calendar} color="amber" />
          <EliteKPICard title="Canceladas" value={visitsByStatus.cancelled} subtitle="Registros anulados" icon={XCircle} color="rose" />
      </div>

      {(canViewAllData || isSupervisor) && <AdminDataFilter onFilterChange={setAdminFilters} moduleType="visits" />}

      <div className="flex flex-wrap items-center gap-4 bg-muted/10 p-6 rounded-lg border border-border/40">
        <Button variant="ghost" size="sm" onClick={handlePrint} className="h-10 border border-border/40 bg-card">
          <Printer className="h-4 w-4 mr-2 text-primary" /> Imprimir Reporte
        </Button>
        <div className="flex items-center h-10 rounded-lg overflow-hidden border border-border/40 bg-card">
          <Button variant="ghost" size="sm" className="h-full px-8 border-none" onClick={() => document.getElementById('import-input')?.click()} disabled={importing}>
            {importing ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />} Importar Ciclo
          </Button>
          <input type="file" id="import-input" className="hidden" onChange={handleImport} accept=".xlsx,.csv" />
          <Button variant="ghost" size="icon" onClick={() => setHelpDialogOpen(true)} className="h-full w-10 border-l border-border/40 rounded-none">
            <HelpCircle className="h-4 w-4" />
          </Button>
        </div>
        <Button variant="ghost" size="sm" onClick={() => exportToCSV(filteredVisits, 'visitas')} className="h-10 border border-border/40 bg-card">
          <Download className="h-4 w-4 mr-2 text-primary" /> Exportar Inteligencia
        </Button>
      </div>

      <Tabs defaultValue="list" className="w-full space-y-10">
        <EliteTabsList className="w-96">
          <EliteTabsTrigger value="list" label="Lista de Actividades" icon={FileText} />
          <EliteTabsTrigger value="calendar" label="Vista de Calendario" icon={Calendar} />
        </EliteTabsList>

        <TabsContent value="list" className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
          <Card className="p-8 shadow-premium-md rounded-lg">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 h-4 w-4" />
                <Input 
                  placeholder="Buscar visitas..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                  className="pl-12 h-10 rounded-lg"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-10 w-full md:w-72 bg-muted/5 border-border/40 rounded-lg font-black uppercase text-[10px] tracking-widest px-8">
                  <div className="flex items-center gap-3"><Filter className="h-4 w-4 text-primary" /><SelectValue placeholder="Estado de la Visita" /></div>
                </SelectTrigger>
                <SelectContent className="rounded-lg border-border/40 bg-card">
                  <SelectItem value="all" className="font-black uppercase text-[10px] tracking-widest py-3">Historial de Visitas</SelectItem>
                  <SelectItem value="scheduled" className="font-black uppercase text-[10px] tracking-widest py-3">Programadas</SelectItem>
                  <SelectItem value="completed" className="font-black uppercase text-[10px] tracking-widest py-3">Completadas</SelectItem>
                  <SelectItem value="cancelled" className="font-black uppercase text-[10px] tracking-widest py-3">Canceladas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>

          <div className="grid grid-cols-1 gap-8">
            {filteredVisits.map((visit) => (
              <Card key={visit.id} className="group overflow-hidden shadow-premium-md rounded-lg bg-card">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardContent className="p-10 relative z-10">
                  <div className="flex flex-col lg:flex-row gap-10">
                    <div className="flex-1 space-y-8">
                      <div className="flex flex-wrap items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                          <div className="w-16 h-16 rounded-lg bg-muted/20 flex items-center justify-center border border-border/40 group-hover:bg-primary/10 group-hover:border-primary/30 transition-all duration-500"><User className="h-7 w-7 text-primary" /></div>
                          <div className="flex flex-col gap-1">
                            <h3 className="text-xl font-black text-foreground uppercase tracking-tighter group-hover:text-primary transition-colors">{visit.unified_contacts?.name || "CONTACTO NO IDENTIFICADO"}</h3>
                            <div className="flex items-center gap-4 mt-1">
                              <Badge variant="outline" className="badge-elite-info text-xs">{visit.unified_contacts?.specialty || "SIN ESPECIALIDAD"}</Badge>
                              {visit.unified_contacts?.potential === 'Alto' && <Badge className="badge-elite-success animate-pulse text-xs">PARETO ELITE</Badge>}
                            </div>
                          </div>
                        </div>
                        <Badge className={cn("px-5 py-2 rounded-full font-black text-[10px] uppercase tracking-widest border shadow-sm flex items-center gap-3", getStatusColor(visit.status))}>{getStatusIcon(visit.status)} {getStatusText(visit.status)}</Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-muted/5 p-8 rounded-lg border border-border/40">
                        <div className="space-y-4">
                          <div className="flex items-center text-xs text-muted-foreground"><MapPin className="h-4 w-4 mr-4 text-primary" /><span className="truncate">{visit.unified_contacts?.address || "UBICACIÓN PROTEGIDA"}</span></div>
                          <div className="flex items-center text-xs text-muted-foreground"><Clock className="h-4 w-4 mr-4 text-primary" />{new Date(visit.scheduled_date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} HORAS</div>
                        </div>
                        <div className="space-y-4">
                          <div className="flex items-center text-xs text-muted-foreground"><Calendar className="h-4 w-4 mr-4 text-primary" />{new Date(visit.scheduled_date).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' }).toUpperCase()}</div>
                          <div className="flex items-center text-xs text-primary font-black uppercase tracking-widest"><FileText className="h-4 w-4 mr-4" /> ID: {visit.id.substring(0, 8).toUpperCase()}</div>
                        </div>
                      </div>
                      {visit.objective && (
                        <div className="p-6 bg-primary/5 rounded-lg border border-primary/10">
                          <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-2">Objetivo de Visita</p>
                          <p className="text-sm text-foreground/80 font-bold leading-relaxed">{visit.objective}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex lg:flex-col justify-end gap-4 min-w-[240px]">
                      {visit.status === 'completed' && (
                        <VisitReportDialog trigger={<Button variant="ghost" size="sm" className="w-full h-10 border border-border/40 bg-card">Analizar Reporte</Button>} visitData={visit} />
                      )}
                      {visit.status === 'scheduled' && (
                        <Button variant="default" size="lg" className="w-full h-11" onClick={() => navigate(`/visits/execution/${visit.id}`)}>
                          Iniciar Visita <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      )}
                      <div className="flex gap-3">
                         <Button variant="ghost" size="sm" className="flex-1 h-10 border border-border/40 bg-card">
                           <Edit className="h-4 w-4 mr-2 text-primary" /> Editar
                         </Button>
                         <AlertDialog>
                           <AlertDialogTrigger asChild>
                             <Button variant="ghost" size="icon" className="h-10 w-10 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 border border-border/40"><Trash2 className="h-5 w-5" /></Button>
                           </AlertDialogTrigger>
                           <AlertDialogContent className="rounded-lg border-border/40 bg-card p-10">
                             <AlertDialogHeader>
                               <AlertDialogTitle className="text-3xl font-black text-foreground uppercase tracking-tighter">¿Cancelar Registro?</AlertDialogTitle>
                               <AlertDialogDescription className="text-muted-foreground font-black uppercase text-[10px] tracking-widest opacity-70 mt-2">Esta acción eliminará permanentemente el registro de visita del sistema central.</AlertDialogDescription>
                             </AlertDialogHeader>
                             <AlertDialogFooter className="mt-10 gap-4">
                               <AlertDialogCancel className="h-10 px-8 rounded-lg">Ignorar</AlertDialogCancel>
                               <AlertDialogAction className="h-10 px-10 rounded-lg" onClick={() => handleDelete(visit.id)}>Confirmar Eliminación</AlertDialogAction>
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
              <PremiumEmptyState icon={FileText} title={searchTerm || statusFilter !== "all" ? "SISTEMA DESPEJADO" : "AGENDA DISPONIBLE"} description={searchTerm || statusFilter !== "all" ? "AJUSTE LOS FILTROS DE PRECISIÓN PARA ENCONTRAR REGISTROS." : "ES UN MOMENTO ÓPTIMO PARA PLANIFICAR EL PRÓXIMO CICLO DE VISITAS."} actionLabel={searchTerm || statusFilter !== "all" ? undefined : "Planificar Visita"} onAction={searchTerm || statusFilter !== "all" ? undefined : () => setWizardOpen(true)} />
            )}
          </div>
        </TabsContent>

        <TabsContent value="calendar" className="animate-in slide-in-from-bottom-4 duration-700">
          <Card className="p-12 shadow-premium-md rounded-lg">
            <div className="flex flex-col xl:flex-row gap-16">
              <div className="flex-1">
                <div className="bg-muted/5 p-10 rounded-lg border border-border/40">
                  <div className="flex items-center justify-between mb-10">
                    <h3 className="text-2xl font-black text-foreground uppercase tracking-tighter">Vista de Calendario</h3>
                    <Badge className="badge-elite-info px-4 py-1.5 rounded-full text-xs">Visión del Ciclo</Badge>
                  </div>
                  <SimpleCalendarPreview visits={visits} />
                </div>
              </div>
              <div className="w-full xl:w-[450px] space-y-12">
                <div>
                  <h3 className="text-xl font-black text-foreground uppercase tracking-tighter mb-8 ml-2">Consolidado de Actividades</h3>
                  <div className="grid grid-cols-1 gap-6">
                    <div className="p-8 bg-emerald-500/5 rounded-lg border border-emerald-500/20 flex items-center justify-between">
                      <div><p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2">Visitas Exitosas</p><p className="text-4xl font-black text-foreground tracking-tighter tabular-nums">{visitsByStatus.completed}</p></div>
                      <CheckCircle className="h-12 w-12 text-emerald-500/30" />
                    </div>
                    <div className="p-8 bg-blue-500/5 rounded-lg border border-blue-500/20 flex items-center justify-between">
                      <div><p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2">Objetivos en Agenda</p><p className="text-4xl font-black text-foreground tracking-tighter tabular-nums">{visitsByStatus.scheduled}</p></div>
                      <Calendar className="h-12 w-12 text-blue-500/30" />
                    </div>
                  </div>
                </div>
                <div className="pt-10 border-t border-border/40">
                  <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] mb-8 ml-2">Próximas Visitas</h4>
                  <div className="space-y-4">
                    {visits.filter(v => new Date(v.scheduled_date) >= new Date() && v.status === 'scheduled').sort((a, b) => new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime()).slice(0, 5).map(v => (
                        <div key={v.id} className="flex items-center justify-between p-6 bg-muted/5 hover:bg-card hover:shadow-premium-sm border border-transparent hover:border-border/40 rounded-lg transition-all group cursor-pointer" onClick={() => navigate(`/visits/execution/${v.id}`)}>
                          <div className="flex items-center gap-5">
                             <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_currentColor]" />
                             <div className="flex flex-col gap-1">
                               <p className="text-sm font-black text-foreground uppercase tracking-tight group-hover:text-primary transition-colors">{v.unified_contacts?.name || v.contacts?.name}</p>
                               <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">{new Date(v.scheduled_date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }).toUpperCase()} • {new Date(v.scheduled_date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</p>
                             </div>
                          </div>
                          <Button variant="ghost" size="icon" className="h-10 w-10 p-0">
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </div>
                    ))}
                    {visits.filter(v => new Date(v.scheduled_date) >= new Date() && v.status === 'scheduled').length === 0 && <div className="text-center py-10 opacity-30"><p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Sin visitas en el sistema inmediato</p></div>}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <QuickScheduleWizard open={wizardOpen} onOpenChange={setWizardOpen} onSuccess={loadVisits} />

      <Dialog open={helpDialogOpen} onOpenChange={setHelpDialogOpen}>
        <DialogContent className="max-w-[750px] bg-card rounded-lg border border-border/40 shadow-premium-2xl p-0 overflow-hidden">
          <div className="bg-muted/5 p-12 border-b border-border/40">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-lg bg-card flex items-center justify-center shadow-premium-sm border border-border/40"><FileSpreadsheet className="h-8 w-8 text-primary" /></div>
              <div>
                <DialogTitle className="text-2xl font-black text-foreground uppercase tracking-tighter">Reporte de Sincronización</DialogTitle>
                <DialogDescription className="text-muted-foreground font-black uppercase text-[10px] tracking-widest mt-2 opacity-70">Carga masiva de datos comerciales</DialogDescription>
              </div>
            </div>
          </div>
          <div className="p-12 space-y-10">
            <div className="bg-primary/5 p-8 rounded-lg border border-primary/10 flex gap-6">
              <AlertCircle className="h-7 w-7 text-primary shrink-0" />
              <p className="text-xs font-black text-foreground/70 leading-relaxed uppercase tracking-tight">CRÍTICO: LOS PROFESIONALES DEBEN HABER SIDO REGISTRADOS PREVIAMENTE PARA GARANTIZAR LA INTEGRIDAD DEL REPORTE.</p>
            </div>
            <div className="space-y-6">
              <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-2">Estructura del Reporte</h4>
              <div className="rounded-lg border border-border/40 overflow-hidden bg-muted/5">
                <Table>
                  <TableHeader className="bg-muted/10">
                    <TableRow className="border-border/40 hover:bg-transparent"><TableHead className="font-black text-[10px] uppercase tracking-widest text-foreground py-6 px-8">Columna Maestra</TableHead><TableHead className="font-black text-[10px] uppercase tracking-widest text-foreground py-6 px-8">Propósito Operativo</TableHead></TableRow>
                  </TableHeader>
                  <TableBody>
                    {[{ col: 'Contacto', desc: 'Identificador exacto del profesional en red' }, { col: 'Fecha', desc: 'Formato ISO estándar (YYYY-MM-DD)' }, { col: 'Hora', desc: 'Sincronización de llegada (HH:MM)' }, { col: 'Tipo', desc: '"Medico" o "Farmacia" (Discriminador)' }, { col: 'Objetivo', desc: 'Propósito estratégico del encuentro' }].map((row, i) => (
                      <TableRow key={i} className="border-border/10 hover:bg-primary/5 transition-colors"><TableCell className="font-mono text-xs font-black text-primary py-5 px-8 uppercase">{row.col}</TableCell><TableCell className="text-[10px] font-black text-muted-foreground uppercase tracking-tight py-5 px-8 opacity-70">{row.desc}</TableCell></TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <Button variant="default" size="sm" onClick={() => setHelpDialogOpen(false)}>
                Entendido
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SimpleCalendarPreview({ visits }: { visits: any[] }) {
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  return (
    <div className="grid grid-cols-7 gap-3">
      {days.map(d => {
        const hasVisit = visits.some(v => new Date(v.scheduled_date).getDate() === d);
        return (
          <div key={d} className={cn(
            "h-12 w-full rounded-lg flex items-center justify-center font-black text-[10px] transition-all",
            hasVisit ? "bg-primary text-white shadow-premium-sm" : "bg-card border border-border/40 text-muted-foreground/40"
          )}>
            {d}
          </div>
        );
      })}
    </div>
  );
}
