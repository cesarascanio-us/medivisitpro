/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */


import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, MapPin, Phone, Mail, FileText, Info, ShieldCheck, Globe } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

interface HealthCenterDialogProps {
  trigger: React.ReactNode;
  centerData?: any;
  onCenterSaved?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function HealthCenterDialog({ trigger, centerData, onCenterSaved, open: controlledOpen, onOpenChange }: HealthCenterDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  const [formData, setFormData] = useState({
    name: centerData?.name || "",
    facility_type: centerData?.facility_type || centerData?.type || "hospital",
    address: centerData?.address || "",
    city: centerData?.city || "",
    phone: centerData?.phone || "",
    email: centerData?.email || "",
    notes: centerData?.notes || ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = await supabase.auth.getUser();
      const centerPayload = {
        ...formData,
        user_id: user.data.user?.id
      };

      let result;
      if (centerData) {
        result = await supabase
          .from('health_centers')
          .update(centerPayload)
          .eq('id', centerData.id);
      } else {
        result = await supabase
          .from('health_centers')
          .insert([centerPayload]);
      }

      if (result.error) throw result.error;

      toast({
        title: centerData ? "Centro actualizado" : "Centro creado",
        description: centerData ? "El centro de salud ha sido actualizado correctamente." : "Nuevo centro de salud registrado en la red.",
      });

      setOpen(false);
      onCenterSaved?.();
    } catch (error) {
      console.error('Error saving health center:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar el centro de salud.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-xl p-0 overflow-hidden border-none shadow-2xl rounded-3xl">
        <div className="bg-gradient-to-br from-indigo-700 via-indigo-800 to-slate-900 px-8 py-10 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Building2 className="w-32 h-32" />
          </div>
          <div className="flex items-center gap-5 relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-card/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-inner">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-black tracking-tight text-white mb-0 uppercase">
                {centerData ? "Gestión de Sede" : "Alta Institucional"}
              </DialogTitle>
              <p className="text-indigo-200/70 text-[10px] font-black uppercase tracking-[0.2em] mt-1.5">Logística de Infraestructura Médica 🏥</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-8 py-6 space-y-6 bg-muted/10/30 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <section className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-6 bg-primary rounded-full" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Perfil Institucional</h3>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Nombre Comercial de la Sede *</Label>
              <div className="relative group">
                <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ej: Hospital Central o Clínica El Valle"
                  className="h-12 pl-10 border-border rounded-xl font-bold focus:ring-indigo-500/10 focus:border-indigo-500 shadow-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Tipo de Instalación</Label>
              <Select
                value={formData.facility_type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, facility_type: value }))}
              >
                <SelectTrigger className="h-12 border-border rounded-xl font-bold shadow-sm focus:ring-indigo-500/10 focus:border-indigo-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl font-bold">
                  <SelectItem value="hospital">🏥 Hospital Público</SelectItem>
                  <SelectItem value="clinic">🏢 Clínica Privada</SelectItem>
                  <SelectItem value="medical_center">🩺 Centro Médico</SelectItem>
                  <SelectItem value="health_post">🚑 Puesto de Auxilio</SelectItem>
                  <SelectItem value="specialized_center">✨ Centro Especializado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </section>

          <Separator className="bg-slate-200/50" />

          <section className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-6 bg-indigo-400 rounded-full" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Ubicación & Contacto</h3>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Dirección Física</Label>
              <div className="relative group">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-primary group-hover:text-indigo-600 transition-colors" />
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Calle, Sector, Referencia..."
                  className="h-12 pl-10 border-border rounded-xl font-bold focus:ring-indigo-500/10 focus:border-indigo-500 shadow-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Ciudad</Label>
                <div className="relative group">
                  <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="Ej: Caracas"
                    className="h-12 pl-10 border-border rounded-xl font-bold shadow-sm"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Teléfono Central</Label>
                <div className="relative group">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+58 212 000-0000"
                    className="h-12 pl-10 border-border rounded-xl font-bold shadow-sm"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Email de Recepción</Label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="admin@centro.com"
                  className="h-12 pl-10 border-border rounded-xl font-bold shadow-sm"
                />
              </div>
            </div>
          </section>

          <section className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Notas Internas / Protocolos</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Describa detalles de entrada, personal clave o requerimientos específicos..."
              className="bg-card border-border rounded-2xl p-4 font-medium min-h-[120px] shadow-sm"
            />
          </section>
        </form>

        <div className="bg-card border-t border-border px-8 py-6 flex items-center justify-between gap-4">
          <Button variant="ghost" onClick={() => setOpen(false)} className="h-12 px-6 font-bold text-muted-foreground hover:text-slate-600 rounded-xl">
            Descartar Alta
          </Button>
          <Button onClick={handleSubmit} disabled={loading} className="h-12 px-10 bg-primary hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-[10px] rounded-xl shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.02] flex-1">
            {loading ? "Procesando..." : (centerData ? "Actualizar Registro Maestro" : "Finalizar Alta Sede")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
