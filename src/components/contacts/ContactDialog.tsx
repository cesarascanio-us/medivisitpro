/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */


import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { User, Building, MapPin, X, Leaf, Rocket, AlertCircle, Phone, Mail, Clock, ShieldCheck, Target, GraduationCap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSubscriptionQuota } from "@/hooks/useSubscriptionQuota";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface ContactDialogProps {
  trigger: React.ReactNode;
  contactData?: any;
  onContactSaved?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ContactDialog({ trigger, contactData, onContactSaved, open: controlledOpen, onOpenChange }: ContactDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;
  const [loading, setLoading] = useState(false);
  const [healthCenters, setHealthCenters] = useState<any[]>([]);
  const [selectedCenters, setSelectedCenters] = useState<string[]>([]);
  const { toast } = useToast();
  const { canAddDoctor, canAddPharmacy, usage, limits, tier } = useSubscriptionQuota();

  const [formData, setFormData] = useState({
    name: contactData?.name || "",
    contact_type: contactData?.contact_type || "doctor",
    specialty: contactData?.specialty || "",
    rif: contactData?.rif || "",
    owner_name: contactData?.owner_name || "",
    sanitary_permits: contactData?.sanitary_permits || false,
    address: contactData?.address || "",
    city: contactData?.city || "",
    phone: contactData?.phone || "",
    email: contactData?.email || "",
    work_hours: contactData?.work_hours || "",
    priority: contactData?.priority || "medium",
    notes: contactData?.notes || ""
  });

  useEffect(() => {
    if (open) {
      fetchHealthCenters();
      if (contactData?.id) {
        fetchContactHealthCenters();
      }
    }
  }, [open, contactData]);

  const fetchHealthCenters = async () => {
    try {
      const { data, error } = await supabase
        .from('health_centers')
        .select('*')
        .order('name');

      if (error) throw error;
      setHealthCenters(data || []);
    } catch (error) {
      console.error('Error fetching health centers:', error);
    }
  };

  const fetchContactHealthCenters = async () => {
    try {
      const { data, error } = await supabase
        .from('contact_health_centers')
        .select('health_center_id')
        .eq('contact_id', contactData.id);

      if (error) throw error;
      setSelectedCenters(data?.map(d => d.health_center_id) || []);
    } catch (error) {
      console.error('Error fetching contact health centers:', error);
    }
  };

  const toggleCenter = (centerId: string) => {
    setSelectedCenters(prev =>
      prev.includes(centerId)
        ? prev.filter(id => id !== centerId)
        : [...prev, centerId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = await supabase.auth.getUser();

      // QUOTA CHECK
      if (!contactData) { // Only check on creation
        const type = formData.contact_type;
        const isDoctorType = type === 'doctor' || type === 'specialist';
        const isPharmacyType = type === 'pharmacy' || type === 'natural_store' || type === 'drugstore';

        if (isDoctorType && !canAddDoctor) {
          toast({
            title: "Límite Alcanzado",
            description: `Has llegado al máximo de ${limits.doctors} médicos de tu plan ${tier.toUpperCase()}. Actualiza a PRO para ilimitados.`,
            variant: "destructive"
          });
          setLoading(false);
          return;
        }

        if (isPharmacyType && !canAddPharmacy) {
          toast({
            title: "Límite Alcanzado",
            description: `Has llegado al máximo de ${limits.pharmacies} farmacias de tu plan ${tier.toUpperCase()}. Actualiza a PRO para ilimitados.`,
            variant: "destructive"
          });
          setLoading(false);
          return;
        }
      }

      const contactPayload = {
        ...formData,
        user_id: user.data.user?.id,
        organization_id: organizationId
      };

      // TACTICAL TABLE RESOLVER
      const getTargetTable = (type: string) => {
        switch(type) {
          case 'doctor': return 'doctors';
          case 'pharmacy': return 'pharmacies';
          case 'health_center': case 'hospital': case 'clinic': return 'health_centers';
          case 'drugstore': return 'drugstores';
          case 'commerce': return 'commerces';
          case 'natural_store': return 'natural_stores';
          default: return 'contacts';
        }
      };

      const targetTable = getTargetTable(formData.contact_type);
      let contactId: string;

      if (contactData) {
        // If we are editing, we use the source table provided by the hook
        const sourceTable = contactData.source || targetTable;
        const result = await supabase
          .from(sourceTable)
          .update(contactPayload)
          .eq('id', contactData.id)
          .select()
          .single();

        if (result.error) throw result.error;
        contactId = contactData.id;
      } else {
        const result = await supabase
          .from(targetTable)
          .insert([contactPayload])
          .select()
          .single();

        if (result.error) throw result.error;
        contactId = result.data.id;
      }

      // Update health center associations
      await supabase
        .from('contact_health_centers')
        .delete()
        .eq('contact_id', contactId);

      if (selectedCenters.length > 0) {
        const associations = selectedCenters.map(centerId => ({
          contact_id: contactId,
          health_center_id: centerId
        }));

        const { error: assocError } = await supabase
          .from('contact_health_centers')
          .insert(associations);

        if (assocError) throw assocError;
      }

      toast({
        title: contactData ? "Contacto actualizado" : "Contacto creado",
        description: contactData ? "El registro ha sido actualizado correctamente." : "Nuevo contacto integrado al sistema.",
      });

      setOpen(false);
      onContactSaved?.();
    } catch (error) {
      console.error('Error saving contact:', error);
      toast({
        title: "Error",
        description: "No se pudo procesar la solicitud.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getSelectedCenter = (id: string) => {
    return healthCenters.find(c => c.id === id);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-3xl p-0 overflow-hidden border-none shadow-2xl rounded-3xl bg-card">
        {/* Header with Gradient */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 px-8 py-8 text-white">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-background/10 backdrop-blur-md flex items-center justify-center shadow-inner">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-black tracking-tight text-white m-0">
                {contactData ? "Editar Perfil de Contacto" : "Registro Rápido de Contacto"}
              </DialogTitle>
              <DialogDescription className="text-indigo-100/70 font-bold text-[10px] uppercase tracking-widest mt-1">
                Directorio Unificado de Profesionales & Canal
              </DialogDescription>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-8 py-6 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar bg-slate-50/30">
          {/* Section: Core Info */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-6 bg-indigo-500 rounded-full" />
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Identidad del Contacto</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Nombre Completo *</Label>
                <div className="relative group">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ej: Dr. Juan Pérez o Farmacia La Paz"
                    className="h-12 pl-10 border-slate-200 rounded-xl font-bold focus:ring-indigo-500/10 shadow-sm"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Tipo de Contacto</Label>
                <Select
                  value={formData.contact_type}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, contact_type: value }))}
                >
                  <SelectTrigger className="h-12 border-border rounded-xl font-bold bg-muted shadow-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl font-bold">
                    <SelectItem value="doctor">🩺 Médico</SelectItem>
                    <SelectItem value="pharmacy">💊 Farmacia</SelectItem>
                    <SelectItem value="natural_store">🌿 Tienda Naturista</SelectItem>
                    <SelectItem value="drugstore">🚛 Droguería</SelectItem>
                    <SelectItem value="hospital">🏥 Hospital</SelectItem>
                    <SelectItem value="clinic">🏢 Clínica</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Especialidad / Ramo</Label>
                <div className="relative group">
                  <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    value={formData.specialty}
                    onChange={(e) => setFormData(prev => ({ ...prev, specialty: e.target.value }))}
                    placeholder="Pediatría, Farmacia, etc..."
                    className="h-12 pl-10 border-slate-200 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Prioridad de Atención</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger className="h-12 border-border rounded-xl font-bold bg-muted shadow-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl font-bold">
                    <SelectItem value="low" className="text-slate-400">Baja</SelectItem>
                    <SelectItem value="medium" className="text-blue-600">Media (Estándar)</SelectItem>
                    <SelectItem value="high" className="text-orange-600">Alta (VIP)</SelectItem>
                    <SelectItem value="urgent" className="text-rose-600">Crítica / Lanzamiento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator className="bg-slate-200/50" />

          {/* Section: Business Logic (Conditional) */}
          {(formData.contact_type === 'natural_store' || formData.contact_type === 'pharmacy' || formData.contact_type === 'drugstore') && (
            <div className="space-y-6 animate-in slide-in-from-top-2">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Validación Comercial</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-emerald-50/30 p-6 rounded-3xl border border-emerald-100">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-emerald-700 ml-1">RIF / ID Fiscal *</Label>
                  <div className="relative group">
                    <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500/50" />
                    <Input
                      value={formData.rif}
                      onChange={(e) => setFormData(prev => ({ ...prev, rif: e.target.value }))}
                      placeholder="J-00000000-0"
                      className="h-11 pl-10 border-border bg-muted rounded-xl font-bold focus:ring-emerald-500/10"
                      required={formData.contact_type === 'natural_store'}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-emerald-700 ml-1">Responsable Legal</Label>
                  <Input
                    value={formData.owner_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, owner_name: e.target.value }))}
                    placeholder="Nombre del encargado"
                    className="h-11 border-border bg-muted rounded-xl font-bold"
                  />
                </div>
                <div className="md:col-span-2 flex items-center gap-3 p-3 bg-muted border border-border rounded-xl cursor-pointer hover:bg-emerald-50 transition-colors">
                  <Checkbox
                    id="sanitary_permits"
                    checked={formData.sanitary_permits}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, sanitary_permits: !!checked }))}
                    className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                  />
                  <Label htmlFor="sanitary_permits" className="text-xs font-bold text-slate-600 cursor-pointer">
                    Confirmar posesión de Permisos Sanitarios vigentes
                  </Label>
                </div>
              </div>
            </div>
          )}

          {/* Section: Medical Institutions (Conditional) */}
          {(formData.contact_type === 'doctor' || formData.contact_type === 'hospital' || formData.contact_type === 'clinic') && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Centros de Operación</h3>
              </div>

              <div className="space-y-4">
                {selectedCenters.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-3 bg-muted rounded-2xl border border-border shadow-sm">
                    {selectedCenters.map(centerId => {
                      const center = getSelectedCenter(centerId);
                      return center ? (
                        <Badge key={centerId} variant="secondary" className="h-8 pl-3 pr-2 rounded-lg bg-indigo-50 text-indigo-700 border-indigo-100 font-bold flex items-center gap-2">
                          <Building className="h-3 w-3" />
                          {center.name}
                          <button
                            type="button"
                            className="p-1 hover:bg-indigo-200 rounded-md transition-colors"
                            onClick={(e) => { e.stopPropagation(); toggleCenter(centerId); }}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ) : null;
                    })}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto p-4 bg-muted border border-border rounded-3xl custom-scrollbar">
                  {healthCenters.map((center) => (
                    <div
                      key={center.id}
                      className={cn(
                        "flex items-start space-x-3 p-3 rounded-xl cursor-pointer transition-all border",
                        selectedCenters.includes(center.id)
                          ? "bg-indigo-50/50 border-indigo-200"
                          : "hover:bg-slate-50 border-transparent"
                      )}
                      onClick={() => toggleCenter(center.id)}
                    >
                      <Checkbox
                        checked={selectedCenters.includes(center.id)}
                        onCheckedChange={() => toggleCenter(center.id)}
                        className="mt-1 data-[state=checked]:bg-indigo-600"
                      />
                      <div className="flex-1">
                        <p className="font-bold text-sm text-slate-700">{center.name}</p>
                        <p className="text-[10px] font-black uppercase text-slate-400">{center.city}</p>
                      </div>
                    </div>
                  ))}
                  {healthCenters.length === 0 && (
                    <div className="col-span-full py-6 text-center">
                      <AlertCircle className="h-8 w-8 text-slate-200 mx-auto mb-2" />
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">Sin centros de salud vinculados</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <Separator className="bg-slate-200/50" />

          {/* Section: Contact & Location */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-6 bg-slate-400 rounded-full" />
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Localización & Canales</h3>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Dirección Física</Label>
                <div className="relative group">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Ubicación completa..."
                    className="h-12 pl-10 border-border rounded-xl font-bold bg-muted"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Teléfono Directo</Label>
                  <div className="relative group">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+58 000 000 0000"
                      className="h-12 pl-10 border-border rounded-xl font-bold bg-muted"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Correo Electrónico</Label>
                  <div className="relative group">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="email@servidor.com"
                      className="h-12 pl-10 border-border rounded-xl font-bold bg-muted"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Disponibilidad / Horario</Label>
                <div className="relative group">
                  <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    value={formData.work_hours}
                    onChange={(e) => setFormData(prev => ({ ...prev, work_hours: e.target.value }))}
                    placeholder="Ej: Lun-Vie 8am a 4pm"
                    className="h-12 pl-10 border-border rounded-xl font-bold bg-muted"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Observaciones Críticas</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Detalles sobre trato, preferencias o advertencias..."
                  className="min-h-[100px] border-border bg-muted rounded-2xl font-medium p-4 resize-none shadow-sm"
                />
              </div>
            </div>
          </div>
        </form>

        <div className="bg-card border-t border-border px-8 py-6 flex items-center justify-between gap-4">
          <Button variant="ghost" onClick={() => setOpen(false)} className="h-12 px-6 font-bold text-slate-400 hover:text-slate-600">Cancelar</Button>
          <Button onClick={handleSubmit} disabled={loading} className="h-12 px-10 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl shadow-indigo-500/20 transition-all hover:scale-[1.02]">
            {loading ? "Sincronizando..." : (contactData ? "Actualizar Perfil" : "Crear Contacto")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
