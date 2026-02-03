import { HTTPFacilitatorClient } from "@x402/core/server";
const CACHE_TTL_MS = 30_000;
export class CachedConfigManager {
    configStore;
    key;
    cached = null;
    cacheTimestamp = 0;
    constructor(configStore, key) {
        this.configStore = configStore;
        this.key = key;
    }
    isCacheValid() {
        return this.cached !== null && Date.now() - this.cacheTimestamp < CACHE_TTL_MS;
    }
    updateCache(value) {
        this.cached = value;
        this.cacheTimestamp = Date.now();
    }
    deserialize(raw) {
        return JSON.parse(raw);
    }
    async get() {
        if (this.isCacheValid())
            return this.cached;
        const raw = await this.configStore.get(this.key);
        this.updateCache(raw ? this.deserialize(raw) : null);
        return this.cached;
    }
}
export class RestrictionsManager extends CachedConfigManager {
    constructor(store) {
        super(store, "restrictions");
    }
}
export class PaymentMethodsManager extends CachedConfigManager {
    constructor(store) {
        super(store, "payment-methods");
    }
}
export class McpRestrictionsManager extends CachedConfigManager {
    constructor(store) {
        super(store, "mcp-restrictions");
    }
}
export class AiCrawlersManager extends CachedConfigManager {
    constructor(store) {
        super(store, "ai-crawlers");
    }
    isCacheValid() {
        return (this.cached !== null &&
            this.cached.length > 0 &&
            Date.now() - this.cacheTimestamp < CACHE_TTL_MS);
    }
    deserialize(raw) {
        const parsed = JSON.parse(raw);
        return parsed.map((c) => ({ user_agent: c.user_agent.toLowerCase() }));
    }
    async get() {
        if (this.isCacheValid())
            return this.cached;
        const raw = await this.configStore.get(this.key);
        this.updateCache(raw ? this.deserialize(raw) : []);
        return this.cached;
    }
    async isAiCrawler(userAgent) {
        const crawlers = await this.get();
        const ua = userAgent.toLowerCase();
        return crawlers.some((crawler) => ua.includes(crawler.user_agent));
    }
}
export class FacilitatorManager extends CachedConfigManager {
    constructor(store) {
        super(store, "facilitator");
    }
    deserialize(raw) {
        const config = JSON.parse(raw);
        const hasAuthHeaders = config.verifyHeaders || config.settleHeaders || config.supportedHeaders;
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
export class ApiKeyManager extends CachedConfigManager {
    staticKey;
    constructor(storeOrKey) {
        if (typeof storeOrKey === "string") {
            super({ get: async () => null }, "api-key");
            this.staticKey = storeOrKey;
        }
        else {
            super(storeOrKey, "api-key");
            this.staticKey = null;
        }
    }
    // If storing api key in a config store, store the raw value, not a json version of it
    deserialize(raw) {
        return raw;
    }
    async get() {
        if (this.staticKey !== null)
            return this.staticKey;
        return super.get();
    }
}
