import { priceToAmount } from "./routes";
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
/**
 * Build payment requirements for all gated MCP tools/resources/prompts
 * matching the given list method. Returns clear payment instructions
 * built directly from Foldset restrictions and payment methods.
 */
export function getMcpListPaymentRequirements(listMethod, restrictions, paymentMethods) {
    const callMethod = MCP_LIST_CALL_METHODS[listMethod];
    if (!callMethod)
        return [];
    const relevant = restrictions.filter((r) => r.type === "mcp" && r.method === callMethod);
    if (!relevant.length)
        return [];
    return relevant.map((r) => ({
        name: r.name,
        method: r.method,
        description: r.description,
        price: r.price,
        scheme: r.scheme,
        accepts: paymentMethods.map((pm) => ({
            network: pm.caip2_id,
            chainDisplayName: pm.chain_display_name,
            asset: pm.contract_address,
            assetDisplayName: pm.asset_display_name,
            amount: priceToAmount(r.price, pm.decimals),
            payTo: pm.circle_wallet_address,
        })),
    }));
}
