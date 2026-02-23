/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */


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
import {
  Calendar, Clock, FileText, UserRound, Building, Store, Package, Award, AlertCircle,
  TrendingUp, ShoppingCart, Truck, Loader2, Sparkles, Navigation, MapPinOff,
  Camera, Upload, MapPin, Calculator, XCircle, ChevronRight, Check, ChevronsUpDown, X,
  Layers, Search, ShieldCheck, Map as MapIcon, Activity, Target
} from "lucide-react";
import { ShelfAuditForm } from "./ShelfAuditForm";
import { PharmacyTrainingForm } from "./PharmacyTrainingForm";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useOrganization } from "@/hooks/useOrganization";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { SupervisorEvaluationModal } from "./SupervisorEvaluationModal";

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
          className="w-full justify-between h-auto min-h-[48px] px-3 py-2 border-slate-200 rounded-xl bg-white shadow-sm hover:border-indigo-400 transition-all"
        >
          <div className="flex flex-wrap gap-1">
            {selected.length === 0 && <span className="text-slate-400 font-bold text-xs uppercase tracking-tight ml-1">{placeholder}</span>}
            {selected.map((item) => (
              <Badge variant="secondary" key={item} className="mr-1 mb-1 bg-indigo-50 text-indigo-700 border-indigo-100 font-bold" onClick={(e) => {
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
                  <X className="h-3 w-3 text-indigo-400 hover:text-indigo-600" />
                </div>
              </Badge>
            ))}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0 rounded-2xl border-slate-100 shadow-2xl">
        <Command className="rounded-2xl">
          <CommandInput placeholder="Buscar..." className="h-12" />
          <CommandList className="max-h-60 custom-scrollbar">
            <CommandEmpty className="py-6 text-center text-xs font-bold text-slate-400 uppercase">{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  className="py-3 font-bold text-slate-700"
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
                      "mr-2 h-4 w-4 text-indigo-600",
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
  potential?: string;
}

const BUCKET_NAME = 'visit_attachments';

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
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState("basic");

  // Contacts state
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [openCombobox, setOpenCombobox] = useState(false);

  // Resources state
  const [rawProducts, setRawProducts] = useState<any[]>([]);
  const [rawSamples, setRawSamples] = useState<any[]>([]);
  const [rawMaterials, setRawMaterials] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    contact_id: visitData?.contact_id || "",
    scheduled_date: visitData?.scheduled_date?.split('T')[0] || new Date().toISOString().split('T')[0],
    scheduled_time: visitData?.scheduled_date?.split('T')[1]?.slice(0, 5) || "09:00",
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
    geolocation: visitData?.geolocation || "",
    selling_points: visitData?.selling_points || [],
    compromiso_inicio: visitData?.compromiso_inicio || 0,
    objection_selector: visitData?.objection_selector || "",
    sample_tracking_id: visitData?.sample_tracking_id || "",
    competitor_brands_detected: visitData?.competitor_brands_detected || [],
    pop_checklist_completed: visitData?.pop_checklist_completed || {},
  });

  const { organization } = useOrganization();
  const orgSettings = (organization?.settings || {}) as any;
  const competitorOptions = (orgSettings.competitor_brands || []).map((b: string) => ({ label: b, value: b }));
  const popChecklist = orgSettings.pop_checklist || [];
  const objectionScripts = orgSettings.objection_scripts || [];

  const [dosingState, setDosingState] = useState({
    weight: 0,
    productDose: 0,
    concentration: 0,
    result: 0
  });

  const [productSellingPoints, setProductSellingPoints] = useState<any[]>([]);
  const [nearbyPharmacies, setNearbyPharmacies] = useState<any[]>([]);
  const [loadingNearby, setLoadingNearby] = useState(false);

  useEffect(() => {
    if (open) {
      loadContacts();
      loadResources();
    }
  }, [open]);

  useEffect(() => {
    const fetchProductTags = async () => {
      if (formData.products_presented.length > 0) {
        const { data } = await supabase
          .from('products')
          .select('id, name, selling_points, dosage_config')
          .in('name', formData.products_presented);

        if (data) {
          setProductSellingPoints(data);
          const productsWithDosage = (data as any[]).filter(p => p.dosage_config && p.dosage_config.default_dose_mg_kg > 0);
          if (productsWithDosage.length > 0) {
            const config = productsWithDosage[0].dosage_config;
            setDosingState(prev => ({
              ...prev,
              productDose: config.default_dose_mg_kg,
              concentration: config.concentration_mg_ml,
              result: (config.default_dose_mg_kg * (prev.weight || 0)) / (config.concentration_mg_ml || 1)
            }));
          }
        }
      } else {
        setProductSellingPoints([]);
      }
    };
    fetchProductTags();
  }, [formData.products_presented]);

  useEffect(() => {
    const fetchNearby = async () => {
      if (formData.visit_type === 'doctor' && formData.contact_id) {
        setLoadingNearby(true);
        try {
          const { data, error } = await (supabase as any).rpc('get_visit_impact_correlation', {
            p_doctor_id: formData.contact_id,
            p_radius_km: 10.0
          });
          if (!error && data) {
            setNearbyPharmacies((data as any[]).sort((a, b) => a.distance_km - b.distance_km).slice(0, 3));
          }
        } catch (e) { console.error(e); } finally { setLoadingNearby(false); }
      } else { setNearbyPharmacies([]); }
    };
    fetchNearby();
  }, [formData.contact_id, formData.visit_type]);

  const loadContacts = async () => {
    if (!user) return;
    setLoadingContacts(true);
    try {
      const [contactsRes, doctorsRes, pharmaciesRes] = await Promise.all([
        supabase.from('contacts').select('id, name, specialty, contact_type, address').eq('user_id', user.id),
        supabase.from('doctors').select('id, name, specialty, address, user_id').eq('user_id', user.id),
        supabase.from('pharmacies').select('id, name, address, user_id').eq('user_id', user.id)
      ]);
      const unifiedContactsMap = new Map<string, Contact>();
      if (contactsRes.data) (contactsRes.data as any[]).forEach((c: any) => unifiedContactsMap.set(c.id, c));
      if (doctorsRes.data) (doctorsRes.data as any[]).forEach((d: any) => { if (!unifiedContactsMap.has(d.id)) unifiedContactsMap.set(d.id, { id: d.id, name: d.name, specialty: d.specialty || 'General', contact_type: 'doctor', address: d.address }); });
      if (pharmaciesRes.data) (pharmaciesRes.data as any[]).forEach((p: any) => { if (!unifiedContactsMap.has(p.id)) unifiedContactsMap.set(p.id, { id: p.id, name: p.name, specialty: 'Farmacia', contact_type: 'pharmacy', address: p.address }); });
      setContacts(Array.from(unifiedContactsMap.values()).sort((a: Contact, b: Contact) => a.name.localeCompare(b.name)));
    } catch (e) { console.error(e); } finally { setLoadingContacts(false); }
  };

  const loadResources = async () => {
    if (!user || !profile?.organization_id) return;
    try {
      const { data: productsData } = await supabase.from('products').select('id, name, medical_specialties').eq('organization_id', profile.organization_id).order('name');
      if (productsData) setRawProducts(productsData);
      const { data: samplesData } = await (supabase as any).from('sample_inventory').select('product_id, batch_number, products(name, medical_specialties)').eq('organization_id', profile.organization_id).gt('quantity_available', 0);
      if (samplesData) setRawSamples(samplesData);
      const { data: materialsData } = await (supabase as any).from('materiales_promocionales').select('id, nombre, product_id, products(medical_specialties)').eq('organization_id', profile.organization_id).gt('cantidad_disponible', 0);
      if (materialsData) setRawMaterials(materialsData);
    } catch (e) { console.error(e); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!formData.contact_id) { toast({ title: "Error", description: "Selecciona un contacto", variant: "destructive" }); return; }
    if ((formData.status === 'missed' || formData.status === 'cancelled') && !formData.closure_reason) {
      toast({ title: "Justificación Requerida", description: "Debe documentar el motivo del incumplimiento.", variant: "destructive" });
      return;
    }
    if (formData.samples_delivered && (!formData.compromiso_inicio || formData.compromiso_inicio <= 0)) {
      toast({ title: "Dato Obligatorio", description: "Al entregar muestras, debes registrar el Compromiso de Inicio (Recetas).", variant: "destructive" });
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
        organization_id: profile?.organization_id,
        cycle_condition: formData.cycle_condition || null,
        visit_objective: formData.visit_objective || null,
        objective: formData.visit_objective || null,
        products_presented: formData.products_presented,
        samples_delivered: formData.samples_delivered || null,
        promotional_materials: formData.promotional_materials || null,
        doctor_interest: formData.doctor_interest || null,
        activity_performed: formData.activity_performed || null,
        products_prescribed: formData.products_prescribed || null,
        results_notes: formData.results_notes || null,
        notes: formData.results_notes || null,
        pending_followup: formData.pending_followup || null,
        next_visit_date: formData.next_visit_date || null,
        observations_feedback: formData.observations_feedback || null,
        feedback: formData.observations_feedback || null,
        key_contact: formData.key_contact,
        competitor_activity: formData.competitor_activity || null,
        shelf_photo_url: formData.shelf_photo_url || null,
        purchase_driver: formData.purchase_driver || null,
        detected_purchase_reason: formData.detected_purchase_reason || null,
        next_step: formData.next_step || null,
        next_steps: formData.next_step || null,
        closure_reason: formData.closure_reason || null,
        contact_reaction: formData.contact_reaction || null,
        main_objection: formData.main_objection || null,
        closure_commitment: formData.closure_commitment || null,
        agreements: formData.closure_commitment || null,
        file_url: formData.file_url || null,
        geolocation: formData.geolocation || null,
        selling_points: formData.selling_points,
        compromiso_inicio: formData.compromiso_inicio,
        user_id: user.id
      };
      let result;
      if (visitData) result = await supabase.from('visits').update(visitPayload).eq('id', visitData.id);
      else result = await supabase.from('visits').insert([visitPayload]);
      if (result.error) throw result.error;
      toast({ title: visitData ? "Visita actualizada" : "Visita creada", variant: "default" });
      setOpen(false);
      onVisitSaved?.();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally { setLoading(false); }
  };

  const getFilteredOptions = (type: 'products' | 'samples' | 'materials') => {
    let doctorSpecialty = '';
    const shouldFilter = formData.visit_type === 'doctor' && contacts.find(c => c.id === formData.contact_id)?.contact_type === 'doctor';
    if (shouldFilter) doctorSpecialty = contacts.find(c => c.id === formData.contact_id)?.specialty?.toLowerCase().trim() || '';
    if (type === 'products') return rawProducts.filter(p => !shouldFilter || !doctorSpecialty || (p.medical_specialties && p.medical_specialties.toLowerCase().includes(doctorSpecialty))).map(p => ({ label: p.name, value: p.name }));
    if (type === 'samples') return rawSamples.filter(s => !shouldFilter || !doctorSpecialty || (s.products?.medical_specialties && s.products.medical_specialties.toLowerCase().includes(doctorSpecialty))).map(s => ({ label: `${s.products?.name} (${s.batch_number})`, value: `${s.products?.name} (${s.batch_number})` }));
    if (type === 'materials') return rawMaterials.filter(m => !shouldFilter || !doctorSpecialty || (m.products?.medical_specialties && m.products.medical_specialties.toLowerCase().includes(doctorSpecialty))).map(m => ({ label: m.nombre, value: m.nombre }));
    return [];
  };

  const productsList = getFilteredOptions('products');
  const samplesList = getFilteredOptions('samples');
  const materialsList = getFilteredOptions('materials');
  const isDoctor = formData.visit_type === 'doctor';
  const isPharmacy = formData.visit_type === 'pharmacy';
  const selectedContact = contacts.find(c => c.id === formData.contact_id);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-5xl p-0 overflow-hidden border-none shadow-3xl rounded-[2rem] bg-white">
        {/* Elite Header */}
        <div className="bg-gradient-to-br from-indigo-700 via-indigo-800 to-slate-900 px-10 py-12 text-white relative">
          <div className="absolute top-0 right-0 p-12 opacity-10">
            <Activity className="w-40 h-40" />
          </div>
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-2xl border border-white/20 flex items-center justify-center shadow-inner">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div>
                <DialogTitle className="text-3xl font-black tracking-tight text-white mb-1">
                  {visitData ? 'Gestión de Impacto' : 'Planificación Estratégica'}
                </DialogTitle>
                <div className="flex items-center gap-2">
                  <Badge className="bg-emerald-500/20 text-emerald-300 border-none font-black text-[10px] uppercase tracking-widest px-3 py-1">
                    {formData.status === 'completed' ? 'Visita Finalizada' : 'Visita en Ciclo'}
                  </Badge>
                  <p className="text-indigo-200/70 font-bold text-xs uppercase tracking-widest">
                    MediVisitPro Elite 💎
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row h-[700px]">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col md:flex-row w-full h-full">
            {/* Sidebar Navigation */}
            <TabsList className="flex flex-row md:flex-col items-stretch justify-start bg-slate-50 border-r border-slate-100 p-6 h-auto md:w-72 space-y-2">
              <TabsTrigger value="basic" className="flex items-center justify-start gap-4 px-5 py-4 rounded-2xl font-black text-slate-400 data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-lg transition-all text-xs uppercase tracking-widest">
                <UserRound className="w-4 h-4" /> Perfil & Tiempo
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex items-center justify-start gap-4 px-5 py-4 rounded-2xl font-black text-slate-400 data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-lg transition-all text-xs uppercase tracking-widest">
                <Target className="w-4 h-4" /> Despliegue 360
              </TabsTrigger>
              {isPharmacy && (
                <TabsTrigger value="audit" className="flex items-center justify-start gap-4 px-5 py-4 rounded-2xl font-black text-slate-400 data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-lg transition-all text-xs uppercase tracking-widest">
                  <Layers className="w-4 h-4" /> Auditoría Anaquel
                </TabsTrigger>
              )}
              <TabsTrigger value="results" className="flex items-center justify-start gap-4 px-5 py-4 rounded-2xl font-black text-slate-400 data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-lg transition-all text-xs uppercase tracking-widest">
                <TrendingUp className="w-4 h-4" /> Resultados & Feedback
              </TabsTrigger>
              <TabsTrigger value="closure" className="flex items-center justify-start gap-4 px-5 py-4 rounded-2xl font-black text-slate-400 data-[state=active]:bg-white data-[state=active]:text-rose-700 data-[state=active]:shadow-lg transition-all text-xs uppercase tracking-widest">
                <ShieldCheck className="w-4 h-4" /> Cierre Estratégico
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto bg-white">
              <form onSubmit={handleSubmit} id="visit-detail-form" className="h-full">
                {/* Basic Content */}
                <TabsContent value="basic" className="p-10 space-y-8 m-0 animate-in fade-in slide-in-from-right-4">
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-1.5 h-8 bg-indigo-600 rounded-full" />
                      <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Contexto de la Visita</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Segmento de Canal</Label>
                        <Select value={formData.visit_type} onValueChange={(val) => setFormData(prev => ({ ...prev, visit_type: val }))}>
                          <SelectTrigger className="h-14 border-slate-200 rounded-2xl font-black text-slate-700 bg-slate-50/50">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl border-none shadow-2xl">
                            <SelectItem value="doctor" className="py-4 font-bold">🩺 Fichero Médico</SelectItem>
                            <SelectItem value="pharmacy" className="py-4 font-bold">💊 Canal Farmacias</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Estado de Gestión</Label>
                        <Select value={formData.status} onValueChange={(val) => setFormData(prev => ({ ...prev, status: val }))}>
                          <SelectTrigger className="h-14 border-slate-200 rounded-2xl font-black bg-white shadow-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl font-bold">
                            <SelectItem value="scheduled">📅 Programada</SelectItem>
                            <SelectItem value="in_progress">⚡ En Curso</SelectItem>
                            <SelectItem value="completed">✅ Completada</SelectItem>
                            <SelectItem value="cancelled">❌ Cancelada</SelectItem>
                            <SelectItem value="missed">⚠️ No Lograda</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Contacto Registrado</Label>
                      <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="h-14 w-full justify-between border-slate-200 rounded-2xl font-black text-slate-800 bg-white hover:bg-slate-50 transition-all shadow-sm">
                            <div className="flex items-center gap-3">
                              <Search className="w-4 h-4 text-slate-300" />
                              {formData.contact_id ? contacts.find(c => c.id === formData.contact_id)?.name : "Buscar contacto en base de datos..."}
                            </div>
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0 border-none shadow-3xl rounded-[2rem]">
                          <Command className="rounded-[2rem]">
                            <CommandInput placeholder="Filtrar por nombre o especialidad..." className="h-14" />
                            <CommandList className="max-h-80 custom-scrollbar">
                              <CommandEmpty className="py-10 text-center font-bold text-slate-400">Sin coincidencias</CommandEmpty>
                              <CommandGroup>
                                {contacts.filter(c => c.contact_type === formData.visit_type).map(contact => (
                                  <CommandItem key={contact.id} onSelect={() => { setFormData(prev => ({ ...prev, contact_id: contact.id })); setOpenCombobox(false); }} className="py-4 px-6 border-b border-slate-50 font-bold hover:bg-indigo-50/50">
                                    <Check className={cn("mr-3 h-5 w-5 text-indigo-600", formData.contact_id === contact.id ? "opacity-100" : "opacity-0")} />
                                    <div className="flex flex-col">
                                      <span className="text-sm font-black">{contact.name}</span>
                                      <span className="text-[10px] text-slate-400 uppercase tracking-tighter">{contact.specialty} • {contact.address}</span>
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Fecha de Plan</Label>
                        <Input type="date" value={formData.scheduled_date} onChange={(e) => setFormData(prev => ({ ...prev, scheduled_date: e.target.value }))} className="h-14 border-slate-200 rounded-2xl font-black" />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Agenda Horaria</Label>
                        <Input type="time" value={formData.scheduled_time} onChange={(e) => setFormData(prev => ({ ...prev, scheduled_time: e.target.value }))} className="h-14 border-slate-200 rounded-2xl font-black" />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Activity Content */}
                <TabsContent value="activity" className="p-10 space-y-10 m-0 animate-in fade-in slide-in-from-right-4">
                  <div className="space-y-8">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-8 bg-indigo-600 rounded-full" />
                      <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Despliegue de Recursos</h3>
                    </div>

                    <div className="space-y-4">
                      <Label className="text-[10px] font-black uppercase text-indigo-600 ml-1">Portafolio Presentado</Label>
                      <MultiSelect options={productsList} selected={formData.products_presented} onChange={(s) => setFormData(prev => ({ ...prev, products_presented: s }))} placeholder="Elegir productos..." />
                    </div>

                    {productSellingPoints.length > 0 && (
                      <div className="p-8 bg-slate-900 rounded-[2rem] space-y-6 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5"><Activity className="w-24 h-24 text-white" /></div>
                        <h4 className="text-white font-black text-xs uppercase tracking-[0.2em] flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-indigo-400" /> Inteligencia de Mensaje 360
                        </h4>
                        <div className="space-y-4">
                          {productSellingPoints.map(prod => (
                            <div key={prod.id} className="space-y-3 border-l-2 border-indigo-500/30 pl-5">
                              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{prod.name}</p>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {prod.selling_points && Object.entries(prod.selling_points).map(([cat, val]: [string, any]) => val && (
                                  <div key={cat} className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all cursor-pointer group" onClick={() => {
                                    const tag = `${prod.name}: ${val}`;
                                    setFormData(p => ({
                                      ...p,
                                      selling_points: p.selling_points.includes(tag) ? p.selling_points.filter(t => t !== tag) : [...p.selling_points, tag]
                                    }));
                                  }}>
                                    <div className={cn("w-5 h-5 rounded-md border-2 border-indigo-500/50 flex items-center justify-center transition-all", formData.selling_points.includes(`${prod.name}: ${val}`) && "bg-indigo-500 border-indigo-500")}>
                                      {formData.selling_points.includes(`${prod.name}: ${val}`) && <Check className="w-3 h-3 text-white" />}
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-[8px] font-black text-slate-500 uppercase">{cat}</span>
                                      <span className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors">{val}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Muestras Médicas</Label>
                        <MultiSelect options={samplesList} selected={formData.samples_delivered ? formData.samples_delivered.split(', ').filter(Boolean) : []} onChange={(s) => setFormData(p => ({ ...p, samples_delivered: s.join(', ') }))} />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Material Promocional</Label>
                        <MultiSelect options={materialsList} selected={formData.promotional_materials ? formData.promotional_materials.split(', ').filter(Boolean) : []} onChange={(s) => setFormData(p => ({ ...p, promotional_materials: s.join(', ') }))} />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Audit Content */}
                {isPharmacy && (
                  <TabsContent value="audit" className="p-10 space-y-8 m-0 animate-in fade-in slide-in-from-right-4">
                    <div className="space-y-6">
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-8 bg-emerald-600 rounded-full" />
                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Auditoría Visual de Anaquel</h3>
                      </div>
                      {visitData?.id ? (
                        <ShelfAuditForm
                          visitId={visitData.id}
                          pharmacyId={visitData.pharmacy_id || visitData.contact_id}
                          pharmacyName={selectedContact?.name || "Canal Seleccionado"}
                        />
                      ) : (
                        <div className="p-20 text-center border-4 border-dashed border-slate-100 rounded-[3rem] bg-slate-50/50">
                          <Store className="w-20 h-20 text-slate-200 mx-auto mb-6" />
                          <h2 className="text-xl font-black text-slate-400 mb-2">VISITA NO GUARDADA</h2>
                          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Guarda la ficha básica para habilitar auditoría</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                )}

                {/* Results Content */}
                <TabsContent value="results" className="p-10 space-y-10 m-0 animate-in fade-in slide-in-from-right-4">
                  <div className="space-y-8">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-8 bg-indigo-600 rounded-full" />
                      <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Impacto Logrado</h3>
                    </div>

                    <div className="bg-emerald-50/50 p-8 rounded-[2rem] border border-emerald-100/50 space-y-6">
                      <div className="flex items-center justify-between">
                        <h4 className="text-[10px] font-black uppercase text-emerald-800 tracking-widest flex items-center gap-2">
                          <TrendingUp className="w-4 h-4" /> Proyección de Mercado
                        </h4>
                        <Badge className="bg-emerald-600 text-white border-none font-black text-[10px] h-6 px-3">VALOR CRÍTICO</Badge>
                      </div>
                      <div className="space-y-3">
                        <Label className="text-sm font-black text-emerald-900">¿Cuántas recetas/unidades proyecta este contacto al mes?</Label>
                        <Input
                          type="number"
                          value={formData.compromiso_inicio}
                          onChange={(e) => setFormData(p => ({ ...p, compromiso_inicio: Number(e.target.value) }))}
                          className="h-16 text-3xl font-black text-center bg-white border-emerald-200 rounded-3xl text-emerald-600 focus:ring-emerald-500/20"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Notas de Resultados (Cuantitativo/Cualitativo)</Label>
                      <Textarea
                        value={formData.results_notes}
                        onChange={(e) => setFormData(p => ({ ...p, results_notes: e.target.value }))}
                        placeholder="Escriba los logros clave de la sesión..."
                        className="min-h-[150px] border-slate-200 rounded-[2rem] p-6 font-bold text-slate-800 bg-slate-50/30"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Compromiso por Marcas Competitivas</Label>
                        <MultiSelect options={competitorOptions} selected={formData.competitor_brands_detected} onChange={(s) => setFormData(p => ({ ...p, competitor_brands_detected: s }))} />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Próxima Fecha de Contacto</Label>
                        <Input type="date" value={formData.next_visit_date} onChange={(e) => setFormData(p => ({ ...p, next_visit_date: e.target.value }))} className="h-14 border-slate-200 rounded-2xl font-black" />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Closure Content */}
                <TabsContent value="closure" className="p-10 space-y-10 m-0 animate-in fade-in slide-in-from-right-4">
                  <div className="space-y-8">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-8 bg-rose-600 rounded-full" />
                      <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Cierre de Gestión</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Reacción Detectada</Label>
                        <Select value={formData.contact_reaction} onValueChange={(val) => setFormData(p => ({ ...p, contact_reaction: val }))}>
                          <SelectTrigger className="h-14 border-slate-200 rounded-2xl font-black bg-white shadow-sm">
                            <SelectValue placeholder="Evaluar reacción..." />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl font-bold">
                            <SelectItem value="Muy Positiva" className="py-3 font-bold">💎 Muy Positiva</SelectItem>
                            <SelectItem value="Positiva" className="py-3 font-bold">✅ Positiva</SelectItem>
                            <SelectItem value="Neutral" className="py-3 font-bold">⚖️ Neutral</SelectItem>
                            <SelectItem value="Negativa" className="py-3 font-bold">⚠️ Negativa</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Próximo Paso Inmediato</Label>
                        <Input value={formData.next_step} onChange={(e) => setFormData(p => ({ ...p, next_step: e.target.value }))} placeholder="Ej: Enviar brochure mañana..." className="h-14 border-slate-200 rounded-2xl font-black" />
                      </div>
                    </div>

                    <div className="p-8 bg-rose-50/50 rounded-[2rem] border border-rose-100 space-y-4">
                      <Label className="text-[10px] font-black uppercase text-rose-800 tracking-widest flex items-center gap-2">
                        <Target className="w-4 h-4" /> Manejo de Objeciones (PDS Expert)
                      </Label>
                      <Select value={formData.objection_selector} onValueChange={(val) => setFormData(p => ({ ...p, objection_selector: val, main_objection: objectionScripts.find((s: any) => s.objection === val)?.script || p.main_objection }))}>
                        <SelectTrigger className="h-14 border-rose-200 rounded-2xl font-black bg-white text-rose-900">
                          <SelectValue placeholder="¿Hubo alguna objeción crítica?" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl font-bold">
                          {objectionScripts.map((s: any, idx: number) => (
                            <SelectItem key={idx} value={s.objection} className="py-3 font-bold">{s.objection}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Compromisos & Acuerdos Finales</Label>
                      <Textarea
                        value={formData.closure_commitment}
                        onChange={(e) => setFormData(p => ({ ...p, closure_commitment: e.target.value }))}
                        placeholder="Registre los acuerdos pactados en esta sesión..."
                        className="min-h-[150px] border-slate-200 rounded-[2rem] p-6 font-bold text-slate-800 bg-slate-50/30 shadow-inner"
                      />
                    </div>

                    <div className="flex items-center gap-4 p-6 bg-slate-900 rounded-[2rem] shadow-xl">
                      <div className="flex-1">
                        <p className="text-white font-black text-xs uppercase tracking-widest mb-1">Geolocalización de Visita</p>
                        <p className="text-slate-400 text-[10px] font-bold uppercase">{formData.geolocation || "Pendiente de captura"}</p>
                      </div>
                      <Button type="button" onClick={() => {
                        if (navigator.geolocation) {
                          navigator.geolocation.getCurrentPosition(pos => {
                            setFormData(p => ({ ...p, geolocation: `${pos.coords.latitude}, ${pos.coords.longitude}` }));
                            toast({ title: "Ubicación Capturada ✅" });
                          });
                        }
                      }} className="h-14 px-8 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl transition-all">
                        <Navigation className="w-5 h-5 mr-3" /> Capturar GPS
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </form>
            </div>
          </Tabs>
        </div>

        {/* Footer Elite */}
        <div className="bg-slate-50 border-t border-slate-100 px-10 py-8 flex items-center justify-between gap-6">
          <Button variant="ghost" onClick={() => setOpen(false)} className="h-14 px-8 font-black text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-2xl text-[10px] uppercase tracking-[0.2em] transition-all">
            Abandonar Gestión
          </Button>
          <div className="flex items-center gap-4">
            <Button type="button" onClick={() => {
              const tabs = ["basic", "activity", "results", "closure"];
              if (isPharmacy) tabs.splice(2, 0, "audit");
              const currentIdx = tabs.indexOf(activeTab);
              if (currentIdx < tabs.length - 1) setActiveTab(tabs[currentIdx + 1]);
            }} variant="outline" className="h-14 px-8 border-slate-200 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-500 hover:bg-white hover:text-indigo-600 shadow-sm">
              Siguiente Sección <ChevronRight className="w-4 h-4 ml-3" />
            </Button>
            <Button type="submit" form="visit-detail-form" disabled={loading} className="h-14 px-12 bg-gradient-to-r from-indigo-600 to-indigo-800 hover:from-indigo-700 hover:to-indigo-900 text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl shadow-3xl shadow-indigo-500/30 transition-all hover:scale-[1.05] active:scale-95">
              {loading && <Loader2 className="mr-3 h-4 w-4 animate-spin" />}
              {visitData ? 'Sincronizar Gestión' : 'Finalizar & Reportar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}