import { x402ResourceServer, x402HTTPResourceServer, } from "@x402/core/server";
import { registerExactEvmScheme } from "@x402/evm/exact/server";
import { registerExactSvmScheme } from "@x402/svm/exact/server";
import { buildRoutesConfig, generatePaywallHtml } from "./index";
const paywallProvider = {
    generateHtml: generatePaywallHtml,
};
/**
 * Custom createHTTPResponse implementation for Foldset.
 * Monkey-patched onto x402HTTPResourceServer instances to always return
 * HTML paywall content with payment requirement headers.
 */
function createFoldsetHTTPResponse(paymentRequired, _isWebBrowser, paywallConfig, customHtml, _unpaidResponse) {
    // @ts-expect-error - accessing private method
    const html = this.generatePaywallHTML(paymentRequired, paywallConfig, customHtml);
    // @ts-expect-error - accessing private method
    const response = this.createHTTPPaymentRequiredResponse(paymentRequired);
    return {
        status: 402,
        headers: {
            "Content-Type": "text/html",
            ...response.headers,
        },
        body: html,
        isHtml: true,
    };
}
export class HttpServerManager {
    restrictions;
    paymentMethods;
    facilitator;
    cachedHttpServer = null;
    cachedRestrictions = null;
    cachedPaymentMethods = null;
    cachedFacilitator = null;
    constructor(restrictions, paymentMethods, facilitator) {
        this.restrictions = restrictions;
        this.paymentMethods = paymentMethods;
        this.facilitator = facilitator;
    }
    async get() {
        const currentRestrictions = await this.restrictions.get();
        const currentPaymentMethods = await this.paymentMethods.get();
        const currentFacilitator = await this.facilitator.get();
        if (currentRestrictions === null || currentPaymentMethods === null || currentFacilitator === null) {
            return null;
        }
        if (this.cachedHttpServer &&
            currentRestrictions === this.cachedRestrictions &&
            currentPaymentMethods === this.cachedPaymentMethods &&
            currentFacilitator === this.cachedFacilitator) {
            return this.cachedHttpServer;
        }
        const server = new x402ResourceServer(currentFacilitator);
        registerExactEvmScheme(server);
        registerExactSvmScheme(server);
        const routesConfig = buildRoutesConfig(currentRestrictions, currentPaymentMethods);
        const httpServer = new x402HTTPResourceServer(server, routesConfig);
        // Monkey-patch createHTTPResponse with our custom implementation
        // @ts-expect-error - overriding private method
        httpServer.createHTTPResponse = createFoldsetHTTPResponse;
        await httpServer.initialize();
        httpServer.registerPaywallProvider(paywallProvider);
        this.cachedHttpServer = httpServer;
        this.cachedRestrictions = currentRestrictions;
        this.cachedPaymentMethods = currentPaymentMethods;
        return httpServer;
    }
}
