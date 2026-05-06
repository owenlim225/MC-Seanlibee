import { Role } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { signSession, verifySession, type SessionPayload } from "@/lib/auth/cookie";
import { checkDemoPassword } from "@/lib/auth/demo-password";
import { hashPassword } from "@/lib/auth/password";
import { getSessionSecret } from "@/lib/auth/session-secret";
import {
  getAuthAdapter,
  registerAuthAdapter,
  type DemoSignInResult,
  type DemoSignUpResult,
} from "@/lib/auth/provider";
import { isAppRole } from "@/lib/roles";
import { prisma } from "@/lib/prisma";

const COOKIE = "mc_session";
const TTL_MS = 60 * 60 * 24 * 7 * 1000;
const SIMPLE_EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type AuthDebugEvent = {
  flow: "sign-in" | "sign-up";
  outcome: "success" | "fail";
  reason: string;
  email?: string;
  nameLength?: number;
  role?: Role;
  userId?: string;
  provider: string;
  nodeEnv: string;
  demoAuthEnabled: boolean;
  hasDemoAuthPassword: boolean;
};

function authDebug(event: AuthDebugEvent): void {
  const payload = {
    ...event,
    at: new Date().toISOString(),
  };
  if (event.outcome === "success") {
    console.info("[auth-debug]", payload);
    return;
  }
  console.warn("[auth-debug]", payload);
}

function isDemoAuthEnabled(): boolean {
  if (process.env.NODE_ENV !== "production") return true;
  return process.env.DEMO_AUTH_ENABLED === "true";
}

async function writeSessionCookie(payload: SessionPayload): Promise<void> {
  const token = await signSession(payload, getSessionSecret());
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: TTL_MS / 1000,
    secure: process.env.NODE_ENV === "production",
  });
}

async function mockDevSignInAs(role: Role, userId?: string): Promise<void> {
  // TODO(real-keys:auth-mock-001): Replace cookie signing with Supabase Auth session + JWT verification via @supabase/ssr.
  if (process.env.NODE_ENV === "production") {
    throw new Error("devSignInAs is disabled in production");
  }
  const resolvedId =
    userId ??
    (await prisma.user.findFirst({ where: { role, isActive: true }, orderBy: { email: "asc" } }))?.id;
  if (!resolvedId) redirect("/dev/role-switcher?error=no-user");
  await writeSessionCookie({
    uid: resolvedId,
    role,
    exp: Date.now() + TTL_MS,
  });
}

/**
 * Env-gated demo sign-in. Returns a generic failure for missing user, wrong
 * password, disabled demo mode, or invalid role — no information leakage.
 */
