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

export async function signInAction(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const next = formData.get("next");

  try {
    const supabase = await createSupabaseServerClient();
    const normalizedEmail = email.trim().toLowerCase();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (error || !data.user) {
      if (AUTH_DEBUG_ENABLED) console.warn("[auth-debug]", {
        flow: "sign-in",
        outcome: "fail",
        reason: "supabase-signin-failed",
        email: normalizedEmail,
        error: error ? { message: error.message, status: error.status, name: error.name } : null,
        at: new Date().toISOString(),
      });
      const params = new URLSearchParams({ error: GENERIC_ERROR });
      if (typeof next === "string" && next.length > 0) params.set("next", next);
      redirect(`/login?${params.toString()}`);
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
        if (AUTH_DEBUG_ENABLED) console.info("[auth-debug]", {
          flow: "sign-in",
          outcome: "success",
          reason: "linked-auth-user-id",
          email: normalizedEmail,
          userId: appUser.id,
          role: appUser.role,
          at: new Date().toISOString(),
        });
      } else {
        if (AUTH_DEBUG_ENABLED) console.warn("[auth-debug]", {
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
        redirect(`/login?${params.toString()}`);
      }
    }

    if (!isAppRole(appUser.role)) {
      if (AUTH_DEBUG_ENABLED) console.warn("[auth-debug]", {
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
      redirect(`/login?${params.toString()}`);
    }

    const fallback = ROLE_HOME[appUser.role];
    redirect(safeNextPath(next, fallback));
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error("[auth-debug] signInAction exception", {
      reason: "signin-throw",
      email: email.trim().toLowerCase(),
      nodeEnv: process.env.NODE_ENV ?? "unknown",
      error: error instanceof Error ? error.message : String(error),
    });
    const params = new URLSearchParams({ error: GENERIC_ERROR });
    if (typeof next === "string" && next.length > 0) params.set("next", next);
    redirect(`/login?${params.toString()}`);
  }
}

export async function signUpAction(formData: FormData): Promise<void> {
  const name = String(formData.get("name") ?? "");
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const next = formData.get("next");

  try {
    const supabase = await createSupabaseServerClient();
    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedName || !normalizedEmail) {
      const params = new URLSearchParams({ error: SIGN_UP_ERROR });
      if (typeof next === "string" && next.length > 0) params.set("next", next);
      redirect(`/login?${params.toString()}`);
    }

    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    });
    if (existing) {
      const params = new URLSearchParams({ error: SIGN_UP_ERROR });
      if (typeof next === "string" && next.length > 0) params.set("next", next);
      redirect(`/login?${params.toString()}`);
    }

    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
    });

    if (error || !data.user) {
      if (AUTH_DEBUG_ENABLED) console.warn("[auth-debug]", {
        flow: "sign-up",
        outcome: "fail",
        reason: "supabase-signup-failed",
        email: normalizedEmail,
        error: error ? { message: error.message, status: error.status, name: error.name } : null,
        at: new Date().toISOString(),
      });
      const params = new URLSearchParams({ error: SIGN_UP_ERROR });
      if (typeof next === "string" && next.length > 0) params.set("next", next);
      redirect(`/login?${params.toString()}`);
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
        if (AUTH_DEBUG_ENABLED) console.warn("[auth-debug]", {
          flow: "sign-up",
          outcome: "fail",
          reason: "prisma-unique-constraint",
          email: normalizedEmail,
          authUserId,
          at: new Date().toISOString(),
        });
        const params = new URLSearchParams({ error: SIGN_UP_ERROR });
        if (typeof next === "string" && next.length > 0) params.set("next", next);
        redirect(`/login?${params.toString()}`);
      }
      throw dbError;
    }

    const fallback = ROLE_HOME[created.role];
    redirect(safeNextPath(next, fallback));
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error("[auth-debug] signUpAction exception", {
      reason: "signup-throw",
      email: email.trim().toLowerCase(),
      nameLength: name.trim().length,
      nodeEnv: process.env.NODE_ENV ?? "unknown",
      error: error instanceof Error ? error.message : String(error),
    });
    const params = new URLSearchParams({ error: SIGN_UP_ERROR });
    if (typeof next === "string" && next.length > 0) params.set("next", next);
    redirect(`/login?${params.toString()}`);
  }
}
