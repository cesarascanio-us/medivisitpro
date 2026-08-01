/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Home, MapPin, User, ShieldCheck, Activity } from "lucide-react";

export default function WarehouseManager() {
    const { toast } = useToast();
    const [warehouses, setWarehouses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        location: '',
        address: '',
        compliance_standards: 'GWP Standard', // Default
        is_active: true
    });

    useEffect(() => {
        loadWarehouses();
    }, []);

    const loadWarehouses = async () => {
        setLoading(true);
        try {
            const { data, error } = await (supabase.from('warehouses').select('*') as any);
            if (error) throw error;
            setWarehouses(data || []);
        } catch (error) {
            console.error("Error loading warehouses:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        try {
            const { data: orgData } = await supabase.rpc('get_my_organization_id');
            const { error } = await (supabase.from('warehouses').insert([{
                ...formData,
                organization_id: orgData
            }]) as any);

            if (error) throw error;

            toast({ title: "Almacén Creado", description: "El nuevo centro logístico ha sido registrado." });
            setIsDialogOpen(false);
            setFormData({ name: '', location: '', address: '', compliance_standards: 'GWP Standard', is_active: true });
            loadWarehouses();
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    };

    return (
        <div className="space-y-6 p-4">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-foreground">Gestión de Almacenes Centrales</h2>
                    <p className="text-sm text-slate-500">Administra ubicaciones, normas de cumplimiento y responsables.</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-purple-600 hover:bg-purple-700">
                            <Plus className="mr-2 h-4 w-4" /> Nuevo Almacén
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Registrar Nueva Ubicación Logística</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Nombre del Almacén</label>
                                <Input
                                    placeholder="Ej: Almacén Central Norte"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Ciudad / Región</label>
                                <Input
                                    placeholder="Ej: Quito / Pichincha"
                                    value={formData.location}
                                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Dirección Física Exacta</label>
                                <Input
                                    placeholder="Calle Principal N22 y ..."
                                    value={formData.address}
                                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Normas de Cumplimiento (Separadas por coma)</label>
                                <Input
                                    placeholder="Ej: ISO 9001, GWP, Cadena de Frío"
                                    value={formData.compliance_standards}
                                    onChange={e => setFormData({ ...formData, compliance_standards: e.target.value })}
                                />
                            </div>
                            <Button onClick={handleCreate} className="w-full bg-purple-600">Crear Almacén</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {warehouses.map(w => (
                    <Card key={w.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <Home className="h-5 w-5 text-purple-600" />
                                {w.name}
                            </CardTitle>
                            <Badge variant={w.is_active ? "default" : "secondary"}>
                                {w.is_active ? "Operativo" : "Inactivo"}
                            </Badge>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-start gap-2 text-sm text-slate-600">
                                <MapPin className="h-4 w-4 mt-0.5 text-slate-400" />
                                <div>
                                    <p className="font-semibold">{w.location}</p>
                                    <p className="text-xs">{w.address}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                <ShieldCheck className="h-4 w-4 text-green-500" />
                                <span className="font-medium">Normas:</span>
                                <span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-900">{w.compliance_standards}</span>
                            </div>
                            <div className="pt-2 flex justify-between items-center border-t border-slate-50">
                                <div className="flex items-center gap-1 text-[10px] text-slate-400">
                                    <Activity className="h-3 w-3" />
                                    Capacidad: Estándar
                                </div>
                                <Button variant="ghost" size="sm" className="h-8 text-xs text-purple-600 hover:text-purple-700">Ver Detalles</Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {warehouses.length === 0 && !loading && (
                <div className="text-center py-12 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200 text-slate-900">
                    <p className="text-slate-500">No hay almacenes registrados. Comienza creando uno nuevo.</p>
                </div>
            )}
        </div>
    );
}
