export function generatePaywallHtml(paymentRequired, config) {
    const resource = paymentRequired.resource;
    const description = resource?.description ?? "This resource requires payment";
    const url = resource?.url ?? config?.currentUrl ?? "";
    const accepts = paymentRequired.accepts ?? [];
    // Group payment options by blockchain network (e.g., Base Mainnet, Solana Mainnet)
    const optionsByNetwork = new Map();
    for (const accept of accepts) {
        const existing = optionsByNetwork.get(accept.network) ?? [];
        existing.push(accept);
        optionsByNetwork.set(accept.network, existing);
    }
    const paymentOptionsHtml = Array.from(optionsByNetwork.entries()).map(([_network, networkOptions]) => {
        // Chain display name (e.g., "Base Mainnet", "Solana Mainnet")
        const chainDisplayName = networkOptions[0].extra?.["chainDisplayName"] ?? "Unknown Network";
        const chainCaip2Id = networkOptions[0].network;
        // Recipient wallet address (where payments are sent)
        const recipientAddresses = Array.from(new Set(networkOptions.map((opt) => opt.payTo)));
        const recipientAddress = recipientAddresses[0] ?? "";
        // Build list of accepted tokens for this network
        const acceptedTokensHtml = networkOptions.map((accept) => {
            // Token display name (e.g., "USD Coin", "USDC")
            const tokenDisplayName = accept.extra?.["assetDisplayName"] ?? "Unknown Token";
            // Token contract address (e.g., "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" for USDC on Base)
            const tokenContractAddress = accept.asset;
            // Amount in token's smallest unit (e.g., for USDC with 6 decimals: 1000000 = $1.00)
            const rawTokenAmount = accept.amount;
            const rawPrice = accept.extra?.["price"] ?? "Unknown Price";
            // Capitalize first letter of scheme
            const scheme = accept.scheme
                .toLowerCase()
                .replace(/^./, c => c.toUpperCase());
            return `
        <tr>
          <td>${tokenDisplayName}</td>
          <td>${scheme}</td>
          <td>${rawTokenAmount}</td>
          <td>${rawPrice}</td>
          <td><code>${tokenContractAddress}</code></td>
        </tr>`;
        }).join("");
        return `
    <div class="card">
      <h3>${chainDisplayName} <span style="color:#888;font-weight:400;font-size:12px;">(${chainCaip2Id})</span></h3>
      <p class="detail"><strong>Pay to:</strong> <code>${recipientAddress}</code></p>
      <table>
        <thead>
          <tr>
            <th>Token</th>
            <th>Scheme</th>
            <th>Amount</th>
            <th>Price</th>
            <th>Contract</th>
          </tr>
        </thead>
        <tbody>${acceptedTokensHtml}
        </tbody>
      </table>
    </div>`;
    }).join("\n");
    return `<!DOCTYPE html>
<html>
<head>
  <title>HTTP 402 - Payment Required</title>
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Inter', system-ui, sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; background: #000; color: #ededed; -webkit-font-smoothing: antialiased; }
    h1, h2, h3 { color: #ededed; }
    a { color: #00ff88; }
    code { background: rgba(255,255,255,0.08); color: #ccc; padding: 2px 6px; border-radius: 3px; font-size: 0.9em; font-family: 'IBM Plex Mono', monospace; }
    table { border-collapse: collapse; margin: 10px 0; width: 100%; }
    th, td { padding: 8px 12px; border-bottom: 1px solid rgba(255,255,255,0.08); text-align: left; }
    th { background: rgba(255,255,255,0.06); color: #888; font-size: 0.85em; letter-spacing: 0.03em; text-transform: uppercase; }
    td { color: #ccc; font-size: 0.9em; }
    section, .card { margin: 20px 0; padding: 15px; border: 1px solid rgba(255,255,255,0.08); border-radius: 5px; }
    h3 { margin-top: 0; }
    strong { color: #ededed; }
    ul { color: #ccc; }
    p { color: #888; }
    .notice { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 6px; padding: 10px 12px; margin: 16px 0; color: #888; font-size: 0.92em; }
    .notice strong { display: block; margin-bottom: 4px; font-weight: 600; color: #ededed; }
    .notice p { margin: 0; }
    .detail { color: #888; }
    footer { margin-top: 30px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.08); font-size: 0.9em; color: #888; }
    ::selection { background: #00ff88; color: #000; }
  </style>
</head>
<body>
  <h1>HTTP 402: Payment Required</h1>

  <p>This content requires a payment via the <a href="https://github.com/coinbase/x402">x402 protocol</a>.</p>

  <h2>Protected Resource</h2>
  <ul>
    <li><strong>URL:</strong> <code>${url}</code></li>
    <li><strong>Description:</strong> ${description}</li>
  </ul>

  <h2>Accepted Payment Options</h2>
  <p>Pay using any of the following blockchain networks and tokens:</p>
  ${paymentOptionsHtml}

  <footer>
    <p><strong>Powered by</strong> <a href="https://www.foldset.com">Foldset</a></p>
  </footer>
</body>
</html>`;
}
