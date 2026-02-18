import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, MapPin, User, Clock, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ContactDialog } from "@/components/contacts/ContactDialog";

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
        title: visitData?.id ? "Visita actualizada" : "Visita creada",
        description: visitData?.id ? "La visita ha sido actualizada correctamente." : "Nueva visita programada exitosamente.",
      });

      setOpen(false);
      onVisitSaved?.();
    } catch (error) {
      console.error('Error saving visit:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar la visita. Inténtalo de nuevo.",
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
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5 icon-medical" />
              {visitData?.id ? "Editar Visita" : "Nueva Visita"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="contact">Contacto Médico</Label>
              <div className="flex gap-2">
                <Select
                  value={formData.contact_id}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, contact_id: value }))}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Seleccionar contacto" />
                  </SelectTrigger>
                  <SelectContent>
                    {contacts.map((contact) => (
                      <SelectItem key={contact.id} value={contact.id}>
                        {contact.name} - {contact.specialty || 'Sin especialidad'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setShowNewContactDialog(true)}
                  title="Crear nuevo contacto"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Fecha</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.scheduled_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, scheduled_date: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Hora</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.scheduled_time}
                  onChange={(e) => setFormData(prev => ({ ...prev, scheduled_time: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="objective">Objetivo de la Visita</Label>
              <Input
                id="objective"
                value={formData.objective}
                onChange={(e) => setFormData(prev => ({ ...prev, objective: e.target.value }))}
                placeholder="ej. Presentar nuevo medicamento, seguimiento..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notas</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Notas adicionales sobre la visita..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Programada</SelectItem>
                  <SelectItem value="completed">Completada</SelectItem>
                  <SelectItem value="cancelled">Cancelada</SelectItem>
                  <SelectItem value="no_show">No se presentó</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading} className="btn-medical">
                {loading ? "Guardando..." : (visitData?.id ? "Actualizar" : "Crear Visita")}
              </Button>
            </div>
          </form>
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