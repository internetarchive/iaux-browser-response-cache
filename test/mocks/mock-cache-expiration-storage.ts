import {
  CacheExpirationStorageInterface,
  CacheMap,
} from '../../src/browser-response-cache';

export class MockCacheExpirationStorage
  implements CacheExpirationStorageInterface {
  async set(url: string, cachedAt: Date): Promise<void> {
    this.expirationMap[url] = cachedAt;
  }

  async get(url: string): Promise<Date | undefined> {
    return this.expirationMap[url];
  }

  async getAll(): Promise<CacheMap> {
    return this.expirationMap;
  }

  async remove(url: string): Promise<void> {
    delete this.expirationMap[url];
  }

  private expirationMap: CacheMap = {};
}
