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
import { EliteButton } from "@/components/layout/DesignSystem";

// Helper MultiSelect Component - Elite Dark Version
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
        <Button variant="outline" role="combobox" className="w-full justify-between h-auto min-h-[48px] px-4 py-3 bg-muted/5 border-border/40 rounded-2xl hover:bg-muted/10 transition-all text-foreground">
          <div className="flex flex-wrap gap-2">
            {selected.length === 0 && <span className="text-muted-foreground font-black text-elite-xs uppercase tracking-widest">{placeholder}</span>}
            {selected.map((item) => (
              <Badge key={item} className="badge-elite-info" onClick={(e) => { e.stopPropagation(); handleUnselect(item); }}>
                {options.find(opt => opt.value === item)?.label || item}
                <X className="ml-1 h-3 w-3" />
              </Badge>
            ))}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-40" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-card border-border/40 rounded-2xl shadow-3xl overflow-hidden">
        <Command className="bg-card text-foreground">
          <CommandInput placeholder="BUSCAR..." className="h-14 font-black uppercase tracking-widest" />
          <CommandList className="max-h-60 custom-scrollbar">
            <CommandEmpty className="py-8 text-center text-elite-xs font-black uppercase text-muted-foreground">{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem key={option.value} onSelect={() => onChange(selected.includes(option.value) ? selected.filter(i => i !== option.value) : [...selected, option.value])} className="py-4 px-6 hover:bg-muted/5 cursor-pointer border-b border-border/10 last:border-none">
                  <Check className={cn("mr-3 h-4 w-4 text-primary", selected.includes(option.value) ? "opacity-100" : "opacity-0")} />
                  <span className="font-bold text-xs uppercase">{option.label}</span>
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
  const { user, profile, organizationId, isMaster } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("basic");

  // State
  const [contacts, setContacts] = useState<any[]>([]);
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
      let prodQuery = supabase.from('products').select('*').order('name');
      if (profile.organization_id && !isMaster) {
          prodQuery = prodQuery.or(`organization_id.eq.${profile.organization_id},organization_id.eq.00000000-0000-0000-0000-000000000000,organization_id.is.null`);
      } else if (profile.organization_id && isMaster) {
          prodQuery = prodQuery.eq('organization_id', profile.organization_id);
      }
      const { data: productsData } = await prodQuery;
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
      <DialogContent aria-describedby={undefined} className="max-w-5xl p-0 overflow-hidden border-none rounded-[2.5rem] bg-card shadow-premium-2xl font-display max-h-[95vh]">
        <div className="bg-muted/5 px-10 py-8 text-foreground relative border-b border-border/40">
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-primary text-white flex items-center justify-center shadow-premium-md border border-primary/20">
                <FileText className="w-8 h-8" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-black uppercase tracking-tighter font-display text-foreground">
                  {visitData ? 'Control de Misión Realizada' : 'Planificación de Misión Táctica'}
                </DialogTitle>
                <div className="flex items-center gap-3 mt-2">
                  <Badge className={cn("badge-elite-success border-none", formData.status !== 'completed' && "badge-elite-info")}>{formData.status === 'completed' ? 'FINALIZADA' : 'CICLO ACTIVO'}</Badge>
                  <p className="text-muted-foreground font-black text-elite-xs uppercase tracking-widest opacity-60">César Ascanio Intelligence Hub 💎</p>
                </div>
              </div>
            </div>
            {selectedContact && (
              <div className="text-right hidden md:block">
                <p className="text-foreground font-black uppercase text-lg leading-none font-display">{selectedContact.name}</p>
                <p className="text-muted-foreground font-black uppercase text-elite-xs tracking-widest mt-2">{selectedContact.specialty} | {selectedContact.city}</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col md:flex-row h-[700px] overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col md:flex-row w-full h-full">
            <TabsList className="flex flex-row md:flex-col h-auto md:h-full w-full md:w-72 bg-muted/5 border-r border-border/40 p-4 justify-start gap-2 overflow-x-auto custom-scrollbar">
              <TabsTrigger value="basic" className="justify-start gap-4 px-6 py-4 rounded-2xl font-black transition-all data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-soft border-none text-muted-foreground text-elite-xs uppercase tracking-widest">
                <LayoutGrid className="w-4 h-4" /> PERFIL & AGENDA
              </TabsTrigger>

              {isDoctorVisit && (
                <TabsTrigger value="medical" className="justify-start gap-4 px-6 py-4 rounded-2xl font-black transition-all data-[state=active]:bg-primary data-[state=active]:text-white border-none text-muted-foreground text-elite-xs uppercase tracking-widest">
                  <Microscope className="w-4 h-4" /> PROMOCIÓN MÉDICA
                </TabsTrigger>
              )}

              {isSalesVisit && (
                <TabsTrigger value="sales" className="justify-start gap-4 px-6 py-4 rounded-2xl font-black transition-all data-[state=active]:bg-emerald-500 data-[state=active]:text-white border-none text-muted-foreground text-elite-xs uppercase tracking-widest">
                  <ShoppingCart className="w-4 h-4" /> EJECUCIÓN COMERCIAL
                </TabsTrigger>
              )}

              <TabsTrigger value="strategy" className="justify-start gap-4 px-6 py-4 rounded-2xl font-black transition-all data-[state=active]:bg-amber-500 data-[state=active]:text-white border-none text-muted-foreground text-elite-xs uppercase tracking-widest">
                <Target className="w-4 h-4" /> HITOS & CIERRE
              </TabsTrigger>

              <TabsTrigger value="geo" className="justify-start gap-4 px-6 py-4 rounded-2xl font-black transition-all data-[state=active]:bg-blue-500 data-[state=active]:text-white border-none text-muted-foreground text-elite-xs uppercase tracking-widest">
                <MapIcon className="w-4 h-4" /> GEOPOSICIÓN CA
              </TabsTrigger>

              {isInstitutionVisit && (
                <>
                  <TabsTrigger value="sample-bank" className="justify-start gap-4 px-6 py-4 rounded-2xl font-black transition-all data-[state=active]:bg-indigo-600 data-[state=active]:text-white border-none text-muted-foreground text-elite-xs uppercase tracking-widest">
                    <Package2 className="w-4 h-4" /> BANCO DE MUESTRAS
                  </TabsTrigger>
                  <TabsTrigger value="academic" className="justify-start gap-4 px-6 py-4 rounded-2xl font-black transition-all data-[state=active]:bg-indigo-600 data-[state=active]:text-white border-none text-muted-foreground text-elite-xs uppercase tracking-widest">
                    <GraduationCap className="w-4 h-4" /> ACTIVIDAD ACADÉMICA
                  </TabsTrigger>
                </>
              )}
            </TabsList>

            <div className="flex-1 overflow-y-auto bg-card p-10 custom-scrollbar">
              <form onSubmit={handleSubmit} id="visit-detail-form" className="space-y-10">
                <TabsContent value="basic" className="mt-0 space-y-8 animate-in fade-in duration-500">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <Label className="text-elite-xs font-black uppercase text-muted-foreground/60 ml-1">Canal de Misión</Label>
                      <Select value={formData.visit_type} onValueChange={(val) => setFormData(p => ({ ...p, visit_type: val }))}>
                        <SelectTrigger className="h-14 bg-muted/5 border-border/40 rounded-2xl font-black text-foreground uppercase tracking-widest"><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-card border-border/40 text-foreground font-bold uppercase shadow-xl rounded-xl">
                          <SelectItem value="doctor">🩺 FICHERO MÉDICO</SelectItem>
                          <SelectItem value="hospital">🏥 CENTRO DE SALUD</SelectItem>
                          <SelectItem value="pharmacy">💊 CANAL FARMACIAS</SelectItem>
                          <SelectItem value="natural_store">🌿 TIENDA NATURISTA</SelectItem>
                          <SelectItem value="commerce">🛒 CANAL COMERCIO</SelectItem>
                          <SelectItem value="drugstore">🏢 DROGUERÍA</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-elite-xs font-black uppercase text-muted-foreground/60 ml-1">Estatus del Ciclo</Label>
                      <Select value={formData.status} onValueChange={(val) => setFormData(p => ({ ...p, status: val }))}>
                        <SelectTrigger className="h-14 bg-muted/5 border-border/40 rounded-2xl font-black text-foreground uppercase tracking-widest"><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-card border-border/40 text-foreground font-bold uppercase shadow-xl rounded-xl">
                          <SelectItem value="scheduled">📅 PROGRAMADA</SelectItem>
                          <SelectItem value="in_progress">⚡ EN CURSO</SelectItem>
                          <SelectItem value="completed">✅ FINALIZADA</SelectItem>
                          <SelectItem value="cancelled">❌ CANCELADA</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-elite-xs font-black uppercase text-muted-foreground/60 ml-1">Objetivo Estratégico (Planificación)</Label>
                    <Textarea value={formData.visit_objective} onChange={(e) => setFormData(p => ({ ...p, visit_objective: e.target.value }))} placeholder="REDACTE EL OBJETIVO SMART DE LA VISITA..." rows={2} className="bg-muted/5 border-border/40 rounded-[1.5rem] text-foreground font-black uppercase px-6 py-4 placeholder:text-muted-foreground/30" />
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <Label className="text-elite-xs font-black uppercase text-muted-foreground/60 ml-1">Fecha de Ejecución</Label>
                      <Input type="date" value={formData.scheduled_date} onChange={(e) => setFormData(p => ({ ...p, scheduled_date: e.target.value }))} className="h-14 bg-muted/5 border-border/40 rounded-2xl font-black text-foreground uppercase px-6" />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-elite-xs font-black uppercase text-muted-foreground/60 ml-1">Hora Estimada</Label>
                      <Input type="time" value={formData.scheduled_time} onChange={(e) => setFormData(p => ({ ...p, scheduled_time: e.target.value }))} className="h-14 bg-muted/5 border-border/40 rounded-2xl font-black text-foreground text-center" />
                    </div>
                  </div>
                </TabsContent>

                {isDoctorVisit && (
                  <TabsContent value="medical" className="mt-0 space-y-10 animate-in slide-in-from-right-4 duration-500">
                    <SPINGuideAlert entityType="doctor" />
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="space-y-8">
                        <div className="space-y-3">
                          <Label className="text-elite-xs font-black uppercase text-muted-foreground ml-1">Portafolio en Despliegue</Label>
                          <MultiSelect options={rawProducts.map(p => ({ label: p.name, value: p.name }))} selected={formData.products_presented} onChange={(s) => setFormData(p => ({ ...p, products_presented: s }))} />
                        </div>
                        <div className="p-6 bg-muted/5 rounded-[2rem] border border-border/40 space-y-4">
                          <h4 className="text-elite-xs font-black text-primary uppercase tracking-[0.4em]">Herramientas de Apoyo</h4>
                          <VisualAidModal />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <Label className="text-elite-xs font-black uppercase text-muted-foreground ml-1">Gestión de Muestras Biológicas</Label>
                        <SampleDeliveryManager onUpdate={(items) => setFormData(p => ({ ...p, samples_delivered: items }))} specialty={selectedContact?.specialty} isMedicalVisit={true} />
                      </div>
                    </div>

                    {productSellingPoints.length > 0 && (
                      <div className="p-8 bg-primary/5 rounded-[2.5rem] border border-primary/20 space-y-6">
                        <h4 className="text-foreground font-black text-xs uppercase tracking-[0.3em] flex items-center gap-3"><Sparkles className="w-5 h-5 text-primary" /> Inteligencia de Producto Activa</h4>
                        <div className="grid grid-cols-1 gap-4">
                          {productSellingPoints.map(prod => (
                            <div key={prod.id} className="border-l-2 border-primary/30 pl-5">
                              <p className="text-elite-xs font-black text-primary uppercase tracking-widest mb-3">{prod.name}</p>
                              <div className="flex flex-wrap gap-2">
                                {prod.selling_points && Object.entries(prod.selling_points).map(([cat, val]: [string, any]) => val && (
                                  <Badge key={cat} className={cn("px-4 py-2 rounded-xl border border-border/40 cursor-pointer transition-all text-[9px] font-bold uppercase", formData.selling_points.includes(`${prod.name}: ${val}`) ? "bg-primary text-white" : "bg-muted/10 text-muted-foreground hover:bg-muted/20")} onClick={() => {
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
                          <h4 className="text-elite-xs font-black text-emerald-400 uppercase tracking-[0.4em] mb-4 flex items-center gap-3"><ClipboardCheck className="w-5 h-5" /> Auditoría de Piso & Anaquel</h4>
                          <EliteButton variant="secondary" onClick={() => navigate('/transfer-orders', { state: { initialContact: { id: formData.contact_id, name: selectedContact?.name || "" }, orderType: formData.visit_type === 'drugstore' ? 'direct' : 'transfer' } })} className="bg-emerald-600 hover:bg-emerald-700 h-12" icon={ShoppingCart}>GENERAR PEDIDO</EliteButton>
                        </div>
                        <ShelfAuditForm visitId={visitData?.id} pharmacyId={formData.contact_id} />
                      </div>
                    </div>
                  </TabsContent>
                )}

                {isInstitutionVisit && (
                  <>
                    <TabsContent value="sample-bank" className="mt-0 space-y-10 animate-in slide-in-from-right-4 duration-500">
                      <div className="p-8 bg-muted/5 rounded-[2.5rem] border border-border/40 space-y-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-10 opacity-5"><Package2 className="w-40 h-40 text-primary" /></div>
                        <div className="relative z-10">
                          <h4 className="text-foreground font-black text-xs uppercase tracking-[0.3em] flex items-center gap-3"><Package2 className="w-5 h-5 text-primary" /> Suministro Institucional CA</h4>
                          <p className="text-muted-foreground text-elite-xs font-bold uppercase tracking-widest mb-10 opacity-60">Control de Reposición y Stock en Banco de Muestras Hospitalario</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                            <div className="space-y-3">
                              <label className="text-elite-xs font-black uppercase text-muted-foreground ml-1">Estatus del Banco en Sede</label>
                              <Select value={formData.sample_bank_status || 'ok'} onValueChange={(v) => setFormData(p => ({ ...p, sample_bank_status: v }))}>
                                <SelectTrigger className="h-14 bg-muted/10 border-border/40 rounded-xl font-black uppercase text-foreground"><SelectValue placeholder="EVALUAR..." /></SelectTrigger>
                                <SelectContent className="bg-card border-border/40 text-foreground font-bold uppercase"><SelectItem value="low">⚠️ BAJO (REPOSICIÓN)</SelectItem><SelectItem value="ok">✅ ÓPTIMO</SelectItem><SelectItem value="full">📦 SATURADO</SelectItem></SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-3">
                              <label className="text-elite-xs font-black uppercase text-muted-foreground ml-1">Unidades Repuestas Hoy</label>
                              <Input type="number" value={formData.sample_bank_refill || 0} onChange={(e) => setFormData(p => ({ ...p, sample_bank_refill: parseInt(e.target.value) }))} className="h-14 bg-muted/10 border-border/40 rounded-xl font-black text-center text-primary" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="academic" className="mt-0 space-y-10 animate-in slide-in-from-right-4 duration-500">
                       <div className="p-8 bg-muted/5 rounded-[2.5rem] border border-border/40 space-y-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-10 opacity-5"><GraduationCap className="w-40 h-40 text-primary" /></div>
                        <div className="relative z-10">
                          <h4 className="text-foreground font-black text-xs uppercase tracking-[0.3em] flex items-center gap-3"><GraduationCap className="w-5 h-5 text-primary" /> Actividad Académica Corporativa</h4>
                          <p className="text-muted-foreground text-elite-xs font-bold uppercase tracking-widest mb-10 opacity-60">Despliegue de Charlas Científicas y Apoyo a Actividades en Sede</p>
                          <div className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              <div className="space-y-3">
                                <label className="text-elite-xs font-black uppercase text-muted-foreground ml-1">Tema / Título de la Charla</label>
                                <Input value={formData.academic_topic || ''} onChange={(e) => setFormData(p => ({ ...p, academic_topic: e.target.value }))} placeholder="EJ: BENEFICIOS TERAPÉUTICOS CA" className="h-14 bg-muted/10 border-border/40 rounded-xl font-black text-foreground uppercase tracking-tight" />
                              </div>
                              <div className="space-y-3">
                                <label className="text-elite-xs font-black uppercase text-muted-foreground ml-1">Asistencia Estimada</label>
                                <Input type="number" value={formData.academic_attendance || 0} onChange={(e) => setFormData(p => ({ ...p, academic_attendance: parseInt(e.target.value) }))} className="h-14 bg-muted/10 border-border/40 rounded-xl font-black text-center text-primary" />
                              </div>
                            </div>
                            <div className="space-y-3">
                              <label className="text-elite-xs font-black uppercase text-muted-foreground ml-1">Contexto / Departamento</label>
                              <Input value={formData.academic_context || ''} onChange={(e) => setFormData(p => ({ ...p, academic_context: e.target.value }))} placeholder="EJ: SERVICIO DE CARDIOLOGÍA" className="h-14 bg-muted/10 border-border/40 rounded-xl font-black text-foreground uppercase tracking-tight" />
                            </div>
                            <div className="pt-6 border-t border-border/40">
                               <label className="text-elite-xs font-black uppercase text-primary ml-1 mb-4 block">Herramientas de Presentación Científica</label>
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
                        <Label className="text-elite-xs font-black uppercase text-amber-500 ml-1">Reacción del Activo</Label>
                        <Select value={formData.contact_reaction} onValueChange={(v) => setFormData(p => ({ ...p, contact_reaction: v }))}>
                          <SelectTrigger className="h-14 bg-muted/10 border-border/40 rounded-2xl font-black uppercase text-foreground"><SelectValue placeholder="EVALUAR..." /></SelectTrigger>
                          <SelectContent className="bg-card border-border/40 text-foreground font-bold uppercase"><SelectItem value="Muy Positiva">💎 MUY POSITIVA</SelectItem><SelectItem value="Positiva">✅ POSITIVA</SelectItem><SelectItem value="Neutral">⚖️ NEUTRAL</SelectItem><SelectItem value="Negativa">⚠️ NEGATIVA</SelectItem></SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-3">
                        <Label className="text-elite-xs font-black uppercase text-muted-foreground ml-1">Siguiente Hito Táctico</Label>
                        <Input value={formData.next_step} onChange={(e) => setFormData(p => ({ ...p, next_step: e.target.value }))} placeholder="PRÓXIMA ACCIÓN..." className="h-14 bg-muted/10 border-border/40 rounded-2xl font-black uppercase px-6 text-foreground" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-elite-xs font-black uppercase text-muted-foreground ml-1">Hallazgos & Notas de Misión</Label>
                      <Textarea value={formData.results_notes} onChange={(e) => setFormData(p => ({ ...p, results_notes: e.target.value }))} placeholder="DIAGNOSTIQUE EL IMPACTO AQUÍ..." rows={6} className="bg-muted/10 border-border/40 rounded-[2rem] text-foreground font-black uppercase p-8 px-8" />
                    </div>
                  </div>
                  <div className="p-8 bg-amber-500/5 rounded-[2.5rem] border border-amber-500/20 space-y-4 shadow-inner">
                    <Label className="text-elite-xs font-black uppercase text-amber-600 ml-1 flex items-center gap-2"><Award className="w-4 h-4" /> Pacto de Cierre & Compromisos</Label>
                    <Textarea value={formData.closure_commitment} onChange={(e) => setFormData(p => ({ ...p, closure_commitment: e.target.value }))} placeholder="REDACTE EL ACUERDO FINAL..." rows={3} className="bg-card border-border/40 rounded-[2rem] text-foreground font-black uppercase p-8 px-8 shadow-inner" />
                  </div>
                </TabsContent>

                <TabsContent value="geo" className="mt-0 space-y-10 animate-in zoom-in-95 duration-500">
                  <div className="flex flex-col items-center justify-center p-20 bg-muted/5 rounded-[3rem] border border-border/40 border-dashed space-y-8 relative overflow-hidden text-foreground">
                    <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]" />
                    <div className="w-24 h-24 rounded-full bg-blue-500/10 flex items-center justify-center animate-pulse shadow-glow shadow-blue-500/10"><MapPin className="w-12 h-12 text-blue-500" /></div>
                    <div className="text-center relative z-10">
                      <h4 className="text-xl font-black text-foreground uppercase tracking-tighter mb-2 font-display">Validación Geográfica CA</h4>
                      <p className="text-muted-foreground font-black text-elite-xs uppercase tracking-widest opacity-60">{formData.geolocation || "Buscando coordenadas de mando..."}</p>
                    </div>
                    <EliteButton variant="secondary" className="bg-blue-600 hover:bg-blue-700 h-16 px-12 scale-105" icon={MapPin} onClick={() => { if (navigator.geolocation) { navigator.geolocation.getCurrentPosition(pos => { setFormData(p => ({ ...p, geolocation: `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}` })); toast({ title: "Geo-Sincronización Exitosa ✅" }); }); } }}>CAPTURA GPS DE SEGURIDAD</EliteButton>
                  </div>
                </TabsContent>
              </form>
            </div>
          </Tabs>
        </div>

        <div className="bg-muted/5 border-t border-border/40 px-10 py-8 flex items-center justify-between gap-6">
          <Button variant="ghost" onClick={() => setOpen(false)} className="h-14 px-8 font-black uppercase text-rose-500 hover:text-rose-400 hover:bg-rose-500/5 rounded-2xl text-elite-xs tracking-widest hidden sm:flex">DESCARTAR</Button>
          <div className="flex items-center gap-4 flex-1 sm:flex-none">
            <EliteButton variant="secondary" className="h-14 px-8" icon={ChevronRight} onClick={() => { const tabs = ["basic", isDoctorVisit ? "medical" : null, isSalesVisit ? "sales" : null, "strategy", "geo"].filter(t => t !== null); const currentIdx = tabs.indexOf(activeTab); setActiveTab(tabs[currentIdx < tabs.length - 1 ? currentIdx + 1 : 0] as string); }}>SIGUIENTE</EliteButton>
            <EliteButton type="submit" form="visit-detail-form" disabled={loading} className="h-14 px-12 min-w-[200px]" icon={loading ? Loader2 : CheckCircle}>{visitData?.id ? 'SINCRONIZAR REPORTE' : 'DESPLEGAR MISIÓN'}</EliteButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
