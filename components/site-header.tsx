import Link from "next/link";
import Image from "next/image";
import type { CSSProperties } from "react";
import { logoutAction } from "@/app/auth/actions";
import { getSession } from "@/lib/auth";

const HEADER_HEIGHT_PX = 56;

export async function SiteHeader() {
  const session = await getSession();
  const user = session.user;

  return (
    <header
      className="sticky top-0 z-30 border-b border-[var(--brand-primary-hover)] bg-[var(--brand-primary)] text-[var(--brand-primary-foreground)] backdrop-blur"
      style={
        {
          "--site-header-h": `${HEADER_HEIGHT_PX}px`,
          height: `${HEADER_HEIGHT_PX}px`,
        } as CSSProperties
      }
    >
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between gap-3 px-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-semibold tracking-tight transition-opacity hover:opacity-90"
        >
          <Image
            src="https://sdgpxydkqdthgolfmpei.supabase.co/storage/v1/object/public/website-assets/logo.webp"
            alt=""
            width={32}
            height={32}
            priority
          />
          <span data-testid="site-brand">MC Seanlibee</span>
        </Link>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          {user ? (
            <>
              <span className="text-white/80">{user.email}</span>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="cursor-pointer text-white transition-colors hover:text-white/80 hover:underline"
                >
                  Logout
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                className="text-white transition-colors hover:text-white/80 hover:underline"
                href="/auth/login"
              >
                Login
              </Link>
              <Link
                className="text-white transition-colors hover:text-white/80 hover:underline"
                href="/auth/signup"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
