/**
 * The StorageProvider interface for abstraction of storage access.
 */
export interface StorageProvider {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/**
 * Default implementation of StorageProvider using window.localStorage.
 */
export class LocalStorageProvider implements StorageProvider {
  getItem(key: string): string | null {
    return window.localStorage.getItem(key);
  }

  setItem(key: string, value: string): void {
    window.localStorage.setItem(key, value);
  }

  removeItem(key: string): void {
    window.localStorage.removeItem(key);
  }
}

/**
 * Dummy implementation of StorageProvider that does nothing (for disabling persistence).
 */
export class NoStorageProvider implements StorageProvider {
  getItem(key: string): string | null {
    return null;
  }

  setItem(key: string, value: string): void {
    // do nothing
  }

  removeItem(key: string): void {
    // do nothing
  }
}
