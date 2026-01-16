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
    "Otros"
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
    const [formCategory, setFormCategory] = useState("Otros");
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
        setFormCategory("Otros");
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
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5 text-primary" />
                            Catálogo de Materiales POP
                        </CardTitle>
                        <CardDescription>Gestiona el inventario de materiales promocionales</CardDescription>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
                        <DialogTrigger asChild>
                            <Button className="btn-medical">
                                <Plus className="h-4 w-4 mr-2" /> Nuevo Material
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{editingMaterial ? "Editar Material" : "Nuevo Material"}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 mt-4">
                                <div className="space-y-2">
                                    <Label>Nombre *</Label>
                                    <Input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Nombre del material" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Categoría</Label>
                                    <Select value={formCategory} onValueChange={setFormCategory}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {CATEGORIES.map(cat => (
                                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>SKU / Código</Label>
                                    <Input value={formSku} onChange={(e) => setFormSku(e.target.value)} placeholder="Código interno" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Descripción</Label>
                                    <Input value={formDescription} onChange={(e) => setFormDescription(e.target.value)} placeholder="Descripción breve" />
                                </div>
                                <div className="space-y-2">
                                    <Label>URL de Imagen</Label>
                                    <Input value={formImageUrl} onChange={(e) => setFormImageUrl(e.target.value)} placeholder="https://..." />
                                </div>
                                <Button onClick={handleSubmit} className="w-full btn-medical">
                                    {editingMaterial ? "Guardar Cambios" : "Crear Material"}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent>
                {/* Search */}
                <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar materiales..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                    />
                </div>

                {/* Table */}
                {loading ? (
                    <div className="text-center py-8 text-muted-foreground">Cargando...</div>
                ) : filteredMaterials.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">No hay materiales registrados.</div>
                ) : (
                    <div className="border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Material</TableHead>
                                    <TableHead>Categoría</TableHead>
                                    <TableHead>SKU</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredMaterials.map(m => (
                                    <TableRow key={m.id}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                {m.image_url ? (
                                                    <img src={m.image_url} alt={m.name} className="w-8 h-8 rounded object-cover" />
                                                ) : (
                                                    <div className="w-8 h-8 rounded bg-muted flex items-center justify-center">
                                                        <Image className="h-4 w-4 text-muted-foreground" />
                                                    </div>
                                                )}
                                                {m.name}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{m.category}</Badge>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm">{m.sku || "-"}</TableCell>
                                        <TableCell>
                                            <Badge className={m.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                                                {m.is_active ? "Activo" : "Inactivo"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button variant="ghost" size="icon" onClick={() => openEditDialog(m)}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(m.id, m.name)}>
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
