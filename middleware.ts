import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createSupabaseMiddlewareClient } from "@/lib/supabase/middleware";

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
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "921114" },
    body: JSON.stringify({
      sessionId: "921114",
      runId: "pre-fix",
      hypothesisId: "H2",
      location: "middleware.ts:15",
      message: "Middleware entry",
      data: {
        pathname: req.nextUrl.pathname,
        protectedPath: isProtectedPath(req.nextUrl.pathname),
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion
  if (!isProtectedPath(req.nextUrl.pathname)) return NextResponse.next();

  const { supabase, getResponse, setResponse } = createSupabaseMiddlewareClient(req);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    url.searchParams.set("next", `${req.nextUrl.pathname}${req.nextUrl.search}`);
    const res = NextResponse.redirect(url);
    setResponse(res);
    return getResponse();
  }

  return getResponse();
}

export const config = {
  matcher: ["/customer/:path*", "/kitchen/:path*", "/driver/:path*", "/admin/:path*"],
};
