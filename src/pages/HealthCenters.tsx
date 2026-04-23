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
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { exportToCSV, handlePrint } from "@/utils/exportUtils";
import { AdminDataFilter } from "@/components/admin/AdminDataFilter";
import { useDemoData } from "@/contexts/MockDataProvider";
import { InstructionCard } from "@/components/ui/InstructionCard";

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
      toast({ title: "Misión Cumplida", description: "Centro de salud sincronizado." });
      setDialogOpen(false); loadHealthCenters();
    } catch (error) { toast({ title: "Error Táctico", variant: "destructive" }); }
  };

  const getPotentialBadge = (potential: string | null) => {
    const styles: Record<string, string> = { 'Alto': "bg-indigo-500/10 text-indigo-400", 'Medio': "bg-amber-500/10 text-amber-400", 'Bajo': "bg-rose-500/10 text-rose-400" };
    return <Badge className={`${styles[potential || 'Medio']} border-none font-black text-[9px] tracking-widest uppercase`}>{potential || 'MEDIO'}</Badge>;
  };

  const filteredCenters = healthCenters.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-10 font-outfit animate-in fade-in duration-700">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8 mb-10">
        <div>
          <h1 className="text-3xl font-black text-white uppercase  tracking-tighter flex items-center gap-4">
            <div className="w-16 h-16 rounded-[2rem] bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center shadow-2xl">
              <Hospital className="h-8 w-8 text-indigo-500 animate-pulse" />
            </div>
            Directorio de Instituciones de Élite
          </h1>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-3 ml-20 ">Gestión de Red Hospitalaria y Centros de Salud Estratégicos</p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => exportToCSV(filteredCenters, 'centros_salud')} className="bg-slate-900 border-white/5 text-white rounded-2xl h-14 px-8 font-black uppercase  text-xs hover:bg-slate-800 transition-all duration-300">
            <Download className="h-4 w-4 mr-3" /> EXPORTAR
          </Button>
          <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="bg-slate-900 border-white/5 text-white rounded-2xl h-14 px-8 font-black uppercase  text-xs hover:bg-slate-800 transition-all duration-300">
            <Upload className="h-4 w-4 mr-3" /> IMPORTAR
          </Button>
          <Button onClick={() => setDialogOpen(true)} className="bg-card text-slate-900 rounded-2xl h-14 px-10 font-black uppercase  text-xs hover:bg-slate-100 shadow-2xl transition-all duration-300 scale-105">
            <Plus className="h-6 w-6 mr-3" /> NUEVO CENTRO
          </Button>
        </div>
      </div>

      <AdminDataFilter onFilterChange={(f) => setAdminFilters(f)} moduleType="contacts" />

      <div className="relative group max-w-2xl mt-10">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-white transition-colors" />
        <Input placeholder="LOCALIZAR INSTITUCIÓN O NIVEL..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-16 h-16 bg-slate-900 border-white/5 rounded-[1.5rem] text-white placeholder:text-slate-700 focus:ring-2 focus:ring-indigo-500 font-black  uppercase tracking-widest transition-all" />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => <div key={i} className="h-72 bg-slate-900 rounded-[3rem] animate-pulse border border-white/5" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {filteredCenters.map((center) => (
            <Card key={center.id} className="bg-slate-900 border-white/5 rounded-[3rem] overflow-hidden hover:border-indigo-500/30 transition-all duration-500 group relative shadow-2xl">
              <CardHeader className="p-10 pb-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-3">
                    <CardTitle className="text-2xl font-black text-white uppercase  tracking-tighter group-hover:text-indigo-400 transition-colors leading-none">{center.name}</CardTitle>
                    <Badge className="bg-background/5 text-slate-500 border-none font-bold text-[9px] uppercase tracking-widest ">{center.facility_type || 'CENTRO MÉDICO'}</Badge>
                  </div>
                  {getPotentialBadge(center.potential)}
                </div>
              </CardHeader>
              <CardContent className="p-10 pt-4 space-y-6">
                <div className="flex items-center text-xs font-black text-slate-500 uppercase tracking-tight ">
                  <MapPin className="mr-4 h-5 w-5 text-indigo-500 opacity-60" /> {center.address || center.city || 'UBICACIÓN ESTRATÉGICA S.P.'}
                </div>
                <div className="flex items-center text-xs font-black text-slate-500 uppercase tracking-tight ">
                  <Phone className="mr-4 h-5 w-5 text-indigo-500 opacity-60" /> {center.phone || 'COMUNICACIÓN S.P.'}
                </div>
                <div className="flex items-center text-xs font-black text-slate-500 uppercase tracking-tight ">
                  <ClipboardCheck className="mr-4 h-5 w-5 text-emerald-500 opacity-60" /> ÚLTIMA VISITA: {center.last_visit || 'HOJA EN BLANCO'}
                </div>
              </CardContent>
              <CardFooter className="p-6 bg-slate-950/50 flex gap-3 border-t border-white/5">
                <Button variant="ghost" className="flex-1 bg-background/5 rounded-2xl h-12 text-[10px] font-black uppercase  hover:bg-background/10 text-white">DIRECTORIO</Button>
                <Button onClick={() => handleEdit(center)} variant="ghost" className="bg-background/5 rounded-2xl h-12 px-4 hover:bg-indigo-500/20 hover:text-indigo-400 text-slate-600"><Pencil className="h-4 w-4" /></Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden border-none rounded-[2.5rem] bg-slate-950 font-outfit shadow-3xl">
          <div className="bg-slate-900 px-10 py-10 text-white relative">
            <div className="flex items-center gap-6 relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-2xl">
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-black uppercase  tracking-tighter">Alta Institucional CA</DialogTitle>
                <p className="text-indigo-400 text-[9px] font-black uppercase tracking-[0.3em] mt-2">Sincronización de Infraestructura Maestra</p>
              </div>
            </div>
          </div>
          <div className="p-10 space-y-8 text-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Nombre Institucional</Label>
                <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="h-14 bg-slate-900 border-white/5 rounded-xl font-bold  uppercase px-6" />
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Potencial Estratégico</Label>
                <Select value={formData.potential} onValueChange={v => setFormData({...formData, potential: v})}>
                  <SelectTrigger className="h-14 bg-slate-900 border-white/5 rounded-xl font-bold uppercase "><SelectValue /></SelectTrigger>
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
              <Input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="h-14 bg-slate-900 border-white/5 rounded-xl font-bold  uppercase px-6" />
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
