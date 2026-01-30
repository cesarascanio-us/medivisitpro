
import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Leaf, User, Building, MapPin } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface NaturalStoreFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    formData: any;
    setFormData: (data: any) => void;
    onSubmit: () => void;
    isEditing: boolean;
}

export function NaturalStoreFormDialog({
    open,
    onOpenChange,
    formData,
    setFormData,
    onSubmit,
    isEditing
}: NaturalStoreFormDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-emerald-700">
                        <Leaf className="h-5 w-5" />
                        {isEditing ? "Editar Tienda Naturista" : "Alta Comercial - Tienda Naturista"}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Nombre Comercial *</Label>
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Ej: Herbolaria Vital"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>RIF *</Label>
                            <Input
                                value={formData.rif}
                                onChange={(e) => setFormData({ ...formData, rif: e.target.value })}
                                placeholder="J-12345678-9"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="flex items-center gap-1">
                                <User className="h-3 w-3" /> Dueño / Encargado
                            </Label>
                            <Input
                                value={formData.owner_name}
                                onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
                                placeholder="Nombre completo"
                            />
                        </div>
                        <div className="space-y-2 flex flex-col justify-end pb-2">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="permits"
                                    checked={formData.sanitary_permits}
                                    onCheckedChange={(checked) => setFormData({ ...formData, sanitary_permits: checked })}
                                />
                                <Label htmlFor="permits" className="text-sm font-normal cursor-pointer">
                                    Permisos Sanitarios Vigentes
                                </Label>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Contact & Location */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold flex items-center gap-2">
                            <MapPin className="h-4 w-4" /> Ubicación y Contacto
                        </h4>
                        <div className="space-y-2">
                            <Label>Dirección</Label>
                            <Input
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                placeholder="Calle, Centro Comercial, Local..."
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Ciudad</Label>
                                <Input
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                    placeholder="Ej: Caracas"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Teléfono</Label>
                                <Input
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="+58 412 1234567"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button onClick={onSubmit} className="bg-emerald-600 hover:bg-emerald-700">
                        {isEditing ? "Guardar Cambios" : "Completar Alta Comercial"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
