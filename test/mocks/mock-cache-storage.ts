export class MockCache implements Cache {
  addCount = 0;
  async add(request: RequestInfo): Promise<void> {
    this.addCount += 1;
  }
  addAll(requests: RequestInfo[]): Promise<void> {
    throw new Error('Method not implemented.');
  }
  async delete(
    request: RequestInfo,
    options?: CacheQueryOptions
  ): Promise<boolean> {
    return true;
  }
  keys(
    request?: RequestInfo,
    options?: CacheQueryOptions
  ): Promise<readonly Request[]> {
    throw new Error('Method not implemented.');
  }
  async match(
    request: RequestInfo,
    options?: CacheQueryOptions
  ): Promise<Response | undefined> {
    return new Response();
  }
  matchAll(
    request?: RequestInfo,
    options?: CacheQueryOptions
  ): Promise<readonly Response[]> {
    throw new Error('Method not implemented.');
  }
  put(request: RequestInfo, response: Response): Promise<void> {
    throw new Error('Method not implemented.');
  }
}

export class MockCacheStorage implements CacheStorage {
  mockCache = new MockCache();

  delete(cacheName: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  has(cacheName: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  keys(): Promise<string[]> {
    throw new Error('Method not implemented.');
  }
  match(
    request: RequestInfo,
    options?: MultiCacheQueryOptions
  ): Promise<Response | undefined> {
    throw new Error('Method not implemented.');
  }
  async open(cacheName: string): Promise<Cache> {
    return this.mockCache;
  }
}
