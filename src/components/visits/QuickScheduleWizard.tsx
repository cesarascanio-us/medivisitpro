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
import { ChevronLeft, ChevronRight, Calendar, Leaf as LeafIcon, Truck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ResourcePillSelector } from '@/components/common/ResourcePillSelector';
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
import { Check, ChevronsUpDown, UserRound, Store, Target, X } from 'lucide-react';
import { useDemoData } from '@/contexts/MockDataProvider';

interface QuickScheduleWizardProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

const WIZARD_STEPS = [
    { label: 'Identidad', icon: '👤' },
    { label: 'Cronograma', icon: '📅' },
    { label: 'Estrategia', icon: '📦' },
];

export function QuickScheduleWizard({ open, onOpenChange, onSuccess }: QuickScheduleWizardProps) {
    const { user, profile } = useAuth();
    const { toast } = useToast();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Demo mode hook
    const demoData = useDemoData();

    // Form Data
    const [visitType, setVisitType] = useState<'doctor' | 'pharmacy' | 'natural_store' | 'drugstore'>('doctor');
    const [contactId, setContactId] = useState('');
    const [scheduledDate, setScheduledDate] = useState('');
    const [scheduledTime, setScheduledTime] = useState('10:00');
    const [objective, setObjective] = useState('');
    const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

    // Resources
    const [contacts, setContacts] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [openContactSelector, setOpenContactSelector] = useState(false);

    useEffect(() => {
        if (open) {
            loadContacts();
            loadResources();
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            setScheduledDate(tomorrow.toISOString().split('T')[0]);
        }
    }, [open]);

    const loadContacts = async () => {
        if (!user) return;

        // DEMO MODE: Use mock data if enabled
        if (demoData) {
            console.log("QuickScheduleWizard: Using mock demo data");
            const allContacts = [
                ...demoData.doctors.map((d: any) => ({ ...d, contact_type: 'doctor' })),
                ...demoData.pharmacies.map((p: any) => ({ ...p, contact_type: 'pharmacy', specialty: 'Farmacia' })),
            ];
            setContacts(allContacts);
            return;
        }

        try {
            // Query centralized contacts table to ensure Foreign Key integrity with 'visits' table
            const { data: contactsData, error } = await supabase
                .from('contacts')
                .select('id, name, specialty, address, contact_type')
                .eq('organization_id', profile?.organization_id)
                .order('name');

            if (error) throw error;

            // Ensure pharmacy contacts have 'Farmacia' specialty for UI logic if missing
            const processedContacts = (contactsData || []).map(contact => ({
                ...contact,
                specialty: (contact.contact_type === 'pharmacy' || contact.contact_type === 'natural_store' || contact.contact_type === 'drugstore') && !contact.specialty
                    ? contact.contact_type === 'pharmacy' ? 'Farmacia' : contact.contact_type === 'natural_store' ? 'Punto Natural' : 'Droguería/Logística'
                    : contact.specialty
            }));

            setContacts(processedContacts);
        } catch (error) {
            console.error('Error loading contacts:', error);
            toast({ title: 'Error', description: 'No se pudieron cargar los contactos', variant: 'destructive' });
        }
    };

    const loadResources = async () => {
        try {
            // Fetch products with their linked specialties
            const { data: productsData } = await supabase
                .from('products')
                .select(`
                    id, 
                    name,
                    product_specialties (
                        specialty
                    )
                `)
                .eq('organization_id', profile?.organization_id)
                .order('name');

            setProducts(productsData || []);
        } catch (error) {
            console.error('Error loading resources:', error);
        }
    };

    const handleNext = () => {
        if (currentStep === 1 && !contactId) {
            toast({ title: 'Selecciona un contacto', variant: 'destructive' });
            return;
        }
        if (currentStep === 2 && (!scheduledDate || !scheduledTime)) {
            toast({ title: 'Selecciona fecha y hora', variant: 'destructive' });
            return;
        }

        if (currentStep < 3) {
            setCurrentStep(currentStep + 1);
        } else {
            handleSubmit();
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSubmit = async () => {
        if (!user) return;
        setLoading(true);

        try {
            const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
            const visitPayload = {
                user_id: user.id,
                organization_id: profile?.organization_id,
                contact_id: contactId,
                scheduled_date: scheduledDateTime.toISOString(),
                visit_type: visitType,
                objective: objective || 'Presentación de productos',
                products_presented: selectedProducts,
                status: 'scheduled',
            };

            const { error } = await supabase.from('visits').insert([visitPayload]);

            if (error) throw error;

            toast({ title: '✅ Visita Agendada', description: 'La visita se creó exitosamente.' });
            onOpenChange(false);
            onSuccess?.();
            resetForm();
        } catch (error: any) {
            console.error('Error creating visit:', error);
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setCurrentStep(1);
        setVisitType('doctor');
        setContactId('');
        setScheduledDate('');
        setScheduledTime('10:00');
        setObjective('');
        setSelectedProducts([]);
    };

    const selectedContact = contacts.find((c) => c.id === contactId);
    const filteredContacts = contacts.filter((c) => c.contact_type === visitType);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl overflow-hidden p-0 rounded-3xl border-none shadow-2xl">
                <DialogHeader className="bg-slate-900 px-8 py-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                        <Calendar className="w-32 h-32" />
                    </div>
                    <div className="flex items-center gap-5 relative z-10">
                        <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10 shadow-inner">
                            <Calendar className="h-7 w-7 text-indigo-400" />
                        </div>
                        <div>
                            <DialogTitle className="text-2xl font-black tracking-tight uppercase leading-none">Agendar Visita Rápida</DialogTitle>
                            <p className="text-indigo-200/50 text-[10px] font-black uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                                Planificación Operativa en Tiempo Real
                            </p>
                        </div>
                    </div>
                </DialogHeader>

                <div className="px-8 py-8 space-y-8 bg-white">
                    <WizardProgress currentStep={currentStep} totalSteps={3} steps={WIZARD_STEPS} />

                    {/* Step 1: Identity */}
                    {currentStep === 1 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-6 bg-indigo-600 rounded-full" />
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Selección de Entidad Objetivo</h3>
                            </div>

                            <Card className="border-none shadow-none bg-indigo-50/30 p-8 rounded-[2rem]">
                                <CardContent className="p-0 space-y-8">
                                    <div className="space-y-4">
                                        <Label className="text-[10px] font-black uppercase text-slate-500 ml-1 tracking-widest">Ecosistema de Visita</Label>
                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                            {[
                                                { id: 'doctor', icon: UserRound, label: 'Médico', color: 'indigo' },
                                                { id: 'pharmacy', icon: Store, label: 'Farmacia', color: 'indigo' },
                                                { id: 'natural_store', icon: LeafIcon, label: 'Naturista', color: 'amber' },
                                                { id: 'drugstore', icon: Truck, label: 'Droguería', color: 'slate' }
                                            ].map((type) => (
                                                <Button
                                                    key={type.id}
                                                    type="button"
                                                    variant={visitType === type.id ? 'default' : 'outline'}
                                                    className={cn(
                                                        "h-28 flex-col gap-3 transition-all border-2 rounded-2xl p-4 group",
                                                        visitType === type.id
                                                            ? `border-indigo-600 bg-indigo-600 text-white shadow-lg shadow-indigo-100`
                                                            : "border-white bg-white hover:border-indigo-200 hover:bg-indigo-50/30 text-slate-600 shadow-sm"
                                                    )}
                                                    onClick={() => {
                                                        setVisitType(type.id as any);
                                                        setContactId('');
                                                    }}
                                                >
                                                    <div className={cn(
                                                        "p-3 rounded-xl transition-colors",
                                                        visitType === type.id ? "bg-white/20 text-white" : "bg-slate-50 text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600"
                                                    )}>
                                                        <type.icon className="h-6 w-6" />
                                                    </div>
                                                    <span className="font-black text-[10px] uppercase tracking-widest leading-none">{type.label}</span>
                                                </Button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase text-slate-500 ml-1 tracking-widest">
                                            {visitType === 'doctor' ? 'Médico Integrado' :
                                                visitType === 'pharmacy' ? 'Farmacia de Turno' :
                                                    visitType === 'natural_store' ? 'Punto de Venta Naturista' : 'Logística de Droguería'}
                                        </Label>
                                        <Popover open={openContactSelector} onOpenChange={setOpenContactSelector}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    className="w-full justify-between h-14 rounded-2xl border-white bg-white font-bold focus:ring-indigo-500/10 focus:border-indigo-500 shadow-sm transition-all hover:bg-slate-50"
                                                >
                                                    {selectedContact ? (
                                                        <div className="flex flex-col items-start">
                                                            <span className="font-bold text-slate-900">{selectedContact.name}</span>
                                                            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-black">
                                                                {selectedContact.specialty || 'Sin especialidad'}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-slate-400 font-medium">Seleccionar contacto del padrón...</span>
                                                    )}
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0 border-none shadow-2xl rounded-2xl overflow-hidden mt-2">
                                                <Command className="border-none">
                                                    <CommandInput placeholder="Filtrar por nombre o especialidad..." className="h-14 border-none focus:ring-0" />
                                                    <CommandList className="max-h-[300px] overflow-y-auto custom-scrollbar">
                                                        <CommandEmpty className="py-10 text-center">
                                                            <div className="flex flex-col items-center gap-3">
                                                                <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center">
                                                                    <UserRound className="h-6 w-6 text-slate-200" />
                                                                </div>
                                                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">No se encontraron registros</p>
                                                            </div>
                                                        </CommandEmpty>
                                                        <CommandGroup>
                                                            {filteredContacts.map((contact) => (
                                                                <CommandItem
                                                                    key={contact.id}
                                                                    value={contact.name}
                                                                    onSelect={() => {
                                                                        setContactId(contact.id);
                                                                        setOpenContactSelector(false);
                                                                    }}
                                                                    className="py-4 px-6 flex items-center gap-4 cursor-pointer hover:bg-indigo-50 transition-colors"
                                                                >
                                                                    <div className={cn(
                                                                        "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                                                                        contactId === contact.id ? "bg-indigo-600 border-indigo-600" : "border-slate-200"
                                                                    )}>
                                                                        {contactId === contact.id && <Check className="h-3 w-3 text-white" />}
                                                                    </div>
                                                                    <div>
                                                                        <div className="font-bold text-slate-900 leading-tight">{contact.name}</div>
                                                                        <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">
                                                                            {contact.specialty || 'Sin especialidad'}
                                                                        </div>
                                                                    </div>
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Step 2: Schedule */}
                    {currentStep === 2 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-6 bg-indigo-600 rounded-full" />
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Programación Cronológica</h3>
                            </div>

                            <Card className="border-none shadow-none bg-indigo-50/30 p-8 rounded-[2rem]">
                                <CardContent className="p-0 space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black uppercase text-slate-500 ml-1 tracking-widest">Fecha de Compromiso</Label>
                                            <Input
                                                type="date"
                                                value={scheduledDate}
                                                onChange={(e) => setScheduledDate(e.target.value)}
                                                min={new Date().toISOString().split('T')[0]}
                                                className="h-14 border-white bg-white rounded-2xl font-bold focus:ring-indigo-500/10 focus:border-indigo-500 shadow-sm"
                                            />
                                        </div>

                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black uppercase text-slate-500 ml-1 tracking-widest">Potencia Horaria</Label>
                                            <Input
                                                type="time"
                                                value={scheduledTime}
                                                onChange={(e) => setScheduledTime(e.target.value)}
                                                className="h-14 border-white bg-white rounded-2xl font-bold focus:ring-indigo-500/10 focus:border-indigo-500 shadow-sm text-center"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase text-slate-500 ml-1 tracking-widest">Objetivos Estratégicos del Encuentro</Label>
                                        <Textarea
                                            value={objective}
                                            onChange={(e) => setObjective(e.target.value)}
                                            placeholder="Detalle los puntos clave a tratar en esta visita..."
                                            rows={4}
                                            className="border-white bg-white rounded-2xl font-medium focus:ring-indigo-500/10 focus:border-indigo-500 shadow-sm p-5 resize-none"
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Step 3: Strategy */}
                    {currentStep === 3 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-6 bg-indigo-600 rounded-full" />
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Estrategia de Producto</h3>
                            </div>

                            <Card className="border-none shadow-none bg-indigo-50/30 p-8 rounded-[2rem]">
                                <CardContent className="p-0 space-y-8">
                                    {selectedContact?.specialty && (
                                        <div className="bg-white/80 backdrop-blur-sm border border-indigo-100 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
                                            <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-100">
                                                <Target className="h-6 w-6 text-white" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Focalización Inteligente</p>
                                                <p className="text-sm font-bold text-slate-900 mt-0.5">Especialidad: {selectedContact.specialty}</p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-4">
                                        <Label className="text-[10px] font-black uppercase text-slate-500 ml-1 tracking-widest">Selección de Portafolio</Label>
                                        <Command className="border border-white bg-white rounded-[1.5rem] shadow-sm overflow-hidden">
                                            <CommandInput placeholder="Buscar por nombre de producto..." className="h-14 border-none focus:ring-0" />
                                            <CommandList className="max-h-[260px] overflow-y-auto custom-scrollbar">
                                                <CommandEmpty className="py-10 text-center text-[10px] font-black uppercase text-slate-400 tracking-widest">No se encontraron productos coincidentes</CommandEmpty>
                                                <CommandGroup className="p-2">
                                                    {products
                                                        .filter(p => {
                                                            const isCommercial = visitType === 'pharmacy' || visitType === 'natural_store' || visitType === 'drugstore';
                                                            if (!selectedContact || isCommercial || !selectedContact.specialty || ['General', 'Medicina General', 'Familiar'].includes(selectedContact.specialty)) return true;
                                                            const pSpecialties = (p as any).product_specialties?.map((s: any) => s.specialty) || [];
                                                            if (pSpecialties.length === 0) return true;
                                                            return pSpecialties.some((s: string) => s.toLowerCase() === selectedContact.specialty!.toLowerCase());
                                                        })
                                                        .map((product) => (
                                                            <CommandItem
                                                                key={product.id}
                                                                value={product.name}
                                                                onSelect={() => {
                                                                    if (selectedProducts.includes(product.id)) {
                                                                        setSelectedProducts(selectedProducts.filter(id => id !== product.id));
                                                                    } else {
                                                                        setSelectedProducts([...selectedProducts, product.id]);
                                                                    }
                                                                }}
                                                                className="py-3 px-4 rounded-xl flex items-center gap-4 cursor-pointer hover:bg-slate-50 transition-colors"
                                                            >
                                                                <div className={cn(
                                                                    "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all shrink-0",
                                                                    selectedProducts.includes(product.id) ? "bg-indigo-600 border-indigo-600 shadow-md shadow-indigo-100" : "border-slate-200"
                                                                )}>
                                                                    {selectedProducts.includes(product.id) && <Check className="h-3 w-3 text-white" />}
                                                                </div>
                                                                <span className="font-bold text-slate-700">{product.name}</span>
                                                            </CommandItem>
                                                        ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>

                                        <div className="flex flex-wrap gap-2 mt-4">
                                            {selectedProducts.map(id => {
                                                const prod = products.find(p => p.id === id);
                                                if (!prod) return null;
                                                return (
                                                    <Badge key={id} variant="secondary" className="pl-4 pr-2 py-2 gap-2 bg-indigo-600 text-white border-none font-bold rounded-full shadow-lg shadow-indigo-100 animate-in zoom-in-50 duration-300">
                                                        {prod.name}
                                                        <button
                                                            onClick={() => setSelectedProducts(selectedProducts.filter(pid => pid !== id))}
                                                            className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/40 transition-colors"
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </Badge>
                                                )
                                            })}
                                            {selectedProducts.length === 0 && (
                                                <div className="w-full py-4 text-center border-2 border-dashed border-slate-200 rounded-2xl">
                                                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Ningún producto seleccionado para esta sesión</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Navigation Actions */}
                    <div className="flex justify-between items-center mt-10">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={handleBack}
                            disabled={currentStep === 1}
                            className="h-14 px-8 font-black uppercase tracking-widest text-[10px] text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-2xl transition-all"
                        >
                            <ChevronLeft className="h-4 w-4 mr-3" />
                            Previa
                        </Button>

                        <div className="flex gap-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                className="h-14 px-8 border-slate-200 text-slate-500 font-bold rounded-2xl hover:bg-slate-50 transition-all"
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="button"
                                onClick={handleNext}
                                disabled={loading}
                                className="h-14 px-12 bg-slate-900 hover:bg-indigo-600 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl shadow-slate-200 transition-all hover:scale-[1.02] active:scale-95"
                            >
                                {currentStep === 3 ? (
                                    loading ? 'Sincronizando...' : 'Confirmar Agenda'
                                ) : (
                                    <>
                                        Continuar
                                        <ChevronRight className="h-4 w-4 ml-3" />
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
