import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input as BaseInput } from "@/components/ui/input";
import { Textarea as BaseTextarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger as BaseSelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
    Loader2, Plus, Edit, Check, ChevronsUpDown, X, Upload, ImageIcon, FileText, Trash2,
    Package, Stethoscope, ShoppingBag, GraduationCap, Files, Sparkles
} from "lucide-react";
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

// -- High Contrast Wrappers --
const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<typeof BaseInput>>((props, ref) => (
    <BaseInput
        ref={ref}
        {...props}
        className={cn("bg-surface-card text-brand-primary border-slate-300 placeholder:text-slate-500 focus-visible:ring-brand-secondary focus-visible:border-brand-secondary", props.className)}
    />
));
Input.displayName = "HighContrastInput";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<typeof BaseTextarea>>((props, ref) => (
    <BaseTextarea
        ref={ref}
        {...props}
        className={cn("bg-surface-card text-brand-primary border-slate-300 placeholder:text-slate-500 focus-visible:ring-brand-secondary focus-visible:border-brand-secondary", props.className)}
    />
));
Textarea.displayName = "HighContrastTextarea";

const SelectTrigger = React.forwardRef<React.ElementRef<typeof BaseSelectTrigger>, React.ComponentPropsWithoutRef<typeof BaseSelectTrigger>>((props, ref) => (
    <BaseSelectTrigger
        ref={ref}
        {...props}
        className={cn("bg-surface-card text-brand-primary border-slate-300 placeholder:text-slate-500 focus:ring-brand-secondary focus:border-brand-secondary [&>span]:line-clamp-1", props.className)}
    />
));
SelectTrigger.displayName = "HighContrastSelectTrigger";
// ----------------------------

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
    const [uploadingImage, setUploadingImage] = useState(false);
    const [uploadingPdf, setUploadingPdf] = useState(false);
    const { toast } = useToast();
    const [specialtiesList, setSpecialtiesList] = useState<{ label: string, value: string }[]>([]);

    const [formData, setFormData] = useState({
        // Basic Info
        product_code: "",
        sku: "",
        name: "",
        active_ingredients: "",
        presentation: "",
        category: "",
        description: "",
        therapeutic_area: "",
        price: "",

        // Medical Info (Sección Médica)
        indications: "",
        composition: "",
        dosage: "",
        posology: "",
        medical_specialties: "",
        contraindications: "",
        side_effects: "",
        safety_info: "",
        clinical_evidence: "",

        // Commercial Info (Sección Comercial)
        key_message: "",
        selling_points: "",
        profitability_info: "",

        // Training Info (Sección Entrenamiento)
        sales_tips: "",
        objection_handling: "",

        // Resources
        image_url: "",
        pdf_link: ""
    });

    useEffect(() => {
        if (open) {
            loadSpecialties();
        }

        if (productToEdit && open) {
            setFormData({
                product_code: productToEdit.product_code || "",
                sku: productToEdit.sku || "",
                name: productToEdit.name || "",
                active_ingredients: Array.isArray(productToEdit.active_ingredients)
                    ? productToEdit.active_ingredients.join(", ")
                    : (productToEdit.active_ingredients || ""),
                presentation: productToEdit.presentation || "",
                category: productToEdit.category || "",
                description: productToEdit.description || "",
                therapeutic_area: productToEdit.therapeutic_area || "",
                price: productToEdit.price ? String(productToEdit.price) : "",

                indications: productToEdit.indications || "",
                composition: productToEdit.composition || "",
                dosage: productToEdit.dosage || "",
                posology: productToEdit.posology || "",
                medical_specialties: productToEdit.medical_specialties || "",
                contraindications: productToEdit.contraindications || "",
                side_effects: productToEdit.side_effects || "",
                safety_info: productToEdit.safety_info || "",
                clinical_evidence: productToEdit.clinical_evidence || "",

                key_message: productToEdit.key_message || "",
                selling_points: productToEdit.selling_points || "",
                profitability_info: productToEdit.profitability_info || "",

                sales_tips: productToEdit.sales_tips || "",
                objection_handling: productToEdit.objection_handling || "",

                image_url: productToEdit.image_url || "",
                pdf_link: productToEdit.pdf_link || ""
            });
        } else if (open) {
            // Reset form
            setFormData({
                product_code: "", sku: "", name: "", active_ingredients: "", presentation: "",
                category: "", description: "", therapeutic_area: "", price: "",
                indications: "", composition: "", dosage: "", posology: "", medical_specialties: "",
                contraindications: "", side_effects: "", safety_info: "", clinical_evidence: "",
                key_message: "", selling_points: "", profitability_info: "",
                sales_tips: "", objection_handling: "",
                image_url: "", pdf_link: ""
            });
            setActiveTab("basic");
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

    // File upload handler for images
    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast({ title: "Error", description: "Por favor selecciona un archivo de imagen", variant: "destructive" });
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast({ title: "Error", description: "La imagen debe ser menor a 5MB", variant: "destructive" });
            return;
        }

        setUploadingImage(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = `products/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('product-assets')
                .upload(filePath, file, { cacheControl: '3600', upsert: false });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('product-assets')
                .getPublicUrl(filePath);

            handleChange('image_url', publicUrl);
            toast({ title: "Éxito", description: "Imagen subida correctamente" });
        } catch (error: any) {
            console.error('Error uploading image:', error);
            toast({ title: "Error", description: error.message || "Error al subir la imagen", variant: "destructive" });
        } finally {
            setUploadingImage(false);
        }
    };

    // File upload handler for PDFs
    const handlePdfUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            toast({ title: "Error", description: "Por favor selecciona un archivo PDF", variant: "destructive" });
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            toast({ title: "Error", description: "El PDF debe ser menor a 10MB", variant: "destructive" });
            return;
        }

        setUploadingPdf(true);
        try {
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.pdf`;
            const filePath = `products/pdfs/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('product-assets')
                .upload(filePath, file, { cacheControl: '3600', upsert: false });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('product-assets')
                .getPublicUrl(filePath);

            handleChange('pdf_link', publicUrl);
            toast({ title: "Éxito", description: "PDF subido correctamente" });
        } catch (error: any) {
            console.error('Error uploading PDF:', error);
            toast({ title: "Error", description: error.message || "Error al subir el PDF", variant: "destructive" });
        } finally {
            setUploadingPdf(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (!formData.name || !formData.category) {
                throw new Error("El nombre y la categoría son obligatorios");
            }

            const productPayload = {
                // Basic
                product_code: formData.product_code || null,
                sku: formData.sku || null,
                name: formData.name,
                active_ingredients: formData.active_ingredients.split(",").map(s => s.trim()).filter(Boolean),
                presentation: formData.presentation || null,
                category: formData.category,
                description: formData.description || null,
                therapeutic_area: formData.therapeutic_area || null,
                price: formData.price ? parseFloat(formData.price) : null,

                // Medical
                indications: formData.indications || null,
                composition: formData.composition || null,
                dosage: formData.dosage || null,
                posology: formData.posology || null,
                medical_specialties: formData.medical_specialties || null,
                contraindications: formData.contraindications || null,
                side_effects: formData.side_effects || null,
                safety_info: formData.safety_info || null,
                clinical_evidence: formData.clinical_evidence || null,

                // Commercial
                key_message: formData.key_message || null,
                selling_points: formData.selling_points || null,
                profitability_info: formData.profitability_info || null,

                // Training
                sales_tips: formData.sales_tips || null,
                objection_handling: formData.objection_handling || null,

                // Resources
                image_url: formData.image_url || null,
                pdf_link: formData.pdf_link || null
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
        "Gastroenterología", "Respiratorio", "Dermatología", "Pediatría",
        "Ginecología", "Urología", "Inmunología", "Oftalmología", "Otros"
    ];

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger}
            </DialogTrigger>
            <DialogContent className="max-w-5xl max-h-[95vh] overflow-hidden flex flex-col bg-surface-card">
                <DialogHeader className="pb-2">
                    <DialogTitle className="flex items-center gap-2 text-xl text-brand-primary">
                        {productToEdit ? <Edit className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                        {productToEdit ? "Editar Producto" : "Nuevo Producto"}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
                        <TabsList className="grid w-full grid-cols-5 h-12 mb-4 bg-muted p-1">
                            <TabsTrigger value="basic" className="gap-1.5 text-xs sm:text-sm data-[state=inactive]:text-slate-500 data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm">
                                <Package className="h-4 w-4" />
                                <span className="hidden sm:inline">Básico</span>
                            </TabsTrigger>
                            <TabsTrigger value="medical" className="gap-1.5 text-xs sm:text-sm data-[state=inactive]:text-slate-500 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm">
                                <Stethoscope className="h-4 w-4" />
                                <span className="hidden sm:inline">Médica</span>
                            </TabsTrigger>
                            <TabsTrigger value="commercial" className="gap-1.5 text-xs sm:text-sm data-[state=inactive]:text-slate-500 data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm">
                                <ShoppingBag className="h-4 w-4" />
                                <span className="hidden sm:inline">Comercial</span>
                            </TabsTrigger>
                            <TabsTrigger value="training" className="gap-1.5 text-xs sm:text-sm data-[state=inactive]:text-slate-500 data-[state=active]:bg-white data-[state=active]:text-purple-700 data-[state=active]:shadow-sm">
                                <GraduationCap className="h-4 w-4" />
                                <span className="hidden sm:inline">Entrenamiento</span>
                            </TabsTrigger>
                            <TabsTrigger value="resources" className="gap-1.5 text-xs sm:text-sm data-[state=inactive]:text-slate-500 data-[state=active]:bg-white data-[state=active]:text-orange-700 data-[state=active]:shadow-sm">
                                <Files className="h-4 w-4" />
                                <span className="hidden sm:inline">Recursos</span>
                            </TabsTrigger>
                        </TabsList>

                        <div className="flex-1 overflow-y-auto pr-2">
                            {/* Tab: Basic Info */}
                            <TabsContent value="basic" className="mt-0 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="product_code">Código Producto</Label>
                                        <Input
                                            id="product_code"
                                            value={formData.product_code}
                                            onChange={(e) => handleChange("product_code", e.target.value)}
                                            placeholder="Ej: PRD-001"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="sku">SKU</Label>
                                        <Input
                                            id="sku"
                                            value={formData.sku}
                                            onChange={(e) => handleChange("sku", e.target.value)}
                                            placeholder="Código de barras"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="price">Precio ($)</Label>
                                        <Input
                                            id="price"
                                            type="number"
                                            step="0.01"
                                            value={formData.price}
                                            onChange={(e) => handleChange("price", e.target.value)}
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="name">Nombre del Producto *</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => handleChange("name", e.target.value)}
                                        placeholder="Nombre comercial del producto"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="active_ingredients">Principios Activos</Label>
                                        <Input
                                            id="active_ingredients"
                                            value={formData.active_ingredients}
                                            onChange={(e) => handleChange("active_ingredients", e.target.value)}
                                            placeholder="Separados por comas"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="presentation">Presentación</Label>
                                        <Input
                                            id="presentation"
                                            value={formData.presentation}
                                            onChange={(e) => handleChange("presentation", e.target.value)}
                                            placeholder="Ej: Cápsulas 500mg x 30"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="category">Categoría *</Label>
                                        <Select value={formData.category} onValueChange={(val) => handleChange("category", val)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccionar categoría" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories.map((cat) => (
                                                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="therapeutic_area">Área Terapéutica</Label>
                                        <Input
                                            id="therapeutic_area"
                                            value={formData.therapeutic_area}
                                            onChange={(e) => handleChange("therapeutic_area", e.target.value)}
                                            placeholder="Ej: Sistema Nervioso Central"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Descripción General</Label>
                                    <Textarea
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) => handleChange("description", e.target.value)}
                                        placeholder="Descripción breve del producto"
                                        rows={3}
                                    />
                                </div>
                            </TabsContent>

                            {/* Tab: Medical Info */}
                            <TabsContent value="medical" className="mt-0 space-y-4">
                                <Card className="border-blue-100 bg-blue-50/30">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-base flex items-center gap-2 text-blue-800">
                                            <Stethoscope className="h-5 w-5" />
                                            Información Médica
                                        </CardTitle>
                                        <CardDescription>Datos clínicos para presentaciones médicas</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="indications">Indicaciones</Label>
                                            <Textarea
                                                id="indications"
                                                value={formData.indications}
                                                onChange={(e) => handleChange("indications", e.target.value)}
                                                placeholder="¿Para qué está indicado este medicamento?"
                                                rows={3}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="composition">Composición</Label>
                                            <Textarea
                                                id="composition"
                                                value={formData.composition}
                                                onChange={(e) => handleChange("composition", e.target.value)}
                                                placeholder="Composición detallada del producto"
                                                rows={2}
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="dosage">Dosis Recomendada</Label>
                                                <Input
                                                    id="dosage"
                                                    value={formData.dosage}
                                                    onChange={(e) => handleChange("dosage", e.target.value)}
                                                    placeholder="Ej: 500mg cada 8 horas"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="posology">Posología Detallada</Label>
                                                <Input
                                                    id="posology"
                                                    value={formData.posology}
                                                    onChange={(e) => handleChange("posology", e.target.value)}
                                                    placeholder="Régimen de dosificación"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="medical_specialties">Especialidades Médicas</Label>
                                            <Input
                                                id="medical_specialties"
                                                value={formData.medical_specialties}
                                                onChange={(e) => handleChange("medical_specialties", e.target.value)}
                                                placeholder="Especialidades target: Cardiología, Neurología..."
                                            />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="border-amber-100 bg-amber-50/30">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-base flex items-center gap-2 text-amber-800">
                                            <Sparkles className="h-5 w-5" />
                                            Seguridad y Evidencia
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="contraindications">Contraindicaciones</Label>
                                                <Textarea
                                                    id="contraindications"
                                                    value={formData.contraindications}
                                                    onChange={(e) => handleChange("contraindications", e.target.value)}
                                                    placeholder="Cuándo NO usar este producto"
                                                    rows={3}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="side_effects">Efectos Secundarios</Label>
                                                <Textarea
                                                    id="side_effects"
                                                    value={formData.side_effects}
                                                    onChange={(e) => handleChange("side_effects", e.target.value)}
                                                    placeholder="Efectos adversos conocidos"
                                                    rows={3}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="safety_info">Información de Seguridad</Label>
                                            <Textarea
                                                id="safety_info"
                                                value={formData.safety_info}
                                                onChange={(e) => handleChange("safety_info", e.target.value)}
                                                placeholder="Advertencias y precauciones importantes"
                                                rows={3}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="clinical_evidence">Evidencia Clínica</Label>
                                            <Textarea
                                                id="clinical_evidence"
                                                value={formData.clinical_evidence}
                                                onChange={(e) => handleChange("clinical_evidence", e.target.value)}
                                                placeholder="Estudios clínicos, ensayos, publicaciones relevantes..."
                                                rows={4}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Tab: Commercial Info */}
                            <TabsContent value="commercial" className="mt-0 space-y-4">
                                <Card className="border-emerald-100 bg-emerald-50/30">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-base flex items-center gap-2 text-emerald-800">
                                            <ShoppingBag className="h-5 w-5" />
                                            Información Comercial
                                        </CardTitle>
                                        <CardDescription>Datos para el equipo de ventas y farmacias</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="key_message">Mensaje Clave</Label>
                                            <Textarea
                                                id="key_message"
                                                value={formData.key_message}
                                                onChange={(e) => handleChange("key_message", e.target.value)}
                                                placeholder="El mensaje principal que el representante debe comunicar"
                                                rows={2}
                                            />
                                            <p className="text-xs text-slate-500">Este mensaje se muestra destacado en la presentación del producto</p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="selling_points">Argumentos de Venta</Label>
                                            <Textarea
                                                id="selling_points"
                                                value={formData.selling_points}
                                                onChange={(e) => handleChange("selling_points", e.target.value)}
                                                placeholder="• Diferenciador 1&#10;• Diferenciador 2&#10;• Ventajas vs competencia"
                                                rows={5}
                                            />
                                            <p className="text-xs text-slate-500">Lista los puntos fuertes y diferenciadores del producto</p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="profitability_info">Información de Rentabilidad</Label>
                                            <Textarea
                                                id="profitability_info"
                                                value={formData.profitability_info}
                                                onChange={(e) => handleChange("profitability_info", e.target.value)}
                                                placeholder="Márgenes, rotación, comparación de precios, ofertas disponibles..."
                                                rows={4}
                                            />
                                            <p className="text-xs text-slate-500">Información para convencer a farmacias sobre la rentabilidad</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Tab: Training Info */}
                            <TabsContent value="training" className="mt-0 space-y-4">
                                <Card className="border-purple-100 bg-purple-50/30">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-base flex items-center gap-2 text-purple-800">
                                            <GraduationCap className="h-5 w-5" />
                                            Material de Entrenamiento
                                        </CardTitle>
                                        <CardDescription>Tips y guías para el equipo de representantes</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="sales_tips">Tips de Venta</Label>
                                            <Textarea
                                                id="sales_tips"
                                                value={formData.sales_tips}
                                                onChange={(e) => handleChange("sales_tips", e.target.value)}
                                                placeholder="• Cómo abrir la conversación&#10;• Preguntas clave para el médico&#10;• Momentos ideales para presentar el producto"
                                                rows={6}
                                            />
                                            <p className="text-xs text-slate-500">Técnicas y consejos prácticos para la fuerza de ventas</p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="objection_handling">Manejo de Objeciones</Label>
                                            <Textarea
                                                id="objection_handling"
                                                value={formData.objection_handling}
                                                onChange={(e) => handleChange("objection_handling", e.target.value)}
                                                placeholder="Objeción: 'Es muy caro'&#10;Respuesta: ...&#10;&#10;Objeción: 'Ya tengo otro producto'&#10;Respuesta: ..."
                                                rows={6}
                                            />
                                            <p className="text-xs text-slate-500">Respuestas preparadas para las objeciones más comunes</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Tab: Resources */}
                            <TabsContent value="resources" className="mt-0 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Image Upload */}
                                    <Card>
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-base flex items-center gap-2">
                                                <ImageIcon className="h-5 w-5 text-blue-600" />
                                                Imagen del Producto
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            {formData.image_url ? (
                                                <div className="relative">
                                                    <img
                                                        src={formData.image_url}
                                                        alt="Preview"
                                                        className="w-full h-40 object-contain rounded-lg border bg-slate-50"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="icon"
                                                        className="absolute top-2 right-2 h-8 w-8"
                                                        onClick={() => handleChange('image_url', '')}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <label className="cursor-pointer">
                                                    <div className={`flex flex-col items-center justify-center h-40 border-2 border-dashed rounded-lg transition-colors ${uploadingImage ? 'border-blue-300 bg-blue-50' : 'border-slate-300 hover:border-blue-400 hover:bg-blue-50/50'}`}>
                                                        {uploadingImage ? (
                                                            <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                                                        ) : (
                                                            <>
                                                                <Upload className="h-8 w-8 text-slate-400 mb-2" />
                                                                <span className="text-sm text-slate-600">Click para subir imagen</span>
                                                                <span className="text-xs text-slate-400 mt-1">JPG, PNG (máx. 5MB)</span>
                                                            </>
                                                        )}
                                                    </div>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={handleImageUpload}
                                                        disabled={uploadingImage}
                                                    />
                                                </label>
                                            )}
                                            <div className="mt-3">
                                                <Label htmlFor="image_url_manual" className="text-xs text-slate-500">O pegar URL</Label>
                                                <Input
                                                    id="image_url_manual"
                                                    value={formData.image_url}
                                                    onChange={(e) => handleChange("image_url", e.target.value)}
                                                    placeholder="https://..."
                                                    className="mt-1"
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* PDF Upload */}
                                    <Card>
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-base flex items-center gap-2">
                                                <FileText className="h-5 w-5 text-red-600" />
                                                Ficha Técnica (PDF)
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            {formData.pdf_link ? (
                                                <div className="relative p-4 bg-slate-50 rounded-lg border">
                                                    <div className="flex items-center gap-3">
                                                        <FileText className="h-10 w-10 text-red-500" />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-slate-700 truncate">Ficha Técnica</p>
                                                            <a
                                                                href={formData.pdf_link}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-xs text-blue-600 hover:underline"
                                                            >
                                                                Ver documento
                                                            </a>
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            variant="destructive"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                            onClick={() => handleChange('pdf_link', '')}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <label className="cursor-pointer">
                                                    <div className={`flex flex-col items-center justify-center h-40 border-2 border-dashed rounded-lg transition-colors ${uploadingPdf ? 'border-red-300 bg-red-50' : 'border-slate-300 hover:border-red-400 hover:bg-red-50/50'}`}>
                                                        {uploadingPdf ? (
                                                            <Loader2 className="h-8 w-8 text-red-500 animate-spin" />
                                                        ) : (
                                                            <>
                                                                <Upload className="h-8 w-8 text-slate-400 mb-2" />
                                                                <span className="text-sm text-slate-600">Click para subir PDF</span>
                                                                <span className="text-xs text-slate-400 mt-1">Máx. 10MB</span>
                                                            </>
                                                        )}
                                                    </div>
                                                    <input
                                                        type="file"
                                                        accept="application/pdf"
                                                        className="hidden"
                                                        onChange={handlePdfUpload}
                                                        disabled={uploadingPdf}
                                                    />
                                                </label>
                                            )}
                                            <div className="mt-3">
                                                <Label htmlFor="pdf_link_manual" className="text-xs text-slate-500">O pegar URL</Label>
                                                <Input
                                                    id="pdf_link_manual"
                                                    value={formData.pdf_link}
                                                    onChange={(e) => handleChange("pdf_link", e.target.value)}
                                                    placeholder="https://..."
                                                    className="mt-1"
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </TabsContent>
                        </div>
                    </Tabs>

                    <DialogFooter className="pt-4 border-t mt-4">
                        <Button type="button" variant="outline" onClick={() => setOpen?.(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                            {productToEdit ? "Guardar Cambios" : "Crear Producto"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
