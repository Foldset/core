import type { McpRestriction, Restriction, PaymentMethod } from "./types";
import { priceToAmount } from "./routes";

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

/**
 * Build payment requirements for all gated MCP tools/resources/prompts
 * matching the given list method. Returns clear payment instructions
 * built directly from Foldset restrictions and payment methods.
 */
export function getMcpListPaymentRequirements(
  listMethod: string,
  restrictions: Restriction[],
  paymentMethods: PaymentMethod[],
): McpPaymentRequirement[] {
  const callMethod = MCP_LIST_CALL_METHODS[listMethod];
  if (!callMethod) return [];

  const relevant = restrictions.filter(
    (r): r is McpRestriction => r.type === "mcp" && r.method === callMethod,
  );
  if (!relevant.length) return [];

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
