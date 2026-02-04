import { x402ResourceServer, x402HTTPResourceServer, } from "@x402/core/server";
import { registerExactEvmScheme } from "@x402/evm/exact/server";
import { registerExactSvmScheme } from "@x402/svm/exact/server";
import { buildRoutesConfig, generatePaywallHtml } from "./index";
const paywallProvider = {
    generateHtml: generatePaywallHtml,
};
/**
 * Custom parseRoutePattern that treats the path as a raw regex.
 * Monkey-patched onto x402HTTPResourceServer instances so that
 * restriction paths (stored as regex in the DB) are used directly
 * instead of being converted by x402's glob-like pattern parser.
 */
function foldsetParseRoutePattern(pattern) {
    const [verb, path] = pattern.includes(" ") ? pattern.split(/\s+/) : ["*", pattern];
    return { verb: verb.toUpperCase(), regex: new RegExp(path, "i") };
}
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
    hostConfig;
    restrictions;
    paymentMethods;
    facilitator;
    cachedHttpServer = null;
    cachedHostConfig = null;
    cachedRestrictions = null;
    cachedPaymentMethods = null;
    cachedFacilitator = null;
    constructor(hostConfig, restrictions, paymentMethods, facilitator) {
        this.hostConfig = hostConfig;
        this.restrictions = restrictions;
        this.paymentMethods = paymentMethods;
        this.facilitator = facilitator;
    }
    async get() {
        const currentHostConfig = await this.hostConfig.get();
        const currentRestrictions = await this.restrictions.get();
        const currentPaymentMethods = await this.paymentMethods.get();
        const currentFacilitator = await this.facilitator.get();
        if (currentRestrictions === null || currentPaymentMethods === null || currentFacilitator === null) {
            return null;
        }
        if (this.cachedHttpServer &&
            currentHostConfig === this.cachedHostConfig &&
            currentRestrictions === this.cachedRestrictions &&
            currentPaymentMethods === this.cachedPaymentMethods &&
            currentFacilitator === this.cachedFacilitator) {
            return this.cachedHttpServer;
        }
        const server = new x402ResourceServer(currentFacilitator);
        registerExactEvmScheme(server);
        registerExactSvmScheme(server);
        const routesConfig = buildRoutesConfig(currentRestrictions, currentPaymentMethods, currentHostConfig?.mcpEndpoint ?? null);
        // Monkey-patch prototype BEFORE construction so parseRoutePattern
        // and normalizePath are used during constructor initialization
        // @ts-expect-error - overriding private method
        x402HTTPResourceServer.prototype.parseRoutePattern = foldsetParseRoutePattern;
        const httpServer = new x402HTTPResourceServer(server, routesConfig);
        // @ts-expect-error - overriding private method
        httpServer.createHTTPResponse = createFoldsetHTTPResponse;
        await httpServer.initialize();
        httpServer.registerPaywallProvider(paywallProvider);
        this.cachedHttpServer = httpServer;
        this.cachedHostConfig = currentHostConfig;
        this.cachedRestrictions = currentRestrictions;
        this.cachedPaymentMethods = currentPaymentMethods;
        return httpServer;
    }
}
