/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar, Clock, FileText, UserRound, Building, Store, Package, Award, AlertCircle,
  TrendingUp, ShoppingCart, Truck, Loader2, Sparkles, Navigation, MapPinOff,
  Camera, Upload, MapPin, Calculator, XCircle, ChevronRight, Check, ChevronsUpDown, X,
  Layers, Search, ShieldCheck, Map as MapIcon, Activity, Target, Brain, LayoutGrid, CheckCircle
} from "lucide-react";
import { ShelfAuditForm } from "./ShelfAuditForm";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useOrganization } from "@/hooks/useOrganization";
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
          className="w-full justify-between h-auto min-h-[44px] px-3 py-2 border-slate-200 rounded-xl bg-white shadow-sm hover:border-indigo-400 transition-all"
        >
          <div className="flex flex-wrap gap-1">
            {selected.length === 0 && <span className="text-slate-400 font-bold text-[10px] uppercase tracking-tight ml-1">{placeholder}</span>}
            {selected.map((item) => (
              <Badge variant="secondary" key={item} className="mr-1 mb-1 bg-indigo-50 text-indigo-700 border-indigo-100 font-bold text-[10px]" onClick={(e) => {
                e.stopPropagation();
                handleUnselect(item);
              }}>
                {options.find(opt => opt.value === item)?.label || item}
                <X className="ml-1 h-3 w-3 text-indigo-400 hover:text-indigo-600" />
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
}

export function VisitDetailDialog({ trigger, visitData, onVisitSaved }: VisitDetailDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const { organization } = useOrganization();
  const [activeTab, setActiveTab] = useState("basic");

  // State
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [openCombobox, setOpenCombobox] = useState(false);
  const [rawProducts, setRawProducts] = useState<any[]>([]);
  const [rawSamples, setRawSamples] = useState<any[]>([]);
  const [rawMaterials, setRawMaterials] = useState<any[]>([]);
  const [productSellingPoints, setProductSellingPoints] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    contact_id: visitData?.contact_id || "",
    scheduled_date: visitData?.scheduled_date?.split('T')[0] || new Date().toISOString().split('T')[0],
    scheduled_time: visitData?.scheduled_date?.split('T')[1]?.slice(0, 5) || "09:00",
    arrival_time: visitData?.arrival_time || "",
    departure_time: visitData?.departure_time || "",
    visit_type: visitData?.visit_type || "doctor",
    status: visitData?.status || "scheduled",
    visit_objective: visitData?.visit_objective || visitData?.objective || "",
    products_presented: visitData?.products_presented || [],
    samples_delivered: visitData?.samples_delivered || "",
    promotional_materials: visitData?.promotional_materials || "",
    results_notes: visitData?.results_notes || visitData?.notes || "",
    next_visit_date: visitData?.next_visit_date || "",
    competitor_brands_detected: visitData?.competitor_brands_detected || [],
    contact_reaction: visitData?.contact_reaction || "",
    next_step: visitData?.next_step || visitData?.next_steps || "",
    main_objection: visitData?.main_objection || "",
    objection_selector: visitData?.objection_selector || "",
    closure_commitment: visitData?.closure_commitment || visitData?.agreements || "",
    geolocation: visitData?.geolocation || "",
    selling_points: visitData?.selling_points || [],
    compromiso_inicio: visitData?.compromiso_inicio || 0,
    closure_reason: visitData?.closure_reason || "",
  });

  const orgSettings = (organization?.settings || {}) as any;
  const competitorOptions = (orgSettings.competitor_brands || []).map((b: string) => ({ label: b, value: b }));
  const objectionScripts = orgSettings.objection_scripts || [];

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
          .select('id, name, selling_points, category')
          .in('name', formData.products_presented);
        if (data) setProductSellingPoints(data);
      } else {
        setProductSellingPoints([]);
      }
    };
    fetchProductTags();
  }, [formData.products_presented]);

  const loadContacts = async () => {
    if (!user) return;
    try {
      const { data: contactsData } = await supabase.from('contacts').select('id, name, specialty, contact_type, address').eq('user_id', user.id);
      if (contactsData) setContacts(contactsData as Contact[]);
    } catch (e) { console.error(e); }
  };

  const loadResources = async () => {
    if (!user || !profile?.organization_id) return;
    try {
      const { data: productsData } = await supabase.from('products').select('id, name, medical_specialties, category').eq('organization_id', profile.organization_id).order('name');
      if (productsData) setRawProducts(productsData);
      const { data: samplesData } = await (supabase as any).from('sample_inventory').select('product_id, batch_number, products(name, medical_specialties, category)').eq('organization_id', profile.organization_id).gt('quantity_available', 0);
      if (samplesData) setRawSamples(samplesData);
      const { data: materialsData } = await (supabase as any).from('materiales_promocionales').select('id, nombre, product_id, products(medical_specialties, category)').eq('organization_id', profile.organization_id).gt('cantidad_disponible', 0);
      if (materialsData) setRawMaterials(materialsData);
    } catch (e) { console.error(e); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!formData.contact_id) { toast({ title: "Error", description: "Selecciona un contacto", variant: "destructive" }); return; }
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
        organization_id: profile?.organization_id,
        visit_objective: formData.visit_objective || null,
        objective: formData.visit_objective || null,
        products_presented: formData.products_presented,
        samples_delivered: formData.samples_delivered || null,
        promotional_materials: formData.promotional_materials || null,
        results_notes: formData.results_notes || null,
        notes: formData.results_notes || null,
        next_visit_date: formData.next_visit_date || null,
        next_step: formData.next_step || null,
        next_steps: formData.next_step || null,
        contact_reaction: formData.contact_reaction || null,
        main_objection: formData.main_objection || null,
        closure_commitment: formData.closure_commitment || null,
        agreements: formData.closure_commitment || null,
        geolocation: formData.geolocation || null,
        selling_points: formData.selling_points,
        compromiso_inicio: formData.compromiso_inicio,
        user_id: user.id,
        closure_reason: formData.closure_reason || null,
        competitor_brands_detected: formData.competitor_brands_detected
      };
      let result;
      if (visitData?.id) result = await supabase.from('visits').update(visitPayload).eq('id', visitData.id);
      else result = await supabase.from('visits').insert([visitPayload]);
      if (result.error) throw result.error;
      toast({ title: visitData ? "Visita actualizada ✅" : "Visita creada ✅" });
      setOpen(false);
      onVisitSaved?.();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally { setLoading(false); }
  };

  const getFilteredOptions = (type: 'products' | 'samples' | 'materials') => {
    let doctorSpecialty = '';
    const selectedContact = contacts.find(c => c.id === formData.contact_id);
    const shouldFilter = formData.visit_type === 'doctor' && selectedContact?.contact_type === 'doctor';
    if (shouldFilter) doctorSpecialty = selectedContact?.specialty?.toLowerCase().trim() || '';

    const isLaunch = (p: any) => {
      const category = (p?.category || '').toLowerCase();
      return category.includes('launch') || category.includes('lanzamiento');
    };

    if (type === 'products') {
      return rawProducts
        .filter(p => !shouldFilter || !doctorSpecialty || isLaunch(p) || (p.medical_specialties && p.medical_specialties.toLowerCase().includes(doctorSpecialty)))
        .map(p => ({ label: p.name, value: p.name }));
    }
    if (type === 'samples') {
      return rawSamples
        .filter(s => !shouldFilter || !doctorSpecialty || isLaunch(s.products) || (s.products?.medical_specialties && s.products.medical_specialties.toLowerCase().includes(doctorSpecialty)))
        .map(s => ({ label: `${s.products?.name} (${s.batch_number})`, value: `${s.products?.name} (${s.batch_number})` }));
    }
    if (type === 'materials') {
      return rawMaterials
        .filter(m => !shouldFilter || !doctorSpecialty || isLaunch(m.products) || (m.products?.medical_specialties && m.products.medical_specialties.toLowerCase().includes(doctorSpecialty)))
        .map(m => ({ label: m.nombre, value: m.nombre }));
    }
    return [];
  };

  const productsList = getFilteredOptions('products');
  const samplesList = getFilteredOptions('samples');
  const materialsList = getFilteredOptions('materials');
  const isPharmacy = formData.visit_type === 'pharmacy';
  const selectedContact = contacts.find(c => c.id === formData.contact_id);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-4xl p-0 overflow-y-auto md:overflow-hidden border-none shadow-3xl rounded-[2rem] bg-white max-h-[95vh] md:max-h-[85vh]">
        {/* Elite Header */}
        <div className="bg-gradient-to-br from-indigo-700 via-indigo-800 to-slate-900 px-6 py-4 md:px-8 md:py-6 text-white relative">
          <div className="absolute top-0 right-0 p-6 opacity-10 hidden md:block">
            <Activity className="w-24 h-24" />
          </div>
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white/10 backdrop-blur-2xl border border-white/20 flex items-center justify-center shadow-inner">
                <FileText className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-lg md:text-xl font-black tracking-tight text-white mb-0.5">
                  {visitData ? 'Gestión de Impacto' : 'Planificación Estratégica'}
                </DialogTitle>
                <div className="flex items-center gap-2">
                  <Badge className="bg-emerald-500/20 text-emerald-300 border-none font-black text-[9px] uppercase tracking-widest px-2 py-0.5">
                    {formData.status === 'completed' ? 'Finalizada' : 'En Ciclo'}
                  </Badge>
                  <p className="text-indigo-200/70 font-bold text-[10px] uppercase tracking-widest hidden sm:block">
                    MediVisitPro Elite 💎
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row h-auto md:h-[600px] overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col md:flex-row w-full h-full">
            <TabsList className="flex flex-row md:flex-col h-auto md:h-full w-full md:w-64 bg-slate-50 border-r border-slate-100 p-2 md:p-4 justify-start gap-1 md:gap-2 overflow-x-auto md:overflow-x-visible custom-scrollbar">
              <TabsTrigger value="basic" className="flex-1 md:flex-none justify-center md:justify-start gap-2 md:gap-3 px-3 py-2 md:px-5 md:py-3 rounded-lg font-bold transition-all data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-md border-none text-slate-400 text-[10px] md:text-xs">
                <LayoutGrid className="w-4 h-4" /> <span className="hidden sm:inline">Perfil & Contexto</span>
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex-1 md:flex-none justify-center md:justify-start gap-2 md:gap-3 px-3 py-2 md:px-5 md:py-3 rounded-lg font-bold transition-all data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-md border-none text-slate-400 text-[10px] md:text-xs">
                <Target className="w-4 h-4" /> <span className="hidden sm:inline">Despliegue 360</span>
              </TabsTrigger>
              {isPharmacy && (
                <TabsTrigger value="audit" className="flex-1 md:flex-none justify-center md:justify-start gap-2 md:gap-3 px-3 py-2 md:px-5 md:py-3 rounded-lg font-bold transition-all data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-md border-none text-slate-400 text-[10px] md:text-xs">
                  <Layers className="w-4 h-4" /> <span className="hidden sm:inline">Audit. Anaquel</span>
                </TabsTrigger>
              )}
              <TabsTrigger value="results" className="flex-1 md:flex-none justify-center md:justify-start gap-2 md:gap-3 px-3 py-2 md:px-5 md:py-3 rounded-lg font-bold transition-all data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-md border-none text-slate-400 text-[10px] md:text-xs">
                <TrendingUp className="w-4 h-4" /> <span className="hidden sm:inline">Resultados</span>
              </TabsTrigger>
              <TabsTrigger value="closure" className="flex-1 md:flex-none justify-center md:justify-start gap-2 md:gap-3 px-3 py-2 md:px-5 md:py-3 rounded-lg font-bold transition-all data-[state=active]:bg-white data-[state=active]:text-rose-700 data-[state=active]:shadow-md border-none text-slate-400 text-[10px] md:text-xs">
                <ShieldCheck className="w-4 h-4" /> <span className="hidden sm:inline">Cierre Final</span>
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto bg-white p-4 md:p-6 custom-scrollbar">
              <form onSubmit={handleSubmit} id="visit-detail-form" className="h-full space-y-6">
                <TabsContent value="basic" className="mt-0 space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[9px] font-black uppercase text-slate-500 ml-1">Segmento de Canal</Label>
                      <Select value={formData.visit_type} onValueChange={(val) => setFormData(prev => ({ ...prev, visit_type: val }))}>
                        <SelectTrigger className="h-10 border-slate-200 rounded-xl font-bold text-slate-700 bg-slate-50/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-none shadow-2xl">
                          <SelectItem value="doctor" className="font-bold">🩺 Fichero Médico</SelectItem>
                          <SelectItem value="pharmacy" className="font-bold">💊 Canal Farmacias</SelectItem>
                          <SelectItem value="drugstore" className="font-bold">🏢 Droguería / Distribuidor</SelectItem>
                          <SelectItem value="natural_store" className="font-bold">🌿 Tienda Naturista</SelectItem>
                          <SelectItem value="institution" className="font-bold">🏥 Institucional</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[9px] font-black uppercase text-slate-500 ml-1">Estado de Gestión</Label>
                      <Select value={formData.status} onValueChange={(val) => setFormData(prev => ({ ...prev, status: val }))}>
                        <SelectTrigger className="h-10 border-slate-200 rounded-xl font-bold bg-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl font-bold">
                          <SelectItem value="scheduled">📅 Programada</SelectItem>
                          <SelectItem value="in_progress">⚡ En Curso</SelectItem>
                          <SelectItem value="completed">✅ Completada</SelectItem>
                          <SelectItem value="cancelled">❌ Cancelada</SelectItem>
                          <SelectItem value="missed">⚠️ No Lograda</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[9px] font-black uppercase text-slate-600 ml-1">Contacto Registrado</Label>
                    <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="h-10 w-full justify-between border-slate-200 rounded-xl font-bold text-slate-800 bg-white hover:bg-slate-50 transition-all">
                          <div className="flex items-center gap-2">
                            <Search className="w-3.5 h-3.5 text-slate-300" />
                            <span className="truncate max-w-[200px] md:max-w-md">
                              {formData.contact_id ? contacts.find(c => c.id === formData.contact_id)?.name : "Buscar contacto..."}
                            </span>
                          </div>
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[--radix-popover-trigger-width] p-0 border-none shadow-3xl rounded-2xl">
                        <Command className="rounded-2xl">
                          <CommandInput placeholder="Filtrar por nombre..." className="h-10" />
                          <CommandList className="max-h-60 custom-scrollbar">
                            <CommandEmpty className="py-6 text-center text-xs font-bold text-slate-600">Sin resultados</CommandEmpty>
                            <CommandGroup>
                              {contacts.filter(c => c.contact_type === formData.visit_type).map(contact => (
                                <CommandItem key={contact.id} onSelect={() => { setFormData(prev => ({ ...prev, contact_id: contact.id })); setOpenCombobox(false); }} className="py-2 px-4 border-b border-slate-50 font-bold">
                                  <Check className={cn("mr-2 h-4 w-4 text-indigo-600", formData.contact_id === contact.id ? "opacity-100" : "opacity-0")} />
                                  <div className="flex flex-col">
                                    <span className="text-sm font-black">{contact.name}</span>
                                    <span className="text-[9px] text-slate-700 uppercase tracking-tighter">{contact.specialty} • {contact.address}</span>
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[9px] font-black uppercase text-slate-600 ml-1">Fecha de Plan</Label>
                      <Input type="date" value={formData.scheduled_date} onChange={(e) => setFormData(prev => ({ ...prev, scheduled_date: e.target.value }))} className="h-10 border-slate-200 rounded-xl font-bold" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[9px] font-black uppercase text-slate-600 ml-1">Agenda Horaria</Label>
                      <Input type="time" value={formData.scheduled_time} onChange={(e) => setFormData(prev => ({ ...prev, scheduled_time: e.target.value }))} className="h-10 border-slate-200 rounded-xl font-bold" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[9px] font-black uppercase text-slate-600 ml-1">Objetivo Estratégico</Label>
                    <Input value={formData.visit_objective} onChange={(e) => setFormData(p => ({ ...p, visit_objective: e.target.value }))} placeholder="Ej: Presentar lanzamiento X..." className="h-10 border-slate-200 rounded-xl font-bold" />
                  </div>
                </TabsContent>

                <TabsContent value="activity" className="mt-0 space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="space-y-2">
                    <Label className="text-[9px] font-black uppercase text-indigo-600 ml-1">Portafolio Presentado</Label>
                    <MultiSelect options={productsList} selected={formData.products_presented} onChange={(s) => setFormData(prev => ({ ...prev, products_presented: s }))} placeholder="Elegir productos..." />
                  </div>

                  {productSellingPoints.length > 0 && (
                    <div className="p-4 md:p-6 bg-slate-900 rounded-2xl space-y-4 shadow-xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-5"><Activity className="w-16 h-16 text-white" /></div>
                      <h4 className="text-white font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Mensajes Clave (360)
                      </h4>
                      <div className="space-y-3">
                        {productSellingPoints.map(prod => (
                          <div key={prod.id} className="space-y-2 border-l border-indigo-500/30 pl-3">
                            <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">{prod.name}</p>
                            <div className="grid grid-cols-1 gap-2">
                              {prod.selling_points && Object.entries(prod.selling_points).map(([cat, val]: [string, any]) => val && (
                                <div key={cat} className="flex items-center gap-2 p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all cursor-pointer group" onClick={() => {
                                  const tag = `${prod.name}: ${val}`;
                                  setFormData(p => ({
                                    ...p,
                                    selling_points: p.selling_points.includes(tag) ? p.selling_points.filter(t => t !== tag) : [...p.selling_points, tag]
                                  }));
                                }}>
                                  <div className={cn("w-4 h-4 rounded border border-indigo-500/50 flex items-center justify-center", formData.selling_points.includes(`${prod.name}: ${val}`) && "bg-indigo-500 border-indigo-500")}>
                                    {formData.selling_points.includes(`${prod.name}: ${val}`) && <Check className="w-2.5 h-2.5 text-white" />}
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-[7px] font-black text-slate-500 uppercase">{cat}</span>
                                    <span className="text-[11px] font-bold text-slate-300 group-hover:text-white transition-colors">{val}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[9px] font-black uppercase text-slate-500 ml-1">Muestras Médicas</Label>
                      <MultiSelect options={samplesList} selected={formData.samples_delivered ? formData.samples_delivered.split(', ').filter(Boolean) : []} onChange={(s) => setFormData(p => ({ ...p, samples_delivered: s.join(', ') }))} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[9px] font-black uppercase text-slate-600 ml-1">Material Prom.</Label>
                      <MultiSelect options={materialsList} selected={formData.promotional_materials ? formData.promotional_materials.split(', ').filter(Boolean) : []} onChange={(s) => setFormData(p => ({ ...p, promotional_materials: s.join(', ') }))} />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="audit" className="mt-0 space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                  {visitData?.id ? (
                    <ShelfAuditForm
                      visitId={visitData.id}
                      pharmacyId={visitData.pharmacy_id || visitData.contact_id}
                      pharmacyName={selectedContact?.name || "Seleccionado"}
                    />
                  ) : (
                    <div className="p-10 text-center border-2 border-dashed border-slate-100 rounded-3xl bg-slate-50/50">
                      <Store className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                      <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest leading-relaxed">Primero guarde la planificación para habilitar auditoría.</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="results" className="mt-0 space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[9px] font-black uppercase text-emerald-800 tracking-widest flex items-center gap-2">
                        <TrendingUp className="w-3.5 h-3.5" /> Proyección / Recetas
                      </h4>
                      <Badge className="bg-emerald-600 text-white border-none font-black text-[8px] h-5 px-2">META</Badge>
                    </div>
                    <Input
                      type="number"
                      value={formData.compromiso_inicio}
                      onChange={(e) => setFormData(p => ({ ...p, compromiso_inicio: Number(e.target.value) }))}
                      className="h-10 text-xl font-black text-center bg-white border-emerald-200 rounded-xl text-emerald-600 focus:ring-emerald-500/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[9px] font-black uppercase text-slate-600 ml-1">Notas de Resultados</Label>
                    <Textarea
                      value={formData.results_notes}
                      onChange={(e) => setFormData(p => ({ ...p, results_notes: e.target.value }))}
                      placeholder="Impacto y hallazgos..."
                      className="min-h-[100px] border-slate-200 rounded-xl p-3 font-bold text-slate-800 bg-slate-50/30 text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[9px] font-black uppercase text-slate-600 ml-1">Próxima Visita</Label>
                      <Input type="date" value={formData.next_visit_date} onChange={(e) => setFormData(p => ({ ...p, next_visit_date: e.target.value }))} className="h-10 border-slate-200 rounded-xl font-bold" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[9px] font-black uppercase text-slate-600 ml-1">Marcas Comp.</Label>
                      <MultiSelect options={competitorOptions} selected={formData.competitor_brands_detected} onChange={(s) => setFormData(p => ({ ...p, competitor_brands_detected: s }))} />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="closure" className="mt-0 space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[9px] font-black uppercase text-slate-600 ml-1">Reacción</Label>
                      <Select value={formData.contact_reaction} onValueChange={(val) => setFormData(p => ({ ...p, contact_reaction: val }))}>
                        <SelectTrigger className="h-10 border-slate-200 rounded-xl font-bold bg-white">
                          <SelectValue placeholder="Evaluar..." />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl font-bold">
                          <SelectItem value="Muy Positiva">💎 Muy Positiva</SelectItem>
                          <SelectItem value="Positiva">✅ Positiva</SelectItem>
                          <SelectItem value="Neutral">⚖️ Neutral</SelectItem>
                          <SelectItem value="Negativa">⚠️ Negativa</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[9px] font-black uppercase text-slate-600 ml-1">Sig. Paso</Label>
                      <Input value={formData.next_step} onChange={(e) => setFormData(p => ({ ...p, next_step: e.target.value }))} placeholder="Ej: Brochure..." className="h-10 border-slate-200 rounded-xl font-bold" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[9px] font-black uppercase text-slate-600 ml-1">Compromisos & Acuerdos</Label>
                    <Textarea
                      value={formData.closure_commitment}
                      onChange={(e) => setFormData(p => ({ ...p, closure_commitment: e.target.value }))}
                      placeholder="Acuerdos pactados..."
                      className="min-h-[100px] border-slate-200 rounded-xl p-3 font-bold text-slate-800 bg-slate-50/30 text-xs"
                    />
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-slate-900 rounded-2xl shadow-xl">
                    <div className="flex-1">
                      <p className="text-indigo-400 font-black text-[9px] uppercase tracking-widest mb-0.5">Geo-Validación</p>
                      <p className="text-white text-[10px] truncate max-w-[150px]">{formData.geolocation || "Pendiente"}</p>
                    </div>
                    <Button type="button" onClick={() => {
                      if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(pos => {
                          setFormData(p => ({ ...p, geolocation: `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}` }));
                          toast({ title: "GPS Capturado ✅" });
                        });
                      }
                    }} className="h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-[9px] rounded-lg">
                      Capturar
                    </Button>
                  </div>
                </TabsContent>
              </form>
            </div>
          </Tabs>
        </div>

        {/* Footer Elite */}
        <div className="bg-slate-50 border-t border-slate-100 px-4 md:px-8 py-4 md:py-6 flex flex-row items-center justify-between gap-4">
          <Button variant="ghost" onClick={() => setOpen(false)} className="h-10 md:h-12 px-4 md:px-6 font-black text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl text-[9px] md:text-[10px] uppercase tracking-widest hidden sm:flex">
            Abandonar
          </Button>
          <div className="flex items-center gap-2 md:gap-4 w-full sm:w-auto">
            <Button type="button" onClick={() => {
              const tabs = ["basic", "activity", "results", "closure"];
              if (isPharmacy) tabs.splice(2, 0, "audit");
              const currentIdx = tabs.indexOf(activeTab);
              if (currentIdx < tabs.length - 1) setActiveTab(tabs[currentIdx + 1]);
              else setActiveTab(tabs[0]);
            }} variant="outline" className="flex-1 sm:flex-none h-10 md:h-12 px-4 md:px-6 border-slate-200 rounded-xl font-black text-[9px] md:text-[10px] uppercase tracking-widest text-slate-700 hover:bg-white hover:text-indigo-600">
              Siguiente <ChevronRight className="w-4 h-4 ml-1 md:ml-2" />
            </Button>
            <Button type="submit" form="visit-detail-form" disabled={loading} className="flex-1 sm:flex-none h-10 md:h-12 px-6 md:px-10 status-active rounded-xl shadow-lg transition-all active:scale-95">
              {loading && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
              {visitData?.id ? 'Guardar' : 'Finalizar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}