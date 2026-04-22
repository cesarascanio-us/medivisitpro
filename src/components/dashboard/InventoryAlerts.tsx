/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
 ======================================================================== */

import { useState, useEffect } from 'react';
import { AlertTriangle, Clock, Package, Bell, X, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/useAuth';
import { getLowStockAlerts, getExpiringSamples } from '@/services/inventoryService';
import { supabase } from '@/integrations/supabase/client';
import { cn } from "@/lib/utils";

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
    notificationId?: string;
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
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        if (user) {
            loadAlerts();
        }
        
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000); // Update every minute
        
        return () => clearInterval(timer);
    }, [user]);

    const loadAlerts = async () => {
        if (!user) return;

        setLoading(true);
        try {
            // [INDUSTRIAL] Use backend notifications if available with safe filtering
            const { data: notifications } = await supabase
                .from('notifications')
                .select('*')
                .eq('is_read', false)
                .order('created_at', { ascending: false });

            // Safely filter local to avoid schema 400 errors (Point 3 - Resilience)
            const fefoAlerts = (notifications || []).filter(n => n.type === 'fefo_alert');

            const [lowStock] = await Promise.all([
                getLowStockAlerts(user.id, lowStockThreshold)
            ]);

            setLowStockItems(lowStock);

            if (fefoAlerts.length > 0) {
                // Map from notification table (Punto 3d del plan)
                const mappedAlerts: ExpiringItem[] = fefoAlerts.map(n => ({
                    productId: n.metadata?.product_id || 'unknown',
                    productName: (n.title || '').replace('Alerta FEFO: ', ''),
                    quantity: n.metadata?.quantity || 0,
                    expiryDate: new Date(Date.now() + (n.metadata?.days_left || 0) * 86400000).toISOString(),
                    daysUntilExpiry: n.metadata?.days_left || 0,
                    notificationId: n.id
                }));
                setExpiringItems(mappedAlerts);
            } else {
                // Fallback to real-time calculation if no batch job has run yet
                const expiring = await getExpiringSamples(user.id, expiryDaysAhead);
                setExpiringItems(expiring);
            }
        } catch (error) {
            console.error('Error loading inventory alerts:', error);
        } finally {
            setLoading(false);
        }
    };

    const dismissAlert = async (id: string, notificationId?: string) => {
        setDismissed(prev => new Set(prev).add(id));
        
        if (notificationId) {
            await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('id', notificationId);
        }
    };

    const visibleLowStock = lowStockItems.filter(item => !dismissed.has(`low_${item.productId}`));
    const visibleExpiring = expiringItems.filter(item => !dismissed.has(`exp_${item.productId}`));
    const totalAlerts = visibleLowStock.length + visibleExpiring.length;

    if (loading) {
        return (
            <div className="bg-card border-none rounded-[2rem] p-10 text-center animate-pulse shadow-soft">
                <Package className="mx-auto h-10 w-10 text-primary/30 mb-4 animate-bounce" />
                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest ">Sincronizando Mando FEFO...</p>
            </div>
        );
    }

    if (totalAlerts === 0) {
        return compact ? null : (
            <Card className="border-none bg-card shadow-soft rounded-[2.5rem] overflow-hidden group">
                <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-sm font-black text-slate-700 dark:text-foreground uppercase tracking-tight ">
                        <Package className="h-5 w-5 text-emerald-500" />
                        Garantía de Stock
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-center py-10">
                    <div className="relative inline-block mb-6">
                        <div className="absolute inset-0 bg-primary/10 blur-2xl rounded-full scale-150"></div>
                        <CheckCircle2 className="relative mx-auto h-12 w-12 text-emerald-500/40" />
                    </div>
                    <p className="text-slate-700 dark:text-foreground font-black uppercase tracking-tight  text-sm">Inventario Optimizado</p>
                    <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest mt-2">{currentTime.toLocaleTimeString()} • ZONA SEGURA</p>
                </CardContent>
            </Card>
        );
    }

    const getExpiryBadge = (days: number) => {
        if (days <= 7) return <Badge className="bg-rose-500/10 text-rose-500 border-none font-black text-[9px] uppercase">Vencimiento Crítico: {days}d</Badge>;
        if (days <= 14) return <Badge className="bg-amber-500/10 text-amber-500 border-none font-black text-[9px] uppercase">Preventivo: {days}d</Badge>;
        return <Badge className="bg-indigo-500/10 text-indigo-500 border-none font-black text-[9px] uppercase">Planificado: {days}d</Badge>;
    };

    return (
        <Card className="border-none bg-card shadow-soft rounded-[2.5rem] overflow-hidden font-outfit">
            <CardHeader className="pb-6 px-8 pt-8">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-3 text-sm font-black text-slate-700 dark:text-foreground uppercase tracking-tighter ">
                            <Bell className="h-5 w-5 text-primary" />
                            Alertas de Inventario
                            {totalAlerts > 0 && (
                                <Badge className="bg-rose-500/10 text-rose-500 border-none rounded-full h-5 w-5 flex items-center justify-center font-black text-[10px] p-0">
                                    {totalAlerts}
                                </Badge>
                            )}
                        </CardTitle>
                        <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">
                            Monitorización FEFO • Control de Caducidad CA
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="px-6 pb-8">
                <ScrollArea className={compact ? "h-[200px]" : "h-[300px]"}>
                    <div className="space-y-4 px-2">
                        {/* Low Stock Alerts */}
                        {visibleLowStock.map(item => (
                            <div
                                key={`low_${item.productId}`}
                                className="flex items-center justify-between p-5 bg-rose-500/5 rounded-[1.5rem] border border-rose-500/10 group hover:border-rose-500/30 transition-all font-outfit"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-2.5 rounded-xl bg-card shadow-soft text-rose-500">
                                        <AlertTriangle className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="font-black text-slate-700 dark:text-foreground uppercase tracking-tight  text-xs">{item.productName}</p>
                                        <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest mt-1">Quiebre de Stock détectado</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Badge className="bg-rose-500 text-white border-none font-black text-[10px] px-3">{item.quantity} Uds</Badge>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 rounded-full hover:bg-rose-500/10"
                                        onClick={() => dismissAlert(`low_${item.productId}`)}
                                    >
                                        <X className="h-4 w-4 text-slate-300" />
                                    </Button>
                                </div>
                            </div>
                        ))}

                        {/* Expiring Alerts */}
                        {visibleExpiring.map(item => (
                            <div
                                key={`exp_${item.productId}`}
                                className={cn(
                                    "flex items-center justify-between p-5 rounded-[1.5rem] border transition-all font-outfit",
                                    item.daysUntilExpiry <= 7
                                        ? 'bg-rose-500/5 border-rose-500/20 shadow-[0_0_20px_rgba(244,63,94,0.05)]'
                                        : item.daysUntilExpiry <= 14
                                            ? 'bg-amber-500/5 border-amber-500/20'
                                            : 'bg-indigo-500/5 border-indigo-500/20'
                                )}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "p-2.5 rounded-xl bg-card shadow-soft",
                                        item.daysUntilExpiry <= 7 ? 'text-rose-500' : item.daysUntilExpiry <= 14 ? 'text-amber-500' : 'text-indigo-500'
                                    )}>
                                        <Clock className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="font-black text-slate-700 dark:text-foreground uppercase tracking-tight  text-xs">{item.productName}</p>
                                        <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mt-1 ">Vencimiento Estratégico</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {getExpiryBadge(item.daysUntilExpiry)}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 rounded-full hover:bg-muted"
                                        onClick={() => dismissAlert(`exp_${item.productId}`, item.notificationId)}
                                    >
                                        <X className="h-4 w-4 text-slate-300" />
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
