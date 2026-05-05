import type { Role } from "@prisma/client";
import type { SessionPayload } from "@/lib/auth/cookie";

export type DemoSignInResult =
  | { ok: true; user: { id: string; role: Role; email: string; name: string } }
  | { ok: false };

export type AuthAdapter = {
  devSignInAs(role: Role, userId?: string): Promise<void>;
  demoSignIn(email: string, password: string): Promise<DemoSignInResult>;
  clearSession(): Promise<void>;
  readSessionPayload(): Promise<SessionPayload | null>;
};

export type AuthProviderName = "mock" | "supabase-shadow";

const adapters = new Map<AuthProviderName, AuthAdapter>();

export function registerAuthAdapter(name: AuthProviderName, adapter: AuthAdapter): void {
  adapters.set(name, adapter);
}

export function getAuthProviderName(): AuthProviderName {
  return process.env.AUTH_PROVIDER === "supabase-shadow" ? "supabase-shadow" : "mock";
}

export function getAuthAdapter(): AuthAdapter {
  const selected = adapters.get(getAuthProviderName());
  const fallback = adapters.get("mock");
  if (selected) return selected;
  if (fallback) return fallback;
  throw new Error("Auth adapter not registered");
}
