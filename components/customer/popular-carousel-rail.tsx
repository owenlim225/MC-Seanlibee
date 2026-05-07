"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { HorizontalScroller } from "@/components/customer/horizontal-scroller";
import { MoneyText } from "@/components/ui/money-text";
import { resolveMenuImageUrl } from "@/lib/menu/resolve-menu-image-url";

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
  addToCartAction: (menuItemId: string) => Promise<void>;
}) {
  if (items.length === 0) return null;

  return (
    <HorizontalScroller aria-label="Most popular menu items" className="gap-4">
      {items.map((item) => (
        <Card
          key={item.id}
          className="group relative snap-start shrink-0 min-w-[240px] max-w-[280px] p-3 motion-safe:transition motion-safe:duration-200 motion-safe:hover:-translate-y-1 motion-safe:hover:border-zinc-300 motion-safe:hover:shadow-lg motion-safe:hover:shadow-[#D12E27]/15 motion-safe:hover:ring-2 motion-safe:hover:ring-[#D12E27]/20 dark:motion-safe:hover:border-zinc-700 dark:motion-safe:hover:shadow-[#D12E27]/25 dark:motion-safe:hover:ring-[#D12E27]/30"
        >
          <div className="relative z-0 flex flex-col gap-3">
            <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-zinc-50 dark:bg-zinc-900">
              <Image
                src={resolveMenuImageUrl(item.id, item.imageUrl, { width: 336, height: 336 })}
                alt={item.name}
                fill
                className="object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                sizes="280px"
              />
            </div>
            <div className="space-y-1 text-center">
              <CardTitle className="line-clamp-2 min-h-[2.5rem] text-sm">{item.name}</CardTitle>
              <p className="text-sm font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
                <MoneyText cents={item.priceCents} />
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={`/customer/items/${item.id}`}
                aria-label={`View ${item.name}`}
                className="relative z-20 inline-flex min-h-[40px] flex-1 items-center justify-center rounded-md border border-[var(--border-default)] bg-[var(--surface-base)] px-3 py-2 text-sm font-medium text-[var(--text-primary)] transition-[background-color,color,box-shadow,border-color] duration-[var(--motion-base)] ease-[var(--ease-standard)] hover:bg-[var(--surface-subtle)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-base)]"
              >
                View item
              </Link>
              <form
                className="relative z-20 flex-1"
                action={addToCartAction.bind(null, item.id)}
                onClick={(e) => e.stopPropagation()}
              >
                <Button
                  type="submit"
                  className="w-full"
                  onClick={(e) => e.stopPropagation()}
                >
                  Order Now
                </Button>
              </form>
            </div>
          </div>
        </Card>
      ))}
    </HorizontalScroller>
  );
}
