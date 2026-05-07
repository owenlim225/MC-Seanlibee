"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { MenuItemCard } from "@/components/customer/menu-item-card";
import { SkeletonMenuSection } from "@/components/ui/skeleton";

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
                  <MenuItemCard
                    key={item.id}
                    item={item}
                    addToCartAction={addToCartAction}
                  />
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
