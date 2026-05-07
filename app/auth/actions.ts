"use server";

import { timingSafeEqual } from "node:crypto";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { cookies } from "next/headers";
import { clearSession } from "@/lib/auth";
import { isAppRole, ROLE_HOME } from "@/lib/roles";
import type { AppRole } from "@/lib/roles";
import { safeNextPath } from "@/lib/auth/safe-next-path";
import { signSession } from "@/lib/auth/cookie";
import { hashPassword, isPasswordHash, verifyPassword } from "@/lib/auth/password";
import { getSessionSecret } from "@/lib/auth/session-secret";
import { prisma } from "@/lib/prisma";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { Role } from "@prisma/client";

const GENERIC_ERROR = "Sign-in failed. Check your email and password and try again.";
const SIGN_UP_ERROR = "Sign-up failed. Check your details and try again.";
const AUTH_DEBUG_ENABLED = process.env.NODE_ENV !== "production";
const SESSION_COOKIE = "mc_session";
const SESSION_TTL_MS = 60 * 60 * 24 * 7 * 1000;
const MIN_PASSWORD_LENGTH = 8;

function agentDebugLog(...args: unknown[]): void {
  void args;
}

function timingSafeStringEqual(a: string, b: string): boolean {
  const left = Buffer.from(a, "utf8");
  const right = Buffer.from(b, "utf8");
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

async function writeSessionCookie(userId: string, role: AppRole): Promise<void> {
  const token = await signSession(
    {
      uid: userId,
      role,
      exp: Date.now() + SESSION_TTL_MS,
    },
    getSessionSecret(),
  );
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
    secure: process.env.NODE_ENV === "production",
  });
}

export async function signInAction(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const next = formData.get("next");
  agentDebugLog("H4", "app/auth/actions.ts:42", "signInAction entry", {
    hasEmail: email.trim().length > 0,
    passwordLength: password.length,
    hasNext: typeof next === "string" && next.length > 0,
    nodeEnv: process.env.NODE_ENV ?? null,
  });

  try {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) {
      const params = new URLSearchParams({ error: GENERIC_ERROR });
      if (typeof next === "string" && next.length > 0) params.set("next", next);
      redirect(`/auth/login?${params.toString()}`);
    }

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, role: true, password: true, authUserId: true, isActive: true, deletedAt: true },
    });
    const passwordOk = user
      ? isPasswordHash(user.password)
        ? verifyPassword(password, user.password)
        : timingSafeStringEqual(password, user.password)
      : false;
    agentDebugLog("H5", "app/auth/actions.ts:59", "password verification result", {
      hasUser: Boolean(user),
      passwordMatched: passwordOk,
    });

    if (!user || !passwordOk || !user.isActive || user.deletedAt) {
      if (AUTH_DEBUG_ENABLED)
        console.warn("[auth-debug]", {
          flow: "sign-in",
          outcome: "fail",
          reason: !user || !passwordOk ? "credentials-invalid" : "inactive-user",
          email: normalizedEmail,
          userId: user?.id,
          at: new Date().toISOString(),
        });
      const params = new URLSearchParams({ error: GENERIC_ERROR });
      if (typeof next === "string" && next.length > 0) params.set("next", next);
      redirect(`/auth/login?${params.toString()}`);
    }

    if (!user.authUserId) {
      await prisma.user.update({
        where: { id: user.id },
        data: { authUserId: user.id },
      });
    }

    if (!isAppRole(user.role)) {
      if (AUTH_DEBUG_ENABLED)
        console.warn("[auth-debug]", {
          flow: "sign-in",
          outcome: "fail",
          reason: "invalid-app-role",
          email: normalizedEmail,
          userId: user.id,
          role: user.role,
          at: new Date().toISOString(),
        });
      const params = new URLSearchParams({ error: GENERIC_ERROR });
      if (typeof next === "string" && next.length > 0) params.set("next", next);
      redirect(`/auth/login?${params.toString()}`);
    }

    if (!isPasswordHash(user.password)) {
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashPassword(password) },
      });
    }

    await writeSessionCookie(user.id, user.role);

    const fallback = ROLE_HOME[user.role];
    agentDebugLog("H7", "app/auth/actions.ts:138", "signInAction redirect success", {
      fallback,
      safeNextTarget: safeNextPath(next, fallback),
    });
    redirect(safeNextPath(next, fallback));
  } catch (error) {
    if (isRedirectError(error)) throw error;
    agentDebugLog("H6", "app/auth/actions.ts:145", "signInAction exception", {
      errorName: error instanceof Error ? error.name : "non-error",
      errorMessage: error instanceof Error ? error.message : String(error),
    });
    if (AUTH_DEBUG_ENABLED)
      console.error("[auth-debug] signInAction exception", {
        reason: "signin-throw",
        email: email.trim().toLowerCase(),
        nodeEnv: process.env.NODE_ENV ?? "unknown",
        error: error instanceof Error ? error.message : String(error),
      });
    const params = new URLSearchParams({ error: GENERIC_ERROR });
    if (typeof next === "string" && next.length > 0) params.set("next", next);
    redirect(`/auth/login?${params.toString()}`);
  }
}

