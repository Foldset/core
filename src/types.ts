export interface Restriction {
  host: string;
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

export interface AiCrawler {
  user_agent: string;
}

export interface FacilitatorConfig {
  url: string;
  verifyHeaders?: Record<string, string>;
  settleHeaders?: Record<string, string>;
  supportedHeaders?: Record<string, string>;
}

export type FoldsetWebhook =
  | { event_type: "restrictions"; event_object: Restriction[] }
  | { event_type: "payment-methods"; event_object: PaymentMethod[] }
  | { event_type: "ai-crawlers"; event_object: AiCrawler[] }
  | { event_type: "facilitator"; event_object: FacilitatorConfig };
