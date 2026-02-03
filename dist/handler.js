function matchesHost(entry, hostname) {
    const normalizedHostname = hostname.toLowerCase();
    const normalizedHost = entry.host.toLowerCase();
    if (normalizedHostname === normalizedHost)
        return true;
    for (const subdomain of entry.subdomains) {
        if (subdomain && `${subdomain.toLowerCase()}.${normalizedHost}` === normalizedHostname) {
            return true;
        }
    }
    return false;
}
function hasMatchingHost(restrictions, hostname) {
    return restrictions.some((r) => matchesHost(r, hostname));
}
export async function handlePaymentRequest(core, httpServer, adapter, pathOverride) {
    const userAgent = adapter.getUserAgent();
    if (!userAgent || !(await core.aiCrawlers.isAiCrawler(userAgent))) {
        return { type: "no-payment-required" };
    }
    // Check if the request hostname matches any configured restriction
    const restrictions = await core.restrictions.get();
    if (!hasMatchingHost(restrictions ?? [], adapter.getHost())) {
        return { type: "no-payment-required" };
    }
    const path = pathOverride ?? adapter.getPath();
    const paymentContext = {
        adapter,
        path,
        method: adapter.getMethod(),
        paymentHeader: adapter.getHeader("PAYMENT-SIGNATURE") ||
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
export async function handleSettlement(core, httpServer, adapter, paymentPayload, paymentRequirements, upstreamStatusCode) {
    if (upstreamStatusCode >= 400) {
        await logEvent(core, adapter, upstreamStatusCode);
        return {
            success: false,
            errorReason: "Upstream error",
            network: paymentRequirements.network,
            transaction: "",
        };
    }
    const result = await httpServer.processSettlement(paymentPayload, paymentRequirements);
    if (!result.success) {
        core.errorReporter.captureException(new Error(`Settlement failed: ${result.errorReason}`));
        await logEvent(core, adapter, 402);
    }
    else {
        const paymentResponse = result.headers["PAYMENT-RESPONSE"];
        if (!paymentResponse) {
            throw new Error("Missing PAYMENT-RESPONSE header after successful settlement");
        }
        await logEvent(core, adapter, upstreamStatusCode, paymentResponse);
    }
    return result;
}
async function logEvent(core, adapter, statusCode, paymentResponse) {
    const payload = core.buildEventPayload(adapter, statusCode, paymentResponse);
    await core.sendEvent(payload);
}
