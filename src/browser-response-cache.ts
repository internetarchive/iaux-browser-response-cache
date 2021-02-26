import { IndexedDBCacheExpirationStorage } from './indexeddb-cache-expiration-storage';

/**
 * CacheTTL is in milliseconds
 */
export type CacheTTL = number;

export type CacheMap = { [url: string]: Date };

/**
 * The CacheExpirationStorageInterface is a storage backend
 * to keep track of the cachedAt date for a given URL.
 *
 * This could be a simple dictionary like `{ url: Date }` either
 * stored in memory or persisted
 */
export interface CacheExpirationStorageInterface {
  set(url: string, expiresAt: Date): Promise<void>;
  get(url: string): Promise<Date | undefined>;
  getAll(): Promise<CacheMap>;
  remove(url: string): Promise<void>;
}

export interface BrowserResponseCacheInterface {
  getResponse(options: {
    url: string;
    useCache?: boolean;
    cacheTTL?: number;
  }): Promise<Response | undefined>;
  shutdown(): Promise<void>;
}

export class BrowserResponseCache implements BrowserResponseCacheInterface {
  private readonly DEFAULT_CACHE_NAME = 'browser-response-cache';

  private readonly DEFAULT_CACHE_TTL = 1000 * 60 * 15;

  private readonly DEFAULT_CACHE_MAINTENANCE_INTERVAL = 1000 * 60 * 5;

  /**
   * The default cache TTL in milliseconds.
   * Can be overridden on a per-url basis.
   *
   * @private
   * @type {CacheTTL}
   * @memberof BrowserResponseCache
   */
  private defaultCacheTTL: CacheTTL;

  private cacheName: string;

  private cacheStorage?: CacheStorage;

  private cacheExpirationStorage: CacheExpirationStorageInterface;

  /**
   * Stores the `setInterval` used to clean the cache on a schedule
   *
   * @private
   * @type {*}
   * @memberof BrowserResponseCache
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private cacheCleaningIntervalStorage?: any;

  constructor(options: {
    defaultCacheTTL?: CacheTTL;
    cacheName?: string;
    cacheExpirationHandler?: CacheExpirationStorageInterface;
    cacheStorage?: CacheStorage;
    cacheMaintenanceInterval?: number;
  }) {
    this.defaultCacheTTL = options.defaultCacheTTL ?? this.DEFAULT_CACHE_TTL;
    this.cacheName = options.cacheName ?? this.DEFAULT_CACHE_NAME;
    this.cacheExpirationStorage =
      options.cacheExpirationHandler ?? new IndexedDBCacheExpirationStorage();

    // `caches` is the `window` or `WebWorker` cache, depending on the context
    this.cacheStorage = options.cacheStorage ?? caches;

    const cacheMaintenanceInterval =
      options.cacheMaintenanceInterval ??
      this.DEFAULT_CACHE_MAINTENANCE_INTERVAL;

    this.doCacheMaintenance();
    this.cacheCleaningIntervalStorage = setInterval(
      this.doCacheMaintenance.bind(this),
      cacheMaintenanceInterval
    );
  }

  async getResponse(options: {
    url: string;
    useCache?: boolean;
    cacheTTL?: number;
  }): Promise<Response | undefined> {
    if (options.useCache ?? true) {
      const needsRefresh = await this.needsRefresh(options.url);
      if (!needsRefresh) {
        const response = await this.getCachedResponse(options.url);
        if (response) return response;
      }
    }

    let response: Response | undefined;
    const cache = await this.openBrowserCache();
    if (cache) {
      await cache?.add(options.url);
      response = await this.getCachedResponse(options.url);
      const cacheTTL = options.cacheTTL ?? this.defaultCacheTTL;
      const cacheUntil = new Date(new Date().getTime() + cacheTTL);
      await this.cacheExpirationStorage.set(options.url, cacheUntil);
    } else {
      response = await fetch(options.url);
    }
    return response;
  }

  async shutdown(): Promise<void> {
    clearInterval(this.cacheCleaningIntervalStorage);
  }

  private async openBrowserCache(): Promise<Cache | undefined> {
    const cache = await this.cacheStorage?.open(this.cacheName);
    return cache;
  }

  private async doCacheMaintenance(): Promise<void> {
    const cacheExpirationEntries = await this.cacheExpirationStorage.getAll();
    const cache = await this.openBrowserCache();
    for (const [url, expiresAt] of Object.entries(cacheExpirationEntries)) {
      if (this.hasExpired(expiresAt)) {
        await cache?.delete(url);
        await this.cacheExpirationStorage.remove(url);
      }
    }
  }

  private async getCachedResponse(url: string): Promise<Response | undefined> {
    const cache = await this.openBrowserCache();
    return cache?.match(url);
  }

  private async needsRefresh(url: string): Promise<boolean> {
    const expiresAt = await this.cacheExpirationStorage.get(url);
    if (!expiresAt) return true;
    return this.hasExpired(expiresAt);
  }

  private hasExpired(expiresAt: Date): boolean {
    const now = new Date();
    const expired = now.getTime() > expiresAt.getTime();
    return expired;
  }
}
