import { get, set, update } from 'idb-keyval';
import {
  CacheExpirationStorageInterface,
  CacheMap,
} from './browser-response-cache';

export class IndexedDBCacheExpirationStorage
  implements CacheExpirationStorageInterface {
  private readonly IDB_STORAGE_KEY = 'idb-cache-expiration-storage';

  async set(url: string, cachedAt: Date): Promise<void> {
    await update(this.IDB_STORAGE_KEY, val => {
      const cacheMap = (val as CacheMap) || {};
      cacheMap[url] = cachedAt;
      return cacheMap;
    });
  }

  async get(url: string): Promise<Date | undefined> {
    const storage = await this.getAll();
    return storage[url];
  }

  async getAll(): Promise<CacheMap> {
    const storage = await get(this.IDB_STORAGE_KEY);
    return storage ?? {};
  }

  async remove(url: string): Promise<void> {
    await update(this.IDB_STORAGE_KEY, val => {
      const storage = val || {};
      delete storage[url];
      return storage;
    });
  }
}
