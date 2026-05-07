import Link from "next/link";
import Image from "next/image";
import type { CSSProperties } from "react";
import { Role } from "@prisma/client";
import { ClipboardList, Menu, ShoppingCart } from "lucide-react";
import { logoutAction } from "@/app/auth/actions";
import { getSession } from "@/lib/auth";
import { readCart } from "@/lib/cart-cookie";

const HEADER_HEIGHT_PX = 72;

type HeaderUser = Awaited<ReturnType<typeof getSession>>["user"];

function renderHeaderNavItems(
  user: HeaderUser,
  cartQty: number,
  isMobile: boolean,
  cartBadgeTestId: string,
) {
  const baseLinkClass = isMobile
    ? "inline-flex min-h-11 w-full cursor-pointer items-center gap-2 rounded-md px-3 text-sm text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
    : "inline-flex cursor-pointer items-center gap-1.5 text-white transition-colors hover:text-[var(--text-on-brand-muted)]";

  const secondaryTextClass = isMobile ? "px-3 py-2 text-sm text-[var(--text-on-brand-muted)]" : "text-[var(--text-on-brand-muted)]";

  if (user) {
    return (
      <>
        {user.role === Role.CUSTOMER ? (
          <>
            <Link className={baseLinkClass} href="/customer/orders">
              <ClipboardList className="size-4" aria-hidden="true" />
              <span>Orders</span>
            </Link>
            <Link
              className={baseLinkClass}
              href="/customer/cart"
              aria-label={cartQty > 0 ? `Cart with ${cartQty} items` : "Cart"}
            >
              <ShoppingCart className="size-4" aria-hidden="true" />
              <span>Cart</span>
              {cartQty > 0 ? (
                <span
                  data-testid={cartBadgeTestId}
                  className="inline-flex min-w-5 items-center justify-center rounded-full bg-white px-1.5 py-0.5 text-xs font-semibold text-[var(--brand-primary)]"
                >
                  {cartQty}
                </span>
              ) : null}
            </Link>
          </>
        ) : null}
        <span className={secondaryTextClass}>{user.email}</span>
        <form action={logoutAction} className={isMobile ? "w-full" : undefined}>
          <button
            type="submit"
            className={
              isMobile
                ? "inline-flex min-h-11 w-full cursor-pointer items-center rounded-md px-3 text-sm text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                : "cursor-pointer text-white transition-colors hover:text-[var(--text-on-brand-muted)] hover:underline"
            }
          >
            Logout
          </button>
        </form>
      </>
    );
  }

  return (
    <>
      <Link
        className={
          isMobile
            ? "inline-flex min-h-11 w-full cursor-pointer items-center rounded-md px-3 text-sm text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            : "text-white transition-colors hover:text-[var(--text-on-brand-muted)] hover:underline"
        }
        href="/auth/login"
      >
        Login
      </Link>
      <Link
        className={
          isMobile
            ? "inline-flex min-h-11 w-full cursor-pointer items-center rounded-md px-3 text-sm text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            : "text-white transition-colors hover:text-[var(--text-on-brand-muted)] hover:underline"
        }
        href="/auth/signup"
      >
        Sign up
      </Link>
    </>
  );
}

export async function SiteHeader() {
  const session = await getSession();
  const user = session.user;
  const cart = user?.role === Role.CUSTOMER ? await readCart() : [];
  const cartQty = cart.reduce((total, line) => total + line.qty, 0);

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
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between gap-4 px-4">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-base font-black italic tracking-tight transition-colors hover:text-[var(--text-on-brand-muted)] md:text-lg"
          style={{ fontFamily: '"Baskerville", "Palatino Linotype", "Times New Roman", serif' }}
        >
          <Image
            src="https://sdgpxydkqdthgolfmpei.supabase.co/storage/v1/object/public/website-assets/logo.webp"
            alt=""
            width={32}
            height={32}
            priority
          />
          <span data-testid="site-brand">Mc Seanlibee</span>
        </Link>
        <nav className="hidden items-center gap-4 text-sm md:flex md:gap-5" aria-label="Primary">
          {renderHeaderNavItems(user, cartQty, false, "cart-badge")}
        </nav>
        <details className="group relative md:hidden">
          <summary
            className="inline-flex min-h-11 min-w-11 cursor-pointer list-none items-center justify-center rounded-md text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            aria-label="Toggle navigation menu"
          >
            <Menu className="size-5" aria-hidden="true" />
          </summary>
          <div className="absolute right-0 top-[calc(var(--site-header-h)-1px)] z-40 w-[min(20rem,calc(100vw-2rem))] rounded-b-lg border border-white/20 bg-[var(--brand-primary)] p-2 shadow-lg">
            <nav className="flex flex-col gap-1" aria-label="Mobile primary">
              {renderHeaderNavItems(user, cartQty, true, "cart-badge-mobile")}
            </nav>
          </div>
        </details>
      </div>
    </header>
  );
}
