import { addToCart } from "@/app/(customer)/customer/actions";
import { FeaturedCategoryRail } from "@/components/customer/category-carousel-rail";
import { CategoryMenuSections } from "@/components/customer/category-menu-sections";
import { NonFeaturedCategoryGrid } from "@/components/customer/non-featured-category-grid";
import { PopularCarouselRail } from "@/components/customer/popular-carousel-rail";
import { getSessionLite } from "@/lib/auth";
import { selectPopularItems } from "@/lib/menu/select-popular-items";
import { prisma } from "@/lib/prisma";

export default async function CustomerMenuPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const sp = await searchParams;
  const [categories, session] = await Promise.all([
    prisma.menuCategory.findMany({
      where: { deletedAt: null },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        slug: true,
        name: true,
        sortOrder: true,
        itemLinks: {
          where: { menuItem: { deletedAt: null } },
          orderBy: { menuItem: { name: "asc" } },
          select: {
            menuItem: {
              select: {
                id: true,
                name: true,
                description: true,
                priceCents: true,
                imageUrl: true,
                isAvailable: true,
              },
            },
          },
        },
      },
    }),
    getSessionLite(),
  ]);

  const normalizedCategories = categories.map((category) => ({
    id: category.id,
    slug: category.slug,
    name: category.name,
    sortOrder: category.sortOrder,
    items: category.itemLinks
      .map((link) => link.menuItem)
      .filter((menuItem) => menuItem.isAvailable)
      .map((menuItem) => ({
        id: menuItem.id,
        name: menuItem.name,
        description: menuItem.description,
        priceCents: menuItem.priceCents,
        imageUrl: menuItem.imageUrl,
      })),
  }));

  const filtered =
    sp.category && sp.category !== "all"
      ? normalizedCategories.filter((category) => category.id === sp.category || category.slug === sp.category)
      : normalizedCategories;

  const popularItems = selectPopularItems(normalizedCategories);

  const categoriesForNavigation = normalizedCategories.map((category) => ({
    id: category.id,
    slug: category.slug,
    name: category.name,
    thumbnailUrl: category.items.find((item) => item.imageUrl)?.imageUrl ?? undefined,
  }));
  const featuredCategories = categoriesForNavigation.slice(0, 8);
  const nonFeaturedCategories = categoriesForNavigation.slice(8);
  const isAuthenticated = Boolean(session.user);

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col items-center gap-2 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--brand-primary)]">Menu</p>
        <h1 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)] md:text-4xl">Browse our Menu</h1>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold tracking-tight text-[var(--text-primary)]">
          Featured Menu
        </h2>
        <FeaturedCategoryRail
          categories={featuredCategories}
          activeSelection={!sp.category || sp.category === "all" ? "all" : sp.category}
        />
      </section>

      {nonFeaturedCategories.length > 0 ? (
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold tracking-tight text-[var(--text-primary)]">
            Explore More Categories
          </h2>
          <NonFeaturedCategoryGrid categories={nonFeaturedCategories} isAuthenticated={isAuthenticated} />
        </section>
      ) : null}

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold tracking-tight text-[var(--text-primary)]">
          Most Popular
        </h2>
        <PopularCarouselRail items={popularItems} addToCartAction={addToCart} />
      </section>

      <CategoryMenuSections categories={filtered} addToCartAction={addToCart} />
    </div>
  );
}
