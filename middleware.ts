import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { verifySession } from "@/lib/auth/cookie";
import { getSessionSecret } from "@/lib/auth/session-secret";

const SESSION_COOKIE = "mc_session";

function isProtectedPath(pathname: string): boolean {
  return (
    pathname.startsWith("/customer") ||
    pathname.startsWith("/kitchen") ||
    pathname.startsWith("/driver") ||
    pathname.startsWith("/admin")
  );
}

export async function middleware(req: NextRequest) {
  // #region agent log
  fetch("http://127.0.0.1:7817/ingest/c3fc8591-bb49-4618-b7bd-5aef2b04dae3", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "a6cb1e" },
    body: JSON.stringify({
      sessionId: "a6cb1e",
      runId: "initial",
      hypothesisId: "H1",
      location: "middleware.ts:18",
      message: "middleware entry",
      data: { pathname: req.nextUrl.pathname, search: req.nextUrl.search },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion
  if (!isProtectedPath(req.nextUrl.pathname)) return NextResponse.next();

  const raw = req.cookies.get(SESSION_COOKIE)?.value;
  // #region agent log
  fetch("http://127.0.0.1:7817/ingest/c3fc8591-bb49-4618-b7bd-5aef2b04dae3", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "a6cb1e" },
    body: JSON.stringify({
      sessionId: "a6cb1e",
      runId: "initial",
      hypothesisId: "H2",
      location: "middleware.ts:21",
      message: "cookie presence",
      data: { hasRawCookie: Boolean(raw) },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion
  const payload = raw ? await verifySession(raw, getSessionSecret()) : null;

  if (!payload) {
    // #region agent log
    fetch("http://127.0.0.1:7817/ingest/c3fc8591-bb49-4618-b7bd-5aef2b04dae3", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "a6cb1e" },
      body: JSON.stringify({
        sessionId: "a6cb1e",
        runId: "initial",
        hypothesisId: "H3",
        location: "middleware.ts:27",
        message: "middleware redirect auth login",
        data: { pathname: req.nextUrl.pathname },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
    const url = req.nextUrl.clone();
    url.pathname = "/auth/login";
    url.search = "";
    url.searchParams.set("next", `${req.nextUrl.pathname}${req.nextUrl.search}`);
    return NextResponse.redirect(url);
  }

  // #region agent log
  fetch("http://127.0.0.1:7817/ingest/c3fc8591-bb49-4618-b7bd-5aef2b04dae3", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "a6cb1e" },
    body: JSON.stringify({
      sessionId: "a6cb1e",
      runId: "initial",
      hypothesisId: "H4",
      location: "middleware.ts:41",
      message: "middleware pass through",
      data: { pathname: req.nextUrl.pathname, role: payload.role, uidPrefix: payload.uid.slice(0, 8) },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion
  return NextResponse.next();
}

export const config = {
  matcher: ["/customer/:path*", "/kitchen/:path*", "/driver/:path*", "/admin/:path*"],
};