async function mockDemoSignIn(email: string, password: string): Promise<DemoSignInResult> {
  const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
  if (!isDemoAuthEnabled()) {
    authDebug({
      flow: "sign-in",
      outcome: "fail",
      reason: "demo-auth-disabled",
      email: normalizedEmail,
      provider: process.env.AUTH_PROVIDER ?? "mock",
      nodeEnv: process.env.NODE_ENV ?? "unknown",
      demoAuthEnabled: isDemoAuthEnabled(),
      hasDemoAuthPassword: Boolean(process.env.DEMO_AUTH_PASSWORD),
    });
    return { ok: false };
  }
  if (typeof email !== "string" || typeof password !== "string") {
    authDebug({
      flow: "sign-in",
      outcome: "fail",
      reason: "invalid-input-types",
      email: normalizedEmail,
      provider: process.env.AUTH_PROVIDER ?? "mock",
      nodeEnv: process.env.NODE_ENV ?? "unknown",
      demoAuthEnabled: isDemoAuthEnabled(),
      hasDemoAuthPassword: Boolean(process.env.DEMO_AUTH_PASSWORD),
    });
    return { ok: false };
  }
  const passwordOk = await checkDemoPassword(password);
  if (!passwordOk) {
    authDebug({
      flow: "sign-in",
      outcome: "fail",
      reason: "password-mismatch-or-missing-config",
      email: normalizedEmail,
      provider: process.env.AUTH_PROVIDER ?? "mock",
      nodeEnv: process.env.NODE_ENV ?? "unknown",
      demoAuthEnabled: isDemoAuthEnabled(),
      hasDemoAuthPassword: Boolean(process.env.DEMO_AUTH_PASSWORD),
    });
    return { ok: false };
  }

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true, role: true, email: true, name: true, isActive: true },
  });
  if (!user) {
    authDebug({
      flow: "sign-in",
      outcome: "fail",
      reason: "user-not-found",
      email: normalizedEmail,
      provider: process.env.AUTH_PROVIDER ?? "mock",
      nodeEnv: process.env.NODE_ENV ?? "unknown",
      demoAuthEnabled: isDemoAuthEnabled(),
      hasDemoAuthPassword: Boolean(process.env.DEMO_AUTH_PASSWORD),
    });
    return { ok: false };
  }
  if (!user.isActive) {
    authDebug({
      flow: "sign-in",
      outcome: "fail",
      reason: "inactive-user",
      email: normalizedEmail,
      role: user.role,
      userId: user.id,
      provider: process.env.AUTH_PROVIDER ?? "mock",
      nodeEnv: process.env.NODE_ENV ?? "unknown",
      demoAuthEnabled: isDemoAuthEnabled(),
      hasDemoAuthPassword: Boolean(process.env.DEMO_AUTH_PASSWORD),
    });
    return { ok: false };
  }
  if (!isAppRole(user.role)) {
    authDebug({
      flow: "sign-in",
      outcome: "fail",
      reason: "invalid-app-role",
      email: normalizedEmail,
      role: user.role,
      userId: user.id,
      provider: process.env.AUTH_PROVIDER ?? "mock",
      nodeEnv: process.env.NODE_ENV ?? "unknown",
      demoAuthEnabled: isDemoAuthEnabled(),
      hasDemoAuthPassword: Boolean(process.env.DEMO_AUTH_PASSWORD),
    });
    return { ok: false };
  }

  await writeSessionCookie({
    uid: user.id,
    role: user.role,
    exp: Date.now() + TTL_MS,
  });
  authDebug({
    flow: "sign-in",
    outcome: "success",
    reason: "ok",
    email: normalizedEmail,
    role: user.role,
    userId: user.id,
    provider: process.env.AUTH_PROVIDER ?? "mock",
    nodeEnv: process.env.NODE_ENV ?? "unknown",
    demoAuthEnabled: isDemoAuthEnabled(),
    hasDemoAuthPassword: Boolean(process.env.DEMO_AUTH_PASSWORD),
  });
  return { ok: true, user: { id: user.id, role: user.role, email: user.email, name: user.name } };
}

