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
import { Check, ChevronsUpDown, UserRound, Store } from 'lucide-react';
import { useDemoData } from '@/contexts/MockDataProvider';

interface QuickScheduleWizardProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

const WIZARD_STEPS = [
    { label: '¿Quién?', icon: '👤' },
    { label: '¿Cuándo?', icon: '📅' },
    { label: '¿Qué?', icon: '📦' },
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
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Agendar Visita Rápida
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    <WizardProgress currentStep={currentStep} totalSteps={3} steps={WIZARD_STEPS} />

                    {/* Step 1 */}
                    {currentStep === 1 && (
                        <Card>
                            <CardContent className="pt-6 space-y-4">
                                <div className="space-y-2">
                                    <Label>Tipo de Visita</Label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <Button
                                            type="button"
                                            variant={visitType === 'doctor' ? 'default' : 'outline'}
                                            className={cn(
                                                "h-24 flex-col gap-2 transition-all border-2",
                                                visitType === 'doctor' ? "border-primary bg-primary/5 text-primary" : "border-slate-100"
                                            )}
                                            onClick={() => {
                                                setVisitType('doctor');
                                                setContactId('');
                                            }}
                                        >
                                            <div className={cn("p-2 rounded-lg", visitType === 'doctor' ? "bg-primary text-white" : "bg-slate-100 text-slate-500")}>
                                                <UserRound className="h-6 w-6" />
                                            </div>
                                            <span className="font-bold text-xs uppercase tracking-tight">Médico</span>
                                        </Button>

                                        <Button
                                            type="button"
                                            variant={visitType === 'pharmacy' ? 'default' : 'outline'}
                                            className={cn(
                                                "h-24 flex-col gap-2 transition-all border-2",
                                                visitType === 'pharmacy' ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-slate-100"
                                            )}
                                            onClick={() => {
                                                setVisitType('pharmacy');
                                                setContactId('');
                                            }}
                                        >
                                            <div className={cn("p-2 rounded-lg", visitType === 'pharmacy' ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-500")}>
                                                <Store className="h-6 w-6" />
                                            </div>
                                            <span className="font-bold text-xs uppercase tracking-tight">Farmacia</span>
                                        </Button>

                                        <Button
                                            type="button"
                                            variant={visitType === 'natural_store' ? 'default' : 'outline'}
                                            className={cn(
                                                "h-24 flex-col gap-2 transition-all border-2",
                                                visitType === 'natural_store' ? "border-green-500 bg-green-50 text-green-700" : "border-slate-100"
                                            )}
                                            onClick={() => {
                                                setVisitType('natural_store');
                                                setContactId('');
                                            }}
                                        >
                                            <div className={cn("p-2 rounded-lg", visitType === 'natural_store' ? "bg-green-500 text-white" : "bg-slate-100 text-slate-500")}>
                                                <LeafIcon className="h-6 w-6" />
                                            </div>
                                            <span className="font-bold text-xs uppercase tracking-tight">T. Naturista</span>
                                        </Button>

                                        <Button
                                            type="button"
                                            variant={visitType === 'drugstore' ? 'default' : 'outline'}
                                            className={cn(
                                                "h-24 flex-col gap-2 transition-all border-2",
                                                visitType === 'drugstore' ? "border-purple-500 bg-purple-50 text-purple-700" : "border-slate-100"
                                            )}
                                            onClick={() => {
                                                setVisitType('drugstore');
                                                setContactId('');
                                            }}
                                        >
                                            <div className={cn("p-2 rounded-lg", visitType === 'drugstore' ? "bg-purple-500 text-white" : "bg-slate-100 text-slate-500")}>
                                                <Truck className="h-6 w-6" />
                                            </div>
                                            <span className="font-bold text-xs uppercase tracking-tight">Droguería</span>
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>
                                        {visitType === 'doctor' ? 'Médico' :
                                            visitType === 'pharmacy' ? 'Farmacia' :
                                                visitType === 'natural_store' ? 'Tienda Naturista' : 'Droguería'}
                                    </Label>
                                    <Popover open={openContactSelector} onOpenChange={setOpenContactSelector}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                className="w-full justify-between h-auto min-h-[48px]"
                                            >
                                                {selectedContact ? (
                                                    <div className="flex flex-col items-start">
                                                        <span className="font-semibold">{selectedContact.name}</span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {selectedContact.specialty || 'Sin especialidad'}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    'Seleccionar contacto...'
                                                )}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                            <Command>
                                                <CommandInput placeholder="Buscar..." />
                                                <CommandList>
                                                    <CommandEmpty>No se encontraron contactos.</CommandEmpty>
                                                    <CommandGroup>
                                                        {filteredContacts.map((contact) => (
                                                            <CommandItem
                                                                key={contact.id}
                                                                value={contact.name}
                                                                onSelect={() => {
                                                                    setContactId(contact.id);
                                                                    setOpenContactSelector(false);
                                                                }}
                                                            >
                                                                <Check
                                                                    className={cn(
                                                                        'mr-2 h-4 w-4',
                                                                        contactId === contact.id ? 'opacity-100' : 'opacity-0'
                                                                    )}
                                                                />
                                                                <div>
                                                                    <div className="font-medium">{contact.name}</div>
                                                                    <div className="text-xs text-muted-foreground">
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
                    )}

                    {/* Step 2 */}
                    {currentStep === 2 && (
                        <Card>
                            <CardContent className="pt-6 space-y-4">
                                <div className="space-y-2">
                                    <Label>Fecha</Label>
                                    <Input
                                        type="date"
                                        value={scheduledDate}
                                        onChange={(e) => setScheduledDate(e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Hora</Label>
                                    <Input
                                        type="time"
                                        value={scheduledTime}
                                        onChange={(e) => setScheduledTime(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Objetivo (Opcional)</Label>
                                    <Textarea
                                        value={objective}
                                        onChange={(e) => setObjective(e.target.value)}
                                        placeholder="Ej: Presentar nuevo producto..."
                                        rows={3}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Step 3 */}
                    {currentStep === 3 && (
                        <Card>
                            <CardContent className="pt-6 space-y-4">
                                {selectedContact?.specialty && (
                                    <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-md mb-2">
                                        <p className="text-sm text-blue-400 flex items-center gap-2">
                                            <span className="font-bold">Especialidad:</span> {selectedContact.specialty}
                                            <span className="text-xs opacity-70 ml-1">(Filtrando productos relevantes)</span>
                                        </p>
                                    </div>
                                )}

                                <div className="space-y-3">
                                    <Label>Productos a Presentar</Label>
                                    <Command className="border rounded-lg border-slate-200 bg-white shadow-sm">
                                        <CommandInput placeholder="Buscar productos..." className="h-9 border-none focus:ring-0" />
                                        <CommandList className="max-h-[300px] overflow-y-auto custom-scrollbar">
                                            <CommandEmpty>No se encontraron productos.</CommandEmpty>
                                            <CommandGroup>
                                                {products
                                                    .filter(p => {
                                                        // If no contact selected or non-doctor type, or generic specialty, show all
                                                        const isCommercial = visitType === 'pharmacy' || visitType === 'natural_store' || visitType === 'drugstore';
                                                        if (!selectedContact || isCommercial ||
                                                            !selectedContact.specialty ||
                                                            ['General', 'Medicina General', 'Familiar'].includes(selectedContact.specialty)) {
                                                            return true;
                                                        }

                                                        // Check exact match
                                                        const pSpecialties = (p as any).product_specialties?.map((s: any) => s.specialty) || [];
                                                        if (pSpecialties.length === 0) return true; // Show generics

                                                        return pSpecialties.some((s: string) =>
                                                            s.toLowerCase() === selectedContact.specialty!.toLowerCase()
                                                        );
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
                                                            className="cursor-pointer hover:bg-slate-50 aria-selected:bg-slate-100"
                                                        >
                                                            <div className={cn(
                                                                "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                                                selectedProducts.includes(product.id)
                                                                    ? "bg-primary text-primary-foreground"
                                                                    : "opacity-50 [&_svg]:invisible"
                                                            )}>
                                                                <Check className={cn("h-4 w-4")} />
                                                            </div>
                                                            <span>{product.name}</span>
                                                        </CommandItem>
                                                    ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>

                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {selectedProducts.map(id => {
                                            const prod = products.find(p => p.id === id);
                                            if (!prod) return null;
                                            return (
                                                <Badge key={id} variant="secondary" className="flex items-center gap-1 bg-slate-100 text-slate-900 hover:bg-slate-200 border border-slate-200">
                                                    {prod.name}
                                                    <button
                                                        onClick={() => setSelectedProducts(selectedProducts.filter(pid => pid !== id))}
                                                        className="ml-1 rounded-full p-0.5 hover:bg-slate-600"
                                                    >
                                                        <span className="sr-only">Remover</span>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                                                    </button>
                                                </Badge>
                                            )
                                        })}
                                        {selectedProducts.length === 0 && (
                                            <span className="text-xs text-muted-foreground italic">Ningún producto seleccionado</span>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Navigation */}
                    <div className="flex justify-between">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleBack}
                            disabled={currentStep === 1}
                        >
                            <ChevronLeft className="h-4 w-4 mr-2" />
                            Atrás
                        </Button>

                        <Button type="button" onClick={handleNext} disabled={loading}>
                            {currentStep === 3 ? (
                                loading ? 'Creando...' : 'Crear Visita'
                            ) : (
                                <>
                                    Siguiente
                                    <ChevronRight className="h-4 w-4 ml-2" />
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
