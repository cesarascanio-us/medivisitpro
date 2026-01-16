import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Loader2, Calendar, CalendarRange, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export type RecurrenceEditOption = "this_only" | "this_and_future" | "cancel";

interface RecurrenceEditDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    visitId: string;
    seriesId: string;
    visitDate: Date;
    newDate?: Date;
    newTime?: string;
    contactName: string;
    onComplete: (option: RecurrenceEditOption, newSeriesId?: string) => void;
}

export function RecurrenceEditDialog({
    open,
    onOpenChange,
    visitId,
    seriesId,
    visitDate,
    newDate,
    newTime,
    contactName,
    onComplete
}: RecurrenceEditDialogProps) {
    const [selectedOption, setSelectedOption] = useState<RecurrenceEditOption>("this_only");
    const [loading, setLoading] = useState(false);

    const handleConfirm = async () => {
        if (selectedOption === "cancel") {
            onOpenChange(false);
            onComplete("cancel");
            return;
        }

        setLoading(true);

        try {
            if (selectedOption === "this_only") {
                // Actualizar solo esta visita como excepción
                // @ts-ignore - RPC function created in recurring_visits.sql
                const { data, error } = await supabase.rpc('update_single_visit', {
                    p_visit_id: visitId,
                    p_new_date: newDate?.toISOString() || null,
                    p_new_notes: null
                });

                if (error) throw error;

                const result = data as { success: boolean; error?: string };
                if (!result.success) {
                    throw new Error(result.error || 'Error desconocido');
                }

                toast({
                    title: "Visita actualizada",
                    description: "Solo esta visita fue modificada. Las demás permanecen igual.",
                });

                onComplete("this_only");

            } else if (selectedOption === "this_and_future") {
                // Dividir la serie
                const newDayOfWeek = newDate ? newDate.getDay() : null;
                const newTimeValue = newTime ? newTime + ':00' : null;

                // @ts-ignore - RPC function created in recurring_visits.sql
                const { data, error } = await supabase.rpc('split_series', {
                    p_series_id: seriesId,
                    p_from_date: format(visitDate, 'yyyy-MM-dd'),
                    p_new_day_of_week: newDayOfWeek,
                    p_new_preferred_time: newTimeValue
                });

                if (error) throw error;

                const result = data as { success: boolean; new_series_id?: string; error?: string };
                if (!result.success) {
                    throw new Error(result.error || 'Error desconocido');
                }

                toast({
                    title: "Serie actualizada",
                    description: "Esta y todas las visitas futuras han sido actualizadas.",
                });

                onComplete("this_and_future", result.new_series_id);
            }

            onOpenChange(false);

        } catch (error: any) {
            console.error('Error updating recurrence:', error);
            toast({
                title: "Error",
                description: error.message || "No se pudo procesar el cambio",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-amber-500" />
                        Editar Visita Recurrente
                    </DialogTitle>
                    <DialogDescription>
                        Esta visita a <strong>{contactName}</strong> forma parte de una serie recurrente.
                        ¿Cómo deseas aplicar los cambios?
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    <RadioGroup
                        value={selectedOption}
                        onValueChange={(value) => setSelectedOption(value as RecurrenceEditOption)}
                        className="space-y-3"
                    >
                        <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                            onClick={() => setSelectedOption("this_only")}>
                            <RadioGroupItem value="this_only" id="this_only" className="mt-1" />
                            <Label htmlFor="this_only" className="flex-1 cursor-pointer">
                                <div className="flex items-center gap-2 font-medium">
                                    <Calendar className="h-4 w-4 text-blue-600" />
                                    Solo esta visita
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Modifica únicamente la visita del {format(visitDate, "d 'de' MMMM", { locale: es })}.
                                    Las demás visitas de la serie no cambian.
                                </p>
                            </Label>
                        </div>

                        <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                            onClick={() => setSelectedOption("this_and_future")}>
                            <RadioGroupItem value="this_and_future" id="this_and_future" className="mt-1" />
                            <Label htmlFor="this_and_future" className="flex-1 cursor-pointer">
                                <div className="flex items-center gap-2 font-medium">
                                    <CalendarRange className="h-4 w-4 text-purple-600" />
                                    Esta y todas las futuras
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Aplica los cambios a esta visita y todas las visitas futuras de la serie.
                                    Las visitas pasadas permanecen igual.
                                </p>
                            </Label>
                        </div>
                    </RadioGroup>
                </div>

                <DialogFooter className="gap-2">
                    <Button
                        variant="outline"
                        onClick={() => {
                            onOpenChange(false);
                            onComplete("cancel");
                        }}
                        disabled={loading}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={loading}
                        className="btn-medical"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Procesando...
                            </>
                        ) : (
                            "Confirmar"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
