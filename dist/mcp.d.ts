import type { x402HTTPResourceServer } from "@x402/core/server";
import type { Restriction, RequestAdapter } from "./types";
export interface JsonRpcRequest {
    jsonrpc: string;
    id?: string | number | null;
    method: string;
    params?: Record<string, unknown>;
}
export declare function parseMcpRequest(body: unknown): JsonRpcRequest | null;
/**
 * Build the route key for an MCP request: "endpointPath/method:identifier".
 * Extracts the identifier from params.name (tools/call, prompts/get) or
 * params.uri (resources/read).
 */
export declare function getMcpRouteKey(endpointPath: string, method: string, params?: Record<string, unknown>): string | null;
export declare function isMcpListMethod(method: string): boolean;
export interface McpPaymentRequirement {
    name: string;
    method: string;
    headers: Record<string, string>;
}
export interface JsonRpcError {
    jsonrpc: "2.0";
    id: string | number | null;
    error: {
        code: number;
        message: string;
        data?: unknown;
    };
}
export declare function buildJsonRpcError(id: string | number | null, code: number, message: string, data?: unknown): JsonRpcError;
/**
 * Build payment requirements for all gated MCP tools/resources/prompts
 * matching the given list method. Returns an array of {name, method, headers}
 * objects — one per restricted item. Callers serialize this into an HTTP
 * header on the list response.
 */
export declare function getMcpListPaymentRequirements(listMethod: string, mcpEndpoint: string, httpServer: x402HTTPResourceServer, adapter: RequestAdapter, restrictions: Restriction[]): Promise<McpPaymentRequirement[]>;
//# sourceMappingURL=mcp.d.ts.map