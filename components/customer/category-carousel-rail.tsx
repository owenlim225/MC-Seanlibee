"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useTransition, type KeyboardEvent, type MouseEvent } from "react";
import { HorizontalScroller } from "@/components/customer/horizontal-scroller";
import { Skeleton } from "@/components/ui/skeleton";

export type CategoryCarouselEntry = {
  id: string;
  slug: string;
  name: string;
};

export type FeaturedCategoryEntry = CategoryCarouselEntry & { thumbnailUrl?: string };
type FeaturedRailTarget = { kind: "category"; category: FeaturedCategoryEntry };

const ALL_KEY = "all";

function isFeaturedCategoryActive(c: FeaturedCategoryEntry, activeSelection: string | undefined): boolean {
  if (activeSelection === undefined || activeSelection === "all") return false;
  return c.slug === activeSelection || c.id === activeSelection;
}

function isAllCategories(categoryParam: string | undefined): boolean {
  return categoryParam === undefined || categoryParam === ALL_KEY;
}

function chipClasses(active: boolean): string {
  return active
    ? "border-[var(--brand-primary)] bg-[var(--brand-primary)] text-[var(--brand-primary-foreground)]"
    : "border-zinc-200 bg-white text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50";
}

/** Sticky pill carousel synced with `?category=` (all / absent means full menu). */
export function CategoryCarouselRail({
  categories,
  categoryParam,
}: {
  categories: CategoryCarouselEntry[];
  categoryParam: string | undefined;
}) {
  const allActive = isAllCategories(categoryParam);
  const activeKey = allActive ? ALL_KEY : (categoryParam ?? ALL_KEY);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chipRefs = useRef<Map<string, HTMLAnchorElement>>(new Map());
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const node = chipRefs.current.get(activeKey);
    if (!node) return;
    node.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }, [activeKey]);

  function setChipRef(key: string, node: HTMLAnchorElement | null): void {
    if (node) chipRefs.current.set(key, node);
    else chipRefs.current.delete(key);
  }

  function onKeyDown(ev: KeyboardEvent<HTMLDivElement>): void {
    if (ev.key !== "ArrowLeft" && ev.key !== "ArrowRight") return;
    const container = containerRef.current?.querySelector<HTMLDivElement>("[data-scroll-region]");
    if (!container) return;
    ev.preventDefault();
    const delta = ev.key === "ArrowRight" ? 240 : -240;
    container.scrollBy({ left: delta, behavior: "smooth" });
  }

  function onNavigate(ev: MouseEvent<HTMLAnchorElement>, nextCategory: string): void {
    if (ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey || ev.button !== 0) return;
    ev.preventDefault();
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (nextCategory === ALL_KEY) params.delete("category");
      else params.set("category", nextCategory);
      const query = params.toString();
      router.push(query ? `${pathname}?${query}` : pathname);
    });
  }

  return (
    <div
      ref={containerRef}
      onKeyDown={onKeyDown}
      aria-busy={pending}
      className="sticky top-[var(--site-header-h,72px)] z-20 -mx-4 border-b border-zinc-200 bg-white/90 px-4 pt-2 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90"
    >
      <HorizontalScroller role="navigation" aria-label="Menu categories" data-scroll-region className="pt-0 pb-2">
        {pending ? (
          <>
            {Array.from({ length: Math.min(categories.length + 1, 6) }).map((_, idx) => (
              <div key={`pending-chip-${idx}`} className="snap-start shrink-0 py-1">
                <Skeleton className="h-10 w-24 rounded-full" />
              </div>
            ))}
          </>
        ) : (
          <>
            <div className="snap-start shrink-0">
              <Link
                ref={(node) => setChipRef(ALL_KEY, node)}
                href="/customer"
                aria-current={allActive ? "page" : undefined}
                onClick={(ev) => onNavigate(ev, ALL_KEY)}
                className={`inline-flex min-h-[44px] items-center rounded-full border px-4 py-2 text-sm font-medium transition-colors ${chipClasses(allActive)}`}
              >
                All
              </Link>
            </div>
            {categories.map((c) => {
              const active = categoryParam === c.slug || categoryParam === c.id;
              return (
                <div key={c.id} className="snap-start shrink-0">
                  <Link
                    ref={(node) => setChipRef(c.slug, node)}
                    href={`/customer?category=${c.slug}`}
                    aria-current={active ? "page" : undefined}
                    onClick={(ev) => onNavigate(ev, c.slug)}
                    className={`inline-flex min-h-[44px] max-w-[220px] items-center truncate rounded-full border px-4 py-2 text-sm font-medium transition-colors ${chipClasses(active)}`}
                  >
                    {c.name}
                  </Link>
                </div>
              );
            })}
          </>
        )}
      </HorizontalScroller>
    </div>
  );
}

