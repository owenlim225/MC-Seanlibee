import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { verifySession } from "@/lib/auth/cookie";
import type { AppRole } from "@/lib/roles";

function sessionSecret(): string {
  return process.env.SESSION_SECRET ?? "dev-only-change-me-dev-only-change-me";
}

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

  const token = req.cookies.get("mc_session")?.value;
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/dev/role-switcher";
    url.searchParams.set("next", `${req.nextUrl.pathname}${req.nextUrl.search}`);
    return NextResponse.redirect(url);
  }

  const payload = await verifySession(token, sessionSecret());
  if (!payload || payload.role !== roleNeeded) {
    const url = req.nextUrl.clone();
    url.pathname = "/dev/role-switcher";
    url.searchParams.set("denied", "1");
    url.searchParams.set("next", `${req.nextUrl.pathname}${req.nextUrl.search}`);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/customer/:path*", "/kitchen/:path*", "/driver/:path*", "/admin/:path*"],
};
