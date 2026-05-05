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
  // #region agent log
  fetch("http://127.0.0.1:7817/ingest/c3fc8591-bb49-4618-b7bd-5aef2b04dae3", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "c61c98" },
    body: JSON.stringify({
      sessionId: "c61c98",
      runId: "pre-fix",
      hypothesisId: "A1",
      location: "lib/auth/mock.ts:57",
      message: "demoSignIn invoked",
      data: { emailDomain: typeof email === "string" && email.includes("@") ? email.split("@")[1] : null },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion
  if (!isDemoAuthEnabled()) return { ok: false };
  if (typeof email !== "string" || typeof password !== "string") return { ok: false };
  const passwordOk = await checkDemoPassword(password);
  // #region agent log
  fetch("http://127.0.0.1:7817/ingest/c3fc8591-bb49-4618-b7bd-5aef2b04dae3", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "c61c98" },
    body: JSON.stringify({
      sessionId: "c61c98",
      runId: "pre-fix",
      hypothesisId: "A2",
      location: "lib/auth/mock.ts:63",
      message: "demo password validation result",
      data: { passwordOk },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion
  if (!passwordOk) return { ok: false };

  try {
    const probe = await prisma.$queryRaw<
      {
        db: string | null;
        schema: string | null;
        searchPath: string | null;
        userTable: string | null;
        menuCategoryTable: string | null;
      }[]
    >`SELECT current_database() AS db, current_schema() AS schema, current_setting('search_path') AS "searchPath", to_regclass('public."User"') AS "userTable", to_regclass('public."MenuCategory"') AS "menuCategoryTable"`;
    // #region agent log
    fetch("http://127.0.0.1:7817/ingest/c3fc8591-bb49-4618-b7bd-5aef2b04dae3", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "c61c98" },
      body: JSON.stringify({
        sessionId: "c61c98",
        runId: "pre-fix",
        hypothesisId: "A3",
        location: "lib/auth/mock.ts:84",
        message: "database table probe from demoSignIn",
        data: probe[0] ?? null,
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
  } catch (error) {
    // #region agent log
    fetch("http://127.0.0.1:7817/ingest/c3fc8591-bb49-4618-b7bd-5aef2b04dae3", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "c61c98" },
      body: JSON.stringify({
        sessionId: "c61c98",
        runId: "pre-fix",
        hypothesisId: "A3",
        location: "lib/auth/mock.ts:99",
        message: "database table probe failed",
        data: {
          errorName: error instanceof Error ? error.name : typeof error,
          errorMessage: error instanceof Error ? error.message : String(error),
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
  }

  const normalizedEmail = email.trim().toLowerCase();
  // #region agent log
  fetch("http://127.0.0.1:7817/ingest/c3fc8591-bb49-4618-b7bd-5aef2b04dae3", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "c61c98" },
    body: JSON.stringify({
      sessionId: "c61c98",
      runId: "pre-fix",
      hypothesisId: "A4",
      location: "lib/auth/mock.ts:112",
      message: "about to query user by normalized email",
      data: { normalizedEmail },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion
  let user: { id: string; role: Role; email: string; name: string } | null = null;
  try {
    user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, role: true, email: true, name: true },
    });
  } catch (error) {
    // #region agent log
    fetch("http://127.0.0.1:7817/ingest/c3fc8591-bb49-4618-b7bd-5aef2b04dae3", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "c61c98" },
      body: JSON.stringify({
        sessionId: "c61c98",
        runId: "pre-fix",
        hypothesisId: "A5",
        location: "lib/auth/mock.ts:127",
        message: "user findUnique failed",
        data: {
          errorName: error instanceof Error ? error.name : typeof error,
          errorMessage: error instanceof Error ? error.message : String(error),
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
    throw error;
  }
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
