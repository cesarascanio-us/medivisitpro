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
  Layers, Search, ShieldCheck, Map as MapIcon, Activity, Target, Brain, LayoutGrid, CheckCircle,
  Building2, Leaf, Info, Microscope, ClipboardCheck, GraduationCap, Package2
} from "lucide-react";
import { ShelfAuditForm } from "./ShelfAuditForm";
import { SampleDeliveryManager } from "./SampleDeliveryManager";
import { SPINGuideAlert } from "./SPINGuideAlert";
import { VisualAidModal } from "./VisualAidModal";
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

// Helper MultiSelect Component - Elite Dark Version
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
  const handleUnselect = (item: string) => onChange(selected.filter((i) => i !== item));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" className="w-full justify-between h-auto min-h-[48px] px-4 py-3 bg-slate-50 border-slate-100 rounded-2xl hover:bg-slate-100 transition-all">
          <div className="flex flex-wrap gap-2">
            {selected.length === 0 && <span className="text-slate-400 font-black text-[10px] uppercase tracking-widest ">{placeholder}</span>}
            {selected.map((item) => (
              <Badge key={item} className="bg-primary/5 text-primary border-none font-black text-[9px] uppercase tracking-tighter" onClick={(e) => { e.stopPropagation(); handleUnselect(item); }}>
                {options.find(opt => opt.value === item)?.label || item}
                <X className="ml-1 h-3 w-3" />
              </Badge>
            ))}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-40" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-white border-slate-100 rounded-2xl shadow-3xl overflow-hidden">
        <Command className="bg-white text-slate-900">
          <CommandInput placeholder="BUSCAR..." className="h-14 font-black  uppercase" />
          <CommandList className="max-h-60 custom-scrollbar">
            <CommandEmpty className="py-8 text-center text-[10px] font-black uppercase text-slate-400">{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem key={option.value} onSelect={() => onChange(selected.includes(option.value) ? selected.filter(i => i !== option.value) : [...selected, option.value])} className="py-4 px-6 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-none">
                  <Check className={cn("mr-3 h-4 w-4 text-primary", selected.includes(option.value) ? "opacity-100" : "opacity-0")} />
                  <span className="font-bold text-xs uppercase ">{option.label}</span>
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

export function VisitDetailDialog({ trigger, visitData, onVisitSaved }: VisitDetailDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const { organization } = useOrganization();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("basic");

  // State
  const [contacts, setContacts] = useState<any[]>([]);
  const [openCombobox, setOpenCombobox] = useState(false);
  const [rawProducts, setRawProducts] = useState<any[]>([]);
  const [productSellingPoints, setProductSellingPoints] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    contact_id: visitData?.contact_id || "",
    scheduled_date: visitData?.scheduled_date?.split('T')[0] || new Date().toISOString().split('T')[0],
    scheduled_time: visitData?.scheduled_date?.split('T')[1]?.slice(0, 5) || "09:00",
    arrival_time: visitData?.arrival_time || "",
    departure_time: visitData?.departure_time || "",
    visit_type: visitData?.visit_type || (visitData?.contacts?.contact_type) || "doctor",
    status: visitData?.status || "scheduled",
    visit_objective: visitData?.visit_objective || visitData?.objective || "",
    products_presented: visitData?.products_presented || [],
    samples_delivered: visitData?.samples_delivered || [],
    promotional_materials: visitData?.promotional_materials || [],
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
    // CAMPOS INSTITUCIONALES CA
    sample_bank_status: visitData?.sample_bank_status || 'ok',
    sample_bank_refill: visitData?.sample_bank_refill || 0,
    academic_topic: visitData?.academic_topic || '',
    academic_attendance: visitData?.academic_attendance || 0,
    academic_context: visitData?.academic_context || '',
  });

  useEffect(() => { if (open) { loadContacts(); loadResources(); } }, [open]);

  useEffect(() => {
    const fetchProductTags = async () => {
      if (formData.products_presented.length > 0) {
        const { data } = await supabase.from('products').select('*').in('name', formData.products_presented);
        if (data) setProductSellingPoints(data);
      } else setProductSellingPoints([]);
    };
    fetchProductTags();
  }, [formData.products_presented]);

  const loadContacts = async () => {
    if (!user || !organizationId) return;
    try {
      const { data: contactsData } = await supabase.from('unified_contacts').select('*').eq('organization_id', organizationId);
      if (contactsData) setContacts(contactsData);
    } catch (e) { console.error(e); }
  };

  const loadResources = async () => {
    if (!user || !profile?.organization_id) return;
    try {
      const { data: productsData } = await supabase.from('products').select('*').eq('organization_id', profile.organization_id).order('name');
      if (productsData) setRawProducts(productsData);
    } catch (e) { console.error(e); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!user) return;
    if (!formData.contact_id) { toast({ title: "Error Táctico", description: "Falta Entidad Objetivo" }); return; }
    setLoading(true);
    try {
      const scheduledDateTime = new Date(`${formData.scheduled_date}T${formData.scheduled_time}`);
      const visitPayload = {
        ...formData, user_id: user.id, organization_id: profile?.organization_id,
        scheduled_date: scheduledDateTime.toISOString(), results_notes: formData.results_notes || null,
        objective: formData.visit_objective || null, agreements: formData.closure_commitment || null
      };
      if (visitData?.id) await supabase.from('visits').update(visitPayload).eq('id', visitData.id);
      else await supabase.from('visits').insert([visitPayload]);
      toast({ title: "Misión Sincronizada ✅" }); setOpen(false); onVisitSaved?.();
    } catch (e: any) { toast({ title: "Error", description: e.message }); }
    finally { setLoading(false); }
  };

  const isDoctorVisit = formData.visit_type === 'doctor';
  const isSalesVisit = ['pharmacy', 'natural_store', 'commerce', 'drugstore'].includes(formData.visit_type);
  const isInstitutionVisit = formData.visit_type === 'hospital' || formData.visit_type === 'institution';

  const selectedContact = contacts.find(c => c.id === formData.contact_id);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-5xl p-0 overflow-hidden border-none rounded-[2.5rem] bg-white shadow-3xl font-display max-h-[95vh]">
        {/* Header Elite Industrial */}
        <div className="bg-slate-50 px-10 py-8 text-slate-900 relative border-b border-slate-100">
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-primary text-white flex items-center justify-center shadow-premium-md border border-primary/20">
                <FileText className="w-8 h-8" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-black uppercase tracking-tighter font-display text-slate-900">
                  {visitData ? 'Control de Misión Realizada' : 'Planificación de Misión Táctica'}
                </DialogTitle>
                <div className="flex items-center gap-3 mt-2">
                  <Badge className="bg-emerald-500/5 text-emerald-600 border-none font-black text-[9px] uppercase tracking-widest ">{formData.status === 'completed' ? 'FINALIZADA' : 'CICLO ACTIVO'}</Badge>
                  <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] ">César Ascanio CA Intelligence Hub 💎</p>
                </div>
              </div>
            </div>
            {selectedContact && (
              <div className="text-right hidden md:block">
                <p className="text-slate-900 font-black uppercase text-lg leading-none font-display">{selectedContact.name}</p>
                <p className="text-slate-400 font-bold uppercase text-[9px] tracking-widest mt-2">{selectedContact.specialty} | {selectedContact.city}</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col md:flex-row h-[700px] overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col md:flex-row w-full h-full">
            <TabsList className="flex flex-row md:flex-col h-auto md:h-full w-full md:w-72 bg-slate-50/50 border-r border-slate-100 p-4 justify-start gap-2 overflow-x-auto custom-scrollbar">
              <TabsTrigger value="basic" className="justify-start gap-4 px-6 py-4 rounded-2xl font-black transition-all data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-soft border-none text-slate-400 text-[10px] uppercase tracking-widest ">
                <LayoutGrid className="w-4 h-4" /> PERFIL & AGENDA
              </TabsTrigger>

              {isDoctorVisit && (
                <TabsTrigger value="medical" className="justify-start gap-4 px-6 py-4 rounded-2xl font-black transition-all data-[state=active]:bg-indigo-500 data-[state=active]:text-white border-none text-slate-400 text-[10px] uppercase tracking-widest ">
                  <Microscope className="w-4 h-4" /> PROMOCIÓN MÉDICA
                </TabsTrigger>
              )}

              {isSalesVisit && (
                <TabsTrigger value="sales" className="justify-start gap-4 px-6 py-4 rounded-2xl font-black transition-all data-[state=active]:bg-emerald-500 data-[state=active]:text-white border-none text-slate-400 text-[10px] uppercase tracking-widest ">
                  <ShoppingCart className="w-4 h-4" /> EJECUCIÓN COMERCIAL
                </TabsTrigger>
              )}

              <TabsTrigger value="strategy" className="justify-start gap-4 px-6 py-4 rounded-2xl font-black transition-all data-[state=active]:bg-amber-500 data-[state=active]:text-white border-none text-slate-400 text-[10px] uppercase tracking-widest ">
                <Target className="w-4 h-4" /> HITOS & CIERRE
              </TabsTrigger>

              <TabsTrigger value="geo" className="justify-start gap-4 px-6 py-4 rounded-2xl font-black transition-all data-[state=active]:bg-blue-500 data-[state=active]:text-white border-none text-slate-400 text-[10px] uppercase tracking-widest ">
                <MapIcon className="w-4 h-4" /> GEOPOSICIÓN CA
              </TabsTrigger>


              {isInstitutionVisit && (
                <>
                  <TabsTrigger value="sample-bank" className="justify-start gap-4 px-6 py-4 rounded-2xl font-black transition-all data-[state=active]:bg-indigo-600 data-[state=active]:text-white border-none text-slate-500 text-[10px] uppercase tracking-widest ">
                    <Package2 className="w-4 h-4" /> BANCO DE MUESTRAS
                  </TabsTrigger>
                  <TabsTrigger value="academic" className="justify-start gap-4 px-6 py-4 rounded-2xl font-black transition-all data-[state=active]:bg-indigo-600 data-[state=active]:text-white border-none text-slate-500 text-[10px] uppercase tracking-widest ">
                    <GraduationCap className="w-4 h-4" /> ACTIVIDAD ACADÉMICA
                  </TabsTrigger>
                </>
              )}
            </TabsList>

            <div className="flex-1 overflow-y-auto bg-white p-10 custom-scrollbar">
              <form onSubmit={handleSubmit} id="visit-detail-form" className="space-y-10">
                <TabsContent value="basic" className="mt-0 space-y-8 animate-in fade-in duration-500">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Canal de Misión</Label>
                      <Select value={formData.visit_type} onValueChange={(val) => setFormData(p => ({ ...p, visit_type: val }))}>
                        <SelectTrigger className="h-14 bg-slate-50 border-slate-100 rounded-2xl font-black text-slate-900 uppercase tracking-widest"><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-white border-slate-100 text-slate-900 font-bold uppercase shadow-xl rounded-xl">
                          <SelectItem value="doctor" className="hover:bg-primary/5 focus:bg-primary/5 cursor-pointer">🩺 FICHERO MÉDICO</SelectItem>
                          <SelectItem value="hospital" className="hover:bg-primary/5 focus:bg-primary/5 cursor-pointer">🏥 CENTRO DE SALUD</SelectItem>
                          <SelectItem value="pharmacy" className="hover:bg-primary/5 focus:bg-primary/5 cursor-pointer">💊 CANAL FARMACIAS</SelectItem>
                          <SelectItem value="natural_store" className="hover:bg-primary/5 focus:bg-primary/5 cursor-pointer">🌿 TIENDA NATURISTA</SelectItem>
                          <SelectItem value="commerce" className="hover:bg-primary/5 focus:bg-primary/5 cursor-pointer">🛒 CANAL COMERCIO</SelectItem>
                          <SelectItem value="drugstore" className="hover:bg-primary/5 focus:bg-primary/5 cursor-pointer">🏢 DROGUERÍA</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Estatus del Ciclo</Label>
                      <Select value={formData.status} onValueChange={(val) => setFormData(p => ({ ...p, status: val }))}>
                        <SelectTrigger className="h-14 bg-slate-50 border-slate-100 rounded-2xl font-black text-slate-900 uppercase tracking-widest"><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-white border-slate-100 text-slate-900 font-bold uppercase shadow-xl rounded-xl">
                          <SelectItem value="scheduled" className="hover:bg-primary/5 focus:bg-primary/5 cursor-pointer">📅 PROGRAMADA</SelectItem>
                          <SelectItem value="in_progress" className="hover:bg-primary/5 focus:bg-primary/5 cursor-pointer">⚡ EN CURSO</SelectItem>
                          <SelectItem value="completed" className="hover:bg-primary/5 focus:bg-primary/5 cursor-pointer">✅ FINALIZADA</SelectItem>
                          <SelectItem value="cancelled" className="hover:bg-primary/5 focus:bg-primary/5 cursor-pointer">❌ CANCELADA</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Objetivo Estratégico (Planificación)</Label>
                    <Textarea value={formData.visit_objective} onChange={(e) => setFormData(p => ({ ...p, visit_objective: e.target.value }))} placeholder="REDACTE EL OBJETIVO SMART DE LA VISITA..." rows={2} className="bg-slate-50 border-slate-100 rounded-[1.5rem] text-slate-900 font-black uppercase px-6 py-4 placeholder:text-slate-300" />
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Fecha de Ejecución</Label>
                      <Input type="date" value={formData.scheduled_date} onChange={(e) => setFormData(p => ({ ...p, scheduled_date: e.target.value }))} className="h-14 bg-slate-50 border-slate-100 rounded-2xl font-black text-slate-900 uppercase px-6" />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Hora Estimada</Label>
                      <Input type="time" value={formData.scheduled_time} onChange={(e) => setFormData(p => ({ ...p, scheduled_time: e.target.value }))} className="h-14 bg-slate-50 border-slate-100 rounded-2xl font-black text-slate-900 text-center" />
                    </div>
                  </div>
                </TabsContent>

                {isDoctorVisit && (
                  <TabsContent value="medical" className="mt-0 space-y-10 animate-in slide-in-from-right-4 duration-500">
                    <SPINGuideAlert entityType="doctor" />

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="space-y-8">
                        <div className="space-y-3">
                          <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Portafolio en Despliegue</Label>
                          <MultiSelect options={rawProducts.map(p => ({ label: p.name, value: p.name }))} selected={formData.products_presented} onChange={(s) => setFormData(p => ({ ...p, products_presented: s }))} />
                        </div>
                        <div className="p-6 bg-slate-50/50 rounded-[2rem] border border-slate-100 space-y-4">
                          <h4 className="text-[9px] font-black text-indigo-400 uppercase tracking-widest ">Herramientas de Apoyo</h4>
                          <VisualAidModal />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Gestión de Muestras Biológicas</Label>
                        <SampleDeliveryManager onUpdate={(items) => setFormData(p => ({ ...p, samples_delivered: items }))} specialty={selectedContact?.specialty} isMedicalVisit={true} />
                      </div>
                    </div>

                    {productSellingPoints.length > 0 && (
                      <div className="p-8 bg-indigo-500/5 rounded-[2.5rem] border border-indigo-100 space-y-6">
                        <h4 className="text-slate-900 font-black text-xs uppercase tracking-[0.3em] flex items-center gap-3 "><Sparkles className="w-5 h-5 text-indigo-500" /> Inteligencia de Producto Activa</h4>
                        <div className="grid grid-cols-1 gap-4">
                          {productSellingPoints.map(prod => (
                            <div key={prod.id} className="border-l-2 border-indigo-500/30 pl-5">
                              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest  mb-3">{prod.name}</p>
                              <div className="flex flex-wrap gap-2">
                                {prod.selling_points && Object.entries(prod.selling_points).map(([cat, val]: [string, any]) => val && (
                                  <Badge key={cat} className={cn("px-4 py-2 rounded-xl border border-white/5 cursor-pointer transition-all text-[9px] font-bold  uppercase", formData.selling_points.includes(`${prod.name}: ${val}`) ? "bg-primary text-white" : "bg-white/5 text-slate-500 hover:bg-white/10")} onClick={() => {
                                    const tag = `${prod.name}: ${val}`;
                                    setFormData(p => ({ ...p, selling_points: p.selling_points.includes(tag) ? p.selling_points.filter(t => t !== tag) : [...p.selling_points, tag] }));
                                  }}>{cat}: {val}</Badge>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </TabsContent>
                )}

                {isSalesVisit && (
                  <TabsContent value="sales" className="mt-0 space-y-10 animate-in slide-in-from-right-4 duration-500">
                    <div className="grid grid-cols-1 gap-12">
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.4em]  mb-4 flex items-center gap-3"><ClipboardCheck className="w-5 h-5" /> Auditoría de Piso & Anaquel</h4>
                          <Button type="button" onClick={() => navigate('/transfer-orders', { state: { initialContact: { id: formData.contact_id, name: selectedContact?.name || "" }, orderType: formData.visit_type === 'drugstore' ? 'direct' : 'transfer' } })} className="h-12 px-8 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase  rounded-2xl shadow-xl transition-all"><ShoppingCart className="mr-3 h-5 w-5" /> GENERAR PEDIDO DE TRANSFERENCIA</Button>
                        </div>
                        <ShelfAuditForm visitId={visitData?.id} pharmacyId={formData.contact_id} />
                      </div>
                    </div>
                  </TabsContent>
                )}

                {isInstitutionVisit && (
                  <>
                    <TabsContent value="sample-bank" className="mt-0 space-y-10 animate-in slide-in-from-right-4 duration-500">
                      <div className="p-8 bg-slate-50/50 rounded-[2.5rem] border border-slate-100 space-y-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-10 opacity-5">
                          <Package2 className="w-40 h-40 text-indigo-400" />
                        </div>
                        <div className="relative z-10">
                          <h4 className="text-slate-900 font-black text-xs uppercase tracking-[0.3em] flex items-center gap-3 "><Package2 className="w-5 h-5 text-indigo-600" /> Suministro Institucional CA</h4>
                          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-10">Control de Reposición y Stock en Banco de Muestras Hospitalario</p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                            <div className="space-y-3">
                              <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Estatus del Banco en Sede</label>
                              <Select value={formData.sample_bank_status || 'ok'} onValueChange={(v) => setFormData(p => ({ ...p, sample_bank_status: v }))}>
                                <SelectTrigger className="h-14 bg-slate-950 border-white/5 rounded-xl font-black  uppercase text-white"><SelectValue placeholder="EVALUAR..." /></SelectTrigger>
                                <SelectContent className="bg-slate-900 border-white/10 text-white font-bold  uppercase">
                                  <SelectItem value="low">⚠️ BAJO (REPOSICIÓN)</SelectItem>
                                  <SelectItem value="ok">✅ ÓPTIMO</SelectItem>
                                  <SelectItem value="full">📦 SATURADO</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-3">
                              <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Unidades Repuestas Hoy</label>
                              <Input type="number" value={formData.sample_bank_refill || 0} onChange={(e) => setFormData(p => ({ ...p, sample_bank_refill: parseInt(e.target.value) }))} className="h-14 bg-slate-950 border-white/5 rounded-xl font-black text-center text-indigo-400" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="academic" className="mt-0 space-y-10 animate-in slide-in-from-right-4 duration-500">
                       <div className="p-8 bg-slate-50/50 rounded-[2.5rem] border border-slate-100 space-y-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-10 opacity-5">
                          <GraduationCap className="w-40 h-40 text-emerald-400" />
                        </div>
                        <div className="relative z-10">
                          <h4 className="text-slate-900 font-black text-xs uppercase tracking-[0.3em] flex items-center gap-3 "><GraduationCap className="w-5 h-5 text-emerald-600" /> Actividad Académica Corporativa</h4>
                          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-10">Despliegue de Charlas Científicas y Apoyo a Actividades en Sede</p>
                          
                          <div className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Tema / Título de la Charla</label>
                                <Input value={formData.academic_topic || ''} onChange={(e) => setFormData(p => ({ ...p, academic_topic: e.target.value }))} placeholder="EJ: BENEFICIOS TERAPÉUTICOS CA" className="h-14 bg-slate-950 border-white/5 rounded-xl font-black text-white uppercase tracking-tight" />
                              </div>
                              <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Asistencia (Asistentes Estimados)</label>
                                <Input type="number" value={formData.academic_attendance || 0} onChange={(e) => setFormData(p => ({ ...p, academic_attendance: parseInt(e.target.value) }))} className="h-14 bg-slate-950 border-white/5 rounded-xl font-black text-center text-emerald-400" />
                              </div>
                            </div>
                            <div className="space-y-3">
                              <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Contexto / Departamento del Centro de Salud</label>
                              <Input value={formData.academic_context || ''} onChange={(e) => setFormData(p => ({ ...p, academic_context: e.target.value }))} placeholder="EJ: AUDITORIO PRINCIPAL / SERVICIO DE CARDIOLOGÍA" className="h-14 bg-slate-950 border-white/5 rounded-xl font-black text-white uppercase tracking-tight" />
                            </div>
                            <div className="pt-6 border-t border-white/5">
                               <label className="text-[10px] font-black uppercase text-indigo-400 ml-1 mb-4 block ">Herramientas de Presentación Científica CA</label>
                               <VisualAidModal />
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </>
                )}

                <TabsContent value="strategy" className="mt-0 space-y-10 animate-in fade-in duration-500">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-8">
                      <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase text-amber-500 ml-1">Reacción del Activo</Label>
                        <Select value={formData.contact_reaction} onValueChange={(v) => setFormData(p => ({ ...p, contact_reaction: v }))}>
                          <SelectTrigger className="h-14 bg-slate-900 border-white/5 rounded-2xl font-black  uppercase text-white"><SelectValue placeholder="EVALUAR..." /></SelectTrigger>
                          <SelectContent className="bg-slate-900 border-white/10 text-white font-bold  uppercase"><SelectItem value="Muy Positiva">💎 MUY POSITIVA</SelectItem><SelectItem value="Positiva">✅ POSITIVA</SelectItem><SelectItem value="Neutral">⚖️ NEUTRAL</SelectItem><SelectItem value="Negativa">⚠️ NEGATIVA</SelectItem></SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Siguiente Hito Táctico</Label>
                        <Input value={formData.next_step} onChange={(e) => setFormData(p => ({ ...p, next_step: e.target.value }))} placeholder="PRÓXIMA ACCIÓN..." className="h-14 bg-slate-900 border-white/5 rounded-2xl font-black  uppercase px-6" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Hallazgos & Notas de Misión</Label>
                      <Textarea value={formData.results_notes} onChange={(e) => setFormData(p => ({ ...p, results_notes: e.target.value }))} placeholder="DIAGNOSTIQUE EL IMPACTO DE LA VISITA AQUÍ..." rows={6} className="bg-slate-900 border-white/5 rounded-[2rem] text-white font-black  uppercase p-8 px-8" />
                    </div>
                  </div>
                  <div className="p-8 bg-amber-500/5 rounded-[2.5rem] border border-amber-100 space-y-4">
                    <Label className="text-[10px] font-black uppercase text-amber-600 ml-1 flex items-center gap-2 "><Award className="w-4 h-4" /> Pacto de Cierre & Compromisos</Label>
                    <Textarea value={formData.closure_commitment} onChange={(e) => setFormData(p => ({ ...p, closure_commitment: e.target.value }))} placeholder="REDACTE EL ACUERDO FINAL ALCANZADO..." rows={3} className="bg-white border-slate-100 rounded-[2rem] text-slate-900 font-black uppercase p-8 px-8 shadow-inner" />
                  </div>
                </TabsContent>

                <TabsContent value="geo" className="mt-0 space-y-10 animate-in zoom-in-95 duration-500">
                  <div className="flex flex-col items-center justify-center p-20 bg-slate-50 rounded-[3rem] border border-slate-100 border-dashed space-y-8 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#000000_1px,transparent_1px)] [background-size:20px_20px]" />
                    <div className="w-24 h-24 rounded-full bg-blue-500/5 flex items-center justify-center animate-pulse shadow-glow shadow-blue-500/5"><MapPin className="w-12 h-12 text-blue-500" /></div>
                    <div className="text-center relative z-10">
                      <h4 className="text-xl font-black text-slate-900 uppercase tracking-tighter mb-2 font-display">Validación Geográfica de César Ascanio CA</h4>
                      <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">{formData.geolocation || "Buscando coordenadas de mando..."}</p>
                    </div>
                    <Button type="button" onClick={() => { if (navigator.geolocation) { navigator.geolocation.getCurrentPosition(pos => { setFormData(p => ({ ...p, geolocation: `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}` })); toast({ title: "Geo-Sincronización Exitosa ✅" }); }); } }} className="h-16 px-12 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase  rounded-2xl shadow-2xl scale-105 active:scale-95 transition-all">CAPTURA GPS DE SEGURIDAD</Button>
                  </div>
                </TabsContent>
              </form>
            </div>
          </Tabs>
        </div>

        <div className="bg-slate-50 border-t border-slate-100 px-10 py-8 flex items-center justify-between gap-6">
          <Button variant="ghost" onClick={() => setOpen(false)} className="h-14 px-8 font-black uppercase text-rose-500 hover:text-rose-400 hover:bg-rose-500/5 rounded-2xl text-[10px] tracking-widest hidden sm:flex ">DESCARTAR SESIÓN</Button>
          <div className="flex items-center gap-4 flex-1 sm:flex-none">
            <Button type="button" onClick={() => { const tabs = ["basic", isDoctorVisit ? "medical" : null, isSalesVisit ? "sales" : null, "strategy", "geo"].filter(t => t !== null); const currentIdx = tabs.indexOf(activeTab); setActiveTab(tabs[currentIdx < tabs.length - 1 ? currentIdx + 1 : 0] as string); }} variant="outline" className="flex-1 sm:flex-none h-14 px-8 border-slate-200 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-400 hover:text-slate-900 hover:bg-slate-100 ">Navegación Táctica <ChevronRight className="w-4 h-4 ml-3" /></Button>
            <Button type="submit" form="visit-detail-form" disabled={loading} className="flex-1 sm:flex-none h-14 px-12 bg-primary text-white font-black uppercase rounded-2xl shadow-premium-md hover:bg-primary/90">{loading ? <Loader2 className="animate-spin h-5 w-5 mr-3" /> : <CheckCircle className="h-5 w-5 mr-3" />} {visitData?.id ? 'SINCRONIZAR REPORTE' : 'DESPLEGAR MISIÓN'}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
