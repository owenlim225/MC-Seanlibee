import Link from "next/link";
import type { CSSProperties } from "react";
import { logoutAction } from "@/app/auth/actions";
import { getSession } from "@/lib/auth";

const HEADER_HEIGHT_PX = 56;

export async function SiteHeader() {
  const session = await getSession();
  const user = session.user;

  return (
    <header
      className="sticky top-0 z-30 border-b border-[var(--border-default)] bg-[var(--surface-base)] backdrop-blur"
      style={
        {
          "--site-header-h": `${HEADER_HEIGHT_PX}px`,
          height: `${HEADER_HEIGHT_PX}px`,
        } as CSSProperties
      }
    >
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between gap-3 px-4">
        <Link href="/" className="text-sm font-semibold tracking-tight transition-colors hover:text-[var(--brand-primary)]">
          MC Seanlibee
        </Link>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          {/* Customer tab removed per updated navigation spec */}
          {user ? (
            <>
              <span className="text-[var(--text-muted)]">{user.email}</span>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="cursor-pointer text-[var(--text-primary)] transition-colors hover:text-[var(--brand-primary)] hover:underline"
                >
                  Logout
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                className="text-[var(--text-primary)] transition-colors hover:text-[var(--brand-primary)] hover:underline"
                href="/auth/login"
              >
                Login
              </Link>
              <Link
                className="text-[var(--text-primary)] transition-colors hover:text-[var(--brand-primary)] hover:underline"
                href="/auth/signup"
              >
                Sign up
              </Link>
            </>
          )}
          {process.env.NODE_ENV !== "production" ? (
            <>
              <Link
                className="text-[var(--text-muted)] transition-colors hover:text-[var(--brand-primary)] hover:underline"
                href="/dev/role-switcher"
              >
                Dev roles
              </Link>
              <Link
                className="text-[var(--text-muted)] transition-colors hover:text-[var(--brand-primary)] hover:underline"
                href="/dev/multi-role"
              >
                Multi-role demo
              </Link>
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}
