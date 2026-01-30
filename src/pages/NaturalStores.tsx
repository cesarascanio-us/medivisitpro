
import { useState, useEffect } from "react";
import {
    Plus,
    Search,
    Leaf,
    RefreshCw,
    Building,
    MapPin,
    Phone,
    Edit,
    Eye,
    Trash2
} from "lucide-react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { NaturalStoreFormDialog } from "@/components/pharma/NaturalStoreFormDialog";

export default function NaturalStores() {
    const [naturalStores, setNaturalStores] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const { user, organizationId } = useAuth();

    // Dialog States
    const [formDialogOpen, setFormDialogOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedStore, setSelectedStore] = useState<any>(null);

    const [formData, setFormData] = useState({
        name: "",
        rif: "",
        owner_name: "",
        sanitary_permits: false,
        address: "",
        city: "",
        phone: "",
        email: "",
        contact_type: "natural_store"
    });

    useEffect(() => {
        if (organizationId) {
            loadNaturalStores();
        }
    }, [organizationId]);

    const loadNaturalStores = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('contacts')
                .select('*')
                .eq('contact_type', 'natural_store')
                .eq('organization_id', organizationId)
                .order('name');

            if (error) throw error;
            setNaturalStores(data || []);
        } catch (error: any) {
            toast({
                title: "Error al cargar datos",
                description: error.message,
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleFormSubmit = async () => {
        if (!formData.name || !formData.rif) {
            toast({
                title: "Campos Requeridos",
                description: "Nombre y RIF son obligatorios para el Alta Comercial.",
                variant: "destructive"
            });
            return;
        }

        try {
            if (isEditing && selectedStore) {
                const { error } = await supabase
                    .from('contacts')
                    .update({
                        ...formData,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', selectedStore.id);

                if (error) throw error;
                toast({ title: "Éxito", description: "Tienda actualizada correctamente." });
            } else {
                const { error } = await supabase
                    .from('contacts')
                    .insert([{
                        ...formData,
                        contact_type: 'natural_store', // Garantizar tipo
                        user_id: user?.id,
                        organization_id: organizationId
                    }]);

                if (error) throw error;
                toast({ title: "Éxito", description: "Alta Comercial completada. Tienda registrada." });
            }
            setFormDialogOpen(false);
            loadNaturalStores();
        } catch (error: any) {
            toast({
                title: "Error al guardar",
                description: error.message,
                variant: "destructive"
            });
        }
    };

    const handleEditStore = (store: any) => {
        setSelectedStore(store);
        setFormData({
            name: store.name || "",
            rif: store.rif || "",
            owner_name: store.owner_name || "",
            sanitary_permits: store.sanitary_permits || false,
            address: store.address || "",
            city: store.city || "",
            phone: store.phone || "",
            email: store.email || "",
            contact_type: "natural_store"
        });
        setIsEditing(true);
        setFormDialogOpen(true);
    };

    const handleDeleteStore = async (id: string) => {
        try {
            const { error } = await supabase.from('contacts').delete().eq('id', id);
            if (error) throw error;
            toast({ title: "Eliminado", description: "La tienda ha sido eliminada del directorio." });
            loadNaturalStores();
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    };

    const filteredStores = naturalStores.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.rif?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container mx-auto p-4 space-y-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-emerald-50 p-6 rounded-xl border border-emerald-100">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-emerald-600 rounded-lg text-white shadow-lg shadow-emerald-500/20">
                        <Leaf className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-emerald-900">Tiendas Naturistas</h1>
                        <p className="text-emerald-600 font-medium">Gestión de Alta Comercial 🌿</p>
                    </div>
                </div>
                <Button
                    onClick={() => {
                        setIsEditing(false);
                        setFormData({
                            name: "",
                            rif: "",
                            owner_name: "",
                            sanitary_permits: false,
                            address: "",
                            city: "",
                            phone: "",
                            email: "",
                            contact_type: "natural_store"
                        });
                        setFormDialogOpen(true);
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 shadow-md"
                >
                    <Plus className="h-4 w-4 mr-2" /> Nueva Tienda
                </Button>
            </div>

            {/* List and Search */}
            <Card className="border-emerald-50 shadow-sm">
                <CardHeader className="pb-3 border-b border-emerald-50/50">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                        <CardTitle className="text-lg text-emerald-900 flex items-center gap-2">
                            <Building className="h-4 w-4" /> Directorio Comercial
                        </CardTitle>
                        <div className="flex gap-2">
                            <div className="relative w-full md:w-80">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar por nombre o RIF..."
                                    className="pl-10 focus-visible:ring-emerald-500"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Button variant="outline" size="icon" onClick={loadNaturalStores} className="border-emerald-200">
                                <RefreshCw className="h-4 w-4 text-emerald-600" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-6 px-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-emerald-50/30">
                                <TableRow>
                                    <TableHead className="pl-6">Tienda Naturista</TableHead>
                                    <TableHead>Ciudad / Dirección</TableHead>
                                    <TableHead>RIF</TableHead>
                                    <TableHead>Estatus</TableHead>
                                    <TableHead className="text-right pr-6">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    Array(5).fill(0).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell className="pl-6"><div className="h-4 w-32 bg-slate-100 animate-pulse rounded" /></TableCell>
                                            <TableCell><div className="h-4 w-40 bg-slate-100 animate-pulse rounded" /></TableCell>
                                            <TableCell><div className="h-4 w-20 bg-slate-100 animate-pulse rounded" /></TableCell>
                                            <TableCell><div className="h-4 w-16 bg-slate-100 animate-pulse rounded" /></TableCell>
                                            <TableCell className="text-right pr-6"><div className="h-8 w-8 ml-auto bg-slate-100 animate-pulse rounded" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : filteredStores.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-64 text-center">
                                            <div className="flex flex-col items-center justify-center text-muted-foreground">
                                                <Leaf className="h-12 w-12 mb-4 opacity-5 text-emerald-400" />
                                                <p>No se encontraron tiendas naturistas.</p>
                                                <p className="text-sm">Comienza agregando una nueva tienda al sistema.</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredStores.map(store => (
                                        <TableRow key={store.id} className="hover:bg-emerald-50/10 transition-colors">
                                            <TableCell className="pl-6 font-medium text-emerald-950">
                                                <div className="flex flex-col">
                                                    <span>{store.name}</span>
                                                    <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-normal">
                                                        <Phone className="h-2.5 w-2.5" /> {store.phone || 'Sin teléfono'}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col max-w-[200px]">
                                                    <span className="text-xs font-semibold">{store.city || 'S/C'}</span>
                                                    <span className="text-xs text-muted-foreground truncate">{store.address || 'Sin dirección'}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="font-mono text-[10px] border-emerald-100 text-emerald-800">
                                                    {store.rif}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={store.sanitary_permits ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-200" : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200"}>
                                                    {store.sanitary_permits ? "Activa" : "Pendiente"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right pr-6">
                                                <div className="flex justify-end gap-2 text-right">
                                                    <Button variant="ghost" size="sm" onClick={() => handleEditStore(store)}>
                                                        <Edit className="h-4 w-4 text-emerald-600" />
                                                    </Button>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="ghost" size="sm">
                                                                <Trash2 className="h-4 w-4 text-red-500" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Esta acción eliminará a <strong>{store.name}</strong> del directorio de Tiendas Naturistas.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => handleDeleteStore(store.id)} className="bg-red-600 hover:bg-red-700 font-medium">
                                                                    Eliminar Tienda
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Form Dialog */}
            <NaturalStoreFormDialog
                open={formDialogOpen}
                onOpenChange={setFormDialogOpen}
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleFormSubmit}
                isEditing={isEditing}
            />
        </div>
    );
}
