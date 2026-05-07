"use client";

import { HorizontalScroller } from "@/components/customer/horizontal-scroller";
import { MenuItemCard } from "@/components/customer/menu-item-card";

export type PopularCarouselItem = {
  id: string;
  name: string;
  priceCents: number;
  imageUrl: string | null;
};

export function PopularCarouselRail({
  items,
  addToCartAction,
}: {
  items: PopularCarouselItem[];
  addToCartAction: (menuItemId: string, formData: FormData) => Promise<void>;
}) {
  if (items.length === 0) return null;

  return (
    <HorizontalScroller aria-label="Most popular menu items" className="gap-4">
      {items.map((item) => (
        <MenuItemCard
          key={item.id}
          item={item}
          compact
          className="snap-start shrink-0 min-w-[240px] max-w-[280px]"
          addToCartAction={addToCartAction}
        />
      ))}
    </HorizontalScroller>
  );
}
