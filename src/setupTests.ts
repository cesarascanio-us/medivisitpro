import 'fake-indexeddb/auto';
import { vi } from 'vitest';

// Mock Navigator for onLine testing
let onlineStatus = true;
Object.defineProperty(window.navigator, 'onLine', {
  get: () => onlineStatus,
  configurable: true,
});

export const setOnlineStatus = (status: boolean) => {
  onlineStatus = status;
};

// Mock Console to avoid noise in tests
vi.spyOn(console, 'log').mockImplementation(() => {});
vi.spyOn(console, 'error').mockImplementation(() => {});
