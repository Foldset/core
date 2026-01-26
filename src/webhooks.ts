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
