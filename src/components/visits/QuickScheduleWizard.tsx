/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
 ======================================================================== */

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { WizardProgress } from '@/components/common/WizardProgress';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { ChevronLeft, ChevronRight, Calendar, Leaf as LeafIcon, Truck, Plus, ShoppingCart, Building2, Target, CheckCircle2, Package, Sparkles, GraduationCap, Package2, ClipboardCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Check, ChevronsUpDown, UserRound, Store, UserPlus } from 'lucide-react';
import { useDemoData } from '@/contexts/MockDataProvider';
import { DoctorFormDialog } from '@/components/doctors/DoctorFormDialog';
import { PharmacyFormDialog } from '@/components/pharma/PharmacyFormDialog';

interface QuickScheduleWizardProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
    visitData?: {
        contactId: string;
        visitType: 'doctor' | 'pharmacy' | 'natural_store' | 'drugstore' | 'commerce' | 'hospital';
    } | null;
}

const WIZARD_STEPS = [
    { label: 'Identidad', icon: '👤' },
    { label: 'Cronograma', icon: '📅' },
    { label: 'Objetivos', icon: '🎯' },
    { label: 'Estrategia', icon: '📦' },
    { label: 'Confirmar', icon: '✅' },
];

export function QuickScheduleWizard({ open, onOpenChange, onSuccess, visitData }: QuickScheduleWizardProps) {
    const { user, profile } = useAuth();
    const { toast } = useToast();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const demoData = useDemoData();

    // Form Data - Expanded Ecosistema CA
    const [visitType, setVisitType] = useState<'doctor' | 'pharmacy' | 'natural_store' | 'drugstore' | 'commerce' | 'hospital'>('doctor');
    const [contactId, setContactId] = useState('');
    const [scheduledDate, setScheduledDate] = useState('');
    const [scheduledTime, setScheduledTime] = useState('08:00');
    const [objective, setObjective] = useState('');
    const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
    const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
    const [auditPriorities, setAuditPriorities] = useState<string[]>([]);
    const [institutionalPriorities, setInstitutionalPriorities] = useState<string[]>([]);

    // Resources
    const [contacts, setContacts] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [materials, setMaterials] = useState<any[]>([]);
    const [openContactSelector, setOpenContactSelector] = useState(false);

    // Quick Create States
    const [showDoctorDialog, setShowDoctorDialog] = useState(false);
    const [showPharmacyDialog, setShowPharmacyDialog] = useState(false);
    const [doctorFormData, setDoctorFormData] = useState({
        name: '', specialty_id: '', potential: 'Medio', status: 'Activo'
    });
    const [pharmacyFormData, setPharmacyFormData] = useState({
        name: '', rif: '', address: '', type: 'FARMACIA'
    });

    useEffect(() => {
        if (open) {
            loadContacts();
            loadResources();
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            setScheduledDate(tomorrow.toISOString().split('T')[0]);

            // Contextual Pre-load
            if (visitData) {
                setVisitType(visitData.visitType);
                setContactId(visitData.contactId);
                setCurrentStep(2); // Jump to schedule step
            } else {
                setCurrentStep(1); // Reset to start if no context
            }
        }
    }, [open, visitType, visitData]);

    const loadContacts = async () => {
        if (!user) return;
        if (demoData) {
            const allContacts = [
                ...(demoData.doctors || []).map((d: any) => ({ ...d, contact_type: 'doctor' })),
                ...(demoData.pharmacies || []).map((p: any) => ({ ...p, contact_type: 'pharmacy', specialty: 'Farmacia' })),
                ...(demoData.commerces || []).map((c: any) => ({ ...c, contact_type: 'commerce', specialty: 'Comercio' })),
                ...(demoData.healthCenters || []).map((h: any) => ({ ...h, contact_type: 'hospital', specialty: h.facility_type || 'Hospital' })),
            ];
            setContacts(allContacts);
            return;
        }
        try {
            const { data: contactsData } = await supabase
                .from('unified_contacts')
                .select('id, name, specialty, address, contact_type')
                .order('name');
            setContacts(contactsData || []);
        } catch (e) { 
            console.error('Error loading unified contacts:', e); 
            // Fallback to local table if view fails
            const { data: legacyData } = await supabase
                .from('contacts')
                .select('id, name, specialty, address, contact_type');
            setContacts(legacyData || []);
        }
    };

    const loadResources = async () => {
        try {
            const { data: productsData } = await supabase.from('products').select('id, name').eq('organization_id', (profile as any)?.organization_id).order('name');
            setProducts(productsData || []);
            // Mocking materials for now, could be dynamic
            setMaterials([
                { id: '1', name: 'Flyers Citrato vs Carbonato' },
                { id: '2', name: 'Muestras Médicas Calzinc D' },
                { id: '3', name: 'Díptico' },
                { id: '4', name: 'Habladores de Anaquel' }
            ]);
        } catch (e) { console.error(e); }
    };

    const handleBack = () => { if (currentStep > 1) setCurrentStep(currentStep - 1); };

    const handleNext = () => {
        if (currentStep === 1 && !contactId) return toast({ title: 'Selecciona una entidad de César Ascanio CA' });
        if (currentStep === 2 && !scheduledDate) return toast({ title: 'Sincroniza la fecha de misión' });
        if (currentStep === 3 && !objective) return toast({ title: 'Define el Objetivo SMART' });
        if (currentStep < 5) setCurrentStep(currentStep + 1);
        else handleSubmit();
    };

    const handleSubmit = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
            const fullObjective = `
OBJETIVO: ${objective}
ESTRATEGIA: ${[...institutionalPriorities, ...auditPriorities].join(', ')}
`.trim();

            const { error } = await supabase.from('visits').insert([{
                user_id: user.id, organization_id: profile?.organization_id,
                contact_id: contactId, scheduled_date: scheduledDateTime.toISOString(),
                visit_type: visitType, objective: fullObjective,
                products_presented: selectedProducts,
                promotional_materials: selectedMaterials.join(', '),
                status: 'scheduled',
            }]);
            if (error) throw error;
            toast({ title: '✅ Misión Agendada en el Sistema Maestro' });
            onOpenChange(false);
            onSuccess?.();
        } catch (error: any) {
            toast({ title: 'Error Táctico', description: error.message, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const selectedContact = contacts.find((c) => c.id === contactId);
    const filteredContacts = contacts.filter((c) => c.contact_type === visitType);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-5xl p-0 overflow-hidden border-none rounded-[2.5rem] shadow-3xl bg-slate-950 font-outfit max-h-[90vh]">
                {/* Header Elite Industrial */}
                <div className="bg-slate-900 px-10 py-8 text-white relative">
                    <div className="flex items-center gap-6 relative z-10">
                        <div className="w-20 h-20 rounded-3xl bg-primary text-white flex items-center justify-center shadow-2xl border border-white/10 scale-110">
                            <Calendar className="h-10 w-10" />
                        </div>
                        <div>
                            <DialogTitle className="text-3xl font-black uppercase  tracking-tighter leading-none">Agendado Táctico de Élite</DialogTitle>
                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-3 ">Planificador Dinámico César Ascanio CA</p>
                        </div>
                    </div>
                </div>

                <div className="px-10 py-10 space-y-12 bg-slate-950 text-white overflow-y-auto custom-scrollbar">
                    <WizardProgress currentStep={currentStep} totalSteps={5} steps={WIZARD_STEPS} />

                    {/* Step 1: Identidad Digital */}
                    {currentStep === 1 && (
                        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
                            <div className="grid grid-cols-2 lg:grid-cols-6 gap-5">
                                {[
                                    { id: 'doctor', icon: UserRound, label: 'Médico' },
                                    { id: 'hospital', icon: Building2, label: 'Centro' },
                                    { id: 'pharmacy', icon: Store, label: 'Farmacia' },
                                    { id: 'natural_store', icon: LeafIcon, label: 'Naturista' },
                                    { id: 'commerce', icon: ShoppingCart, label: 'Comercio' },
                                    { id: 'drugstore', icon: Truck, label: 'Droguería' }
                                ].map((type) => (
                                    <Button
                                        key={type.id}
                                        variant="outline"
                                        className={cn(
                                            "h-32 flex-col gap-4 border-2 rounded-[2rem] p-6 transition-all duration-500",
                                            visitType === type.id ? "bg-white text-slate-950 border-white shadow-2xl scale-105" : "bg-slate-900 border-white/5 text-slate-500"
                                        )}
                                        onClick={() => { setVisitType(type.id as any); setContactId(''); }}
                                    >
                                        <type.icon className={cn("h-6 w-6", visitType === type.id ? "text-primary" : "text-slate-600")} />
                                        <span className="font-black text-[10px] uppercase tracking-widest leading-none">{type.label}</span>
                                    </Button>
                                ))}
                            </div>

                            <div className="space-y-4">
                                <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Seleccionar Objetivo Dinámico</Label>
                                <Popover open={openContactSelector} onOpenChange={setOpenContactSelector}>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="h-16 w-full justify-between bg-slate-900 border-white/5 rounded-3xl px-8 font-black text-white  uppercase tracking-widest text-lg">
                                            {selectedContact ? selectedContact.name : `BUSCAR ${visitType.toUpperCase()} EN EL PADRÓN...`}
                                            <ChevronsUpDown className="ml-2 h-5 w-5 opacity-40 shrink-0" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-slate-900 border-white/10 rounded-[2rem] shadow-3xl overflow-hidden mt-2">
                                        <Command className="bg-slate-900 text-white">
                                            <CommandInput placeholder="FILTRAR REGISTROS..." className="h-16  font-black uppercase" />
                                            <CommandList className="max-h-64 custom-scrollbar">
                                                <CommandEmpty className="py-10 text-center flex flex-col items-center gap-4">
                                                    <p className="text-xs font-bold text-slate-600 uppercase">Sin resultados en el padrón activo</p>
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm" 
                                                        className="bg-white/5 border-white/10 text-white font-black text-[9px] uppercase tracking-widest px-6 h-10 rounded-xl hover:bg-white/10"
                                                        onClick={() => {
                                                            if (visitType === 'doctor') setShowDoctorDialog(true);
                                                            else if (visitType === 'pharmacy') setShowPharmacyDialog(true);
                                                            setOpenContactSelector(false);
                                                        }}
                                                    >
                                                        <Plus className="w-3 h-3 mr-2" /> CREAR {visitType.toUpperCase()} DIGITAL
                                                    </Button>
                                                </CommandEmpty>
                                                <CommandGroup>
                                                    {filteredContacts.map((contact) => (
                                                        <CommandItem key={contact.id} onSelect={() => { setContactId(contact.id); setOpenContactSelector(false); }} className="py-5 px-8 hover:bg-white/5 border-b border-white/5 cursor-pointer">
                                                            <div className="flex flex-col"><span className="text-sm font-black  uppercase text-white">{contact.name}</span><span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1.5">{contact.specialty} | {contact.address}</span></div>
                                                        </CommandItem>
                                                    ))}
                                                    <CommandItem 
                                                        onSelect={() => {
                                                            if (visitType === 'doctor') setShowDoctorDialog(true);
                                                            else if (visitType === 'pharmacy') setShowPharmacyDialog(true);
                                                            setOpenContactSelector(false);
                                                        }}
                                                        className="py-5 px-8 bg-primary/5 hover:bg-primary/10 cursor-pointer"
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                                                                <UserPlus className="w-5 h-5 text-primary" />
                                                            </div>
                                                            <span className="text-xs font-black uppercase text-primary tracking-widest">Registrar Nuevo {visitType.toUpperCase()}</span>
                                                        </div>
                                                    </CommandItem>
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Cronograma */}
                    {currentStep === 2 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-in fade-in slide-in-from-right-6 duration-700">
                            <div className="space-y-5">
                                <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Fecha de la Misión</Label>
                                <Input type="date" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} className="h-16 bg-slate-900 border-white/5 rounded-3xl font-black  text-white uppercase px-8 text-2xl" />
                            </div>
                            <div className="space-y-5">
                                <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Horario Táctico</Label>
                                <Input type="time" value={scheduledTime} onChange={(e) => setScheduledTime(e.target.value)} className="h-16 bg-slate-900 border-white/5 rounded-3xl font-black  text-white text-center text-2xl" />
                            </div>
                        </div>
                    )}

                    {/* Step 3: Objetivos SMART */}
                    {currentStep === 3 && (
                        <div className="space-y-5 animate-in fade-in slide-in-from-right-6 duration-700">
                            <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Definición de Objetivo (Relojería Operativa)</Label>
                            <Textarea
                                value={objective}
                                onChange={(e) => setObjective(e.target.value)}
                                placeholder="EJ: LOGRAR EL LISTADO DE CALZINC D 60 TAB EN LA FARMACIA 'X'..."
                                rows={6}
                                className="bg-slate-900 border-white/5 rounded-[3rem] text-white font-black  uppercase p-12 px-12 text-lg"
                            />
                        </div>
                    )}

                    {/* Step 4: Estrategia por Canal (Dinámico) */}
                    {currentStep === 4 && (
                        <div className="space-y-10 animate-in fade-in scale-95 duration-700">
                            <div className="flex items-center gap-4">
                                <div className={cn("w-1.5 h-8 rounded-full", visitType === 'doctor' ? "bg-indigo-500" : "bg-emerald-500")} />
                                <h3 className="text-lg font-black uppercase tracking-tight text-white ">Estrategia de Ejecución: {visitType.toUpperCase()}</h3>
                            </div>

                            {visitType === 'doctor' ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                    <div className="space-y-5">
                                        <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Foco de Portafolio</Label>
                                        <div className="space-y-3">
                                            {products.slice(0, 4).map(p => (
                                                <div key={p.id} className={cn("p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between", selectedProducts.includes(p.name) ? "bg-indigo-500/10 border-indigo-500" : "bg-slate-900 border-white/5")} onClick={() => setSelectedProducts(prev => prev.includes(p.name) ? prev.filter(x => x !== p.name) : [...prev, p.name])}>
                                                    <span className="font-black  uppercase text-xs">{p.name}</span>
                                                    {selectedProducts.includes(p.name) ? <CheckCircle2 className="w-5 h-5 text-indigo-400" /> : <div className="w-5 h-5 rounded-full border-2 border-white/5" />}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-5">
                                        <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Material de Apoyo Científico</Label>
                                        <div className="space-y-3">
                                            {materials.map(m => (
                                                <div key={m.id} className={cn("p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between", selectedMaterials.includes(m.name) ? "bg-amber-500/10 border-amber-500" : "bg-slate-900 border-white/5")} onClick={() => setSelectedMaterials(prev => prev.includes(m.name) ? prev.filter(x => x !== m.name) : [...prev, m.name])}>
                                                    <span className="font-black  uppercase text-xs">{m.name}</span>
                                                    <div className={cn("w-3 h-3 rounded-full", selectedMaterials.includes(m.name) ? "bg-amber-500" : "border border-white/20")} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : visitType === 'hospital' ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                    <div className="space-y-5">
                                        <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Prioridad Institucional</Label>
                                        <div className="space-y-3">
                                            {[
                                                { label: 'Reposición Banco de Muestras', icon: Package2 },
                                                { label: 'Charlas de Presentación', icon: GraduationCap },
                                                { label: 'Actividades Académicas', icon: Sparkles },
                                                { label: 'Auditoría Institucional', icon: ClipboardCheck }
                                            ].map(p => (
                                                <div key={p.label} className={cn("p-6 rounded-3xl border transition-all cursor-pointer flex items-center justify-between", institutionalPriorities.includes(p.label) ? "bg-indigo-500/10 border-indigo-500" : "bg-slate-900 border-white/5")} onClick={() => setInstitutionalPriorities(prev => prev.includes(p.label) ? prev.filter(x => x !== p.label) : [...prev, p.label])}>
                                                    <div className="flex items-center gap-4">
                                                        <p.icon className={cn("w-5 h-5", institutionalPriorities.includes(p.label) ? "text-indigo-400" : "text-slate-600")} />
                                                        <span className="font-black  uppercase text-xs">{p.label}</span>
                                                    </div>
                                                    {institutionalPriorities.includes(p.label) ? <CheckCircle2 className="w-6 h-6 text-indigo-400" /> : <div className="w-6 h-6 rounded-full border-2 border-white/5" />}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="p-8 bg-indigo-500/5 rounded-[2rem] border border-indigo-500/10 flex flex-col justify-center">
                                        <h4 className="text-sm font-black text-white  uppercase tracking-tighter mb-4">Misión Hospitalaria CA</h4>
                                        <p className="text-xs text-slate-500 font-bold leading-relaxed uppercase tracking-widest">Asegure el suministro centralizado y la formación científica continua en la sede para maximizar la penetración institucional.</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                    <div className="space-y-5">
                                        <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Prioridades de Auditoría Táctica</Label>
                                        <div className="space-y-3">
                                            {['Rotación & Stock', 'Exhibición POP', 'Radar de Competencia', 'Capacitación a Dependientes', 'Venta Directa'].map(p => (
                                                <div key={p} className={cn("p-6 rounded-3xl border transition-all cursor-pointer flex items-center justify-between", auditPriorities.includes(p) ? "bg-emerald-500/10 border-emerald-500" : "bg-slate-900 border-white/5")} onClick={() => setAuditPriorities(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])}>
                                                    <div className="flex items-center gap-4">
                                                        <div className={cn("w-2 h-2 rounded-full", auditPriorities.includes(p) ? "bg-emerald-400" : "bg-slate-700")} />
                                                        <span className="font-black  uppercase text-xs text-white">{p}</span>
                                                    </div>
                                                    {auditPriorities.includes(p) ? <CheckCircle2 className="w-6 h-6 text-emerald-400" /> : <div className="w-6 h-6 rounded-full border-2 border-white/5" />}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <Card className="bg-slate-900 border-white/5 rounded-[2.5rem] border-dashed flex flex-col justify-center items-center p-10 text-center space-y-6">
                                        <div className="p-8 bg-emerald-500/10 rounded-full">
                                            <Target className="w-12 h-12 text-emerald-500 animate-pulse" />
                                        </div>
                                        <div>
                                            <h4 className="font-black uppercase text-white text-lg mb-3 tracking-tighter">Misión de Ejecución Maestría</h4>
                                            <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest leading-relaxed">Se activará automáticamente el panel de Sell-Out en el reporte final para cuantificar el impacto comercial de esta misión.</p>
                                        </div>
                                    </Card>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 5: Confirmar */}
                    {currentStep === 5 && (
                        <div className="space-y-8 animate-in zoom-in-95 duration-700">
                            <div className="bg-white text-slate-950 p-12 rounded-[3.5rem] shadow-3xl text-center space-y-8 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-2 bg-primary" />
                                <div className="flex flex-col items-center gap-6">
                                    <div className="w-24 h-24 rounded-full bg-slate-950 flex items-center justify-center text-white"><CheckCircle2 className="w-12 h-12 text-primary" /></div>
                                    <div>
                                        <h3 className="text-3xl font-black uppercase  tracking-tighter">¿Sincronizar Misión?</h3>
                                        <p className="text-slate-600 text-xs font-black uppercase tracking-[0.2em] mt-3">{selectedContact?.name} | {scheduledDate}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 pt-6">
                                    <div className="p-6 bg-slate-50 rounded-3xl text-left">
                                        <p className="text-[10px] font-black uppercase text-slate-400 mb-2 ">Canal Operativo</p>
                                        <p className="font-black uppercase  text-sm">{visitType}</p>
                                    </div>
                                    <div className="p-6 bg-slate-50 rounded-3xl text-left">
                                        <p className="text-[10px] font-black uppercase text-slate-400 mb-2 ">Objetivo Maestro</p>
                                        <p className="font-black uppercase  text-sm truncate">{objective}</p>
                                    </div>
                                </div>
                                <div className="p-6 bg-slate-900 rounded-3xl text-left border border-white/5 mt-4">
                                    <p className="text-[10px] font-black uppercase text-slate-500 mb-4 ">Estrategia de Ejecución</p>
                                    <div className="flex flex-wrap gap-2">
                                        {[
                                            ...(visitType === 'doctor' ? selectedProducts : []),
                                            ...(visitType === 'doctor' ? selectedMaterials : []),
                                            ...(visitType === 'hospital' ? institutionalPriorities : []),
                                            ...auditPriorities
                                        ].map(item => (
                                            <Badge key={item} className="bg-white/10 text-white border-none px-4 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest ">{item}</Badge>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="bg-slate-900 border-t border-white/5 px-10 py-8 flex items-center justify-between gap-6">
                    <Button variant="ghost" onClick={handleBack} disabled={currentStep === 1} className="h-14 px-8 font-black uppercase text-slate-500 hover:text-white rounded-2xl text-[10px] tracking-widest gap-3 "><ChevronLeft className="w-4 h-4" /> REGRESAR</Button>
                    <Button onClick={handleNext} disabled={loading} className="h-16 px-16 bg-white text-slate-950 rounded-[1.5rem] font-black uppercase  text-xs tracking-widest hover:scale-105 active:scale-95 transition-all shadow-3xl">
                        {loading ? <Sparkles className="animate-spin w-5 h-5 mr-3" /> : currentStep === 5 ? 'SINCRONIZAR MISIÓN MAESTRA' : 'CONTINUAR'}
                        {currentStep < 5 && <ChevronRight className="ml-3 w-5 h-5" />}
                    </Button>
                </div>

                {/* Sub-Dialogs for Quick Create (Trigger-less) */}
                <DoctorFormDialog 
                    open={showDoctorDialog} 
                    onOpenChange={setShowDoctorDialog}
                    formData={doctorFormData}
                    setFormData={setDoctorFormData}
                    showTrigger={false}
                    onSubmit={async () => {
                        try {
                            const { data, error } = await supabase.from('doctors').insert([{
                                ...doctorFormData,
                                organization_id: profile?.organization_id,
                                user_id: user?.id
                            }]).select().single();
                            if (error) throw error;
                            toast({ title: "Médico registrado exitosamente" });
                            await loadContacts();
                            setContactId(data.id);
                            setShowDoctorDialog(false);
                        } catch (e: any) {
                            toast({ title: "Error al crear médico", description: e.message, variant: "destructive" });
                        }
                    }}
                />

                <PharmacyFormDialog 
                    open={showPharmacyDialog} 
                    onOpenChange={setShowPharmacyDialog}
                    formData={pharmacyFormData}
                    setFormData={setPharmacyFormData}
                    showTrigger={false}
                    onSubmit={async () => {
                        try {
                            const { data, error } = await supabase.from('pharmacies').insert([{
                                ...pharmacyFormData,
                                organization_id: profile?.organization_id,
                                user_id: user?.id
                            }]).select().single();
                            if (error) throw error;
                            toast({ title: "Farmacia registrada exitosamente" });
                            await loadContacts();
                            setContactId(data.id);
                            setShowPharmacyDialog(false);
                        } catch (e: any) {
                            toast({ title: "Error al crear farmacia", description: e.message, variant: "destructive" });
                        }
                    }}
                />

            </DialogContent>
        </Dialog>
    );
}
