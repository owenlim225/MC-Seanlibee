export type GroupedMenuTaxonomyGroup = {
  slug: string;
  name: string;
  sortOrder: number;
  sourceSlugs: readonly string[];
};

export const GROUPED_MENU_TAXONOMY: readonly GroupedMenuTaxonomyGroup[] = [
  {
    slug: "main-meals",
    name: "Main Meals",
    sortOrder: 10,
    sourceSlugs: ["burgers", "pizzas", "fried-chicken", "steaks", "porks", "sausages", "sandwiches", "our-foods"],
  },
  {
    slug: "budget-meals",
    name: "Budget Meals",
    sortOrder: 20,
    sourceSlugs: ["sandwiches", "burgers", "sausages", "breads", "fried-chicken"],
  },
  {
    slug: "desserts-sweets",
    name: "Desserts & Sweets",
    sortOrder: 30,
    sourceSlugs: ["desserts", "ice-cream", "chocolates"],
  },
  {
    slug: "drinks-refreshments",
    name: "Drinks & Refreshments",
    sortOrder: 40,
    sourceSlugs: ["drinks"],
  },
  {
    slug: "snacks-light-bites",
    name: "Snacks & Light Bites",
    sortOrder: 50,
    sourceSlugs: ["breads", "sausages", "sandwiches", "chocolates"],
  },
  {
    slug: "best-sellers-featured",
    name: "Best Sellers / Featured Picks",
    sortOrder: 60,
    sourceSlugs: ["bbqs", "burgers", "fried-chicken", "pizzas", "our-foods"],
  },
  {
    slug: "grilled-heavy-meals",
    name: "Grilled & Heavy Meals",
    sortOrder: 70,
    sourceSlugs: ["bbqs", "steaks", "porks"],
  },
];

const groupSlugsBySource = GROUPED_MENU_TAXONOMY.reduce<Record<string, string[]>>((acc, group) => {
  for (const sourceSlug of group.sourceSlugs) {
    const existing = acc[sourceSlug] ?? [];
    acc[sourceSlug] = [...existing, group.slug];
  }
  return acc;
}, {});

const groupedCategorySlugSet = new Set(GROUPED_MENU_TAXONOMY.map((group) => group.slug));

export function getGroupSlugsForSourceSlug(sourceSlug: string): readonly string[] {
  return groupSlugsBySource[sourceSlug] ?? [];
}

export function isGroupedCategorySlug(slug: string): boolean {
  return groupedCategorySlugSet.has(slug);
}
