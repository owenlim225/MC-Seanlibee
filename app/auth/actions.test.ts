import { describe, expect, it, vi } from "vitest";

const { clearSessionMock, redirectMock } = vi.hoisted(() => ({
  clearSessionMock: vi.fn(async () => {}),
  redirectMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

vi.mock("next/dist/client/components/redirect-error", () => ({
  isRedirectError: () => false,
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    set: vi.fn(),
    delete: vi.fn(),
  })),
}));

vi.mock("@/lib/auth", () => ({
  clearSession: clearSessionMock,
}));

vi.mock("@/lib/roles", () => ({
  isAppRole: vi.fn(() => true),
  ROLE_HOME: {
    ADMIN: "/admin",
    DRIVER: "/driver",
    CUSTOMER: "/customer",
  },
}));

vi.mock("@/lib/auth/safe-next-path", () => ({
  safeNextPath: vi.fn((_next: unknown, fallback: string) => fallback),
}));

vi.mock("@/lib/auth/cookie", () => ({
  signSession: vi.fn(async () => "token"),
}));

vi.mock("@/lib/auth/password", () => ({
  hashPassword: vi.fn((value: string) => `hash:${value}`),
  isPasswordHash: vi.fn(() => true),
  verifyPassword: vi.fn(() => true),
}));

vi.mock("@/lib/auth/session-secret", () => ({
  getSessionSecret: vi.fn(() => "secret"),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock("@prisma/client/runtime/library", () => ({
  PrismaClientKnownRequestError: class PrismaClientKnownRequestError extends Error {
    code = "P2002";
  },
}));

vi.mock("@prisma/client", () => ({
  Role: {
    CUSTOMER: "CUSTOMER",
  },
}));

import { logoutAction } from "@/app/auth/actions";

describe("logoutAction", () => {
  it("clears session and redirects to home", async () => {
    await logoutAction();

    expect(clearSessionMock).toHaveBeenCalledTimes(1);
    expect(redirectMock).toHaveBeenCalledWith("/");
  });
});
