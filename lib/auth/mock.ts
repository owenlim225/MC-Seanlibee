import { Role } from "@prisma/client";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { signSession, verifySession, type SessionPayload } from "@/lib/auth/cookie";
import { checkDemoPassword } from "@/lib/auth/demo-password";
import { isAppRole } from "@/lib/roles";
import { prisma } from "@/lib/prisma";

const COOKIE = "mc_session";
const TTL_MS = 60 * 60 * 24 * 7 * 1000;

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

export async function devSignInAs(role: Role, userId?: string): Promise<void> {
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

export type DemoSignInResult =
  | { ok: true; user: { id: string; role: Role; email: string; name: string } }
  | { ok: false };

/**
 * Env-gated demo sign-in. Returns a generic failure for missing user, wrong
 * password, disabled demo mode, or invalid role — no information leakage.
 */
export async function demoSignIn(email: string, password: string): Promise<DemoSignInResult> {
  if (!isDemoAuthEnabled()) return { ok: false };
  if (typeof email !== "string" || typeof password !== "string") return { ok: false };
  const passwordOk = await checkDemoPassword(password);
  if (!passwordOk) return { ok: false };

  const user = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
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

export async function clearSession(): Promise<void> {
  (await cookies()).delete(COOKIE);
}

export async function readSessionPayload(): Promise<SessionPayload | null> {
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return null;
  return verifySession(raw, secret());
}
