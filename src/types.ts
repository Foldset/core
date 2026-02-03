import type { HTTPAdapter } from "@x402/core/server";

export interface RequestAdapter extends HTTPAdapter {
  getIpAddress(): string | null;
  getHost(): string;
}

export interface ConfigStore {
  get(key: string): Promise<string | null>;
}

export interface ErrorReporter {
  captureException(error: unknown, extra?: Record<string, unknown>): void;
}

export const consoleErrorReporter: ErrorReporter = {
  captureException(error: unknown) {
    console.error(error);
  },
};

export type EventPayload = {
  method: string;
  status_code: number;
  user_agent: string | null;
  referer?: string | null;
  href: string;
  hostname: string;
  pathname: string;
  search: string;
  ip_address?: string | null;
  payment_response?: string;
};

// TODO rfradkin: Consider breaking this up...
// hosts + subdomains is a lot, not to mention price and path etc
export interface Restriction {
  host: string;
  subdomains: string[];
  path: string;
  description: string;
  price: number;
  scheme: string;
}

export interface PaymentMethod {
  caip2_id: string;
  decimals: number;
  contract_address: string;
  circle_wallet_address: string;
  chain_display_name: string;
  asset_display_name: string;
  extra?: Record<string, string>;
}

export interface McpRestriction {
  host: string;
  subdomains: string[];
  mcp_endpoint_path: string;
  method: string;
  name: string;
  description: string;
  price: number;
  scheme: string;
}

export interface AiCrawler {
  user_agent: string;
}

export interface FacilitatorConfig {
  url: string;
  verifyHeaders?: Record<string, string>;
  settleHeaders?: Record<string, string>;
  supportedHeaders?: Record<string, string>;
}

