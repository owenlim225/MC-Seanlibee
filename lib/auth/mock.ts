import { Role } from "@prisma/client";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { signSession, verifySession, type SessionPayload } from "@/lib/auth/cookie";
import { prisma } from "@/lib/prisma";

const COOKIE = "mc_session";
const TTL_MS = 60 * 60 * 24 * 7 * 1000;

function secret(): string {
  return process.env.SESSION_SECRET ?? "dev-only-change-me-dev-only-change-me";
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
  const payload: SessionPayload = {
    uid: resolvedId,
    role,
    exp: Date.now() + TTL_MS,
  };
  const token = await signSession(payload, secret());
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: TTL_MS / 1000,
  });
}

export async function clearSession(): Promise<void> {
  (await cookies()).delete(COOKIE);
}

export async function readSessionPayload(): Promise<SessionPayload | null> {
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return null;
  return verifySession(raw, secret());
}
