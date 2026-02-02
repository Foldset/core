import type { HTTPAdapter } from "@x402/core/server";
export interface RequestAdapter extends HTTPAdapter {
    getIpAddress(): string | null;
    getHost(): string;
}
export interface ConfigStore {
    get(key: string): Promise<string | null>;
    put?(key: string, value: string): Promise<void>;
}
export interface ErrorReporter {
    captureException(error: unknown, extra?: Record<string, unknown>): void;
}
export declare const consoleErrorReporter: ErrorReporter;
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
export type FoldsetWebhook = {
    event_type: "restrictions";
    event_object: Restriction[];
} | {
    event_type: "payment-methods";
    event_object: PaymentMethod[];
} | {
    event_type: "ai-crawlers";
    event_object: AiCrawler[];
} | {
    event_type: "facilitator";
    event_object: FacilitatorConfig;
};
//# sourceMappingURL=types.d.ts.map