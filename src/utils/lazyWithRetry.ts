import React, { ComponentType, lazy } from 'react';

/**
 * Wrapper for React.lazy that catches chunk load errors
 * (e.g. after a new deployment on Vercel/CDN where old asset hashes are 404)
 * and automatically reloads the page to get the freshest build.
 */
export function lazyWithRetry<T extends ComponentType<any>>(
  componentImport: () => Promise<{ default: T } | any>,
  name?: string
): React.LazyExoticComponent<T> {
  return lazy(async () => {
    const storageKey = `retry_lazy_${name || 'comp'}`;
    const pageHasAlreadyBeenForceRefreshed = window.sessionStorage.getItem(storageKey) === 'true';

    try {
      const module = await componentImport();
      window.sessionStorage.removeItem(storageKey);
      if (module.default) {
        return module;
      }
      if (name && module[name]) {
        return { default: module[name] };
      }
      return module;
    } catch (error: any) {
      console.warn(`[lazyWithRetry] Stale chunk detected for ${name || 'component'}, error:`, error);

      if (!pageHasAlreadyBeenForceRefreshed) {
        window.sessionStorage.setItem(storageKey, 'true');
        window.location.reload();
        return new Promise(() => {}); // hold promise until reload triggers
      }

      throw error;
    }
  });
}
