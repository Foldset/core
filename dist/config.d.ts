import { HTTPFacilitatorClient } from "@x402/core/server";
import type { Restriction, PaymentMethod, AiCrawler, FacilitatorConfig } from "./types";
import type { ConfigStore } from "./types";
export declare class CachedConfigManager<TStored, TCached = TStored> {
    protected configStore: ConfigStore;
    protected key: string;
    protected cached: TCached | null;
    protected cacheTimestamp: number;
    constructor(configStore: ConfigStore, key: string);
    protected isCacheValid(): boolean;
    protected updateCache(value: TCached | null): void;
    protected invalidateCache(): void;
    protected deserialize(raw: string): TCached;
    get(): Promise<TCached | null>;
    store(data: TStored): Promise<void>;
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
    store(data: AiCrawler[]): Promise<void>;
    isAiCrawler(userAgent: string): Promise<boolean>;
}
export declare class FacilitatorManager extends CachedConfigManager<FacilitatorConfig, HTTPFacilitatorClient> {
    constructor(store: ConfigStore);
    protected deserialize(raw: string): HTTPFacilitatorClient;
    store(config: FacilitatorConfig): Promise<void>;
}
export declare class ApiKeyManager extends CachedConfigManager<string> {
    private staticKey;
    constructor(storeOrKey: ConfigStore | string);
    protected deserialize(raw: string): string;
    get(): Promise<string | null>;
}
//# sourceMappingURL=config.d.ts.map