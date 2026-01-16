import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Plus, Edit, Check, ChevronsUpDown, X } from "lucide-react";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

// Helper MultiSelect Component
function MultiSelect({
    options,
    selected,
    onChange,
    placeholder = "Seleccionar...",
    emptyMessage = "No se encontraron resultados."
}: {
    options: { label: string; value: string }[];
    selected: string[];
    onChange: (selected: string[]) => void;
    placeholder?: string;
    emptyMessage?: string;
}) {
    const [open, setOpen] = useState(false);

    const handleUnselect = (item: string) => {
        onChange(selected.filter((i) => i !== item));
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between h-auto min-h-[40px] px-3 py-2"
                >
                    <div className="flex flex-wrap gap-1">
                        {selected.length === 0 && <span className="text-muted-foreground font-normal">{placeholder}</span>}
                        {selected.map((item) => (
                            <Badge variant="secondary" key={item} className="mr-1 mb-1" onClick={(e) => {
                                e.stopPropagation();
                                handleUnselect(item);
                            }}>
                                {options.find(opt => opt.value === item)?.label || item}
                                <div
                                    className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            handleUnselect(item);
                                        }
                                    }}
                                    onMouseDown={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                    }}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleUnselect(item);
                                    }}
                                >
                                    <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                                </div>
                            </Badge>
                        ))}
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command>
                    <CommandInput placeholder="Buscar..." />
                    <CommandList>
                        <CommandEmpty>{emptyMessage}</CommandEmpty>
                        <CommandGroup>
                            {options.map((option) => (
                                <CommandItem
                                    key={option.value}
                                    value={option.label}
                                    onSelect={() => {
                                        if (selected.includes(option.value)) {
                                            onChange(selected.filter((item) => item !== option.value));
                                        } else {
                                            onChange([...selected, option.value]);
                                        }
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            selected.includes(option.value) ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {option.label}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}

interface ProductFormDialogProps {
    trigger?: React.ReactNode;
    productToEdit?: any;
    onSuccess?: () => void;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function ProductFormDialog({ trigger, productToEdit, onSuccess, open: constrainedOpen, onOpenChange }: ProductFormDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const isControlled = typeof constrainedOpen !== "undefined";
    const open = isControlled ? constrainedOpen : internalOpen;
    const setOpen = isControlled ? onOpenChange : setInternalOpen;
    const [activeTab, setActiveTab] = useState("basic");

    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    const [specialtiesList, setSpecialtiesList] = useState<{ label: string, value: string }[]>([]);

    const [formData, setFormData] = useState({
        // Basic Info
        product_code: "",
        name: "",
        active_ingredients: "",
        presentation: "",
        category: "",

        // Medical Info
        indications: "",
        medical_specialties: "",
        dosage: "",
        safety_info: "",

        // Resources
        key_message: "",
        image_url: "",
        pdf_link: "",

        // Legacy/Additional
        description: "",
        therapeutic_area: "",
        price: "",
        contraindications: "",
        side_effects: ""
    });

    useEffect(() => {
        if (open) {
            loadSpecialties();
        }

        if (productToEdit && open) {
            setFormData({
                product_code: productToEdit.product_code || "",
                name: productToEdit.name || "",
                active_ingredients: Array.isArray(productToEdit.active_ingredients)
                    ? productToEdit.active_ingredients.join(", ")
                    : (productToEdit.active_ingredients || ""),
                presentation: productToEdit.presentation || "",
                category: productToEdit.category || "",

                indications: productToEdit.indications || "",
                medical_specialties: productToEdit.medical_specialties || "",
                dosage: productToEdit.dosage || "",
                safety_info: productToEdit.safety_info || "",

                key_message: productToEdit.key_message || "",
                image_url: productToEdit.image_url || "",
                pdf_link: productToEdit.pdf_link || "",

                description: productToEdit.description || "",
                therapeutic_area: productToEdit.therapeutic_area || "",
                price: productToEdit.price ? String(productToEdit.price) : "",
                contraindications: productToEdit.contraindications || "",
                side_effects: productToEdit.side_effects || ""
            });
        } else if (open) {
            // Reset form
            setFormData({
                product_code: "", name: "", active_ingredients: "", presentation: "", category: "",
                indications: "", medical_specialties: "", dosage: "", safety_info: "",
                key_message: "", image_url: "", pdf_link: "",
                description: "", therapeutic_area: "", price: "", contraindications: "", side_effects: ""
            });
        }
    }, [productToEdit, open]);

    const loadSpecialties = async () => {
        try {
            const { data, error } = await supabase
                .from("specialties")
                .select("name")
                .order("name");

            if (error) throw error;
            if (data) {
                setSpecialtiesList(data.map(s => ({ label: s.name, value: s.name })));
            }
        } catch (error) {
            console.error("Error loading specialties:", error);
        }
    };

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (!formData.name || !formData.category) {
                throw new Error("El nombre y la categoría son obligatorios");
            }

            const productPayload = {
                product_code: formData.product_code || null,
                name: formData.name,
                active_ingredients: formData.active_ingredients.split(",").map(s => s.trim()).filter(Boolean),
                presentation: formData.presentation || null,
                category: formData.category,

                indications: formData.indications || null,
                medical_specialties: formData.medical_specialties || null,
                dosage: formData.dosage || null,
                safety_info: formData.safety_info || null,

                key_message: formData.key_message || null,
                image_url: formData.image_url || null,
                pdf_link: formData.pdf_link || null,

                description: formData.description || null,
                therapeutic_area: formData.therapeutic_area || null,
                price: formData.price ? parseFloat(formData.price) : null,
                contraindications: formData.contraindications || null,
                side_effects: formData.side_effects || null
            };

            let error;
            if (productToEdit?.id) {
                const { error: updateError } = await supabase
                    .from('products')
                    .update(productPayload)
                    .eq('id', productToEdit.id);
                error = updateError;
            } else {
                const { error: insertError } = await supabase
                    .from('products')
                    .insert([productPayload]);
                error = insertError;
            }

            if (error) throw error;

            toast({
                title: productToEdit ? "Producto actualizado" : "Producto creado",
                description: `El producto ${formData.name} ha sido guardado exitosamente.`,
                variant: "default",
            });

            if (setOpen) setOpen(false);
            if (onSuccess) onSuccess();

        } catch (error: any) {
            console.error("Error saving product:", error);
            toast({
                title: "Error",
                description: error.message || "No se pudo guardar el producto.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const categories = [
        "Cardiovascular", "Neurológico", "Oncológico", "Endocrinología",
        "Gastroenterología", "Respiratorio", "Dermatología", "Pediatría", "Otros"
    ];

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger}
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{productToEdit ? "Editar Producto" : "Nuevo Producto"}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="basic">Información Básica</TabsTrigger>
                            <TabsTrigger value="medical">Información Médica</TabsTrigger>
                            <TabsTrigger value="resources">Recursos</TabsTrigger>
                        </TabsList>

                        {/* Tab 1: Basic Info */}
                        <TabsContent value="basic" className="space-y-4 mt-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2 space-y-2">
                                    <Label>Nombre del Producto *</Label>
                                    <Input
                                        value={formData.name}
                                        onChange={(e) => handleChange("name", e.target.value)}
                                        required
                                        placeholder="Ej. CardioMax Pro"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Código del Producto</Label>
                                    <Input
                                        value={formData.product_code}
                                        onChange={(e) => handleChange("product_code", e.target.value)}
                                        placeholder="Ej. CARD-001"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Categoría *</Label>
                                    <Select
                                        value={formData.category}
                                        onValueChange={(val) => handleChange("category", val)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map(cat => (
                                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Principio(s) Activo(s)</Label>
                                <Input
                                    value={formData.active_ingredients}
                                    onChange={(e) => handleChange("active_ingredients", e.target.value)}
                                    placeholder="Ej. Ibuprofeno 400mg, Paracetamol 500mg (separados por coma)"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Composición / Presentación Principal</Label>
                                    <Input
                                        value={formData.presentation}
                                        onChange={(e) => handleChange("presentation", e.target.value)}
                                        placeholder="Ej. Caja x 30 comprimidos"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Especialidad(es) Médica(s)</Label>
                                    <MultiSelect
                                        options={specialtiesList}
                                        selected={formData.medical_specialties ? formData.medical_specialties.split(', ').filter(Boolean) : []}
                                        onChange={(selected) => handleChange("medical_specialties", selected.join(', '))}
                                        placeholder="Seleccionar especialidades..."
                                        emptyMessage="No se encontraron especialidades"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Área Terapéutica</Label>
                                    <Input
                                        value={formData.therapeutic_area}
                                        onChange={(e) => handleChange("therapeutic_area", e.target.value)}
                                        placeholder="Ej. Cardiología"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Descripción</Label>
                                <Textarea
                                    value={formData.description}
                                    onChange={(e) => handleChange("description", e.target.value)}
                                    placeholder="Descripción breve del producto..."
                                    rows={3}
                                />
                            </div>
                        </TabsContent>

                        {/* Tab 2: Medical Info */}
                        <TabsContent value="medical" className="space-y-4 mt-4">
                            <div className="space-y-2">
                                <Label>Indicaciones (Consolidado)</Label>
                                <Textarea
                                    value={formData.indications}
                                    onChange={(e) => handleChange("indications", e.target.value)}
                                    placeholder="Indicaciones terapéuticas del producto..."
                                    rows={4}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Dosificación / Aplicación</Label>
                                <Textarea
                                    value={formData.dosage}
                                    onChange={(e) => handleChange("dosage", e.target.value)}
                                    placeholder="Ej. 1 comprimido cada 24h, según información disponible..."
                                    rows={3}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Seguridad (Contraindicaciones / Precauciones Clave)</Label>
                                <Textarea
                                    value={formData.safety_info}
                                    onChange={(e) => handleChange("safety_info", e.target.value)}
                                    placeholder="Contraindicaciones y precauciones importantes..."
                                    rows={4}
                                />
                            </div>
                        </TabsContent>

                        {/* Tab 3: Resources */}
                        <TabsContent value="resources" className="space-y-4 mt-4">
                            <div className="space-y-2">
                                <Label>Mensaje Clave (Según Manual)</Label>
                                <Textarea
                                    value={formData.key_message}
                                    onChange={(e) => handleChange("key_message", e.target.value)}
                                    placeholder="Mensaje clave del producto según manual..."
                                    rows={4}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>URL de Imagen</Label>
                                <Input
                                    type="url"
                                    value={formData.image_url}
                                    onChange={(e) => handleChange("image_url", e.target.value)}
                                    placeholder="https://ejemplo.com/imagen-producto.jpg"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Link a PDF</Label>
                                <Input
                                    type="url"
                                    value={formData.pdf_link}
                                    onChange={(e) => handleChange("pdf_link", e.target.value)}
                                    placeholder="https://ejemplo.com/ficha-tecnica.pdf"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Precio (€)</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={formData.price}
                                    onChange={(e) => handleChange("price", e.target.value)}
                                    placeholder="0.00"
                                />
                            </div>
                        </TabsContent>
                    </Tabs>

                    <DialogFooter className="mt-6">
                        <Button type="button" variant="outline" onClick={() => setOpen?.(false)} disabled={loading}>
                            Cancelar
                        </Button>
                        <Button type="submit" className="btn-medical" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {productToEdit ? "Guardar Cambios" : "Crear Producto"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog >
    );
}
