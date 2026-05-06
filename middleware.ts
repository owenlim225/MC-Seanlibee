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

  let supabaseResult:
    | { ok: true; userId: string | null; getResponse: () => NextResponse; setResponse: (r: NextResponse) => void }
    | { ok: false; error: string };
  try {
    const { supabase, getResponse, setResponse } = createSupabaseMiddlewareClient(req);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    supabaseResult = { ok: true, userId: user?.id ?? null, getResponse, setResponse };
  } catch (e) {
    supabaseResult = { ok: false, error: e instanceof Error ? `${e.name}: ${e.message}` : String(e) };
  }

  if (!supabaseResult.ok || !supabaseResult.userId) {
    const url = req.nextUrl.clone();
    url.pathname = "/auth/login";
    url.search = "";
    url.searchParams.set("next", `${req.nextUrl.pathname}${req.nextUrl.search}`);
    const res = NextResponse.redirect(url);
    if (supabaseResult.ok) {
      supabaseResult.setResponse(res);
      return supabaseResult.getResponse();
    }
    return res;
  }

  return supabaseResult.getResponse();
}

export const config = {
  matcher: ["/customer/:path*", "/kitchen/:path*", "/driver/:path*", "/admin/:path*"],
};
