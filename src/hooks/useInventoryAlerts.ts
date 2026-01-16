import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface InventoryAlert {
    id: string;
    type: 'expiring' | 'low_stock' | 'expired';
    message: string;
    severity: 'warning' | 'critical';
    itemId: string;
    itemName: string;
    expiryDate?: string;
    quantity?: number;
}

export function useInventoryAlerts() {
    const [loading, setLoading] = useState(false);

    /**
     * Get items expiring within specified days
     */
    const getExpiringItems = useCallback(async (days: number = 30): Promise<InventoryAlert[]> => {
        try {
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + days);

            const { data, error } = await supabase
                .from('sample_inventory')
                .select('*, products(name)')
                .lte('expiry_date', futureDate.toISOString())
                .gt('expiry_date', new Date().toISOString())
                .gt('quantity_available', 0)
                .order('expiry_date', { ascending: true });

            if (error) throw error;

            return (data || []).map(item => {
                const expiryDate = new Date(item.expiry_date);
                const daysUntil = Math.floor((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

                return {
                    id: `expiring-${item.id}`,
                    type: 'expiring' as const,
                    message: `${item.products?.name || 'Producto'} - ${item.quantity_available} unidades vencen en ${daysUntil} días`,
                    severity: daysUntil <= 7 ? 'critical' : 'warning',
                    itemId: item.id,
                    itemName: item.products?.name || 'Producto',
                    expiryDate: item.expiry_date,
                    quantity: item.quantity_available
                };
            });
        } catch (error) {
            console.error('Error getting expiring items:', error);
            return [];
        }
    }, []);

    /**
     * Get items with low stock
     */
    const getLowStockItems = useCallback(async (threshold: number = 10): Promise<InventoryAlert[]> => {
        try {
            const { data, error } = await supabase
                .from('sample_inventory')
                .select('*, products(name)')
                .lte('quantity_available', threshold)
                .gt('quantity_available', 0)
                .order('quantity_available', { ascending: true });

            if (error) throw error;

            return (data || []).map(item => ({
                id: `low-stock-${item.id}`,
                type: 'low_stock' as const,
                message: `${item.products?.name || 'Producto'} - Solo quedan ${item.quantity_available} unidades`,
                severity: item.quantity_available <= 5 ? 'critical' : 'warning',
                itemId: item.id,
                itemName: item.products?.name || 'Producto',
                quantity: item.quantity_available
            }));
        } catch (error) {
            console.error('Error getting low stock items:', error);
            return [];
        }
    }, []);

    /**
     * Get expired items that still have stock
     */
    const getExpiredItems = useCallback(async (): Promise<InventoryAlert[]> => {
        try {
            const { data, error } = await supabase
                .from('sample_inventory')
                .select('*, products(name)')
                .lt('expiry_date', new Date().toISOString())
                .gt('quantity_available', 0)
                .order('expiry_date', { ascending: true });

            if (error) throw error;

            return (data || []).map(item => ({
                id: `expired-${item.id}`,
                type: 'expired' as const,
                message: `${item.products?.name || 'Producto'} - ${item.quantity_available} unidades VENCIDAS`,
                severity: 'critical' as const,
                itemId: item.id,
                itemName: item.products?.name || 'Producto',
                expiryDate: item.expiry_date,
                quantity: item.quantity_available
            }));
        } catch (error) {
            console.error('Error getting expired items:', error);
            return [];
        }
    }, []);

    /**
     * Get all inventory alerts
     */
    const getAllAlerts = useCallback(async (): Promise<InventoryAlert[]> => {
        setLoading(true);
        try {
            const [expired, expiring, lowStock] = await Promise.all([
                getExpiredItems(),
                getExpiringItems(30),
                getLowStockItems(10)
            ]);

            // Combine and sort by severity
            const allAlerts = [...expired, ...expiring, ...lowStock];
            allAlerts.sort((a, b) => {
                if (a.severity === 'critical' && b.severity !== 'critical') return -1;
                if (a.severity !== 'critical' && b.severity === 'critical') return 1;
                return 0;
            });

            return allAlerts;
        } finally {
            setLoading(false);
        }
    }, [getExpiredItems, getExpiringItems, getLowStockItems]);

    /**
     * Create a notification for an inventory alert
     */
    const createAlertNotification = useCallback(async (alert: InventoryAlert, userId: string): Promise<void> => {
        try {
            await supabase
                .from('notifications')
                .insert({
                    user_id: userId,
                    title: alert.type === 'expired' ? '⚠️ Muestras Vencidas' :
                        alert.type === 'expiring' ? '⏰ Muestras por Vencer' :
                            '📦 Stock Bajo',
                    message: alert.message,
                    notification_type: 'inventory',
                    category: alert.severity,
                    priority: alert.severity === 'critical' ? 'high' : 'medium',
                    reference_type: 'sample_inventory',
                    reference_id: alert.itemId
                });
        } catch (error) {
            console.error('Error creating alert notification:', error);
        }
    }, []);

    return {
        loading,
        getExpiringItems,
        getLowStockItems,
        getExpiredItems,
        getAllAlerts,
        createAlertNotification
    };
}
