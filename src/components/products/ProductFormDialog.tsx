/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
 ======================================================================== */

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input as BaseInput } from "@/components/ui/input";
import { Textarea as BaseTextarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger as BaseSelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
    Loader2, Plus, Edit, Check, ChevronsUpDown, X, Upload, ImageIcon, FileText, Trash2,
    Package, Stethoscope, ShoppingBag, GraduationCap, Files, Sparkles, Beaker, Tag, BarChart3, Info, Globe, ShieldAlert,
    ChevronRight,
    Search,
    LayoutDashboard,
    Clock,
    Target
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
import { Badge } from "@/badge";
import { Separator } from "@/components/ui/separator";

// -- High Contrast Wrappers --
const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<typeof BaseInput>>((props, ref) => (
    <BaseInput
        ref={ref}
        {...props}
        className={cn("h-12 border-border rounded-xl font-bold focus:ring-indigo-500/10 focus:border-indigo-500 bg-muted shadow-sm transition-all", props.className)}
    />
));
Input.displayName = "HighContrastInput";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<typeof BaseTextarea>>((props, ref) => (
    <BaseTextarea
        ref={ref}
        {...props}
        className={cn("border-border rounded-xl font-medium focus:ring-indigo-500/10 focus:border-indigo-500 bg-muted shadow-sm transition-all p-4", props.className)}
    />
));
Textarea.displayName = "HighContrastTextarea";

const SelectTrigger = React.forwardRef<React.ElementRef<typeof BaseSelectTrigger>, React.ComponentPropsWithoutRef<typeof BaseSelectTrigger>>((props, ref) => (
    <BaseSelectTrigger
        ref={ref}
        {...props}
        className={cn("h-12 border-slate-200 rounded-xl font-bold focus:ring-indigo-500/10 focus:border-indigo-500 bg-slate-50/50 shadow-sm [&>span]:line-clamp-1", props.className)}
    />
));
SelectTrigger.displayName = "HighContrastSelectTrigger";
// ----------------------------

interface ProductFormDialogProps {
    trigger?: React.ReactNode;
    productToEdit?: any;
    onSuccess?: () => void;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function ProductFormDialog({ trigger, productToEdit, onSuccess, open: constrainedOpen, onOpenChange }: ProductFormDialogProps) {
    const { organizationId } = useAuth();
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

        // Medical Info
        indications: "",
        composition: "",
        dosage: "",
        posology: "",
        medical_specialties: "",
        contraindications: "",
        side_effects: "",
        safety_info: "",
        clinical_evidence: "",

        // Commercial Info
        key_message: "",
        selling_points: {
            clinical: "",
            experience: "",
            evidence: ""
        } as any,
        profitability_info: "",

        // Training Info
        sales_tips: "",
        objection_handling: "",

        // Resources
        image_url: "",
        pdf_link: "",
        dosage_config: {
            default_dose_mg_kg: 0,
            concentration_mg_ml: 1,
            presentation_unit: "mL"
        }
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
                selling_points: typeof productToEdit.selling_points === 'object' && productToEdit.selling_points !== null
                    ? productToEdit.selling_points
                    : { clinical: "", experience: "", evidence: "" },
                profitability_info: productToEdit.profitability_info || "",

                sales_tips: productToEdit.sales_tips || "",
                objection_handling: productToEdit.objection_handling || "",

                image_url: productToEdit.image_url || "",
                pdf_link: productToEdit.pdf_link || "",
                dosage_config: productToEdit.dosage_config || {
                    default_dose_mg_kg: 0,
                    concentration_mg_ml: 1,
                    presentation_unit: "mL"
                }
            });
        } else if (open) {
            setFormData({
                product_code: "", sku: "", name: "", active_ingredients: "", presentation: "",
                category: "", description: "", therapeutic_area: "", price: "",
                indications: "", composition: "", dosage: "", posology: "", medical_specialties: "",
                contraindications: "", side_effects: "", safety_info: "", clinical_evidence: "",
                key_message: "", selling_points: { clinical: "", experience: "", evidence: "" }, profitability_info: "",
                sales_tips: "", objection_handling: "",
                image_url: "", pdf_link: "",
                dosage_config: {
                    default_dose_mg_kg: 0,
                    concentration_mg_ml: 1,
                    presentation_unit: "mL"
                }
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

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        setUploadingImage(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = `products/${fileName}`;
            const { error: uploadError } = await supabase.storage.from('product-assets').upload(filePath, file);
            if (uploadError) throw uploadError;
            const { data: { publicUrl } } = supabase.storage.from('product-assets').getPublicUrl(filePath);
            handleChange('image_url', publicUrl);
            toast({ title: "Éxito", description: "Imagen subida correctamente" });
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setUploadingImage(false);
        }
    };

    const handlePdfUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || file.type !== 'application/pdf') return;
        setUploadingPdf(true);
        try {
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.pdf`;
            const filePath = `products/pdfs/${fileName}`;
            const { error: uploadError } = await supabase.storage.from('product-assets').upload(filePath, file);
            if (uploadError) throw uploadError;
            const { data: { publicUrl } } = supabase.storage.from('product-assets').getPublicUrl(filePath);
            handleChange('pdf_link', publicUrl);
            toast({ title: "Éxito", description: "PDF subido correctamente" });
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setUploadingPdf(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (!formData.name || !formData.category) throw new Error("Nombre y categoría requeridos");
            const productPayload = {
                organization_id: organizationId,
                product_code: formData.product_code || null,
                sku: formData.sku || null,
                name: formData.name,
                active_ingredients: formData.active_ingredients.split(",").map(s => s.trim()).filter(Boolean),
                presentation: formData.presentation || null,
                category: formData.category,
                description: formData.description || null,
                therapeutic_area: formData.therapeutic_area || null,
                price: formData.price ? parseFloat(formData.price) : null,
                indications: formData.indications || null,
                composition: formData.composition || null,
                dosage: formData.dosage || null,
                posology: formData.posology || null,
                medical_specialties: formData.medical_specialties || null,
                contraindications: formData.contraindications || null,
                side_effects: formData.side_effects || null,
                safety_info: formData.safety_info || null,
                clinical_evidence: formData.clinical_evidence || null,
                key_message: formData.key_message || null,
                selling_points: formData.selling_points || null,
                profitability_info: formData.profitability_info || null,
                sales_tips: formData.sales_tips || null,
                objection_handling: formData.objection_handling || null,
                image_url: formData.image_url || null,
                pdf_link: formData.pdf_link || null,
                dosage_config: formData.dosage_config
            };

            let error;
            if (productToEdit?.id) {
                const { error: updateError } = await supabase.from('products').update(productPayload).eq('id', productToEdit.id);
                error = updateError;
            } else {
                const { error: insertError } = await supabase.from('products').insert([productPayload]);
                error = insertError;
            }
            if (error) throw error;
            toast({ title: "Producto guardado", variant: "default" });
            if (setOpen) setOpen(false);
            if (onSuccess) onSuccess();
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const categories = [
        "Cardiovascular", "Neurológico", "Oncológico", "Endocrinología",
        "Gastroenterología", "Respiratorio", "Dermatología", "Pediatría",
        "Ginecología", "Urología", "Inmunología", "Oftalmología"
    ];

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="max-w-5xl p-0 overflow-hidden border-none shadow-2xl rounded-3xl">
                {/* Product Header */}
                <div className="bg-gradient-to-br from-indigo-700 via-indigo-800 to-slate-900 px-8 py-10 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Package className="w-32 h-32" />
                    </div>
                    <div className="relative z-10 flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-background/10 backdrop-blur-xl border border-border/20 flex items-center justify-center shadow-inner">
                            {formData.image_url ? (
                                <img src={formData.image_url} className="w-full h-full object-cover rounded-2xl" alt="Preview" />
                            ) : (
                                <Beaker className="w-8 h-8 text-white" />
                            )}
                        </div>
                        <div>
                            <DialogTitle className="text-3xl font-black tracking-tight text-white mb-1">
                                {productToEdit ? 'Master Record de Producto' : 'Lanzamiento de Producto'}
                            </DialogTitle>
                            <p className="text-indigo-200/70 font-bold text-xs uppercase tracking-[0.2em] mt-1.5">
                                Portafolio Farmacéutico & Recursos Científicos 💊
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row h-[650px]">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col md:flex-row w-full h-full">
                        {/* Sidebar */}
                        <TabsList className="flex flex-row md:flex-col items-stretch justify-start bg-slate-50 border-r border-slate-100 p-4 h-auto md:w-64 space-y-1 text-slate-900">
                            <TabsTrigger
                                value="basic"
                                className="flex items-center justify-start gap-3 px-4 py-3 rounded-xl font-bold text-slate-500 data-[state=active]:bg-card data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm transition-all"
                            >
                                <Tag className="w-4 h-4" />
                                <span className="text-xs uppercase tracking-tight">Ficha Básica</span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="medical"
                                className="flex items-center justify-start gap-3 px-4 py-3 rounded-xl font-bold text-slate-500 data-[state=active]:bg-card data-[state=active]:text-blue-700 data-[state=active]:shadow-sm transition-all"
                            >
                                <Stethoscope className="w-4 h-4" />
                                <span className="text-xs uppercase tracking-tight">Científica</span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="commercial"
                                className="flex items-center justify-start gap-3 px-4 py-3 rounded-xl font-bold text-slate-500 data-[state=active]:bg-card data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm transition-all"
                            >
                                <BarChart3 className="w-4 h-4" />
                                <span className="text-xs uppercase tracking-tight">Marketing</span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="training"
                                className="flex items-center justify-start gap-3 px-4 py-3 rounded-xl font-bold text-slate-500 data-[state=active]:bg-card data-[state=active]:text-purple-700 data-[state=active]:shadow-sm transition-all"
                            >
                                <GraduationCap className="w-4 h-4" />
                                <span className="text-xs uppercase tracking-tight">Entrenamiento</span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="resources"
                                className="flex items-center justify-start gap-3 px-4 py-3 rounded-xl font-bold text-slate-500 data-[state=active]:bg-card data-[state=active]:text-orange-700 data-[state=active]:shadow-sm transition-all"
                            >
                                <Files className="w-4 h-4" />
                                <span className="text-xs uppercase tracking-tight">Activos Digitales</span>
                            </TabsTrigger>
                        </TabsList>

                        <div className="flex-1 overflow-y-auto bg-card">
                            <form onSubmit={handleSubmit} id="product-form" className="h-full flex flex-col">
                                {/* Tab: Básico */}
                                <TabsContent value="basic" className="p-8 space-y-8 m-0 animate-in fade-in slide-in-from-right-2">
                                    <section className="space-y-6">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="w-1.5 h-6 bg-indigo-600 rounded-full text-white" />
                                            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Identificación de Mercado</h3>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Nombre Comercial *</Label>
                                            <Input
                                                value={formData.name}
                                                onChange={(e) => handleChange("name", e.target.value)}
                                                placeholder="Ej: Cardioprotect Plus"
                                                required
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Código PRD</Label>
                                                <Input value={formData.product_code} onChange={(e) => handleChange("product_code", e.target.value)} placeholder="PRD-000" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">GTIN / SKU</Label>
                                                <Input value={formData.sku} onChange={(e) => handleChange("sku", e.target.value)} placeholder="00000000" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">PVP Sugerido ($)</Label>
                                                <Input type="number" step="0.01" value={formData.price} onChange={(e) => handleChange("price", e.target.value)} placeholder="0.00" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Categoría Farmacéutica *</Label>
                                                <Select value={formData.category} onValueChange={(val) => handleChange("category", val)}>
                                                    <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                                                    <SelectContent>
                                                        {categories.map((cat) => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Área Terapéutica</Label>
                                                <Input value={formData.therapeutic_area} onChange={(e) => handleChange("therapeutic_area", e.target.value)} placeholder="Ej: Cardiovascular" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Presentación Pública</Label>
                                            <Input value={formData.presentation} onChange={(e) => handleChange("presentation", e.target.value)} placeholder="Ej: Cápsulas 500mg x 30" />
                                        </div>
                                    </section>
                                </TabsContent>

                                {/* Tab: Científica */}
                                <TabsContent value="medical" className="p-8 space-y-8 m-0 animate-in fade-in slide-in-from-right-2">
                                    <section className="space-y-6">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="w-1.5 h-6 bg-blue-600 rounded-full text-white" />
                                            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Dossier Científico</h3>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase text-slate-500 ml-1 text-blue-600">Indicaciones Terapéuticas</Label>
                                            <Textarea value={formData.indications} onChange={(e) => handleChange("indications", e.target.value)} rows={3} />
                                        </div>
                                        <div className="space-y-4 pt-4 border-t">
                                            <div className="bg-blue-50/50 p-6 rounded-3xl space-y-4">
                                                <h4 className="text-xs font-black uppercase tracking-widest text-blue-800 flex items-center gap-2">
                                                    <Sparkles className="h-4 w-4" /> Algoritmo de Dosificación
                                                </h4>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <div className="space-y-2">
                                                        <Label className="text-[9px] font-bold uppercase text-blue-400">Dosis (mg/kg)</Label>
                                                        <Input type="number" value={formData.dosage_config.default_dose_mg_kg} onChange={(e) => handleChange("dosage_config", { ...formData.dosage_config, default_dose_mg_kg: Number(e.target.value) })} className="h-10 bg-muted" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-[9px] font-bold uppercase text-blue-400">Conc. (mg/mL)</Label>
                                                        <Input type="number" value={formData.dosage_config.concentration_mg_ml} onChange={(e) => handleChange("dosage_config", { ...formData.dosage_config, concentration_mg_ml: Number(e.target.value) })} className="h-10 bg-muted" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-[9px] font-bold uppercase text-blue-400">Unidad</Label>
                                                        <Input value={formData.dosage_config.presentation_unit} onChange={(e) => handleChange("dosage_config", { ...formData.dosage_config, presentation_unit: e.target.value })} className="h-10 bg-muted" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Efectos & Seguridad</Label>
                                            <Textarea value={formData.safety_info} onChange={(e) => handleChange("safety_info", e.target.value)} placeholder="Contraindicaciones, efectos adversos..." rows={4} />
                                        </div>
                                    </section>
                                </TabsContent>

                                {/* Tab: Marketing */}
                                <TabsContent value="commercial" className="p-8 space-y-8 m-0 animate-in fade-in slide-in-from-right-2">
                                    <section className="space-y-6">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="w-1.5 h-6 bg-indigo-600 rounded-full text-white" />
                                            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Estrategia Comercial</h3>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Mensaje Clave (Marketing Copy)</Label>
                                            <Textarea value={formData.key_message} onChange={(e) => handleChange("key_message", e.target.value)} placeholder="El core visual y textual del producto..." rows={3} />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Argumento Clínico</Label>
                                                <Textarea value={formData.selling_points?.clinical} onChange={(e) => handleChange("selling_points", { ...formData.selling_points, clinical: e.target.value })} rows={2} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Argumento Económico</Label>
                                                <Textarea value={formData.profitability_info} onChange={(e) => handleChange("profitability_info", e.target.value)} rows={2} />
                                            </div>
                                        </div>
                                    </section>
                                </TabsContent>

                                {/* Tab: Training */}
                                <TabsContent value="training" className="p-8 space-y-8 m-0 animate-in fade-in slide-in-from-right-2">
                                    <section className="space-y-6">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="w-1.5 h-6 bg-purple-600 rounded-full" />
                                            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Guía del Visitador</h3>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase text-slate-500 ml-1 text-purple-600">Tips de Ventas & Objeciones</Label>
                                            <Textarea value={formData.sales_tips} onChange={(e) => handleChange("sales_tips", e.target.value)} placeholder="¿Cómo presentar este producto exitosamente?" rows={6} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Manejo de Objeciones</Label>
                                            <Textarea value={formData.objection_handling} onChange={(e) => handleChange("objection_handling", e.target.value)} placeholder="¿Qué responder si el médico dice X?" rows={4} />
                                        </div>
                                    </section>
                                </TabsContent>

                                {/* Tab: Activos */}
                                <TabsContent value="resources" className="p-8 space-y-8 m-0 animate-in fade-in slide-in-from-right-2">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-6">
                                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Visuales del Pack</h3>
                                            <div className="group relative aspect-square w-full max-w-[240px] rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center overflow-hidden hover:border-emerald-500 transition-all">
                                                {formData.image_url ? (
                                                    <>
                                                        <img src={formData.image_url} className="w-full h-full object-contain p-4" alt="Product" />
                                                        <Button onClick={() => handleChange('image_url', '')} variant="destructive" size="icon" className="absolute top-2 right-2 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="h-4 w-4" /></Button>
                                                    </>
                                                ) : (
                                                    <div className="flex flex-col items-center gap-3">
                                                        <div className="w-12 h-12 rounded-2xl bg-muted shadow-sm flex items-center justify-center text-slate-300"><ImageIcon className="h-6 w-6" /></div>
                                                        <div className="text-center"><Label className="cursor-pointer text-[10px] font-black text-emerald-600 block">SUBIR IMAGEN</Label><Input type="file" className="hidden" id="img-up" onChange={handleImageUpload} accept="image/*" /></div>
                                                    </div>
                                                )}
                                                <label htmlFor="img-up" className="absolute inset-0 cursor-pointer" />
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Literatura Médica (PDF)</h3>
                                            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 space-y-4 text-slate-900">
                                                <div className="w-12 h-12 bg-muted rounded-2xl shadow-sm flex items-center justify-center text-orange-500"><FileText className="h-6 w-6" /></div>
                                                <div className="space-y-1">
                                                    <p className="font-bold text-slate-700">Dossier de Producto</p>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Vademécum & Estudios</p>
                                                </div>
                                                {formData.pdf_link ? (
                                                    <div className="flex items-center justify-between gap-3 p-3 bg-muted rounded-xl border border-slate-100">
                                                        <span className="text-[10px] font-bold text-emerald-600 truncate">ARCHIVO VINCULADO</span>
                                                        <Button onClick={() => handleChange('pdf_link', '')} variant="ghost" size="sm" className="h-7 w-7 p-0 text-slate-400"><X className="h-4 w-4" /></Button>
                                                    </div>
                                                ) : (
                                                    <Button variant="outline" className="w-full h-12 rounded-xl border-slate-200 font-bold text-slate-500 relative overflow-hidden">
                                                        <Upload className="h-4 w-4 mr-2" /> Subir PDF
                                                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handlePdfUpload} accept=".pdf" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>
                            </form>
                        </div>
                    </Tabs>
                </div>

                <div className="bg-slate-50 border-t border-slate-100 px-8 py-6 flex items-center justify-between gap-4 text-slate-900">
                    <Button variant="ghost" onClick={() => setOpen(false)} className="h-12 px-6 font-bold text-slate-500 rounded-xl">Cerrar</Button>
                    <Button type="submit" form="product-form" disabled={loading} className="h-12 px-10 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl shadow-indigo-500/20 transition-all hover:scale-[1.02]">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {productToEdit ? 'Actualizar Master Record' : 'Publicar Producto'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

