/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Package, Building2, FileText, RotateCcw, Package2,
    Users, Stethoscope, Gift, Plus, Download, Search,
    Calendar, AlertTriangle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useDemoData } from "@/contexts/MockDataProvider";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import { EliteHeader, EliteKPICard } from "@/components/layout/DesignSystem";

export default function SampleBanks() {
    const { user } = useAuth();
    const { toast } = useToast();
    const demoData = useDemoData();
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // States for each module
    const [inventario, setInventario] = useState<any[]>([]);
    const [entregas, setEntregas] = useState<any[]>([]);
    const [detalles, setDetalles] = useState<any[]>([]);
    const [reposiciones, setReposiciones] = useState<any[]>([]);
    const [dispensaciones, setDispensaciones] = useState<any[]>([]);
    const [dispensacionesPacientes, setDispensacionesPacientes] = useState<any[]>([]);
    const [entregasVisitas, setEntregasVisitas] = useState<any[]>([]);
    const [materiales, setMateriales] = useState<any[]>([]);

    useEffect(() => {
        if (user) {
            loadAllData();
        }
    }, [user]);

    const loadAllData = async () => {
        setLoading(true);
        try {
            await Promise.all([
                loadInventario(),
                loadEntregas(),
                loadMateriales()
            ]);
        } catch (error) {
            console.error('Error loading data:', error);
            toast({ title: "Error", description: "Error al cargar datos", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const loadInventario = async () => {
        if (!user) return;

        if (demoData) {
            console.log("SampleBanks: Loading demo inventory");
            setInventario(demoData.inventory || []);
            return;
        }

        const { data, error } = await supabase
            .from('inventario_muestras')
            .select(`
        *,
        products (name)
      `)
            .eq('user_id', user.id)
            .order('fecha_vencimiento', { ascending: true });

        if (error) throw error;
        setInventario(data || []);
    };

    const loadEntregas = async () => {
        if (!user) return;

        if (demoData) {
            console.log("SampleBanks: Loading demo bank inventory");
            // Map demo bank inventory to entregas format
            const mockEntregas = (demoData.bankInventory || []).map(bi => ({
                id: bi.id,
                health_centers: { name: bi.bank_id === 'bank-001' ? 'Centro Médico La Trinidad' : 'Clínica Modelo Valencia' },
                servicio: bi.bank_id === 'bank-001' ? 'Cardiología' : 'Medicina Interna',
                jefe_servicio: 'Dr. Jefe Demo',
                fecha_entrega: new Date().toISOString(),
                entregado_por: 'Visitador Demo'
            }));
            setEntregas(mockEntregas);
            return;
        }

        const { data, error } = await supabase
            .from('entregas_banco')
            .select(`
        *,
        health_centers (name)
      `)
            .eq('user_id', user.id)
            .order('fecha_entrega', { ascending: false });

        if (error) throw error;
        setEntregas(data || []);
    };

    const loadMateriales = async () => {
        if (!user) return;

        if (demoData) {
            console.log("SampleBanks: Loading demo material POP");
            // Map MOCK_MATERIAL_POP to materiales format
            const mockMateriales = (demoData.materialPop || []).map(m => ({
                id: m.id,
                nombre: m.name,
                tipo: m.category,
                products: { name: 'Genérico Demo' },
                cantidad_disponible: m.quantity,
                cantidad_inicial: m.quantity + 50,
                fecha_recepcion: m.created_at
            }));
            setMateriales(mockMateriales);
            return;
        }

        const { data, error } = await supabase
            .from('materiales_promocionales')
            .select(`
        *,
        products (name)
      `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;
        setMateriales(data || []);
    };

    const getExpirationBadge = (fecha: string) => {
        const today = new Date();
        const expDate = new Date(fecha);
        const daysUntilExp = Math.floor((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (daysUntilExp < 0) {
            return <Badge variant="destructive">Vencido</Badge>;
        } else if (daysUntilExp < 30) {
            return <Badge className="bg-orange-500">Próximo a vencer ({daysUntilExp}d)</Badge>;
        } else if (daysUntilExp < 90) {
            return <Badge className="bg-yellow-500">⚠️ {daysUntilExp} días</Badge>;
        }
        return <Badge className="bg-green-500">✓ {daysUntilExp} días</Badge>;
    };

    const stats = {
        inventario: inventario.length,
        entregas: entregas.length,
        materiales: materiales.length,
        proximosVencer: inventario.filter(i => {
            const days = Math.floor((new Date(i.fecha_vencimiento).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            return days < 30 && days >= 0;
        }).length
    };

    if (loading) {
        return <div className="flex items-center justify-center h-64">Cargando...</div>;
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <EliteHeader
                title="Gestión de Muestras"
                subtitle="Control de stock de muestras médicas y materiales promocionales"
                icon={Package}
                badgeText="Inventario"
                statusText={loading ? "Sincronizando..." : "Sistema en línea"}
                statusColor={loading ? "bg-amber-500" : "bg-emerald-500"}
                rightContent={
                    <Button 
                        onClick={loadAllData} 
                        variant="outline"
                        className="h-12 px-6 rounded-xl border-slate-200 bg-card text-foreground font-bold text-xs hover:bg-slate-50 transition-all shadow-sm active:scale-95"
                    >
                        <RotateCcw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        Sincronizar
                    </Button>
                }
            />

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <EliteKPICard
                    title="Inventario total"
                    value={stats.inventario}
                    icon={Package}
                    color="blue"
                />
                <EliteKPICard
                    title="Entregas realizadas"
                    value={stats.entregas}
                    icon={Building2}
                    color="emerald"
                />
                <EliteKPICard
                    title="Material promocional"
                    value={stats.materiales}
                    icon={Gift}
                    color="purple"
                />
                <EliteKPICard
                    title="Próximos a vencer"
                    value={stats.proximosVencer}
                    icon={AlertTriangle}
                    color="amber"
                />
            </div>

            {/* Main Tabs */}
            <Tabs defaultValue="inventario" className="w-full space-y-6">
                <TabsList className="flex flex-wrap h-auto p-1 bg-slate-50 rounded-xl border border-slate-100 shadow-inner overflow-x-auto">
                    <TabsTrigger value="inventario" className="flex-1 rounded-lg font-bold text-[11px] data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all h-9 px-4">Inventario</TabsTrigger>
                    <TabsTrigger value="entregas" className="flex-1 rounded-lg font-bold text-[11px] data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all h-9 px-4">Entregas</TabsTrigger>
                    <TabsTrigger value="detalles" className="flex-1 rounded-lg font-bold text-[11px] data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all h-9 px-4">Detalles</TabsTrigger>
                    <TabsTrigger value="reposiciones" className="flex-1 rounded-lg font-bold text-[11px] data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all h-9 px-4">Reposiciones</TabsTrigger>
                    <TabsTrigger value="dispensacion" className="flex-1 rounded-lg font-bold text-[11px] data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all h-9 px-4">Dispensación</TabsTrigger>
                    <TabsTrigger value="pacientes" className="flex-1 rounded-lg font-bold text-[11px] data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all h-9 px-4">Pacientes</TabsTrigger>
                    <TabsTrigger value="visitas" className="flex-1 rounded-lg font-bold text-[11px] data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all h-9 px-4">Visitas</TabsTrigger>
                    <TabsTrigger value="materiales" className="flex-1 rounded-lg font-bold text-[11px] data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all h-9 px-4">Materiales</TabsTrigger>
                </TabsList>

                {/* TAB 1: INVENTARIO */}
                <TabsContent value="inventario" className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <Card className="border-slate-100 shadow-sm rounded-2xl overflow-hidden">
                        <CardHeader className="pb-4 bg-slate-50/50 border-b border-slate-100">
                            <CardTitle className="flex items-center text-sm font-bold tracking-tight">
                                <Package className="mr-2 h-5 w-5 text-primary" />
                                Inventario de muestras
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                                    <Input
                                        placeholder="Buscar por producto o lote..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="h-11 pl-10 bg-slate-50 border-none rounded-xl font-semibold text-xs shadow-inner"
                                    />
                                </div>
                                <Button className="h-11 px-6 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-xs shadow-md transition-all active:scale-95">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Nuevo lote
                                </Button>
                            </div>

                            <div className="rounded-xl border border-slate-100 overflow-hidden shadow-sm">
                                <Table>
                                    <TableHeader className="bg-slate-50/50">
                                        <TableRow className="border-slate-100 hover:bg-transparent">
                                            <TableHead className="font-bold text-[11px] uppercase tracking-wider text-slate-400">Producto</TableHead>
                                            <TableHead className="font-bold text-[11px] uppercase tracking-wider text-slate-400">Lote</TableHead>
                                            <TableHead className="font-bold text-[11px] uppercase tracking-wider text-slate-400">Fabricación</TableHead>
                                            <TableHead className="font-bold text-[11px] uppercase tracking-wider text-slate-400">Vencimiento</TableHead>
                                            <TableHead className="font-bold text-[11px] uppercase tracking-wider text-slate-400">Cantidad</TableHead>
                                            <TableHead className="font-bold text-[11px] uppercase tracking-wider text-slate-400">Estado</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                <TableBody>
                                    {inventario.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium">{item.products?.name || 'N/A'}</TableCell>
                                            <TableCell>{item.lote}</TableCell>
                                            <TableCell>
                                                {item.fecha_fabricacion ? new Date(item.fecha_fabricacion).toLocaleDateString() : 'N/A'}
                                            </TableCell>
                                            <TableCell>{new Date(item.fecha_vencimiento).toLocaleDateString()}</TableCell>
                                            <TableCell>{item.cantidad_asignada}</TableCell>
                                            <TableCell>{getExpirationBadge(item.fecha_vencimiento)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            {inventario.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground">
                                    No hay muestras en inventario
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* TAB 2: ENTREGAS BANCO */}
                <TabsContent value="entregas" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Building2 className="mr-2 h-5 w-5" />
                                Entregas a Centros de Salud
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Button className="mb-4">
                                <Plus className="mr-2 h-4 w-4" />
                                Nueva Entrega
                            </Button>

                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Centro de Salud</TableHead>
                                        <TableHead>Servicio</TableHead>
                                        <TableHead>Jefe Servicio</TableHead>
                                        <TableHead>Fecha</TableHead>
                                        <TableHead>Entregado Por</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {entregas.map((entrega) => (
                                        <TableRow key={entrega.id}>
                                            <TableCell className="font-medium">{entrega.health_centers?.name || 'N/A'}</TableCell>
                                            <TableCell>{entrega.servicio || 'N/A'}</TableCell>
                                            <TableCell>{entrega.jefe_servicio || 'N/A'}</TableCell>
                                            <TableCell>{new Date(entrega.fecha_entrega).toLocaleDateString()}</TableCell>
                                            <TableCell>{entrega.entregado_por || 'N/A'}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            {entregas.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground">
                                    No hay entregas registradas
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* TAB 3: DETALLES */}
                <TabsContent value="detalles" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <FileText className="mr-2 h-5 w-5" />
                                Detalles de Entregas
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-8 text-muted-foreground">
                                Seleccione una entrega para ver detalles
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* TAB 4: REPOSICIONES */}
                <TabsContent value="reposiciones" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <RotateCcw className="mr-2 h-5 w-5" />
                                Reposiciones
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Button className="mb-4">
                                <Plus className="mr-2 h-4 w-4" />
                                Nueva Reposición
                            </Button>
                            <div className="text-center py-8 text-muted-foreground">
                                No hay reposiciones registradas
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* TAB 5: DISPENSACIÓN MUESTRAS */}
                <TabsContent value="dispensacion" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Package2 className="mr-2 h-5 w-5" />
                                Dispensación desde Banco
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Button className="mb-4">
                                <Plus className="mr-2 h-4 w-4" />
                                Nueva Dispensación
                            </Button>
                            <div className="text-center py-8 text-muted-foreground">
                                No hay dispensaciones registradas
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* TAB 6: DISPENSACIÓN PACIENTES */}
                <TabsContent value="pacientes" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Users className="mr-2 h-5 w-5" />
                                Dispensación a Pacientes
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Button className="mb-4">
                                <Plus className="mr-2 h-4 w-4" />
                                Registrar Dispensación
                            </Button>
                            <div className="text-center py-8 text-muted-foreground">
                                No hay dispensaciones a pacientes
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* TAB 7: ENTREGAS EN VISITAS */}
                <TabsContent value="visitas" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Stethoscope className="mr-2 h-5 w-5" />
                                Entregas en Visitas Médicas
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-8 text-muted-foreground">
                                Las entregas en visitas se registran desde el módulo de Visitas
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* TAB 8: MATERIALES PROMOCIONALES */}
                <TabsContent value="materiales" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Gift className="mr-2 h-5 w-5" />
                                Materiales Promocionales
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Button className="mb-4">
                                <Plus className="mr-2 h-4 w-4" />
                                Nuevo Material
                            </Button>

                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nombre</TableHead>
                                        <TableHead>Tipo</TableHead>
                                        <TableHead>Producto</TableHead>
                                        <TableHead>Disponible</TableHead>
                                        <TableHead>Inicial</TableHead>
                                        <TableHead>Recepción</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {materiales.map((material) => (
                                        <TableRow key={material.id}>
                                            <TableCell className="font-medium">{material.nombre}</TableCell>
                                            <TableCell>{material.tipo || 'N/A'}</TableCell>
                                            <TableCell>{material.products?.name || 'N/A'}</TableCell>
                                            <TableCell>
                                                <Badge variant={material.cantidad_disponible > 0 ? "default" : "destructive"}>
                                                    {material.cantidad_disponible}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{material.cantidad_inicial}</TableCell>
                                            <TableCell>
                                                {material.fecha_recepcion ? new Date(material.fecha_recepcion).toLocaleDateString() : 'N/A'}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            {materiales.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground">
                                    No hay materiales promocionales
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
