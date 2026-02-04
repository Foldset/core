/**
 * Mapping from MCP list methods to their corresponding call method.
 */
const MCP_LIST_CALL_METHODS = {
    "tools/list": "tools/call",
    "resources/list": "resources/read",
    "prompts/list": "prompts/get",
};
export function parseMcpRequest(body) {
    if (typeof body !== "object" ||
        body === null ||
        !("jsonrpc" in body) ||
        !("method" in body)) {
        return null;
    }
    return body;
}
/**
 * Build the route key for an MCP request: "endpointPath/method:identifier".
 * Extracts the identifier from params.name (tools/call, prompts/get) or
 * params.uri (resources/read).
 */
export function getMcpRouteKey(endpointPath, method, params) {
    const identifier = params?.name ?? params?.uri;
    if (typeof identifier !== "string")
        return null;
    return `${endpointPath}/${method}:${identifier}`;
}
export function isMcpListMethod(method) {
    return method in MCP_LIST_CALL_METHODS;
}
export function buildJsonRpcError(id, code, message, data) {
    const error = { jsonrpc: "2.0", id, error: { code, message } };
    if (data !== undefined)
        error.error.data = data;
    return error;
}
// TODO rfradkin: This is pretty scuffed but its also fine
// Also it doesn't really produce the right result but whatever:
// payment-required: [{"name":"echo","method":"tools/call","headers":{"Content-Type":"text/html","PAYMENT-REQUIRED":"eyJ4NDAyVmVyc2lvbiI6MiwiZXJyb3IiOiJQYXltZW50IHJlcXVpcmVkIiwicmVzb3VyY2UiOnsidXJsIjoiaHR0cHM6Ly9jbG91ZGZsYXJlLnJvbWZyYWRrLmluL21jcCIsImRlc2NyaXB0aW9uIjoiUGFpZC1BY2Nlc3MgQ29udGVudCIsIm1pbWVUeXBlIjoiYXBwbGljYXRpb24vanNvbiJ9LCJhY2NlcHRzIjpbeyJzY2hlbWUiOiJleGFjdCIsIm5ldHdvcmsiOiJzb2xhbmE6NWV5a3Q0VXNGdjhQOE5KZFRSRXBZMXZ6cUtxWkt2ZHAiLCJhbW91bnQiOiIzMDAwMCIsImFzc2V0IjoiRVBqRldkZDVBdWZxU1NxZU0ycU4xeHp5YmFwQzhHNHdFR0drWnd5VER0MXYiLCJwYXlUbyI6Ikd2VEd6eVRpSkFyd281cHNHQ1FiWjJKZXRuS3V5UFQxRDRGVkQ4TkpKdW90IiwibWF4VGltZW91dFNlY29uZHMiOjMwMCwiZXh0cmEiOnsiZGVjaW1hbHMiOjYsImNoYWluRGlzcGxheU5hbWUiOiJTb2xhbmEgTWFpbm5ldCIsImFzc2V0RGlzcGxheU5hbWUiOiJVU0RDIiwicHJpY2UiOjAuMDMsImZlZVBheWVyIjoiMndLdXBMUjlxNndYWXBwdzhHcjJOdld4S0JVcW00UFBKS2tRZm94SERCZzQifX0seyJzY2hlbWUiOiJleGFjdCIsIm5ldHdvcmsiOiJlaXAxNTU6ODQ1MyIsImFtb3VudCI6IjMwMDAwIiwiYXNzZXQiOiIweDgzMzU4OWZDRDZlRGI2RTA4ZjRjN0MzMkQ0ZjcxYjU0YmRBMDI5MTMiLCJwYXlUbyI6IjB4NTU4ZjA4NDU4NTVlY2JjMmEzMzJjNTMzNzBiNjU3NDA0ZjY1M2ZhOCIsIm1heFRpbWVvdXRTZWNvbmRzIjozMDAsImV4dHJhIjp7Im5hbWUiOiJVU0QgQ29pbiIsInZlcnNpb24iOiIyIiwiZGVjaW1hbHMiOjYsImNoYWluRGlzcGxheU5hbWUiOiJCYXNlIE1haW5uZXQiLCJhc3NldERpc3BsYXlOYW1lIjoiVVNEIENvaW4iLCJwcmljZSI6MC4wM319XX0="}}]
/**
 * Build payment requirements for all gated MCP tools/resources/prompts
 * matching the given list method. Returns an array of {name, method, headers}
 * objects — one per restricted item. Callers serialize this into an HTTP
 * header on the list response.
 */
export async function getMcpListPaymentRequirements(listMethod, mcpEndpoint, httpServer, adapter, restrictions) {
    const callMethod = MCP_LIST_CALL_METHODS[listMethod];
    if (!callMethod)
        return [];
    const relevant = restrictions.filter((r) => r.type === "mcp" && r.method === callMethod);
    if (!relevant.length)
        return [];
    const results = [];
    for (const restriction of relevant) {
        const routeKey = `${mcpEndpoint}/${restriction.method}:${restriction.name}`;
        const ctx = {
            adapter,
            path: routeKey,
            method: adapter.getMethod(),
            paymentHeader: undefined,
        };
        if (httpServer.requiresPayment(ctx)) {
            const payResult = await httpServer.processHTTPRequest(ctx, undefined);
            if (payResult.type === "payment-error") {
                results.push({
                    name: restriction.name,
                    method: restriction.method,
                    headers: payResult.response.headers,
                });
            }
        }
    }
    return results;
}
