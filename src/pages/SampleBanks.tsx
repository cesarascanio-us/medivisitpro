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
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Bancos de Muestras</h1>
                    <p className="text-muted-foreground">Gestión completa de inventario y dispensación</p>
                </div>
                <Button onClick={loadAllData}>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Actualizar
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Inventario Total</p>
                                <p className="text-2xl font-bold">{stats.inventario}</p>
                            </div>
                            <Package className="h-8 w-8 text-primary" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Entregas Realizadas</p>
                                <p className="text-2xl font-bold">{stats.entregas}</p>
                            </div>
                            <Building2 className="h-8 w-8 text-blue-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Materiales Promo</p>
                                <p className="text-2xl font-bold">{stats.materiales}</p>
                            </div>
                            <Gift className="h-8 w-8 text-purple-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Próximos a Vencer</p>
                                <p className="text-2xl font-bold text-orange-500">{stats.proximosVencer}</p>
                            </div>
                            <AlertTriangle className="h-8 w-8 text-orange-500" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Tabs */}
            <Tabs defaultValue="inventario" className="w-full">
                <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
                    <TabsTrigger value="inventario">Inventario</TabsTrigger>
                    <TabsTrigger value="entregas">Entregas</TabsTrigger>
                    <TabsTrigger value="detalles">Detalles</TabsTrigger>
                    <TabsTrigger value="reposiciones">Reposiciones</TabsTrigger>
                    <TabsTrigger value="dispensacion">Dispensación</TabsTrigger>
                    <TabsTrigger value="pacientes">Pacientes</TabsTrigger>
                    <TabsTrigger value="visitas">Visitas</TabsTrigger>
                    <TabsTrigger value="materiales">Materiales</TabsTrigger>
                </TabsList>

                {/* TAB 1: INVENTARIO */}
                <TabsContent value="inventario" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Package className="mr-2 h-5 w-5" />
                                Inventario de Muestras
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center space-x-2 mb-4">
                                <Input
                                    placeholder="Buscar por producto, lote..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="max-w-sm"
                                />
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Nuevo Lote
                                </Button>
                            </div>

                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Producto</TableHead>
                                        <TableHead>Lote</TableHead>
                                        <TableHead>Fabricación</TableHead>
                                        <TableHead>Vencimiento</TableHead>
                                        <TableHead>Cantidad</TableHead>
                                        <TableHead>Estado</TableHead>
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
