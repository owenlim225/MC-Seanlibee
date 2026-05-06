import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";
export { getAuthProviderName } from "@/lib/auth/provider";

export type Session = {
  user: { id: string; role: Role; email: string; name: string } | null;
};

export type SessionLite = {
  user: { id: string; role: Role } | null;
};

/**
 * Full session: hits the DB to read fresh email/name and verify role hasn't
 * changed. Use for layouts/pages that render user-identifying fields.
 */
export async function getSession(): Promise<Session> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) return { user: null };
  const user = await prisma.user.findUnique({
    where: { authUserId: authUser.id },
    select: { id: true, role: true, email: true, name: true },
  });
  if (!user) return { user: null };
  return { user };
}

/**
 * Cookie-only session: trusts the signed payload (already verified by
 * `verifySession`). No DB roundtrip — use for hot read paths that only need
 * `id` and `role`. Middleware re-validates on every request.
 */
export async function getSessionLite(): Promise<SessionLite> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) return { user: null };
  const user = await prisma.user.findUnique({
    where: { authUserId: authUser.id },
    select: { id: true, role: true },
  });
  if (!user) return { user: null };
  return { user: { id: user.id, role: user.role } };
}

function loginRedirect(): never {
  redirect("/login");
}

export async function requireRole(role: Role): Promise<NonNullable<Session["user"]>> {
  const session = await getSession();
  if (!session.user) loginRedirect();
  if (session.user.role !== role) loginRedirect();
  return session.user;
}

/**
 * Like `requireRole` but skips the DB lookup. Returns only `{ id, role }` —
 * use when the page does not need email/name from the user record.
 */
export async function requireRoleLite(role: Role): Promise<NonNullable<SessionLite["user"]>> {
  const session = await getSessionLite();
  if (!session.user) loginRedirect();
  if (session.user.role !== role) loginRedirect();
  return session.user;
}

export { devSignInAs, clearSession } from "@/lib/auth/mock";
