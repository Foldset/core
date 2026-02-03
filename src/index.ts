import type { ConfigStore, RequestAdapter, EventPayload, ErrorReporter } from "./types";
import { consoleErrorReporter } from "./types";
import {
  RestrictionsManager,
  PaymentMethodsManager,
  AiCrawlersManager,
  FacilitatorManager,
  ApiKeyManager,
} from "./config";
import { HttpServerManager } from "./server";
import { buildEventPayload, sendEvent } from "./telemetry";

export interface WorkerCoreOptions {
  apiKey?: string;
  errorReporter?: ErrorReporter;
}

export class WorkerCore {
  readonly restrictions: RestrictionsManager;
  readonly paymentMethods: PaymentMethodsManager;
  readonly aiCrawlers: AiCrawlersManager;
  readonly facilitator: FacilitatorManager;
  readonly apiKey: ApiKeyManager;
  readonly httpServer: HttpServerManager;
  readonly errorReporter: ErrorReporter;

  constructor(store: ConfigStore, options?: WorkerCoreOptions) {
    this.restrictions = new RestrictionsManager(store);
    this.paymentMethods = new PaymentMethodsManager(store);
    this.aiCrawlers = new AiCrawlersManager(store);
    this.facilitator = new FacilitatorManager(store);
    this.apiKey = new ApiKeyManager(options?.apiKey ?? store);
    this.errorReporter = options?.errorReporter ?? consoleErrorReporter;

    this.httpServer = new HttpServerManager(
      this.restrictions,
      this.paymentMethods,
      this.facilitator,
    );
  }

  buildEventPayload(
    adapter: RequestAdapter,
    statusCode: number,
    paymentResponse?: string,
  ): EventPayload {
    return buildEventPayload(adapter, statusCode, paymentResponse);
  }

  async sendEvent(payload: EventPayload): Promise<void> {
    const key = await this.apiKey.get();
    if (!key) return;
    await sendEvent(key, payload, this.errorReporter);
  }
}

// Types
export type {
  RestrictionBase,
  WebRestriction,
  McpRestriction,
  Restriction,
  PaymentMethod,
  AiCrawler,
  FacilitatorConfig,
  ConfigStore,
  RequestAdapter,
  EventPayload,
  ErrorReporter,
} from "./types";
export { consoleErrorReporter } from "./types";

// Paywall
export { generatePaywallHtml } from "./paywall";

// Routes
export { buildRoutesConfig, priceToAmount } from "./routes";

// Config managers
export {
  CachedConfigManager,
  RestrictionsManager,
  PaymentMethodsManager,
  AiCrawlersManager,
  FacilitatorManager,
  ApiKeyManager,
} from "./config";

// Server
export { HttpServerManager } from "./server";

// MCP
export {
  parseMcpRequest,
  getMcpRouteKey,
} from "./mcp";

// Handlers
export { handlePaymentRequest, handleSettlement } from "./handler";
