import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSupabaseMiddlewareClient } from "@/lib/supabase/middleware";
import type { AppRole } from "@/lib/roles";

function requiredRoleForPath(pathname: string): AppRole | null {
  if (pathname.startsWith("/customer")) return "CUSTOMER";
  if (pathname.startsWith("/kitchen")) return "KITCHEN";
  if (pathname.startsWith("/driver")) return "DRIVER";
  if (pathname.startsWith("/admin")) return "ADMIN";
  return null;
}

export async function middleware(req: NextRequest) {
  const roleNeeded = requiredRoleForPath(req.nextUrl.pathname);
  if (!roleNeeded) return NextResponse.next();

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

  const appUser = await prisma.user.findUnique({
    where: { authUserId: user.id },
    select: { role: true },
  });

  if (!appUser || appUser.role !== roleNeeded) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    url.searchParams.set("denied", "1");
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
