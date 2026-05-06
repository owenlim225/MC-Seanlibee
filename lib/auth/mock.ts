import { Role } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { signSession, verifySession, type SessionPayload } from "@/lib/auth/cookie";
import { checkDemoPassword } from "@/lib/auth/demo-password";
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

function secret(): string {
  return process.env.SESSION_SECRET ?? "dev-only-change-me-dev-only-change-me";
}

function isDemoAuthEnabled(): boolean {
  if (process.env.NODE_ENV !== "production") return true;
  return process.env.DEMO_AUTH_ENABLED === "true";
}

async function writeSessionCookie(payload: SessionPayload): Promise<void> {
  const token = await signSession(payload, secret());
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
    (await prisma.user.findFirst({ where: { role }, orderBy: { email: "asc" } }))?.id;
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
  if (!isDemoAuthEnabled()) return { ok: false };
  if (typeof email !== "string" || typeof password !== "string") return { ok: false };
  const passwordOk = await checkDemoPassword(password);
  if (!passwordOk) return { ok: false };

  const normalizedEmail = email.trim().toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true, role: true, email: true, name: true },
  });
  if (!user) return { ok: false };
  if (!isAppRole(user.role)) return { ok: false };

  await writeSessionCookie({
    uid: user.id,
    role: user.role,
    exp: Date.now() + TTL_MS,
  });
  return { ok: true, user };
}

async function mockDemoSignUp(name: string, email: string, password: string): Promise<DemoSignUpResult> {
  if (!isDemoAuthEnabled()) return { ok: false };
  if (typeof name !== "string" || typeof email !== "string" || typeof password !== "string") return { ok: false };

  const passwordOk = await checkDemoPassword(password);
  if (!passwordOk) return { ok: false };

  const normalizedName = name.trim();
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedName || !normalizedEmail) return { ok: false };
  if (!SIMPLE_EMAIL_RE.test(normalizedEmail)) return { ok: false };

  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true },
  });
  if (existing) return { ok: false };

  let user: { id: string; role: Role; email: string; name: string };
  try {
    user = await prisma.user.create({
      data: {
        name: normalizedName,
        email: normalizedEmail,
        role: Role.CUSTOMER,
      },
      select: { id: true, role: true, email: true, name: true },
    });
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError && error.code === "P2002") {
      return { ok: false };
    }
    throw error;
  }

  await writeSessionCookie({
    uid: user.id,
    role: user.role,
    exp: Date.now() + TTL_MS,
  });

  return { ok: true, user };
}

async function mockClearSession(): Promise<void> {
  (await cookies()).delete(COOKIE);
}

async function mockReadSessionPayload(): Promise<SessionPayload | null> {
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return null;
  return verifySession(raw, secret());
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
