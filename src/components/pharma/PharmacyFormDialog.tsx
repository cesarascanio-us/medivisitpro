import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import { ProductMultiSelect } from "@/components/common/ProductMultiSelect";
import { GeocodingButton } from "@/components/forms/GeocodingButton";
import { useToast } from "@/hooks/use-toast";

interface PharmacyFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    formData: any;
    setFormData: (data: any) => void;
    onSubmit: () => void;
    isEditing?: boolean;
    trigger?: React.ReactNode;
}

export function PharmacyFormDialog({ open, onOpenChange, formData, setFormData, onSubmit, isEditing = false, trigger }: PharmacyFormDialogProps) {
    const [activeTab, setActiveTab] = useState("basico");
    const { toast } = useToast();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {trigger ? (
                <DialogTrigger asChild>{trigger}</DialogTrigger>
            ) : (
                <DialogTrigger asChild>
                    <Button className="btn-medical">
                        <Plus className="mr-2 h-4 w-4" /> Nueva Farmacia
                    </Button>
                </DialogTrigger>
            )}
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Editar Farmacia' : 'Agregar Farmacia'}</DialogTitle>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="basico">Básico</TabsTrigger>
                        <TabsTrigger value="contacto">Contacto</TabsTrigger>
                        <TabsTrigger value="segmentacion">Segmentación</TabsTrigger>
                        <TabsTrigger value="seguimiento">Seguimiento</TabsTrigger>
                    </TabsList>

                    {/* Tab 1: Información Básica */}
                    <TabsContent value="basico" className="space-y-4 mt-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Nombre *</Label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Farmacia Central"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>RIF</Label>
                                <Input
                                    value={formData.rif}
                                    onChange={(e) => setFormData({ ...formData, rif: e.target.value })}
                                    placeholder="J-123456789"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Dirección</Label>
                            <Input
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                placeholder="Av. Principal, Edificio..."
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>Ciudad</Label>
                                <Input
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                    placeholder="Caracas"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Sector</Label>
                                <Input
                                    value={formData.sector}
                                    onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                                    placeholder="El Rosal"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Estado</Label>
                                <Input
                                    value={formData.state}
                                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                    placeholder="Miranda"
                                />
                            </div>
                        </div>

                        {/* Geocoding Section */}
                        <div className="space-y-3 p-4 bg-muted/30 rounded-lg border">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium">Coordenadas GPS</Label>
                                <GeocodingButton
                                    address={{
                                        street: formData.address,
                                        city: formData.city,
                                        state: formData.state,
                                        country: "Venezuela"
                                    }}
                                    onCoordinatesFound={(lat, lng) => {
                                        setFormData({
                                            ...formData,
                                            latitude: lat,
                                            longitude: lng
                                        });
                                        toast({
                                            title: "Coordenadas obtenidas",
                                            description: `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`
                                        });
                                    }}
                                    disabled={!formData.city}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="pharmacy-latitude" className="text-xs">Latitud</Label>
                                    <Input
                                        id="pharmacy-latitude"
                                        type="number"
                                        step="any"
                                        value={formData.latitude || ""}
                                        onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) || null })}
                                        placeholder="10.4880"
                                        className="text-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="pharmacy-longitude" className="text-xs">Longitud</Label>
                                    <Input
                                        id="pharmacy-longitude"
                                        type="number"
                                        step="any"
                                        value={formData.longitude || ""}
                                        onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) || null })}
                                        placeholder="-66.8792"
                                        className="text-sm"
                                    />
                                </div>
                            </div>

                            {formData.latitude && formData.longitude && (
                                <p className="text-xs text-muted-foreground">
                                    ✓ Ubicación establecida - Aparecerá en el mapa
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label>Notas</Label>
                            <Textarea
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                placeholder="Información adicional..."
                                rows={3}
                            />
                        </div>
                    </TabsContent>

                    {/* Tab 2: Contacto */}
                    <TabsContent value="contacto" className="space-y-4 mt-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Teléfono Principal</Label>
                                <Input
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="+58 414 1234567"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Teléfono Contacto</Label>
                                <Input
                                    value={formData.contact_phone}
                                    onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                                    placeholder="+58 212 1234567"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Nombre del Contacto</Label>
                                <Input
                                    value={formData.contact_name}
                                    onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                                    placeholder="Juan Pérez"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Email</Label>
                                <Input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="contacto@farmacia.com"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Contacto Principal</Label>
                                <Input
                                    value={formData.main_contact}
                                    onChange={(e) => setFormData({ ...formData, main_contact: e.target.value })}
                                    placeholder="María González"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Cargo</Label>
                                <Input
                                    value={formData.contact_position}
                                    onChange={(e) => setFormData({ ...formData, contact_position: e.target.value })}
                                    placeholder="Gerente"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Horario</Label>
                                <Input
                                    value={formData.schedule}
                                    onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                                    placeholder="Lun-Vie 8am-6pm"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Horario de Atención</Label>
                                <Input
                                    value={formData.business_hours}
                                    onChange={(e) => setFormData({ ...formData, business_hours: e.target.value })}
                                    placeholder="8:00 AM - 8:00 PM"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Instagram</Label>
                            <Input
                                value={formData.instagram}
                                onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                                placeholder="@farmacia_central"
                            />
                        </div>
                    </TabsContent>

                    {/* Tab 3: Segmentación */}
                    <TabsContent value="segmentacion" className="space-y-4 mt-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Segmentación</Label>
                                <Select value={formData.segmentation} onValueChange={(v) => setFormData({ ...formData, segmentation: v })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="A">Categoría A</SelectItem>
                                        <SelectItem value="B">Categoría B</SelectItem>
                                        <SelectItem value="C">Categoría C</SelectItem>
                                        <SelectItem value="Premium">Premium</SelectItem>
                                        <SelectItem value="Estándar">Estándar</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Potencial</Label>
                                <Select value={formData.potential} onValueChange={(v) => setFormData({ ...formData, potential: v })}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Alto">Alto</SelectItem>
                                        <SelectItem value="Medio">Medio</SelectItem>
                                        <SelectItem value="Bajo">Bajo</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Productos de Interés</Label>
                            <ProductMultiSelect
                                selectedProducts={formData.product_interest_ids || []}
                                onProductsChange={(products) => setFormData({ ...formData, product_interest_ids: products })}
                                placeholder="Seleccionar productos de interés..."
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Productos Promocionados</Label>
                            <ProductMultiSelect
                                selectedProducts={formData.promoted_products || []}
                                onProductsChange={(products) => setFormData({ ...formData, promoted_products: products })}
                                placeholder="Seleccionar productos promocionados..."
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Prioridad</Label>
                            <Select value={formData.priority} onValueChange={(v) => setFormData({ ...formData, priority: v })}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="high">Alta</SelectItem>
                                    <SelectItem value="medium">Media</SelectItem>
                                    <SelectItem value="low">Baja</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </TabsContent>

                    {/* Tab 4: Seguimiento */}
                    <TabsContent value="seguimiento" className="space-y-4 mt-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Última Visita</Label>
                                <Input
                                    type="date"
                                    value={formData.last_visit}
                                    onChange={(e) => setFormData({ ...formData, last_visit: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Status</Label>
                                <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Activo">Activo</SelectItem>
                                        <SelectItem value="Inactivo">Inactivo</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Acción de Seguimiento</Label>
                            <Textarea
                                value={formData.follow_up_action}
                                onChange={(e) => setFormData({ ...formData, follow_up_action: e.target.value })}
                                placeholder="Próxima acción a realizar..."
                                rows={4}
                            />
                        </div>
                    </TabsContent>
                </Tabs>

                <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button onClick={onSubmit} className="btn-medical">
                        {isEditing ? 'Guardar Cambios' : 'Guardar Farmacia'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
