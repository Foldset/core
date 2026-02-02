export function priceToAmount(priceUsd, decimals) {
    const amount = priceUsd * Math.pow(10, decimals);
    return Math.round(amount).toString();
}
function buildRouteEntry(scheme, price, description, paymentMethods) {
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
export function buildRoutesConfig(restrictions, mcpRestrictions, paymentMethods) {
    const routesConfig = {};
    for (const r of restrictions) {
        routesConfig[r.path] = buildRouteEntry(r.scheme, r.price, r.description, paymentMethods);
    }
    for (const r of mcpRestrictions) {
        routesConfig[`${r.mcp_endpoint_path}/${r.method}:${r.name}`] = buildRouteEntry(r.scheme, r.price, r.description, paymentMethods);
    }
    return routesConfig;
}
