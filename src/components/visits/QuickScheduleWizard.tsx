import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { WizardProgress } from '@/components/common/WizardProgress';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { ChevronLeft, ChevronRight, Calendar, Leaf as LeafIcon, Truck, Plus, ShoppingCart, Building2, Target, CheckCircle2, Package, Sparkles, GraduationCap, Package2, ClipboardCheck, LayoutGrid, Search, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { EliteButton, EliteCard, EliteInput } from '@/components/layout/DesignSystem';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandList,
    CommandItem,
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
import { useOrganization } from '@/hooks/useOrganization';

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
    const { organizationId } = useOrganization();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const demoData = useDemoData();

    // Form Data
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
    const [doctorFormData, setDoctorFormData] = useState({ name: '', specialty_id: '', potential: 'Medio', status: 'Activo' });
    const [pharmacyFormData, setPharmacyFormData] = useState({ name: '', rif: '', address: '', type: 'FARMACIA' });

    useEffect(() => {
        if (open) {
            loadContacts();
            loadResources();
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            setScheduledDate(tomorrow.toISOString().split('T')[0]);

            if (visitData) {
                setVisitType(visitData.visitType);
                setContactId(visitData.contactId);
                setCurrentStep(2);
            } else {
                setCurrentStep(1);
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
            const { data: contactsData } = await supabase.from('unified_contacts').select('id, name, specialty, address, contact_type').order('name');
            setContacts(contactsData || []);
        } catch (e) { console.error('Error loading contacts:', e); }
    };

    const loadResources = async () => {
        try {
            const { data: productsData } = await supabase.from('products').select('id, name').eq('organization_id', organizationId).order('name');
            setProducts(productsData || []);
            setMaterials([{ id: '1', name: 'Flyers Citrato vs Carbonato' }, { id: '2', name: 'Muestras Médicas Calzinc D' }, { id: '3', name: 'Díptico' }, { id: '4', name: 'Habladores de Anaquel' }]);
        } catch (e) { console.error(e); }
    };

    const handleBack = () => { if (currentStep > 1) setCurrentStep(currentStep - 1); };

    const handleNext = () => {
        if (currentStep === 1 && !contactId) return toast({ title: 'Selecciona una entidad de César Ascanio CA' });
        if (currentStep === 2 && !scheduledDate) return toast({ title: 'Sincroniza la fecha de visita' });
        if (currentStep === 3 && !objective) return toast({ title: 'Define el Objetivo SMART' });
        if (currentStep < 5) setCurrentStep(currentStep + 1);
        else handleSubmit();
    };

    const handleSubmit = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
            const fullObjective = `OBJETIVO: ${objective}\nESTRATEGIA: ${[...institutionalPriorities, ...auditPriorities].join(', ')}`.trim();

            if (demoData) {
                const tempId = `demo-visit-${Date.now()}`;
                const newVisit = { id: tempId, contact_id: contactId, scheduled_date: scheduledDateTime.toISOString(), visit_type: visitType, objective: fullObjective, products_presented: selectedProducts, promotional_materials: selectedMaterials.join(', '), status: 'scheduled', unified_contacts: { name: selectedContact?.name || 'Entidad Demo', specialty: selectedContact?.specialty || visitType, address: selectedContact?.address || 'Dirección de prueba' } };
                if (!demoData.visits) demoData.visits = [];
                demoData.visits.unshift(newVisit);
                toast({ title: '✅ Visita Programada (Entorno Demo)' });
                onOpenChange(false); onSuccess?.(); return;
            }

            const { error } = await supabase.from('visits').insert([{ user_id: user.id, organization_id: organizationId, contact_id: contactId, scheduled_date: scheduledDateTime.toISOString(), visit_type: visitType, objective: fullObjective, products_presented: selectedProducts, promotional_materials: selectedMaterials.join(', '), status: 'scheduled' }]);
            if (error) throw error;
            toast({ title: '✅ Visita Programada con Éxito' });
            onOpenChange(false); onSuccess?.();
        } catch (error: any) { toast({ title: 'Error Táctico', description: error.message, variant: 'destructive' }); }
        finally { setLoading(false); }
    };

    const selectedContact = contacts.find((c) => c.id === contactId);
    const filteredContacts = contacts.filter((c) => c.contact_type === visitType);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-5xl p-0 overflow-hidden border-none rounded-[2.5rem] shadow-premium-2xl bg-card font-display max-h-[90vh] flex flex-col text-foreground">
                <div className="bg-muted/5 px-10 py-8 border-b border-border/40 relative">
                    <div className="flex items-center gap-6 relative z-10">
                        <div className="w-16 h-16 rounded-2xl bg-primary text-white flex items-center justify-center shadow-premium-md border border-primary/20">
                            <Calendar className="h-8 w-8" />
                        </div>
                        <div>
                            <DialogTitle className="text-2xl font-black uppercase tracking-tighter leading-none font-display text-foreground">Planificación de Misión Elite</DialogTitle>
                            <p className="text-muted-foreground text-elite-xs font-black uppercase tracking-[0.4em] mt-2 opacity-60">Planificador Táctico César Ascanio Intelligence Hub</p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 px-10 py-10 space-y-12 bg-card overflow-y-auto custom-scrollbar min-h-0">
                    <WizardProgress currentStep={currentStep} totalSteps={5} steps={WIZARD_STEPS} />

                    {currentStep === 1 && (
                        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
                            <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                                {[
                                    { id: 'doctor', icon: UserRound, label: 'Médico' },
                                    { id: 'hospital', icon: Building2, label: 'Centro' },
                                    { id: 'pharmacy', icon: Store, label: 'Farmacia' },
                                    { id: 'natural_store', icon: LeafIcon, label: 'Naturista' },
                                    { id: 'commerce', icon: ShoppingCart, label: 'Comercio' },
                                    { id: 'drugstore', icon: Truck, label: 'Droguería' }
                                ].map((type) => (
                                    <EliteButton
                                        key={type.id}
                                        variant={visitType === type.id ? "secondary" : "ghost"}
                                        className={cn("h-28 flex-col gap-3 rounded-[1.5rem] border border-border/40 transition-all duration-500", visitType === type.id && "bg-primary/10 border-primary/40 text-primary shadow-inner scale-105")}
                                        onClick={() => { setVisitType(type.id as any); setContactId(''); }}
                                    >
                                        <type.icon className={cn("h-6 w-6", visitType === type.id ? "text-primary" : "text-muted-foreground opacity-60")} />
                                        <span className="font-black text-elite-xs uppercase tracking-widest">{type.label}</span>
                                    </EliteButton>
                                ))}
                            </div>

                            <div className="space-y-4">
                                <Label className="text-elite-xs font-black uppercase text-muted-foreground/60 ml-1">Seleccionar Objetivo Dinámico</Label>
                                <Popover open={openContactSelector} onOpenChange={setOpenContactSelector}>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="h-16 w-full justify-between bg-muted/5 border-border/40 rounded-2xl px-8 font-black text-foreground uppercase tracking-widest text-lg shadow-inner hover:bg-muted/10">
                                            {selectedContact ? selectedContact.name : `BUSCAR ${visitType.toUpperCase()} EN EL DIRECTORIO...`}
                                            <ChevronsUpDown className="ml-2 h-5 w-5 opacity-40 shrink-0" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-card border-border/40 rounded-2xl shadow-3xl overflow-hidden mt-2">
                                        <Command className="bg-card">
                                            <CommandInput placeholder="FILTRAR DIRECTORIO..." className="h-16 font-black uppercase text-foreground tracking-widest" />
                                            <CommandList className="max-h-64 custom-scrollbar">
                                                <CommandEmpty className="py-10 text-center flex flex-col items-center gap-4">
                                                    <p className="text-elite-xs font-black text-muted-foreground uppercase tracking-widest opacity-60">Sin resultados en el directorio activo</p>
                                                    <EliteButton variant="ghost" className="h-12 border border-border/40" icon={Plus} onClick={() => { if (visitType === 'doctor') setShowDoctorDialog(true); else if (visitType === 'pharmacy') setShowPharmacyDialog(true); setOpenContactSelector(false); }}>CREAR {visitType.toUpperCase()} DIGITAL</EliteButton>
                                                </CommandEmpty>
                                                <CommandGroup>
                                                    {filteredContacts.map((contact) => (
                                                        <CommandItem key={contact.id} onSelect={() => { setContactId(contact.id); setOpenContactSelector(false); }} className="py-5 px-8 hover:bg-muted/5 border-b border-border/10 cursor-pointer transition-colors">
                                                            <div className="flex flex-col group"><span className="text-sm font-black uppercase text-foreground group-hover:text-primary transition-colors">{contact.name}</span><span className="text-elite-xs text-muted-foreground font-black uppercase tracking-widest mt-1.5 opacity-60">{contact.specialty} | {contact.address}</span></div>
                                                        </CommandItem>
                                                    ))}
                                                    <CommandItem onSelect={() => { if (visitType === 'doctor') setShowDoctorDialog(true); else if (visitType === 'pharmacy') setShowPharmacyDialog(true); setOpenContactSelector(false); }} className="py-6 px-8 bg-primary/5 hover:bg-primary/10 cursor-pointer transition-colors">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center shadow-inner"><UserPlus className="w-5 h-5 text-primary" /></div>
                                                            <span className="text-elite-xs font-black uppercase text-primary tracking-widest">Registrar Nuevo {visitType.toUpperCase()}</span>
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

                    {currentStep === 2 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-in fade-in slide-in-from-right-6 duration-700">
                            <div className="space-y-4">
                                <Label className="text-elite-xs font-black uppercase text-muted-foreground/60 ml-1">Fecha de la Visita</Label>
                                <Input type="date" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} className="h-16 bg-muted/5 border-border/40 rounded-2xl font-black text-foreground uppercase px-8 text-xl shadow-inner focus:bg-card transition-all" />
                            </div>
                            <div className="space-y-4">
                                <Label className="text-elite-xs font-black uppercase text-muted-foreground/60 ml-1">Horario Programado</Label>
                                <Input type="time" value={scheduledTime} onChange={(e) => setScheduledTime(e.target.value)} className="h-16 bg-muted/5 border-border/40 rounded-2xl font-black text-foreground text-center text-xl shadow-inner focus:bg-card transition-all" />
                            </div>
                        </div>
                    )}

                    {currentStep === 3 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-6 duration-700">
                            <Label className="text-elite-xs font-black uppercase text-muted-foreground/60 ml-1">Definición de Objetivo (Planificación Ejecutiva)</Label>
                            <Textarea value={objective} onChange={(e) => setObjective(e.target.value)} placeholder="REDACTE EL OBJETIVO SMART DE LA VISITA..." rows={6} className="bg-muted/5 border-border/40 rounded-[2.5rem] text-foreground font-black uppercase p-10 px-10 text-lg shadow-inner focus:bg-card transition-all" />
                        </div>
                    )}

                    {currentStep === 4 && (
                        <div className="space-y-10 animate-in fade-in scale-95 duration-700">
                            <div className="flex items-center gap-4">
                                <div className={cn("w-2 h-8 rounded-full", visitType === 'doctor' ? "bg-primary" : "bg-emerald-500")} />
                                <h3 className="text-xl font-black uppercase tracking-tighter text-foreground font-display">Estrategia de Ejecución: {visitType.toUpperCase()}</h3>
                            </div>

                            {visitType === 'doctor' ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-5">
                                        <Label className="text-elite-xs font-black uppercase text-muted-foreground/60 ml-1">Foco de Portafolio</Label>
                                        <div className="space-y-3">
                                            {products.slice(0, 4).map(p => (
                                                <div key={p.id} className={cn("p-6 rounded-2xl border transition-all cursor-pointer flex items-center justify-between shadow-sm", selectedProducts.includes(p.name) ? "bg-primary/10 border-primary/40 text-primary" : "bg-muted/5 border-border/40")} onClick={() => setSelectedProducts(prev => prev.includes(p.name) ? prev.filter(x => x !== p.name) : [...prev, p.name])}>
                                                    <span className="font-black uppercase text-elite-xs tracking-widest">{p.name}</span>
                                                    {selectedProducts.includes(p.name) ? <CheckCircle2 className="w-5 h-5 text-primary" /> : <div className="w-5 h-5 rounded-full border border-border/40 bg-card" />}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-5">
                                        <Label className="text-elite-xs font-black uppercase text-muted-foreground/60 ml-1">Material de Apoyo Científico</Label>
                                        <div className="space-y-3">
                                            {materials.map(m => (
                                                <div key={m.id} className={cn("p-6 rounded-2xl border transition-all cursor-pointer flex items-center justify-between shadow-sm", selectedMaterials.includes(m.name) ? "bg-amber-500/10 border-amber-500/40 text-amber-500" : "bg-muted/5 border-border/40")} onClick={() => setSelectedMaterials(prev => prev.includes(m.name) ? prev.filter(x => x !== m.name) : [...prev, m.name])}>
                                                    <span className="font-black uppercase text-elite-xs tracking-widest">{m.name}</span>
                                                    <div className={cn("w-3 h-3 rounded-full", selectedMaterials.includes(m.name) ? "bg-amber-500 shadow-[0_0_8px_currentColor]" : "bg-card border border-border/40")} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : visitType === 'hospital' ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-5">
                                        <Label className="text-elite-xs font-black uppercase text-muted-foreground/60 ml-1">Prioridad Institucional</Label>
                                        <div className="space-y-3">
                                            {[
                                                { label: 'Reposición Banco de Muestras', icon: Package2 },
                                                { label: 'Charlas de Presentación', icon: GraduationCap },
                                                { label: 'Actividades Académicas', icon: Sparkles },
                                                { label: 'Auditoría Institucional', icon: ClipboardCheck }
                                            ].map(p => (
                                                <div key={p.label} className={cn("p-6 rounded-[1.5rem] border transition-all cursor-pointer flex items-center justify-between shadow-sm", institutionalPriorities.includes(p.label) ? "bg-primary/10 border-primary/40 text-primary" : "bg-muted/5 border-border/40")} onClick={() => setInstitutionalPriorities(prev => prev.includes(p.label) ? prev.filter(x => x !== p.label) : [...prev, p.label])}>
                                                    <div className="flex items-center gap-4">
                                                        <p.icon className={cn("w-5 h-5", institutionalPriorities.includes(p.label) ? "text-primary" : "text-muted-foreground opacity-60")} />
                                                        <span className="font-black uppercase text-elite-xs tracking-widest">{p.label}</span>
                                                    </div>
                                                    {institutionalPriorities.includes(p.label) ? <CheckCircle2 className="w-6 h-6 text-primary" /> : <div className="w-6 h-6 rounded-full border border-border/40 bg-card" />}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="p-10 bg-primary/5 rounded-[2.5rem] border border-primary/10 flex flex-col justify-center text-center shadow-inner">
                                        <Building2 className="w-12 h-12 text-primary mx-auto mb-6 opacity-40" />
                                        <h4 className="text-sm font-black text-foreground uppercase tracking-tighter mb-4 font-display">Visita Institucional Hospitalaria</h4>
                                        <p className="text-elite-xs text-muted-foreground font-black leading-relaxed uppercase tracking-widest opacity-60">Sincronice el suministro centralizado y la formación científica continua en la sede para maximizar la penetración clínica.</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                    <div className="space-y-5">
                                        <Label className="text-elite-xs font-black uppercase text-muted-foreground/60 ml-1">Prioridades de Auditoría Comercial</Label>
                                        <div className="space-y-3">
                                            {['Rotación & Stock', 'Exhibición POP', 'Radar de Competencia', 'Capacitación a Dependientes', 'Venta Directa'].map(p => (
                                                <div key={p} className={cn("p-6 rounded-[1.5rem] border transition-all cursor-pointer flex items-center justify-between shadow-sm", auditPriorities.includes(p) ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-500" : "bg-muted/5 border-border/40")} onClick={() => setAuditPriorities(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])}>
                                                    <div className="flex items-center gap-4">
                                                        <div className={cn("w-2 h-2 rounded-full", auditPriorities.includes(p) ? "bg-emerald-400 shadow-[0_0_8px_currentColor]" : "bg-muted-foreground/40")} />
                                                        <span className="font-black uppercase text-elite-xs text-foreground tracking-widest">{p}</span>
                                                    </div>
                                                    {auditPriorities.includes(p) ? <CheckCircle2 className="w-6 h-6 text-emerald-400" /> : <div className="w-6 h-6 rounded-full border border-border/40 bg-card" />}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <EliteCard className="border-dashed flex flex-col justify-center items-center p-12 text-center space-y-6">
                                        <div className="p-8 bg-emerald-500/10 rounded-full shadow-inner"><Target className="w-12 h-12 text-emerald-500 animate-pulse" /></div>
                                        <div>
                                            <h4 className="font-black uppercase text-foreground text-xl mb-3 tracking-tighter font-display">Plan de Ejecución Maestro</h4>
                                            <p className="text-muted-foreground text-elite-xs uppercase font-black tracking-widest leading-relaxed opacity-60">Se activará el panel de Sell-Out en el reporte final para cuantificar el impacto comercial de esta misión táctica.</p>
                                        </div>
                                    </EliteCard>
                                </div>
                            )}
                        </div>
                    )}

                    {currentStep === 5 && (
                        <div className="space-y-8 animate-in zoom-in-95 duration-700">
                            <EliteCard className="p-12 text-center space-y-10 relative overflow-hidden bg-muted/5 border-primary/20">
                                <div className="absolute top-0 left-0 w-full h-1.5 bg-primary/30" />
                                <div className="flex flex-col items-center gap-6">
                                    <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary shadow-inner border border-primary/20"><CheckCircle2 className="w-12 h-12" /></div>
                                    <div>
                                        <h3 className="text-3xl font-black uppercase tracking-tighter font-display text-foreground">¿Confirmar Sincronización?</h3>
                                        <p className="text-primary font-black text-elite-xs uppercase tracking-[0.2em] mt-3">{selectedContact?.name} | {scheduledDate}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-6 pt-6">
                                    <div className="p-8 bg-card rounded-[2rem] text-left border border-border/40 shadow-inner group transition-all hover:border-primary/20">
                                        <p className="text-elite-xs font-black uppercase text-muted-foreground/60 mb-3 tracking-widest">Canal de Gestión</p>
                                        <p className="font-black uppercase text-foreground text-sm tracking-tight">{visitType}</p>
                                    </div>
                                    <div className="p-8 bg-card rounded-[2rem] text-left border border-border/40 shadow-inner group transition-all hover:border-primary/20">
                                        <p className="text-elite-xs font-black uppercase text-muted-foreground/60 mb-3 tracking-widest">Objetivo Maestro</p>
                                        <p className="font-black uppercase text-foreground text-sm truncate tracking-tight">{objective}</p>
                                    </div>
                                </div>
                                <div className="p-8 bg-muted/5 rounded-[2.5rem] text-left border border-border/40 mt-4 shadow-inner">
                                    <p className="text-elite-xs font-black uppercase text-muted-foreground/40 mb-6 tracking-[0.4em] ml-1">Estrategia de Ejecución Activa</p>
                                    <div className="flex flex-wrap gap-3">
                                        {[...(visitType === 'doctor' ? selectedProducts : []), ...(visitType === 'doctor' ? selectedMaterials : []), ...(visitType === 'hospital' ? institutionalPriorities : []), ...auditPriorities].map(item => (
                                            <Badge key={item} className="bg-primary/10 text-primary border border-primary/20 px-5 py-2.5 rounded-xl font-black text-elite-xs uppercase tracking-widest shadow-sm">{item}</Badge>
                                        ))}
                                    </div>
                                </div>
                            </EliteCard>
                        </div>
                    )}
                </div>

                <div className="bg-muted/5 border-t border-border/40 px-10 py-8 flex items-center justify-between gap-6 shrink-0 z-20 relative">
                    <Button variant="ghost" onClick={handleBack} disabled={currentStep === 1} className="h-14 px-10 font-black uppercase text-muted-foreground hover:text-foreground hover:bg-muted/10 rounded-2xl text-elite-xs tracking-widest gap-3 transition-all"><ChevronLeft className="w-4 h-4" /> REGRESAR</Button>
                    <EliteButton onClick={handleNext} disabled={loading} className="h-16 px-16 min-w-[280px] shadow-premium-lg" icon={loading ? Loader2 : (currentStep === 5 ? CheckCircle2 : ChevronRight)}>
                        {loading ? 'SINCRONIZANDO...' : (currentStep === 5 ? 'PLANIFICAR MISIÓN' : 'CONTINUAR DESPLIEGUE')}
                    </EliteButton>
                </div>

                <DoctorFormDialog open={showDoctorDialog} onOpenChange={setShowDoctorDialog} formData={doctorFormData} setFormData={setDoctorFormData} showTrigger={false} onSubmit={async () => { try { const { data, error } = await supabase.from('doctors').insert([{ ...doctorFormData, organization_id: organizationId, user_id: user?.id }]).select().single(); if (error) throw error; toast({ title: "Médico registrado exitosamente" }); await loadContacts(); setContactId(data.id); setShowDoctorDialog(false); } catch (e: any) { toast({ title: "Error al crear médico", description: e.message, variant: "destructive" }); } }} />
                <PharmacyFormDialog open={showPharmacyDialog} onOpenChange={setShowPharmacyDialog} formData={pharmacyFormData} setFormData={setPharmacyFormData} showTrigger={false} onSubmit={async () => { try { const { data, error } = await supabase.from('pharmacies').insert([{ ...pharmacyFormData, organization_id: organizationId, user_id: user?.id }]).select().single(); if (error) throw error; toast({ title: "Farmacia registrada exitosamente" }); await loadContacts(); setContactId(data.id); setShowPharmacyDialog(false); } catch (e: any) { toast({ title: "Error al crear farmacia", description: e.message, variant: "destructive" }); } }} />
            </DialogContent>
        </Dialog>
    );
}
