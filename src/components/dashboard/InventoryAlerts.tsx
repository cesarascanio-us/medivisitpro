import { useState, useEffect } from 'react';
import { AlertTriangle, Clock, Package, Bell, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/useAuth';
import { getLowStockAlerts, getExpiringSamples } from '@/services/inventoryService';
import { supabase } from '@/integrations/supabase/client';

interface LowStockItem {
    productId: string;
    productName: string;
    quantity: number;
    expiryDate: string | null;
}

interface ExpiringItem {
    productId: string;
    productName: string;
    quantity: number;
    expiryDate: string;
    daysUntilExpiry: number;
}

interface InventoryAlertsProps {
    lowStockThreshold?: number;
    expiryDaysAhead?: number;
    compact?: boolean;
}

export function InventoryAlerts({
    lowStockThreshold = 10,
    expiryDaysAhead = 30,
    compact = false
}: InventoryAlertsProps) {
    const { user } = useAuth();
    const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([]);
    const [expiringItems, setExpiringItems] = useState<ExpiringItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [dismissed, setDismissed] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (user) {
            loadAlerts();
        }
    }, [user]);

    const loadAlerts = async () => {
        if (!user) return;

        setLoading(true);
        try {
            const [lowStock, expiring] = await Promise.all([
                getLowStockAlerts(user.id, lowStockThreshold),
                getExpiringSamples(user.id, expiryDaysAhead)
            ]);

            setLowStockItems(lowStock);
            setExpiringItems(expiring);
        } catch (error) {
            console.error('Error loading inventory alerts:', error);
        } finally {
            setLoading(false);
        }
    };

    const dismissAlert = (id: string) => {
        setDismissed(prev => new Set(prev).add(id));
    };

    const createNotification = async (type: 'low_stock' | 'expiring', productName: string, details: string) => {
        if (!user) return;

        try {
            await supabase.from('notifications').insert({
                user_id: user.id,
                title: type === 'low_stock' ? 'Stock Bajo' : 'Muestra por Vencer',
                message: `${productName}: ${details}`,
                type: 'alert',
                is_read: false
            });
        } catch (error) {
            console.error('Error creating notification:', error);
        }
    };

    // Create notifications for critical alerts (less than 5 days or 0 stock)
    useEffect(() => {
        if (!user) return;

        // Critical low stock (0 items)
        lowStockItems
            .filter(item => item.quantity === 0)
            .forEach(item => {
                createNotification('low_stock', item.productName, 'Sin stock disponible');
            });

        // Critical expiring (less than 7 days)
        expiringItems
            .filter(item => item.daysUntilExpiry <= 7)
            .forEach(item => {
                createNotification('expiring', item.productName, `Vence en ${item.daysUntilExpiry} días`);
            });
    }, [lowStockItems, expiringItems]);

    const visibleLowStock = lowStockItems.filter(item => !dismissed.has(`low_${item.productId}`));
    const visibleExpiring = expiringItems.filter(item => !dismissed.has(`exp_${item.productId}`));
    const totalAlerts = visibleLowStock.length + visibleExpiring.length;

    if (loading) {
        return (
            <div className="medical-card p-12 text-center animate-pulse">
                <Package className="mx-auto h-8 w-8 text-emerald-500/50 mb-4 animate-bounce" />
                <p className="text-slate-400 text-sm font-medium">Sincronizando inventario premium...</p>
            </div>
        );
    }

    if (totalAlerts === 0) {
        return compact ? null : (
            <Card className="medical-card">
                <CardHeader className="pb-2">
                    <CardTitle className="flex items-center text-lg">
                        <Package className="mr-2 h-5 w-5 text-primary" />
                        Alertas de Inventario
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-center py-12">
                    <div className="relative inline-block mb-4">
                        <div className="absolute inset-0 bg-emerald-500/10 blur-xl rounded-full scale-150"></div>
                        <Package className="relative mx-auto h-12 w-12 text-emerald-500/40" />
                    </div>
                    <p className="text-slate-300 font-semibold tracking-tight">Inventario Optimizado</p>
                    <p className="text-slate-500 text-xs mt-1">No hay alertas críticas en tu zona hoy.</p>
                </CardContent>
            </Card>
        );
    }

    const getExpiryBadge = (days: number) => {
        if (days <= 7) return <Badge variant="destructive">Vence en {days}d</Badge>;
        if (days <= 14) return <Badge className="bg-orange-500">Vence en {days}d</Badge>;
        return <Badge variant="secondary">Vence en {days}d</Badge>;
    };

    const getStockBadge = (quantity: number) => {
        if (quantity === 0) return <Badge variant="destructive">Sin stock</Badge>;
        if (quantity <= 5) return <Badge className="bg-orange-500">{quantity} unidades</Badge>;
        return <Badge variant="secondary">{quantity} unidades</Badge>;
    };

    return (
        <Card className="medical-card">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center text-lg">
                            <Bell className="mr-2 h-5 w-5 text-primary" />
                            Alertas de Inventario
                            {totalAlerts > 0 && (
                                <Badge variant="destructive" className="ml-2">
                                    {totalAlerts}
                                </Badge>
                            )}
                        </CardTitle>
                        <CardDescription>
                            Stock bajo y muestras próximas a vencer
                        </CardDescription>
                    </div>
                    <Button variant="ghost" size="sm" onClick={loadAlerts}>
                        Actualizar
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <ScrollArea className={compact ? "h-[200px]" : "h-[300px]"}>
                    <div className="space-y-3">
                        {/* Low Stock Alerts */}
                        {visibleLowStock.map(item => (
                            <div
                                key={`low_${item.productId}`}
                                className="flex items-center justify-between p-4 bg-red-500/5 rounded-2xl border border-red-500/10 group hover:bg-red-500/10 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-full bg-red-100 dark:bg-red-900">
                                        <AlertTriangle className="h-4 w-4 text-red-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">{item.productName}</p>
                                        <p className="text-xs text-muted-foreground">Stock bajo</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {getStockBadge(item.quantity)}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6"
                                        onClick={() => dismissAlert(`low_${item.productId}`)}
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>
                        ))}

                        {/* Expiring Alerts */}
                        {visibleExpiring.map(item => (
                            <div
                                key={`exp_${item.productId}`}
                                className={`flex items-center justify-between p-3 rounded-lg border ${item.daysUntilExpiry <= 7
                                    ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
                                    : item.daysUntilExpiry <= 14
                                        ? 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800'
                                        : 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-full ${item.daysUntilExpiry <= 7
                                        ? 'bg-red-100 dark:bg-red-900'
                                        : item.daysUntilExpiry <= 14
                                            ? 'bg-orange-100 dark:bg-orange-900'
                                            : 'bg-yellow-100 dark:bg-yellow-900'
                                        }`}>
                                        <Clock className={`h-4 w-4 ${item.daysUntilExpiry <= 7
                                            ? 'text-red-600'
                                            : item.daysUntilExpiry <= 14
                                                ? 'text-orange-600'
                                                : 'text-yellow-600'
                                            }`} />
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">{item.productName}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {item.quantity} unidades por vencer
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {getExpiryBadge(item.daysUntilExpiry)}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6"
                                        onClick={() => dismissAlert(`exp_${item.productId}`)}
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}

export default InventoryAlerts;
