import Image from "next/image";
import Link from "next/link";

import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { buildFeaturedCategoryRail, type FeaturedCategorySource } from "@/lib/menu/featured-menu-image-quality";
import { prisma } from "@/lib/prisma";

function buildHomepageHighlightCards(featuredCategories: ReturnType<typeof buildFeaturedCategoryRail>) {
  return featuredCategories.slice(0, 3).map((category) => ({
    id: category.id,
    name: category.name,
    description: `Explore popular ${category.name.toLowerCase()} picks curated for quick ordering.`,
    thumbnailUrl: category.thumbnailUrl,
  }));
}

export default async function Home() {
  const categories = await prisma.menuCategory.findMany({
    where: { deletedAt: null },
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      slug: true,
      name: true,
      itemLinks: {
        where: { menuItem: { deletedAt: null } },
        select: {
          menuItem: {
            select: {
              name: true,
              imageUrl: true,
              isAvailable: true,
            },
          },
        },
      },
    },
  });

  const normalizedCategories: FeaturedCategorySource[] = categories.map((category) => ({
    id: category.id,
    slug: category.slug,
    name: category.name,
    items: category.itemLinks
      .map((link) => link.menuItem)
      .filter((menuItem) => menuItem.isAvailable)
      .map((menuItem) => ({
        name: menuItem.name,
        imageUrl: menuItem.imageUrl,
      })),
  }));

  const featuredCategories = buildFeaturedCategoryRail(normalizedCategories);
  const heroHighlightCards = buildHomepageHighlightCards(featuredCategories);

  return (
    <div className="flex flex-col gap-8">
      <section className="space-y-4">
        <div className="relative w-full overflow-hidden rounded-xl border border-[var(--border-default)] bg-white shadow-sm">
          <div className="relative aspect-[16/7] w-full">
            <Image
              src="https://sdgpxydkqdthgolfmpei.supabase.co/storage/v1/object/public/website-assets/banner.jpg"
              alt="Assorted dishes prepared by MC Seanlibee kitchen team"
              fill
              priority
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 1152px"
            />
          </div>
        </div>
      </section>

      {heroHighlightCards.length > 0 ? (
        <section className="grid gap-4 md:grid-cols-3">
          <h2 className="sr-only">Homepage highlights</h2>
          {heroHighlightCards.map((card) => (
            <Card
              key={card.id}
              className="group flex h-full flex-col gap-3 p-3 motion-safe:transition motion-safe:duration-200 motion-safe:hover:-translate-y-1 motion-safe:hover:border-zinc-300 motion-safe:hover:shadow-lg motion-safe:hover:shadow-[#D12E27]/15 motion-safe:hover:ring-2 motion-safe:hover:ring-[#D12E27]/20 dark:motion-safe:hover:border-zinc-700 dark:motion-safe:hover:shadow-[#D12E27]/25 dark:motion-safe:hover:ring-[#D12E27]/30"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-800">
                <Image
                  src={card.thumbnailUrl}
                  alt={card.name}
                  fill
                  className="object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 33vw, 360px"
                />
              </div>
              <div className="space-y-1">
                <CardTitle>{card.name}</CardTitle>
                <CardDescription className="line-clamp-2">{card.description}</CardDescription>
              </div>
            </Card>
          ))}
        </section>
      ) : null}

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold tracking-tight text-[var(--text-primary)]">Featured Menu</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featuredCategories.map((category) => (
            <Link
              key={category.id}
              href="/login"
              aria-label={`Open ${category.name} menu, then sign in to continue`}
              className="rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D12E27] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-950"
            >
              <Card className="group border-transparent bg-transparent p-0 shadow-none motion-safe:transition motion-safe:duration-200 motion-safe:hover:-translate-y-1 motion-safe:hover:bg-zinc-50 motion-safe:hover:shadow-lg motion-safe:hover:shadow-[#D12E27]/10 dark:motion-safe:hover:bg-zinc-900/40">
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
                  <Image
                    src={category.thumbnailUrl}
                    alt={category.name}
                    fill
                    className="object-cover transition-transform duration-200 group-hover:scale-[1.03]"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
                <div className="px-1 pt-3 pb-1">
                  <CardTitle className="text-base">{category.name}</CardTitle>
                  <CardDescription>Sign in to order</CardDescription>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