export async function signUpAction(formData: FormData): Promise<void> {
  const name = String(formData.get("name") ?? "");
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const next = formData.get("next");
  agentDebugLog("H4", "app/auth/actions.ts:166", "signUpAction entry", {
    nameLength: name.trim().length,
    hasEmail: email.trim().length > 0,
    passwordLength: password.length,
    hasNext: typeof next === "string" && next.length > 0,
    nodeEnv: process.env.NODE_ENV ?? null,
  });

  try {
    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedName || !normalizedEmail) {
      const params = new URLSearchParams({ error: SIGN_UP_ERROR });
      if (typeof next === "string" && next.length > 0) params.set("next", next);
      redirect(`/auth/signup?${params.toString()}`);
    }

    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    });
    if (existing) {
      const params = new URLSearchParams({ error: SIGN_UP_ERROR });
      if (typeof next === "string" && next.length > 0) params.set("next", next);
      redirect(`/auth/signup?${params.toString()}`);
    }

    if (!password || password.length < MIN_PASSWORD_LENGTH) {
      const params = new URLSearchParams({ error: SIGN_UP_ERROR });
      if (typeof next === "string" && next.length > 0) params.set("next", next);
      redirect(`/auth/signup?${params.toString()}`);
    }

    const hashedPassword = hashPassword(password);
    let created;
    try {
      created = await prisma.user.create({
        data: {
          password: hashedPassword,
          email: normalizedEmail,
          name: normalizedName,
          role: Role.CUSTOMER,
        },
        select: { id: true, role: true },
      });
    } catch (dbError) {
      if (dbError instanceof PrismaClientKnownRequestError && dbError.code === "P2002") {
        if (AUTH_DEBUG_ENABLED)
          console.warn("[auth-debug]", {
            flow: "sign-up",
            outcome: "fail",
            reason: "prisma-unique-constraint",
            email: normalizedEmail,
            at: new Date().toISOString(),
          });
        const params = new URLSearchParams({ error: SIGN_UP_ERROR });
        if (typeof next === "string" && next.length > 0) params.set("next", next);
        redirect(`/auth/signup?${params.toString()}`);
      }
      throw dbError;
    }

    await prisma.user.update({
      where: { id: created.id },
      data: { authUserId: created.id },
    });

    await writeSessionCookie(created.id, created.role);

    const fallback = ROLE_HOME[created.role];
    agentDebugLog("H7", "app/auth/actions.ts:244", "signUpAction redirect success", {
      fallback,
      safeNextTarget: safeNextPath(next, fallback),
    });
    redirect(safeNextPath(next, fallback));
  } catch (error) {
    if (isRedirectError(error)) throw error;
    agentDebugLog("H6", "app/auth/actions.ts:251", "signUpAction exception", {
      errorName: error instanceof Error ? error.name : "non-error",
      errorMessage: error instanceof Error ? error.message : String(error),
    });
    if (AUTH_DEBUG_ENABLED)
      console.error("[auth-debug] signUpAction exception", {
        reason: "signup-throw",
        email: email.trim().toLowerCase(),
        nameLength: name.trim().length,
        nodeEnv: process.env.NODE_ENV ?? "unknown",
        error: error instanceof Error ? error.message : String(error),
      });
    const params = new URLSearchParams({ error: SIGN_UP_ERROR });
    if (typeof next === "string" && next.length > 0) params.set("next", next);
    redirect(`/auth/signup?${params.toString()}`);
  }
}

export async function logoutAction(): Promise<void> {
  await clearSession();
  redirect("/");
}
