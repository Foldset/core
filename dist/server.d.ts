import { x402HTTPResourceServer } from "@x402/core/server";
import { RestrictionsManager, McpRestrictionsManager, PaymentMethodsManager, FacilitatorManager } from "./config";
export declare class HttpServerManager {
    private restrictions;
    private mcpRestrictions;
    private paymentMethods;
    private facilitator;
    private cachedHttpServer;
    private cachedRestrictions;
    private cachedMcpRestrictions;
    private cachedPaymentMethods;
    private cachedFacilitator;
    constructor(restrictions: RestrictionsManager, mcpRestrictions: McpRestrictionsManager, paymentMethods: PaymentMethodsManager, facilitator: FacilitatorManager);
    get(): Promise<x402HTTPResourceServer | null>;
}
//# sourceMappingURL=server.d.ts.map