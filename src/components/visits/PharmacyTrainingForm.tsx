import { useState } from "react";
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
import { toast } from "sonner";
import { Loader2, Save, Users, Camera, GraduationCap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const trainingSchema = z.object({
    topics: z.string().min(3, "El tema es requerido"), // Comma separated for now
    attendees_count: z.preprocess(
        (a) => parseInt(z.string().parse(String(a))),
        z.number().min(1, "Debe haber al menos 1 asistente")
    ),
    evidence_photo_url: z.string().url("URL inválida").optional().or(z.literal("")),
    notes: z.string().optional(),
});

type TrainingFormValues = z.infer<typeof trainingSchema>;

interface PharmacyTrainingFormProps {
    visitId: string;
    pharmacyId: string;
    onSuccess?: () => void;
}

export function PharmacyTrainingForm({ visitId, pharmacyId, onSuccess }: PharmacyTrainingFormProps) {
    const [saving, setSaving] = useState(false);

    const form = useForm<TrainingFormValues>({
        resolver: zodResolver(trainingSchema),
        defaultValues: {
            topics: "",
            attendees_count: 1,
            evidence_photo_url: "",
            notes: "",
        },
    });

    const onSubmit = async (values: TrainingFormValues) => {
        try {
            setSaving(true);

            const record = {
                visit_id: visitId,
                pharmacy_id: pharmacyId,
                topics: values.topics.split(',').map(t => t.trim()).filter(Boolean),
                attendees_count: values.attendees_count,
                evidence_photo_url: values.evidence_photo_url || null,
                created_by: (await supabase.auth.getUser()).data.user?.id
            };

            const { error } = await (supabase as any)
                .from("pharmacy_trainings")
                .insert([record]);

            if (error) throw error;

            toast.success("Capacitación registrada correctamente");
            form.reset();
            if (onSuccess) onSuccess();

        } catch (error: any) {
            console.error("Error saving training:", error);
            toast.error("Error al guardar capacitación: " + error.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-purple-600" />
                    Registro de Capacitación
                </CardTitle>
                <CardDescription>
                    Registra los detalles de la capacitación impartida al personal de farmacia.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                        <FormField
                            control={form.control}
                            name="topics"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Temas Tratados</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="Ej: Manejo de objeciones, Nuevo producto X (separar por comas)" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="attendees_count"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2">
                                            <Users className="h-4 w-4" /> Asistentes
                                        </FormLabel>
                                        <FormControl>
                                            <Input {...field} type="number" min={1} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="evidence_photo_url"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2">
                                            <Camera className="h-4 w-4" /> Foto Evidencia (URL)
                                        </FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="https://..." />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Notas Adicionales</FormLabel>
                                    <FormControl>
                                        <Textarea {...field} placeholder="Comentarios sobre la sesión..." />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end pt-2">
                            <Button type="submit" disabled={saving} className="bg-purple-600 hover:bg-purple-700">
                                {saving ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Guardando...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        Registrar Capacitación
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
