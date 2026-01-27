import type {
  FoldsetWebhook,
  Restriction,
  PaymentMethod,
  AiCrawler,
  FacilitatorConfig,
} from "./types";

import {
  RestrictionsManager,
  PaymentMethodsManager,
  AiCrawlersManager,
  FacilitatorManager,
} from "./config";

export async function verifySignature(body: string, signature: string, apiKey: string): Promise<boolean> {
  const encoder = new TextEncoder();

  const keyHashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(apiKey));
  const hashedKeyHex = Array.from(new Uint8Array(keyHashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  const hmacKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(hashedKeyHex),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const expectedSig = await crypto.subtle.sign("HMAC", hmacKey, encoder.encode(body));
  const expectedHex = Array.from(new Uint8Array(expectedSig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  // Timing-safe comparison
  if (signature.length !== expectedHex.length) return false;
  let result = 0;
  for (let i = 0; i < signature.length; i++) {
    result |= signature.charCodeAt(i) ^ expectedHex.charCodeAt(i);
  }
  return result === 0;
}

export class WebhookDispatcher {
  constructor(
    private restrictions: RestrictionsManager,
    private paymentMethods: PaymentMethodsManager,
    private aiCrawlers: AiCrawlersManager,
    private facilitator: FacilitatorManager,
  ) {}

  async dispatch(
    body: string,
    signature: string,
    apiKey: string,
  ): Promise<{ status: number; body: string }> {
    const isValid = await verifySignature(body, signature, apiKey);
    if (!isValid) {
      return { status: 401, body: "Invalid signature" };
    }

    const webhook = JSON.parse(body) as FoldsetWebhook;

    switch (webhook.event_type) {
      case "restrictions":
        await this.restrictions.store(webhook.event_object as Restriction[]);
        break;
      case "payment-methods":
        await this.paymentMethods.store(webhook.event_object as PaymentMethod[]);
        break;
      case "ai-crawlers":
        await this.aiCrawlers.store(webhook.event_object as AiCrawler[]);
        break;
      case "facilitator":
        await this.facilitator.store(webhook.event_object as FacilitatorConfig);
        break;
    }

    return { status: 200, body: "Ok" };
  }
}
