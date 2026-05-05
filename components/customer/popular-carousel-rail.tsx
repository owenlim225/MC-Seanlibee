"use client";

import Image from "next/image";
import Link from "next/link";

import { HorizontalScroller } from "@/components/customer/horizontal-scroller";
import { MoneyText } from "@/components/ui/money-text";

export type PopularCarouselItem = {
  id: string;
  name: string;
  priceCents: number;
  imageUrl: string | null;
};

function PlaceholderVisual({ label }: { label: string }) {
  const initial = label.trim().charAt(0).toUpperCase() || "?";
  return (
    <div className="flex size-full items-center justify-center bg-zinc-100 text-2xl font-semibold text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500">
      {initial}
    </div>
  );
}

export function PopularCarouselRail({
  items,
  addToCart,
}: {
  items: PopularCarouselItem[];
  addToCart: (menuItemId: string) => Promise<void>;
}) {
  if (items.length === 0) return null;

  return (
    <HorizontalScroller aria-label="Most popular menu items" className="gap-4">
      {items.map((item) => (
        <article
          key={item.id}
          className="snap-start shrink-0 w-[168px] rounded-xl border border-zinc-200 bg-white p-2 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
        >
          <Link href={`/customer/items/${item.id}`} className="block">
            <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-zinc-50 dark:bg-zinc-900">
              {item.imageUrl ? (
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  fill
                  className="object-cover"
                  sizes="168px"
                />
              ) : (
                <PlaceholderVisual label={item.name} />
              )}
            </div>
          </Link>
          <div className="mt-2 flex flex-col gap-2">
            <Link href={`/customer/items/${item.id}`} className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-tight text-zinc-900 dark:text-zinc-50">
              {item.name}
            </Link>
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
                <MoneyText cents={item.priceCents} />
              </span>
              <form action={addToCart.bind(null, item.id)}>
                <button
                  type="submit"
                  aria-label={`Add ${item.name} to cart`}
                  className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#D12E27] text-xl font-light leading-none text-white shadow-md transition hover:opacity-90"
                >
                  +
                </button>
              </form>
            </div>
          </div>
        </article>
      ))}
    </HorizontalScroller>
  );
}
