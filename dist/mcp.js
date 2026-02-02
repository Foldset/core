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
 * Build the route key for an MCP request: "endpointPath/method:name".
 * Extracts the identifier from params.name or params.uri.
 */
export function getMcpRouteKey(endpointPath, method, params) {
    const name = params?.name ?? params?.uri;
    if (typeof name !== "string")
        return null;
    return `${endpointPath}/${method}:${name}`;
}
