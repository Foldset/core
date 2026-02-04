import type { ConfigStore, RequestAdapter, EventPayload, ErrorReporter } from "./types";
import { HostConfigManager, RestrictionsManager, PaymentMethodsManager, AiCrawlersManager, FacilitatorManager, ApiKeyManager } from "./config";
import { HttpServerManager } from "./server";
export interface WorkerCoreOptions {
    apiKey?: string;
    errorReporter?: ErrorReporter;
}
export declare class WorkerCore {
    readonly hostConfig: HostConfigManager;
    readonly restrictions: RestrictionsManager;
    readonly paymentMethods: PaymentMethodsManager;
    readonly aiCrawlers: AiCrawlersManager;
    readonly facilitator: FacilitatorManager;
    readonly apiKey: ApiKeyManager;
    readonly httpServer: HttpServerManager;
    readonly errorReporter: ErrorReporter;
    constructor(store: ConfigStore, options?: WorkerCoreOptions);
    buildEventPayload(adapter: RequestAdapter, statusCode: number, paymentResponse?: string): EventPayload;
    sendEvent(payload: EventPayload): Promise<void>;
}
export type { HostConfig, RestrictionBase, WebRestriction, McpRestriction, Restriction, PaymentMethod, AiCrawler, FacilitatorConfig, ConfigStore, RequestAdapter, EventPayload, ErrorReporter, } from "./types";
export { consoleErrorReporter } from "./types";
export { generatePaywallHtml } from "./paywall";
export { buildRoutesConfig, priceToAmount } from "./routes";
export { CachedConfigManager, HostConfigManager, RestrictionsManager, PaymentMethodsManager, AiCrawlersManager, FacilitatorManager, ApiKeyManager, } from "./config";
export { HttpServerManager } from "./server";
export { parseMcpRequest, getMcpRouteKey, isMcpListMethod, getMcpListPaymentRequirements, buildJsonRpcError, } from "./mcp";
export type { JsonRpcRequest, McpPaymentRequirement, JsonRpcError } from "./mcp";
export { handlePaymentRequest, handleSettlement } from "./handler";
//# sourceMappingURL=index.d.ts.map