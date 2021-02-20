import { expect } from '@open-wc/testing';
import { BrowserResponseCache } from '../src/browser-response-cache';
import { MockCacheExpirationStorage } from './mocks/mock-cache-expiration-storage';
import { MockCache, MockCacheStorage } from './mocks/mock-cache-storage';
import { promisedSleep } from './utils/promised-sleep';

describe('BrowserResponseCache', () => {
  it('caches a response for a set amount of time', async () => {
    const mockCacheStorage = new MockCacheStorage();
    const mockCacheExpirationStorage = new MockCacheExpirationStorage();
    const browserResponseCache = new BrowserResponseCache({
      defaultCacheTTL: 1000,
      cacheExpirationHandler: mockCacheExpirationStorage,
      cacheStorage: mockCacheStorage,
    });
    // the MockCacheStorage will always return the same instance of
    // the MockCache so we can inspect its storage
    const mockCache = (await mockCacheStorage.open('bar')) as MockCache;
    await browserResponseCache.getResponse({ url: 'foo' });
    expect(mockCache.addCount).to.equal(1);
    await browserResponseCache.getResponse({ url: 'foo' });
    expect(mockCache.addCount).to.equal(1);
    // the cacheTTL is 1000ms so we'll check after 100
    // to make sure it's still cached
    await promisedSleep(100);
    await browserResponseCache.getResponse({ url: 'foo' });
    expect(mockCache.addCount).to.equal(1);
  });

  it('expires a response after a set amount of time', async () => {
    const mockCacheStorage = new MockCacheStorage();
    const mockCacheExpirationStorage = new MockCacheExpirationStorage();
    const browserResponseCache = new BrowserResponseCache({
      defaultCacheTTL: 50,
      cacheExpirationHandler: mockCacheExpirationStorage,
      cacheStorage: mockCacheStorage,
    });
    const mockCache = (await mockCacheStorage.open('bar')) as MockCache;
    await browserResponseCache.getResponse({ url: 'foo' });
    expect(mockCache.addCount).to.equal(1);
    // the cache expires in 50ms so we'll wait 100ms to query again
    await promisedSleep(100);
    await browserResponseCache.getResponse({ url: 'foo' });
    expect(mockCache.addCount).to.equal(2);
  });

  it('bypasses the cache if requested', async () => {
    const mockCacheStorage = new MockCacheStorage();
    const mockCacheExpirationStorage = new MockCacheExpirationStorage();
    const browserResponseCache = new BrowserResponseCache({
      defaultCacheTTL: 1000,
      cacheExpirationHandler: mockCacheExpirationStorage,
      cacheStorage: mockCacheStorage,
    });
    const mockCache = (await mockCacheStorage.open('bar')) as MockCache;
    await browserResponseCache.getResponse({ url: 'foo' });
    expect(mockCache.addCount).to.equal(1);
    await browserResponseCache.getResponse({ url: 'foo', useCache: false });
    expect(mockCache.addCount).to.equal(2);
    await browserResponseCache.getResponse({ url: 'foo', useCache: false });
    expect(mockCache.addCount).to.equal(3);
  });

  it('cleans the cache on a given interval', async () => {
    const mockCacheStorage = new MockCacheStorage();
    const mockCacheExpirationStorage = new MockCacheExpirationStorage();
    const browserResponseCache = new BrowserResponseCache({
      defaultCacheTTL: 20,
      cacheExpirationHandler: mockCacheExpirationStorage,
      cacheStorage: mockCacheStorage,
      cacheMaintenanceInterval: 10,
    });
    await browserResponseCache.getResponse({ url: 'foo' });
    const expiration = await mockCacheExpirationStorage.get('foo');
    expect(expiration).to.exist;
    // the cache lives for 20ms and we clean it every 10ms so after 40ms,
    // it should be gone
    await promisedSleep(40);

    const expiration2 = await mockCacheExpirationStorage.get('foo');
    expect(expiration2).to.equal(undefined);
  });

  // it('can shut down the cache cleaning', async () => {
  //   const mockCacheStorage = new MockCacheStorage();
  //   const mockCacheExpirationStorage = new MockCacheExpirationStorage();
  //   const browserResponseCache = new BrowserResponseCache({
  //     defaultCacheTTL: 20,
  //     cacheExpirationHandler: mockCacheExpirationStorage,
  //     cacheStorage: mockCacheStorage,
  //     cacheMaintenanceInterval: 10,
  //   });
  //   await browserResponseCache.getResponse({ url: 'foo' });
  //   // we're going to shut it down immediate so it doesn't clean the cache
  //   browserResponseCache.shutdown();
  //   const expiration = await mockCacheExpirationStorage.get('foo');
  //   expect(expiration).to.exist;
  //   await promisedSleep(40);
  //   const expiration2 = await mockCacheExpirationStorage.get('foo');
  //   expect(expiration2).to.exist;
  // });
});
