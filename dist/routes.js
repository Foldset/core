export function priceToAmount(priceUsd, decimals) {
    const amount = priceUsd * Math.pow(10, decimals);
    return Math.round(amount).toString();
}
export function buildRoutesConfig(restrictions, paymentMethods) {
    const routesConfig = {};
    for (const restriction of restrictions) {
        routesConfig[restriction.path] = {
            accepts: paymentMethods.map((paymentMethod) => ({
                scheme: restriction.scheme,
                price: {
                    amount: priceToAmount(restriction.price, paymentMethod.decimals),
                    asset: paymentMethod.contract_address,
                    // eip712 required extra
                    extra: {
                        ...paymentMethod.extra,
                        decimals: paymentMethod.decimals,
                        chainDisplayName: paymentMethod.chain_display_name,
                        assetDisplayName: paymentMethod.asset_display_name,
                        price: restriction.price,
                    },
                },
                network: paymentMethod.caip2_id,
                payTo: paymentMethod.circle_wallet_address,
            })),
            description: restriction.description,
            mimeType: "application/json",
        };
    }
    return routesConfig;
}
