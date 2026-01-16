
import { useState, useEffect } from "react";
import { Plus, Search, Stethoscope, Trash2, Edit } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SpecialtyDialog } from "@/components/specialties/SpecialtyDialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
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

export default function Specialties() {
    const { toast } = useToast();
    const [specialties, setSpecialties] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingSpecialty, setEditingSpecialty] = useState<any>(null);

    useEffect(() => {
        loadSpecialties();
    }, []);

    const loadSpecialties = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from("specialties")
                .select("*")
                .order("name", { ascending: true });

            if (error) throw error;
            setSpecialties(data || []);
        } catch (error: any) {
            console.error("Error loading specialties:", error);
            toast({
                title: "Error",
                description: "No se pudieron cargar las especialidades.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (specialty: any) => {
        setEditingSpecialty(specialty);
        setDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        try {
            const { error } = await supabase
                .from("specialties")
                .delete()
                .eq("id", id);

            if (error) throw error;
            toast({
                title: "Especialidad eliminada",
                description: "La especialidad ha sido eliminada correctamente.",
            });
            // Optimistic update
            setSpecialties(prev => prev.filter(s => s.id !== id));
            // Only reload if needed, but the optimistic update handles the UI immediately
            // loadSpecialties();
        } catch (error: any) {
            console.error("Error deleting specialty:", error);
            toast({
                title: "Error",
                description: "No se pudo eliminar la especialidad (puede estar en uso).",
                variant: "destructive",
            });
        }
    };

    const filteredSpecialties = specialties.filter((s) =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Especialidades</h1>
                    <p className="text-muted-foreground">Gestiona las especialidades médicas</p>
                </div>
                <Button onClick={() => { setEditingSpecialty(null); setDialogOpen(true); }}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nueva Especialidad
                </Button>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Buscar especialidad..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                />
            </div>

            {loading ? (
                <div className="text-center py-12 text-muted-foreground">Cargando especialidades...</div>
            ) : filteredSpecialties.length === 0 ? (
                <Card className="medical-card">
                    <CardContent className="text-center py-12">
                        <Stethoscope className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">No hay especialidades</h3>
                        <p className="text-muted-foreground mb-4">Agrega la primera especialidad</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredSpecialties.map((specialty) => (
                        <Card key={specialty.id} className="medical-card hover:shadow-lg transition-shadow group relative">
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-primary/10 rounded-lg">
                                            <Stethoscope className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">{specialty.name}</CardTitle>
                                        </div>
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button variant="ghost" size="icon" onClick={() => handleEdit(specialty)}>
                                            <Edit className="h-4 w-4 text-muted-foreground hover:text-primary" />
                                        </Button>
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
                                                        Esta acción no se puede deshacer. Esto eliminará permanentemente la especialidad.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(specialty.id)}>Eliminar</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {specialty.detail && (
                                    <p className="text-sm text-muted-foreground line-clamp-2">{specialty.detail}</p>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <SpecialtyDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                specialtyToEdit={editingSpecialty}
                onSuccess={loadSpecialties}
            />
        </div>
    );
}
