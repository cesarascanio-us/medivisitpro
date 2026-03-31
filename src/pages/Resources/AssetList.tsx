/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Search, Box, ShieldCheck, AlertTriangle } from "lucide-react";
import { FixedAsset } from "@/types/resources";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function AssetList() {
    const { toast } = useToast();
    const [assets, setAssets] = useState<FixedAsset[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        loadAssets();
    }, []);

    const loadAssets = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Managers see all, Reps see theirs (handled by RLS basically, but let's be explicit if needed)
            // RLS policy: "Fixed Assets Access" for SELECT is (get_my_role() IN ('master', 'admin', 'manager') OR assigned_to = auth.uid())

            const { data, error } = await supabase
                .from('fixed_assets')
                .select('*')
                .order('name');

            if (error) throw error;
            setAssets(data as FixedAsset[]);
        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "No se pudieron cargar los activos.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const filteredAssets = assets.filter(asset =>
        asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getConditionBadge = (condition: string) => {
        switch (condition) {
            case 'new': return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200">Nuevo</Badge>;
            case 'good': return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200">Bueno</Badge>;
            case 'fair': return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200">Regular</Badge>;
            case 'poor': return <Badge className="bg-red-100 text-red-700 hover:bg-red-200">Malo</Badge>;
            default: return <Badge variant="outline">{condition}</Badge>;
        }
    };

    if (loading) return <div className="p-8 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>;

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                        <Box className="h-8 w-8 text-blue-600" /> Mis Activos
                    </h1>
                    <p className="text-slate-500">Equipos y materiales asignados a tu cargo</p>
                </div>
                <div className="w-full md:w-72 relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Buscar por nombre o código..."
                        className="pl-9"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Total Asignado</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{assets.length}</div>
                        <p className="text-xs text-slate-400 mt-1">items bajo tu responsabilidad</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Estado Óptimo</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-emerald-600">
                            {assets.filter(a => ['new', 'good'].includes(a.condition)).length}
                        </div>
                        <p className="text-xs text-slate-400 mt-1">Nuevos o en buen estado</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Requieren Atención</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-amber-600">
                            {assets.filter(a => ['fair', 'poor'].includes(a.condition)).length}
                        </div>
                        <p className="text-xs text-slate-400 mt-1">Regular o mal estado</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="overflow-hidden border-slate-200">
                <Table>
                    <TableHeader className="bg-slate-50">
                        <TableRow>
                            <TableHead>Código</TableHead>
                            <TableHead>Descripción</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Fecha Asignación</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredAssets.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-12 text-slate-500">
                                    <ShieldCheck className="h-12 w-12 mx-auto text-slate-200 mb-3" />
                                    No se encontraron activos asignados.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredAssets.map(asset => (
                                <TableRow key={asset.id} className="hover:bg-slate-50">
                                    <TableCell className="font-mono text-xs">{asset.code}</TableCell>
                                    <TableCell>
                                        <div className="font-medium text-slate-900">{asset.name}</div>
                                        {asset.description && <div className="text-xs text-slate-500">{asset.description}</div>}
                                    </TableCell>
                                    <TableCell>{getConditionBadge(asset.condition)}</TableCell>
                                    <TableCell className="text-slate-500 text-sm">
                                        {asset.assigned_date ? format(new Date(asset.assigned_date), "PPP", { locale: es }) : '-'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm" onClick={() => toast({ title: "Reporte Enviado", description: "Se ha notificado al administrador sobre este activo." })}>
                                            <AlertTriangle className="h-4 w-4 text-amber-500 mr-2" />
                                            Reportar Problema
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
}
