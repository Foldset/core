const API_BASE_URL = "https://api.foldset.com/v1";
export function buildEventPayload(adapter, statusCode, paymentResponse) {
    const url = new URL(adapter.getUrl());
    return {
        method: adapter.getMethod(),
        status_code: statusCode,
        user_agent: adapter.getUserAgent() || null,
        referer: adapter.getHeader("referer") || null,
        href: url.href,
        hostname: url.hostname,
        pathname: url.pathname,
        search: url.search,
        ip_address: adapter.getIpAddress(),
        ...(paymentResponse ? { payment_response: paymentResponse } : {}),
    };
}
export async function sendEvent(apiKey, payload, errorReporter) {
    try {
        await fetch(`${API_BASE_URL}/events`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify(payload),
        });
    }
    catch (error) {
        errorReporter.captureException(error, {
            method: "POST",
            url: `${API_BASE_URL}/events`,
            payload,
        });
    }
}
