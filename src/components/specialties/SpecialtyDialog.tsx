
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const specialtySchema = z.object({
    name: z.string().min(1, "El nombre es requerido"),
    detail: z.string().optional(),
    image_url: z.string().optional(),
});

type SpecialtyFormValues = z.infer<typeof specialtySchema>;

interface SpecialtyDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    specialtyToEdit?: any; // We use 'any' temporarily until types are regenerated
    onSuccess: () => void;
}

export function SpecialtyDialog({ open, onOpenChange, specialtyToEdit, onSuccess }: SpecialtyDialogProps) {
    const form = useForm<SpecialtyFormValues>({
        resolver: zodResolver(specialtySchema),
        defaultValues: {
            name: "",
            detail: "",
            image_url: "",
        },
    });

    useEffect(() => {
        if (specialtyToEdit) {
            form.reset({
                name: specialtyToEdit.name,
                detail: specialtyToEdit.detail || "",
                image_url: specialtyToEdit.image_url || "",
            });
        } else {
            form.reset({
                name: "",
                detail: "",
                image_url: "",
            });
        }
    }, [specialtyToEdit, form, open]);

    const onSubmit = async (values: SpecialtyFormValues) => {
        try {
            if (specialtyToEdit) {
                const { error } = await supabase
                    .from("specialties")
                    .update(values)
                    .eq("id", specialtyToEdit.id);

                if (error) throw error;
                toast.success("Especialidad actualizada correctamente");
            } else {
                const { error } = await supabase
                    .from("specialties")
                    .insert(values);

                if (error) throw error;
                toast.success("Especialidad creada correctamente");
            }
            onSuccess();
            onOpenChange(false);
        } catch (error: any) {
            toast.error("Error al guardar especialidad: " + error.message);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{specialtyToEdit ? "Editar Especialidad" : "Nueva Especialidad"}</DialogTitle>
                    <DialogDescription>
                        Complete los datos de la especialidad médica.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Especialidad</Label>
                        <Input id="name" {...form.register("name")} placeholder="Ej: Cardiología" />
                        {form.formState.errors.name && (
                            <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="detail">Detalle</Label>
                        <Textarea id="detail" {...form.register("detail")} placeholder="Descripción breve..." />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="image_url">URL Imagen</Label>
                        <Input id="image_url" {...form.register("image_url")} placeholder="https://..." />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting ? "Guardando..." : "Guardar"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
