export function priceToAmount(priceUsd, decimals) {
    const amount = priceUsd * Math.pow(10, decimals);
    return Math.round(amount).toString();
}
export function buildRouteEntry(scheme, price, description, paymentMethods) {
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
            network: pm.caip2_id,
            payTo: pm.circle_wallet_address,
        })),
        description,
        mimeType: "application/json",
    };
}
export function buildRoutesConfig(restrictions, paymentMethods, mcpEndpoint) {
    const routesConfig = {};
    for (const r of restrictions) {
        const key = r.type === "web"
            ? r.path
            : `${mcpEndpoint}/${r.method}:${r.name}`;
        routesConfig[key] = buildRouteEntry(r.scheme, r.price, r.description, paymentMethods);
    }
    return routesConfig;
}
