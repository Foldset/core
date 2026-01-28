import { x402HTTPResourceServer } from "@x402/core/server";
import { RestrictionsManager, PaymentMethodsManager, FacilitatorManager } from "./config";
export declare class HttpServerManager {
    private restrictions;
    private paymentMethods;
    private facilitator;
    private cachedHttpServer;
    private cachedRestrictions;
    private cachedPaymentMethods;
    private cachedFacilitator;
    constructor(restrictions: RestrictionsManager, paymentMethods: PaymentMethodsManager, facilitator: FacilitatorManager);
    get(): Promise<x402HTTPResourceServer | null>;
}
//# sourceMappingURL=server.d.ts.map