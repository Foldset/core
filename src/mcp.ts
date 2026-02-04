import type { x402HTTPResourceServer } from "@x402/core/server";

import type { McpRestriction, Restriction, RequestAdapter } from "./types";

export interface JsonRpcRequest {
  jsonrpc: string;
  id?: string | number | null;
  method: string;
  params?: Record<string, unknown>;
}

/**
 * Mapping from MCP list methods to their corresponding call method.
 */
const MCP_LIST_CALL_METHODS: Record<string, string> = {
  "tools/list": "tools/call",
  "resources/list": "resources/read",
  "prompts/list": "prompts/get",
};

export function parseMcpRequest(body: unknown): JsonRpcRequest | null {
  if (
    typeof body !== "object" ||
    body === null ||
    !("jsonrpc" in body) ||
    !("method" in body)
  ) {
    return null;
  }
  return body as JsonRpcRequest;
}

/**
 * Build the route key for an MCP request: "endpointPath/method:identifier".
 * Extracts the identifier from params.name (tools/call, prompts/get) or
 * params.uri (resources/read).
 */
export function getMcpRouteKey(
  endpointPath: string,
  method: string,
  params?: Record<string, unknown>,
): string | null {
  const identifier = params?.name ?? params?.uri;
  if (typeof identifier !== "string") return null;
  return `${endpointPath}/${method}:${identifier}`;
}

export function isMcpListMethod(method: string): boolean {
  return method in MCP_LIST_CALL_METHODS;
}

export interface McpPaymentRequirement {
  name: string;
  method: string;
  headers: Record<string, string>;
}

export interface JsonRpcError {
  jsonrpc: "2.0";
  id: string | number | null;
  error: { code: number; message: string; data?: unknown };
}

export function buildJsonRpcError(
  id: string | number | null,
  code: number,
  message: string,
  data?: unknown,
): JsonRpcError {
  const error: JsonRpcError = { jsonrpc: "2.0", id, error: { code, message } };
  if (data !== undefined) error.error.data = data;
  return error;
}

// TODO rfradkin: This is pretty scuffed but its also fine
/**
 * Build payment requirements for all gated MCP tools/resources/prompts
 * matching the given list method. Returns an array of {name, method, headers}
 * objects — one per restricted item. Callers serialize this into an HTTP
 * header on the list response.
 */
export async function getMcpListPaymentRequirements(
  listMethod: string,
  mcpEndpoint: string,
  httpServer: x402HTTPResourceServer,
  adapter: RequestAdapter,
  restrictions: Restriction[],
): Promise<McpPaymentRequirement[]> {
  const callMethod = MCP_LIST_CALL_METHODS[listMethod];
  if (!callMethod) return [];

  const relevant = restrictions.filter(
    (r): r is McpRestriction => r.type === "mcp" && r.method === callMethod,
  );
  if (!relevant.length) return [];

  const results: McpPaymentRequirement[] = [];
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
