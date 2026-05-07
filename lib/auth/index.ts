import { Role } from "@prisma/client";
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

/**
 * Full session: hits the DB to read fresh email/name and verify role hasn't
 * changed. Use for layouts/pages that render user-identifying fields.
 */
export async function getSession(): Promise<Session> {
  // #region agent log
  fetch("http://127.0.0.1:7817/ingest/c3fc8591-bb49-4618-b7bd-5aef2b04dae3", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "7690ea" },
    body: JSON.stringify({
      sessionId: "7690ea",
      runId: "pre-fix",
      hypothesisId: "H1",
      location: "lib/auth/index.ts:23",
      message: "getSession entered",
      data: { fn: "getSession" },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion
  const payload = await readSessionPayload();
  // #region agent log
  fetch("http://127.0.0.1:7817/ingest/c3fc8591-bb49-4618-b7bd-5aef2b04dae3", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "7690ea" },
    body: JSON.stringify({
      sessionId: "7690ea",
      runId: "pre-fix",
      hypothesisId: "H2",
      location: "lib/auth/index.ts:38",
      message: "session payload resolved",
      data: { hasPayload: Boolean(payload) },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion
  if (!payload) return { user: null };
  const user = await prisma.user.findUnique({
    where: { id: payload.uid },
    select: { id: true, role: true, email: true, name: true, isActive: true, deletedAt: true },
  });
  if (!user) return { user: null };
  if (!user.isActive || user.deletedAt) {
    // #region agent log
    fetch("http://127.0.0.1:7817/ingest/c3fc8591-bb49-4618-b7bd-5aef2b04dae3", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "ad1060" },
      body: JSON.stringify({
        sessionId: "ad1060",
        runId: "post-fix",
        hypothesisId: "H2",
        location: "lib/auth/index.ts:getSession",
        message: "inactive/deleted user; returning null without mutating cookies",
        data: {
          userId: user.id,
          isActive: user.isActive,
          hasDeletedAt: Boolean(user.deletedAt),
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
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
    // #region agent log
    fetch("http://127.0.0.1:7817/ingest/c3fc8591-bb49-4618-b7bd-5aef2b04dae3", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "ad1060" },
      body: JSON.stringify({
        sessionId: "ad1060",
        runId: "post-fix",
        hypothesisId: "H3",
        location: "lib/auth/index.ts:getSessionLite",
        message: "inactive/deleted user; returning null without mutating cookies",
        data: {
          userId: user.id,
          isActive: user.isActive,
          hasDeletedAt: Boolean(user.deletedAt),
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
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
