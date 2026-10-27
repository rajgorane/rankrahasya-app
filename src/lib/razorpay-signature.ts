// Web Crypto HMAC helpers (work on Cloudflare Workers and Node).
const enc = new TextEncoder();

export async function hmacSha256Hex(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
  ]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

/** Checkout signature: HMAC(order_id + "|" + payment_id, key_secret). */
export async function verifyCheckoutSignature(orderId: string, paymentId: string, signature: string, secret: string) {
  return safeEqual(await hmacSha256Hex(secret, `${orderId}|${paymentId}`), signature);
}

/** Webhook signature: HMAC(raw body, webhook_secret). */
export async function verifyWebhookSignature(rawBody: string, signature: string, secret: string) {
  return safeEqual(await hmacSha256Hex(secret, rawBody), signature);
}