async function mockDemoSignUp(name: string, email: string, password: string): Promise<DemoSignUpResult> {
  const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
  if (!isDemoAuthEnabled()) {
    authDebug({
      flow: "sign-up",
      outcome: "fail",
      reason: "demo-auth-disabled",
      email: normalizedEmail,
      nameLength: typeof name === "string" ? name.trim().length : 0,
      provider: process.env.AUTH_PROVIDER ?? "mock",
      nodeEnv: process.env.NODE_ENV ?? "unknown",
      demoAuthEnabled: isDemoAuthEnabled(),
      hasDemoAuthPassword: Boolean(process.env.DEMO_AUTH_PASSWORD),
    });
    return { ok: false };
  }
  if (typeof name !== "string" || typeof email !== "string" || typeof password !== "string") {
    authDebug({
      flow: "sign-up",
      outcome: "fail",
      reason: "invalid-input-types",
      email: normalizedEmail,
      nameLength: typeof name === "string" ? name.trim().length : 0,
      provider: process.env.AUTH_PROVIDER ?? "mock",
      nodeEnv: process.env.NODE_ENV ?? "unknown",
      demoAuthEnabled: isDemoAuthEnabled(),
      hasDemoAuthPassword: Boolean(process.env.DEMO_AUTH_PASSWORD),
    });
    return { ok: false };
  }

  const passwordOk = await checkDemoPassword(password);
  if (!passwordOk) {
    authDebug({
      flow: "sign-up",
      outcome: "fail",
      reason: "password-mismatch-or-missing-config",
      email: normalizedEmail,
      nameLength: name.trim().length,
      provider: process.env.AUTH_PROVIDER ?? "mock",
      nodeEnv: process.env.NODE_ENV ?? "unknown",
      demoAuthEnabled: isDemoAuthEnabled(),
      hasDemoAuthPassword: Boolean(process.env.DEMO_AUTH_PASSWORD),
    });
    return { ok: false };
  }

  const normalizedName = name.trim();
  if (!normalizedName || !normalizedEmail) {
    authDebug({
      flow: "sign-up",
      outcome: "fail",
      reason: "blank-name-or-email",
      email: normalizedEmail,
      nameLength: normalizedName.length,
      provider: process.env.AUTH_PROVIDER ?? "mock",
      nodeEnv: process.env.NODE_ENV ?? "unknown",
      demoAuthEnabled: isDemoAuthEnabled(),
      hasDemoAuthPassword: Boolean(process.env.DEMO_AUTH_PASSWORD),
    });
    return { ok: false };
  }
  if (!SIMPLE_EMAIL_RE.test(normalizedEmail)) {
    authDebug({
      flow: "sign-up",
      outcome: "fail",
      reason: "invalid-email-format",
      email: normalizedEmail,
      nameLength: normalizedName.length,
      provider: process.env.AUTH_PROVIDER ?? "mock",
      nodeEnv: process.env.NODE_ENV ?? "unknown",
      demoAuthEnabled: isDemoAuthEnabled(),
      hasDemoAuthPassword: Boolean(process.env.DEMO_AUTH_PASSWORD),
    });
    return { ok: false };
  }

  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true },
  });
  if (existing) {
    authDebug({
      flow: "sign-up",
      outcome: "fail",
      reason: "email-already-exists",
      email: normalizedEmail,
      nameLength: normalizedName.length,
      userId: existing.id,
      provider: process.env.AUTH_PROVIDER ?? "mock",
      nodeEnv: process.env.NODE_ENV ?? "unknown",
      demoAuthEnabled: isDemoAuthEnabled(),
      hasDemoAuthPassword: Boolean(process.env.DEMO_AUTH_PASSWORD),
    });
    return { ok: false };
  }

  let user: { id: string; role: Role; email: string; name: string };
  try {
    user = await prisma.user.create({
      data: {
        name: normalizedName,
        email: normalizedEmail,
        role: Role.CUSTOMER,
        password: hashPassword(password),
      },
      select: { id: true, role: true, email: true, name: true },
    });
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError && error.code === "P2002") {
      authDebug({
        flow: "sign-up",
        outcome: "fail",
        reason: "p2002-duplicate-email",
        email: normalizedEmail,
        nameLength: normalizedName.length,
        provider: process.env.AUTH_PROVIDER ?? "mock",
        nodeEnv: process.env.NODE_ENV ?? "unknown",
        demoAuthEnabled: isDemoAuthEnabled(),
        hasDemoAuthPassword: Boolean(process.env.DEMO_AUTH_PASSWORD),
      });
      return { ok: false };
    }
    throw error;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { authUserId: user.id },
  });

  await writeSessionCookie({
    uid: user.id,
    role: user.role,
    exp: Date.now() + TTL_MS,
  });
  authDebug({
    flow: "sign-up",
    outcome: "success",
    reason: "ok",
    email: normalizedEmail,
    nameLength: normalizedName.length,
    role: user.role,
    userId: user.id,
    provider: process.env.AUTH_PROVIDER ?? "mock",
    nodeEnv: process.env.NODE_ENV ?? "unknown",
    demoAuthEnabled: isDemoAuthEnabled(),
    hasDemoAuthPassword: Boolean(process.env.DEMO_AUTH_PASSWORD),
  });

  return { ok: true, user };
}

async function mockClearSession(): Promise<void> {
  (await cookies()).delete(COOKIE);
}

async function mockReadSessionPayload(): Promise<SessionPayload | null> {
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return null;
  return verifySession(raw, getSessionSecret());
}

registerAuthAdapter("mock", {
  devSignInAs: mockDevSignInAs,
  demoSignIn: mockDemoSignIn,
  demoSignUp: mockDemoSignUp,
  clearSession: mockClearSession,
  readSessionPayload: mockReadSessionPayload,
});

registerAuthAdapter("supabase-shadow", {
  // N.1 shadow mode scaffold: keep current behavior while exercising provider wiring.
  devSignInAs: mockDevSignInAs,
  demoSignIn: mockDemoSignIn,
  demoSignUp: mockDemoSignUp,
  clearSession: mockClearSession,
  readSessionPayload: mockReadSessionPayload,
});

export async function devSignInAs(role: Role, userId?: string): Promise<void> {
  return getAuthAdapter().devSignInAs(role, userId);
}

export async function demoSignIn(email: string, password: string): Promise<DemoSignInResult> {
  return getAuthAdapter().demoSignIn(email, password);
}

export async function demoSignUp(name: string, email: string, password: string): Promise<DemoSignUpResult> {
  return getAuthAdapter().demoSignUp(name, email, password);
}

export async function clearSession(): Promise<void> {
  return getAuthAdapter().clearSession();
}

export async function readSessionPayload(): Promise<SessionPayload | null> {
  return getAuthAdapter().readSessionPayload();
}
