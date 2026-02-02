interface JsonRpcRequest {
  jsonrpc: string;
  id?: string | number | null;
  method: string;
  params?: Record<string, unknown>;
}

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
 * Build the route key for an MCP request: "endpointPath/method:name".
 * Extracts the identifier from params.name or params.uri.
 */
export function getMcpRouteKey(endpointPath: string, method: string, params?: Record<string, unknown>): string | null {
  const name = params?.name ?? params?.uri;
  if (typeof name !== "string") return null;
  return `${endpointPath}/${method}:${name}`;
}
