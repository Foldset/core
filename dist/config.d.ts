import { HTTPFacilitatorClient } from "@x402/core/server";
import type { Restriction, PaymentMethod, AiCrawler } from "./types";
import type { ConfigStore } from "./types";
export declare class CachedConfigManager<T> {
    protected configStore: ConfigStore;
    protected key: string;
    protected cached: T | null;
    protected cacheTimestamp: number;
    constructor(configStore: ConfigStore, key: string);
    protected isCacheValid(): boolean;
    protected updateCache(value: T | null): void;
    protected deserialize(raw: string): T;
    get(): Promise<T | null>;
}
export declare class RestrictionsManager extends CachedConfigManager<Restriction[]> {
    constructor(store: ConfigStore);
}
export declare class PaymentMethodsManager extends CachedConfigManager<PaymentMethod[]> {
    constructor(store: ConfigStore);
}
export declare class AiCrawlersManager extends CachedConfigManager<AiCrawler[]> {
    constructor(store: ConfigStore);
    protected isCacheValid(): boolean;
    protected deserialize(raw: string): AiCrawler[];
    get(): Promise<AiCrawler[]>;
    isAiCrawler(userAgent: string): Promise<boolean>;
}
export declare class FacilitatorManager extends CachedConfigManager<HTTPFacilitatorClient> {
    constructor(store: ConfigStore);
    protected deserialize(raw: string): HTTPFacilitatorClient;
}
export declare class ApiKeyManager extends CachedConfigManager<string> {
    private staticKey;
    constructor(storeOrKey: ConfigStore | string);
    protected deserialize(raw: string): string;
    get(): Promise<string | null>;
}
//# sourceMappingURL=config.d.ts.map