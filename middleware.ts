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
