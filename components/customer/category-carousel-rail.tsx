"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, type KeyboardEvent } from "react";

import { HorizontalScroller } from "@/components/customer/horizontal-scroller";

export type CategoryCarouselEntry = {
  id: string;
  slug: string;
  name: string;
};

export type FeaturedCategoryEntry = CategoryCarouselEntry & {
  thumbnailUrl: string;
};

const ALL_KEY = "all";

const FEATURED_ACTIVE_RING = "ring-2 ring-[#D12E27] ring-offset-2 ring-offset-white dark:ring-offset-zinc-950";

function isFeaturedAllActive(activeSelection: "all" | string | undefined): boolean {
  return activeSelection === undefined || activeSelection === "all";
}

function isFeaturedCategoryActive(
  c: FeaturedCategoryEntry,
  activeSelection: string | undefined,
): boolean {
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

  return (
    <div
      ref={containerRef}
      onKeyDown={onKeyDown}
      className="sticky top-[var(--site-header-h,56px)] z-20 -mx-4 border-b border-zinc-200 bg-white/90 px-4 pt-2 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90"
    >
      <HorizontalScroller aria-label="Menu categories" data-scroll-region>
        <div className="snap-start shrink-0">
          <Link
            ref={(node) => setChipRef(ALL_KEY, node)}
            href="/customer"
            role="tab"
            aria-current={allActive ? "page" : undefined}
            aria-selected={allActive}
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
                role="tab"
                aria-current={active ? "page" : undefined}
                aria-selected={active}
                className={`inline-flex min-h-[44px] max-w-[220px] items-center truncate rounded-full border px-4 py-2 text-sm font-medium transition-colors ${chipClasses(active)}`}
              >
                {c.name}
              </Link>
            </div>
          );
        })}
      </HorizontalScroller>
    </div>
  );
}

/** Featured rail: leading All cell + category thumbnails (linked). */
export function FeaturedCategoryRail({
  categories,
  activeSelection,
}: {
  categories: FeaturedCategoryEntry[];
  activeSelection?: "all" | string;
}) {
  const allActive = isFeaturedAllActive(activeSelection);

  return (
    <HorizontalScroller aria-label="Featured menu categories">
      <div className="snap-start shrink-0 w-[88px]">
        <Link
          href="/customer"
          role="tab"
          aria-current={allActive ? "page" : undefined}
          aria-selected={allActive}
          className="flex flex-col items-center gap-2"
        >
          <div
            className={`flex size-20 items-center justify-center rounded-full border-2 bg-white text-xs font-semibold uppercase tracking-wide transition-transform dark:bg-zinc-950 ${
              allActive
                ? `scale-[1.03] border-[#D12E27] text-[#D12E27] ${FEATURED_ACTIVE_RING}`
                : "border-zinc-900 text-zinc-900 dark:border-zinc-100 dark:text-zinc-50"
            }`}
          >
            All
          </div>
          <span
            className={`w-full text-center text-xs text-zinc-700 dark:text-zinc-300 ${allActive ? "font-semibold text-[#D12E27] dark:text-[#D12E27]" : "font-medium"}`}
          >
            All
          </span>
        </Link>
      </div>
      {categories.map((c) => {
        const categoryActive = isFeaturedCategoryActive(c, activeSelection);
        return (
          <div key={c.id} className="snap-start shrink-0 w-[88px]">
            <Link
              href={`/customer?category=${c.slug}`}
              role="tab"
              aria-current={categoryActive ? "page" : undefined}
              aria-selected={categoryActive}
              className="flex flex-col items-center gap-2"
            >
              <div
                className={`relative size-20 shrink-0 overflow-hidden rounded-full bg-zinc-100 transition-transform dark:bg-zinc-800 ${
                  categoryActive
                    ? `scale-[1.03] ${FEATURED_ACTIVE_RING}`
                    : "ring-2 ring-zinc-200 dark:ring-zinc-700"
                }`}
              >
                <Image src={c.thumbnailUrl} alt={c.name} fill className="object-cover" sizes="80px" />
              </div>
              <span
                className={`line-clamp-2 w-full text-center text-xs text-zinc-900 dark:text-zinc-50 ${categoryActive ? "font-semibold" : "font-medium"}`}
              >
                {c.name}
              </span>
            </Link>
          </div>
        );
      })}
    </HorizontalScroller>
  );
}
