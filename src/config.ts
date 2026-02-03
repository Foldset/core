import { HTTPFacilitatorClient } from "@x402/core/server";
import type { Restriction, PaymentMethod, AiCrawler, FacilitatorConfig } from "./types";

import type { ConfigStore } from "./types";

const CACHE_TTL_MS = 30_000;

export class CachedConfigManager<T> {
  protected cached: T | null = null;
  protected cacheTimestamp = 0;

  constructor(
    protected configStore: ConfigStore,
    protected key: string,
  ) { }

  protected isCacheValid(): boolean {
    return this.cached !== null && Date.now() - this.cacheTimestamp < CACHE_TTL_MS;
  }

  protected updateCache(value: T | null): void {
    this.cached = value;
    this.cacheTimestamp = Date.now();
  }

  protected deserialize(raw: string): T {
    return JSON.parse(raw) as T;
  }

  async get(): Promise<T | null> {
    if (this.isCacheValid()) return this.cached;
    const raw = await this.configStore.get(this.key);
    this.updateCache(raw ? this.deserialize(raw) : null);
    return this.cached;
  }
}

export class RestrictionsManager extends CachedConfigManager<Restriction[]> {
  constructor(store: ConfigStore) {
    super(store, "restrictions");
  }
}

export class PaymentMethodsManager extends CachedConfigManager<PaymentMethod[]> {
  constructor(store: ConfigStore) {
    super(store, "payment-methods");
  }
}

export class AiCrawlersManager extends CachedConfigManager<AiCrawler[]> {
  constructor(store: ConfigStore) {
    super(store, "ai-crawlers");
  }

  protected override isCacheValid(): boolean {
    return (
      this.cached !== null &&
      this.cached.length > 0 &&
      Date.now() - this.cacheTimestamp < CACHE_TTL_MS
    );
  }

  protected override deserialize(raw: string): AiCrawler[] {
    const parsed: AiCrawler[] = JSON.parse(raw);
    return parsed.map((c) => ({ user_agent: c.user_agent.toLowerCase() }));
  }

  override async get(): Promise<AiCrawler[]> {
    if (this.isCacheValid()) return this.cached!;
    const raw = await this.configStore.get(this.key);
    this.updateCache(raw ? this.deserialize(raw) : []);
    return this.cached!;
  }

  async isAiCrawler(userAgent: string): Promise<boolean> {
    const crawlers = await this.get();
    const ua = userAgent.toLowerCase();
    return crawlers.some((crawler) => ua.includes(crawler.user_agent));
  }
}

export class FacilitatorManager extends CachedConfigManager<HTTPFacilitatorClient> {
  constructor(store: ConfigStore) {
    super(store, "facilitator");
  }

  protected override deserialize(raw: string): HTTPFacilitatorClient {
    const config: FacilitatorConfig = JSON.parse(raw);

    const hasAuthHeaders =
      config.verifyHeaders || config.settleHeaders || config.supportedHeaders;

    return new HTTPFacilitatorClient({
      url: config.url,
      ...(hasAuthHeaders && {
        createAuthHeaders: async () => ({
          verify: config.verifyHeaders ?? {},
          settle: config.settleHeaders ?? {},
          supported: config.supportedHeaders ?? {},
        }),
      }),
    });
  }

}

export class ApiKeyManager extends CachedConfigManager<string> {
  private staticKey: string | null;

  constructor(storeOrKey: ConfigStore | string) {
    if (typeof storeOrKey === "string") {
      super({ get: async () => null }, "api-key");
      this.staticKey = storeOrKey;
    } else {
      super(storeOrKey, "api-key");
      this.staticKey = null;
    }
  }

  // If storing api key in a config store, store the raw value, not a json version of it
  protected override deserialize(raw: string): string {
    return raw;
  }

  override async get(): Promise<string | null> {
    if (this.staticKey !== null) return this.staticKey;
    return super.get();
  }
}
