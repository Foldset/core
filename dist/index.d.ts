import type { ConfigStore, RequestAdapter, EventPayload, ErrorReporter } from "./types";
import { RestrictionsManager, PaymentMethodsManager, AiCrawlersManager, FacilitatorManager, ApiKeyManager } from "./config";
import { HttpServerManager } from "./server";
import { WebhookDispatcher } from "./webhooks";
export interface WorkerCoreOptions {
    apiKey?: string;
    errorReporter?: ErrorReporter;
}
export declare class WorkerCore {
    readonly restrictions: RestrictionsManager;
    readonly paymentMethods: PaymentMethodsManager;
    readonly aiCrawlers: AiCrawlersManager;
    readonly facilitator: FacilitatorManager;
    readonly apiKey: ApiKeyManager;
    readonly httpServer: HttpServerManager;
    readonly webhooks: WebhookDispatcher;
    readonly errorReporter: ErrorReporter;
    constructor(store: ConfigStore, options?: WorkerCoreOptions);
    buildEventPayload(adapter: RequestAdapter, statusCode: number, paymentResponse?: string): EventPayload;
    sendEvent(payload: EventPayload): Promise<void>;
}
export type { Restriction, PaymentMethod, AiCrawler, FacilitatorConfig, FoldsetWebhook, ConfigStore, RequestAdapter, EventPayload, ErrorReporter, } from "./types";
export { consoleErrorReporter } from "./types";
export { generatePaywallHtml } from "./paywall";
export { buildRoutesConfig, priceToAmount } from "./routes";
export { verifySignature } from "./webhooks";
export { CachedConfigManager, RestrictionsManager, PaymentMethodsManager, AiCrawlersManager, FacilitatorManager, ApiKeyManager, } from "./config";
export { HttpServerManager } from "./server";
export { WebhookDispatcher } from "./webhooks";
export { handlePaymentRequest, handleSettlement, handleWebhookRequest } from "./handler";
//# sourceMappingURL=index.d.ts.map