function readRequiredEnv(name: string): string {
  const value = process.env[name];
  // #region agent log
  fetch("http://127.0.0.1:7817/ingest/c3fc8591-bb49-4618-b7bd-5aef2b04dae3", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "921114" },
    body: JSON.stringify({
      sessionId: "921114",
      runId: "pre-fix",
      hypothesisId: "H3",
      location: "lib/supabase/env.ts:3",
      message: "Read required env in runtime",
      data: {
        name,
        hasValue: typeof value === "string" && value.length > 0,
        hasKey: Object.prototype.hasOwnProperty.call(process.env, name),
        nodeEnv: process.env.NODE_ENV ?? null,
        vercelEnv: process.env.VERCEL_ENV ?? null,
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion
  if (typeof value === "string" && value.length > 0) return value;
  // #region agent log
  fetch("http://127.0.0.1:7817/ingest/c3fc8591-bb49-4618-b7bd-5aef2b04dae3", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "921114" },
    body: JSON.stringify({
      sessionId: "921114",
      runId: "pre-fix",
      hypothesisId: "H1",
      location: "lib/supabase/env.ts:4",
      message: "Missing env variable before throw",
      data: {
        name,
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion
  throw new Error(`Missing required environment variable: ${name}`);
}

export function getSupabaseUrl(): string {
  return readRequiredEnv("NEXT_PUBLIC_SUPABASE_URL");
}

export function getSupabaseAnonKey(): string {
  return readRequiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

