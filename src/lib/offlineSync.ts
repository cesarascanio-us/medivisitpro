/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import { openDB, DBSchema, IDBPDatabase } from 'idb';

// Schema for IndexedDB
interface OfflineDBSchema extends DBSchema {
    pendingOperations: {
        key: string;
        value: PendingOperation;
        indexes: { 'by-timestamp': number };
    };
    cachedData: {
        key: string;
        value: CachedItem;
    };
    syncConflicts: {
        key: string;
        value: SyncConflict;
        indexes: { 'by-timestamp': number };
    };
}

export interface SyncConflict {
    id: string;
    operationId: string;
    timestamp: number;
    table: string;
    localData: Record<string, unknown>;
    remoteData: Record<string, unknown>;
    status: 'pending' | 'resolved';
}

export interface PendingOperation {
    id: string;
    timestamp: number;
    type: 'visit' | 'order' | 'sample_movement' | 'expense';
    action: 'create' | 'update' | 'delete';
    table: string;
    data: Record<string, unknown>;
    retryCount: number;
    lastError?: string;
}

interface CachedItem {
    key: string;
    data: unknown;
    cachedAt: number;
    expiresAt: number;
}

const DB_NAME = 'medivisitpro-offline';
const DB_VERSION = 2;

let dbInstance: IDBPDatabase<OfflineDBSchema> | null = null;

async function getDB(): Promise<IDBPDatabase<OfflineDBSchema>> {
    if (dbInstance) return dbInstance;

    dbInstance = await openDB<OfflineDBSchema>(DB_NAME, DB_VERSION, {
        upgrade(db) {
            // Store for pending operations
            if (!db.objectStoreNames.contains('pendingOperations')) {
                const store = db.createObjectStore('pendingOperations', { keyPath: 'id' });
                store.createIndex('by-timestamp', 'timestamp');
            }
            // Store for sync conflicts
            if (!db.objectStoreNames.contains('syncConflicts')) {
                const store = db.createObjectStore('syncConflicts', { keyPath: 'id' });
                store.createIndex('by-timestamp', 'timestamp');
            }
            // Store for cached data
            if (!db.objectStoreNames.contains('cachedData')) {
                db.createObjectStore('cachedData', { keyPath: 'key' });
            }
        }
    });

    return dbInstance;
}

/**
 * RESET FOR TESTING ONLY
 * Closes and clears the singleton DB instance
 */
export async function __resetOfflineDB(): Promise<void> {
    if (dbInstance) {
        dbInstance.close();
        dbInstance = null;
    }
}

// Generate unique ID
function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// ============ PENDING OPERATIONS ============

export async function enqueuePendingOperation(
    type: PendingOperation['type'],
    action: PendingOperation['action'],
    table: string,
    data: Record<string, unknown>
): Promise<string> {
    const db = await getDB();
    const op: PendingOperation = {
        id: generateId(),
        timestamp: Date.now(),
        type,
        action,
        table,
        data,
        retryCount: 0
    };
    await db.put('pendingOperations', op);
    console.log('[OfflineSync] Operation enqueued:', op.id);
    return op.id;
}

export async function getPendingOperations(): Promise<PendingOperation[]> {
    const db = await getDB();
    return db.getAllFromIndex('pendingOperations', 'by-timestamp');
}

export async function removePendingOperation(id: string): Promise<void> {
    const db = await getDB();
    await db.delete('pendingOperations', id);
    console.log('[OfflineSync] Operation removed:', id);
}

export async function updatePendingOperation(op: PendingOperation): Promise<void> {
    const db = await getDB();
    await db.put('pendingOperations', op);
}

export async function getPendingCount(): Promise<number> {
    const db = await getDB();
    return db.count('pendingOperations');
}

// ============ SYNC CONFLICTS ============

export async function enqueueSyncConflict(
    conflict: Omit<SyncConflict, 'id' | 'timestamp' | 'status'>
): Promise<string> {
    const db = await getDB();
    const c: SyncConflict = {
        ...conflict,
        id: generateId(),
        timestamp: Date.now(),
        status: 'pending'
    };
    await db.put('syncConflicts', c);
    console.log('[OfflineSync] Conflict enqueued:', c.id);
    return c.id;
}

export async function getSyncConflicts(): Promise<SyncConflict[]> {
    const db = await getDB();
    const tx = db.transaction('syncConflicts', 'readonly');
    const store = tx.objectStore('syncConflicts');
    const index = store.index('by-timestamp');
    return index.getAll();
}

export async function removeSyncConflict(id: string): Promise<void> {
    const db = await getDB();
    await db.delete('syncConflicts', id);
}

export async function resolveSyncConflict(id: string): Promise<void> {
    const db = await getDB();
    const c = await db.get('syncConflicts', id);
    if (c) {
        c.status = 'resolved';
        await db.put('syncConflicts', c);
    }
}

// ============ CACHED DATA ============

export async function setCachedData(key: string, data: unknown, ttlMinutes: number = 60): Promise<void> {
    const db = await getDB();
    const item: CachedItem = {
        key,
        data,
        cachedAt: Date.now(),
        expiresAt: Date.now() + (ttlMinutes * 60 * 1000)
    };
    await db.put('cachedData', item);
}

export async function getCachedData<T>(key: string): Promise<T | null> {
    const db = await getDB();
    const item = await db.get('cachedData', key);
    if (!item) return null;
    if (Date.now() > item.expiresAt) {
        await db.delete('cachedData', key);
        return null;
    }
    return item.data as T;
}

export async function clearExpiredCache(): Promise<void> {
    const db = await getDB();
    const tx = db.transaction('cachedData', 'readwrite');
    const store = tx.objectStore('cachedData');
    const all = await store.getAll();
    const now = Date.now();

    for (const item of all) {
        if (now > item.expiresAt) {
            await store.delete(item.key);
        }
    }
    await tx.done;
}

// ============ SYNC ENGINE ============

export type SyncCallback = (operation: PendingOperation) => Promise<boolean>;

let syncInProgress = false;
let syncCallback: SyncCallback | null = null;

export function registerSyncCallback(callback: SyncCallback): void {
    syncCallback = callback;
}

export async function processPendingSync(): Promise<{ success: number; failed: number }> {
    if (syncInProgress || !navigator.onLine) {
        return { success: 0, failed: 0 };
    }

    syncInProgress = true;
    let success = 0;
    let failed = 0;

    try {
        const operations = await getPendingOperations();
        console.log(`[OfflineSync] Processing ${operations.length} pending operations`);

        for (const op of operations) {
            try {
                if (syncCallback) {
                    const result = await syncCallback(op);
                    if (result) {
                        await removePendingOperation(op.id);
                        success++;
                    } else {
                        op.retryCount++;
                        op.lastError = 'Sync callback returned false';
                        await updatePendingOperation(op);
                        failed++;
                    }
                }
            } catch (error: any) {
                op.retryCount++;
                op.lastError = error.message;
                await updatePendingOperation(op);
                failed++;
                console.error('[OfflineSync] Failed to sync operation:', op.id, error);
            }
        }
    } finally {
        syncInProgress = false;
        if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
            localStorage.setItem('lastSyncTime', new Date().toISOString());
        }
    }

    console.log(`[OfflineSync] Sync complete: ${success} success, ${failed} failed`);
    return { success, failed };
}

// Auto-sync when coming online
if (typeof window !== 'undefined') {
    window.addEventListener('online', () => {
        console.log('[OfflineSync] Connection restored, starting sync...');
        processPendingSync();
    });
}
