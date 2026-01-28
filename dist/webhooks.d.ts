import { RestrictionsManager, PaymentMethodsManager, AiCrawlersManager, FacilitatorManager } from "./config";
export declare function verifySignature(body: string, signature: string, apiKey: string): Promise<boolean>;
export declare class WebhookDispatcher {
    private restrictions;
    private paymentMethods;
    private aiCrawlers;
    private facilitator;
    constructor(restrictions: RestrictionsManager, paymentMethods: PaymentMethodsManager, aiCrawlers: AiCrawlersManager, facilitator: FacilitatorManager);
    dispatch(body: string, signature: string, apiKey: string): Promise<{
        status: number;
        body: string;
    }>;
}
//# sourceMappingURL=webhooks.d.ts.map