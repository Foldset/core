export async function verifySignature(body, signature, apiKey) {
    const encoder = new TextEncoder();
    const keyHashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(apiKey));
    const hashedKeyHex = Array.from(new Uint8Array(keyHashBuffer))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
    const hmacKey = await crypto.subtle.importKey("raw", encoder.encode(hashedKeyHex), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    const expectedSig = await crypto.subtle.sign("HMAC", hmacKey, encoder.encode(body));
    const expectedHex = Array.from(new Uint8Array(expectedSig))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
    // Timing-safe comparison
    if (signature.length !== expectedHex.length)
        return false;
    let result = 0;
    for (let i = 0; i < signature.length; i++) {
        result |= signature.charCodeAt(i) ^ expectedHex.charCodeAt(i);
    }
    return result === 0;
}
export class WebhookDispatcher {
    restrictions;
    paymentMethods;
    aiCrawlers;
    facilitator;
    constructor(restrictions, paymentMethods, aiCrawlers, facilitator) {
        this.restrictions = restrictions;
        this.paymentMethods = paymentMethods;
        this.aiCrawlers = aiCrawlers;
        this.facilitator = facilitator;
    }
    async dispatch(body, signature, apiKey) {
        // Signature may be comma-separated (multi-key rotation).
        // Accept if any individual signature matches.
        const signatures = signature.split(",");
        let isValid = false;
        for (const sig of signatures) {
            if (await verifySignature(body, sig, apiKey)) {
                isValid = true;
                break;
            }
        }
        if (!isValid) {
            return { status: 401, body: "Invalid signature" };
        }
        const webhook = JSON.parse(body);
        switch (webhook.event_type) {
            case "restrictions":
                await this.restrictions.store(webhook.event_object);
                break;
            case "payment-methods":
                await this.paymentMethods.store(webhook.event_object);
                break;
            case "ai-crawlers":
                await this.aiCrawlers.store(webhook.event_object);
                break;
            case "facilitator":
                await this.facilitator.store(webhook.event_object);
                break;
        }
        return { status: 200, body: "Ok" };
    }
}
