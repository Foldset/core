import { x402HTTPResourceServer } from "@x402/core/server";
import { HostConfigManager, RestrictionsManager, PaymentMethodsManager, FacilitatorManager } from "./config";
export declare class HttpServerManager {
    private hostConfig;
    private restrictions;
    private paymentMethods;
    private facilitator;
    private cachedHttpServer;
    private cachedHostConfig;
    private cachedRestrictions;
    private cachedPaymentMethods;
    private cachedFacilitator;
    constructor(hostConfig: HostConfigManager, restrictions: RestrictionsManager, paymentMethods: PaymentMethodsManager, facilitator: FacilitatorManager);
    get(): Promise<x402HTTPResourceServer | null>;
}
//# sourceMappingURL=server.d.ts.map