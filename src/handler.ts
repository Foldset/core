import type { HTTPRequestContext, HTTPProcessResult, ProcessSettleResultResponse, x402HTTPResourceServer } from "@x402/core/server";
import type { PaymentPayload, PaymentRequirements } from "@x402/core/types";

import type { HostConfig, RequestAdapter } from "./types";
import type { WorkerCore } from "./index";

function matchesHost(hostConfig: HostConfig, hostname: string): boolean {
  const expected = hostConfig.subdomain
    ? `${hostConfig.subdomain}.${hostConfig.host}`
    : hostConfig.host;
  return hostname.toLowerCase() === expected.toLowerCase();
}

export async function handlePaymentRequest(
  core: WorkerCore,
  httpServer: x402HTTPResourceServer,
  adapter: RequestAdapter,
  pathOverride?: string,
): Promise<HTTPProcessResult> {
  const userAgent = adapter.getUserAgent();
  if (!userAgent || !(await core.aiCrawlers.isAiCrawler(userAgent))) {
    return { type: "no-payment-required" };
  }

  // Check if the request hostname matches the configured host
  const hostConfig = await core.hostConfig.get();
  if (!hostConfig || !matchesHost(hostConfig, adapter.getHost())) {
    return { type: "no-payment-required" };
  }

  const path = pathOverride ?? adapter.getPath();

  const paymentContext: HTTPRequestContext = {
    adapter,
    path,
    method: adapter.getMethod(),
    paymentHeader:
      adapter.getHeader("PAYMENT-SIGNATURE") ||
      adapter.getHeader("X-PAYMENT"),
  };

  if (!httpServer.requiresPayment(paymentContext)) {
    return { type: "no-payment-required" };
  }

  const result = await httpServer.processHTTPRequest(paymentContext, undefined);

  if (result.type === "payment-error") {
    await logEvent(core, adapter, result.response.status);
  }

  return result;
}

export async function handleSettlement(
  core: WorkerCore,
  httpServer: x402HTTPResourceServer,
  adapter: RequestAdapter,
  paymentPayload: PaymentPayload,
  paymentRequirements: PaymentRequirements,
  upstreamStatusCode: number,
): Promise<ProcessSettleResultResponse> {
  if (upstreamStatusCode >= 400) {
    await logEvent(core, adapter, upstreamStatusCode);
    return {
      success: false,
      errorReason: "Upstream error",
      network: paymentRequirements.network,
      transaction: "",
    };
  }

  const result = await httpServer.processSettlement(
    paymentPayload,
    paymentRequirements,
  );

  if (!result.success) {
    core.errorReporter.captureException(
      new Error(`Settlement failed: ${result.errorReason}`),
    );
    await logEvent(core, adapter, 402);
  } else {
    const paymentResponse = result.headers["PAYMENT-RESPONSE"];
    if (!paymentResponse) {
      throw new Error("Missing PAYMENT-RESPONSE header after successful settlement");
    }
    await logEvent(
      core,
      adapter,
      upstreamStatusCode,
      paymentResponse,
    );
  }

  return result;
}

async function logEvent(
  core: WorkerCore,
  adapter: RequestAdapter,
  statusCode: number,
  paymentResponse?: string,
): Promise<void> {
  const payload = core.buildEventPayload(
    adapter,
    statusCode,
    paymentResponse,
  );
  await core.sendEvent(payload);
}
