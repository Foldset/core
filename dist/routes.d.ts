import type { RoutesConfig } from "@x402/core/http";
import type { Network } from "@x402/core/types";
import type { Restriction, PaymentMethod } from "./types";
export declare function priceToAmount(priceUsd: number, decimals: number): string;
export declare function buildRouteEntry(scheme: string, price: number, description: string, paymentMethods: PaymentMethod[]): {
    accepts: {
        scheme: string;
        price: {
            amount: string;
            asset: string;
            extra: {
                decimals: number;
                chainDisplayName: string;
                assetDisplayName: string;
                price: number;
            };
        };
        network: Network;
        payTo: string;
    }[];
    description: string;
    mimeType: string;
};
export declare function buildRoutesConfig(restrictions: Restriction[], paymentMethods: PaymentMethod[], mcpEndpoint: string | null): RoutesConfig;
//# sourceMappingURL=routes.d.ts.map