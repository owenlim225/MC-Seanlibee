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

export type FeaturedCategoryEntry = CategoryCarouselEntry;

const ALL_KEY = "all";

function isFeaturedAllActive(activeSelection: "all" | string | undefined): boolean {
  return activeSelection === undefined || activeSelection === "all";
}

function isFeaturedCategoryActive(c: FeaturedCategoryEntry, activeSelection: string | undefined): boolean {
  if (activeSelection === undefined || activeSelection === "all") return false;
  return c.slug === activeSelection || c.id === activeSelection;
}

function isAllCategories(categoryParam: string | undefined): boolean {
  return categoryParam === undefined || categoryParam === ALL_KEY;
}

function chipClasses(active: boolean): string {
  return active
    ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-50 dark:bg-zinc-50 dark:text-zinc-950"
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
      className="sticky top-[var(--site-header-h,56px)] z-20 -mx-4 border-b border-zinc-200 bg-white/90 px-4 pt-2 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90"
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
}: {
  categories: FeaturedCategoryEntry[];
  activeSelection?: "all" | string;
}) {
  const allActive = isFeaturedAllActive(activeSelection);

  return (
    <HorizontalScroller role="navigation" aria-label="Featured menu categories">
      <div className="snap-start shrink-0">
        <Link
          href="/customer"
          aria-current={allActive ? "page" : undefined}
          className={`inline-flex min-h-[44px] items-center whitespace-nowrap rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
            allActive
              ? "bg-[var(--brand-primary)] text-white"
              : "bg-transparent text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
          }`}
        >
          All
        </Link>
      </div>
      {categories.map((c) => {
        const categoryActive = isFeaturedCategoryActive(c, activeSelection);
        return (
          <div key={c.id} className="snap-start shrink-0">
            <Link
              href={`/customer?category=${c.slug}`}
              aria-current={categoryActive ? "page" : undefined}
              className={`inline-flex min-h-[44px] items-center whitespace-nowrap rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
                categoryActive
                  ? "bg-[var(--brand-primary)] text-white"
                  : "bg-transparent text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
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
