"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { MoneyText } from "@/components/ui/money-text";
import { SkeletonMenuSection } from "@/components/ui/skeleton";
import { resolveMenuImageUrl } from "@/lib/menu/resolve-menu-image-url";

type CategoryItem = {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  imageUrl: string | null;
};

type CategorySection = {
  id: string;
  name: string;
  items: CategoryItem[];
};

const ITEMS_BATCH_SIZE = 9;

function initialVisibleByCategory(categories: CategorySection[]): Record<string, number> {
  return categories.reduce<Record<string, number>>((acc, category) => {
    return {
      ...acc,
      [category.id]: Math.min(ITEMS_BATCH_SIZE, category.items.length),
    };
  }, {});
}

/** Remount when category tree changes so visible counts reset without effect + setState. */
function categoriesResetKey(categories: CategorySection[]): string {
  return categories.map((c) => `${c.id}:${c.items.length}`).join("|");
}

function CategoryMenuSectionsContent({
  categories,
  addToCartAction,
}: {
  categories: CategorySection[];
  addToCartAction: (itemId: string, formData: FormData) => Promise<void>;
}) {
  const [visibleByCategory, setVisibleByCategory] = useState<Record<string, number>>(() =>
    initialVisibleByCategory(categories),
  );
  const [showTransitionSkeleton, setShowTransitionSkeleton] = useState(false);
  const categoryStateKey = useMemo(() => categoriesResetKey(categories), [categories]);
  const hasMountedRef = useRef(false);

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }
    setShowTransitionSkeleton(true);
    const timeout = window.setTimeout(() => setShowTransitionSkeleton(false), 220);
    return () => window.clearTimeout(timeout);
  }, [categoryStateKey]);

  function handleViewMore(categoryId: string, totalItems: number): void {
    setVisibleByCategory((prev) => {
      const currentVisible = prev[categoryId] ?? ITEMS_BATCH_SIZE;
      return {
        ...prev,
        [categoryId]: Math.min(currentVisible + ITEMS_BATCH_SIZE, totalItems),
      };
    });
  }

  return (
    <div className="relative flex flex-col gap-6" aria-busy={showTransitionSkeleton}>
      {showTransitionSkeleton ? (
        <div className="pointer-events-none absolute inset-0 z-20 bg-[var(--surface-base)]/70 backdrop-blur-[1px]">
          <div className="flex flex-col gap-6">
            <SkeletonMenuSection cardCount={4} />
            <SkeletonMenuSection cardCount={4} />
          </div>
        </div>
      ) : null}
      {categories.map((category) => {
          const visibleCount = Math.min(
            visibleByCategory[category.id] ?? ITEMS_BATCH_SIZE,
            category.items.length,
          );
          const visibleItems = category.items.slice(0, visibleCount);
          const hasMore = visibleCount < category.items.length;

          return (
            <section key={category.id} className="flex flex-col gap-3">
              <h2 className="text-lg font-semibold">{category.name}</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {visibleItems.map((item) => (
                  <Card
                    key={item.id}
                    className="group relative flex h-full flex-col gap-3 p-3 motion-safe:transition motion-safe:duration-200 motion-safe:hover:-translate-y-1 motion-safe:hover:border-zinc-300 motion-safe:hover:shadow-lg motion-safe:hover:shadow-[#D12E27]/15 motion-safe:hover:ring-2 motion-safe:hover:ring-[#D12E27]/20 dark:motion-safe:hover:border-zinc-700 dark:motion-safe:hover:shadow-[#D12E27]/25 dark:motion-safe:hover:ring-[#D12E27]/30"
                  >
                    <Link
                      href={`/customer/items/${item.id}`}
                      className="absolute inset-0 z-10 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D12E27] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-950"
                      aria-label={`View details for ${item.name}`}
                    />
                    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-800">
                      <Image
                        src={resolveMenuImageUrl(item.id, item.imageUrl)}
                        alt={item.name}
                        fill
                        className="object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                      />
                    </div>
                    <div className="flex min-h-24 items-start justify-between gap-3">
                      <div className="space-y-1">
                        <CardTitle>{item.name}</CardTitle>
                        <CardDescription className="line-clamp-2">{item.description}</CardDescription>
                      </div>
                      <div className="text-sm font-semibold">
                        <MoneyText cents={item.priceCents} />
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="pointer-events-none text-sm text-zinc-600 dark:text-zinc-400">
                        Tap card for details
                      </span>
                      <form
                        className="relative z-20"
                        action={addToCartAction.bind(null, item.id)}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button type="submit" variant="secondary" onClick={(e) => e.stopPropagation()}>
                          Add to cart
                        </Button>
                      </form>
                    </div>
                  </Card>
                ))}
              </div>
              {hasMore ? (
                <div className="flex justify-center pt-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => handleViewMore(category.id, category.items.length)}
                  >
                    View more
                  </Button>
                </div>
              ) : null}
            </section>
          );
        })}
    </div>
  );
}

export function CategoryMenuSections({
  categories,
  addToCartAction,
}: {
  categories: CategorySection[];
  addToCartAction: (itemId: string, formData: FormData) => Promise<void>;
}) {
  return (
    <CategoryMenuSectionsContent
      key={categoriesResetKey(categories)}
      categories={categories}
      addToCartAction={addToCartAction}
    />
  );
}
