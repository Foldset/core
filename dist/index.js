import { consoleErrorReporter } from "./types";
import { RestrictionsManager, McpRestrictionsManager, PaymentMethodsManager, AiCrawlersManager, FacilitatorManager, ApiKeyManager, } from "./config";
import { HttpServerManager } from "./server";
import { WebhookDispatcher } from "./webhooks";
import { buildEventPayload, sendEvent } from "./telemetry";
export class WorkerCore {
    restrictions;
    mcpRestrictions;
    paymentMethods;
    aiCrawlers;
    facilitator;
    apiKey;
    httpServer;
    webhooks;
    errorReporter;
    constructor(store, options) {
        this.restrictions = new RestrictionsManager(store);
        this.mcpRestrictions = new McpRestrictionsManager(store);
        this.paymentMethods = new PaymentMethodsManager(store);
        this.aiCrawlers = new AiCrawlersManager(store);
        this.facilitator = new FacilitatorManager(store);
        this.apiKey = new ApiKeyManager(options?.apiKey ?? store);
        this.errorReporter = options?.errorReporter ?? consoleErrorReporter;
        this.httpServer = new HttpServerManager(this.restrictions, this.mcpRestrictions, this.paymentMethods, this.facilitator);
        this.webhooks = new WebhookDispatcher(this.restrictions, this.paymentMethods, this.aiCrawlers, this.facilitator);
    }
    buildEventPayload(adapter, statusCode, paymentResponse) {
        return buildEventPayload(adapter, statusCode, paymentResponse);
    }
    async sendEvent(payload) {
        const key = await this.apiKey.get();
        if (!key)
            return;
        await sendEvent(key, payload, this.errorReporter);
    }
}
export { consoleErrorReporter } from "./types";
// Paywall
export { generatePaywallHtml } from "./paywall";
// Routes
export { buildRoutesConfig, priceToAmount } from "./routes";
// Webhooks
export { verifySignature } from "./webhooks";
// Config managers
export { CachedConfigManager, RestrictionsManager, McpRestrictionsManager, PaymentMethodsManager, AiCrawlersManager, FacilitatorManager, ApiKeyManager, } from "./config";
// Server
export { HttpServerManager } from "./server";
// Webhook dispatcher
export { WebhookDispatcher } from "./webhooks";
// MCP
export { parseMcpRequest, getMcpRouteKey, } from "./mcp";
// Handlers
export { handlePaymentRequest, handleSettlement, handleWebhookRequest } from "./handler";
