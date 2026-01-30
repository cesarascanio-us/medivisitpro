import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { User, Building, MapPin, X, Leaf } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

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
      const contactPayload = {
        ...formData,
        user_id: user.data.user?.id
      };

      let contactId: string;

      if (contactData) {
        const result = await supabase
          .from('contacts')
          .update(contactPayload)
          .eq('id', contactData.id)
          .select()
          .single();

        if (result.error) throw result.error;
        contactId = contactData.id;
      } else {
        const result = await supabase
          .from('contacts')
          .insert([contactPayload])
          .select()
          .single();

        if (result.error) throw result.error;
        contactId = result.data.id;
      }

      // Update health center associations
      // First, delete existing associations
      await supabase
        .from('contact_health_centers')
        .delete()
        .eq('contact_id', contactId);

      // Then, insert new associations
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
        description: contactData ? "El contacto ha sido actualizado correctamente." : "Nuevo contacto añadido al directorio.",
      });

      setOpen(false);
      onContactSaved?.();
    } catch (error) {
      console.error('Error saving contact:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar el contacto. Inténtalo de nuevo.",
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
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <User className="mr-2 h-5 w-5 icon-medical" />
            {contactData ? "Editar Contacto" : "Nuevo Contacto"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Información Básica</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre Completo *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Dr./Dra. Nombre Apellido"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_type">Tipo de Contacto</Label>
                <Select
                  value={formData.contact_type}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, contact_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="doctor">Médico</SelectItem>
                    <SelectItem value="pharmacy">Farmacia</SelectItem>
                    <SelectItem value="natural_store">Tienda Naturista</SelectItem>
                    <SelectItem value="drugstore">Droguería</SelectItem>
                    <SelectItem value="hospital">Hospital</SelectItem>
                    <SelectItem value="clinic">Clínica</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {(formData.contact_type === 'doctor' || formData.contact_type === 'hospital' || formData.contact_type === 'clinic') && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="specialty">Especialidad</Label>
                  <Input
                    id="specialty"
                    value={formData.specialty}
                    onChange={(e) => setFormData(prev => ({ ...prev, specialty: e.target.value }))}
                    placeholder="ej. Cardiología, Neurología..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Prioridad</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baja</SelectItem>
                      <SelectItem value="medium">Media</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="urgent">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {(formData.contact_type === 'natural_store' || formData.contact_type === 'pharmacy' || formData.contact_type === 'drugstore') && (
              <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                <h4 className="text-sm font-semibold flex items-center">
                  <Leaf className="mr-2 h-4 w-4 text-emerald-600" />
                  Alta Comercial (Profiling)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rif">RIF *</Label>
                    <Input
                      id="rif"
                      value={formData.rif}
                      onChange={(e) => setFormData(prev => ({ ...prev, rif: e.target.value }))}
                      placeholder="J-12345678-9"
                      required={formData.contact_type === 'natural_store'}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="owner_name">Dueño / Encargado</Label>
                    <Input
                      id="owner_name"
                      value={formData.owner_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, owner_name: e.target.value }))}
                      placeholder="Nombre del responsable"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="sanitary_permits"
                    checked={formData.sanitary_permits}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, sanitary_permits: !!checked }))}
                  />
                  <Label htmlFor="sanitary_permits" className="text-sm font-normal cursor-pointer">
                    Cuenta con Permisos Sanitarios vigentes
                  </Label>
                </div>

                <div className="space-y-2 mt-2">
                  <Label htmlFor="priority">Prioridad Comercial</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baja</SelectItem>
                      <SelectItem value="medium">Media</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="urgent">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Health Centers Association */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Centros de Salud</h3>
              <span className="text-sm text-muted-foreground">
                {selectedCenters.length} seleccionados
              </span>
            </div>

            {selectedCenters.length > 0 && (
              <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-lg">
                {selectedCenters.map(centerId => {
                  const center = getSelectedCenter(centerId);
                  return center ? (
                    <Badge key={centerId} variant="secondary" className="flex items-center gap-1">
                      <Building className="h-3 w-3" />
                      {center.name}
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-destructive"
                        onClick={() => toggleCenter(centerId)}
                      />
                    </Badge>
                  ) : null;
                })}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto p-2 border rounded-lg">
              {healthCenters.map((center) => (
                <div
                  key={center.id}
                  className="flex items-start space-x-2 p-3 rounded-lg hover:bg-accent cursor-pointer"
                  onClick={() => toggleCenter(center.id)}
                >
                  <Checkbox
                    checked={selectedCenters.includes(center.id)}
                    onCheckedChange={() => toggleCenter(center.id)}
                  />
                  <div className="flex-1">
                    <p className="font-medium text-sm text-foreground">{center.name}</p>
                    <p className="text-xs text-muted-foreground">{center.type} - {center.city}</p>
                  </div>
                </div>
              ))}
            </div>

            {healthCenters.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No hay centros de salud disponibles. Crea uno primero en el módulo de Centros de Salud.
              </p>
            )}
          </div>

          <Separator />

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Información de Contacto</h3>

            <div className="space-y-2">
              <Label htmlFor="address">Dirección</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Dirección completa"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">Ciudad</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                placeholder="Ciudad"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+58 XXX XXX XXXX"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="email@ejemplo.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="work_hours">Horario de Atención</Label>
              <Input
                id="work_hours"
                value={formData.work_hours}
                onChange={(e) => setFormData(prev => ({ ...prev, work_hours: e.target.value }))}
                placeholder="ej. Lunes a Viernes: 9:00-17:00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notas</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Información adicional sobre el contacto..."
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="btn-medical">
              {loading ? "Guardando..." : (contactData ? "Actualizar" : "Crear Contacto")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}