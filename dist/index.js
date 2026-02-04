import { consoleErrorReporter } from "./types";
import { HostConfigManager, RestrictionsManager, PaymentMethodsManager, AiCrawlersManager, FacilitatorManager, ApiKeyManager, } from "./config";
import { HttpServerManager } from "./server";
import { buildEventPayload, sendEvent } from "./telemetry";
export class WorkerCore {
    hostConfig;
    restrictions;
    paymentMethods;
    aiCrawlers;
    facilitator;
    apiKey;
    httpServer;
    errorReporter;
    constructor(store, options) {
        this.hostConfig = new HostConfigManager(store);
        this.restrictions = new RestrictionsManager(store);
        this.paymentMethods = new PaymentMethodsManager(store);
        this.aiCrawlers = new AiCrawlersManager(store);
        this.facilitator = new FacilitatorManager(store);
        this.apiKey = new ApiKeyManager(options?.apiKey ?? store);
        this.errorReporter = options?.errorReporter ?? consoleErrorReporter;
        this.httpServer = new HttpServerManager(this.hostConfig, this.restrictions, this.paymentMethods, this.facilitator);
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
// Config managers
export { CachedConfigManager, HostConfigManager, RestrictionsManager, PaymentMethodsManager, AiCrawlersManager, FacilitatorManager, ApiKeyManager, } from "./config";
// Server
export { HttpServerManager } from "./server";
// MCP
export { parseMcpRequest, getMcpRouteKey, isMcpListMethod, getMcpListPaymentRequirements, buildJsonRpcError, } from "./mcp";
// Handlers
export { handlePaymentRequest, handleSettlement } from "./handler";
