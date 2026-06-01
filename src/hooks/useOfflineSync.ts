/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import { useState, useEffect, useCallback } from 'react';
import {
    enqueuePendingOperation,
    getPendingCount,
    processPendingSync,
    registerSyncCallback,
    PendingOperation,
    getSyncConflicts,
    resolveSyncConflict,
    SyncConflict,
    enqueueSyncConflict
} from '@/lib/offlineSync';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface UseOfflineSyncReturn {
    isOnline: boolean;
    pendingCount: number;
    isSyncing: boolean;
    enqueueOperation: (
        type: PendingOperation['type'],
        action: PendingOperation['action'],
        table: string,
        data: Record<string, unknown>
    ) => Promise<string>;
    forceSync: () => Promise<void>;
    conflicts: SyncConflict[];
    resolveConflict: (id: string) => Promise<void>;
}

export function useOfflineSync(): UseOfflineSyncReturn {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [pendingCount, setPendingCount] = useState(0);
    const [isSyncing, setIsSyncing] = useState(false);
    const [conflicts, setConflicts] = useState<SyncConflict[]>([]);

    // Update online status
    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            toast({
                title: "Conexión restaurada",
                description: "Sincronizando datos pendientes...",
                className: "bg-green-50 border-green-200"
            });
        };

        const handleOffline = () => {
            setIsOnline(false);
            toast({
                title: "Sin conexión",
                description: "Los cambios se guardarán localmente",
                variant: "destructive"
            });
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const updateConflicts = useCallback(async () => {
        const c = await getSyncConflicts();
        setConflicts(c.filter(item => item.status === 'pending'));
    }, []);

    // Update pending count
    const updatePendingCount = useCallback(async () => {
        const count = await getPendingCount();
        setPendingCount(count);
        await updateConflicts();
    }, [updateConflicts]);

    useEffect(() => {
        updatePendingCount();
        const interval = setInterval(updatePendingCount, 5000);
        return () => clearInterval(interval);
    }, [updatePendingCount]);

    // Register sync callback
    useEffect(() => {
        registerSyncCallback(async (operation: PendingOperation) => {
            try {
                const { table, action, data } = operation;

                if (action === 'create') {
                    const { error } = await supabase.from(table as any).insert(data);
                    if (error) throw error;
                } else if (action === 'update') {
                    const { id, ...updateData } = data;
                    
                    // Fetch remote state to check for conflicts
                    const { data: remoteData, error: fetchError } = await supabase
                        .from(table as any)
                        .select('*')
                        .eq('id', id)
                        .single();

                    if (!fetchError && remoteData) {
                        const remote = remoteData as any;
                        const local = data as any;
                        
                        // SIMPLE CONFLICT DETECTION: If remote updated_at is newer than our local data's context
                        if (remote.updated_at && local.updated_at && new Date(remote.updated_at) > new Date(local.updated_at)) {
                            console.warn('[OfflineSync] Conflict detected on table:', table);
                            await enqueueSyncConflict({
                                operationId: operation.id,
                                table,
                                localData: data,
                                remoteData: remote
                            });
                            return false; // Skip this sync, handled by conflict queue
                        }
                    }

                    const { error } = await supabase.from(table as any).update(updateData).eq('id', id);
                    if (error) throw error;
                } else if (action === 'delete') {
                    const { error } = await supabase.from(table as any).delete().eq('id', data.id);
                    if (error) throw error;
                }

                return true;
            } catch (error) {
                console.error('[useOfflineSync] Sync failed:', error);
                return false;
            }
        });
    }, []);

    // Enqueue operation
    const enqueueOperation = useCallback(async (
        type: PendingOperation['type'],
        action: PendingOperation['action'],
        table: string,
        data: Record<string, unknown>
    ): Promise<string> => {
        const id = await enqueuePendingOperation(type, action, table, data);
        await updatePendingCount();
        return id;
    }, [updatePendingCount]);

    // Force sync
    const forceSync = useCallback(async () => {
        if (!isOnline) {
            toast({
                title: "Sin conexión",
                description: "No es posible sincronizar sin conexión a internet",
                variant: "destructive"
            });
            return;
        }

        setIsSyncing(true);
        try {
            const result = await processPendingSync();
            await updatePendingCount();

            if (result.success > 0) {
                toast({
                    title: "Sincronización completada",
                    description: `${result.success} operación(es) sincronizada(s)`,
                    className: "bg-green-50 border-green-200"
                });
            }

            if (result.failed > 0) {
                toast({
                    title: "Acciones pendientes",
                    description: `${result.failed} operación(es) fallaron o tienen conflictos`,
                    variant: "destructive"
                });
            }
        } finally {
            setIsSyncing(false);
        }
    }, [isOnline, updatePendingCount]);

    const resolveConflict = useCallback(async (id: string) => {
        await resolveSyncConflict(id);
        await updateConflicts();
    }, [updateConflicts]);

    return {
        isOnline,
        pendingCount,
        isSyncing,
        enqueueOperation,
        forceSync,
        conflicts,
        resolveConflict
    };
}
