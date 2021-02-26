import { expect } from '@open-wc/testing';
import { IndexedDBCacheExpirationStorage } from '../src/indexeddb-cache-expiration-storage';
import { promisedSleep } from './utils/promised-sleep';

describe('IndexedDBCacheExpirationStorage', () => {
  it('can set a URL cached at date and return it', async () => {
    const cacheExpirationStorage = new IndexedDBCacheExpirationStorage({
      storageKey: `${Math.random()}`,
    });
    const date = new Date();
    await cacheExpirationStorage.set('foo', date);
    const cachedAt = await cacheExpirationStorage.get('foo');
    expect(cachedAt?.getTime()).to.equal(date.getTime());
    await cacheExpirationStorage.remove('foo');
    const allCaches = await cacheExpirationStorage.getAll();
    expect(Object.keys(allCaches).length).to.equal(0);
  });

  it('can set multiple URLs', async () => {
    const cacheExpirationStorage = new IndexedDBCacheExpirationStorage({
      storageKey: `${Math.random()}`,
    });
    const date1 = new Date();
    await promisedSleep(25);
    const date2 = new Date();
    await cacheExpirationStorage.set('foo', date1);
    await cacheExpirationStorage.set('bar', date2);
    const allCaches = await cacheExpirationStorage.getAll();
    expect(allCaches['foo'].getTime()).to.equal(date1.getTime());
    expect(allCaches['bar'].getTime()).to.equal(date2.getTime());
    await cacheExpirationStorage.remove('foo');
    await cacheExpirationStorage.remove('bar');
  });

  it('getAll() is empty if nothing has been set', async () => {
    const cacheExpirationStorage = new IndexedDBCacheExpirationStorage({
      storageKey: `${Math.random()}`,
    });
    const allCaches = await cacheExpirationStorage.getAll();
    expect(Object.keys(allCaches).length).to.equal(0);
  });

  it('remove() works if nothing has been set', async () => {
    const cacheExpirationStorage = new IndexedDBCacheExpirationStorage({
      storageKey: `${Math.random()}`,
    });
    await cacheExpirationStorage.remove('foo');
    const allCaches = await cacheExpirationStorage.getAll();
    expect(Object.keys(allCaches).length).to.equal(0);
  });
});
