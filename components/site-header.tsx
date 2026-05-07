import Link from "next/link";
import { logoutAction } from "@/app/auth/actions";
import { getSession } from "@/lib/auth";

const HEADER_HEIGHT_PX = 56;

export async function SiteHeader() {
  const session = await getSession();
  const user = session.user;

  return (
    <header
      className="sticky top-0 z-30 border-b border-zinc-200 bg-white/90 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90"
      style={
        {
          "--site-header-h": `${HEADER_HEIGHT_PX}px`,
          height: `${HEADER_HEIGHT_PX}px`,
        } as React.CSSProperties
      }
    >
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between gap-3 px-4">
        <Link href="/" className="text-sm font-semibold tracking-tight">
          MC Food MVP
        </Link>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <Link className="text-zinc-700 hover:underline dark:text-zinc-200" href="/customer">
            Customer
          </Link>
          {user ? (
            <>
              <span className="text-zinc-700 dark:text-zinc-200">{user.email}</span>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="cursor-pointer text-zinc-700 hover:underline dark:text-zinc-200"
                >
                  Logout
                </button>
              </form>
            </>
          ) : (
            <>
              <Link className="text-zinc-700 hover:underline dark:text-zinc-200" href="/auth/login">
                Login
              </Link>
              <Link className="text-zinc-700 hover:underline dark:text-zinc-200" href="/auth/signup">
                Sign up
              </Link>
            </>
          )}
          {process.env.NODE_ENV !== "production" ? (
            <>
              <Link className="text-zinc-700 hover:underline dark:text-zinc-200" href="/dev/role-switcher">
                Dev roles
              </Link>
              <Link className="text-zinc-700 hover:underline dark:text-zinc-200" href="/dev/multi-role">
                Multi-role demo
              </Link>
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}
