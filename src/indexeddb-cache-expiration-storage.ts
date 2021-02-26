import { get, update } from 'idb-keyval';
import {
  CacheExpirationStorageInterface,
  CacheMap,
} from './browser-response-cache';

export class IndexedDBCacheExpirationStorage
  implements CacheExpirationStorageInterface {
  private readonly DEFAULT_IDB_STORAGE_KEY = 'idb-cache-expiration-storage';

  private storageKey: string;

  async set(url: string, expiresAt: Date): Promise<void> {
    await update(this.storageKey, val => {
      const cacheMap = (val as CacheMap) || {};
      cacheMap[url] = expiresAt;
      return cacheMap;
    });
  }

  async get(url: string): Promise<Date | undefined> {
    const storage = await this.getAll();
    return storage[url];
  }

  async getAll(): Promise<CacheMap> {
    const storage = await get(this.storageKey);
    return storage ?? {};
  }

  async remove(url: string): Promise<void> {
    await update(this.storageKey, val => {
      const storage = val || {};
      delete storage[url];
      return storage;
    });
  }

  constructor(options?: { storageKey?: string }) {
    this.storageKey = options?.storageKey ?? this.DEFAULT_IDB_STORAGE_KEY;
  }
}