export function FeaturedCategoryRail({
  categories,
  activeSelection,
  signInRedirect,
}: {
  categories: FeaturedCategoryEntry[];
  activeSelection?: "all" | string;
  /**
   * When set, every chip links to this URL (e.g. "/login") and aria-labels are
   * rewritten to indicate the user must sign in first. Used on the public
   * homepage. Serializable so it can cross the RSC boundary.
   */
  signInRedirect?: string;
}) {
  // #region agent log
  fetch("http://127.0.0.1:7817/ingest/c3fc8591-bb49-4618-b7bd-5aef2b04dae3", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "ad1060" },
    body: JSON.stringify({
      sessionId: "ad1060",
      runId: "post-fix",
      hypothesisId: "H1",
      location: "components/customer/category-carousel-rail.tsx",
      message: "FeaturedCategoryRail invoked with serializable props",
      data: {
        categoriesCount: categories.length,
        activeSelectionType: typeof activeSelection,
        hasSignInRedirect: Boolean(signInRedirect),
        signInRedirectType: typeof signInRedirect,
      },
    }),
  }).catch(() => {});
  // #endregion
  const visibleCategories = categories.slice(0, 8);

  function buildHref(target: FeaturedRailTarget): string {
    const nextPath = `/customer?category=${target.category.slug}`;
    if (!signInRedirect) return nextPath;
    return `${signInRedirect}?next=${encodeURIComponent(nextPath)}`;
  }

  function buildAriaLabel(target: FeaturedRailTarget): string | undefined {
    if (!signInRedirect) return `Open ${target.category.name} menu`;
    return `Open ${target.category.name} menu, then sign in to continue`;
  }

  return (
    <HorizontalScroller role="navigation" aria-label="Featured menu categories" showControls>
      <div className="snap-start shrink-0">
        <Link
          href={signInRedirect ? `${signInRedirect}?next=${encodeURIComponent("/customer")}` : "/customer"}
          aria-current={activeSelection === "all" || !activeSelection ? "page" : undefined}
          aria-label={signInRedirect ? "Open all menu categories, then sign in to continue" : "Open all menu categories"}
          className={`inline-flex min-h-[44px] cursor-pointer items-center rounded-full border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-950 ${
            chipClasses(activeSelection === "all" || !activeSelection)
          }`}
        >
          All
        </Link>
      </div>
      {visibleCategories.map((c) => {
        const categoryActive = isFeaturedCategoryActive(c, activeSelection);
        return (
          <div key={c.id} className="snap-start shrink-0">
            <Link
              href={buildHref({ kind: "category", category: c })}
              aria-label={buildAriaLabel({ kind: "category", category: c })}
              aria-current={categoryActive ? "page" : undefined}
              className={`inline-flex min-h-[44px] max-w-[220px] cursor-pointer items-center truncate rounded-full border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-950 ${
                chipClasses(categoryActive)
              }`}
            >
              {c.name}
            </Link>
          </div>
        );
      })}
    </HorizontalScroller>
  );
}
