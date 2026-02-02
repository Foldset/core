interface JsonRpcRequest {
    jsonrpc: string;
    id?: string | number | null;
    method: string;
    params?: Record<string, unknown>;
}
export declare function parseMcpRequest(body: unknown): JsonRpcRequest | null;
/**
 * Build the route key for an MCP request: "endpointPath/method:name".
 * Extracts the identifier from params.name or params.uri.
 */
export declare function getMcpRouteKey(endpointPath: string, method: string, params?: Record<string, unknown>): string | null;
export {};
//# sourceMappingURL=mcp.d.ts.map