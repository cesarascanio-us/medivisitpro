/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

interface ProductDialogProps {
    trigger: React.ReactNode;
    productData?: any;
    onProductSaved?: () => void;
}

export function ProductDialog({ trigger, productData, onProductSaved }: ProductDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const [formData, setFormData] = useState({
        name: "",
        category: "Cardiovascular",
        therapeutic_area: "",
        description: "",
        active_ingredients: "", // Will be converted to array
        dosage: "",
        presentation: "",
        indications: "",
        contraindications: "",
        side_effects: "",
        price: "",
        image_url: "",
    });

    useEffect(() => {
        if (productData) {
            setFormData({
                name: productData.name || "",
                category: productData.category || "Cardiovascular",
                therapeutic_area: productData.therapeutic_area || "",
                description: productData.description || "",
                active_ingredients: productData.active_ingredients?.join(", ") || "",
                dosage: productData.dosage || "",
                presentation: productData.presentation || "",
                indications: productData.indications || "",
                contraindications: productData.contraindications || "",
                side_effects: productData.side_effects || "",
                price: productData.price?.toString() || "",
                image_url: productData.image_url || "",
            });
        } else {
            resetForm();
        }
    }, [productData, open]);

    const resetForm = () => {
        setFormData({
            name: "",
            category: "Cardiovascular",
            therapeutic_area: "",
            description: "",
            active_ingredients: "",
            dosage: "",
            presentation: "",
            indications: "",
            contraindications: "",
            side_effects: "",
            price: "",
            image_url: "",
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                name: formData.name,
                category: formData.category,
                therapeutic_area: formData.therapeutic_area,
                description: formData.description,
                active_ingredients: formData.active_ingredients.split(",").map(i => i.trim()).filter(i => i),
                dosage: formData.dosage,
                presentation: formData.presentation,
                indications: formData.indications,
                contraindications: formData.contraindications,
                side_effects: formData.side_effects,
                price: formData.price ? parseFloat(formData.price) : null,
                image_url: formData.image_url,
            };

            if (productData?.id) {
                const { error } = await supabase
                    .from('products')
                    .update(payload)
                    .eq('id', productData.id);

                if (error) throw error;
                toast({ title: "Producto actualizado", description: "Los cambios han sido guardados." });
            } else {
                const { error } = await supabase
                    .from('products')
                    .insert([payload]);

                if (error) throw error;
                toast({ title: "Producto creado", description: "El nuevo producto ha sido añadido al catálogo." });
            }

            setOpen(false);
            onProductSaved?.();
        } catch (error) {
            console.error('Error saving product:', error);
            toast({
                title: "Error",
                description: "No se pudo guardar el producto.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger}
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center">
                        <Package className="mr-2 h-5 w-5 icon-medical" />
                        {productData ? "Editar Producto" : "Nuevo Producto"}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-foreground">Información General</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nombre Comercial *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="category">Categoría</Label>
                                <Select
                                    value={formData.category}
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Cardiovascular">Cardiovascular</SelectItem>
                                        <SelectItem value="Neurológico">Neurológico</SelectItem>
                                        <SelectItem value="Oncológico">Oncológico</SelectItem>
                                        <SelectItem value="Endocrinología">Endocrinología</SelectItem>
                                        <SelectItem value="Pediatría">Pediatría</SelectItem>
                                        <SelectItem value="Dermatología">Dermatología</SelectItem>
                                        <SelectItem value="Respiratorio">Respiratorio</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="therapeutic_area">Área Terapéutica</Label>
                                <Input
                                    id="therapeutic_area"
                                    value={formData.therapeutic_area}
                                    onChange={(e) => setFormData(prev => ({ ...prev, therapeutic_area: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="price">Precio (€)</Label>
                                <Input
                                    id="price"
                                    type="number"
                                    step="0.01"
                                    value={formData.price}
                                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Descripción</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                rows={2}
                            />
                        </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-foreground">Detalles Médicos</h3>

                        <div className="space-y-2">
                            <Label htmlFor="active_ingredients">Principios Activos (separados por coma)</Label>
                            <Input
                                id="active_ingredients"
                                value={formData.active_ingredients}
                                onChange={(e) => setFormData(prev => ({ ...prev, active_ingredients: e.target.value }))}
                                placeholder="Ej: Ibuprofeno 400mg, Paracetamol 500mg"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="presentation">Presentación</Label>
                                <Input
                                    id="presentation"
                                    value={formData.presentation}
                                    onChange={(e) => setFormData(prev => ({ ...prev, presentation: e.target.value }))}
                                    placeholder="Ej: Caja x 30 comprimidos"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="dosage">Dosificación</Label>
                                <Input
                                    id="dosage"
                                    value={formData.dosage}
                                    onChange={(e) => setFormData(prev => ({ ...prev, dosage: e.target.value }))}
                                    placeholder="Ej: 1 cada 8 horas"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="indications">Indicaciones</Label>
                            <Textarea
                                id="indications"
                                value={formData.indications}
                                onChange={(e) => setFormData(prev => ({ ...prev, indications: e.target.value }))}
                                rows={2}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="contraindications">Contraindicaciones</Label>
                            <Textarea
                                id="contraindications"
                                value={formData.contraindications}
                                onChange={(e) => setFormData(prev => ({ ...prev, contraindications: e.target.value }))}
                                rows={2}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="side_effects">Efectos Secundarios</Label>
                            <Textarea
                                id="side_effects"
                                value={formData.side_effects}
                                onChange={(e) => setFormData(prev => ({ ...prev, side_effects: e.target.value }))}
                                rows={2}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading} className="btn-medical">
                            {loading ? "Guardando..." : (productData ? "Actualizar" : "Guardar Producto")}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
