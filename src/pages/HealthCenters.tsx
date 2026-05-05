/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
 ======================================================================== */

import { useState, useEffect, useRef } from "react";
import { 
  Plus, Building, Phone, MapPin, Search, Download, Upload, Printer, 
  HelpCircle, FileSpreadsheet, Trash2, RefreshCw, Pencil, Users, 
  Stethoscope, Lightbulb, Building2, Hospital, ClipboardCheck
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
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
import { AdminDataFilter } from "@/components/admin/AdminDataFilter";
import { useDemoData } from "@/contexts/MockDataProvider";
import { InstructionCard } from "@/components/ui/InstructionCard";
import { EliteKPICard, EliteHeader } from "@/components/layout/DesignSystem";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

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
  const [syncing, setSyncing] = useState(false);
  const [selectedCenter, setSelectedCenter] = useState<HealthCenter | null>(null);
  const [adminFilters, setAdminFilters] = useState({});
  const [showHelp, setShowHelp] = useState(false);
  const demoData = useDemoData();

  const [formData, setFormData] = useState({
    id: "", name: "", facility_type: "Hospital", address: "", city: "", 
    state: "", zone_id: "", phone: "", potential: "Medio", last_visit: ""
  });

  useEffect(() => { if (user) loadHealthCenters(); }, [user, adminFilters, organizationId, demoData]);

  const loadHealthCenters = async () => {
    try {
      setLoading(true);
      if (demoData) {
        setHealthCenters(demoData.healthCenters as unknown as HealthCenter[]);
        setLoading(false); return;
      }
      let query: any = supabase.from('health_centers').select('*').eq('organization_id', organizationId);
      const { data, error } = await query.order('name', { ascending: true });
      if (error) throw error;
      setHealthCenters(data || []);
    } catch (error) { console.error('Error:', error); } finally { setLoading(false); }
  };

  const handleEdit = (center: HealthCenter) => {
    setFormData({
      id: center.id, name: center.name, facility_type: center.facility_type || "Hospital",
      address: center.address || "", city: center.city || "", state: center.state || "",
      zone_id: center.zone_id || "", phone: center.phone || "", potential: center.potential || "Medio",
      last_visit: center.last_visit || ""
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!user || !formData.name) return;
    try {
      const payload = {
        organization_id: organizationId, user_id: user.id, name: formData.name,
        facility_type: formData.facility_type, address: formData.address, city: formData.city,
        state: formData.state, phone: formData.phone, potential: formData.potential
      };
      if (formData.id) { await supabase.from('health_centers').update(payload).eq('id', formData.id); } 
      else { await supabase.from('health_centers').insert([payload]); }
      toast({ title: "Registro Completado", description: "Centro de salud sincronizado." });
      setDialogOpen(false); loadHealthCenters();
    } catch (error) { toast({ title: "Error de Registro", variant: "destructive" }); }
  };

  const getPotentialBadge = (potential: string | null) => {
    const styles: Record<string, string> = { 'Alto': "bg-indigo-500/10 text-indigo-400", 'Medio': "bg-amber-500/10 text-amber-400", 'Bajo': "bg-rose-500/10 text-rose-400" };
    return <Badge className={`${styles[potential || 'Medio']} border-none font-black text-[9px] tracking-widest uppercase`}>{potential || 'MEDIO'}</Badge>;
  };

  const navigate = useNavigate();

  const filteredCenters = healthCenters.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-10 pb-10 font-display animate-in fade-in duration-700">
      <input type="file" ref={fileInputRef} onChange={() => {}} accept=".xlsx,.xls,.csv" className="hidden" />

      <EliteHeader
        title="Directorio Institucional"
        subtitle="Gestión de Red Hospitalaria y Centros de Salud"
        icon={Hospital}
        badgeText="V6.0 ELITE"
        statusText="Red Institucional Activa"
        statusColor="bg-indigo-500"
        rightContent={
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => exportToCSV(filteredCenters, 'centros_salud')} className="h-14 px-8 rounded-2xl border-border/40 bg-card text-foreground font-black text-[10px] uppercase tracking-widest shadow-premium-sm hover:shadow-premium-md transition-all">
              <Download className="h-5 w-5 mr-3 text-primary" /> Exportar
            </Button>
            <Button onClick={() => setDialogOpen(true)} className="h-16 px-10 bg-primary hover:bg-primary/90 text-white rounded-2xl shadow-premium-md font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 flex items-center gap-3">
              <Plus className="h-6 w-6" /> Nuevo Centro
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <EliteKPICard title="Total Centros" value={healthCenters.length} icon={Hospital} color="indigo" />
        <EliteKPICard title="Hospitales" value={healthCenters.filter(c => c.facility_type === 'Hospital').length} icon={Building2} color="blue" />
        <EliteKPICard title="Clínicas" value={healthCenters.filter(c => c.facility_type === 'Clínica').length} icon={Building} color="emerald" />
        <EliteKPICard title="Visitados" value={healthCenters.filter(c => c.last_visit).length} icon={ClipboardCheck} color="amber" />
      </div>

      <AdminDataFilter onFilterChange={(f) => setAdminFilters(f)} moduleType="contacts" />

      <div className="flex flex-col md:flex-row gap-6">
        <Card className="bg-card border border-border/40 rounded-[2.5rem] shadow-premium-sm p-6 flex-1 relative overflow-hidden group/search">
          <div className="flex-1 relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground group-focus-within/search:text-primary transition-colors" />
            <Input placeholder="LOCALIZAR INSTITUCIÓN..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-16 h-16 bg-muted/30 border-border focus-visible:ring-primary/20 font-black rounded-2xl text-foreground placeholder:text-muted-foreground/50 transition-all text-xs tracking-widest shadow-inner uppercase" />
          </div>
        </Card>
      </div>

      {loading ? (
        <div className="py-20 text-center text-muted-foreground">Cargando centros de salud...</div>
      ) : filteredCenters.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-muted/20 rounded-[4rem] border border-dashed border-border/40">
          <Hospital className="h-10 w-10 text-muted-foreground mb-4" />
          <h3 className="text-xl font-black text-foreground uppercase tracking-tighter mb-2">Sin Resultados</h3>
          <p className="text-muted-foreground font-bold uppercase text-[9px] tracking-widest">Ajusta los parámetros de búsqueda</p>
        </div>
      ) : (
        <div className="bg-card rounded-[2.5rem] border border-border/40 shadow-premium-sm overflow-hidden p-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border/40 hover:bg-transparent">
                  <TableHead className="font-black text-[10px] text-muted-foreground uppercase tracking-widest py-6">Institución</TableHead>
                  <TableHead className="font-black text-[10px] text-muted-foreground uppercase tracking-widest py-6">Ubicación</TableHead>
                  <TableHead className="font-black text-[10px] text-muted-foreground uppercase tracking-widest py-6">Contacto</TableHead>
                  <TableHead className="font-black text-[10px] text-muted-foreground uppercase tracking-widest py-6">Última Visita</TableHead>
                  <TableHead className="font-black text-[10px] text-muted-foreground uppercase tracking-widest py-6 text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCenters.map((center) => (
                  <TableRow key={center.id} className="border-b border-border/20 hover:bg-muted/50 cursor-pointer group transition-colors">
                    <TableCell className="py-4 align-top">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center shadow-inner border border-indigo-500/20">
                          <Hospital className="h-5 w-5 text-indigo-500" />
                        </div>
                        <div>
                          <p className="font-black text-sm text-foreground uppercase tracking-tight group-hover:text-primary transition-colors">{center.name}</p>
                          <Badge className="mt-1 bg-muted/50 text-muted-foreground border-none font-bold text-[9px] uppercase tracking-widest">{center.facility_type || 'CENTRO MÉDICO'}</Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 align-top">
                      <div className="flex items-center text-xs text-muted-foreground font-bold uppercase tracking-wide">
                        <MapPin className="h-3.5 w-3.5 mr-2 text-indigo-500 opacity-60" />
                        <span className="truncate max-w-[200px]">{center.address || center.city || 'N/A'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 align-top">
                      <div className="flex items-center text-xs text-muted-foreground font-bold uppercase tracking-wide">
                        <Phone className="h-3.5 w-3.5 mr-2 text-indigo-500 opacity-60" />
                        {center.phone || 'SIN CONTACTO'}
                      </div>
                    </TableCell>
                    <TableCell className="py-4 align-top">
                      <span className={cn("text-xs font-bold uppercase tracking-wide", center.last_visit ? "text-emerald-500" : "text-muted-foreground")}>
                        {center.last_visit || 'PENDIENTE'}
                      </span>
                    </TableCell>
                    <TableCell className="py-4 align-top text-right">
                      <Button size="sm" variant="ghost" onClick={() => handleEdit(center)} className="h-10 w-10 p-0 rounded-xl hover:bg-muted text-muted-foreground hover:text-primary transition-colors">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden border-none rounded-[2.5rem] bg-slate-950 font-outfit shadow-3xl text-white">
          <div className="bg-slate-900 px-10 py-10 text-white relative">
            <div className="flex items-center gap-6 relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-2xl text-white">
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-black uppercase  tracking-tighter">Registro Institucional</DialogTitle>
                <p className="text-indigo-400 text-[9px] font-black uppercase tracking-[0.3em] mt-2">Sincronización de Infraestructura Maestra</p>
              </div>
            </div>
          </div>
          <div className="p-10 space-y-8 text-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Nombre Institucional</Label>
                <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="h-14 bg-slate-900 border-white/5 rounded-xl font-bold uppercase px-6 text-white" />
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Potencial Estratégico</Label>
                <Select value={formData.potential} onValueChange={v => setFormData({...formData, potential: v})}>
                  <SelectTrigger className="h-14 bg-slate-900 border-white/5 rounded-xl font-bold uppercase  text-white"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/5 text-white font-bold uppercase ">
                    <SelectItem value="Alto">ALTO IMPACTO</SelectItem>
                    <SelectItem value="Medio">IMPACTO MEDIO</SelectItem>
                    <SelectItem value="Bajo">ESTÁNDAR BAJO</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Dirección de Sede</Label>
              <Input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="h-14 bg-slate-900 border-white/5 rounded-xl font-bold uppercase px-6 text-white" />
            </div>
            <div className="flex gap-4 mt-10">
              <Button variant="ghost" onClick={() => setDialogOpen(false)} className="h-14 px-8 font-black uppercase text-rose-500 hover:bg-rose-500/10 rounded-2xl">CANCELAR</Button>
              <Button onClick={handleSubmit} className="flex-1 h-14 bg-card text-slate-950 font-black uppercase  rounded-2xl hover:bg-slate-100 shadow-2xl">CONFIRMAR REGISTRO</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
