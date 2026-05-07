import Link from "next/link";
import Image from "next/image";
import type { CSSProperties } from "react";
import { Role } from "@prisma/client";
import { ClipboardList, ShoppingCart } from "lucide-react";
import { logoutAction } from "@/app/auth/actions";
import { getSession } from "@/lib/auth";
import { readCart } from "@/lib/cart-cookie";

const HEADER_HEIGHT_PX = 72;

export async function SiteHeader() {
  const renderStartedAt = Date.now();
  // #region agent log
  fetch("http://127.0.0.1:7817/ingest/c3fc8591-bb49-4618-b7bd-5aef2b04dae3", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "837d50" },
    body: JSON.stringify({
      sessionId: "837d50",
      runId: "pre-fix",
      hypothesisId: "H4",
      location: "components/site-header.tsx:SiteHeader:entry",
      message: "SiteHeader render started",
      data: { component: "SiteHeader", renderStartedAt },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion
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
          className="flex items-center gap-2.5 text-base font-black italic tracking-tight transition-opacity hover:opacity-90 md:text-lg"
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
        <div className="flex flex-wrap items-center gap-4 text-sm md:gap-5">
          {user ? (
            <>
              {user.role === Role.CUSTOMER ? (
                <>
                  <Link
                    className="inline-flex cursor-pointer items-center gap-1.5 text-white transition-opacity hover:opacity-80"
                    href="/customer/orders"
                    aria-label="Orders"
                  >
                    <ClipboardList className="size-4" aria-hidden="true" />
                    <span>Orders</span>
                  </Link>
                  <Link
                    className="inline-flex cursor-pointer items-center gap-1.5 text-white transition-opacity hover:opacity-80"
                    href="/customer/cart"
                    aria-label={cartQty > 0 ? `Cart with ${cartQty} items` : "Cart"}
                  >
                    <ShoppingCart className="size-4" aria-hidden="true" />
                    <span>Cart</span>
                    {cartQty > 0 ? (
                      <span
                        data-testid="cart-badge"
                        className="inline-flex min-w-5 items-center justify-center rounded-full bg-white px-1.5 py-0.5 text-xs font-semibold text-[var(--brand-primary)]"
                      >
                        {cartQty}
                      </span>
                    ) : null}
                  </Link>
                </>
              ) : null}
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
