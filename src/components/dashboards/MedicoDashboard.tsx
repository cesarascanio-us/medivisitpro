/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Search, LogOut, Activity } from 'lucide-react';

const MedicoDashboard = () => {
    const { signOut, user } = useAuth();

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
                                <p className="text-sm text-muted-foreground">Portal Médico</p>
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
                    <h2 className="text-3xl font-bold text-foreground mb-2">
                        Bienvenido, Dr(a). {user?.email?.split('@')[0]}
                    </h2>
                    <p className="text-muted-foreground">
                        Accede a información científica de productos farmacéuticos
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                    <Card className="border-border/50 shadow-lg hover:shadow-xl transition-all">
                        <CardHeader>
                            <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center mb-4">
                                <Search className="w-6 h-6 text-primary-foreground" />
                            </div>
                            <CardTitle>Búsqueda de Productos</CardTitle>
                            <CardDescription>
                                Explora el catálogo científico completo de productos
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button className="w-full bg-gradient-primary hover:opacity-90">
                                Buscar Productos
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="border-border/50 shadow-lg hover:shadow-xl transition-all">
                        <CardHeader>
                            <div className="w-12 h-12 rounded-xl bg-gradient-accent flex items-center justify-center mb-4">
                                <FileText className="w-6 h-6 text-accent-foreground" />
                            </div>
                            <CardTitle>Fichas Técnicas</CardTitle>
                            <CardDescription>
                                Descarga información científica detallada en PDF
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button className="w-full bg-gradient-accent hover:opacity-90">
                                Ver Documentación
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                <Card className="border-border/50 shadow-md mt-8 max-w-4xl mx-auto">
                    <CardHeader>
                        <CardTitle className="text-sm text-muted-foreground">Nota Importante</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Este portal proporciona acceso a información científica exclusivamente.
                            Los precios y disponibilidad de stock no están disponibles en esta vista.
                        </p>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
};

export default MedicoDashboard;
