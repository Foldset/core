import type { RoutesConfig } from "@x402/core/http";
import type { Restriction, PaymentMethod } from "./types";
export declare function priceToAmount(priceUsd: number, decimals: number): string;
export declare function buildRoutesConfig(restrictions: Restriction[], paymentMethods: PaymentMethod[]): RoutesConfig;
//# sourceMappingURL=routes.d.ts.map