import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="text-sm font-semibold tracking-tight">
          MC Food MVP
        </Link>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <Link className="text-zinc-700 hover:underline dark:text-zinc-200" href="/customer">
            Customer
          </Link>
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
