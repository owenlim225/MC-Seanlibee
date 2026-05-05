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
  thumbnailUrl: string | null;
};

const ALL_KEY = "all";

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

function PlaceholderThumb({ label }: { label: string }) {
  const initial = label.trim().charAt(0).toUpperCase() || "?";
  return (
    <div
      className="flex size-20 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-lg font-semibold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
      aria-hidden
    >
      {initial}
    </div>
  );
}

/** Featured rail: leading All cell + category thumbnails (linked). */
export function FeaturedCategoryRail({ categories }: { categories: FeaturedCategoryEntry[] }) {
  return (
    <HorizontalScroller aria-label="Featured menu categories">
      <div className="snap-start shrink-0 w-[88px]">
        <Link href="/customer" className="flex flex-col items-center gap-2">
          <div className="flex size-20 items-center justify-center rounded-full border-2 border-zinc-900 bg-white text-xs font-semibold uppercase tracking-wide text-zinc-900 dark:border-zinc-100 dark:bg-zinc-950 dark:text-zinc-50">
            All
          </div>
          <span className="w-full text-center text-xs font-medium text-zinc-700 dark:text-zinc-300">All</span>
        </Link>
      </div>
      {categories.map((c) => (
        <div key={c.id} className="snap-start shrink-0 w-[88px]">
          <Link href={`/customer?category=${c.slug}`} className="flex flex-col items-center gap-2">
            {c.thumbnailUrl ? (
              <div className="relative size-20 shrink-0 overflow-hidden rounded-full bg-zinc-100 ring-2 ring-zinc-200 dark:bg-zinc-800 dark:ring-zinc-700">
                <Image src={c.thumbnailUrl} alt={c.name} fill className="object-cover" sizes="80px" />
              </div>
            ) : (
              <PlaceholderThumb label={c.name} />
            )}
            <span className="line-clamp-2 w-full text-center text-xs font-medium text-zinc-900 dark:text-zinc-50">
              {c.name}
            </span>
          </Link>
        </div>
      ))}
    </HorizontalScroller>
  );
}
