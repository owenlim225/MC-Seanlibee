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
  if (!isProtectedPath(req.nextUrl.pathname)) return NextResponse.next();

  const raw = req.cookies.get(SESSION_COOKIE)?.value;
  const payload = raw ? await verifySession(raw, getSessionSecret()) : null;

  if (!payload) {
    const url = req.nextUrl.clone();
    url.pathname = "/auth/login";
    url.search = "";
    url.searchParams.set("next", `${req.nextUrl.pathname}${req.nextUrl.search}`);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/customer/:path*", "/kitchen/:path*", "/driver/:path*", "/admin/:path*"],
};
