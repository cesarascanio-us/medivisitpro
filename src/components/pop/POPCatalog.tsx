/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
 ======================================================================== */

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Search, Edit, Trash2, Package, Image } from "lucide-react";

interface POPMaterial {
    id: string;
    name: string;
    category: string;
    description: string | null;
    image_url: string | null;
    sku: string | null;
    is_active: boolean;
}

const CATEGORIES = [
    "Folletos",
    "Banners",
    "Posters",
    "Merchandising",
    "Displays",
    "Tarjetas",
    "Equipos Médicos"
];

export function POPCatalog() {
    const { toast } = useToast();
    const [materials, setMaterials] = useState<POPMaterial[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingMaterial, setEditingMaterial] = useState<POPMaterial | null>(null);

    // Form state
    const [formName, setFormName] = useState("");
    const [formCategory, setFormCategory] = useState("Folletos");
    const [formDescription, setFormDescription] = useState("");
    const [formSku, setFormSku] = useState("");
    const [formImageUrl, setFormImageUrl] = useState("");

    useEffect(() => {
        loadMaterials();
    }, []);

    const loadMaterials = async () => {
        setLoading(true);
        const { data, error } = await (supabase as any)
            .from('pop_materials')
            .select('*')
            .order('name');

        if (error) {
            console.error('Error loading materials:', error);
        } else {
            setMaterials(data || []);
        }
        setLoading(false);
    };

    const resetForm = () => {
        setFormName("");
        setFormCategory("Folletos");
        setFormDescription("");
        setFormSku("");
        setFormImageUrl("");
        setEditingMaterial(null);
    };

    const openEditDialog = (material: POPMaterial) => {
        setEditingMaterial(material);
        setFormName(material.name);
        setFormCategory(material.category);
        setFormDescription(material.description || "");
        setFormSku(material.sku || "");
        setFormImageUrl(material.image_url || "");
        setIsDialogOpen(true);
    };

    const handleSubmit = async () => {
        if (!formName.trim()) {
            toast({ title: "Error", description: "El nombre es requerido.", variant: "destructive" });
            return;
        }

        const payload = {
            name: formName,
            category: formCategory,
            description: formDescription || null,
            sku: formSku || null,
            image_url: formImageUrl || null
        };

        if (editingMaterial) {
            const { error } = await (supabase as any)
                .from('pop_materials')
                .update(payload)
                .eq('id', editingMaterial.id);

            if (error) {
                toast({ title: "Error", description: "No se pudo actualizar.", variant: "destructive" });
            } else {
                toast({ title: "Actualizado", description: "Material actualizado correctamente." });
                loadMaterials();
            }
        } else {
            const { error } = await (supabase as any)
                .from('pop_materials')
                .insert([payload]);

            if (error) {
                toast({ title: "Error", description: "No se pudo crear.", variant: "destructive" });
            } else {
                toast({ title: "Creado", description: "Material agregado al catálogo." });
                loadMaterials();
            }
        }

        setIsDialogOpen(false);
        resetForm();
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`¿Eliminar "${name}"?`)) return;

        const { error } = await (supabase as any)
            .from('pop_materials')
            .delete()
            .eq('id', id);

        if (error) {
            toast({ title: "Error", description: "No se pudo eliminar.", variant: "destructive" });
        } else {
            toast({ title: "Eliminado", description: "Material eliminado." });
            loadMaterials();
        }
    };

    const filteredMaterials = materials.filter(m =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Card className="border-none shadow-soft rounded-[2rem] overflow-hidden font-outfit font-bold">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-xl font-black text-slate-800">
                            <Package className="h-6 w-6 text-emerald-600" />
                            Catálogo de Materiales POP
                        </CardTitle>
                        <CardDescription className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Gestión Elite de Materiales de Visibilidad 📦</CardDescription>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
                        <DialogTrigger asChild>
                            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-[10px] tracking-widest h-12 px-8 rounded-xl shadow-lg shadow-emerald-500/20">
                                <Plus className="h-4 w-4 mr-2" /> Nuevo Material Master
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="rounded-[2.5rem] border-none shadow-3xl p-10 font-outfit">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-black text-slate-800 tracking-tight">{editingMaterial ? "Ajustar Material Master" : "Nuevo Alta POP Intel"}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-6 mt-8">
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Identificación *</Label>
                                    <Input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Ej: Banner Línea OTS" className="h-14 font-bold border-slate-200 rounded-xl" />
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Categoría Terapéutica / Tipo</Label>
                                    <Select value={formCategory} onValueChange={setFormCategory}>
                                        <SelectTrigger className="h-14 border-slate-200 rounded-xl font-bold">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border-slate-100 shadow-2xl">
                                            {CATEGORIES.map(cat => (
                                                <SelectItem key={cat} value={cat} className="font-bold py-3">{cat}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">SKU / Código Interno</Label>
                                    <Input value={formSku} onChange={(e) => setFormSku(e.target.value)} placeholder="000-POP-000" className="h-14 font-bold border-slate-200 rounded-xl" />
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Descripción Técnica</Label>
                                    <Input value={formDescription} onChange={(e) => setFormDescription(e.target.value)} placeholder="Cualidades del material..." className="h-14 font-bold border-slate-200 rounded-xl" />
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">URL de Recurso Visual</Label>
                                    <Input value={formImageUrl} onChange={(e) => setFormImageUrl(e.target.value)} placeholder="https://..." className="h-14 font-bold border-slate-200 rounded-xl" />
                                </div>
                                <Button onClick={handleSubmit} className="w-full h-15 bg-slate-900 hover:bg-black text-white font-black uppercase tracking-widest text-[11px] rounded-xl shadow-xl mt-4">
                                    {editingMaterial ? "Confirmar Cambios" : "Autorizar Alta POP"}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent className="p-8">
                {/* Search Master */}
                <div className="relative mb-8 group">
                    <Search className="absolute left-6 h-6 w-6 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                    <Input
                        placeholder="Filtrar por material, categoría o SKU..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-16 h-16 bg-slate-50/50 border-transparent focus:bg-white focus:ring-emerald-500/10 rounded-2xl font-bold shadow-inner uppercase tracking-wider text-xs"
                    />
                </div>

                {/* Table Master */}
                {loading ? (
                    <div className="text-center py-20 text-slate-300 font-black uppercase tracking-[0.4em] animate-pulse">Cargando Datastream...</div>
                ) : filteredMaterials.length === 0 ? (
                    <div className="text-center py-20 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-100 flex flex-col items-center gap-4 opacity-50">
                        <Package className="h-20 w-20 text-slate-300" />
                        <p className="font-black text-slate-400 uppercase tracking-widest">No hay materiales industriales registrados.</p>
                    </div>
                ) : (
                    <div className="border border-slate-100 rounded-[2rem] overflow-hidden shadow-sm">
                        <Table>
                            <TableHeader className="bg-slate-50/80">
                                <TableRow>
                                    <TableHead className="pl-10 h-16 text-[10px] font-black uppercase tracking-widest text-slate-400">Material de Visibilidad</TableHead>
                                    <TableHead className="h-16 text-[10px] font-black uppercase tracking-widest text-slate-400">Categoría</TableHead>
                                    <TableHead className="h-16 text-[10px] font-black uppercase tracking-widest text-slate-400">SKU Master</TableHead>
                                    <TableHead className="h-16 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</TableHead>
                                    <TableHead className="text-right pr-10 h-16 text-[10px] font-black uppercase tracking-widest text-slate-400">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredMaterials.map(m => (
                                    <TableRow key={m.id} className="hover:bg-emerald-50/30 transition-all border-none group">
                                        <TableCell className="pl-10 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center overflow-hidden">
                                                    {m.image_url ? (
                                                        <img src={m.image_url} alt={m.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Image className="h-6 w-6 text-slate-200" />
                                                    )}
                                                </div>
                                                <span className="font-black text-slate-800 uppercase tracking-tight group-hover:text-emerald-700 transition-colors">{m.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="bg-white border-slate-200 font-black text-[9px] uppercase px-3 py-1 rounded-full">{m.category}</Badge>
                                        </TableCell>
                                        <TableCell className="text-slate-400 text-xs font-mono font-bold tracking-wider">{m.sku || "-"}</TableCell>
                                        <TableCell>
                                            <Badge className={m.is_active ? "bg-emerald-100 text-emerald-800 border-none px-4" : "bg-slate-100 text-slate-400 border-none px-4"}>
                                                {m.is_active ? "CALIFICADO" : "OBSOLETO"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right pr-10">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                <Button variant="ghost" size="icon" onClick={() => openEditDialog(m)} className="h-10 w-10 bg-white hover:bg-slate-900 hover:text-white rounded-xl shadow-md border border-slate-100">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-10 w-10 bg-white hover:text-red-600 rounded-xl shadow-md border border-red-50" onClick={() => handleDelete(m.id, m.name)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
