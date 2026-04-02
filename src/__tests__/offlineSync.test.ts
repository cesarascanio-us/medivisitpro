import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { 
  enqueuePendingOperation, 
  getPendingCount, 
  processPendingSync, 
  registerSyncCallback,
  enqueueSyncConflict,
  getSyncConflicts,
  __resetOfflineDB
} from '../lib/offlineSync';
import { setOnlineStatus } from '../setupTests';

describe('OfflineSync Module - Industrial QA', () => {

  beforeEach(async () => {
    // Reset singleton instance
    await __resetOfflineDB();
    
    // Reset IndexedDB for each test
    const dbs = await indexedDB.databases();
    for (const db of dbs) {
      if (db.name) await indexedDB.deleteDatabase(db.name);
    }
    // Default online status
    setOnlineStatus(true);
  });

  it('a) Should enqueue operations in IndexedDB when offline', async () => {
    setOnlineStatus(false);
    
    await enqueuePendingOperation('visit', 'update', 'visits', { status: 'completed' });
    const count = await getPendingCount();
    
    expect(count).toBe(1);
  });

  it('b) Should process operations from IndexedDB when online', async () => {
    const mockSyncCallback = vi.fn().mockResolvedValue(true);
    registerSyncCallback(mockSyncCallback);
    
    // 1. Enqueue while "offline"
    setOnlineStatus(false);
    await enqueuePendingOperation('visit', 'create', 'visits', { notes: 'Test E2E' });
    
    // 2. Go "online" and sync
    setOnlineStatus(true);
    const result = await processPendingSync();
    
    expect(result.success).toBe(1);
    expect(mockSyncCallback).toHaveBeenCalled();
    expect(await getPendingCount()).toBe(0);
  });

  it('c) Should handle persistent failures and retryCount', async () => {
    const mockSyncCallback = vi.fn().mockRejectedValue(new Error('Network Failure'));
    registerSyncCallback(mockSyncCallback);
    
    await enqueuePendingOperation('order', 'create', 'orders', { amount: 100 });
    const result = await processPendingSync();
    
    expect(result.failed).toBe(1);
    const pending = await getPendingCount();
    expect(pending).toBe(1);
  });

  it('d) Should track sync conflicts in Case C requirement', async () => {
    const conflict = {
      operationId: 'op-123',
      table: 'products',
      localData: { stock: 10 },
      remoteData: { stock: 15 }
    };

    await enqueueSyncConflict(conflict);
    const conflicts = await getSyncConflicts();
    
    expect(conflicts.length).toBe(1);
    expect(conflicts[0].table).toBe('products');
    expect(conflicts[0].status).toBe('pending');
  });

});
