"use server";

import { redirect } from "next/navigation";
import { demoSignIn, demoSignUp } from "@/lib/auth/mock";
import { isAppRole, ROLE_HOME } from "@/lib/roles";
import { safeNextPath } from "@/lib/auth/safe-next-path";

const GENERIC_ERROR = "Sign-in failed. Check your email and password and try again.";
const SIGN_UP_ERROR = "Sign-up failed. Check your details and try again.";

export async function signInAction(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const next = formData.get("next");

  let result: Awaited<ReturnType<typeof demoSignIn>>;
  try {
    result = await demoSignIn(email, password);
  } catch (error) {
    console.error("[auth-debug] signInAction exception", {
      reason: "demo-signin-throw",
      email: email.trim().toLowerCase(),
      provider: process.env.AUTH_PROVIDER ?? "mock",
      nodeEnv: process.env.NODE_ENV ?? "unknown",
      hasDemoAuthPassword: Boolean(process.env.DEMO_AUTH_PASSWORD),
      error: error instanceof Error ? error.message : String(error),
    });
    const params = new URLSearchParams({ error: GENERIC_ERROR });
    if (typeof next === "string" && next.length > 0) params.set("next", next);
    redirect(`/login?${params.toString()}`);
  }

  if (!result.ok) {
    const params = new URLSearchParams({ error: GENERIC_ERROR });
    if (typeof next === "string" && next.length > 0) params.set("next", next);
    redirect(`/login?${params.toString()}`);
  }

  const fallback = ROLE_HOME[result.user.role];
  redirect(safeNextPath(next, fallback));
}

export async function signUpAction(formData: FormData): Promise<void> {
  const name = String(formData.get("name") ?? "");
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const next = formData.get("next");

  let result: Awaited<ReturnType<typeof demoSignUp>>;
  try {
    result = await demoSignUp(name, email, password);
  } catch (error) {
    console.error("[auth-debug] signUpAction exception", {
      reason: "demo-signup-throw",
      email: email.trim().toLowerCase(),
      nameLength: name.trim().length,
      provider: process.env.AUTH_PROVIDER ?? "mock",
      nodeEnv: process.env.NODE_ENV ?? "unknown",
      hasDemoAuthPassword: Boolean(process.env.DEMO_AUTH_PASSWORD),
      error: error instanceof Error ? error.message : String(error),
    });
    const params = new URLSearchParams({ error: SIGN_UP_ERROR });
    if (typeof next === "string" && next.length > 0) params.set("next", next);
    redirect(`/login?${params.toString()}`);
  }

  if (!result.ok) {
    const params = new URLSearchParams({ error: SIGN_UP_ERROR });
    if (typeof next === "string" && next.length > 0) params.set("next", next);
    redirect(`/login?${params.toString()}`);
  }

  if (!isAppRole(result.user.role)) {
    redirect(`/login?${new URLSearchParams({ error: SIGN_UP_ERROR }).toString()}`);
  }
  const fallback = ROLE_HOME[result.user.role];
  redirect(safeNextPath(next, fallback));
}
