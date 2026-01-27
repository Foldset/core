import {
  x402ResourceServer,
  x402HTTPResourceServer,
} from "@x402/core/server";
import type { PaywallProvider, PaywallConfig } from "@x402/core/server";
import type { PaymentRequired } from "@x402/core/types";
import { registerExactEvmScheme } from "@x402/evm/exact/server";
import { registerExactSvmScheme } from "@x402/svm/exact/server";
import type { UnpaidResponseResult, HTTPResponseInstructions, HTTPFacilitatorClient } from "@x402/core/http";

import type { Restriction, PaymentMethod } from "./types";
import { buildRoutesConfig, generatePaywallHtml } from "./index";

import { RestrictionsManager, PaymentMethodsManager, FacilitatorManager } from "./config";

const paywallProvider: PaywallProvider = {
  generateHtml: generatePaywallHtml,
};

/**
 * Custom createHTTPResponse implementation for Foldset.
 * Monkey-patched onto x402HTTPResourceServer instances to always return
 * HTML paywall content with payment requirement headers.
 */
function createFoldsetHTTPResponse(
  this: x402HTTPResourceServer,
  paymentRequired: PaymentRequired,
  _isWebBrowser: boolean,
  paywallConfig?: PaywallConfig,
  customHtml?: string,
  _unpaidResponse?: UnpaidResponseResult,
): HTTPResponseInstructions {
  // @ts-expect-error - accessing private method
  const html = this.generatePaywallHTML(paymentRequired, paywallConfig, customHtml);

  // @ts-expect-error - accessing private method
  const response = this.createHTTPPaymentRequiredResponse(paymentRequired);

  return {
    status: 402 as 402,
    headers: {
      "Content-Type": "text/html",
      ...response.headers,
    },
    body: html,
    isHtml: true,
  };
}

export class HttpServerManager {
  private cachedHttpServer: x402HTTPResourceServer | null = null;
  private cachedRestrictions: Restriction[] | null = null;
  private cachedPaymentMethods: PaymentMethod[] | null = null;
  private cachedFacilitator: HTTPFacilitatorClient | null = null;

  constructor(
    private restrictions: RestrictionsManager,
    private paymentMethods: PaymentMethodsManager,
    private facilitator: FacilitatorManager,
  ) { }

  async get(): Promise<x402HTTPResourceServer | null> {
    const currentRestrictions = await this.restrictions.get();
    const currentPaymentMethods = await this.paymentMethods.get();
    const currentFacilitator = await this.facilitator.get();
    if (currentRestrictions === null || currentPaymentMethods === null || currentFacilitator === null) {
      return null;
    }

    if (
      this.cachedHttpServer &&
      currentRestrictions === this.cachedRestrictions &&
      currentPaymentMethods === this.cachedPaymentMethods &&
      currentFacilitator === this.cachedFacilitator
    ) {
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
