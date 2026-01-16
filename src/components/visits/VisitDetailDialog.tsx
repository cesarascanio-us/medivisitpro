import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, Clock, FileText, UserRound, Building, Store, Package, Award, AlertCircle, TrendingUp, ShoppingCart, Truck, Loader2 } from "lucide-react";
import { ShelfAuditForm } from "./ShelfAuditForm";
import { PharmacyTrainingForm } from "./PharmacyTrainingForm";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Helper MultiSelect Component
function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Seleccionar...",
  emptyMessage = "No se encontraron resultados."
}: {
  options: { label: string; value: string }[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  emptyMessage?: string;
}) {
  const [open, setOpen] = useState(false);

  const handleUnselect = (item: string) => {
    onChange(selected.filter((i) => i !== item));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-auto min-h-[40px] px-3 py-2"
        >
          <div className="flex flex-wrap gap-1">
            {selected.length === 0 && <span className="text-muted-foreground font-normal">{placeholder}</span>}
            {selected.map((item) => (
              <Badge variant="secondary" key={item} className="mr-1 mb-1" onClick={(e) => {
                e.stopPropagation();
                handleUnselect(item);
              }}>
                {options.find(opt => opt.value === item)?.label || item}
                <div
                  className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleUnselect(item);
                    }
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleUnselect(item);
                  }}
                >
                  <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                </div>
              </Badge>
            ))}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput placeholder="Buscar..." />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  onSelect={() => {
                    if (selected.includes(option.value)) {
                      onChange(selected.filter((item) => item !== option.value));
                    } else {
                      onChange([...selected, option.value]);
                    }
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selected.includes(option.value) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
interface VisitDetailDialogProps {
  trigger: React.ReactNode;
  visitData?: any;
  onVisitSaved?: () => void;
}

interface Contact {
  id: string;
  name: string;
  specialty: string | null;
  contact_type: string;
  address: string | null;
}

const CONTACT_TYPE_LABELS: Record<string, { label: string; icon: typeof UserRound }> = {
  doctor: { label: 'Médico', icon: UserRound },
  pharmacy: { label: 'Farmacia', icon: Store },
  hospital: { label: 'Hospital', icon: Building },
  clinic: { label: 'Clínica', icon: Building },
};

export function VisitDetailDialog({ trigger, visitData, onVisitSaved }: VisitDetailDialogProps) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Contacts state
  const [contacts, setContacts] = useState<Contact[]>([]);
  // const [contactTypeFilter, setContactTypeFilter] = useState<string>("all"); // Removed
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [openCombobox, setOpenCombobox] = useState(false);

  // Resources state
  // Resources state (Full data for filtering)
  const [rawProducts, setRawProducts] = useState<any[]>([]);
  const [rawSamples, setRawSamples] = useState<any[]>([]);
  const [rawMaterials, setRawMaterials] = useState<any[]>([]);
  // Legacy options state (computed from raw)
  // const [productsList, setProductsList] = useState<{ label: string, value: string }[]>([]);
  // const [samplesList, setSamplesList] = useState<{ label: string, value: string }[]>([]);
  // const [materialsList, setMaterialsList] = useState<{ label: string, value: string }[]>([]);

  const [formData, setFormData] = useState({
    // Basic
    contact_id: visitData?.contact_id || "",
    scheduled_date: visitData?.scheduled_date?.split('T')[0] || "",
    scheduled_time: visitData?.scheduled_date?.split('T')[1]?.slice(0, 5) || "",
    arrival_time: visitData?.arrival_time || "",
    departure_time: visitData?.departure_time || "",
    visit_type: visitData?.visit_type || "doctor",
    status: visitData?.status || "scheduled",
    representative: visitData?.representative || "",

    // Pre-Visit
    cycle_condition: visitData?.cycle_condition || "",
    visit_objective: visitData?.visit_objective || visitData?.objective || "",

    // During Visit
    products_presented: visitData?.products_presented || [],
    samples_delivered: visitData?.samples_delivered || "",
    promotional_materials: visitData?.promotional_materials || "",
    doctor_interest: visitData?.doctor_interest || "",
    activity_performed: visitData?.activity_performed || "",

    // Post-Visit
    products_prescribed: visitData?.products_prescribed || "",
    results_notes: visitData?.results_notes || visitData?.notes || "",
    pending_followup: visitData?.pending_followup || "",
    next_visit_date: visitData?.next_visit_date || "",
    observations_feedback: visitData?.observations_feedback || visitData?.feedback || "",
    key_contact: visitData?.key_contact || false,
    competitor_activity: visitData?.competitor_activity || "",

    // Pharmacy Specific
    shelf_photo_url: visitData?.shelf_photo_url || "",
    purchase_driver: visitData?.purchase_driver || "",
    detected_purchase_reason: visitData?.detected_purchase_reason || "",

    // Closure
    next_step: visitData?.next_step || visitData?.next_steps || "",
    closure_reason: visitData?.closure_reason || "",
    contact_reaction: visitData?.contact_reaction || "",
    main_objection: visitData?.main_objection || "",
    closure_commitment: visitData?.closure_commitment || visitData?.agreements || "",
    file_url: visitData?.file_url || "",
    geolocation: visitData?.geolocation || ""
  });

  // Load contacts when dialog opens
  useEffect(() => {
    if (open) {
      loadContacts();
      loadResources();

      // Reset form data to defaults or visitData
      setFormData({
        contact_id: visitData?.contact_id || "",
        scheduled_date: visitData?.scheduled_date?.split('T')[0] || "",
        scheduled_time: visitData?.scheduled_date?.split('T')[1]?.slice(0, 5) || "",
        arrival_time: visitData?.arrival_time || "",
        departure_time: visitData?.departure_time || "",
        visit_type: visitData?.visit_type || "doctor",
        status: visitData?.status || "scheduled",
        representative: visitData?.representative || "",
        cycle_condition: visitData?.cycle_condition || "",
        visit_objective: visitData?.visit_objective || visitData?.objective || "",
        products_presented: visitData?.products_presented || [],
        samples_delivered: visitData?.samples_delivered || "",
        promotional_materials: visitData?.promotional_materials || "",
        doctor_interest: visitData?.doctor_interest || "",
        activity_performed: visitData?.activity_performed || "",
        products_prescribed: visitData?.products_prescribed || "",
        results_notes: visitData?.results_notes || visitData?.notes || "",
        pending_followup: visitData?.pending_followup || "",
        next_visit_date: visitData?.next_visit_date || "",
        observations_feedback: visitData?.observations_feedback || visitData?.feedback || "",
        key_contact: visitData?.key_contact || false,
        competitor_activity: visitData?.competitor_activity || "",
        shelf_photo_url: visitData?.shelf_photo_url || "",
        purchase_driver: visitData?.purchase_driver || "",
        detected_purchase_reason: visitData?.detected_purchase_reason || "",
        next_step: visitData?.next_step || visitData?.next_steps || "",
        closure_reason: visitData?.closure_reason || "",
        contact_reaction: visitData?.contact_reaction || "",
        main_objection: visitData?.main_objection || "",
        closure_commitment: visitData?.closure_commitment || visitData?.agreements || "",
        file_url: visitData?.file_url || "",
        geolocation: visitData?.geolocation || ""
      });
    }
  }, [open, visitData]);

  const loadContacts = async () => {
    if (!user) return;
    setLoadingContacts(true);
    try {
      // 1. Fetch Generic Contacts
      let contactsQuery = supabase
        .from('contacts')
        .select('id, name, specialty, contact_type, address')
        .eq('user_id', user.id);

      // 2. Fetch Doctors
      let doctorsQuery = supabase.from('doctors').select('id, name, specialty, address, user_id').eq('user_id', user.id);

      // 3. Fetch Pharmacies
      let pharmaciesQuery = supabase.from('pharmacies').select('id, name, address, user_id').eq('user_id', user.id);

      const [contactsRes, doctorsRes, pharmaciesRes] = await Promise.all([
        contactsQuery,
        doctorsQuery,
        pharmaciesQuery
      ]);

      const unifiedContactsMap = new Map<string, Contact>();

      // Process Generic Contacts
      if (contactsRes.data) {
        contactsRes.data.forEach((c: any) => {
          unifiedContactsMap.set(c.id, c);
        });
      }

      // Process Doctors
      if (doctorsRes.data) {
        doctorsRes.data.forEach((d: any) => {
          if (!unifiedContactsMap.has(d.id)) {
            unifiedContactsMap.set(d.id, {
              id: d.id,
              name: d.name,
              specialty: d.specialty || 'General',
              contact_type: 'doctor',
              address: d.address
            });
          }
        });
      }

      // Process Pharmacies
      if (pharmaciesRes.data) {
        pharmaciesRes.data.forEach((p: any) => {
          if (!unifiedContactsMap.has(p.id)) {
            unifiedContactsMap.set(p.id, {
              id: p.id,
              name: p.name,
              specialty: 'Farmacia',
              contact_type: 'pharmacy',
              address: p.address
            });
          }
        });
      }

      // Sort alpha
      const uniqueContacts = Array.from(unifiedContactsMap.values()).sort((a, b) => a.name.localeCompare(b.name));

      setContacts(uniqueContacts);
    } catch (error) {
      console.error('Error loading contacts:', error);
    } finally {
      setLoadingContacts(false);
    }
  };

  const loadResources = async () => {
    if (!user) return;
    try {
      // Fetch Products
      // Fetch Products
      const { data: productsData } = await supabase
        .from('products')
        .select('id, name, medical_specialties')
        .order('name');

      if (productsData) {
        setRawProducts(productsData);
      }

      // Fetch Samples (from sample_inventory with product name)
      const { data: samplesData } = await supabase
        .from('sample_inventory')
        .select('product_id, batch_number, products(name, medical_specialties)')
        .gt('quantity_available', 0);

      if (samplesData) {
        setRawSamples(samplesData);
      }

      // Fetch Materials
      // Validating table name: trying 'promotional_materials' as per types, fallback to 'materiales_promocionales' if needed
      // but sticking to existing code's table name 'materiales_promocionales' for safety, adding product relation if possible
      const { data: materialsData } = await supabase
        .from('materiales_promocionales')
        .select('id, nombre, product_id, products(medical_specialties)') // Assuming relationship exists
        .gt('cantidad_disponible', 0);

      if (materialsData) {
        setRawMaterials(materialsData);
      }
    } catch (error) {
      console.error('Error loading resources:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!formData.contact_id) {
      toast({ title: "Error", description: "Selecciona un contacto", variant: "destructive" });
      return;
    }

    setLoading(true);

    try {
      const scheduledDateTime = new Date(`${formData.scheduled_date}T${formData.scheduled_time}`);

      const visitPayload = {
        contact_id: formData.contact_id,
        scheduled_date: scheduledDateTime.toISOString(),
        arrival_time: formData.arrival_time || null,
        departure_time: formData.departure_time || null,
        visit_type: formData.visit_type,
        status: formData.status,
        representative: formData.representative || null,

        // Pre-Visit
        cycle_condition: formData.cycle_condition || null,
        visit_objective: formData.visit_objective || null,
        objective: formData.visit_objective || null, // legacy field

        // During Visit
        products_presented: formData.products_presented,
        samples_delivered: formData.samples_delivered || null,
        promotional_materials: formData.promotional_materials || null,
        doctor_interest: formData.doctor_interest || null,
        activity_performed: formData.activity_performed || null,

        // Post-Visit
        products_prescribed: formData.products_prescribed || null,
        results_notes: formData.results_notes || null,
        notes: formData.results_notes || null, // legacy field
        pending_followup: formData.pending_followup || null,
        next_visit_date: formData.next_visit_date || null,
        observations_feedback: formData.observations_feedback || null,
        feedback: formData.observations_feedback || null, // legacy field
        key_contact: formData.key_contact,
        competitor_activity: formData.competitor_activity || null,

        // Pharmacy Specific
        shelf_photo_url: formData.shelf_photo_url || null,
        purchase_driver: formData.purchase_driver || null,
        detected_purchase_reason: formData.detected_purchase_reason || null,

        // Closure
        next_step: formData.next_step || null,
        next_steps: formData.next_step || null, // legacy field
        closure_reason: formData.closure_reason || null,
        contact_reaction: formData.contact_reaction || null,
        main_objection: formData.main_objection || null,
        closure_commitment: formData.closure_commitment || null,
        agreements: formData.closure_commitment || null, // legacy field
        file_url: formData.file_url || null,
        geolocation: formData.geolocation || null,

        user_id: user.id
      };

      let result;
      if (visitData) {
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
        title: visitData ? "Visita actualizada" : "Visita creada",
        description: visitData ? "La visita ha sido actualizada correctamente." : "Nueva visita programada exitosamente.",
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

  const getContactTypeIcon = (type: string) => {
    const config = CONTACT_TYPE_LABELS[type];
    if (!config) return <UserRound className="h-4 w-4" />;
    const Icon = config.icon;
    return <Icon className="h-4 w-4" />;
  };

  const selectedContact = contacts.find(c => c.id === formData.contact_id);
  const isDoctor = formData.visit_type === 'doctor';
  const isPharmacy = formData.visit_type === 'pharmacy';

  // Filter Resources based on Specialty
  const getFilteredOptions = (type: 'products' | 'samples' | 'materials') => {
    let doctorSpecialty = '';
    const shouldFilter = isDoctor && selectedContact && selectedContact.contact_type === 'doctor';

    if (shouldFilter && selectedContact.specialty) {
      doctorSpecialty = selectedContact.specialty.toLowerCase().trim();
    }

    if (type === 'products') {
      let filtered = rawProducts;
      if (shouldFilter && doctorSpecialty) {
        filtered = rawProducts.filter(p => {
          const specs = p.medical_specialties ? p.medical_specialties.split(',').map((s: string) => s.trim().toLowerCase()) : [];
          return specs.includes(doctorSpecialty) || specs.length === 0; // Show if specialty matches OR if product is generic (no specialty)
        });
      }
      return filtered.map(p => ({ label: p.name, value: p.name }));
    }

    if (type === 'samples') {
      let filtered = rawSamples;
      if (shouldFilter && doctorSpecialty) {
        filtered = rawSamples.filter(s => {
          const p = s.products;
          const specs = p?.medical_specialties ? p.medical_specialties.split(',').map((s: string) => s.trim().toLowerCase()) : [];
          return specs.includes(doctorSpecialty) || specs.length === 0;
        });
      }
      return filtered.map(s => ({
        label: `${s.products?.name} - Lote: ${s.batch_number}`,
        value: `${s.products?.name} (${s.batch_number})`
      }));
    }

    if (type === 'materials') {
      let filtered = rawMaterials;
      if (shouldFilter && doctorSpecialty) {
        filtered = rawMaterials.filter(m => {
          const p = m.products;
          // Some materials might not be linked to a product, show them.
          if (!p) return true;
          const specs = p.medical_specialties ? p.medical_specialties.split(',').map((s: string) => s.trim().toLowerCase()) : [];
          return specs.includes(doctorSpecialty) || specs.length === 0;
        });
      }
      return filtered.map(m => ({ label: m.nombre, value: m.nombre }));
    }

    return [];
  };

  const productsList = getFilteredOptions('products');
  const samplesList = getFilteredOptions('samples');
  const materialsList = getFilteredOptions('materials');

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <FileText className="mr-2 h-5 w-5 icon-medical" />
            {visitData ? "Detalles de Visita" : "Nueva Visita"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="flex flex-wrap h-auto w-full justify-start gap-1 p-1 mb-6 bg-muted text-muted-foreground rounded-lg">
              <TabsTrigger value="basic" className="flex-1 min-w-[100px] data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">Básica</TabsTrigger>
              <TabsTrigger value="activity" className="flex-1 min-w-[100px] data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">Actividad</TabsTrigger>
              <TabsTrigger value="results" className="flex-1 min-w-[100px] data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">Resultados</TabsTrigger>
              <TabsTrigger value="closure" className="flex-1 min-w-[100px] data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">Cierre</TabsTrigger>
              {isPharmacy && <TabsTrigger value="audit" className="flex-1 min-w-[100px] data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">Auditoría</TabsTrigger>}
              {isPharmacy && <TabsTrigger value="training" className="flex-1 min-w-[100px] data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">Capacitación</TabsTrigger>}
            </TabsList>

            {/* TAB 1: BASIC INFO */}
            <TabsContent value="basic" className="space-y-4">
              <h3 className="text-lg font-semibold">Información Básica</h3>

              {/* Visit Type */}
              <div className="space-y-2">
                <Label>Tipo de Visita</Label>
                <Select
                  value={formData.visit_type}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, visit_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="doctor">👨‍⚕️ Visita a Médico</SelectItem>
                    <SelectItem value="pharmacy">💊 Visita a Farmacia</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Contact Selector */}
              <div className="space-y-2">
                <Label htmlFor="contact">
                  {formData.visit_type === 'doctor' ? 'Médico' : 'Farmacia'}
                </Label>
                <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openCombobox}
                      className="w-full justify-between"
                    >
                      {formData.contact_id
                        ? contacts.find((contact) => contact.id === formData.contact_id)?.name
                        : "Seleccionar contacto..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                    <Command>
                      <CommandInput placeholder="Buscar contacto..." />
                      <CommandList>
                        <CommandEmpty>No se encontraron contactos.</CommandEmpty>
                        <CommandGroup>
                          {contacts
                            .filter(contact => contact.contact_type === formData.visit_type)
                            .map((contact) => (
                              <CommandItem
                                key={contact.id}
                                value={contact.name}
                                onSelect={() => {
                                  setFormData(prev => ({ ...prev, contact_id: contact.id }));
                                  setOpenCombobox(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    formData.contact_id === contact.id ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                <div className="flex flex-col">
                                  <span className="font-medium">{contact.name}</span>
                                  {contact.specialty && (
                                    <span className="text-xs text-muted-foreground">{contact.specialty}</span>
                                  )}
                                </div>
                                <div className="ml-auto text-xs text-muted-foreground">
                                  {getContactTypeIcon(contact.contact_type)}
                                </div>
                              </CommandItem>
                            ))}
                          {contacts.filter(c => c.contact_type === formData.visit_type).length === 0 && (
                            <div className="py-6 text-center text-sm text-muted-foreground">
                              No se encontraron {formData.visit_type === 'doctor' ? 'médicos' : 'farmacias'}.
                            </div>
                          )}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {selectedContact && (
                  <p className="text-xs text-muted-foreground">
                    {CONTACT_TYPE_LABELS[selectedContact.contact_type]?.label || 'Contacto'} • {selectedContact.address || 'Sin dirección'}
                  </p>
                )}
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date" className="flex items-center">
                    <Calendar className="mr-1 h-4 w-4" />
                    Fecha
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.scheduled_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, scheduled_date: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time" className="flex items-center">
                    <Clock className="mr-1 h-4 w-4" />
                    Hora Programada
                  </Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.scheduled_time}
                    onChange={(e) => setFormData(prev => ({ ...prev, scheduled_time: e.target.value }))}
                    required
                  />
                </div>
              </div>

              {/* Arrival & Departure */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="arrival">Hora Llegada</Label>
                  <Input
                    id="arrival"
                    type="time"
                    value={formData.arrival_time}
                    onChange={(e) => setFormData(prev => ({ ...prev, arrival_time: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="departure">Hora Salida</Label>
                  <Input
                    id="departure"
                    type="time"
                    value={formData.departure_time}
                    onChange={(e) => setFormData(prev => ({ ...prev, departure_time: e.target.value }))}
                  />
                </div>
              </div>

              {/* Status */}
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
                    <SelectItem value="in_progress">En Progreso</SelectItem>
                    <SelectItem value="completed">Completada</SelectItem>
                    <SelectItem value="cancelled">Cancelada</SelectItem>
                    <SelectItem value="no_show">No se presentó</SelectItem>
                  </SelectContent>
                </Select>
              </div>



              {/* Pre-Visit */}
              <div className="space-y-2">
                <Label htmlFor="cycle">Condición del Ciclo</Label>
                <Input
                  id="cycle"
                  value={formData.cycle_condition}
                  onChange={(e) => setFormData(prev => ({ ...prev, cycle_condition: e.target.value }))}
                  placeholder="Ciclo actual, fase..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="objective">Objetivo de la Visita</Label>
                <Textarea
                  id="objective"
                  value={formData.visit_objective}
                  onChange={(e) => setFormData(prev => ({ ...prev, visit_objective: e.target.value }))}
                  placeholder="Objetivo principal de esta visita..."
                  rows={2}
                />
              </div>
            </TabsContent>

            {/* TAB 2: ACTIVITY */}
            <TabsContent value="activity" className="space-y-4">
              <h3 className="text-lg font-semibold">Durante la Visita</h3>


              <div className="space-y-2">
                <Label>Productos Presentados</Label>
                <MultiSelect
                  options={productsList}
                  selected={formData.products_presented}
                  onChange={(selected) => setFormData(prev => ({ ...prev, products_presented: selected }))}
                  placeholder="Seleccionar productos..."
                />
              </div>

              <div className="space-y-2">
                <Label>Muestras Entregadas</Label>
                <MultiSelect
                  options={samplesList}
                  selected={formData.samples_delivered ? formData.samples_delivered.split(', ').filter(Boolean) : []}
                  onChange={(selected) => setFormData(prev => ({ ...prev, samples_delivered: selected.join(', ') }))}
                  placeholder="Seleccionar muestras..."
                  emptyMessage="No hay muestras disponibles"
                />
              </div>

              <div className="space-y-2">
                <Label>Materiales Promocionales</Label>
                <MultiSelect
                  options={materialsList}
                  selected={formData.promotional_materials ? formData.promotional_materials.split(', ').filter(Boolean) : []}
                  onChange={(selected) => setFormData(prev => ({ ...prev, promotional_materials: selected.join(', ') }))}
                  placeholder="Seleccionar materiales..."
                  emptyMessage="No hay materiales disponibles"
                />
              </div>

              {/* Doctor specific */}
              {isDoctor && (
                <div className="space-y-2">
                  <Label htmlFor="interest">Interés del Médico</Label>
                  <Select
                    value={formData.doctor_interest}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, doctor_interest: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar interés" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Alto">Alto</SelectItem>
                      <SelectItem value="Medio">Medio</SelectItem>
                      <SelectItem value="Bajo">Bajo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Pharmacy specific */}
              {isPharmacy && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="shelf">URL Foto Estantería</Label>
                    <Input
                      id="shelf"
                      value={formData.shelf_photo_url}
                      onChange={(e) => setFormData(prev => ({ ...prev, shelf_photo_url: e.target.value }))}
                      placeholder="https://..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="driver">Driver de Compra</Label>
                    <Input
                      id="driver"
                      value={formData.purchase_driver}
                      onChange={(e) => setFormData(prev => ({ ...prev, purchase_driver: e.target.value }))}
                      placeholder="Razón principal de compra..."
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="activity">Actividad Realizada</Label>
                <Textarea
                  id="activity"
                  value={formData.activity_performed}
                  onChange={(e) => setFormData(prev => ({ ...prev, activity_performed: e.target.value }))}
                  placeholder="Descripción detallada..."
                  rows={3}
                />
              </div>
            </TabsContent>

            {/* TAB: AUDIT (Pharmacy Only) */}
            {isPharmacy && (
              <TabsContent value="audit" className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Auditoría de Anaquel
                  </h3>
                  {!visitData?.id && (
                    <Badge variant="outline" className="text-yellow-600 border-yellow-200 bg-yellow-50">
                      Guarda la visita para auditar
                    </Badge>
                  )}
                </div>

                {visitData?.id ? (
                  <ShelfAuditForm
                    visitId={visitData.id}
                    pharmacyId={visitData.pharmacy_id || visitData.contact_id}
                    pharmacyName={selectedContact?.name || "Farmacia"}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg bg-muted/50 text-center">
                    <Store className="h-12 w-12 text-muted-foreground/50 mb-3" />
                    <h4 className="text-base font-medium mb-1">Visita no guardada</h4>
                    <p className="text-sm text-muted-foreground max-w-xs">
                      Debes guardar los detalles básicos de la visita antes de poder registrar una auditoría de precios y stock.
                    </p>
                  </div>
                )}
              </TabsContent>
            )}

            {/* TAB 3: RESULTS */}
            <TabsContent value="results" className="space-y-4">
              <h3 className="text-lg font-semibold">Post-Visita y Resultados</h3>

              <div className="space-y-2">
                <Label htmlFor="prescribed">Productos Prescritos/Pedidos</Label>
                <Input
                  id="prescribed"
                  value={formData.products_prescribed}
                  onChange={(e) => setFormData(prev => ({ ...prev, products_prescribed: e.target.value }))}
                  placeholder="Productos que se comprometieron a prescribir..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="results">Resultados y Notas</Label>
                <Textarea
                  id="results"
                  value={formData.results_notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, results_notes: e.target.value }))}
                  placeholder="Resultados generales de la visita..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="followup">Seguimiento Pendiente</Label>
                <Textarea
                  id="followup"
                  value={formData.pending_followup}
                  onChange={(e) => setFormData(prev => ({ ...prev, pending_followup: e.target.value }))}
                  placeholder="Acciones pendientes..."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nextdate">Próxima Fecha Sugerida</Label>
                <Input
                  id="nextdate"
                  type="date"
                  value={formData.next_visit_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, next_visit_date: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="obs">Observaciones y Feedback</Label>
                <Textarea
                  id="obs"
                  value={formData.observations_feedback}
                  onChange={(e) => setFormData(prev => ({ ...prev, observations_feedback: e.target.value }))}
                  placeholder="Feedback recibido..."
                  rows={2}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="key"
                  checked={formData.key_contact}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, key_contact: !!checked }))}
                />
                <Label htmlFor="key" className="font-normal cursor-pointer">
                  Marcar como Contacto Clave
                </Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="comp">Actividad de Competencia</Label>
                <Textarea
                  id="comp"
                  value={formData.competitor_activity}
                  onChange={(e) => setFormData(prev => ({ ...prev, competitor_activity: e.target.value }))}
                  placeholder="Productos competidores, actividades observadas..."
                  rows={2}
                />
              </div>

              {isPharmacy && (
                <div className="space-y-2">
                  <Label htmlFor="reason">Motivo de Compra Detectado</Label>
                  <Input
                    id="reason"
                    value={formData.detected_purchase_reason}
                    onChange={(e) => setFormData(prev => ({ ...prev, detected_purchase_reason: e.target.value }))}
                    placeholder="Razón principal detectada..."
                  />
                </div>
              )}
            </TabsContent>

            {/* TAB 4: CLOSURE */}
            <TabsContent value="closure" className="space-y-4">
              <h3 className="text-lg font-semibold">Cierre y Compromisos</h3>

              <div className="space-y-2">
                <Label htmlFor="nextstep">Próximo Paso</Label>
                <Textarea
                  id="nextstep"
                  value={formData.next_step}
                  onChange={(e) => setFormData(prev => ({ ...prev, next_step: e.target.value }))}
                  placeholder="Acción inmediata a realizar..."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="closurereason">Motivo de Cierre</Label>
                <Input
                  id="closurereason"
                  value={formData.closure_reason}
                  onChange={(e) => setFormData(prev => ({ ...prev, closure_reason: e.target.value }))}
                  placeholder="Razón de cierre de visita..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reaction">Reacción del Contacto</Label>
                <Select
                  value={formData.contact_reaction}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, contact_reaction: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar reacción" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Muy Positiva">😊 Muy Positiva</SelectItem>
                    <SelectItem value="Positiva">🙂 Positiva</SelectItem>
                    <SelectItem value="Neutral">😐 Neutral</SelectItem>
                    <SelectItem value="Negativa">☹️ Negativa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="objection">Objeción Principal</Label>
                <Textarea
                  id="objection"
                  value={formData.main_objection}
                  onChange={(e) => setFormData(prev => ({ ...prev, main_objection: e.target.value }))}
                  placeholder="Principal objeción presentada..."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="commitment">Compromiso de Cierre</Label>
                <Textarea
                  id="commitment"
                  value={formData.closure_commitment}
                  onChange={(e) => setFormData(prev => ({ ...prev, closure_commitment: e.target.value }))}
                  placeholder="Compromisos alcanzados..."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="file">Archivo Adjunto (URL)</Label>
                <Input
                  id="file"
                  value={formData.file_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, file_url: e.target.value }))}
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="geo">Geolocalización</Label>
                <Input
                  id="geo"
                  value={formData.geolocation}
                  onChange={(e) => setFormData(prev => ({ ...prev, geolocation: e.target.value }))}
                  placeholder="Lat, Long o dirección..."
                />
              </div>
            </TabsContent>

            {/* TAB: TRAINING (Pharmacy Only) */}
            {isPharmacy && (
              <TabsContent value="training" className="space-y-4">
                {visitData?.id ? (
                  <PharmacyTrainingForm
                    visitId={visitData.id}
                    pharmacyId={visitData.contact_id || formData.contact_id}
                  />
                ) : (
                  <div className="p-8 text-center bg-slate-50 border border-dashed rounded-lg">
                    <p className="text-muted-foreground">
                      Guarda la visita primero para registrar capacitaciones.
                    </p>
                  </div>
                )}
              </TabsContent>
            )}
          </Tabs>

          <div className="flex flex-wrap justify-end gap-2 pt-4 border-t">
            {/* Sales Integration Buttons */}
            {formData.visit_type === 'doctor' && (
              <Button
                type="button"
                variant="secondary"
                className="gap-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200"
                onClick={() => {
                  const contact = contacts.find(c => c.id === formData.contact_id);
                  navigate('/commercial/builder', {
                    state: {
                      initialContact: contact,
                      orderType: 'direct_sale'
                    }
                  });
                }}
              >
                <ShoppingCart className="h-4 w-4" />
                Registrar Venta
              </Button>
            )}

            {formData.visit_type === 'pharmacy' && (
              <>
                <Button
                  type="button"
                  variant="secondary"
                  className="gap-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200"
                  onClick={() => {
                    const contact = contacts.find(c => c.id === formData.contact_id);
                    navigate('/commercial/builder', {
                      state: {
                        initialContact: contact,
                        orderType: 'direct_sale'
                      }
                    });
                  }}
                >
                  <ShoppingCart className="h-4 w-4" />
                  Registrar Venta
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  className="gap-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200"
                  onClick={() => {
                    const contact = contacts.find(c => c.id === formData.contact_id);
                    navigate('/transfer-orders', {
                      state: {
                        initialContact: contact,
                        orderType: 'transfer'
                      }
                    });
                  }}
                >
                  <Truck className="h-4 w-4" />
                  Registrar Transferencia
                </Button>
              </>
            )}

            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="btn-medical">
              {loading ? "Guardando..." : (visitData ? "Actualizar Visita" : "Crear Visita")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog >
  );
}