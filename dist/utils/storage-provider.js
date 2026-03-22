/**
 * Default implementation of StorageProvider using window.localStorage.
 */
export class LocalStorageProvider {
    getItem(key) {
        return window.localStorage.getItem(key);
    }
    setItem(key, value) {
        window.localStorage.setItem(key, value);
    }
    removeItem(key) {
        window.localStorage.removeItem(key);
    }
}
/**
 * Dummy implementation of StorageProvider that does nothing (for disabling persistence).
 */
export class NoStorageProvider {
    getItem(key) {
        return null;
    }
    setItem(key, value) {
        // do nothing
    }
    removeItem(key) {
        // do nothing
    }
}
//# sourceMappingURL=storage-provider.js.map