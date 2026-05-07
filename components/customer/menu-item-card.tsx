"use client";

import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { MoneyText } from "@/components/ui/money-text";
import { resolveMenuImageUrl } from "@/lib/menu/resolve-menu-image-url";

export const TAP_FOR_DETAILS_TEXT = "Tap card for details";

export type MenuItemCardData = {
  id: string;
  name: string;
  description?: string;
  priceCents: number;
  imageUrl: string | null;
};

type MenuItemCardProps = {
  item: MenuItemCardData;
  addToCartAction: (itemId: string, formData: FormData) => Promise<void>;
  compact?: boolean;
  className?: string;
};

export function MenuItemCard({ item, addToCartAction, compact = false, className }: MenuItemCardProps) {
  return (
    <Card
      className={`group relative flex h-full flex-col gap-3 p-3 motion-safe:transition motion-safe:duration-200 motion-safe:hover:-translate-y-1 motion-safe:hover:border-zinc-300 motion-safe:hover:shadow-lg motion-safe:hover:shadow-[#D12E27]/15 motion-safe:hover:ring-2 motion-safe:hover:ring-[#D12E27]/20 dark:motion-safe:hover:border-zinc-700 dark:motion-safe:hover:shadow-[#D12E27]/25 dark:motion-safe:hover:ring-[#D12E27]/30 ${className ?? ""}`}
    >
      <Link
        href={`/customer/items/${item.id}`}
        className="absolute inset-0 z-10 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D12E27] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-950"
        aria-label={`View details for ${item.name}`}
      />
      <div
        className={`relative w-full overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-800 ${compact ? "aspect-square" : "aspect-[4/3]"}`}
      >
        <Image
          src={resolveMenuImageUrl(item.id, item.imageUrl)}
          alt={item.name}
          fill
          className="object-cover transition-transform duration-200 group-hover:scale-[1.02]"
          sizes={compact ? "280px" : "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"}
        />
      </div>
      <div className={`flex items-start justify-between gap-3 ${compact ? "" : "min-h-24"}`}>
        <div className="space-y-1">
          <CardTitle className={compact ? "line-clamp-2 min-h-[2.5rem] text-sm" : undefined}>{item.name}</CardTitle>
          {item.description ? (
            <CardDescription className={compact ? "line-clamp-2" : "line-clamp-2"}>
              {item.description}
            </CardDescription>
          ) : null}
        </div>
        <div className={`font-semibold ${compact ? "text-sm" : "text-sm"}`}>
          <MoneyText cents={item.priceCents} />
        </div>
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className="pointer-events-none text-sm text-zinc-600 dark:text-zinc-400">
          {TAP_FOR_DETAILS_TEXT}
        </span>
        <form
          className="relative z-20"
          action={addToCartAction.bind(null, item.id)}
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            type="submit"
            className="h-9 w-9 bg-[#B11226] p-0 text-white shadow-sm transition-colors duration-200 hover:bg-[#8f0e1f] focus-visible:ring-[#B11226]"
            onClick={(e) => e.stopPropagation()}
            aria-label={`Add ${item.name} to cart`}
          >
            <Plus className="size-4" aria-hidden="true" />
          </Button>
        </form>
      </div>
    </Card>
  );
}
