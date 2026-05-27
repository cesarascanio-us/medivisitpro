/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, AlertTriangle, CheckCircle, Calendar, MapPin } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useQuery } from "@tanstack/react-query";

const eventSchema = z.object({
    title: z.string().min(3, "El título es requerido"),
    event_type: z.string(),
    scheduled_date: z.string().min(1, "La fecha de inicio es requerida"),
    end_date: z.string().min(1, "La fecha de fin es requerida"),
    location: z.string().optional(),
    description: z.string().optional(),
    attendees_count: z.preprocess(
        (a) => parseInt(z.string().parse(String(a))),
        z.number().min(0)
    ),
    investment: z.preprocess(
        (a) => parseFloat(z.string().parse(String(a || 0))),
        z.number().min(0)
    ).optional(),
    per_diem: z.preprocess(
        (a) => parseFloat(z.string().parse(String(a || 0))),
        z.number().min(0)
    ).optional(),
    contact_id: z.string().uuid().optional(), // Optional, but can be passed to check_event_eligibility if it's a pharmacy
});

type EventFormValues = z.infer<typeof eventSchema>;

interface EventCreationWizardProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
    eventToEdit?: any | null;
}

export function EventCreationWizard({ open, onOpenChange, onSuccess, eventToEdit }: EventCreationWizardProps) {
    const [step, setStep] = useState(1);
    const [validating, setValidating] = useState(false);
    const [validationResult, setValidationResult] = useState<{ allowed: boolean; message: string } | null>(null);

    const form = useForm<EventFormValues>({
        resolver: zodResolver(eventSchema),
        defaultValues: {
            title: "",
            event_type: "presentation",
            scheduled_date: "",
            end_date: "",
            location: "",
            description: "",
            attendees_count: 0,
            investment: 0,
            per_diem: 0,
        },
    });

    useEffect(() => {
        if (open) {
            if (eventToEdit) {
                // Convert dates to proper format for datetime-local (YYYY-MM-DDThh:mm)
                const formatDateForInput = (dateString: string) => {
                    if (!dateString) return "";
                    const d = new Date(dateString);
                    // Need to offset timezone for local input, simple hack is to use slice on ISO string
                    return new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
                };

                form.reset({
                    title: eventToEdit.title || "",
                    event_type: eventToEdit.event_type || "presentation",
                    scheduled_date: formatDateForInput(eventToEdit.scheduled_date),
                    end_date: formatDateForInput(eventToEdit.end_date),
                    location: eventToEdit.location || "",
                    description: eventToEdit.description || "",
                    attendees_count: eventToEdit.attendees_count || 0,
                    investment: eventToEdit.investment || 0,
                    per_diem: eventToEdit.per_diem || 0,
                    contact_id: eventToEdit.contact_id || undefined,
                });
            } else {
                form.reset({
                    title: "",
                    event_type: "presentation",
                    scheduled_date: "",
                    end_date: "",
                    location: "",
                    description: "",
                    attendees_count: 0,
                    investment: 0,
                    per_diem: 0,
                });
            }
            setStep(1);
            setValidationResult(null);
        }
    }, [open, eventToEdit, form]);

    // Fetch all contacts (doctors, pharmacies, etc) for selection
    const { data: contacts } = useQuery({
        queryKey: ["unified-contacts-list"],
        queryFn: async () => {
            const { data } = await supabase.from("unified_contacts").select("id, name, specialty, source");
            return data || [];
        }
    });

    const checkEligibility = async () => {
        const { contact_id, event_type } = form.getValues();

        if (event_type !== 'jornada' || !contact_id) {
            // No strict check needed or no pharmacy selected (manual location)
            setValidationResult({ allowed: true, message: "Evento estándar." });
            return true;
        }

        setValidating(true);
        try {
            const { data, error } = await (supabase as any).rpc('check_event_eligibility', {
                p_pharmacy_id: contact_id,
                p_event_type: event_type
            });

            if (error) throw error;

            // RPC returns JSONB: { allowed: boolean, message: string }
            const result = data as { allowed: boolean; message: string };
            setValidationResult(result);
            return result.allowed;

        } catch (error: any) {
            console.error("Error checking eligibility:", error);
            toast.error("Error validando evento");
            return false;
        } finally {
            setValidating(false);
        }
    };

    const handleNext = async () => {
        if (step === 1) {
            const valid = await form.trigger(["title", "event_type", "scheduled_date", "end_date"]);
            if (valid) setStep(2);
        } else if (step === 2) {
            // Validate ROI before summary
            await checkEligibility();
            setStep(3);
        }
    };

    const handleBack = () => setStep(s => s - 1);

    const onSubmit = async (values: EventFormValues) => {
        if (validationResult && !validationResult.allowed) {
            toast.error("No se puede crear el evento: Restricción de ROI activa.");
            return;
        }

        try {
            const eventData = {
                title: values.title,
                description: values.description || null,
                event_type: values.event_type,
                location: values.location, // Could be pharmacy address logic if needed
                scheduled_date: values.scheduled_date,
                end_date: values.end_date,
                attendees_count: values.attendees_count,
                investment: values.investment || 0,
                per_diem: values.per_diem || 0,
                contact_id: values.contact_id || null,
            };

            if (eventToEdit) {
                const { error } = await supabase
                    .from('events')
                    .update(eventData)
                    .eq('id', eventToEdit.id);
                if (error) throw error;
                toast.success("Evento actualizado exitosamente");
            } else {
                const { error } = await supabase
                    .from('events')
                    .insert({
                        ...eventData,
                        user_id: (await supabase.auth.getUser()).data.user?.id,
                        status: 'scheduled',
                    });
                if (error) throw error;
                toast.success("Evento creado exitosamente");
            }

            onOpenChange(false);
            form.reset();
            setStep(1);
            setValidationResult(null);
            onSuccess();

        } catch (error: any) {
            toast.error("Error al crear evento");
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>
                        {step === 1 && "Paso 1: Detalles del Evento"}
                        {step === 2 && "Paso 2: Ubicación y Farmacia"}
                        {step === 3 && "Paso 3: Validación ROI"}
                    </DialogTitle>
                    <DialogDescription>
                        Configura tu evento estratégico.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">

                        {/* STEP 1: BASIC INFO */}
                        {step === 1 && (
                            <div className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Título del Evento</FormLabel>
                                            <FormControl><Input {...field} placeholder="Ej: Jornada de Salud..." /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="scheduled_date"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Fecha Inicio</FormLabel>
                                                <FormControl><Input type="datetime-local" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="end_date"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Fecha Fin</FormLabel>
                                                <FormControl><Input type="datetime-local" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="event_type"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Tipo</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="presentation">Presentación</SelectItem>
                                                        <SelectItem value="jornada">Jornada Médica (ROI Alert)</SelectItem>
                                                        <SelectItem value="training">Capacitación</SelectItem>
                                                        <SelectItem value="conference">Conferencia</SelectItem>
                                                        <SelectItem value="product_day">Día Producto</SelectItem>
                                                        <SelectItem value="anniversary">Aniversario</SelectItem>
                                                        <SelectItem value="inauguration">Inauguración</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Descripción</FormLabel>
                                            <FormControl><Textarea {...field} /></FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        )}

                        {/* STEP 2: LOCATION & PHARMACY */}
                        {step === 2 && (
                            <div className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="location"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Ubicación (Texto Libre)</FormLabel>
                                            <FormControl><Input {...field} placeholder="Salón de Eventos..." /></FormControl>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="contact_id"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Contacto Asociado (Opcional)</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Seleccionar médico o farmacia si aplica..." />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {contacts?.map(c => (
                                                        <SelectItem key={c.id} value={c.id}>
                                                            {c.name} {c.specialty ? `(${c.specialty})` : ''}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Requerido para validación de stock en Jornadas Médicas.
                                            </p>
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-3 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="attendees_count"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Asistentes</FormLabel>
                                                <FormControl><Input type="number" {...field} /></FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="investment"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Inversión ($)</FormLabel>
                                                <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="per_diem"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Viáticos ($)</FormLabel>
                                                <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        )}

                        {/* STEP 3: VALIDATION */}
                        {step === 3 && (
                            <div className="space-y-4">
                                {validating ? (
                                    <div className="flex flex-col items-center justify-center py-8">
                                        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                                        <p>Validando elegibilidad de inversión...</p>
                                    </div>
                                ) : (
                                    <>
                                        {validationResult?.allowed ? (
                                            <Alert className="bg-green-50 border-green-200">
                                                <CheckCircle className="h-4 w-4 text-green-600" />
                                                <AlertTitle className="text-green-800">Evento Aprobado</AlertTitle>
                                                <AlertDescription className="text-green-700">
                                                    {validationResult.message}
                                                    <div className="mt-2 text-xs">
                                                        ROI proyectado positivo. Puede proceder.
                                                    </div>
                                                </AlertDescription>
                                            </Alert>
                                        ) : (
                                            <Alert variant="destructive">
                                                <AlertTriangle className="h-4 w-4" />
                                                <AlertTitle>Bloqueo de Inversión (ROI)</AlertTitle>
                                                <AlertDescription>
                                                    {validationResult?.message || "Evento no permitido por reglas de negocio."}
                                                </AlertDescription>
                                            </Alert>
                                        )}

                                        <div className="bg-slate-50 p-4 rounded-md border text-sm space-y-2 text-slate-900">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Evento:</span>
                                                <span className="font-medium">{form.getValues("title")}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Tipo:</span>
                                                <span className="font-medium">{form.getValues("event_type")}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Fecha:</span>
                                                <span className="font-medium">{new Date(form.getValues("scheduled_date")).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        <DialogFooter className="flex justify-between sm:justify-between pt-4">
                            {step > 1 ? (
                                <Button type="button" variant="outline" onClick={handleBack}>Atrás</Button>
                            ) : (
                                <div></div> // Spacer
                            )}

                            {step < 3 ? (
                                <Button type="button" onClick={handleNext}>Siguiente</Button>
                            ) : (
                                <Button
                                    type="submit"
                                    className={!validationResult?.allowed ? "opacity-50 cursor-not-allowed" : ""}
                                    disabled={!validationResult?.allowed || validating}
                                >
                                    {eventToEdit ? "Confirmar y Actualizar" : "Confirmar y Crear"}
                                </Button>
                            )}
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
