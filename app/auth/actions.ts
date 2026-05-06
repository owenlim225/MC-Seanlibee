"use server";

import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { isAppRole, ROLE_HOME } from "@/lib/roles";
import { safeNextPath } from "@/lib/auth/safe-next-path";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { Role } from "@prisma/client";

const GENERIC_ERROR = "Sign-in failed. Check your email and password and try again.";
const SIGN_UP_ERROR = "Sign-up failed. Check your details and try again.";
const AUTH_DEBUG_ENABLED = process.env.NODE_ENV !== "production";

function agentDebugLog(...args: unknown[]): void {
  void args;
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
    const supabase = await createSupabaseServerClient();
    const normalizedEmail = email.trim().toLowerCase();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });
    agentDebugLog("H5", "app/auth/actions.ts:59", "signInWithPassword result", {
      hasUser: Boolean(data.user),
      errorName: error?.name ?? null,
      errorStatus: error?.status ?? null,
      errorMessage: error?.message ?? null,
    });

    if (error || !data.user) {
      if (AUTH_DEBUG_ENABLED)
        console.warn("[auth-debug]", {
          flow: "sign-in",
          outcome: "fail",
          reason: "supabase-signin-failed",
          email: normalizedEmail,
          error: error ? { message: error.message, status: error.status, name: error.name } : null,
          at: new Date().toISOString(),
        });
      const params = new URLSearchParams({ error: GENERIC_ERROR });
      if (typeof next === "string" && next.length > 0) params.set("next", next);
      redirect(`/auth/login?${params.toString()}`);
    }

    const authUserId = data.user.id;
    let appUser = await prisma.user.findUnique({
      where: { authUserId },
      select: { id: true, role: true },
    });

    if (!appUser) {
      const byEmail = await prisma.user.findUnique({
        where: { email: normalizedEmail },
        select: { id: true, role: true, authUserId: true },
      });

      if (byEmail && !byEmail.authUserId) {
        appUser = await prisma.user.update({
          where: { id: byEmail.id },
          data: { authUserId },
          select: { id: true, role: true },
        });
        if (AUTH_DEBUG_ENABLED)
          console.info("[auth-debug]", {
            flow: "sign-in",
            outcome: "success",
            reason: "linked-auth-user-id",
            email: normalizedEmail,
            userId: appUser.id,
            role: appUser.role,
            at: new Date().toISOString(),
          });
      } else {
        if (AUTH_DEBUG_ENABLED)
          console.warn("[auth-debug]", {
            flow: "sign-in",
            outcome: "fail",
            reason: "no-app-user-for-auth-user",
            email: normalizedEmail,
            authUserId,
            at: new Date().toISOString(),
          });
        await supabase.auth.signOut();
        const params = new URLSearchParams({ error: GENERIC_ERROR });
        if (typeof next === "string" && next.length > 0) params.set("next", next);
        redirect(`/auth/login?${params.toString()}`);
      }
    }

    if (!isAppRole(appUser.role)) {
      if (AUTH_DEBUG_ENABLED)
        console.warn("[auth-debug]", {
          flow: "sign-in",
          outcome: "fail",
          reason: "invalid-app-role",
          email: normalizedEmail,
          userId: appUser.id,
          role: appUser.role,
          at: new Date().toISOString(),
        });
      await supabase.auth.signOut();
      const params = new URLSearchParams({ error: GENERIC_ERROR });
      if (typeof next === "string" && next.length > 0) params.set("next", next);
      redirect(`/auth/login?${params.toString()}`);
    }

    const fallback = ROLE_HOME[appUser.role];
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
    const supabase = await createSupabaseServerClient();
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

    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
    });
    agentDebugLog("H5", "app/auth/actions.ts:195", "signUp result", {
      hasUser: Boolean(data.user),
      errorName: error?.name ?? null,
      errorStatus: error?.status ?? null,
      errorMessage: error?.message ?? null,
    });

    if (error || !data.user) {
      if (AUTH_DEBUG_ENABLED)
        console.warn("[auth-debug]", {
          flow: "sign-up",
          outcome: "fail",
          reason: "supabase-signup-failed",
          email: normalizedEmail,
          error: error ? { message: error.message, status: error.status, name: error.name } : null,
          at: new Date().toISOString(),
        });
      const params = new URLSearchParams({ error: SIGN_UP_ERROR });
      if (typeof next === "string" && next.length > 0) params.set("next", next);
      redirect(`/auth/signup?${params.toString()}`);
    }

    const authUserId = data.user.id;
    let created;
    try {
      created = await prisma.user.create({
        data: {
          authUserId,
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
            authUserId,
            at: new Date().toISOString(),
          });
        const params = new URLSearchParams({ error: SIGN_UP_ERROR });
        if (typeof next === "string" && next.length > 0) params.set("next", next);
        await supabase.auth.signOut();
        redirect(`/auth/signup?${params.toString()}`);
      }
      throw dbError;
    }

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
