import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Package, FileText, LogOut, Activity } from 'lucide-react';

const VisitadorDashboard = () => {
    const { signOut, user } = useAuth();

    return (
        <div className="min-h-screen bg-gradient-subtle">
            {/* Header */}
            <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
                                <Activity className="w-6 h-6 text-primary-foreground" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-foreground">MedVisit Pro</h1>
                                <p className="text-sm text-muted-foreground">Portal Visitador</p>
                            </div>
                        </div>
                        <Button variant="ghost" onClick={signOut} className="gap-2">
                            <LogOut className="w-4 h-4" />
                            Salir
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-foreground mb-2">
                        Bienvenido, {user?.email?.split('@')[0]}
                    </h2>
                    <p className="text-muted-foreground">
                        Gestiona tus visitas médicas y entregas de muestras
                    </p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card className="border-border/50 shadow-md hover:shadow-lg transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Visitas Hoy
                            </CardTitle>
                            <Calendar className="w-5 h-5 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-foreground">5</div>
                            <p className="text-xs text-muted-foreground mt-1">3 programadas, 2 completadas</p>
                        </CardContent>
                    </Card>

                    <Card className="border-border/50 shadow-md hover:shadow-lg transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Muestras Disponibles
                            </CardTitle>
                            <Package className="w-5 h-5 text-accent" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-foreground">127</div>
                            <p className="text-xs text-muted-foreground mt-1">8 productos diferentes</p>
                        </CardContent>
                    </Card>

                    <Card className="border-border/50 shadow-md hover:shadow-lg transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Reportes Mes
                            </CardTitle>
                            <FileText className="w-5 h-5 text-success" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-foreground">42</div>
                            <p className="text-xs text-muted-foreground mt-1">85% tasa de visita</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="border-border/50 shadow-lg hover:shadow-xl transition-all cursor-pointer group">
                        <CardHeader>
                            <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Calendar className="w-6 h-6 text-primary-foreground" />
                            </div>
                            <CardTitle>Agenda de Visitas</CardTitle>
                            <CardDescription>
                                Ver y gestionar tu calendario de visitas programadas
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button className="w-full bg-gradient-primary hover:opacity-90 transition-opacity">
                                Abrir Agenda
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="border-border/50 shadow-lg hover:shadow-xl transition-all cursor-pointer group">
                        <CardHeader>
                            <div className="w-12 h-12 rounded-xl bg-gradient-accent flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Package className="w-6 h-6 text-accent-foreground" />
                            </div>
                            <CardTitle>Catálogo de Productos</CardTitle>
                            <CardDescription>
                                Explora productos y gestiona tu inventario de muestras
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button className="w-full bg-gradient-accent hover:opacity-90 transition-opacity">
                                Ver Catálogo
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="border-border/50 shadow-lg hover:shadow-xl transition-all cursor-pointer group">
                        <CardHeader>
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <FileText className="w-6 h-6 text-primary" />
                            </div>
                            <CardTitle>Nueva Visita</CardTitle>
                            <CardDescription>
                                Registrar una nueva visita y entrega de muestras
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button variant="outline" className="w-full">
                                Registrar Visita
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="border-border/50 shadow-lg hover:shadow-xl transition-all cursor-pointer group">
                        <CardHeader>
                            <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <FileText className="w-6 h-6 text-success" />
                            </div>
                            <CardTitle>Mis Reportes</CardTitle>
                            <CardDescription>
                                Historial de visitas y reportes generados
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button variant="outline" className="w-full">
                                Ver Historial
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
};

export default VisitadorDashboard;
