/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */


import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const drugstoreSchema = z.object({
    name: z.string().min(1, "El nombre es requerido"),
    type: z.enum(["Nacional", "Regional"], { required_error: "Seleccione un tipo" }),
    contact_name: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email("Email inválido").optional().or(z.literal("")),
    location: z.string().optional(),
});

type DrugstoreFormValues = z.infer<typeof drugstoreSchema>;

interface DrugstoreDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    drugstoreToEdit?: any;
    onSuccess: () => void;
}

export function DrugstoreDialog({ open, onOpenChange, drugstoreToEdit, onSuccess }: DrugstoreDialogProps) {
    const form = useForm<DrugstoreFormValues>({
        resolver: zodResolver(drugstoreSchema),
        defaultValues: {
            name: "",
            type: "Regional",
            contact_name: "",
            phone: "",
            email: "",
            location: "",
        },
    });

    useEffect(() => {
        if (drugstoreToEdit) {
            form.reset({
                name: drugstoreToEdit.name,
                type: drugstoreToEdit.type as "Nacional" | "Regional",
                contact_name: drugstoreToEdit.contact_name || "",
                phone: drugstoreToEdit.phone || "",
                email: drugstoreToEdit.email || "",
                location: drugstoreToEdit.location || "",
            });
        } else {
            form.reset({
                name: "",
                type: "Regional",
                contact_name: "",
                phone: "",
                email: "",
                location: "",
            });
        }
    }, [drugstoreToEdit, form, open]);

    const onSubmit = async (values: DrugstoreFormValues) => {
        try {
            if (drugstoreToEdit) {
                const { error } = await supabase
                    .from("drugstores")
                    .update(values)
                    .eq("id", drugstoreToEdit.id);

                if (error) throw error;
                toast.success("Droguería actualizada correctamente");
            } else {
                const { error } = await supabase
                    .from("drugstores")
                    .insert(values);

                if (error) throw error;
                toast.success("Droguería creada correctamente");
            }
            onSuccess();
            onOpenChange(false);
        } catch (error: any) {
            toast.error("Error al guardar droguería: " + error.message);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{drugstoreToEdit ? "Editar Droguería" : "Nueva Droguería"}</DialogTitle>
                    <DialogDescription>
                        Información de la droguería y contacto.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nombre Droguería</Label>
                            <Input id="name" {...form.register("name")} placeholder="Ej: PharmaCorp" />
                            {form.formState.errors.name && (
                                <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="type">Tipo</Label>
                            <Select onValueChange={(val) => form.setValue("type", val as any)} defaultValue={form.getValues("type")}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccione tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Nacional">Nacional</SelectItem>
                                    <SelectItem value="Regional">Regional</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="contact_name">Contacto</Label>
                        <Input id="contact_name" {...form.register("contact_name")} placeholder="Nombre del encargado" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="phone">Teléfono</Label>
                            <Input id="phone" {...form.register("phone")} placeholder="+58..." />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" {...form.register("email")} placeholder="contacto@..." />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="location">Ubicación</Label>
                        <Input id="location" {...form.register("location")} placeholder="Ciudad / Dirección" />
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
