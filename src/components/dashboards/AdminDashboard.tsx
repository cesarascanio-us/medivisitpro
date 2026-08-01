/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Package, TrendingUp, LogOut, Activity, Building2, Stethoscope, Upload } from 'lucide-react';
import { DataImporter } from '@/components/DataImporter';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

const AdminDashboard = () => {
    const { signOut, role } = useAuth();
    // const [showImport, setShowImport] = useState(false); // Unused

    return (
        <div className="min-h-screen bg-gradient-subtle">
            <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
                                <Activity className="w-6 h-6 text-primary-foreground" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-foreground">MedVisit Pro</h1>
                                <p className="text-sm text-muted-foreground">
                                    Portal {role === 'admin' ? 'Administrador' : 'Gerencia'}
                                </p>
                            </div>
                        </div>
                        <Button variant="ghost" onClick={signOut} className="gap-2">
                            <LogOut className="w-4 h-4" />
                            Salir
                        </Button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-foreground mb-2">Panel de Control</h2>
                    <p className="text-muted-foreground">Vista general del sistema y métricas</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <Card className="border-border/50 shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Total Usuarios
                            </CardTitle>
                            <Users className="w-5 h-5 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-foreground">24</div>
                            <p className="text-xs text-muted-foreground mt-1">+3 este mes</p>
                        </CardContent>
                    </Card>

                    <Card className="border-border/50 shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Médicos
                            </CardTitle>
                            <Stethoscope className="w-5 h-5 text-accent" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-foreground">156</div>
                            <p className="text-xs text-muted-foreground mt-1">12 especialidades</p>
                        </CardContent>
                    </Card>

                    <Card className="border-border/50 shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Farmacias
                            </CardTitle>
                            <Building2 className="w-5 h-5 text-success" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-foreground">89</div>
                            <p className="text-xs text-muted-foreground mt-1">Activas</p>
                        </CardContent>
                    </Card>

                    <Card className="border-border/50 shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Productos
                            </CardTitle>
                            <Package className="w-5 h-5 text-warning" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-foreground">42</div>
                            <p className="text-xs text-muted-foreground mt-1">En catálogo</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="border-border/50 shadow-lg">
                        <CardHeader>
                            <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center mb-4">
                                <Users className="w-6 h-6 text-primary-foreground" />
                            </div>
                            <CardTitle>Gestión de Usuarios</CardTitle>
                            <CardDescription>
                                Administrar usuarios, roles y permisos del sistema
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button className="w-full bg-gradient-primary hover:opacity-90">
                                Gestionar Usuarios
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="border-border/50 shadow-lg">
                        <CardHeader>
                            <div className="w-12 h-12 rounded-xl bg-gradient-accent flex items-center justify-center mb-4">
                                <TrendingUp className="w-6 h-6 text-accent-foreground" />
                            </div>
                            <CardTitle>Reportes y Métricas</CardTitle>
                            <CardDescription>
                                Análisis de visitas, ventas y desempeño por zona
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button className="w-full bg-gradient-accent hover:opacity-90">
                                Ver Reportes
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="border-border/50 shadow-lg">
                        <CardHeader>
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                                <Package className="w-6 h-6 text-primary" />
                            </div>
                            <CardTitle>Gestión de Inventario</CardTitle>
                            <CardDescription>
                                Control de stock y productos disponibles
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button variant="outline" className="w-full">
                                Ver Inventario
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="border-border/50 shadow-lg">
                        <CardHeader>
                            <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center mb-4">
                                <Stethoscope className="w-6 h-6 text-success" />
                            </div>
                            <CardTitle>Base de Datos</CardTitle>
                            <CardDescription>
                                Gestionar médicos, farmacias y contactos. Importar datos masivos.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Button variant="outline" className="w-full">
                                Gestionar Base
                            </Button>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="secondary" className="w-full gap-2">
                                        <Upload className="w-4 h-4" />
                                        Importar Datos
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-xl">
                                    <DialogHeader>
                                        <DialogTitle>Importación Masiva</DialogTitle>
                                        <DialogDescription>
                                            Carga datos de Médicos, Farmacias o Contactos desde archivos CSV.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <DataImporter />
                                </DialogContent>
                            </Dialog>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
