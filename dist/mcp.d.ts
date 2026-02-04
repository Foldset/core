import type { Restriction, PaymentMethod } from "./types";
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
    description: string;
    price: number;
    scheme: string;
    accepts: Array<{
        network: string;
        chainDisplayName: string;
        asset: string;
        assetDisplayName: string;
        amount: string;
        payTo: string;
    }>;
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
 * matching the given list method. Returns clear payment instructions
 * built directly from Foldset restrictions and payment methods.
 */
export declare function getMcpListPaymentRequirements(listMethod: string, restrictions: Restriction[], paymentMethods: PaymentMethod[]): McpPaymentRequirement[];
//# sourceMappingURL=mcp.d.ts.map