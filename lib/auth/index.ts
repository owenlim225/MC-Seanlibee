import { Role } from "@prisma/client";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { readSessionPayload } from "@/lib/auth/mock";
export { getAuthProviderName } from "@/lib/auth/provider";

export type Session = {
  user: { id: string; role: Role; email: string; name: string } | null;
};

export type SessionLite = {
  user: { id: string; role: Role } | null;
};

const SESSION_COOKIE = "mc_session";

/**
 * Full session: hits the DB to read fresh email/name and verify role hasn't
 * changed. Use for layouts/pages that render user-identifying fields.
 */
export async function getSession(): Promise<Session> {
  const payload = await readSessionPayload();
  if (!payload) return { user: null };
  const user = await prisma.user.findUnique({
    where: { id: payload.uid },
    select: { id: true, role: true, email: true, name: true, isActive: true, deletedAt: true },
  });
  if (!user) return { user: null };
  if (!user.isActive || user.deletedAt) {
    (await cookies()).delete(SESSION_COOKIE);
    return { user: null };
  }
  return { user };
}

/**
 * Cookie-only session: trusts the signed payload (already verified by
 * `verifySession`). No DB roundtrip — use for hot read paths that only need
 * `id` and `role`. Middleware re-validates on every request.
 */
export async function getSessionLite(): Promise<SessionLite> {
  const payload = await readSessionPayload();
  if (!payload) return { user: null };
  const user = await prisma.user.findUnique({
    where: { id: payload.uid },
    select: { id: true, role: true, isActive: true, deletedAt: true },
  });
  if (!user) return { user: null };
  if (!user.isActive || user.deletedAt) {
    (await cookies()).delete(SESSION_COOKIE);
    return { user: null };
  }
  return { user: { id: user.id, role: user.role } };
}

function loginRedirect(): never {
  redirect("/auth/login");
}

function deniedRedirect(): never {
  redirect("/auth/login?denied=1");
}

export async function requireRole(role: Role): Promise<NonNullable<Session["user"]>> {
  const session = await getSession();
  if (!session.user) loginRedirect();
  if (session.user.role !== role) deniedRedirect();
  return session.user;
}

/**
 * Like `requireRole` but skips the DB lookup. Returns only `{ id, role }` —
 * use when the page does not need email/name from the user record.
 */
export async function requireRoleLite(role: Role): Promise<NonNullable<SessionLite["user"]>> {
  const session = await getSessionLite();
  if (!session.user) loginRedirect();
  if (session.user.role !== role) deniedRedirect();
  return session.user;
}

export { devSignInAs, clearSession } from "@/lib/auth/mock";
