import { useState, useEffect } from "react";
import { Plus, MapPin, Search, Trash2, Edit, Check, X, Users as UsersIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { getAllRegions, getStatesInRegion } from "@/constants/regions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Zone {
    id: string;
    name: string;
    description: string | null;
    state: string | null;
    region: string | null;
    created_at: string;
    user_count?: number;
}

export default function Zones() {
    const { canManageZones, isMaster, profile } = useAuth();
    const organizationId = profile?.organization_id;
    const { toast } = useToast();
    const [zones, setZones] = useState<Zone[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingZone, setEditingZone] = useState<Zone | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        state: "",
        region: ""
    });

    useEffect(() => {
        if (canManageZones) loadZones();
    }, [canManageZones]);

    const loadZones = async () => {
        try {
            setLoading(true);
            // Load zones
            let zonesQuery = supabase
                .from('zones')
                .select('*');

            if (!isMaster && organizationId) {
                zonesQuery = zonesQuery.eq('organization_id', organizationId);
            }

            const { data: zonesData, error: zonesError } = await zonesQuery.order('name');

            if (zonesError) throw zonesError;

            // Count users per zone
            let rolesQuery = supabase
                .from('user_roles')
                .select('zone_id');

            if (!isMaster && organizationId) {
                rolesQuery = rolesQuery.eq('organization_id', organizationId);
            }

            const { data: userCounts, error: countError } = await rolesQuery;

            if (countError) {
                console.warn('Could not load user counts:', countError);
            }

            const countMap: Record<string, number> = {};
            (userCounts || []).forEach((ur: any) => {
                if (ur.zone_id) {
                    countMap[ur.zone_id] = (countMap[ur.zone_id] || 0) + 1;
                }
            });

            const zonesWithCounts = (zonesData || []).map(zone => ({
                ...zone,
                user_count: countMap[zone.id] || 0
            }));

            setZones(zonesWithCounts);
        } catch (error) {
            console.error('Error loading zones:', error);
            toast({ title: "Error", description: "No se pudieron cargar las zonas.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!formData.name.trim()) {
            toast({ title: "Error", description: "El nombre de la zona es requerido.", variant: "destructive" });
            return;
        }

        try {
            if (editingZone) {
                // Update existing zone
                const { error } = await supabase
                    .from('zones')
                    .update({
                        name: formData.name,
                        description: formData.description || null
                    })
                    .eq('id', editingZone.id);

                if (error) throw error;
                toast({ title: "Zona actualizada", description: "La zona ha sido actualizada correctamente." });
            } else {
                // Create new zone
                const { error } = await supabase
                    .from('zones')
                    .insert({
                        name: formData.name,
                        description: formData.description || null,
                        state: formData.state || null,
                        region: formData.region || null,
                        organization_id: organizationId // Set current org
                    });

                if (error) throw error;
                toast({ title: "Zona creada", description: "La zona ha sido creada correctamente." });
            }

            setDialogOpen(false);
            setEditingZone(null);
            setFormData({ name: "", description: "", state: "", region: "" });
            loadZones();
        } catch (error) {
            console.error('Error saving zone:', error);
            toast({ title: "Error", description: "No se pudo guardar la zona.", variant: "destructive" });
        }
    };

    const handleDelete = async (zoneId: string) => {
        try {
            const { error } = await supabase
                .from('zones')
                .delete()
                .eq('id', zoneId);

            if (error) throw error;
            toast({ title: "Zona eliminada", description: "La zona ha sido eliminada correctamente." });
            loadZones();
        } catch (error) {
            console.error('Error deleting zone:', error);
            toast({ title: "Error", description: "No se pudo eliminar la zona.", variant: "destructive" });
        }
    };

    const openEditDialog = (zone: Zone) => {
        setEditingZone(zone);
        setFormData({
            name: zone.name,
            description: zone.description || "",
            state: zone.state || "",
            region: zone.region || ""
        });
        setDialogOpen(true);
    };

    const openCreateDialog = () => {
        setEditingZone(null);
        setFormData({ name: "", description: "", state: "", region: "" });
        setDialogOpen(true);
    };

    const filteredZones = zones.filter(z =>
        z.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        z.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!canManageZones) {
        return (
            <div className="flex items-center justify-center h-96">
                <Card className="medical-card">
                    <CardContent className="text-center py-12">
                        <MapPin className="mx-auto h-12 w-12 text-red-500 mb-4" />
                        <h3 className="text-lg font-medium mb-2">Acceso Restringido</h3>
                        <p className="text-muted-foreground">No tienes permisos para gestionar zonas.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Gestión de Zonas</h1>
                    <p className="text-muted-foreground">Administra las zonas geográficas del sistema</p>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="btn-medical" onClick={openCreateDialog}>
                            <Plus className="mr-2 h-4 w-4" /> Nueva Zona
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>{editingZone ? "Editar Zona" : "Nueva Zona"}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Nombre de la Zona *</Label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Ej: Zona Norte"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Descripción</Label>
                                <Textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Descripción opcional de la zona..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Región</Label>
                                    <Select
                                        value={formData.region}
                                        onValueChange={(v) => setFormData({ ...formData, region: v, state: "" })}
                                    >
                                        <SelectTrigger><SelectValue placeholder="Región" /></SelectTrigger>
                                        <SelectContent>
                                            {getAllRegions().map(r => (
                                                <SelectItem key={r} value={r}>{r}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Estado</Label>
                                    <Select
                                        value={formData.state}
                                        onValueChange={(v) => setFormData({ ...formData, state: v })}
                                        disabled={!formData.region}
                                    >
                                        <SelectTrigger><SelectValue placeholder="Estado" /></SelectTrigger>
                                        <SelectContent>
                                            {formData.region && getStatesInRegion(formData.region).map(s => (
                                                <SelectItem key={s} value={s}>{s}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <Button onClick={handleSubmit} className="w-full btn-medical">
                                {editingZone ? "Guardar Cambios" : "Crear Zona"}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="medical-card">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Total Zonas</p>
                                <p className="text-3xl font-bold text-primary">{zones.length}</p>
                            </div>
                            <MapPin className="h-8 w-8 text-primary opacity-20" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="medical-card">
                    <CardContent className="pt-6">
                        <div>
                            <p className="text-sm text-muted-foreground">Usuarios Asignados</p>
                            <p className="text-3xl font-bold text-blue-600">
                                {zones.reduce((acc, z) => acc + (z.user_count || 0), 0)}
                            </p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="medical-card">
                    <CardContent className="pt-6">
                        <div>
                            <p className="text-sm text-muted-foreground">Zonas Sin Usuarios</p>
                            <p className="text-3xl font-bold text-orange-600">
                                {zones.filter(z => !z.user_count || z.user_count === 0).length}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Buscar zonas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                />
            </div>

            {/* Zones Table */}
            <Card className="medical-card">
                <CardHeader>
                    <CardTitle>Zonas del Sistema</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-12 text-muted-foreground">Cargando zonas...</div>
                    ) : filteredZones.length === 0 ? (
                        <div className="text-center py-12">
                            <MapPin className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium mb-2">No hay zonas</h3>
                            <p className="text-muted-foreground mb-4">Crea tu primera zona para organizar los datos</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nombre</TableHead>
                                    <TableHead>Descripción</TableHead>
                                    <TableHead>Usuarios</TableHead>
                                    <TableHead>Fecha de Creación</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredZones.map((zone) => (
                                    <TableRow key={zone.id}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <MapPin className="h-4 w-4 text-primary" />
                                                {zone.name}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {zone.description || "-"}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">
                                                <UsersIcon className="h-3 w-3 mr-1" />
                                                {zone.user_count || 0}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {new Date(zone.created_at).toLocaleDateString('es-ES')}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => openEditDialog(zone)}
                                                >
                                                    <Edit className="h-4 w-4 mr-1" />
                                                    Editar
                                                </Button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            disabled={(zone.user_count || 0) > 0}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>¿Eliminar zona?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Esta acción no se puede deshacer. La zona "{zone.name}" será eliminada permanentemente.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDelete(zone.id)}>
                                                                Eliminar
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
