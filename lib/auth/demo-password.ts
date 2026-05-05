/**
 * Constant-time string equality via HMAC-SHA256 digest comparison. Both sides
 * are HMAC'd under a fixed key; the resulting 32-byte digests are then folded
 * with XOR-OR so the loop runtime is independent of where bytes differ.
 *
 * Works in Edge and Node runtimes (Web Crypto only).
 */
const encoder = new TextEncoder();
const FIXED_KEY_BYTES = encoder.encode("ct-equal-fixed-key-v1");

let cachedKey: Promise<CryptoKey> | undefined;

function getKey(): Promise<CryptoKey> {
  if (!cachedKey) {
    cachedKey = crypto.subtle.importKey(
      "raw",
      FIXED_KEY_BYTES,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );
  }
  return cachedKey;
}

export async function constantTimeEqual(a: string, b: string): Promise<boolean> {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const key = await getKey();
  const sigA = new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(a)));
  const sigB = new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(b)));
  if (sigA.length !== sigB.length) return false;
  let diff = 0;
  for (let i = 0; i < sigA.length; i += 1) diff |= sigA[i] ^ sigB[i];
  return diff === 0;
}

/**
 * Compare a user-submitted password to the configured demo password.
 * Returns false if `DEMO_AUTH_PASSWORD` is unset (treated as "demo disabled").
 */
export async function checkDemoPassword(submitted: string): Promise<boolean> {
  const expected = process.env.DEMO_AUTH_PASSWORD;
  if (!expected || expected.length === 0) return false;
  return constantTimeEqual(submitted, expected);
}
