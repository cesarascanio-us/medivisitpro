
import { useState, useEffect } from "react";
import { Plus, Search, Building2, Trash2, Edit, Store, MapPin, Phone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DrugstoreDialog } from "@/components/drugstores/DrugstoreDialog";
import { DrugstoreInventoryDialog } from "@/components/drugstores/DrugstoreInventoryDialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useDemoData } from "@/contexts/MockDataProvider";

export default function Drugstores() {
    const { toast } = useToast();
    const [drugstores, setDrugstores] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingDrugstore, setEditingDrugstore] = useState<any>(null);

    // Demo mode hook
    const demoData = useDemoData();

    useEffect(() => {
        loadDrugstores();
    }, []);

    const loadDrugstores = async () => {
        try {
            setLoading(true);

            // DEMO MODE: Use mock data
            if (demoData) {
                console.log("Drugstores: Using mock demo data");
                setDrugstores(demoData.drugstores as any[]);
                setLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from("drugstores")
                .select("*")
                .order("name", { ascending: true });

            if (error) throw error;
            setDrugstores(data || []);
        } catch (error: any) {
            console.error("Error loading drugstores:", error);
            toast({
                title: "Error",
                description: "No se pudieron cargar las droguerías.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (drugstore: any) => {
        setEditingDrugstore(drugstore);
        setDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        try {
            const { error } = await supabase
                .from("drugstores")
                .delete()
                .eq("id", id);

            if (error) throw error;
            toast({
                title: "Droguería eliminada",
                description: "La droguería ha sido eliminada correctamente.",
            });
            loadDrugstores();
        } catch (error: any) {
            console.error("Error deleting drugstore:", error);
            toast({
                title: "Error",
                description: "No se pudo eliminar la droguería (puede estar en uso).",
                variant: "destructive",
            });
        }
    };

    const filteredDrugstores = drugstores.filter((d) =>
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.location?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Droguerías</h1>
                    <p className="text-muted-foreground">Gestiona las droguerías y distribuidores</p>
                </div>
                <Button onClick={() => { setEditingDrugstore(null); setDialogOpen(true); }}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nueva Droguería
                </Button>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Buscar por nombre o ubicación..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                />
            </div>

            {loading ? (
                <div className="text-center py-12 text-muted-foreground">Cargando droguerías...</div>
            ) : filteredDrugstores.length === 0 ? (
                <Card className="medical-card">
                    <CardContent className="text-center py-12">
                        <Building2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">No hay droguerías</h3>
                        <p className="text-muted-foreground mb-4">Registra la primera droguería</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredDrugstores.map((drugstore) => (
                        <Card key={drugstore.id} className="medical-card hover:shadow-lg transition-shadow group relative">
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-secondary/10 rounded-lg">
                                            <Store className="h-5 w-5 text-secondary" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">{drugstore.name}</CardTitle>
                                            <Badge variant="secondary" className="mt-1 text-xs">
                                                {drugstore.type}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button variant="ghost" size="icon" onClick={() => handleEdit(drugstore)}>
                                            <Edit className="h-4 w-4 text-muted-foreground hover:text-primary" />
                                        </Button>
                                        <DrugstoreInventoryDialog
                                            drugstoreId={drugstore.id}
                                            drugstoreName={drugstore.name}
                                            trigger={
                                                <Button variant="ghost" size="icon" title="Gestionar Inventario">
                                                    <Store className="h-4 w-4 text-muted-foreground hover:text-blue-600" />
                                                </Button>
                                            }
                                        />
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Esta acción no se puede deshacer. Se eliminará el registro de la droguería.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(drugstore.id)}>Eliminar</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm text-muted-foreground">
                                {drugstore.location && (
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4" />
                                        <span>{drugstore.location}</span>
                                    </div>
                                )}
                                {drugstore.phone && (
                                    <div className="flex items-center gap-2">
                                        <Phone className="h-4 w-4" />
                                        <span>{drugstore.phone}</span>
                                    </div>
                                )}
                                {drugstore.contact_name && (
                                    <p className="mt-2 text-xs">Contacto: <span className="font-medium text-foreground">{drugstore.contact_name}</span></p>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <DrugstoreDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                drugstoreToEdit={editingDrugstore}
                onSuccess={loadDrugstores}
            />
        </div>
    );
}
