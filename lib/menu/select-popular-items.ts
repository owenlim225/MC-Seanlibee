export const POPULAR_ITEM_LIMIT = 12;

/** Minimal menu shapes for selection (matches Prisma includes used on the customer menu page). */
export type PopularMenuItem = {
  id: string;
  name: string;
  priceCents: number;
  imageUrl: string | null;
};

export type PopularMenuCategory = {
  id: string;
  name: string;
  sortOrder: number;
  items: PopularMenuItem[];
};

/**
 * Flatten categories in `sortOrder` ascending, then items within each category by `name` ascending,
 * and return the first `limit` items (stable for menus of any size).
 */
export function selectPopularItems(
  categories: PopularMenuCategory[],
  limit: number = POPULAR_ITEM_LIMIT,
): PopularMenuItem[] {
  const sortedCategories = [...categories].sort((a, b) => a.sortOrder - b.sortOrder);

  const flattened: PopularMenuItem[] = [];
  const seenItemIds = new Set<string>();
  for (const category of sortedCategories) {
    const sortedItems = [...category.items].sort((a, b) => a.name.localeCompare(b.name));
    for (const item of sortedItems) {
      if (seenItemIds.has(item.id)) continue;
      seenItemIds.add(item.id);
      flattened.push(item);
      if (flattened.length >= limit) {
        return flattened;
      }
    }
  }

  return flattened;
}
