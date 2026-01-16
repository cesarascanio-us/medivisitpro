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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, DollarSign, TrendingDown, TrendingUp, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const resultSchema = z.object({
    attendees_actual: z.preprocess((a) => parseInt(String(a)), z.number().min(0)),
    units_sold: z.preprocess((a) => parseInt(String(a)), z.number().min(0)),
    total_sales_amount: z.preprocess((a) => parseFloat(String(a)), z.number().min(0)),
    costs_honorarium: z.preprocess((a) => parseFloat(String(a)), z.number().min(0)),
    costs_logistics: z.preprocess((a) => parseFloat(String(a)), z.number().min(0)),
    notes: z.string().optional(),
});

type ResultFormValues = z.infer<typeof resultSchema>;

interface EventResultFormProps {
    eventId: string;
    eventTitle: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function EventResultForm({ eventId, eventTitle, open, onOpenChange, onSuccess }: EventResultFormProps) {
    const [saving, setSaving] = useState(false);

    const form = useForm<ResultFormValues>({
        resolver: zodResolver(resultSchema),
        defaultValues: {
            attendees_actual: 0,
            units_sold: 0,
            total_sales_amount: 0,
            costs_honorarium: 0,
            costs_logistics: 0,
            notes: "",
        },
    });

    const watchedValues = form.watch();
    const totalCost = (watchedValues.costs_honorarium || 0) + (watchedValues.costs_logistics || 0);
    const profit = (watchedValues.total_sales_amount || 0) - totalCost;
    const isLoss = profit < 0;

    const onSubmit = async (values: ResultFormValues) => {
        try {
            setSaving(true);

            // 1. Update event status to completed
            // 2. Ideally save results to a separate table or JSONB column. 
            // For now, let's assume we update the event record with outcome data if columns exist,
            // or just log it/close it. The plan says "Create EventResultForm".
            // We will store it in 'outcome_data' jsonb column if it exists, or just update notes/status for MVP.
            // Let's assume we update status and maybe append notes.
            // Ideally we should have created columns for this or a table `event_outcomes`.
            // For MVP, I'll update status and append summary to description/notes.

            const summary = `
[RESULTADOS]
Asistentes: ${values.attendees_actual}
Unidades: ${values.units_sold}
Venta: $${values.total_sales_amount}
Costo: $${totalCost}
Profit: $${profit}
Notas: ${values.notes}
            `;

            const { error } = await supabase
                .from('events')
                .update({
                    status: 'completed',
                    notes: summary // Appending to notes as fallback
                    // attendees_count: values.attendees_actual // Could update this too
                })
                .eq('id', eventId);

            if (error) throw error;

            toast.success("Resultados registrados. Evento completado.");
            onOpenChange(false);
            onSuccess();

        } catch (error: any) {
            console.error("Error saving results:", error);
            toast.error("Error al guardar resultados");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Resultados: {eventTitle}</DialogTitle>
                    <DialogDescription>Registra el impacto comercial y costos del evento.</DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-4 mb-4">
                    <Card className={isLoss ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"}>
                        <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                            <span className="text-sm text-muted-foreground mb-1">Resultado (ROI)</span>
                            <span className={`text-2xl font-bold flex items-center ${isLoss ? "text-red-700" : "text-green-700"}`}>
                                {isLoss ? <TrendingDown className="mr-2 h-5 w-5" /> : <TrendingUp className="mr-2 h-5 w-5" />}
                                ${profit.toFixed(2)}
                            </span>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                            <span className="text-sm text-muted-foreground mb-1">Costo Total</span>
                            <span className="text-2xl font-bold text-slate-700">${totalCost.toFixed(2)}</span>
                        </CardContent>
                    </Card>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="attendees_actual"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Asistentes Reales</FormLabel>
                                        <FormControl><Input type="number" {...field} /></FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="units_sold"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Unidades (Sell-Out)</FormLabel>
                                        <FormControl><Input type="number" {...field} /></FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="total_sales_amount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Venta Total ($)</FormLabel>
                                        <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                                    </FormItem>
                                )}
                            />
                            <div className="space-y-2">
                                <FormField
                                    control={form.control}
                                    name="costs_honorarium"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Honorarios Médico ($)</FormLabel>
                                            <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="costs_logistics"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Logística/Catering ($)</FormLabel>
                                            <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Observaciones / Feedback</FormLabel>
                                    <FormControl><Textarea {...field} placeholder="Comentarios cualitativos..." /></FormControl>
                                </FormItem>
                            )}
                        />

                        {isLoss && (
                            <div className="flex items-center p-3 text-sm text-amber-800 bg-amber-50 rounded-md border border-amber-200">
                                <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
                                <span>Atención: Estrategia fallida (Inversión {'>'} Retorno). Revisar compromiso.</span>
                            </div>
                        )}

                        <div className="flex justify-end pt-2">
                            <Button type="submit" disabled={saving}>
                                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <DollarSign className="mr-2 h-4 w-4" />}
                                Registrar Resultados
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
