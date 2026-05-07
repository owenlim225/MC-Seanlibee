import Link from "next/link";
import { addToCart } from "@/app/(customer)/customer/actions";
import { FeaturedCategoryRail } from "@/components/customer/category-carousel-rail";
import { CategoryMenuSections } from "@/components/customer/category-menu-sections";
import { PopularCarouselRail } from "@/components/customer/popular-carousel-rail";
import { PageHeader } from "@/components/ui/page-header";
import { buildFeaturedCategoryRail } from "@/lib/menu/featured-menu-image-quality";
import { selectPopularItems } from "@/lib/menu/select-popular-items";
import { prisma } from "@/lib/prisma";

export default async function CustomerMenuPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const sp = await searchParams;
  const categories = await prisma.menuCategory.findMany({
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
  });

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

  const featuredCategories = buildFeaturedCategoryRail(normalizedCategories);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Menu"
        description="Add dishes to your cart — checkout uses mock Stripe."
        actions={
          <>
            <Link
              className="text-sm text-[var(--text-primary)] transition-colors hover:text-[var(--brand-primary)] hover:underline"
              href="/customer/cart"
            >
              Cart
            </Link>
            <Link
              className="text-sm text-[var(--text-primary)] transition-colors hover:text-[var(--brand-primary)] hover:underline"
              href="/customer/orders"
            >
              Orders
            </Link>
          </>
        }
      />

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold tracking-tight text-[var(--text-primary)]">
          Featured Menu
        </h2>
        <FeaturedCategoryRail
          categories={featuredCategories}
          activeSelection={!sp.category || sp.category === "all" ? "all" : sp.category}
        />
      </section>

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
