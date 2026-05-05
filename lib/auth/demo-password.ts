/**
 * Constant-time string equality via HMAC-SHA256 digest comparison. Both sides
 * are HMAC'd under a fixed key; the resulting 32-byte digests are then folded
 * with XOR-OR so the loop runtime is independent of where bytes differ.
 *
 * Works in Edge and Node runtimes (Web Crypto only).
 */
const encoder = new TextEncoder();
const FIXED_KEY_BYTES = encoder.encode("ct-equal-fixed-key-v1");
export const DEFAULT_DEMO_AUTH_PASSWORD = "Demo123!";

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
 * In non-production, falls back to the default demo password when env is unset.
 * In production, requires `DEMO_AUTH_PASSWORD` to be explicitly configured.
 */
export async function checkDemoPassword(submitted: string): Promise<boolean> {
  const expected =
    process.env.DEMO_AUTH_PASSWORD && process.env.DEMO_AUTH_PASSWORD.length > 0
      ? process.env.DEMO_AUTH_PASSWORD
      : process.env.NODE_ENV === "production"
        ? ""
        : DEFAULT_DEMO_AUTH_PASSWORD;
  // #region agent log
  fetch("http://127.0.0.1:7817/ingest/c3fc8591-bb49-4618-b7bd-5aef2b04dae3", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "268a74" },
    body: JSON.stringify({
      sessionId: "268a74",
      runId: "pre-fix",
      hypothesisId: "H6",
      location: "lib/auth/demo-password.ts:49",
      message: "demo password expectation derived",
      data: {
        submittedLength: typeof submitted === "string" ? submitted.length : -1,
        hasConfiguredEnvPassword: Boolean(process.env.DEMO_AUTH_PASSWORD && process.env.DEMO_AUTH_PASSWORD.length > 0),
        expectedLength: expected.length,
        nodeEnv: process.env.NODE_ENV ?? null,
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion
  if (!expected || expected.length === 0) return false;
  return constantTimeEqual(submitted, expected);
}
