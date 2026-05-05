"use server";

import { redirect } from "next/navigation";
import { demoSignIn } from "@/lib/auth/mock";
import { ROLE_HOME } from "@/lib/roles";
import { safeNextPath } from "@/lib/auth/safe-next-path";

const GENERIC_ERROR = "Sign-in failed. Check your email and password and try again.";

export async function signInAction(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const next = formData.get("next");
  // #region agent log
  fetch("http://127.0.0.1:7817/ingest/c3fc8591-bb49-4618-b7bd-5aef2b04dae3", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "268a74" },
    body: JSON.stringify({
      sessionId: "268a74",
      runId: "pre-fix",
      hypothesisId: "H5",
      location: "app/login/actions.ts:14",
      message: "signInAction received form",
      data: {
        emailPresent: email.trim().length > 0,
        passwordPresent: password.length > 0,
        nextPathPresent: typeof next === "string" && next.length > 0,
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  const result = await demoSignIn(email, password);
  // #region agent log
  fetch("http://127.0.0.1:7817/ingest/c3fc8591-bb49-4618-b7bd-5aef2b04dae3", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "268a74" },
    body: JSON.stringify({
      sessionId: "268a74",
      runId: "pre-fix",
      hypothesisId: "H5",
      location: "app/login/actions.ts:31",
      message: "signInAction received demoSignIn result",
      data: { ok: result.ok, role: result.ok ? result.user.role : null },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion
  if (!result.ok) {
    const params = new URLSearchParams({ error: GENERIC_ERROR });
    if (typeof next === "string" && next.length > 0) params.set("next", next);
    redirect(`/login?${params.toString()}`);
  }

  const fallback = ROLE_HOME[result.user.role];
  redirect(safeNextPath(next, fallback));
}
