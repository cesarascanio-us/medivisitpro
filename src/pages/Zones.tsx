/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import { useState, useEffect } from "react";
import { Plus, MapPin, Search, Trash2, Edit, Check, X, Users as UsersIcon, Globe, Map, RefreshCw } from "lucide-react";
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
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
                <div className="w-24 h-24 bg-rose-50 dark:bg-rose-900/20 rounded-[2.5rem] flex items-center justify-center mb-6">
                    <X className="w-12 h-12 text-rose-500" />
                </div>
                <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Acceso Restringido</h2>
                <p className="text-slate-400 dark:text-slate-500 font-medium text-center max-w-sm mt-2">No dispones de los privilegios necesarios para gestionar la infraestructura de zonas.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 space-y-8 p-1 animate-in fade-in duration-700">
            {/* Premium White Header Container */}
            <header className="bg-white dark:bg-slate-900 px-8 py-10 rounded-[3rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 relative overflow-hidden -mt-2 mx-1">
                {/* Decorative backgrounds */}
                <div className="absolute -top-32 -right-32 w-80 h-80 bg-emerald-50 dark:bg-emerald-900/10 rounded-full blur-3xl opacity-60"></div>
                <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-slate-50 dark:bg-indigo-900/10 rounded-full blur-3xl opacity-60"></div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-3xl flex items-center justify-center shadow-lg shadow-emerald-200 dark:shadow-none transform transition-transform hover:scale-105">
                            <MapPin className="text-white h-10 w-10" />
                        </div>
                        <div>
                            <p className="text-emerald-600 dark:text-emerald-400 text-[11px] font-black uppercase tracking-[0.25em] mb-1.5">Estructura & Cobertura</p>
                            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                                Gestión de Zonas
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 max-w-lg font-medium">Administración técnica de demarcaciones geográficas y usuarios asignados</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="h-14 px-8 rounded-2xl bg-slate-900 dark:bg-indigo-600 hover:bg-black dark:hover:bg-indigo-500 text-white shadow-lg shadow-slate-200 dark:shadow-none transition-all hover:-translate-y-0.5 active:translate-y-0 font-bold uppercase text-[10px] tracking-widest">
                                    <Plus className="w-4 h-4 mr-3" />
                                    Nueva Zona
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-white dark:bg-slate-900 border-none shadow-2xl rounded-[2.5rem] max-w-md p-0 overflow-hidden">
                                <div className="bg-slate-900 p-8 text-white relative">
                                    <div className="absolute top-0 right-0 p-6 opacity-10">
                                        <Map className="w-24 h-24" />
                                    </div>
                                    <DialogTitle className="text-2xl font-black uppercase tracking-tight relative z-10">
                                        {editingZone ? "Editar Zona" : "Nueva Zona"}
                                    </DialogTitle>
                                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1 relative z-10">Infraestructura Geográfica SaaS</p>
                                </div>
                                <div className="p-8 space-y-6 bg-slate-50/30">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Nombre de la Zona</Label>
                                        <Input
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="h-14 rounded-2xl border-slate-100 bg-white font-bold focus:ring-emerald-500"
                                            placeholder="Ej: Zona Norte Administrativa"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Descripción</Label>
                                        <Textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="min-h-[100px] rounded-2xl border-slate-100 bg-white font-medium p-6"
                                            placeholder="Detalles sobre la cobertura de esta zona..."
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Región</Label>
                                            <Select value={formData.region} onValueChange={(v) => setFormData({ ...formData, region: v, state: "" })}>
                                                <SelectTrigger className="h-12 border-slate-100 rounded-xl bg-white focus:ring-emerald-500"><SelectValue /></SelectTrigger>
                                                <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                                                    {getAllRegions().map(r => <SelectItem key={r} value={r} className="font-medium">{r}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Estado</Label>
                                            <Select value={formData.state} onValueChange={(v) => setFormData({ ...formData, state: v })} disabled={!formData.region}>
                                                <SelectTrigger className="h-12 border-slate-100 rounded-xl bg-white focus:ring-emerald-500"><SelectValue /></SelectTrigger>
                                                <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                                                    {formData.region && getStatesInRegion(formData.region).map(s => <SelectItem key={s} value={s} className="font-medium">{s}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <Button onClick={handleSubmit} className="w-full h-14 bg-slate-900 dark:bg-indigo-600 hover:bg-black dark:hover:bg-indigo-500 text-white font-black uppercase tracking-widest rounded-2xl shadow-lg mt-4 transition-all">
                                        {editingZone ? "Actualizar Zona" : "Validar & Crear Zona"}
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </header>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-2">
                {[
                    { label: 'Total Zonas', val: zones.length, sub: 'Demarcaciones activas', icon: MapPin, color: 'indigo' },
                    { label: 'Usuarios Asignados', val: zones.reduce((acc, z) => acc + (z.user_count || 0), 0), sub: 'Personal en campo', icon: UsersIcon, color: 'blue' },
                    { label: 'Zonas Desiertas', val: zones.filter(z => !z.user_count || z.user_count === 0).length, sub: 'Sin personal activo', icon: Globe, color: 'orange' }
                ].map((kpi, i) => (
                    <Card key={i} className="bg-white dark:bg-slate-900 border-none rounded-[2.5rem] shadow-xl shadow-slate-200/50 dark:shadow-none p-8 group hover:translate-y-[-5px] transition-all duration-300">
                        <div className="flex items-center justify-between mb-6">
                            <div className={`w-14 h-14 rounded-2xl bg-${kpi.color}-50 dark:bg-${kpi.color}-900/20 flex items-center justify-center group-hover:bg-${kpi.color}-600 transition-colors duration-500`}>
                                <kpi.icon className={`h-7 w-7 text-${kpi.color}-600 dark:text-${kpi.color}-400 group-hover:text-white transition-colors`} />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{kpi.label}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white mb-1">{kpi.val}</span>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{kpi.sub}</span>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Search & Actions */}
            <div className="px-1 flex flex-col md:flex-row items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                        placeholder="Buscar por nombre o descripción de zona..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="h-16 pl-14 rounded-[1.5rem] border-none bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/50 dark:shadow-none font-bold text-slate-600 focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={loadZones}
                    className="w-16 h-16 rounded-[1.5rem] bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/50 dark:shadow-none hover:bg-slate-50 transition-all active:scale-95"
                >
                    <RefreshCw className={`w-6 h-6 ${loading ? 'animate-spin text-indigo-500' : 'text-slate-400'}`} />
                </Button>
            </div>

            {/* Zones Table */}
            <Card className="border-none shadow-2xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-[3rem] overflow-hidden mx-1">
                <CardHeader className="border-b border-slate-50 dark:border-slate-800 pb-6 pt-10 px-10">
                    <div>
                        <CardTitle className="text-2xl font-black text-slate-800 dark:text-white tracking-tight uppercase">Base Maestra de Zonas</CardTitle>
                        <p className="text-slate-400 dark:text-slate-500 font-bold text-[10px] uppercase tracking-widest mt-1">Control logístico y organizativo del sistema</p>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {loading && zones.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-32 gap-4">
                            <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sincronizando infraestructura...</p>
                        </div>
                    ) : filteredZones.length === 0 ? (
                        <div className="text-center py-32">
                            <div className="bg-slate-50 dark:bg-slate-800 w-24 h-24 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6">
                                <MapPin className="w-12 h-12 text-slate-300" />
                            </div>
                            <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Zona Desconocida</h3>
                            <p className="text-slate-400 text-sm mt-2 max-w-xs mx-auto font-medium">No se encontraron demarcaciones que coincidan con la búsqueda actual.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-slate-50/50 dark:bg-slate-800/50">
                                    <TableRow className="hover:bg-transparent border-none">
                                        <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 py-7 pl-10">Nombre de Zona</TableHead>
                                        <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 py-7">Cobertura / Descripción</TableHead>
                                        <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 py-7">Usuarios</TableHead>
                                        <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 py-7">Creación</TableHead>
                                        <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 py-7 text-right pr-10">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredZones.map((zone) => (
                                        <TableRow key={zone.id} className="border-b border-slate-50 dark:border-slate-800 hover:bg-emerald-50/20 dark:hover:bg-slate-800/50 transition-all group">
                                            <TableCell className="pl-10 py-8">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-50 dark:border-slate-700 flex items-center justify-center shadow-sm group-hover:bg-emerald-600 transition-all duration-300">
                                                        <MapPin className="w-6 h-6 text-emerald-600 dark:text-emerald-400 group-hover:text-white" />
                                                    </div>
                                                    <span className="font-black text-slate-900 dark:text-slate-200 text-lg tracking-tight group-hover:translate-x-1 transition-transform">{zone.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-8">
                                                <p className="text-sm font-medium text-slate-500 max-w-md line-clamp-2">{zone.description || "Sin descripción técnica vinculada"}</p>
                                            </TableCell>
                                            <TableCell className="py-8">
                                                <Badge className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-none font-black text-[10px] uppercase tracking-widest px-4 py-2 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                    <UsersIcon className="h-3 w-3 mr-2" />
                                                    {zone.user_count || 0} Pers.
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="py-8 text-slate-400 font-bold tabular-nums text-sm">
                                                {new Date(zone.created_at).toLocaleDateString('es-ES')}
                                            </TableCell>
                                            <TableCell className="text-right pr-10 py-8">
                                                <div className="flex justify-end gap-3 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => openEditDialog(zone)}
                                                        className="h-12 w-12 rounded-xl text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all"
                                                    >
                                                        <Edit className="h-5 w-5" />
                                                    </Button>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                disabled={(zone.user_count || 0) > 0}
                                                                className="h-12 w-12 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                                                            >
                                                                <Trash2 className="h-5 w-5" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent className="rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden">
                                                            <div className="bg-rose-600 p-8 text-white">
                                                                <AlertDialogTitle className="text-2xl font-black uppercase">¿Eliminar Infraestructura?</AlertDialogTitle>
                                                                <p className="text-rose-100 text-[10px] font-black uppercase tracking-widest mt-1">Esta acción es irreversible en el núcleo del sistema</p>
                                                            </div>
                                                            <div className="p-8 space-y-4">
                                                                <AlertDialogDescription className="text-slate-600 font-medium text-lg leading-relaxed">
                                                                    La zona <span className="font-black text-slate-900 underline text-rose-600">"{zone.name}"</span> será purgada permanentemente de la base de cobertura geográfica.
                                                                </AlertDialogDescription>
                                                            </div>
                                                            <div className="p-8 pt-0 flex gap-4">
                                                                <AlertDialogCancel className="flex-1 h-14 rounded-2xl border-slate-100 font-bold text-slate-400">Cancelar Operación</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => handleDelete(zone.id)} className="flex-1 h-14 rounded-2xl bg-rose-600 hover:bg-rose-700 font-black uppercase tracking-widest text-[10px]">Confirmar Purga</AlertDialogAction>
                                                            </div>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
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
        </div>
    );
}
