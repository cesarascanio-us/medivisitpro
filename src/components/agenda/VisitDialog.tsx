/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */


import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarIcon, MapPin, User, Clock, Plus, Target, FileText, Activity, Layers, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ContactDialog } from "@/components/contacts/ContactDialog";
import { Separator } from "@/components/ui/separator";

interface VisitDialogProps {
  trigger: React.ReactNode;
  visitData?: any;
  onVisitSaved?: () => void;
}

export function VisitDialog({ trigger, visitData, onVisitSaved }: VisitDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [contacts, setContacts] = useState<any[]>([]);
  const [showNewContactDialog, setShowNewContactDialog] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    contact_id: visitData?.contact_id || "",
    scheduled_date: visitData?.scheduled_date?.split('T')[0] || "",
    scheduled_time: visitData?.scheduled_date?.split('T')[1]?.slice(0, 5) || "",
    objective: visitData?.objective || "",
    notes: visitData?.notes || "",
    status: visitData?.status || "scheduled"
  });

  useEffect(() => {
    if (open) {
      fetchContacts();
    }
  }, [open]);

  const fetchContacts = async () => {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('name');

      if (error) throw error;
      setContacts(data || []);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const scheduledDateTime = new Date(`${formData.scheduled_date}T${formData.scheduled_time}`);

      const visitPayload = {
        contact_id: formData.contact_id,
        scheduled_date: scheduledDateTime.toISOString(),
        objective: formData.objective,
        notes: formData.notes,
        status: formData.status,
        user_id: (await supabase.auth.getUser()).data.user?.id
      };

      let result;
      if (visitData?.id) {
        result = await supabase
          .from('visits')
          .update(visitPayload)
          .eq('id', visitData.id);
      } else {
        result = await supabase
          .from('visits')
          .insert([visitPayload]);
      }

      if (result.error) throw result.error;

      toast({
        title: visitData?.id ? "Visita actualizada" : "Visita programada",
        description: visitData?.id ? "Los cambios se han guardado." : "La visita ha sido agendada exitosamente.",
      });

      setOpen(false);
      onVisitSaved?.();
    } catch (error) {
      console.error('Error saving visit:', error);
      toast({
        title: "Error",
        description: "No se pudo agendar la visita.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleContactCreated = () => {
    fetchContacts();
    setShowNewContactDialog(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
        <DialogContent className="max-w-xl p-0 overflow-hidden border-none shadow-2xl rounded-3xl bg-card">
          {/* Calendar Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-10 text-white relative">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-background/10 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-2xl">
                <CalendarIcon className="w-7 h-7 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-black tracking-tight text-white mb-0">
                  {visitData?.id ? "Reprogramar Gestión" : "Planificar Nueva Visita"}
                </DialogTitle>
                <p className="text-blue-100/70 font-bold text-[10px] uppercase tracking-[0.2em] mt-1">Agenda de Visita Médica & Comercial</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="px-8 py-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
            {/* Contacto */}
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Seleccionar Médico o Farmacia *</Label>
              <div className="flex gap-2">
                <div className="relative flex-1 group">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
                  <Select
                    value={formData.contact_id}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, contact_id: value }))}
                  >
                    <SelectTrigger className="h-12 pl-10 border-slate-200 rounded-xl font-bold bg-slate-50/50 shadow-sm focus:ring-blue-500/10">
                      <SelectValue placeholder="Buscar en base de contactos..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl font-bold">
                      {contacts.map((contact) => (
                        <SelectItem key={contact.id} value={contact.id} className="py-3">
                          👤 {contact.name} <span className="text-[10px] text-slate-400 ml-2">({contact.specialty || 'Canal'})</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-12 w-12 rounded-xl border-slate-200 hover:border-blue-500 hover:bg-blue-50 text-slate-400 hover:text-blue-600 shadow-sm transition-all"
                  onClick={() => setShowNewContactDialog(true)}
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <Separator className="bg-slate-100 text-slate-900" />

            {/* Fecha y Hora */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Fecha de Visita</Label>
                <div className="relative group">
                  <CalendarIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type="date"
                    value={formData.scheduled_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, scheduled_date: e.target.value }))}
                    className="h-12 pl-10 border-slate-200 rounded-xl font-bold bg-background"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Hora Estimada</Label>
                <div className="relative group">
                  <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type="time"
                    value={formData.scheduled_time}
                    onChange={(e) => setFormData(prev => ({ ...prev, scheduled_time: e.target.value }))}
                    className="h-12 pl-10 border-slate-200 rounded-xl font-bold bg-background"
                    required
                  />
                </div>
              </div>
            </div>

            <Separator className="bg-slate-100 text-slate-900" />

            {/* Objetivo */}
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Objetivo Estratégico</Label>
              <div className="relative group">
                <Target className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500/50" />
                <Input
                  value={formData.objective}
                  onChange={(e) => setFormData(prev => ({ ...prev, objective: e.target.value }))}
                  placeholder="Ej: Lanzamiento de producto, cierre de venta, seguimiento..."
                  className="h-12 pl-10 border-slate-200 rounded-xl font-bold"
                />
              </div>
            </div>

            {/* Notas */}
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Hoja de Ruta / Notas Privadas</Label>
              <div className="relative group">
                <FileText className="absolute left-3.5 top-4 h-4 w-4 text-slate-400" />
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Instrucciones adicionales para el visitador o recordatorios..."
                  className="min-h-[120px] pl-10 border-slate-200 rounded-2xl font-medium p-4 resize-none"
                />
              </div>
            </div>

            {/* Estado */}
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Estatus del Compromiso</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger className="h-12 border-slate-200 rounded-xl font-bold bg-slate-50/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl font-bold">
                  <SelectItem value="scheduled" className="text-blue-600 py-3">📅 PROGRAMADA</SelectItem>
                  <SelectItem value="completed" className="text-emerald-600 py-3">✅ COMPLETADA</SelectItem>
                  <SelectItem value="cancelled" className="text-rose-600 py-3">❌ CANCELADA</SelectItem>
                  <SelectItem value="no_show" className="text-slate-400 py-3">👤 SIN AUDIENCIA</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </form>

          <div className="bg-slate-50 border-t border-slate-100 px-8 py-6 flex items-center justify-between gap-4 text-slate-900">
            <Button variant="ghost" onClick={() => setOpen(false)} className="h-12 px-6 font-bold text-slate-400 hover:text-slate-600">Descartar</Button>
            <Button onClick={handleSubmit} disabled={loading} className="h-12 px-10 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl shadow-blue-500/20 transition-all hover:scale-[1.02]">
              {loading ? "Sincronizando..." : (visitData?.id ? "Actualizar Gestión" : "Confirmar Agenda")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ContactDialog
        trigger={<div />}
        onContactSaved={handleContactCreated}
        open={showNewContactDialog}
        onOpenChange={setShowNewContactDialog}
      />
    </>
  );
}
