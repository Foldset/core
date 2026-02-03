import type { RoutesConfig } from "@x402/core/http";
import type { Network } from "@x402/core/types";

import type { Restriction, PaymentMethod } from "./types";

export function priceToAmount(priceUsd: number, decimals: number): string {
  const amount = priceUsd * Math.pow(10, decimals);
  return Math.round(amount).toString();
}

export function buildRouteEntry(scheme: string, price: number, description: string, paymentMethods: PaymentMethod[]) {
  return {
    accepts: paymentMethods.map((pm) => ({
      scheme,
      price: {
        amount: priceToAmount(price, pm.decimals),
        asset: pm.contract_address,
        extra: {
          ...pm.extra,
          decimals: pm.decimals,
          chainDisplayName: pm.chain_display_name,
          assetDisplayName: pm.asset_display_name,
          price,
        },
      },
      network: pm.caip2_id as Network,
      payTo: pm.circle_wallet_address,
    })),
    description,
    mimeType: "application/json",
  };
}

export function buildRoutesConfig(
  restrictions: Restriction[],
  paymentMethods: PaymentMethod[],
): RoutesConfig {
  const routesConfig: RoutesConfig = {};

  for (const r of restrictions) {
    // TODO rfradkin: this is pretty janky
    const key = r.type === "web"
      ? r.path
      : `${r.mcp_endpoint_path}/${r.method}:${r.name}`;
    routesConfig[key] = buildRouteEntry(r.scheme, r.price, r.description, paymentMethods);
  }

  return routesConfig;
}
