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
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "837d50" },
    body: JSON.stringify({
      sessionId: "837d50",
      runId: "pre-fix",
      hypothesisId: "H1",
      location: "lib/auth/index.ts:getSession:entry",
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
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "837d50" },
    body: JSON.stringify({
      sessionId: "837d50",
      runId: "pre-fix",
      hypothesisId: "H2",
      location: "lib/auth/index.ts:getSession:payload",
      message: "session payload resolved",
      data: { hasPayload: Boolean(payload), uid: payload?.uid ?? null },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion
  if (!payload) return { user: null };
  const dbQueryStartedAt = Date.now();
  // #region agent log
  fetch("http://127.0.0.1:7817/ingest/c3fc8591-bb49-4618-b7bd-5aef2b04dae3", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "837d50" },
    body: JSON.stringify({
      sessionId: "837d50",
      runId: "pre-fix",
      hypothesisId: "H3",
      location: "lib/auth/index.ts:getSession:db-before",
      message: "starting prisma.user.findUnique",
      data: { uid: payload.uid },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion
  let user;
  try {
    user = await prisma.user.findUnique({
      where: { id: payload.uid },
      select: { id: true, role: true, email: true, name: true, isActive: true, deletedAt: true },
    });
  } catch (error) {
    // #region agent log
    fetch("http://127.0.0.1:7817/ingest/c3fc8591-bb49-4618-b7bd-5aef2b04dae3", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "837d50" },
      body: JSON.stringify({
        sessionId: "837d50",
        runId: "pre-fix",
        hypothesisId: "H3",
        location: "lib/auth/index.ts:getSession:db-error",
        message: "prisma.user.findUnique failed",
        data: {
          uid: payload.uid,
          durationMs: Date.now() - dbQueryStartedAt,
          errorName: error instanceof Error ? error.name : "UnknownError",
          errorMessage: error instanceof Error ? error.message : String(error),
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
    throw error;
  }
  // #region agent log
  fetch("http://127.0.0.1:7817/ingest/c3fc8591-bb49-4618-b7bd-5aef2b04dae3", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "837d50" },
    body: JSON.stringify({
      sessionId: "837d50",
      runId: "pre-fix",
      hypothesisId: "H3",
      location: "lib/auth/index.ts:getSession:db-after",
      message: "prisma.user.findUnique completed",
      data: { uid: payload.uid, durationMs: Date.now() - dbQueryStartedAt, foundUser: Boolean(user) },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion
  if (!user) return { user: null };
  if (!user.isActive || user.deletedAt) return { user: null };
  return { user };
}

/**
 * Light session read: verifies signed cookie payload, then checks the current
 * user state in DB and returns only `{ id, role }`.
 */
export async function getSessionLite(): Promise<SessionLite> {
  const payload = await readSessionPayload();
  if (!payload) return { user: null };
  const user = await prisma.user.findUnique({
    where: { id: payload.uid },
    select: { id: true, role: true, isActive: true, deletedAt: true },
  });
  if (!user) return { user: null };
  if (!user.isActive || user.deletedAt) return { user: null };
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
