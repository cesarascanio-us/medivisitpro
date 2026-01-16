import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, Package, FileText, LogOut, Activity } from 'lucide-react';

const FarmaciaDashboard = () => {
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
                                <p className="text-sm text-muted-foreground">Portal Farmacia</p>
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
                        Bienvenido, {user?.email?.split('@')[0]}
                    </h2>
                    <p className="text-muted-foreground">
                        Gestiona tus pedidos y reposiciones de inventario
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card className="border-border/50 shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Pedidos Activos
                            </CardTitle>
                            <ShoppingCart className="w-5 h-5 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-foreground">3</div>
                            <p className="text-xs text-muted-foreground mt-1">2 en proceso</p>
                        </CardContent>
                    </Card>

                    <Card className="border-border/50 shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Pedidos Mes
                            </CardTitle>
                            <Package className="w-5 h-5 text-accent" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-foreground">12</div>
                            <p className="text-xs text-muted-foreground mt-1">Total completados</p>
                        </CardContent>
                    </Card>

                    <Card className="border-border/50 shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Monto Total
                            </CardTitle>
                            <FileText className="w-5 h-5 text-success" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-foreground">$8.4K</div>
                            <p className="text-xs text-muted-foreground mt-1">Este mes</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="border-border/50 shadow-lg hover:shadow-xl transition-all">
                        <CardHeader>
                            <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center mb-4">
                                <ShoppingCart className="w-6 h-6 text-primary-foreground" />
                            </div>
                            <CardTitle>Nuevo Pedido</CardTitle>
                            <CardDescription>
                                Realiza un nuevo pedido de reposición de stock
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button className="w-full bg-gradient-primary hover:opacity-90">
                                Crear Pedido
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="border-border/50 shadow-lg hover:shadow-xl transition-all">
                        <CardHeader>
                            <div className="w-12 h-12 rounded-xl bg-gradient-accent flex items-center justify-center mb-4">
                                <Package className="w-6 h-6 text-accent-foreground" />
                            </div>
                            <CardTitle>Catálogo de Productos</CardTitle>
                            <CardDescription>
                                Explora productos disponibles con precios actualizados
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button className="w-full bg-gradient-accent hover:opacity-90">
                                Ver Catálogo
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="border-border/50 shadow-lg hover:shadow-xl transition-all">
                        <CardHeader>
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                                <FileText className="w-6 h-6 text-primary" />
                            </div>
                            <CardTitle>Mis Pedidos</CardTitle>
                            <CardDescription>
                                Historial y estado de todos tus pedidos
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button variant="outline" className="w-full">
                                Ver Historial
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="border-border/50 shadow-lg hover:shadow-xl transition-all">
                        <CardHeader>
                            <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center mb-4">
                                <FileText className="w-6 h-6 text-success" />
                            </div>
                            <CardTitle>Facturas</CardTitle>
                            <CardDescription>
                                Descarga y consulta tus facturas
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button variant="outline" className="w-full">
                                Ver Facturas
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
};

export default FarmaciaDashboard;
