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
import { Loader2, Search, Box, ShieldCheck, AlertTriangle, RefreshCw, Filter } from "lucide-react";
import { FixedAsset } from "@/types/resources";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { EliteKPICard, EliteHeader } from "@/components/layout/DesignSystem";

export default function AssetList() {
    const { toast } = useToast();
    const [assets, setAssets] = useState<FixedAsset[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        loadAssets();
    }, []);

    const loadAssets = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

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
            case 'new': return <Badge className="status-active">Nuevo</Badge>;
            case 'good': return <Badge className="status-info">Bueno</Badge>;
            case 'fair': return <Badge className="status-pending">Regular</Badge>;
            case 'poor': return <Badge variant="destructive" className="font-bold">Malo</Badge>;
            default: return <Badge variant="outline" className="font-bold uppercase tracking-widest text-[9px]">{condition}</Badge>;
        }
    };

    if (loading && assets.length === 0) return (
        <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
            <p className="text-muted-foreground font-black text-[10px] uppercase tracking-[0.3em]">Sincronizando Búnker de Activos...</p>
        </div>
    );

    return (
        <div className="flex flex-col min-h-full space-y-10 p-1 animate-in fade-in duration-700">
            {/* HEADER INDUSTRIAL ELITE */}
            <EliteHeader
                title="Búnker de Activos"
                subtitle="Control de Equipamiento y Recursos Asignados"
                icon={Box}
                badgeText="V6.0 ASSET CONTROL"
                statusText="Inventario Verificado"
                statusColor="bg-blue-500"
                rightContent={
                    <div className="flex items-center gap-4">
                        <Button
                            onClick={loadAssets}
                            size="icon"
                            variant="ghost"
                            className="w-14 h-14 rounded-2xl bg-card border border-border hover:bg-muted/10 transition-all shadow-sm group"
                        >
                            <RefreshCw className={cn("h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors", loading && "animate-spin text-primary")} />
                        </Button>
                    </div>
                }
            />

            {/* KPI GRID */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <EliteKPICard 
                    title="Total Asignado" 
                    value={assets.length} 
                    icon={Box} 
                    color="blue" 
                />
                <EliteKPICard 
                    title="Estado Óptimo" 
                    value={assets.filter(a => ['new', 'good'].includes(a.condition)).length} 
                    icon={ShieldCheck} 
                    color="emerald" 
                />
                <EliteKPICard 
                    title="Requieren Atención" 
                    value={assets.filter(a => ['fair', 'poor'].includes(a.condition)).length} 
                    icon={AlertTriangle} 
                    color="amber" 
                />
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="space-y-8">
                <div className="flex flex-col md:flex-row gap-6">
                    <Card className="bg-card border border-border rounded-[2.5rem] shadow-premium-sm p-6 flex-1 relative overflow-hidden group/search">
                        <div className="flex-1 relative">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground group-focus-within/search:text-primary transition-colors" />
                            <Input 
                                placeholder="LOCALIZAR ACTIVO POR NOMBRE O CÓDIGO..." 
                                value={searchTerm} 
                                onChange={e => setSearchTerm(e.target.value)} 
                                className="pl-16 h-16 bg-muted/20 border-transparent focus-visible:ring-primary/20 font-black rounded-2xl text-foreground placeholder:text-muted-foreground/50 transition-all text-xs tracking-widest shadow-inner uppercase" 
                            />
                        </div>
                    </Card>
                </div>

                <Card className="bg-card rounded-[2.5rem] border border-border shadow-premium-sm overflow-hidden p-6">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-b border-border hover:bg-transparent">
                                    <TableHead className="font-black text-[10px] text-muted-foreground uppercase tracking-widest py-6">Identificador</TableHead>
                                    <TableHead className="font-black text-[10px] text-muted-foreground uppercase tracking-widest py-6">Descripción del Recurso</TableHead>
                                    <TableHead className="font-black text-[10px] text-muted-foreground uppercase tracking-widest py-6">Estado Técnico</TableHead>
                                    <TableHead className="font-black text-[10px] text-muted-foreground uppercase tracking-widest py-6">Asignación</TableHead>
                                    <TableHead className="font-black text-[10px] text-muted-foreground uppercase tracking-widest py-6 text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredAssets.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-24 text-muted-foreground">
                                            <div className="flex flex-col items-center">
                                                <Box className="h-12 w-12 opacity-10 mb-4" />
                                                <p className="font-black text-[10px] uppercase tracking-[0.3em]">No se detectaron activos en el sector</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredAssets.map(asset => (
                                        <TableRow key={asset.id} className="border-b border-border/50 hover:bg-muted/30 group transition-colors">
                                            <TableCell className="py-6 font-mono text-[11px] font-black text-primary tracking-tighter">
                                                {asset.code}
                                            </TableCell>
                                            <TableCell className="py-6">
                                                <div className="flex flex-col">
                                                    <span className="font-black text-sm text-foreground uppercase tracking-tight group-hover:text-primary transition-colors">{asset.name}</span>
                                                    {asset.description && <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">{asset.description}</span>}
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-6">
                                                {getConditionBadge(asset.condition)}
                                            </TableCell>
                                            <TableCell className="py-6">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] text-foreground font-black uppercase tracking-widest">
                                                        {asset.assigned_date ? format(new Date(asset.assigned_date), "dd MMM yyyy", { locale: es }) : '-'}
                                                    </span>
                                                    <span className="text-[9px] text-muted-foreground font-bold uppercase">Protocolo de Entrega</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-6 text-right">
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    onClick={() => toast({ title: "Protocolo de Alerta", description: "Se ha notificado al departamento de IT sobre este activo." })}
                                                    className="h-10 rounded-xl font-black text-[10px] uppercase tracking-widest text-amber-500 hover:bg-amber-500/10 border border-transparent hover:border-amber-500/20"
                                                >
                                                    <AlertTriangle className="h-4 w-4 mr-2" />
                                                    Reportar Incidencia
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </Card>
            </div>
        </div>
    );
}
