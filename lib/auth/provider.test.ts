import { afterEach, describe, expect, it, vi } from "vitest";
import { Role } from "@prisma/client";
import { getAuthAdapter, getAuthProviderName, registerAuthAdapter, type AuthAdapter } from "@/lib/auth/provider";

function createAuthAdapter(label: string): AuthAdapter {
  return {
    devSignInAs: vi.fn(async () => {}),
    demoSignIn: vi.fn(async () => ({
      ok: true,
      user: { id: `${label}-id`, role: Role.ADMIN, email: `${label}@example.com`, name: label },
    })),
    demoSignUp: vi.fn(async () => ({
      ok: true,
      user: { id: `${label}-id`, role: Role.CUSTOMER, email: `${label}@example.com`, name: label },
    })),
    clearSession: vi.fn(async () => {}),
    readSessionPayload: vi.fn(async () => null),
  };
}

describe("auth provider selection", () => {
  afterEach(() => {
    delete process.env.AUTH_PROVIDER;
  });

  it("defaults to mock provider", () => {
    registerAuthAdapter("mock", createAuthAdapter("mock"));
    registerAuthAdapter("supabase-shadow", createAuthAdapter("shadow"));

    expect(getAuthProviderName()).toBe("mock");
    expect(getAuthAdapter().demoSignIn).toBeDefined();
  });

  it("supports independent shadow toggle", () => {
    registerAuthAdapter("mock", createAuthAdapter("mock"));
    const shadow = createAuthAdapter("shadow");
    registerAuthAdapter("supabase-shadow", shadow);
    process.env.AUTH_PROVIDER = "supabase-shadow";

    expect(getAuthProviderName()).toBe("supabase-shadow");
    expect(getAuthAdapter()).toBe(shadow);
  });
});
